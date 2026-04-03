/**
 * Week 0: Vite Build Configuration
 * Optimized for production with proper code splitting and compression
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import compression from 'vite-plugin-compression';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    // Security headers in dev
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },

  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Gzip compression
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
    // Brotli compression (better than gzip)
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@types': path.resolve(__dirname, './src/types'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@services': path.resolve(__dirname, './src/services'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },

  build: {
    target: 'es2020',
    sourcemap: mode === 'development',
    // Warn if chunk > 1MB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks(id) {
          // ── Vendor chunks ──────────────────────────────────────────────────
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/@tanstack')) return 'vendor-tanstack';
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) return 'vendor-charts';
          if (id.includes('node_modules/jspdf')) return 'vendor-pdf';
          if (id.includes('node_modules/astronomia')) return 'vendor-astronomy';
          if (id.includes('node_modules/react-router')) return 'vendor-router';

          // ── Core calculation services (loaded immediately) ─────────────────
          if (
            id.includes('src/services/precisionEphemerisService') ||
            id.includes('src/services/ephemerisService') ||
            id.includes('src/services/ascendantService') ||
            id.includes('src/services/nakshatraService') ||
            id.includes('src/services/manglikService') ||
            id.includes('src/constants/astrology') ||
            id.includes('src/lib/astroUtils')
          ) {
            return 'services-core';
          }

          // ── Advanced astrology services ────────────────────────────────────
          if (
            id.includes('src/services/dashaService') ||
            id.includes('src/services/yogaService') ||
            id.includes('src/services/shadabalaService') ||
            id.includes('src/services/ashtakavargaService') ||
            id.includes('src/services/divisionalChartsService') ||
            id.includes('src/services/jaiminiService') ||
            id.includes('src/services/tajikService') ||
            id.includes('src/services/kpSystemService')
          ) {
            return 'services-astro';
          }

          // ── New feature services (lazy loaded) ─────────────────────────────
          if (
            id.includes('src/services/westernAstrologyService') ||
            id.includes('src/services/chineseAstrologyService') ||
            id.includes('src/services/aiPredictionService') ||
            id.includes('src/services/horaryAstrologyService') ||
            id.includes('src/services/medicalAstrologyService') ||
            id.includes('src/services/numerologyService') ||
            id.includes('src/services/financialAstrologyService')
          ) {
            return 'services-new';
          }

          // ── Transit data ───────────────────────────────────────────────────
          if (id.includes('src/data/transitData') || id.includes('src/data/enhancedTransitEffects')) {
            return 'data-transit';
          }
        },
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['astronomia'], // Large package, let Vite handle it
  },

  // Environment variables prefix
  envPrefix: 'VITE_',
}));
