/**
 * chartAdapter.ts — seed-bank record → `ChartData` → `DashaForecastResult`.
 *
 * This is the file that makes the Answer Layer survive contact with the real
 * types. Two responsibilities:
 *   1. build a full `ChartData` for a jatak through the repo's own
 *      timezone-aware path, so a 1942–45 wartime birth gets +6:30 rather than
 *      a silently-wrong IST ascendant;
 *   2. hand the engine the explicit forecast fields it needs, throwing loudly
 *      (with a shape dump) rather than silently mis-scoring if `ChartData`
 *      ever changes shape.
 */

import type { ChartData } from '@/hooks/useChartCalculation';
import type { DashaForecastResult } from '@/services/dashaForecastService';
import { runDashaForecast, toDashaForecastPlanets } from '@/services/dashaForecastService';
import { buildChartData } from '@/services/chartBuilderService';
import type { NormalizedPlanet } from '@/services/ephemerisService';
import { resolveBirthTimezone } from '@/lib/birthTimezone';
import { setBirthTimezone } from '@/hooks/use-birth-timezone';
import { locationOf, toSubject, type JatakRecord } from '@/lib/jataks/resolveJatak';

/** ChartData is expensive to build; cache by jatak id. */
const chartCache = new Map<string, ChartData>();

export function buildChartFor(jatak: JatakRecord, asOf: string): ChartData {
  const key = `${jatak.id}::${asOf}`;
  const hit = chartCache.get(key);
  if (hit) return hit;

  const s = toSubject(jatak);

  // Resolve the HISTORICAL offset (wartime +6:30, HMT, LMT) and publish it to
  // the module store, so every downstream service reads the same offset.
  setBirthTimezone(resolveBirthTimezone({ date: s.dob, location: locationOf(jatak) }));

  const { data } = buildChartData({ date: s.dob, time: s.tob, lat: s.lat, lon: s.lon });
  chartCache.set(key, data);
  return data;
}

interface DashaSlice {
  planet: string;
  startDate: Date | string;
  endDate: Date | string;
}

export function pickDasha(chart: ChartData): { md: DashaSlice; ad: DashaSlice | null } {
  const md = chart.dasha?.currentMahadasha ?? null;
  const ad = chart.dasha?.currentAntardasha ?? null;

  if (!md?.planet || !md.startDate || !md.endDate) {
    throw new Error(
      'Cannot locate the current Mahadasha on ChartData (probed chart.dasha.currentMahadasha). ' +
        `ChartData keys present: ${Object.keys(chart).join(', ')}`
    );
  }
  return {
    md: { planet: md.planet, startDate: md.startDate, endDate: md.endDate },
    ad: ad?.planet ? { planet: ad.planet, startDate: ad.startDate, endDate: ad.endDate } : null,
  };
}

function pickAscendantRashi(chart: ChartData): number {
  const rashi = chart.ascendant?.ascendant.rashiIndex;
  if (typeof rashi !== 'number') throw new Error('Cannot locate ascendant rashiIndex on ChartData.');
  return rashi;
}

function pickPlanets(chart: ChartData): NormalizedPlanet[] {
  const planets = chart.planetaryPositions?.planets;
  if (!planets?.length) throw new Error('Cannot locate planetary positions on ChartData.');
  return planets;
}

export function forecastFor(chart: ChartData): DashaForecastResult {
  const { md, ad } = pickDasha(chart);
  return runDashaForecast({
    referenceType: 'natal',
    planets: toDashaForecastPlanets(pickPlanets(chart), chart.shadbala ?? null),
    ascendantRashiIndex: pickAscendantRashi(chart),
    mdLord: md.planet,
    mdStartDate: md.startDate,
    mdEndDate: md.endDate,
    ...(ad ? { adLord: ad.planet, adStartDate: ad.startDate, adEndDate: ad.endDate } : {}),
    shadbala: chart.shadbala ?? null,
    divisionalCharts: chart.divisionalCharts,
  });
}
