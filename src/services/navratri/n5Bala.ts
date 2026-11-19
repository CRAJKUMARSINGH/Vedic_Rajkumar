/**
 * N5 — Bala / Shadbala feed
 *
 * Thin typed adapter over the existing `shadabalaService`.  Responsibilities:
 *   - Normalise Shadbala Rupa scores to a [0, 1] strength ratio.
 *   - Label each planet's overall dignity (from the WASM path, populated by N2).
 *   - Mark values as COMPUTED or UNAVAILABLE; never estimate or invent.
 *   - Feed normalised scores downstream to N6 (Yukti synthesis).
 *
 * Phase B contract: typed adapter; provenance per factor; graceful missing-data
 * behaviour; stable fixtures; no silent normalisation of formulas.
 */

import {
  calculateShadbala,
  canPlanetGiveTransitResults,
  type ShadabalaResult,
  type ShadabalaAnalysis,
  type PlanetData,
} from '@/services/shadabalaService';

export type BalaAvailability = 'COMPUTED' | 'UNAVAILABLE';

export interface PlanetStrength {
  planet: string;
  /** Raw total Shadbala in Rupas (1 Rupa = 60 Shashtiamsas). */
  totalRupas: number;
  /** Normalised strength [0, 1] (clipped at the minimum-required threshold). */
  normalised: number;
  /** Whether the planet meets the minimum Rupa requirement for transit results. */
  meetsMinimum: boolean;
  /** Overall dignity label (from N2 WASM path; 'Unknown' when not supplied). */
  dignity: string;
  availability: BalaAvailability;
}

export interface BalaOutput {
  /** Strongest planet by total Rupas. */
  strongestPlanet: string;
  /** Weakest planet. */
  weakestPlanet: string;
  planets: PlanetStrength[];
  provenance: {
    engine: string;
    rules: string;
    calculatedAt: string;
    limitations: string;
  };
}

/** Minimum Shadbala thresholds per planet in Rupas (from BPHS). */
const MIN_RUPAS: Record<string, number> = {
  Sun: 6.5, Moon: 6.0, Mars: 5.0, Mercury: 7.0,
  Jupiter: 6.5, Venus: 5.5, Saturn: 5.0,
  Rahu: 5.0, Ketu: 5.0,
};

/**
 * Compute N5 Bala output from a list of planet data points.
 *
 * @param planets - raw planet data from the chart engine
 * @param dignities - optional map of planet name → dignity string (from N2)
 * @param isDaytime - whether birth is during the day (affects diurnal Bala)
 */
export function computeBala(
  planets: PlanetData[],
  dignities?: Record<string, string>,
  isDaytime = true,
): BalaOutput {
  const calculatedAt = new Date().toISOString();

  let analysis: ShadabalaAnalysis;
  try {
    analysis = calculateShadbala(planets, isDaytime);
  } catch (err) {
    // Return fully unavailable output — never invent values.
    return {
      strongestPlanet: 'Unknown',
      weakestPlanet: 'Unknown',
      planets: planets.map((p) => ({
        planet: p.name,
        totalRupas: 0,
        normalised: 0,
        meetsMinimum: false,
        dignity: dignities?.[p.name] ?? 'Unknown',
        availability: 'UNAVAILABLE' as const,
      })),
      provenance: {
        engine: 'shadabalaService@v1',
        rules: 'BPHS Shadbala (6-component)',
        calculatedAt,
        limitations: `Shadbala calculation failed: ${err instanceof Error ? err.message : 'Unknown error'}. All strength values set to UNAVAILABLE.`,
      },
    };
  }

  const strengths: PlanetStrength[] = analysis.planets.map((r: ShadabalaResult) => {
    const min = MIN_RUPAS[r.planet] ?? 5.0;
    const normalised = Math.min(1, Math.max(0, r.totalRupas / (min * 2)));
    const capabilityResult = canPlanetGiveTransitResults(r.planet, r.totalRupas);
    return {
      planet: r.planet,
      totalRupas: r.totalRupas,
      normalised,
      meetsMinimum: capabilityResult.capable,
      dignity: dignities?.[r.planet] ?? 'Unknown',
      availability: 'COMPUTED' as const,
    };
  });

  const sorted = [...strengths].sort((a, b) => b.totalRupas - a.totalRupas);

  return {
    strongestPlanet: sorted[0]?.planet ?? 'Unknown',
    weakestPlanet: sorted[sorted.length - 1]?.planet ?? 'Unknown',
    planets: strengths,
    provenance: {
      engine: 'shadabalaService@v1',
      rules: 'BPHS Shadbala (Sthana, Dig, Kala, Cheshta, Naisargika, Drik — 6 components)',
      calculatedAt,
      limitations:
        'Cheshta Bala (motional strength) uses a simplified model; exact values ' +
        'require precise heliocentric ephemeris comparison. Shadbala does not apply ' +
        'to nodes (Rahu/Ketu) in the classical sense — scores for those are proxies only.',
    },
  };
}
