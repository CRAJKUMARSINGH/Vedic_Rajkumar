import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  // Tier/billing personas require the grade projects in
  // playwright.tiers.config.ts (free/pro/enterprise). They throw
  // "Unknown project" under the single chromium project — exclude them here.
  testIgnore: ["**/tier-matrix.spec.ts", "**/tier-parity.spec.ts", "**/billing-parity.spec.ts"],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: process.env.CI ? "github" : "list",
  // 90s per test: covers WASM ephemeris cold-start (~50s) + navigation (60s)
  // + all assertions. The default 30s was exceeded by route / on first load.
  timeout: 90_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Cold dev-server module transform is slow on first requests; give
    // navigations the same headroom as tests/e2e/all-routes.spec.ts.
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
