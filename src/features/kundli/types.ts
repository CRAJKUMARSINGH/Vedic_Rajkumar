/**
 * Core domain types for the Kundli (Birth Chart) feature.
 *
 * These are the contracts that the UI, calculation engine, and data layer
 * all agree on.  Week 4 will provide implementations that populate these shapes.
 */

// ─── Input ────────────────────────────────────────────────────────────────────

export interface BirthData {
  /** Full name of the native */
  name: string;
  /** ISO date string — YYYY-MM-DD */
  date: string;
  /** Local time string — HH:MM (24 h) */
  time: string;
  /** IANA timezone, e.g. "Asia/Kolkata" */
  timezone: string;
  /** Latitude in decimal degrees (+N / -S) */
  latitude: number;
  /** Longitude in decimal degrees (+E / -W) */
  longitude: number;
  /** Human-readable place name */
  place: string;
}

// ─── Calculated output ────────────────────────────────────────────────────────

export type Planet =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter'
  | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu' | 'Ascendant';

export type Sign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface PlanetPosition {
  planet: Planet;
  /** Tropical longitude in degrees (0–360) */
  tropicalLongitude: number;
  /** Sidereal longitude after ayanamsa subtraction */
  siderealLongitude: number;
  /** Zodiac sign the planet occupies */
  sign: Sign;
  /** Degree within the sign (0–30) */
  degreeInSign: number;
  /** House number (1–12) */
  house: number;
  /** Whether the planet is in retrograde motion */
  isRetrograde: boolean;
  /** Nakshatra (1–27) */
  nakshatra: number;
  /** Nakshatra lord */
  nakshatraLord: Planet;
}

export interface HouseCusp {
  /** House number (1–12) */
  house: number;
  /** Sidereal longitude of the cusp */
  longitude: number;
  sign: Sign;
}

export type AyanamsaType = 'lahiri' | 'raman' | 'krishnamurti' | 'yukteshwar';
export type HouseSystem = 'placidus' | 'whole-sign' | 'equal' | 'koch';

export interface ChartResult {
  birthData: BirthData;
  /** Ayanamsa used for sidereal conversion */
  ayanamsa: AyanamsaType;
  /** Ayanamsa value in degrees at the time of birth */
  ayanamsaValue: number;
  houseSystem: HouseSystem;
  planets: PlanetPosition[];
  houses: HouseCusp[];
  /** Julian Day Number for the birth moment */
  julianDay: number;
  /** ISO timestamp when this chart was calculated */
  calculatedAt: string;
}

// ─── Dasha ────────────────────────────────────────────────────────────────────

export interface DashaPeriod {
  planet: Planet;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  subPeriods?: DashaPeriod[];
}
