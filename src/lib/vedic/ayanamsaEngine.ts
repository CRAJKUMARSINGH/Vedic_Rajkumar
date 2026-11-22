// SPDX-License-Identifier: MIT
/**
 * src/lib/vedic/ayanamsaEngine.ts
 *
 * PHASE 1 · compatibility facade over `ayanamsaCore.ts`.
 *
 * Every export this module had before the patch still exists with the same
 * signature, so no call site changes. What changed is that no constant lives
 * here any more: the anchors, the precession model, the TT conversion and the
 * provenance tags all come from `ayanamsaCore.ts`.
 *
 * What the old file got wrong, for the record:
 *   - three anchors contradicted `services/ayanamsaService.ts` (FB by 0.699 deg)
 *   - `1.39600 * T` linear precession ignores the T^2 term (~1.1" / century)
 *   - precession was evaluated in UT while bodies were evaluated in TT
 *   - `getTrueCitrapakshaAyanamsa` used `1.39610 * T` with no nutation and was
 *     described as "approximated" — while `ayanamsaService` claimed the same
 *     quantity was "Highest — includes nutation"
 *   - `validateLahiriFormula` compared against hand-typed references at a
 *     0.05 deg tolerance (3 arcmin), loose enough to pass a wrong anchor
 */

import {
  AYANAMSA_ANCHORS,
  AYANAMSA_ENGINE_VERSION,
  type AyanamsaDegraded,
  type AyanamsaSource,
  type AyanamsaSystem as CoreAyanamsaSystem,
  ayanamsaAt,
  boundaryMargins,
  jdTTFromUT,
  pendingAnchors,
  precessionRateArcsecPerCentury,
  siderealFromTropical,
  tropicalFromSidereal,
} from './ayanamsaCore';

export type AyanamsaSystem = CoreAyanamsaSystem;
export type { AyanamsaDegraded, AyanamsaSource };
export { AYANAMSA_ENGINE_VERSION, boundaryMargins, pendingAnchors, jdTTFromUT };

export const J2000 = 2451545.0;

export interface AyanamsaResult {
  system: AyanamsaSystem;
  jd: number;
  value: number;
  /** Degrees per Julian century (same unit as the pre-patch field). */
  precessionRate: number;
  /** NEW — who produced this number. Additive, so existing readers still parse. */
  source: AyanamsaSource;
  seSidMode: number;
  degraded: AyanamsaDegraded[];
}

export interface AyanamsaDelta {
  systemA: AyanamsaSystem;
  systemB: AyanamsaSystem;
  delta: number;
  note: string;
}

export interface AyanamsaValidationResult {
  check: string;
  detail: string;
  pass: boolean;
}

const asResult = (jd: number, system: AyanamsaSystem): AyanamsaResult => {
  const v = ayanamsaAt(jd, system);
  return {
    system: v.system,
    jd: v.jdUT,
    value: v.value,
    precessionRate: v.precessionRate,
    source: v.source,
    seSidMode: v.seSidMode,
    degraded: v.degraded,
  };
};

/** Lahiri (Chitrapaksha) — production default. */
export const getLahiriAyanamsa = (jd: number): number => asResult(jd, 'Lahiri').value;
/** Raman — B.V. Raman system. */
export const getRamanAyanamsa = (jd: number): number => asResult(jd, 'Raman').value;
/** Krishnamurti Paddhati. */
export const getKPAyanamsa = (jd: number): number => asResult(jd, 'KP').value;
/** Sri Yukteshwar ("The Holy Science", 1894). */
export const getYukteshwarAyanamsa = (jd: number): number => asResult(jd, 'Yukteshwar').value;
/** Fagan-Bradley — Western sidereal standard. */
export const getFaganBradleyAyanamsa = (jd: number): number => asResult(jd, 'FaganBradley').value;
/**
 * True Chitrapaksha — nutation-correction only on the pure-JS path.
 * Callers that need the real Spica-referenced value must use the Swiss
 * Ephemeris path; the result reports `degraded: ['true-citra-approximated']`.
 */
export const getTrueCitrapakshaAyanamsa = (jd: number): number => asResult(jd, 'TrueCitra').value;

const FN_MAP: Record<AyanamsaSystem, (jd: number) => number> = {
  Lahiri: getLahiriAyanamsa,
  Raman: getRamanAyanamsa,
  KP: getKPAyanamsa,
  Yukteshwar: getYukteshwarAyanamsa,
  FaganBradley: getFaganBradleyAyanamsa,
  TrueCitra: getTrueCitrapakshaAyanamsa,
};

