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
    // Explicit, not the framework default. A couple of suites walk `src/` and
    // read the emitted answer corpus, so on a saturated CI filesystem a short
    // budget can be spent on I/O alone and the test fails on wall-clock rather
    // than on an assertion (DEF-010). Those files carry their own larger
    // timeout; this is the floor for everything else.
    //
    // This was THE knob for DEF-010: the timed work ran inside `it()` bodies
    // (chartTimezoneWiring.test.ts walked `src/` in two tests; schema.test.ts
    // read the answer corpus per topic). Neither file had hooks, so the stock
    // 10s hookTimeout was never in play — note the old explicit 10000 here
    // simply happened to equal the 10s hook default.
    testTimeout: 20000,
    // Insurance, not the DEF-010 fix. `wasmPathAccuracy.test.ts` loads the
    // Swiss Ephemeris WASM inside `beforeAll`, so a saturated disk could blow
    // the stock 10s hook budget on the same "passes on retry" pattern.
    hookTimeout: 30000,
  },
});
