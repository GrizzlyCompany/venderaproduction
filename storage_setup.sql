
-- This script sets up the necessary storage buckets and policies for the application.
-- Run this in your Supabase SQL Editor.

-- 1. Create a bucket for user avatars.
-- The bucket is made public so that images can be easily displayed in the app.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create a bucket for property images.
-- This bucket is also public for easy viewing of property listings.
INSERT INTO storage.buckets (id, name, public)
VALUES ('property_images', 'property_images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Row Level Security (RLS) policies for the 'avatars' bucket.
-- These policies ensure that users can only manage their own files.

-- Allow public read access to all avatars.
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar.
-- The app logic saves images under a folder named after the user's ID.
-- This policy checks that the uploader's ID matches the folder name.
CREATE POLICY "Authenticated users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Allow users to update their own avatar.
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Allow users to delete their own avatar.
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid );


-- 4. Set up Row Level Security (RLS) policies for the 'property_images' bucket.
-- These policies ensure that realtors can only manage images for their own properties.

-- Allow public read access to all property images.
CREATE POLICY "Public read access for property images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'property_images' );

-- Allow authenticated users to upload images.
-- The app logic saves images under a folder named after the user's ID (the realtor's ID).
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'property_images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Allow realtors to update their own property images.
CREATE POLICY "Users can update their own property images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'property_images' AND auth.uid() = (storage.foldername(name))[1]::uuid );

-- Allow realtors to delete their own property images.
CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'property_images' AND auth.uid() = (storage.foldername(name))[1]::uuid );
