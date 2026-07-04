/**
 * Tests for Shadbala (Six-fold Planetary Strength) Service
 */

import { describe, it, expect } from 'vitest';
import { calculateShadbala } from '../../services/shadabalaService';

const SAMPLE_PLANETS = [
  { name: 'Sun',     rashiIndex: 0,  house: 1,  degrees: 15, isRetrograde: false, longitude: 15 },
  { name: 'Moon',    rashiIndex: 3,  house: 4,  degrees: 10, isRetrograde: false, longitude: 100 },
  { name: 'Mars',    rashiIndex: 0,  house: 1,  degrees: 5,  isRetrograde: false, longitude: 5 },
  { name: 'Mercury', rashiIndex: 5,  house: 6,  degrees: 15, isRetrograde: false, longitude: 165 },
  { name: 'Jupiter', rashiIndex: 3,  house: 4,  degrees: 5,  isRetrograde: false, longitude: 95 },
  { name: 'Venus',   rashiIndex: 1,  house: 2,  degrees: 20, isRetrograde: false, longitude: 50 },
  { name: 'Saturn',  rashiIndex: 9,  house: 10, degrees: 10, isRetrograde: false, longitude: 280 },
  { name: 'Rahu',    rashiIndex: 5,  house: 6,  degrees: 10, isRetrograde: true,  longitude: 160 },
  { name: 'Ketu',    rashiIndex: 11, house: 12, degrees: 10, isRetrograde: true,  longitude: 340 },
];

describe('calculateShadbala', () => {
  it('should return analysis for 7 main planets (not Rahu/Ketu)', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    expect(result.planets).toHaveLength(7);
  });

  it('each planet result should have all 6 bala components', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    for (const p of result.planets) {
      expect(typeof p.sthanaBala).toBe('number');
      expect(typeof p.digBala).toBe('number');
      expect(typeof p.kalaBala).toBe('number');
      expect(typeof p.chestaBala).toBe('number');
      expect(typeof p.naisargikaBala).toBe('number');
      expect(typeof p.drikBala).toBe('number');
    }
  });

  it('totalRupas should equal sum of all 6 components', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    for (const p of result.planets) {
      const sum = p.sthanaBala + p.digBala + p.kalaBala +
                  p.chestaBala + p.naisargikaBala + p.drikBala;
      expect(Math.abs(p.totalRupas - sum)).toBeLessThan(0.001);
    }
  });

  it('shadabalaRatio should equal totalRupas / requiredRupas', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    for (const p of result.planets) {
      const expected = p.totalRupas / p.requiredRupas;
      expect(Math.abs(p.shadabalaRatio - expected)).toBeLessThan(0.001);
    }
  });

  it('isStrong should be true when ratio >= 1.0', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    for (const p of result.planets) {
      if (p.shadabalaRatio >= 1.0) {
        expect(p.isStrong).toBe(true);
      } else {
        expect(p.isStrong).toBe(false);
      }
    }
  });

  it('all bala values should be non-negative', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    for (const p of result.planets) {
      expect(p.sthanaBala).toBeGreaterThanOrEqual(0);
      expect(p.digBala).toBeGreaterThanOrEqual(0);
      expect(p.kalaBala).toBeGreaterThanOrEqual(0);
      expect(p.chestaBala).toBeGreaterThanOrEqual(0);
      expect(p.naisargikaBala).toBeGreaterThan(0);
      expect(p.drikBala).toBeGreaterThanOrEqual(0);
    }
  });

  it('strength label should match ratio range', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    for (const p of result.planets) {
      if (p.shadabalaRatio >= 1.5) expect(p.strength).toBe('very-strong');
      else if (p.shadabalaRatio >= 1.0) expect(p.strength).toBe('strong');
      else if (p.shadabalaRatio >= 0.75) expect(p.strength).toBe('average');
      else if (p.shadabalaRatio >= 0.5) expect(p.strength).toBe('weak');
      else expect(p.strength).toBe('very-weak');
    }
  });

  it('should identify strongest and weakest planet', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    expect(result.strongestPlanet).toBeTruthy();
    expect(result.weakestPlanet).toBeTruthy();
    const strongest = result.planets.find(p => p.planet === result.strongestPlanet)!;
    const weakest = result.planets.find(p => p.planet === result.weakestPlanet)!;
    expect(strongest.shadabalaRatio).toBeGreaterThanOrEqual(weakest.shadabalaRatio);
  });

  it('summary should be non-empty in both languages', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    expect(result.summary.en).toBeTruthy();
    expect(result.summary.hi).toBeTruthy();
  });

  it('should work with isDaytime=false', () => {
    const result = calculateShadbala(SAMPLE_PLANETS, false, 6);
    expect(result.planets).toHaveLength(7);
  });

  it('Jupiter exalted in Cancer should have high sthanaBala', () => {
    const result = calculateShadbala(SAMPLE_PLANETS);
    const jupiter = result.planets.find(p => p.planet === 'Jupiter')!;
    // Jupiter exalted at Cancer (rashiIndex 3) — should have good positional strength
    expect(jupiter.sthanaBala).toBeGreaterThan(0.5);
  });
});
