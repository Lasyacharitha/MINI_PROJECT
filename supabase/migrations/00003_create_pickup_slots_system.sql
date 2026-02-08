-- Create pickup_slots table
CREATE TABLE IF NOT EXISTS pickup_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time_slot TIME NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 10,
  current_bookings INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN GENERATED ALWAYS AS (current_bookings < max_capacity) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, time_slot),
  CHECK (current_bookings >= 0),
  CHECK (current_bookings <= max_capacity),
  CHECK (max_capacity > 0)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pickup_slots_date_time ON pickup_slots(date, time_slot);
CREATE INDEX IF NOT EXISTS idx_pickup_slots_available ON pickup_slots(date, is_available);

-- Function to book a slot (atomic operation)
CREATE OR REPLACE FUNCTION book_pickup_slot(
  p_date DATE,
  p_time_slot TIME
) RETURNS BOOLEAN AS $$
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

-- Function to release a slot (when order is cancelled)
CREATE OR REPLACE FUNCTION release_pickup_slot(
  p_date DATE,
  p_time_slot TIME
) RETURNS BOOLEAN AS $$
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

-- Function to check slot availability
CREATE OR REPLACE FUNCTION check_slot_availability(
  p_date DATE,
  p_time_slot TIME
) RETURNS TABLE(
  available_slots INTEGER,
  max_capacity INTEGER,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (ps.max_capacity - ps.current_bookings) AS available_slots,
    ps.max_capacity,
    ps.is_available
  FROM pickup_slots ps
  WHERE ps.date = p_date AND ps.time_slot = p_time_slot;
  
  -- If slot doesn't exist, return default capacity
  IF NOT FOUND THEN
    RETURN QUERY SELECT 10, 10, TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to manage slots when order is placed
CREATE OR REPLACE FUNCTION manage_order_slot() RETURNS TRIGGER AS $$
BEGIN
  -- When a new order is inserted
  IF TG_OP = 'INSERT' THEN
    -- Book the slot
    IF NOT book_pickup_slot(NEW.pickup_date, NEW.pickup_time) THEN
      RAISE EXCEPTION 'Pickup slot is fully booked';
    END IF;
    RETURN NEW;
  END IF;
  
  -- When an order is cancelled
  IF TG_OP = 'UPDATE' AND OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    -- Release the slot
    PERFORM release_pickup_slot(OLD.pickup_date, OLD.pickup_time);
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_manage_order_slot ON orders;
CREATE TRIGGER trigger_manage_order_slot
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION manage_order_slot();

-- RLS policies for pickup_slots
ALTER TABLE pickup_slots ENABLE ROW LEVEL SECURITY;

-- Everyone can view slot availability
CREATE POLICY "Anyone can view pickup slots"
  ON pickup_slots FOR SELECT
  USING (true);

-- Only admins can insert/update slots
CREATE POLICY "Admins can manage pickup slots"
  ON pickup_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seed some initial slots for today and next 7 days
DO $$
DECLARE
  v_date DATE;
  slot_time TIME;
BEGIN
  FOR i IN 0..6 LOOP
    v_date := CURRENT_DATE + i;
    
    -- Create slots for common pickup times
    FOREACH slot_time IN ARRAY ARRAY['09:00'::TIME, '10:00'::TIME, '11:00'::TIME, '12:00'::TIME, '13:00'::TIME, '14:00'::TIME, '15:00'::TIME, '16:00'::TIME, '17:00'::TIME]
    LOOP
      INSERT INTO pickup_slots (date, time_slot, max_capacity, current_bookings)
      VALUES (v_date, slot_time, 10, 0)
      ON CONFLICT (date, time_slot) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;