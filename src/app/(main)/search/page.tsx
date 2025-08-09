
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, SearchX } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Property, UserProfile } from '@/types';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { UserCard } from '@/components/users/UserCard';

interface SearchResults {
  properties: Property[];
  users: UserProfile[];
}

function SearchComponent() {
  const { supabase } = useAuth();
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const category = searchParams?.get('category') || 'all';
  const { t } = useTranslation();

  const [results, setResults] = useState<SearchResults>({ properties: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query || !supabase) return;
      setLoading(true);

      const searchResults: SearchResults = { properties: [], users: [] };
      const searchQuery = `%${query}%`;

      // Search properties
      if (category === 'all' || category === 'properties') {
        const { data, error } = await supabase
          .from('properties')
          .select('*, realtor:realtor_id(id, full_name, avatar_url, username)')
          .or(`title.ilike.${searchQuery},location.ilike.${searchQuery},address.ilike.${searchQuery},description.ilike.${searchQuery}`);

        if (data) {
          searchResults.properties = data as unknown as Property[];
        }
        if (error) {
          console.error("Error searching properties:", error);
        }
      }

      // Search users
      if (category === 'all' || category === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.${searchQuery},username.ilike.${searchQuery}`);
        
        if (data) {
          searchResults.users = data as UserProfile[];
        }
         if (error) {
          console.error("Error searching users:", error);
        }
      }

      setResults(searchResults);
      setLoading(false);
    };

    performSearch();
  }, [query, category, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const hasResults = results.properties.length > 0 || results.users.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-3xl font-bold text-primary mb-2">
        {t('search.resultsTitle')}
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        {t('search.resultsFor')} <span className="font-semibold text-primary">{query}</span>
      </p>

      {hasResults ? (
        <div className="space-y-12">
          {results.properties.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary border-b pb-2">Propiedades</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </section>
          )}

          {results.users.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary border-b pb-2">Vendedores</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-xl border border-dashed flex flex-col items-center">
          <SearchX className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-primary">
            {t('search.noUsersFound')}
          </h2>
          <p className="text-muted-foreground">
            No encontramos resultados. Intenta con otra búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <SearchComponent />
        </Suspense>
    )
}
