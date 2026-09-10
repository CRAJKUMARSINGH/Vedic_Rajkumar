/**
 * Week 07 Enhanced Tests — Dasha + Transit Correlation
 *
 * Covers the Week 07 acceptance criteria:
 *   AC-1  Pratyantar Dasha: lord is a known planet, dates are valid, stored in result
 *   AC-2  Chandrashtama: Moon in house 8 triggers isChandrashtama flag
 *   AC-3  Ashtakavarga: SAV scores present in every TransitPlanetPosition;
 *         ashtakavargaSummary present in result
 *   AC-4  Deterministic scoring: identical inputs produce identical scores (no Math.random)
 *   AC-5  All existing Week 07 tests continue to pass (regression guard)
 *   AC-6  PDF: buildPdfContent includes Pratyantar row, SAV column, Chandrashtama text
 *
 * Uses the real Kundli engine with Rajkumar reference chart.
 * No mocks — pure calculation tests.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  computeCorrelation,
  computeMonthlyOutlook,
  type DashaTransitCorrelationResult,
  type ActivationLevel,
} from '@/services/dashaTransitCorrelationService';
import { calculateDashaGochaCorrelation } from '@/services/dashaGocharaCorrelationService';
import { buildPdfContent } from '@/services/dashaTransitPdfService';
import type { BirthData } from '@/features/kundli/types';

// ─── Reference data ───────────────────────────────────────────────────────────

const RAJKUMAR: BirthData = {
  name:      'Rajkumar',
  date:      '1963-09-15',
  time:      '06:00',
  timezone:  'Asia/Kolkata',
  latitude:  23.5,
  longitude: 74.32,
  place:     'Aspur, Rajasthan',
};

const TARGET_DATE = '2026-09-08';

const KNOWN_PLANETS = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter',
  'Venus', 'Saturn', 'Rahu', 'Ketu',
];

// ─── AC-1: Pratyantar Dasha ───────────────────────────────────────────────────

describe('AC-1: Pratyantar Dasha', () => {
  let result: DashaTransitCorrelationResult;

  beforeAll(() => {
    result = computeCorrelation(RAJKUMAR, TARGET_DATE);
  });

  it('activeDasha contains pratyanLord', () => {
    expect(result.activeDasha.pratyanLord).toBeDefined();
    expect(typeof result.activeDasha.pratyanLord).toBe('string');
    expect(result.activeDasha.pratyanLord.length).toBeGreaterThan(0);
  });

  it('pratyanLord is a known planet', () => {
    expect(KNOWN_PLANETS).toContain(result.activeDasha.pratyanLord);
  });

  it('activeDasha contains pratyanStart and pratyanEnd', () => {
    expect(result.activeDasha.pratyanStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.activeDasha.pratyanEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('pratyanStart is not after pratyanEnd', () => {
    const start = new Date(result.activeDasha.pratyanStart).getTime();
    const end   = new Date(result.activeDasha.pratyanEnd).getTime();
    expect(start).toBeLessThanOrEqual(end);
  });

  it('pratyantar period is within the Antardasha period', () => {
    const antarStart = new Date(result.activeDasha.antarStart).getTime();
    const antarEnd   = new Date(result.activeDasha.antarEnd).getTime();
    const pratStart  = new Date(result.activeDasha.pratyanStart).getTime();
    const pratEnd    = new Date(result.activeDasha.pratyanEnd).getTime();
    // Pratyantar must be contained within Antar boundaries
    expect(pratStart).toBeGreaterThanOrEqual(antarStart);
    expect(pratEnd).toBeLessThanOrEqual(antarEnd);
  });
});

// ─── AC-2: Chandrashtama ─────────────────────────────────────────────────────

describe('AC-2: Chandrashtama detection', () => {
  it('isChandrashtama is a boolean', () => {
    const result = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(typeof result.isChandrashtama).toBe('boolean');
  });

  it('isChandrashtama is true when Moon transits house 8 from natal Moon', () => {
    // Find a date when Moon is in house 8 from Rajkumar's natal Moon
    // Moon moves ~13°/day, so we scan forward up to 30 days
    let chandrashtamaDate: string | null = null;

    for (let d = 0; d < 30; d++) {
      const date = new Date('2026-09-08T00:00:00Z');
      date.setUTCDate(date.getUTCDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      const res = computeCorrelation(RAJKUMAR, dateStr);
      const moonPosition = res.transitPositions.find((tp) => tp.planet === 'Moon');
      if (moonPosition?.houseFromMoon === 8) {
        chandrashtamaDate = dateStr;
        break;
      }
    }

    if (chandrashtamaDate) {
      const result = computeCorrelation(RAJKUMAR, chandrashtamaDate);
      expect(result.isChandrashtama).toBe(true);
    } else {
      // Moon moves ~1 sign every 2.5 days; if we didn't find house 8 in 30 days,
      // just verify the flag correctly reflects the Moon position on any date
      const result = computeCorrelation(RAJKUMAR, TARGET_DATE);
      const moonHouse = result.transitPositions.find((tp) => tp.planet === 'Moon')?.houseFromMoon;
      expect(result.isChandrashtama).toBe(moonHouse === 8);
    }
  });

  it('isChandrashtama is false when Moon is NOT in house 8', () => {
    // Use the reference date; check the result matches the Moon's actual house
    const result = computeCorrelation(RAJKUMAR, TARGET_DATE);
    const moonHouse = result.transitPositions.find((tp) => tp.planet === 'Moon')?.houseFromMoon;
    if (moonHouse !== 8) {
      expect(result.isChandrashtama).toBe(false);
    }
    // If Moon happens to be in house 8 on this date, the flag should be true
    else {
      expect(result.isChandrashtama).toBe(true);
    }
  });

  it('isChandrashtama flag is consistent with Moon houseFromMoon in transitPositions', () => {
    const result = computeCorrelation(RAJKUMAR, TARGET_DATE);
    const moonHouse = result.transitPositions.find((tp) => tp.planet === 'Moon')?.houseFromMoon;
    expect(result.isChandrashtama).toBe(moonHouse === 8);
  });
});

// ─── AC-3: Ashtakavarga integration ──────────────────────────────────────────

describe('AC-3: Ashtakavarga SAV scores in transit positions', () => {
  let result: DashaTransitCorrelationResult;

  beforeAll(() => {
    result = computeCorrelation(RAJKUMAR, TARGET_DATE);
  });

  it('every TransitPlanetPosition has a savScore field', () => {
    result.transitPositions.forEach((tp) => {
      expect(tp).toHaveProperty('savScore');
      expect(typeof tp.savScore).toBe('number');
    });
  });

  it('savScore is within valid range 0–56 for all planets', () => {
    result.transitPositions.forEach((tp) => {
      expect(tp.savScore).toBeGreaterThanOrEqual(0);
      expect(tp.savScore).toBeLessThanOrEqual(56);
    });
  });

  it('every TransitPlanetPosition has a savStrength field', () => {
    result.transitPositions.forEach((tp) => {
      expect(tp).toHaveProperty('savStrength');
      expect(['Strong', 'Moderate', 'Weak']).toContain(tp.savStrength);
    });
  });

  it('savStrength is consistent with savScore using planet modifiers', () => {
    // The ashtakavargaTransitService applies planet-specific multipliers to raw savScore
    // before classifying strength (e.g. Jupiter 1.3×, Moon 1.2×, Rahu/Ketu 0.8×).
    // So savStrength is based on (savScore × modifier), NOT raw savScore alone.
    // We simply verify the enum is one of the three valid values (done in prior test)
    // and that isFavorable (savScore >= 28 raw) is internally consistent.
    const MODIFIERS: Record<string, number> = {
      Sun: 1.0, Moon: 1.2, Mars: 1.1, Mercury: 0.9,
      Jupiter: 1.3, Venus: 1.1, Saturn: 1.0, Rahu: 0.8, Ketu: 0.8,
    };
    result.transitPositions.forEach((tp) => {
      const modified = tp.savScore * (MODIFIERS[tp.planet] ?? 1.0);
      const expectedStrength =
        modified >= 28 ? 'Strong' :
        modified >= 25 ? 'Moderate' : 'Weak';
      expect(tp.savStrength).toBe(expectedStrength);
    });
  });

  it('result has ashtakavargaSummary object', () => {
    expect(result.ashtakavargaSummary).toBeDefined();
  });

  it('ashtakavargaSummary.overallStrength is Strong/Moderate/Weak', () => {
    expect(['Strong', 'Moderate', 'Weak']).toContain(
      result.ashtakavargaSummary.overallStrength,
    );
  });

  it('ashtakavargaSummary.averageScore is in valid range', () => {
    expect(result.ashtakavargaSummary.averageScore).toBeGreaterThanOrEqual(0);
    expect(result.ashtakavargaSummary.averageScore).toBeLessThanOrEqual(56);
  });

  it('favorableTransits + unfavorableTransits ≤ 9 (total planets)', () => {
    const { favorableTransits, unfavorableTransits } = result.ashtakavargaSummary;
    expect(favorableTransits + unfavorableTransits).toBeLessThanOrEqual(9);
  });
});

// ─── AC-4: Deterministic scoring ─────────────────────────────────────────────

describe('AC-4: Deterministic score — no Math.random()', () => {
  it('calculateDashaGochaCorrelation produces identical scores on repeated calls', () => {
    const transitHouses = {
      Sun: 3, Moon: 7, Mars: 6, Mercury: 10,
      Jupiter: 11, Venus: 2, Saturn: 3, Rahu: 6, Ketu: 11,
    };

    const r1 = calculateDashaGochaCorrelation('Saturn', 'Jupiter', transitHouses);
    const r2 = calculateDashaGochaCorrelation('Saturn', 'Jupiter', transitHouses);
    const r3 = calculateDashaGochaCorrelation('Saturn', 'Jupiter', transitHouses);

    expect(r1.score).toBe(r2.score);
    expect(r2.score).toBe(r3.score);
    expect(r1.activationLevel).toBe(r2.activationLevel);
  });

  it('computeCorrelation produces identical scores on repeated calls', () => {
    const r1 = computeCorrelation(RAJKUMAR, TARGET_DATE);
    const r2 = computeCorrelation(RAJKUMAR, TARGET_DATE);

    expect(r1.correlation.score).toBe(r2.correlation.score);
    expect(r1.correlation.activationLevel).toBe(r2.correlation.activationLevel);
  });

  it('both lords favorable → score is 88 (or higher with Pratyantar bonus)', () => {
    // Sun in house 3 (favorable), Moon in house 1 (favorable for Moon)
    const allFavorable = {
      Sun: 3, Moon: 1, Mars: 6, Mercury: 10,
      Jupiter: 11, Venus: 2, Saturn: 3, Rahu: 6, Ketu: 11,
    };
    const r = calculateDashaGochaCorrelation('Sun', 'Moon', allFavorable);
    expect(r.activationLevel).toBe('High');
    expect(r.score).toBeGreaterThanOrEqual(88);
  });

  it('neither lord favorable → score is 32 (or with Pratyantar bonus capped at 38)', () => {
    // House 2 is not in Sun's favorable list [3,6,10,11]
    // House 2 is not in Mars's favorable list [3,6,11]
    const neitherFavorable = {
      Sun: 2, Moon: 2, Mars: 2, Mercury: 2,
      Jupiter: 2, Venus: 6, Saturn: 2, Rahu: 2, Ketu: 2,
    };
    const r = calculateDashaGochaCorrelation('Sun', 'Mars', neitherFavorable);
    expect(r.activationLevel).toBe('Low');
    expect(r.score).toBeLessThanOrEqual(38); // 32 base + max 6 Pratyantar bonus
  });

  it('Pratyantar bonus: score increases by 6 when pratyanLord is in favorable house', () => {
    const transitHouses = {
      Sun: 2, Moon: 2, Mars: 3, Mercury: 2,
      Jupiter: 2, Venus: 2, Saturn: 2, Rahu: 2, Ketu: 2,
    };
    // Without Pratyantar
    const rWithout = calculateDashaGochaCorrelation('Sun', 'Moon', transitHouses);
    // With Pratyantar lord Mars in house 3 (favorable for Mars)
    const rWith = calculateDashaGochaCorrelation('Sun', 'Moon', transitHouses, 'Mars');

    expect(rWith.score).toBe(rWithout.score + 6);
  });
});

// ─── AC-5: Regression — existing result structure ────────────────────────────

describe('AC-5 Regression: existing result structure still intact', () => {
  let result: DashaTransitCorrelationResult;

  beforeAll(() => {
    result = computeCorrelation(RAJKUMAR, TARGET_DATE);
  });

  it('returns a result without throwing', () => {
    expect(result).toBeTruthy();
  });

  it('targetDate matches input', () => {
    expect(result.targetDate).toBe(TARGET_DATE);
  });

  it('moonSign is a valid zodiac sign', () => {
    const SIGNS = [
      'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
      'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
    ];
    expect(SIGNS).toContain(result.moonSign);
  });

  it('returns exactly 9 transit positions', () => {
    expect(result.transitPositions).toHaveLength(9);
  });

  it('all 9 canonical planets are present', () => {
    const planets = result.transitPositions.map((tp) => tp.planet);
    KNOWN_PLANETS.forEach((p) => expect(planets).toContain(p));
  });

  it('houseFromMoon is 1–12 for every planet', () => {
    result.transitPositions.forEach((tp) => {
      expect(tp.houseFromMoon).toBeGreaterThanOrEqual(1);
      expect(tp.houseFromMoon).toBeLessThanOrEqual(12);
    });
  });

  it('correlation activationLevel is High/Medium/Low', () => {
    const valid: ActivationLevel[] = ['High', 'Medium', 'Low'];
    expect(valid).toContain(result.correlation.activationLevel);
  });

  it('monthlyOutlook has exactly 12 items', () => {
    expect(result.monthlyOutlook).toHaveLength(12);
  });
});

// ─── AC-6: PDF content includes Week 07 enhancements ─────────────────────────

describe('AC-6: PDF content — Week 07 enhancements', () => {
  let result: DashaTransitCorrelationResult;

  beforeAll(() => {
    result = computeCorrelation(RAJKUMAR, TARGET_DATE);
  });

  it('buildPdfContent runs without throwing', () => {
    expect(() => buildPdfContent(result, { lang: 'en', nativeName: 'Rajkumar' })).not.toThrow();
  });

  it('PDF title includes native name', () => {
    const content = buildPdfContent(result, { lang: 'en', nativeName: 'Rajkumar' });
    expect(content.title).toContain('Rajkumar');
  });

  it('Pratyantar Dasha row appears in PDF kv section', () => {
    const content = buildPdfContent(result, { lang: 'en', nativeName: 'Rajkumar' });
    const kvSection = content.sections.find(
      (s) => s.type === 'kv' &&
      (s as { type: 'kv'; rows: Array<{ label: string; value: string }> }).rows.some(
        (r) => r.label === 'Pratyantar Dasha',
      ),
    );
    expect(kvSection).toBeDefined();
  });

  it('transit table in PDF has SAV column header', () => {
    const content = buildPdfContent(result, { lang: 'en', nativeName: 'Rajkumar' });
    const tableSection = content.sections.find(
      (s) => s.type === 'table' &&
      (s as { type: 'table'; headers: string[]; rows: string[][] }).headers.includes('SAV'),
    );
    expect(tableSection).toBeDefined();
  });

  it('SAV values appear in transit table rows', () => {
    const content = buildPdfContent(result, { lang: 'en', nativeName: 'Rajkumar' });
    const tableSection = content.sections.find(
      (s) => s.type === 'table' &&
      (s as { type: 'table'; headers: string[]; rows: string[][] }).headers.includes('SAV'),
    ) as { type: 'table'; headers: string[]; rows: string[][] } | undefined;

    if (tableSection) {
      tableSection.rows.forEach((row) => {
        // SAV column is index 4: "score / Strength"
        expect(row[4]).toMatch(/^\d+ \/ (Strong|Moderate|Weak)$/);
      });
    }
  });

  it('Ashtakavarga section appears in PDF', () => {
    const content = buildPdfContent(result, { lang: 'en', nativeName: 'Rajkumar' });
    const hasAshtakavargaHeading = content.sections.some(
      (s) => s.type === 'heading' &&
      (s as { type: 'heading'; text: string }).text.toLowerCase().includes('ashtakavarga'),
    );
    expect(hasAshtakavargaHeading).toBe(true);
  });

  it('Chandrashtama text appears in PDF when isChandrashtama is true', () => {
    // Inject a mock result with isChandrashtama=true to test PDF branch
    const chandrashtamaResult = {
      ...result,
      isChandrashtama: true,
    };
    const content = buildPdfContent(chandrashtamaResult, { lang: 'en' });
    const hasChandrashtamaText = content.sections.some(
      (s) => s.type === 'text' &&
      (s as { type: 'text'; text: string }).text.toUpperCase().includes('CHANDRASHTAMA'),
    );
    expect(hasChandrashtamaText).toBe(true);
  });

  it('Chandrashtama warning absent when isChandrashtama is false', () => {
    const noChandraResult = {
      ...result,
      isChandrashtama: false,
    };
    const content = buildPdfContent(noChandraResult, { lang: 'en' });
    const hasChandrashtamaText = content.sections.some(
      (s) => s.type === 'text' &&
      (s as { type: 'text'; text: string }).text.toUpperCase().includes('CHANDRASHTAMA'),
    );
    expect(hasChandrashtamaText).toBe(false);
  });

  it('Hindi PDF includes Pratyantar Dasha label in Hindi', () => {
    const content = buildPdfContent(result, { lang: 'hi', nativeName: 'राजकुमार' });
    const kvSection = content.sections.find(
      (s) => s.type === 'kv' &&
      (s as { type: 'kv'; rows: Array<{ label: string; value: string }> }).rows.some(
        (r) => r.label === 'प्रत्यंतर दशा',
      ),
    );
    expect(kvSection).toBeDefined();
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('Edge cases — Week 07 additions', () => {
  it('southern hemisphere birth has pratyanLord', () => {
    const sydney: BirthData = {
      name: 'Test South',
      date: '1985-06-15',
      time: '12:00',
      timezone: 'Australia/Sydney',
      latitude: -33.87,
      longitude: 151.21,
      place: 'Sydney, Australia',
    };
    const res = computeCorrelation(sydney, TARGET_DATE);
    expect(KNOWN_PLANETS).toContain(res.activeDasha.pratyanLord);
  });

  it('southern hemisphere birth has SAV scores', () => {
    const sydney: BirthData = {
      name: 'Test South',
      date: '1985-06-15',
      time: '12:00',
      timezone: 'Australia/Sydney',
      latitude: -33.87,
      longitude: 151.21,
      place: 'Sydney, Australia',
    };
    const res = computeCorrelation(sydney, TARGET_DATE);
    res.transitPositions.forEach((tp) => {
      expect(tp.savScore).toBeGreaterThanOrEqual(0);
      expect(tp.savScore).toBeLessThanOrEqual(56);
    });
  });

  it('far future date (2040) still has SAV scores and isChandrashtama flag', () => {
    const res = computeCorrelation(RAJKUMAR, '2040-01-01');
    expect(typeof res.isChandrashtama).toBe('boolean');
    expect(res.ashtakavargaSummary).toBeDefined();
    res.transitPositions.forEach((tp) => {
      expect(typeof tp.savScore).toBe('number');
    });
  });

  it('Pratyantar period is narrower (shorter) than Antardasha period', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    const antarDays =
      (new Date(res.activeDasha.antarEnd).getTime() -
       new Date(res.activeDasha.antarStart).getTime()) / 86400000;
    const pratyanDays =
      (new Date(res.activeDasha.pratyanEnd).getTime() -
       new Date(res.activeDasha.pratyanStart).getTime()) / 86400000;
    expect(pratyanDays).toBeLessThanOrEqual(antarDays);
  });
});
