-- Script para crear sistema de tracking de vistas de proyectos
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla para tracking de vistas
CREATE TABLE IF NOT EXISTS project_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES development_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL para usuarios anónimos
  ip_address INET, -- Para tracking de usuarios anónimos
  user_agent TEXT, -- Para analytics adicionales
  referrer TEXT, -- De dónde vino el usuario
  session_id TEXT, -- Para evitar contar múltiples vistas en la misma sesión
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_user_id ON project_views(user_id);
CREATE INDEX IF NOT EXISTS idx_project_views_created_at ON project_views(created_at);
CREATE INDEX IF NOT EXISTS idx_project_views_session_id ON project_views(session_id);

-- 3. Crear índice compuesto para evitar vistas duplicadas por sesión
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_views_unique_session 
ON project_views(project_id, session_id) 
WHERE session_id IS NOT NULL;

-- 4. Agregar columna view_count a development_projects (si no existe)
ALTER TABLE development_projects 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 5. Crear función para actualizar contador de vistas
CREATE OR REPLACE FUNCTION update_project_view_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar contador en la tabla de proyectos
  UPDATE development_projects 
  SET view_count = (
    SELECT COUNT(*) 
    FROM project_views 
    WHERE project_id = NEW.project_id
  )
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para actualizar automáticamente el contador
DROP TRIGGER IF EXISTS trigger_update_project_view_count ON project_views;
CREATE TRIGGER trigger_update_project_view_count
  AFTER INSERT ON project_views
  FOR EACH ROW
  EXECUTE FUNCTION update_project_view_count();

-- 7. Configurar RLS (Row Level Security)
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- Política para permitir insertar vistas (cualquier usuario)
CREATE POLICY "Anyone can record project views" ON project_views
FOR INSERT WITH CHECK (true);

-- Política para que los desarrolladores vean las vistas de sus proyectos
CREATE POLICY "Developers can view their project analytics" ON project_views
FOR SELECT USING (
  project_id IN (
    SELECT dp.id 
    FROM development_projects dp
    JOIN developer_profiles dev ON dp.developer_id = dev.id
    WHERE dev.user_id = auth.uid()
  )
);

-- 8. Inicializar contadores existentes (para proyectos que ya existen)
UPDATE development_projects 
SET view_count = 0 
WHERE view_count IS NULL;

-- 9. Crear vista para analytics del desarrollador
CREATE OR REPLACE VIEW developer_project_analytics AS
SELECT 
  dp.id as project_id,
  dp.name as project_name,
  dp.developer_id,
  dp.view_count,
  COUNT(DISTINCT pv.user_id) as unique_visitors,
  COUNT(DISTINCT DATE(pv.created_at)) as days_with_views,
  COUNT(DISTINCT pv.session_id) as unique_sessions,
  MAX(pv.created_at) as last_view_date,
  COUNT(pi.id) as total_interests
FROM development_projects dp
LEFT JOIN project_views pv ON dp.id = pv.project_id
LEFT JOIN project_interests pi ON dp.id = pi.project_id
GROUP BY dp.id, dp.name, dp.developer_id, dp.view_count;

-- 10. Verificar que todo se creó correctamente
SELECT 
  'Tables' as type,
  table_name as name,
  'Created' as status
FROM information_schema.tables 
WHERE table_name IN ('project_views') 
AND table_schema = 'public'

UNION ALL

SELECT 
  'Columns' as type,
  column_name as name,
  data_type as status
FROM information_schema.columns 
WHERE table_name = 'development_projects' 
AND column_name = 'view_count'
AND table_schema = 'public'

UNION ALL

SELECT 
  'Views' as type,
  table_name as name,
  'Created' as status
FROM information_schema.views 
WHERE table_name = 'developer_project_analytics'
AND table_schema = 'public';