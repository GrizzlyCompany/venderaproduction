
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import type { Property } from '@/types';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { usePropertyStore } from '@/hooks/usePropertyStore';

const MAX_IMAGES = 5;

interface EditPropertyFormProps {
    property: Property;
}

export function EditPropertyForm({ property }: EditPropertyFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { updateProperty: updatePropertyInStore } = usePropertyStore();
  const { t } = useTranslation();
  const { user, loading: authLoading, supabase } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: property.title,
    price: property.price,
    currency: (property.currency || 'USD') as 'USD' | 'DOP',
    location: property.location,
    address: property.address,
    propertyType: property.type,
    numBedrooms: property.bedrooms,
    numBathrooms: property.bathrooms,
    area: property.area,
    features: property.features?.join(', ') || '',
    description: property.description,
  });
  
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>(property.images || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const totalImageCount = currentImageUrls.length + imageFiles.length;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
     // Security check: ensure the logged-in user is the owner of the property
    if (!authLoading && user && property && user.id !== property.realtor_id) {
        toast({ title: 'No autorizado', description: 'No tienes permiso para editar esta propiedad.', variant: 'destructive' });
        router.push(`/properties/${property.id}`);
    }
  }, [user, authLoading, router, property, toast]);
  
  // Cleanup object URLs
  useEffect(() => {
    return () => {
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    }
  }, [imagePreviews]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: parseInt(value) || 0 }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

   const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({...prev, currency: value as 'USD' | 'DOP'}));
  }
  
   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = MAX_IMAGES - totalImageCount;
      const filesToUpload = files.slice(0, remainingSlots);

      if(files.length > remainingSlots) {
        toast({
            title: `Se superó el límite de ${MAX_IMAGES} imágenes`,
            description: `Solo se agregarán las primeras ${remainingSlots} imágenes.`,
            variant: 'destructive'
        });
      }
      
      setImageFiles(prev => [...prev, ...filesToUpload]);

      const newPreviews = filesToUpload.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleDeleteExistingImage = (imageUrl: string) => {
    setCurrentImageUrls(prev => prev.filter(url => url !== imageUrl));
    setImagesToDelete(prev => [...prev, imageUrl]);
  };
  
  const handleDeleteNewImage = (index: number) => {
    const previewToDelete = imagePreviews[index];
    URL.revokeObjectURL(previewToDelete);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property || !supabase) return;

    if (totalImageCount === 0) {
      toast({ title: "Se requieren imágenes", description: "Por favor, añade al menos una imagen para la propiedad.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
        // 1. Delete images marked for deletion from Supabase Storage
        if (imagesToDelete.length > 0) {
            const filePaths = imagesToDelete.map(url => {
                const parts = url.split('/');
                return `${user.id}/${parts[parts.length - 1]}`;
            });
            const { error: deleteError } = await supabase.storage.from('property_images').remove(filePaths);
            if (deleteError) throw deleteError;
        }

        // 2. Upload new images
        let newImageUrls: string[] = [];
        if (imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('property_images').upload(filePath, file);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('property_images').getPublicUrl(filePath);
                return publicUrl;
            });
            newImageUrls = await Promise.all(uploadPromises);
        }

        // 3. Combine image lists and update property data in DB
        const finalImageUrls = [...currentImageUrls, ...newImageUrls];

        const updatedPropertyData = {
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
          features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
          images: finalImageUrls,
        };

        const { data, error } = await supabase
          .from('properties')
          .update(updatedPropertyData)
          .eq('id', property.id)
          .select()
          .single();

        if (error) throw error;
        
        // Ensure realtor data is preserved from the original property object
        const fullyUpdatedProperty: Property = { ...property, ...(data  as unknown as Property) };
        updatePropertyInStore(fullyUpdatedProperty.id, fullyUpdatedProperty);

        toast({
          title: 'Propiedad actualizada',
          description: 'Los cambios han sido guardados.',
        });
        
        router.push(`/properties/${property.id}`);
        router.refresh();

    } catch (error: any) {
        console.error('Error updating property:', error);
        toast({
            title: 'Error al actualizar',
            description: error.message || "No se pudo guardar la propiedad.",
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Editar Propiedad
            </CardTitle>
            <CardDescription>
              Actualiza los detalles de tu propiedad a continuación.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">{t('newProperty.form.name')}</Label>
              <Input
                id="title"
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
                value={formData.location || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('newProperty.form.address')}</Label>
              <Input
                id="address"
                value={formData.address || ''}
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
                  value={formData.numBedrooms || ''}
                  onChange={handleNumberInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numBathrooms">{t('newProperty.form.bathrooms')}</Label>
                <Input
                  id="numBathrooms"
                  type="number"
                  value={formData.numBathrooms || ''}
                  onChange={handleNumberInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">{t('newProperty.form.area')}</Label>
              <Input
                id="area"
                type="number"
                value={formData.area || ''}
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
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">{t('property.description')}</Label>
              <Textarea
                id="description"
                className="min-h-[120px]"
                value={formData.description || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2 space-y-4">
                <div>
                  <Label>Fotos ({totalImageCount} / {MAX_IMAGES})</Label>
                   <p className="text-xs text-muted-foreground">
                        Gestiona las imágenes de tu propiedad. Puedes añadir hasta {MAX_IMAGES} fotos.
                   </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {currentImageUrls.map((src) => (
                    <div key={src} className="relative group aspect-square">
                      <Image
                        src={src}
                        alt={`Property image`}
                        fill
                        className="rounded-md object-cover"
                      />
                       <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteExistingImage(src)}
                        >
                            <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  ))}
                  {imagePreviews.map((src, index) => (
                     <div key={src} className="relative group aspect-square">
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
                          onClick={() => handleDeleteNewImage(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   ))}
                    {totalImageCount < MAX_IMAGES && (
                         <Label htmlFor="image-upload" className={cn("flex flex-col items-center justify-center w-full h-full aspect-square rounded-md border-2 border-dashed cursor-pointer hover:bg-muted transition-colors", isSubmitting && 'cursor-not-allowed opacity-50')}>
                           <Upload className="h-8 w-8 text-muted-foreground" />
                           <span className="text-xs text-muted-foreground text-center mt-1">Añadir Fotos</span>
                           <Input id="image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} disabled={isSubmitting} />
                         </Label>
                    )}
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
