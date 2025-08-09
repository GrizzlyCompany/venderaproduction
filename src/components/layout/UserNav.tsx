
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useProfileNavigation } from '@/hooks/useProfileNavigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Heart, Building, LogIn, UserPlus, Loader2, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function UserNav() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { navigateToProfile } = useProfileNavigation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.refresh();
      router.push('/landing');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="sm" asChild className="text-xs md:text-sm px-2 md:px-4">
          <Link href="/login">
            <LogIn className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{t('login.title')}</span>
            <span className="sm:hidden">Entrar</span>
          </Link>
        </Button>
        <Button size="sm" asChild className="text-xs md:text-sm px-2 md:px-4">
          <Link href="/signup">
            <UserPlus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{t('signup.title')}</span>
            <span className="sm:hidden">Registro</span>
          </Link>
        </Button>
      </div>
    );
  }

  const displayName = user.profile?.full_name || user.user_metadata?.full_name || user.email;
  const avatarUrl = user.profile?.avatar_url || user.user_metadata?.avatar_url;
  const userInitial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={avatarUrl || undefined} 
              alt={t('userNav.avatarAlt')} 
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isMobile && (
          <>
            <DropdownMenuGroup>
              {user && user.id ? (
                <DropdownMenuItem onClick={() => navigateToProfile(user.id)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('userNav.profile')}</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => {
                  console.log('Usuario no autenticado, redirigiendo a login');
                  router.push('/login');
                }}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('userNav.profile')}</span>
                </DropdownMenuItem>
              )}
              <Link href="/messages">
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>{t('messages.title')}</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/favorites">
                <DropdownMenuItem>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>{t('header.favorites')}</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/properties/new">
                <DropdownMenuItem>
                  <Building className="mr-2 h-4 w-4" />
                  <span>{t('header.addProperty')}</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('userNav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
