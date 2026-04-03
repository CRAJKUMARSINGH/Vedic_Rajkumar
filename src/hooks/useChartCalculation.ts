/**
 * useChartCalculation — Reactive auto-calculation hook
 * Debounces birth data changes and memoizes all chart results.
 * Provides a single source of truth for all derived astrological data.
 *
 * Week 31: Swiss Ephemeris integration via VITE_USE_SWISS_EPHEMERIS feature flag.
 * Set VITE_USE_SWISS_EPHEMERIS=true in .env to enable 99.99% accuracy mode.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { calculateCompletePlanetaryPositions, type CompletePlanetaryPositions } from '@/services/ephemerisService';
import { calculatePrecisePlanetaryPositions } from '@/services/precisionEphemerisService';
import { calcPlanetsAccurate } from '@/services/swissEphemerisService';
import { calculateCompleteAscendant, type AscendantData } from '@/services/ascendantService';
import { getNakshatraInfo, type NakshatraInfo } from '@/services/nakshatraService';
import { checkManglikDosha, type ManglikResult } from '@/services/manglikService';
import { calculateVimshottariDasha, type DashaResult } from '@/services/dashaService';
import { analyzeYogas, type YogaAnalysis } from '@/services/yogaService';
import { calculateShodashVarga, type ShodashVargaResult } from '@/services/divisionalChartsService';
import { calculateShadbala, type ShadabalaAnalysis } from '@/services/shadabalaService';
import { calculateAshtakavarga, type SarvashtakavargaResult } from '@/services/ashtakavargaService';

export interface BirthInput {
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  lat: number;
  lon: number;
}

export interface ChartData {
  planetaryPositions: CompletePlanetaryPositions | null;
  ascendant: AscendantData | null;
  nakshatra: NakshatraInfo | null;
  manglik: ManglikResult | null;
  dasha: DashaResult | null;
  yogas: YogaAnalysis | null;
  divisionalCharts: ShodashVargaResult | null;
  shadbala: ShadabalaAnalysis | null;
  ashtakavarga: SarvashtakavargaResult | null;
}

export interface UseChartCalculationReturn {
  data: ChartData;
  isCalculating: boolean;
  errors: Partial<Record<keyof ChartData, string>>;
  recalculate: () => void;
}

const EMPTY: ChartData = {
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

const DEBOUNCE_MS = 300;

export function useChartCalculation(
  input: BirthInput | null,
  isDaytime?: boolean,
): UseChartCalculationReturn {
  const [data, setData] = useState<ChartData>(EMPTY);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ChartData, string>>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<BirthInput | null>(null);

  const calculate = useCallback(async (inp: BirthInput) => {
    setIsCalculating(true);
    const errs: Partial<Record<keyof ChartData, string>> = {};
    const result: ChartData = { ...EMPTY };

    // 1. Planetary positions
    // Priority: Swiss Ephemeris (flag) → Precision VSOP87 → Legacy fallback
    try {
      const useSwiss = import.meta.env.VITE_USE_SWISS_EPHEMERIS === 'true';
      if (useSwiss) {
        // Week 31: Swiss Ephemeris — 99.99% accuracy
        result.planetaryPositions = await calcPlanetsAccurate(inp.date, inp.time);
      } else {
        // Default: precision VSOP87 service
        const precise = calculatePrecisePlanetaryPositions(inp.date, inp.time);
        result.planetaryPositions = {
          ...precise,
          sun: { tropical: 0, sidereal: precise.sun.sidereal, rashi: precise.sun.rashi, rashiName: precise.planets[0].rashiName, degrees: precise.sun.degrees },
          moon: { tropical: 0, sidereal: precise.moon.sidereal, rashi: precise.moon.rashi, rashiName: precise.planets[1].rashiName, degrees: precise.moon.degrees },
          mercury: { tropical: 0, sidereal: 0, rashi: precise.planets[2].rashiIndex, rashiName: precise.planets[2].rashiName, degrees: precise.planets[2].degrees },
          venus: { tropical: 0, sidereal: 0, rashi: precise.planets[3].rashiIndex, rashiName: precise.planets[3].rashiName, degrees: precise.planets[3].degrees },
          mars: { tropical: 0, sidereal: 0, rashi: precise.planets[4].rashiIndex, rashiName: precise.planets[4].rashiName, degrees: precise.planets[4].degrees },
          jupiter: { tropical: 0, sidereal: 0, rashi: precise.planets[5].rashiIndex, rashiName: precise.planets[5].rashiName, degrees: precise.planets[5].degrees },
          saturn: { tropical: 0, sidereal: 0, rashi: precise.planets[6].rashiIndex, rashiName: precise.planets[6].rashiName, degrees: precise.planets[6].degrees },
          rahu: { tropical: 0, sidereal: 0, rashi: precise.planets[7].rashiIndex, rashiName: precise.planets[7].rashiName, degrees: precise.planets[7].degrees, retrograde: true },
          ketu: { tropical: 0, sidereal: 0, rashi: precise.planets[8].rashiIndex, rashiName: precise.planets[8].rashiName, degrees: precise.planets[8].degrees, retrograde: true },
        } as CompletePlanetaryPositions;
      }
    } catch (e) {
      // Final fallback to legacy service
      try {
        result.planetaryPositions = calculateCompletePlanetaryPositions(inp.date, inp.time);
      } catch (e2) {
        errs.planetaryPositions = String(e2);
      }
    }

    // 2. Ascendant
    try {
      result.ascendant = calculateCompleteAscendant(inp.date, inp.time, inp.lat, inp.lon);
    } catch (e) {
      errs.ascendant = String(e);
    }

    // 3. Nakshatra
    try {
      result.nakshatra = getNakshatraInfo(inp.date, inp.time);
    } catch (e) {
      errs.nakshatra = String(e);
    }

    // 4. Manglik
    try {
      result.manglik = checkManglikDosha(inp.date, inp.time, inp.lat, inp.lon);
    } catch (e) {
      errs.manglik = String(e);
    }

    // 5. Dasha
    try {
      result.dasha = calculateVimshottariDasha(inp.date, inp.time);
    } catch (e) {
      errs.dasha = String(e);
    }

    // 6–9 depend on planetary positions
    if (result.planetaryPositions) {
      const planets = result.planetaryPositions.planets;
      const ascRashi = result.ascendant?.ascendant.rashiIndex ?? 0;

      // 6. Yogas
      try {
        result.yogas = analyzeYogas(
          planets.map(p => ({
            name: p.name,
            rashiIndex: p.rashiIndex,
            house: p.house,
            degrees: p.degrees,
            isRetrograde: p.retrograde,
          })),
          ascRashi,
        );
      } catch (e) {
        errs.yogas = String(e);
      }

      // 7. Divisional charts
      try {
        const longitudes = Object.fromEntries(
          planets.map(p => [p.name, p.rashiIndex * 30 + p.degrees])
        );
        const ascLon = ascRashi * 30 + (result.ascendant?.ascendant.degrees ?? 0);
        result.divisionalCharts = calculateShodashVarga(longitudes, ascLon);
      } catch (e) {
        errs.divisionalCharts = String(e);
      }

      // 8. Shadbala
      try {
        const birthMonth = new Date(inp.date).getMonth() + 1;
        const daytime = isDaytime ?? (parseInt(inp.time.split(':')[0]) >= 6 && parseInt(inp.time.split(':')[0]) < 18);
        result.shadbala = calculateShadbala(
          planets.map(p => ({
            name: p.name,
            rashiIndex: p.rashiIndex,
            house: p.house,
            degrees: p.degrees,
            isRetrograde: p.retrograde ?? false,
            longitude: p.rashiIndex * 30 + p.degrees,
          })),
          daytime,
          birthMonth,
        );
      } catch (e) {
        errs.shadbala = String(e);
      }

      // 9. Ashtakavarga
      try {
        const planetRashis = Object.fromEntries(planets.map(p => [p.name, p.rashiIndex]));
        result.ashtakavarga = calculateAshtakavarga(planetRashis, ascRashi);
      } catch (e) {
        errs.ashtakavarga = String(e);
      }
    }

    setData(result);
    setErrors(errs);
    setIsCalculating(false);
  }, [isDaytime]);

  useEffect(() => {
    if (!input) {
      setData(EMPTY);
      setErrors({});
      return;
    }

    // Debounce
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      inputRef.current = input;
      calculate(input);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input?.date, input?.time, input?.lat, input?.lon, calculate]);

  const recalculate = useCallback(() => {
    if (inputRef.current) calculate(inputRef.current);
  }, [calculate]);

  return { data, isCalculating, errors, recalculate };
}
