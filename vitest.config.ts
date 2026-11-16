import { defineConfig, configDefaults } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    // generateGolden rewrites tools/accuracy/golden/ from the engine itself
    // (a self-consistent baseline). If it ran in the normal suite it would
    // overwrite the independent Swiss Ephemeris golden and make the accuracy
    // gate circular. It is a manual tool — see its own header.
    exclude: [...configDefaults.exclude, '**/src/tests/accuracy/generateGolden.test.ts'],
    // Heavy ephemeris tests (e.g. 30-day transit scans) exceed 10s on
    // memory-constrained hosts; 60s prevents flaky timeouts without hiding
    // real hangs (vitest still fails genuinely stuck tests).
    testTimeout: 60000,
    // Cap fork workers: the suite loads the WASM ephemeris per worker and the
    // default (one per CPU core) exhausts memory on developer machines, causing
    // "Timeout waiting for worker to respond" / ENOENT worker crashes.
    maxWorkers: 4,
  },
});
