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
    // One manual tool rewrites baselines from the engine itself and must never
    // run inside the normal suite — it would turn a gate circular.
    //   generateGolden  rewrites tools/accuracy/golden/ (Swiss Ephemeris)
    // The Shadbala oracle goldens come from scripts/accuracy-shadbala-golden.mjs
    // (a script, not a test), so they need no entry here.
    exclude: [
      ...configDefaults.exclude,
      '**/src/tests/accuracy/generateGolden.test.ts',
    ],
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
    // the stock 10s hook budget on the same "passes on retry" pattern. The CI
    // gate that keeps DEF-010 closed runs the *hookless* suites at
    // `--hookTimeout=2000` (see .github/workflows/accuracy.yml).
    hookTimeout: 30000,
    // Coverage is SCOPED, not global (Week 15 "Strengthen"). The interpretive
    // core — `src/lib/vedic` and `src/services` — is where an untested branch
    // becomes a confidently wrong verdict; it is small enough to hold a real
    // floor, and it is the only place a threshold would mean anything. UI,
    // routes and generated artifacts are deliberately out of scope.
    //
    // Requires `@vitest/coverage-v8`, which is NOT yet a dependency: it is only
    // loaded when `--coverage` is passed, so plain `vitest run` (and therefore
    // CI today) is unaffected. Install it with the repo's pinned toolchain —
    // **npm 10 on Node 22**, never npm 11 — or the lockfile CI depends on gets
    // rewritten:
    //   npm i -D @vitest/coverage-v8@4.1.11
    //
    // These numbers are a floor to ratchet, not a measured result: the first
    // `npm run test:coverage` on a machine that has the provider installed is
    // the calibration run. Raise them; do not lower them to make a red run pass.
    coverage: {
      provider: 'v8',
      include: ['src/lib/vedic/**', 'src/services/**'],
      reporter: ['text-summary'],
      thresholds: { lines: 50, functions: 50, statements: 50, branches: 40 },
    },
  },
});
