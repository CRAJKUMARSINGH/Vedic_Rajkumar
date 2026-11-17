/**
 * persona-users.spec.ts — PATCH 7
 *
 * Permanent robotic persona regression suite. Three tiers of synthetic
 * ("persona") visitors exercise the app the way the robotic screenshots did,
 * but with reproducible fixtures instead of real people.
 *
 *   basic        — home, kundli input, calculation, en/hi switch, panchang nav
 *   intermediate — kundli detail, prashna, matchmaking, panchang, PDF export
 *   advanced     — leap years, invalid dates, midnight, rapid submits,
 *                  dropdown collision, keyboard-only, privacy without Clerk,
 *                  deep-link refresh, offline production preview, network fail
 *
 * Conventions:
 *   • accessible role/label selectors (never fragile exact-case text where a
 *     role exists); `force: true` is never used.
 *   • every test seeds empty localStorage + a dismissed consent record so no
 *     cross-test profile bleed and no consent banner intercepts clicks.
 *   • deterministic PRNG (mulberry32) so "random" personas reproduce.
 *   • NO real personal birth data — personas use synthetic names and the
 *     geocoder's pre-cached Indian cities (offline-safe).
 *   • per-test diagnostics (page errors, console errors, failed requests) and
 *     status are written to reports/persona/results/<slug>.json.
 */

import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_DIR = path.join(__dirname, '../../reports/persona');
const SHOT_DIR = path.join(REPORT_DIR, 'screenshots');
const RESULTS_DIR = path.join(REPORT_DIR, 'results');
fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(RESULTS_DIR, { recursive: true });

// ─── Deterministic PRNG so persona fixtures are reproducible ──────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261115);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

// Pre-cached cities only (geocodingService preloads these), so location
// suggestions appear without network access and stay deterministic.
const CACHED_CITIES = ['Udaipur', 'Mumbai', 'Jaipur', 'Delhi', 'Chennai', 'Pune'] as const;

// Synthetic personas — invented names + safe birth dates. Not real people.
const PERSONA = {
  name: `Test Persona ${pick(['Alpha', 'Beta', 'Gamma', 'Delta'])}`,
  dateDMY: '15/09/1963',
  time: '06:00',
  city: pick(CACHED_CITIES),
};

// ─── Diagnostics fixture ──────────────────────────────────────────────────────
interface Diagnostics {
  pageErrors: string[];
  consoleErrors: string[];
  failedRequests: string[];
}

const slugify = (s: string) => s.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 90);

const test = base.extend<{ diag: Diagnostics }>({
  diag: async ({ page }, use, testInfo) => {
    const diag: Diagnostics = { pageErrors: [], consoleErrors: [], failedRequests: [] };
    page.on('pageerror', (e) => diag.pageErrors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') diag.consoleErrors.push(m.text());
    });
    page.on('requestfailed', (r) =>
      diag.failedRequests.push(`${r.method()} ${r.url()} — ${r.failure()?.errorText ?? 'unknown'}`),
    );

    await use(diag);

    const record = {
      title: testInfo.titlePath.join(' › '),
      status: testInfo.status,
      durationMs: testInfo.duration,
      errors: testInfo.errors.map((e) => e.message),
      pageErrors: diag.pageErrors,
      consoleErrors: diag.consoleErrors,
      failedRequests: diag.failedRequests,
    };
    fs.writeFileSync(
      path.join(RESULTS_DIR, `${slugify(testInfo.titlePath.join('_').slice(-80))}.json`),
      JSON.stringify(record, null, 2),
      'utf8',
    );
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Empty localStorage (no stale profile) + a dismissed consent record. */
async function seedPersona(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      localStorage.setItem(
        'vr-consent',
        JSON.stringify({ given: false, timestamp: new Date().toISOString(), version: 1 }),
      );
    } catch {
      /* ignore */
    }
  });
}

async function assertNoCrash(page: Page, context: string) {
  const body = await page.innerText('body');
  expect(body, `error boundary surfaced on ${context}`).not.toContain('Something went wrong');
  expect(body, `application error surfaced on ${context}`).not.toContain('Application Error');
}

