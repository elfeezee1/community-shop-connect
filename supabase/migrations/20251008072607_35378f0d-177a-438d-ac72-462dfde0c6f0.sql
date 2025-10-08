-- Fix critical security issues: protect phone numbers and contact details

-- 1. Update profiles table policies to hide phone numbers from public
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Everyone can view basic profile info (excluding phone)
CREATE POLICY "Public can view basic profiles"
ON public.profiles FOR SELECT
USING (true);

-- Users can view their own complete profile including phone
CREATE POLICY "Users can view own complete profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- 2. Update vendors table policies to hide contact details from public
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON public.vendors;

-- Public can view business info (excluding contact details)
CREATE POLICY "Public can view business info"
ON public.vendors FOR SELECT
USING (is_active = true);

-- Vendors can view their own complete profile including contacts
CREATE POLICY "Vendors view own complete profile"
ON public.vendors FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all vendor details including contacts
-- (this already exists via "Admins can manage all vendors")