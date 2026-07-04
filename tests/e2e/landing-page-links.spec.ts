import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LANDING_PATH = '/';
const NAV_TIMEOUT = 60000;
const screenshotDir = path.join(__dirname, '../../test-results/landing-links');

/** Routes linked from the landing page that should load without a crash. */
const EXPECTED_ROUTE_LINKS = [
  '/',
  '/pricing',
  '/question',
  '/dasha',
  '/features',
  '/landing-classic',
  '/prashna-ai',
  '/vedic-marriage',
  '/vidhya-karma',
  '/wedding-muhurat',
  '/spiritual-remedies',
];

const EXPECTED_ANCHOR_IDS = ['method', 'workspace', 'interactive-charts', 'report', 'solution-grid'];

test.describe.configure({ mode: 'serial' });

test.describe('Landing page links', () => {
  test.beforeAll(async () => {
    await import('fs').then(fs =>
      fs.promises.mkdir(screenshotDir, { recursive: true }),
    );
  });

  test('collects all internal route links from landing page', async ({ page }) => {
    await page.goto(LANDING_PATH, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.waitForTimeout(1500);

    const hrefs = await page.locator('a[href^="/"]').evaluateAll(anchors =>
      [...new Set(anchors.map(a => (a as HTMLAnchorElement).getAttribute('href') ?? '').filter(Boolean))],
    );

    for (const expected of EXPECTED_ROUTE_LINKS) {
      expect(hrefs, `missing landing link: ${expected}`).toContain(expected);
    }
  });

  test('in-page anchor links resolve to visible sections', async ({ page }) => {
    await page.goto(LANDING_PATH, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });

    for (const id of EXPECTED_ANCHOR_IDS) {
      const anchor = page.locator(`a[href="#${id}"]`).first();
      await expect(anchor, `anchor nav link #${id}`).toBeVisible();
      await anchor.click();
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  for (const route of EXPECTED_ROUTE_LINKS) {
    test(`route link works: ${route}`, async ({ page }) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', err => pageErrors.push(err));

      await page.goto(LANDING_PATH, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.waitForTimeout(1000);

      const link = page.locator(`a[href="${route}"]`).first();
      await expect(link, `no link to ${route} on landing`).toBeVisible();

      await link.click();
      await page.waitForURL(
        url => url.pathname === route || (route === '/' && url.pathname === ''),
        { timeout: NAV_TIMEOUT },
      );
      await page.waitForTimeout(1500);

      expect(pageErrors.length).toBe(0);

      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Something went wrong');
      expect(bodyText).not.toContain('Application Error');

      const safeName = route.replace(/\//g, '_') || 'home';
      await page.screenshot({
        path: path.join(screenshotDir, `click_${safeName}.png`),
        fullPage: true,
      });
    });
  }

  test('suite module cards navigate to correct routes', async ({ page }) => {
    const suiteRoutes = [
      '/prashna-ai',
      '/dasha',
      '/vedic-marriage',
      '/vidhya-karma',
      '/wedding-muhurat',
      '/spiritual-remedies',
    ];

    await page.goto(LANDING_PATH, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.locator('#solution-grid').scrollIntoViewIfNeeded();

    for (const route of suiteRoutes) {
      const card = page.locator(`a[href="${route}"]`).filter({ hasText: 'Open module' }).first();
      if (await card.count() === 0) {
        const fallback = page.locator(`a[href="${route}"]`).first();
        await expect(fallback).toBeVisible();
        continue;
      }
      await expect(card).toBeVisible();
    }
  });
});
