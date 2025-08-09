'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Star, Loader2, Building, Heart, Edit, Mail, Lock, Upload, Trash2, MessageSquare, Calendar, Home, UserCog, Camera, AlertCircle } from 'lucide-react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import Link from 'next/link';
import { useFavoritesStore } from '@/hooks/useFavoritesStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { UserProfile, Property, Rating } from '@/types';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { usePropertyStore } from '@/hooks/usePropertyStore';
import { useChatStore } from '@/components/chat/use-chat-store';
import { userService } from '@/lib/user.service';
import { SubscriptionModal } from '../layout/SubscriptionModal';
import { Badge } from '../ui/badge';
import { SellerOnboardingForm } from './SellerOnboardingForm';
import { debugAuthState, clearAllAuthData } from '@/lib/debug-auth';
import { clearServiceWorkerCache, forcePageReload } from '@/lib/sw-utils';
import { debugUserState, ensureUserProfile, clearAuthCache } from '@/lib/database-debug';

const BadgeCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.78l.22.22a.68.68 0 0 0 .96.96l.22.22a4 4 0 0 1 4.78 4.78l-.22.22a.68.68 0 0 0-.96.96l-.22.22a4 4 0 0 1-4.78 4.78l-.22-.22a.68.68 0 0 0-.96-.96l-.22-.22a4 4 0 0 1-4.78-4.78Z"/>
        <path d="m9 12 2 2 4-4"/>
    </svg>
);

