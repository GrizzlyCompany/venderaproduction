# Configuración del Bucket 'documents' en Supabase

## 🎯 Objetivo
Crear un bucket dedicado para documentos (PDFs, planos, brochures) que permita uploads correctos sin conflictos con buckets de imágenes.

## 📋 Pasos para Configurar

### 1. **Crear el Bucket en Supabase Dashboard**

#### Opción A: Usando SQL Editor (Recomendado)
1. Ir a **Supabase Dashboard** → **SQL Editor**
2. Ejecutar el script `CREATE_DOCUMENTS_BUCKET.sql`:

```sql
-- 1. Crear el bucket 'documents'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- 2. Configurar políticas RLS
CREATE POLICY "Public read access for documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Opción B: Usando Storage UI
1. Ir a **Supabase Dashboard** → **Storage**
2. Click en **"New bucket"**
3. Configurar:
   - **Name**: `documents`
   - **Public**: ✅ Enabled
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: 
     - `application/pdf`
     - `image/jpeg`
     - `image/png`
     - `image/webp`

### 2. **Verificar Configuración**

#### Verificar que el bucket existe:
```sql
SELECT * FROM storage.buckets WHERE id = 'documents';
```

#### Verificar políticas:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%documents%';
```

### 3. **Probar Upload**
1. Ir a `/developer/projects/new`
2. Subir un archivo PDF como plano o brochure
3. Verificar logs en consola:
   ```
   📄 PDF detected, using documents bucket
   ✅ File uploaded successfully: https://...supabase.co/storage/v1/object/public/documents/...
   ```

## 🗂️ Estructura de Buckets Final

| Bucket | Propósito | Tipos Aceptados | Uso |
|--------|-----------|-----------------|-----|
| `documents` | **PDFs y documentos** | PDF, JPEG, PNG, WebP | Planos, brochures, documentos |
| `project_images` | **Imágenes de proyectos** | JPEG, PNG, WebP | Fotos de proyectos |
| `developer_logos` | **Logos de desarrolladores** | JPEG, PNG, WebP, SVG | Logos de empresas |
| `identity_documents` | **Documentos de identidad** | JPEG, PNG, WebP | Cédulas, pasaportes |
| `property_images` | **Imágenes de propiedades** | JPEG, PNG, WebP | Fotos de propiedades |

## 🔄 Flujo de Upload Corregido

### Para PDFs (Planos/Brochures):
```
1. Usuario sube PDF →
2. uploadFile() detecta 'application/pdf' →
3. Selecciona bucket 'documents' →
4. actions.ts valida PDF en documents bucket →
5. ✅ Upload exitoso a documents bucket
```

### Para Imágenes de Proyectos:
```
1. Usuario sube imagen →
2. uploadFile() detecta 'image/*' →
3. Selecciona bucket 'project_images' →
4. actions.ts valida imagen →
5. ✅ Upload exitoso a project_images bucket
```

## 🚨 Solución de Problemas

### Error: "Bucket not found"
**Causa**: El bucket `documents` no existe
**Solución**: Ejecutar el script SQL para crear el bucket

### Error: "Permission denied"
**Causa**: Políticas RLS no configuradas
**Solución**: Ejecutar las políticas del script SQL

### Error: "File type not allowed"
**Causa**: MIME type no incluido en allowed_mime_types
**Solución**: Verificar que el bucket acepta el tipo de archivo

## 📊 Logs Esperados

### ✅ **Funcionamiento Correcto**
```
🔄 Uploading file: plano.pdf type: application/pdf to bucket: documents
📄 PDF detected, using documents bucket
Uploading file to bucket: documents, path: documents/1691234567890_plano.pdf
✅ File uploaded successfully: https://qlbuwoyugbwpzzwdflsq.supabase.co/storage/v1/object/public/documents/documents/1691234567890_plano.pdf
```

### ❌ **Si el Bucket No Existe**
```
❌ Upload error: Storage bucket 'documents' not found. Please contact support.
```

## 🧪 Verificación Final

### Checklist:
- [ ] Bucket `documents` creado en Supabase
- [ ] Políticas RLS configuradas
- [ ] Upload de PDF funciona sin errores
- [ ] Upload de imágenes sigue funcionando
- [ ] Archivos aparecen en página de detalles
- [ ] Botones de descarga funcionan

### Comando de Verificación:
```sql
-- Verificar bucket y políticas
SELECT 
  b.id as bucket_name,
  b.public,
  b.file_size_limit,
  b.allowed_mime_types,
  COUNT(p.policyname) as policies_count
FROM storage.buckets b
LEFT JOIN pg_policies p ON p.tablename = 'objects' AND p.policyname LIKE '%documents%'
WHERE b.id = 'documents'
GROUP BY b.id, b.public, b.file_size_limit, b.allowed_mime_types;
```

## 🎯 Resultado Final

Una vez configurado correctamente:

1. **PDFs** → Bucket `documents` → ✅ Upload exitoso
2. **Imágenes** → Bucket `project_images` → ✅ Upload exitoso
3. **Página de detalles** → ✅ Sección "Descargas" aparece
4. **Descarga de archivos** → ✅ Funciona correctamente

**Estado: 🔧 CONFIGURACIÓN REQUERIDA - EJECUTAR SCRIPT SQL PARA CREAR BUCKET**