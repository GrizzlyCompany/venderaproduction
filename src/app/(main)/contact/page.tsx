
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const formSchema = z.object({
    name: z.string().min(2, { message: t('contact.form.validation.name') }),
    email: z.string().email({ message: t('contact.form.validation.email') }),
    message: z.string().min(10, { message: t('contact.form.validation.message') }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values); // In a real app, you'd send this to a server
    toast({
      title: t('contact.toast.success.title'),
      description: t('contact.toast.success.description'),
    });
    form.reset();
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{t('contact.form.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('contact.form.name_placeholder')} {...field} />
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
                          <Input placeholder={t('contact.form.email_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.message')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('contact.form.message_placeholder')}
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg">
                    <Send className="mr-2" />
                    {t('contact.form.submit')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="font-headline text-3xl font-bold text-primary">
              {t('contact.info.title')}
            </h2>
            <div className="space-y-4 text-lg">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full mt-1">
                   <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">{t('contact.info.address_title')}</h3>
                  <p className="text-muted-foreground">{t('contact.info.address')}</p>
                </div>
              </div>
               <div className="flex items-start gap-4">
                 <div className="bg-primary/10 p-3 rounded-full mt-1">
                    <Phone className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-primary">{t('contact.info.phone_title')}</h3>
                    <p className="text-muted-foreground">{t('contact.info.phone')}</p>
                </div>
              </div>
               <div className="flex items-start gap-4">
                 <div className="bg-primary/10 p-3 rounded-full mt-1">
                    <Mail className="h-6 w-6 text-primary" />
                 </div>
                <div>
                    <h3 className="font-semibold text-primary">{t('contact.info.email_title')}</h3>
                    <p className="text-muted-foreground">{t('contact.info.email')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
