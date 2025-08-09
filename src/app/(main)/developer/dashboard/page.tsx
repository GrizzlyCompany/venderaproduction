import { requireRole } from '@/lib/auth-helpers';
import DeveloperDashboardClient from './DeveloperDashboardClient';
import { developerService } from '@/lib/developer.service';
import { redirect } from 'next/navigation';

export default async function DeveloperDashboard() {
  // Verificar que el usuario tenga rol de developer
  const { user } = await requireRole('developer');

  // Obtener el perfil del developer
  const developerProfile = await developerService.getDeveloperProfile(user.id);
  if (!developerProfile) {
    redirect('/developer/register');
  }

  // Obtener proyectos y consultas/intereses asociados a este developer
  const initialProjects = await developerService.getProjectsByDeveloper(developerProfile.id);
  const initialInterests = await developerService.getInterestsByDeveloper(developerProfile.id);

  // Renderizar el dashboard visual completo
  return (
    <DeveloperDashboardClient
      user={user}
      developerProfile={developerProfile}
      initialProjects={initialProjects}
      initialInterests={initialInterests}
    />
  );
}
