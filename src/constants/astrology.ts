/**
 * Week 0: Central Astrology Constants
 * Single source of truth for all astrological constants
 * Used across all services — never hardcode these values elsewhere
 */

import type { PlanetName, RashiIndex, Element, Quality, Dosha } from '../types/astrology';

// ─── Rashi (Zodiac Signs) ─────────────────────────────────────────────────────

export const RASHI_NAMES_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const RASHI_NAMES_HI = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन',
] as const;

export const RASHI_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'] as const;

export const RASHI_LORDS: PlanetName[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

export const RASHI_ELEMENTS: Element[] = [
  'Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth',
  'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water',
];

export const RASHI_QUALITIES: Quality[] = [
  'Cardinal', 'Fixed', 'Mutable', 'Cardinal', 'Fixed', 'Mutable',
  'Cardinal', 'Fixed', 'Mutable', 'Cardinal', 'Fixed', 'Mutable',
];

export const RASHI_DOSHAS: Dosha[] = [
  'Pitta', 'Kapha', 'Vata', 'Kapha', 'Pitta', 'Vata',
  'Vata', 'Kapha', 'Pitta', 'Vata', 'Vata', 'Kapha',
];

// ─── Planets ──────────────────────────────────────────────────────────────────

export const PLANET_NAMES: PlanetName[] = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu',
];

export const PLANET_NAMES_HI: Record<PlanetName, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mercury: 'बुध', Venus: 'शुक्र',
  Mars: 'मंगल', Jupiter: 'बृहस्पति', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

export const PLANET_SYMBOLS: Record<PlanetName, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

export const PLANET_COLORS: Record<PlanetName, string> = {
  Sun: '#FF6B35', Moon: '#C0C0C0', Mercury: '#4CAF50', Venus: '#E91E63',
  Mars: '#F44336', Jupiter: '#FF9800', Saturn: '#607D8B', Rahu: '#9C27B0', Ketu: '#795548',
};

export const PLANET_DAYS: Record<PlanetName, string> = {
  Sun: 'Sunday', Moon: 'Monday', Mars: 'Tuesday', Mercury: 'Wednesday',
  Jupiter: 'Thursday', Venus: 'Friday', Saturn: 'Saturday', Rahu: 'Saturday', Ketu: 'Tuesday',
};

// Dignity tables
export const PLANET_EXALTATION: Partial<Record<PlanetName, RashiIndex>> = {
  Sun: 0, Moon: 1, Mercury: 5, Venus: 11, Mars: 9, Jupiter: 3, Saturn: 6,
};

export const PLANET_DEBILITATION: Partial<Record<PlanetName, RashiIndex>> = {
  Sun: 6, Moon: 7, Mercury: 11, Venus: 5, Mars: 3, Jupiter: 9, Saturn: 0,
};

export const PLANET_OWN_SIGNS: Partial<Record<PlanetName, RashiIndex[]>> = {
  Sun: [4], Moon: [3], Mercury: [2, 5], Venus: [1, 6],
  Mars: [0, 7], Jupiter: [8, 11], Saturn: [9, 10],
};

export const PLANET_MOOLATRIKONA: Partial<Record<PlanetName, RashiIndex>> = {
  Sun: 4, Moon: 1, Mercury: 5, Venus: 6, Mars: 0, Jupiter: 8, Saturn: 10,
};

export const PLANET_FRIENDS: Partial<Record<PlanetName, PlanetName[]>> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mercury: ['Sun', 'Venus'],
  Venus: ['Mercury', 'Saturn'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Saturn: ['Mercury', 'Venus'],
  Rahu: ['Venus', 'Saturn'],
  Ketu: ['Mars', 'Venus'],
};

export const PLANET_ENEMIES: Partial<Record<PlanetName, PlanetName[]>> = {
  Sun: ['Venus', 'Saturn'],
  Moon: ['Rahu', 'Ketu'],
  Mercury: ['Moon'],
  Venus: ['Sun', 'Moon'],
  Mars: ['Mercury'],
  Jupiter: ['Mercury', 'Venus'],
  Saturn: ['Sun', 'Moon', 'Mars'],
  Rahu: ['Sun', 'Moon'],
  Ketu: ['Sun', 'Moon'],
};

// Vimshottari Dasha periods (years)
export const VIMSHOTTARI_PERIODS: Record<PlanetName, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

