import { requireRole } from '@/lib/auth-helpers';
import DeveloperDashboardClient from './DeveloperDashboardClient';
import { developerService } from '@/lib/developer.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
import type { DeveloperProfile, DevelopmentProject, ProjectInterest } from '@/types';

export default async function DeveloperDashboard() {
  // ✅ Verificar que el usuario tenga rol de desarrollador
  const { user, supabase } = await requireRole('developer');

  try {
    // Obtener el perfil del desarrollador
    const developerProfile = await developerService.getDeveloperProfile(user.id);

    if (!developerProfile) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Perfil de desarrollador no encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Parece que aún no tienes un perfil de desarrollador registrado.
              </p>
              <Link href="/developer/register">
                <Button>
                  Registrar Empresa
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Obtener proyectos e intereses del desarrollador
    const [projects, interests] = await Promise.all([
      developerService.getProjectsByDeveloper(developerProfile.id),
      developerService.getInterestsByDeveloper(developerProfile.id)
    ]);

    // Pasar todos los datos al componente cliente
    return (
      <DeveloperDashboardClient
        user={user}
        developerProfile={developerProfile}
        initialProjects={projects}
        initialInterests={interests}
      />
    );

  } catch (error) {
    console.error('Error loading developer dashboard:', error);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Building2 className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar el dashboard
            </h3>
            <p className="text-gray-600 mb-4">
              Hubo un problema al cargar tu información. Por favor, intenta de nuevo.
            </p>
            <Button asChild>
              <Link href="/developer/dashboard">
                Reintentar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
