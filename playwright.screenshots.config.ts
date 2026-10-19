import { defineConfig, devices } from "@playwright/test";

/**
 * Dedicated Playwright config for generating the README screenshots.
 *
 * Run:
 *   npm run shots                     # localhost (starts dev server)
 *   npm run shots:live                # against deployed site
 *   npm run shots:live https://...    # custom URL
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5180";
const isRemote = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./tests/screenshots",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 1,          // one automatic retry on flaky network
  timeout: 45_000,     // 45s per test — live site can be slow to load
  reporter: "list",
  use: {
    baseURL,
    trace: "off",
    screenshot: "off",
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: isRemote
    ? undefined
    : {
        command: "npm run dev -- --host 127.0.0.1 --port 5180 --strictPort",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
