'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ConnectionErrorProps {
  onRetry?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
}

export function ConnectionError({ 
  onRetry, 
  title, 
  description, 
  showRetry = true 
}: ConnectionErrorProps) {
  const { t } = useTranslation();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <WifiOff className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-lg">
          {title || 'Problema de Conexión'}
        </CardTitle>
        <CardDescription>
          {description || 'No se pudo conectar con la base de datos. Esto puede ser temporal.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>• Verifica tu conexión a internet</p>
          <p>• El servicio puede estar temporalmente no disponible</p>
          <p>• Intenta recargar la página</p>
        </div>
        
        {showRetry && (
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reintentando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </>
            )}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Recargar Página
        </Button>
      </CardContent>
    </Card>
  );
}