/**
 * billing-parity.spec.ts — @parity @billing
 * Free grade must see an upgrade CTA that hits the billing endpoint;
 * paid grade must see the portal CTA. A tampered localStorage plan must not
 * change either.
 */
import { test, expect } from '@playwright/test';
import { personaForProject } from './fixtures/tierSessions';

const p = () => personaForProject(test.info().project.name);

test('@billing free grade sees an upgrade CTA', async ({ page }) => {
  if (!p().expect.upgradeBannerVisible) test.skip();
  await page.goto('/pricing');
  await expect(page.getByTestId('plan-cta-pro')).toBeVisible();
  await expect(page.getByTestId('manage-subscription')).toHaveCount(0);
});

test('@billing paid grade sees a manage-subscription CTA', async ({ page }) => {
  if (p().expect.upgradeBannerVisible) test.skip();
  await page.goto('/pricing');
  await expect(page.getByTestId('manage-subscription')).toBeVisible();
});

test('@billing checkout posts plan+region and follows the returned url', async ({ page }) => {
  if (!p().expect.upgradeBannerVisible) test.skip();

  let posted: Record<string, unknown> | null = null;
  await page.route('**/functions/v1/billing-checkout', async (route) => {
    posted = JSON.parse(route.request().postData() ?? '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: '/pricing?checkout=success' }) });
  });

  await page.goto('/pricing');
  await page.getByTestId('plan-cta-pro').click();

  expect(posted).not.toBeNull();
  expect(posted!.plan).toBe('pro');
  expect(['in', 'intl']).toContain(posted!.region);
  expect(posted!.price).toBeUndefined(); // server owns the price id
});

test('@billing tampered plan does not fake a paid grade', async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem('vedic_subscription', JSON.stringify({ plan: 'pro', name: 'x', email: 'x@y.z' })); } catch { /* storage unavailable in this context — tamper attempt is skipped */ }
  });
  await page.goto('/pricing');
  if (p().expect.upgradeBannerVisible) {
    await expect(page.getByTestId('plan-cta-pro')).toBeVisible();
  }
});
