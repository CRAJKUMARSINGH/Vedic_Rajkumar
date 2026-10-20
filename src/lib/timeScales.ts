/**
 * timeScales.ts — UT / TT split and delta-T polynomials.
 *
 * ── The rule ─────────────────────────────────────────────────────────────────
 *
 *   BODIES  (Sun, Moon, planets, nodes)   →  TT   (jdTT)
 *   ANGLES  (ascendant, MC, house cusps)  →  UT   (jdUT)
 *   PANCHANG (tithi, nakshatra, yoga)     →  UT   (a calendar, not a frame)
 *
 * Bodies move under gravity → dynamical time. The ascendant is "which degree
 * of the ecliptic is currently rising" → Earth's rotation → UT.
 *
 * Getting this backwards is not subtle. 1 second of time = 15 arcsec of
 * rotation, and delta-T ≈ 64 s in year 2000, so passing TT to the ascendant
 * moves it by ~960 arcsec ≈ 0.267° — five times the ascendant's own error bar.
 *
 * ── Historical accuracy floor ────────────────────────────────────────────────
 *
 * delta-T uncertainty is ±3–10 s pre-1900.  That is ±1.6–5.5 arcsec of Moon
 * and ±0.25–2.7 arcmin of ascendant rotation.  No series extension can fix it.
 */

export const SECONDS_PER_DAY = 86400;
/** 1 s of Earth rotation = 15 arcsec of ecliptic longitude. */
export const ARCSEC_PER_SECOND_OF_ROTATION = 15;

export interface TimeScales {
  /** Julian Day in UT.  Use for: ascendant, MC, house cusps, panchang. */
  readonly jdUT: number;
  /** Julian Day in UT1 (≈ jdUT unless DUT1 supplied). */
  readonly jdUT1: number;
  /** Julian Day in TT.  Use for: every body position and the ayanamsa. */
  readonly jdTT: number;
  /** TT − UT1, seconds. */
  readonly deltaT: number;
  /** UTC − UT1, seconds. */
  readonly dut1: number;
}

/**
 * Decimal year from Julian Day (UT).
 * Used only as input to deltaTSeconds — not a calendar function.
 */
export function decimalYear(jdUT: number): number {
  const jd = jdUT + 0.5;
  const z  = Math.floor(jd);
  const f  = jd - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day   = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year  = month > 2 ? c - 4716 : c - 4715;
  const leap  = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return year + (day - 1) / (leap ? 366 : 365);
}

/**
 * delta-T in seconds.  Piecewise Espenak & Meeus, 1600–2150, with the
 * long-term parabola outside.  Accurate to a couple of seconds inside the
 * range; that is the honest historical limit, not a property of the fit.
 */
export function deltaTSeconds(year: number): number {
  const y = year;
  if (y < -500) { const u = (y - 1820) / 100; return -20 + 32 * u * u; }
  if (y < 1600) {
    const u = (y - 1000) / 100;
    return (
      1574.2 - 556.01 * u + 71.23472 * u ** 2 + 0.319781 * u ** 3 -
      0.8503463 * u ** 4 - 0.005050998 * u ** 5 + 0.0083572073 * u ** 6
    );
  }
  if (y < 1700) { const t = y - 1600; return 120 - 0.9808 * t - 0.01532 * t ** 2 + t ** 3 / 7129; }
  if (y < 1800) {
    const t = y - 1700;
    return 8.83 + 0.1603 * t - 0.0059285 * t ** 2 + 0.00013336 * t ** 3 - t ** 4 / 1174000;
  }
  if (y < 1860) {
    const t = y - 1800;
    return (
      13.72 - 0.332447 * t + 0.0068612 * t ** 2 + 0.0041116 * t ** 3 -
      0.00037436 * t ** 4 + 0.0000121272 * t ** 5 - 0.0000001699 * t ** 6 +
      0.000000000875 * t ** 7
    );
  }
  if (y < 1900) {
    const t = y - 1860;
    return 7.62 + 0.5737 * t - 0.251754 * t ** 2 + 0.01680668 * t ** 3 - 0.0004473624 * t ** 4 + t ** 5 / 233174;
  }
  if (y < 1920) {
    const t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
  }
  if (y < 1941) { const t = y - 1920; return 21.20 + 0.84493 * t - 0.07610 * t ** 2 + 0.0020936 * t ** 3; }
  if (y < 1961) { const t = y - 1950; return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547; }
  if (y < 1986) { const t = y - 1975; return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718; }
  if (y < 2005) {
    const t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  }
  if (y < 2050) { const t = y - 2000; return 62.92 + 0.32217 * t + 0.005589 * t ** 2; }
  if (y < 2150) { const u = (y - 1820) / 100; return -20 + 32 * u * u - 0.5628 * (2150 - y); }
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

export function jdTTFromUT(jdUT: number): number {
  return jdUT + deltaTSeconds(decimalYear(jdUT)) / SECONDS_PER_DAY;
}

/**
 * Compute both scales from a UT Julian Day.
 * @param dut1Seconds  UTC − UT1 (published by IERS, defaults to 0)
 */
export function timeScalesFromJD(jdUT: number, dut1Seconds = 0): TimeScales {
  assertJulianDay(jdUT, 'jdUT');
  const deltaT = deltaTSeconds(decimalYear(jdUT));
  const jdUT1  = jdUT + dut1Seconds / SECONDS_PER_DAY;
  return { jdUT, jdUT1, jdTT: jdUT1 + deltaT / SECONDS_PER_DAY, deltaT, dut1: dut1Seconds };
}

/**
 * How far the ascendant would move if TT were passed to a UT-only formula,
 * at the given UT Julian Day.  ~960 arcsec in 2000, ~0 near 1900.
 */
export function ascendantTrapArcsec(jdUT: number): number {
  return deltaTSeconds(decimalYear(jdUT)) * ARCSEC_PER_SECOND_OF_ROTATION;
}

/** Guard against Unix timestamps, MJD, or zero arriving where a JD is expected. */
export function assertJulianDay(jd: number, label: string): void {
  if (!Number.isFinite(jd) || jd < 1_000_000 || jd > 4_000_000) {
    throw new Error(
      `${label} is not a Julian Day: ${jd}. Did you pass a Unix timestamp or an MJD?`,
    );
  }
}
