-- Create the storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property_images', 'property_images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete own images" ON storage.objects;

-- Configure RLS policies for the new bucket
-- 1. Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'property_images');

-- 2. Allow authenticated users to upload images into their own folder
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property_images' AND
    -- The path of the file must be prefixed with `public/{user_id}/`
    (storage.foldername(name))[1] = 'public' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- 3. Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'property_images' AND
    auth.uid() = owner
  )
  WITH CHECK (
    bucket_id = 'property_images' AND
    auth.uid() = owner
  );


-- 4. Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'property_images' AND
    auth.uid() = owner
  );
