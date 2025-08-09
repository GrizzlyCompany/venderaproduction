
import 'server-only'
import { cookies } from 'next/headers'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const translations = {
  en: en,
  es: es,
}

type Locale = keyof typeof translations

function getNestedTranslation(obj: any, key: string): string | undefined {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj)
}

export const getTranslations = async () => {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value || 'es') as Locale
  const dictionary = translations[locale]

  return (key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(dictionary, key) || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }
}
