-- Tabla para proyectos de desarrollo inmobiliario (development_projects)
CREATE TABLE IF NOT EXISTS public.development_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL REFERENCES public.developer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('planning', 'construction', 'presale', 'completed')) NOT NULL,
  project_type TEXT CHECK (project_type IN ('apartments', 'houses', 'commercial', 'mixed', 'lots')) NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  coordinates JSONB,
  estimated_delivery DATE,
  price_range_min NUMERIC,
  price_range_max NUMERIC,
  currency TEXT CHECK (currency IN ('USD', 'DOP')) DEFAULT 'USD',
  total_units INT,
  available_units INT,
  amenities TEXT[],
  features TEXT[],
  images TEXT[],
  floor_plans TEXT[],
  brochure_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_development_projects_developer_id ON public.development_projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_development_projects_status ON public.development_projects(status);
CREATE INDEX IF NOT EXISTS idx_development_projects_is_active ON public.development_projects(is_active);
