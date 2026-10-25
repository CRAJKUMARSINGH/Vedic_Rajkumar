/**
 * chartBuilderService.ts — plain-function builder for the full ChartData shape.
 *
 * `useChartCalculation` composes the nine derived chart products inside a React
 * hook, so there is no way to obtain a `ChartData` object from a Node script
 * (the answer-card emit script, the CI gate). This module is that missing pure
 * entry point: the same steps as the hook's default (VSOP87) path, without
 * React state, so a committed answer card is built from exactly the engine the
 * app ships.
 *
 * Swiss Ephemeris (VITE_USE_SWISS_EPHEMERIS) stays a browser-only option in the
 * hook; the card records `ephemeris: 'local'` accordingly.
 */

import {
  calculateCompletePlanetaryPositions,
  type CompletePlanetaryPositions,
} from '@/services/ephemerisService';
import { offsetForChart, calculatePlanetsForBirth } from '@/services/chartWithTimezone';
import { calculateCompleteAscendant, type AscendantData } from '@/services/ascendantService';
import { getNakshatraInfo, type NakshatraInfo } from '@/services/nakshatraService';
import { checkManglikDosha, type ManglikResult } from '@/services/manglikService';
import { calculateVimshottariDasha, type DashaResult } from '@/services/dashaService';
import { analyzeYogas, type YogaAnalysis } from '@/services/yogaService';
import { calculateShodashVarga, type ShodashVargaResult } from '@/services/divisionalChartsService';
import { calculateShadbala, type ShadabalaAnalysis } from '@/services/shadabalaService';
import { calculateAshtakavarga, type SarvashtakavargaResult } from '@/services/ashtakavargaService';
import { isoMonth } from '@/lib/astroUtils';
import type { BirthInput, ChartData } from '@/hooks/useChartCalculation';

export interface ChartBuildOptions {
  /** Explicit historical UTC offset. Falls back to the birth-timezone store. */
  tzOffsetHours?: number;
  isDaytime?: boolean;
}

export interface ChartBuildResult {
  data: ChartData;
  errors: Partial<Record<keyof ChartData, string>>;
}

