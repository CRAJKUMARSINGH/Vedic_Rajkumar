/**
 * Panchang API Endpoints
 * Daily 5-limb Panchang calculations with client-side fallback.
 */

import { apiClient, ApiClient } from '../client';
import type { ApiResponse } from '../types';
import type {
  PanchangRequest,
  PanchangResponse,
} from '../types';
import { calculatePanchang } from '@/services/panchangService';
import { calculateCompletePlanetaryPositions } from '@/services/ephemerisService';

/**
 * Calculates complete daily Panchang for a date and location
 */
export async function getPanchang(
  request: PanchangRequest,
  client: ApiClient = apiClient
): Promise<ApiResponse<PanchangResponse>> {
  try {
    return await client.post<PanchangResponse, PanchangRequest>(
      '/api/panchang/daily',
      request
    );
  } catch (error) {
    if (!client.enableFallback) {
      throw error;
    }

    const dateObj = new Date(request.date);
    const lat = request.coordinates?.lat ?? 28.6139; // New Delhi default
    const lon = request.coordinates?.lon ?? 77.209;

    // Determine Sun & Moon sidereal positions for the given day
    const timeStr = '06:00'; // Standard Vedic dawn baseline
    const dateStr = request.date.includes('T') ? request.date.split('T')[0] : request.date;
    const positions = calculateCompletePlanetaryPositions(dateStr, timeStr);

    const sunLong = positions.sun.sidereal ?? 0;
    const moonLong = positions.moon.sidereal ?? 0;

    const panchangData = calculatePanchang(dateObj, lat, lon, moonLong, sunLong);

    return {
      data: panchangData,
      status: 200,
      message: 'Calculated using local Panchang fallback',
      timestamp: new Date().toISOString(),
      source: 'fallback-local',
    };
  }
}
