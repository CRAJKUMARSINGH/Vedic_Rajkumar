// SPDX-License-Identifier: MIT
/**
 * src/lib/vedic/ayanamsaCore.ts
 *
 * PHASE 1 · single source of truth for ayanamsa.
 *
 * Before this patch three modules each carried their own hard-coded anchor and
 * disagreed with one another:
 *
 *   lib/vedic/ayanamsaEngine.ts    Lahiri 23.85472 · Raman 22.45986 · KP 23.85022 · FB 24.74261
 *   services/ayanamsaService.ts    Lahiri 23.85472 · Raman 22.46040 · KP 23.86280 · FB 24.04400
 *   services/swissEphemerisService fallback 23.85 + (year - 2000) * 0.0139
 *
 * The Fagan-Bradley disagreement is 0.699 deg (~23 days of solar motion, a full
 * nakshatra pada); KP disagrees by 0.0126 deg (45"). This module is the only
 * place a constant may live from now on.
 *
 * MODEL — and its declared limit
 *   ayanamsa(t) = anchor(J2000.0) + p_A(t)
 *   p_A = IAU 2006 accumulated general precession in longitude
 *         (Capitaine, Wallace & Chapront 2003), arcsec, T in Julian centuries TT.
 *
 * This is an *approximation of* Swiss Ephemeris, never a substitute for it. Every
 * value carries `source: 'precession-polynomial'`; only the WASM path may claim
 * `source: 'swisseph'`. `AnswerCard.provenance.ayanamsa` must echo whichever one
 * actually produced the number (see PHASE2_CODE_PATCH_PLAN.md, tag F-04).
 *
 * Anchors flagged `pending-golden` are behaviour-preserving placeholders that keep
 * the current public output stable until `npm run accuracy:ayanamsa:lock` writes
 * the Swiss-Ephemeris-derived truth into a committed golden file. Shipping a
 * `pending-golden` anchor into a published card is a publish-guard violation.
 */

export const AYANAMSA_ENGINE_VERSION = '2.0.0' as const;

export const J2000 = 2451545.0;
export const DAYS_PER_CENTURY = 36525;

/** Degrees of arc in one circle / seconds of arc in one degree. */
const ARCSEC_PER_DEG = 3600;

export type AyanamsaSystem =
  | 'Lahiri'
  | 'Raman'
  | 'KP'
  | 'Yukteshwar'
  | 'FaganBradley'
  | 'TrueCitra';

/** Who actually produced the number. Never inferred, always set explicitly. */
export type AyanamsaSource = 'swisseph' | 'precession-polynomial';

/** `golden-locked` = signed off against Swiss Ephemeris; `pending-golden` = not yet. */
export type AnchorProvenance = 'golden-locked' | 'pending-golden';

export interface AyanamsaAnchor {
  readonly system: AyanamsaSystem;
  /** Swiss Ephemeris `SE_SIDM_*` id, so the WASM path and this path cannot drift. */
  readonly seSidMode: number;
  /** Ayanamsa in degrees at J2000.0 (JD 2451545.0 TT). */
  readonly valueAtJ2000: number;
  readonly provenance: AnchorProvenance;
  /** True-star systems need Spica/Pushya proper motion — unavailable in pure JS. */
  readonly trueStar: boolean;
  readonly note: string;
}

/**
 * SE_SIDM ids verified against the ids this repo already ships in
 * `services/swissEphemerisService.ts` (LAHIRI 1, RAMAN 3, KRISHNAMURTI 5,
 * YUKTESHWAR 7) plus the documented Fagan-Bradley 0 and True Citra 27.
 */
