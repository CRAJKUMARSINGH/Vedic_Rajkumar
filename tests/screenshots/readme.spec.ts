/**
 * readme.spec.ts — README screenshot generator.
 *
 * Captures the app's real routes and writes PNGs to docs/assets/screenshots/.
 * Run with `npm run shots` (uses playwright.screenshots.config.ts). It is NOT
 * part of the normal e2e suite, so it never runs in CI.
 *
 * Routes captured come from src/routes/appRoutes.tsx:
 *   /            Landing                → home.png
 *   /horoscope   Kundli / birth chart   → kundli.png
 *   /matchmaking Matchmaking (Kundli Milan) → matchmaking.png
 *   /prashna-ai  Prashna (horary)       → prashna.png
 *   /panchang    Panchang + Muhurat     → panchang.png
 *   /accuracy    Accuracy dashboard     → accuracy.png
 *   / (Hindi UI)                        → hindi.png
 *   /horoscope (390×844)                → mobile.png
 */
import { test, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../../docs/assets/screenshots');
fs.mkdirSync(OUT, { recursive: true });

/** Pre-dismiss the consent banner so it never obscures a screenshot. */
async function seedConsent(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem(
        'vr-consent',
        JSON.stringify({ given: false, timestamp: new Date().toISOString(), version: 1 }),
      );
    } catch {
      /* ignore */
    }
  });
}

/** Navigate, wait for the app shell, then let lazy charts settle. */
async function gotoStable(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page
    .locator('#root, main')
    .first()
    .waitFor({ state: 'visible', timeout: 30_000 })
    .catch(() => {});
  await page.waitForTimeout(1800);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

test.describe.configure({ mode: 'serial', timeout: 240_000 });

test.describe('README screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await seedConsent(page);
  });

  test('desktop features', async ({ page }) => {
    await gotoStable(page, '/');
    await shot(page, 'home');

    await gotoStable(page, '/horoscope');
    await page.locator('#dob').fill('15/08/1990');
    await page.locator('#tob').fill('10:30');
    await page.locator('#pob').fill('New Delhi');
    const readBtn = page.getByRole('button', { name: /Get Transit Reading|गोचर फल देखें/ });
    if (await readBtn.isVisible().catch(() => false)) {
      await readBtn.click();
      await page
        .getByText(/Overall Score|समग्र स्कोर/)
        .first()
        .waitFor({ timeout: 45_000 })
        .catch(() => {});
      await page.waitForTimeout(1500);
    }
    await shot(page, 'kundli');

    await gotoStable(page, '/matchmaking');
    await shot(page, 'matchmaking');

    await gotoStable(page, '/prashna-ai');
    await shot(page, 'prashna');

    await gotoStable(page, '/panchang');
    await shot(page, 'panchang');

    await gotoStable(page, '/accuracy');
    await shot(page, 'accuracy');

    // Hindi UI — the header toggle (src/components/Navigation.tsx). In English
    // mode its accessible name is the "switch to Hindi" label.
    await gotoStable(page, '/');
    const hiToggle = page.getByRole('button', { name: 'हिंदी भाषा में बदलें' });
    if (await hiToggle.isVisible().catch(() => false)) {
      await hiToggle.click();
      await page.waitForTimeout(1000);
    }
    await shot(page, 'hindi');
  });

  test('mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStable(page, '/horoscope');
    await shot(page, 'mobile');
  });
});
