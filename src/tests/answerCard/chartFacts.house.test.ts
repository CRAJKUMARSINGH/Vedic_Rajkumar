/**
 * chartFacts.house.test.ts — guard for the house baseline.
 *
 * The published card once printed `Sun in the 2nd (Leo)` on a Leo ascendant,
 * because the ephemeris `house` field is counted from the natal Moon (Chandra
 * lagna). `buildChartFacts` must re-reference every placement to the ascendant,
 * so a Moon-baseline house can never leak into a card again.
 */
import { describe, it, expect } from 'vitest';
import type { ChartData } from '@/hooks/useChartCalculation';
import { buildChartFacts } from '@/services/answerCard/chartFacts';

/** Leo ascendant; input `house` values are deliberately Chandra-referenced. */
const ASC = 4;
const MOON_SIGN = 3; // Cancer
const chandraHouse = (sign: number) => ((sign - MOON_SIGN + 12) % 12) + 1;

const chartFixture = {
  ascendant: { ascendant: { rashiIndex: ASC } },
  planetaryPositions: {
    planets: [
      { name: 'Sun', rashiIndex: 4, house: chandraHouse(4), dignity: 'Own Sign', retrograde: false },
      { name: 'Moon', rashiIndex: 3, house: chandraHouse(3), dignity: 'Own Sign', retrograde: false },
      { name: 'Mars', rashiIndex: 6, house: chandraHouse(6), dignity: 'Neutral', retrograde: false },
      { name: 'Mercury', rashiIndex: 5, house: chandraHouse(5), dignity: 'Exalted', retrograde: true },
      { name: 'Venus', rashiIndex: 5, house: chandraHouse(5), dignity: 'Debilitated', retrograde: false },
      { name: 'Jupiter', rashiIndex: 11, house: chandraHouse(11), dignity: 'Own Sign', retrograde: true },
      { name: 'Saturn', rashiIndex: 9, house: chandraHouse(9), dignity: 'Own Sign', retrograde: true },
      { name: 'Rahu', rashiIndex: 2, house: chandraHouse(2), dignity: 'Neutral', retrograde: true },
      { name: 'Ketu', rashiIndex: 8, house: chandraHouse(8), dignity: 'Neutral', retrograde: true },
    ],
  },
} as unknown as ChartData;

describe('chartFacts house baseline', () => {
  it('houses are Lagna-referenced, not Chandra-referenced', () => {
    const facts = buildChartFacts(chartFixture);
    expect(facts).not.toBeNull();
    if (!facts || facts.ascSign === null) return;
    expect(facts.ascSign).toBe(ASC);
    for (const p of facts.placements) {
      expect(p.house).toBe(((p.sign - facts.ascSign + 12) % 12) + 1);
    }
  });

  it('overrides the Moon-baseline house the ephemeris supplied', () => {
    const facts = buildChartFacts(chartFixture)!;
    // Sun in Leo must read house 1 (Lagna), not 2 (Chandra lagna).
    expect(facts.placements.find(p => p.planet === 'Sun')!.house).toBe(1);
    // Moon in Cancer from a Leo lagna is the 12th, not the 1st.
    expect(facts.placements.find(p => p.planet === 'Moon')!.house).toBe(12);
    // Jupiter in Pisces from Leo is the 8th, not the 9th.
    expect(facts.placements.find(p => p.planet === 'Jupiter')!.house).toBe(8);
  });
});
