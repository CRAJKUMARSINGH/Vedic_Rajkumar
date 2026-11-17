import { test, expect } from '@playwright/test';

// App.tsx uses routes/index.tsx: /question remains a supported alias, not a redirect.
for (const route of ['/prashna', '/question']) {
  test(`Prashna direct navigation and refresh: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(route, { waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: 'Question / Prashna', exact: true })).toBeVisible({ timeout: 60_000 });
    await expect(page).toHaveURL(url => url.pathname === route);
    await page.reload({ waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: 'Question / Prashna', exact: true })).toBeVisible({ timeout: 60_000 });
    await expect(page).toHaveURL(url => url.pathname === route);
    expect(errors).toEqual([]);
  });
}

test('documented Prasna spelling redirects to the canonical route', async ({ page }) => {
  await page.goto('/prasna');
  await expect(page).toHaveURL(/\/prashna$/);
  await expect(page.getByRole('heading', { name: 'Question / Prashna', exact: true })).toBeVisible({ timeout: 60_000 });
});
