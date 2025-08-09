'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { developerService } from '@/lib/developer.service';
import { Button } from '@/components/ui/button';

export default function CompletarPerfilPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // Actualizar developer_profiles
      await developerService.updateDeveloperProfileByUserId(user.id, {
        company_name: formData.company_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
      });
      router.push('/developer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">{t('developerProfile.completeTitle')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="company_name"
          placeholder={t('developerProfile.companyNamePlaceholder')}
          value={formData.company_name}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="email"
          name="contact_email"
          placeholder={t('developerProfile.contactEmailPlaceholder')}
          value={formData.contact_email}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="tel"
          name="contact_phone"
          placeholder="Teléfono"
          value={formData.contact_phone}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </div>
  );
}
