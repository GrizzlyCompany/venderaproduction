
"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/hooks/useFavoritesStore";
import type { Property } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";

interface FavoriteButtonProps {
  property: Property;
  className?: string;
}

export function FavoriteButton({ property, className }: FavoriteButtonProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { user } = useAuth();
  const isFavorited = isFavorite(property.id);
  const { t } = useTranslation();

  const toggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      removeFavorite(property.id);
    } else {
      addFavorite(property);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("rounded-full hover:bg-red-100/50 dark:hover:bg-red-900/20", className)}
      onClick={toggleFavorite}
      aria-label={isFavorited ? t('favorites.remove') : t('favorites.add')}
    >
      <Heart className={cn(
        "w-5 h-5 transition-colors",
        isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
      )} />
    </Button>
  );
}
