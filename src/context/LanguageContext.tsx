
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import Cookies from 'js-cookie';

type Locale = 'en' | 'es';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Record<string, any>;
}

const translations = { en, es };

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const savedLocale = Cookies.get('locale');
    return (savedLocale === 'en' || savedLocale === 'es') ? savedLocale : 'es';
  });
  
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    Cookies.set('locale', newLocale, { expires: 365 });
  };
  
  const value = {
    locale,
    setLocale,
    translations: translations[locale]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
