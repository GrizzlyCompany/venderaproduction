
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Award, Heart } from 'lucide-react';
import { UserCard } from '@/components/users/UserCard';
import { mockUsers } from '@/lib/mock-data';
import Image from 'next/image';

export default function AboutPage() {
  const { t } = useTranslation();
  const teamMembers = Object.values(mockUsers).slice(0, 4);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-4">
            {t('about.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-square">
                    <Image 
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxidXlpbmc2MjUyMGElMjBob3VzZXxlbnwwfHx8fDE3NTQ0MTU0NzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Happy couple with new house keys"
                        fill
                        className="rounded-xl object-cover"
                        data-ai-hint="happy couple new house"
                    />
                </div>
                <div>
                    <h2 className="font-headline text-4xl font-bold text-primary mb-4">
                        {t('about.missionTitle')}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                        {t('about.missionText')}
                    </p>
                </div>
            </div>
        </section>

        {/* Why VENDRA Section */}
        <section className="mb-16 bg-card p-10 rounded-xl border">
           <div className="text-center mb-12">
             <h2 className="font-headline text-4xl font-bold text-primary mb-2">
                {t('about.whyTitle')}
             </h2>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('about.whySubtitle')}
             </p>
           </div>
           <div className="grid md:grid-cols-3 gap-8 text-center">
                <div key="why-1" className="flex flex-col items-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Building className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">{t('about.why1_title')}</h3>
                    <p className="text-muted-foreground">{t('about.why1_text')}</p>
                </div>
                <div key="why-2" className="flex flex-col items-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                         <Award className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">{t('about.why2_title')}</h3>
                    <p className="text-muted-foreground">{t('about.why2_text')}</p>
                </div>
                <div key="why-3" className="flex flex-col items-center">
                     <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">{t('about.why3_title')}</h3>
                    <p className="text-muted-foreground">{t('about.why3_text')}</p>
                </div>
           </div>
        </section>

        {/* Team Section */}
        <section className="text-center">
          <h2 className="font-headline text-4xl font-bold text-primary mb-2">
            {t('about.teamTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('about.teamSubtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {teamMembers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
