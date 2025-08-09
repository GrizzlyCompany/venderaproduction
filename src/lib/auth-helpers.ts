import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Verifica que el usuario esté autenticado en un Server Component.
 * Si no está autenticado, redirige automáticamente a la página de login.
 * 
 * @param redirectTo - Página a la que redirigir si no está autenticado (default: '/login')
 * @returns El usuario autenticado y el cliente de Supabase
 */
export async function requireAuth(redirectTo: string = '/login') {
  const supabase = createServerClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(redirectTo);
  }

  return {
    user: session.user,
    session,
    supabase
  };
}

/**
 * Obtiene la sesión del usuario sin redirigir.
 * Útil para páginas que pueden mostrar contenido diferente según el estado de autenticación.
 * 
 * @returns La sesión del usuario (puede ser null) y el cliente de Supabase
 */
export async function getSession() {
  const supabase = createServerClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    session,
    user: session?.user || null,
    supabase
  };
}

/**
 * Verifica que el usuario NO esté autenticado.
 * Si está autenticado, redirige a la página especificada.
 * Útil para páginas de login/registro.
 * 
 * @param redirectTo - Página a la que redirigir si está autenticado (default: '/')
 * @returns El cliente de Supabase
 */
export async function requireGuest(redirectTo: string = '/') {
  const supabase = createServerClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect(redirectTo);
  }

  return { supabase };
}

/**
 * Verifica que el usuario tenga un rol específico.
 * Si no tiene el rol requerido, redirige a la página especificada.
 * 
 * @param requiredRole - El rol requerido
 * @param redirectTo - Página a la que redirigir si no tiene el rol (default: '/')
 * @returns El usuario, perfil y cliente de Supabase
 */
export async function requireRole(requiredRole: string, redirectTo: string = '/') {
  const { user, session, supabase } = await requireAuth();
  
  // Obtener el perfil del usuario para verificar el rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== requiredRole) {
    redirect(redirectTo);
  }

  return {
    user,
    session,
    profile,
    supabase
  };
}