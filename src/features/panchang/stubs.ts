/**
 * ============================================================
 * PANCHANG + MUHURTA CALCULATION STUBS
 * ============================================================
 *
 * Stubs for getPanchang() and getMuhurta() until Week 4 when the
 * real Swiss Ephemeris sunrise, tithi, and nakshatra calculations
 * are implemented.
 *
 * CONTRACT GUARANTEES:
 *   - Returns structurally valid PanchangData / MuhurtaResult
 *   - All timestamps are valid ISO 8601 UTC strings
 *   - Inauspicious periods do not overlap auspicious periods
 *   - Clearly marked STUB — do not use values for real guidance
 *
 * HOW TO REPLACE (Week 4):
 *   1. Use Swiss Ephemeris swe_rise_trans for sunrise/sunset
 *   2. Compute tithi from Moon-Sun longitude difference
 *   3. Compute nakshatra from Moon sidereal longitude
 *   4. Compute yoga from (Sun + Moon sidereal) / (360/27)
 *   5. Implement Rahu Kalam / Gulika Kalam from sunrise + weekday
 *   6. Implement purpose-specific Muhurta scoring table
 * ============================================================
 */

import type {
  PanchangData,
  MuhurtaQuery,
  MuhurtaResult,
  MuhurtaWindow,
  InauspiciousWindow,
} from './types';

// ─── Time helpers ─────────────────────────────────────────────────────────────

/** Build an ISO UTC timestamp for a given date and local HH:MM (IST offset +5:30). */
function istToUtc(date: string, hhMM: string): string {
  const [hh, mm] = hhMM.split(':').map(Number);
  const d = new Date(`${date}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00+05:30`);
  return d.toISOString();
}

/** Add minutes to an ISO UTC string. */
function addMinutes(iso: string, mins: number): string {
  return new Date(new Date(iso).getTime() + mins * 60000).toISOString();
}

// ─── Rahu Kalam table (weekday index 0=Sun → fraction of day) ────────────────
// Traditional sequence: Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=3, Sat=4
// Rahu Kalam = (1/8) of day starting at (index × 1.5) hours after sunrise (approx)
const RAHU_KALAM_OFFSET_HOURS: Record<number, number> = {
  0: 10.5, 1: 7.5, 2: 15.0, 3: 12.0, 4: 13.5, 5: 9.0, 6: 10.5,
};

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T06:00:00Z').getUTCDay();
}

// ─── PUBLIC: getPanchang ──────────────────────────────────────────────────────

/**
 * STUB: getPanchang
 *
 * Returns a PanchangData for the given date and location.
 * All five limbs (tithi, vara, nakshatra, yoga, karana) are deterministically
 * derived from the date string — they are NOT astronomically accurate.
 *
 * @param date       ISO date string YYYY-MM-DD (local calendar).
 * @param latitude   Geographic latitude (decimal degrees, N positive).
 * @param longitude  Geographic longitude (decimal degrees, E positive).
 * @param timezone   IANA timezone string.
 * @param placeName  Optional display name.
 */
