/**
 * ============================================================
 * PRASNA KERNEL — ASHTAMANGALA (Prasnalove.txt §5.7)
 * ============================================================
 *
 * Prasna Marga Ch. IV §46–47 (the number from three heaps) and
 * Ch. VII §71–78 (interpretation: planets, yonis, body zones).
 *
 * The querist divides 108 cowries into three heaps (left, front, right).
 * Each heap count is reduced to a digit 1..8; the three digits form a
 * three-figure number. The future digit is the classical indicator.
 * ============================================================
 */

export type AshtamangalaPlanet =
  | 'Sun' | 'Mars' | 'Jupiter' | 'Mercury' | 'Venus' | 'Saturn' | 'Moon' | 'Rahu';

/** Digit (1..8) → ruling planet. Index 0 is unused. */
export const AM_PLANET: readonly (AshtamangalaPlanet | null)[] = [
  null, 'Sun', 'Mars', 'Jupiter', 'Mercury', 'Venus', 'Saturn', 'Moon', 'Rahu',
];

/** Digit (1..8) → yoni (Ch. VII). Index 0 is unused. */
export const AM_YONI: readonly (string | null)[] = [
  null, 'Dhwaja', 'Dhuma', 'Simha', 'Dog', 'Ox', 'Donkey', 'Elephant', 'Crow',
];

/**
 * Reduce a heap count to a digit 1..8.
 *   16 → 8  (16 % 8 = 0 → 8)
 *    9 → 1
 * Negative-free by construction (a heap is a count).
 */
export function ashtamangalaDigit(heapCount: number): number {
  const m = ((heapCount % 8) + 8) % 8;
  return m === 0 ? 8 : m;
}

export interface AshtamangalaZone {
  digit: number;
  planet: AshtamangalaPlanet | null;
  bodyZone: string;
}

export interface AshtamangalaResult {
  /** Hundreds (past) / tens (present) / units (future). */
  number: number;
  past: AshtamangalaZone;
  present: AshtamangalaZone;
  future: AshtamangalaZone;
  /** Zones whose digit is even — the classical "disorder" zones. */
  disorderZones: number[];
}

/** Build the Ashtamangala number from the three heap counts. */
export function ashtamangala(left: number, front: number, right: number): AshtamangalaResult {
  const d = [ashtamangalaDigit(left), ashtamangalaDigit(front), ashtamangalaDigit(right)];
  return {
    number: d[0] * 100 + d[1] * 10 + d[2],
    past: { digit: d[0], planet: AM_PLANET[d[0]], bodyZone: 'above neck' },
    present: { digit: d[1], planet: AM_PLANET[d[1]], bodyZone: 'neck to waist' },
    future: { digit: d[2], planet: AM_PLANET[d[2]], bodyZone: 'below waist' },
    disorderZones: d.map((x, i) => (x % 2 === 0 ? i : -1)).filter((i) => i >= 0),
  };
}
