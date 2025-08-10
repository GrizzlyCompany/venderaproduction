
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/landing',
  '/projects',
  '/properties',
  '/contact',
  '/_next/',
  '/api/',
  '/profile/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir archivos estáticos y rutas públicas
  if (
    publicRoutes.some(route => pathname === route || pathname.startsWith(route)) ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar si existe la cookie de sesión de Supabase
  const hasSession = Boolean(request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token'));

  // Si no hay sesión, redirigir a login
  if (!hasSession) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si hay sesión, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};