/**
 * ============================================================
 * PANCHANG + MUHURTA — Domain Type Contracts
 * ============================================================
 *
 * Panchang (Sanskrit: "five limbs") is the traditional Vedic almanac
 * computed daily. The five limbs are:
 *   1. Tithi   — lunar day (1–30)
 *   2. Vara    — weekday (Sun–Sat)
 *   3. Nakshatra — Moon's current constellation
 *   4. Yoga    — Sun+Moon longitude sum divided into 27 parts
 *   5. Karana  — half-tithi (60 per lunar month)
 *
 * Additional elements:
 *   - Sunrise / Sunset / Moonrise / Moonset
 *   - Rahu Kalam    — inauspicious daily period
 *   - Gulika Kalam  — inauspicious daily period (son of Saturn)
 *   - Yamaganda     — inauspicious daily period
 *   - Abhijit Muhurta  — the most auspicious ~48-minute window each day
 *   - Brahma Muhurta   — pre-dawn auspicious period
 *
 * MUHURTA CALCULATION CONTRACT:
 *   Input  : MuhurtaQuery  (date, purpose, location)
 *   Engine :
 *     1. Compute Panchang for the date.
 *     2. Exclude Rahu Kalam, Gulika, Yamaganda from candidate windows.
 *     3. For the stated purpose, apply purpose-specific rules
 *        (e.g. marriage: avoid Ashlesha, Magha, Mula nakshatras;
 *              prefer 5th, 7th, 10th, 11th, 13th tithi; avoid 4th, 8th, 14th).
 *     4. Score remaining windows by:
 *           Nakshatra quality for the purpose (1–3)
 *         + Tithi quality for the purpose (1–3)
 *         + Vara quality for the purpose (1–3)
 *         + Whether Abhijit falls within the window (+1)
 *     5. Rank windows: 'excellent' (score ≥ 8), 'good' (5–7), 'acceptable' (3–4).
 *   Output : MuhurtaResult
 *
 * CALCULATION PRECISION:
 *   All time values must be in ISO 8601 UTC. The UI converts to local time.
 *   Sunrise/Sunset computed via ephemeris (not fixed approximations).
 *   Tithi end time = when Moon crosses the next 12° boundary from Sun.
 *
 * GEOGRAPHIC DEPENDENCY:
 *   Sunrise/Sunset, Rahu Kalam, and Abhijit Muhurta are location-specific.
 *   Latitude/longitude are mandatory; timezone for display conversion only.
 * ============================================================
 */

// ─── Panchang element types ───────────────────────────────────────────────────

/**
 * The 30 tithis of the lunar month.
 * Shukla Paksha (1–15 = waxing): Pratipada through Purnima.
 * Krishna Paksha (1–14 + Amavasya = waning): Pratipada through Amavasya.
 * In the data model, Krishna-paksha tithis are distinguished by the `paksha` field.
 */
export type TithiName =
  | 'Pratipada' | 'Dwitiya' | 'Tritiya' | 'Chaturthi' | 'Panchami'
  | 'Shashthi' | 'Saptami' | 'Ashtami' | 'Navami' | 'Dashami'
  | 'Ekadashi' | 'Dwadashi' | 'Trayodashi' | 'Chaturdashi'
  | 'Purnima' | 'Amavasya';

/** Lunar fortnight. */
export type Paksha = 'Shukla' | 'Krishna';

/** Full Tithi with its paksha context. */
export interface Tithi {
  name: TithiName;
  paksha: Paksha;
  /** Sequential number [1–30] across the lunar month for computation. */
  sequenceNumber: number;
  /** ISO UTC timestamp when this tithi ends. */
  endsAt: string;
  /**
   * Auspiciousness for general activity.
   * Auspicious (Bhadra): 2, 3, 5, 7, 10, 11, 13.
   * Inauspicious (Rikta): 4, 8, 14.
   * Moderate: all others.
   */
  auspiciousness: 'Auspicious' | 'Moderate' | 'Inauspicious';
}

