'use client';

import { useState, useCallback, useEffect } from 'react';
import { useIdleTimer } from './useIdleTimer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UseAutoLogoutOptions {
  idleTime?: number; // Tiempo de inactividad en milisegundos (por defecto 15 minutos)
  warningTime?: number; // Tiempo de advertencia en segundos (por defecto 60 segundos)
  enabled?: boolean; // Si el auto-logout está habilitado
}

export function useAutoLogout({
  idleTime = 15 * 60 * 1000, // 15 minutos
  warningTime = 60, // 60 segundos
  enabled = true
}: UseAutoLogoutOptions = {}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Solo habilitar si hay un usuario logueado
  const shouldBeEnabled = enabled && !!user && !isLoggingOut;

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setShowWarning(false);
    
    try {
      console.log('🔒 Auto-logout: Logging out user due to inactivity');
      await logout();
      
      // Redirigir a la página de login con mensaje
      router.push('/login?reason=inactivity');
    } catch (error) {
      console.error('❌ Auto-logout: Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, router, isLoggingOut]);

  const handleContinueSession = useCallback(() => {
    console.log('✅ Auto-logout: User chose to continue session');
    setShowWarning(false);
    reset(); // Resetear el timer
  }, []);

  const handleIdle = useCallback(() => {
    if (!shouldBeEnabled) return;
    
    console.log('⏰ Auto-logout: User is idle, showing warning');
    setShowWarning(true);
  }, [shouldBeEnabled]);

  const handleActive = useCallback(() => {
    if (showWarning) {
      console.log('🔄 Auto-logout: User became active, hiding warning');
      setShowWarning(false);
    }
  }, [showWarning]);

  const { reset, pause, resume } = useIdleTimer({
    timeout: idleTime - (warningTime * 1000), // Mostrar advertencia antes del timeout final
    onIdle: handleIdle,
    onActive: handleActive,
    enabled: shouldBeEnabled
  });

  // Pausar el timer cuando se muestra la advertencia para evitar conflictos
  useEffect(() => {
    if (showWarning) {
      pause();
    } else if (shouldBeEnabled) {
      resume();
    }
  }, [showWarning, shouldBeEnabled, pause, resume]);

  // Limpiar estado cuando el usuario se desloguea
  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      setIsLoggingOut(false);
    }
  }, [user]);

  return {
    showWarning,
    warningTime,
    onContinue: handleContinueSession,
    onLogout: handleLogout,
    reset,
    pause,
    resume,
    isEnabled: shouldBeEnabled
  };
}