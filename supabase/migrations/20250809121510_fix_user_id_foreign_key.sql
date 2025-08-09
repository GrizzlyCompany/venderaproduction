-- Re-crear la foreign key de user_id a auth.users(id) para Supabase/PostgREST
ALTER TABLE public.project_interests
DROP CONSTRAINT IF EXISTS project_interests_user_id_fkey;

ALTER TABLE public.project_interests
ADD CONSTRAINT project_interests_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
