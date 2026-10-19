/**
 * tolerances.ts — Accuracy thresholds for the two-tier validation model.
 *
 * Tier A — astronomical, measured in arcseconds.
 *   Failures are invisible to users but indicate engine drift.
 *
 * Tier B — derived Jyotish, exact string match.
 *   Failures ARE visible to users. A wrong nakshatra is a wrong dasha.
 *   Tier B breaches exit the runner with code 1.
 */

/** Tier A: arcsecond tolerances per body/quantity. */
export const TOL_ARCSEC = {
  graha:      1.0,   // planets (not Moon)
  moon:       3.0,   // 1s of time ≈ 0.55" of Moon motion
  node:       1.0,   // Rahu/Ketu (mean node)
  ascendant:  2.0,
  mc:         2.0,
  ayanamsa:   0.1,
} as const;

/** Tier B: must be an exact string match — zero tolerance. */
export const TIER_B_KEYS = [
  'rashi',
  'nakshatra',
  'pada',
  'navamsaSign',
] as const;

export type TierBKey = (typeof TIER_B_KEYS)[number];

export const TOL_SUNRISE_SECONDS    = 2;
export const TOL_DASHA_BOUNDARY_SECONDS = 60;
