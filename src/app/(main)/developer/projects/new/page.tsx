'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Building2, Upload, X, Plus, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { developerService } from '@/lib/developer.service';
import type { DevelopmentProject } from '@/types';

const projectSchema = z.object({
  name: z.string().min(2, 'El nombre del proyecto es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  status: z.enum(['planning', 'construction', 'presale', 'completed']),
  project_type: z.enum(['apartments', 'houses', 'commercial', 'mixed', 'lots']),
  location: z.string().min(2, 'La ubicación es requerida'),
  address: z.string().optional(),
  estimated_delivery: z.string().optional(),
  price_range_min: z.coerce.number().min(0, 'El precio mínimo debe ser mayor a 0').optional(),
  price_range_max: z.coerce.number().min(0, 'El precio máximo debe ser mayor a 0').optional(),
  currency: z.enum(['USD', 'DOP']),
  total_units: z.coerce.number().min(1, 'Debe tener al menos 1 unidad').optional(),
  available_units: z.coerce.number().min(0, 'Las unidades disponibles no pueden ser negativas').optional(),
  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const statusOptions = [
  { value: 'planning', label: 'En Planos' },
  { value: 'construction', label: 'En Construcción' },
  { value: 'presale', label: 'Preventa' },
  { value: 'completed', label: 'Completado' },
];

const typeOptions = [
  { value: 'apartments', label: 'Apartamentos' },
  { value: 'houses', label: 'Casas' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'mixed', label: 'Mixto' },
  { value: 'lots', label: 'Solares' },
];

const commonAmenities = [
  'Piscina', 'Gimnasio', 'Área de juegos', 'Seguridad 24/7', 'Lobby elegante',
  'Área de BBQ', 'Cancha de tenis', 'Spa y sauna', 'Parque', 'Cancha deportiva',
  'Salón de eventos', 'Business center', 'Coworking', 'Terraza', 'Jardín',
];

const commonFeatures = [
  'Balcón', 'Aire acondicionado', 'Cocina equipada', 'Pisos de porcelanato',
  'Closets empotrados', 'Baños con acabados de lujo', 'Vista al mar',
  'Jardín privado', 'Garaje', 'Terraza', 'Walk-in closet', 'Jacuzzi',
];

function NewProjectPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [floorPlanFiles, setFloorPlanFiles] = useState<File[]>([]);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [customAmenity, setCustomAmenity] = useState('');
  const [customFeature, setCustomFeature] = useState('');

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'planning',
      project_type: 'apartments',
      location: '',
      address: '',
      estimated_delivery: '',
      currency: 'USD',
      amenities: [],
      features: [],
      is_featured: false,
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para crear un proyecto.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get developer profile first
      const developerProfile = await developerService.getDeveloperProfile(user.id);
      if (!developerProfile) {
        toast({
          title: 'Error',
          description: 'No se encontró tu perfil de desarrollador. Registra tu empresa primero.',
          variant: 'destructive',
        });
        router.push('/developer/register');
        return;
      }

      // Prepare project data
      const projectData = {
        name: data.name,
        description: data.description,
        status: data.status,
        project_type: data.project_type,
        location: data.location,
        address: data.address || null,
        coordinates: null, // TODO: Add map integration
        estimated_delivery: data.estimated_delivery || null,
        price_range_min: data.price_range_min || null,
        price_range_max: data.price_range_max || null,
        currency: data.currency,
        total_units: data.total_units || null,
        available_units: data.available_units || data.total_units || null,
        amenities: data.amenities && data.amenities.length > 0 ? data.amenities : null,
        features: data.features && data.features.length > 0 ? data.features : null,
        images: null, // Will be updated after upload
        floor_plans: null, // Will be updated after upload
        brochure_url: null, // Will be updated after upload
        is_featured: data.is_featured,
        is_active: true,
        view_count: 0, // Initialize view count to 0 for new projects
      };

      console.log('📋 Form data received:', data);
      console.log('🏗️ Project data to be created:', projectData);

      // Create project
      const project = await developerService.createProject(developerProfile.id, projectData);
      console.log('✅ Project created successfully:', project);

      // Upload files if provided
      const updates: Partial<DevelopmentProject> = {};

      // Upload images
      if (imageFiles.length > 0) {
        try {
          console.log('📸 Uploading project images...');
          const imageUrls = await Promise.all(
            imageFiles.map(file => developerService.uploadProjectImage(project.id, file))
          );
          updates.images = imageUrls;
          console.log('✅ Images uploaded successfully:', imageUrls);
        } catch (uploadError) {
          console.warn('❌ Image upload failed:', uploadError);
        }
      }

      // Upload floor plans
      if (floorPlanFiles.length > 0) {
        try {
          console.log('📐 Uploading floor plans...');
          const floorPlanUrls = await Promise.all(
            floorPlanFiles.map(file => developerService.uploadFile(file, 'documents'))
          );
          updates.floor_plans = floorPlanUrls;
          console.log('✅ Floor plans uploaded successfully:', floorPlanUrls);
        } catch (uploadError) {
          console.warn('❌ Floor plan upload failed:', uploadError);
        }
      }

      // Upload brochure
      if (brochureFile) {
        try {
          console.log('📄 Uploading brochure...');
          const brochureUrl = await developerService.uploadFile(brochureFile, 'documents');
          updates.brochure_url = brochureUrl;
          console.log('✅ Brochure uploaded successfully:', brochureUrl);
        } catch (uploadError) {
          console.warn('❌ Brochure upload failed:', uploadError);
        }
      }

      // Update project with file URLs if any were uploaded
      if (Object.keys(updates).length > 0) {
        try {
          await developerService.updateProject(project.id, updates);
          console.log('✅ Project updated with file URLs');
        } catch (updateError) {
          console.warn('❌ Failed to update project with file URLs:', updateError);
        }
      }

      toast({
        title: 'Proyecto creado',
        description: 'Tu proyecto ha sido creado exitosamente.',
      });

      router.push('/developer/dashboard');
    } catch (error: any) {
      console.error('Project creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Hubo un problema al crear el proyecto. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'Archivo muy grande',
          description: `${file.name} es muy grande. Máximo 10MB por imagen.`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });
    
    setImageFiles(prev => [...prev, ...validFiles].slice(0, 10)); // Max 10 images
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFloorPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFloorPlanFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 floor plans
  };

  const removeFloorPlan = (index: number) => {
    setFloorPlanFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        toast({
          title: 'Archivo muy grande',
          description: 'El brochure debe ser menor a 20MB.',
          variant: 'destructive',
        });
        return;
      }
      setBrochureFile(file);
    }
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim()) {
      const currentAmenities = form.getValues('amenities') || [];
      form.setValue('amenities', [...currentAmenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const addCustomFeature = () => {
    if (customFeature.trim()) {
      const currentFeatures = form.getValues('features') || [];
      form.setValue('features', [...currentFeatures, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const removeAmenity = (amenity: string) => {
    const currentAmenities = form.getValues('amenities') || [];
    form.setValue('amenities', currentAmenities.filter(a => a !== amenity));
  };

  const removeFeature = (feature: string) => {
    const currentFeatures = form.getValues('features') || [];
    form.setValue('features', currentFeatures.filter(f => f !== feature));
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
              Debes iniciar sesión para crear un proyecto.
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
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Crear Nuevo Proyecto
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Completa la información de tu proyecto inmobiliario
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Proyecto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Torres del Caribe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tu proyecto, sus características principales y lo que lo hace especial..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado del Proyecto *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Proyecto *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {typeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Ubicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Punta Cana, La Altagracia" {...field} />
                      </FormControl>
                      <FormDescription>
                        Ciudad, provincia o zona donde se encuentra el proyecto
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección Específica</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Av. España, Sector Los Corales" {...field} />
                      </FormControl>
                      <FormDescription>
                        Dirección exacta del proyecto (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing and Units */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Precios y Unidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD (Dólares)</SelectItem>
                          <SelectItem value="DOP">DOP (Pesos)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="price_range_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Mínimo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="180000"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_range_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Máximo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="450000"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="total_units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total de Unidades</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="available_units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidades Disponibles</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="85"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estimated_delivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Estimada de Entrega</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Amenidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={(form.watch('amenities') || []).includes(amenity)}
                        onCheckedChange={(checked) => {
                          const currentAmenities = form.getValues('amenities') || [];
                          if (checked) {
                            form.setValue('amenities', [...currentAmenities, amenity]);
                          } else {
                            form.setValue('amenities', currentAmenities.filter(a => a !== amenity));
                          }
                        }}
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-xs md:text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar amenidad personalizada"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                  />
                  <Button type="button" onClick={addCustomAmenity} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {form.watch('amenities') && form.watch('amenities')!.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.watch('amenities')!.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Características</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`feature-${feature}`}
                        checked={(form.watch('features') || []).includes(feature)}
                        onCheckedChange={(checked) => {
                          const currentFeatures = form.getValues('features') || [];
                          if (checked) {
                            form.setValue('features', [...currentFeatures, feature]);
                          } else {
                            form.setValue('features', currentFeatures.filter(f => f !== feature));
                          }
                        }}
                      />
                      <Label htmlFor={`feature-${feature}`} className="text-xs md:text-sm">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar característica personalizada"
                    value={customFeature}
                    onChange={(e) => setCustomFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                  />
                  <Button type="button" onClick={addCustomFeature} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {form.watch('features') && form.watch('features')!.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.watch('features')!.map((feature) => (
                      <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Imágenes y Documentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Images */}
                <div>
                  <Label htmlFor="images">Imágenes del Proyecto</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="mt-2"
                  />
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Máximo 10 imágenes, 10MB cada una
                  </p>
                  
                  {imageFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-500 text-center p-2">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Floor Plans */}
                <div>
                  <Label htmlFor="floorPlans">Planos del Proyecto</Label>
                  <Input
                    id="floorPlans"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleFloorPlanChange}
                    className="mt-2"
                  />
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Máximo 5 archivos (PDF, JPG, PNG)
                  </p>
                  
                  {floorPlanFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {floorPlanFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-xs md:text-sm">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFloorPlan(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brochure */}
                <div>
                  <Label htmlFor="brochure">Brochure del Proyecto</Label>
                  <Input
                    id="brochure"
                    type="file"
                    accept=".pdf"
                    onChange={handleBrochureChange}
                    className="mt-2"
                  />
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Archivo PDF, máximo 20MB
                  </p>
                  
                  {brochureFile && (
                    <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-xs md:text-sm">{brochureFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setBrochureFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Opciones</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="is_featured"
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
                          Proyecto Destacado
                        </FormLabel>
                        <FormDescription>
                          Los proyectos destacados aparecen primero en los resultados de búsqueda
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full md:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full md:flex-1">
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Creando Proyecto...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    Crear Proyecto
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

export default function NewProjectPage() {
  return (
    <RoleGuard allowedRoles={['developer']}>
      <NewProjectPageContent />
    </RoleGuard>
  );
}