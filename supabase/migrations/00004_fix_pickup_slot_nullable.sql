-- Make pickup_slot nullable since it's redundant with pickup_time
ALTER TABLE orders 
ALTER COLUMN pickup_slot DROP NOT NULL;