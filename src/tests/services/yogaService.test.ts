/**
 * Tests for Yoga Detection Service
 */

import { describe, it, expect } from 'vitest';
import { analyzeYogas } from '../../services/yogaService';

// Helper to build a planet array
function makePlanets(config: Array<{ name: string; rashiIndex: number; house: number; degrees?: number }>) {
  return config.map(p => ({ degrees: 15, isRetrograde: false, ...p }));
}

describe('analyzeYogas', () => {
  it('should return a valid YogaAnalysis object', () => {
    const planets = makePlanets([
      { name: 'Sun', rashiIndex: 0, house: 1 },
      { name: 'Moon', rashiIndex: 3, house: 4 },
      { name: 'Mars', rashiIndex: 0, house: 1 },
      { name: 'Mercury', rashiIndex: 2, house: 3 },
      { name: 'Jupiter', rashiIndex: 3, house: 4 },
      { name: 'Venus', rashiIndex: 1, house: 2 },
      { name: 'Saturn', rashiIndex: 9, house: 10 },
      { name: 'Rahu', rashiIndex: 5, house: 6 },
      { name: 'Ketu', rashiIndex: 11, house: 12 },
    ]);
    const result = analyzeYogas(planets);
    expect(result).toBeDefined();
    expect(result.yogas).toBeInstanceOf(Array);
    expect(result.presentYogas).toBeInstanceOf(Array);
    expect(result.rajYogas).toBeInstanceOf(Array);
    expect(result.doshaYogas).toBeInstanceOf(Array);
    expect(result.summary.en).toBeTruthy();
    expect(result.summary.hi).toBeTruthy();
  });

  it('should detect Gajakesari Yoga when Jupiter is in kendra from Moon', () => {
    // Moon in house 1, Jupiter in house 4 (kendra from Moon)
    const planets = makePlanets([
      { name: 'Moon', rashiIndex: 0, house: 1 },
      { name: 'Jupiter', rashiIndex: 3, house: 4 },
      { name: 'Sun', rashiIndex: 1, house: 2 },
      { name: 'Mars', rashiIndex: 2, house: 3 },
      { name: 'Mercury', rashiIndex: 4, house: 5 },
      { name: 'Venus', rashiIndex: 5, house: 6 },
      { name: 'Saturn', rashiIndex: 6, house: 7 },
      { name: 'Rahu', rashiIndex: 7, house: 8 },
      { name: 'Ketu', rashiIndex: 1, house: 2 },
    ]);
    const result = analyzeYogas(planets);
    const gajakesari = result.yogas.find(y => y.name === 'Gajakesari Yoga');
    expect(gajakesari?.isPresent).toBe(true);
  });

  it('should NOT detect Gajakesari Yoga when Jupiter is not in kendra from Moon', () => {
    // Moon in house 1, Jupiter in house 3 (not kendra)
    const planets = makePlanets([
      { name: 'Moon', rashiIndex: 0, house: 1 },
      { name: 'Jupiter', rashiIndex: 2, house: 3 },
      { name: 'Sun', rashiIndex: 1, house: 2 },
      { name: 'Mars', rashiIndex: 3, house: 4 },
      { name: 'Mercury', rashiIndex: 4, house: 5 },
      { name: 'Venus', rashiIndex: 5, house: 6 },
      { name: 'Saturn', rashiIndex: 6, house: 7 },
      { name: 'Rahu', rashiIndex: 7, house: 8 },
      { name: 'Ketu', rashiIndex: 1, house: 2 },
    ]);
    const result = analyzeYogas(planets);
    const gajakesari = result.yogas.find(y => y.name === 'Gajakesari Yoga');
    expect(gajakesari?.isPresent).toBe(false);
  });

  it('should detect Hamsa Yoga when Jupiter is exalted in kendra', () => {
    // Jupiter exalted in Cancer (rashiIndex 3), house 4 (kendra)
    const planets = makePlanets([
      { name: 'Jupiter', rashiIndex: 3, house: 4 },
      { name: 'Sun', rashiIndex: 0, house: 1 },
      { name: 'Moon', rashiIndex: 1, house: 2 },
      { name: 'Mars', rashiIndex: 2, house: 3 },
      { name: 'Mercury', rashiIndex: 4, house: 5 },
      { name: 'Venus', rashiIndex: 5, house: 6 },
      { name: 'Saturn', rashiIndex: 6, house: 7 },
      { name: 'Rahu', rashiIndex: 7, house: 8 },
      { name: 'Ketu', rashiIndex: 1, house: 2 },
    ]);
    const result = analyzeYogas(planets);
    const hamsa = result.yogas.find(y => y.name === 'Hamsa Yoga');
    expect(hamsa?.isPresent).toBe(true);
    expect(hamsa?.strength).toBe('strong');
  });

  it('should detect Budhaditya Yoga when Sun and Mercury are conjunct', () => {
    const planets = makePlanets([
      { name: 'Sun', rashiIndex: 0, house: 1 },
      { name: 'Mercury', rashiIndex: 0, house: 1 },
      { name: 'Moon', rashiIndex: 3, house: 4 },
      { name: 'Mars', rashiIndex: 2, house: 3 },
      { name: 'Jupiter', rashiIndex: 8, house: 9 },
      { name: 'Venus', rashiIndex: 5, house: 6 },
      { name: 'Saturn', rashiIndex: 6, house: 7 },
      { name: 'Rahu', rashiIndex: 7, house: 8 },
      { name: 'Ketu', rashiIndex: 1, house: 2 },
    ]);
    const result = analyzeYogas(planets);
    const budhaditya = result.yogas.find(y => y.name === 'Budhaditya Yoga');
    expect(budhaditya?.isPresent).toBe(true);
  });

  it('should detect Kaal Sarp Yoga when all planets are between Rahu and Ketu', () => {
    // Rahu in house 1, Ketu in house 7, all others in houses 2-6
    const planets = makePlanets([
      { name: 'Rahu', rashiIndex: 0, house: 1 },
      { name: 'Ketu', rashiIndex: 6, house: 7 },
      { name: 'Sun', rashiIndex: 1, house: 2 },
      { name: 'Moon', rashiIndex: 2, house: 3 },
      { name: 'Mars', rashiIndex: 3, house: 4 },
      { name: 'Mercury', rashiIndex: 4, house: 5 },
      { name: 'Jupiter', rashiIndex: 5, house: 6 },
      { name: 'Venus', rashiIndex: 5, house: 6 },
      { name: 'Saturn', rashiIndex: 4, house: 5 },
    ]);
    const result = analyzeYogas(planets);
    const kaalSarp = result.yogas.find(y => y.name === 'Kaal Sarp Yoga');
    expect(kaalSarp?.isPresent).toBe(true);
  });

  it('should have presentYogas as subset of yogas', () => {
    const planets = makePlanets([
      { name: 'Sun', rashiIndex: 0, house: 1 },
      { name: 'Moon', rashiIndex: 3, house: 4 },
      { name: 'Mars', rashiIndex: 0, house: 1 },
      { name: 'Mercury', rashiIndex: 2, house: 3 },
      { name: 'Jupiter', rashiIndex: 3, house: 4 },
      { name: 'Venus', rashiIndex: 1, house: 2 },
      { name: 'Saturn', rashiIndex: 9, house: 10 },
      { name: 'Rahu', rashiIndex: 5, house: 6 },
      { name: 'Ketu', rashiIndex: 11, house: 12 },
    ]);
    const result = analyzeYogas(planets);
    for (const yoga of result.presentYogas) {
      expect(result.yogas).toContain(yoga);
      expect(yoga.isPresent).toBe(true);
    }
  });

  it('should have rajYogas as subset of presentYogas', () => {
    const planets = makePlanets([
      { name: 'Sun', rashiIndex: 0, house: 1 },
      { name: 'Moon', rashiIndex: 3, house: 4 },
      { name: 'Mars', rashiIndex: 0, house: 1 },
      { name: 'Mercury', rashiIndex: 2, house: 3 },
      { name: 'Jupiter', rashiIndex: 3, house: 4 },
      { name: 'Venus', rashiIndex: 1, house: 2 },
      { name: 'Saturn', rashiIndex: 9, house: 10 },
      { name: 'Rahu', rashiIndex: 5, house: 6 },
      { name: 'Ketu', rashiIndex: 11, house: 12 },
    ]);
    const result = analyzeYogas(planets);
    for (const yoga of result.rajYogas) {
      expect(result.presentYogas).toContain(yoga);
      expect(yoga.category).toBe('raj');
    }
  });
});
