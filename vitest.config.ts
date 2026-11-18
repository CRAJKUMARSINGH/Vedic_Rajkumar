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
    // Explicit floor timeout. Suites that walk `src/` or read the answer corpus
    // (chartTimezoneWiring, schema) can spend a large portion of a short budget
    // on I/O alone on a saturated filesystem — causing wall-clock failures
    // rather than assertion failures (DEF-010). Files with longer needs carry
    // their own per-test timeout; 20s is the universal floor.
    testTimeout: 20000,
    // Insurance for WASM `beforeAll` (wasmPathAccuracy loads Swiss Ephemeris;
    // a saturated disk can blow a 10s hook budget). 30s prevents the same
    // "passes on retry" pattern that DEF-010 exposed for `it()` bodies.
    hookTimeout: 30000,
    // Cap fork workers: the WASM ephemeris loads per worker and exhausts memory
    // on developer machines with the default (one per CPU core), causing
    // "Timeout waiting for worker to respond" / ENOENT worker crashes.
    maxWorkers: 4,
  },
});
