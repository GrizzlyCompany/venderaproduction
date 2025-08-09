
-- Grant permissions to handle new user creation
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
