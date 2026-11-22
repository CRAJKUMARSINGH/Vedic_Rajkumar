/**
 * sudarshanaChakraService.test.ts — Tri-Bhava (Sri Sudarshana Chakra).
 *
 * Guards: the three references, the whole-sign house projection from each,
 * the 0–3 agreement count, bilingual verdicts, and the null-when-incomplete
 * contract (no partial reading from a broken triad).
 */
import { describe, it, expect } from 'vitest';
import type { ChartData } from '@/hooks/useChartCalculation';
import {
  computeSudarshanaChakra,
  readSudarshanaBhava,
  SUDARSHANA_REFS,
} from '@/services/sudarshanaChakraService';

/**
 * Rajkumar-shaped chart: Leo ascendant, Sun in Leo, Moon in Cancer. Only
 * `name` + `rashiIndex` are read by the service; the rest is filled to satisfy
 * the shape.
 */
const chart = (over: Partial<Record<string, number>> = {}): ChartData => {
  const signs: Record<string, number> = {
    Sun: 4, Moon: 3, Mars: 6, Mercury: 5, Jupiter: 11,
    Venus: 5, Saturn: 9, Rahu: 2, Ketu: 8, ...over,
  };
  const planets = Object.entries(signs)
    .filter(([, s]) => s >= 0)
    .map(([name, rashiIndex]) => ({
      name, rashiIndex, degrees: 10, house: 1, dignity: 'Neutral',
    }));
  return {
    planetaryPositions: { planets },
    ascendant: { ascendant: { rashiIndex: 4 } },
  } as unknown as ChartData;
};

describe('sudarshanaChakraService', () => {
  it('returns null when the triad (ascendant / Moon / Sun) is incomplete', () => {
    expect(computeSudarshanaChakra(null)).toBeNull();
    expect(computeSudarshanaChakra(chart({ Sun: -1 }))).toBeNull();
    expect(computeSudarshanaChakra(chart({ Moon: -1 }))).toBeNull();
    expect(
      computeSudarshanaChakra({ planetaryPositions: { planets: [] } } as unknown as ChartData),
    ).toBeNull();
  });

  it('reads the three reference signs', () => {
    const sc = computeSudarshanaChakra(chart());
    expect(sc).not.toBeNull();
    expect(sc!.ascSign).toBe(4);   // Leo
    expect(sc!.moonSign).toBe(3);  // Cancer
    expect(sc!.sunSign).toBe(4);   // Leo
    expect(SUDARSHANA_REFS).toEqual(['lagna', 'chandra', 'surya']);
  });

  it('projects each planet to a house from each reference (whole-sign)', () => {
    const sc = computeSudarshanaChakra(chart())!;
    const sun = sc.planets.find(p => p.planet === 'Sun')!;
    // Sun in Leo: 1st from Leo lagna, 2nd from Cancer (Moon), 1st from Leo (Sun).
    expect(sun.fromLagna).toBe(1);
    expect(sun.fromMoon).toBe(2);
    expect(sun.fromSun).toBe(1);

    const ketu = sc.planets.find(p => p.planet === 'Ketu')!;
    // Ketu in Sagittarius (8): 5th from Leo, 6th from Cancer, 5th from Leo.
    expect(ketu.fromLagna).toBe(5);
    expect(ketu.fromMoon).toBe(6);
  });

  it('builds 12 bhavas, each with exactly the three references', () => {
    const sc = computeSudarshanaChakra(chart())!;
    expect(sc.bhavas).toHaveLength(12);
    sc.bhavas.forEach((b, i) => {
      expect(b.bhava).toBe(i + 1);
      expect(b.refs.map(r => r.ref)).toEqual(['lagna', 'chandra', 'surya']);
      expect(b.confirmation).toBeGreaterThanOrEqual(0);
      expect(b.confirmation).toBeLessThanOrEqual(3);
    });
  });

  it('confirms the 1st bhava in all three charts for a Leo-lagna / Leo-Sun / Cancer-Moon chart', () => {
    const sc = computeSudarshanaChakra(chart())!;
    const first = sc.bhavas[0];
    // Lagna chart: 1st = Leo → Sun occupant, lord Sun in Leo (own) → strong.
    // Chandra chart: 1st = Cancer → Moon occupant, lord Moon in Cancer (own) → strong.
    // Surya chart: 1st = Leo → Sun occupant, lord Sun in Leo (own) → strong.
    expect(first.confirmation).toBe(3);
    expect(first.refsOccupied).toBe(3);
    expect(first.refsLordStrong).toBe(3);
    expect(first.verdict.en).toContain('all three');
  });

  it('carries only bilingual verdicts (Hindi has Devanagari, English does not)', () => {
    const sc = computeSudarshanaChakra(chart())!;
    for (const b of sc.bhavas) {
      expect(b.verdict.en).not.toMatch(/[\u0900-\u097F]/);
      expect(b.verdict.hi).toMatch(/[\u0900-\u097F]/);
    }
  });

  it('names a strongest and weakest bhava, both in range', () => {
    const sc = computeSudarshanaChakra(chart())!;
    expect(sc.strongestBhava).toBeGreaterThanOrEqual(1);
    expect(sc.strongestBhava).toBeLessThanOrEqual(12);
    expect(sc.weakestBhava).toBeGreaterThanOrEqual(1);
    expect(sc.weakestBhava).toBeLessThanOrEqual(12);
    const max = Math.max(...sc.bhavas.map(b => b.confirmation));
    expect(sc.bhavas[sc.strongestBhava - 1].confirmation).toBe(max);
  });

  it('readSudarshanaBhava rejects out-of-range input', () => {
    const sc = computeSudarshanaChakra(chart())!;
    expect(readSudarshanaBhava(sc, 0)).toBeNull();
    expect(readSudarshanaBhava(sc, 13)).toBeNull();
    expect(readSudarshanaBhava(sc, 4)?.bhava).toBe(4);
  });
});
