/**
 * birthDateRange — shared birth-date guard (Patch 03).
 *
 * Edge and out-of-range birth dates used to fail silently: validation rejected
 * the value but no message reached the UI, so the form looked idle and the
 * submit button stayed disabled with zero feedback (#4 finding, robotic
 * advanced tier). This module centralises the check so every entry point
 * (free-text DD/MM/YYYY, ISO YYYY-MM-DD, native date input) gives the same
 * verdict and the same explicit message.
 *
 * Supported range: 1900–2099. Real calendar arithmetic is used, so a
 * non-existent day such as 29 Feb on a non-leap year is rejected explicitly.
 */

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2099;

export type DateCheck =
  | { ok: true; iso: string }
  | { ok: false; message: string };

export function checkBirthDate(input: string | Date): DateCheck {
  let y: number;
  let m: number;
  let d: number;

  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      return { ok: false, message: 'Invalid date' };
    }
    y = input.getFullYear();
    m = input.getMonth() + 1;
    d = input.getDate();
  } else {
    // Accept both DD/MM/YYYY and YYYY-MM-DD.
    const s = input.trim();
    let match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
    if (match) {
      d = Number(match[1]);
      m = Number(match[2]);
      y = Number(match[3]);
    } else {
      match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
      if (!match) return { ok: false, message: 'Use DD/MM/YYYY or YYYY-MM-DD' };
      y = Number(match[1]);
      m = Number(match[2]);
      d = Number(match[3]);
    }
  }

  if (y < MIN_YEAR || y > MAX_YEAR) {
    return {
      ok: false,
      message: `Birth date outside supported range (${MIN_YEAR}–${MAX_YEAR})`,
    };
  }

  // Real calendar check — catches 29/02/1900 and other non-existent days.
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() + 1 !== m ||
    dt.getUTCDate() !== d
  ) {
    return { ok: false, message: 'Invalid calendar date (e.g. 29 Feb on non-leap year)' };
  }

  const iso = `${y.toString().padStart(4, '0')}-${m
    .toString()
    .padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  return { ok: true, iso };
}

/** Hindi renderings of the guard's messages, for the `hi` locale. */
const HINDI_MESSAGES: Record<string, string> = {
  'Invalid date': 'अमान्य तिथि',
  'Use DD/MM/YYYY or YYYY-MM-DD': 'DD/MM/YYYY या YYYY-MM-DD प्रयोग करें',
  [`Birth date outside supported range (${MIN_YEAR}–${MAX_YEAR})`]: `जन्म तिथि समर्थित सीमा (${MIN_YEAR}–${MAX_YEAR}) से बाहर है`,
  'Invalid calendar date (e.g. 29 Feb on non-leap year)': 'अमान्य कैलेंडर तिथि (जैसे गैर-लीप वर्ष में 29 फरवरी)',
};

/** Translate a guard message for display; falls back to the English original. */
export function localizeDateMessage(message: string, lang: 'en' | 'hi'): string {
  return lang === 'hi' ? (HINDI_MESSAGES[message] ?? message) : message;
}
