/**
 * src/services/fourPlusTransitService.ts
 * 4+ Favorable Transit Scanner (no Vedha)
 *
 * Scans a date range and identifies "hot windows" where ≥4 planets
 * are effectively favorable (base-favorable AND not blocked by Vedha).
 *
 * Algorithm:
 *  - Iterate day-by-day over the selected range
 *  - Call calculateDynamicTransits() for each date
 *  - Count planets with effectiveStatus === 'favorable'
 *  - If count >= minFavorable (default 4), mark the day "hot"
 *  - Merge consecutive hot days into windows
 *  - Filter windows by minDuration (default 1 day)
 *
 * Performance:
 *  - ≤90 days: run client-side (fine)
 *  - >90 days: delegate to /api/4plus-transit (Netlify/Vercel function)
 */

import { calculateDynamicTransits, type DynamicTransitOutput } from './dynamicTransitService';

// ─── Public types ──────────────────────────────────────────────────────────────

export interface FourPlusTransitConfig {
  moonRashiIndex: number;          // 0–11 (natal Moon rashi)
  startDate: Date;
  endDate: Date;
  minFavorable?: number;           // default 4
  minWindowDuration?: number;      // minimum consecutive days, default 1
  scanTime?: string;               // HH:mm, default '06:00'
}

export interface HotDay {
  date: string;                    // YYYY-MM-DD
  score: number;                   // count of effectively-favorable planets
  favorablePlanets: string[];      // names of the favorable planets
  transitData: DynamicTransitOutput;
}

export interface FavorableWindow {
  startDate: string;               // YYYY-MM-DD
  endDate: string;                 // YYYY-MM-DD
  durationDays: number;
  peakScore: number;               // highest daily score in the window
  peakDate: string;                // date of peak score
  commonPlanets: string[];         // planets favorable throughout the entire window
  allPlanets: string[];            // union of all favorable planets in the window
  days: HotDay[];
  notes: string;
}

export interface FourPlusTransitResult {
  config: FourPlusTransitConfig;
  windows: FavorableWindow[];
  nearestWindow: FavorableWindow | null;
  hotDays: HotDay[];
  totalDaysScanned: number;
  summary: {
    totalHotDays: number;
    totalWindows: number;
    nearestDate: string | null;
  };
}

// ─── Main scanner ──────────────────────────────────────────────────────────────

/**
 * Scan a date range for ≥4 effectively-favorable transit days (no Vedha).
 * This is the primary client-side entry point (use for ranges ≤90 days).
 */
export async function scanFourPlusTransits(
  config: FourPlusTransitConfig,
  onProgress?: (completed: number, total: number) => void,
): Promise<FourPlusTransitResult> {
  const {
    moonRashiIndex,
    startDate,
    endDate,
    minFavorable = 4,
    minWindowDuration = 1,
    scanTime = '06:00',
  } = config;

  if (startDate > endDate) throw new Error('startDate must be before endDate');

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;
  const hotDays: HotDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(startDate.getTime() + i * msPerDay);
    const dateStr = current.toISOString().split('T')[0];

    try {
      const output = await calculateDynamicTransits({
        moonRashiIndex,
        date: current,
        time: scanTime,
      });

      const favorable = output.transits
        .filter(t => t.effectiveStatus === 'favorable')
        .map(t => t.planet.en);

      if (favorable.length >= minFavorable) {
        hotDays.push({
          date: dateStr,
          score: favorable.length,
          favorablePlanets: favorable,
          transitData: output,
        });
      }
    } catch (err) {
      console.warn(`[4plusTransit] Skipped ${dateStr}:`, err);
    }

    if (onProgress) onProgress(i + 1, totalDays);
  }

  const windows = mergeIntoWindows(hotDays, minWindowDuration);
  const nearestWindow = windows.length > 0 ? windows[0] : null;

  return {
    config,
    windows,
    nearestWindow,
    hotDays,
    totalDaysScanned: totalDays,
    summary: {
      totalHotDays: hotDays.length,
      totalWindows: windows.length,
      nearestDate: hotDays.length > 0 ? hotDays[0].date : null,
    },
  };
}

