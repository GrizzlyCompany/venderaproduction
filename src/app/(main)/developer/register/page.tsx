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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Building2, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { developerService } from '@/lib/developer.service';

const developerSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa es requerido'),
  commercialName: z.string().optional(),
  rncId: z.string().optional(),
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  }),
});

type DeveloperFormData = z.infer<typeof developerSchema>;

function DeveloperRegisterPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<DeveloperFormData>({
    resolver: zodResolver(developerSchema),
    defaultValues: {
      companyName: '',
      commercialName: '',
      rncId: '',
      contactEmail: '',
      contactPhone: '',
      description: '',
      website: '',
      acceptTerms: false,
    },
  });

  // Set email when user is loaded
  useEffect(() => {
    if (user?.email) {
      form.setValue('contactEmail', user.email);
    }
  }, [user?.email, form]);

  const onSubmit = async (data: DeveloperFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para registrar una empresa.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create developer profile
      const profileData = {
        company_name: data.companyName,
        commercial_name: data.commercialName || null,
        rnc_id: data.rncId || null,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone || null,
        description: data.description || null,
        website: data.website || null,
        logo_url: null,
        is_verified: false,
        is_active: true,
      };

      const developerProfile = await developerService.createDeveloperProfile(user.id, profileData);

      // Upload logo if provided
      if (logoFile && developerProfile) {
        try {
          const logoUrl = await developerService.uploadDeveloperLogo(developerProfile.id, logoFile);
          await developerService.updateDeveloperProfile(developerProfile.id, { logo_url: logoUrl });
        } catch (logoError) {
          console.warn('Logo upload failed, but profile was created:', logoError);
        }
      }

      toast({
        title: 'Registro exitoso',
        description: 'Tu empresa ha sido registrada exitosamente.',
      });

      router.push('/developer/dashboard');
    } catch (error: any) {
      console.error('Developer registration error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Hubo un problema al registrar tu empresa. Inténtalo de nuevo.',
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Inicia sesión requerido
            </h3>
            <p className="text-gray-600 mb-4">
              Debes iniciar sesión para registrar tu empresa como desarrollador.
            </p>
            <Button onClick={() => router.push('/login')}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Building2 className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registra tu Empresa Desarrolladora
          </h1>
          <p className="text-gray-600">
            Únete a nuestra plataforma y promociona tus proyectos inmobiliarios
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Beneficios de registrarte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Publica proyectos en construcción y preventa
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Recibe leads calificados de compradores interesados
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Dashboard con estadísticas de tus proyectos
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Opciones de destacar proyectos (planes premium)
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Name */}
                <FormField
                  control={form.control}
                  name="companyName"
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

                {/* Commercial Name */}
                <FormField
                  control={form.control}
                  name="commercialName"
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

                {/* RNC/Tax ID */}
                <FormField
                  control={form.control}
                  name="rncId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RNC / ID Fiscal</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
                      <FormDescription>
                        Número de registro nacional de contribuyente (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Email */}
                <FormField
                  control={form.control}
                  name="contactEmail"
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

                {/* Contact Phone */}
                <FormField
                  control={form.control}
                  name="contactPhone"
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

                {/* Website */}
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

                {/* Description */}
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

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo de la Empresa</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="flex-1"
                    />
                    <div className="text-sm text-gray-500">
                      Máx. 5MB
                    </div>
                  </div>
                  {logoFile && (
                    <p className="text-sm text-green-600">
                      Archivo seleccionado: {logoFile.name}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Acepto los términos y condiciones *
                        </FormLabel>
                        <FormDescription>
                          Al registrarte, aceptas nuestros{' '}
                          <a href="/terms" className="text-primary hover:underline">
                            términos de servicio
                          </a>{' '}
                          y{' '}
                          <a href="/privacy" className="text-primary hover:underline">
                            política de privacidad
                          </a>
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Registrar Empresa
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            ¿Tienes preguntas? Contáctanos en{' '}
            <a href="mailto:developers@vendera.com" className="text-primary hover:underline">
              developers@vendera.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DeveloperRegisterPage() {
  return (
    <RoleGuard allowedRoles={['developer']}>
      <DeveloperRegisterPageContent />
    </RoleGuard>
  );
}