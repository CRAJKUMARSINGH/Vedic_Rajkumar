/**
 * Kundli (Birth Chart) feature — public barrel.
 * Import from '@/features/kundli' instead of reaching into subdirectories.
 *
 * Stubs (Week 3): calculateChart, calculateVimshottariDasha
 * Real engine (Week 4): replace stubs.ts with engine.ts
 */

export type {
  BirthData,
  Planet,
  Sign,
  Nakshatra,
  Pada,
  PlanetPosition,
  HouseCusp,
  AyanamsaType,
  HouseSystem,
  ChartResult,
  DashaPeriod,
  DashaResult,
} from './types';

export { calculateChart, calculateVimshottariDasha } from './engine';
