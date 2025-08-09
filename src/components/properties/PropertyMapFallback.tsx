'use client';

import { Property } from '@/types';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  selectedProperty?: Property | null;
  className?: string;
}

export function PropertyMapFallback({ 
  properties, 
  onPropertySelect, 
  selectedProperty,
  className = "h-96 w-full rounded-lg overflow-hidden"
}: PropertyMapProps) {
  // Since coordinates are not available in the current schema, show all properties
  const propertiesWithCoords = properties;

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`${className} bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600`}>
      <MapPin className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
        Mapa no disponible temporalmente
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
        Se encontraron {propertiesWithCoords.length} propiedades
      </p>
      
      {propertiesWithCoords.length > 0 && (
        <div className="max-w-md w-full max-h-32 overflow-y-auto">
          <div className="space-y-2">
            {propertiesWithCoords.slice(0, 3).map((property) => (
              <div 
                key={property.id}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  selectedProperty?.id === property.id 
                    ? 'bg-blue-100 dark:bg-blue-900' 
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => onPropertySelect?.(property)}
              >
                <div className="text-xs font-medium truncate">{property.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatPrice(property.price, property.currency)} • {property.location}
                </div>
              </div>
            ))}
            {propertiesWithCoords.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{propertiesWithCoords.length - 3} propiedades más
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}