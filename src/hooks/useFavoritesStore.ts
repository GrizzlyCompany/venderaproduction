
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Property } from "@/types";
import { toast } from "./use-toast";

interface FavoritesState {
  favorites: Property[];
  isHydrated: boolean;
  addFavorite: (property: Property) => void;
  removeFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isHydrated: false,
      addFavorite: (property) => {
        if (get().favorites.find(p => p.id === property.id)) {
          return;
        }
        set(state => ({ favorites: [...state.favorites, property] }));
        toast({
          title: "Added to Favorites",
          description: `"${property.title}" has been saved.`,
        });
      },
      removeFavorite: (propertyId) => {
        const property = get().favorites.find(p => p.id === propertyId);
        if (!property) {
          return;
        }
        set(state => ({
          favorites: state.favorites.filter((p) => p.id !== propertyId),
        }));
        toast({
          title: "Removed from Favorites",
          description: `"${property.title}" has been removed.`,
        });
      },
      isFavorite: (propertyId) => {
        return get().favorites.some((p) => p.id === propertyId);
      },
    }),
    {
      name: 'vendra-favorites-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: () => (state) => {
          if (state) state.isHydrated = true;
      }
    }
  )
);
