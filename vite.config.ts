import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'swisseph-wasm': process.env.VITE_USE_EDGE_EPHEMERIS
        ? fileURLToPath(new URL('./src/stubs/swisseph-stub.ts', import.meta.url))
        : 'swisseph-wasm',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
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
          // Split into two chunks so the most common primitives load first
          if (id.includes('@radix-ui/react-dialog')
            || id.includes('@radix-ui/react-dropdown-menu')
            || id.includes('@radix-ui/react-popover')
            || id.includes('@radix-ui/react-select')
            || id.includes('@radix-ui/react-tabs')
            || id.includes('@radix-ui/react-tooltip')) {
            return 'radix-core';
          }
          if (id.includes('@radix-ui')) return 'radix-extra';

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
    include: ['src/tests/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx,js,jsx}'],
  },
});
