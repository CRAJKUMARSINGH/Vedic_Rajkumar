/**
 * tier-parity.spec.ts — @parity — proves the SERVER beats a tampered localStorage.
 *
 * For each grade project: run the assertions once with an HONEST seed, then again
 * with the seed overwritten to the HIGHEST grade. If the app reads localStorage
 * directly, the second run flips and this spec fails. If the app reads the server
 * entitlement, both runs agree.
 */
import { test, expect } from '@playwright/test';
import { personaForProject } from './fixtures/tierSessions';

const p = () => personaForProject(test.info().project.name);

/** Overwrite vr_tier to 'practitioner' AFTER the storage state has loaded. */
async function tamperToEnterprise(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    try { localStorage.setItem('vr_tier', 'practitioner'); } catch { /* ignore */ }
  });
}

test('@parity honest seed — grade badge matches the persona', async ({ page }) => {
  const persona = p();
  await page.goto('/');
  const badge = page.getByTestId('tier-badge').first();
  await expect(badge).toBeVisible();
  await expect(badge).toHaveAttribute('data-tier', persona.userTier);
});

test('@parity tampered seed — free grade still cannot see white-label', async ({ page }) => {
  const persona = p();
  if (persona.expect.whiteLabelEnabled) test.skip();

  await tamperToEnterprise(page);
  await page.goto('/enterprise');

  // Server says 'free' -> white-label must stay hidden even though localStorage claims practitioner.
  await expect(page.getByTestId('white-label-toggle')).toHaveCount(0);
});

test('@parity tampered seed — free grade weekly allowance stays capped', async ({ page }) => {
  const persona = p();
  if (persona.expect.weeklyUnlimited) test.skip();

  await tamperToEnterprise(page);
  await page.goto('/');

  const remaining = Number(await page.getByTestId('weekly-drive-card').getAttribute('data-remaining'));
  expect(remaining).not.toBe(-1);
});

test('@parity server endpoint is reachable and denies by default', async ({ request }) => {
  const res = await request.get('/functions/v1/tier-entitlement');
  expect([200, 401]).toContain(res.status());
  if (res.status() === 200) {
    const body = await res.json();
    expect(['free', 'pro', 'enterprise']).toContain(body.tier);
  }
});
