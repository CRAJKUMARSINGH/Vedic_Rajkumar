/**
 * N4 — Kaal / dasha timing adapter
 *
 * Wraps the existing `dashaService` and `dashaTimelineCorrelationService` into
 * a single typed API that:
 *   - Exposes Maha / Antar / Pratyantar dasha windows with explicit UTC
 *     start/end boundaries and a sensitivity note when birth time is imprecise.
 *   - Declares the calculation provenance (engine, ayanamsa, Moon longitude
 *     source) so N9 can stamp claims as CALCULATION.
 *   - Never fabricates dasha dates — returns CALCULATION_UNAVAILABLE with a
 *     reason string if the upstream engine throws.
 *
 * Phase B contract requirement: machine-readable periods with start/end
 * instants, governing factors, confidence/limitations, and boundary behaviour.
 */

import {
  calculateVimshottariDasha,
  getActiveDashaContext,
  getDashaInterpretation,
  type DashaResult,
  type AntarDasha,
  type PratyantarDasha,
} from '@/services/dashaService';

export type DashaAvailability = 'AVAILABLE' | 'CALCULATION_UNAVAILABLE';

export interface DashaWindow {
  level: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha';
  lord: string;
  startIso: string;   // ISO-8601 UTC
  endIso: string;
  daysRemaining: number;
}

export interface KaalOutput {
  availability: DashaAvailability;
  /** Reason when availability === 'CALCULATION_UNAVAILABLE'. */
  unavailableReason?: string;

  activeDasha: {
    maha: DashaWindow | null;
    antar: DashaWindow | null;
    pratyantar: DashaWindow | null;
    label: string;
    activeLords: string[];
  } | null;

  /** Interpretation text for the active Maha–Antar combination. */
  interpretation: { en: string; hi: string } | null;

  /** Upcoming dasha windows (next 3 Mahadashas). */
  upcoming: DashaWindow[];

  /** Provenance for N9 stamping. */
  provenance: {
    engine: string;
    ayanamsa: string;
    moonLongitudeSource: 'accurate-wasm' | 'fallback-meeus' | 'unknown';
    calculatedAt: string;   // ISO-8601 UTC
    sensitivityNote: string;
  };
}

function windowFromAntar(antar: AntarDasha, now: Date): DashaWindow {
  return {
    level: 'Antardasha',
    lord: antar.planet,
    startIso: antar.startDate.toISOString(),
    endIso: antar.endDate.toISOString(),
    daysRemaining: Math.max(
      0,
      Math.round((antar.endDate.getTime() - now.getTime()) / 86_400_000),
    ),
  };
}

function windowFromPratyantar(pd: PratyantarDasha, now: Date): DashaWindow {
  return {
    level: 'Pratyantardasha',
    lord: pd.planet,
    startIso: pd.startDate.toISOString(),
    endIso: pd.endDate.toISOString(),
    daysRemaining: Math.max(
      0,
      Math.round((pd.endDate.getTime() - now.getTime()) / 86_400_000),
    ),
  };
}

/**
 * Compute unified dasha timing output for a given birth date/time.
 *
 * @param dateStr  - `YYYY-MM-DD`
 * @param timeStr  - `HH:MM`
 * @param accurateMoonLongitude - sidereal Moon longitude from the WASM engine
 *                                (optional; falls back to Meeus when absent)
 */
export function computeKaal(
  dateStr: string,
  timeStr: string,
  accurateMoonLongitude?: number,
): KaalOutput {
  const calculatedAt = new Date().toISOString();
  const moonLongitudeSource: KaalOutput['provenance']['moonLongitudeSource'] =
    accurateMoonLongitude != null ? 'accurate-wasm' : 'fallback-meeus';

  let dashaResult: DashaResult;
  try {
    dashaResult = calculateVimshottariDasha(dateStr, timeStr, 5, accurateMoonLongitude);
  } catch (err) {
    return {
      availability: 'CALCULATION_UNAVAILABLE',
      unavailableReason: err instanceof Error ? err.message : 'Unknown dasha calculation error',
      activeDasha: null,
      interpretation: null,
      upcoming: [],
      provenance: {
        engine: 'dashaService/vimshottari',
        ayanamsa: 'Lahiri',
        moonLongitudeSource,
        calculatedAt,
        sensitivityNote: 'Calculation failed; no dasha data available.',
      },
    };
  }

  const now = new Date();
  const ctx = getActiveDashaContext(dashaResult);

  const maha = dashaResult.currentMahadasha
    ? ({
        level: 'Mahadasha' as const,
        lord: dashaResult.currentMahadasha.planet,
        startIso: dashaResult.currentMahadasha.startDate.toISOString(),
        endIso: dashaResult.currentMahadasha.endDate.toISOString(),
        daysRemaining: Math.max(
          0,
          Math.round(
            (dashaResult.currentMahadasha.endDate.getTime() - now.getTime()) / 86_400_000,
          ),
        ),
      } satisfies DashaWindow)
    : null;

  const antar = dashaResult.currentAntardasha
    ? windowFromAntar(dashaResult.currentAntardasha, now)
    : null;

  const pratyantar = dashaResult.currentPratyantardasha
    ? windowFromPratyantar(dashaResult.currentPratyantardasha, now)
    : null;

  // Interpretation for the active Maha lord.
  const mahaLord = dashaResult.currentMahadasha?.planet ?? '';
  const mahaInterp = mahaLord ? getDashaInterpretation(mahaLord) : null;

  // Upcoming: next 3 Mahadashas from the future list (DashaResult.mahadashas).
  const upcoming: DashaWindow[] = (dashaResult.mahadashas ?? [])
    .filter((d: { startDate: Date; endDate: Date; planet: string }) => d.startDate > now)
    .slice(0, 3)
    .map((d: { startDate: Date; endDate: Date; planet: string }) => ({
      level: 'Mahadasha' as const,
      lord: d.planet,
      startIso: d.startDate.toISOString(),
      endIso: d.endDate.toISOString(),
      daysRemaining: Math.round((d.startDate.getTime() - now.getTime()) / 86_400_000),
    }));

  return {
    availability: 'AVAILABLE',
    activeDasha: {
      maha,
      antar,
      pratyantar,
      label: ctx.label,
      activeLords: ctx.activeLords,
    },
    interpretation: mahaInterp
      ? { en: mahaInterp.en, hi: mahaInterp.hi }
      : null,
    upcoming,
    provenance: {
      engine: 'dashaService/vimshottari@v1',
      ayanamsa: 'Lahiri',
      moonLongitudeSource,
      calculatedAt,
      sensitivityNote:
        'Dasha boundaries shift by ~1 day per 4 minutes of birth-time uncertainty. ' +
        'An unknown birth time (using 00:00 as placeholder) may shift the Moon nakshatra ' +
        'boundary by up to ±12 hours, potentially changing the Mahadasha lord.',
    },
  };
}
