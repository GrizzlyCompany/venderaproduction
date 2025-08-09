'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { clearServiceWorkerCache, forcePageReload } from '@/lib/sw-utils';

interface NavigationDebuggerProps {
  expectedPath?: string;
  userId?: string;
}

export function NavigationDebugger({ expectedPath, userId }: NavigationDebuggerProps) {
  const pathname = usePathname();
  const [showDebugger, setShowDebugger] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Only show debugger in production and if we're not on the expected path
    const isProduction = process.env.NODE_ENV === 'production';
    const shouldShow = isProduction && 
                      expectedPath && 
                      !pathname.includes(expectedPath) &&
                      userId;
    
    if (shouldShow) {
      // Wait a bit to see if navigation completes
      const timer = setTimeout(() => {
        setShowDebugger(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setShowDebugger(false);
    }
  }, [pathname, expectedPath, userId]);

  const handleClearCacheAndReload = async () => {
    setIsClearing(true);
    try {
      await clearServiceWorkerCache();
      forcePageReload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      setIsClearing(false);
    }
  };

  const handleForceNavigation = () => {
    if (expectedPath) {
      window.location.href = expectedPath;
    }
  };

  if (!showDebugger) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
          <CardTitle>Problema de Navegación</CardTitle>
          <CardDescription>
            Parece que hubo un problema al navegar al perfil. Esto puede deberse al cache del navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Ruta actual:</strong> {pathname}</p>
            <p><strong>Ruta esperada:</strong> {expectedPath}</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleForceNavigation}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar Navegación Directa
            </Button>
            
            <Button 
              onClick={handleClearCacheAndReload}
              className="w-full"
              variant="outline"
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? 'Limpiando...' : 'Limpiar Cache y Recargar'}
            </Button>
            
            <Button 
              onClick={() => setShowDebugger(false)}
              className="w-full"
              variant="ghost"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}