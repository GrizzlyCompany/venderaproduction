-- Script para corregir el bucket 'documents' existente
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar configuración actual del bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'documents';

-- 2. Actualizar configuración del bucket para permitir PDFs
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'documents';

-- 3. Verificar políticas existentes para el bucket documents
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%documents%';

-- 4. Eliminar políticas existentes si hay conflictos (opcional)
-- DROP POLICY IF EXISTS "Public read access for documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- 5. Crear políticas RLS (solo si no existen)
DO $$
BEGIN
  -- Política de lectura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public read access for documents'
  ) THEN
    CREATE POLICY "Public read access for documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'documents');
  END IF;

  -- Política de upload para usuarios autenticados
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload documents'
  ) THEN
    CREATE POLICY "Authenticated users can upload documents" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'documents' 
      AND auth.role() = 'authenticated'
    );
  END IF;

  -- Política de actualización para propietarios
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update their own documents'
  ) THEN
    CREATE POLICY "Users can update their own documents" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'documents' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Política de eliminación para propietarios
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete their own documents'
  ) THEN
    CREATE POLICY "Users can delete their own documents" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'documents' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- 6. Verificar configuración final
SELECT 
  'Bucket Configuration' as type,
  id as name,
  public::text as value,
  file_size_limit::text as limit,
  array_to_string(allowed_mime_types, ', ') as mime_types
FROM storage.buckets 
WHERE id = 'documents'

UNION ALL

SELECT 
  'RLS Policy' as type,
  policyname as name,
  cmd as value,
  '' as limit,
  '' as mime_types
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%documents%'
ORDER BY type, name;