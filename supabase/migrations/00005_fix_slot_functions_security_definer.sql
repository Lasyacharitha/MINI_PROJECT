-- Update book_pickup_slot to run with elevated privileges
CREATE OR REPLACE FUNCTION book_pickup_slot(
  p_date DATE,
  p_time_slot TIME
) RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot_id UUID;
  v_available BOOLEAN;
BEGIN
  -- Try to find and lock the slot
  SELECT id, is_available INTO v_slot_id, v_available
  FROM pickup_slots
  WHERE date = p_date AND time_slot = p_time_slot
  FOR UPDATE;
  
  -- If slot doesn't exist, create it with default capacity
  IF v_slot_id IS NULL THEN
    INSERT INTO pickup_slots (date, time_slot, current_bookings)
    VALUES (p_date, p_time_slot, 1)
    RETURNING id INTO v_slot_id;
    RETURN TRUE;
  END IF;
  
  -- Check if slot is available
  IF NOT v_available THEN
    RETURN FALSE;
  END IF;
  
  -- Increment bookings
  UPDATE pickup_slots
  SET current_bookings = current_bookings + 1,
      updated_at = NOW()
  WHERE id = v_slot_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update release_pickup_slot to run with elevated privileges
CREATE OR REPLACE FUNCTION release_pickup_slot(
  p_date DATE,
  p_time_slot TIME
) RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot_id UUID;
BEGIN
  -- Find and lock the slot
  SELECT id INTO v_slot_id
  FROM pickup_slots
  WHERE date = p_date AND time_slot = p_time_slot
  FOR UPDATE;
  
  -- If slot doesn't exist, nothing to release
  IF v_slot_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Decrement bookings (but not below 0)
  UPDATE pickup_slots
  SET current_bookings = GREATEST(current_bookings - 1, 0),
      updated_at = NOW()
  WHERE id = v_slot_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;