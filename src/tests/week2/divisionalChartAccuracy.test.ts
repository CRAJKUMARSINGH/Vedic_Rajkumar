/**
 * Week 2: Divisional Chart Accuracy Tests (D9, D10)
 *
 * Validates D9 (Navamsha) and D10 (Dashamsha) computation for REF-001
 * (Priyansh Singh Chauhan, 2000-10-26) using the ShodashVarga service.
 *
 * Also covers vargottama detection and vimshopakaBala bounds (R2, R3).
 */

import { describe, it, expect } from 'vitest';
import {
  calculateShodashVarga,
  getVargaChart,
  getNavamsha,
  getDashamsha,
  getVargottamaPlanets,
  isVargottama,
} from '@/services/divisionalChartsService';
import { calculatePreciseChart } from '@/services/precisionEphemerisService';

// ─── REF-001 planetary longitudes from precision engine ───────────────────────

// Priyansh Singh Chauhan: 2000-10-26, 00:50 IST, Indore (22.72°N, 75.86°E)
function getRef001Longitudes(): {
  longitudes: Record<string, number>;
  ascLon: number;
} {
  const chart = calculatePreciseChart('2000-10-26', '00:50', 22.72, 75.86, 5.5);
  const longitudes: Record<string, number> = {};
  for (const p of chart.planets) {
    longitudes[p.name] = p.siderealLongitude;
  }
  return { longitudes, ascLon: chart.ascendant.siderealLongitude };
}

// ─── D9 (Navamsha) tests ──────────────────────────────────────────────────────

describe('D9 Navamsha — REF-001 (Priyansh Singh Chauhan)', () => {
  const { longitudes, ascLon } = getRef001Longitudes();
  const varga = calculateShodashVarga(longitudes, ascLon);
  const d9 = getNavamsha(varga)!;

  it('D9 chart exists', () => {
    expect(d9).toBeDefined();
    expect(d9.division).toBe(9);
  });

  it('D9 has positions for all 9 planets', () => {
    const expected = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const planet of expected) {
      const pos = d9.positions.find(p => p.planet === planet);
      expect(pos).toBeDefined();
    }
  });

  it('all D9 rashis are 0–11', () => {
    for (const pos of d9.positions) {
      expect(pos.vargaRashi).toBeGreaterThanOrEqual(0);
      expect(pos.vargaRashi).toBeLessThanOrEqual(11);
    }
  });

  it('D9 ascendant rashi is 0–11', () => {
    expect(d9.ascendantRashi).toBeGreaterThanOrEqual(0);
    expect(d9.ascendantRashi).toBeLessThanOrEqual(11);
  });

  it('D9 division number is exactly 9', () => {
    expect(d9.division).toBe(9);
  });
});

// ─── D10 (Dashamsha) tests ────────────────────────────────────────────────────

describe('D10 Dashamsha — REF-001 (Priyansh Singh Chauhan)', () => {
  const { longitudes, ascLon } = getRef001Longitudes();
  const varga = calculateShodashVarga(longitudes, ascLon);
  const d10 = getDashamsha(varga)!;

  it('D10 chart exists', () => {
    expect(d10).toBeDefined();
    expect(d10.division).toBe(10);
  });

  it('D10 has positions for all 9 planets', () => {
    const expected = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const planet of expected) {
      const pos = d10.positions.find(p => p.planet === planet);
      expect(pos).toBeDefined();
    }
  });

  it('all D10 rashis are 0–11', () => {
    for (const pos of d10.positions) {
      expect(pos.vargaRashi).toBeGreaterThanOrEqual(0);
      expect(pos.vargaRashi).toBeLessThanOrEqual(11);
    }
  });

  it('D10 ascendant rashi is 0–11', () => {
    expect(d10.ascendantRashi).toBeGreaterThanOrEqual(0);
    expect(d10.ascendantRashi).toBeLessThanOrEqual(11);
  });
});

