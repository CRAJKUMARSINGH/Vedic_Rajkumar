/**
 * Service Worker Registration
 * Registers service worker for offline support and caching
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';
      
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available
                    console.log('New content is available; please refresh.');
                    // You can show a notification to the user here
                  } else {
                    // Content is cached for offline use
                    console.log('Content is cached for offline use.');
                  }
                }
              };
            }
          };
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error('Service Worker unregistration failed:', error);
      });
  }
}

// Check if app is online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen for online/offline events
export function setupConnectionListeners() {
  window.addEventListener('online', () => {
    console.log('App is online');
    // You can trigger sync operations here
  });

  window.addEventListener('offline', () => {
    console.log('App is offline');
    // You can show offline notification here
  });
}

// Cache API responses
export async function cacheApiResponse(url: string, data: any) {
  if ('caches' in window) {
    try {
      const cache = await caches.open('api-cache-v1');
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(url, response);
      console.log('API response cached:', url);
    } catch (error) {
      console.error('Failed to cache API response:', error);
    }
  }
}

// Get cached API response
export async function getCachedApiResponse(url: string): Promise<any | null> {
  if ('caches' in window) {
    try {
      const cache = await caches.open('api-cache-v1');
      const response = await cache.match(url);
      if (response) {
        const data = await response.json();
        console.log('Using cached API response:', url);
        return data;
      }
    } catch (error) {
      console.error('Failed to get cached API response:', error);
    }
  }
  return null;
}

// Clear specific cache
export async function clearCache(cacheName: string) {
  if ('caches' in window) {
    try {
      await caches.delete(cacheName);
      console.log('Cache cleared:', cacheName);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

// Clear all caches
export async function clearAllCaches() {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear all caches:', error);
    }
  }
}

// Get cache statistics
export async function getCacheStats() {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      const stats = [];
      
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        stats.push({
          name,
          size: requests.length,
          urls: requests.map(req => req.url)
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }
  }
  return [];
}

// Precache important assets
export async function precacheAssets(assets: string[]) {
  if ('caches' in window) {
    try {
      const cache = await caches.open('precache-v1');
      await cache.addAll(assets);
      console.log('Assets precached:', assets);
    } catch (error) {
      console.error('Failed to precache assets:', error);
    }
  }
}

// Check if service worker is supported
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

// Get service worker registration
export async function getServiceWorkerRegistration() {
  if ('serviceWorker' in navigator) {
    return await navigator.serviceWorker.ready;
  }
  return null;
}