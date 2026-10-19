/**
 * generateGolden.test.ts
 *
 * Writes golden JSON files for every corpus entry from the live engine output.
 * This creates the self-consistent baseline. Once you cross-check values in
 * JHora and Swiss Ephemeris, commit the golden files — the corpus gate then
 * catches any future regression.
 *
 * Run:
 *   npx vitest run src/tests/accuracy/generateGolden.test.ts
 *
 * This is safe to re-run — it overwrites only if the engine output changed.
 * It does NOT auto-run in the normal test suite (filtered by name).
 */

import { describe, it, expect } from 'vitest';
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  calculatePreciseChart,
  NAKSHATRA_DATA,
} from '@/services/precisionEphemerisService';
import { resolveBirthTimezone } from '@/lib/birthTimezone';

const ROOT       = process.cwd();
const GOLDEN_DIR = join(ROOT, 'tools', 'accuracy', 'golden');

mkdirSync(GOLDEN_DIR, { recursive: true });

interface CorpusEntry {
  id: string; label: string;
  date: string; time: string;
  lat: number; lon: number;
  tz: string; place: string;
}

const CORPUS: CorpusEntry[] = [
  { id:'IN-1935-BOM-001', label:'Bombay Time era — pre-IST',          date:'1935-06-12', time:'04:27', lat:19.076,  lon:72.8777, tz:'Asia/Kolkata',      place:'Mumbai'       },
  { id:'IN-1943-BOM-002', label:'India wartime UTC+6:30',              date:'1943-06-15', time:'04:27', lat:19.076,  lon:72.8777, tz:'Asia/Kolkata',      place:'Mumbai'       },
  { id:'IN-1941-DEL-004', label:'Wartime period 1 — Delhi',           date:'1941-12-01', time:'06:15', lat:28.7041, lon:77.1025, tz:'Asia/Kolkata',      place:'Delhi'        },
  { id:'IN-1942-GAP-005', label:'IST gap between wartime periods',     date:'1942-06-01', time:'10:00', lat:22.5726, lon:88.3639, tz:'Asia/Kolkata',      place:'Kolkata'      },
  { id:'IN-1945-END-006', label:'Last day of wartime offset',          date:'1945-10-14', time:'23:59', lat:19.076,  lon:72.8777, tz:'Asia/Kolkata',      place:'Mumbai'       },
  { id:'IN-1945-IST-007', label:'First day back to IST',               date:'1945-10-15', time:'00:01', lat:19.076,  lon:72.8777, tz:'Asia/Kolkata',      place:'Mumbai'       },
  { id:'IN-1906-IST-008', label:'IST adoption year',                   date:'1906-03-15', time:'12:00', lat:13.0827, lon:80.2707, tz:'Asia/Kolkata',      place:'Madras'       },
  { id:'IN-1960-MID-009', label:'Midnight boundary chart',             date:'1960-01-01', time:'00:00', lat:22.72,   lon:75.86,   tz:'Asia/Kolkata',      place:'Indore'       },
  { id:'XX-1990-LAT64-003', label:'High-latitude ambiguous ascendant', date:'1990-07-15', time:'14:30', lat:64.0,    lon:20.0,    tz:'Europe/Stockholm',  place:'Umeå, Sweden' },
  { id:'XX-1990-LAT0-010', label:'Equatorial chart',                   date:'1990-01-01', time:'06:00', lat:0.0,     lon:36.8,    tz:'Africa/Nairobi',    place:'Nairobi'      },
  { id:'IN-2000-IND-011', label:'Modern IST reference — Indore',       date:'2000-10-26', time:'00:50', lat:22.72,   lon:75.86,   tz:'Asia/Kolkata',      place:'Indore'       },
  { id:'IN-1990-JYP-012', label:'Nakshatra boundary — Jaipur',        date:'1990-09-23', time:'18:32', lat:26.9124, lon:75.7873, tz:'Asia/Kolkata',      place:'Jaipur'       },
  { id:'XX-1970-LON-013', label:'Western reference — London',          date:'1970-06-21', time:'12:00', lat:51.5074, lon:-0.1278, tz:'Europe/London',     place:'London'       },
  { id:'XX-2010-NYC-014', label:'Western reference — New York',        date:'2010-03-14', time:'09:00', lat:40.7128, lon:-74.006, tz:'America/New_York',  place:'New York'     },
  { id:'IN-1935-LEP-015', label:'Leap year edge — 1936',               date:'1936-02-29', time:'12:00', lat:19.076,  lon:72.8777, tz:'Asia/Kolkata',      place:'Mumbai'       },
];