export function buildChartData(
  input: BirthInput,
  options: ChartBuildOptions = {}
): ChartBuildResult {
  const data: ChartData = {
    planetaryPositions: null,
    ascendant: null,
    nakshatra: null,
    manglik: null,
    dasha: null,
    yogas: null,
    divisionalCharts: null,
    shadbala: null,
    ashtakavarga: null,
  };
  const errors: Partial<Record<keyof ChartData, string>> = {};

  const offset = options.tzOffsetHours ?? offsetForChart();

  // 1. Planetary positions (precision VSOP87, resolved birth timezone honoured)
  try {
    const precise = calculatePlanetsForBirth(input.date, input.time, offset);
    data.planetaryPositions = {
      ...precise,
      sun: {
        tropical: 0,
        sidereal: precise.sun.sidereal,
        rashi: precise.sun.rashi,
        rashiName: precise.planets[0].rashiName,
        degrees: precise.sun.degrees,
      },
      moon: {
        tropical: 0,
        sidereal: precise.moon.sidereal,
        rashi: precise.moon.rashi,
        rashiName: precise.planets[1].rashiName,
        degrees: precise.moon.degrees,
      },
      mercury: {
        tropical: 0,
        sidereal: 0,
        rashi: precise.planets[2].rashiIndex,
        rashiName: precise.planets[2].rashiName,
        degrees: precise.planets[2].degrees,
      },
      venus: {
        tropical: 0,
        sidereal: 0,
        rashi: precise.planets[3].rashiIndex,
        rashiName: precise.planets[3].rashiName,
        degrees: precise.planets[3].degrees,
      },
      mars: {
        tropical: 0,
        sidereal: 0,
        rashi: precise.planets[4].rashiIndex,
        rashiName: precise.planets[4].rashiName,
        degrees: precise.planets[4].degrees,
      },
      jupiter: {
        tropical: 0,
        sidereal: 0,
        rashi: precise.planets[5].rashiIndex,
        rashiName: precise.planets[5].rashiName,
        degrees: precise.planets[5].degrees,
      },
      saturn: {
        tropical: 0,
        sidereal: 0,
        rashi: precise.planets[6].rashiIndex,
        rashiName: precise.planets[6].rashiName,
        degrees: precise.planets[6].degrees,
      },
      rahu: {
        tropical: 0,
        sidereal: 0,
        rashi: precise.planets[7].rashiIndex,
        rashiName: precise.planets[7].rashiName,
        degrees: precise.planets[7].degrees,
        retrograde: true,
      },
      ketu: {
        tropical: 0,
        sidereal: 0,
        rashi: precise.planets[8].rashiIndex,
        rashiName: precise.planets[8].rashiName,
        degrees: precise.planets[8].degrees,
        retrograde: true,
      },
    } as CompletePlanetaryPositions;
  } catch (e) {
    try {
      data.planetaryPositions = calculateCompletePlanetaryPositions(input.date, input.time);
    } catch (e2) {
      errors.planetaryPositions = String(e2);
    }
  }

  // 2. Ascendant
  try {
    data.ascendant = calculateCompleteAscendant(input.date, input.time, input.lat, input.lon, offset);
  } catch (e) {
    errors.ascendant = String(e);
  }

  // Accurate Moon longitude — single source of truth for nakshatra + dasha.
  let accurateMoonLongitude: number | undefined;
  if (data.planetaryPositions?.moon) {
    const moon = data.planetaryPositions.moon;
    if (moon.sidereal !== undefined && moon.sidereal !== 0) {
      accurateMoonLongitude = moon.sidereal;
    } else {
      accurateMoonLongitude = moon.rashi * 30 + moon.degrees;
    }
  }

  // 3. Nakshatra
  try {
    data.nakshatra = getNakshatraInfo(input.date, input.time, accurateMoonLongitude);
  } catch (e) {
    errors.nakshatra = String(e);
  }

  // 4. Manglik
  try {
    data.manglik = checkManglikDosha(input.date, input.time, input.lat, input.lon);
  } catch (e) {
    errors.manglik = String(e);
  }

  // 5. Dasha
  try {
    data.dasha = calculateVimshottariDasha(input.date, input.time, 3, accurateMoonLongitude);
  } catch (e) {
    errors.dasha = String(e);
  }

  // 6–9 depend on planetary positions
  if (data.planetaryPositions) {
    const planets = data.planetaryPositions.planets;
    const ascRashi = data.ascendant?.ascendant.rashiIndex ?? 0;

    try {
      data.yogas = analyzeYogas(
        planets.map(p => ({
          name: p.name,
          rashiIndex: p.rashiIndex,
          house: p.house,
          degrees: p.degrees,
          isRetrograde: p.retrograde,
        })),
        ascRashi
      );
    } catch (e) {
      errors.yogas = String(e);
    }

    try {
      const longitudes = Object.fromEntries(
        planets.map(p => [p.name, p.rashiIndex * 30 + p.degrees])
      );
      const ascLon = ascRashi * 30 + (data.ascendant?.ascendant.degrees ?? 0);
      data.divisionalCharts = calculateShodashVarga(longitudes, ascLon);
    } catch (e) {
      errors.divisionalCharts = String(e);
    }

    try {
      const birthMonth = isoMonth(input.date);
      const daytime =
        options.isDaytime ??
        (parseInt(input.time.split(':')[0]) >= 6 && parseInt(input.time.split(':')[0]) < 18);
      data.shadbala = calculateShadbala(
        planets.map(p => ({
          name: p.name,
          rashiIndex: p.rashiIndex,
          house: p.house,
          degrees: p.degrees,
          isRetrograde: p.retrograde ?? false,
          longitude: p.rashiIndex * 30 + p.degrees,
        })),
        daytime,
        birthMonth
      );
    } catch (e) {
      errors.shadbala = String(e);
    }

    try {
      const planetRashis = Object.fromEntries(planets.map(p => [p.name, p.rashiIndex]));
      data.ashtakavarga = calculateAshtakavarga(planetRashis, ascRashi);
    } catch (e) {
      errors.ashtakavarga = String(e);
    }
  }

  return { data, errors };
}