/** The 7 weekdays. Each day is ruled by a planet affecting its character. */
export type VaraName =
  | 'Sunday'    // Ravivar  — Sun
  | 'Monday'    // Somavar  — Moon
  | 'Tuesday'   // Mangalvar — Mars
  | 'Wednesday' // Budhvar  — Mercury
  | 'Thursday'  // Guruvar  — Jupiter
  | 'Friday'    // Shukravar — Venus
  | 'Saturday'; // Shanivar  — Saturn

export interface Vara {
  name: VaraName;
  /** Ruling planet for this vara. */
  lord: string;
  /**
   * General auspiciousness for new works.
   * Sunday (moderate), Monday (good), Tuesday (avoid), Wednesday (good),
   * Thursday (excellent), Friday (good), Saturday (avoid).
   */
  auspiciousness: 'Excellent' | 'Good' | 'Moderate' | 'Avoid';
}

/** All 27 Vedic nakshatras. */
export type NakshatraName =
  | 'Ashwini' | 'Bharani' | 'Krittika' | 'Rohini' | 'Mrigashira'
  | 'Ardra' | 'Punarvasu' | 'Pushya' | 'Ashlesha' | 'Magha'
  | 'Purva Phalguni' | 'Uttara Phalguni' | 'Hasta' | 'Chitra' | 'Swati'
  | 'Vishakha' | 'Anuradha' | 'Jyeshtha' | 'Mula'
  | 'Purva Ashadha' | 'Uttara Ashadha' | 'Shravana' | 'Dhanishtha'
  | 'Shatabhisha' | 'Purva Bhadrapada' | 'Uttara Bhadrapada' | 'Revati';

export interface NakshatraInfo {
  name: NakshatraName;
  /** Sequential number [1–27]. */
  index: number;
  /** Ruling planet. */
  lord: string;
  /** Deity associated with this nakshatra. */
  deity: string;
  /** Symbol. */
  symbol: string;
  /** ISO UTC timestamp when the Moon exits this nakshatra. */
  endsAt: string;
  /** Nature: Deva (benefic), Manushya (mixed), Rakshasa (malefic). */
  nature: 'Deva' | 'Manushya' | 'Rakshasa';
}

/**
 * The 27 Yogas formed by (Sun longitude + Moon longitude) / (360/27).
 * Each yoga has a distinct character affecting quality of activities begun.
 */
export type YogaName =
  | 'Vishkambha' | 'Priti' | 'Ayushman' | 'Saubhagya' | 'Shobhana'
  | 'Atiganda' | 'Sukarma' | 'Dhriti' | 'Shoola' | 'Ganda'
  | 'Vriddhi' | 'Dhruva' | 'Vyaghata' | 'Harshana' | 'Vajra'
  | 'Siddhi' | 'Vyatipata' | 'Variyana' | 'Parigha' | 'Shiva'
  | 'Siddha' | 'Sadhya' | 'Shubha' | 'Shukla' | 'Brahma'
  | 'Indra' | 'Vaidhriti';

export interface Yoga {
  name: YogaName;
  /** Index [1–27]. */
  index: number;
  /** ISO UTC timestamp when this yoga ends. */
  endsAt: string;
  /**
   * Auspiciousness:
   *   Inauspicious (avoid): Vishkambha, Atiganda, Shoola, Ganda, Vyaghata,
   *                          Vajra, Vyatipata, Parigha, Vaidhriti.
   *   Auspicious: Priti, Ayushman, Saubhagya, Shobhana, Sukarma, Dhriti,
   *               Vriddhi, Dhruva, Siddhi, Siddha, Sadhya, Shubha, Shukla,
   *               Brahma, Indra, Harshana.
   *   Moderate: Variyana, Shiva.
   */
  auspiciousness: 'Auspicious' | 'Moderate' | 'Inauspicious';
}

