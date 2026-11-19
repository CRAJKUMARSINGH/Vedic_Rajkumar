/**
 * N5 Bala, N6 Yukti, N7 Vani unit tests
 * Phase B acceptance: each stage tested; fixture-stable; failure behaviour.
 */
import { describe, it, expect } from 'vitest';
import { computeBala } from '@/services/navratri/n5Bala';
import { computeYukti } from '@/services/navratri/n6Yukti';
import { generateVani } from '@/services/navratri/n7Vani';
import { computeKaal } from '@/services/navratri/n4Kaal';
import type { PlanetData } from '@/services/shadabalaService';

// Minimal synthetic planet fixture — not real personal data.
const SYNTH_PLANETS: PlanetData[] = [
  { name: 'Sun',     rashiIndex: 5,  longitude: 165, house: 5,  degrees: 15, isRetrograde: false },
  { name: 'Moon',    rashiIndex: 2,  longitude: 90,  house: 2,  degrees: 0,  isRetrograde: false },
  { name: 'Mars',    rashiIndex: 7,  longitude: 227, house: 7,  degrees: 17, isRetrograde: true  },
  { name: 'Mercury', rashiIndex: 5,  longitude: 175, house: 5,  degrees: 25, isRetrograde: false },
  { name: 'Jupiter', rashiIndex: 11, longitude: 345, house: 11, degrees: 15, isRetrograde: false },
  { name: 'Venus',   rashiIndex: 4,  longitude: 130, house: 4,  degrees: 10, isRetrograde: false },
  { name: 'Saturn',  rashiIndex: 9,  longitude: 285, house: 9,  degrees: 15, isRetrograde: false },
];

// ─── N5 Bala ──────────────────────────────────────────────────────────────────

describe('N5 — computeBala', () => {
  it('returns a strength for each supplied planet', () => {
    const result = computeBala(SYNTH_PLANETS);
    expect(result.planets).toHaveLength(SYNTH_PLANETS.length);
  });

  it('marks each planet as COMPUTED when calculation succeeds', () => {
    const result = computeBala(SYNTH_PLANETS);
    result.planets.forEach((p) => expect(p.availability).toBe('COMPUTED'));
  });

  it('normalised strength is in [0, 1]', () => {
    const result = computeBala(SYNTH_PLANETS);
    result.planets.forEach((p) => {
      expect(p.normalised).toBeGreaterThanOrEqual(0);
      expect(p.normalised).toBeLessThanOrEqual(1);
    });
  });

  it('identifies a strongest planet', () => {
    const result = computeBala(SYNTH_PLANETS);
    expect(result.strongestPlanet).not.toBe('Unknown');
  });

  it('stamps provenance with BPHS rules', () => {
    const result = computeBala(SYNTH_PLANETS);
    expect(result.provenance.rules).toContain('BPHS');
  });

  it('applies dignity override when supplied', () => {
    const result = computeBala(SYNTH_PLANETS, { Sun: 'Exalted', Moon: 'Debilitated' });
    const sun = result.planets.find((p) => p.planet === 'Sun');
    expect(sun?.dignity).toBe('Exalted');
  });

  it('returns UNAVAILABLE gracefully for empty planet list', () => {
    const result = computeBala([]);
    // strongestPlanet is unknown; no crash
    expect(result.strongestPlanet).toBe('Unknown');
  });
});

// ─── N6 Yukti ────────────────────────────────────────────────────────────────

describe('N6 — computeYukti', () => {
  it('produces findings from real N4+N5 inputs', () => {
    const kaal = computeKaal('1990-03-14', '12:00');
    const bala = computeBala(SYNTH_PLANETS);
    const yukti = computeYukti(kaal, bala);
    expect(yukti.findings.length).toBeGreaterThan(0);
    expect(['HIGH','MEDIUM','LOW','INSUFFICIENT_DATA']).toContain(yukti.overallConfidence);
  });

  it('every finding has a provenance claim with claim_id', () => {
    const kaal = computeKaal('1990-03-14', '12:00');
    const bala = computeBala(SYNTH_PLANETS);
    const yukti = computeYukti(kaal, bala);
    yukti.findings.forEach((f) => {
      expect(f.claim.claim_id).toBeTruthy();
    });
  });

  it('is deterministic: same inputs → same inputSignature', () => {
    const kaal = computeKaal('1990-03-14', '12:00', 100.5);
    const bala = computeBala(SYNTH_PLANETS);
    const a = computeYukti(kaal, bala);
    const b = computeYukti(kaal, bala);
    expect(a.inputSignature).toBe(b.inputSignature);
  });

  it('detects no spurious conflicts in well-formed input', () => {
    const kaal = computeKaal('1990-03-14', '12:00');
    const bala = computeBala(SYNTH_PLANETS);
    const yukti = computeYukti(kaal, bala);
    // No contradictions expected from clean fixture data.
    expect(yukti.conflicts).toHaveLength(0);
  });
});

// ─── N7 Vani ─────────────────────────────────────────────────────────────────

describe('N7 — generateVani', () => {
  it('produces a non-empty bilingual headline', () => {
    const kaal = computeKaal('1990-03-14', '12:00');
    const bala = computeBala(SYNTH_PLANETS);
    const yukti = computeYukti(kaal, bala);
    const vani = generateVani(yukti);
    expect(vani.headlineEn.length).toBeGreaterThan(5);
    expect(vani.headlineHi.length).toBeGreaterThan(5);
  });

  it('every section has both EN and HI body text', () => {
    const kaal = computeKaal('1990-03-14', '12:00');
    const bala = computeBala(SYNTH_PLANETS);
    const yukti = computeYukti(kaal, bala);
    const vani = generateVani(yukti);
    vani.sections.forEach((s) => {
      expect(s.bodyEn.length).toBeGreaterThan(5);
      expect(s.bodyHi.length).toBeGreaterThan(5);
    });
  });

  it('always includes a disclaimer', () => {
    const kaal = computeKaal('1990-03-14', '12:00');
    const bala = computeBala(SYNTH_PLANETS);
    const yukti = computeYukti(kaal, bala);
    const vani = generateVani(yukti);
    expect(vani.disclaimerEn).toContain('educational reference');
    expect(vani.disclaimerHi.length).toBeGreaterThan(10);
  });

  it('shows no-data section when findings are empty', () => {
    // Simulate no findings by passing an empty yukti
    const emptyYukti = {
      findings: [],
      conflicts: [],
      overallConfidence: 'INSUFFICIENT_DATA' as const,
      inputSignature: 'empty',
      calculatedAt: new Date().toISOString(),
    };
    const vani = generateVani(emptyYukti);
    expect(vani.sections.some((s) => s.sectionId === 'no-data')).toBe(true);
    expect(vani.headlineEn).toContain('Insufficient');
  });

  it('is deterministic: same yukti → same headline', () => {
    const kaal = computeKaal('1990-03-14', '12:00', 100.5);
    const bala = computeBala(SYNTH_PLANETS);
    const yukti = computeYukti(kaal, bala);
    const a = generateVani(yukti);
    const b = generateVani(yukti);
    expect(a.headlineEn).toBe(b.headlineEn);
  });
});
