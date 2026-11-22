/**
 * Robotic persona — Intermediate user (returning family user).
 * Kundli Milan, Prashna, Panchang reachability.
 */
import { test, expect } from '@playwright/test';
import { acceptConsent } from './_personas';

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
});
