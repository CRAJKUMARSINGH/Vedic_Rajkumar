/**
 * accuracyDashboardService.ts
 *
 * Week 10: Accuracy Dashboard Service.
 *
 * Runs the 15-chart reference validation suite in-browser using the live
 * precision engine. Returns a structured result showing pass/warn/fail
 * counts and per-chart field accuracy.
 *
 * This is the "accuracy dashboard" deliverable described in the Week 2 spec:
 * "an early internal accuracy dashboard or status summary."
 *
 * Uses:
 *   - REFERENCE_CHARTS from src/tests/validation/referenceCharts.ts
 *   - calculatePreciseChart from src/services/precisionEphemerisService.ts
 *
 * Usage:
 *   const result = runAccuracyCheck();
 *   // result.passCount, result.fieldAccuracyPercent, result.charts[0].status
 */

import { calculatePreciseChart } from '@/services/precisionEphemerisService';
import {
  REFERENCE_CHARTS,
  type ReferenceChart,
} from '@/tests/validation/referenceCharts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccuracyStatus = 'PASS' | 'WARN' | 'FAIL';

export interface FieldResult {
  field: string;
  expected: string | number;
  calculated: string | number;
  status: AccuracyStatus;
  tolerance?: number;
}

export interface ChartAccuracyResult {
  id: string;
  name: string;
  date: string;
  place: string;
  status: AccuracyStatus;
  fields: FieldResult[];
  passFields: number;
  warnFields: number;
  failFields: number;
  totalFields: number;
  error?: string;  // if engine threw
}

export interface AccuracyDashboardResult {
  charts: ChartAccuracyResult[];
  totalCharts: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  totalFields: number;
  passFields: number;
  fieldAccuracyPercent: number;
  runDurationMs: number;
  runAt: string;
  engineVersion: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RASHI_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
] as const;

const AYANAMSA_TOLERANCE = 0.05;
const PLANET_DEGREE_TOLERANCE = 1.0;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signFromIndex(idx: number): string {
  return RASHI_NAMES[((idx % 12) + 12) % 12];
}

