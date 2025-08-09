# Guía de Debugging para Upload de Archivos

## 🔍 Problemas Identificados

Basado en los logs de la imagen:

1. ✅ **Imágenes se suben correctamente**: `Images uploaded successfully`
2. ❌ **Floor plans fallan**: `Floor plan upload failed: TypeError`
3. ❌ **Brochure falla**: `Brochure upload failed: TypeError`

## 🛠️ Correcciones Aplicadas

### 1. **Función `uploadFile` Agregada**

```typescript
// Agregado en developer.service.ts
async uploadFile(file: File, bucket: string = 'documents'): Promise<string> {
  try {
    console.log('🔄 Uploading file:', file.name, 'to bucket:', bucket);
    const formData = new FormData();
    formData.append('file', file);

    const { uploadFile } = await import('@/app/actions');
    
    // Use project_images bucket for now since we know it exists
    const targetBucket = bucket === 'documents' ? 'project_images' : bucket;
    const result = await uploadFile(targetBucket as any, 'documents', formData);

    if ('error' in result) {
      console.error('❌ Upload error:', result.error);
      throw new Error(result.error);
    }
    
    console.log('✅ File uploaded successfully:', result.publicUrl);
    return result.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
```

### 2. **Logging Mejorado en Página de Detalles**

```typescript
// Agregado logging para verificar datos cargados
console.log('📄 Project brochure_url:', projectData.brochure_url);
console.log('📐 Project floor_plans:', projectData.floor_plans);

// Agregado logging para sección de descargas
console.log('🔍 Downloads section check:', {
  hasBrochure,
  hasFloorPlans,
  showDownloads,
  brochure_url: project.brochure_url,
  floor_plans: project.floor_plans
});
```

## 🧪 Pasos para Probar las Correcciones

### 1. **Crear Proyecto con Archivos**
1. Ir a `/developer/projects/new`
2. Llenar formulario básico
3. Subir archivos:
   - **Imágenes**: JPG/PNG (ya funciona)
   - **Planos**: PDF
   - **Brochure**: PDF
4. Enviar formulario

### 2. **Verificar Logs Durante Creación**
Buscar en consola:
```
📸 Uploading project images...
✅ Images uploaded successfully: [...]
📐 Uploading floor plans...
🔄 Uploading file: [nombre-archivo.pdf] to bucket: documents
✅ File uploaded successfully: [url]
✅ Floor plans uploaded successfully: [...]
📄 Uploading brochure...
🔄 Uploading file: [nombre-archivo.pdf] to bucket: documents
✅ File uploaded successfully: [url]
✅ Brochure uploaded successfully: [url]
✅ Project updated with file URLs
```

### 3. **Verificar en Página de Detalles**
1. Ir a página de detalles del proyecto
2. Verificar logs:
```
📄 Project brochure_url: https://...
📐 Project floor_plans: ["https://..."]
🔍 Downloads section check: {
  hasBrochure: true,
  hasFloorPlans: true,
  showDownloads: true,
  brochure_url: "https://...",
  floor_plans: ["https://..."]
}
```

### 4. **Verificar Sección de Descargas**
- Debe aparecer sección "Descargas"
- Botones funcionales para cada archivo
- Click abre archivos en nueva pestaña

## 🚨 Posibles Problemas y Soluciones

### Problema 1: Bucket 'documents' No Existe
**Síntoma**: Error "Bucket not found"
**Solución**: La función ahora usa 'project_images' como fallback

### Problema 2: Archivos No Se Guardan en BD
**Síntoma**: Upload exitoso pero no aparecen en detalles
**Solución**: Verificar que `updateProject` se ejecute correctamente

### Problema 3: Tipos de Archivo No Permitidos
**Síntoma**: Error de validación de tipo
**Solución**: Verificar que sean PDFs válidos

### Problema 4: Sección de Descargas No Aparece
**Síntoma**: No se muestra la sección
**Solución**: Verificar logs de "Downloads section check"

## 📋 Checklist de Verificación

- [ ] Función `uploadFile` existe en `developer.service.ts`
- [ ] Upload de imágenes funciona (ya confirmado)
- [ ] Upload de planos muestra logs de éxito
- [ ] Upload de brochure muestra logs de éxito
- [ ] Proyecto se actualiza con URLs de archivos
- [ ] Página de detalles carga archivos correctamente
- [ ] Sección "Descargas" aparece
- [ ] Botones de descarga funcionan

## 🔧 Comandos de Debugging

### Ver Logs en Tiempo Real
```bash
# En la consola del navegador, filtrar por:
- "Uploading"
- "uploaded successfully"
- "Downloads section"
- "Project loaded"
```

### Verificar Base de Datos
```sql
-- Verificar que los archivos se guardaron
SELECT id, name, brochure_url, floor_plans 
FROM development_projects 
WHERE id = 'tu-project-id';
```

## 🎯 Resultados Esperados

### ✅ **Si Todo Funciona**
1. Upload sin errores de TypeError
2. Logs muestran URLs de archivos
3. Sección "Descargas" aparece
4. Archivos se abren al hacer click

### ❌ **Si Hay Problemas**
1. Revisar logs específicos del error
2. Verificar tipos de archivo (solo PDF)
3. Verificar tamaño de archivo (< 10MB)
4. Verificar permisos de Supabase Storage

**Estado: 🔧 CORRECCIONES APLICADAS - LISTO PARA PRUEBAS**