-- Add admin role system
CREATE TYPE public.user_role AS ENUM ('customer', 'vendor', 'admin');

-- Add role to profiles table
ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT 'customer';

-- Create admin helper functions
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_admin.user_id 
    AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE profiles.user_id = get_user_role.user_id),
    'customer'::public.user_role
  );
$$;

-- Create admin analytics view
CREATE OR REPLACE VIEW public.admin_analytics AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.vendors WHERE is_active = true) as active_vendors,
  (SELECT COUNT(*) FROM public.products WHERE is_active = true) as total_products,
  (SELECT COUNT(*) FROM public.orders) as total_orders,
  (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE payment_status = 'paid') as total_revenue,
  (SELECT COUNT(*) FROM public.vendors WHERE is_verified = false) as pending_vendors;

-- Update RLS policies for admin access
-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Allow admins to manage all vendors
CREATE POLICY "Admins can manage all vendors" 
ON public.vendors FOR ALL 
USING (public.is_admin(auth.uid()));

-- Allow admins to manage all products
CREATE POLICY "Admins can manage all products" 
ON public.products FOR ALL 
USING (public.is_admin(auth.uid()));

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Allow admins to update order status
CREATE POLICY "Admins can update orders" 
ON public.orders FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Allow admins to view all order items
CREATE POLICY "Admins can view all order items" 
ON public.order_items FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Allow admins to view analytics
CREATE POLICY "Admins can view analytics" 
ON public.admin_analytics FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Create first admin user (update with your email)
-- You'll need to sign up first, then run this to make yourself admin:
-- UPDATE public.profiles SET role = 'admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');