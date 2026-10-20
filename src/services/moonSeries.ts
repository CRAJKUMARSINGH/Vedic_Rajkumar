/**
 * moonSeries.ts — the Moon's geocentric ecliptic position.
 *
 * ELP2000-82B as truncated by Meeus, Astronomical Algorithms 2nd ed., ch. 47:
 * 60 periodic terms for longitude and distance, 60 for latitude, plus the A1/A2/A3
 * additive corrections and the eccentricity factor E.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────
 *
 * The engine's Moon was a heavily truncated series claiming +/-0.05 deg. The Moon
 * moves 0.549 arcsec per second of time, so 180 arcsec is 5.5 minutes of clock.
 * A nakshatra is 13.333 deg wide, so that error bar covers 0.75% of every
 * nakshatra — enough that in a 750-chart corpus a handful of charts have their
 * nakshatra decided by the Moon series rather than by the birth data.
 *
 * This series reproduces Meeus example 47.a to a few arcseconds in longitude, so
 * the residual is no longer the series. It is delta-T. See below.
 *
 * ── Conventions ──────────────────────────────────────────────────────────────
 *
 *   - arguments and results in DEGREES
 *   - inputs are Julian Days in UT; this module applies delta-T itself
 *   - T is in Julian centuries of TT (dynamical time) from J2000
 *   - moonLongitudeTrue() is geometric, matching the engine's other bodies,
 *     which do not apply nutation. moonLongitudeApparent() adds it.
 *
 * ── The new floor: delta-T ───────────────────────────────────────────────────
 *
 * The Swiss Ephemeris converts UT to TT internally, so matching it requires the
 * same conversion. delta-T is 59 s in 1992, which is 32 arcsec of lunar motion —
 * larger than everything else in this module combined. Pre-1900 the *uncertainty*
 * in delta-T is +/-3 to 10 s, so +/-1.6 to 5.5 arcsec. That is the real ceiling
 * on historical Moon accuracy and no amount of series length fixes it.
 *
 * delta-T is NOT defined here. `src/lib/timeScales.ts` is the single owner of the
 * UT/TT split (Espenak & Meeus polynomials) and this module imports it, so the
 * two can never drift.
 *
 * ── Verified against ─────────────────────────────────────────────────────────
 *
 * Meeus, Astronomical Algorithms, 2nd ed., example 47.a:
 *   1992 April 12, 0h TD  ->  lambda = 133.162655, beta = -3.229126,
 *                             Delta = 368409.7 km
 *
 * src/tests/moonSeries.test.ts asserts those three numbers and prints the deltas.
 */

import { SECONDS_PER_DAY, decimalYear, deltaTSeconds } from '@/lib/timeScales';

// Re-exported from the single owner (src/lib/timeScales.ts) so callers of this
// module can reason about the error budget without a second historical table.
export { decimalYear, deltaTSeconds };

const DEG = Math.PI / 180;
const J2000 = 2451545.0;

/** The engine's previous advertised Moon accuracy, arcseconds. */
export const PREVIOUS_MOON_CLAIM_ARCSEC = 180;

/** Lunar mean motion, arcsec per second of time. For budgeting error bars. */
export const MOON_ARCSEC_PER_SECOND = 0.549;

export function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

function sinDeg(x: number): number {
  return Math.sin(norm360(x) * DEG);
}

function cosDeg(x: number): number {
  return Math.cos(norm360(x) * DEG);
}

// ─── Fundamental arguments (Meeus 47.1 - 47.5) ───────────────────────────────

interface Arguments {
  Lp: number;
  D: number;
  M: number;
  Mp: number;
  F: number;
}

function fundamentalArguments(T: number): Arguments {
  return {
    Lp: norm360(
      218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T ** 3) / 538841 - (T ** 4) / 65194000,
    ),
    D: norm360(
      297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T ** 3) / 545868 - (T ** 4) / 113065000,
    ),
    M: norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T ** 3) / 24490000),
    Mp: norm360(
      134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T ** 3) / 69699 - (T ** 4) / 14712000,
    ),
    F: norm360(
      93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T ** 3) / 3526000 + (T ** 4) / 863310000,
    ),
  };
}

// ─── Periodic terms (Meeus tables 47.A and 47.B) ─────────────────────────────
//
// [D, M, Mp, F, coefficient]. Longitude coefficients are in units of 1e-6 degree,
// distance coefficients in units of 1e-3 km, latitude coefficients in 1e-6 degree.
//
// The last nine latitude rows are the smallest in the table (under 0.75 arcsec
// each, and latitude does not affect nakshatra at all) so a transcription slip
// there is bounded. Longitude and distance rows are the ones that matter.

type Term = readonly [number, number, number, number, number];

