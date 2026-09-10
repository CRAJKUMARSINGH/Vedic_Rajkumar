/**
 * dashaTransitCorrelationService.ts
 *
 * Week 7: Dasha + Transit Correlation Service (Enhanced).
 *
 * Single entry-point that combines:
 *   1. Kundli engine → birth chart (Moon sign and sidereal longitudes)
 *   2. Vimshottari Dasha → active Mahadasha + Antardasha + Pratyantar for a target date
 *   3. Transit positions → 9 planets at the target date, house from Moon
 *      + Sarvashtakavarga (SAV) scores per planet (Week 07 AC-3)
 *   4. Dasha–Gochar correlation → deterministic activation score + prediction
 *      (with Pratyantar Dasha bonus, Week 07 AC-4)
 *   5. Chandrashtama detection → Moon in 8th from natal Moon (Week 07 AC-2)
 *   6. 12-month monthly outlook → activation level per month
 *
 * All calculations use the precision Meeus engine (Lahiri ayanamsa).
 * No network calls — fully synchronous.
 */

import { calculateChart } from '@/features/kundli/engine';
import type { BirthData } from '@/features/kundli/types';
import { calculateVimshottariDasha } from '@/services/dashaService';
import { calculateDashaGochaCorrelation } from '@/services/dashaGocharaCorrelationService';
import type { DashaGochaResult } from '@/services/dashaGocharaCorrelationService';
import {
  calculateAshtakavargaTransitAnalysis,
  getAshtakavargaSummary,
} from '@/services/ashtakavargaTransitService';
import type { Sarvashtakavarga } from '@/services/ashtakavargaTransitService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivationLevel = 'High' | 'Medium' | 'Low';

export interface TransitPlanetPosition {
  planet: string;
  sign: string;
  houseFromMoon: number;
  degrees: number;       // degree within sign (0–29.99)
  nakshatra: string;
  isFavorable: boolean;
  /** Sarvashtakavarga score for the house this planet transits (0–56). Week 07 AC-3 */
  savScore: number;
  /** SAV-based strength classification. Week 07 AC-3 */
  savStrength: 'Strong' | 'Moderate' | 'Weak';
}

export interface ActiveDasha {
  mahaLord: string;
  antarLord: string;
  /** Pratyantar Dasha lord (3rd level). Week 07 AC-1 */
  pratyanLord: string;
  mahaStart: string;   // YYYY-MM-DD
  mahaEnd: string;
  antarStart: string;
  antarEnd: string;
  /** Pratyantar start date. Week 07 AC-1 */
  pratyanStart: string;
  /** Pratyantar end date. Week 07 AC-1 */
  pratyanEnd: string;
  balanceDays: number;
  moonNakshatra: string;
}

export interface MonthlyOutlookItem {
  month: string;          // e.g. "Oct 2026"
  monthKey: string;       // e.g. "2026-10"
  activationLevel: ActivationLevel;
  score: number;          // 0-100
  mahaLord: string;
  antarLord: string;
}

export interface DashaTransitCorrelationResult {
  activeDasha: ActiveDasha;
  transitPositions: TransitPlanetPosition[];
  correlation: DashaGochaResult;
  moonSign: string;
  moonHouse: number;      // Lagna-based house
  targetDate: string;     // YYYY-MM-DD
  monthlyOutlook: MonthlyOutlookItem[];
  /**
   * True when transiting Moon is in the 8th house from natal Moon (Chandrashtama).
   * Classical guidance: avoid important decisions; physical/mental stress likely.
   * Week 07 AC-2.
   */
  isChandrashtama: boolean;
  /**
   * Ashtakavarga overall transit strength summary. Week 07 AC-3.
   */
  ashtakavargaSummary: {
    overallStrength: 'Strong' | 'Moderate' | 'Weak';
    averageScore: number;
    favorableTransits: number;
    unfavorableTransits: number;
  };
  calculatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
] as const;

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula',
  'Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati',
] as const;

