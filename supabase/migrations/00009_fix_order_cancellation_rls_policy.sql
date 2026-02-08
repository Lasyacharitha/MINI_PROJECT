-- Fix RLS policy to allow users to cancel their own orders
-- Drop the old policy
DROP POLICY IF EXISTS "Users can update their own pending orders" ON orders;

-- Create new policy that allows cancellation
CREATE POLICY "Users can cancel their own orders"
ON orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status IN ('pending', 'preparing', 'ready')
)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow cancellation (status change to cancelled)
    status = 'cancelled'
    -- Or allow other updates if still pending
    OR (status = 'pending' AND status = 'pending')
  )
);