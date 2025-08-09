'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface IdleWarningModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onLogout: () => void;
  warningTime?: number; // Tiempo de advertencia en segundos
}

export function IdleWarningModal({
  isOpen,
  onContinue,
  onLogout,
  warningTime = 60 // 1 minuto de advertencia por defecto
}: IdleWarningModalProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(warningTime);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(warningTime);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, warningTime, onLogout]);

  const progressValue = ((warningTime - timeLeft) / warningTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Sesión por Expirar
          </DialogTitle>
          <DialogDescription>
            Tu sesión expirará por inactividad. ¿Deseas continuar?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-destructive">
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-muted-foreground">
              Tiempo restante antes del cierre automático
            </p>
          </div>

          <Progress value={progressValue} className="w-full" />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
          <Button
            onClick={onContinue}
            className="w-full sm:w-auto"
          >
            Continuar Sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}