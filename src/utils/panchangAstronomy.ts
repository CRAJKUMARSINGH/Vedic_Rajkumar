/**
 * panchangAstronomy.ts
 *
 * Pure-TypeScript, DOM-free astronomical calculator for Panchang.
 * Implements NOAA solar algorithm and a simplified Meeus lunar algorithm.
 * No `any` types — strict mode compliant.
 */

// ── Constants ─────────────────────────────────────────────────────────────────
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toRad(deg: number): number {
  return deg * RAD;
}

function toDeg(rad: number): number {
  return rad * DEG;
}

/** Normalize degrees to [0, 360) */
function normDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Compute Julian Day Number for a calendar date at a given UTC time fraction.
 * Uses standard astronomical JD formula.
 */
function julianDay(year: number, month: number, day: number, utcHours: number): number {
  // Adjust January and February to be months 13 and 14 of the previous year
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = day + utcHours / 24.0;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + B - 1524.5;
}

/**
 * Parse "YYYY-MM-DD" into { year, month, day } integers (local calendar).
 * Never feeds the string directly into `new Date()` to avoid UTC-midnight shift.
 */
function parseDateStr(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-');
  if (parts.length !== 3) throw new Error(`Invalid date string: ${dateStr}`);
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  };
}

// ── Exported functions ────────────────────────────────────────────────────────

/**
 * Returns the UTC offset in minutes for an IANA timezone on a specific date.
 * DST-aware: uses Intl.DateTimeFormat to read the offset at local noon on
 * that date, which avoids ambiguity during clock-change days.
 */
export function getTimezoneOffsetMinutes(dateStr: string, ianaTimezone: string): number {
  const { year, month, day } = parseDateStr(dateStr);

  // Build a UTC timestamp representing noon UTC on that date.
  // We then ask Intl what local time that is, and derive the offset.
  // A more reliable approach: compute the UTC offset by comparing UTC noon
  // to the local-noon-in-timezone representation.

  // Create a Date at noon UTC on that date
  const noonUtc = Date.UTC(year, month - 1, day, 12, 0, 0);
  const noonDate = new Date(noonUtc);

  // Extract local parts in the target timezone
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = fmt.formatToParts(noonDate);
  const get = (type: string): number => {
    const part = parts.find(p => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  // Local time in the target timezone when UTC is noon
  const localYear = get('year');
  const localMonth = get('month');
  const localDay = get('day');
  let localHour = get('hour');
  const localMinute = get('minute');
  const localSecond = get('second');

  // Handle 24:xx -> 0:xx (some implementations return hour=24)
  if (localHour === 24) localHour = 0;

  // Build the local timestamp as if it were UTC (to compute the diff)
  const localAsUtc = Date.UTC(localYear, localMonth - 1, localDay, localHour, localMinute, localSecond);

  // offset = localTime - utcTime, in minutes
  const offsetMs = localAsUtc - noonUtc;
  return Math.round(offsetMs / 60000);
}

/**
 * Returns today's date in "YYYY-MM-DD" format using local (device) calendar
 * components, not UTC — so it never shows yesterday/tomorrow due to UTC shift.
 */
export function localTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns a human-readable date label using the target timezone, parsing the
 * date at local noon to avoid off-by-one-day from UTC parsing.
 */
export function formatCalendarDate(dateStr: string, timezone: string, locale: string): string {
  const { year, month, day } = parseDateStr(dateStr);

  // Construct noon UTC on that date, then reinterpret in the target timezone.
  // This way the Intl formatter always shows the intended local date.
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  }).format(noonUtc);
}

// ── NOAA Solar Algorithm ──────────────────────────────────────────────────────

/** Result type for sunrise/sunset calculation */
export interface SunriseSunsetResult {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date;
  noRiseSet?: boolean;
}

/**
 * Calculates sunrise, solar noon, and sunset using the NOAA solar position
 * algorithm. Returns UTC Date objects.
 *
 * @param dateStr      - "YYYY-MM-DD" local calendar date
 * @param lat          - latitude in decimal degrees (negative = south)
 * @param lon          - longitude in decimal degrees (negative = west)
 * @param tzOffsetMinutes - UTC offset in minutes (e.g. +330 for IST)
 */
