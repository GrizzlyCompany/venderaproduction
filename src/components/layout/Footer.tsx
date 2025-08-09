"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="hidden lg:block bg-card border-t mt-8 sm:mt-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    <div className="sm:col-span-2 md:col-span-1 space-y-4">
                        <Logo />
                        <p className="text-muted-foreground text-sm">
                            {t('home.subtitle')}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary mb-3">{t('header.properties')}</h3>
                        <nav className="space-y-2 text-sm">
                            <Link href="/" className="block text-muted-foreground hover:text-accent">
                                {t('search.allLocations')}
                            </Link>
                             <Link href="/" className="block text-muted-foreground hover:text-accent">
                                {t('search.allTypes')}
                            </Link>
                        </nav>
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary mb-3">VENDRA</h3>
                         <nav className="space-y-2 text-sm">
                            <Link href="/about" className="block text-muted-foreground hover:text-accent">
                                {t('footer.about')}
                            </Link>
                             <Link href="/contact" className="block text-muted-foreground hover:text-accent">
                                {t('footer.contact')}
                            </Link>
                             <Link href="/terms" className="block text-muted-foreground hover:text-accent">
                                {t('footer.terms')}
                            </Link>
                        </nav>
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary mb-3">{t('footer.follow')}</h3>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-accent">
                                <Facebook className="h-5 w-5" />
                            </Link>
                             <Link href="#" className="text-muted-foreground hover:text-accent">
                                <Twitter className="h-5 w-5" />
                            </Link>
                             <Link href="#" className="text-muted-foreground hover:text-accent">
                                <Instagram className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
                    <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
                </div>
            </div>
        </footer>
    );
}
