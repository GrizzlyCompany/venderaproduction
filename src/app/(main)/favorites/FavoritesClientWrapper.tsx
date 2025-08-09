'use client';

import { useEffect } from 'react';
import { useFavoritesStore } from '@/hooks/useFavoritesStore';

interface FavoritesClientWrapperProps {
  userId: string;
}

export default function FavoritesClientWrapper({ userId }: FavoritesClientWrapperProps) {
  const { isHydrated } = useFavoritesStore();

  useEffect(() => {
    // El store se hidrata automáticamente gracias al middleware persist
    // Solo necesitamos esperar a que se complete la hidratación
    if (isHydrated) {
      console.log('Favorites store hydrated for user:', userId);
    }
  }, [userId, isHydrated]);

  // Este componente no renderiza nada visible,
  // solo maneja la lógica del cliente
  return null;
}