import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.use({ baseURL: 'http://localhost:5173' });

const routes = [
  '/',
  '/career-astrology',
  '/kaalsarp',
  '/comprehensive',
  '/matchmaking',
  '/enhanced-matchmaking',
  '/vaastu',
  '/muhurat',
  '/enhanced-muhurat',
  '/baby-names',
  '/lucky-elements',
  '/festival-calendar',
  '/analytics',
  '/feature-requests',
  '/feedback-dashboard',
  '/quick-wins',
  '/dasha',
  '/jaimini',
  '/tajik',
  '/business-astrology',
  '/remedies',
  '/divisional-charts',
  '/planetary-strength',
  '/horoscope',
  '/yogas',
  '/lal-kitab',
  '/kp-system',
  '/love-astrology',
  '/nadi-astrology',
  '/western-astrology',
  '/chinese-astrology',
  '/ai-predictions',
  '/horary',
  '/medical-astrology',
  '/numerology',
  '/financial-astrology',
  '/learn',
  '/marketplace',
  '/community',
  '/features',
  '/api-docs',
  '/panchang',
  '/comparative-astrology',
  '/world-astrology',
  '/electional-astrology',
  '/mundane-astrology',
  '/sade-sati',
  '/ashtakavarga',
  '/gemstones',
  '/enterprise',
  '/varshaphal',
  '/bv-raman',
  '/raman-archive',
  '/feedback',
  '/enterprise-admin',
  '/mobile-app',
  '/spiritual-remedies',
  '/mahadasha-children',
  '/dynamic-transit',
  '/consultation',
  '/question',
  '/prashna',
  '/knowledge',
  '/knowledge/add',
  '/knowledge/ingest',
  '/knowledge/upload',
  '/knowledge/export',
  '/prashna-ai',
  '/prashna-history',
  '/pricing',
  '/marriage',
  '/kanchi',
  '/vedic-marriage',
  '/kundli-compare',
  '/wedding-muhurat',
  '/dasha-timeline',
  '/mtss',
  '/vidhya-karma',
  '/nakshatra-precautions',
  '/my-readings'
];

// Ensure screenshots folder exists
const screenshotDir = path.join(__dirname, '../../test-results/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test.describe('Vedic Rajkumar App Route Verification', () => {
  routes.forEach(route => {
    test(`Verify route: ${route}`, async ({ page }) => {
      const pageErrors: Error[] = [];
      const consoleErrors: string[] = [];

      // Collect any unhandled exceptions on the page
      page.on('pageerror', (err) => {
        pageErrors.push(err);
      });

      // Collect console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      console.log(`Navigating to: ${route}`);
      
      // Go to the route and wait until network is idle or DOMContentLoaded
      await page.goto(route, { waitUntil: 'load', timeout: 15000 });
      
      // Wait a short time for lazy component loading and animations
      await page.waitForTimeout(2000);

      // Verify there are no critical unhandled runtime errors
      if (pageErrors.length > 0) {
        console.error(`Page error on ${route}:`, pageErrors);
      }
      expect(pageErrors.length).toBe(0);

      // Take a screenshot
      const safeName = route.replace(/\//g, '_') || 'home';
      const screenshotPath = path.join(screenshotDir, `${safeName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved for ${route} at ${screenshotPath}`);

      // Verify the page doesn't show standard React error boundaries or crashed pages
      const bodyText = await page.innerText('body');
      if (bodyText.includes('Something went wrong') || bodyText.includes('Application Error')) {
        console.error(`--- FAILURE CONTEXT FOR ROUTE: ${route} ---`);
        console.error(`Console errors during load:\n`, consoleErrors.join('\n'));
        console.error(`Unhandled Page errors during load:\n`, pageErrors.map(e => e.stack || e.message).join('\n'));
      }
      expect(bodyText).not.toContain('Something went wrong');
      expect(bodyText).not.toContain('Application Error');
    });
  });
});
