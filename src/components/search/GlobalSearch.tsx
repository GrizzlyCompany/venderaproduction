
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function GlobalSearch() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Always search 'all' categories now
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&category=all`);
    }
  };

  return (
    <div className="relative flex w-full max-w-sm md:max-w-lg items-center">
      <div className="relative w-full">
        <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        <Input
          placeholder={t('search.placeholder.properties')}
          className="pl-8 md:pl-10 h-8 md:h-10 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
    </div>
  );
}
