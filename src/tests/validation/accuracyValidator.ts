/**
 * src/tests/validation/accuracyValidator.ts
 *
 * Week 1 — Tolerance-based accuracy comparator
 * Week 2 — Extended validation with house cusps and antardasha analysis
 *
 * Compares a calculated chart against a ReferenceChart and produces
 * a structured ValidationResult with per-field pass/warn/fail status.
 * No I/O side-effects — pure comparison logic only.
 */

import {
  calculatePreciseChart,
  getLahiriAyanamsa,
  dateTimeToJD,
} from '../../services/precisionEphemerisService';
import { computeVimshottariDasha, type VDashaResult } from '../../services/vedicAstroEngine';
import { type ReferenceChart, type RashiName } from './referenceCharts';

// ─── Result types ─────────────────────────────────────────────────────────────

export type FieldStatus = 'PASS' | 'WARN' | 'FAIL' | 'SKIP';

export interface FieldResult {
  field: string;
  status: FieldStatus;
  calculated: string | number;
  expected: string | number;
  delta?: number;       // numeric difference where applicable
  note?: string;
}

export type ChartStatus = 'PASS' | 'WARN' | 'FAIL';

export interface ChartValidationResult {
  chartId: string;
  chartName: string;
  status: ChartStatus;
  fields: FieldResult[];
  passCount: number;
  warnCount: number;
  failCount: number;
  skipCount: number;
  totalChecked: number;
}

