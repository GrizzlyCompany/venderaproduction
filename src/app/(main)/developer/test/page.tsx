'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { developerService } from '@/lib/developer.service';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Building2, Upload, TestTube } from 'lucide-react';

function DeveloperTestPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDeveloperProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    addResult('🔄 Probando perfil de desarrollador...');
    
    try {
      const profile = await developerService.getDeveloperProfile(user.id);
      if (profile) {
        addResult(`✅ Perfil encontrado: ${profile.company_name}`);
      } else {
        addResult('❌ No se encontró perfil de desarrollador');
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testProjectsList = async () => {
    if (!user) return;
    
    setLoading(true);
    addResult('🔄 Probando lista de proyectos...');
    
    try {
      const profile = await developerService.getDeveloperProfile(user.id);
      if (!profile) {
        addResult('❌ Necesitas un perfil de desarrollador primero');
        return;
      }

      const projects = await developerService.getProjectsByDeveloper(profile.id);
      addResult(`✅ Proyectos encontrados: ${projects.length}`);
      
      if (projects.length > 0) {
        projects.forEach((project, index) => {
          addResult(`  📋 ${index + 1}. ${project.name} (${project.status})`);
        });
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAllActiveProjects = async () => {
    setLoading(true);
    addResult('🔄 Probando proyectos públicos...');
    
    try {
      const projects = await developerService.getAllActiveProjects();
      addResult(`✅ Proyectos públicos encontrados: ${projects.length}`);
      
      if (projects.length > 0) {
        projects.forEach((project, index) => {
          addResult(`  🏗️ ${index + 1}. ${project.name} - ${project.developer?.company_name || 'Sin desarrollador'}`);
        });
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testInterests = async () => {
    if (!user) return;
    
    setLoading(true);
    addResult('🔄 Probando intereses/leads...');
    
    try {
      const profile = await developerService.getDeveloperProfile(user.id);
      if (!profile) {
        addResult('❌ Necesitas un perfil de desarrollador primero');
        return;
      }

      const interests = await developerService.getInterestsByDeveloper(profile.id);
      addResult(`✅ Intereses encontrados: ${interests.length}`);
      
      if (interests.length > 0) {
        interests.forEach((interest, index) => {
          addResult(`  💌 ${index + 1}. ${interest.interest_type} - ${interest.status}`);
        });
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <TestTube className="mr-3 h-8 w-8 text-blue-600" />
          Panel de Pruebas - Desarrollador
        </h1>
        <p className="text-gray-600">
          Prueba las funcionalidades del sistema de desarrolladores
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Controles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Pruebas Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testDeveloperProfile} 
              disabled={loading}
              className="w-full"
            >
              Probar Perfil de Desarrollador
            </Button>
            
            <Button 
              onClick={testProjectsList} 
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              Probar Mis Proyectos
            </Button>
            
            <Button 
              onClick={testAllActiveProjects} 
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              Probar Proyectos Públicos
            </Button>
            
            <Button 
              onClick={testInterests} 
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              Probar Intereses/Leads
            </Button>

            <div className="pt-4 border-t">
              <Button 
                onClick={clearResults} 
                variant="secondary"
                className="w-full"
              >
                Limpiar Resultados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados de Pruebas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No hay resultados aún. Ejecuta una prueba para ver los resultados.
                </p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información del Usuario */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label>ID de Usuario:</Label>
              <p className="font-mono">{user?.id || 'No disponible'}</p>
            </div>
            <div>
              <Label>Email:</Label>
              <p>{user?.email || 'No disponible'}</p>
            </div>
            <div>
              <Label>Rol:</Label>
              <p>{user?.profile?.role || 'No disponible'}</p>
            </div>
            <div>
              <Label>Nombre:</Label>
              <p>{user?.profile?.full_name || 'No disponible'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DeveloperTestPage() {
  return (
    <RoleGuard allowedRoles={['developer']}>
      <DeveloperTestPageContent />
    </RoleGuard>
  );
}