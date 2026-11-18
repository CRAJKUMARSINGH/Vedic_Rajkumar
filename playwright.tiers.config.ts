import { defineConfig, devices } from '@playwright/test';
import { storageStatePath } from './tests/e2e/fixtures/tierSessions';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';
// Local: reuse system Edge (no Chromium download). CI: PW_CHANNEL="" -> bundled Chromium.
const channel = (process.env.PW_CHANNEL ?? 'msedge') || undefined;

const gradeProject = (grade: 'free' | 'pro' | 'enterprise') => ({
  name: grade,
  testMatch: '**/tier-matrix.spec.ts',
  dependencies: ['setup'],
  use: {
    ...devices['Desktop Chrome'],
    ...(channel ? { channel } : {}),
    storageState: storageStatePath(grade),
  },
});

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 120_000,
  // `channel` is set here (not per grade project) so the `setup` project uses it
  // too — otherwise setup needs a bundled Chromium download even locally.
  use: { baseURL, ...(channel ? { channel } : {}), trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'setup', testMatch: '**/tier-matrix.setup.ts' },
    gradeProject('free'),
    gradeProject('pro'),
    gradeProject('enterprise'),
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
