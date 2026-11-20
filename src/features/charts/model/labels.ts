/**
 * labels.ts — bilingual presentation labels & number formatting for the
 * Parashar-style chart engine (c4 Phases 1, 4, 8).
 *
 * Pure presentation data only. No astrological calculation lives here —
 * longitudes, signs and houses always arrive already computed from the
 * canonical services (ephemerisService / divisionalChartsService / dashaService).
 */

export type Lang = 'en' | 'hi';

export interface BilingualText {
  en: string;
  hi: string;
}

/** Twelve rashi names. Index 0 = Aries … 11 = Pisces (sidereal, Lahiri). */
export const RASHI_NAMES: readonly BilingualText[] = [
  { en: 'Aries', hi: 'मेष' },
  { en: 'Taurus', hi: 'वृषभ' },
  { en: 'Gemini', hi: 'मिथुन' },
  { en: 'Cancer', hi: 'कर्क' },
  { en: 'Leo', hi: 'सिंह' },
  { en: 'Virgo', hi: 'कन्या' },
  { en: 'Libra', hi: 'तुला' },
  { en: 'Scorpio', hi: 'वृश्चिक' },
  { en: 'Sagittarius', hi: 'धनु' },
  { en: 'Capricorn', hi: 'मकर' },
  { en: 'Aquarius', hi: 'कुम्भ' },
  { en: 'Pisces', hi: 'मीन' },
];

/** Graha names keyed by the canonical English planet name used across services. */
export const PLANET_NAMES: Record<string, BilingualText> = {
  Sun: { en: 'Sun', hi: 'सूर्य' },
  Moon: { en: 'Moon', hi: 'चन्द्र' },
  Mars: { en: 'Mars', hi: 'मंगल' },
  Mercury: { en: 'Mercury', hi: 'बुध' },
  Jupiter: { en: 'Jupiter', hi: 'गुरु' },
  Venus: { en: 'Venus', hi: 'शुक्र' },
  Saturn: { en: 'Saturn', hi: 'शनि' },
  Rahu: { en: 'Rahu', hi: 'राहु' },
  Ketu: { en: 'Ketu', hi: 'केतु' },
};

/** Short labels for compact chart cells (English + Devanagari). */
export const PLANET_ABBR: Record<string, BilingualText> = {
  Sun: { en: 'Su', hi: 'सू' },
  Moon: { en: 'Mo', hi: 'चं' },
  Mars: { en: 'Ma', hi: 'मं' },
  Mercury: { en: 'Me', hi: 'बु' },
  Jupiter: { en: 'Ju', hi: 'गु' },
  Venus: { en: 'Ve', hi: 'शु' },
  Saturn: { en: 'Sa', hi: 'श' },
  Rahu: { en: 'Ra', hi: 'रा' },
  Ketu: { en: 'Ke', hi: 'के' },
};

/** Deterministic display order of the grahas (classical Sun-first order). */
export const PLANET_ORDER: readonly string[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
];

/** Stable sort index for a planet key; unknown keys sort last (alphabetical). */
export function planetOrderIndex(name: string): number {
  const i = PLANET_ORDER.indexOf(name);
  return i === -1 ? PLANET_ORDER.length + 1 : i;
}

export function label(text: BilingualText | null | undefined, lang: Lang): string {
  if (!text) return '';
  return lang === 'hi' ? text.hi : text.en;
}

export function planetName(name: string, lang: Lang): string {
  return label(PLANET_NAMES[name], lang) || name;
}

export function planetAbbr(name: string, lang: Lang): string {
  return label(PLANET_ABBR[name], lang) || name.slice(0, 2);
}

export function rashiName(sign: number | null | undefined, lang: Lang): string {
  if (sign === null || sign === undefined) return '';
  const entry = RASHI_NAMES[sign];
  return entry ? label(entry, lang) : '';
}

export interface Dms {
  degrees: number;
  minutes: number;
  /** e.g. "12°34'" */
  text: string;
}

/** Degrees-in-sign → degrees + minutes projection. Returns null when unavailable. */
export function toDms(value: number | null | undefined): Dms | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutes = Math.floor((abs - degrees) * 60);
  return { degrees, minutes, text: `${degrees}°${String(minutes).padStart(2, '0')}'` };
}

/**
 * Format a degrees-in-sign value with configurable decimal precision.
 * precision 0 → whole degrees; precision >= 1 → fixed decimals.
 */
export function formatDegrees(
  value: number | null | undefined,
  precision = 2,
): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const p = Math.max(0, Math.min(6, Math.trunc(precision)));
  return `${value.toFixed(p)}°`;
}
