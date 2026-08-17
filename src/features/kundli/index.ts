/**
 * Kundli (Birth Chart) feature barrel.
 *
 * Public surface of the kundli feature module.
 * Import from '@/features/kundli' instead of reaching into subdirectories.
 *
 * Week 4 will populate this with the calculation engine:
 *   - calculateChart(data: BirthData): ChartResult
 *   - calculateVimshottariDasha(chart: ChartResult): DashaPeriod[]
 */

// Re-export types when they exist
export type { BirthData, ChartResult, PlanetPosition, HouseCusp } from './types';