export function calculateSunriseSunset(
  dateStr: string,
  lat: number,
  lon: number,
  tzOffsetMinutes: number
): SunriseSunsetResult {
  const { year, month, day } = parseDateStr(dateStr);

  // JD for local noon (12:00 local time = 12 - tzOffsetMinutes/60 UTC hours)
  const noonUtcHour = 12.0 - tzOffsetMinutes / 60.0;
  const JD = julianDay(year, month, day, noonUtcHour);

  // Julian Century
  const T = (JD - 2451545.0) / 36525.0;

  // Geometric mean longitude of the Sun (degrees)
  const L0 = normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

  // Mean anomaly of the Sun (degrees)
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const M_rad = toRad(M);

  // Sun's equation of center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_rad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad) +
    0.000289 * Math.sin(3 * M_rad);

  // Sun's true longitude
  const sunLon = L0 + C;

  // Sun's apparent longitude
  const lambda = sunLon - 0.00569 - 0.00478 * Math.sin(toRad(125.04 - 1934.136 * T));
  const lambda_rad = toRad(lambda);

  // Mean obliquity of the ecliptic
  const epsilon0 =
    23 +
    (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;

  // Corrected obliquity
  const epsilon = epsilon0 + 0.00256 * Math.cos(toRad(125.04 - 1934.136 * T));
  const epsilon_rad = toRad(epsilon);

  // Solar declination (radians)
  const dec_rad = Math.asin(Math.sin(epsilon_rad) * Math.sin(lambda_rad));

  // var_y
  const var_y = Math.tan(epsilon_rad / 2) ** 2;

  // Eccentricity of Earth's orbit
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

  const L0_rad = toRad(L0);

  // Equation of time (minutes)
  const Eo =
    4 *
    toDeg(
      var_y * Math.sin(2 * L0_rad) -
        2 * e * Math.sin(M_rad) +
        4 * e * var_y * Math.sin(M_rad) * Math.cos(2 * L0_rad) -
        0.5 * var_y * var_y * Math.sin(4 * L0_rad) -
        1.25 * e * e * Math.sin(2 * M_rad)
    );

  // Solar noon as fraction of UTC day.
  // The NOAA formula (720 - 4*lon - Eo + tzOffsetMinutes) gives LOCAL civil
  // time as a day fraction. To get UTC fraction we must NOT add tzOffsetMinutes
  // here, because we anchor the result to UTC midnight below. Adding the offset
  // would double-count it and shift the result by the full timezone offset.
  const solarNoonFraction = (720 - 4 * lon - Eo) / 1440;

  // Hour angle at sunrise/sunset (degrees)
  const lat_rad = toRad(lat);
  const cosHA =
    Math.cos(toRad(90.833)) / (Math.cos(lat_rad) * Math.cos(dec_rad)) -
    Math.tan(lat_rad) * Math.tan(dec_rad);

  // Base UTC timestamp for start of day (00:00 UTC on the date)
  const dayStartUtc = Date.UTC(year, month - 1, day, 0, 0, 0);

  // Solar noon as UTC Date
  const solarNoon = new Date(dayStartUtc + solarNoonFraction * 86400000);

  // Polar day/night check
  if (cosHA < -1) {
    // Sun never sets (polar day)
    return { sunrise: null, sunset: null, solarNoon, noRiseSet: true };
  }
  if (cosHA > 1) {
    // Sun never rises (polar night)
    return { sunrise: null, sunset: null, solarNoon, noRiseSet: true };
  }

  const HA = toDeg(Math.acos(cosHA)); // degrees

  // Sunrise / sunset as fractions of UTC day
  const sunriseFraction = solarNoonFraction - (HA * 4) / 1440;
  const sunsetFraction = solarNoonFraction + (HA * 4) / 1440;

  const sunrise = new Date(dayStartUtc + sunriseFraction * 86400000);
  const sunset = new Date(dayStartUtc + sunsetFraction * 86400000);

  return { sunrise, sunset, solarNoon };
}

// ── Simplified Meeus Lunar Algorithm ─────────────────────────────────────────

/** Result type for moonrise/moonset calculation */
export interface MoonriseMoonsetResult {
  moonrise: Date | null;
  moonset: Date | null;
}

/**
 * Compute Moon's ecliptic longitude and latitude at a given Julian Day.
 * Uses Meeus chapter 47 simplified (top 6 longitude terms + latitude).
 */
function moonEclipticCoords(JD: number): { lambdaDeg: number; betaDeg: number } {
  const T = (JD - 2451545.0) / 36525.0;

  // Moon's mean longitude (degrees)
  const Lm =
    218.3164477 +
    481267.88123421 * T -
    0.0015786 * T * T +
    (T * T * T) / 538841 -
    (T * T * T * T) / 65194000;

  // Moon's mean anomaly (degrees)
  const Mm =
    134.9633964 +
    477198.8675055 * T +
    0.0087414 * T * T +
    (T * T * T) / 69699 -
    (T * T * T * T) / 14712000;

  // Moon's mean elongation (degrees)
  const D =
    297.8501921 +
    445267.1114034 * T -
    0.0018819 * T * T +
    (T * T * T) / 545868 -
    (T * T * T * T) / 113065000;

  // Sun's mean anomaly (degrees)
  const M =
    357.5291092 +
    35999.0502909 * T -
    0.0001536 * T * T +
    (T * T * T) / 24490000;

  // Argument of latitude (degrees)
  const F =
    93.272095 +
    483202.0175233 * T -
    0.0036539 * T * T -
    (T * T * T) / 3526000 +
    (T * T * T * T) / 863310000;

  // Convert to radians for trig
  const Mm_r = toRad(Mm);
  const D_r = toRad(D);
  const M_r = toRad(M);
  const F_r = toRad(F);

  // Top 6 longitude correction terms (in units of 0.000001 degrees)
  const dL =
    6288774 * Math.sin(Mm_r) +
    1274027 * Math.sin(2 * D_r - Mm_r) +
    658314 * Math.sin(2 * D_r) +
    214618 * Math.sin(2 * Mm_r) -
    185116 * Math.sin(M_r) -
    114332 * Math.sin(2 * F_r);

  // Moon's true longitude (degrees)
  const lambdaDeg = normDeg(Lm + dL / 1_000_000);

  // Simplified latitude: dominant term only (degrees)
  const betaDeg = 5.128 * Math.sin(F_r);

  return { lambdaDeg, betaDeg };
}

/**
 * Convert Moon ecliptic coords to equatorial (right ascension, declination)
 * at the given Julian Day.
 */
function eclipticToEquatorial(
  lambdaDeg: number,
  betaDeg: number,
  T: number
): { raDeg: number; decDeg: number } {
  // Obliquity (degrees)
  const epsilon0 =
    23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;

  const epsilon_rad = toRad(epsilon0);
  const lambda_rad = toRad(lambdaDeg);
  const beta_rad = toRad(betaDeg);

  // Declination
  const sinDec =
    Math.sin(beta_rad) * Math.cos(epsilon_rad) +
    Math.cos(beta_rad) * Math.sin(epsilon_rad) * Math.sin(lambda_rad);
  const decRad = Math.asin(sinDec);

  // Right ascension
  const raRad = Math.atan2(
    Math.sin(lambda_rad) * Math.cos(epsilon_rad) -
      Math.tan(beta_rad) * Math.sin(epsilon_rad),
    Math.cos(lambda_rad)
  );

  return { raDeg: toDeg(raRad), decDeg: toDeg(decRad) };
}

/**
 * Compute Moon altitude above the horizon (degrees) for a given observer and UTC time.
 * Atmospheric refraction + parallax correction: horizon at -0.833°.
 */
function moonAltitude(JD: number, lat: number, lon: number): number {
  const T = (JD - 2451545.0) / 36525.0;
  const { lambdaDeg, betaDeg } = moonEclipticCoords(JD);
  const { raDeg, decDeg } = eclipticToEquatorial(lambdaDeg, betaDeg, T);

  // Greenwich Mean Sidereal Time (degrees)
  const GMST = normDeg(
    280.46061837 +
      360.98564736629 * (JD - 2451545.0) +
      0.000387933 * T * T -
      (T * T * T) / 38710000
  );

  // Local Hour Angle (degrees)
  const LHA = normDeg(GMST + lon - raDeg);
  const LHA_rad = toRad(LHA);

  const lat_rad = toRad(lat);
  const dec_rad = toRad(decDeg);

  // Altitude
  const sinAlt =
    Math.sin(lat_rad) * Math.sin(dec_rad) +
    Math.cos(lat_rad) * Math.cos(dec_rad) * Math.cos(LHA_rad);

  return toDeg(Math.asin(sinAlt));
}

/**
 * Calculates moonrise and moonset using an iterative hourly altitude scanner.
 * Scans altitudes at each integer hour and interpolates sign crossings at -0.833°.
 *
 * @param dateStr         - "YYYY-MM-DD" local calendar date
 * @param lat             - latitude in decimal degrees
 * @param lon             - longitude in decimal degrees
 * @param tzOffsetMinutes - UTC offset in minutes
 */
export function calculateMoonriseMoonset(
  dateStr: string,
  lat: number,
  lon: number,
  tzOffsetMinutes: number
): MoonriseMoonsetResult {
  const { year, month, day } = parseDateStr(dateStr);

  // Start of local calendar day in UTC
  const localMidnightUtcMs =
    Date.UTC(year, month - 1, day, 0, 0, 0) - tzOffsetMinutes * 60000;

  const HORIZON = -0.833; // degrees (standard correction for refraction + parallax)

  let moonrise: Date | null = null;
  let moonset: Date | null = null;

  // Sample altitude at each integer hour (local), scanning 0..24
  const altitudes: number[] = [];
  const JDs: number[] = [];

  for (let h = 0; h <= 24; h++) {
    const utcMs = localMidnightUtcMs + h * 3600000;
    const JD = 2440587.5 + utcMs / 86400000; // Unix epoch JD offset
    altitudes.push(moonAltitude(JD, lat, lon));
    JDs.push(JD);
  }

  // Find sign changes between consecutive hours
  for (let h = 0; h < 24; h++) {
    const a0 = altitudes[h] - HORIZON;
    const a1 = altitudes[h + 1] - HORIZON;

    if (a0 * a1 < 0) {
      // Linear interpolation to find fractional hour of crossing
      const fraction = a0 / (a0 - a1); // 0..1 within the hour interval
      const crossingUtcMs = localMidnightUtcMs + (h + fraction) * 3600000;
      const crossingDate = new Date(crossingUtcMs);

      if (a0 < 0 && a1 > 0) {
        // Rising
        if (moonrise === null) moonrise = crossingDate;
      } else {
        // Setting
        if (moonset === null) moonset = crossingDate;
      }
    }

    // Stop early once we have both
    if (moonrise !== null && moonset !== null) break;
  }

  return { moonrise, moonset };
}
