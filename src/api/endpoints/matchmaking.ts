/**
 * Matchmaking API Endpoints
 * Ashta Koota 36-point compatibility calculation with client-side fallback.
 */

import { apiClient, ApiClient } from '../client';
import type { ApiResponse } from '../types';
import type {
  MatchmakingRequest,
  MatchmakingResponse,
} from '../types';
import { calculateAshtakuta, type PartnerData } from '@/services/ashtakutaService';

function toPartnerData(birthData: MatchmakingRequest['maleBirthData']): PartnerData {
  return {
    name: birthData.name ?? 'Partner',
    dateOfBirth: birthData.date,
    timeOfBirth: birthData.time,
    placeOfBirth: birthData.location,
  };
}

/**
 * Calculates Ashta Koota compatibility between two birth charts
 */
export async function calculateMatchmaking(
  request: MatchmakingRequest,
  client: ApiClient = apiClient
): Promise<ApiResponse<MatchmakingResponse>> {
  try {
    return await client.post<MatchmakingResponse, MatchmakingRequest>(
      '/api/matchmaking/ashtakoota',
      request
    );
  } catch (error) {
    if (!client.enableFallback) {
      throw error;
    }

    const malePartner = toPartnerData(request.maleBirthData);
    const femalePartner = toPartnerData(request.femaleBirthData);

    const report = await calculateAshtakuta(malePartner, femalePartner);

    return {
      data: report,
      status: 200,
      message: 'Calculated using local Ashta Koota fallback',
      timestamp: new Date().toISOString(),
      source: 'fallback-local',
    };
  }
}
