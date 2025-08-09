
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { MessageSquare, Search, Home, ArrowRight } from 'lucide-react';
import { TestimonialCard, type Testimonial } from '@/components/layout/TestimonialCard';
import { mockUsers, properties as mockProperties } from '@/lib/mock-data';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import React from 'react';


export default function LandingPage() {
  const { t } = useTranslation();
  const featuredProperties = mockProperties.slice(0, 6);
  
  const testimonials: Testimonial[] = [
    {
      quote: t('landing.testimonials.quote1'),
      name: 'Sarah & Tom',
      role: t('landing.testimonials.role1'),
      avatar: 'https://images.unsplash.com/photo-1542327897-4141c5336f2c?q=80&w=2574&auto=format&fit=crop',
    },
    {
      quote: t('landing.testimonials.quote2'),
      name: 'Jane Doe',
      role: t('landing.testimonials.role2'),
      avatar: mockUsers['jane-doe-realtor'].avatar_url || 'https://placehold.co/100x100.png',
    },
     {
      quote: t('landing.testimonials.quote3'),
      name: 'Michael Rodriguez',
      role: t('landing.testimonials.role3'),
      avatar: 'https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=2574&auto=format&fit=crop',
    }
  ];
  
  const features = [
    {
      icon: Search,
      title: t('landing.features.feature1_title'),
      description: t('landing.features.feature1_desc'),
    },
    {
      icon: Home,
      title: t('landing.features.feature2_title'),
      description: t('landing.features.feature2_desc'),
    },
    {
      icon: MessageSquare,
      title: t('landing.features.feature3_title'),
      description: t('landing.features.feature3_desc'),
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-4rem)]">
                 {/* Text Column */}
                <div className="text-center lg:text-left py-12 sm:py-16 lg:py-0">
                    <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary mb-4 sm:mb-6 leading-tight">
                        {t('landing.hero.title')}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 sm:mb-10">
                        {t('landing.hero.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
                        <Button size="lg" asChild className="w-full sm:w-auto">
                            <Link href="/signup">{t('landing.hero.cta_main')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                        <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
                            <Link href="/about">{t('landing.hero.cta_secondary')}</Link>
                        </Button>
                    </div>
                </div>
                {/* Image Column */}
                <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full lg:block rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                   <Image
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop"
                        alt="Modern house kitchen"
                        fill
                        className="object-cover"
                        data-ai-hint="modern kitchen"
                        priority
                   />
                </div>
            </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-primary text-center mb-2">
            {t('landing.featured.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
             {t('landing.featured.subtitle')}
          </p>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 3000,
                    }),
                ]}
                className="w-full"
                >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {featuredProperties.map((property) => (
                    <CarouselItem key={property.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                        <PropertyCard property={property} isClickable={false} />
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-card py-12 sm:py-16 md:py-24 border-t border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-8 sm:mb-12">
             <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
                {t('about.whyTitle')}
             </h2>
             <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('about.whySubtitle')}
             </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 text-center">
                {features.map((feature, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                            <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-primary">{feature.title}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                    </div>
                ))}
           </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-primary text-center mb-2">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
             {t('landing.testimonials.subtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="bg-primary/5 py-12 sm:py-16 md:py-24 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
                {t('landing.cta.title')}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
                {t('landing.cta.subtitle')}
            </p>
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/signup">{t('signup.button')}</Link>
            </Button>
        </div>
      </section>
    </div>
  );
}
