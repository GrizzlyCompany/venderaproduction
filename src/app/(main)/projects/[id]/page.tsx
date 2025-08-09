'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Star,
  Phone,
  Mail,
  MessageSquare,
  Download,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { developerService } from '@/lib/developer.service';
import type { DevelopmentProject } from '@/types';

// Mock data - will be replaced with real API call
const mockProject: DevelopmentProject = {
  id: '1',
  developer_id: 'dev1',
  name: 'Torres del Caribe',
  description: 'Moderno complejo residencial con vista al mar y amenidades de lujo. Este proyecto representa la perfecta combinación entre elegancia, comodidad y ubicación privilegiada en una de las zonas más exclusivas de Punta Cana.',
  status: 'construction',
  project_type: 'apartments',
  location: 'Punta Cana, La Altagracia',
  address: 'Av. España, Punta Cana',
  coordinates: { lat: 18.5601, lng: -68.3725 },
  estimated_delivery: '2025-12-01',
  price_range_min: 180000,
  price_range_max: 450000,
  currency: 'USD',
  total_units: 120,
  available_units: 85,
  amenities: [
    'Piscina infinity',
    'Gimnasio equipado',
    'Área de juegos infantiles',
    'Seguridad 24/7',
    'Lobby elegante',
    'Área de BBQ',
    'Cancha de tenis',
    'Spa y sauna'
  ],
  features: [
    'Balcón con vista al mar',
    'Aire acondicionado central',
    'Cocina equipada con electrodomésticos',
    'Pisos de porcelanato',
    'Closets empotrados',
    'Baños con acabados de lujo'
  ],
  images: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
  ],
  floor_plans: [
    'https://example.com/floor-plan-1.pdf',
    'https://example.com/floor-plan-2.pdf'
  ],
  brochure_url: 'https://example.com/brochure.pdf',
  is_featured: true,
  is_active: true,
  view_count: 1247,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  developer: {
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
  }
};

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

