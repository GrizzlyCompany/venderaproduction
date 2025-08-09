-- Add seller onboarding fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_front_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_back_url TEXT;

-- Add unique constraint on national_id to prevent duplicates
ALTER TABLE public.profiles ADD CONSTRAINT unique_national_id UNIQUE (national_id);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.national_id IS 'National ID/Cedula number for seller verification';
COMMENT ON COLUMN public.profiles.birth_date IS 'Date of birth for seller verification';
COMMENT ON COLUMN public.profiles.nationality IS 'Nationality for seller verification';
COMMENT ON COLUMN public.profiles.phone_number IS 'Phone number for seller contact';
COMMENT ON COLUMN public.profiles.full_address IS 'Full address for seller verification';
COMMENT ON COLUMN public.profiles.id_front_url IS 'URL to front side of ID document';
COMMENT ON COLUMN public.profiles.id_back_url IS 'URL to back side of ID document';