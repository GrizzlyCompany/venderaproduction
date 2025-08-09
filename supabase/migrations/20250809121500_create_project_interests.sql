-- Tabla para intereses de proyectos (project_interests)
CREATE TABLE IF NOT EXISTS public.project_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.development_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_type TEXT CHECK (interest_type IN ('info_request', 'visit_request', 'callback_request')) NOT NULL,
  message TEXT,
  contact_preference TEXT CHECK (contact_preference IN ('email', 'phone', 'whatsapp')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'contacted', 'closed')) DEFAULT 'pending',
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_interests_project_id ON public.project_interests(project_id);
CREATE INDEX IF NOT EXISTS idx_project_interests_user_id ON public.project_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_project_interests_status ON public.project_interests(status);
