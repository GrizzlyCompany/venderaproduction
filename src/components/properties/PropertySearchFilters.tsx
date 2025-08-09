
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building, DollarSign, Search, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Property } from "@/types";

interface PropertySearchFiltersProps {
  allProperties: Property[];
  onSearch: (results: Property[]) => void;
}

export function PropertySearchFilters({
  allProperties,
  onSearch,
}: PropertySearchFiltersProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const locations = useMemo(() => {
    const locationSet = new Set(allProperties.map(p => p.location));
    return Array.from(locationSet);
  }, [allProperties]);

  const handleSearch = () => {
    const filters = {
      location: location === "all" ? "" : location,
      type: type === "all" ? "" : type,
      minPrice: minPrice ? parseInt(minPrice, 10) : 0,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : Infinity,
    };

    const results = allProperties.filter(property => {
      const matchesLocation = !filters.location || property.location === filters.location;
      const matchesType = !filters.type || property.type === filters.type;
      const matchesPrice = property.price >= filters.minPrice && property.price <= filters.maxPrice;
      
      return matchesLocation && matchesType && matchesPrice;
    });

    onSearch(results);
  };
  
  const handleClear = () => {
    setLocation("all");
    setType("all");
    setMinPrice("");
    setMaxPrice("");
    onSearch(allProperties);
  };

  const allPropertyTypes = ['house', 'apartment', 'condo', 'villa', 'lot'];

  return (
    <Card className="max-w-5xl mx-auto shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          <div className="sm:col-span-1 lg:col-span-1">
             <label htmlFor="location-select" className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('search.location')}
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location-select" className="w-full h-9 sm:h-10">
                <SelectValue placeholder={t('search.location')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('search.allLocations')}</SelectItem>
                {locations.filter(loc => loc !== null).map((loc) => (
                  <SelectItem key={loc} value={loc!}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-1 lg:col-span-1">
            <label htmlFor="type-select" className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('search.propertyType')}
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type-select" className="w-full h-9 sm:h-10">
                <SelectValue placeholder={t('search.propertyType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('search.allTypes')}</SelectItem>
                {allPropertyTypes.map((pt) => (
                  <SelectItem key={pt} value={pt}>
                    {t(`property.types.${pt}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-2">
            <div>
                 <label htmlFor="min-price" className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Precio Mín.</span>
                    <span className="sm:hidden">Mín.</span>
                </label>
                <Input
                    id="min-price"
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9 sm:h-10"
                />
            </div>
             <div>
                 <label htmlFor="max-price" className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Precio Máx.</span>
                    <span className="sm:hidden">Máx.</span>
                </label>
                <Input
                    id="max-price"
                    type="number"
                    placeholder="Cualquiera"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9 sm:h-10"
                />
            </div>
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1 flex gap-2">
            <Button onClick={handleSearch} className="flex-1 h-9 sm:h-10" size="sm">
                <Search className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('search.button')}</span>
                <span className="sm:hidden">Buscar</span>
            </Button>
             <Button onClick={handleClear} variant="ghost" size="sm" className="h-9 sm:h-10 px-2 sm:px-3" aria-label="Limpiar filtros">
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
