-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Vendors can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT user_id FROM vendors WHERE vendors.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Vendors can update their own product images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT user_id FROM vendors WHERE vendors.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Vendors can delete their own product images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT user_id FROM vendors WHERE vendors.id::text = (storage.foldername(name))[1]
  )
);