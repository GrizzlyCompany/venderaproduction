
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { useTranslation } from "@/hooks/useTranslation";
import { UserNav } from "./UserNav";
import { useAuth } from "@/context/AuthContext";
import { MessageNotifications } from "./MessageNotifications";
import { GlobalSearch } from "../search/GlobalSearch";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/components/chat/use-chat-store";
import { useRole } from "@/hooks/useRole";
import { Menu, X, Building2, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { t } = useTranslation();
  const { user, supabase } = useAuth();
  const { fetchConversations } = useChatStore();
  const { userRole, isDeveloper, isAgent, isBuyer } = useRole();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Fetch conversations when user logs in
  useEffect(() => {
    if (user && supabase) {
        fetchConversations(user.id, supabase);
    }
  }, [user, supabase, fetchConversations]);

  const logoHref = user ? "/" : "/landing";
  const isLanding = pathname === '/landing';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Only add scroll listener if on the landing page for guests
    if (isLanding && !user) {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    } else {
        // If not on landing or user is logged in, ensure header is not transparent.
        setScrolled(true);
    }
  }, [isLanding, user]);
  
  const showTransparentNav = isLanding && !scrolled && !user && isMounted;

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300", 
      showTransparentNav ? "bg-transparent" : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}>
      <div className="container flex h-16 items-center">
        <Link href={logoHref}>
            <Logo layout="horizontal" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-10">
          {/* Common navigation for all users */}
          {!isDeveloper() && (
            <>
              <Link
                href="/"
                className="transition-colors hover:text-accent text-foreground/60"
              >
                {t('header.properties')}
              </Link>
              <Link
                href="/projects"
                className="transition-colors hover:text-accent text-foreground/60"
              >
                Proyectos
              </Link>
            </>
          )}
          
          {/* Developer-specific navigation */}
          {isDeveloper() && (
            <>
              <Link
                href="/developer/dashboard"
                className="transition-colors hover:text-accent text-foreground/60"
              >
                <Building2 className="h-4 w-4 inline mr-1" />
                Dashboard
              </Link>
              <Link
                href="/developer/projects"
                className="transition-colors hover:text-accent text-foreground/60"
              >
                Mis Proyectos
              </Link>
              <Link
                href="/developer/projects/new"
                className="transition-colors hover:text-accent text-foreground/60"
              >
                Crear Proyecto
              </Link>
              <Link
                href="/developer/test"
                className="transition-colors hover:text-accent text-foreground/60 text-xs"
              >
                🧪 Pruebas
              </Link>
            </>
          )}
          
          {/* Agent-specific navigation */}
          {isAgent() && user && (
            <>
              <Link
                href="/agent/dashboard"
                className="transition-colors hover:text-accent text-foreground/60"
              >
                <UserCheck className="h-4 w-4 inline mr-1" />
                Dashboard
              </Link>
              <Link
                href="/properties/new"
                className="transition-colors hover:text-accent text-foreground/60"
              >
                {t('header.addProperty')}
              </Link>
            </>
          )}
          
          {/* Buyer-specific navigation */}
          {isBuyer() && user && (
            <Link
              href="/favorites"
              className="transition-colors hover:text-accent text-foreground/60"
            >
              {t('header.favorites')}
            </Link>
          )}
        </nav>
        
        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-4 px-8">
           { user && <GlobalSearch /> }
        </div>
        
        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center justify-end space-x-2">
          {user && <MessageNotifications />}
          <UserNav />
        </div>

        {/* Mobile Right Side */}
        <div className="flex md:hidden items-center justify-end space-x-2 ml-auto">
          {user && <MessageNotifications />}
          <UserNav />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container px-4 py-4 space-y-4">
            {/* Mobile Search */}
            {user && (
              <div className="pb-4 border-b">
                <GlobalSearch />
              </div>
            )}
            
            {/* Mobile Navigation Links */}
            <nav className="space-y-3">
              {/* Common navigation for all users */}
              {!isDeveloper() && (
                <>
                  <Link
                    href="/"
                    className="block py-2 text-sm font-medium transition-colors hover:text-accent text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('header.properties')}
                  </Link>
                  <Link
                    href="/projects"
                    className="block py-2 text-sm font-medium transition-colors hover:text-accent text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Proyectos
                  </Link>
                </>
              )}
              
              {/* Developer-specific navigation */}
              {isDeveloper() && (
                <>
                  <Link
                    href="/developer/dashboard"
                    className="block py-2 text-sm font-medium transition-colors hover:text-accent text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Building2 className="h-4 w-4 inline mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    href="/developer/projects"
                    className="block py-2 text-sm font-medium transition-colors hover:text-accent text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Proyectos
                  </Link>
                  <Link
                    href="/developer/projects/new"
                    className="block py-2 text-sm font-medium transition-colors hover:text-accent text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Crear Proyecto
                  </Link>
                </>
              )}
              
              {/* Agent-specific navigation */}
              {isAgent() && user && (
                <>
                  <Link
                    href="/agent/dashboard"
                    className="block py-2 text-sm font-medium transition-colors hover:text-accent text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCheck className="h-4 w-4 inline mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    href="/properties/new"
                    className="block py-2 text-sm font-medium transition-colors hover:text-accent text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('header.addProperty')}
                  </Link>
                </>
              )}
              
              {/* Buyer-specific navigation */}
              {isBuyer() && user && (
                <Link
                  href="/favorites"
                  className="block py-2 text-sm font-medium transition-colors hover:text-accent text-foreground/60"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('header.favorites')}
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
