
'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BedDouble, Bath, Ruler, MapPin, Building, MessageSquare, Loader2, User } from 'lucide-react';
import { SimilarProperties } from '@/components/properties/SimilarProperties';
import { FavoriteButton } from '@/components/properties/FavoriteButton';
import { Button } from '@/components/ui/button';
import type { Property } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { usePropertyStore } from '@/hooks/usePropertyStore';
import { useChatStore } from '@/components/chat/use-chat-store';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { SubscriptionModal } from '@/components/layout/SubscriptionModal';


export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { user, supabase } = useAuth();
  const { properties } = usePropertyStore();
  const [property, setProperty] = useState<Property | null | undefined>(undefined);
  const { t } = useTranslation();
  const { handleStartConversation } = useChatStore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubModalOpen, setSubModalOpen] = useState(false);

  useEffect(() => {
    const findProperty = async () => {
      if (!id || !supabase) return;
      
      // Always fetch from database to ensure we have complete data including realtor info
      console.log('🔍 Fetching property details from database...');
      
      const { data, error } = await supabase
        .from('properties')
        .select(`*, realtor:realtor_id(id, full_name, avatar_url, username)`)
        .eq('id', id)
        .single();
      
      if (error || !data) {
        console.error('❌ Error fetching property:', error);
        setProperty(null); // Property not found
      } else {
        console.log('✅ Property fetched successfully:', data);
        setProperty(data as unknown as Property);
      }
    };
    findProperty();
  }, [id, properties, supabase]);

  const onStartConversation = async () => {
    if (!user) {
      toast({ title: 'Debes iniciar sesión', description: 'Por favor, inicia sesión para contactar a un vendedor.', variant: 'destructive' });
      router.push('/login');
      return;
    }
    if (user.profile?.subscription_status !== 'active') {
      setSubModalOpen(true);
      return;
    }
    if (!property || !property.realtor) {
      toast({ title: 'Error', description: 'No se pudo obtener la información del vendedor.', variant: 'destructive' });
      return;
    }
    
    const conversationId = await handleStartConversation(property.realtor, user, supabase);
    if (conversationId) {
        router.push('/messages');
    } else {
        toast({ title: 'Error', description: 'No se pudo iniciar la conversación.', variant: 'destructive' });
    }
  };


  if (property === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    notFound();
  }
  
  const priceDisplay = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: property.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.price).replace('US$', 'USD $').replace('DOP', 'DOP $');


  return (
    <>
    <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setSubModalOpen(false)} />
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Carousel className="w-full">
                <CarouselContent>
                  {property.images?.map((src, index) => (
                    <CarouselItem key={index}>
                      <Image
                        src={src}
                        alt={`${t(property.title)} image ${index + 1}`}
                        width={800}
                        height={500}
                        className="w-full h-[500px] object-cover"
                        data-ai-hint="house interior"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-property.svg';
                        }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="ml-16" />
                <CarouselNext className="mr-16" />
              </Carousel>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">
                {t(`property.types.${property.type}`)}
              </Badge>
              <CardTitle className="font-headline text-3xl font-bold text-primary">
                {t(property.title)}
              </CardTitle>
              <p className="flex items-center text-muted-foreground pt-2">
                <MapPin className="w-4 h-4 mr-2" />
                {property.address}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold text-accent">
                  {priceDisplay}
                </p>
                <FavoriteButton property={property} className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>
          
           {property.realtor && (
             <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">
                    {t('property.realtorInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href={`/profile/${property.realtor.id}`}>
                    <div className="flex items-center gap-4 hover:bg-muted p-2 rounded-lg transition-colors">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={property.realtor.avatar_url || undefined}
                          alt={property.realtor.full_name || ''}
                          data-ai-hint="person face"
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <AvatarFallback>
                          {property.realtor.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                          <p className="font-semibold text-lg hover:underline">
                            {property.realtor.full_name}
                          </p>
                        <p className="text-sm text-muted-foreground">
                          {t('property.certifiedRealtor')}
                        </p>
                      </div>
                    </div>
                  </Link>
                   <Button asChild className="w-full">
                      <Link href={`/profile/${property.realtor.id}`}>
                        <User className="mr-2"/> Ver Perfil del Vendedor
                      </Link>
                  </Button>
                </CardContent>
             </Card>
           )}
        </div>
      </div>
      
      <Card>
      <CardHeader>
          <CardTitle className="font-headline text-2xl">
          {t('property.details')}
          </CardTitle>
      </CardHeader>
      <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
          <div className="bg-secondary/50 p-4 rounded-lg">
              <BedDouble className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="font-semibold">{property.bedrooms} {t('property.bedrooms')}</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg">
              <Bath className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="font-semibold">{property.bathrooms} {t('property.bathrooms')}</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg">
              <Ruler className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="font-semibold">
              {property.area?.toLocaleString() || 0} m²
              </p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg">
              <Building className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="font-semibold">{t(`property.types.${property.type}`)}</p>
          </div>
          </div>

          <Separator className="my-6" />

          <div className="grid md:grid-cols-2 gap-8">
              <div>
                  <h3 className="font-headline text-xl font-semibold mb-4">
                      {t('property.description')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                      {t(property.description || '')}
                  </p>
              </div>
              <div>
                  <h3 className="font-headline text-xl font-semibold mb-4">
                      {t('property.features')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {property.features?.map((feature, index) => (
                      <Badge key={index} variant="outline">
                          {feature}
                      </Badge>
                      ))}
                  </div>
              </div>
          </div>
      </CardContent>
      </Card>

      <SimilarProperties currentPropertyId={property.id} />
    </div>
    </>
  );
}
