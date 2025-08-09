'use client';

import { useAutoLogout } from '@/hooks/useAutoLogout';
import { IdleWarningModal } from './IdleWarningModal';
import { AUTH_CONFIG, isPathExcluded } from '@/config/auth';
import { usePathname } from 'next/navigation';

interface AutoLogoutProviderProps {
  children: React.ReactNode;
  idleTime?: number; // Tiempo de inactividad en milisegundos
  warningTime?: number; // Tiempo de advertencia en segundos
  enabled?: boolean;
}

export function AutoLogoutProvider({
  children,
  idleTime = AUTH_CONFIG.IDLE_TIME,
  warningTime = AUTH_CONFIG.WARNING_TIME,
  enabled = true
}: AutoLogoutProviderProps) {
  const pathname = usePathname() || '';
  
  // Deshabilitar auto-logout en páginas excluidas
  const shouldBeEnabled = enabled && !isPathExcluded(pathname);
  
  const {
    showWarning,
    warningTime: actualWarningTime,
    onContinue,
    onLogout,
    isEnabled
  } = useAutoLogout({
    idleTime,
    warningTime,
    enabled: shouldBeEnabled
  });

  return (
    <>
      {children}
      {isEnabled && (
        <IdleWarningModal
          isOpen={showWarning}
          onContinue={onContinue}
          onLogout={onLogout}
          warningTime={actualWarningTime}
        />
      )}
    </>
  );
}