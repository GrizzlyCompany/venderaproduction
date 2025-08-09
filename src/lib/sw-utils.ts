'use client';

/**
 * Utility functions for managing Service Worker cache in production
 */

export const clearServiceWorkerCache = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        console.log('🧹 Unregistering service worker:', registration.scope);
        await registration.unregister();
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('🧹 Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }
      
      console.log('✅ Service worker cache cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing service worker cache:', error);
      return false;
    }
  }
  return false;
};

export const refreshServiceWorker = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        if (registration.waiting) {
          console.log('🔄 Activating waiting service worker');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        console.log('🔄 Updating service worker:', registration.scope);
        await registration.update();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error refreshing service worker:', error);
      return false;
    }
  }
  return false;
};

export const forcePageReload = () => {
  if (typeof window !== 'undefined') {
    console.log('🔄 Force reloading page...');
    window.location.reload();
  }
};