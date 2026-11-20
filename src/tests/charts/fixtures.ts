/**
 * Synthetic chart fixtures for the c4 Phase 9 verification suite.
 *
 * These are entirely fictional, hand-authored values — no seed-bank or real
 * birth data is present anywhere in this file (confidentiality standing order).
 */

import {
  assembleViewModel,
  type ChartViewModel,
  type PlanetViewSeed,
  type ChartCalculationMeta,
} from '@/features/charts/model/chartViewModel';
import type {
  AntarDasha,
  DashaPeriod,
  DashaResult,
  PratyantarDasha,
} from '@/services/dashaService';

const CALC: ChartCalculationMeta = {
  engine: 'Synthetic test engine',
  version: '1.0',
  ayanamsa: 'Lahiri (Chitrapaksha) 24.0000°',
  zodiac: 'sidereal',
  houseSystem: 'Whole Sign (Vedic)',
};

let seedCounter = 0;

export function seed(partial: Partial<PlanetViewSeed> & { key: string }): PlanetViewSeed {
  seedCounter += 1;
  return {
    sign: null,
    house: null,
    degrees: null,
    longitude: null,
    retrograde: false,
    combust: false,
    dignity: null,
    source: `synthetic-${seedCounter}`,
    ...partial,
  };
}

export function longOf(sign: number, degrees: number): number {
  return sign * 30 + degrees;
}

/**
 * A synthetic D1-style view model: ascendant Aries (sign 0).
 * House 1 deliberately holds two planets (Sun + Mars); houses 3, 5, 8, 10, 11
 * are empty; Mercury is retrograde.
 */
export function makeD1ViewModel(overrides: Partial<Parameters<typeof assembleViewModel>[0]> = {}): ChartViewModel {
  const seeds: PlanetViewSeed[] = [
    seed({ key: 'Sun', sign: 0, house: 1, degrees: 10.5, longitude: longOf(0, 10.5), dignity: 'exalted' }),
    seed({ key: 'Mars', sign: 0, house: 1, degrees: 5.25, longitude: longOf(0, 5.25) }),
    seed({ key: 'Moon', sign: 1, house: 2, degrees: 3.0, longitude: longOf(1, 3.0) }),
    seed({ key: 'Mercury', sign: 3, house: 4, degrees: 15.0, longitude: longOf(3, 15.0), retrograde: true }),
    seed({ key: 'Jupiter', sign: 6, house: 7, degrees: 20.0, longitude: longOf(6, 20.0) }),
    seed({ key: 'Saturn', sign: 8, house: 9, degrees: 2.0, longitude: longOf(8, 2.0) }),
    seed({ key: 'Rahu', sign: 5, house: 6, degrees: 12.0, longitude: longOf(5, 12.0), retrograde: true }),
    seed({ key: 'Ketu', sign: 11, house: 12, degrees: 12.0, longitude: longOf(11, 12.0), retrograde: true }),
  ];

  return assembleViewModel({
    chartType: 'D1',
    layout: 'north',
    ascendantSign: 0,
    seeds,
    calculation: CALC,
    ...overrides,
  });
}

/** Synthetic D9 model — different placements so the D1/D9 switch is observable. */
export function makeD9ViewModel(): ChartViewModel {
  const seeds: PlanetViewSeed[] = [
    seed({ key: 'Sun', sign: 4, house: 2, degrees: 8.0, longitude: longOf(4, 8.0) }),
    seed({ key: 'Moon', sign: 7, house: 5, degrees: 22.0, longitude: longOf(7, 22.0) }),
    seed({ key: 'Mars', sign: 10, house: 8, degrees: 1.5, longitude: longOf(10, 1.5) }),
  ];
  return assembleViewModel({
    chartType: 'D9',
    layout: 'north',
    ascendantSign: 3,
    seeds,
    calculation: { ...CALC, engine: 'ShodashVarga (BPHS) — D9' },
  });
}

