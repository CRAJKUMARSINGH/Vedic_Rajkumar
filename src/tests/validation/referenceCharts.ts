/**
 * src/tests/validation/referenceCharts.ts
 *
 * Week 1 — Reference Chart Pool (15 charts)
 * Week 2 — Extended validation with house cusps and additional dasha checks
 *
 * Expected values are generated from vedicAstroEngine.ts (Schlyter orbital
 * mechanics — the validated production engine used throughout the app).
 * Cross-checked against AstroSage / JHora where possible.
 *
 * Tolerance policy (see ACCURACY_VALIDATION_SPEC.md):
 *   Rashi:            exact match
 *   Planet degree:    ±1.0°
 *   Nakshatra:        exact match
 *   Pada:             exact match (borderline ±1 acceptable)
 *   Ayanamsa:         ±0.05°
 *   Dasha balance:    ±15 days (Schlyter engine ±1° Moon → ~27 days)
 *   House cusp degree: ±2.0° (Week 2)
 *   Antardasha timing: ±5 days (Week 2)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type RashiName =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type PlanetaryPositions = {
  sun:     RashiName;
  moon:    RashiName;
  mercury: RashiName;
  venus:   RashiName;
  mars:    RashiName;
  jupiter: RashiName;
  saturn:  RashiName;
  rahu:    RashiName;
  ketu:    RashiName;
};

export interface ReferenceChart {
  id: string;
  name: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM local
  tzOffset: number;   // UTC offset hours
  lat: number;
  lon: number;
  place: string;
  source: string;
  timeUncertain?: boolean;

  expected: {
    ayanamsa:          number;
    ayanamsaTolerance?: number;
    ascendant:         RashiName;
    planets:           PlanetaryPositions;
    planetDegrees?:    Partial<Record<keyof PlanetaryPositions, number>>;
    moonNakshatra:     string;
    moonPada:          1 | 2 | 3 | 4;
    dashaSeedLord:     string;
    dashaBalanceDays?: number;
    // Week 2 extensions
    houseCusps?:        Array<{ house: number; rashi: RashiName }>;
    firstAntardasha?:  { lord: string };
  };
}

// ─── Reference Chart Pool ─────────────────────────────────────────────────────

export const REFERENCE_CHARTS: ReferenceChart[] = [

  // ── 1. Priyansh Singh Chauhan ─────────────────────────────────────────────
  // Engine output: Asc=Cancer Sun=Libra Moon=Virgo Merc=Libra Ven=Scorpio
  //   Mars=Virgo Jup=Taurus Sat=Taurus Rahu=Gemini Ketu=Sagittarius
  //   Moon Hasta pada 3, dasha=Moon balance=2.63yrs=960d
  // Week 2: House cusps and antardasha data added
  {
    id: 'REF-001',
    name: 'Priyansh Singh Chauhan',
    date: '2000-10-26',
    time: '00:50',
    tzOffset: 5.5,
    lat: 22.72,
    lon: 75.86,
    place: 'Indore, Madhya Pradesh, India',
    source: 'vedicAstroEngine (Schlyter) — cross-checked AstroSage',
    expected: {
      ayanamsa: 23.866,
      ascendant: 'Cancer',
      planets: {
        sun:     'Libra',
        moon:    'Virgo',
        mercury: 'Libra',
        venus:   'Scorpio',
        mars:    'Virgo',
        jupiter: 'Taurus',
        saturn:  'Taurus',
        rahu:    'Gemini',
        ketu:    'Sagittarius',
      },
      moonNakshatra: 'Hasta',
      moonPada: 3,
      dashaSeedLord: 'Moon',
      dashaBalanceDays: 960,  // 2.63 yrs
      // Week 2 extensions
      houseCusps: [
        { house: 1, rashi: 'Cancer' },
        { house: 4, rashi: 'Libra' },
        { house: 7, rashi: 'Capricorn' },
        { house: 10, rashi: 'Aries' },
      ],
      firstAntardasha: {
        lord: 'Moon',
      },
    },
  },

  // ── 2. Swami Vivekananda ──────────────────────────────────────────────────
  // Asc=Sagittarius Sun=Sagittarius Moon=Virgo Hasta pada 3 Moon dasha
  // Week 2: House cusps and antardasha data added
  {
    id: 'REF-002',
    name: 'Swami Vivekananda',
    date: '1863-01-12',
    time: '06:12',
    tzOffset: 5.5,
    lat: 22.57,
    lon: 88.36,
    place: 'Kolkata, West Bengal, India',
    source: 'vedicAstroEngine (Schlyter) — cross-checked JHora',
    expected: {
      ayanamsa: 21.941,
      ayanamsaTolerance: 0.1,
      ascendant: 'Sagittarius',
      planets: {
        sun:     'Sagittarius',
        moon:    'Virgo',
        mercury: 'Capricorn',
        venus:   'Capricorn',
        mars:    'Aries',
        jupiter: 'Libra',
        saturn:  'Virgo',
        rahu:    'Scorpio',
        ketu:    'Taurus',
      },
      moonNakshatra: 'Hasta',
      moonPada: 3,
      dashaSeedLord: 'Moon',
      // Week 2 extensions
      houseCusps: [
        { house: 1, rashi: 'Sagittarius' },
        { house: 4, rashi: 'Pisces' },
        { house: 7, rashi: 'Gemini' },
        { house: 10, rashi: 'Virgo' },
      ],
      firstAntardasha: {
        lord: 'Moon',
      },
    },
  },

  // ── 3. Mahatma Gandhi ────────────────────────────────────────────────────
  // Asc=Virgo Sun=Virgo Moon=Cancer Ashlesha pada 4 Mercury dasha
  // Week 2: House cusps and antardasha data added
  {
    id: 'REF-003',
    name: 'Mahatma Gandhi',
    date: '1869-10-02',
    time: '07:20',
    tzOffset: 5.5,
    lat: 21.64,
    lon: 69.61,
    place: 'Porbandar, Gujarat, India',
    source: 'vedicAstroEngine (Schlyter) — cross-checked JHora',
    expected: {
      ayanamsa: 22.035,
      ayanamsaTolerance: 0.1,
      ascendant: 'Virgo',
      planets: {
        sun:     'Virgo',
        moon:    'Cancer',
        mercury: 'Libra',
        venus:   'Libra',
        mars:    'Libra',
        jupiter: 'Aries',
        saturn:  'Scorpio',
        rahu:    'Cancer',
        ketu:    'Capricorn',
      },
      moonNakshatra: 'Ashlesha',
      moonPada: 4,
      dashaSeedLord: 'Mercury',
      // Week 2 extensions
      houseCusps: [
        { house: 1, rashi: 'Virgo' },
        { house: 4, rashi: 'Sagittarius' },
        { house: 7, rashi: 'Pisces' },
        { house: 10, rashi: 'Gemini' },
      ],
      firstAntardasha: {
        lord: 'Mercury',
      },
    },
  },

  // ── 4. Albert Einstein ────────────────────────────────────────────────────
  // Asc=Gemini Sun=Pisces Moon=Scorpio Jyeshtha pada 2 Mercury dasha
  {
    id: 'REF-004',
    name: 'Albert Einstein',
    date: '1879-03-14',
    time: '11:30',
    tzOffset: 0.67,  // Ulm LMT
    lat: 48.40,
    lon: 9.99,
    place: 'Ulm, Baden-Württemberg, Germany',
    source: 'vedicAstroEngine (Schlyter)',
    expected: {
      ayanamsa: 22.167,
      ayanamsaTolerance: 0.1,
      ascendant: 'Gemini',
      planets: {
        sun:     'Pisces',
        moon:    'Scorpio',
        mercury: 'Pisces',
        venus:   'Pisces',
        mars:    'Capricorn',
        jupiter: 'Aquarius',
        saturn:  'Pisces',
        rahu:    'Capricorn',
        ketu:    'Cancer',
      },
      moonNakshatra: 'Jyeshtha',
      moonPada: 2,
      dashaSeedLord: 'Mercury',
    },
  },

  // ── 5. Narendra Modi ──────────────────────────────────────────────────────
  // Asc=Leo Sun=Virgo Moon=Scorpio Anuradha pada 1 Saturn dasha
  {
    id: 'REF-005',
    name: 'Narendra Modi',
    date: '1950-09-17',
    time: '06:15',
    tzOffset: 5.5,
    lat: 23.78,
    lon: 72.64,
    place: 'Vadnagar, Gujarat, India',
    source: 'vedicAstroEngine (Schlyter) — cross-checked AstroSage',
    expected: {
      ayanamsa: 23.166,
      ascendant: 'Leo',
      planets: {
        sun:     'Virgo',
        moon:    'Scorpio',
        mercury: 'Virgo',
        venus:   'Leo',
        mars:    'Scorpio',
        jupiter: 'Aquarius',
        saturn:  'Leo',
        rahu:    'Pisces',
        ketu:    'Virgo',
      },
      moonNakshatra: 'Anuradha',
      moonPada: 1,
      dashaSeedLord: 'Saturn',
    },
  },

  // ── 6. Rajkumar (App Owner) ───────────────────────────────────────────────
  // Asc=Leo Sun=Leo Moon=Cancer Ashlesha pada 3 Mercury dasha
  // Week 2: House cusps and antardasha data added
  {
    id: 'REF-006',
    name: 'Rajkumar',
    date: '1963-09-15',
    time: '06:00',
    tzOffset: 5.5,
    lat: 23.84,
    lon: 73.71,
    place: 'Nandli (Aspur), Rajasthan, India',
    source: 'Family record + vedicAstroEngine cross-check',
    expected: {
      ayanamsa: 23.348,
      ascendant: 'Leo',
      planets: {
        sun:     'Leo',
        moon:    'Cancer',
        mercury: 'Virgo',
        venus:   'Virgo',
        mars:    'Libra',
        jupiter: 'Pisces',
        saturn:  'Capricorn',
        rahu:    'Gemini',
        ketu:    'Sagittarius',
      },
      moonNakshatra: 'Ashlesha',
      moonPada: 3,
      dashaSeedLord: 'Mercury',
      // Week 2 extensions
      houseCusps: [
        { house: 1, rashi: 'Leo' },
        { house: 4, rashi: 'Scorpio' },
        { house: 7, rashi: 'Aquarius' },
        { house: 10, rashi: 'Taurus' },
      ],
      firstAntardasha: {
        lord: 'Mercury',
      },
    },
  },

  // ── 7. Jawaharlal Nehru ───────────────────────────────────────────────────
  // Asc=Cancer Sun=Scorpio Moon=Cancer Ashlesha pada 1 Mercury dasha
  {
    id: 'REF-007',
    name: 'Jawaharlal Nehru',
    date: '1889-11-14',
    time: '23:00',
    tzOffset: 5.5,
    lat: 25.44,
    lon: 81.84,
    place: 'Allahabad, Uttar Pradesh, India',
    source: 'vedicAstroEngine (Schlyter) — cross-checked JHora',
    expected: {
      ayanamsa: 22.316,
      ayanamsaTolerance: 0.1,
      ascendant: 'Cancer',
      planets: {
        sun:     'Scorpio',
        moon:    'Cancer',
        mercury: 'Libra',
        venus:   'Libra',
        mars:    'Virgo',
        jupiter: 'Sagittarius',
        saturn:  'Leo',
        rahu:    'Gemini',
        ketu:    'Sagittarius',
      },
      moonNakshatra: 'Ashlesha',
      moonPada: 1,
      dashaSeedLord: 'Mercury',
    },
  },

  // ── 8. Indira Gandhi ──────────────────────────────────────────────────────
  // Asc=Cancer Sun=Scorpio Moon=Capricorn Uttara Ashadha pada 3 Sun dasha
  {
    id: 'REF-008',
    name: 'Indira Gandhi',
    date: '1917-11-19',
    time: '23:03',
    tzOffset: 5.5,
    lat: 25.44,
    lon: 81.84,
    place: 'Allahabad, Uttar Pradesh, India',
    source: 'vedicAstroEngine (Schlyter)',
    expected: {
      ayanamsa: 22.707,
      ayanamsaTolerance: 0.1,
      ascendant: 'Cancer',
      planets: {
        sun:     'Scorpio',
        moon:    'Capricorn',
        mercury: 'Scorpio',
        venus:   'Sagittarius',
        mars:    'Leo',
        jupiter: 'Taurus',
        saturn:  'Cancer',
        rahu:    'Sagittarius',
        ketu:    'Gemini',
      },
      moonNakshatra: 'Uttara Ashadha',
      moonPada: 3,
      dashaSeedLord: 'Sun',
    },
  },

  // ── 9. Sachin Tendulkar ───────────────────────────────────────────────────
  // Asc=Libra Sun=Aries Moon=Sagittarius Uttara Ashadha pada 1 Sun dasha
  // Week 2: House cusps and antardasha data added
  {
    id: 'REF-009',
    name: 'Sachin Tendulkar',
    date: '1973-04-24',
    time: '18:17',
    tzOffset: 5.5,
    lat: 19.07,
    lon: 72.88,
    place: 'Mumbai, Maharashtra, India',
    source: 'vedicAstroEngine (Schlyter) — cross-checked AstroSage',
    expected: {
      ayanamsa: 23.482,
      ascendant: 'Libra',
      planets: {
        sun:     'Aries',
        moon:    'Sagittarius',
        mercury: 'Pisces',
        venus:   'Aries',
        mars:    'Capricorn',
        jupiter: 'Capricorn',
        saturn:  'Taurus',
        rahu:    'Sagittarius',
        ketu:    'Gemini',
      },
      moonNakshatra: 'Uttara Ashadha',
      moonPada: 1,
      dashaSeedLord: 'Sun',
      // Week 2 extensions
      houseCusps: [
        { house: 1, rashi: 'Libra' },
        { house: 4, rashi: 'Capricorn' },
        { house: 7, rashi: 'Aries' },
        { house: 10, rashi: 'Cancer' },
      ],
      firstAntardasha: {
        lord: 'Sun',
      },
    },
  },

  // ── 10. Lata Mangeshkar ───────────────────────────────────────────────────
  // Asc=Gemini Sun=Virgo Moon=Cancer Ashlesha pada 1 Mercury dasha
  {
    id: 'REF-010',
    name: 'Lata Mangeshkar',
    date: '1929-09-28',
    time: '22:47',
    tzOffset: 5.5,
    lat: 22.72,
    lon: 75.86,
    place: 'Indore, Madhya Pradesh, India',
    source: 'vedicAstroEngine (Schlyter)',
    timeUncertain: true,
    expected: {
      ayanamsa: 22.873,
      ayanamsaTolerance: 0.1,
      ascendant: 'Gemini',
      planets: {
        sun:     'Virgo',
        moon:    'Cancer',
        mercury: 'Virgo',
        venus:   'Leo',
        mars:    'Libra',
        jupiter: 'Taurus',
        saturn:  'Sagittarius',
        rahu:    'Aries',
        ketu:    'Libra',
      },
      moonNakshatra: 'Ashlesha',
      moonPada: 1,
      dashaSeedLord: 'Mercury',
    },
  },

  // ── 11. Amitabh Bachchan ──────────────────────────────────────────────────
  // Asc=Aquarius Sun=Virgo Moon=Libra Swati pada 2 Rahu dasha
  {
    id: 'REF-011',
    name: 'Amitabh Bachchan',
    date: '1942-10-11',
    time: '16:00',
    tzOffset: 5.5,
    lat: 25.44,
    lon: 81.84,
    place: 'Allahabad, Uttar Pradesh, India',
    source: 'vedicAstroEngine (Schlyter) — cross-checked AstroSage',
    expected: {
      ayanamsa: 23.055,
      ayanamsaTolerance: 0.1,
      ascendant: 'Aquarius',
      planets: {
        sun:     'Virgo',
        moon:    'Libra',
        mercury: 'Virgo',
        venus:   'Virgo',
        mars:    'Virgo',
        jupiter: 'Cancer',
        saturn:  'Taurus',
        rahu:    'Leo',
        ketu:    'Aquarius',
      },
      moonNakshatra: 'Swati',
      moonPada: 2,
      dashaSeedLord: 'Rahu',
    },
  },

  // ── 12. Atal Bihari Vajpayee ──────────────────────────────────────────────
  // Asc=Libra Sun=Sagittarius Moon=Scorpio Jyeshtha pada 2 Mercury dasha
  {
    id: 'REF-012',
    name: 'Atal Bihari Vajpayee',
    date: '1924-12-25',
    time: '03:30',
    tzOffset: 5.5,
    lat: 26.21,
    lon: 78.18,
    place: 'Gwalior, Madhya Pradesh, India',
    source: 'vedicAstroEngine (Schlyter)',
    expected: {
      ayanamsa: 22.807,
      ayanamsaTolerance: 0.1,
      ascendant: 'Libra',
      planets: {
        sun:     'Sagittarius',
        moon:    'Scorpio',
        mercury: 'Sagittarius',
        venus:   'Scorpio',
        mars:    'Pisces',
        jupiter: 'Sagittarius',
        saturn:  'Libra',
        rahu:    'Cancer',
        ketu:    'Capricorn',
      },
      moonNakshatra: 'Jyeshtha',
      moonPada: 2,
      dashaSeedLord: 'Mercury',
    },
  },

  // ── 13. Veerpratap Singh Rathore ─────────────────────────────────────────
  // Verified fix case. Asc=Virgo Moon=Taurus Krittika pada 2 Sun dasha
  // Week 2: House cusps and antardasha data added
  {
    id: 'REF-013',
    name: 'Veerpratap Singh Rathore',
    date: '2011-09-18',
    time: '06:58',
    tzOffset: 5.5,
    lat: 23.52,
    lon: 77.81,
    place: 'Vidisha, Madhya Pradesh, India',
    source: 'User-verified + vedicAstroEngine cross-check',
    expected: {
      ayanamsa: 24.019,
      ascendant: 'Virgo',
      planets: {
        sun:     'Virgo',
        moon:    'Taurus',
        mercury: 'Leo',
        venus:   'Virgo',
        mars:    'Cancer',
        jupiter: 'Aries',
        saturn:  'Virgo',
        rahu:    'Scorpio',
        ketu:    'Taurus',
      },
      moonNakshatra: 'Krittika',
      moonPada: 2,
      dashaSeedLord: 'Sun',
      dashaBalanceDays: 1205,  // 3.30 yrs
      // Week 2 extensions
      houseCusps: [
        { house: 1, rashi: 'Virgo' },
        { house: 4, rashi: 'Sagittarius' },
        { house: 7, rashi: 'Pisces' },
        { house: 10, rashi: 'Gemini' },
      ],
      firstAntardasha: {
        lord: 'Sun',
      },
    },
  },

  // ── 14. Vishwaraj Singh Chauhan ───────────────────────────────────────────
  // Asc=Cancer Sun=Virgo Moon=Taurus Rohini pada 2 Moon dasha
  {
    id: 'REF-014',
    name: 'Vishwaraj Singh Chauhan',
    date: '1994-09-26',
    time: '02:17',
    tzOffset: 5.5,
    lat: 22.72,
    lon: 75.86,
    place: 'Indore, Madhya Pradesh, India',
    source: 'Family record + vedicAstroEngine cross-check',
    expected: {
      ayanamsa: 23.781,
      ascendant: 'Cancer',
      planets: {
        sun:     'Virgo',
        moon:    'Taurus',
        mercury: 'Libra',
        venus:   'Libra',
        mars:    'Cancer',
        jupiter: 'Libra',
        saturn:  'Aquarius',
        rahu:    'Libra',
        ketu:    'Aries',
      },
      moonNakshatra: 'Rohini',
      moonPada: 2,
      dashaSeedLord: 'Moon',
    },
  },

  // ── 15. Mummy (Rajkumar's mother) ────────────────────────────────────────
  // Asc=Leo Sun=Leo Moon=Aries Ashwini pada 3 Ketu dasha
  {
    id: 'REF-015',
    name: 'Mummy (Rajkumar mother)',
    date: '1947-09-05',
    time: '05:00',
    tzOffset: 5.5,
    lat: 23.55,
    lon: 74.08,
    place: 'Nandli, Rajasthan, India',
    source: 'Family record + vedicAstroEngine cross-check',
    expected: {
      ayanamsa: 23.124,
      ayanamsaTolerance: 0.1,
      ascendant: 'Leo',
      planets: {
        sun:     'Leo',
        moon:    'Aries',
        mercury: 'Leo',
        venus:   'Leo',
        mars:    'Gemini',
        jupiter: 'Libra',
        saturn:  'Cancer',
        rahu:    'Taurus',
        ketu:    'Scorpio',
      },
      moonNakshatra: 'Ashwini',
      moonPada: 3,
      dashaSeedLord: 'Ketu',
    },
  },
];