function resolveOffset(e: CorpusEntry): number {
  if (e.tz === 'Asia/Kolkata') {
    const r = resolveBirthTimezone({ date: e.date, location: e.place });
    if (r) return r.offsetHours;
    return 5.5;
  }
  try {
    const [y, mo, d] = e.date.split('-').map(Number);
    const [h, mi]    = e.time.split(':').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: e.tz, hourCycle: 'h23',
      year:'numeric', month:'2-digit', day:'2-digit',
      hour:'2-digit', minute:'2-digit', second:'2-digit',
    }).formatToParts(dt);
    const gp = (t: string) => Number(parts.find(p => p.type === t)?.value ?? '0');
    return (Date.UTC(gp('year'), gp('month')-1, gp('day'), gp('hour'), gp('minute'), gp('second')) - dt.getTime()) / 3_600_000;
  } catch { return 0; }
}

function nakshatraOf(lon: number): string {
  return NAKSHATRA_DATA[Math.min(26, Math.floor(((lon % 360) + 360) % 360 / (360 / 27)))].name;
}
function padaOf(lon: number): number {
  const span = 360 / 27;
  return Math.min(4, Math.floor((((lon % 360) + 360) % 360 % span) / (span / 4)) + 1);
}

describe('generate golden files', () => {
  it(`writes ${CORPUS.length} golden files`, () => {
    let written = 0;
    let unchanged = 0;
    const manifest: { id: string; written: boolean; offsetHours: number }[] = [];

    for (const e of CORPUS) {
      const offset = resolveOffset(e);
      const chart  = calculatePreciseChart(e.date, e.time, e.lat, e.lon, offset);

      const golden = {
        _meta: {
          chartId:     e.id,
          label:       e.label,
          date:        e.date,
          time:        e.time,
          place:       e.place,
          lat:         e.lat,
          lon:         e.lon,
          tz:          e.tz,
          offsetHours: offset,
          generatedAt: new Date().toISOString(),
          engine:      'precisionEphemerisService / Schlyter VSOP87 truncated',
          note:        'Self-consistent baseline. Cross-check in JHora and update if JHora disagrees.',
        },
        julianDay: chart.julianDay,
        ayanamsa:  chart.ayanamsa,
        ascendant: {
          tropical:  chart.ascendant.tropicalLongitude,
          sidereal:  chart.ascendant.siderealLongitude,
          rashi:     chart.ascendant.rashiName,
          nakshatra: nakshatraOf(chart.ascendant.siderealLongitude),
          pada:      padaOf(chart.ascendant.siderealLongitude),
          degrees:   chart.ascendant.degrees,
          minutes:   chart.ascendant.minutes,
          seconds:   chart.ascendant.seconds,
        },
        grahas: chart.planets.map(p => ({
          name:      p.name,
          tropical:  p.tropicalLongitude,
          sidereal:  p.siderealLongitude,
          rashi:     p.rashiName,
          nakshatra: nakshatraOf(p.siderealLongitude),
          pada:      padaOf(p.siderealLongitude),
          degrees:   p.degrees,
          minutes:   p.minutes,
          seconds:   p.seconds,
          retro:     p.isRetrograde,
        })),
        nakshatra: chart.nakshatra,
      };

      const path   = join(GOLDEN_DIR, `${e.id}.json`);
      const newStr = JSON.stringify(golden, null, 2) + '\n';
      const oldStr = existsSync(path) ? readFileSync(path, 'utf8') : '';

      // Only rewrite if content changed (ignore generatedAt timestamp)
      const newCmp = newStr.replace(/"generatedAt":\s*"[^"]*"/, '"generatedAt":"REPLACED"');
      const oldCmp = oldStr.replace(/"generatedAt":\s*"[^"]*"/, '"generatedAt":"REPLACED"');
      if (newCmp !== oldCmp) {
        writeFileSync(path, newStr, 'utf8');
        written++;
        manifest.push({ id: e.id, written: true, offsetHours: offset });
      } else {
        unchanged++;
        manifest.push({ id: e.id, written: false, offsetHours: offset });
      }
    }

    // Write manifest
    writeFileSync(
      join(GOLDEN_DIR, 'manifest.json'),
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        engine: 'precisionEphemerisService',
        corpusCount: CORPUS.length,
        written,
        unchanged,
        charts: manifest,
      }, null, 2) + '\n',
      'utf8',
    );

    console.log(`\n  Golden files: ${written} written, ${unchanged} unchanged`);
    console.log(`  Manifest: tools/accuracy/golden/manifest.json`);
    console.log(`\n  ⚠  These are self-consistent baselines from the Schlyter engine.`);
    console.log(`     Cross-check the 3 adversarial charts in JHora:`);
    console.log(`       IN-1935-BOM-001  — Bombay Time era (pre-IST)`);
    console.log(`       IN-1943-BOM-002  — India wartime +6:30`);
    console.log(`       IN-2000-IND-011  — Modern Indore (easiest JHora export)`);
    console.log(`     Update golden JSON if JHora disagrees by > 1°.\n`);

    expect(written + unchanged).toBe(CORPUS.length);
  });
});