function degDiff(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function checkField(
  field: string,
  expected: string | number,
  calculated: string | number,
  tolerance?: number,
): FieldResult {
  if (tolerance !== undefined) {
    const diff = degDiff(Number(expected), Number(calculated));
    const status: AccuracyStatus = diff <= tolerance ? 'PASS' : diff <= tolerance * 2 ? 'WARN' : 'FAIL';
    return { field, expected, calculated, status, tolerance };
  }
  const status: AccuracyStatus =
    String(expected).toLowerCase() === String(calculated).toLowerCase() ? 'PASS' : 'FAIL';
  return { field, expected, calculated, status };
}

// ─── Core validation ──────────────────────────────────────────────────────────

function validateChart(ref: ReferenceChart): ChartAccuracyResult {
  const fields: FieldResult[] = [];

  try {
    const chart = calculatePreciseChart(
      ref.date,
      ref.time,
      ref.lat,
      ref.lon,
      ref.tzOffset,
    );

    // Ayanamsa
    fields.push(checkField(
      'ayanamsa',
      ref.expected.ayanamsa,
      parseFloat(chart.ayanamsa.toFixed(3)),
      ref.expected.ayanamsaTolerance ?? AYANAMSA_TOLERANCE,
    ));

    // Ascendant rashi
    const ascSign = signFromIndex(chart.ascendant.rashiIndex);
    fields.push(checkField('ascendant_rashi', ref.expected.ascendant, ascSign));

    // 9 planet rashis
    const planetMap: Record<string, string> = {};
    chart.planets.forEach((p) => {
      planetMap[p.name.toLowerCase()] = signFromIndex(p.rashiIndex);
    });

    const planetKeys: Array<[keyof typeof ref.expected.planets, string]> = [
      ['sun', 'Sun'], ['moon', 'Moon'], ['mercury', 'Mercury'],
      ['venus', 'Venus'], ['mars', 'Mars'], ['jupiter', 'Jupiter'],
      ['saturn', 'Saturn'], ['rahu', 'Rahu'], ['ketu', 'Ketu'],
    ];

    for (const [key, planetName] of planetKeys) {
      const expected = ref.expected.planets[key];
      const calculated = planetMap[planetName.toLowerCase()] ?? 'Unknown';
      fields.push(checkField(`${planetName.toLowerCase()}_rashi`, expected, calculated));
    }

    // Moon nakshatra
    const moonNakshatra = chart.nakshatra?.name ?? 'Unknown';
    fields.push(checkField('moon_nakshatra', ref.expected.moonNakshatra, moonNakshatra));

    // Moon pada
    const moonPada = chart.nakshatra?.pada ?? 0;
    const padaDiff = Math.abs(moonPada - ref.expected.moonPada);
    fields.push({
      field: 'moon_pada',
      expected: ref.expected.moonPada,
      calculated: moonPada,
      status: padaDiff === 0 ? 'PASS' : padaDiff === 1 ? 'WARN' : 'FAIL',
    });

    // Dasha seed lord
    const dashaSeedLord = chart.nakshatra?.lord ?? 'Unknown';
    fields.push(checkField('dasha_seed_lord', ref.expected.dashaSeedLord, dashaSeedLord));

  } catch (err) {
    return {
      id: ref.id,
      name: ref.name,
      date: ref.date,
      place: ref.place,
      status: 'FAIL',
      fields: [],
      passFields: 0,
      warnFields: 0,
      failFields: 0,
      totalFields: 0,
      error: (err as Error).message ?? 'Calculation error',
    };
  }

  const passFields = fields.filter((f) => f.status === 'PASS').length;
  const warnFields = fields.filter((f) => f.status === 'WARN').length;
  const failFields = fields.filter((f) => f.status === 'FAIL').length;

  // Chart-level status: FAIL if any rashi fails, WARN if any warn, else PASS
  const rashiFields = fields.filter((f) => f.field.endsWith('_rashi'));
  const hasRashiFail = rashiFields.some((f) => f.status === 'FAIL');
  const hasAnyWarn   = fields.some((f) => f.status === 'WARN');

  let status: AccuracyStatus;
  if (hasRashiFail || failFields > 2) {
    status = 'FAIL';
  } else if (hasAnyWarn || failFields > 0) {
    status = 'WARN';
  } else {
    status = 'PASS';
  }

  return {
    id:          ref.id,
    name:        ref.name,
    date:        ref.date,
    place:       ref.place,
    status,
    fields,
    passFields,
    warnFields,
    failFields,
    totalFields: fields.length,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run the full 15-chart accuracy validation suite.
 * Returns structured results — no side effects, fully synchronous.
 *
 * Typical runtime: < 50ms (runs on every call — no caching).
 */
export function runAccuracyCheck(): AccuracyDashboardResult {
  const start = Date.now();

  const charts = REFERENCE_CHARTS.map(validateChart);

  const passCount  = charts.filter((c) => c.status === 'PASS').length;
  const warnCount  = charts.filter((c) => c.status === 'WARN').length;
  const failCount  = charts.filter((c) => c.status === 'FAIL').length;

  const totalFields = charts.reduce((s, c) => s + c.totalFields, 0);
  const passFields  = charts.reduce((s, c) => s + c.passFields, 0);
  const fieldAccuracyPercent =
    totalFields > 0 ? parseFloat(((passFields / totalFields) * 100).toFixed(1)) : 0;

  return {
    charts,
    totalCharts:          charts.length,
    passCount,
    warnCount,
    failCount,
    totalFields,
    passFields,
    fieldAccuracyPercent,
    runDurationMs:  Date.now() - start,
    runAt:          new Date().toISOString(),
    engineVersion:  'precisionEphemerisService (Meeus full perturbation)',
  };
}
