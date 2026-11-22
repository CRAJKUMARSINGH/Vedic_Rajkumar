/**
 * Shared helpers for the "pure robotic" persona suite (Basic / Intermediate /
 * Advanced). Adapted from CODE-JUNCTION/vedic_pure_robotic:
 *   - no @faker-js/faker dependency (the repo does not ship it) — a tiny seeded
 *     PRNG keeps the personas randomised yet reproducible;
 *   - targets the app under test via the Playwright baseURL instead of a
 *     hard-coded external host.
 */
import { expect, type Page } from '@playwright/test';

/** Deterministic 32-bit PRNG (mulberry32). Same seed → same persona. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INDIAN_CITIES = [
  'Udaipur, Rajasthan',
  'Delhi',
  'Varanasi, Uttar Pradesh',
  'Jaipur, Rajasthan',
  'Mumbai, Maharashtra',
  'Kolkata, West Bengal',
  'Chennai, Tamil Nadu',
  'Pune, Maharashtra',
];

export interface Persona {
  dob: string; // DD/MM/YYYY
  tob: string; // HH:MM (24-hour)
  place: string;
}

/** Build a reproducible birth persona from a numeric seed. */
export function seededPersona(seed: number): Persona {
  const rnd = mulberry32(seed);
  const pick = <T>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)];
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    dob: `${pad(1 + Math.floor(rnd() * 28))}/${pad(1 + Math.floor(rnd() * 12))}/${1955 + Math.floor(rnd() * 51)}`,
    tob: `${pad(Math.floor(rnd() * 24))}:${pad(Math.floor(rnd() * 60))}`,
    place: pick(INDIAN_CITIES),
  };
}

/** Dismiss the cookie-consent dialog when it appears. */
export async function acceptConsent(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /Accept/i })
    .click({ timeout: 3000 })
    .catch(() => {});
}

/** Fill the canonical birth-details form (ids from EnhancedBirthInputForm). */
export async function fillBirthForm(page: Page, persona: Persona): Promise<void> {
  await page.locator('#dob').fill(persona.dob);
  await page.locator('#tob').fill(persona.tob);
  await page.locator('#pob').fill(persona.place);
  // Let the debounced location search settle before submitting.
  await page.waitForTimeout(300);
}

/** Submit the birth form, which is disabled until all three fields validate. */
export async function submitBirthForm(page: Page): Promise<void> {
  const cta = page.getByTestId('get-transit-cta');
  await expect(cta).toBeEnabled();
  await cta.click();
}
