-- Script simple para verificar el bucket 'documents'
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar si el bucket existe y su configuración
SELECT 
  'BUCKET CONFIG' as section,
  id as bucket_name,
  public as is_public,
  file_size_limit as size_limit_bytes,
  (file_size_limit / 1024 / 1024)::text || ' MB' as size_limit_mb,
  array_to_string(allowed_mime_types, ', ') as allowed_types
FROM storage.buckets 
WHERE id = 'documents';

-- 2. Verificar políticas RLS
SELECT 
  'RLS POLICIES' as section,
  policyname as policy_name,
  cmd as command_type,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has conditions'
    ELSE 'No conditions'
  END as has_conditions
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%documents%'
ORDER BY policyname;

-- 3. Verificar si hay archivos en el bucket
SELECT 
  'BUCKET CONTENTS' as section,
  COUNT(*) as file_count,
  string_agg(DISTINCT split_part(name, '.', -1), ', ') as file_extensions
FROM storage.objects 
WHERE bucket_id = 'documents';

-- 4. Mostrar configuración recomendada vs actual
SELECT 
  'RECOMMENDED CONFIG' as section,
  'documents' as bucket_name,
  'true' as should_be_public,
  '10485760' as should_be_size_limit,
  'application/pdf, image/jpeg, image/png, image/webp' as should_allow_types;