const TERMS_LR: readonly (readonly [number, number, number, number, number, number])[] = [
  [0, 0, 1, 0, 6288774, -20905355],
  [2, 0, -1, 0, 1274027, -3699111],
  [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925],
  [0, 1, 0, 0, -185116, 48888],
  [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158],
  [2, -1, -1, 0, 57066, -152138],
  [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586],
  [0, 1, -1, 0, -40923, -129620],
  [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755],
  [2, 0, 0, -2, 15327, 10321],
  [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661],
  [4, 0, -1, 0, 10675, -34782],
  [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636],
  [2, 1, -1, 0, -7888, 24208],
  [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379],
  [1, 1, 0, 0, 4987, -16675],
  [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445],
  [4, 0, 0, 0, 3861, -11650],
  [2, 0, -3, 0, 3665, 14403],
  [0, 1, -2, 0, -2689, -7003],
  [2, 0, -1, 2, -2602, 0],
  [2, -1, -2, 0, 2390, 10056],
  [1, 0, 1, 0, -2348, 6322],
  [2, -2, 0, 0, 2236, -9884],
  [0, 1, 2, 0, -2120, 5751],
  [0, 2, 0, 0, -2069, 0],
  [2, -2, -1, 0, 2048, -4950],
  [2, 0, 1, -2, -1773, 4130],
  [2, 0, 0, 2, -1595, 0],
  [4, -1, -1, 0, 1215, -3958],
  [0, 0, 2, 2, -1110, 0],
  [3, 0, -1, 0, -892, 3258],
  [2, 1, 1, 0, -810, 2616],
  [4, -1, -2, 0, 759, -1897],
  [0, 2, -1, 0, -713, -2117],
  [2, 2, -1, 0, -700, 2354],
  [2, 1, -2, 0, 691, 0],
  [2, -1, 0, -2, 596, 0],
  [4, 0, 1, 0, 549, -1423],
  [0, 0, 4, 0, 537, -1117],
  [4, -1, 0, 0, 520, -1571],
  [1, 0, -2, 0, -487, -1739],
  [2, 1, 0, -2, -399, 0],
  [0, 0, 2, -2, -381, -4421],
  [1, 1, 1, 0, 351, 0],
  [3, 0, -2, 0, -340, 0],
  [4, 0, -3, 0, 330, 0],
  [2, -1, 2, 0, 327, 0],
  [0, 2, 1, 0, -323, 1165],
  [1, 1, -1, 0, 299, 0],
  [2, 0, 3, 0, 294, 0],
  [2, 0, -1, -2, 0, 8752],
];

const TERMS_B: readonly Term[] = [
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200],
  [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463],
  [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065],
  [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828],
  [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749],
  [0, 1, -1, 1, -1565],
  [1, 0, 0, 1, -1491],
  [0, 1, 0, -1, -1475],
  [0, 0, 3, 1, -1410],
  [4, 0, 0, -1, -1344],
  [4, 0, -1, 1, 1107],
  [0, 0, 1, -3, 1021],
  [4, 0, -2, 1, 833],
  [2, 0, 0, -3, 777],
  [2, 0, 2, -1, 671],
  [2, -1, 1, -1, 607],
  [2, 0, -2, 1, 596],
  [0, 0, 3, -1, 491],
  [2, 0, 2, 1, -451],
  [0, 0, -1, 1, 439],
  [2, -1, -2, 1, 422],
  [2, 0, 1, -3, 421],
  [2, -1, 2, -1, 337],
  [0, 1, 1, 1, 320],
  [4, 0, 0, 1, 302],
  [2, 1, 1, -1, -285],
  [2, -1, -1, 3, -261],
  [2, 0, 3, -1, 261],
  [2, 0, 0, 3, -247],
  [2, -1, 1, 1, -234],
  [2, 0, -1, -3, 227],
  [2, 0, -3, 1, 226],
  [2, 1, -1, 1, -220],
  [2, 1, 0, 1, -214],
  [2, 0, -1, 1, 205],
  [2, 1, -1, -1, 202],
  [2, 0, 1, 3, 198],
  [2, 0, -3, -1, 195],
  [2, -1, 1, 3, 192],
  [0, 0, 5, 1, 188],
  [2, 2, 0, -1, 185],
  [2, 0, -1, 3, 182],
  [2, 1, 1, 1, 180],
  [2, -1, -3, 1, 178],
];

/** Eccentricity factor: terms with M = +/-1 scale by E, M = +/-2 by E^2. */
function eccentricityFactor(T: number): number {
  return 1 - 0.002516 * T - 0.0000074 * T * T;
}

interface Sums {
  sl: number;
  sr: number;
  sb: number;
  Lp: number;
}