export function getPanchang(
  date: string,
  latitude: number,
  longitude: number,
  timezone: string,
  placeName?: string,
): PanchangData {
  const dow = getDayOfWeek(date);
  const dayN = new Date(date).getDate();

  // Stub tithi: cycle through 30 tithis based on day-of-month
  const tithiNames = [
    'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
    'Shashthi','Saptami','Ashtami','Navami','Dashami',
    'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
  ] as const;
  const tithiIdx = (dayN - 1) % 15;
  const paksha = dayN <= 15 ? 'Shukla' : 'Krishna';
  const tithiName = tithiNames[tithiIdx];
  const auspiciousTithis = [2,3,5,7,10,11,13];
  const inauspiciousTithis = [4,8,14];
  const tithiSeq = tithiIdx + 1;
  const tithiAusp = auspiciousTithis.includes(tithiSeq) ? 'Auspicious'
    : inauspiciousTithis.includes(tithiSeq) ? 'Inauspicious' : 'Moderate';

  const sunrise = istToUtc(date, '06:12');
  const sunset  = istToUtc(date, '18:45');
  const moonrise = istToUtc(date, '20:30');
  const moonset  = istToUtc(date, '07:45');

  // Nakshatra: cycle 27
  const nakshatraNames = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
    'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
    'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula',
    'Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
    'Purva Bhadrapada','Uttara Bhadrapada','Revati',
  ] as const;
  const nakshatraIdx = (dayN + dow) % 27;
  const nakshatra = nakshatraNames[nakshatraIdx];
  const nakshatraLords = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
  const nakshatraNatures = ['Deva','Manushya','Rakshasa'] as const;

  // Yoga: cycle 27
  const yogaNames = [
    'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda',
    'Sukarma','Dhriti','Shoola','Ganda','Vriddhi','Dhruva','Vyaghata',
    'Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva',
    'Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti',
  ] as const;
  const inauspYogas = ['Vishkambha','Atiganda','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'];
  const yogaIdx = (dayN + 3) % 27;
  const yogaName = yogaNames[yogaIdx];

  // Karana
  const karanaNames = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'] as const;
  const karanaIdx = dayN % 7;
  const karanaName = karanaNames[karanaIdx];

  // Vara
  const varaNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] as const;
  const varaLords = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
  const varaAusp = ['Moderate','Good','Avoid','Good','Excellent','Good','Avoid'] as const;

  // Rahu Kalam
  const rahuStart = addMinutes(sunrise, (RAHU_KALAM_OFFSET_HOURS[dow] - 6) * 60);
  const rahuEnd   = addMinutes(rahuStart, 90);

  // Gulika Kalam (starts ~4.5h before Rahu Kalam, duration 1.5h)
  const gulikaStart = addMinutes(sunrise, ((RAHU_KALAM_OFFSET_HOURS[dow] - 6) - 4.5) * 60);
  const gulikaEnd   = addMinutes(gulikaStart, 90);

  // Yamaganda (starts ~3h after sunrise, duration 1.5h)
  const yamaStart = addMinutes(sunrise, 180);
  const yamaEnd   = addMinutes(yamaStart, 90);

  // Abhijit: middle of daytime ± 24 minutes
  const dayMidUtc = addMinutes(sunrise, 375); // ~6.25h after sunrise
  const abhijitStart = addMinutes(dayMidUtc, -24);
  const abhijitEnd   = addMinutes(dayMidUtc,  24);

  // Brahma Muhurta: 1h36m before sunrise
  const brahmaStart = addMinutes(sunrise, -96);
  const brahmaEnd   = addMinutes(sunrise, -48);

  return {
    date,
    location: { latitude, longitude, timezone, placeName },
    tithi: {
      name: tithiName,
      paksha,
      sequenceNumber: tithiSeq,
      endsAt: addMinutes(sunset, 120),
      auspiciousness: tithiAusp,
    },
    vara: {
      name: varaNames[dow],
      lord: varaLords[dow],
      auspiciousness: varaAusp[dow],
    },
    nakshatra: {
      name: nakshatra,
      index: nakshatraIdx + 1,
      lord: nakshatraLords[nakshatraIdx % 9],
      deity: 'Ashwini Kumaras (STUB)',
      symbol: 'Horse head (STUB)',
      endsAt: addMinutes(sunset, 60),
      nature: nakshatraNatures[nakshatraIdx % 3],
    },
    yoga: {
      name: yogaName,
      index: yogaIdx + 1,
      endsAt: addMinutes(sunset, 90),
      auspiciousness: inauspYogas.includes(yogaName) ? 'Inauspicious' : 'Auspicious',
    },
    karana: {
      name: karanaName,
      endsAt: addMinutes(sunrise, 360),
      isInauspicious: karanaName === 'Vishti',
    },
    astronomical: {
      sunrise,
      sunset,
      moonrise,
      moonset,
      dayLengthMinutes: Math.round(
        (new Date(sunset).getTime() - new Date(sunrise).getTime()) / 60000,
      ),
    },
    inauspiciousPeriods: [
      { name: 'Rahu Kalam',   start: rahuStart,   end: rahuEnd,   avoidance: 'Avoid beginning new work, travel, financial transactions.' },
      { name: 'Gulika Kalam', start: gulikaStart, end: gulikaEnd, avoidance: 'Avoid auspicious ceremonies and new projects.' },
      { name: 'Yamaganda',    start: yamaStart,   end: yamaEnd,   avoidance: 'Avoid travel south and important decisions.' },
    ],
    auspiciousPeriods: [
      { name: 'Abhijit Muhurta', start: abhijitStart, end: abhijitEnd, description: 'Most auspicious daily window (~48 min). Excellent for all new beginnings.' },
      { name: 'Brahma Muhurta',  start: brahmaStart,  end: brahmaEnd,  description: 'Pre-dawn auspicious period ideal for meditation, study, and prayer.' },
    ],
    computedAt: new Date().toISOString(),
  };
}

// ─── PUBLIC: getMuhurta ───────────────────────────────────────────────────────

