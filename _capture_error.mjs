import { chromium } from 'playwright';

const port = process.argv[2] || '5174';
const url = `http://localhost:${port}/`;

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];

page.on('pageerror', (e) => errors.push(`PAGE: ${e.message}\n${e.stack}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CON: ${m.text()}`);
});

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(8000);
  const details = await page.locator('pre').first().textContent().catch(() => null);
  const body = await page.locator('body').innerText();
  console.log('URL:', url);
  console.log('DETAILS:', details || '(none)');
  console.log('BODY:', body.slice(0, 500));
  console.log('CONSOLE_ERRORS:', errors.join('\n---\n') || '(none)');
} catch (e) {
  console.log('NAV_FAIL:', e.message);
  console.log('CONSOLE_ERRORS:', errors.join('\n---\n') || '(none)');
}

await browser.close();
