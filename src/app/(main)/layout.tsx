'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { AutoLogoutProvider } from '@/components/auth/AutoLogoutProvider';
import { AuthRedirect } from '@/components/auth/AuthRedirect';
import { getIdleTimeConfig } from '@/config/auth';
import { useAuth } from '@/context/AuthContext';

// Componente de cliente para manejar el padding dinámico
function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Aplicamos padding inferior solo si el usuario está autenticado (para el BottomNav en móvil)
  const mainPaddingClass = user ? "pb-20 lg:pb-0" : "pb-0";
  
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className={`flex-grow w-full ${mainPaddingClass}`}>{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}

// Componente de layout principal
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { idleTime, warningTime } = getIdleTimeConfig();
  
  return (
    <AutoLogoutProvider
      idleTime={idleTime}
      warningTime={warningTime}
      enabled={false}
    >
      <AuthRedirect>
        <MainLayoutContent>
          {children}
        </MainLayoutContent>
      </AuthRedirect>
    </AutoLogoutProvider>
  );
}
