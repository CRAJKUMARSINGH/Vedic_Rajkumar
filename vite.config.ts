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
    rollupOptions: {
      external: ['pdfjs-dist'],
      output: {
        manualChunks: {
          'swisseph': ['swisseph-wasm'],
          'pdf': ['jspdf', 'jspdf-autotable'],
          'charts': ['recharts'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
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
