-- Fix function search path security warnings (use CASCADE)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate triggers after function recreation
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP FUNCTION IF EXISTS get_admin_analytics();
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS TABLE (
  active_vendors BIGINT,
  pending_vendors BIGINT,
  total_products BIGINT,
  total_orders BIGINT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.vendors WHERE is_approved = TRUE),
    (SELECT COUNT(*) FROM public.vendors WHERE is_approved = FALSE),
    (SELECT COUNT(*) FROM public.products WHERE is_active = TRUE),
    (SELECT COUNT(*) FROM public.orders),
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE payment_status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;