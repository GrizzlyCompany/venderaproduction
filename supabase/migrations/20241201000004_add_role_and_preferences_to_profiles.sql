-- Add role and preferences fields to profiles table
-- This migration adds the missing role field and preferences JSONB field

-- Add role field with enum constraint
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'agent', 'developer'));

-- Add preferences field as JSONB
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT NULL;

-- Create index for role field for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update the handle_new_user function to include role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, username, role, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(MD5(random()::text), 0, 5)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.role IS 'User role: buyer, agent, or developer';
COMMENT ON COLUMN public.profiles.preferences IS 'User preferences stored as JSON (property types, price range, locations, notifications)';