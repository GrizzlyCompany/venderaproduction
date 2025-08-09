-- Create storage buckets for user avatars and identity documents
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('identity_documents', 'identity_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete own avatars" ON storage.objects;

DROP POLICY IF EXISTS "Allow users to read own identity documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload identity documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update own identity documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete own identity documents" ON storage.objects;

-- Policies for avatars bucket (public read, user-specific upload/update/delete)
CREATE POLICY "Allow public read access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow authenticated users to update own avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow authenticated users to delete own avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policies for identity_documents bucket (private, user-specific access only)
CREATE POLICY "Allow users to read own identity documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'identity_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow authenticated users to upload identity documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'identity_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow authenticated users to update own identity documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'identity_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'identity_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow authenticated users to delete own identity documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'identity_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );