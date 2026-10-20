/**
 * readme-assets.spec.ts
 *
 * Captures README screenshots from the live app.
 * Run against deployed site:  npm run shots:live
 * Run against localhost:       npm run shots
 *
 * Output: docs/assets/screenshots/*.png
 *
 * Enrichment from vedic-vijay screenshot patch (2026-10-18):
 *  - Wait for a real heading via expect().toBeVisible() instead of a fixed
 *    timeout — never captures a half-rendered page
 *  - animations: 'disabled' for crisp, deterministic captures
 *  - Assert body does not contain an error boundary before capture
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
    localStorage.setItem('vr.lastProfile', JSON.stringify(a));
  }, [lang, DEMO_A, DEMO_B, FROZEN] as const);
}

// Wait for a real heading instead of a fixed timeout — robust against slow
// loads and never captures a half-rendered page.
async function shot(
  page: import('@playwright/test').Page,
  filename: string,
  heading?: RegExp | string,
) {
  if (heading) {
    await test.expect(page.getByRole('heading', { name: heading })).toBeVisible({
      timeout: 15_000,
    });
  } else {
    await page.waitForLoadState('load');
    await page.waitForTimeout(400);
  }
  // Never capture an error boundary — fail loudly instead of producing a thin PNG
  await test.expect(page.locator('body')).not.toContainText(
    /Something went wrong|Application Error|404/i,
  );
  await page.screenshot({
    path: join(OUT, filename),
    fullPage: false,
    animations: 'disabled',
  });
  console.log(`  ✓  ${filename}`);
}

// ── Desktop 1440×900 ─────────────────────────────────────────────────────────

test.describe('desktop 1440×900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('01-landing', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/');
    await shot(page, '01-landing.png', /Unlock the Stars|Vedic Rajkumar/i);
  });

  test('02-kundli', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/horoscope');
    await shot(page, '02-kundli.png', /Horoscope|राशिफल/i);
  });

  test('03-kundli-hi', async ({ page }) => {
    await seed(page, 'hi');
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/horoscope');
    await shot(page, '03-kundli-hi.png', /Horoscope|राशिफल/i);
  });

  test('04-matchmaking', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/matchmaking');
    await shot(page, '04-matchmaking.png', /Kundli Milan|Kundali Milan|Matchmaking|मिलान/i);
  });

  test('05-prashna', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/prashna-ai');
    await shot(page, '05-prashna.png', /Prashna|प्रश्न/i);
  });

  test('06-panchang', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/panchang');
    await shot(page, '06-panchang.png', /Panchang|पंचांग/i);
  });

  test('07-accuracy', async ({ page }) => {
    await seed(page);
    await page.goto('/accuracy');
    await shot(page, '07-accuracy.png', /Accuracy/i);
  });
});

// ── Mobile 390×844 ────────────────────────────────────────────────────────────

test.describe('mobile 390×844', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('08-mobile-kundli', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/horoscope');
    await shot(page, '08-mobile-kundli.png', /Horoscope|राशिफल/i);
  });

  test('09-mobile-nav-open', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/horoscope');
    await page.waitForLoadState('load');
    // Open the hamburger so the mobile sheet is visible in the shot
    const menuBtn = page
      .locator('[aria-label*="navigation"], [aria-label*="menu"], button.md\\:hidden')
      .first();
    const visible = await menuBtn.isVisible({ timeout: 4000 }).catch(() => false);
    if (visible) {
      await menuBtn.click();
      await page.waitForTimeout(500); // sheet slide-in animation
    }
    await page.screenshot({
      path: join(OUT, '09-mobile-nav.png'),
      fullPage: false,
      animations: 'disabled',
    });
    console.log('  ✓  09-mobile-nav.png');
  });

  test('10-mobile-panchang', async ({ page }) => {
    await seed(page);
    await page.clock.setFixedTime(new Date(FROZEN));
    await page.goto('/panchang');
    await shot(page, '10-mobile-panchang.png', /Panchang|पंचांग/i);
  });
});
