/**
 * playwright.robustness.config.ts
 *
 * Dedicated config for the browser robustness harness. It drives the app with
 * the SYSTEM Microsoft Edge / Chrome binaries (channel) so it runs without
 * downloading Playwright's bundled Chromium, and it reuses an already-running
 * dev server on 127.0.0.1:5173.
 *
 * Run:  npm run dev -- --host 127.0.0.1     (in one terminal)
 *       npx playwright test --config=playwright.robustness.config.ts
 */

import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/robustness-random-birth.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-channel',
      use: { ...devices['Desktop Chrome'], channel: 'msedge' },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
