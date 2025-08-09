-- VENDRA DATABASE FIX - Resolve login and profile navigation issues
-- This script fixes issues that might be preventing proper authentication and profile access

-- 1. Fix the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile with error handling
  INSERT INTO public.profiles (id, full_name, avatar_url, email, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(MD5(random()::text), 0, 5)
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Make the national_id constraint more flexible (allow NULL values)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS unique_national_id;
ALTER TABLE public.profiles ADD CONSTRAINT unique_national_id UNIQUE (national_id) DEFERRABLE INITIALLY DEFERRED;

-- 3. Update RLS policies to be more permissive for profile access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- More permissive profile policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles 
  FOR UPDATE USING (auth.uid() = id OR auth.uid() IS NULL);

-- 4. Add a policy for upsert operations (needed for profile creation)
CREATE POLICY "Allow profile upsert for authenticated users." ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Create a function to check and fix missing profiles
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Get user email from auth.users
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    
    -- Create missing profile
    INSERT INTO public.profiles (id, email, username, created_at, updated_at)
    VALUES (
      user_id,
      user_email,
      SPLIT_PART(user_email, '@', 1) || '_' || SUBSTRING(MD5(random()::text), 0, 5),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to ensure profile for user %: %', user_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- 7. Fix any existing users without profiles
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.email 
    FROM auth.users au 
    LEFT JOIN public.profiles p ON au.id = p.id 
    WHERE p.id IS NULL
  LOOP
    PERFORM public.ensure_user_profile(user_record.id);
  END LOOP;
END $$;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.properties TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.ratings TO authenticated;

-- 9. Ensure storage policies are not too restrictive
-- Update avatar policies to be more permissive
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
CREATE POLICY "Allow public read access to avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 10. Add debugging function to check user state
CREATE OR REPLACE FUNCTION public.debug_user_state(user_id UUID DEFAULT auth.uid())
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', user_id,
    'auth_user_exists', EXISTS(SELECT 1 FROM auth.users WHERE id = user_id),
    'profile_exists', EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id),
    'profile_data', (SELECT row_to_json(p) FROM public.profiles p WHERE id = user_id),
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission on the debug function
GRANT EXECUTE ON FUNCTION public.debug_user_state TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile TO authenticated;