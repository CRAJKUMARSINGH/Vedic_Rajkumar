/**
 * chartViewModel.ts — canonical *presentation* projection model for the
 * Parashar-style chart engine (c4 Phase 1).
 *
 * Design contract
 * ---------------
 * - This module is a pure projection: it never recomputes coordinates. Every
 *   longitude / sign / house arrives already calculated by the canonical
 *   services (`ephemerisService`, `divisionalChartsService`).
 * - Rendering reads this model only — the SVG renderers must NOT compute
 *   longitudes or infer positions from pixel layout.
 * - Missing data is modelled as `null`, never as `0`. A zero value and an
 *   unavailable value are therefore distinguishable by consumers.
 * - Display order is deterministic (classical graha order).
 */

import { calculateNakshatra } from '@/services/nakshatraService';
import type { CompletePlanetaryPositions, NormalizedPlanet } from '@/services/ephemerisService';
import type { AscendantData } from '@/services/ascendantService';
import type { DivisionalChart } from '@/services/divisionalChartsService';
import {
  PLANET_NAMES,
  PLANET_ABBR,
  RASHI_NAMES,
  planetOrderIndex,
  type BilingualText,
} from './labels';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChartLayout = 'north' | 'south' | 'east';
export type Zodiac = 'sidereal' | 'tropical';

export interface ChartCalculationMeta {
  engine: string;
  version: string;
  ayanamsa: string;
  zodiac: Zodiac;
  houseSystem: string;
}

export interface PlanetNakshatra {
  name: BilingualText;
  /** 1–4 pada, null when unavailable. */
  pada: number | null;
  lord: string | null;
}

export interface PlanetView {
  /** Stable identity key (canonical English planet name). */
  key: string;
  name: BilingualText;
  abbreviation: BilingualText;
  /** 0–11 rashi index, null when unavailable/invalid. */
  sign: number | null;
  signName: BilingualText | null;
  /** 1–12 house, null when unavailable/invalid. */
  house: number | null;
  /** Degrees within the sign (0 ≤ d < 30), null when unavailable. */
  degrees: number | null;
  /** Whole minutes component of `degrees`, null when unavailable. */
  minutes: number | null;
  /** Absolute sidereal longitude (0–360), null when unavailable. */
  longitude: number | null;
  nakshatra: PlanetNakshatra | null;
  retrograde: boolean;
  combust: boolean;
  /** Canonical dignity token (e.g. 'exalted' | 'own' | 'neutral'), null if none. */
  dignity: string | null;
  /** Provenance label for the value shown. */
  source: string;
}

export interface HouseView {
  /** 1–12. */
  house: number;
  /** 0–11 rashi index occupying this house, null when unavailable. */
  sign: number | null;
  signName: BilingualText | null;
  /** Planet keys occupying this house, in deterministic display order. */
  planets: string[];
  /** True for house 1 (the ascendant house). */
  isAscendant: boolean;
}

export interface ChartViewModel {
  chartType: string;
  layout: ChartLayout;
  ascendantSign: number | null;
  houses: HouseView[];
  planets: PlanetView[];
  calculation: ChartCalculationMeta;
  warnings: string[];
}

/** Fields a caller must supply to build a single planet row. */
export interface PlanetViewSeed {
  key: string;
  sign: number | null;
  house: number | null;
  degrees: number | null;
  longitude: number | null;
  retrograde: boolean;
  combust: boolean;
  dignity: string | null;
  source: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** A valid rashi index is an integer in [0, 11]. */
export function isValidSignIndex(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 11;
}

/** A valid house number is an integer in [1, 12]. */
export function isValidHouseNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12;
}

function isValidDegrees(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value < 30;
}

function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 360;
}

/** 0–11 normalisation, always in range. */
function normalizeSign(value: number): number {
  return ((value % 12) + 12) % 12;
}

// ─── Assembler ────────────────────────────────────────────────────────────────

export interface AssembleOptions {
  chartType: string;
  layout: ChartLayout;
  ascendantSign: number | null;
  seeds: PlanetViewSeed[];
  calculation: ChartCalculationMeta;
  warnings?: string[];
}

/**
 * Project already-calculated data into a validated, deterministic view model.
 * All validation warnings are surfaced on `warnings` rather than thrown.
 */
