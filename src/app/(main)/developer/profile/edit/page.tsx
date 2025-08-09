'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Building2, Upload, Save, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RoleGuard } from '@/components/auth/RoleGuard';
import type { DeveloperProfile } from '@/types';

const profileSchema = z.object({
  company_name: z.string().min(2, 'El nombre de la empresa es requerido'),
  commercial_name: z.string().optional(),
  rnc_id: z.string().optional(),
  contact_email: z.string().email('Email inválido'),
  contact_phone: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Mock data - will be replaced with real API
const mockDeveloperProfile: DeveloperProfile = {
  id: 'dev1',
  user_id: 'user1',
  company_name: 'Constructora del Caribe S.A.',
  commercial_name: 'Del Caribe',
  rnc_id: '123456789',
  contact_email: 'info@delcaribe.com',
  contact_phone: '+1 809 555 0123',
  logo_url: null,
  description: 'Empresa líder en desarrollo inmobiliario con más de 20 años de experiencia.',
  website: 'https://delcaribe.com',
  is_verified: true,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function EditDeveloperProfilePageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: '',
      commercial_name: '',
      rnc_id: '',
      contact_email: '',
      contact_phone: '',
      description: '',
      website: '',
    },
  });

  useEffect(() => {
    // Mock API call to load current profile
    const loadProfile = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const profile = mockDeveloperProfile;
        
        form.reset({
          company_name: profile.company_name,
          commercial_name: profile.commercial_name || '',
          rnc_id: profile.rnc_id || '',
          contact_email: profile.contact_email,
          contact_phone: profile.contact_phone || '',
          description: profile.description || '',
          website: profile.website || '',
        });
        
        setCurrentLogo(profile.logo_url);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el perfil.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user, form, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para actualizar el perfil.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - replace with real API
      console.log('Updating profile:', data);
      console.log('Logo file:', logoFile);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios han sido guardados exitosamente.',
      });

      router.push('/developer/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Hubo un problema al actualizar el perfil. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'Archivo muy grande',
          description: 'El logo debe ser menor a 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setLogoFile(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setCurrentLogo(null);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso restringido
            </h3>
            <p className="text-gray-600 mb-4">
              Debes iniciar sesión para editar el perfil.
            </p>
            <Button onClick={() => router.push('/login')}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-pulse" />
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Editar Perfil de la Empresa
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Actualiza la información de tu empresa
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Logo de la Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(currentLogo || logoFile) && (
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      {logoFile ? (
                        <span className="text-xs text-center p-2">
                          {logoFile.name}
                        </span>
                      ) : currentLogo ? (
                        <img
                          src={currentLogo}
                          alt="Logo actual"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeLogo}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="logo">Subir nuevo logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="mt-2"
                  />
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Formatos: JPG, PNG. Máximo 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Información de la Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Constructora del Caribe S.A." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commercial_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Comercial</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Del Caribe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nombre con el que se conoce comercialmente tu empresa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rnc_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RNC / ID Fiscal</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
                      <FormDescription>
                        Número de registro nacional de contribuyente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de la Empresa</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cuéntanos sobre tu empresa, experiencia, proyectos destacados..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Esta descripción aparecerá en el perfil público de tu empresa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio Web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://tuempresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Contacto *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@tuempresa.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Email donde recibirás las consultas de los clientes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 809 555 0123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/developer/dashboard')}
                className="w-full md:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full md:flex-1">
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default function EditDeveloperProfilePage() {
  return (
    <RoleGuard allowedRoles={['developer']}>
      <EditDeveloperProfilePageContent />
    </RoleGuard>
  );
}