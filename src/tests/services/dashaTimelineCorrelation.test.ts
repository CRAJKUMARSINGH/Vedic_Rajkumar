/**
 * dashaTimelineCorrelation.test.ts — N4 Kaal.
 *
 * Verifies the Dasha–Transit correlation built on the unified Vimshottari
 * timeline, and the Varshaphal annual hookup, are deterministic and structurally
 * sound (data, not UI-only).
 */
import { describe, it, expect } from 'vitest';
import {
  correlateDashaTimelineWithTransits,
  buildAnnualDashaContext,
  type DashaTimelineInput,
} from '@/services/dashaTimelineCorrelationService';
import { findDashaChain, buildVimshottariTree } from '@/lib/vimshottariTimeline';

const INPUT: DashaTimelineInput = {
  moonSiderealLongitude: 123.456,
  birth: new Date('1990-06-15T04:30:00Z'),
  latitude: 19.076,
  longitude: 72.8777,
};

const Y2025_START = new Date('2025-01-01T00:00:00Z');
const Y2025_END = new Date('2026-01-01T00:00:00Z');

describe('correlateDashaTimelineWithTransits (N4)', () => {
  it('is deterministic — identical input yields identical output', () => {
    const a = correlateDashaTimelineWithTransits(INPUT, 2, Y2025_START, Y2025_END);
    const b = correlateDashaTimelineWithTransits(INPUT, 2, Y2025_START, Y2025_END);
    expect(a).toEqual(b);
  });

  it('returns at least one Antardasha window for a one-year range', () => {
    const windows = correlateDashaTimelineWithTransits(INPUT, 2, Y2025_START, Y2025_END);
    expect(windows.length).toBeGreaterThan(0);
  });

  it('orders windows by start and keeps them inside the requested range', () => {
    const windows = correlateDashaTimelineWithTransits(INPUT, 2, Y2025_START, Y2025_END);
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i].start.getTime()).toBeGreaterThanOrEqual(windows[i - 1].start.getTime());
    }
    for (const w of windows) {
      expect(w.end.getTime()).toBeGreaterThan(Y2025_START.getTime());
      expect(w.start.getTime()).toBeLessThan(Y2025_END.getTime());
    }
  });

  it('every window carries a full chain, a label, and a valid score', () => {
    const windows = correlateDashaTimelineWithTransits(INPUT, 2, Y2025_START, Y2025_END);
    for (const w of windows) {
      expect(w.chain.length).toBeGreaterThanOrEqual(1);
      expect(w.chainLabel.length).toBeGreaterThan(0);
      expect(w.activationScore).toBeGreaterThanOrEqual(0);
      expect(w.activationScore).toBeLessThanOrEqual(100);
      expect(['High', 'Medium', 'Low']).toContain(w.activationLevel);
    }
  });

  it('activationLevel agrees with the score thresholds', () => {
    const windows = correlateDashaTimelineWithTransits(INPUT, 3, Y2025_START, Y2025_END);
    for (const w of windows) {
      const expected = w.activationScore >= 70 ? 'High' : w.activationScore >= 45 ? 'Medium' : 'Low';
      expect(w.activationLevel).toBe(expected);
    }
  });

  it('resolves the chain at the peak from the same unified tree', () => {
    const tree = buildVimshottariTree(INPUT.moonSiderealLongitude, INPUT.birth);
    const windows = correlateDashaTimelineWithTransits(INPUT, 2, Y2025_START, Y2025_END);
    for (const w of windows) {
      expect(w.chain).toEqual(findDashaChain(tree, w.peak));
    }
  });
});

describe('buildAnnualDashaContext — Varshaphal annual hookup (N4)', () => {
  const annual = buildAnnualDashaContext(INPUT, Y2025_START, Y2025_END, 3);

  it('opens the year on a non-empty Maha → Antar → Pratyantar chain', () => {
    expect(annual.chainAtStart.length).toBeGreaterThanOrEqual(1);
    expect(annual.chainAtStart[0].level).toBe(1);
    expect(annual.chainAtStartLabel.length).toBeGreaterThan(0);
  });

  it('returns the year bounds and the tree as data', () => {
    expect(annual.start).toEqual(Y2025_START);
    expect(annual.end).toEqual(Y2025_END);
    expect(annual.tree.mahadashas.length).toBe(9);
  });

  it('lists correlated Pratyantar windows inside the year', () => {
    expect(annual.windows.length).toBeGreaterThan(0);
    for (const w of annual.windows) {
      expect(w.level).toBe(3);
      expect(w.start.getTime()).toBeLessThan(Y2025_END.getTime());
      expect(w.end.getTime()).toBeGreaterThan(Y2025_START.getTime());
    }
  });
});
