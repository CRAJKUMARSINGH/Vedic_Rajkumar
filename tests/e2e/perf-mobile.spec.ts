/**
 * perf-mobile.spec.ts — long-task measurement during a REAL kundli calculation.
 *
 * Journey: /horoscope → fill synthetic birth details → submit → measure
 * long tasks while the chart computes and renders. CPU throttled 4x.
 * Budget: no single long task > 250ms (main thread stays responsive).
 */
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';

const BUDGET_MS = 250;

test.use({ viewport: { width: 393, height: 851 } });   // Pixel-class

test('kundli compute does not block the main thread', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP throttling is chromium-only');
  test.setTimeout(240_000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Pre-seed cookie consent so the banner cannot overlay the submit CTA
  // (same localStorage contract the persona specs use).
  await page.addInitScript(() => {
    try {
      localStorage.setItem('vr-consent', JSON.stringify({ given: true, timestamp: new Date().toISOString(), version: 1 }));
    } catch { /* ignore */ }
  });

  await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.locator('#dob').waitFor({ timeout: 30_000 });

  // Deterministic synthetic birth details (no real personal data).
  await page.locator('#dob').fill('15/08/1990');
  await page.locator('#tob').fill('06:30');
  await page.locator('#pob').fill('Mumbai');

  // Pick a suggestion if the geocoder answers; otherwise the typed city is
  // still valid (location.length >= 2).
  const listbox = page.locator('#location-listbox');
  try {
    await listbox.waitFor({ state: 'visible', timeout: 6_000 });
    await listbox.locator('[role="option"]').first().click();
    await listbox.waitFor({ state: 'hidden', timeout: 5_000 });
  } catch { /* cached/offline path — typed value remains */ }

  const submit = page.getByRole('button', { name: /Get Transit Reading|गोचर फल देखें/ });
  await expect(submit).toBeEnabled({ timeout: 15_000 });

  // Start observing BEFORE the click so the calculation's long tasks count.
  await page.evaluate(() => {
    (window as unknown as { __longTasks: number[] }).__longTasks = [];
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        (window as unknown as { __longTasks: number[] }).__longTasks.push(e.duration);
    });
    obs.observe({ entryTypes: ['longtask'] });
    (window as unknown as { __obs?: PerformanceObserver }).__obs = obs;
  });

  await submit.click();

  // Wait for the computed result — proves the journey actually ran.
  await expect(
    page.getByText(/Overall Score|समग्र स्कोर/).first(),
  ).toBeVisible({ timeout: 120_000 });

  // Give trailing tasks a moment, then harvest.
  await page.waitForTimeout(1_000);
  const longTasks = await page.evaluate(() => {
    const w = window as unknown as { __longTasks: number[]; __obs?: PerformanceObserver };
    w.__obs?.disconnect();
    return w.__longTasks ?? [];
  });

  const blocking = longTasks.filter((d) => d > BUDGET_MS);
  fs.mkdirSync('reports/perf', { recursive: true });
  fs.writeFileSync(
    'reports/perf/mobile-mainthread.json',
    JSON.stringify({
      longTasks, blocking, budgetMs: BUDGET_MS,
      route: '/horoscope real submission', cpuThrottle: '4x',
      at: new Date().toISOString(),
    }, null, 2),
  );

  expect(blocking, `tasks over ${BUDGET_MS}ms: ${blocking.join(', ')}`).toEqual([]);
});
