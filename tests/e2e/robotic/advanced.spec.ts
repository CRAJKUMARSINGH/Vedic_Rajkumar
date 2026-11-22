/**
 * Robotic persona — Advanced user (practitioner / power user).
 * Extreme dates, polar locations, rapid bilingual switching.
 */
import { test, expect } from '@playwright/test';
import { acceptConsent, fillBirthForm, submitBirthForm } from './_personas';

test.describe('Robotic · Advanced — edge & stress', () => {
  test('extreme historical date does not crash', async ({ page }) => {
    await page.goto('/horoscope');
    await acceptConsent(page);

    await fillBirthForm(page, { dob: '01/01/1901', tob: '06:00', place: 'Varanasi, Uttar Pradesh' });
    await submitBirthForm(page);

    await expect(page.locator('body')).not.toContainText(/NaN|Infinity|Cannot read/i, {
      timeout: 15000,
    });
  });

  test('polar location does not crash', async ({ page }) => {
    await page.goto('/horoscope');
    await acceptConsent(page);

    await fillBirthForm(page, { dob: '15/08/1990', tob: '12:00', place: 'Longyearbyen, Svalbard' });
    await submitBirthForm(page);

    await expect(page.locator('body')).not.toContainText(/NaN|Cannot read/i, { timeout: 15000 });
  });

  test('rapid language switching mid-form', async ({ page }) => {
    await page.goto('/horoscope');
    await acceptConsent(page);

    await fillBirthForm(page, { dob: '21/03/1985', tob: '09:15', place: 'Jaipur, Rajasthan' });

    // The language control is a dropdown: open the trigger, pick a language.
    // The entered birth data must survive each switch without crashing the form.
    const toggle = page.getByTestId('lang-toggle');
    await expect(toggle).toBeVisible({ timeout: 5000 });

    for (let i = 0; i < 3; i++) {
      await toggle.click();
      await page.getByRole('menuitem', { name: /हिन्दी|Hindi/i }).first().click();
      await page.waitForTimeout(200);

      await toggle.click();
      await page.getByRole('menuitem', { name: /English/i }).first().click();
      await page.waitForTimeout(200);

      await expect(page.getByTestId('dob-input')).toHaveValue(/21\/03\/1985/);
    }

    await expect(page.locator('body')).not.toContainText(/NaN|Cannot read/i, { timeout: 10000 });
  });
});
