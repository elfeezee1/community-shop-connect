-- Fix notify_vendor_new_order to avoid FK errors and ensure trigger exists
CREATE OR REPLACE FUNCTION public.notify_vendor_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  vendor_user_id uuid;
BEGIN
  -- Get the vendor's user_id
  SELECT user_id INTO vendor_user_id
  FROM vendors
  WHERE id = NEW.vendor_id;

  -- Try to create notification for the vendor; never block order creation
  BEGIN
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
      NULL  -- avoid FK to rides
    );
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'notify_vendor_new_order: skipping notification insert due to error: %', SQLERRM;
  END;

  RETURN NEW;
END;
$function$;

-- Recreate trigger to ensure it exists and uses the updated function
DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_vendor_new_order();