/** The 11 Karanas (half-tithis). 7 are recurring; 4 are fixed (Vishti, Kimstughna, etc.). */
export type KaranaName =
  | 'Bava' | 'Balava' | 'Kaulava' | 'Taitila' | 'Garaja'
  | 'Vanija' | 'Vishti' | 'Bhadra'
  | 'Shakuni' | 'Chatushpada' | 'Naga' | 'Kimstughna';

export interface Karana {
  name: KaranaName;
  /** ISO UTC timestamp when this karana ends. */
  endsAt: string;
  /**
   * Vishti (Bhadra) Karana is considered inauspicious for most new work.
   * All others are moderately auspicious to auspicious.
   */
  isInauspicious: boolean;
}

// ─── Inauspicious daily periods ──────────────────────────────────────────────

/** A time window that should be avoided for new, auspicious activities. */
export interface InauspiciousPeriod {
  name: 'Rahu Kalam' | 'Gulika Kalam' | 'Yamaganda' | 'Dur Muhurta' | 'Varjyam';
  /** ISO UTC start timestamp. */
  start: string;
  /** ISO UTC end timestamp. */
  end: string;
  /**
   * What to avoid during this period.
   * Example: "Avoid beginning new work, travel, financial transactions."
   */
  avoidance: string;
}

// ─── Auspicious special periods ──────────────────────────────────────────────

/** An auspicious time window computed for the day. */
export interface AuspiciousPeriod {
  name: 'Abhijit Muhurta' | 'Brahma Muhurta' | 'Amrit Kalam' | 'Vijaya Muhurta';
  /** ISO UTC start timestamp. */
  start: string;
  /** ISO UTC end timestamp. */
  end: string;
  /** Brief description of the period's nature and best uses. */
  description: string;
}

// ─── Astronomical data ────────────────────────────────────────────────────────

/** Sunrise/Sunset/Moonrise/Moonset for the day at the given location. */
export interface AstronomicalEvents {
  /** ISO UTC timestamp of sunrise at the location. */
  sunrise: string;
  /** ISO UTC timestamp of sunset. */
  sunset: string;
  /** ISO UTC timestamp of moonrise. null if Moon does not rise on this date. */
  moonrise: string | null;
  /** ISO UTC timestamp of moonset. null if Moon does not set on this date. */
  moonset: string | null;
  /** Day length in minutes. */
  dayLengthMinutes: number;
}

// ─── Full daily Panchang ──────────────────────────────────────────────────────

/**
 * Complete Panchang for one calendar date at a given location.
 *
 * All timestamps are ISO 8601 UTC.
 * The UI layer is responsible for converting to local time for display.
 *
 * Guarantee: Every field is populated — the engine must not return
 * partial data. If a nakshatra spans midnight, two entries are present
 * (the ending one for early morning and the starting one for the rest).
 * For simplicity in v1, the nakshatra at solar noon is used as the
 * "primary" nakshatra for the day.
 */
export interface PanchangData {
  /** ISO date string (YYYY-MM-DD) in the LOCAL calendar at the location. */
  date: string;

  /** Geographic location used for computation. */
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
    placeName?: string;
  };

  tithi: Tithi;
  vara: Vara;
  nakshatra: NakshatraInfo;
  yoga: Yoga;
  karana: Karana;

  /** Astronomical events for the day. */
  astronomical: AstronomicalEvents;

  /** All inauspicious periods for the day. */
  inauspiciousPeriods: InauspiciousPeriod[];

  /** Auspicious special periods (Abhijit, Brahma Muhurta, etc.). */
  auspiciousPeriods: AuspiciousPeriod[];

  /**
   * Chandrashtama (Moon in 8th from natal Moon) warning.
   * Only populated if natalMoonRashi is supplied to the engine.
   */
  chandrashtama?: {
    isActive: boolean;
    /** Moon's current rashi (0=Aries … 11=Pisces). */
    moonRashi: number;
  };

  /**
   * Shaka Samvat year and month (Indian national calendar).
   * Informational only.
   */
  shakaDate?: {
    year: number;
    month: string;
    day: number;
  };

  /** Vikram Samvat year. */
  vikramYear?: number;

  /** ISO timestamp when this Panchang was computed. */
  computedAt: string;
}

