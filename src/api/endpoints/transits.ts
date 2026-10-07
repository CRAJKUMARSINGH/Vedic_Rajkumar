/**
 * Transits API Endpoints
 * Gochar / Double Transit calculations with client-side fallback.
 */

import { apiClient, ApiClient } from '../client';
import type { ApiResponse } from '../types';
import type {
  TransitCalculationRequest,
  DoubleTransitResponse,
} from '../types';
import {
  type MoonDoubleTransitInput,
  type MoonDoubleTransitResult,
  checkMarriageMoonDoubleTransit,
  checkCareerMoonDoubleTransit,
  checkWealthMoonDoubleTransit,
  checkChildMoonDoubleTransit,
  checkForeignMoonDoubleTransit,
  buildApproxMoonDoubleTransitInput,
} from '@/services/doubleTransitService';

/**
 * Calculates double transit results across key life dimensions
 */
export async function calculateDoubleTransits(
  request: TransitCalculationRequest,
  client: ApiClient = apiClient
): Promise<ApiResponse<DoubleTransitResponse>> {
  try {
    return await client.post<DoubleTransitResponse, TransitCalculationRequest>(
      '/api/transits/double-transit',
      request
    );
  } catch (error) {
    if (!client.enableFallback) {
      throw error;
    }

    const targetDate = request.targetDate ? new Date(request.targetDate) : new Date();
    const input: MoonDoubleTransitInput =
      request.doubleTransitInput ??
      buildApproxMoonDoubleTransitInput(
        0, // Default to Aries moon if unspecified in quick transit lookup
        targetDate
      );

    const results: MoonDoubleTransitResult[] = [
      checkMarriageMoonDoubleTransit(input),
      checkCareerMoonDoubleTransit(input),
      checkWealthMoonDoubleTransit(input),
      checkChildMoonDoubleTransit(input),
      checkForeignMoonDoubleTransit(input),
    ];

    return {
      data: {
        results,
        calculatedAt: targetDate.toISOString(),
      },
      status: 200,
      message: 'Calculated using local double transit fallback',
      timestamp: new Date().toISOString(),
      source: 'fallback-local',
    };
  }
}
