/**
 * festivals.golden.test.ts — pins festival dates.
 *
 * A festival date is a claim about the real world. It must be sourced and pinned,
 * and changing one must be a deliberate, reviewable act — not a silent content edit.
 *
 * Update flow: change the fixture, cite the source in the commit message, and the
 * diff IS the review.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Festival { key: string; date: string; source_url: string }

// The fixture is generated from the live database by `npm run content:golden:sync`
// (needs SUPABASE_DB_URL), so it is absent on a fresh clone. Guarded with skipIf
// below so an absent fixture does not abort `npm run test:run` — and therefore
// the pre-push hook — on machines that cannot generate it.
const FIXTURE_PATH = join(process.cwd(), 'src', 'tests', 'content', 'festivals.golden.json');
const hasFixture = existsSync(FIXTURE_PATH);

const fixture = (
  hasFixture ? JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8')) : { years: {} }
) as { years: Record<string, Festival[]> };

describe.skipIf(!hasFixture)('festival calendar golden', () => {
  const currentYear = new Date().getFullYear();
  const requiredYears = [currentYear, currentYear + 1];

  it('covers the current and next year', () => {
    for (const y of requiredYears) {
      expect(fixture.years[String(y)], `missing year ${y}`).toBeDefined();
      expect(fixture.years[String(y)].length).toBeGreaterThan(8);
    }
  });

  it('every festival has a source and a valid ISO date', () => {
    for (const [year, list] of Object.entries(fixture.years)) {
      for (const f of list) {
        expect(f.source_url, `${f.key} needs a source`).toMatch(/^https?:\/\//);
        expect(f.date, `${f.key} bad date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(new Date(f.date).getFullYear()).toBe(Number(year));
      }
    }
  });

  it('no duplicate festival keys within a year', () => {
    for (const list of Object.values(fixture.years)) {
      const keys = list.map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('dates are within a sane window of the previous year (no typo years)', () => {
    // Diwali-style festivals drift by days, not months. A >60 day jump is a typo.
    for (const y of requiredYears.slice(1)) {
      const prev = fixture.years[String(y - 1)] ?? [];
      const cur = fixture.years[String(y)];
      for (const f of cur) {
        const p = prev.find((x) => x.key.replace(/\.\d{4}$/, '') === f.key.replace(/\.\d{4}$/, ''));
        if (!p) continue;
        const deltaDays = Math.abs(
          (new Date(f.date).getTime() - new Date(p.date).getTime()) / 86_400_000,
        );
        expect(deltaDays, `${f.key} moved ${deltaDays.toFixed(0)} days`).toBeLessThan(60);
      }
    }
  });
});
