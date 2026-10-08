import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // generateSW: Vite-plugin-pwa auto-generates the service worker.
      // No workbox imports needed in sw.ts with this strategy.
      strategies: 'generateSW',
      workbox: {
        // Cache chart API responses
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/charts/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'chart-calculations',
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\/ephemeris/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ephemeris-data',
              expiration: { maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
        // Exclude swisseph-wasm WASM from precache (too large)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Vedic Rajkumar',
        short_name: 'Vedic',
        description: 'Vedic Astrology Platform & Ephemeris Engine',
        theme_color: '#b45309',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // When edge ephemeris is enabled, swap swisseph-wasm with a browser stub
      'swisseph-wasm': process.env.VITE_USE_EDGE_EPHEMERIS
        ? fileURLToPath(new URL('./src/stubs/swisseph-stub.ts', import.meta.url))
        : 'swisseph-wasm',
      // Browser stubs for Node built-ins required by swisseph-wasm
      'node:module': fileURLToPath(new URL('./src/stubs/node-module.ts', import.meta.url)),
      'node:path': fileURLToPath(new URL('./src/stubs/node-path.ts', import.meta.url)),
      'node:url': fileURLToPath(new URL('./src/stubs/node-url.ts', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  optimizeDeps: {
    // swisseph-wasm uses WASM + Node APIs — exclude from pre-bundling
    exclude: ['swisseph-wasm'],
  },
  build: {
    // Warn at 400 KB — Lighthouse penalises > 500 KB first-load JS
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      external: ['pdfjs-dist'],
      output: {
        // ── Manual chunk strategy ────────────────────────────────────────────
        // Goal: keep the initial bundle under 200 KB by lazy-loading heavy
        // deps. Each group is loaded only when a route that uses it is visited.
        manualChunks(id: string) {
          // ── Ephemeris engine (largest single dep ~2 MB) ──────────────────
          if (id.includes('swisseph-wasm')) return 'swisseph';

          // ── PDF generation ───────────────────────────────────────────────
          if (id.includes('jspdf') || id.includes('jspdf-autotable')) return 'pdf';

          // ── Charts / data visualisation ──────────────────────────────────
          if (id.includes('recharts')) return 'charts';

          // ── Animation ────────────────────────────────────────────────────
          if (id.includes('framer-motion')) return 'animation';

          // ── Icons (lucide) ───────────────────────────────────────────────
          if (id.includes('lucide-react')) return 'icons';

          // ── Clerk auth (large SDK + iframe) ─────────────────────────────
          if (id.includes('@clerk')) return 'auth';

          // ── TanStack Query ────────────────────────────────────────────────
          if (id.includes('@tanstack')) return 'query';

          // ── PostHog analytics ─────────────────────────────────────────────
          if (id.includes('posthog-js')) return 'analytics';

          // ── Radix UI primitives ───────────────────────────────────────────
          if (id.includes('@radix-ui')) return 'radix';

          // ── Supabase client ───────────────────────────────────────────────
          if (id.includes('@supabase')) return 'supabase';

          // ── Zod validation ────────────────────────────────────────────────
          if (id.includes('/zod/')) return 'validation';

          // ── IndexedDB cache (idb) ─────────────────────────────────────────
          if (id.includes('/idb/')) return 'idb';

          // Everything else stays in the vendor chunk
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
    include: [
      'src/tests/**/*.{test,spec}.{ts,tsx}',
      'src/test/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],
  },
});
