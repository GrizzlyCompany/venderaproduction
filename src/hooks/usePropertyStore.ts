
"use client";

import { create } from "zustand";
import type { Property } from "@/types";

interface PropertyState {
  properties: Property[];
  isLoading: boolean;
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  deleteProperty: (propertyId: string) => void;
  updateProperty: (propertyId: string, updatedData: Partial<Property>) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
  setProperties: (properties) => set({ properties, isLoading: false }),
  addProperty: (property) => {
    set((state) => ({
      properties: [property, ...state.properties],
    }));
  },
  deleteProperty: (propertyId) => {
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== propertyId),
    }));
  },
  updateProperty: (propertyId, updatedData) => {
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === propertyId ? { ...p, ...updatedData } : p
      ),
    }));
  },
}));