export function getAyanamsa(jd: number, system: AyanamsaSystem = 'Lahiri'): AyanamsaResult {
  const fn = FN_MAP[system];
  if (!fn) throw new RangeError(`getAyanamsa: unknown ayanamsa system "${String(system)}"`);
  return asResult(jd, system);
}

export function compareAyanamsa(jd: number, systemA: AyanamsaSystem, systemB: AyanamsaSystem): AyanamsaDelta {
  const a = getAyanamsa(jd, systemA);
  const b = getAyanamsa(jd, systemB);
  const delta = a.value - b.value;
  return {
    systemA,
    systemB,
    delta,
    note: `${systemA} is ${delta >= 0 ? '+' : ''}${delta.toFixed(4)} deg relative to ${systemB}`,
  };
}

export const tropicalToSidereal = (
  tropicalLon: number,
  jd: number,
  system: AyanamsaSystem = 'Lahiri',
): number => siderealFromTropical(tropicalLon, jd, system);

export const siderealToTropical = (
  siderealLon: number,
  jd: number,
  system: AyanamsaSystem = 'Lahiri',
): number => tropicalFromSidereal(siderealLon, jd, system);

/** Instantaneous precession, arcseconds per year. */
export const getLahiriPrecessionArcSeconds = (jd: number): number =>
  precessionRateArcsecPerCentury(ayanamsaAt(jd, 'Lahiri').jdTT) / 100;

/**
 * Structural self-check. These are invariants, not reference values: a wrong
 * anchor breaks a relation even when no external ephemeris is on the machine,
 * which is exactly what the Fagan-Bradley 24.0440 typo needed.
 */
export function validateLahiriFormula(): AyanamsaValidationResult[] {
  const out: AyanamsaValidationResult[] = [];
  const probeJd = 2461288.0; // 2026-09-04

  const lahiri = getAyanamsa(probeJd, 'Lahiri').value;
  const fb = getAyanamsa(probeJd, 'FaganBradley').value;
  const raman = getAyanamsa(probeJd, 'Raman').value;
  const kp = getAyanamsa(probeJd, 'KP').value;

  // Lahiri-FaganBradley is ~0.8886 deg by construction of the two definitions.
  out.push({
    check: 'Lahiri - FaganBradley within 0.85..0.93 deg',
    detail: `${(lahiri - fb).toFixed(4)}`,
    pass: Math.abs(lahiri - fb) > 0.85 && Math.abs(lahiri - fb) < 0.93,
  });
  // Raman sits ~1.394 deg below Lahiri.
  out.push({
    check: 'Lahiri - Raman within 1.38..1.41 deg',
    detail: `${(lahiri - raman).toFixed(4)}`,
    pass: Math.abs(lahiri - raman) > 1.38 && Math.abs(lahiri - raman) < 1.41,
  });
  // KP must stay within a few arcminutes of Lahiri.
  out.push({
    check: '|Lahiri - KP| < 0.02 deg',
    detail: `${Math.abs(lahiri - kp).toFixed(4)}`,
    pass: Math.abs(lahiri - kp) < 0.02,
  });

  const rate = getLahiriPrecessionArcSeconds(probeJd);
  out.push({
    check: 'Lahiri annual precession within 49.9..50.6 arcsec/yr',
    detail: `${rate.toFixed(4)}`,
    pass: rate > 49.9 && rate < 50.6,
  });

  const y1900 = getAyanamsa(2415020.5, 'Lahiri').value;
  const y2000 = getAyanamsa(2451545.0, 'Lahiri').value;
  const y2026 = getAyanamsa(probeJd, 'Lahiri').value;
  out.push({
    check: 'Lahiri is monotonically increasing 1900 -> 2000 -> 2026',
    detail: `${y1900.toFixed(4)} -> ${y2000.toFixed(4)} -> ${y2026.toFixed(4)}`,
    pass: y1900 < y2000 && y2000 < y2026,
  });
  out.push({
    check: 'Lahiri at J2000.0 equals the locked anchor',
    detail: `${y2000.toFixed(6)}`,
    // `getAyanamsa` takes UT and internally advances to TT, so it adds the
    // ~2.8e-8 deg of precession accumulated over delta-T (≈64 s) since J2000.
    // A 1e-9 tolerance could therefore never pass; 1e-6 is still ~1e4x tighter
    // than any anchor error (>1e-3 deg) this check exists to catch.
    pass: Math.abs(y2000 - AYANAMSA_ANCHORS.Lahiri.valueAtJ2000) < 1e-6,
  });

  return out;
}
