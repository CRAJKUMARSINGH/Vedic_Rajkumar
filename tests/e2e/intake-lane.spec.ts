import { test, expect, type Page } from '@playwright/test';

/**
 * Intake-lane UI integration.
 *
 * Proves the selected lane actually CONTROLS engine invocation — not merely
 * that a badge renders. The Prashna engine is only reached on the
 * `natal_full` / `prashna_now` lanes; house-only (`placements_only`) input must
 * summarise and stop, and an unconfirmed location must block rather than cast
 * a silent Delhi chart.
 */

const seed = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem(
      'vr-consent',
      JSON.stringify({ given: false, timestamp: new Date().toISOString(), version: 1 }),
    );
  });
};

// The result panel (verdict tabs) renders only when the engine has run.
const verdictTabs = (page: Page) => page.getByRole('tab', { name: /Summary|सारांश/ });

test('typed placements route to placements_only — no verdict is cast', async ({ page }) => {
  await seed(page);
  await page.goto('/question');

  // Ask as a guest so no enrolled natal chart is on file.
  await page.locator('#m-anon').click();

  await page
    .getByPlaceholder(/e\.g\. Will I get the promotion/)
    .fill('My chart: Venus in 12th house, Saturn in 8th house, Jupiter in 7th house');

  await page.getByRole('button', { name: /Get Phaladesh|फलादेश पाएं/ }).click();

  const lane = page.locator('[data-testid="intake-lane"]');
  await expect(lane).toBeVisible({ timeout: 30_000 });
  await expect(lane).toContainText(/typed placements|लिखे ग्रह-भाव/);

  // The house summary renders, and the "no engine" note is shown.
  await expect(page.locator('[data-testid="placements-summary"]')).toBeVisible();
  await expect(page.locator('[data-testid="intake-no-engine"]')).toBeVisible();

  // The engine never ran: the verdict panel is absent.
  await expect(verdictTabs(page)).toHaveCount(0);
});

test('unconfirmed location blocks the cast instead of defaulting to Delhi', async ({ page }) => {
  await seed(page);
  await page.goto('/question');

  await page.locator('#m-anon').click();

  // No placements, plain topical question → prashna lane needing a place.
  await page.getByPlaceholder(/e\.g\. Will I get the promotion/).fill('Will I buy a house this year?');

  await expect(page.locator('[data-testid="place-default-warning"]')).toBeVisible();

  await page.getByRole('button', { name: /Get Phaladesh|फलादेश पाएं/ }).click();

  await expect(page.locator('[data-testid="intake-asks"]')).toBeVisible({ timeout: 30_000 });

  // Nothing was cast.
  await expect(verdictTabs(page)).toHaveCount(0);
});
