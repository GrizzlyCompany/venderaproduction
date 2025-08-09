
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') || // Skip files with extensions (manifest.json, favicon.ico, etc.)
    pathname.startsWith('/profile/') // Profile pages are public
  ) {
    return NextResponse.next();
  }

  const { supabase, response } = createClient(request);

  console.log('=== MIDDLEWARE ===');
  console.log('Pathname:', pathname);

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  let session = null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      // Handle refresh token errors gracefully
      if (error.message?.includes('refresh_token_not_found') || 
          error.message?.includes('Invalid Refresh Token')) {
        console.log('⚠️ MIDDLEWARE: Invalid refresh token, treating as unauthenticated');
      } else {
        console.error('❌ MIDDLEWARE: Session error:', error);
      }
    } else {
      session = data.session;
    }
  } catch (error) {
    console.error('❌ MIDDLEWARE: Unexpected session error:', error);
  }

  console.log('Session exists:', !!session);
  console.log('User ID:', session?.user?.id);

  // If user is not logged in and trying to access the root, redirect to /landing
  if (!session && pathname === '/') {
    console.log('🔄 MIDDLEWARE: Redirecting to landing page');
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  // If user is logged in, check role-based redirections
  if (session?.user) {
    try {
      // Get user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const userRole = profile?.role || 'buyer';

      // Role-based route protection
      if (pathname.startsWith('/developer/') && userRole !== 'developer') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (pathname.startsWith('/agent/') && userRole !== 'agent') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Redirect developers to register if they don't have a developer profile
      if (userRole === 'developer' && pathname === '/') {
        const { data: developerProfile } = await supabase
          .from('developer_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!developerProfile) {
          return NextResponse.redirect(new URL('/developer/register', request.url));
        } else {
          return NextResponse.redirect(new URL('/developer/dashboard', request.url));
        }
      }

      // Redirect agents to their dashboard
      if (userRole === 'agent' && pathname === '/') {
        return NextResponse.redirect(new URL('/agent/dashboard', request.url));
      }
    } catch (error) {
      console.error('Middleware error:', error);
      // Continue with normal flow if there's an error
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
