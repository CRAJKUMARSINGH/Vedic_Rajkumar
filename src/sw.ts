/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Parameters<typeof precacheAndRoute>[0];
};

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache chart calculations (expensive, slow-changing)
registerRoute(
  ({ url }) => url.pathname.includes('/api/v1/charts'),
  new StaleWhileRevalidate({
    cacheName: 'chart-calculations',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
);

// Cache ephemeris data (huge, immutable)
registerRoute(
  ({ url }) => url.pathname.includes('/ephemeris'),
  new CacheFirst({
    cacheName: 'ephemeris-data',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);
