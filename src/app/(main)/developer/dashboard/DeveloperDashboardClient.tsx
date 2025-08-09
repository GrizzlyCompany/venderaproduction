'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MessageSquare, 
  TrendingUp,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { User } from '@supabase/supabase-js';
import type { DeveloperProfile, DevelopmentProject, ProjectInterest } from '@/types';
import { developerService } from '@/lib/developer.service';

const statusLabels = {
  planning: 'En Planos',
  construction: 'En Construcción',
  presale: 'Preventa',
  completed: 'Completado',
};

const statusColors = {
  planning: 'bg-gray-100 text-gray-800',
  construction: 'bg-yellow-100 text-yellow-800',
  presale: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const interestTypeLabels = {
  info_request: 'Solicitud de información',
  visit_request: 'Solicitud de visita',
  callback_request: 'Solicitud de llamada',
};

const interestStatusLabels = {
  pending: 'Pendiente',
  contacted: 'Contactado',
  closed: 'Cerrado',
};

const interestStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800',
};

interface DeveloperDashboardClientProps {
  user: User;
  developerProfile: DeveloperProfile;
  initialProjects: DevelopmentProject[];
  initialInterests: ProjectInterest[];
}

export default function DeveloperDashboardClient({
  user,
  developerProfile,
  initialProjects,
  initialInterests
}: DeveloperDashboardClientProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<DevelopmentProject[]>(initialProjects);
  const [interests, setInterests] = useState<ProjectInterest[]>(initialInterests);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      setDeletingProjectId(projectId);
      
      console.log('🗑️ Deleting project:', projectId, projectName);
      await developerService.deleteProject(projectId);
      
      // Remove project from local state
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Remove related interests from local state
      setInterests(prev => prev.filter(i => i.project_id !== projectId));
      
      toast({
        title: 'Proyecto eliminado',
        description: `El proyecto "${projectName}" ha sido eliminado exitosamente.`,
      });
      
      console.log('✅ Project deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting project:', error);
      toast({
        title: 'Error al eliminar',
        description: error.message || 'No se pudo eliminar el proyecto. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setDeletingProjectId(null);
    }
  };

  const totalViews = projects.reduce((sum, project) => sum + Math.floor(Math.random() * 1000), 0);
  const totalInterests = interests.length;
  const activeProjects = projects.filter(p => p.is_active).length;
  const pendingInterests = interests.filter(i => i.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Dashboard - {developerProfile.commercial_name || developerProfile.company_name}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Gestiona tus proyectos y consultas de clientes
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
          <Link href="/developer/projects/new">
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </Link>
          <Link href="/developer/profile">
            <Button variant="outline" className="w-full md:w-auto">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Proyectos Activos</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Visualizaciones</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Consultas</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{totalInterests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{pendingInterests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
          <TabsTrigger value="projects" className="text-xs md:text-sm">Proyectos</TabsTrigger>
          <TabsTrigger value="interests" className="text-xs md:text-sm">Consultas</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs md:text-sm">Estadísticas</TabsTrigger>
          <TabsTrigger value="profile" className="text-xs md:text-sm hidden md:block">Perfil</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold">Mis Proyectos</h2>
            <Link href="/developer/projects/new">
              <Button size="sm" className="mt-2 md:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Proyecto
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="relative">
                  {project.images && project.images[0] && (
                    <Image
                      src={project.images[0]}
                      alt={project.name}
                      width={400}
                      height={200}
                      className="w-full h-32 md:h-40 object-cover"
                    />
                  )}
                  <Badge className={`absolute top-2 right-2 text-xs ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-1">{project.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                  
                  <div className="space-y-1 mb-4 text-xs md:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unidades:</span>
                      <span>{project.available_units}/{project.total_units}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entrega:</span>
                      <span>{new Date(project.estimated_delivery || '').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        <Eye className="mr-1 h-3 w-3" />
                        Ver
                      </Button>
                    </Link>
                    <Link href={`/developer/projects/${project.id}/edit`} className="flex-1">
                      <Button size="sm" className="w-full text-xs">
                        <Edit className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                    </Link>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="text-xs px-2"
                          disabled={deletingProjectId === project.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Eliminar Proyecto</DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro de que quieres eliminar el proyecto "{project.name}"? 
                            Esta acción no se puede deshacer y se eliminarán todos los datos asociados.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogTrigger>
                          <Button 
                            variant="destructive"
                            onClick={() => handleDeleteProject(project.id, project.name)}
                            disabled={deletingProjectId === project.id}
                          >
                            {deletingProjectId === project.id ? 'Eliminando...' : 'Eliminar'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Interests Tab */}
        <TabsContent value="interests" className="mt-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Consultas de Clientes</h2>
          
          <div className="space-y-4">
            {interests.map((interest) => {
              const project = projects.find(p => p.id === interest.project_id);
              return (
                <Card key={interest.id}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm md:text-base">
                            {interestTypeLabels[interest.interest_type]}
                          </h3>
                          <Badge className={`text-xs w-fit ${interestStatusColors[interest.status]}`}>
                            {interestStatusLabels[interest.status]}
                          </Badge>
                        </div>
                        
                        <p className="text-xs md:text-sm text-gray-600 mb-2">
                          <strong>Proyecto:</strong> {project?.name || 'Proyecto no encontrado'}
                        </p>
                        
                        <p className="text-xs md:text-sm text-gray-600 mb-2">
                          <strong>Cliente:</strong> {interest.client_name}
                        </p>
                        
                        <p className="text-xs md:text-sm text-gray-600 mb-2">
                          <strong>Email:</strong> {interest.client_email}
                        </p>
                        
                        {interest.client_phone && (
                          <p className="text-xs md:text-sm text-gray-600 mb-2">
                            <strong>Teléfono:</strong> {interest.client_phone}
                          </p>
                        )}
                        
                        {interest.message && (
                          <p className="text-xs md:text-sm text-gray-700 mb-2">
                            <strong>Mensaje:</strong> {interest.message}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          {new Date(interest.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button size="sm" variant="outline">
                          Contactar
                        </Button>
                        <Button size="sm">
                          Marcar como Cerrado
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {interests.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay consultas aún
                  </h3>
                  <p className="text-gray-600">
                    Las consultas de clientes interesados en tus proyectos aparecerán aquí.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Estadísticas</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Rendimiento por Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => {
                    const projectInterests = interests.filter(i => i.project_id === project.id).length;
                    const views = Math.floor(Math.random() * 1000);
                    
                    return (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{project.name}</p>
                          <p className="text-xs md:text-sm text-gray-600">{views} vistas • {projectInterests} consultas</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs md:text-sm font-medium text-green-600">
                            {views > 0 ? ((projectInterests / views) * 100).toFixed(1) : '0.0'}% conversión
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Consultas por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 md:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm md:text-base">Gráfico de consultas (próximamente)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="max-w-2xl">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Perfil de la Empresa</h2>
            
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">{developerProfile.company_name}</h3>
                    {developerProfile.commercial_name && (
                      <p className="text-xs md:text-sm text-gray-600">{developerProfile.commercial_name}</p>
                    )}
                  </div>
                  
                  {developerProfile.description && (
                    <p className="text-xs md:text-sm text-gray-700">{developerProfile.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-gray-600">{developerProfile.contact_email}</p>
                    </div>
                    {developerProfile.contact_phone && (
                      <div>
                        <span className="font-medium">Teléfono:</span>
                        <p className="text-gray-600">{developerProfile.contact_phone}</p>
                      </div>
                    )}
                    {developerProfile.rnc_id && (
                      <div>
                        <span className="font-medium">RNC:</span>
                        <p className="text-gray-600">{developerProfile.rnc_id}</p>
                      </div>
                    )}
                    {developerProfile.website && (
                      <div>
                        <span className="font-medium">Sitio Web:</span>
                        <a href={developerProfile.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          {developerProfile.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={developerProfile.is_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {developerProfile.is_verified ? 'Verificado' : 'Pendiente de verificación'}
                    </Badge>
                    <Badge className={developerProfile.is_active ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>
                      {developerProfile.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  
                  <div className="pt-4">
                    <Link href="/developer/profile/edit">
                      <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Perfil
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}