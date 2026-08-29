/**
 * ============================================================
 * KUNDLI (BIRTH CHART) — Domain Type Contracts
 * ============================================================
 *
 * These interfaces define the agreed-upon data shapes between:
 *   - The UI layer  (src/pages/HoroscopePage.tsx, chart components)
 *   - The calc engine  (src/features/kundli/stubs.ts → Week 4 real impl)
 *   - The data layer  (Supabase saved_charts table — Week 5)
 *
 * CALCULATION CONTRACT (implemented in Week 4):
 *   Input  : BirthData
 *   Output : ChartResult  (planets + houses + meta)
 *
 * DASHA CONTRACT:
 *   Input  : ChartResult  (Moon's nakshatra is used as seed)
 *   Output : DashaPeriod[]  (Vimshottari — 120-year cycle, recursive)
 *
 * AYANAMSA CHOICE (documented decision):
 *   Default: 'lahiri'  — NC Lahiri / Government of India standard.
 *   Rationale: Widest acceptance among Indian practitioners; matches
 *   Jagannatha Hora and Astro.com (Lahiri) for cross-validation.
 *   Other options exposed for advanced users.
 *
 * HOUSE SYSTEM CHOICE (documented decision):
 *   Default: 'whole-sign'  — each rashi occupies exactly one house.
 *   Rationale: Traditional BPHS standard; simpler to implement correctly
 *   than Placidus at extreme latitudes.
 *   Placidus available for KP / Western cross-check.
 *
 * TOLERANCE (for test validation — Week 4):
 *   Planetary longitudes must match Jagannatha Hora / Astro.com within
 *   1 arcminute (0.0167°) for the supplied test birth data.
 * ============================================================
 */

// ─── Input ────────────────────────────────────────────────────────────────────

/**
 * Minimum information required to cast a birth chart.
 * All fields are mandatory — the engine has no defaults.
 */
export interface BirthData {
  /** Full name of the native — used only for display, not calculation. */
  name: string;

  /**
   * ISO date string in the local calendar at the place of birth.
   * Format: YYYY-MM-DD  (e.g. "1963-09-15")
   * NOTE: This is the LOCAL calendar date, not UTC.
   */
  date: string;

  /**
   * Local clock time at the place of birth.
   * Format: HH:MM  (24-hour, e.g. "06:00")
   * The engine will combine `date + time + timezone` → UTC Julian Day.
   */
  time: string;

  /**
   * IANA timezone identifier for the birth location.
   * Examples: "Asia/Kolkata", "America/New_York"
   * Used to convert local time → UTC before ephemeris lookup.
   */
  timezone: string;

  /** Geographic latitude in decimal degrees. North = positive, South = negative. */
  latitude: number;

  /** Geographic longitude in decimal degrees. East = positive, West = negative. */
  longitude: number;

  /** Human-readable place name — display only, not used in calculation. */
  place: string;
}

// ─── Planetary output ─────────────────────────────────────────────────────────

/**
 * The ten primary Vedic Jyotish significators.
 * Rahu and Ketu are the mean lunar nodes (not true nodes by default).
 * Ascendant is included so all 10 fit a uniform PlanetPosition shape.
 */
export type Planet =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu'
  | 'Ascendant';

/** The 12 zodiac signs in tropical/sidereal order. */
export type Sign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

/** The 27 Vedic nakshatras in order (1–27). */
export type Nakshatra =
  | 'Ashwini' | 'Bharani' | 'Krittika' | 'Rohini' | 'Mrigashira'
  | 'Ardra' | 'Punarvasu' | 'Pushya' | 'Ashlesha' | 'Magha'
  | 'Purva Phalguni' | 'Uttara Phalguni' | 'Hasta' | 'Chitra' | 'Swati'
  | 'Vishakha' | 'Anuradha' | 'Jyeshtha' | 'Mula'
  | 'Purva Ashadha' | 'Uttara Ashadha' | 'Shravana' | 'Dhanishtha'
  | 'Shatabhisha' | 'Purva Bhadrapada' | 'Uttara Bhadrapada' | 'Revati';

/** The four padas (quarters) of a nakshatra. */
export type Pada = 1 | 2 | 3 | 4;

/**
 * Calculated position of one planet in the chart.
 * All longitudes are post-ayanamsa (sidereal) unless noted.
 */
export interface PlanetPosition {
  planet: Planet;

  /**
   * Tropical (sayana) longitude in degrees [0, 360).
   * = raw ephemeris output BEFORE ayanamsa subtraction.
   */
  tropicalLongitude: number;

  /**
   * Sidereal (nirayana) longitude in degrees [0, 360).
   * = tropicalLongitude − ayanamsaValue (mod 360).
   * This is the primary value used for house/sign placement.
   */
  siderealLongitude: number;

  /** Zodiac sign derived from siderealLongitude. */
  sign: Sign;

  /** Degree position within the sign: [0, 30). */
  degreeInSign: number;

  /**
   * House number [1–12] assigned by the chosen house system.
   * For whole-sign: house = rashi number counted from lagna rashi.
   */
  house: number;

  /**
   * True if the planet has negative apparent motion at the birth moment.
   * Rahu/Ketu are always retrograde by convention (mean nodes move backward).
   */
  isRetrograde: boolean;

