/**
 * ============================================================
 * PRASNA KERNEL — TIMELINE (Prasnalove.txt §5.2)
 * ============================================================
 *
 * Prasna Marga Ch. V §54 (Gulika), Ch. X §109 (Pramana Gulika) and
 * Ch. XIV §143 (effects of Gulika).
 *
 * The four defects this module fixes (see Prasnalove.txt §3.4):
 *   1. sunrise is taken from the ephemeris for the querent's latitude /
 *      longitude — never a hard-coded 6:00;
 *   2. the Vedic weekday is counted from local sunrise, not midnight;
 *   3. Gulika uses the classical 1/8 day/night part table;
 *   4. Mandi/Gulika longitude is the sidereal ascendant rising at the
 *      start (configurable) of the Gulika part — NOT Lagna + 7.
 * ============================================================
 */

import { calculateSunriseSunset, getTimezoneOffsetMinutes } from '@/utils/panchangAstronomy';
import { calculateJulianDay } from '@/services/ephemerisService';
import { calculateAscendantFromJD } from '@/services/ascendantService';

const norm360 = (x: number): number => ((x % 360) + 360) % 360;
const mod7 = (n: number): number => ((n % 7) + 7) % 7;

/**
 * Saturn's 1/8 portion of the DAY (indexed by Vedic weekday, Sun=0 … Sat=6).
 * e.g. Sunday → 7th part; Monday → 6th; … Saturday → 1st.
 */
export const DAY_GULIKA_PART: readonly number[] = [7, 6, 5, 4, 3, 2, 1];

/**
 * Saturn's 1/8 portion of the NIGHT. The night's eight parts begin from
 * the lord of the 5th weekday from the day lord. Indexed by the same
 * Vedic weekday.
 */
export const NIGHT_GULIKA_PART: readonly number[] = [3, 2, 1, 7, 6, 5, 4];

export interface GulikaWindow {
  start: Date;
  end: Date;
  isDay: boolean;
}

/**
 * Vedic weekday (0=Sun … 6=Sat) for moment `t`, given the civil weekday of
 * the local calendar day and that day's sunrise. Before sunrise the Vedic
 * day is still the previous civil day.
 */
export function vedicWeekday(t: Date, sunrise: Date, civilWeekday: number): number {
  return t.getTime() < sunrise.getTime() ? mod7(civilWeekday - 1) : mod7(civilWeekday);
}

/**
 * The Gulika (Saturn) window within one day-or-night segment.
 *
 * The caller must pass the sunrise/sunset/nextSunrise triple that brackets
 * `t` (see computeVedicTimeline, which selects the correct triple — the
 * pre-dawn case belongs to the *previous* night).
 */
export function gulikaWindow(
  t: Date,
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  vedicWeekdayNo: number,
): GulikaWindow {
  const isDay = t.getTime() >= sunrise.getTime() && t.getTime() < sunset.getTime();
  const start = isDay ? sunrise : sunset;
  const end = isDay ? sunset : nextSunrise;
  const part = (end.getTime() - start.getTime()) / 8;
  const n = (isDay ? DAY_GULIKA_PART : NIGHT_GULIKA_PART)[mod7(vedicWeekdayNo)];
  const gStart = new Date(start.getTime() + (n - 1) * part);
  return { start: gStart, end: new Date(gStart.getTime() + part), isDay };
}

/**
 * Sidereal ascendant rising at a given instant.
 * Pure and timezone-agnostic: it works on the UTC instant directly.
 */
export function siderealAscendantAt(
  instant: Date,
  latitude: number,
  longitude: number,
  ayanamsa: number,
): number {
  const jd = calculateJulianDay(instant);
  if (isNaN(jd)) return NaN;
  return norm360(calculateAscendantFromJD(jd, latitude, longitude) - ayanamsa);
}

export type MandiMode = 'start' | 'middle' | 'end';

