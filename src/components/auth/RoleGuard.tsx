'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Building2, Users, UserCheck } from 'lucide-react';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback,
  redirectTo = '/'
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const { hasAnyRole, userRole } = useRole();
  const router = useRouter();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso restringido
            </h3>
            <p className="text-gray-600 mb-4">
              Debes iniciar sesión para acceder a esta página.
            </p>
            <Button onClick={() => router.push('/login')}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAnyRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    const getRoleIcon = (role: UserRole) => {
      switch (role) {
        case 'developer':
          return <Building2 className="h-8 w-8 text-orange-600" />;
        case 'agent':
          return <UserCheck className="h-8 w-8 text-green-600" />;
        case 'buyer':
          return <Users className="h-8 w-8 text-blue-600" />;
        default:
          return <AlertTriangle className="h-8 w-8 text-gray-400" />;
      }
    };

    const getRoleLabel = (role: UserRole) => {
      switch (role) {
        case 'developer':
          return 'Empresa Constructora';
        case 'agent':
          return 'Agente Inmobiliario';
        case 'buyer':
          return 'Comprador';
        default:
          return 'Usuario';
      }
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso no autorizado
            </h3>
            <p className="text-gray-600 mb-4">
              Esta página está disponible solo para: {allowedRoles.map(getRoleLabel).join(', ')}
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4 text-sm text-gray-500">
              {getRoleIcon(userRole)}
              <span>Tu cuenta es: {getRoleLabel(userRole)}</span>
            </div>
            <div className="space-y-2">
              <Button onClick={() => router.push(redirectTo)} className="w-full">
                Ir al Inicio
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.back()} 
                className="w-full"
              >
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}