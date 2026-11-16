/**
 * dateValidation.ts — shared, timezone-safe date and time validation.
 *
 * The app stores every date internally as an ISO `YYYY-MM-DD` string, while
 * the primary birth-entry form (EnhancedBirthInputForm) displays `DD/MM/YYYY`.
 * Historically each form rolled its own parsing, and some relied on
 * `new Date(...)` which can silently normalise impossible calendar dates and
 * shift date-only values across timezones. This module is the single source of
 * truth for:
 *
 *   • strict DD/MM/YYYY parsing (no `Date` constructor, no normalisation)
 *   • calendar validity (impossible dates like 31/04 or 29/02/1900 rejected)
 *   • Gregorian leap-year rules
 *   • a documented supported range for the calculation engine
 *   • a separate "future date" policy (calendar-valid ≠ allowed as a birth date)
 *   • 24-hour HH:MM time validation
 *
 * All comparisons are plain string comparisons on `YYYY-MM-DD`, which are
 * lexicographically ordered and therefore timezone-independent.
 *
 * See reports/ROBOTIC_PATCH_REPORT.md (PATCH 3) for the mandatory cases.
 */

/** Range the calculation engine is documented to support (inclusive). */
export const SUPPORTED_DATE_RANGE = {
  /** Pre-1905 India used Local Mean Time, so historical births are supported. */
  min: '1800-01-01',
  /** Upper bound of the engine's arithmetic; future *birth* dates are rejected separately. */
  max: '2100-12-31',
} as const;

/**
 * Canonical machine format for every date field in the app. Native
 * `<input type="date">` controls always emit and accept this ISO form, but the
 * *displayed* order varies by browser locale — so this hint is shown next to the
 * control to remove that ambiguity (PATCH 4).
 */
export const DATE_INPUT_FORMAT_HINT = 'YYYY-MM-DD';

export type DateParseReason = 'format' | 'impossible' | 'out-of-range';

export interface DateParseResult {
  /** True only when the input is a calendar-valid date inside the supported range. */
  ok: boolean;
  /** Canonical `YYYY-MM-DD`, or null when !ok. */
  iso: string | null;
  /** Machine-readable failure category, or null when ok. */
  reason: DateParseReason | null;
  /** Short English fallback message; callers may localise via `reason`. */
  message: string;
}

/** Gregorian leap-year rule. */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Number of days in a month, or 0 for an out-of-range month. */
export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0;
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1];
}

/** Strict `YYYY-MM-DD` calendar check with no `Date` parsing or normalisation. */
export function isCalendarValidDate(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= daysInMonth(year, month);
}

/** Today as `YYYY-MM-DD` in the *local* timezone (avoids the UTC off-by-one). */
export function todayIsoLocal(now: Date = new Date()): string {
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

/** Lexicographic comparison of two `YYYY-MM-DD` strings (−1 | 0 | 1). */
export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Whether an ISO date lies inside the documented supported range. */
export function isWithinSupportedRange(iso: string): boolean {
  return (
    compareIso(iso, SUPPORTED_DATE_RANGE.min) >= 0 &&
    compareIso(iso, SUPPORTED_DATE_RANGE.max) <= 0
  );
}

/**
 * Whether an ISO date is after today. Calendar validity and range are separate
 * concerns: `31/12/2099` is a *valid* calendar date, but it is a future date, so
 * the future-birth policy rejects it as a birth date.
 */
export function isFutureDate(iso: string, todayIso: string = todayIsoLocal()): boolean {
  return compareIso(iso, todayIso) > 0;
}

/**
 * Strictly parse `DD/MM/YYYY` (optionally an already-ISO `YYYY-MM-DD`) into a
 * canonical ISO date. Impossible calendar dates are rejected rather than
 * normalised, and the supported range is enforced.
 */
export function parseDdMmYyyy(
  input: string,
  opts: { allowIso?: boolean } = {},
): DateParseResult {
  const raw = (input ?? '').trim();
  if (!raw) {
    return { ok: false, iso: null, reason: 'format', message: 'Date is required' };
  }

  let year: number;
  let month: number;
  let day: number;

  if (opts.allowIso && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    year = Number(raw.slice(0, 4));
    month = Number(raw.slice(5, 7));
    day = Number(raw.slice(8, 10));
  } else {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
    if (!m) {
      return { ok: false, iso: null, reason: 'format', message: 'Use DD/MM/YYYY' };
    }
    day = Number(m[1]);
    month = Number(m[2]);
    year = Number(m[3]);
  }

  const iso = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  if (!isCalendarValidDate(iso)) {
    return { ok: false, iso: null, reason: 'impossible', message: 'Not a real calendar date' };
  }
  if (!isWithinSupportedRange(iso)) {
    return {
      ok: false,
      iso: null,
      reason: 'out-of-range',
      message: `Supported range is ${SUPPORTED_DATE_RANGE.min} to ${SUPPORTED_DATE_RANGE.max}`,
    };
  }

  return { ok: true, iso, reason: null, message: '' };
}

export interface TimeParseResult {
  ok: boolean;
  /** Canonical 24-hour `HH:MM`, or null when !ok. */
  value: string | null;
  message: string;
}

/**
 * Validate a 24-hour `HH:MM` time. `00:00` and `23:59` are valid; `24:00` and
 * anything outside 00:00–23:59 are rejected.
 */
export function parseHhMm(input: string): TimeParseResult {
  const raw = (input ?? '').trim();
  if (!raw) return { ok: false, value: null, message: 'Time is required' };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) {
    return { ok: false, value: null, message: 'Use 24-hour HH:MM (00:00–23:59)' };
  }
  return { ok: true, value: raw, message: '' };
}
