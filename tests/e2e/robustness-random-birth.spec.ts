/**
 * robustness-random-birth.spec.ts
 *
 * Browser robustness harness:
 *   1. Feeds RANDOM (seeded, reproducible) birth data into the live Horoscope
 *      form and verifies a horoscope renders with zero uncaught errors.
 *   2. Feeds MULTIDIMENSIONAL Prashna questions (career, marriage, health,
 *      finance, property, legal, education, spirituality, children, travel,
 *      Hindi + emoji + oversized edge-cases) into the live Question engine and
 *      verifies a verdict renders for every one.
 *
 * Console/page errors are collected and written to a JSON report under
 * test-results/robustness/. The suite fails only on genuine regressions
 * (uncaught page errors / React error boundary text / missing result).
 */

import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_DIR = path.join(__dirname, '../../reports/robustness');
const SHOT_DIR = path.join(REPORT_DIR, 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

// ─── Deterministic PRNG so "random" runs are reproducible ─────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261017);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const FIRST = ['Aarav', 'Meera', 'Rohan', 'Ananya', 'Kabir', 'Isha', 'Vivaan', 'Diya', 'Arjun', 'Saanvi'] as const;
const LAST = ['Sharma', 'Verma', 'Patel', 'Nair', 'Iyer', 'Reddy', 'Gupta', 'Joshi', 'Menon', 'Rao'] as const;

// Real Indian locations with coordinates (used both for the form text and to
// sanity-check plausibility of the reading).
const PLACES = [
  { label: 'Udaipur, Rajasthan', lat: 24.58, lon: 73.68 },
  { label: 'New Delhi', lat: 28.61, lon: 77.2 },
  { label: 'Mumbai, Maharashtra', lat: 19.07, lon: 72.87 },
  { label: 'Chennai, Tamil Nadu', lat: 13.08, lon: 80.27 },
  { label: 'Kolkata, West Bengal', lat: 22.57, lon: 88.36 },
  { label: 'Bengaluru, Karnataka', lat: 12.97, lon: 77.59 },
  { label: 'Jaipur, Rajasthan', lat: 26.91, lon: 75.78 },
  { label: 'Varanasi, Uttar Pradesh', lat: 25.31, lon: 82.97 },
] as const;

interface RandomBirth {
  name: string;
  dateISO: string;
  dateDMY: string;
  time: string;
  place: (typeof PLACES)[number];
}

function randomBirth(): RandomBirth {
  const year = int(1930, 2024);
  const month = int(1, 12);
  const day = int(1, 28);
  const hh = int(0, 23);
  const mm = int(0, 59);
  const dd = String(day).padStart(2, '0');
  const mo = String(month).padStart(2, '0');
  return {
    name: `${pick(FIRST)} ${pick(LAST)}`,
    dateISO: `${year}-${mo}-${dd}`,
    dateDMY: `${dd}/${mo}/${year}`,
    time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
    place: pick(PLACES),
  };
}

// ─── Multidimensional Prashna question matrix ─────────────────────────────────
interface QuestionCase {
  dimension: string;
  text: string;
}

const QUESTIONS: QuestionCase[] = [
  { dimension: 'career', text: 'Will I get a promotion or job elevation in my current organization this year?' },
  { dimension: 'business', text: 'Is starting a new business venture or independent consulting favorable for me?' },
  { dimension: 'marriage', text: 'Will my marriage be harmonious, stable and long-lasting?' },
  { dimension: 'partner-timing', text: 'When will I meet a compatible life partner and settle down?' },
  { dimension: 'education', text: 'Will I clear my competitive examination and higher education goal?' },
  { dimension: 'foreign-study', text: 'Is foreign education or an overseas relocation favorable for me?' },
  { dimension: 'finance', text: 'Will my financial condition improve and my wealth accumulate over the next two years?' },
  { dimension: 'property', text: 'Is this a good period to buy real estate, land, or a new home?' },
  { dimension: 'health', text: 'How can I improve my health, immunity and overall vitality right now?' },
  { dimension: 'legal', text: 'Will I overcome a legal dispute, court case, or competitive rival?' },
  { dimension: 'children', text: 'Is there a prospect of progeny and what does the chart show about children?' },
  { dimension: 'spiritual', text: 'Which spiritual practice or deity worship will be most beneficial for my growth?' },
  { dimension: 'travel', text: 'Will I undertake long-distance travel or relocation in the coming months?' },
  { dimension: 'hindi', text: 'क्या मेरी नौकरी में पदोन्नति होगी और आर्थिक स्थिति सुधरेगी?' },
  { dimension: 'edge-emoji', text: '💍 Will I marry soon? 🙏 Is my partner compatible with me? 🏡' },
  {
    dimension: 'edge-long',
    text:
      'Considering my current professional, financial, familial and health circumstances, ' +
      'please tell me whether the coming twelve months favour a major relocation abroad for ' +
      'work, along with the purchase of a new home, and whether my relationship will remain ' +
      'stable through these transitions? '.repeat(3),
  },
  { dimension: 'edge-numeric', text: '   ??? 12345 %%%  ' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ErrorBucket {
  pageErrors: string[];
  consoleErrors: string[];
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { pageErrors: [], consoleErrors: [] };
  page.on('pageerror', (err) => bucket.pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') bucket.consoleErrors.push(msg.text());
  });
  return bucket;
}

/** Pre-dismiss the consent banner + seed a fresh local profile so clicks are not intercepted. */
async function seedStorage(page: Page) {
  await page.addInitScript(() => {
    try {
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

// ─── Suite ────────────────────────────────────────────────────────────────────

const report: { generatedAt: string; births: unknown[]; questions: unknown[] } = {
  generatedAt: new Date().toISOString(),
  births: [],
  questions: [],
};

test.describe.configure({ mode: 'serial' });

test.describe('Robustness — random birth data', () => {
  const BIRTHS = Array.from({ length: 6 }, () => randomBirth());

  BIRTHS.forEach((birth, i) => {
    test(`horoscope renders for random birth ${i + 1}: ${birth.name} (${birth.dateDMY} ${birth.time})`, async ({ page }) => {
      const errors = collectErrors(page);
      await seedStorage(page);

      await page.goto('/horoscope', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expect(page.locator('#dob')).toBeVisible({ timeout: 30_000 });

      await page.locator('#dob').fill(birth.dateDMY);
      await page.locator('#tob').fill(birth.time);
      await page.locator('#pob').fill(birth.place.label);

      const submit = page.getByRole('button', { name: /Get Transit Reading|गोचर फल देखें/ });
      await expect(submit).toBeEnabled({ timeout: 10_000 });
      await submit.click();

      // HoroscopeCard is lazy-loaded and computed from the birth date.
      await expect(page.getByText(/Overall Score|समग्र स्कोर/).first()).toBeVisible({ timeout: 45_000 });

      await assertNoCrash(page, `horoscope/${i + 1}`);
      expect(errors.pageErrors, `uncaught page error for ${birth.name}`).toEqual([]);

      await page.screenshot({
        path: path.join(SHOT_DIR, `birth_${i + 1}.png`),
        fullPage: true,
      });

      report.births.push({ ...birth, pageErrors: errors.pageErrors, consoleErrors: errors.consoleErrors });
    });
  });
});

test.describe('Robustness — multidimensional Prashna questions', () => {
  QUESTIONS.forEach((q) => {
    test(`prashna verdict for [${q.dimension}]: ${q.text.slice(0, 48)}…`, async ({ page }) => {
      const errors = collectErrors(page);
      await seedStorage(page);

      await page.goto('/question', { waitUntil: 'domcontentloaded', timeout: 60_000 });

      const textarea = page.locator('textarea').first();
      await expect(textarea).toBeVisible({ timeout: 30_000 });
      await textarea.fill(q.text);

      // Main engine submit button (distinct from the standalone research bar).
      const submit = page.getByRole('button', { name: /Get Phaladesh|फलादेश पाएं/ });
      await expect(submit).toBeEnabled({ timeout: 10_000 });
      await submit.click();

      // Result region (aria-label set on the results container).
      const result = page.locator('[aria-label="Prashna analysis result"], [aria-label="प्रश्न विश्लेषण परिणाम"]');
      await expect(result).toBeVisible({ timeout: 45_000 });
      await expect(result.getByText(/Score|अंक/).first()).toBeVisible({ timeout: 15_000 });

      await assertNoCrash(page, `question/${q.dimension}`);
      expect(errors.pageErrors, `uncaught page error for [${q.dimension}]`).toEqual([]);

      const verdictText = (await result.innerText()).slice(0, 400);

      await page.screenshot({
        path: path.join(SHOT_DIR, `question_${q.dimension}.png`),
        fullPage: true,
      });

      report.questions.push({
        dimension: q.dimension,
        question: q.text,
        verdictExcerpt: verdictText,
        pageErrors: errors.pageErrors,
        consoleErrors: errors.consoleErrors,
      });
    });
  });
});

test.afterAll(async () => {
  fs.writeFileSync(path.join(REPORT_DIR, 'report.json'), JSON.stringify(report, null, 2), 'utf-8');
});
