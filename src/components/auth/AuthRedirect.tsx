'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthRedirectProps {
  children: React.ReactNode;
}

export function AuthRedirect({ children }: AuthRedirectProps) {
  const { user, loading, clearSession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showSessionError, setShowSessionError] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    console.log('=== AuthRedirect ===', { 
      loading, 
      userExists: !!user, 
      userId: user?.id, 
      pathname,
      hasCheckedAuth,
      timestamp: new Date().toISOString()
    });
    
    // Don't redirect if still loading
    if (loading) {
      console.log('⏳ AuthRedirect: Still loading, waiting...');
      return;
    }

    // Mark that we've checked auth at least once
    if (!hasCheckedAuth) {
      console.log('🔍 AuthRedirect: First auth check completed');
      setHasCheckedAuth(true);
      
      // Give a small delay for hydration issues
      if (!user) {
        console.log('⏳ AuthRedirect: No user found, waiting a bit for hydration...');
        setTimeout(() => {
          setHasCheckedAuth(true);
        }, 100);
        return;
      }
    }

    // Don't redirect if user is authenticated
    if (user) {
      console.log('✅ AuthRedirect: User authenticated, allowing access');
      return;
    }

    // Define public pages that don't require authentication
    const publicPages = ['/landing', '/login', '/signup', '/'];
    const isPublicPage = publicPages.includes(pathname);
    
    // Profile pages are public for viewing but we need to handle them carefully
    const isProfilePage = pathname.startsWith('/profile/');

    // Don't redirect if on a public page (but not profile pages)
    if (isPublicPage) {
      console.log('✅ AuthRedirect: Public page, no redirect needed');
      return;
    }

    // For profile pages, always allow access (they handle their own auth logic)
    if (isProfilePage) {
      console.log('✅ AuthRedirect: Profile page - bypassing redirect logic');
      return;
    }

    // Check if we're dealing with a session error (user was trying to access protected content)
    const isFullyProtectedRoute = pathname.startsWith('/developer/') || 
                                 pathname.startsWith('/agent/') ||
                                 pathname.startsWith('/messages') ||
                                 pathname.startsWith('/favorites');

    if (isFullyProtectedRoute) {
      console.log('🚫 AuthRedirect: Protected route, showing session error');
      setShowSessionError(true);
      return;
    }

    // Only redirect if we've given enough time for auth to load and it's not a profile page
    if (hasCheckedAuth && !isProfilePage) {
      console.log('🔄 AuthRedirect: Redirecting to landing page');
      router.push('/landing');
    } else if (isProfilePage) {
      console.log('✅ AuthRedirect: Profile page - allowing access even without auth');
    }
  }, [user, loading, router, pathname, hasCheckedAuth]);

  const handleClearSession = async () => {
    setIsClearing(true);
    try {
      await clearSession();
      // Redirect to login after clearing session
      router.push('/login');
    } catch (error) {
      console.error('Error clearing session:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  // Show session error for protected routes
  if (showSessionError && !loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <CardTitle>Sesión Expirada</CardTitle>
            <CardDescription>
              Tu sesión ha expirado o hay un problema con la autenticación. 
              Por favor, inicia sesión nuevamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleGoToLogin} 
              className="w-full"
              variant="default"
            >
              Iniciar Sesión
            </Button>
            <Button 
              onClick={handleClearSession} 
              className="w-full"
              variant="outline"
              disabled={isClearing}
            >
              {isClearing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Limpiando...
                </>
              ) : (
                'Limpiar Sesión y Reintentar'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading only when actually loading auth state, not for public pages
  if (loading) {
    // Don't show loading screen for public pages - let them render immediately
    const publicPages = ['/landing', '/login', '/signup', '/'];
    const isPublicPage = publicPages.includes(pathname) || pathname.startsWith('/profile/');
    
    if (isPublicPage) {
      return <>{children}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Show children if user is authenticated or on public pages
  return <>{children}</>;
}