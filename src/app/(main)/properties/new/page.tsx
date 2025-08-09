
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Upload, Star, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePropertyStore } from "@/hooks/usePropertyStore";
import type { Property } from "@/types";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { SubscriptionModal } from "@/components/layout/SubscriptionModal";
import { userService } from "@/lib/user.service";
import { SellerOnboardingForm } from "@/components/users/SellerOnboardingForm";

const MAX_IMAGES = 5;

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const addProperty = usePropertyStore((state) => state.addProperty);
  const { t } = useTranslation();
  const { user, loading: authLoading, supabase, refreshUser } = useAuth();
  const [isSubModalOpen, setSubModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: 3500000,
    currency: "USD" as Property["currency"],
    location: "Beverly Hills",
    address: "123 Rodeo Drive, Beverly Hills, CA",
    propertyType: "villa" as Property["type"],
    numBedrooms: 4,
    numBathrooms: 3,
    area: 600,
    features: "Swimming Pool, Garage, Ocean view",
    description: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    }
  }, [imagePreviews]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: parseInt(value) || 0 }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({...prev, currency: value as 'USD' | 'DOP'}));
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = imageFiles.length + files.length;

      if (totalImages > MAX_IMAGES) {
        toast({
          title: `Límite de ${MAX_IMAGES} imágenes excedido`,
          description: `Solo puedes subir un total de ${MAX_IMAGES} imágenes.`,
          variant: "destructive",
        });
        return;
      }
      
      setImageFiles(prev => [...prev, ...files]);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  const handleDeleteImage = (index: number) => {
    const previewToDelete = imagePreviews[index];
    URL.revokeObjectURL(previewToDelete);

    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) {
      toast({ title: "Authentication Error", description: "You must be logged in to list a property.", variant: "destructive" });
      return;
    }
    
    if (imageFiles.length === 0) {
      toast({ title: "Se requieren imágenes", description: "Por favor, sube al menos una imagen.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
        let imageUrls: string[] = [];
        if (imageFiles.length > 0) {
            console.log('📸 Uploading property images...');
            const uploadPromises = imageFiles.map(async (file, index) => {
                const formData = new FormData();
                formData.append('file', file);

                // Use the same uploadFile action we use for other files
                const { uploadFile } = await import('@/app/actions');
                const result = await uploadFile('property_images', `${user.id}_${Date.now()}_${index}`, formData);

                if ('error' in result) {
                    throw new Error(result.error);
                }
                
                console.log('✅ Property image uploaded:', result.publicUrl);
                return result.publicUrl;
            });

            imageUrls = await Promise.all(uploadPromises);
            console.log('✅ All property images uploaded successfully');
        }

        const features = formData.features.split(",").map((f) => f.trim()).filter(Boolean);

        const newPropertyData = {
          realtor_id: user.id,
          title: formData.title,
          price: formData.price,
          currency: formData.currency,
          location: formData.location,
          address: formData.address,
          type: formData.propertyType,
          bedrooms: formData.numBedrooms,
          bathrooms: formData.numBathrooms,
          area: formData.area,
          description: formData.description,
          features: features,
          images: imageUrls,
          is_active: true, // Ensure property is active on creation
        };
        
        const { data, error } = await supabase
            .from('properties')
            .insert(newPropertyData)
            .select()
            .single();

        if (error) {
            console.error('Error inserting property:', error);
            throw error;
        }

        // Add the property to the local state (the database insert already happened above)
        const newProperty: Property = {
            ...(data as unknown as Property)
        }

        addProperty(newProperty);

        toast({
          title: t('newProperty.toast.listed.title'),
          description: t('newProperty.toast.listed.description'),
        });

        setFormData({
            title: "",
            price: 3500000,
            currency: "USD",
            location: "Beverly Hills",
            address: "123 Rodeo Drive, Beverly Hills, CA",
            propertyType: "villa",
            numBedrooms: 4,
            numBathrooms: 3,
            area: 600,
            features: "Swimming Pool, Garage, Ocean view",
            description: "",
          });
        setImageFiles([]);
        setImagePreviews([]);
        router.push(`/properties/${newProperty.id}`);

    } catch (error: any) {
        toast({
            title: "Error Listing Property",
            description: error.message || 'An unknown error occurred.',
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  if (authLoading || !user) {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4">Redirecting to login...</p>
      </div>
    );
  }

  if (user.profile?.subscription_status !== 'active') {
      return (
          <>
              <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setSubModalOpen(false)} />
              <div className="container mx-auto px-4 py-12 text-center">
                  <Card className="max-w-md mx-auto p-8 border">
                      <CardHeader className="items-center">
                          <div className="bg-primary/10 p-3 rounded-full mb-4">
                            <Star className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle>Conviértete en Vendedor Pro</CardTitle>
                          <CardDescription>
                              Para listar propiedades en VENDRA, necesitas una suscripción activa.
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className="text-muted-foreground mb-6">
                              Desbloquea la capacidad de publicar tus propiedades y llegar a miles de compradores potenciales.
                          </p>
                          <Button onClick={() => setSubModalOpen(true)}>
                              Actualizar a Pro
                          </Button>
                      </CardContent>
                  </Card>
              </div>
          </>
      );
  }

  if (!user.profile?.is_profile_complete) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-center font-headline text-2xl">Completa tu Perfil de Vendedor</CardTitle>
            <CardDescription className="text-center">
              Necesitamos algunos detalles más antes de que puedas empezar a listar propiedades. Tu información se mantiene segura y solo se utiliza para fines de verificación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SellerOnboardingForm user={user.profile} onFormSubmit={() => {
              console.log('✅ Seller onboarding completed, profile should be updated in context');
              // No need to refresh user since updateUserProfile was already called
            }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              {t('newProperty.title')}
            </CardTitle>
            <CardDescription>
              {t('newProperty.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t('newProperty.form.name')}</Label>
              <Input
                id="title"
                placeholder={t('newProperty.form.name_placeholder')}
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="price">{t('newProperty.form.price')}</Label>
                <div className="flex gap-2">
                    <Input
                        id="price"
                        type="number"
                        placeholder="e.g., 3500000"
                        value={formData.price}
                        onChange={handleNumberInputChange}
                        required
                        className="flex-grow"
                    />
                    <Select
                        value={formData.currency}
                        onValueChange={handleCurrencyChange}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="DOP">DOP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{t('newProperty.form.location')}</Label>
              <Input
                id="location"
                placeholder="e.g., Santo Domingo"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('newProperty.form.address')}</Label>
              <Input
                id="address"
                placeholder="e.g., Av. Winston Churchill #123"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property-type">{t('search.propertyType')}</Label>
              <Select
                onValueChange={(value) => handleSelectChange('propertyType', value)}
                value={formData.propertyType || undefined}
              >
                <SelectTrigger id="property-type">
                  <SelectValue placeholder={t('newProperty.form.type_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">{t('property.types.house')}</SelectItem>
                  <SelectItem value="apartment">{t('property.types.apartment')}</SelectItem>
                  <SelectItem value="condo">{t('property.types.condo')}</SelectItem>
                  <SelectItem value="villa">{t('property.types.villa')}</SelectItem>
                  <SelectItem value="lot">{t('property.types.lot')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numBedrooms">{t('newProperty.form.bedrooms')}</Label>
                <Input
                  id="numBedrooms"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.numBedrooms}
                  onChange={handleNumberInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numBathrooms">{t('newProperty.form.bathrooms')}</Label>
                <Input
                  id="numBathrooms"
                  type="number"
                  placeholder="e.g., 6"
                  value={formData.numBathrooms}
                  onChange={handleNumberInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">{t('newProperty.form.area')}</Label>
              <Input
                id="area"
                type="number"
                placeholder="e.g., 600"
                value={formData.area}
                onChange={handleNumberInputChange}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="features">{t('newProperty.form.features')}</Label>
              <Input
                id="features"
                placeholder={t('newProperty.form.features_placeholder')}
                value={formData.features}
                onChange={handleInputChange}
              />
               <p className="text-xs text-muted-foreground">
                {t('newProperty.form.amenities_note')}
              </p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">{t('property.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('newProperty.form.description_placeholder')}
                className="min-h-[120px]"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2 space-y-4">
               <div>
                  <Label>Fotos ({imageFiles.length} / {MAX_IMAGES})</Label>
                   <p className="text-xs text-muted-foreground">
                        Gestiona las imágenes de tu propiedad. Puedes añadir hasta {MAX_IMAGES} fotos.
                   </p>
                </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group aspect-square">
                      <Image
                        src={src}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="rounded-md object-cover"
                      />
                       <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteImage(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  ))}
                  {imageFiles.length < MAX_IMAGES && (
                         <Label htmlFor="image-upload" className={cn("flex flex-col items-center justify-center w-full h-full aspect-square rounded-md border-2 border-dashed cursor-pointer hover:bg-muted transition-colors", isSubmitting && 'cursor-not-allowed opacity-50')}>
                           <Upload className="h-8 w-8 text-muted-foreground" />
                           <span className="text-xs text-muted-foreground text-center mt-1">Añadir Fotos</span>
                           <Input id="image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} disabled={isSubmitting || imageFiles.length >= MAX_IMAGES} />
                         </Label>
                  )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('newProperty.form.submit')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
