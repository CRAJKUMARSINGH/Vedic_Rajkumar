/**
 * nakshatraEdge.test.ts — deterministic coverage of the boundary logic.
 *
 * The flip audit over the 15-chart corpus reports zero flips. That is only a
 * meaningful result if the detector provably detects flips, so this test pins
 * the index/name/edge/reach arithmetic at hand-computed positions.
 */
import { describe, it, expect } from 'vitest';

import {
  NAKSHATRA_COUNT,
  NAKSHATRA_SPAN_DEG,
  distanceToNakshatraEdgeArcsec,
  nakshatraCouldFlip,
  nakshatraIndex,
  nakshatraName,
  nakshatraReach,
  norm360,
} from '@/lib/nakshatraEdge';

const MID_FIRST = NAKSHATRA_SPAN_DEG / 2;          // middle of Ashwini
const EDGE_SECOND = NAKSHATRA_SPAN_DEG;            // Ashwini/Bharani boundary

describe('nakshatra index and name', () => {
  it('maps 27 equal spans of 13°20′', () => {
    expect(NAKSHATRA_COUNT).toBe(27);
    expect(NAKSHATRA_SPAN_DEG).toBeCloseTo(13.3333333, 6);
    expect(nakshatraIndex(0)).toBe(0);
    expect(nakshatraIndex(EDGE_SECOND)).toBe(1);
    expect(nakshatraIndex(26 * NAKSHATRA_SPAN_DEG)).toBe(26);
    expect(nakshatraIndex(359.999)).toBe(26);           // clamps, never 27
    expect(nakshatraName(0)).toBe('Ashwini');
    expect(nakshatraName(EDGE_SECOND)).toBe('Bharani');
    expect(nakshatraName(26 * NAKSHATRA_SPAN_DEG)).toBe('Revati');
  });

  it('wraps negative and > 360 longitudes', () => {
    expect(norm360(-1)).toBeCloseTo(359, 9);
    expect(nakshatraIndex(-1)).toBe(26);
    expect(nakshatraIndex(360)).toBe(0);
  });
});

describe('distance to the nearest edge', () => {
  it('is zero on an edge and half a span in the middle', () => {
    expect(distanceToNakshatraEdgeArcsec(0)).toBeCloseTo(0, 6);
    expect(distanceToNakshatraEdgeArcsec(MID_FIRST)).toBeCloseTo(MID_FIRST * 3600, 4); // 24000″
  });

  it('decides whether an error bar can reach across a boundary', () => {
    expect(nakshatraCouldFlip(0, 15)).toBe(true);         // sitting on the edge
    expect(nakshatraCouldFlip(MID_FIRST, 15)).toBe(false); // 24000″ away
    expect(nakshatraCouldFlip(NAKSHATRA_SPAN_DEG - 0.001, 15)).toBe(true);
  });
});

describe('reachable nakshatra set', () => {
  it('is one entry well inside a nakshatra', () => {
    expect(nakshatraReach(MID_FIRST, 15)).toEqual([0]);
  });

  it('adds the previous nakshatra when near the low edge', () => {
    expect(nakshatraReach(0, 15)).toEqual([0, 26]);
  });

  it('adds the next nakshatra when near the high edge', () => {
    expect(nakshatraReach(NAKSHATRA_SPAN_DEG - 0.002, 15)).toEqual([0, 1]);
  });

  it('never exceeds three members', () => {
    for (let lon = 0; lon < 360; lon += 0.5) {
      const reach = nakshatraReach(lon, 604800); // an absurd 168° bar
      expect(reach.length).toBeGreaterThanOrEqual(1);
      expect(reach.length).toBeLessThanOrEqual(3);
    }
  });
});
