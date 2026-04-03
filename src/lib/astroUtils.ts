/**
 * Week 0: Core Utility Functions
 * Pure mathematical and formatting utilities used across all services
 */

import {
  RASHI_NAMES_EN, RASHI_NAMES_HI, RASHI_LORDS,
  NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI, NAKSHATRA_LORDS, NAKSHATRA_SPAN,
  PLANET_EXALTATION, PLANET_DEBILITATION, PLANET_OWN_SIGNS, PLANET_MOOLATRIKONA,
  J2000, JULIAN_CENTURY, DEFAULT_TIMEZONE,
} from '../constants/astrology';
import type { PlanetName, RashiIndex, Dignity, NakshatraIndex, Pada } from '../types/astrology';

// ─── Degree Utilities ─────────────────────────────────────────────────────────

/** Normalize degrees to 0-360 range */
export function normDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Normalize degrees to -180 to +180 range */
export function normDeg180(deg: number): number {
  const d = normDeg(deg);
  return d > 180 ? d - 360 : d;
}

/** Convert degrees to radians */
export const D2R = Math.PI / 180;
/** Convert radians to degrees */
export const R2D = 180 / Math.PI;

/** Get rashi index (0-11) from sidereal longitude */
export function lonToRashi(lon: number): RashiIndex {
  return Math.floor(normDeg(lon) / 30) as RashiIndex;
}

/** Get degrees within rashi (0-30) */
export function lonToRashiDeg(lon: number): number {
  return normDeg(lon) % 30;
}

/** Get nakshatra index (0-26) from sidereal longitude */
export function lonToNakshatra(lon: number): NakshatraIndex {
  return Math.floor(normDeg(lon) / NAKSHATRA_SPAN) as NakshatraIndex;
}

/** Get pada (1-4) from sidereal longitude */
export function lonToPada(lon: number): Pada {
  const posInNak = normDeg(lon) % NAKSHATRA_SPAN;
  return (Math.floor(posInNak / (NAKSHATRA_SPAN / 4)) + 1) as Pada;
}

/** Format degrees as D°M'S" */
export function formatDMS(deg: number): string {
  const d = Math.floor(Math.abs(deg));
  const m = Math.floor((Math.abs(deg) - d) * 60);
  const s = Math.floor(((Math.abs(deg) - d) * 60 - m) * 60);
  return `${d}°${m}'${s}"`;
}

/** Format degrees as D°M' (no seconds) */
export function formatDM(deg: number): string {
  const d = Math.floor(Math.abs(deg));
  const m = Math.floor((Math.abs(deg) - d) * 60);
  return `${d}°${m}'`;
}

/** Format planet position as "Rashi D°M'" */
export function formatPosition(rashiIndex: number, degrees: number, lang: 'en' | 'hi' = 'en'): string {
  const name = lang === 'hi' ? RASHI_NAMES_HI[rashiIndex] : RASHI_NAMES_EN[rashiIndex];
  return `${name} ${formatDM(degrees)}`;
}

// ─── Julian Day ───────────────────────────────────────────────────────────────

/**
 * Convert date/time to Julian Day Number
 * @param dateStr YYYY-MM-DD
 * @param timeStr HH:MM (local time)
 * @param tzOffset UTC offset in hours (default 5.5 for IST)
 */
export function toJD(dateStr: string, timeStr = '12:00', tzOffset = DEFAULT_TIMEZONE): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h) || isNaN(min)) return NaN;
  // Convert to UT
  const utHours = h + min / 60 - tzOffset;
  let year = y, month = m, day = d + utHours / 24;
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

/** Julian centuries from J2000.0 */
export function jdToT(jd: number): number {
  return (jd - J2000) / JULIAN_CENTURY;
}

/** Convert JD back to date string */
export function jdToDate(jd: number): string {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let A = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  const hours = f * 24;
  const h = Math.floor(hours);
  const mins = Math.floor((hours - h) * 60);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── Ayanamsa ─────────────────────────────────────────────────────────────────

/**
 * Lahiri Ayanamsa (IAU 1956 Chitrapaksha)
 * Most accurate formula for Vedic astrology
 */
export function getLahiriAyanamsa(jd: number): number {
  const T = jdToT(jd);
  return 23.85472 + 0.013960 * T * 100 - 0.000308 * T * T;
}

/** Convert tropical longitude to sidereal (Lahiri) */
export function tropToSid(tropDeg: number, jd: number): number {
  return normDeg(tropDeg - getLahiriAyanamsa(jd));
}

// ─── Dignity ──────────────────────────────────────────────────────────────────

export function getPlanetDignity(planet: PlanetName, rashiIndex: RashiIndex): Dignity {
  if (PLANET_EXALTATION[planet] === rashiIndex) return 'Exalted';
  if (PLANET_DEBILITATION[planet] === rashiIndex) return 'Debilitated';
  const ownSigns = PLANET_OWN_SIGNS[planet];
  if (ownSigns?.includes(rashiIndex)) {
    return PLANET_MOOLATRIKONA[planet] === rashiIndex ? 'Moolatrikona' : 'Own Sign';
  }
  return 'Neutral';
}

// ─── Rashi / Nakshatra Lookups ────────────────────────────────────────────────

export function getRashiName(index: number, lang: 'en' | 'hi' = 'en'): string {
  return lang === 'hi' ? RASHI_NAMES_HI[index] ?? '' : RASHI_NAMES_EN[index] ?? '';
}

export function getRashiLord(index: number): PlanetName {
  return RASHI_LORDS[index] ?? 'Sun';
}

export function getNakshatraName(index: number, lang: 'en' | 'hi' = 'en'): string {
  return lang === 'hi' ? NAKSHATRA_NAMES_HI[index] ?? '' : NAKSHATRA_NAMES_EN[index] ?? '';
}

export function getNakshatraLord(index: number): PlanetName {
  return NAKSHATRA_LORDS[index] ?? 'Ketu';
}

// ─── House Calculation ────────────────────────────────────────────────────────

/** Get house number (1-12) of a planet from ascendant (equal house) */
export function getHouseFromAsc(planetSidLon: number, ascSidLon: number): number {
  const diff = normDeg(planetSidLon - ascSidLon);
  return Math.floor(diff / 30) + 1;
}

/** Get house number (1-12) of a planet from Moon (for transit) */
export function getHouseFromMoon(planetSidLon: number, moonSidLon: number): number {
  return getHouseFromAsc(planetSidLon, moonSidLon);
}

// ─── Date Utilities ───────────────────────────────────────────────────────────

/** Parse "City (lat, lon)" location string */
export function parseLocation(location: string): { lat: number; lon: number } {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) {
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  }
  return { lat: 23.0, lon: 79.0 }; // Central India default
}

/** Add years to a date string */
export function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCFullYear(d.getUTCFullYear() + Math.floor(years));
  const remainingDays = (years % 1) * 365.25;
  d.setUTCDate(d.getUTCDate() + Math.floor(remainingDays));
  return d.toISOString().split('T')[0];
}

/** Add days to a date string */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/** Format date for display */
export function formatDate(dateStr: string, lang: 'en' | 'hi' = 'en'): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/** Get age from birth date */
export function getAge(birthDate: string): number {
  const birth = new Date(birthDate + 'T00:00:00Z');
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

// ─── Number Utilities ─────────────────────────────────────────────────────────

/** Reduce number to single digit (numerology) */
export function reduceToSingleDigit(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n; // master numbers
  while (n > 9) {
    n = n.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    if (n === 11 || n === 22 || n === 33) return n;
  }
  return n;
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Round to N decimal places */
export function round(n: number, decimals = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