export const AYANAMSA_ANCHORS: Readonly<Record<AyanamsaSystem, AyanamsaAnchor>> = {
  Lahiri: {
    system: 'Lahiri',
    seSidMode: 1,
    valueAtJ2000: 23.853194, // 23 deg 51' 11.5" — IAU 1956 Chitrapaksha
    provenance: 'golden-locked',
    trueStar: false,
    note: 'Chitrapaksha. Production default; regulator-recognised in India.',
  },
  Raman: {
    system: 'Raman',
    seSidMode: 3,
    valueAtJ2000: 22.45986,
    provenance: 'pending-golden',
    trueStar: false,
    note: 'Kept at the engine-module value; service module said 22.46040 (1.9").',
  },
  KP: {
    system: 'KP',
    seSidMode: 5,
    valueAtJ2000: 23.85022,
    provenance: 'pending-golden',
    trueStar: false,
    note: 'Kept at the engine-module value; service module said 23.8628 (45").',
  },
  Yukteshwar: {
    system: 'Yukteshwar',
    seSidMode: 7,
    valueAtJ2000: 22.36,
    provenance: 'pending-golden',
    trueStar: false,
    note: 'Only the service module defined this; anchor is a literature value.',
  },
  FaganBradley: {
    system: 'FaganBradley',
    seSidMode: 0,
    valueAtJ2000: 24.74261,
    provenance: 'pending-golden',
    trueStar: false,
    note: 'service module shipped 24.0440 — 0.699 deg low. That value is a defect, not a variant.',
  },
  TrueCitra: {
    system: 'TrueCitra',
    seSidMode: 27,
    valueAtJ2000: 23.853194,
    provenance: 'pending-golden',
    trueStar: true,
    note: 'Needs Spica; pure-JS path returns nutation-only and flags degraded.',
  },
};

export const AYANAMSA_SYSTEMS = Object.keys(AYANAMSA_ANCHORS) as AyanamsaSystem[];

/** Systems whose anchor has not yet been signed off against Swiss Ephemeris. */
export const pendingAnchors = (): AyanamsaSystem[] =>
  AYANAMSA_SYSTEMS.filter((s) => AYANAMSA_ANCHORS[s].provenance !== 'golden-locked');

/** A value that cannot be used in a published artifact carries why, not just what. */
export type AyanamsaDegraded =
  | 'true-citra-approximated'
  | 'anchor-pending-golden'
  | 'delta-t-out-of-range';

export interface AyanamsaValue {
  system: AyanamsaSystem;
  /** Julian Day on the UT scale the caller supplied. */
  jdUT: number;
  /** Julian Day on the TT scale the polynomial was actually evaluated at. */
  jdTT: number;
  /** Ayanamsa in degrees, [0, 360). */
  value: number;
  /** Degrees per Julian century — the same unit the old `precessionRate` used. */
  precessionRate: number;
  source: AyanamsaSource;
  seSidMode: number;
  engineVersion: typeof AYANAMSA_ENGINE_VERSION;
  degraded: AyanamsaDegraded[];
}

const normalise = (deg: number): number => ((deg % 360) + 360) % 360;
const deg2rad = (d: number): number => (d * Math.PI) / 180;

// ── Time scales ───────────────────────────────────────────────────────────────

const isFiniteNumber = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Julian Day (UT) from a UTC instant. */
export const jdFromUTC = (date: Date): number => date.getTime() / 86400000 + 2440587.5;

/**
 * ΔT = TT − UT in seconds, Espenak & Meeus polynomial set (NASA five-millennium
 * canon). Valid 1900–2150; outside that the caller gets a 0 result plus the
 * `delta-t-out-of-range` flag rather than a confidently wrong number.
 */
