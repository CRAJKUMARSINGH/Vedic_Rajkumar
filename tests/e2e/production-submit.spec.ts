import { test, expect } from '@playwright/test';

test('ordinary submit click remains effective while location suggestions are open', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('vr-consent', JSON.stringify({ given: false, timestamp: new Date().toISOString(), version: 1 }));
  });
  await page.goto('/horoscope');
  await page.locator('#dob').fill('01/05/1946');
  await page.locator('#tob').fill('14:22');
  await page.locator('#pob').fill('Chennai');
  await expect(page.locator('#location-listbox')).toBeVisible({ timeout: 15_000 });
  const submit = page.getByRole('button', { name: 'Get Transit Reading', exact: true });
  await expect(submit).toBeEnabled();
  // Assert layout is stable before clicking — async geocode-cycle renders
  // (searching indicator, listbox) can shift the button mid-gesture.
  const y1 = (await submit.boundingBox())?.y;
  await page.waitForTimeout(300);
  const y2 = (await submit.boundingBox())?.y;
  expect(y2, 'submit button moved during geocode settle').toBe(y1);
  // A normal pointer press is not instantaneous: layout must remain clickable through mouse-up.
  await submit.click({ delay: 100 });
  await expect(page.getByText(/Overall Score/).first()).toBeVisible({ timeout: 45_000 });
});
