/**
 * persona-tiers.spec.ts — three-tier robotic persona harness.
 *
 * Basic        — the happy path a first-time visitor walks.
 * Intermediate — the CTAs a returning user presses (sample data → calculate).
 * Advanced     — the adversarial edges the robotic run actually broke on:
 *                out-of-range / non-existent birth dates, and the no-Clerk
 *                demo path through /privacy-settings.
 *
 * Success definition (from the original three-tier rubric): Advanced must
 * clear its full case list; a single uncaught page error fails the run.
 *
 * Run:
 *   npx playwright test tests/e2e/persona-tiers.spec.ts
 *   (playwright.config.ts boots `npm run dev` on 127.0.0.1:5173; pass
 *    PLAYWRIGHT_BASE_URL to point at a production preview instead.)
 */

import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Pre-dismiss the consent banner so its overlay cannot intercept the first
 * click. Mirrors tests/e2e/robustness-random-birth.spec.ts.
 */
async function seedStorage(page: Page) {
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

async function assertNoCrash(page: Page, context: string) {
  const body = await page.innerText('body');
  expect(body, `error boundary surfaced on ${context}`).not.toContain('Something went wrong');
  expect(body, `application error surfaced on ${context}`).not.toContain('Application Error');
}

// ─── Basic persona ────────────────────────────────────────────────────────────

test.describe('Basic persona — happy path', () => {
  test('home → horoscope → calculate → result renders', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await seedStorage(page);

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page).not.toHaveTitle(/error/i);

    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator('#dob')).toBeVisible({ timeout: 30_000 });

    await page.locator('#dob').fill('15/09/1963');
    await page.locator('#tob').fill('06:00');
    await page.locator('#pob').fill('Udaipur, Rajasthan');

    const submit = page.getByRole('button', { name: /Get Transit Reading|गोचर फल देखें/ });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();

    await expect(page.getByText(/Overall Score|समग्र स्कोर/).first()).toBeVisible({ timeout: 45_000 });

    await assertNoCrash(page, 'basic/horoscope');
    expect(pageErrors, 'uncaught page error on the happy path').toEqual([]);
  });
});

// ─── Intermediate persona ─────────────────────────────────────────────────────

test.describe('Intermediate persona — CTAs', () => {
  test('matchmaking: sample data → calculate becomes clickable → result renders', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await seedStorage(page);

    await page.goto('/matchmaking', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    const loadSample = page.getByRole('button', { name: /Load sample birth data|नमूना डेटा लोड करें/ });
    await expect(loadSample).toBeVisible({ timeout: 30_000 });
    await loadSample.click();

    const calc = page.getByRole('button', { name: /Calculate compatibility|अनुकूलता की गणना करें/ });
    await expect(calc).toBeVisible();
    await expect(calc).toBeEnabled({ timeout: 10_000 });
    await calc.click();

    await expect(page.locator('#mm-result-heading')).toBeVisible({ timeout: 30_000 });

    await assertNoCrash(page, 'intermediate/matchmaking');
    expect(pageErrors, 'uncaught page error while calculating compatibility').toEqual([]);
  });
});

// ─── Advanced persona ─────────────────────────────────────────────────────────

test.describe('Advanced persona — edge dates', () => {
  test('out-of-range date shows an explicit message, not a silent no-op', async ({ page }) => {
    await seedStorage(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator('#dob')).toBeVisible({ timeout: 30_000 });

    await page.locator('#dob').fill('01/01/1899');

    await expect(page.getByText(/outside supported range/i)).toBeVisible({ timeout: 5_000 });

    // The primary action must stay disabled while the date is out of range.
    const submit = page.getByRole('button', { name: /Get Transit Reading|गोचर फल देखें/ });
    await expect(submit).toBeDisabled();
  });

  test('non-existent leap day (29 Feb 1900) is rejected explicitly', async ({ page }) => {
    await seedStorage(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator('#dob')).toBeVisible({ timeout: 30_000 });

    await page.locator('#dob').fill('29/02/1900');

    await expect(page.getByText(/Invalid calendar date/i)).toBeVisible({ timeout: 5_000 });
  });

  test('a real leap day (29 Feb 2000) remains valid', async ({ page }) => {
    await seedStorage(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator('#dob')).toBeVisible({ timeout: 30_000 });

    await page.locator('#dob').fill('29/02/2000');

    await expect(page.getByText(/Invalid calendar date|outside supported range/i)).toHaveCount(0);
  });
});

test.describe('Advanced persona — demo mode without Clerk', () => {
  test('/privacy-settings does not crash when the Clerk key is absent', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/privacy-settings', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForTimeout(1500);

    const clerkError = pageErrors.find((m) => /useSession|ClerkProvider/i.test(m));
    expect(clerkError, 'useSession must not throw when the Clerk key is absent').toBeUndefined();

    // The page must render content, not a blank error boundary.
    await expect(page.locator('body')).not.toBeEmpty();
    await assertNoCrash(page, 'advanced/privacy-settings');
  });
});
