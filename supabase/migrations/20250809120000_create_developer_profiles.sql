-- Tabla para perfiles de desarrolladores (developer_profiles)
CREATE TABLE IF NOT EXISTS public.developer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  commercial_name TEXT,
  rnc_id TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_developer_profiles_user_id ON public.developer_profiles(user_id);
