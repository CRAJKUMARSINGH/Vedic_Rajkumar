import { describe, it, expect } from 'vitest';
import { buildChartFacts } from '@/services/answerCard/chartFacts';
import type { ChartData } from '@/hooks/useChartCalculation';
import { getPlanetDignity } from '@/services/ephemerisService';

const planet = (name: string, rashiIndex: number, house = 1, dignity = '', retrograde = false) => ({
  name, rashiIndex, rashiName: `R${rashiIndex}`, degrees: 10, house, dignity, retrograde,
});

const baseData = (over: Partial<ChartData> = {}): ChartData => ({
  planetaryPositions: {
    planets: [
      planet('Sun', 0, 1), planet('Moon', 1, 2), planet('Mars', 9, 10),
      planet('Mercury', 5, 6), planet('Jupiter', 3, 4), planet('Venus', 11, 12),
      planet('Saturn', 6, 7), planet('Rahu', 2, 3), planet('Ketu', 8, 9),
    ],
    ayanamsa: 24, julianDay: 2450000,
  } as ChartData['planetaryPositions'],
  ascendant: { ascendant: { rashiIndex: 0, rashiName: 'Aries' } } as ChartData['ascendant'],
  nakshatra: null, manglik: null, dasha: null, yogas: null,
  divisionalCharts: null, shadbala: null,
  ashtakavarga: {
    houseStrengths: [
      { house: 1, rashiIndex: 0, savPoints: 28, strength: 'good', label: { en: 'Good', hi: 'अच्छा' } },
      { house: 2, rashiIndex: 1, savPoints: 15, strength: 'weak', label: { en: 'Weak', hi: 'कमजोर' } },
    ],
  } as ChartData['ashtakavarga'],
  ...over,
});

describe('buildChartFacts — projection validation', () => {
  it('projects a well-formed chart', () => {
    const f = buildChartFacts(baseData())!;
    expect(f.ascSign).toBe(0);
    expect(f.placements).toHaveLength(9);
    expect(f.houses[1]).toEqual({ strength: 'good', savPoints: 28 });
    expect(f.houses[3]).toBeUndefined(); // absent row stays absent
  });

  it('returns null when planetary positions are missing', () => {
    expect(buildChartFacts(null)).toBeNull();
    expect(buildChartFacts(baseData({ planetaryPositions: null }))).toBeNull();
    expect(buildChartFacts(baseData({
      planetaryPositions: { planets: [] } as ChartData['planetaryPositions'],
    }))).toBeNull();
  });

  it('ascSign null on invalid/missing ascendant, never defaults to 0', () => {
    for (const bad of [undefined, null, 12, -1, 1.5, 'x']) {
      const f = buildChartFacts(baseData({
        ascendant: bad === undefined || bad === null
          ? null
          : { ascendant: { rashiIndex: bad } } as ChartData['ascendant'],
      }))!;
      expect(f.ascSign).toBeNull();
    }
  });

  it('drops invalid sign indices and houses, keeps valid entries', () => {
    const d = baseData();
    d.planetaryPositions!.planets.push(
      planet('Sun', 5, 1) as never,      // duplicate → keep first only
      planet('Mars', 12, 1) as never,    // bad sign
      planet('Jupiter', 3, 13) as never, // bad house
    );
    const f = buildChartFacts(d)!;
    expect(f.placements.filter(p => p.planet === 'Sun')).toHaveLength(1);
    expect(f.placements.find(p => p.planet === 'Mars')?.sign).toBe(9);
    expect(f.placements.find(p => p.planet === 'Jupiter')?.house).toBe(4);
  });

  it('drops non-finite savPoints and unknown strength enums', () => {
    const d = baseData();
    (d.ashtakavarga!.houseStrengths as unknown[]).push(
      { house: 3, savPoints: NaN, strength: 'good' },
      { house: 4, savPoints: 30, strength: 'bogus' },
      { house: 13, savPoints: 20, strength: 'good' },
    );
    const f = buildChartFacts(d)!;
    expect(f.houses[3]).toBeUndefined();
    expect(f.houses[4]).toBeUndefined();
    expect(f.houses[13]).toBeUndefined();
  });

  it('dignity matches canonical getPlanetDignity for exalted/ debilitated', () => {
    const f = buildChartFacts(baseData())!;
    const sun = f.placements.find(p => p.planet === 'Sun')!;
    expect(sun.sign).toBe(0); // Sun exalted in Aries (sign 0)
    expect(sun.dignity).toBe('exalted');
    // cross-check against the canonical service directly
    expect(getPlanetDignity('Sun', 0).toLowerCase()).toContain('exalt');
  });

  it('missing dignity string falls back to canonical service, not "unknown" blindly', () => {
    const d = baseData();
    d.planetaryPositions!.planets[0].dignity = ''; // Sun in Aries
    const f = buildChartFacts(d)!;
    expect(f.placements.find(p => p.planet === 'Sun')!.dignity).toBe('exalted');
  });

  it('is deterministic — same input, same output', () => {
    const d = baseData();
    expect(buildChartFacts(d)).toEqual(buildChartFacts(d));
  });
});
