-- Trigger to auto-create developer_profiles when a user with role 'developer' is created
CREATE OR REPLACE FUNCTION public.handle_new_developer_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create developer profile if role is 'developer'
  IF NEW.role = 'developer' THEN
    INSERT INTO public.developer_profiles (
      user_id, company_name, contact_email, is_verified, is_active
    ) VALUES (
      NEW.id,
      COALESCE(NEW.full_name, 'Empresa sin nombre'),
      COALESCE(NEW.email, ''),
      FALSE,
      TRUE
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_profile_created_developer ON public.profiles;

-- Create the trigger on insert to profiles
CREATE TRIGGER on_profile_created_developer
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_developer_profile();