  /**
   * Nakshatra number [1–27] based on sidereal longitude.
   * Formula: Math.floor(siderealLongitude / (360/27)) + 1
   */
  nakshatraIndex: number;

  /** Nakshatra name resolved from nakshatraIndex. */
  nakshatra: Nakshatra;

  /** Lord of the nakshatra — used for Vimshottari Dasha seed. */
  nakshatraLord: Planet;

  /** Pada [1–4] within the nakshatra. */
  pada: Pada;

  /**
   * Navamsha sign (D9) — sign the planet occupies in the 9th harmonic.
   * Required for matchmaking D9 analysis.
   */
  navamshaSign: Sign;
}

// ─── House output ─────────────────────────────────────────────────────────────

/**
 * The cusp data for one house.
 * For whole-sign, each cusp = start of the rashi.
 */
export interface HouseCusp {
  /** House number [1–12]. */
  house: number;

  /**
   * Sidereal longitude of the house cusp in degrees [0, 360).
   * For whole-sign this equals (lagnaSign index × 30).
   */
  longitude: number;

  /** Sign occupying this house. */
  sign: Sign;

  /**
   * Lord of this house sign.
   * Derived from the standard Vedic lordship table:
   *   Aries/Scorpio → Mars, Taurus/Libra → Venus, etc.
   */
  lord: Planet;
}

// ─── Calculation options ──────────────────────────────────────────────────────

/** Supported ayanamsa systems. */
export type AyanamsaType = 'lahiri' | 'raman' | 'krishnamurti' | 'yukteshwar';

/** Supported house systems. */
export type HouseSystem = 'whole-sign' | 'placidus' | 'equal' | 'koch';

// ─── Full chart result ────────────────────────────────────────────────────────

/**
 * Complete result returned by the calculation engine for one birth chart.
 *
 * Guarantee: The `planets` array always contains exactly 10 entries —
 * one for each member of the `Planet` union type — in the order:
 *   Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, Ascendant.
 *
 * Guarantee: The `houses` array always contains exactly 12 entries,
 *   houses[i].house === i + 1 for i in [0, 11].
 */
export interface ChartResult {
  /** The input data used to produce this chart. */
  birthData: BirthData;

  /** Ayanamsa system used. Default: 'lahiri'. */
  ayanamsa: AyanamsaType;

  /**
   * Numeric value of the ayanamsa at the birth Julian Day.
   * Subtracted from tropical longitudes to obtain sidereal longitudes.
   * Example for Lahiri 1963-09-15: ≈ 23.32°
   */
  ayanamsaValue: number;

  /** House system used. Default: 'whole-sign'. */
  houseSystem: HouseSystem;

  /**
   * All 10 planetary positions in sidereal coordinates.
   * Ordered: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, Ascendant.
   */
  planets: PlanetPosition[];

  /** All 12 house cusps. */
  houses: HouseCusp[];

  /**
   * Julian Day Number (TT scale) for the birth moment.
   * Used as the primary key for ephemeris calculations.
   * Example: 1963-09-15 06:00 IST → JD ≈ 2438291.47
   */
  julianDay: number;

  /** ISO 8601 UTC timestamp when this chart was computed. */
  calculatedAt: string;
}

// ─── Dasha ────────────────────────────────────────────────────────────────────

/**
 * One period in the Vimshottari Dasha system.
 *
 * The system is structured as three levels:
 *   Mahadasha  (major period, ~6–20 years depending on planet)
 *   └─ Antardasha  (sub-period)
 *      └─ Pratyantardasha  (sub-sub-period, optional for Week 4)
 *
 * The seed for the system is the Moon's nakshatra at birth and the
 * balance of that period remaining (calculated from the Moon's exact
 * degree within the nakshatra).
 *
 * Planet dasha years (standard):
 *   Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19,
 *   Mercury 17, Ketu 7, Venus 20  (total = 120 years).
 */
export interface DashaPeriod {
  /** Planet ruling this period. */
  planet: Planet;

  /** ISO date string (YYYY-MM-DD) when this period starts. */
  startDate: string;

  /** ISO date string (YYYY-MM-DD) when this period ends. */
  endDate: string;

  /**
   * Sub-periods (Antardashas) within this period.
   * Present on Mahadasha entries; each Antardasha may in turn have
   * its own subPeriods (Pratyantardashas).
   * Omitted on the deepest level to avoid infinite nesting.
   */
  subPeriods?: DashaPeriod[];
}

/**
 * Complete Vimshottari Dasha sequence for a chart.
 * `periods` covers the full 120-year cycle starting from the first
 * Mahadasha at birth (which may be a partial period).
 */
export interface DashaResult {
  /** ChartResult this dasha was derived from. */
  birthData: BirthData;

  /** Moon's nakshatra at birth — the dasha seed. */
  moonNakshatra: Nakshatra;

  /** Balance of the birth Mahadasha remaining at the exact birth time. */
  birthDashaBalance: {
    planet: Planet;
    yearsRemaining: number;
  };

  /**
   * Full 120-year sequence of Mahadashas, each containing its
   * Antardashas in `subPeriods`.
   */
  periods: DashaPeriod[];
}
