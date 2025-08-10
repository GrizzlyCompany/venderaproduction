
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Logo } from '@/components/layout/Logo';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, UserCheck } from 'lucide-react';
import type { UserRole } from '@/types';
import { getPostLoginRedirectUrl } from '@/lib/navigation-helpers';

const signupSchema = z
  .object({
    fullName: z.string().min(2, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
    role: z.enum(['buyer', 'agent', 'developer'], { message: 'Please select an account type.' }),
    phone: z.string().optional().default(''),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'buyer',
      phone: '',
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    const { error } = await signup(values.fullName, values.email, values.password, values.role, values.phone);

    if (error) {
      toast({
        title: t('signup.toast.error.title'),
        description: error.message || "An unknown error occurred during signup.",
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('signup.toast.success.title'),
        description: t('signup.toast.success.description'),
      });
      
      // Redirect based on role
      if (values.role === 'developer') {
        router.push('/developer/register');
      } else {
        // Redirect to appropriate page after signup
        setTimeout(async () => {
          const { data: { session } } = await import('@/lib/supabase/client').then(({ createClient }) => {
            const supabase = createClient();
            return supabase.auth.getSession();
          });
          if (session?.user?.id) {
            // Get user profile to determine redirect
            const { data: profile } = await import('@/lib/supabase/client').then(({ createClient }) => {
              const supabase = createClient();
              return supabase.from('profiles').select('role').eq('id', session.user.id).single();
            });
            const targetUrl = getPostLoginRedirectUrl(profile, `/profile/${session.user.id}`);
            router.push(targetUrl);
          } else {
            router.push('/');
          }
        }, 2000);
      }
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="flex justify-center">
                <Link href="/landing">
                    <Logo layout="vertical" />
                </Link>
            </div>
            <Card className="border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline">{t('signup.title')}</CardTitle>
                    <CardDescription>
                    {t('signup.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                        {/* Account Type Selection */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Cuenta</FormLabel>
                                <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 gap-3"
                                >
                                    <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50">
                                    <RadioGroupItem value="buyer" id="buyer" />
                                    <div className="flex items-center space-x-2 flex-1">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        <div>
                                        <label htmlFor="buyer" className="text-sm font-medium cursor-pointer">
                                            Comprador
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            Busco propiedades para comprar
                                        </p>
                                        </div>
                                    </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50">
                                    <RadioGroupItem value="agent" id="agent" />
                                    <div className="flex items-center space-x-2 flex-1">
                                        <UserCheck className="h-4 w-4 text-green-600" />
                                        <div>
                                        <label htmlFor="agent" className="text-sm font-medium cursor-pointer">
                                            Agente Inmobiliario
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            Vendo propiedades existentes
                                        </p>
                                        </div>
                                    </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50">
                                    <RadioGroupItem value="developer" id="developer" />
                                    <div className="flex items-center space-x-2 flex-1">
                                        <Building2 className="h-4 w-4 text-orange-600" />
                                        <div>
                                        <label htmlFor="developer" className="text-sm font-medium cursor-pointer">
                                            Empresa Constructora
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            Desarrollo proyectos inmobiliarios
                                        </p>
                                        </div>
                                    </div>
                                    </div>
                                </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('signup.name')}</FormLabel>
                                <FormControl>
                                <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('contact.form.email')}</FormLabel>
                                <FormControl>
                                <Input
                                    placeholder="m@example.com"
                                    type="email"
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono (Opcional)</FormLabel>
                                <FormControl>
                                <Input
                                    placeholder="+1 809 555 0123"
                                    type="tel"
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('login.password')}</FormLabel>
                                <FormControl>
                                <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('signup.confirmPassword')}</FormLabel>
                                <FormControl>
                                <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                            <Loader2 className="animate-spin" />
                            ) : (
                            t('signup.button')
                            )}
                        </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        {t('signup.hasAccount')}{' '}
                        <Link href="/login" className="underline">
                        {t('login.title')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://imztgqvovygowvggagkf.supabase.co/storage/v1/object/public/logo/bailey-anselme-Bkp3gLygyeA-unsplash.jpg"
          alt="Signup background"
          width={1920}
          height={1080}
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="modern kitchen"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}
