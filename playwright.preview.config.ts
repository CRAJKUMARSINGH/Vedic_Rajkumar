import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for verifying the PRODUCTION build via `vite preview`.
 *
 * The default playwright.config.ts runs against the Vite dev server, which is
 * NOT sufficient to establish a PWA / service-worker failure (PATCH 5). Run:
 *
 *   npm run build
 *   npx playwright test --config playwright.preview.config.ts
 */
const baseURL = process.env.PLAYWRIGHT_PREVIEW_URL ?? 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests/e2e',
  // production-* verifies the built bundle (PATCH 5/6); persona-users is the
  // PATCH 7 regression suite, whose offline test also needs the real bundle.
  testMatch: [
    '**/production-*.spec.ts',
    '**/persona-users.spec.ts',
    '**/persona-tiers.spec.ts',
    '**/perf-mobile.spec.ts',
    '**/landing-page-links.spec.ts',
  ],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: 'chromium-preview',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx vite preview --host 127.0.0.1 --port 4173',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

