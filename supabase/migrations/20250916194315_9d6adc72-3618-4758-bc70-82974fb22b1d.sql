-- Insert default categories if they don't exist
INSERT INTO categories (name, description) VALUES 
  ('Electronics', 'Electronic devices and gadgets'),
  ('Fashion', 'Clothing, shoes, and accessories'),
  ('Home & Garden', 'Home decor and garden supplies'),
  ('Beauty & Health', 'Beauty products and health items'),
  ('Books & Media', 'Books, movies, music, and games'),
  ('Sports & Outdoors', 'Sports equipment and outdoor gear'),
  ('Food & Beverages', 'Food items and beverages'),
  ('Toys & Games', 'Toys for children and games')
ON CONFLICT (name) DO NOTHING;