const FAVORABLE_HOUSES: Record<string, number[]> = {
  Sun:     [3, 6, 10, 11],
  Moon:    [1, 3, 6, 7, 10, 11],
  Mars:    [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus:   [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn:  [3, 6, 11],
  Rahu:    [3, 6, 10, 11],
  Ketu:    [3, 6, 11],
};

const TRANSIT_PLANETS = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter',
  'Venus', 'Saturn', 'Rahu', 'Ketu',
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signFromLon(lon: number): string {
  return SIGNS[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

function nakshatraFromLon(lon: number): string {
  const idx = Math.floor(((lon % 360) + 360) % 360 / (360 / 27));
  return NAKSHATRAS[idx % 27];
}

function degreeInSign(lon: number): number {
  return ((lon % 360) + 360) % 360 % 30;
}

/** House from Moon sign (1-12): Chandrashtama rule */
function houseFromMoon(planetSignIdx: number, moonSignIdx: number): number {
  return ((planetSignIdx - moonSignIdx + 12) % 12) + 1;
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + months);
  // Clamp to first of the month for consistent targeting
  d.setUTCDate(1);
  return d.toISOString().split('T')[0];
}

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function monthKey(dateStr: string): string {
  return dateStr.substring(0, 7); // "YYYY-MM"
}

// ─── Core computation ─────────────────────────────────────────────────────────

/**
 * Compute the full Dasha + Transit correlation for a given birth data and target date.
 *
 * @param birthData   Birth chart input (from BirthData interface)
 * @param targetDate  YYYY-MM-DD date for which to compute transits and dasha
 * @returns           Complete DashaTransitCorrelationResult
 */
export function computeCorrelation(
  birthData: BirthData,
  targetDate: string,
): DashaTransitCorrelationResult {
  // 1. Birth chart → Moon sign + Moon sidereal longitude
  const birthChart = calculateChart(birthData);
  const moonPos = birthChart.planets.find((p) => p.planet === 'Moon');
  if (!moonPos) {
    throw new Error('Moon position not found in chart');
  }
  const moonSignIdx = Math.floor(moonPos.siderealLongitude / 30);
  const moonSign = SIGNS[moonSignIdx];
  const moonHouse = moonPos.house;

  // 2. Dasha at target date — use dashaService
  const dashaResult = calculateVimshottariDasha(
    birthData.date,
    birthData.time,
    moonSignIdx,
    moonPos.siderealLongitude, // precise moon longitude
  );

  const currentMaha = dashaResult.currentMahadasha;
  const currentAntar = dashaResult.currentAntardasha;
  // Week 07 AC-1: wire in Pratyantar Dasha
  const currentPratyan = dashaResult.currentPratyantardasha ?? null;

  if (!currentMaha || !currentAntar) {
    throw new Error('Could not determine active dasha for the given date');
  }

  const activeDasha: ActiveDasha = {
    mahaLord:    currentMaha.planet,
    antarLord:   currentAntar.planet,
    // Pratyantar lord — fallback to Antardasha lord if not yet calculated (Week 07 AC-1)
    pratyanLord: currentPratyan?.planet ?? currentAntar.planet,
    mahaStart:   currentMaha.startDate.toISOString().split('T')[0],
    mahaEnd:     currentMaha.endDate.toISOString().split('T')[0],
    antarStart:  currentAntar.startDate.toISOString().split('T')[0],
    antarEnd:    currentAntar.endDate.toISOString().split('T')[0],
    pratyanStart: currentPratyan?.startDate.toISOString().split('T')[0] ?? currentAntar.startDate.toISOString().split('T')[0],
    pratyanEnd:   currentPratyan?.endDate.toISOString().split('T')[0] ?? currentAntar.endDate.toISOString().split('T')[0],
    balanceDays: dashaResult.balanceDays,
    moonNakshatra: dashaResult.moonNakshatraName,
  };

  // 3. Transit chart at target date — reuse kundli engine
  const transitBirthData: BirthData = {
    ...birthData,
    date:  targetDate,
    time:  '12:00',   // noon UTC approximation for daily transits
    name:  'Transit',
  };
  const transitChart = calculateChart(transitBirthData);

  // 4. Build transit positions array (9 planets, houses from Moon)
  const transitPositions: TransitPlanetPosition[] = TRANSIT_PLANETS.map((planet) => {
    const pos = transitChart.planets.find((p) => p.planet === planet);
    if (!pos) return null;
    const transitSignIdx = Math.floor(pos.siderealLongitude / 30);
    const house = houseFromMoon(transitSignIdx, moonSignIdx);
    const favorable = FAVORABLE_HOUSES[planet]?.includes(house) ?? false;
    return {
      planet,
      sign:          signFromLon(pos.siderealLongitude),
      houseFromMoon: house,
      degrees:       degreeInSign(pos.siderealLongitude),
      nakshatra:     nakshatraFromLon(pos.siderealLongitude),
      isFavorable:   favorable,
      // SAV placeholders — filled below via ashtakavargaTransitService (Week 07 AC-3)
      savScore:    0,
      savStrength: 'Moderate' as const,
    };
  }).filter(Boolean) as TransitPlanetPosition[];

  // Week 07 AC-3: enrich with Sarvashtakavarga scores
  const savInput = transitPositions.map((tp) => ({
    planet: tp.planet,
    house:  tp.houseFromMoon,
  }));
  const savResults = calculateAshtakavargaTransitAnalysis(savInput);
  const savSummaryData = getAshtakavargaSummary(savResults);

  transitPositions.forEach((tp) => {
    const sr = savResults.find((r) => r.planet === tp.planet);
    if (sr) {
      tp.savScore    = sr.savScore;
      tp.savStrength = sr.strength;
    }
  });

  // 5. Build transitHouses map for correlation service
  const transitHouses: Record<string, number> = {};
  transitPositions.forEach((tp) => { transitHouses[tp.planet] = tp.houseFromMoon; });

  // 6. Dasha–Gochar correlation — now includes Pratyantar lord for bonus (Week 07 AC-1, AC-4)
  const correlation = calculateDashaGochaCorrelation(
    currentMaha.planet,
    currentAntar.planet,
    transitHouses,
    activeDasha.pratyanLord,  // Week 07: Pratyantar bonus
  );

  // 7. Week 07 AC-2: Chandrashtama detection
  const transitMoon = transitPositions.find((tp) => tp.planet === 'Moon');
  const isChandrashtama = transitMoon?.houseFromMoon === 8;

  // 8. 12-month monthly outlook
  const monthlyOutlook = computeMonthlyOutlook(birthData, targetDate, moonSignIdx, moonPos.siderealLongitude);

  return {
    activeDasha,
    transitPositions,
    correlation,
    moonSign,
    moonHouse,
    targetDate,
    monthlyOutlook,
    isChandrashtama,
    ashtakavargaSummary: {
      overallStrength:     savSummaryData.overallStrength,
      averageScore:        savSummaryData.averageScore,
      favorableTransits:   savSummaryData.favorableTransits,
      unfavorableTransits: savSummaryData.unfavorableTransits,
    },
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Compute a 12-month Dasha–Transit outlook starting from fromDate.
 */
export function computeMonthlyOutlook(
  birthData: BirthData,
  fromDate: string,
  moonSignIdx?: number,
  moonLongitude?: number,
): MonthlyOutlookItem[] {
  // Resolve moon info once if not provided
  let resolvedMoonSignIdx = moonSignIdx;
  let resolvedMoonLongitude = moonLongitude;

  if (resolvedMoonSignIdx === undefined || resolvedMoonLongitude === undefined) {
    const chart = calculateChart(birthData);
    const moonPos = chart.planets.find((p) => p.planet === 'Moon');
    if (moonPos) {
      resolvedMoonSignIdx = Math.floor(moonPos.siderealLongitude / 30);
      resolvedMoonLongitude = moonPos.siderealLongitude;
    } else {
      resolvedMoonSignIdx = 0;
      resolvedMoonLongitude = 0;
    }
  }

  const outlook: MonthlyOutlookItem[] = [];

  for (let i = 0; i < 12; i++) {
    const monthStart = addMonths(fromDate, i);

    // Dasha at this month start
    const dashaResult = calculateVimshottariDasha(
      birthData.date,
      birthData.time,
      resolvedMoonSignIdx,
      resolvedMoonLongitude,
    );

    const maha  = dashaResult.currentMahadasha;
    const antar = dashaResult.currentAntardasha;

    let activationLevel: ActivationLevel = 'Low';
    let score = 30;
    let mahaLord = 'Unknown';
    let antarLord = 'Unknown';

    if (maha && antar) {
      mahaLord  = maha.planet;
      antarLord = antar.planet;

      // Transit chart for this month
      const monthTransit = calculateChart({
        ...birthData,
        date: monthStart,
        time: '12:00',
        name: 'Monthly Transit',
      });

      const transitHouses: Record<string, number> = {};
      TRANSIT_PLANETS.forEach((planet) => {
        const pos = monthTransit.planets.find((p) => p.planet === planet);
        if (pos) {
          const signIdx = Math.floor(pos.siderealLongitude / 30);
          transitHouses[planet] = houseFromMoon(signIdx, resolvedMoonSignIdx!);
        }
      });

      const corr = calculateDashaGochaCorrelation(mahaLord, antarLord, transitHouses, antarLord);
      score = corr.score;
      activationLevel = corr.activationLevel;
    }

    outlook.push({
      month:           formatMonth(monthStart),
      monthKey:        monthKey(monthStart),
      activationLevel,
      score,
      mahaLord,
      antarLord,
    });
  }

  return outlook;
}