export function deltaTSeconds(jdUT: number): { seconds: number; inRange: boolean } {
  const year = 2000 + (jdUT - J2000) / 365.25;
  const t = (from: number) => year - from;

  if (year >= 1900 && year < 1920) {
    const u = t(1900);
    return { seconds: -2.79 + 1.494119 * u - 0.0598939 * u ** 2 + 0.0061966 * u ** 3 - 0.000197 * u ** 4, inRange: true };
  }
  if (year >= 1920 && year < 1941) {
    const u = t(1920);
    return { seconds: 21.2 + 0.84493 * u - 0.0761 * u ** 2 + 0.0020936 * u ** 3, inRange: true };
  }
  if (year >= 1941 && year < 1961) {
    const u = t(1950);
    return { seconds: 29.07 + 0.407 * u - u ** 2 / 233 + u ** 3 / 2547, inRange: true };
  }
  if (year >= 1961 && year < 1986) {
    const u = t(1975);
    return { seconds: 45.45 + 1.067 * u - u ** 2 / 260 - u ** 3 / 718, inRange: true };
  }
  if (year >= 1986 && year < 2005) {
    const u = t(2000);
    return {
      seconds: 63.86 + 0.3345 * u - 0.060374 * u ** 2 + 0.0017275 * u ** 3 + 0.000651814 * u ** 4 + 0.00002373599 * u ** 5,
      inRange: true,
    };
  }
  if (year >= 2005 && year < 2050) {
    const u = t(2000);
    return { seconds: 62.92 + 0.32217 * u + 0.005589 * u ** 2, inRange: true };
  }
  if (year >= 2050 && year <= 2150) {
    return { seconds: -20 + 32 * ((year - 1820) / 100) ** 2 - 0.5628 * (2150 - year), inRange: true };
  }
  return { seconds: 0, inRange: false };
}

export function jdTTFromUT(jdUT: number): { jdTT: number; inRange: boolean } {
  const { seconds, inRange } = deltaTSeconds(jdUT);
  return { jdTT: jdUT + seconds / 86400, inRange };
}

// ── Precession & nutation ─────────────────────────────────────────────────────

/**
 * Accumulated general precession in longitude since J2000.0, arcseconds.
 * IAU 2006 (Capitaine et al. 2003), T = Julian centuries TT from J2000.0.
 * This is the secular term that moves every sidereal anchor; the old code used a
 * bare `1.396 * T` linear form, which drifts by ~1.1" per century.
 */
export function precessionArcsec(jdTT: number): number {
  const T = (jdTT - J2000) / DAYS_PER_CENTURY;
  return (
    5028.796195 * T +
    1.1054348 * T ** 2 +
    0.00007964 * T ** 3 -
    0.000023857 * T ** 4 -
    0.0000000383 * T ** 5
  );
}

/** d(p_A)/dT in arcsec per Julian century — the instantaneous rate. */
export function precessionRateArcsecPerCentury(jdTT: number): number {
  const T = (jdTT - J2000) / DAYS_PER_CENTURY;
  return (
    5028.796195 +
    2 * 1.1054348 * T +
    3 * 0.00007964 * T ** 2 -
    4 * 0.000023857 * T ** 3 -
    5 * 0.0000000383 * T ** 4
  );
}

/**
 * Nutation in longitude, arcseconds. IAU 1980 leading terms — enough for the
 * ±17" nutation cycle, no more. Swiss Ephemeris evaluates the full series; that
 * gap is why the pure-JS path can never be tagged `swisseph`.
 */
export function nutationInLongitudeArcsec(jdTT: number): number {
  const T = (jdTT - J2000) / DAYS_PER_CENTURY;
  const omega = deg2rad(125.04452 - 1934.136261 * T);
  const sunMean = deg2rad(280.4665 + 36000.7698 * T);
  const moonMean = deg2rad(218.3165 + 481267.8813 * T);
  return (
    -17.2 * Math.sin(omega) -
    1.32 * Math.sin(2 * sunMean) -
    0.23 * Math.sin(2 * moonMean) +
    0.21 * Math.sin(2 * omega)
  );
}

// ── Core evaluation ───────────────────────────────────────────────────────────

/**
 * Ayanamsa in degrees for a Julian Day on the **UT** scale.
 *
 * Bodies in this repo are evaluated in TT (docs/TIME_SCALES.md); the ayanamsa
 * used to be evaluated in UT, so the two frames drifted by ΔT (≈69 s ≈ 0.0009"
 * today, but ~1.5" for a 19th-century chart). Both operands now come from TT.
 */
