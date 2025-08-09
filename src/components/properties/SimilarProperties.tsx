
'use client';

import type { Property } from "@/types";
import { PropertyCard } from "./PropertyCard";
import { usePropertyStore } from "@/hooks/usePropertyStore";
import { useTranslation } from "@/hooks/useTranslation";

interface SimilarPropertiesProps {
  currentPropertyId: string;
}

export function SimilarProperties({ currentPropertyId }: SimilarPropertiesProps) {
  const properties = usePropertyStore((state) => state.properties);
  const { t } = useTranslation();
  // In a real app, this would use the GenAI flow `getSimilarPropertySuggestions`
  // For now, we'll just show a few other properties from the mock data.
  const similar = properties
    .filter((p) => p.id !== currentPropertyId)
    .slice(0, 3);

  return (
    <div className="mt-12">
      <h2 className="font-headline text-3xl font-semibold mb-6 text-primary">
        {t('property.similar')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {similar.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
