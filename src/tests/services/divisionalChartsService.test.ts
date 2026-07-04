/**
 * Tests for Divisional Charts (ShodashVarga) Service
 */

import { describe, it, expect } from 'vitest';
import {
  calculateShodashVarga,
  getVargaChart,
  getNavamsha,
  getDashamsha,
  getVargottamaPlanets,
  isVargottama,
  VARGA_CONFIGS,
} from '../../services/divisionalChartsService';

// Sample planetary longitudes (sidereal, 0-360)
const SAMPLE_LONGITUDES: Record<string, number> = {
  Sun:     45.5,   // Taurus 15.5°
  Moon:    120.3,  // Leo 0.3°
  Mars:    210.7,  // Scorpio 0.7°
  Mercury: 50.2,   // Taurus 20.2°
  Jupiter: 95.1,   // Cancer 5.1°
  Venus:   30.8,   // Taurus 0.8°
  Saturn:  280.4,  // Capricorn 10.4°
  Rahu:    160.0,  // Virgo 10°
  Ketu:    340.0,  // Pisces 10°
};
const SAMPLE_ASC = 15.0; // Aries 15°

describe('VARGA_CONFIGS', () => {
  it('should have 16 divisional chart configs', () => {
    expect(VARGA_CONFIGS).toHaveLength(16);
  });

  it('should include D1, D9, D10, D60', () => {
    const divisions = VARGA_CONFIGS.map(c => c.division);
    expect(divisions).toContain(1);
    expect(divisions).toContain(9);
    expect(divisions).toContain(10);
    expect(divisions).toContain(60);
  });

  it('should have unique division numbers', () => {
    const divisions = VARGA_CONFIGS.map(c => c.division);
    const unique = new Set(divisions);
    expect(unique.size).toBe(VARGA_CONFIGS.length);
  });

  it('each config should have en and hi purpose', () => {
    for (const cfg of VARGA_CONFIGS) {
      expect(cfg.purpose.en).toBeTruthy();
      expect(cfg.purpose.hi).toBeTruthy();
    }
  });
});

describe('calculateShodashVarga', () => {
  it('should return 16 charts', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    expect(result.charts).toHaveLength(16);
  });

  it('each chart should have positions for all input planets', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    const planetCount = Object.keys(SAMPLE_LONGITUDES).length;
    for (const chart of result.charts) {
      expect(chart.positions).toHaveLength(planetCount);
    }
  });

  it('all varga rashis should be 0-11', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    for (const chart of result.charts) {
      for (const pos of chart.positions) {
        expect(pos.vargaRashi).toBeGreaterThanOrEqual(0);
        expect(pos.vargaRashi).toBeLessThanOrEqual(11);
      }
      expect(chart.ascendantRashi).toBeGreaterThanOrEqual(0);
      expect(chart.ascendantRashi).toBeLessThanOrEqual(11);
    }
  });

  it('D1 rashi should match direct longitude calculation', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    const d1 = getVargaChart(result, 1)!;
    const sunPos = d1.positions.find(p => p.planet === 'Sun')!;
    // Sun at 45.5° → Taurus (rashiIndex 1)
    expect(sunPos.vargaRashi).toBe(1);
  });

  it('should compute vimshopakaBala for all planets', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    const planets = Object.keys(SAMPLE_LONGITUDES);
    for (const planet of planets) {
      expect(result.vimshopakaBala[planet]).toBeDefined();
      expect(result.vimshopakaBala[planet]).toBeGreaterThanOrEqual(0);
    }
  });

  it('vimshopakaBala should not exceed theoretical max (~20)', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    for (const val of Object.values(result.vimshopakaBala)) {
      expect(val).toBeLessThanOrEqual(25); // generous upper bound
    }
  });
});

describe('getVargaChart', () => {
  it('should return the correct chart by division', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    const d9 = getVargaChart(result, 9);
    expect(d9).toBeDefined();
    expect(d9!.division).toBe(9);
  });

  it('should return undefined for non-existent division', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    expect(getVargaChart(result, 99)).toBeUndefined();
  });
});

describe('getNavamsha / getDashamsha', () => {
  it('getNavamsha should return D9', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    const d9 = getNavamsha(result);
    expect(d9?.division).toBe(9);
  });

  it('getDashamsha should return D10', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    const d10 = getDashamsha(result);
    expect(d10?.division).toBe(10);
  });
});

describe('isVargottama', () => {
  it('should return true when D1 and D9 rashis match', () => {
    expect(isVargottama(3, 3)).toBe(true);
  });

  it('should return false when D1 and D9 rashis differ', () => {
    expect(isVargottama(3, 5)).toBe(false);
  });
});

describe('getVargottamaPlanets', () => {
  it('should return an array', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    const vargottamas = getVargottamaPlanets(result);
    expect(Array.isArray(vargottamas)).toBe(true);
  });

  it('vargottama planets should be valid planet names', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    const vargottamas = getVargottamaPlanets(result);
    const validPlanets = Object.keys(SAMPLE_LONGITUDES);
    for (const p of vargottamas) {
      expect(validPlanets).toContain(p);
    }
  });

  it('vargottama planets should actually have same D1 and D9 rashi', () => {
    const result = calculateShodashVarga(SAMPLE_LONGITUDES, SAMPLE_ASC);
    const vargottamas = getVargottamaPlanets(result);
    const d1 = getVargaChart(result, 1)!;
    const d9 = getVargaChart(result, 9)!;
    for (const planet of vargottamas) {
      const p1 = d1.positions.find(p => p.planet === planet)!;
      const p9 = d9.positions.find(p => p.planet === planet)!;
      expect(p1.vargaRashi).toBe(p9.vargaRashi);
    }
  });
});
