/**
 * fromVedicCalcChart.ts
 *
 * Thin adapter: ChartData (legacy vedicCalc engine) → ChartViewModel (canonical).
 *
 * Purpose
 * -------
 * Allows incremental migration of KanchiPage (and any other legacy consumer)
 * to the canonical `features/charts` surface without a big-bang rewrite.
 * See ADR-014 for the full rationale and migration rule.
 *
 * Usage
 * -----
 *   import { toChartViewModel } from '@/features/charts/adapters/fromVedicCalcChart';
 *   const viewModel = toChartViewModel(chart, { highlightSeventh: true });
 *   <NorthIndianChart viewModel={viewModel} />   // canonical renderer
 *
 * Visual intent preservation
 * --------------------------
 * The legacy component supports seventh-house / trine highlighting via colour
 * applied at render time. The canonical ChartViewModel has no colour field, so
 * highlighting intent is preserved as a `warning`-free annotation on each
 * HouseView via a `highlightRole` field injected here.  The canonical renderer
 * may choose to act on it; existing canonical tests are unaffected because they
 * do not assert the absence of extra properties on HouseView (duck typing).
 *
 * If the canonical renderer later formalises `highlightRole`, this adapter
 * must be updated to match.
 */

import type { ChartData } from '@/lib/vedic/vedicCalc';
import {
  assembleViewModel,
  isValidSignIndex,
  isValidHouseNumber,
  type ChartViewModel,
  type PlanetViewSeed,
  type AssembleOptions,
} from '../model/chartViewModel';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FromVedicCalcOptions {
  /**
   * When true, the adapter annotates house 7 and its trines (3, 11) with
   * `highlightRole` on the returned HouseView objects, mirroring the legacy
   * component's `highlightSeventh` prop.
   * @default false
   */
  highlightSeventh?: boolean;
  /** Override the chart type label (default: 'D1'). */
  chartType?: string;
  /** Override the layout (default: 'north'). */
  layout?: 'north' | 'south' | 'east';
}

/**
 * Convert a `ChartData` object (vedicCalc engine output) to a `ChartViewModel`
 * suitable for the canonical `features/charts` renderers.
 *
 * The conversion is lossless for the data the canonical model supports.
 * Visual-only fields (`highlightSeventh`, transit overlays) are preserved as
 * best-effort annotations; they do not affect calculation correctness.
 */
export function toChartViewModel(
  chart: ChartData,
  opts: FromVedicCalcOptions = {},
): ChartViewModel {
  const warnings: string[] = [];

  // ── Ascendant ────────────────────────────────────────────────────────────
  // ChartData.lagna is 1-based rashi index; ChartViewModel.ascendantSign is
  // 0-based. Validate before converting.
  const lagnaOneBased = chart.lagna;
  let ascendantSign: number | null = null;
  if (typeof lagnaOneBased === 'number' && lagnaOneBased >= 1 && lagnaOneBased <= 12) {
    ascendantSign = lagnaOneBased - 1; // convert to 0-based
  } else {
    warnings.push(`Invalid lagna value: ${String(lagnaOneBased)}`);
  }

  // ── Planets ──────────────────────────────────────────────────────────────
  const seeds: PlanetViewSeed[] = chart.planets.map((p) => {
    // ChartData.PlanetPosition.rashi is 1-based; convert to 0-based sign index.
    const signZeroBased =
      typeof p.rashi === 'number' && p.rashi >= 1 && p.rashi <= 12
        ? p.rashi - 1
        : null;

    const house = isValidHouseNumber(p.house) ? p.house : null;
    const degrees = typeof p.degree === 'number' && Number.isFinite(p.degree) ? p.degree : null;

    // Reconstruct absolute longitude from sign + degree (the canonical model
    // expects 0-based sign * 30 + degree-within-sign).
    const longitude =
      signZeroBased !== null && degrees !== null
        ? signZeroBased * 30 + degrees
        : typeof p.longitude === 'number' && Number.isFinite(p.longitude)
          ? p.longitude
          : null;

    // Determine dignity from first principles available in ChartData.
    // vedicCalc does not expose a `dignity` field, so we leave it null.
    // A richer adapter pass can inject this later.
    const dignity: string | null = null;

    return {
      key: p.name,
      sign: isValidSignIndex(signZeroBased) ? signZeroBased : null,
      house,
      degrees,
      longitude,
      retrograde: p.retrograde ?? (p.name === 'Rahu' || p.name === 'Ketu'),
      combust: false, // vedicCalc engine does not expose combust; default safe
      dignity,
      source: 'vedicCalc (legacy)',
    };
  });

  // ── Assemble ─────────────────────────────────────────────────────────────
  const assembleOpts: AssembleOptions = {
    chartType: opts.chartType ?? 'D1',
    layout: opts.layout ?? 'north',
    ascendantSign,
    seeds,
    calculation: {
      engine: 'vedicCalc (Moshier / Jean Meeus)',
      version: 'legacy',
      ayanamsa: 'Lahiri (Chitrapaksha)',
      zodiac: 'sidereal',
      houseSystem: 'Whole Sign (Vedic)',
    },
    warnings,
  };

  const viewModel = assembleViewModel(assembleOpts);

  // ── highlightSeventh annotation ───────────────────────────────────────────
  // Attach a `highlightRole` string to the houses that the legacy component
  // would have coloured. This is a duck-typed extension: HouseView is a plain
  // object and TypeScript won't complain about extra properties at the
  // call-site (the canonical renderer reads only declared fields).
  if (opts.highlightSeventh) {
    const TRINE_OF_7 = new Set([3, 7, 11]);
    for (const house of viewModel.houses) {
      if (house.house === 7) {
        (house as HouseViewWithRole).highlightRole = 'seventh';
      } else if (TRINE_OF_7.has(house.house)) {
        (house as HouseViewWithRole).highlightRole = 'seventh-trine';
      }
    }
  }

  return viewModel;
}

// ---------------------------------------------------------------------------
// Extended HouseView type (not exported from core model; adapter-local only)
// ---------------------------------------------------------------------------

/** Duck-typed extension for visual intent annotation. */
interface HouseViewWithRole {
  highlightRole?: 'seventh' | 'seventh-trine';
  house: number;
}
