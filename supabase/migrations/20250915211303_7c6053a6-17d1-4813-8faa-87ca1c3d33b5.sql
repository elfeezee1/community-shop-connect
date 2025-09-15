-- Create e-commerce tables for Ecomance marketplace

-- First, create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table (business profiles)
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table with inventory tracking
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER DEFAULT 1,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  weight DECIMAL(8,2),
  dimensions TEXT,
  sku TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping cart table
CREATE TABLE public.shopping_cart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'online' or 'cod' (cash on delivery)
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed
  order_status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, preparing, ready, delivered, cancelled
  delivery_address TEXT NOT NULL,
  delivery_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage categories" 
ON public.categories FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for vendors
CREATE POLICY "Vendors are viewable by everyone" 
ON public.vendors FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create their own vendor profile" 
ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor profile" 
ON public.vendors FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for products
CREATE POLICY "Active products are viewable by everyone" 
ON public.products FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can manage their own products" 
ON public.products FOR ALL USING (
  vendor_id IN (
    SELECT id FROM public.vendors WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for shopping cart
CREATE POLICY "Users can view their own cart" 
ON public.shopping_cart FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cart" 
ON public.shopping_cart FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for orders
CREATE POLICY "Customers can view their own orders" 
ON public.orders FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Vendors can view orders for their products" 
ON public.orders FOR SELECT USING (
  vendor_id IN (
    SELECT id FROM public.vendors WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Customers can create orders" 
ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Vendors can update their orders" 
ON public.orders FOR UPDATE USING (
  vendor_id IN (
    SELECT id FROM public.vendors WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for order items
CREATE POLICY "Order items follow order policies" 
ON public.order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.orders WHERE 
    customer_id = auth.uid() OR 
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Order items can be inserted with orders" 
ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders WHERE customer_id = auth.uid()
  )
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial categories
INSERT INTO public.categories (name, description) VALUES 
('Food & Beverages', 'Fresh food, snacks, and beverages'),
('Fashion & Accessories', 'Clothing, shoes, bags, and accessories'),
('Electronics', 'Phones, computers, and electronic devices'),
('Beauty & Health', 'Cosmetics, skincare, and health products'),
('Home & Garden', 'Home decor, furniture, and garden supplies'),
('Books & Media', 'Books, magazines, and entertainment media'),
('Sports & Recreation', 'Sports equipment and recreational items');