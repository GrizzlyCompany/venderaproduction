-- Create developer profiles and development projects tables
-- This migration creates the tables needed for developer/company functionality

-- 1. DEVELOPER PROFILES TABLE
CREATE TABLE public.developer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  commercial_name TEXT,
  rnc_id TEXT, -- RNC / Tax ID
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id), -- One developer profile per user
  UNIQUE(rnc_id) -- Unique tax ID
);

COMMENT ON TABLE public.developer_profiles IS 'Developer/Company profiles for construction companies';
COMMENT ON COLUMN public.developer_profiles.user_id IS 'References the user profile';
COMMENT ON COLUMN public.developer_profiles.rnc_id IS 'RNC or Tax ID number';

-- 2. DEVELOPMENT PROJECTS TABLE
CREATE TABLE public.development_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL REFERENCES public.developer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'construction', 'presale', 'completed')),
  project_type TEXT DEFAULT 'apartments' CHECK (project_type IN ('apartments', 'houses', 'commercial', 'mixed', 'lots')),
  location TEXT NOT NULL,
  address TEXT,
  coordinates JSONB, -- {lat: number, lng: number}
  estimated_delivery DATE,
  price_range_min NUMERIC,
  price_range_max NUMERIC,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'DOP')),
  total_units INTEGER,
  available_units INTEGER,
  amenities TEXT[],
  features TEXT[],
  images TEXT[],
  floor_plans TEXT[], -- URLs to floor plan PDFs/images
  brochure_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.development_projects IS 'Development projects by construction companies';
COMMENT ON COLUMN public.development_projects.coordinates IS 'Project coordinates as JSON {lat, lng}';

-- 3. PROJECT INTERESTS TABLE (for leads/inquiries)
CREATE TABLE public.project_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.development_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_type TEXT DEFAULT 'info_request' CHECK (interest_type IN ('info_request', 'visit_request', 'callback_request')),
  message TEXT,
  contact_preference TEXT DEFAULT 'email' CHECK (contact_preference IN ('email', 'phone', 'whatsapp')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.project_interests IS 'User interests/leads for development projects';

-- Indexes for performance
CREATE INDEX idx_developer_profiles_user_id ON public.developer_profiles(user_id);
CREATE INDEX idx_developer_profiles_is_active ON public.developer_profiles(is_active);
CREATE INDEX idx_development_projects_developer_id ON public.development_projects(developer_id);
CREATE INDEX idx_development_projects_status ON public.development_projects(status);
CREATE INDEX idx_development_projects_location ON public.development_projects(location);
CREATE INDEX idx_development_projects_is_active ON public.development_projects(is_active);
CREATE INDEX idx_project_interests_project_id ON public.project_interests(project_id);
CREATE INDEX idx_project_interests_user_id ON public.project_interests(user_id);
CREATE INDEX idx_project_interests_status ON public.project_interests(status);

-- Enable RLS on new tables
ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for developer_profiles
CREATE POLICY "Developer profiles are viewable by everyone" ON public.developer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own developer profile" ON public.developer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own developer profile" ON public.developer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own developer profile" ON public.developer_profiles FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for development_projects
CREATE POLICY "Development projects are viewable by everyone" ON public.development_projects FOR SELECT USING (true);
CREATE POLICY "Developers can create projects" ON public.development_projects FOR INSERT WITH CHECK (
  developer_id IN (SELECT id FROM public.developer_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Developers can update their own projects" ON public.development_projects FOR UPDATE USING (
  developer_id IN (SELECT id FROM public.developer_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Developers can delete their own projects" ON public.development_projects FOR DELETE USING (
  developer_id IN (SELECT id FROM public.developer_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for project_interests
CREATE POLICY "Project interests are viewable by project owners and interested users" ON public.project_interests FOR SELECT USING (
  auth.uid() = user_id OR 
  project_id IN (
    SELECT dp.id FROM public.development_projects dp 
    JOIN public.developer_profiles dev ON dp.developer_id = dev.id 
    WHERE dev.user_id = auth.uid()
  )
);
CREATE POLICY "Authenticated users can create project interests" ON public.project_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interests" ON public.project_interests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Project owners can update interest status" ON public.project_interests FOR UPDATE USING (
  project_id IN (
    SELECT dp.id FROM public.development_projects dp 
    JOIN public.developer_profiles dev ON dp.developer_id = dev.id 
    WHERE dev.user_id = auth.uid()
  )
);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.developer_profiles, public.development_projects, public.project_interests;