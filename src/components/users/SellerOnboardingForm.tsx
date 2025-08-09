
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { userService } from '@/lib/user.service';
import type { UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { compressImage, validateImageFile, formatFileSize } from '@/lib/image-utils';

interface SellerOnboardingFormProps {
  user: UserProfile;
  onFormSubmit: () => void;
}

const formSchema = z.object({
  full_name: z.string().min(3, { message: 'El nombre completo es requerido.' }),
  national_id: z.string().min(11, { message: 'La cédula debe tener 11 dígitos.' }).regex(/^\d{3}-\d{7}-\d$/, { message: 'Formato de cédula inválido (000-0000000-0).'}),
  birth_date: z.date({ required_error: 'La fecha de nacimiento es requerida.' }),
  nationality: z.string().min(2, { message: 'La nacionalidad es requerida.' }),
  phone_number: z.string().min(10, { message: 'El número de teléfono es requerido.' }),
  full_address: z.string().min(10, { message: 'La dirección completa es requerida.' }),
});

export function SellerOnboardingForm({ user, onFormSubmit }: SellerOnboardingFormProps) {
  const { toast } = useToast();
  const { updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(user.id_front_url || null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(user.id_back_url || null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user.full_name || '',
      national_id: user.national_id || '',
      birth_date: user.birth_date ? new Date(user.birth_date) : undefined,
      nationality: user.nationality || '',
      phone_number: user.phone_number || '',
      full_address: user.full_address || '',
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    if (e.target.files && e.target.files.length > 0) {
      const originalFile = e.target.files[0];
      
      // Validate the file
      const validation = validateImageFile(originalFile, 10);
      if (!validation.isValid) {
        toast({
          title: 'Archivo inválido',
          description: validation.error,
          variant: 'destructive'
        });
        return;
      }

      try {
        // Show loading state
        toast({
          title: 'Procesando imagen...',
          description: `Comprimiendo ${originalFile.name} (${formatFileSize(originalFile.size)})`,
        });

        // Compress the image if it's larger than 2MB
        let processedFile = originalFile;
        if (originalFile.size > 2 * 1024 * 1024) {
          processedFile = await compressImage(originalFile, 1200, 1200, 0.8);
          console.log(`Image compressed: ${formatFileSize(originalFile.size)} → ${formatFileSize(processedFile.size)}`);
        }

        if (type === 'front') {
          setIdFrontFile(processedFile);
          setIdFrontPreview(URL.createObjectURL(processedFile));
        } else {
          setIdBackFile(processedFile);
          setIdBackPreview(URL.createObjectURL(processedFile));
        }

        toast({
          title: 'Imagen cargada',
          description: `${processedFile.name} (${formatFileSize(processedFile.size)}) lista para subir.`,
        });
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          title: 'Error al procesar imagen',
          description: 'No se pudo procesar la imagen. Por favor, intenta con otra.',
          variant: 'destructive'
        });
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if ((!idFrontFile && !user.id_front_url) || (!idBackFile && !user.id_back_url)) {
        toast({ title: 'Documentos requeridos', description: 'Por favor, sube ambos lados de tu documento de identidad.', variant: 'destructive'});
        return;
    }

    setIsSubmitting(true);
    try {
        console.log('🚀 Starting form submission...');
        let idFrontUrl = user.id_front_url;
        let idBackUrl = user.id_back_url;

        // Upload identity documents if new files are provided
        if (idFrontFile) {
            console.log('📤 Uploading front ID document...');
            toast({ title: 'Subiendo documentos...', description: 'Subiendo documento frontal...' });
            idFrontUrl = await userService.uploadIdentityDocument(user.id, idFrontFile);
            console.log('✅ Front ID uploaded successfully:', idFrontUrl);
        }
        if (idBackFile) {
            console.log('📤 Uploading back ID document...');
            toast({ title: 'Subiendo documentos...', description: 'Subiendo documento trasero...' });
            idBackUrl = await userService.uploadIdentityDocument(user.id, idBackFile);
            console.log('✅ Back ID uploaded successfully:', idBackUrl);
        }

        const profileUpdates: Partial<UserProfile> = {
            ...values,
            birth_date: values.birth_date.toISOString().split('T')[0], // format to YYYY-MM-DD
            id_front_url: idFrontUrl,
            id_back_url: idBackUrl,
            is_profile_complete: true,
        };

        console.log('💾 Updating profile with:', profileUpdates);
        toast({ title: 'Actualizando perfil...', description: 'Guardando información del perfil...' });
        await userService.updateProfile(user.id, profileUpdates);
        console.log('✅ Profile updated successfully');
        
        console.log('🔄 Updating user data in context...');
        
        // Update the user profile in context directly with the data we know was saved
        updateUserProfile(profileUpdates);
        console.log('✅ User data updated in context');
        
        toast({ title: 'Perfil actualizado', description: 'Tu información de vendedor ha sido guardada.' });
        console.log('✅ Form submission completed successfully');
        
        // Call onFormSubmit after a short delay to ensure state updates
        setTimeout(() => {
          onFormSubmit(); // Callback to close modal or refresh parent
        }, 100);
    } catch (error: any) {
        console.error('❌ Form submission error:', error);
        const errorMessage = error?.message || 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
        toast({ 
            title: 'Error al actualizar', 
            description: errorMessage, 
            variant: 'destructive'
        });
    } finally {
        console.log('🏁 Finally block executed - Setting isSubmitting to false');
        setIsSubmitting(false);
        console.log('🏁 isSubmitting set to false');
    }
  };

  return (
    <ScrollArea className="pr-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <h3 className="text-lg font-semibold border-b pb-2">1. Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input id="full_name" {...form.register('full_name')} />
            {form.formState.errors.full_name && <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="national_id">Cédula de Identidad</Label>
            <Input id="national_id" placeholder="001-1234567-8" {...form.register('national_id')} />
            {form.formState.errors.national_id && <p className="text-sm text-destructive">{form.formState.errors.national_id.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
            <Controller
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                  <Popover>
                  <PopoverTrigger asChild>
                      <Button
                      variant={"outline"}
                      className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                      )}
                      >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                      <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1930}
                      toYear={new Date().getFullYear() - 18}
                      />
                  </PopoverContent>
                  </Popover>
              )}
              />
              {form.formState.errors.birth_date && <p className="text-sm text-destructive">{form.formState.errors.birth_date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nacionalidad</Label>
            <Input id="nationality" {...form.register('nationality')} />
            {form.formState.errors.nationality && <p className="text-sm text-destructive">{form.formState.errors.nationality.message}</p>}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold border-b pb-2 pt-4">2. Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" value={user.email || ''} readOnly disabled />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="phone_number">Número de Teléfono</Label>
                  <Input id="phone_number" {...form.register('phone_number')} />
                  {form.formState.errors.phone_number && <p className="text-sm text-destructive">{form.formState.errors.phone_number.message}</p>}
              </div>
              <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="full_address">Dirección Completa</Label>
                  <Input id="full_address" {...form.register('full_address')} />
                  {form.formState.errors.full_address && <p className="text-sm text-destructive">{form.formState.errors.full_address.message}</p>}
              </div>
        </div>

        <h3 className="text-lg font-semibold border-b pb-2 pt-4">3. Documentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['front', 'back'].map((side) => (
              <div key={side} className="space-y-2">
                  <Label>Cédula/ID ({side === 'front' ? 'Frontal' : 'Trasera'})</Label>
                  <Label htmlFor={`id-${side}-upload`} className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors relative">
                      {side === 'front' && idFrontPreview && <Image src={idFrontPreview} alt="ID Front Preview" layout="fill" className="object-contain rounded-lg p-1" />}
                      {side === 'back' && idBackPreview && <Image src={idBackPreview} alt="ID Back Preview" layout="fill" className="object-contain rounded-lg p-1" />}
                      
                      {!(side === 'front' && idFrontPreview) && !(side === 'back' && idBackPreview) && (
                          <div className="flex flex-col items-center justify-center">
                              <UploadCloud className="w-10 h-10 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Haz clic para subir</p>
                          </div>
                      )}
                      <Input id={`id-${side}-upload`} type="file" className="sr-only" onChange={(e) => handleFileChange(e, side as 'front' | 'back')} />
                  </Label>
              </div>
          ))}
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Información
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
}
