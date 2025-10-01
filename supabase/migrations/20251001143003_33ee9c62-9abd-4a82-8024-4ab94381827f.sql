-- Create function to notify vendor when order is created
CREATE OR REPLACE FUNCTION public.notify_vendor_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_user_id uuid;
BEGIN
  -- Get the vendor's user_id
  SELECT user_id INTO vendor_user_id
  FROM vendors
  WHERE id = NEW.vendor_id;
  
  -- Create notification for the vendor
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    ride_id
  ) VALUES (
    vendor_user_id,
    'New Order Received',
    'You have received a new order #' || SUBSTRING(NEW.id::text, 1, 8) || ' for ' || NEW.total_amount::text,
    'order',
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to notify vendor on new orders
DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_vendor_new_order();

-- Enable realtime for notifications table
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;