/**
 * Rule tests — Prashna chart wrapper (Prasnalove.txt §4 / §3.1).
 * Confirms the single canonical engine is used and the hash is deterministic.
 * Synthetic moment only.
 */
import { describe, it, expect } from 'vitest';
import { buildPrashnaChart, contentHash } from '@/features/prashna/kernel/chart';

describe('contentHash', () => {
  it('is deterministic and 16 hex chars', () => {
    const a = contentHash('2026-06-21T06:30:00Z|28.613900|77.209000|Asia/Kolkata|lahiri');
    const b = contentHash('2026-06-21T06:30:00Z|28.613900|77.209000|Asia/Kolkata|lahiri');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
  });

  it('changes when the input changes', () => {
    expect(contentHash('a')).not.toBe(contentHash('b'));
  });
});

describe('buildPrashnaChart', () => {
  const input = {
    querent: 'Synthetic',
    askedAt: new Date('2026-06-21T06:30:00Z'),
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
  };

  it('returns nine grahas and a valid ascendant', () => {
    const chart = buildPrashnaChart(input);
    expect(chart.bodies).toHaveLength(9);
    expect(chart.ascendant).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant).toBeLessThan(360);
    expect(chart.ascendantSignIndex).toBeGreaterThanOrEqual(0);
    expect(chart.ascendantSignIndex).toBeLessThan(12);
  });

  it('uses a Lahiri ayanamsa in the expected range for 2026', () => {
    const chart = buildPrashnaChart(input);
    expect(chart.ayanamsaValue).toBeGreaterThan(23.5);
    expect(chart.ayanamsaValue).toBeLessThan(25.0);
  });

  it('produces a reproducible hash for the same inputs', () => {
    expect(buildPrashnaChart(input).hash).toBe(buildPrashnaChart(input).hash);
  });
});
