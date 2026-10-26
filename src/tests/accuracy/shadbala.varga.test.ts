/**
 * shadbala.varga.test.ts
 *
 * Checks the app's divisional-chart mapping (divisionalChartsService) against the
 * independent oracle's varga rules (tools/accuracy/shadbalaReference.mjs).
 *
 * Why this belongs with Shadbala: Saptavargaja Bala — 315 of the 315 virupas in
 * Sthana Bala — is computed by re-placing each graha in seven divisions. If the
 * Saptavarga mapping is wrong, Saptavargaja Bala is wrong, and there is no
 * published worked example to catch it. So the mapping is asserted here.
 *
 * Two distinct claims, both true today:
 *   1. AGREEMENT — the Saptavarga (D1,D2,D3,D7,D9,D12,D30) matches the oracle.
 *      This is the surface Saptavargaja Bala actually depends on.
 *   2. DIVERGENCE — D4, D20 and D60 have no rule in the engine: they fall
 *      through to a generic `(rashi * division + part) % 12` in
 *      `calculateVargaRashi`. These expectations pin the *current* divergence so
 *      it cannot be forgotten. Fixing the engine must update these expectations
 *      AND docs/accuracy/UNVERIFIED.md in the same change.
 */

import { describe, it, expect } from 'vitest';
import * as R from '../../../tools/accuracy/shadbalaReference.mjs';
import { calculateShodashVarga, getVargaChart } from '@/services/divisionalChartsService';

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** The seven divisions that feed Saptavargaja Bala, plus D1. All must agree. */
const AGREEING = [1, 2, 3, 7, 9, 12, 30];

/** Divisions the engine has no special rule for — documented divergence. */
const DIVERGING = [4, 20, 60];

/** All grahas at one longitude; returns the whole 16-chart result. */
function vargaAt(lon: number) {
  const lons = Object.fromEntries(PLANETS.map((p) => [p, lon]));
  return calculateShodashVarga(lons, lon);
}

/** The engine's varga rashi for the Sun at `lon` in `division`. */
function engineRashi(lon: number, division: number): number {
  const chart = getVargaChart(vargaAt(lon), division);
  expect(chart, `engine must expose D${division}`).toBeDefined();
  const pos = chart!.positions.find((p) => p.planet === 'Sun');
  expect(pos, `Sun must be present in D${division}`).toBeDefined();
  return pos!.vargaRashi;
}

describe('divisional charts — coverage of the divisions under test', () => {
  it('exposes every division the oracle has a rule for', () => {
    const result = vargaAt(0);
    for (const division of [...AGREEING, ...DIVERGING]) {
      expect(getVargaChart(result, division), `D${division}`).toBeDefined();
    }
  });

  it('the deterministic core (positions) is stable across identical calls', () => {
    const a = getVargaChart(vargaAt(123.456), 9)!.positions;
    const b = getVargaChart(vargaAt(123.456), 9)!.positions;
    expect(a).toEqual(b);
  });
});

describe('Saptavarga mapping agrees with the independent oracle', () => {
  it('matches on D1/D2/D3/D7/D9/D12/D30 for every whole degree', () => {
    const mismatches: string[] = [];
    for (let lon = 0; lon < 360; lon += 1) {
      const result = vargaAt(lon);
      for (const division of AGREEING) {
        const chart = getVargaChart(result, division);
        const pos = chart?.positions.find((p) => p.planet === 'Sun');
        const expected = R.vargaSign(lon, `D${division}`);
        if (pos?.vargaRashi !== expected) {
          mismatches.push(`D${division} @ ${lon}°: engine ${pos?.vargaRashi} vs oracle ${expected}`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('agrees at the part boundaries that actually flip a division', () => {
    // Each of these is the first degree of a new part in at least one division.
    const boundaries = [0, 7.5, 10, 15, 20, 22.5, 25, 29.999];
    for (const lon of boundaries) {
      for (const division of AGREEING) {
        expect(engineRashi(lon, division), `D${division} @ ${lon}°`).toBe(
          R.vargaSign(lon, `D${division}`),
        );
      }
    }
  });
});

describe('D4 / D20 / D60 fall through to the generic mapping (documented divergence)', () => {
  it('D7 is NOT among the diverging divisions — the generic form is classical', () => {
    // `(7s + part) % 12` is the closed form of "odd signs from the sign, even
    // signs from the 7th", so D7 needs no special case and has none.
    expect(DIVERGING).not.toContain(7);
    expect(engineRashi(0, 7)).toBe(R.vargaSign(0, 'D7'));
    expect(engineRashi(30, 7)).toBe(R.vargaSign(30, 'D7'));
    expect(engineRashi(45, 7)).toBe(R.vargaSign(45, 'D7'));
  });

  it('D4: the engine counts sequentially from Aries instead of in +3 steps', () => {
    // 7°30′ into Aries is part 1. Oracle → 4th from Aries (3); engine → (0*4+1) = 1.
    expect(R.vargaSign(7.5, 'D4')).toBe(3);
    expect(engineRashi(7.5, 4)).toBe(1);
    expect(engineRashi(7.5, 4)).not.toBe(R.vargaSign(7.5, 'D4'));
    // At the sign boundary Taurus (30°) the two also disagree: 1 vs 4.
    expect(R.vargaSign(30, 'D4')).toBe(1);
    expect(engineRashi(30, 4)).toBe(4);
  });

  it('D20: the engine ignores the movable/fixed/dual start signs', () => {
    // Only signs divisible by 3 happen to start at the right place.
    expect(engineRashi(1.5, 20)).toBe(R.vargaSign(1.5, 'D20'));   // s=0 → both start at Aries
    // s=1 (Taurus, fixed) should start at Leo (4); the engine starts at 8.
    expect(R.vargaSign(31.5, 'D20')).toBe(5);
    expect(engineRashi(31.5, 20)).toBe(9);
    // s=2 (Gemini, dual) should start at Sagittarius (8); the engine starts at 4.
    expect(R.vargaSign(60, 'D20')).toBe(8);
    expect(engineRashi(60, 20)).toBe(4);
  });

  it('D60: the engine collapses to the part index, ignoring the sign entirely', () => {
    // `(rashi * 60 + part) % 12` reduces to `part % 12` because 60 ≡ 0 (mod 12):
    // two longitudes a whole sign apart, sharing a part index, get the same rashi.
    expect(engineRashi(0.25, 60)).toBe(0);
    expect(engineRashi(30.25, 60)).toBe(0);   // engine: sign-independent (defect)
    expect(R.vargaSign(0.25, 'D60')).toBe(0);
    expect(R.vargaSign(30.25, 'D60')).toBe(1); // oracle: counts from the sign
    expect(engineRashi(30.5, 60)).toBe(1);
    expect(R.vargaSign(30.5, 'D60')).toBe(2);
  });
});