/** Synthetic D10 model. */
export function makeD10ViewModel(): ChartViewModel {
  const seeds: PlanetViewSeed[] = [
    seed({ key: 'Jupiter', sign: 2, house: 1, degrees: 12.0, longitude: longOf(2, 12.0) }),
    seed({ key: 'Venus', sign: 6, house: 5, degrees: 27.0, longitude: longOf(6, 27.0) }),
  ];
  return assembleViewModel({
    chartType: 'D10',
    layout: 'north',
    ascendantSign: 2,
    seeds,
    calculation: { ...CALC, engine: 'ShodashVarga (BPHS) — D10' },
  });
}

// ─── Dasha fixtures ───────────────────────────────────────────────────────────

const day = (ms: number) => ms / (24 * 60 * 60 * 1000);

function d(y: number, m: number, dayOfMonth: number): Date {
  return new Date(y, m - 1, dayOfMonth);
}

function pd(planet: string, start: Date, end: Date, isActive: boolean): PratyantarDasha {
  return { planet, startDate: start, endDate: end, durationDays: day(end.getTime() - start.getTime()), isActive };
}

function ad(
  planet: string,
  mahadashaLord: string,
  start: Date,
  end: Date,
  isActive: boolean,
  pratyantardashas: PratyantarDasha[] = [],
): AntarDasha {
  return {
    planet,
    mahadashaLord,
    startDate: start,
    endDate: end,
    durationDays: day(end.getTime() - start.getTime()),
    isActive,
    pratyantardashas,
  };
}

function maha(
  planet: string,
  start: Date,
  end: Date,
  isActive: boolean,
  antardashas: AntarDasha[],
): DashaPeriod {
  return {
    planet,
    startDate: start,
    endDate: end,
    durationYears: day(end.getTime() - start.getTime()) / 365.25,
    isActive,
    antardashas,
  };
}

/** Synthetic, internally-consistent Vimshottari dasha result. */
export function makeDashaResult(): DashaResult {
  const ketuMaha = maha('Ketu', d(1998, 1, 1), d(2005, 1, 1), false, [
    ad('Ketu', 'Ketu', d(1998, 1, 1), d(2001, 1, 1), false),
    ad('Venus', 'Ketu', d(2001, 1, 1), d(2005, 1, 1), false),
  ]);

  const moonAntar = ad('Moon', 'Venus', d(2010, 1, 1), d(2012, 1, 1), true, [
    pd('Moon', d(2010, 1, 1), d(2011, 1, 1), false),
    pd('Mars', d(2011, 1, 1), d(2012, 1, 1), true),
  ]);

  const venusMaha = maha('Venus', d(2005, 1, 1), d(2025, 1, 1), true, [
    ad('Venus', 'Venus', d(2005, 1, 1), d(2009, 1, 1), false),
    ad('Sun', 'Venus', d(2009, 1, 1), d(2010, 1, 1), false),
    moonAntar,
  ]);

  return {
    birthDate: d(2000, 1, 1),
    moonNakshatra: 5,
    moonNakshatraName: 'Mrigashira',
    moonNakshatraLord: 'Mars',
    balanceDays: 912,
    balanceYears: 2.5,
    mahadashas: [ketuMaha, venusMaha],
    currentMahadasha: venusMaha,
    currentAntardasha: moonAntar,
    currentPratyantardasha: moonAntar.pratyantardashas?.[1] ?? null,
  };
}

/** A deliberately broken result (overlapping Mahadashas) for validation tests. */
export function makeBrokenDashaResult(): DashaResult {
  const base = makeDashaResult();
  const broken: DashaResult = {
    ...base,
    mahadashas: [
      base.mahadashas[0],
      {
        ...base.mahadashas[1],
        // Starts before the previous Mahadasha ends → overlap.
        startDate: d(2003, 1, 1),
      },
    ],
  };
  return broken;
}