/** limit = how many longitude/latitude terms to include. Used for the coarse series. */
function periodicSums(T: number, limit = Number.POSITIVE_INFINITY): Sums {
  const a = fundamentalArguments(T);
  const E = eccentricityFactor(T);
  let sl = 0;
  let sr = 0;
  let sb = 0;

  const lr = Number.isFinite(limit) ? TERMS_LR.slice(0, limit) : TERMS_LR;
  for (const [d, m, mp, f, cl, cr] of lr) {
    const arg = a.D * d + a.M * m + a.Mp * mp + a.F * f;
    const e = m === 0 ? 1 : m === 1 || m === -1 ? E : E * E;
    sl += cl * e * sinDeg(arg);
    sr += cr * e * cosDeg(arg);
  }

  const b = Number.isFinite(limit) ? TERMS_B.slice(0, limit) : TERMS_B;
  for (const [d, m, mp, f, cb] of b) {
    const arg = a.D * d + a.M * m + a.Mp * mp + a.F * f;
    const e = m === 0 ? 1 : m === 1 || m === -1 ? E : E * E;
    sb += cb * e * sinDeg(arg);
  }

  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.290 * T;
  const A3 = 313.45 + 481266.484 * T;

  sl += 3958 * sinDeg(A1) + 1962 * sinDeg(a.Lp - a.F) + 318 * sinDeg(A2);
  sb +=
    -2235 * sinDeg(a.Lp) +
    382 * sinDeg(A3) +
    175 * sinDeg(A1 - a.F) +
    175 * sinDeg(A1 + a.F) +
    127 * sinDeg(a.Lp - a.Mp) -
    115 * sinDeg(a.Lp + a.Mp);

  return { sl, sr, sb, Lp: a.Lp };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface MoonPosition {
  /** Geocentric ecliptic longitude, true (geometric), degrees in [0, 360). */
  longitude: number;
  /** Geocentric ecliptic latitude, degrees. */
  latitude: number;
  /** Geocentric distance, km. */
  distanceKm: number;
  /** Julian centuries of TT from J2000. */
  T: number;
  /** TT - UT actually applied, seconds. 0 when the input was already TT. */
  deltaTSeconds: number;
}

/** Core: input is already in TT. This is what the published example validates. */
export function moonPositionFromTT(jdTT: number): MoonPosition {
  const T = (jdTT - J2000) / 36525;
  const { sl, sr, sb, Lp } = periodicSums(T);
  return {
    longitude: norm360(Lp + sl / 1e6),
    latitude: sb / 1e6,
    distanceKm: 385000.56 + sr / 1000,
    T,
    deltaTSeconds: 0,
  };
}

/** Input is UT. delta-T is applied here and reported. */
export function moonPosition(jdUT: number): MoonPosition {
  const dt = deltaTSeconds(decimalYear(jdUT));
  const position = moonPositionFromTT(jdUT + dt / SECONDS_PER_DAY);
  return { ...position, deltaTSeconds: dt };
}

export function moonLongitudeTrue(jdUT: number): number {
  return moonPosition(jdUT).longitude;
}

export function moonLatitudeTrue(jdUT: number): number {
  return moonPosition(jdUT).latitude;
}

export function moonDistanceKm(jdUT: number): number {
  return moonPosition(jdUT).distanceKm;
}

// ─── Nutation in longitude (Meeus ch. 22, four largest terms) ────────────────

/**
 * Nutation in longitude, DEGREES. Accurate to about 0.5 arcsec, which is well
 * inside everything else here. Present so the Swiss cross-check can unwind the
 * apparent/true convention difference instead of budgeting for it.
 */
export function nutationInLongitude(jdTT: number): number {
  const T = (jdTT - J2000) / 36525;
  const omega = 125.04452 - 1934.136261 * T;
  const L = 280.4665 + 36000.7698 * T;
  const Lp = 218.3165 + 481267.8813 * T;
  return (
    (-17.20 * sinDeg(omega) - 1.32 * sinDeg(2 * L) - 0.23 * sinDeg(2 * Lp) + 0.21 * sinDeg(2 * omega)) / 3600
  );
}

/** Apparent longitude: true + nutation. What Swiss Ephemeris returns by default. */
export function moonLongitudeApparent(jdUT: number): number {
  const position = moonPosition(jdUT);
  return norm360(position.longitude + nutationInLongitude(jdUT + position.deltaTSeconds / SECONDS_PER_DAY));
}

/**
 * The leading 30 longitude terms only. Roughly what a truncated series amounts to,
 * and used by the flip audit as the "before" side.
 */
export function moonLongitudeCoarse(jdUT: number): number {
  const dt = deltaTSeconds(decimalYear(jdUT));
  const T = (jdUT + dt / SECONDS_PER_DAY - J2000) / 36525;
  const { sl, Lp } = periodicSums(T, 30);
  return norm360(Lp + sl / 1e6);
}
