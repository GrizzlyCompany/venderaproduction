import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createServerClient = () => {
  return createServerComponentClient({ cookies });
};

// Alias para compatibilidad
export const createClient = createServerClient;

/**
 * Creates a Supabase client for server-side operations, using the service_role key.
 * This client can bypass Row Level Security and should be used with caution in
 * server-only environments (Server Components, Route Handlers, Server Actions).
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is missing from .env.local');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
};