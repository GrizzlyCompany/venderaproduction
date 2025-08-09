'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeout: number; // Tiempo en milisegundos
  onIdle: () => void; // Función a ejecutar cuando el usuario esté inactivo
  onActive?: () => void; // Función a ejecutar cuando el usuario vuelva a estar activo
  events?: string[]; // Eventos a escuchar para detectar actividad
  enabled?: boolean; // Si el timer está habilitado
}

export function useIdleTimer({
  timeout,
  onIdle,
  onActive,
  events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ],
  enabled = true
}: UseIdleTimerOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Si estaba inactivo y ahora hay actividad, ejecutar onActive
    if (isIdleRef.current && onActive) {
      onActive();
      isIdleRef.current = false;
    }

    // Limpiar el timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Establecer nuevo timeout
    timeoutRef.current = setTimeout(() => {
      if (!isIdleRef.current) {
        isIdleRef.current = true;
        onIdle();
      }
    }, timeout);
  }, [timeout, onIdle, onActive, enabled]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      // Limpiar timer si está deshabilitado
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Iniciar el timer
    resetTimer();

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled, events, handleActivity, resetTimer]);

  // Función para resetear manualmente el timer
  const reset = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Función para pausar el timer
  const pause = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Función para reanudar el timer
  const resume = useCallback(() => {
    if (enabled) {
      resetTimer();
    }
  }, [enabled, resetTimer]);

  return {
    reset,
    pause,
    resume,
    isIdle: isIdleRef.current
  };
}