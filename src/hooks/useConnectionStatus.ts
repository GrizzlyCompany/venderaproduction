'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/lib/user.service';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check database connectivity
  const checkDbConnection = async () => {
    try {
      const connected = await userService.testConnection();
      setIsDbConnected(connected);
      setLastChecked(new Date());
      return connected;
    } catch (error) {
      console.error('Database connection check failed:', error);
      setIsDbConnected(false);
      setLastChecked(new Date());
      return false;
    }
  };

  // Auto-check database connection periodically when online
  useEffect(() => {
    if (!isOnline) {
      setIsDbConnected(false);
      return;
    }

    // Initial check
    checkDbConnection();

    // Check every 30 seconds when online
    const interval = setInterval(checkDbConnection, 30000);

    return () => clearInterval(interval);
  }, [isOnline]);

  return {
    isOnline,
    isDbConnected,
    lastChecked,
    checkDbConnection,
    isFullyConnected: isOnline && isDbConnected
  };
}