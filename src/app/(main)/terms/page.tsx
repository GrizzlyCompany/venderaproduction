
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function TermsPage() {
  const { t } = useTranslation();
  const lastUpdatedDate = new Date().toLocaleDateString(t('terms.locale_code'));

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-4">
            {t('terms.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('terms.lastUpdated', { date: lastUpdatedDate })}
          </p>
        </section>

        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert text-muted-foreground">
          <p>{t('terms.subtitle')}</p>

          <h2 className="font-headline text-primary">{t('terms.section1.title')}</h2>
          <p>{t('terms.section1.content')}</p>

          <h2 className="font-headline text-primary">{t('terms.section2.title')}</h2>
          <p>{t('terms.section2.content')}</p>

          <h2 className="font-headline text-primary">{t('terms.section3.title')}</h2>
          <p>{t('terms.section3.content')}</p>

          <h2 className="font-headline text-primary">{t('terms.section4.title')}</h2>
          <p>{t('terms.section4.content')}</p>
          
          <h2 className="font-headline text-primary">{t('terms.section5.title')}</h2>
          <p>{t('terms.section5.content')}</p>
          
          <h2 className="font-headline text-primary">{t('terms.section6.title')}</h2>
          <p>{t('terms.section6.content')}</p>
        </div>
      </div>
    </div>
  );
}
