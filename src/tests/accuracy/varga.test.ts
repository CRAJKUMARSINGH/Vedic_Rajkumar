/**
 * varga.test.ts — ACC-01 varga golden corpus gate (Tier B, exact).
 *
 * Checks the shipped divisions engine (divisionalChartsService) against the
 * independent transform in tools/accuracy/lib/varga.mjs, on the Swiss Ephemeris
 * longitudes recorded under tools/accuracy/golden/varga/. An off-by-one varga
 * sign is a wrong chart, so there is no tolerance here.
 *
 * Two claims, both true today:
 *   1. AGREEMENT — D2, D3, D7, D12 and D30 match the oracle exactly (sweep,
 *      boundaries and the whole corpus).
 *   2. DIVERGENCE — D10, D20, D24, D40, D45 and D60 fall through to the engine's
 *      generic `(sign * division + part) % 12`, which is not the classical rule.
 *      Those expectations pin the *current* divergence so it cannot be silently
 *      forgotten. Fixing the engine must update them AND
 *      docs/accuracy/VARGA-CONVENTIONS.md in the same change.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import {
  vargaSign,
  VARGA_KEYS,
  divisionOf,
} from '../../../tools/accuracy/lib/varga.mjs';
import { calculateShodashVarga, getVargaChart } from '@/services/divisionalChartsService';

const DIR = 'tools/accuracy/golden/varga';
const manifest = JSON.parse(readFileSync(`${DIR}/manifest.json`, 'utf8'));
const BODIES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];
const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** Divisions the engine maps exactly as the oracle does. */
const AGREEING = ['D2', 'D3', 'D7', 'D12', 'D30'];
/** Divisions the engine has no classical rule for — documented divergence. */
const DIVERGING = ['D10', 'D20', 'D24', 'D40', 'D45', 'D60'];

/** The engine's varga sign (0..11) for the Sun at `lon` in `division`. */
function engineSign(lon: number, division: number): number {
  return engineSigns(lon, [division])[division];
}

/**
 * The engine's Sun varga sign for several divisions at once. The shodashvarga
 * is computed a single time per longitude and the requested charts read out of
 * it — a whole-degree sweep calling `engineSign` per division would run the
 * full 16-chart computation five times per degree and time the suite out.
 */
function engineSigns(lon: number, divisions: number[]): Record<number, number> {
  const lons = Object.fromEntries(PLANETS.map((p) => [p, lon]));
  const result = calculateShodashVarga(lons, lon);
  const out: Record<number, number> = {};
  for (const division of divisions) {
    const chart = getVargaChart(result, division);
    expect(chart, `engine must expose D${division}`).toBeDefined();
    const pos = chart!.positions.find((p) => p.planet === 'Sun');
    expect(pos, `Sun must be present in D${division}`).toBeDefined();
    out[division] = pos!.vargaRashi;
  }
  return out;
}

/** The engine's generic fall-through: (sign * division + part) % 12. */
function genericSign(lon: number, division: number): number {
  const l = ((lon % 360) + 360) % 360;
  const s = Math.floor(l / 30);
  const part = Math.floor((l % 30) / (30 / division));
  return (s * division + part) % 12;
}

describe('golden varga corpus', () => {
  it('records all 11 vargas for every corpus chart', () => {
    expect(manifest.vargas).toEqual(VARGA_KEYS);
    const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'manifest.json');
    expect(manifest.charts.length).toBeGreaterThanOrEqual(15);
    expect(files.length).toBeGreaterThanOrEqual(15);
    for (const entry of manifest.charts) {
      const golden = JSON.parse(readFileSync(`${DIR}/${entry.id}.json`, 'utf8'));
      for (const body of BODIES) {
        expect(golden.bodies[body], `${entry.id} ${body}`).toBeDefined();
        expect(Object.keys(golden.bodies[body].varga)).toEqual(VARGA_KEYS);
      }
    }
  });

  it('is reproducible from the committed independent transform', () => {
    for (const entry of manifest.charts) {
      const golden = JSON.parse(readFileSync(`${DIR}/${entry.id}.json`, 'utf8'));
      for (const body of BODIES) {
        for (const key of VARGA_KEYS) {
          expect(golden.bodies[body].varga[key], `${entry.id} ${body} ${key}`).toBe(
            vargaSign(golden.bodies[body].lon, key),
          );
        }
      }
    }
  });
});

describe('varga mapping agrees with the independent oracle (Tier B, exact)', () => {
  it('matches D2/D3/D7/D12/D30 for every whole degree', () => {
    const divisions = AGREEING.map(divisionOf);
    const mismatches: string[] = [];
    for (let lon = 0; lon < 360; lon += 1) {
      const got = engineSigns(lon, divisions);
      for (const key of AGREEING) {
        const engine = got[divisionOf(key)];
        const oracle = vargaSign(lon, key);
        if (engine !== oracle) mismatches.push(`${key} @ ${lon}°: engine ${engine} vs oracle ${oracle}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('agrees at the part boundaries that flip a division', () => {
    // Degree offsets within a sign where at least one agreeing division flips,
    // checked in an odd, an even and a dual sign to exercise both tables.
    const offsets = [0, 2.5, 5, 7.5, 10, 12, 15, 17.5, 20, 22.5, 25, 27.5, 29.999];
    for (const s of [0, 1, 2]) {
      for (const d of offsets) {
        const lon = s * 30 + d;
        for (const key of AGREEING) {
          expect(engineSign(lon, divisionOf(key)), `${key} @ ${lon}°`).toBe(vargaSign(lon, key));
        }
      }
    }
  });
});

describe('varga corpus gate — engine vs golden', () => {
  for (const entry of manifest.charts) {
    it(`${entry.id}`, () => {
      const golden = JSON.parse(readFileSync(`${DIR}/${entry.id}.json`, 'utf8'));
      for (const body of BODIES) {
        const { lon, varga } = golden.bodies[body];
        for (const key of AGREEING) {
          expect(engineSign(lon, divisionOf(key)), `${body} ${key} @ ${lon}°`).toBe(varga[key]);
        }
      }
    });
  }
});

describe('documented divergence — D10/D20/D24/D40/D45/D60 (DEF-VARGA-*)', () => {
  // Engine: generic `(sign * division + part) % 12`. Oracle: the classical
  // start-sign rule in docs/accuracy/VARGA-CONVENTIONS.md. Equal only by
  // accident at some longitudes, so each block proves both the engine's current
  // behaviour AND that it genuinely departs from the oracle somewhere.
  const samples = [0.5, 30.5, 60.5, 90.5, 120.5, 150.5, 180.5, 210.5, 240.5, 270.5, 300.5, 330.5];

  for (const key of DIVERGING) {
    it(`${key} falls through to the generic mapping (DEF-VARGA-${key.slice(1)})`, () => {
      const division = divisionOf(key);
      let differ = 0;
      for (const lon of samples) {
        const engine = engineSign(lon, division);
        expect(engine, `${key} @ ${lon}° pins the current engine value`).toBe(genericSign(lon, division));
        if (engine !== vargaSign(lon, key)) differ += 1;
      }
      expect(differ, `${key} must differ from the oracle somewhere`).toBeGreaterThan(0);
    });
  }
});