export function assembleViewModel(opts: AssembleOptions): ChartViewModel {
  const warnings: string[] = [...(opts.warnings ?? [])];

  let ascendantSign: number | null = opts.ascendantSign;
  if (ascendantSign !== null && !isValidSignIndex(ascendantSign)) {
    warnings.push(`Invalid ascendant sign index: ${String(ascendantSign)}`);
    ascendantSign = null;
  }

  // ── Build planet views (validate every field, null-out the invalid ones) ──
  const planets: PlanetView[] = opts.seeds.map((seed) => {
    let sign: number | null = seed.sign;
    if (sign !== null && !isValidSignIndex(sign)) {
      warnings.push(`Invalid sign index for ${seed.key}: ${String(seed.sign)}`);
      sign = null;
    }

    let house: number | null = seed.house;
    if (house !== null && !isValidHouseNumber(house)) {
      warnings.push(`Invalid house for ${seed.key}: ${String(seed.house)}`);
      house = null;
    }

    let degrees: number | null = seed.degrees;
    if (degrees !== null && !isValidDegrees(degrees)) {
      warnings.push(`Invalid degrees for ${seed.key}: ${String(seed.degrees)}`);
      degrees = null;
    }

    let longitude: number | null = seed.longitude;
    if (longitude !== null && !isValidLongitude(longitude)) {
      warnings.push(`Invalid longitude for ${seed.key}: ${String(seed.longitude)}`);
      longitude = null;
    }

    const minutes = degrees === null ? null : Math.floor((degrees - Math.floor(degrees)) * 60);

    let nakshatra: PlanetNakshatra | null = null;
    if (longitude !== null) {
      const info = calculateNakshatra(longitude);
      nakshatra = {
        name: {
          en: info.nameEn || (typeof info.name === 'string' ? info.name : info.name.en),
          hi: info.nameHi || (typeof info.name === 'string' ? info.name : info.name.hi),
        },
        pada: Number.isInteger(info.pada) ? info.pada : null,
        lord: info.lord ?? null,
      };
    }

    return {
      key: seed.key,
      name: PLANET_NAMES[seed.key] ?? { en: seed.key, hi: seed.key },
      abbreviation: PLANET_ABBR[seed.key] ?? { en: seed.key.slice(0, 2), hi: seed.key.slice(0, 2) },
      sign,
      signName: sign === null ? null : RASHI_NAMES[sign] ?? null,
      house,
      degrees,
      minutes,
      longitude,
      nakshatra,
      retrograde: seed.retrograde,
      combust: seed.combust,
      dignity: seed.dignity,
      source: seed.source,
    };
  });

  // ── Deterministic display order ───────────────────────────────────────────
  planets.sort((a, b) => {
    const d = planetOrderIndex(a.key) - planetOrderIndex(b.key);
    return d !== 0 ? d : a.key.localeCompare(b.key);
  });

  // ── Houses: sign derives from the ascendant; planets group by house ───────
  const houses: HouseView[] = [];
  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const sign = ascendantSign === null ? null : normalizeSign(ascendantSign + i);
    houses.push({
      house: houseNumber,
      sign,
      signName: sign === null ? null : RASHI_NAMES[sign] ?? null,
      planets: [],
      isAscendant: houseNumber === 1,
    });
  }

  for (const planet of planets) {
    if (planet.house !== null) {
      houses[planet.house - 1].planets.push(planet.key);
    }
  }

  // Keep the in-house ordering identical to the global deterministic order.
  for (const house of houses) {
    house.planets.sort((a, b) => {
      const d = planetOrderIndex(a) - planetOrderIndex(b);
      return d !== 0 ? d : a.localeCompare(b);
    });
  }

  return {
    chartType: opts.chartType,
    layout: opts.layout,
    ascendantSign,
    houses,
    planets,
    calculation: opts.calculation,
    warnings,
  };
}

// ─── Adapters from canonical service outputs ───────────────────────────────────

const ENGINE_VERSION = '1.0';

function describeEngine(positions: CompletePlanetaryPositions | null): string {
  if (!positions) return 'unavailable';
  return positions.ephemerisSource === 'swiss-wasm'
    ? 'Swiss Ephemeris (WASM)'
    : 'VSOP87 / Moshier fallback';
}

function describeAyanamsa(positions: CompletePlanetaryPositions | null): string {
  const value = positions?.ayanamsa;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `Lahiri (Chitrapaksha) ${value.toFixed(4)}°`;
  }
  return 'Lahiri (Chitrapaksha)';
}

export interface BuildRashiViewModelOptions {
  positions: CompletePlanetaryPositions | null;
  ascendant: AscendantData | null;
  chartType?: string;
  layout?: ChartLayout;
  /** Planet keys the canonical engine flagged as combust. */
  combustPlanets?: ReadonlySet<string>;
}

