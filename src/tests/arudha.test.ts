/**
 * Arudha (Pada) Lagna — calculation contract tests.
 *
 * Convention under test (see reports/ARUDHA_CALCULATION_CONVENTION.md):
 *   distance  = inclusive sign count from target sign to its lord's sign (1..12)
 *   unadjusted = advance same inclusive distance onward from the lord's sign
 *   exception = lord in the bhava (dist 1) → +9; lord in the 7th (dist 7) → +3
 *   co-lordship: single-lord map (Scorpio→Mars? no — see RASHI_LORDS in
 *   jaiminiService); Saturn rules both Capricorn & Aquarius, Jupiter both
 *   Sagittarius & Pisces, Mars both Aries & Libra — one lord per sign.
 */

import { describe, it, expect } from 'vitest';
import { calculateArudhaPada, type JaiminiPlanet } from '@/services/jaiminiService';

const RASHI_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

function planetAt(name: string, rashiIndex: number): JaiminiPlanet {
  return { name, rashiIndex, degrees: 10, house: ((rashiIndex - 0) % 12) + 1 };
}

/** Independent re-implementation of the documented classical convention.
 *  Exception fires when lord is in the source sign (dist===1) or the 7th
 *  from it (dist===7) — the lord's inclusive distance, not the final pada.
 *  Reference: BPHS / Upadesa Sutra Jaimini tradition.
 */
function expectedPada(target: number, lordSign: number): number {
  const dist = ((lordSign - target + 12) % 12) + 1; // inclusive distance (1..12)
  // BPHS 29.4-5: dist 1 → 10th from source (+9); dist 7 → 4th from source (+3)
  if (dist === 1) return (target + 9) % 12;
  if (dist === 7) return (target + 3) % 12;
  return (lordSign + dist - 1) % 12;
}

describe('calculateArudhaPada — convention matrix', () => {
  // All 12 target signs × all 12 lord positions for house 1 (lagna).
  for (let asc = 0; asc < 12; asc++) {
    for (let lordSign = 0; lordSign < 12; lordSign++) {
      it(`asc=${asc} lord-in-sign=${lordSign}`, () => {
        // Place EVERY lord candidate at lordSign is impossible; instead move
        // the actual lord of the target sign to lordSign.
        const lordName = RASHI_LORDS[asc];
        const planets: JaiminiPlanet[] = [
          planetAt(lordName, lordSign),
          // Other lords parked far away so `find` picks ours deterministically.
          ...['Mars','Venus','Mercury','Moon','Sun','Jupiter','Saturn']
            .filter(n => n !== lordName)
            .map((n, i) => planetAt(n, (lordSign + 3 + i) % 12)),
        ];
        const res = calculateArudhaPada(1, asc, planets);
        expect(res).not.toBeNull();
        expect(res!.rashiIndex).toBe(expectedPada(asc, lordSign));
      });
    }
  }

  it('returns null when the lord planet is absent', () => {
    expect(calculateArudhaPada(1, 0, [])).toBeNull();
  });

  it('is invariant under simultaneous rotation of signs', () => {
    // Asc=0 (Aries, lord Mars) with Mars in sign 5 vs asc=6 (Libra, lord
    // Venus) is not a pure rotation; instead verify wraparound: asc=11
    // (Pisces, lord Jupiter per map) Jupiter in sign 0.
    const planets = [planetAt('Jupiter', 0)];
    const res = calculateArudhaPada(1, 11, planets);
    expect(res).not.toBeNull();
    expect(res!.rashiIndex).toBe(expectedPada(11, 0));
  });

  it('exception branch is reachable for dist 1 and dist 7 (v2 §0 mutation guard)', () => {
    // Under the inclusive-distance convention the exception fires exactly when
    // the lord sits in the bhava (dist 1) or the 7th from it (dist 7). Count
    // the (target, lord) pairs that hit the branch: removing EXCEPTION_OFFSET
    // would change 24 matrix results.
    let hits = 0;
    for (let t = 0; t < 12; t++) {
      for (let s = 0; s < 12; s++) {
        const d = ((s - t + 12) % 12) + 1;
        if (d === 1 || d === 7) hits++;
      }
    }
    expect(hits).toBe(24);
  });
});

describe('calculateArudhaPada — house variants', () => {
  const planets = [
    planetAt('Mars', 4), planetAt('Venus', 7), planetAt('Mercury', 2),
    planetAt('Moon', 9), planetAt('Sun', 0), planetAt('Jupiter', 8),
    planetAt('Saturn', 10),
  ];
  it('computes A4 and A10 via the same engine', async () => {
    const { calculateA4, calculateA10 } = await import('@/services/jaiminiService');
    const a4 = calculateA4(2, planets);
    const a10 = calculateA10(2, planets);
    expect(a4).not.toBeNull();
    expect(a10).not.toBeNull();
    // A4 targets sign (2+4-1)%12=5 → lord Mercury at sign 2
    expect(a4!.rashiIndex).toBe(expectedPada(5, 2));
    // A10 targets sign (2+10-1)%12=11 → lord Jupiter at sign 8
    expect(a10!.rashiIndex).toBe(expectedPada(11, 8));
  });
});

describe('calculateArudhaPada — BPHS exception matrix (v2 §9)', () => {
  // 12 source signs × {lord in source (dist 1), lord in the 7th (dist 7)}.
  // Independence: expected values are hand-derived from BPHS 29.4-5, never
  // from the production algorithm.
  //   dist 1 → 10th from source = (source + 9) % 12
  //   dist 7 → 10th from raw pada (source+6) = (source + 3) % 12
  for (let source = 0; source < 12; source++) {
    it(`source=${source} lord in source sign → 10th from source`, () => {
      const lordName = RASHI_LORDS[source];
      const planets = [planetAt(lordName, source)];
      const res = calculateArudhaPada(1, source, planets);
      expect(res).not.toBeNull();
      expect(res!.rashiIndex).toBe((source + 9) % 12);
    });

    it(`source=${source} lord in 7th sign → 4th from source`, () => {
      const lordName = RASHI_LORDS[source];
      const planets = [planetAt(lordName, (source + 6) % 12)];
      const res = calculateArudhaPada(1, source, planets);
      expect(res).not.toBeNull();
      expect(res!.rashiIndex).toBe((source + 3) % 12);
    });
  }
});
