'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Clock, Wifi } from 'lucide-react';
import { AUTH_CONFIG } from '@/config/auth';

export function SessionIndicator() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Escuchar eventos de actividad
    AUTH_CONFIG.ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Actualizar el tiempo restante cada segundo
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const remaining = AUTH_CONFIG.IDLE_TIME - elapsed;
      
      if (remaining > 0) {
        setTimeLeft(Math.floor(remaining / 1000));
      } else {
        setTimeLeft(0);
      }
    }, 1000);

    return () => {
      AUTH_CONFIG.ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(interval);
    };
  }, [user, lastActivity]);

  if (!user || timeLeft === null) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVariant = () => {
    if (timeLeft < 120) return 'destructive'; // Menos de 2 minutos
    if (timeLeft < 300) return 'secondary'; // Menos de 5 minutos
    return 'outline';
  };

  // Solo mostrar cuando queden menos de 5 minutos
  if (timeLeft > 300) return null;

  return (
    <Badge variant={getVariant()} className="fixed bottom-4 left-4 z-50">
      <Clock className="w-3 h-3 mr-1" />
      Sesión: {formatTime(timeLeft)}
    </Badge>
  );
}