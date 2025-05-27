-- Supabase Storage Policies for product-images bucket
-- Run these commands in your Supabase SQL Editor

-- First, drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public uploads to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from product-images" ON storage.objects;

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public uploads to product-images bucket
CREATE POLICY "Allow public uploads to product-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Allow public access to view product images
CREATE POLICY "Allow public access to product-images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow public deletes (optional - for replacing images)
CREATE POLICY "Allow public deletes from product-images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');

-- Allow public updates (for upsert functionality)
CREATE POLICY "Allow public updates to product-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
