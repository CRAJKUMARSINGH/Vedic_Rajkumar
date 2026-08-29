// src/services/birthChartService.ts
import { analyzeBirthChart, BirthData, BirthChartResult } from '@vedic/birth-chart-insights';

/**
 * Wrapper around the remote birth-chart-insights package.
 * Returns a promise that resolves to the computed birth chart.
 */
export async function getBirthChart(data: BirthData): Promise<BirthChartResult> {
  try {
    const result = await analyzeBirthChart(data);
    return result;
  } catch (error) {
    console.error('Birth chart calculation failed', error);
    throw error;
  }
}
