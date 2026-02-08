-- Update refund calculation to handle three tiers:
-- Pending: 100% refund
-- Preparing: 50% refund  
-- Ready: 0% refund (no refund)

-- Drop and recreate the calculate_refund_amount function
DROP FUNCTION IF EXISTS calculate_refund_amount(uuid);

CREATE OR REPLACE FUNCTION calculate_refund_amount(p_order_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_status text;
  v_total_amount numeric;
  v_refund_amount numeric;
BEGIN
  -- Get order status and total amount
  SELECT status, total_amount
  INTO v_order_status, v_total_amount
  FROM orders
  WHERE id = p_order_id;

  -- If order not found, return 0
  IF v_order_status IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculate refund based on status
  CASE v_order_status
    WHEN 'pending', 'confirmed' THEN
      -- Full refund for orders not yet started
      v_refund_amount := v_total_amount;
    WHEN 'preparing' THEN
      -- 50% refund for orders in preparation
      v_refund_amount := v_total_amount * 0.5;
    WHEN 'ready' THEN
      -- No refund for orders ready to pick up
      v_refund_amount := 0;
    ELSE
      -- No refund for completed or cancelled orders
      v_refund_amount := 0;
  END CASE;

  RETURN v_refund_amount;
END;
$$;

-- Update the cancel_order function to handle ready status
DROP FUNCTION IF EXISTS cancel_order(uuid, uuid, text);

CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id uuid,
  p_user_id uuid,
  p_cancellation_reason text DEFAULT 'User requested cancellation'
)
RETURNS TABLE(
  success boolean,
  message text,
  refund_amount numeric
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_status text;
  v_pickup_datetime timestamp;
  v_refund_amount numeric;
  v_order_user_id uuid;
BEGIN
  -- Get order details
  SELECT 
    o.status,
    (o.pickup_date || ' ' || o.pickup_time)::timestamp,
    o.user_id
  INTO v_order_status, v_pickup_datetime, v_order_user_id
  FROM orders o
  WHERE o.id = p_order_id;

  -- Check if order exists
  IF v_order_status IS NULL THEN
    RETURN QUERY SELECT false, 'Order not found'::text, 0::numeric;
    RETURN;
  END IF;

  -- Check if user owns the order
  IF v_order_user_id != p_user_id THEN
    RETURN QUERY SELECT false, 'Unauthorized: You do not own this order'::text, 0::numeric;
    RETURN;
  END IF;

  -- Check if order can be cancelled
  IF v_order_status IN ('completed', 'cancelled') THEN
    RETURN QUERY SELECT false, 'Order cannot be cancelled (already completed or cancelled)'::text, 0::numeric;
    RETURN;
  END IF;

  -- Check time restriction (at least 1 hour before pickup)
  IF v_pickup_datetime - INTERVAL '1 hour' <= NOW() THEN
    RETURN QUERY SELECT false, 'Cannot cancel order less than 1 hour before pickup time'::text, 0::numeric;
    RETURN;
  END IF;

  -- Calculate refund amount
  v_refund_amount := calculate_refund_amount(p_order_id);

  -- Update order status
  UPDATE orders
  SET 
    status = 'cancelled',
    refund_amount = v_refund_amount,
    refund_status = CASE 
      WHEN v_refund_amount > 0 THEN 'pending'
      ELSE 'not_applicable'
    END,
    cancelled_at = NOW(),
    cancellation_reason = p_cancellation_reason
  WHERE id = p_order_id;

  -- Return success with appropriate message
  CASE v_order_status
    WHEN 'pending', 'confirmed' THEN
      RETURN QUERY SELECT true, 'Order cancelled successfully. Full refund will be processed.'::text, v_refund_amount;
    WHEN 'preparing' THEN
      RETURN QUERY SELECT true, 'Order cancelled. 50% refund will be processed as preparation has started.'::text, v_refund_amount;
    WHEN 'ready' THEN
      RETURN QUERY SELECT true, 'Order cancelled. No refund available as order is ready for pickup.'::text, v_refund_amount;
    ELSE
      RETURN QUERY SELECT true, 'Order cancelled successfully.'::text, v_refund_amount;
  END CASE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_refund_amount(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cancel_order(uuid, uuid, text) TO authenticated, anon;

COMMENT ON FUNCTION calculate_refund_amount IS 'Calculates refund amount based on order status: pending/confirmed=100%, preparing=50%, ready=0%';
COMMENT ON FUNCTION cancel_order IS 'Cancels an order with automatic refund calculation: pending=100%, preparing=50%, ready=0%';