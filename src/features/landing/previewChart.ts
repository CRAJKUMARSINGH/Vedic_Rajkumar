/**
 * previewChart.ts — canonical *synthetic* chart fixture for the landing page.
 *
 * CONFIDENTIALITY (standing order, see AGENTS.md): every input below is
 * fictional and hand-authored. No seed-bank or real birth data appears here,
 * and none can be derived from it.
 *
 * Design contract
 * ---------------
 * The preview chart is NOT hand-drawn and carries no independently maintained
 * labels. It is produced by the project's own Lahiri-sidereal engine
 * (`calculateChart`) from the synthetic inputs below, then projected through the
 * canonical presentation model (`assembleViewModel`). The SVG chart and the
 * planetary table therefore read from one source of truth and can never
 * contradict each other. The `checks` returned here are the same invariants the
 * consistency tests assert.
 */

import { calculateChart, julianDay, lahiriAyanamsa, type ChartData } from '@/lib/vedic/vedicCalc';
import {
  assembleViewModel,
  type ChartViewModel,
  type PlanetViewSeed,
} from '@/features/charts/model/chartViewModel';

/**
 * Fictional birth parameters — illustrative only.
 * Coordinates are a rounded, well-known inland centroid, not a person's place.
 */
export const SYNTHETIC_BIRTH = {
  year: 1988,
  month: 3,
  day: 14,
  hour: 6,
  minute: 30,
  latitude: 23.0,
  longitude: 79.0,
  timezone: 5.5,
} as const;

/** The nine grahas the engine always returns, in engine order. */
export const EXPECTED_GRAHAS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Rahu',
  'Ketu',
] as const;

export interface PreviewChecks {
  /** House 1 is the ascendant house and carries the ascendant rashi. */
  ascendantIsHouse1: boolean;
  /** House rashis run sequentially forward from the ascendant. */
  houseSignsSequential: boolean;
  /** Each planet's house equals its sign offset from the ascendant (whole-sign). */
  planetHousesMatchSigns: boolean;
  /** Rahu and Ketu are exactly 180° apart (within 0.5°). */
  rahuKetuOpposition: boolean;
  /** All nine grahas are present and every one carries a nakshatra. */
  allGrahasWithNakshatra: boolean;
}

export interface LandingPreview {
  viewModel: ChartViewModel;
  checks: PreviewChecks;
  /** Lahiri ayanamsa (degrees) resolved at the synthetic instant. */
  ayanamsaValue: number;
  /** e.g. "Lahiri (Chitrapaksha) 23°41′41″". */
  ayanamsaLabel: string;
  /** Calculation settings string for display. */
  settingsLabel: string;
}

/** Degrees → `D°MM′SS″`. */
export function formatAyanamsa(value: number): string {
  const d = Math.floor(value);
  const minFloat = (value - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60);
  return `${d}°${String(m).padStart(2, '0')}′${String(s).padStart(2, '0')}″`;
}

/** Julian Day at the synthetic instant (UTC). */
function syntheticJulianDay(): number {
  const b = SYNTHETIC_BIRTH;
  const utcHour = b.hour + b.minute / 60 - b.timezone;
  return julianDay(b.year, b.month, b.day, utcHour);
}

function seedsFromChart(chart: ChartData): PlanetViewSeed[] {
  return chart.planets.map((p) => ({
    key: p.name,
    sign: p.rashi - 1,
    house: p.house,
    degrees: p.degree,
    longitude: p.longitude,
    retrograde: p.retrograde,
    combust: false,
    dignity: null,
    source: 'synthetic-fixture',
  }));
}

function normalise(diff: number): number {
  return ((diff % 360) + 360) % 360;
}

/** Derives the preview invariants from a projected view model. */
export function deriveChecks(viewModel: ChartViewModel): PreviewChecks {
  const asc = viewModel.ascendantSign;

  const ascendantIsHouse1 =
    viewModel.houses[0]?.isAscendant === true && viewModel.houses[0]?.sign === asc;

  const houseSignsSequential =
    asc !== null &&
    viewModel.houses.every((h, i) => h.sign === normalise(asc + i) % 12);

  const planetHousesMatchSigns =
    asc !== null &&
    viewModel.planets.every(
      (p) =>
        p.sign === null ||
        p.house === null ||
        p.house === (normalise(p.sign - asc) % 12) + 1,
    );

  const rahu = viewModel.planets.find((p) => p.key === 'Rahu');
  const ketu = viewModel.planets.find((p) => p.key === 'Ketu');
  const rahuKetuOpposition =
    rahu?.longitude != null &&
    ketu?.longitude != null &&
    Math.abs(normalise(ketu.longitude - rahu.longitude) - 180) <= 0.5;

  const allGrahasWithNakshatra =
    viewModel.planets.length === EXPECTED_GRAHAS.length &&
    EXPECTED_GRAHAS.every((key) => {
      const p = viewModel.planets.find((x) => x.key === key);
      return p != null && p.nakshatra != null && p.sign !== null;
    });

  return {
    ascendantIsHouse1,
    houseSignsSequential,
    planetHousesMatchSigns,
    rahuKetuOpposition,
    allGrahasWithNakshatra,
  };
}

/**
 * Builds the landing preview: synthetic inputs → canonical engine → canonical
 * view model. Pure and synchronous (sub-millisecond) so it is safe to call once
 * at module scope from the landing page.
 */
export function buildLandingPreview(): LandingPreview {
  const b = SYNTHETIC_BIRTH;
  const chart = calculateChart(
    b.year,
    b.month,
    b.day,
    b.hour,
    b.minute,
    b.latitude,
    b.longitude,
    b.timezone,
  );

  const ayanamsaValue = lahiriAyanamsa(syntheticJulianDay());
  const ayanamsaLabel = `Lahiri (Chitrapaksha) ${formatAyanamsa(ayanamsaValue)}`;
  const settingsLabel = 'Sidereal · Whole-sign houses · Mean nodes';

  const viewModel = assembleViewModel({
    chartType: 'D1',
    layout: 'north',
    ascendantSign: chart.lagna - 1,
    seeds: seedsFromChart(chart),
    calculation: {
      engine: 'Vedic Rajkumar local engine (MIT)',
      version: '1.0',
      ayanamsa: ayanamsaLabel,
      zodiac: 'sidereal',
      houseSystem: 'Whole Sign (Vedic)',
    },
  });

  return {
    viewModel,
    checks: deriveChecks(viewModel),
    ayanamsaValue,
    ayanamsaLabel,
    settingsLabel,
  };
}
