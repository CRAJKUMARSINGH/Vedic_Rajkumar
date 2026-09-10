/**
 * src/lib/vedic/ayanamsaEngine.ts
 *
 * Week 2 - Multi-system Ayanamsa Engine
 *
 * Supports Lahiri (production default), Raman, and KP systems.
 * Reference values at J2000.0 (JD 2451545.0):
 *   Lahiri  = 23.8532 deg (IAU 1956 Chitrapaksha)
 *   Raman   = 22.4599 deg (B.V. Raman)
 *   KP      = 23.8503 deg (Krishnamurti Paddhati)
 */

export type AyanamsaSystem = 'Lahiri' | 'Raman' | 'KP' | 'TrueCitrapaksha' | 'FaganBradley';

export interface AyanamsaResult {
  system: AyanamsaSystem;
  jd: number;
  value: number;
  precessionRate: number;
}

export interface AyanamsaDelta {
  systemA: AyanamsaSystem;
  systemB: AyanamsaSystem;
  delta: number;
  note: string;
}

export interface AyanamsaValidationResult {
  epoch: string;
  jd: number;
  calculated: number;
  reference: number;
  delta: number;
  pass: boolean;
}

export const J2000 = 2451545.0;

function normalise(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Lahiri (Chitrapaksha) — IAU 1956 standard */
export function getLahiriAyanamsa(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  return normalise(23.85472 + 1.39600 * T - 0.000308 * T * T);
}

/** Raman ayanamsa — B.V. Raman system */
export function getRamanAyanamsa(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  return normalise(22.45986 + 1.39600 * T - 0.000308 * T * T);
}

/** Krishnamurti Paddhati (KP) — slight offset from Lahiri */
export function getKPAyanamsa(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  return normalise(23.85022 + 1.39600 * T - 0.000308 * T * T);
}

/** True Chitrapaksha — approximated */
export function getTrueCitrapakshaAyanamsa(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  return normalise(23.84730 + 1.39610 * T);
}

/** Fagan-Bradley — Western sidereal */
export function getFaganBradleyAyanamsa(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  return normalise(24.74261 + 1.39600 * T);
}

export function getAyanamsa(jd: number, system: AyanamsaSystem = 'Lahiri'): AyanamsaResult {
  const rateMap: Record<AyanamsaSystem, number> = {
    Lahiri: 1.3960, Raman: 1.3960, KP: 1.3960,
    TrueCitrapaksha: 1.3961, FaganBradley: 1.3960,
  };
  const fnMap: Record<AyanamsaSystem, (jd: number) => number> = {
    Lahiri: getLahiriAyanamsa,
    Raman: getRamanAyanamsa,
    KP: getKPAyanamsa,
    TrueCitrapaksha: getTrueCitrapakshaAyanamsa,
    FaganBradley: getFaganBradleyAyanamsa,
  };
  return {
    system, jd,
    value: fnMap[system](jd),
    precessionRate: rateMap[system],
  };
}

export function compareAyanamsa(jd: number, systemA: AyanamsaSystem, systemB: AyanamsaSystem): AyanamsaDelta {
  const a = getAyanamsa(jd, systemA);
  const b = getAyanamsa(jd, systemB);
  const delta = a.value - b.value;
  return {
    systemA, systemB, delta,
    note: `${systemA} is ${delta >= 0 ? '+' : ''}${delta.toFixed(4)} deg relative to ${systemB}`,
  };
}

export function tropicalToSidereal(tropicalLon: number, jd: number, system: AyanamsaSystem = 'Lahiri'): number {
  return normalise(tropicalLon - getAyanamsa(jd, system).value);
}

export function getLahiriPrecessionArcSeconds(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  return 50.2564 - 0.0222 * T;
}

export function validateLahiriFormula(): AyanamsaValidationResult[] {
  const references = [
    { epoch: 'J2000.0',    jd: 2451545.0, ref: 23.853 },
    { epoch: 'B1950.0',    jd: 2433282.4, ref: 23.153 },
    { epoch: '1900-01-01', jd: 2415020.5, ref: 22.460 },
    { epoch: '2026-09-04', jd: 2461288.0, ref: 24.190 },
  ];
  return references.map(r => {
    const calc = getLahiriAyanamsa(r.jd);
    const delta = Math.abs(calc - r.ref);
    return { epoch: r.epoch, jd: r.jd, calculated: +calc.toFixed(4), reference: r.ref, delta: +delta.toFixed(4), pass: delta < 0.05 };
  });
}
