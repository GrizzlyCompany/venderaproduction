
'use client';

import { PropertyCard } from '@/components/properties/PropertyCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFavoritesStore } from '@/hooks/useFavoritesStore';
import { useEffect, useState } from 'react';

export default function FavoritesPage() {
  const { favorites, isHydrated } = useFavoritesStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isHydrated) {
      setIsLoading(false);
    }
  }, [isHydrated]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold text-primary mb-2">
            Mis Favoritos
          </h1>
          <p className="text-lg text-muted-foreground">
            Propiedades que has guardado como favoritas
          </p>
        </div>
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary mb-2">
          Mis Favoritos
        </h1>
        <p className="text-lg text-muted-foreground">
          Propiedades que has guardado como favoritas
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-xl border border-dashed flex flex-col items-center">
          <Heart className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            No tienes favoritos aún
          </h2>
          <p className="text-muted-foreground mb-6">
            Explora propiedades y guarda las que más te gusten
          </p>
          <Button asChild>
            <Link href="/">Explorar Propiedades</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
