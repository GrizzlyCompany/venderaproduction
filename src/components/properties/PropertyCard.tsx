
'use client';

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types";
import { MapPin, BedDouble, Bath, Ruler } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface PropertyCardProps {
  property: Property;
  isClickable?: boolean;
}

const PropertyCardContent = ({ property }: { property: Property }) => {
    const { t } = useTranslation();

    const priceDisplay = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: property.currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(property.price).replace('US$', 'USD $').replace('DOP', 'DOP $');

    return (
        <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 shadow-lg group">
            <CardHeader className="p-0 relative">
                <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground py-1.5 px-3 rounded-lg">
                    <p className="font-bold text-lg">{priceDisplay}</p>
                </div>
                <Image
                src={property.images?.[0] || '/placeholder-property.svg'}
                alt={t(property.title)}
                width={400}
                height={250}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="house exterior"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-property.svg';
                }}
                />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <Badge variant="secondary">{t(`property.types.${property.type}`)}</Badge>
                <CardTitle className="text-lg font-headline font-semibold mb-2 leading-tight group-hover:text-accent transition-colors mt-2">
                    {t(property.title)}
                </CardTitle>
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.location}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto">
                <div className="flex flex-wrap justify-between w-full text-xs sm:text-sm text-muted-foreground border-t pt-4 gap-2">
                    <div className="flex items-center gap-1">
                        <BedDouble className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">{property.bedrooms} {t('property.beds')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bath className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">{property.bathrooms} {t('property.baths')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Ruler className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">{property.area?.toLocaleString() || 0} {t('property.sqft')}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

export function PropertyCard({ property, isClickable = true }: PropertyCardProps) {
  if (!property?.id) return null;

  if (isClickable) {
    return (
      <Link href={`/properties/${property.id}`} className="block h-full">
        <PropertyCardContent property={property} />
      </Link>
    );
  }

  return <PropertyCardContent property={property} />;
}