export function ayanamsaAt(jdUT: number, system: AyanamsaSystem = 'Lahiri'): AyanamsaValue {
  if (!isFiniteNumber(jdUT) || jdUT <= 0) {
    throw new RangeError(`ayanamsaAt: jdUT must be a positive finite Julian Day, got ${String(jdUT)}`);
  }
  const anchor = AYANAMSA_ANCHORS[system];
  if (!anchor) throw new RangeError(`ayanamsaAt: unknown ayanamsa system "${String(system)}"`);

  const { jdTT, inRange } = jdTTFromUT(jdUT);
  const degraded: AyanamsaDegraded[] = [];

  let value = anchor.valueAtJ2000 + precessionArcsec(jdTT) / ARCSEC_PER_DEG;

  if (anchor.trueStar) {
    // Spica's own proper motion and aberration are not modelled in pure JS.
    value += nutationInLongitudeArcsec(jdTT) / ARCSEC_PER_DEG;
    degraded.push('true-citra-approximated');
  }
  if (anchor.provenance !== 'golden-locked') degraded.push('anchor-pending-golden');
  if (!inRange) degraded.push('delta-t-out-of-range');

  return {
    system,
    jdUT,
    jdTT,
    value: normalise(value),
    precessionRate: precessionRateArcsecPerCentury(jdTT) / ARCSEC_PER_DEG,
    source: 'precession-polynomial',
    seSidMode: anchor.seSidMode,
    engineVersion: AYANAMSA_ENGINE_VERSION,
    degraded,
  };
}

/** Convenience: the ayanamsa number alone. */
export const ayanamsaDegrees = (jdUT: number, system: AyanamsaSystem = 'Lahiri'): number =>
  ayanamsaAt(jdUT, system).value;

export const siderealFromTropical = (
  tropicalLon: number,
  jdUT: number,
  system: AyanamsaSystem = 'Lahiri',
): number => normalise(tropicalLon - ayanamsaDegrees(jdUT, system));

export const tropicalFromSidereal = (
  siderealLon: number,
  jdUT: number,
  system: AyanamsaSystem = 'Lahiri',
): number => normalise(siderealLon + ayanamsaDegrees(jdUT, system));

// ── Boundary margins (Phase 2 consumes these) ─────────────────────────────────

export interface BoundaryMargins {
  /** Degrees to the nearest 30 deg rashi edge. */
  toRashi: number;
  /** Degrees to the nearest 3 deg 20' nakshatra edge. */
  toNakshatra: number;
  /** Degrees to the nearest 0 deg 46' 40" pada edge. */
  toPada: number;
  /** Smallest of the three — the number a router guard should test. */
  nearest: number;
}

const circularDistanceToBoundary = (lon: number, span: number): number => {
  const withinSpan = normalise(lon) % span;
  return Math.min(withinSpan, span - withinSpan);
};

export function boundaryMargins(siderealLon: number): BoundaryMargins {
  if (!isFiniteNumber(siderealLon)) throw new RangeError('boundaryMargins: longitude must be finite');
  const toRashi = circularDistanceToBoundary(siderealLon, 30);
  const toNakshatra = circularDistanceToBoundary(siderealLon, 360 / 27);
  const toPada = circularDistanceToBoundary(siderealLon, 360 / 108);
  return { toRashi, toNakshatra, toPada, nearest: Math.min(toRashi, toNakshatra, toPada) };
}

/**
 * True when the *difference between ayanamsa systems* is large enough to move this
 * longitude across an edge. This is the honest test: a chart is not "uncertain"
 * because 0.9 deg is a big number, it is uncertain because Lahiri and
 * Fagan-Bradley disagree about which side of a boundary it falls on.
 */
export function systemsDisagreeAcrossBoundary(
  tropicalLon: number,
  jdUT: number,
  systems: AyanamsaSystem[] = ['Lahiri', 'FaganBradley'],
): boolean {
  const bands = systems.map((s) => Math.floor(normalise(tropicalLon - ayanamsaDegrees(jdUT, s)) / (360 / 27)));
  return new Set(bands).size > 1;
}
