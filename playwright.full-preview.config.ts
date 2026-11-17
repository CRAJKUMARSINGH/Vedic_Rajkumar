import { defineConfig } from '@playwright/test';
import preview from './playwright.preview.config';

// Run every browser regression against the built app, including the production-only checks.
// Static preview avoids dev-server HMR caused by generated test reports.
export default defineConfig({
  ...preview,
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  workers: 2,
  timeout: 90_000,
});