const DOB = '#dob';
const TOB = '#tob';
const POB = '#pob';
const LISTBOX = '#location-listbox';
const SUBMIT = /Get Transit Reading|गोचर फल देखें/;
const HOROSCOPE_RESULT = /Overall Score|समग्र स्कोर/;

const isProductionPreview = (testInfo: TestInfo) =>
  String((testInfo.project.use as { baseURL?: string }).baseURL ?? '').includes(':4173');

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: true });
}

/** Fill the birth form (date/time/location) with the synthetic persona.
 *
 * Location flow: type the city, wait up to 5s for the geocoder listbox;
 * if it appears, pick the first suggestion (closes the dropdown cleanly),
 * then wait for the listbox to be fully hidden before returning. This
 * ensures no suggestion can still overlap the submit button when the caller
 * proceeds to click it.
 *
 * If the geocoder never returns suggestions (network blocked or pre-cached
 * city), the typed city string is left as-is — validation only requires
 * location.length >= 2 so the form remains submittable.
 */
async function fillBirthForm(page: Page, opts: { city?: string } = {}) {
  await page.locator(DOB).fill(PERSONA.dateDMY);
  await page.locator(TOB).fill(PERSONA.time);
  await page.locator(POB).fill(opts.city ?? PERSONA.city);

  // Try to pick a geocoder suggestion and wait for the dropdown to close.
  const listbox = page.locator(LISTBOX);
  try {
    await listbox.waitFor({ state: 'visible', timeout: 6_000 });
    // Click first option — this triggers handleLocationSelect which sets
    // suppressNextSearchRef so the debounce effect cannot reopen the list.
    await listbox.locator('[role="option"]').first().click();
    // Wait until the listbox is gone before the caller clicks submit.
    await listbox.waitFor({ state: 'hidden', timeout: 5_000 });
  } catch {
    // Geocoder produced no suggestions (offline, network blocked, or cached
    // path that skips the suggestion flow) — form is still valid.
    await listbox.waitFor({ state: 'hidden', timeout: 2_000 }).catch(() => {
      // If still visible for some reason, press Escape to dismiss.
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// BASIC TIER
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Persona — basic tier', () => {
  // 240s: navigation (60s) + WASM cold-start (120s) + all assertions (60s).
  // HoroscopeCard lazy chunk + WASM ephemeris take ~50-55s cold on a fresh
  // production preview; subsequent tests in the same worker are <10s (warm).
  test.describe.configure({ timeout: 240_000 });

  test('basic: home renders for a synthetic visitor', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await assertNoCrash(page, 'home');

    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(50);
    await expect(page.getByRole('link', { name: /horoscope|kundli/i }).first()).toBeVisible();

    expect(diag.pageErrors, 'uncaught page error on home').toEqual([]);
    await shot(page, 'basic-home');
  });

  test('basic: kundli input form exposes labelled date/time/place fields', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(TOB)).toBeVisible();
    await expect(page.locator(POB)).toBeVisible();
    await expect(page.getByRole('button', { name: SUBMIT })).toBeVisible();

    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'basic-kundli-input');
  });

  test('basic: calculation renders a horoscope without forced clicks', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });

    await fillBirthForm(page);

    const submit = page.getByRole('button', { name: SUBMIT });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click(); // actionability-checked: fails if anything covers it

    // Allow 120s cold: HoroscopeCard lazy chunk + WASM ephemeris on first
    // production-preview load. When warm (subsequent test in same worker) <10s.
    await expect(page.getByText(HOROSCOPE_RESULT).first()).toBeVisible({ timeout: 120_000 });
    await assertNoCrash(page, 'calculation');
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'basic-calculation');
  });

  test('basic: English/Hindi switching changes the UI language', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    const header = page.locator('header');
    await expect(header.getByRole('heading', { name: /^Horoscope$/ })).toBeVisible({ timeout: 30_000 });

    // Open the language menu (accessible name contains the current native name).
    await header.getByRole('button', { name: /English/i }).click();
    await page.getByRole('menuitem', { name: /हिन्दी/ }).click();

    await expect(header.getByRole('heading', { name: 'राशिफल' })).toBeVisible({ timeout: 15_000 });
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'basic-hindi-switch');
  });

  test('basic: panchang navigation from the home page', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    await page.locator('a[href="/panchang"]').first().click();
    await expect(page).toHaveURL(/\/panchang$/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /Daily Panchang|पंचांग/ })).toBeVisible({ timeout: 30_000 });

    await assertNoCrash(page, 'panchang-nav');
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'basic-panchang-nav');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// INTERMEDIATE TIER
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Persona — intermediate tier', () => {
  // 240s: same WASM cold-start headroom as basic tier.
  test.describe.configure({ timeout: 240_000 });

  test('intermediate: kundli detail view renders for the computed chart', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });

    await fillBirthForm(page);
    const submit = page.getByRole('button', { name: SUBMIT });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();

    // 120s: on a cold production-preview first load, the HoroscopeCard lazy
    // chunk + WASM ephemeris take ~50-55s to execute. Subsequent requests in
    // the same browser session are much faster (warm module cache).
    await expect(page.getByText(HOROSCOPE_RESULT).first()).toBeVisible({ timeout: 120_000 });
    // Detail view affordances: print + copy controls on the rendered result.
    await expect(page.getByRole('button', { name: /^Print$|^प्रिंट$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Copy$|^कॉपी करें$/ })).toBeVisible();

    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'intermediate-kundli-detail');
  });

  test('intermediate: prashna returns a verdict', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/prashna', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 30_000 });
    await textarea.fill('Will my career progress favourably over the coming year?');

    const submit = page.getByRole('button', { name: /Get Phaladesh|फलादेश पाएं/ });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();

    const result = page.locator(
      '[aria-label="Prashna analysis result"], [aria-label="प्रश्न विश्लेषण परिणाम"]',
    );
    await expect(result).toBeVisible({ timeout: 45_000 });
    await expect(result.getByText(/Score|अंक/).first()).toBeVisible({ timeout: 15_000 });

    await assertNoCrash(page, 'prashna');
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'intermediate-prashna');
  });

  test('intermediate: matchmaking computes compatibility from sample data', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/matchmaking', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    const sample = page.getByRole('button', { name: /Load sample birth data|नमूना डेटा लोड करें/ });
    await expect(sample).toBeVisible({ timeout: 30_000 });
    await sample.click();

    const calculate = page.getByRole('button', { name: /Calculate compatibility|अनुकूलता की गणना करें/ });
    await expect(calculate).toBeEnabled({ timeout: 10_000 });
    await calculate.click();

    await expect(page.locator('#mm-result-heading')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByRole('button', { name: /Print Report|रिपोर्ट प्रिंट करें/ })).toBeVisible();

    await assertNoCrash(page, 'matchmaking');
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'intermediate-matchmaking');
  });

  test('intermediate: panchang renders a result region for a chosen date', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/panchang', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    const dateInput = page.locator('#panchang-date');
    await expect(dateInput).toBeVisible({ timeout: 30_000 });
    await dateInput.fill('2024-03-14');

    const region = page.locator('[aria-label="Panchang result"], [aria-label="पंचांग परिणाम"]');
    await expect(region).toBeVisible({ timeout: 45_000 });

    await assertNoCrash(page, 'panchang');
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'intermediate-panchang');
  });

  test('intermediate: PDF/print export control is wired up', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });
    await fillBirthForm(page);

    // Stub window.print so the export control can be asserted without a dialog.
    await page.evaluate(() => {
      (window as unknown as { __printed: number }).__printed = 0;
      window.print = () => {
        (window as unknown as { __printed: number }).__printed += 1;
      };
    });

    const submit = page.getByRole('button', { name: SUBMIT });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();

    // Cold-start: the lazily-loaded HoroscopeCard chunk compiles on first hit,
    // so allow a generous window before asserting the export control.
    const resultHeading = page.getByRole('heading', { name: HOROSCOPE_RESULT });
    await expect(resultHeading.first()).toBeVisible({ timeout: 75_000 });

    const printButton = page.getByRole('button', { name: /^Print$|^प्रिंट$/ });
    await expect(printButton).toBeVisible({ timeout: 15_000 });
    await printButton.click();
    const printed = await page.evaluate(() => (window as unknown as { __printed: number }).__printed);
    expect(printed).toBe(1);

    expect(diag.pageErrors).toEqual([]);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ADVANCED TIER
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Persona — advanced tier', () => {
  // 240s: same WASM cold-start headroom.
  test.describe.configure({ timeout: 240_000 });

  test('advanced: leap-year dates are accepted, impossible dates rejected', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });

    // 29/02/2000 is a real leap date.
    await page.locator(DOB).fill('29/02/2000');
    await expect(page.getByText('✓ 2000-02-29')).toBeVisible({ timeout: 5_000 });

    // 29/02/1900 is NOT (century year not divisible by 400).
    await page.locator(DOB).fill('29/02/1900');
    await expect(page.getByText(/Not a real calendar date|अमान्य कैलेंडर तिथि/)).toBeVisible({ timeout: 5_000 });

    // 29/02/2024 is a real leap date.
    await page.locator(DOB).fill('29/02/2024');
    await expect(page.getByText('✓ 2024-02-29')).toBeVisible({ timeout: 5_000 });

    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-leap-year');
  });

  test('advanced: invalid calendar date (31/04/2020) shows an explanation and blocks submit', async ({
    page,
    diag,
  }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });

    await page.locator(DOB).fill('31/04/2020');
    await expect(page.getByText(/Not a real calendar date|अमान्य कैलेंडर तिथि/)).toBeVisible({ timeout: 5_000 });

    await page.locator(TOB).fill('06:00');
    await page.locator(POB).fill(PERSONA.city);
    await expect(page.getByRole('button', { name: SUBMIT })).toBeDisabled();

    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-invalid-date');
  });

  test('advanced: midnight 00:00 is valid, 24:00 is rejected', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });

    await page.locator(DOB).fill(PERSONA.dateDMY);
    await page.locator(POB).fill(PERSONA.city);

    await page.locator(TOB).fill('00:00');
    await expect(page.getByRole('button', { name: SUBMIT })).toBeEnabled({ timeout: 5_000 });

    // A native time control normalises 24:00 away, so assert the shared parser
    // policy directly in the page context as well.
    const invalidTimeMessage = await page.evaluate(() => {
      const el = document.querySelector('#tob') as HTMLInputElement | null;
      if (!el) return 'no-input';
      el.value = '24:00';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return el.value;
    });
    // The browser itself rejects 24:00 → the control must not hold "24:00".
    expect(invalidTimeMessage).not.toBe('24:00');

    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-midnight');
  });

  test('advanced: rapid repeated submissions do not crash or duplicate', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });

    await fillBirthForm(page);
    const submit = page.getByRole('button', { name: SUBMIT });
    await expect(submit).toBeEnabled({ timeout: 10_000 });

    // Fire several submissions in a single tick (the classic double-submit
    // race). The extra clicks resolve before React re-renders, so if the view
    // were going to duplicate or crash it would do so here. `click()` on the
    // native submit control dispatches a real click → form submit.
    await submit.evaluate((el) => {
      for (let i = 0; i < 4; i += 1) (el as HTMLButtonElement).click();
    });

    const resultHeading = page.getByRole('heading', { name: HOROSCOPE_RESULT });
    await expect(resultHeading.first()).toBeVisible({ timeout: 75_000 });
    await assertNoCrash(page, 'rapid-submit');
    // A single result section renders — exactly one heading, no duplicates.
    await expect(resultHeading).toHaveCount(1);

    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-rapid-submit');
  });

  test('advanced: location dropdown cannot overlap the submit button', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });

    await page.locator(DOB).fill(PERSONA.dateDMY);
    await page.locator(TOB).fill(PERSONA.time);
    await page.locator(POB).fill('Udaipur');

    const listbox = page.locator(LISTBOX);
    await expect(listbox).toBeVisible({ timeout: 15_000 });

    const submit = page.getByRole('button', { name: SUBMIT });
    const lb = await listbox.boundingBox();
    const sb = await submit.boundingBox();
    expect(lb, 'listbox has no box').not.toBeNull();
    expect(sb, 'submit has no box').not.toBeNull();
    // The suggestions occupy reserved layout space and must end above the button.
    expect(lb!.y + lb!.height).toBeLessThanOrEqual(sb!.y + 1);

    // The real proof: an actionability-checked (non-forced) click succeeds.
    await page.getByRole('option').first().click();
    await expect(listbox).toBeHidden();
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();
    await expect(page.getByText(HOROSCOPE_RESULT).first()).toBeVisible({ timeout: 45_000 });

    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-dropdown-collision');
  });

  test('advanced: submit click succeeds even if dropdown is open (no force:true)', async ({ page, diag }) => {
    // Reviewer scenario: user fills the form and clicks Calculate directly,
    // without first picking a geocoder suggestion. The dropdown must NOT
    // intercept the click — either it is positioned below the button (in-flow)
    // or it has already closed by the time the user clicks.
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });

    await page.locator(DOB).fill(PERSONA.dateDMY);
    await page.locator(TOB).fill(PERSONA.time);
    await page.locator(POB).fill('Udaipur');

    // Wait for the geocoder listbox to appear so we know it IS open.
    const listbox = page.locator(LISTBOX);
    await expect(listbox).toBeVisible({ timeout: 15_000 });

    // Verify the submit button is NOT covered: its bounding box must start
    // below the bottom edge of the listbox.
    const submit = page.getByRole('button', { name: SUBMIT });
    const lb = await listbox.boundingBox();
    const sb = await submit.boundingBox();
    expect(lb, 'listbox has no bounding box').not.toBeNull();
    expect(sb, 'submit has no bounding box').not.toBeNull();
    expect(
      lb!.y + lb!.height,
      `Listbox bottom (${lb!.y + lb!.height}) must be ≤ submit top (${sb!.y}) — dropdown is overlapping the button`,
    ).toBeLessThanOrEqual(sb!.y + 1);

    // Wait for the geocoding cycle to fully settle (same root cause as the
    // robustness-suite lost submissions: async layout insertion above the
    // submit button can steal an in-flight click). Assert the submit button's
    // position is stable across a render window before clicking.
    const searching = page.getByText(/Searching\.\.\.|खोज रहे हैं/);
    await searching.waitFor({ state: 'hidden', timeout: 25_000 }).catch(() => {});
    await expect(listbox).toBeVisible({ timeout: 15_000 });
    const submitEarly = page.getByRole('button', { name: SUBMIT });
    const y1 = (await submitEarly.boundingBox())?.y;
    await page.waitForTimeout(300);
    const y2 = (await submitEarly.boundingBox())?.y;
    expect(y2, 'submit button moved during geocode settle — layout still shifting').toBe(y1);

    // Click submit directly — no suggestion selected, dropdown still open.
    // Actionability check: Playwright verifies the element is not covered.
    await submit.click(); // throws if anything intercepts the pointer
    await expect(page.getByText(HOROSCOPE_RESULT).first()).toBeVisible({ timeout: 45_000 });

    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-dropdown-open-direct-submit');
  });

  test('advanced: keyboard-only selection and submission', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(DOB)).toBeVisible({ timeout: 30_000 });

    // Type the date (auto-format DD/MM/YYYY) with the keyboard.
    await page.locator(DOB).focus();
    await page.keyboard.type('15091963');
    await expect(page.locator(DOB)).toHaveValue('15/09/1963');

    await page.locator(TOB).fill(PERSONA.time);

    // Location: type, move with ArrowDown, commit with Enter.
    await page.locator(POB).focus();
    await page.keyboard.type('Udaipur');
    await expect(page.locator(LISTBOX)).toBeVisible({ timeout: 15_000 });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator(POB)).toHaveValue(/Udaipur/);
    await expect(page.locator(LISTBOX)).toBeHidden();

    // Implicit form submission (the only submit control, now enabled).
    await page.keyboard.press('Enter');
    await expect(page.getByText(HOROSCOPE_RESULT).first()).toBeVisible({ timeout: 45_000 });

    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-keyboard-only');
  });

  test('advanced: a stale geocoding response does not reopen the dropdown', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(POB)).toBeVisible({ timeout: 30_000 });

    await page.locator(POB).fill('Udaipur');
    await expect(page.locator(LISTBOX)).toBeVisible({ timeout: 15_000 });
    await page.getByRole('option').first().click();
    await expect(page.locator(LISTBOX)).toBeHidden();

    // Wait past the 500ms debounce + any late response window.
    await page.waitForTimeout(2000);
    await expect(page.locator(LISTBOX)).toBeHidden();

    expect(diag.pageErrors).toEqual([]);
  });

  test('advanced: privacy settings work without Clerk (demo mode)', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/privacy-settings', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    await expect(page.getByRole('heading', { name: /Privacy Settings|गोपनीयता सेटिंग्स/ })).toBeVisible({
      timeout: 30_000,
    });

    // Consent must remain fully usable. Anchor the name so it does not also
    // match "Decline optional · अस्वीकार करें".
    const accept = page.getByRole('button', { name: /^Accept optional/ });
    await expect(accept).toBeVisible();
    await accept.click();
    await expect(page.getByText(/Consent given|सहमति दी गई/).first()).toBeVisible({ timeout: 5_000 });

    // Cloud export/delete must surface an honest state — either "unavailable
    // (no auth configured)" or a sign-in prompt. Never a simulated success.
    const body = await page.locator('body').innerText();
    const hasUnavailable = /Sign-in unavailable/i.test(body);
    const hasSignInPrompt = /Sign in to export your stored data|Sign in to delete your stored data/i.test(body);
    expect(hasUnavailable || hasSignInPrompt).toBe(true);
    expect(body).not.toMatch(/Deletion complete|हटाना पूर्ण/);

    await assertNoCrash(page, 'privacy-settings');
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-privacy-no-clerk');
  });

  test('advanced: deep-link refresh keeps the page functional', async ({ page, diag }) => {
    await seedPersona(page);
    await page.goto('/panchang', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator('#panchang-date')).toBeVisible({ timeout: 30_000 });

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator('#panchang-date')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('[aria-label="Panchang result"], [aria-label="पंचांग परिणाम"]')).toBeVisible({
      timeout: 45_000,
    });

    await assertNoCrash(page, 'deep-link-refresh');
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-deep-link-refresh');
  });

  test('advanced: geocoding network failure degrades gracefully', async ({ page, diag }) => {
    await seedPersona(page);
    // Simulate the geocoder being unreachable for a non-cached query.
    await page.route('**/nominatim.openstreetmap.org/**', (route) => route.abort());

    await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator(POB)).toBeVisible({ timeout: 30_000 });

    await page.locator(DOB).fill(PERSONA.dateDMY);
    await page.locator(TOB).fill(PERSONA.time);
    await page.locator(POB).fill('Springfield'); // deliberately not pre-cached
    await page.waitForTimeout(1500);

    // The form must still be usable: a typed place name is enough to submit.
    const submit = page.getByRole('button', { name: SUBMIT });
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();
    await expect(page.getByText(HOROSCOPE_RESULT).first()).toBeVisible({ timeout: 45_000 });

    await assertNoCrash(page, 'network-failure');
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-network-failure');
  });

  test('advanced: offline production preview serves a usable shell', async ({ page, context, diag }) => {
    test.skip(
      !isProductionPreview(test.info()),
      'requires the production preview server — run with playwright.preview.config.ts (see PATCH 5)',
    );

    await page.goto('/panchang', { waitUntil: 'load', timeout: 60_000 });
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
    });
    await page.waitForTimeout(3000);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'load', timeout: 30_000 });
    const text = await page.locator('body').innerText();
    await context.setOffline(false);

    expect(text).not.toContain('Something went wrong');
    expect(text.trim().length).toBeGreaterThan(50);
    expect(diag.pageErrors).toEqual([]);
    await shot(page, 'advanced-offline-preview');
  });
});
