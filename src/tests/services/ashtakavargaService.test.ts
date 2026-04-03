/**
 * Tests for Ashtakavarga Service
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAshtakavarga,
  getBestTransitRashi,
  getWorstTransitRashi,
  trikonaShodhana,
  ekadhipatyaShodhana,
} from '../../services/ashtakavargaService';

const SAMPLE_RASHIS: Record<string, number> = {
  Sun:     0,  // Aries
  Moon:    3,  // Cancer
  Mars:    0,  // Aries
  Mercury: 1,  // Taurus
  Jupiter: 3,  // Cancer
  Venus:   2,  // Gemini
  Saturn:  9,  // Capricorn
};
const ASC_RASHI = 0; // Aries

describe('calculateAshtakavarga', () => {
  it('should return 7 BAV tables (one per planet)', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    expect(result.tables).toHaveLength(7);
  });

  it('each BAV table should have 12 rashi points', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    for (const table of result.tables) {
      expect(table.bavPoints).toHaveLength(12);
    }
  });

  it('BAV points should be between 0 and 8', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    for (const table of result.tables) {
      for (const pts of table.bavPoints) {
        expect(pts).toBeGreaterThanOrEqual(0);
        expect(pts).toBeLessThanOrEqual(8);
      }
    }
  });

  it('SAV points should be sum of all BAV tables', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    for (let i = 0; i < 12; i++) {
      const sum = result.tables.reduce((acc, t) => acc + t.bavPoints[i], 0);
      expect(result.savPoints[i]).toBe(sum);
    }
  });

  it('SAV points should be between 0 and 56', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    for (const pts of result.savPoints) {
      expect(pts).toBeGreaterThanOrEqual(0);
      expect(pts).toBeLessThanOrEqual(56);
    }
  });

  it('should return 12 house strengths', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    expect(result.houseStrengths).toHaveLength(12);
  });

  it('house numbers should be 1-12', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    const houses = result.houseStrengths.map(h => h.house);
    for (let i = 1; i <= 12; i++) {
      expect(houses).toContain(i);
    }
  });

  it('should return 7 transit strengths', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    expect(result.transitStrengths).toHaveLength(7);
  });

  it('transit strength isStrong should be true when bavPoints >= 4', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    for (const ts of result.transitStrengths) {
      if (ts.bavPoints >= 4) expect(ts.isStrong).toBe(true);
      else expect(ts.isStrong).toBe(false);
    }
  });

  it('contributor points should sum to BAV total for each rashi', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    for (const table of result.tables) {
      for (let rashi = 0; rashi < 12; rashi++) {
        const contribSum = Object.values(table.contributorPoints)
          .reduce((acc, pts) => acc + pts[rashi], 0);
        expect(contribSum).toBe(table.bavPoints[rashi]);
      }
    }
  });
});

describe('getBestTransitRashi', () => {
  it('should return the rashi with highest BAV points', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    for (const table of result.tables) {
      const best = getBestTransitRashi(table);
      const maxPts = Math.max(...table.bavPoints);
      expect(best.points).toBe(maxPts);
      expect(table.bavPoints[best.rashiIndex]).toBe(maxPts);
    }
  });
});

describe('getWorstTransitRashi', () => {
  it('should return the rashi with lowest BAV points', () => {
    const result = calculateAshtakavarga(SAMPLE_RASHIS, ASC_RASHI);
    for (const table of result.tables) {
      const worst = getWorstTransitRashi(table);
      const minPts = Math.min(...table.bavPoints);
      expect(worst.points).toBe(minPts);
      expect(table.bavPoints[worst.rashiIndex]).toBe(minPts);
    }
  });
});

describe('trikonaShodhana', () => {
  it('should reduce trikona houses by their minimum', () => {
    const points = [5, 3, 4, 6, 2, 3, 4, 5, 3, 4, 2, 3];
    const result = trikonaShodhana(points, 0); // Asc = Aries (0)
    // Trikona: houses 1,5,9 → indices 0,4,8
    const min = Math.min(points[0], points[4], points[8]);
    expect(result[0]).toBe(points[0] - min);
    expect(result[4]).toBe(points[4] - min);
    expect(result[8]).toBe(points[8] - min);
    // Non-trikona unchanged
    expect(result[1]).toBe(points[1]);
  });

  it('should not produce negative values', () => {
    const points = [2, 3, 4, 5, 1, 3, 4, 5, 3, 4, 2, 3];
    const result = trikonaShodhana(points, 0);
    for (const v of result) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('ekadhipatyaShodhana', () => {
  it('should reduce paired signs by their minimum', () => {
    const points = [5, 3, 4, 6, 2, 3, 4, 5, 3, 4, 2, 3];
    const result = ekadhipatyaShodhana(points);
    // Mars pair: (0,7) → min(5,5)=5 → both become 0
    const minMars = Math.min(points[0], points[7]);
    expect(result[0]).toBe(points[0] - minMars);
    expect(result[7]).toBe(points[7] - minMars);
  });

  it('should not produce negative values', () => {
    const points = [5, 3, 4, 6, 2, 3, 4, 5, 3, 4, 2, 3];
    const result = ekadhipatyaShodhana(points);
    for (const v of result) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});
