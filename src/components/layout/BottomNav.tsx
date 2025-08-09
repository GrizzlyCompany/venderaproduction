'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Heart, Plus, MessageCircle, User, Building2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { getProfileUrl, isProfileRouteActive } from '@/lib/navigation-helpers';

export function BottomNav() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  const handleProfileClick = () => {
    if (loading) return;
    
    // Verificar si el usuario está autenticado y tiene un ID
    if (user && user.id) {
      const targetUrl = getProfileUrl(user.id, user.profile);
      console.log('Navegando a:', targetUrl);
      router.push(targetUrl);
    } else {
      console.log('Usuario no autenticado, redirigiendo a login');
      router.push('/login');
    }
  };

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: t('header.home'),
      isActive: pathname === '/',
      type: 'link' as const,
    },
    {
      href: '/projects',
      icon: Building2,
      label: 'Proyectos',
      isActive: pathname.startsWith('/projects'),
      type: 'link' as const,
    },
    {
      href: '/favorites',
      icon: Heart,
      label: t('header.favorites'),
      isActive: pathname === '/favorites',
      type: 'link' as const,
    },
    {
      href: '/messages',
      icon: MessageCircle,
      label: t('header.messages'),
      isActive: pathname === '/messages',
      type: 'link' as const,
    },
    {
      href: '#',
      icon: User,
      label: t('header.profile'),
      isActive: isProfileRouteActive(pathname, user?.profile),
      type: 'button' as const,
      onClick: handleProfileClick,
    },
  ];

  // Si el usuario no está autenticado o está cargando, no mostramos el BottomNav
  if (!user || loading) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const className = cn(
            'flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 text-xs font-medium transition-colors',
            item.isActive
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          );

          if (item.type === 'button') {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={className}
                disabled={loading}
              >
                <Icon 
                  className={cn(
                    'h-5 w-5 mb-1',
                    item.isActive ? 'text-primary' : 'text-muted-foreground'
                  )} 
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={className}
            >
              <Icon 
                className={cn(
                  'h-5 w-5 mb-1',
                  item.isActive ? 'text-primary' : 'text-muted-foreground'
                )} 
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}