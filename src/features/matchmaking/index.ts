/**
 * Matchmaking (Kundli Milan) feature — public barrel.
 * Import from '@/features/matchmaking' instead of reaching into subdirectories.
 */

export type {
  CompatibilityInput,
  KutaResult,
  YoniAnimal,
  YoniMatrix,
  AshtakutaResult,
  ManglikDoshaCheck,
  PlanetaryDoshaCheck,
  NavamshaCompatibility,
  DashaPeriodMatch,
  CompatibilityRemedy,
  CompatibilityPdfOptions,
  ProspectSummary,
  ProspectComparison,
  CompatibilityResult,
  // Legacy aliases
  GunaDetail,
  GunaMilanResult,
} from './types';

export {
  YONI_MATRIX,
  NAKSHATRA_YONI,
  calculateCompatibility,
  compareProspects,
} from './stubs';
