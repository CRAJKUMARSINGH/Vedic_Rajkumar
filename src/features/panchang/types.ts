/**
 * Core domain types for the Panchang and Muhurta feature.
 */

export type Tithi =
  | 'Pratipada' | 'Dwitiya' | 'Tritiya' | 'Chaturthi' | 'Panchami'
  | 'Shashthi' | 'Saptami' | 'Ashtami' | 'Navami' | 'Dashami'
  | 'Ekadashi' | 'Dwadashi' | 'Trayodashi' | 'Chaturdashi'
  | 'Purnima' | 'Amavasya';

export type Vara =
  | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday'
  | 'Thursday' | 'Friday' | 'Saturday';

export type Nakshatra =
  | 'Ashwini' | 'Bharani' | 'Krittika' | 'Rohini' | 'Mrigashira'
  | 'Ardra' | 'Punarvasu' | 'Pushya' | 'Ashlesha' | 'Magha'
  | 'Purva Phalguni' | 'Uttara Phalguni' | 'Hasta' | 'Chitra'
  | 'Swati' | 'Vishakha' | 'Anuradha' | 'Jyeshtha' | 'Moola'
  | 'Purva Ashadha' | 'Uttara Ashadha' | 'Shravana' | 'Dhanishtha'
  | 'Shatabhisha' | 'Purva Bhadrapada' | 'Uttara Bhadrapada' | 'Revati';

export type Yoga =
  | 'Vishkambha' | 'Priti' | 'Ayushman' | 'Saubhagya' | 'Shobhana'
  | 'Atiganda' | 'Sukarma' | 'Dhriti' | 'Shoola' | 'Ganda'
  | 'Vriddhi' | 'Dhruva' | 'Vyaghata' | 'Harshana' | 'Vajra'
  | 'Siddhi' | 'Vyatipata' | 'Variyana' | 'Parigha' | 'Shiva'
  | 'Siddha' | 'Sadhya' | 'Shubha' | 'Shukla' | 'Brahma'
  | 'Indra' | 'Vaidhriti';

export type Karana =
  | 'Bava' | 'Balava' | 'Kaulava' | 'Taitila' | 'Garaja'
  | 'Vanija' | 'Vishti' | 'Bhadra' | 'Shakuni' | 'Chatushpada'
  | 'Naga' | 'Kimstughna';

export interface PanchangData {
  /** ISO date */
  date: string;
  tithi: Tithi;
  /** Tithi end time (ISO timestamp) */
  tithiEnd: string;
  vara: Vara;
  nakshatra: Nakshatra;
  /** Nakshatra end time (ISO timestamp) */
  nakshatraEnd: string;
  yoga: Yoga;
  karana: Karana;
  /** Sunrise (ISO timestamp) */
  sunrise: string;
  /** Sunset (ISO timestamp) */
  sunset: string;
  /** Moonrise (ISO timestamp) */
  moonrise?: string;
  /** Moonset (ISO timestamp) */
  moonset?: string;
  /** Rahu Kalam start/end (ISO timestamps) */
  rahuKalam: { start: string; end: string };
  /** Gulika Kalam start/end */
  gulikaKalam: { start: string; end: string };
  /** Yamaganda start/end */
  yamaganda: { start: string; end: string };
}

export interface MuhurtaQuery {
  /** ISO date to find muhurta within */
  date: string;
  /** Purpose of the muhurta */
  purpose: 'marriage' | 'travel' | 'business' | 'grihapravesh' | 'naming' | 'general';
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface MuhurtaResult {
  query: MuhurtaQuery;
  /** List of auspicious windows, sorted by quality */
  auspiciousWindows: Array<{
    start: string;
    end: string;
    quality: 'excellent' | 'good' | 'acceptable';
    reasons: string[];
  }>;
  inauspiciousWindows: Array<{
    start: string;
    end: string;
    reason: string;
  }>;
}
