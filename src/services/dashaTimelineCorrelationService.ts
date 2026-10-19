/**
 * dashaTimelineCorrelationService.ts — N4 Kaal.
 *
 * Dasha–Transit correlation built on the *unified* Vimshottari timeline
 * (`@/lib/vimshottariTimeline`) instead of a bespoke dasha walk. For every
 * Maha/Antar/Pratyantar window in a date range it:
 *   1. resolves the full Maha → Antar → Pratyantar chain at the window peak,
 *   2. computes each planet's house from the natal Moon at that instant using
 *      the shared Lahiri ephemeris,
 *   3. scores the activation with the classical Dasha–Gochara rule.
 *
 * It also exposes the Varshaphal (annual) hookup: the dasha windows that fall
 * inside a solar-return year, as data (not UI-only), so any surface — card,
 * PDF, narrative — can consume the same numbers.
 *
 * Deterministic: no Math.random(), no network. Same input ⇒ same output.
 */

import {
  buildVimshottariTree,
  findDashaChain,
  extractTimingWindows,
  dashaChainLabel,
  type DashaLevel,
  type DashaNode,
  type VimshottariTree,
} from '@/lib/vimshottariTimeline';
import { calculateChartForBirth } from '@/services/chartWithTimezone';
import { calculateDashaGochaCorrelation } from '@/services/dashaGocharaCorrelationService';

export type ActivationLevel = 'High' | 'Medium' | 'Low';

export interface DashaTimelineInput {
  /** Sidereal (Lahiri) Moon longitude in degrees — the dasha seed. */
  moonSiderealLongitude: number;
  /** Birth instant. */
  birth: Date;
  latitude: number;
  longitude: number;
}

export interface CorrelatedDashaWindow {
  level: DashaLevel;
  /** Lord of this window's own level. */
  lord: string;
  /** Full Maha → Antar → Pratyantar chain in force at the window peak. */
  chain: DashaNode[];
  chainLabel: string;
  start: Date;
  peak: Date;
  end: Date;
  durationDays: number;
  activationScore: number;
  activationLevel: ActivationLevel;
  dashaLordFavorable: boolean;
  antarLordFavorable: boolean;
}

export interface AnnualDashaContext {
  /** Varshaphal year start (the solar-return instant). */
  start: Date;
  /** Varshaphal year end (the next solar-return instant). */
  end: Date;
  /** Leave the tree visible so callers can drill into any level. */
  tree: VimshottariTree;
  /** Maha → Antar → Pratyantar chain active at the year start. */
  chainAtStart: DashaNode[];
  chainAtStartLabel: string;
  /** Correlated dasha windows inside the year, ordered by start. */
  windows: CorrelatedDashaWindow[];
}

/**
 * Houses (from the natal Moon) for every graha at an instant, via the shared
 * Lahiri ephemeris. The instant is treated as UTC (offset 0).
 */
function transitHousesFromMoon(
  instantMs: number,
  latitude: number,
  longitude: number,
  moonSignIdx: number,
): Record<string, number> {
  const iso = new Date(instantMs).toISOString();
  const chart = calculateChartForBirth(iso.slice(0, 10), iso.slice(11, 16), latitude, longitude, 0);

  const houses: Record<string, number> = {};
  for (const p of chart.planets) {
    houses[p.name] = ((p.rashiIndex - moonSignIdx + 12) % 12) + 1;
  }
  return houses;
}

function toMs(at: Date | number): number {
  return at instanceof Date ? at.getTime() : at;
}

/**
 * Correlate every window at `level` overlapping [from, to) with the transits
 * active at its peak. Returns data, ordered by start.
 */
export function correlateDashaTimelineWithTransits(
  input: DashaTimelineInput,
  level: DashaLevel,
  from: Date | number,
  to: Date | number,
): CorrelatedDashaWindow[] {
  const tree = buildVimshottariTree(input.moonSiderealLongitude, input.birth);
  const moonSignIdx = Math.floor(((input.moonSiderealLongitude % 360) + 360) % 360 / 30);

  return extractTimingWindows(tree, level, from, to).map((w) => {
    const peakMs = w.peak.getTime();
    const chain = findDashaChain(tree, peakMs);
    const maha = chain[0]?.lord ?? w.lord;
    const antar = chain[1]?.lord ?? w.lord;
    const pratyan = chain[2]?.lord;

    const houses = transitHousesFromMoon(peakMs, input.latitude, input.longitude, moonSignIdx);
    const corr = calculateDashaGochaCorrelation(maha, antar, houses, pratyan);

    return {
      level: w.level,
      lord: w.lord,
      chain,
      chainLabel: chain.length > 0 ? dashaChainLabel(chain) : w.lord,
      start: w.start,
      peak: w.peak,
      end: w.end,
      durationDays: w.durationDays,
      activationScore: corr.score,
      activationLevel: corr.activationLevel,
      dashaLordFavorable: corr.dashaLordFavorable,
      antarLordFavorable: corr.antarLordFavorable,
    };
  });
}

/**
 * Varshaphal annual hookup: the dasha windows that fall inside a solar-return
 * year (start → next start), plus the chain in force at the year's opening.
 * Callers pass the true solar-return instants produced by `varshaphalService`.
 */
export function buildAnnualDashaContext(
  input: DashaTimelineInput,
  yearStart: Date,
  yearEnd: Date,
  level: DashaLevel = 3,
): AnnualDashaContext {
  const tree = buildVimshottariTree(input.moonSiderealLongitude, input.birth);
  const chainAtStart = findDashaChain(tree, yearStart);

  return {
    start: yearStart,
    end: yearEnd,
    tree,
    chainAtStart,
    chainAtStartLabel: chainAtStart.length > 0 ? dashaChainLabel(chainAtStart) : '',
    windows: correlateDashaTimelineWithTransits(input, level, yearStart, yearEnd),
  };
}
