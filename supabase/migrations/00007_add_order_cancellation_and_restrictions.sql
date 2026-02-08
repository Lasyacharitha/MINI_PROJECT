-- Add refund_status field to track refund processing
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ DEFAULT NULL;

-- Function to calculate refund amount based on order status
CREATE OR REPLACE FUNCTION calculate_refund_amount(
  p_order_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  v_status order_status;
  v_total_amount NUMERIC;
  v_refund_amount NUMERIC;
BEGIN
  -- Get order status and total amount
  SELECT status, total_amount INTO v_status, v_total_amount
  FROM orders
  WHERE id = p_order_id;
  
  -- Calculate refund based on status
  IF v_status = 'pending' THEN
    -- Full refund if not started preparing
    v_refund_amount := v_total_amount;
  ELSIF v_status = 'preparing' THEN
    -- 50% refund if already preparing
    v_refund_amount := v_total_amount * 0.5;
  ELSE
    -- No refund for ready, completed, or already cancelled orders
    v_refund_amount := 0;
  END IF;
  
  RETURN v_refund_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to cancel order with refund logic
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID,
  p_user_id UUID,
  p_cancellation_reason TEXT DEFAULT NULL
) RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  refund_amount NUMERIC
) AS $$
DECLARE
  v_order RECORD;
  v_refund_amount NUMERIC;
  v_pickup_datetime TIMESTAMPTZ;
  v_hours_until_pickup NUMERIC;
BEGIN
  -- Get order details
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id AND user_id = p_user_id;
  
  -- Check if order exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Order not found'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check if order is already cancelled
  IF v_order.status = 'cancelled' THEN
    RETURN QUERY SELECT false, 'Order is already cancelled'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check if order is completed
  IF v_order.status = 'completed' THEN
    RETURN QUERY SELECT false, 'Cannot cancel completed order'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Calculate pickup datetime
  v_pickup_datetime := (v_order.pickup_date || ' ' || v_order.pickup_time)::TIMESTAMPTZ;
  v_hours_until_pickup := EXTRACT(EPOCH FROM (v_pickup_datetime - NOW())) / 3600;
  
  -- Check if cancellation is within allowed timeframe (at least 1 hour before pickup)
  IF v_hours_until_pickup < 1 THEN
    RETURN QUERY SELECT false, 'Cannot cancel order less than 1 hour before pickup time'::TEXT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Calculate refund amount
  v_refund_amount := calculate_refund_amount(p_order_id);
  
  -- Update order
  UPDATE orders
  SET 
    status = 'cancelled',
    cancellation_reason = p_cancellation_reason,
    refund_amount = v_refund_amount,
    refund_status = CASE 
      WHEN v_refund_amount > 0 THEN 'pending'
      ELSE 'not_applicable'
    END,
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Return success with refund amount
  RETURN QUERY SELECT 
    true, 
    CASE 
      WHEN v_order.status = 'pending' THEN 'Order cancelled successfully. Full refund will be processed.'
      WHEN v_order.status = 'preparing' THEN 'Order cancelled. 50% refund will be processed as preparation has started.'
      ELSE 'Order cancelled successfully.'
    END::TEXT,
    v_refund_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate cash-on-pickup restrictions
CREATE OR REPLACE FUNCTION validate_cash_on_pickup(
  p_order_items JSONB
) RETURNS TABLE(
  is_valid BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_item JSONB;
  v_menu_item RECORD;
  v_snack_count INTEGER := 0;
  v_non_snack_count INTEGER := 0;
  v_total_quantity INTEGER := 0;
BEGIN
  -- Loop through order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    -- Get menu item details
    SELECT category INTO v_menu_item
    FROM menu_items
    WHERE id = (v_item->>'menu_item_id')::UUID;
    
    -- Count snacks and non-snacks
    IF v_menu_item.category = 'Snacks' THEN
      v_snack_count := v_snack_count + (v_item->>'quantity')::INTEGER;
    ELSE
      v_non_snack_count := v_non_snack_count + 1;
    END IF;
    
    v_total_quantity := v_total_quantity + (v_item->>'quantity')::INTEGER;
  END LOOP;
  
  -- Validate restrictions
  IF v_non_snack_count > 0 THEN
    RETURN QUERY SELECT 
      false, 
      'Cash on pickup is only allowed for snack items. Please use online payment for non-snack items.'::TEXT;
    RETURN;
  END IF;
  
  IF v_snack_count > 2 THEN
    RETURN QUERY SELECT 
      false, 
      'Cash on pickup is limited to maximum 2 snack items. Please use online payment or reduce quantity.'::TEXT;
    RETURN;
  END IF;
  
  -- All validations passed
  RETURN QUERY SELECT true, 'Cash on pickup is allowed for this order.'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_refund_amount TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_order TO authenticated;
GRANT EXECUTE ON FUNCTION validate_cash_on_pickup TO anon, authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION cancel_order IS 'Cancels an order with automatic refund calculation: 100% refund if pending, 50% if preparing. Requires at least 1 hour before pickup time.';
COMMENT ON FUNCTION validate_cash_on_pickup IS 'Validates cash-on-pickup restrictions: only snack items, maximum 2 items per order.';