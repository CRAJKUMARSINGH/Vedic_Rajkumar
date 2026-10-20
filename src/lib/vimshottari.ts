/**
 * vimshottari.ts — Vimshottari dasha lord and balance from Moon longitude.
 *
 * Deliberately minimal and separate from the engine's dasha module so that
 * the flip audit can compare independently.  If the two disagree that is a
 * bug in one of them.
 *
 * Lord sequence: Ketu(7) · Venus(20) · Sun(6) · Moon(10) · Mars(7) ·
 *                Rahu(18) · Jupiter(16) · Saturn(19) · Mercury(17)
 *
 * Ashwini (index 0) → Ketu, Bharani (1) → Venus, … repeats every 9.
 */

import { NAKSHATRA_SPAN_DEG, nakshatraIndex, norm360 } from './nakshatraEdge';

export const VIMSHOTTARI_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
] as const;

export type VimshottariLord = (typeof VIMSHOTTARI_LORDS)[number];

export const VIMSHOTTARI_YEARS: Record<VimshottariLord, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

/** Sidereal year in days used for dasha balance. */
export const DASHA_YEAR_DAYS = 365.25;

export interface FirstDasha {
  nakshatraIndex: number;
  lord: VimshottariLord;
  /** 0 at nakshatra start, 1 at nakshatra end. */
  elapsedFraction: number;
  balanceYears: number;
  /** Days from birth to the START of the first mahadasha. Negative = before birth. */
  startOffsetDays: number;
}

/**
 * Compute the first mahadasha lord and its remaining balance
 * from a sidereal Moon longitude in degrees.
 */
export function vimshottariFirstDasha(moonSiderealLongitude: number): FirstDasha {
  const index   = nakshatraIndex(moonSiderealLongitude);
  const lord    = VIMSHOTTARI_LORDS[index % 9];
  const within  = (norm360(moonSiderealLongitude) % NAKSHATRA_SPAN_DEG) / NAKSHATRA_SPAN_DEG;
  const years   = VIMSHOTTARI_YEARS[lord];
  return {
    nakshatraIndex: index,
    lord,
    elapsedFraction:  within,
    balanceYears:     years * (1 - within),
    startOffsetDays: -within * years * DASHA_YEAR_DAYS,
  };
}