// ─── Muhurta ──────────────────────────────────────────────────────────────────

/** The activity for which a Muhurta is sought. */
export type MuhurtaPurpose =
  | 'marriage'          // Vivah Muhurta — strictest rules
  | 'grihapravesh'      // House entry — avoid Saturn days, etc.
  | 'travel'            // Journey — avoid Bhadra, Ashtami
  | 'business'          // Business start — prefer Thursday, Wednesday
  | 'naming'            // Namakarana — avoid Rikta tithis
  | 'thread-ceremony'   // Upanayana
  | 'purchase'          // Vehicle/property purchase
  | 'medical'           // Surgery or treatment start
  | 'general';          // Generic new work

/** Input to the Muhurta finder. */
export interface MuhurtaQuery {
  /** The date (or date range start) to search for Muhurta. Format: YYYY-MM-DD. */
  date: string;

  /**
   * Search the next N days if no excellent window is found on `date`.
   * Default: 1 (single-day search).
   */
  searchDays?: number;

  purpose: MuhurtaPurpose;

  latitude: number;
  longitude: number;
  timezone: string;

  /**
   * Optional: natal Moon rashi of the primary person (0=Aries..11=Pisces).
   * When provided, Chandrashtama days are excluded.
   */
  natalMoonRashi?: number;
}

/** Quality levels for a Muhurta window. */
export type MuhurtaQuality = 'Excellent' | 'Good' | 'Acceptable';

/** One auspicious time window for the stated purpose. */
export interface MuhurtaWindow {
  /** ISO UTC start of the window. */
  start: string;

  /** ISO UTC end of the window. */
  end: string;

  quality: MuhurtaQuality;

  /** Duration in minutes. */
  durationMinutes: number;

  /**
   * Factors that make this window auspicious for the stated purpose.
   * Each reason should be a concrete astrological statement.
   * Example: "Pushya nakshatra — universally auspicious", "5th tithi — Bhadra"
   */
  auspiciousReasons: string[];

  /**
   * Minor cautions even within this window (if any).
   * Example: "Avoid the last 10 minutes — Rahu Kalam begins."
   */
  caveats?: string[];

  /** Panchang elements in effect during this window. */
  panchangSnapshot: {
    nakshatra: NakshatraName;
    tithi: TithiName;
    vara: VaraName;
    yoga: YogaName;
    karana: KaranaName;
  };
}

/** An inauspicious period found during the Muhurta search. */
export interface InauspiciousWindow {
  /** ISO UTC start. */
  start: string;
  /** ISO UTC end. */
  end: string;
  /** Why this window is inauspicious for the stated purpose. */
  reason: string;
}

/** Full Muhurta search result. */
export interface MuhurtaResult {
  query: MuhurtaQuery;

  /**
   * Auspicious windows found, sorted by quality (Excellent first)
   * then by start time within the same quality level.
   */
  auspiciousWindows: MuhurtaWindow[];

  /** Inauspicious windows in the searched period (for display). */
  inauspiciousWindows: InauspiciousWindow[];

  /**
   * The single best window recommended for immediate display.
   * null if no window with at least 'Acceptable' quality was found.
   */
  bestWindow: MuhurtaWindow | null;

  /**
   * Human-readable recommendation (English).
   * E.g. "The best window on 16 Aug is 10:48–11:32 — Pushya nakshatra
   * with 5th tithi. Avoid 07:30–09:00 (Rahu Kalam)."
   */
  recommendationEn: string;

  /** Hindi recommendation. */
  recommendationHi: string;

  /** ISO timestamp when this result was computed. */
  computedAt: string;
}
