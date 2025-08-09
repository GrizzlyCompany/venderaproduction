-- Create storage buckets for the application (simplified version)

-- Create bucket for project images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project_images',
  'project_images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for developer logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'developer_logos',
  'developer_logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for documents (floor plans, brochures, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Simple storage policies - allow authenticated users to upload to these buckets
-- and everyone to read

-- Project images policies
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
CREATE POLICY "Public can view project images" ON storage.objects
FOR SELECT USING (bucket_id = 'project_images');

DROP POLICY IF EXISTS "Authenticated can upload project images" ON storage.objects;
CREATE POLICY "Authenticated can upload project images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'project_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update project images" ON storage.objects;
CREATE POLICY "Users can update project images" ON storage.objects
FOR UPDATE USING (bucket_id = 'project_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete project images" ON storage.objects;
CREATE POLICY "Users can delete project images" ON storage.objects
FOR DELETE USING (bucket_id = 'project_images' AND auth.role() = 'authenticated');

-- Developer logos policies
DROP POLICY IF EXISTS "Public can view developer logos" ON storage.objects;
CREATE POLICY "Public can view developer logos" ON storage.objects
FOR SELECT USING (bucket_id = 'developer_logos');

DROP POLICY IF EXISTS "Authenticated can upload developer logos" ON storage.objects;
CREATE POLICY "Authenticated can upload developer logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'developer_logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update developer logos" ON storage.objects;
CREATE POLICY "Users can update developer logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'developer_logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete developer logos" ON storage.objects;
CREATE POLICY "Users can delete developer logos" ON storage.objects
FOR DELETE USING (bucket_id = 'developer_logos' AND auth.role() = 'authenticated');

-- Documents policies
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
CREATE POLICY "Public can view documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated can upload documents" ON storage.objects;
CREATE POLICY "Authenticated can upload documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update documents" ON storage.objects;
CREATE POLICY "Users can update documents" ON storage.objects
FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete documents" ON storage.objects;
CREATE POLICY "Users can delete documents" ON storage.objects
FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');