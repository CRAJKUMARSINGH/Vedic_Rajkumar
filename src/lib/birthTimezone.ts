/**
 * birthTimezone.ts — Resolve the historical UTC offset for a birth date and location.
 *
 * India has had multiple timezone offsets:
 *   pre-1905      Local Mean Time (longitude-based)
 *   1905-06-01    HMT (Madras Time) UTC+5:21:10 adopted across the subcontinent
 *   1906-01-01    IST UTC+5:30 (rounded)
 *   1941-10-01    Wartime UTC+6:30 (+1 h advance) for energy conservation
 *   1942-05-15    Reverted to IST UTC+5:30
 *   1942-09-01    Wartime UTC+6:30 again
 *   1945-10-15    Final revert to IST UTC+5:30 (unchanged to present)
 *
 * Most Jyotish software silently uses modern IST (+5:30) for all historical
 * charts.  For a 1943 Mumbai birth at 04:27, that is an error of 1 hour = ~15°
 * of ascendant = an entire rashi.
 *
 * This module maps a (date, place) pair to the correct UTC offset so
 * calculatePreciseChart receives the right tzOffsetHours.
 */

export interface BirthTimezone {
  offsetHours: number;
  label:       string;  // human-readable, e.g. "IST UTC+5:30"
  note?:       string;  // e.g. "India wartime offset 1942–45"
  isHistorical: boolean;
}

// Indian sub-continent bounding box (approximate)
const IN_LAT = [6, 37] as const;
const IN_LON = [68, 98] as const;

function isIndia(location: string): boolean {
  const lower = location.toLowerCase();
  return (
    lower.includes('india') ||
    lower.includes('mumbai') || lower.includes('bombay') ||
    lower.includes('delhi') || lower.includes('kolkata') ||
    lower.includes('calcutta') || lower.includes('chennai') ||
    lower.includes('madras') || lower.includes('bangalore') ||
    lower.includes('bengaluru') || lower.includes('hyderabad') ||
    lower.includes('pune') || lower.includes('ahmedabad') ||
    lower.includes('jaipur') || lower.includes('lucknow') ||
    lower.includes('indore') || lower.includes('nagpur') ||
    lower.includes('surat') || lower.includes('kanpur')
  );
}

/**
 * Parse YYYY-MM-DD into a comparable integer YYYYMMDD.
 * Returns 0 if the date cannot be parsed.
 */
function dateInt(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 0;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return 0;
  return y * 10000 + m * 100 + d;
}

/**
 * Resolve the correct UTC offset for a birth date and location string.
 *
 * @param date      YYYY-MM-DD
 * @param location  City or country name (case-insensitive)
 * @returns BirthTimezone with the resolved offset, or null if unrecognised
 */
export function resolveBirthTimezone(args: { date: string; location: string }): BirthTimezone | null {
  const { date, location } = args;
  const di = dateInt(date);
  if (di === 0) return null;

  if (isIndia(location)) {
    // Wartime advance #2: 1 Sep 1942 – 14 Oct 1945
    if (di >= 19420901 && di <= 19451014) {
      return {
        offsetHours:  6.5,
        label:        'India Wartime UTC+6:30',
        note:         'India wartime offset 1942–45 (second period)',
        isHistorical: true,
      };
    }
    // Wartime advance #1: 1 Oct 1941 – 14 May 1942
    if (di >= 19411001 && di <= 19420514) {
      return {
        offsetHours:  6.5,
        label:        'India Wartime UTC+6:30',
        note:         'India wartime offset 1941–42 (first period)',
        isHistorical: true,
      };
    }
    // Modern IST (post-1906)
    if (di >= 19060101) {
      return {
        offsetHours:  5.5,
        label:        'IST UTC+5:30',
        isHistorical: false,
      };
    }
    // HMT 1905-06-01 to 1905-12-31
    if (di >= 19050601) {
      return {
        offsetHours:  5.5, // HMT was +5:21:10, rounded to 5.5 for practical use
        label:        'HMT UTC+5:21 (approx +5:30)',
        note:         'Madras Time, adopted 1905-06-01. Rounded to +5:30 for practical use.',
        isHistorical: true,
      };
    }
    // Pre-1905: Local Mean Time (longitude-based)
    return {
      offsetHours:  5.5, // best approximation without exact coordinates
      label:        'LMT (approx IST +5:30)',
      note:         'Pre-1905 India used Local Mean Time. Offset is approximate — provide longitude for precision.',
      isHistorical: true,
    };
  }

  // Unknown location — caller should use tzdb or prompt the user
  return null;
}

/**
 * Resolve the UTC offset from an explicit lat/lon for the Local Mean Time era.
 * 1 degree of longitude = 4 minutes = 1/15 hour.
 */
export function lmtOffsetHours(lonEast: number): number {
  return lonEast / 15;
}
