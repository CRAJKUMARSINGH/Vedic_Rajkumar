/**
 * Robotic persona — Basic user (first-time visitor, mobile, impatient).
 * Landing → free Kundli → reading appears without crashing.
 */
import { test, expect } from '@playwright/test';
import { acceptConsent, fillBirthForm, submitBirthForm, seededPersona } from './_personas';

test.describe('Robotic · Basic — free Kundli / transit', () => {
  test('happy path: generate a free kundli reading', async ({ page }) => {
    await page.goto('/');
    await acceptConsent(page);

    const cta = page.getByRole('link', { name: /Generate Free Kundli|मुफ़्त कुंडली/i }).first();
    if (await cta.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cta.click();
    } else {
      await page.goto('/horoscope');
    }
    await expect(page).toHaveURL(/horoscope/);

    await fillBirthForm(page, seededPersona(101));
    await submitBirthForm(page);

    // Must not crash or render NaN/undefined into the chart.
    await expect(page.locator('body')).not.toContainText(/NaN|undefined|Cannot read/i, {
      timeout: 15000,
    });
  });

  test('quick actions populate the form', async ({ page }) => {
    await page.goto('/horoscope');
    await acceptConsent(page);

    await page.getByRole('button', { name: /Use Today|आज की तिथि/i }).click();
    await page.getByRole('button', { name: /Use Current Time|वर्तमान समय/i }).click();

    await expect(page.getByTestId('dob-input')).not.toHaveValue('');
  });

  test('language can be switched', async ({ page }) => {
    await page.goto('/horoscope');
    await acceptConsent(page);

    await fillBirthForm(page, seededPersona(102));

    const toggle = page.getByTestId('lang-toggle');
    await expect(toggle).toBeVisible({ timeout: 5000 });
    await toggle.click();
    await page.getByRole('menuitem', { name: /हिन्दी|Hindi/i }).first().click();

    // Birth data survives the language switch.
    await expect(page.getByTestId('dob-input')).toHaveValue(/\d{2}\/\d{2}\/\d{4}/);
  });
});
