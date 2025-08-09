'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  redirectDevelopersTo?: string; // Nueva prop para redirigir desarrolladores
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  redirectDevelopersTo
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    if (!requireAuth && user) {
      router.push('/');
      return;
    }

    // Si el usuario es desarrollador y se especifica una redirección para desarrolladores
    if (user && user.profile?.role === 'developer' && redirectDevelopersTo) {
      router.push(redirectDevelopersTo);
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, requireAuth, redirectTo, redirectDevelopersTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}