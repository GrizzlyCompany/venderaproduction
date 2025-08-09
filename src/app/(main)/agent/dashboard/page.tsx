'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Home,
  Plus,
  Eye,
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Settings,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/auth/RoleGuard';
import type { Property } from '@/types';

// Mock data - will be replaced with real API calls
const mockProperties: Property[] = [
  {
    id: '1',
    realtor_id: 'agent1',
    title: 'Apartamento en Piantini',
    description: 'Hermoso apartamento de 3 habitaciones',
    price: 250000,
    currency: 'USD',
    location: 'Piantini, Santo Domingo',
    address: 'Av. Abraham Lincoln',
    type: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    features: ['Balcón', 'Aire acondicionado', 'Parqueo'],
    images: ['https://example.com/image1.jpg'],
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    realtor_id: 'agent1',
    title: 'Casa en Los Cacicazgos',
    description: 'Casa familiar con jardín',
    price: 450000,
    currency: 'USD',
    location: 'Los Cacicazgos, Santo Domingo',
    address: 'Calle Principal',
    type: 'house',
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    features: ['Jardín', 'Garaje', 'Terraza'],
    images: ['https://example.com/image2.jpg'],
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
  },
];

const mockStats = {
  totalProperties: 12,
  activeProperties: 10,
  totalViews: 1250,
  totalInquiries: 45,
  monthlyRevenue: 15000,
  pendingAppointments: 8,
};

function AgentDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to load agent data
    const loadAgentData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProperties(mockProperties);
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading agent data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadAgentData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-pulse" />
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Dashboard del Agente
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button asChild>
            <Link href="/properties/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Propiedad
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/agent/profile">
              <Settings className="h-4 w-4 mr-2" />
              Perfil
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 md:mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Propiedades</p>
                <p className="text-2xl font-bold">{stats.totalProperties}</p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold">{stats.activeProperties}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vistas</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas</p>
                <p className="text-2xl font-bold">{stats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Citas</p>
                <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">Mis Propiedades</TabsTrigger>
          <TabsTrigger value="inquiries">Consultas</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Mis Propiedades</h2>
            <Button asChild>
              <Link href="/properties/new">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Propiedad
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  {property.images && property.images[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Badge 
                    className="absolute top-2 right-2" 
                    variant={property.is_active ? "default" : "secondary"}
                  >
                    {property.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {property.description}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-green-600">
                      ${property.price.toLocaleString()} {property.currency}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{property.location}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{property.bedrooms} hab</span>
                    <span>{property.bathrooms} baños</span>
                    <span>{property.area} m²</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {properties.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes propiedades aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Comienza agregando tu primera propiedad para empezar a vender.
                </p>
                <Button asChild>
                  <Link href="/properties/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primera Propiedad
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-6">
          <h2 className="text-xl font-semibold">Consultas Recientes</h2>
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay consultas nuevas
              </h3>
              <p className="text-gray-600">
                Las consultas de tus propiedades aparecerán aquí.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold">Analíticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Vistas totales</span>
                    <span className="font-semibold">{stats.totalViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consultas</span>
                    <span className="font-semibold">{stats.totalInquiries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasa de conversión</span>
                    <span className="font-semibold">
                      {((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Propiedades Más Vistas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {properties.slice(0, 3).map((property, index) => (
                    <div key={property.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{property.title}</p>
                        <p className="text-xs text-gray-500">{property.location}</p>
                      </div>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AgentDashboard() {
  return (
    <RoleGuard allowedRoles={['agent']}>
      <AgentDashboardContent />
    </RoleGuard>
  );
}