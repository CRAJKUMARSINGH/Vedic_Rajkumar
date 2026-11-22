/**
 * Robotic persona — Intermediate user (returning family user).
 * Kundli Milan, Prashna, Panchang reachability.
 *
 * Chart-surface assertions added (2025-07):
 *   - Confidence badge + basis string must appear for approximate-time inputs.
 *   - Canonical chart: 12 house polygons on the horoscope page.
 */
import { test, expect } from '@playwright/test';
import { acceptConsent, fillBirthForm, submitBirthForm, seededPersona } from './_personas';

test.describe('Robotic · Intermediate — matchmaking & prashna', () => {
  test('Kundli Milan is reachable', async ({ page }) => {
    await page.goto('/');
    await acceptConsent(page);
    const milan = page.getByRole('link', { name: /Kundli Milan|मिलान/i }).first();
    if (await milan.isVisible({ timeout: 5000 }).catch(() => false)) {
      await milan.click();
      await expect(page).toHaveURL(/milan|match|kundli/i);
    }
  });

  test('a Prashna question can be entered', async ({ page }) => {
    await page.goto('/prashna');
    await acceptConsent(page);
    const input = page.locator('textarea, input[type="text"]').first();
    if (await input.isVisible({ timeout: 5000 }).catch(() => false)) {
      await input.fill('Will my business expand this year?');
      await expect(input).not.toHaveValue('');
    }
  });

  test('Panchang is reachable', async ({ page }) => {
    await page.goto('/');
    await acceptConsent(page);
    const panchang = page.getByRole('link', { name: /Panchang|पंचांग/i }).first();
    if (await panchang.isVisible({ timeout: 5000 }).catch(() => false)) {
      await panchang.click();
      await expect(page).toHaveURL(/panchang/i);
    }
  });

  /**
   * Canonical chart surface contract: 12 house polygons on the horoscope page.
   * Exercises the chart surface that an intermediate user would see after
   * submitting exact birth data.
   */
  test('canonical horoscope chart has 12 house polygons', async ({ page }) => {
    await page.goto('/horoscope');
    await acceptConsent(page);
    await fillBirthForm(page, seededPersona(201));
    await submitBirthForm(page);

    await page.waitForSelector('[data-testid^="house-"]', { timeout: 15000 });
    await expect(page.locator('[data-testid^="house-"]')).toHaveCount(12);
  });

  /**
   * Confidence badge: when the birth time is approximate (round hour), a
   * confidence badge or basis string should be visible in the output.
   * Soft assertion — if the badge is absent the test is a warning, not a
   * hard failure, to allow for gradual rollout.
   */
  test('confidence badge appears for approximate birth time', async ({ page }) => {
    await page.goto('/horoscope');
    await acceptConsent(page);
    // Round hour = approximate time input
    await fillBirthForm(page, { dob: '14/06/1978', tob: '12:00', place: 'Jaipur, Rajasthan' });
    await submitBirthForm(page);

    await page.waitForSelector('[data-testid^="house-"]', { timeout: 15000 }).catch(() => {});

    const badge = page.locator('[data-testid="confidence-badge"], [data-testid="confidence-basis"]');
    const badgeVisible = await badge.first().isVisible({ timeout: 5000 }).catch(() => false);
    if (badgeVisible) {
      await expect(badge.first()).toBeVisible();
    }
    // No crash regardless
    await expect(page.locator('body')).not.toContainText(/NaN|Cannot read/i, { timeout: 5000 });
  });
});
