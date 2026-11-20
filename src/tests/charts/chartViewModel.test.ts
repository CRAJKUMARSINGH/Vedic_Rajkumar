/**
 * c4 Phase 9 — chart-view model verification (synthetic fixtures only).
 */

import { describe, it, expect } from 'vitest';
import {
  assembleViewModel,
  buildRashiViewModel,
  buildVargaViewModel,
  countedPlanets,
  isValidHouseNumber,
  isValidSignIndex,
  planetsInHouse,
  planetsInSign,
} from '@/features/charts/model/chartViewModel';
import { makeD1ViewModel, seed, longOf } from './fixtures';

const CALC = {
  engine: 'test',
  version: '1.0',
  ayanamsa: 'Lahiri',
  zodiac: 'sidereal' as const,
  houseSystem: 'Whole Sign',
};

describe('index validation', () => {
  it('accepts only integers within range', () => {
    expect(isValidSignIndex(0)).toBe(true);
    expect(isValidSignIndex(11)).toBe(true);
    expect(isValidSignIndex(12)).toBe(false);
    expect(isValidSignIndex(-1)).toBe(false);
    expect(isValidSignIndex(1.5)).toBe(false);
    expect(isValidSignIndex(NaN)).toBe(false);

    expect(isValidHouseNumber(1)).toBe(true);
    expect(isValidHouseNumber(12)).toBe(true);
    expect(isValidHouseNumber(0)).toBe(false);
    expect(isValidHouseNumber(13)).toBe(false);
  });
});

describe('assembleViewModel', () => {
  it('builds exactly twelve houses and derives their signs from the ascendant', () => {
    const model = makeD1ViewModel();
    expect(model.houses).toHaveLength(12);
    expect(model.ascendantSign).toBe(0);
    // House signs run Aries → Pisces when the ascendant is Aries.
    expect(model.houses.map((h) => h.sign)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(model.houses[0].isAscendant).toBe(true);
    expect(model.houses[1].isAscendant).toBe(false);
  });

  it('supports multiple planets in one house', () => {
    const model = makeD1ViewModel();
    expect(planetsInHouse(model, 1).map((p) => p.key)).toEqual(['Sun', 'Mars']);
  });

  it('leaves truly empty houses empty (not filled with placeholders)', () => {
    const model = makeD1ViewModel();
    for (const h of [3, 5, 8, 10, 11]) {
      expect(planetsInHouse(model, h)).toHaveLength(0);
    }
  });

  it('distinguishes unavailable (null) from a real zero value', () => {
    const model = assembleViewModel({
      chartType: 'D1',
      layout: 'north',
      ascendantSign: 0,
      seeds: [
        seed({ key: 'Sun', sign: 0, house: 1, degrees: 0, longitude: 0 }),
        seed({ key: 'Moon', sign: null, house: null, degrees: null, longitude: null }),
      ],
      calculation: CALC,
    });
    const sun = model.planets.find((p) => p.key === 'Sun');
    const moon = model.planets.find((p) => p.key === 'Moon');
    expect(sun?.degrees).toBe(0);
    expect(sun?.degrees).not.toBeNull();
    expect(moon?.degrees).toBeNull();
    expect(moon?.sign).toBeNull();
    expect(countedPlanets(model)).toBe(1);
  });

  it('keeps a deterministic display order (classical graha order)', () => {
    const model = makeD1ViewModel();
    expect(model.planets.map((p) => p.key)).toEqual([
      'Sun',
      'Moon',
      'Mars',
      'Mercury',
      'Jupiter',
      'Saturn',
      'Rahu',
      'Ketu',
    ]);
  });

  it('warns and nulls an invalid sign index rather than throwing', () => {
    const model = assembleViewModel({
      chartType: 'D1',
      layout: 'north',
      ascendantSign: 0,
      seeds: [seed({ key: 'Sun', sign: 99, house: 1, degrees: 5, longitude: 5 })],
      calculation: CALC,
    });
    expect(model.planets[0].sign).toBeNull();
    expect(model.warnings.some((w) => /Invalid sign index/.test(w))).toBe(true);
  });

  it('warns and nulls an invalid house number', () => {
    const model = assembleViewModel({
      chartType: 'D1',
      layout: 'north',
      ascendantSign: 0,
      seeds: [seed({ key: 'Sun', sign: 0, house: 0, degrees: 5, longitude: 5 })],
      calculation: CALC,
    });
    expect(model.planets[0].house).toBeNull();
    expect(model.warnings.some((w) => /Invalid house/.test(w))).toBe(true);
  });

  it('derives nakshatra + pada when a longitude is available', () => {
    const model = makeD1ViewModel();
    const sun = model.planets.find((p) => p.key === 'Sun');
    expect(sun?.nakshatra).not.toBeNull();
    expect(sun?.nakshatra?.name.en).toBeTruthy();
    expect(sun?.nakshatra?.pada).toBeGreaterThanOrEqual(1);
    expect(sun?.nakshatra?.pada).toBeLessThanOrEqual(4);
  });

  it('groups planets by rashi for sign-based layouts', () => {
    const model = makeD1ViewModel();
    expect(planetsInSign(model, 0).map((p) => p.key)).toEqual(['Sun', 'Mars']);
    expect(planetsInSign(model, 9)).toHaveLength(0);
  });
});

describe('adapters from canonical service output', () => {
  it('builds a D1 view model from positions + ascendant, nulling missing data', () => {
    const model = buildRashiViewModel({
      positions: null,
      ascendant: null,
      chartType: 'D1',
    });
    expect(model.chartType).toBe('D1');
    expect(model.ascendantSign).toBeNull();
    expect(model.planets).toHaveLength(0);
    expect(model.warnings.length).toBeGreaterThan(0);
    expect(model.calculation.zodiac).toBe('sidereal');
  });

  it('builds a varga view model from a divisional chart with deterministic houses', () => {
    const model = buildVargaViewModel({
      chart: {
        id: 'varga-9',
        name: 'D9 - Navamsha',
        nameHi: 'D9 - नवमांश',
        number: 9,
        division: 9,
        purpose: 'test',
        purposeObj: { en: 'test', hi: 'test' },
        strength: { overall: 0, specialPoints: '', vargottamaCount: 0, exaltedCount: 0, ownHouseCount: 0 },
        planets: [],
        houses: [],
        aspects: [],
        interpretations: { overallVerdict: '', strengths: [], weaknesses: [], contradictionFlags: [], finalResolvedMeaning: '' },
        positions: [
          {
            planet: 'Sun',
            originalLongitude: longOf(0, 10),
            vargaRashi: 4,
            vargaLongitude: 12,
            isExalted: false,
            isDebilitated: false,
            isOwnSign: true,
          },
        ],
        ascendantRashi: 4,
      },
      chartType: 'D9',
    });
    expect(model.chartType).toBe('D9');
    expect(model.ascendantSign).toBe(4);
    expect(model.planets[0].house).toBe(1);
    expect(model.planets[0].dignity).toBe('own');
  });
});
