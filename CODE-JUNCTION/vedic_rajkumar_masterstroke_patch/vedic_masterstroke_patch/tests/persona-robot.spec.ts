/**
 * Persona Robot — Basic / Intermediate / Advanced user journeys
 * Drop into tests/e2e/ and wire into playwright config.
 *
 * Run: npx playwright test tests/e2e/persona-robot.spec.ts
 */

import { test, expect, type Page } from '@playwright/test';

type Grade = 'basic' | 'interm' | 'advanced';

interface Persona {
  grade: Grade;
  name: string;
  birth: {
    name: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    place: string;
    lat?: number;
    lon?: number;
  };
  question?: string;
  expectHindi?: boolean;
}

const PERSONAS: Persona[] = [
  // ── Basic ──────────────────────────────────────────────
  {
    grade: 'basic',
    name: 'Priya-first-timer',
    birth: {
      name: 'Priya Sharma',
      date: '1995-08-14',
      time: '10:30',
      place: 'Jaipur',
    },
    question: 'Will I get a good job this year?',
  },
  {
    grade: 'basic',
    name: 'Ravi-approximate-time',
    birth: {
      name: 'Ravi Kumar',
      date: '1988-03-22',
      time: '12:00', // approximate
      place: 'Delhi',
    },
    question: 'Marriage kab hogi?',
    expectHindi: true,
  },

  // ── Intermediate ───────────────────────────────────────
  {
    grade: 'interm',
    name: 'Ananya-dasha-aware',
    birth: {
      name: 'Ananya Patel',
      date: '1992-11-05',
      time: '06:45',
      place: 'Ahmedabad',
      lat: 23.0225,
      lon: 72.5714,
    },
    question: 'Career and finance outlook for next 2 years. Any important yoga?',
  },

  // ── Advanced ───────────────────────────────────────────
  {
    grade: 'advanced',
    name: 'Practitioner-edge',
    birth: {
      name: 'Test Extreme',
      date: '1947-08-15', // Independence Day edge
      time: '00:00',
      place: 'New Delhi',
      lat: 28.6139,
      lon: 77.209,
    },
    question: 'Show Arudha Lagna, Upapada, Shadbala of 7th lord and current double transit for relationship matters.',
  },
];

async function fillKundliForm(page: Page, p: Persona) {
  // Adjust selectors to match actual data-testid values in the app
  await page.getByTestId('kundli-name-input').fill(p.birth.name);
  await page.getByTestId('kundli-date-input').fill(p.birth.date);
  await page.getByTestId('kundli-time-input').fill(p.birth.time);
  await page.getByTestId('kundli-place-input').fill(p.birth.place);
  // if city picker needs click, handle it
  await page.getByTestId('calculate-kundli-btn').click();
}

for (const persona of PERSONAS) {
  test(`[${persona.grade}] ${persona.name} – Kundli journey`, async ({ page }) => {
    await page.goto('/kundli'); // adjust route

    if (persona.expectHindi) {
      // toggle language if present
      const langBtn = page.getByTestId('lang-toggle-hi');
      if (await langBtn.isVisible()) await langBtn.click();
    }

    await fillKundliForm(page, persona);

    // Wait for chart
    await expect(page.getByTestId('house-polygon-1')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('house-polygon-12')).toBeVisible();

    // Exactly 12 houses
    const houses = page.locator('[data-testid^="house-polygon-"]');
    await expect(houses).toHaveCount(12);

    // Ascendant marker
    await expect(page.getByTestId('ascendant-marker')).toBeVisible();

    // No page errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(500);
    expect(errors, `pageerrors for ${persona.name}`).toEqual([]);

    // Confidence or verdict area should exist
    // (selectors may need tuning to actual Answer Card testids)
    const verdict = page.getByTestId('executive-verdict').or(page.getByTestId('answer-card'));
    await expect(verdict.first()).toBeVisible({ timeout: 10000 });
  });
}
