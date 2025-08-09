-- Script para crear el bucket 'documents' en Supabase Storage
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear el bucket 'documents'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- 2. Configurar políticas RLS para el bucket 'documents'

-- Política para permitir lectura pública
CREATE POLICY "Public read access for documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

-- Política para permitir upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir actualización a propietarios
CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir eliminación a propietarios
CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Verificar que el bucket se creó correctamente
SELECT * FROM storage.buckets WHERE id = 'documents';