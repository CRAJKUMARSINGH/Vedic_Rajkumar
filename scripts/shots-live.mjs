#!/usr/bin/env node
/**
 * shots-live.mjs — run Playwright screenshots against the deployed site.
 * Works on Windows PowerShell, bash, and CI.
 *
 *   node scripts/shots-live.mjs                                 (uses default URL)
 *   node scripts/shots-live.mjs https://your-site.netlify.app  (override URL)
 */
import { spawnSync } from 'node:child_process';

const url = process.argv[2] ?? 'https://vedic-rajkumar.netlify.app';

console.log(`\n📸  Capturing screenshots from: ${url}\n`);

const result = spawnSync(
  'npx',
  ['playwright', 'test', '--config', 'playwright.screenshots.config.ts'],
  {
    env:   { ...process.env, PLAYWRIGHT_BASE_URL: url },
    stdio: 'inherit',
    shell: true,
  },
);

process.exit(result.status ?? 1);
