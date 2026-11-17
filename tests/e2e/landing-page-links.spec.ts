import { test, expect, type Page } from '@playwright/test';

// Current LandingPageV3 destinations, including global privacy links.
const ROUTES = ['/', '/pricing', '/prashna', '/horoscope', '/features', '/matchmaking', '/panchang', '/privacy', '/terms', '/privacy-settings'];
const destination = (route: string) => route;

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Guidance for Every Question/ })).toBeVisible({ timeout: 60_000 });

}

async function noCrash(page: Page) {
  await expect(page.locator('body')).not.toContainText(/Something went wrong|Application Error|Oops! Page not found/);
  await expect(page.getByRole('heading', { name: '404', exact: true })).toHaveCount(0);
}

test.describe.configure({ mode: 'serial', timeout: 90_000 });
test.describe('Landing page links', () => {
  test.beforeEach(async ({ page }) => { await home(page); });

  test('collects all internal route links from landing page', async ({ page }) => {
    const hrefs = await page.locator('a[href^="/"]').evaluateAll(anchors =>
      [...new Set(anchors.map(a => a.getAttribute('href') ?? '').filter(Boolean))]);
    expect(hrefs.slice().sort()).toEqual(ROUTES.slice().sort());
  });

  test('in-page anchor links resolve to visible sections', async ({ page }) => {
    const hrefs = await page.locator('a[href^="#"]').evaluateAll(anchors =>
      [...new Set(anchors.map(a => a.getAttribute('href') ?? ''))]);
    expect(hrefs).toContain('#features');
    for (const href of hrefs) {
      expect(href.length).toBeGreaterThan(1);
      await page.locator(`a[href="${href}"]`).first().click();
      await expect(page.locator(href)).toBeVisible();
    }
  });

  for (const route of ROUTES) {
    test(`route link works: ${route}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));
      if (route !== '/privacy-settings') await page.getByRole('button', { name: 'Decline optional cookies', exact: true }).click();
      const link = page.locator(`a[href="${route}"]`).first();
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await expect(page).toHaveURL(url => url.pathname === destination(route));
      await expect(page.locator('main').first()).toBeVisible({ timeout: 60_000 });
      await noCrash(page);
      expect(errors).toEqual([]);
    });
  }

  test('suite module cards navigate to correct routes', async ({ page }) => {
    for (const route of ['/prashna', '/horoscope', '/matchmaking', '/panchang']) {
      await home(page);
      const decline = page.getByRole('button', { name: 'Decline optional cookies', exact: true });
      if (await decline.isVisible()) await decline.click();
      const card = page.locator(`#features a[href="${route}"]`).first();
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await expect(page).toHaveURL(url => url.pathname === route);
      await noCrash(page);
    }
  });
});


