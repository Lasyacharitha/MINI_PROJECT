-- Create function to send email on order status change
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  function_url text;
BEGIN
  -- Only send email if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get Supabase URL and service role key from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Call Edge Function asynchronously using pg_net (if available)
    -- For now, we'll insert into a notifications table and handle via app
    INSERT INTO notifications (user_id, title, message, type, is_read)
    VALUES (
      NEW.user_id,
      'Order Status Updated',
      format('Your order status has been updated to: %s', NEW.status),
      'order_update',
      false
    );
    
    -- Note: Email will be sent via Edge Function call from application
    -- when order status is updated through the admin interface
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_order_status_change();

-- Add comment
COMMENT ON FUNCTION notify_order_status_change() IS 'Sends notification when order status changes';
