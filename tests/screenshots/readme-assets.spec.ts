/**
 * readme-assets.spec.ts
 *
 * Captures README screenshots from the live app.
 * Run against deployed site:  npm run shots:live
 * Run against localhost:       npm run shots  (starts dev server)
 *
 * Output: docs/assets/screenshots/*.png
 *
 * Rules:
 *  - Use deterministic demo jatak seeded via localStorage (no form fills)
 *  - Freeze clock so panchang tiles don't change daily
 *  - Each test is independent — one failure never blocks the rest
 */

import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'docs', 'assets', 'screenshots');
mkdirSync(OUT, { recursive: true });

// Deterministic demo jataks — never real birth data
const DEMO_A = { date: '1990-03-14', time: '06:42', location: 'Jaipur, Rajasthan (26.9124, 75.7873)' };
const DEMO_B = { date: '1992-11-02', time: '21:15', location: 'Pune, Maharashtra (18.5204, 73.8567)' };
const FROZEN = '2025-01-15T06:00:00.000+05:30';

// Seed localStorage before navigation so the app picks up demo state
async function seed(page: import('@playwright/test').Page, lang: 'en' | 'hi' = 'en') {
  await page.addInitScript(([l, a, b, f]) => {
    localStorage.setItem('vr.lang', l as string);
    localStorage.setItem('vr.demoJatak.a', JSON.stringify(a));
    localStorage.setItem('vr.demoJatak.b', JSON.stringify(b));
    localStorage.setItem('vr.frozenDate', f as string);
    // Pre-fill last-used profile so forms show a date without interaction
    localStorage.setItem('vr.lastProfile', JSON.stringify(a));
  }, [lang, DEMO_A, DEMO_B, FROZEN] as const);
}

async function shot(page: import('@playwright/test').Page, filename: string) {
  await page.waitForLoadState('load');
  await page.waitForTimeout(900); // settle CSS transitions / lazy mounts
  await page.screenshot({ path: join(OUT, filename), fullPage: false });
  console.log(`  ✓  ${filename}`);
}

// ── Desktop 1440×900 ─────────────────────────────────────────────────────────

test.describe('desktop 1440×900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('01-landing', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/');
    await shot(page, '01-landing.png');
  });

  test('02-kundli', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/horoscope');
    await shot(page, '02-kundli.png');
  });

  test('03-kundli-hi', async ({ page }) => {
    await seed(page, 'hi');
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/horoscope');
    await shot(page, '03-kundli-hi.png');
  });

  test('04-matchmaking', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/matchmaking');
    await shot(page, '04-matchmaking.png');
  });

  test('05-prashna', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    // /prashna-ai has the full horary engine UI; /prashna is just the input form
    await page.goto('/prashna-ai');
    await shot(page, '05-prashna.png');
  });

  test('06-panchang', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/panchang');
    await shot(page, '06-panchang.png');
  });

  test('07-accuracy', async ({ page }) => {
    await seed(page);
    await page.goto('/accuracy');
    await shot(page, '07-accuracy.png');
  });
});

// ── Mobile 390×844 ────────────────────────────────────────────────────────────

test.describe('mobile 390×844', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('08-mobile-kundli', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/horoscope');
    await shot(page, '08-mobile-kundli.png');
  });

  test('09-mobile-nav-open', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/horoscope');
    await page.waitForLoadState('load');
    await page.waitForTimeout(600);
    // Try hamburger button with multiple selectors
    const menuBtn = page.locator('[aria-label*="navigation"], [aria-label*="menu"], button.md\\:hidden').first();
    const visible = await menuBtn.isVisible({ timeout: 4000 }).catch(() => false);
    if (visible) {
      await menuBtn.click();
      await page.waitForTimeout(500); // sheet animation
    }
    await page.screenshot({ path: join(OUT, '09-mobile-nav.png'), fullPage: false });
    console.log('  ✓  09-mobile-nav.png');
  });

  test('10-mobile-panchang', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/panchang');
    await shot(page, '10-mobile-panchang.png');
  });
});
