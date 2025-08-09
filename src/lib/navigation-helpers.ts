/**
 * Helpers para manejar la navegación basada en roles de usuario
 */

import type { UserProfile } from '@/types';

/**
 * Determina la URL correcta para el perfil/dashboard de un usuario basado en su rol
 * @param userId - ID del usuario
 * @param userProfile - Perfil del usuario o objeto con rol (opcional)
 * @returns La URL correcta para navegar
 */
export function getProfileUrl(userId: string, userProfile?: UserProfile | { role: string } | null): string {
  // Si el usuario es desarrollador, redirigir al dashboard
  if (userProfile?.role === 'developer') {
    return '/developer/dashboard';
  }
  
  // Para otros roles, usar el perfil estándar
  return `/profile/${userId}`;
}

/**
 * Verifica si una ruta está activa considerando las redirecciones de rol
 * @param pathname - Ruta actual
 * @param userProfile - Perfil del usuario o objeto con rol
 * @returns true si la ruta está activa
 */
export function isProfileRouteActive(pathname: string, userProfile?: UserProfile | { role: string } | null): boolean {
  // Si el usuario es desarrollador, considerar activo si está en el dashboard
  if (userProfile?.role === 'developer') {
    return pathname.startsWith('/developer/dashboard');
  }
  
  // Para otros roles, verificar si está en una ruta de perfil
  return pathname.startsWith('/profile');
}

/**
 * Verifica si un usuario debe ser redirigido desde una página de perfil
 * @param userProfile - Perfil del usuario o objeto con rol
 * @returns true si debe ser redirigido
 */
export function shouldRedirectFromProfile(userProfile?: UserProfile | { role: string } | null): boolean {
  return userProfile?.role === 'developer';
}

/**
 * Obtiene la URL de redirección para un usuario desde una página de perfil
 * @param userProfile - Perfil del usuario o objeto con rol
 * @returns La URL de redirección o null si no debe redirigir
 */
export function getRedirectUrlFromProfile(userProfile?: UserProfile | { role: string } | null): string | null {
  if (userProfile?.role === 'developer') {
    return '/developer/dashboard';
  }
  
  return null;
}

/**
 * Obtiene la URL de redirección después del login basada en el rol del usuario
 * @param userProfile - Perfil del usuario o objeto con rol
 * @param defaultUrl - URL por defecto si no hay redirección específica
 * @returns La URL de redirección
 */
export function getPostLoginRedirectUrl(userProfile?: UserProfile | { role: string } | null, defaultUrl: string = '/'): string {
  if (userProfile?.role === 'developer') {
    return '/developer/dashboard';
  }
  
  // Para otros roles, usar la URL por defecto
  return defaultUrl;
}