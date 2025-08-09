
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/lib/user.service';
import { useState } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "No estás autenticado",
        description: "Debes iniciar sesión para actualizar tu plan.",
        variant: 'destructive',
      });
      return;
    }

    setIsUpgrading(true);
    try {
      await userService.grantProSubscription(user.id);
      await refreshUser();
      toast({
        title: "¡Bienvenido a Pro!",
        description: "Has desbloqueado todas las funciones de VENDRA Pro.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error en la actualización",
        description: error.message || "No se pudo completar la actualización. Por favor, intenta de nuevo.",
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };
  
  const features = [
    "Mensajería directa con vendedores",
    "Acceso prioritario a nuevos listados",
    "Soporte premium al cliente"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Star className="h-8 w-8 text-primary" />
            </div>
          <DialogTitle className="text-2xl font-headline">Actualiza a VENDRA Pro</DialogTitle>
          <DialogDescription className="text-md">
            Desbloquea la comunicación directa con los vendedores y más funciones exclusivas.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6">
            <ul className="space-y-3">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button type="button" size="lg" onClick={handleUpgrade} className="w-full" disabled={isUpgrading}>
            {isUpgrading && <Loader2 className="animate-spin mr-2" />}
            Actualizar a Pro - $3.99/mes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
