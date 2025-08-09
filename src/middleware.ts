import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/landing',
    '/projects',
    '/properties',
    '/contact',
  ];

  // Developer-only routes
  const developerRoutes = [
    '/developer/dashboard',
    '/developer/projects',
    '/developer/profile',
  ];

  // Agent-only routes
  const agentRoutes = [
    '/agent/dashboard',
    '/agent/properties',
    '/agent/profile',
  ];

  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return res;
  }

  // Redirect to login if not authenticated
  if (!session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user profile to check role
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const userRole = profile?.role;

    // Check developer routes
    if (developerRoutes.some(route => pathname.startsWith(route))) {
      if (userRole !== 'developer') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Check agent routes
    if (agentRoutes.some(route => pathname.startsWith(route))) {
      if (userRole !== 'agent') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Redirect developers to their dashboard if they try to access general routes
    if (userRole === 'developer' && pathname === '/') {
      return NextResponse.redirect(new URL('/developer/dashboard', req.url));
    }

    // Redirect agents to their dashboard if they try to access general routes
    if (userRole === 'agent' && pathname === '/') {
      return NextResponse.redirect(new URL('/agent/dashboard', req.url));
    }

  } catch (error) {
    console.error('Error checking user role:', error);
  }

  return res;
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