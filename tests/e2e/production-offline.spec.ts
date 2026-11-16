import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PATCH 5 + PATCH 6 — production-build verification.
 *
 * Runs against `vite preview` (see playwright.preview.config.ts), NOT the dev
 * server, because a service-worker/offline claim can only be trusted against a
 * real production bundle.
 *
 * PATCH 6 — records every non-OK response and failed request on the home page
 * so a missing resource is identified by URL + status instead of masked.
 * PATCH 5 — loads /panchang online, waits for the service worker, confirms the
 * shell is cached, goes offline, reloads, and verifies a usable offline state.
 */

const evidenceDir = path.join(process.cwd(), 'reports', 'evidence');
if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

// These checks are only meaningful against the production bundle served by
// `vite preview` (playwright.preview.config.ts, port 4173). The dev server has
// no service worker, so skip on it and keep `npm run test:e2e` honest.
test.beforeEach(async ({ baseURL }) => {
  test.skip(!String(baseURL ?? '').includes(':4173'), 'production-preview only (playwright.preview.config.ts)');
});

test('PATCH 6 — home page loads with no unexplained 4xx/5xx in production', async ({ page }) => {
  const bad: string[] = [];
  const failed: string[] = [];
  const consoleErrors: string[] = [];

  page.on('response', (res) => {
    if (res.status() >= 400) {
      bad.push(`${res.status()} ${res.request().resourceType()} ${res.url()}`);
    }
  });
  page.on('requestfailed', (req) => {
    failed.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText ?? 'unknown'}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('/', { waitUntil: 'load', timeout: 60_000 });
  await page.waitForTimeout(4000);

  const report = [
    '=== PRODUCTION home / — HTTP >=400 ===',
    ...(bad.length ? bad : ['(none)']),
    '',
    '=== PRODUCTION home / — requestfailed ===',
    ...(failed.length ? failed : ['(none)']),
    '',
    '=== PRODUCTION home / — console.error ===',
    ...(consoleErrors.length ? consoleErrors : ['(none)']),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(evidenceDir, 'production-home-assets.txt'), report, 'utf8');
  console.log(report);

  await expect(page.locator('body')).not.toContainText('Something went wrong');
  expect(bad, `Unexpected >=400 responses:\n${bad.join('\n')}`).toEqual([]);
});

test('PATCH 5 — /panchang works offline after service worker activation', async ({ page, context }) => {
  const log: string[] = [];

  await page.goto('/panchang', { waitUntil: 'load', timeout: 60_000 });

  // Wait for the service worker to activate.
  const swState = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'unsupported';
    const reg = await navigator.serviceWorker.ready;
    return reg.active ? reg.active.state : 'no-active-worker';
  });
  log.push(`serviceWorker.ready → ${swState}`);

  // Give workbox a moment to finish precaching, then inspect the caches.
  await page.waitForTimeout(3000);
  const cacheKeys = await page.evaluate(async () => {
    if (!('caches' in window)) return [] as string[];
    return await caches.keys();
  });
  log.push(`cache keys → ${JSON.stringify(cacheKeys)}`);

  const cachedShell = await page.evaluate(async () => {
    if (!('caches' in window)) return false;
    const names = await caches.keys();
    for (const name of names) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      if (keys.some((r) => new URL(r.url).pathname === '/' || new URL(r.url).pathname === '/index.html')) {
        return true;
      }
    }
    return false;
  });
  log.push(`app shell cached → ${cachedShell}`);

  // Assert the online page rendered real Panchang content.
  await expect(page.getByRole('heading', { name: /panchang/i }).first()).toBeVisible();
  const onlineText = await page.locator('body').innerText();
  log.push(`online body length → ${onlineText.length}`);

  // Go offline and reload.
  await context.setOffline(true);
  let offlineError: string | null = null;
  try {
    await page.reload({ waitUntil: 'load', timeout: 30_000 });
  } catch (e) {
    offlineError = (e as Error).message;
  }
  await page.waitForTimeout(2500);

  const offlineText = offlineError ? `(reload failed: ${offlineError})` : await page.locator('body').innerText();
  log.push(`offline reload error → ${offlineError ?? 'none'}`);
  log.push(`offline body length → ${offlineText.length}`);
  log.push(`offline body head → ${offlineText.slice(0, 300).replace(/\s+/g, ' ')}`);

  await page.screenshot({ path: path.join(evidenceDir, 'panchang-offline.png'), fullPage: true });

  fs.writeFileSync(
    path.join(evidenceDir, 'production-panchang-offline.txt'),
    ['=== PATCH 5 /panchang offline (production preview) ===', ...log, ''].join('\n'),
    'utf8',
  );

  // Restore online before assertions so failures report clearly.
  await context.setOffline(false);

  // Documented behaviour: the cached shell must render the page, not a blank
  // screen or an error boundary.
  expect(offlineError).toBeNull();
  expect(offlineText).not.toContain('Something went wrong');
  expect(offlineText).not.toContain('Application Error');
  expect(offlineText.trim().length).toBeGreaterThan(50);
});