/** Project D1 (Rashi) chart data from the ephemeris + ascendant services. */
export function buildRashiViewModel(opts: BuildRashiViewModelOptions): ChartViewModel {
  const warnings: string[] = [];
  if (!opts.positions) warnings.push('Planetary positions are unavailable.');
  if (!opts.ascendant) warnings.push('Ascendant is unavailable.');

  const source = describeEngine(opts.positions) === 'unavailable'
    ? 'unavailable'
    : `ephemerisService (${describeEngine(opts.positions)})`;

  const seeds: PlanetViewSeed[] = (opts.positions?.planets ?? []).map((p: NormalizedPlanet) => {
    const sign = isValidSignIndex(p.rashiIndex) ? p.rashiIndex : null;
    const degrees = isValidDegrees(p.degrees) ? p.degrees : null;
    return {
      key: p.name,
      sign,
      house: isValidHouseNumber(p.house) ? p.house : null,
      degrees,
      longitude: sign === null || degrees === null ? null : sign * 30 + degrees,
      retrograde: p.retrograde ?? (p.name === 'Rahu' || p.name === 'Ketu'),
      combust: opts.combustPlanets?.has(p.name) ?? false,
      dignity: p.dignity ?? null,
      source,
    };
  });

  const ascendantSign = opts.ascendant
    ? (isValidSignIndex(opts.ascendant.ascendant.rashiIndex)
        ? opts.ascendant.ascendant.rashiIndex
        : null)
    : null;

  return assembleViewModel({
    chartType: opts.chartType ?? 'D1',
    layout: opts.layout ?? 'north',
    ascendantSign,
    seeds,
    calculation: {
      engine: describeEngine(opts.positions),
      version: ENGINE_VERSION,
      ayanamsa: describeAyanamsa(opts.positions),
      zodiac: 'sidereal',
      houseSystem: 'Whole Sign (Vedic)',
    },
    warnings,
  });
}

export interface BuildVargaViewModelOptions {
  chart: DivisionalChart | null;
  chartType?: string;
  layout?: ChartLayout;
}

/**
 * Project a divisional (varga) chart — D9, D10, … — into a view model.
 * Uses the deterministic `positions[]` array, never the mock `planets[]`.
 */
export function buildVargaViewModel(opts: BuildVargaViewModelOptions): ChartViewModel {
  const warnings: string[] = [];
  const chart = opts.chart;
  if (!chart) {
    warnings.push('Divisional chart is unavailable.');
  }

  const ascendantRashi = chart && isValidSignIndex(chart.ascendantRashi) ? chart.ascendantRashi : null;
  const source = `divisionalChartsService (D${chart?.division ?? '?'})`;

  const seeds: PlanetViewSeed[] = (chart?.positions ?? []).map((pos) => {
    const sign = isValidSignIndex(pos.vargaRashi) ? pos.vargaRashi : null;
    const house =
      sign === null || ascendantRashi === null
        ? null
        : normalizeSign(sign - ascendantRashi) + 1;
    return {
      key: pos.planet,
      sign,
      house,
      degrees: isValidDegrees(pos.vargaLongitude) ? pos.vargaLongitude : null,
      longitude: isValidLongitude(pos.originalLongitude) ? pos.originalLongitude : null,
      retrograde: false,
      combust: false,
      dignity: pos.isExalted
        ? 'exalted'
        : pos.isDebilitated
          ? 'debilitated'
          : pos.isOwnSign
            ? 'own'
            : null,
      source,
    };
  });

  return assembleViewModel({
    chartType: opts.chartType ?? (chart ? `D${chart.division}` : 'D?'),
    layout: opts.layout ?? 'north',
    ascendantSign: ascendantRashi,
    seeds,
    calculation: {
      engine: 'ShodashVarga (BPHS Ch. 6–7)',
      version: ENGINE_VERSION,
      ayanamsa: 'Lahiri (Chitrapaksha)',
      zodiac: 'sidereal',
      houseSystem: 'Whole Sign (Vedic)',
    },
    warnings,
  });
}

/** Planets occupying a given house, resolved to full `PlanetView` rows. */
export function planetsInHouse(model: ChartViewModel, house: number): PlanetView[] {
  const view = model.houses.find((h) => h.house === house);
  if (!view) return [];
  const byKey = new Map(model.planets.map((p) => [p.key, p]));
  return view.planets
    .map((key) => byKey.get(key))
    .filter((p): p is PlanetView => p !== undefined);
}

/** Planets occupying a given rashi index (used by the South Indian layout). */
export function planetsInSign(model: ChartViewModel, sign: number): PlanetView[] {
  return model.planets.filter((p) => p.sign === sign);
}

/** Convenience: number of non-null planets in the model. */
export function countedPlanets(model: ChartViewModel): number {
  return model.planets.filter((p) => p.sign !== null).length;
}