/**
 * STUB: getMuhurta
 *
 * Finds auspicious time windows for the given purpose on the given date.
 * In this stub, windows are derived from the Panchang inauspicious periods
 * by finding gaps — not from purpose-specific scoring rules.
 *
 * @param query  MuhurtaQuery with date, purpose, and location.
 * @returns      MuhurtaResult with auspicious windows and recommendation.
 */
export function getMuhurta(query: MuhurtaQuery): MuhurtaResult {
  const panchang = getPanchang(
    query.date,
    query.latitude,
    query.longitude,
    query.timezone,
  );

  const sunrise = panchang.astronomical.sunrise;
  const sunset  = panchang.astronomical.sunset;

  // Collect inauspicious ranges
  const blocked = panchang.inauspiciousPeriods.map(p => ({
    start: new Date(p.start).getTime(),
    end: new Date(p.end).getTime(),
  }));

  // Build candidate hourly windows across the day
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs  = new Date(sunset).getTime();
  const dayMinutes = Math.round((sunsetMs - sunriseMs) / 60000);

  const windows: MuhurtaWindow[] = [];
  const inausWindows: InauspiciousWindow[] = [];

  // Check 90-minute windows starting every 90 minutes from sunrise
  for (let offset = 0; offset < dayMinutes - 90; offset += 90) {
    const wStart = new Date(sunriseMs + offset * 60000).toISOString();
    const wEnd   = new Date(sunriseMs + (offset + 90) * 60000).toISOString();
    const wStartMs = sunriseMs + offset * 60000;
    const wEndMs   = wStartMs + 90 * 60000;

    const overlapsBlocked = blocked.some(
      b => wStartMs < b.end && wEndMs > b.start
    );

    // Check if Abhijit Muhurta falls in this window
    const abhijit = panchang.auspiciousPeriods.find(p => p.name === 'Abhijit Muhurta');
    const hasAbhijit = abhijit
      ? wStartMs <= new Date(abhijit.start).getTime() &&
        wEndMs >= new Date(abhijit.end).getTime()
      : false;

    if (overlapsBlocked) {
      const blockReason = blocked
        .filter(b => wStartMs < b.end && wEndMs > b.start)
        .map(b =>
          panchang.inauspiciousPeriods.find(
            p => new Date(p.start).getTime() === b.start,
          )?.name ?? 'Inauspicious period'
        )
        .join(', ');
      inausWindows.push({ start: wStart, end: wEnd, reason: blockReason });
    } else {
      const quality = hasAbhijit ? 'Excellent' : offset < 180 ? 'Good' : 'Acceptable';
      windows.push({
        start: wStart,
        end: wEnd,
        quality,
        durationMinutes: 90,
        auspiciousReasons: [
          hasAbhijit ? 'Includes Abhijit Muhurta — universally auspicious.' : `${panchang.nakshatra.name} nakshatra is in effect.`,
          `Tithi: ${panchang.tithi.name} (${panchang.tithi.auspiciousness}).`,
          `Vara: ${panchang.vara.name} — ${panchang.vara.auspiciousness} for ${query.purpose}.`,
        ],
        caveats: undefined,
        panchangSnapshot: {
          nakshatra: panchang.nakshatra.name,
          tithi: panchang.tithi.name,
          vara: panchang.vara.name,
          yoga: panchang.yoga.name,
          karana: panchang.karana.name,
        },
      });
    }
  }

  // Sort: Excellent first, then Good, then Acceptable
  const qualityOrder = { Excellent: 0, Good: 1, Acceptable: 2 };
  windows.sort((a, b) => qualityOrder[a.quality] - qualityOrder[b.quality]);

  const best = windows[0] ?? null;

  const formattedBest = best
    ? `${new Date(best.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: query.timezone })} – ` +
      `${new Date(best.end).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: query.timezone })}`
    : 'No auspicious window found';

  return {
    query,
    auspiciousWindows: windows,
    inauspiciousWindows: inausWindows,
    bestWindow: best,
    recommendationEn:
      `STUB: Best ${query.purpose} Muhurta on ${query.date} is ${formattedBest}. ` +
      `${panchang.vara.auspiciousness === 'Excellent' ? `${panchang.vara.name} is highly auspicious for this purpose. ` : ''}` +
      `Avoid ${panchang.inauspiciousPeriods.map(p => p.name).join(', ')}.`,
    recommendationHi:
      `STUB: ${query.date} को ${query.purpose} मुहूर्त ${formattedBest} है। ` +
      `${panchang.inauspiciousPeriods.map(p => p.name).join(', ')} से बचें।`,
    computedAt: new Date().toISOString(),
  };
}
