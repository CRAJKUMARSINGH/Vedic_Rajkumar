/**
 * engine-adapter.ts
 *
 * Adapts the live production engine output into the EngineOutput shape expected
 * by the comparator.  This MUST import the same engine the app ships — never a
 * re-implementation — so any accuracy regression in the app is caught here.
 */

import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import type { CorpusChart, EngineOutput, GrahaResult } from './types.js';

// Resolve @/ aliases to src/ absolute paths for Node execution outside Vite.
const ROOT = new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

/**
 * Convert a corpus chart (IANA tz + date + time) to a UTC offset in decimal hours.
 * Uses Intl.DateTimeFormat — same as the kundli engine — with our historical
 * India wartime override on top.
 */
function resolveOffset(chart: CorpusChart): number {
  // Historical India wartime override — Intl.DateTimeFormat does not carry pre-
  // independence wartime rules for Asia/Kolkata.
  if (chart.tz === 'Asia/Kolkata') {
    const d = chart.date.split('-').map(Number);
    const di = d[0] * 10000 + d[1] * 100 + d[2];
    if ((di >= 19411001 && di <= 19420514) || (di >= 19420901 && di <= 19451014)) {
      return 6.5; // India wartime UTC+6:30
    }
    return 5.5; // Modern IST
  }

  // All other timezones: use Intl.DateTimeFormat resolution
  try {
    const [y, mo, day] = chart.date.split('-').map(Number);
    const [h, mi] = chart.time.split(':').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, day, h, mi, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: chart.tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(dt);
    const gp = (type: string) => Number(parts.find(p => p.type === type)?.value ?? '0');
    const tzMs = Date.UTC(gp('year'), gp('month') - 1, gp('day'), gp('hour'), gp('minute'), gp('second'));
    return (tzMs - dt.getTime()) / 3_600_000;
  } catch {
    return 5.5; // fallback IST
  }
}

function norm360(d: number): number { return ((d % 360) + 360) % 360; }
function rashiName(lon: number): string {
  const RASHIS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return RASHIS[Math.floor(norm360(lon) / 30)];
}
function nakshatraName(lon: number): string {
  const NAKS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  return NAKS[Math.min(26, Math.floor(norm360(lon) / (360 / 27)))];
}
function pada(lon: number): number {
  const span = 360 / 27;
  return Math.min(4, Math.floor((norm360(lon) % span) / (span / 4)) + 1);
}

/**
 * Run the live engine for a single corpus chart and return a normalised
 * EngineOutput.  Throws on engine error — let the runner catch it.
 */
export async function runEngine(chart: CorpusChart): Promise<EngineOutput> {
  // Dynamic import so this file works in both `tsx` and compiled contexts.
  // The @/ alias is resolved to the absolute src path.
  const engPath = join(ROOT, 'src', 'services', 'precisionEphemerisService.ts');

  // Use tsx-register via a dynamic import that resolves the alias.
  // The caller is expected to run this under `tsx` or `ts-node` with paths.
  const eng = await import(/* @vite-ignore */ `${ROOT}/src/services/precisionEphemerisService.ts`);

  const offset = resolveOffset(chart);
  const timeStr = chart.time.substring(0, 5); // HH:MM

  const pc = eng.calculatePreciseChart(chart.date, timeStr, chart.lat, chart.lon, offset);

  const grahas: GrahaResult[] = pc.planets.map((p: {
    name: string;
    tropicalLongitude: number;
    siderealLongitude: number;
    rashiName: string;
  }) => ({
    name:      p.name,
    tropical:  p.tropicalLongitude,
    sidereal:  p.siderealLongitude,
    rashi:     p.rashiName,
    nakshatra: nakshatraName(p.siderealLongitude),
    pada:      pada(p.siderealLongitude),
  }));

  return {
    julianDay: pc.julianDay,
    ayanamsa:  pc.ayanamsa,
    ascendant: {
      tropical:  pc.ascendant.tropicalLongitude,
      sidereal:  pc.ascendant.siderealLongitude,
      rashi:     pc.ascendant.rashiName,
      nakshatra: nakshatraName(pc.ascendant.siderealLongitude),
      pada:      pada(pc.ascendant.siderealLongitude),
    },
    grahas,
  };
}