const typeLabels = {
  apartments: 'Apartamentos',
  houses: 'Casas',
  commercial: 'Comercial',
  mixed: 'Mixto',
  lots: 'Solares',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<DevelopmentProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInterestDialogOpen, setIsInterestDialogOpen] = useState(false);
  const [interestForm, setInterestForm] = useState({
    type: 'info_request',
    message: '',
    contactPreference: 'email'
  });

  useEffect(() => {
    const loadProject = async () => {
      if (!params.id || typeof params.id !== 'string') {
        console.error('❌ Invalid project ID:', params.id);
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Loading project details for ID:', params.id);
        const projectData = await developerService.getProject(params.id);
        
        if (projectData) {
          console.log('✅ Project loaded successfully:', projectData);
          console.log('📄 Project brochure_url:', projectData.brochure_url);
          console.log('📐 Project floor_plans:', projectData.floor_plans);
          setProject(projectData);
        } else {
          console.log('⚠️ Project not found, using mock data as fallback');
          setProject(mockProject);
        }
      } catch (error) {
        console.error('❌ Error loading project:', error);
        // Fallback to mock data if API fails
        console.log('🔄 Falling back to mock data');
        setProject(mockProject);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [params.id]);

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para mostrar interés en un proyecto.',
        variant: 'destructive',
      });
      return;
    }

    if (!project) {
      toast({
        title: 'Error',
        description: 'No se pudo procesar tu solicitud. Inténtalo de nuevo.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('📝 Submitting interest for project:', project.id);
      
      const interestData = {
        project_id: project.id,
        user_id: user.id,
        interest_type: interestForm.type as 'info_request' | 'visit_request' | 'callback_request',
        message: interestForm.message || null,
        contact_preference: interestForm.contactPreference as 'email' | 'phone' | 'whatsapp',
        status: 'pending' as const,
        // Client information from user profile
        client_name: user.profile?.full_name || user.user_metadata?.full_name || user.email || 'Usuario',
        client_email: user.email ?? '',
        client_phone: user.profile?.phone_number || user.user_metadata?.phone || null,
      };

      await developerService.createProjectInterest(interestData);
      
      console.log('✅ Interest submitted successfully');
      
      toast({
        title: 'Interés registrado',
        description: 'Hemos registrado tu interés. El desarrollador se pondrá en contacto contigo pronto.',
      });
      
      setIsInterestDialogOpen(false);
      setInterestForm({
        type: 'info_request',
        message: '',
        contactPreference: 'email'
      });
    } catch (error: any) {
      console.error('❌ Error submitting interest:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo registrar tu interés. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando detalles del proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Proyecto no encontrado
          </h3>
          <p className="text-gray-600">
            El proyecto que buscas no existe o ha sido eliminado.
          </p>
        </div>
      </div>
    );
  }

  const formatPrice = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return 'Precio a consultar';
    const symbol = currency === 'USD' ? '$' : 'RD$';
    if (min && max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    }
    return `Desde ${symbol}${(min || max)?.toLocaleString()}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'A definir';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="text-sm md:text-base">{project.location}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusColors[project.status]}>
                {statusLabels[project.status]}
              </Badge>
              <Badge variant="outline">
                {typeLabels[project.project_type]}
              </Badge>
              {project.is_featured && (
                <Badge className="bg-yellow-500">
                  <Star className="w-3 h-3 mr-1" />
                  Destacado
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col md:text-right space-y-3">
            <div className="text-xl md:text-2xl font-bold text-primary">
              {formatPrice(project.price_range_min, project.price_range_max, project.currency)}
            </div>
            <Dialog open={isInterestDialogOpen} onOpenChange={setIsInterestDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full md:w-auto">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Mostrar Interés
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">
                    Mostrar Interés en {project.name}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInterestSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="type" className="text-sm md:text-base">Tipo de consulta</Label>
                    <Select value={interestForm.type} onValueChange={(value) => 
                      setInterestForm(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger className="h-9 md:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info_request">Solicitar información</SelectItem>
                        <SelectItem value="visit_request">Solicitar visita</SelectItem>
                        <SelectItem value="callback_request">Solicitar llamada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm md:text-base">Mensaje (opcional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Cuéntanos qué te interesa del proyecto..."
                      value={interestForm.message}
                      onChange={(e) => setInterestForm(prev => ({ ...prev, message: e.target.value }))}
                      className="min-h-[80px] md:min-h-[100px] text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPreference" className="text-sm md:text-base">Preferencia de contacto</Label>
                    <Select value={interestForm.contactPreference} onValueChange={(value) => 
                      setInterestForm(prev => ({ ...prev, contactPreference: value }))
                    }>
                      <SelectTrigger className="h-9 md:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Teléfono</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-9 md:h-10 text-sm md:text-base">
                    Enviar Solicitud
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Image Gallery */}
          <div className="mb-6 md:mb-8">
            <div className="mb-3 md:mb-4">
              {project.images && project.images[selectedImage] && (
                <Image
                  src={project.images[selectedImage]}
                  alt={project.name}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg"
                />
              )}
            </div>
            {project.images && project.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {project.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${project.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="description" className="text-xs md:text-sm px-2 py-2">
                Descripción
              </TabsTrigger>
              <TabsTrigger value="features" className="text-xs md:text-sm px-2 py-2">
                Características
              </TabsTrigger>
              <TabsTrigger value="amenities" className="text-xs md:text-sm px-2 py-2">
                Amenidades
              </TabsTrigger>
              <TabsTrigger value="location" className="text-xs md:text-sm px-2 py-2">
                Ubicación
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-4 md:mt-6">
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{project.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="features" className="mt-4 md:mt-6">
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {project.features?.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-sm md:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="amenities" className="mt-4 md:mt-6">
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {project.amenities?.map((amenity, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-sm md:text-base">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="location" className="mt-4 md:mt-6">
              <Card>
                <CardContent className="pt-4 md:pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm md:text-base">Dirección</h4>
                      <p className="text-gray-700 text-sm md:text-base">{project.address}</p>
                    </div>
                    <div className="bg-gray-100 h-48 md:h-64 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 text-sm md:text-base">Mapa interactivo (próximamente)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
          {/* Project Info */}
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-lg md:text-xl">Información del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 pt-0">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm md:text-base">Estado:</span>
                <Badge className={`${statusColors[project.status]} text-xs`}>
                  {statusLabels[project.status]}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm md:text-base">Tipo:</span>
                <span className="font-medium text-sm md:text-base text-right">{typeLabels[project.project_type]}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600 text-sm md:text-base">Entrega estimada:</span>
                <span className="font-medium text-sm md:text-base text-right">{formatDate(project.estimated_delivery)}</span>
              </div>
              {project.total_units && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">Total unidades:</span>
                  <span className="font-medium text-sm md:text-base">{project.total_units}</span>
                </div>
              )}
              {project.available_units && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">Disponibles:</span>
                  <span className="font-medium text-green-600 text-sm md:text-base">{project.available_units}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Developer Info */}
          {project.developer && (
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-lg md:text-xl">Desarrollador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 pt-0">
                <div>
                  <h4 className="font-semibold text-sm md:text-base">{project.developer.company_name}</h4>
                  {project.developer.commercial_name && (
                    <p className="text-xs md:text-sm text-gray-600">{project.developer.commercial_name}</p>
                  )}
                </div>
                {project.developer.description && (
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{project.developer.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-start text-xs md:text-sm">
                    <Mail className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <a 
                      href={`mailto:${project.developer.contact_email}`} 
                      className="text-primary hover:underline break-all"
                    >
                      {project.developer.contact_email}
                    </a>
                  </div>
                  {project.developer.contact_phone && (
                    <div className="flex items-center text-xs md:text-sm">
                      <Phone className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <a 
                        href={`tel:${project.developer.contact_phone}`} 
                        className="text-primary hover:underline"
                      >
                        {project.developer.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Downloads */}
          {(() => {
            const hasBrochure = !!project.brochure_url;
            const hasFloorPlans = project.floor_plans && project.floor_plans.length > 0;
            const showDownloads = hasBrochure || hasFloorPlans;
            
            console.log('🔍 Downloads section check:', {
              hasBrochure,
              hasFloorPlans,
              showDownloads,
              brochure_url: project.brochure_url,
              floor_plans: project.floor_plans
            });
            
            return showDownloads;
          })() && (
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-lg md:text-xl">Descargas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3 pt-0">
                {project.brochure_url && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-xs md:text-sm h-9 md:h-10"
                    onClick={() => {
                      console.log('📄 Downloading brochure:', project.brochure_url);
                      if (project.brochure_url) {
                        window.open(project.brochure_url, '_blank');
                      } else {
                        console.error('📄 Brochure URL is null or undefined');
                        toast({
                          title: 'Error',
                          description: 'No se pudo descargar el brochure. Inténtalo de nuevo.',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    <Download className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                    Descargar Brochure
                  </Button>
                )}
                {project.floor_plans && project.floor_plans.length > 0 && (
                  <div className="space-y-2">
                    {project.floor_plans.map((planUrl, index) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        className="w-full justify-start text-xs md:text-sm h-9 md:h-10"
                        onClick={() => {
                          console.log('📐 Downloading floor plan:', planUrl);
                          if (planUrl) {
                            window.open(planUrl, '_blank');
                          } else {
                            console.error('📐 Floor plan URL is null or undefined at index:', index);
                            toast({
                              title: 'Error',
                              description: 'No se pudo descargar el plano. Inténtalo de nuevo.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        <FileText className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        Plano {index + 1}
                      </Button>
                    ))}
                  </div>
                )}
                {!project.brochure_url && (!project.floor_plans || project.floor_plans.length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay archivos disponibles para descargar
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}