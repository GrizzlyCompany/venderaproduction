import { requireAuth } from '@/lib/auth-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function PerfilPage() {
  // ✅ Verificar autenticación y obtener datos del usuario
  const { user, session, supabase } = await requireAuth();

  // Obtener datos del perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Si el usuario es desarrollador, redirigir al dashboard
  if (profile?.role === 'developer') {
    redirect('/developer/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold text-primary mb-2">
            Mi Perfil
          </h1>
          <p className="text-lg text-muted-foreground">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Tu información básica de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nombre Completo
                    </label>
                    <p className="text-lg font-medium">
                      {profile?.full_name || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Teléfono
                    </label>
                    <p className="text-lg font-medium">
                      {profile?.phone || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Fecha de Registro
                    </label>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                {profile?.bio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Biografía
                    </label>
                    <p className="text-base mt-1">
                      {profile.bio}
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button asChild>
                    <Link href="/perfil/editar">
                      Editar Perfil
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/perfil/configuracion">
                      Configuración
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Estado de la Cuenta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Estado de la Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Verificado</span>
                  <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                    {user.email_confirmed_at ? "Verificado" : "Pendiente"}
                  </Badge>
                </div>
                
                {profile?.role && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rol</span>
                    <Badge variant="outline">
                      {profile.role === 'buyer' ? 'Comprador' : 
                       profile.role === 'seller' ? 'Vendedor' : 
                       profile.role === 'developer' ? 'Desarrollador' : 
                       'Usuario'}
                    </Badge>
                  </div>
                )}

                {profile?.is_seller && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Vendedor Verificado</span>
                    <Badge variant="default">
                      Activo
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/favorites">
                    Ver Favoritos
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/messages">
                    Mensajes
                  </Link>
                </Button>
                {profile?.role === 'seller' && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/properties/new">
                      Publicar Propiedad
                    </Link>
                  </Button>
                )}
                {profile?.role === 'developer' && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/developer/dashboard">
                      Panel Desarrollador
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}