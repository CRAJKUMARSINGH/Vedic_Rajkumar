import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import viteConfig from './vite.config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // Align Vitest's alias resolution with Vite
    alias: viteConfig?.resolve?.alias ?? {
      '@': resolve(__dirname, 'src'),
    },
    // Include test files
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    // Optional timeout
    timeout: 10000,
  },
  resolve: {
    alias: viteConfig?.resolve?.alias ?? {
      '@': resolve(__dirname, 'src'),
    },
  },
});
