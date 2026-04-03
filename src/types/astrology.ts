/**
 * Week 0: Central Astrology Type Definitions
 * Single source of truth for all astrological data structures
 */

// ─── Fundamental Types ────────────────────────────────────────────────────────

export type RashiIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type NakshatraIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26;
export type Pada = 1 | 2 | 3 | 4;
export type Language = 'en' | 'hi';
export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'mr' | 'gu' | 'ta' | 'te' | 'ml' | 'kn';

export type PlanetName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Rahu' | 'Ketu';
export type Dignity = 'Exalted' | 'Moolatrikona' | 'Own Sign' | 'Friend Sign' | 'Neutral' | 'Enemy Sign' | 'Debilitated';
export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Quality = 'Cardinal' | 'Fixed' | 'Mutable';
export type Dosha = 'Vata' | 'Pitta' | 'Kapha';
export type AyanamsaSystem = 'Lahiri' | 'Raman' | 'KP' | 'Fagan-Bradley' | 'True Chitrapaksha';
export type HouseSystem = 'Equal' | 'Placidus' | 'Koch' | 'Whole Sign' | 'Campanus';

// ─── Bilingual String ─────────────────────────────────────────────────────────

export interface BilingualString {
  en: string;
  hi: string;
}

// ─── Coordinates ──────────────────────────────────────────────────────────────

export interface GeoCoordinates {
  lat: number;   // -90 to 90
  lon: number;   // -180 to 180
  altitude?: number; // meters above sea level
  timezone?: number; // UTC offset in hours (e.g. 5.5 for IST)
  city?: string;
  country?: string;
}

// ─── Birth Data ───────────────────────────────────────────────────────────────

export interface BirthData {
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM (24h, local time)
  location: string;   // "City (lat, lon)" format
  name?: string;
  gender?: 'M' | 'F' | 'Other';
  timezone?: number;  // UTC offset hours
}

export interface ParsedBirthData extends BirthData {
  lat: number;
  lon: number;
  julianDay: number;
  ayanamsa: number;
}

// ─── Planet Position ──────────────────────────────────────────────────────────

export interface PlanetPosition {
  name: PlanetName;
  rashiIndex: RashiIndex;
  rashiName: string;
  rashiNameHi?: string;
  degrees: number;        // 0-30 within rashi
  minutes: number;        // 0-60
  seconds?: number;       // 0-60
  totalDegrees: number;   // 0-360 sidereal longitude
  house: HouseNumber;
  dignity: Dignity;
  isRetrograde: boolean;
  isCombust?: boolean;
  speed?: number;         // degrees/day
  nakshatra?: string;
  nakshatraPada?: Pada;
}

// ─── Ascendant ────────────────────────────────────────────────────────────────

export interface AscendantInfo {
  rashiIndex: RashiIndex;
  rashiName: string;
  rashiNameHi?: string;
  degrees: number;
  minutes: number;
  totalDegrees: number;   // 0-360 sidereal
  lord: PlanetName;
}

// ─── House ────────────────────────────────────────────────────────────────────

export interface HouseInfo {
  number: HouseNumber;
  rashiIndex: RashiIndex;
  rashiName: string;
  degrees: number;
  lord: PlanetName;
  planets: PlanetName[];
  significance: BilingualString;
}

// ─── Nakshatra ────────────────────────────────────────────────────────────────

export interface NakshatraInfo {
  index: NakshatraIndex;
  name: BilingualString;
  pada: Pada;
  lord: PlanetName;
  deity: string;
  symbol: string;
  degrees: number;        // degrees within nakshatra (0-13.33)
  startDegree: number;    // sidereal start degree
  endDegree: number;      // sidereal end degree
  characteristics: BilingualString;
  favorable: string[];
  unfavorable: string[];
}

// ─── Birth Chart ──────────────────────────────────────────────────────────────

export interface BirthChart {
  birthData: ParsedBirthData;
  ascendant: AscendantInfo;
  planets: PlanetPosition[];
  houses: HouseInfo[];
  nakshatra: NakshatraInfo;
  moonRashiIndex: RashiIndex;
  sunRashiIndex: RashiIndex;
  ayanamsa: number;
  ayanamsaSystem: AyanamsaSystem;
  houseSystem: HouseSystem;
  julianDay: number;
}

// ─── Dasha ────────────────────────────────────────────────────────────────────

export interface DashaPeriod {
  planet: PlanetName;
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  durationYears: number;
  isActive: boolean;
  antardasha?: DashaPeriod[];
}

export interface DashaInfo {
  mahadasha: DashaPeriod;
  antardasha: DashaPeriod;
  pratyantardasha?: DashaPeriod;
  allMahadashas: DashaPeriod[];
  balanceDasha: { planet: PlanetName; years: number; months: number; days: number };
}

// ─── Yoga ─────────────────────────────────────────────────────────────────────

export interface Yoga {
  name: string;
  nameHi?: string;
  type: 'Raja' | 'Dhana' | 'Pancha Mahapurusha' | 'Neecha Bhanga' | 'Viparita Raja' | 'Dosha' | 'Other';
  strength: 'Strong' | 'Moderate' | 'Weak';
  planets: PlanetName[];
  houses: HouseNumber[];
  effect: BilingualString;
  remedy?: string;
}

// ─── Transit ──────────────────────────────────────────────────────────────────

export interface TransitEffect {
  planet: PlanetName;
  fromRashi: RashiIndex;
  toRashi: RashiIndex;
  natalMoonRashi: RashiIndex;
  houseFromMoon: HouseNumber;
  effect: 'Favorable' | 'Unfavorable' | 'Mixed' | 'Neutral';
  score: number;          // -10 to +10
  description: BilingualString;
  duration: string;
  vedhaBy?: PlanetName;   // planet causing vedha (obstruction)
}

// ─── Compatibility ────────────────────────────────────────────────────────────

export interface CompatibilityScore {
  category: string;
  score: number;
  maxScore: number;
  description: BilingualString;
  isDosha: boolean;
}

export interface CompatibilityReport {
  totalScore: number;
  maxScore: 36;
  percentage: number;
  grade: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';
  categories: CompatibilityScore[];
  doshas: string[];
  remedies: BilingualString[];
  recommendation: BilingualString;
}

// ─── Remedy ───────────────────────────────────────────────────────────────────

export interface Remedy {
  type: 'Gemstone' | 'Mantra' | 'Yantra' | 'Rudraksha' | 'Puja' | 'Fasting' | 'Charity' | 'Color' | 'Number';
  name: string;
  nameHi?: string;
  planet: PlanetName;
  description: BilingualString;
  procedure?: string;
  timing?: string;
  caution?: string;
}

// ─── Panchang ─────────────────────────────────────────────────────────────────

export interface PanchangData {
  date: string;
  tithi: { number: number; name: string; paksha: 'Shukla' | 'Krishna'; endTime?: string };
  nakshatra: { name: string; lord: PlanetName; endTime?: string };
  yoga: { number: number; name: string; endTime?: string };
  karana: { number: number; name: string };
  vara: { name: string; lord: PlanetName };
  sunrise: string;
  sunset: string;
  moonrise?: string;
  moonset?: string;
  rahuKaal?: string;
  gulikaKaal?: string;
  yamaghantaKaal?: string;
  abhijitMuhurta?: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  version: string;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  birthData: BirthData;
  savedCharts: BirthData[];
  preferences: {
    language: SupportedLanguage;
    ayanamsa: AyanamsaSystem;
    houseSystem: HouseSystem;
    darkMode: boolean;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
