/**
 * Charts API Endpoints
 * Kundli / Birth Chart calculations with offline/client-side fallback.
 */

import { apiClient, ApiClient } from '../client';
import type { ApiResponse } from '../types';
import type {
  ChartCalculationRequest,
  ChartCalculationResponse,
} from '../types';
import { calculateKundli } from '@/services/kundliService';

/**
 * Helper to parse coordinates from BirthData location or defaults
 */
function parseCoordinatesAndOffset(birthData: { location?: string; timezone?: number }): {
  lat: number;
  lon: number;
  tz: number;
} {
  let lat = 28.6139; // New Delhi default
  let lon = 77.209;
  const tz = birthData.timezone ?? 5.5;

  if (birthData.location) {
    const match = birthData.location.match(/\(([-+]?\d*\.?\d+),\s*([-+]?\d*\.?\d+)\)/);
    if (match) {
      lat = parseFloat(match[1]);
      lon = parseFloat(match[2]);
    }
  }

  return { lat, lon, tz };
}

/**
 * Calculates birth chart / Kundli data via backend API with local fallback
 */
export async function calculateChart(
  request: ChartCalculationRequest,
  client: ApiClient = apiClient
): Promise<ApiResponse<ChartCalculationResponse>> {
  try {
    return await client.post<ChartCalculationResponse, ChartCalculationRequest>(
      '/api/charts/calculate',
      request
    );
  } catch (error) {
    if (!client.enableFallback) {
      throw error;
    }

    // Client-side fallback calculation using pure Vedic engine
    const { birthData, chartStyle = 'north-indian' } = request;
    const { lat, lon, tz } = parseCoordinatesAndOffset(birthData);

    const kundli = calculateKundli(
      birthData.date,
      birthData.time,
      lat,
      lon,
      tz,
      chartStyle
    );

    return {
      data: {
        ...kundli,
        calculationDate: new Date().toISOString(),
      },
      status: 200,
      message: 'Calculated using local engine fallback',
      timestamp: new Date().toISOString(),
      source: 'fallback-local',
    };
  }
}
