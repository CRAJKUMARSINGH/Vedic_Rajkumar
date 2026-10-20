/**
 * vimshottari.test.ts — Unit tests for the minimal Vimshottari implementation.
 */
import { describe, it, expect } from 'vitest';
import { vimshottariFirstDasha } from '@/lib/vimshottari';

const SPAN = 360 / 27; // 13.333...°

describe('vimshottariFirstDasha', () => {
  it('starts Ketu at the very beginning of Ashwini (0°)', () => {
    const d = vimshottariFirstDasha(0);
    expect(d.lord).toBe('Ketu');
    expect(d.balanceYears).toBeCloseTo(7, 6);
    expect(d.startOffsetDays).toBeCloseTo(0, 6);
    expect(d.nakshatraIndex).toBe(0);
  });

  it('gives half of Ketu at the midpoint of Ashwini', () => {
    const d = vimshottariFirstDasha(SPAN / 2);
    expect(d.lord).toBe('Ketu');
    expect(d.balanceYears).toBeCloseTo(3.5, 6);
    expect(d.startOffsetDays).toBeCloseTo(-3.5 * 365.25, 4);
  });

  it('hands over to Venus exactly at the Bharani boundary', () => {
    // Use a tiny epsilon past the boundary — the exact boundary is degenerate (modulo 0)
    const d = vimshottariFirstDasha(SPAN + 1e-9);
    expect(d.lord).toBe('Venus');
    expect(d.balanceYears).toBeCloseTo(20, 4);
    expect(d.nakshatraIndex).toBe(1);
  });

  it('cycles the lord every nine nakshatras', () => {
    expect(vimshottariFirstDasha(9  * SPAN).lord).toBe('Ketu');
    expect(vimshottariFirstDasha(18 * SPAN).lord).toBe('Ketu');
  });

  it('gives Mercury in Revati, three-quarters spent', () => {
    const revatiStart = 26 * SPAN;
    const d = vimshottariFirstDasha(revatiStart + 0.25 * SPAN);
    expect(d.lord).toBe('Mercury');
    expect(d.balanceYears).toBeCloseTo(17 * 0.75, 6);
  });

  it('wraps 360° correctly back to Ashwini', () => {
    const d = vimshottariFirstDasha(360);
    expect(d.lord).toBe('Ketu');
    expect(d.nakshatraIndex).toBe(0);
  });
});