// ─── Quick nearest-date helper ─────────────────────────────────────────────────

/**
 * Find the nearest single date (from today) with ≥4 favorable transits.
 * Scans up to maxDays ahead (default 365).
 */
export async function findNearestFourPlusDate(
  moonRashiIndex: number,
  fromDate: Date = new Date(),
  maxDays = 365,
): Promise<HotDay | null> {
  const endDate = new Date(fromDate.getTime() + maxDays * 24 * 60 * 60 * 1000);
  const result = await scanFourPlusTransits({
    moonRashiIndex,
    startDate: fromDate,
    endDate,
    minFavorable: 4,
    minWindowDuration: 1,
  });
  return result.hotDays.length > 0 ? result.hotDays[0] : null;
}

// ─── Window merger ─────────────────────────────────────────────────────────────

function mergeIntoWindows(hotDays: HotDay[], minDuration: number): FavorableWindow[] {
  if (hotDays.length === 0) return [];

  const windows: FavorableWindow[] = [];
  let currentGroup: HotDay[] = [hotDays[0]];

  for (let i = 1; i < hotDays.length; i++) {
    const prev = new Date(hotDays[i - 1].date);
    const curr = new Date(hotDays[i].date);
    const gapDays = Math.round(
      (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (gapDays <= 1) {
      // Consecutive or same-day
      currentGroup.push(hotDays[i]);
    } else {
      windows.push(buildWindow(currentGroup));
      currentGroup = [hotDays[i]];
    }
  }
  windows.push(buildWindow(currentGroup));

  return windows
    .filter(w => w.durationDays >= minDuration)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

function buildWindow(days: HotDay[]): FavorableWindow {
  const peakDay = days.reduce((best, d) => (d.score > best.score ? d : best), days[0]);

  // Common planets: appear as favorable on EVERY day of the window
  const commonPlanets = days[0].favorablePlanets.filter(p =>
    days.every(d => d.favorablePlanets.includes(p))
  );

  // All planets: union across all days
  const allPlanets = [...new Set(days.flatMap(d => d.favorablePlanets))];

  const lastDay = days[days.length - 1];
  const startDate = days[0].date;
  const endDate = lastDay.date;
  const durationDays =
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (24 * 60 * 60 * 1000)
    ) + 1;

  const notes =
    commonPlanets.length >= 4
      ? `Consistently strong: ${commonPlanets.join(', ')} favorable every day.`
      : `Mixed window — common core: ${commonPlanets.join(', ') || 'none'}; best on ${peakDay.date} (${peakDay.score} favorable).`;

  return {
    startDate,
    endDate,
    durationDays,
    peakScore: peakDay.score,
    peakDate: peakDay.date,
    commonPlanets,
    allPlanets,
    days,
    notes,
  };
}

// ─── Bilingual narrative generator ────────────────────────────────────────────

/**
 * Generate a bilingual text summary for a single favorable window.
 */
export function generateWindowNarrative(
  window: FavorableWindow,
  moonRashiName: string,
  lang: 'en' | 'hi' = 'en',
): string {
  const isHi = lang === 'hi';

  if (isHi) {
    return (
      `${window.startDate} से ${window.endDate} तक (${window.durationDays} दिन) — ` +
      `चंद्र राशि ${moonRashiName} के लिए ${window.peakScore} ग्रह शुभ। ` +
      `मुख्य ग्रह: ${window.commonPlanets.join(', ') || window.allPlanets.join(', ')}। ` +
      `${window.notes}`
    );
  }

  return (
    `${window.startDate} to ${window.endDate} (${window.durationDays} day${window.durationDays > 1 ? 's' : ''}) — ` +
    `${window.peakScore} planets effectively favorable for Moon in ${moonRashiName}. ` +
    `Core planets: ${window.commonPlanets.join(', ') || window.allPlanets.join(', ')}. ` +
    `${window.notes}`
  );
}