// Dasha order
export const VIMSHOTTARI_ORDER: PlanetName[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

// ─── Nakshatras ───────────────────────────────────────────────────────────────

export const NAKSHATRA_NAMES_EN = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
] as const;

export const NAKSHATRA_NAMES_HI = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा',
  'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्व फाल्गुनी', 'उत्तर फाल्गुनी',
  'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा',
  'शतभिषा', 'पूर्व भाद्रपद', 'उत्तर भाद्रपद', 'रेवती',
] as const;

export const NAKSHATRA_LORDS: PlanetName[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
  'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
  'Jupiter', 'Saturn', 'Mercury',
];

export const NAKSHATRA_SPAN = 360 / 27; // 13.333...°
export const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3.333...°

// ─── Houses ───────────────────────────────────────────────────────────────────

export const HOUSE_NAMES_EN = [
  'Lagna (Self)', 'Dhana (Wealth)', 'Sahaja (Siblings)', 'Sukha (Home)',
  'Putra (Children)', 'Ripu (Enemies)', 'Kalatra (Marriage)', 'Mrityu (Transformation)',
  'Dharma (Fortune)', 'Karma (Career)', 'Labha (Gains)', 'Vyaya (Losses)',
];

export const HOUSE_NAMES_HI = [
  'लग्न (स्वयं)', 'धन (संपत्ति)', 'सहज (भाई-बहन)', 'सुख (घर)',
  'पुत्र (संतान)', 'रिपु (शत्रु)', 'कलत्र (विवाह)', 'मृत्यु (परिवर्तन)',
  'धर्म (भाग्य)', 'कर्म (करियर)', 'लाभ (आय)', 'व्यय (हानि)',
];

export const KENDRA_HOUSES = [1, 4, 7, 10] as const;
export const TRIKONA_HOUSES = [1, 5, 9] as const;
export const DUSTHANA_HOUSES = [6, 8, 12] as const;
export const UPACHAYA_HOUSES = [3, 6, 10, 11] as const;
export const MARAKA_HOUSES = [2, 7] as const;

// ─── Ayanamsa Values (at J2000.0) ────────────────────────────────────────────

export const AYANAMSA_VALUES = {
  Lahiri: 23.85472,
  Raman: 22.46,
  KP: 23.86,
  'Fagan-Bradley': 24.04,
  'True Chitrapaksha': 23.85,
} as const;

export const AYANAMSA_ANNUAL_RATE = 0.013960; // degrees per year (precession)

// ─── Astronomical Constants ───────────────────────────────────────────────────

export const J2000 = 2451545.0;           // Julian Day for J2000.0 epoch
export const JULIAN_CENTURY = 36525.0;    // days per Julian century
export const TROPICAL_YEAR = 365.24219;   // days
export const SIDEREAL_YEAR = 365.25636;   // days
export const SYNODIC_MONTH = 29.53059;    // days
export const SIDEREAL_MONTH = 27.32166;   // days

// ─── Vedic Astrology Specific ─────────────────────────────────────────────────

// Sade Sati: Saturn transiting 12th, 1st, 2nd from natal Moon
export const SADE_SATI_HOUSES = [-1, 0, 1] as const; // relative to natal Moon

// Kaal Sarp Yoga: all planets between Rahu and Ketu
export const KAAL_SARP_TYPES = [
  'Anant', 'Kulik', 'Vasuki', 'Shankhpal', 'Padma', 'Mahapadma',
  'Takshak', 'Karkotak', 'Shankhachur', 'Ghatak', 'Vishdhar', 'Sheshnag',
] as const;

// Manglik Dosha houses
export const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12] as const;

// Benefic planets (natural)
export const NATURAL_BENEFICS: PlanetName[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
// Malefic planets (natural)
export const NATURAL_MALEFICS: PlanetName[] = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

// ─── App Constants ────────────────────────────────────────────────────────────

export const APP_NAME = 'Gochar Phal';
export const APP_NAME_HI = 'गोचर फल';
export const APP_TAGLINE = 'Vedic Astrology Platform';
export const APP_TAGLINE_HI = 'वैदिक ज्योतिष मंच';
export const APP_VERSION = '2.0.0';
export const APP_URL = 'https://gochar-phal.vercel.app';

export const DEFAULT_TIMEZONE = 5.5; // IST
export const DEFAULT_LAT = 23.0;     // Central India
export const DEFAULT_LON = 79.0;

export const DEBOUNCE_MS = 300;
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_SAVED_READINGS = 50;