// ─── ShodashVarga (all 16 charts) ────────────────────────────────────────────

describe('ShodashVarga — all 16 divisional charts for REF-001', () => {
  const { longitudes, ascLon } = getRef001Longitudes();
  const varga = calculateShodashVarga(longitudes, ascLon);

  it('returns exactly 16 charts', () => {
    expect(varga.charts).toHaveLength(16);
  });

  it('includes D1, D2, D3, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60', () => {
    const divisions = varga.charts.map(c => c.division);
    [1, 2, 3, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60].forEach(d => {
      expect(divisions).toContain(d);
    });
  });

  it('all chart rashis are in range 0–11', () => {
    for (const chart of varga.charts) {
      for (const pos of chart.positions) {
        expect(pos.vargaRashi).toBeGreaterThanOrEqual(0);
        expect(pos.vargaRashi).toBeLessThanOrEqual(11);
      }
    }
  });

  it('D1 rashi for Sun matches direct sidereal calculation', () => {
    const d1 = getVargaChart(varga, 1)!;
    const sunPos = d1.positions.find(p => p.planet === 'Sun')!;
    // Sun at ~196° sidereal → Libra (index 6)
    const expectedRashi = Math.floor(longitudes['Sun'] / 30) % 12;
    expect(sunPos.vargaRashi).toBe(expectedRashi);
  });
});

// ─── Vargottama detection ─────────────────────────────────────────────────────

describe('Vargottama detection', () => {
  it('isVargottama returns true when rashis match', () => {
    expect(isVargottama(0, 0)).toBe(true);
    expect(isVargottama(11, 11)).toBe(true);
    expect(isVargottama(5, 5)).toBe(true);
  });

  it('isVargottama returns false when rashis differ', () => {
    expect(isVargottama(0, 1)).toBe(false);
    expect(isVargottama(11, 0)).toBe(false);
  });

  it('getVargottamaPlanets returns array of planet names', () => {
    const { longitudes, ascLon } = getRef001Longitudes();
    const varga = calculateShodashVarga(longitudes, ascLon);
    const vargottamas = getVargottamaPlanets(varga);
    expect(Array.isArray(vargottamas)).toBe(true);
    const validNames = Object.keys(longitudes);
    for (const p of vargottamas) {
      expect(validNames).toContain(p);
    }
  });

  it('every reported vargottama planet actually has same D1 and D9 rashi', () => {
    const { longitudes, ascLon } = getRef001Longitudes();
    const varga = calculateShodashVarga(longitudes, ascLon);
    const vargottamas = getVargottamaPlanets(varga);
    const d1 = getVargaChart(varga, 1)!;
    const d9 = getVargaChart(varga, 9)!;
    for (const planet of vargottamas) {
      const p1 = d1.positions.find(p => p.planet === planet)!;
      const p9 = d9.positions.find(p => p.planet === planet)!;
      expect(p1.vargaRashi).toBe(p9.vargaRashi);
    }
  });
});

// ─── VimshopakaBala bounds ────────────────────────────────────────────────────

describe('VimshopakaBala — strength score bounds', () => {
  const { longitudes, ascLon } = getRef001Longitudes();
  const varga = calculateShodashVarga(longitudes, ascLon);

  it('every planet has a vimshopakaBala value defined', () => {
    const planets = Object.keys(longitudes);
    for (const p of planets) {
      expect(varga.vimshopakaBala[p]).toBeDefined();
    }
  });

  it('all vimshopakaBala values are non-negative', () => {
    for (const val of Object.values(varga.vimshopakaBala)) {
      expect(val).toBeGreaterThanOrEqual(0);
    }
  });

  it('all vimshopakaBala values are within theoretical maximum (≤ 20)', () => {
    for (const val of Object.values(varga.vimshopakaBala)) {
      expect(val).toBeLessThanOrEqual(20);
    }
  });
});