/**
 * Mandi/Gulika longitude = the sidereal ascendant at the start (default),
 * middle, or end of the Gulika window. `ayanamsa` should be the same value
 * the Prashna chart used (pass chart.ayanamsaValue) so the two agree.
 */
export function mandiLongitude(
  win: GulikaWindow,
  latitude: number,
  longitude: number,
  ayanamsa: number,
  mode: MandiMode = 'start',
): number {
  const t =
    mode === 'start'
      ? win.start
      : mode === 'end'
        ? win.end
        : new Date((win.start.getTime() + win.end.getTime()) / 2);
  return siderealAscendantAt(t, latitude, longitude, ayanamsa);
}

export interface VedicTimeline {
  sunrise: Date | null;
  sunset: Date | null;
  nextSunrise: Date | null;
  /** Vedic weekday (0=Sun … 6=Sat), counted from local sunrise. */
  vedicWeekday: number;
  /** Gulika window, or null at high latitude where the sun does not rise/set. */
  gulika: GulikaWindow | null;
  /** UTC offset (minutes) used for the local day. */
  timezoneOffsetMinutes: number;
}

/** Format an instant as YYYY-MM-DD in an IANA timezone. */
function localDateString(instant: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const g = (t: string): string => parts.find((p) => p.type === t)?.value ?? '00';
  return `${g('year')}-${g('month')}-${g('day')}`;
}

/** Civil weekday (0=Sun … 6=Sat) of the local calendar day of `instant`. */
function localWeekday(instant: Date, timezone: string): number {
  const wk = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' }).format(instant);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wk] ?? 0;
}

/** Shift a YYYY-MM-DD string by whole days (calendar arithmetic, UTC-safe). */
function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}

/**
 * Resolve sunrise/sunset, Vedic weekday and the Gulika window for an exact
 * moment at a location. At polar latitudes where the sun does not rise or
 * set, `gulika` is null (the caller should fall back to a non-Lagna path).
 */
export function computeVedicTimeline(
  askedAt: Date,
  latitude: number,
  longitude: number,
  timezone: string,
): VedicTimeline {
  const localDate = localDateString(askedAt, timezone);
  const prevDate = shiftDate(localDate, -1);
  const nextDate = shiftDate(localDate, 1);

  const tzOffset = getTimezoneOffsetMinutes(localDate, timezone);
  const today = calculateSunriseSunset(localDate, latitude, longitude, tzOffset);
  const prev = calculateSunriseSunset(prevDate, latitude, longitude, getTimezoneOffsetMinutes(prevDate, timezone));
  const next = calculateSunriseSunset(nextDate, latitude, longitude, getTimezoneOffsetMinutes(nextDate, timezone));

  const civilWeekday = localWeekday(askedAt, timezone);
  const vw = vedicWeekday(askedAt, today.sunrise ?? askedAt, civilWeekday);

  if (!today.sunrise || !today.sunset) {
    return {
      sunrise: null,
      sunset: null,
      nextSunrise: next.sunrise ?? null,
      vedicWeekday: vw,
      gulika: null,
      timezoneOffsetMinutes: tzOffset,
    };
  }

  const tt = askedAt.getTime();
  let gulika: GulikaWindow;

  if (tt < today.sunrise.getTime()) {
    // Pre-dawn: belongs to the previous Vedic day's night.
    const prevSunrise = prev.sunrise ?? today.sunrise;
    const prevSunset = prev.sunset ?? today.sunrise;
    gulika = gulikaWindow(askedAt, prevSunrise, prevSunset, today.sunrise, vw);
  } else {
    const nightEnd = next.sunrise ?? today.sunset;
    gulika = gulikaWindow(askedAt, today.sunrise, today.sunset, nightEnd, vw);
  }

  return {
    sunrise: today.sunrise,
    sunset: today.sunset,
    nextSunrise: next.sunrise ?? null,
    vedicWeekday: vw,
    gulika,
    timezoneOffsetMinutes: tzOffset,
  };
}