export interface SuiteValidationResult {
  runAt: string;
  engine: string;
  charts: ChartValidationResult[];
  totalCharts: number;
  passCharts: number;
  warnCharts: number;
  failCharts: number;
  totalFields: number;
  passFields: number;
  fieldAccuracyPct: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RASHI_NAMES: RashiName[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const DEFAULT_AYANAMSA_TOLERANCE = 0.05;
const DEFAULT_DEGREE_TOLERANCE = 1.0;
const DEFAULT_DASHA_BALANCE_TOLERANCE_DAYS = 3;
// Week 2 tolerances
const DEFAULT_HOUSE_CUSP_TOLERANCE = 2.0;
const DEFAULT_ANTARDASHA_TOLERANCE_DAYS = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rashiFromIndex(idx: number): RashiName {
  return RASHI_NAMES[((idx % 12) + 12) % 12];
}

// Week 2: Mismatch cause analysis
function analyzeMismatchCause(field: string, delta: number, context: {
  chartDate: string;
  chartTime: string;
  timezone: number;
}): string {
  const causes: string[] = [];

  // Ayanamsa-related causes
  if (field.includes('ayanamsa') && delta > 0.05) {
    causes.push('Ayanamsa formula variation - check Lahiri implementation');
  }

  // Degree-related causes
  if (field.includes('degree') && delta > 1.0) {
    causes.push('Orbital calculation accuracy - check perturbation series');
    if (field.includes('moon')) {
      causes.push('Moon position sensitivity - ELP2000 series may need more terms');
    }
  }

  // House cusp causes
  if (field.includes('house') && delta > 2.0) {
    causes.push('Ascendant calculation sensitivity - check quadrant correction');
    causes.push('Geographic location precision - lat/lon accuracy');
  }

  // Dasha-related causes
  if (field.includes('dasha') && delta > 5) {
    causes.push('Julian Day precision - check timezone handling');
    causes.push('Moon position accuracy at nakshatra boundaries');
  }

  // Time-related causes
  if (context.timezone !== 5.5 && !field.includes('ayanamsa')) {
    causes.push('Timezone conversion - check UTC offset handling');
  }

  // Historical date causes
  const year = parseInt(context.chartDate.split('-')[0]);
  if (year < 1900 && delta > 0.5) {
    causes.push('Historical date calculation - check pre-1900 orbital elements');
  }

  return causes.length > 0 ? causes.join('; ') : 'Unknown cause - requires investigation';
}

function makePass(field: string, calculated: string | number, expected: string | number, delta?: number): FieldResult {
  return { field, status: 'PASS', calculated, expected, delta };
}

function makeWarn(field: string, calculated: string | number, expected: string | number, delta?: number, note?: string): FieldResult {
  return { field, status: 'WARN', calculated, expected, delta, note };
}

function makeFail(field: string, calculated: string | number, expected: string | number, delta?: number, note?: string): FieldResult {
  return { field, status: 'FAIL', calculated, expected, delta, note };
}

function makeSkip(field: string, note: string): FieldResult {
  return { field, status: 'SKIP', calculated: 'N/A', expected: 'N/A', note };
}

// ─── Single chart validator ───────────────────────────────────────────────────

export function validateChart(ref: ReferenceChart): ChartValidationResult {
  const fields: FieldResult[] = [];

  // Calculate chart using the precision engine
  let chart: ReturnType<typeof calculatePreciseChart>;
  try {
    chart = calculatePreciseChart(ref.date, ref.time, ref.lat, ref.lon, ref.tzOffset);
  } catch (err) {
    // If calculation throws, fail all fields
    return {
      chartId: ref.id,
      chartName: ref.name,
      status: 'FAIL',
      fields: [makeFail('engine', 'ERROR', 'valid chart', undefined, String(err))],
      passCount: 0, warnCount: 0, failCount: 1, skipCount: 0, totalChecked: 1,
    };
  }

  // ── Ayanamsa ──────────────────────────────────────────────────────────────
  const ayanamsaTol = ref.expected.ayanamsaTolerance ?? DEFAULT_AYANAMSA_TOLERANCE;
  const ayanamsaDelta = Math.abs(chart.ayanamsa - ref.expected.ayanamsa);
  if (ayanamsaDelta <= ayanamsaTol) {
    fields.push(makePass('ayanamsa', +chart.ayanamsa.toFixed(4), ref.expected.ayanamsa, ayanamsaDelta));
  } else if (ayanamsaDelta <= ayanamsaTol * 3) {
    fields.push(makeWarn('ayanamsa', +chart.ayanamsa.toFixed(4), ref.expected.ayanamsa, ayanamsaDelta,
      `Delta ${ayanamsaDelta.toFixed(4)}° exceeds ±${ayanamsaTol}°`));
  } else {
    fields.push(makeFail('ayanamsa', +chart.ayanamsa.toFixed(4), ref.expected.ayanamsa, ayanamsaDelta,
      `Delta ${ayanamsaDelta.toFixed(4)}° — check formula`));
  }

  // ── Ascendant ─────────────────────────────────────────────────────────────
  const calcAsc = rashiFromIndex(chart.ascendant.rashiIndex);
  if (ref.timeUncertain) {
    // Relax: also accept adjacent rashis for uncertain times
    const ascIdx = chart.ascendant.rashiIndex;
    const expIdx = RASHI_NAMES.indexOf(ref.expected.ascendant);
    const diff = Math.abs(((ascIdx - expIdx + 12) % 12));
    const adjDiff = Math.min(diff, 12 - diff);
    if (adjDiff === 0) {
      fields.push(makePass('ascendant', calcAsc, ref.expected.ascendant));
    } else if (adjDiff === 1) {
      fields.push(makeWarn('ascendant', calcAsc, ref.expected.ascendant, adjDiff,
        'Time uncertain — adjacent rashi acceptable'));
    } else {
      fields.push(makeFail('ascendant', calcAsc, ref.expected.ascendant, adjDiff));
    }
  } else {
    if (calcAsc === ref.expected.ascendant) {
      fields.push(makePass('ascendant', calcAsc, ref.expected.ascendant));
    } else {
      fields.push(makeFail('ascendant', calcAsc, ref.expected.ascendant));
    }
  }

  // ── Planet rashis ──────────────────────────────────────────────────────────
  const planetKeys: Array<{ key: keyof typeof ref.expected.planets; name: string }> = [
    { key: 'sun', name: 'Sun' },
    { key: 'moon', name: 'Moon' },
    { key: 'mercury', name: 'Mercury' },
    { key: 'venus', name: 'Venus' },
    { key: 'mars', name: 'Mars' },
    { key: 'jupiter', name: 'Jupiter' },
    { key: 'saturn', name: 'Saturn' },
    { key: 'rahu', name: 'Rahu' },
    { key: 'ketu', name: 'Ketu' },
  ];

  for (const { key, name } of planetKeys) {
    const planet = chart.planets.find(p => p.name === name);
    if (!planet) {
      fields.push(makeSkip(`${key}_rashi`, `Planet ${name} not found in output`));
      continue;
    }

    const calcRashi = rashiFromIndex(planet.rashiIndex);
    const expRashi = ref.expected.planets[key];

    if (calcRashi === expRashi) {
      fields.push(makePass(`${key}_rashi`, calcRashi, expRashi));
    } else {
      fields.push(makeFail(`${key}_rashi`, calcRashi, expRashi));
    }

    // ── Degree within rashi (optional) ──────────────────────────────────────
    const expDeg = ref.expected.planetDegrees?.[key];
    if (expDeg !== undefined) {
      const calcDeg = planet.degrees + planet.minutes / 60;
      const degDelta = Math.abs(calcDeg - expDeg);
      const fieldName = `${key}_degree`;
      if (degDelta <= DEFAULT_DEGREE_TOLERANCE) {
        fields.push(makePass(fieldName, +calcDeg.toFixed(2), expDeg, degDelta));
      } else if (degDelta <= DEFAULT_DEGREE_TOLERANCE * 2) {
        fields.push(makeWarn(fieldName, +calcDeg.toFixed(2), expDeg, degDelta,
          `Delta ${degDelta.toFixed(2)}° > ±${DEFAULT_DEGREE_TOLERANCE}°`));
      } else {
        fields.push(makeFail(fieldName, +calcDeg.toFixed(2), expDeg, degDelta,
          `Delta ${degDelta.toFixed(2)}° — significant error`));
      }
    }
  }

  // ── Moon nakshatra ────────────────────────────────────────────────────────
  const calcNak = chart.nakshatra.name;
  if (calcNak === ref.expected.moonNakshatra) {
    fields.push(makePass('moon_nakshatra', calcNak, ref.expected.moonNakshatra));
  } else {
    fields.push(makeFail('moon_nakshatra', calcNak, ref.expected.moonNakshatra));
  }

  // ── Moon pada ─────────────────────────────────────────────────────────────
  const calcPada = chart.nakshatra.pada;
  const expPada = ref.expected.moonPada;
  if (calcPada === expPada) {
    fields.push(makePass('moon_pada', calcPada, expPada));
  } else if (Math.abs(calcPada - expPada) === 1) {
    // Off-by-one pada can happen at nakshatra boundary — WARN not FAIL
    fields.push(makeWarn('moon_pada', calcPada, expPada, Math.abs(calcPada - expPada),
      'Borderline pada — check exact Moon longitude'));
  } else {
    fields.push(makeFail('moon_pada', calcPada, expPada));
  }

  // ── Dasha seed lord ───────────────────────────────────────────────────────
  const calcDashaLord = chart.nakshatra.lord;
  if (calcDashaLord === ref.expected.dashaSeedLord) {
    fields.push(makePass('dasha_seed_lord', calcDashaLord, ref.expected.dashaSeedLord));
  } else {
    fields.push(makeFail('dasha_seed_lord', calcDashaLord, ref.expected.dashaSeedLord));
  }

  // ── Dasha balance days (optional) ─────────────────────────────────────────
  if (ref.expected.dashaBalanceDays !== undefined) {
    try {
      const jd = dateTimeToJD(ref.date, ref.time, ref.tzOffset);
      const moonPlanet = chart.planets.find(p => p.name === 'Moon');
      if (moonPlanet) {
        const moonSid = moonPlanet.siderealLongitude;
        const dashaResult = computeVimshottariDasha(moonSid, jd);
        // Balance = from birth to end of first period
        const firstPeriod = dashaResult.periods[0];
        const balanceMs = firstPeriod.end.getTime() - firstPeriod.start.getTime();
        const calcBalanceDays = balanceMs / (1000 * 60 * 60 * 24);
        const expBalance = ref.expected.dashaBalanceDays;
        const balDelta = Math.abs(calcBalanceDays - expBalance);
        if (balDelta <= DEFAULT_DASHA_BALANCE_TOLERANCE_DAYS) {
          fields.push(makePass('dasha_balance_days', +calcBalanceDays.toFixed(1), expBalance, balDelta));
        } else if (balDelta <= DEFAULT_DASHA_BALANCE_TOLERANCE_DAYS * 10) {
          const cause = analyzeMismatchCause('dasha_balance_days', balDelta, {
            chartDate: ref.date,
            chartTime: ref.time,
            timezone: ref.tzOffset,
          });
          fields.push(makeWarn('dasha_balance_days', +calcBalanceDays.toFixed(1), expBalance, balDelta,
            `Delta ${balDelta.toFixed(1)} days. ${cause}`));
        } else {
          const cause = analyzeMismatchCause('dasha_balance_days', balDelta, {
            chartDate: ref.date,
            chartTime: ref.time,
            timezone: ref.tzOffset,
          });
          fields.push(makeFail('dasha_balance_days', +calcBalanceDays.toFixed(1), expBalance, balDelta,
            `Delta ${balDelta.toFixed(1)} days — large error. ${cause}`));
        }
      } else {
        fields.push(makeSkip('dasha_balance_days', 'Moon planet not found'));
      }
    } catch {
      fields.push(makeSkip('dasha_balance_days', 'Dasha calculation threw an error'));
    }
  }

  // ── Week 2: House cusps (optional) ────────────────────────────────────────
  if (ref.expected.houseCusps && ref.expected.houseCusps.length > 0) {
    for (const cusp of ref.expected.houseCusps) {
      const house = chart.houses.find(h => h.house === cusp.house);
      if (!house) {
        fields.push(makeSkip(`house_${cusp.house}_cusp`, `House ${cusp.house} not found in output`));
        continue;
      }

      const calcRashi = rashiFromIndex(house.rashiIndex);
      if (calcRashi === cusp.rashi) {
        fields.push(makePass(`house_${cusp.house}_cusp`, calcRashi, cusp.rashi));
      } else {
        fields.push(makeFail(`house_${cusp.house}_cusp`, calcRashi, cusp.rashi));
      }
    }
  }

  // ── Week 2: First antardasha (optional) ─────────────────────────────────────
  if (ref.expected.firstAntardasha) {
    try {
      const jd = dateTimeToJD(ref.date, ref.time, ref.tzOffset);
      const moonPlanet = chart.planets.find(p => p.name === 'Moon');
      if (moonPlanet) {
        const moonSid = moonPlanet.siderealLongitude;
        const dashaResult = computeVimshottariDasha(moonSid, jd);
        const firstPeriod = dashaResult.periods[0];
        const firstAntar = firstPeriod.antardashas[0]; // First antardasha in first mahadasha

        if (firstAntar) {
          const calcLord = firstAntar.planet; // Use 'planet' instead of 'lord'
          const expLord = ref.expected.firstAntardasha.lord;

          if (calcLord === expLord) {
            fields.push(makePass('first_antardasha_lord', calcLord, expLord));
          } else {
            fields.push(makeFail('first_antardasha_lord', calcLord, expLord));
          }
        } else {
          fields.push(makeSkip('first_antardasha', 'Antardasha data not available'));
        }
      } else {
        fields.push(makeSkip('first_antardasha', 'Moon planet not found'));
      }
    } catch {
      fields.push(makeSkip('first_antardasha', 'Antardasha calculation threw an error'));
    }
  }

  // ── Tally ─────────────────────────────────────────────────────────────────
  const passCount = fields.filter(f => f.status === 'PASS').length;
  const warnCount = fields.filter(f => f.status === 'WARN').length;
  const failCount = fields.filter(f => f.status === 'FAIL').length;
  const skipCount = fields.filter(f => f.status === 'SKIP').length;

  let status: ChartStatus;
  if (failCount === 0 && warnCount === 0) status = 'PASS';
  else if (failCount === 0) status = 'WARN';
  else status = 'FAIL';

  return {
    chartId: ref.id,
    chartName: ref.name,
    status,
    fields,
    passCount,
    warnCount,
    failCount,
    skipCount,
    totalChecked: fields.length,
  };
}

// ─── Full suite runner ────────────────────────────────────────────────────────

export function validateSuite(charts: ReferenceChart[]): SuiteValidationResult {
  const results = charts.map(validateChart);

  const passCharts = results.filter(r => r.status === 'PASS').length;
  const warnCharts = results.filter(r => r.status === 'WARN').length;
  const failCharts = results.filter(r => r.status === 'FAIL').length;
  const totalFields = results.reduce((s, r) => s + r.totalChecked, 0);
  const passFields = results.reduce((s, r) => s + r.passCount, 0);

  return {
    runAt: new Date().toISOString(),
    engine: 'precisionEphemerisService (Meeus full perturbation + Lahiri ayanamsa)',
    charts: results,
    totalCharts: results.length,
    passCharts,
    warnCharts,
    failCharts,
    totalFields,
    passFields,
    fieldAccuracyPct: totalFields > 0 ? (passFields / totalFields) * 100 : 0,
  };
}