export default function ProfilePageClient() {
  const { user: authUser, loading: authLoading, supabase, refreshUser } = useAuth();
  const { deleteProperty } = usePropertyStore();
  const { handleStartConversation } = useChatStore();
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams() || {};
  const profileId = (params as Record<string, any>).id as string;
  const { favorites } = useFavoritesStore();
  
  const [displayUser, setDisplayUser] = useState<UserProfile | null>(null);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingData, setRatingData] = useState<{ average: number, count: number }>({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Edit profile state
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    bio: '',
    phone_number: '',
    full_address: ''
  });
  
  // Rating state
  const [isRating, setIsRating] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  const fetchRatingData = async (userId: string) => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('ratings')
        .select('rating, comment, created_at')
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ratings:', error);
        setRatingData({ average: 0, count: 0 });
        setRatings([]);
        return;
      }
      
      setRatings(data as Rating[]);
      const count = data.length;
      const average = count > 0 ? data.reduce((acc, item) => acc + item.rating, 0) / count : 0;
      setRatingData({ average, count });
  };
  
  const fetchProfileData = useCallback(async () => {
    console.log('Fetching profile data for ID:', profileId);
    console.log('Auth user:', authUser?.id);
    console.log('Supabase client available:', !!supabase);
    
    if (!profileId || !supabase) {
      console.log('Missing profileId or supabase client, aborting fetch');
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      console.log('Attempting to fetch profile using userService...');
      
      // Intentamos obtener el perfil usando el servicio de usuario
      // Primero intentamos con getProfile (para usuarios autenticados)
      // Si falla, intentamos con getPublicProfile (para perfiles públicos)
      let profileData = null;
      
      if (authUser) {
        // Usuario autenticado: intentar obtener perfil completo
        try {
          profileData = await userService.getProfile(profileId);
        } catch (error) {
          console.warn('Failed to get authenticated profile, trying public profile:', error);
        }
      }
      
      // Si no se pudo obtener el perfil autenticado o no hay usuario autenticado,
      // intentar obtener el perfil público
      if (!profileData) {
        profileData = await userService.getPublicProfile(profileId);
      }

      if (!profileData) {
        console.error('Profile not found');
        setDisplayUser(null);
        setLoading(false);
        return;
      }
      
      console.log('Profile data fetched successfully:', profileData.id);
      setDisplayUser(profileData as UserProfile);
      fetchRatingData(profileData.id);

      // Fetch properties for this user
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`*, realtor:realtor_id(id, full_name, avatar_url, username, is_seller)`)
        .eq('realtor_id', profileData.id);
      
      if (propertiesError) {
        console.error('Error fetching properties for profile:', propertiesError);
      } else {
        setUserProperties(propertiesData as unknown as Property[]);
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      setDisplayUser(null);
    }

    setLoading(false);
  }, [profileId, supabase, authUser?.id]);

  useEffect(() => {
    console.log('=== ProfilePageClient useEffect ===');
    console.log('Auth loading:', authLoading, '| Auth user ID:', authUser?.id, '| Profile ID:', profileId);
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔗 Current URL:', window.location.href);
    console.log('🔗 Current pathname:', window.location.pathname);
    
    // Run detailed auth debugging only if there are issues
    if (!authLoading && !authUser && profileId) {
      console.log('🔍 No auth user found, running debug...');
      debugAuthState();
    }
    
    // Solo cargar datos cuando la autenticación haya terminado de cargar
    if (!authLoading) {
      console.log('✅ Auth loading complete, fetching profile data');
      fetchProfileData();
    } else {
      console.log('⏳ Auth still loading, waiting...');
    }
  }, [profileId, authLoading, fetchProfileData, authUser?.id]);

  // Initialize edit form when modal opens
  useEffect(() => {
    if (isEditInfoModalOpen && displayUser) {
      setEditFormData({
        full_name: displayUser.full_name || '',
        bio: displayUser.bio || '',
        phone_number: displayUser.phone_number || '',
        full_address: displayUser.full_address || ''
      });
    }
  }, [isEditInfoModalOpen, displayUser]);

  
  const handleDeleteProperty = async (propertyId?: string) => {
    if (!supabase || !propertyId) return;
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) {
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar la propiedad.',
        variant: 'destructive',
      });
    } else {
      deleteProperty(propertyId);
      // Also update local state to reflect deletion immediately
      setUserProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({
        title: 'Propiedad eliminada',
        description: 'Tu propiedad ha sido eliminada exitosamente.',
      });
    }
  };

  const onStartConversation = async () => {
    if (!authUser) {
        toast({ title: 'Debes iniciar sesión', description: 'Por favor, inicia sesión para contactar a un vendedor.', variant: 'destructive' });
        router.push('/login');
        return;
    }
    if (authUser.profile?.subscription_status !== 'active') {
      setSubModalOpen(true);
      return;
    }
    if (!supabase || !displayUser) return;

    const conversationId = await handleStartConversation(displayUser, authUser, supabase);
    if (conversationId) {
        router.push('/messages');
    } else {
        toast({ title: 'Error', description: 'No se pudo iniciar la conversación.', variant: 'destructive' });
    }
  };

  const handleRateUserClick = () => {
    if (!authUser) {
      toast({ title: 'Debes iniciar sesión', description: 'Por favor, inicia sesión para calificar.', variant: 'destructive' });
      router.push('/login');
      return;
    }
    if (authUser?.profile?.subscription_status !== 'active') {
      setSubModalOpen(true);
    } else {
      setIsRatingDialogOpen(true);
    }
  };

  const isLoadingInitial = loading || authLoading;
  const isOwnProfile = authUser && authUser.id === displayUser?.id;

  if (isLoadingInitial) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (!displayUser) {
     return (
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] p-4">
           <Card className="w-full max-w-md">
             <CardHeader className="text-center">
               <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
               <CardTitle>Perfil no disponible</CardTitle>
               <CardDescription>
                 No se pudo cargar el perfil. Esto puede deberse a problemas de conexión 
                 o el perfil no existe.
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
               <Button asChild className="w-full">
                 <Link href="/">Ir al Inicio</Link>
               </Button>
               {!authUser && (
                 <Button asChild className="w-full" variant="outline">
                   <Link href="/login">Iniciar Sesión</Link>
                 </Button>
               )}
               {/* Debug buttons - remove in production */}
               <div className="border-t pt-3 space-y-2">
                 <Button 
                   onClick={() => debugAuthState()} 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                 >
                   🔍 Debug Auth State
                 </Button>
                 <Button 
                   onClick={() => clearAllAuthData()} 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                 >
                   🧹 Clear Auth Data
                 </Button>
                 <Button 
                   onClick={async () => {
                     await clearServiceWorkerCache();
                     forcePageReload();
                   }} 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                 >
                   🧹 Clear SW Cache & Reload
                 </Button>
                 <Button 
                   onClick={async () => {
                     console.log('🧹 Clearing auth session and reloading...');
                     await clearAuthCache();
                     window.location.reload();
                   }} 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                 >
                   🔄 Clear Auth & Reload
                 </Button>
                 <Button 
                   onClick={async () => {
                     const result = await debugUserState();
                     console.log('🔍 Debug result:', result);
                     alert('Debug result logged to console');
                   }} 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                 >
                   🔍 Debug User State
                 </Button>
                 <Button 
                   onClick={async () => {
                     const result = await ensureUserProfile();
                     console.log('🔧 Ensure profile result:', result);
                     alert('Profile check completed - see console');
                   }} 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                 >
                   🔧 Fix Profile
                 </Button>
                 <Button 
                   onClick={() => window.location.reload()} 
                   variant="outline" 
                   size="sm" 
                   className="w-full text-xs"
                 >
                   🔄 Reload Page
                 </Button>
               </div>
             </CardContent>
           </Card>
        </div>
    );
  }

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  }

  const handleAvatarUpload = async () => {
    if (!imageFile || !authUser || !supabase) {
         toast({ title: "No se ha seleccionado ninguna imagen.", description: "Por favor, selecciona una imagen primero.", variant: "destructive" });
        return;
    }
    setIsUploading(true);
    try {
        // Upload the file to Supabase Storage using the userService
        const avatarUrl = await userService.uploadAvatar(authUser.id, imageFile);
        
        // Update the profile with the new avatar URL
        const { profile } = await userService.updateProfile(authUser.id, { 
          avatar_url: avatarUrl 
        });
        
        if (profile) {
          setDisplayUser(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
          await refreshUser();
          toast({ title: "¡Foto de perfil actualizada!", description: "Tu nuevo avatar ha sido guardado exitosamente." });
        }

    } catch (error: any) {
        console.error("Error updating profile picture:", error);
        toast({ title: "Fallo en la subida", description: error.message || "No se pudo actualizar la foto", variant: "destructive" });
    } finally {
        setIsUploading(false);
        setIsEditModalOpen(false);
        setImageFile(null);
    }
  };

  const handleRatingSubmit = async () => {
    if (!authUser || isOwnProfile || !supabase) {
        toast({ title: "Acción no permitida", description: "No puedes calificarte a ti mismo.", variant: 'destructive' });
        return;
    }
    if (currentRating === 0) {
        toast({ title: "Calificación requerida", description: "Por favor, selecciona una calificación de 1 a 5 estrellas.", variant: 'destructive' });
        return;
    }
    
    setIsRating(true);
    
    const { error } = await supabase
        .from('ratings')
        .upsert({
            rated_user_id: displayUser.id,
            rater_user_id: authUser.id,
            rating: currentRating,
            comment: ratingComment,
        }, { onConflict: 'rated_user_id, rater_user_id' });

    if (error) {
        console.error("Error submitting rating:", error);
        toast({ title: "Error", description: "No se pudo guardar tu calificación. " + error.message, variant: 'destructive' });
    } else {
        toast({ title: "¡Gracias!", description: "Tu calificación ha sido guardada." });
        await fetchRatingData(displayUser.id); // Refresh ratings
        setIsRatingDialogOpen(false); // Close dialog on success
        setCurrentRating(0);
        setHoverRating(0);
        setRatingComment("");
    }
    
    setIsRating(false);
  };

  const handleEditProfileSubmit = async () => {
    if (!authUser || !isOwnProfile || !supabase) return;
    
    try {
      const updatesWithTimestamp = {
        ...editFormData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updatesWithTimestamp)
        .eq('id', authUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setDisplayUser(prev => prev ? { ...prev, ...editFormData } : null);
      await refreshUser();
      toast({ title: "Perfil actualizado", description: "Tu información ha sido actualizada exitosamente." });
      setIsEditInfoModalOpen(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: error.message || "No se pudo actualizar el perfil", variant: "destructive" });
    }
  };

  const userInitial = displayUser.full_name?.charAt(0).toUpperCase() || '?';
  const memberSince = displayUser.created_at ? new Date(displayUser.created_at).toLocaleDateString(t('terms.locale_code')) : 'N/A';

  return (
    <>
    <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setSubModalOpen(false)} />
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="overflow-hidden shadow-lg rounded-2xl">
           <CardHeader className="p-0">
             <div className="bg-primary/10 h-24" />
           </CardHeader>
           <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start -mt-20">
                <div className='flex flex-col sm:flex-row items-center gap-4'>
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-background bg-background">
                          <AvatarImage
                            src={displayUser.avatar_url || undefined}
                            alt="User avatar"
                            data-ai-hint="person face"
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                        {displayUser.is_seller && (
                            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white border-2 border-white shadow-lg font-semibold">
                                <BadgeCheckIcon className="h-4 w-4 text-white" />
                                <span className="text-xs font-bold">Vendedor</span>
                            </Badge>
                        )}
                    </div>
                     <div className="pt-4 text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-primary">
                          {displayUser.full_name}
                        </h1>
                         <div className="flex items-center justify-center sm:justify-start text-amber-500 mt-2">
                             {[...Array(5)].map((_, i) => (
                             <Star key={i} className={cn('w-5 h-5', i < Math.round(ratingData.average) ? 'fill-current' : 'text-muted-foreground fill-muted')} />
                             ))}
                              <span className="text-muted-foreground text-sm ml-2">
                                 {ratingData.average.toFixed(1)} ({ratingData.count} {t('profile.ratings')})
                               </span>
                         </div>
                     </div>
                </div>

              <div className="flex-shrink-0 mt-4 sm:mt-0 flex gap-2">
                  {isOwnProfile ? (
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" /> Editar Perfil
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                           <DialogHeader>
                            <DialogTitle>Opciones de Edición</DialogTitle>
                            <DialogDescription>
                               Selecciona qué parte de tu perfil deseas editar.
                            </DialogDescription>
                           </DialogHeader>
                           <div className="grid gap-4 py-4">
                             <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                                <Camera className="mr-2 h-4 w-4" /> Cambiar foto de perfil
                             </Button>
                             <Button variant="outline" onClick={() => setIsEditInfoModalOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar información personal
                             </Button>
                           </div>
                        </DialogContent>
                     </Dialog>
                  ) : (
                        <>
                            <Button onClick={onStartConversation} size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Enviar mensaje
                            </Button>
                            <Button variant="outline" onClick={handleRateUserClick} size="sm">
                                <Star className="mr-2 h-4 w-4" />
                                Calificar
                            </Button>
                        </>
                    )}
                </div>
            </div>
            
            {displayUser.bio && (
                <div className="mt-6 pt-6 border-t">
                    <p className="text-muted-foreground">{displayUser.bio}</p>
                </div>
            )}
           </CardContent>
        </Card>

        {/* Profile Stats Card */}
        <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                    <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Email</div>
                        <div className="font-medium text-sm sm:text-base break-all">{displayUser.email || 'No disponible'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Miembro desde</div>
                        <div className="font-medium text-sm sm:text-base">{memberSince}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">Propiedades</div>
                        <div className="font-medium text-sm sm:text-base">{userProperties.length}</div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Profile Edit Modals */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cambiar foto de perfil</DialogTitle>
                    <DialogDescription>
                        Selecciona una nueva imagen para tu perfil.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                    />
                    {imageFile && (
                        <div className="text-sm text-muted-foreground">
                            Archivo seleccionado: {imageFile.name}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleAvatarUpload} disabled={!imageFile || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            'Actualizar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isEditInfoModalOpen} onOpenChange={setIsEditInfoModalOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar información del perfil</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="full_name">Nombre completo</Label>
                        <Input
                            id="full_name"
                            value={editFormData.full_name}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="bio">Biografía</Label>
                        <Textarea
                            id="bio"
                            value={editFormData.bio}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Cuéntanos sobre ti..."
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone_number">Teléfono</Label>
                        <Input
                            id="phone_number"
                            value={editFormData.phone_number}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="full_address">Dirección</Label>
                        <Input
                            id="full_address"
                            value={editFormData.full_address}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, full_address: e.target.value }))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditInfoModalOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleEditProfileSubmit}>
                        Guardar cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Rating Dialog */}
        <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Calificar a {displayUser.full_name}</DialogTitle>
                    <DialogDescription>
                        Comparte tu experiencia con este usuario
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="p-1"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setCurrentRating(star)}
                            >
                                <Star
                                    className={cn(
                                        'w-8 h-8 transition-colors',
                                        (hoverRating || currentRating) >= star
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-muted-foreground'
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        placeholder="Escribe un comentario (opcional)..."
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRatingDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleRatingSubmit} disabled={isRating || currentRating === 0}>
                        {isRating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            'Enviar calificación'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="properties" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Propiedades Listadas
                </TabsTrigger>
                <TabsTrigger value="ratings" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Valoraciones
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Propiedades Guardadas
                </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-6">
                {userProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userProperties.map((property) => (
                            <div key={property.id} className="relative">
                                <PropertyCard property={property} />
                                {isOwnProfile && (
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            asChild
                                            className="h-8 w-8 p-0"
                                        >
                                            <Link href={`/edit-property/${property.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Eliminar propiedad?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción no se puede deshacer. La propiedad será eliminada permanentemente.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteProperty(property.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {isOwnProfile ? 'No tienes propiedades' : 'No hay propiedades'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {isOwnProfile 
                                ? 'Comienza publicando tu primera propiedad'
                                : 'Este usuario no ha publicado propiedades aún'
                            }
                        </p>
                        {isOwnProfile && (
                            <Button asChild>
                                <Link href="/properties/new">
                                    Publicar propiedad
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="ratings" className="mt-6">
                {ratings.length > 0 ? (
                    <div className="space-y-4">
                        {ratings.map((rating, index) => (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        'w-4 h-4',
                                                        i < rating.rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-muted-foreground'
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(rating.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {rating.comment && (
                                        <p className="text-sm text-muted-foreground">{rating.comment}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Sin calificaciones</h3>
                        <p className="text-muted-foreground">
                            {isOwnProfile 
                                ? 'Aún no has recibido calificaciones'
                                : 'Este usuario no ha recibido calificaciones aún'
                            }
                        </p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
                {isOwnProfile ? (
                    favorites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No tienes favoritos</h3>
                            <p className="text-muted-foreground">
                                Las propiedades que marques como favoritas aparecerán aquí
                            </p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-12">
                        <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Información privada</h3>
                        <p className="text-muted-foreground">
                            Los favoritos de otros usuarios son privados
                        </p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}