'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Calendar, DollarSign, Search, Filter, Star, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import type { DevelopmentProject } from '@/types';
import { developerService } from '@/lib/developer.service';

// Mock data for now - will be replaced with real API calls
const mockProjects: DevelopmentProject[] = [
  {
    id: '1',
    developer_id: 'dev1',
    name: 'Torres del Caribe',
    description: 'Moderno complejo residencial con vista al mar y amenidades de lujo.',
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
    amenities: ['Piscina', 'Gimnasio', 'Área de juegos', 'Seguridad 24/7'],
    features: ['Balcón', 'Aire acondicionado', 'Cocina equipada'],
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
    floor_plans: [],
    brochure_url: null,
    is_featured: true,
    is_active: true,
    view_count: 1247,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    developer_id: 'dev2',
    name: 'Residencial Los Jardines',
    description: 'Casas familiares en un entorno tranquilo y seguro.',
    status: 'presale',
    project_type: 'houses',
    location: 'Santiago, Santiago',
    address: 'Sector Los Jardines, Santiago',
    coordinates: { lat: 19.4515, lng: -70.6970 },
    estimated_delivery: '2025-06-01',
    price_range_min: 120000,
    price_range_max: 280000,
    currency: 'USD',
    total_units: 45,
    available_units: 45,
    amenities: ['Parque', 'Área de BBQ', 'Cancha deportiva'],
    features: ['Jardín privado', 'Garaje', 'Terraza'],
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    floor_plans: [],
    brochure_url: null,
    is_featured: false,
    is_active: true,
    view_count: 892,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

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

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<DevelopmentProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<DevelopmentProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load projects from database
  const loadProjects = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      console.log('🔄 Loading projects from database...');
      const projectsData = await developerService.getAllActiveProjects();
      console.log('📊 Projects loaded from database:', projectsData);
      
      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);
        setFilteredProjects(projectsData);
        console.log('✅ Using real project data');
      } else {
        console.log('⚠️ No real projects found, using mock data');
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
      }
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      // Fallback to mock data if API fails
      console.log('🔄 Falling back to mock data');
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(project => project.project_type === typeFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, typeFilter]);

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
    });
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Proyectos en Desarrollo</h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Descubre los nuevos proyectos inmobiliarios en construcción
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => loadProjects(true)} 
              disabled={refreshing}
              variant="outline"
              className="w-full md:w-auto"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            {user && (
              <Link href="/developer/register">
                <Button className="w-full md:w-auto">
                  <Building2 className="mr-2 h-4 w-4" />
                  Registrar Empresa
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="planning">En Planos</SelectItem>
              <SelectItem value="construction">En Construcción</SelectItem>
              <SelectItem value="presale">Preventa</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="apartments">Apartamentos</SelectItem>
              <SelectItem value="houses">Casas</SelectItem>
              <SelectItem value="commercial">Comercial</SelectItem>
              <SelectItem value="mixed">Mixto</SelectItem>
              <SelectItem value="lots">Solares</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              {project.images && project.images[0] && (
                <Image
                  src={project.images[0]}
                  alt={project.name}
                  width={400}
                  height={240}
                  className="w-full h-40 md:h-48 object-cover"
                />
              )}
              {project.is_featured && (
                <Badge className="absolute top-2 left-2 bg-yellow-500 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Destacado
                </Badge>
              )}
              <Badge 
                className={`absolute top-2 right-2 text-xs ${statusColors[project.status]}`}
              >
                {statusLabels[project.status]}
              </Badge>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg line-clamp-2">{project.name}</CardTitle>
              <div className="flex items-center text-xs md:text-sm text-gray-600">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{project.location}</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">
                {project.description}
              </p>
              
              <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium text-right">{typeLabels[project.project_type]}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-medium text-right">
                    {formatPrice(project.price_range_min, project.price_range_max, project.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Entrega:</span>
                  <span className="font-medium text-right">{formatDate(project.estimated_delivery)}</span>
                </div>
                {project.available_units && project.total_units && (
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Disponibles:</span>
                    <span className="font-medium text-right">
                      {project.available_units} de {project.total_units}
                    </span>
                  </div>
                )}
              </div>
              
              <Link href={`/projects/${project.id}`}>
                <Button className="w-full h-8 md:h-9 text-xs md:text-sm">
                  Ver Detalles
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron proyectos
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}