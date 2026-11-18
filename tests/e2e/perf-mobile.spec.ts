/**
 * perf-mobile.spec.ts — long-task + main-thread measurement on a throttled CPU.
 *
 * Playwright's CPU throttling is not a real Pixel 4a, but it is 20x more honest
 * than a desktop preset, and it catches the regression that matters: a heavy
 * computation back on the main thread.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';

const BUDGET_MS = 250;

test.use({ viewport: { width: 393, height: 851 } });   // Pixel-class

test('kundli compute does not block the main thread', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP throttling is chromium-only');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto('/');
  await page.getByTestId('tier-badge').first().waitFor();

  const longTasks = await page.evaluate(async () => {
    const tasks: number[] = [];
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) tasks.push(e.duration);
    });
    obs.observe({ entryTypes: ['longtask'] });
    (window as unknown as { __runChart?: () => Promise<unknown> }).__runChart?.();
    await new Promise((r) => setTimeout(r, 3000));
    obs.disconnect();
    return tasks;
  });

  const blocking = longTasks.filter((d) => d > BUDGET_MS);
  fs.mkdirSync('reports/perf', { recursive: true });
  fs.writeFileSync(
    'reports/perf/mobile-mainthread.json',
    JSON.stringify({ longTasks, blocking, budgetMs: BUDGET_MS, at: new Date().toISOString() }, null, 2),
  );

  expect(blocking, `tasks over ${BUDGET_MS}ms: ${blocking.join(', ')}`).toEqual([]);
});
