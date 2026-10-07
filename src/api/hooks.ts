/**
 * React Query hooks for all Vedic API endpoints.
 * Each hook wraps the corresponding endpoint function and exposes
 * typed loading/error/data states for use in components.
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

import { calculateChart } from './endpoints/charts';
import { getPanchang } from './endpoints/panchang';
import { calculateDoubleTransits } from './endpoints/transits';
import { calculateMatchmaking } from './endpoints/matchmaking';

import type {
  ChartCalculationRequest,
  ChartCalculationResponse,
  PanchangRequest,
  PanchangResponse,
  TransitCalculationRequest,
  DoubleTransitResponse,
  MatchmakingRequest,
  MatchmakingResponse,
  ApiResponse,
} from './types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const apiQueryKeys = {
  chart: (request: ChartCalculationRequest) => ['chart', request] as const,
  panchang: (request: PanchangRequest) => ['panchang', request] as const,
  transits: (request: TransitCalculationRequest) => ['transits', request] as const,
} as const;

// ─── Birth Chart ──────────────────────────────────────────────────────────────

/**
 * Fetches / calculates a Kundli birth chart.
 * Falls back to client-side calculation when API is unavailable.
 *
 * @example
 * const { data, isLoading } = useChart({ birthData, chartStyle: 'north-indian' });
 */
export function useChart(
  request: ChartCalculationRequest | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<ChartCalculationResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: request ? apiQueryKeys.chart(request) : ['chart', null],
    queryFn: () => calculateChart(request!),
    enabled: request !== null,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours — birth charts don't change
    gcTime: 1000 * 60 * 60 * 48,    // Keep in cache 48 hours
    retry: 1,
    ...options,
  });
}

// ─── Panchang ─────────────────────────────────────────────────────────────────

/**
 * Fetches daily Panchang for a date + location.
 * Refreshes every hour.
 *
 * @example
 * const { data } = usePanchang({ date: '2026-10-07', coordinates: { lat: 28.6, lon: 77.2 } });
 */
export function usePanchang(
  request: PanchangRequest | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<PanchangResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: request ? apiQueryKeys.panchang(request) : ['panchang', null],
    queryFn: () => getPanchang(request!),
    enabled: request !== null,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2,
    retry: 1,
    ...options,
  });
}

// ─── Transits ─────────────────────────────────────────────────────────────────

/**
 * Calculates double transit (Gochar) results.
 * Falls back to local calculation when API unavailable.
 *
 * @example
 * const { data } = useTransits({ targetDate: '2026-10-07', doubleTransitInput: ... });
 */
export function useTransits(
  request: TransitCalculationRequest | null,
  options?: Omit<
    UseQueryOptions<ApiResponse<DoubleTransitResponse>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: request ? apiQueryKeys.transits(request) : ['transits', null],
    queryFn: () => calculateDoubleTransits(request!),
    enabled: request !== null,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
    retry: 1,
    ...options,
  });
}

// ─── Matchmaking ──────────────────────────────────────────────────────────────

/**
 * Mutation hook for Ashta Koota compatibility calculation.
 * Use mutate() to trigger — not a query since it requires two input charts.
 *
 * @example
 * const { mutate, data, isPending } = useMatchmaking();
 * mutate({ maleBirthData, femaleBirthData });
 */
export function useMatchmaking(
  options?: Omit<
    UseMutationOptions<ApiResponse<MatchmakingResponse>, Error, MatchmakingRequest>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: (request: MatchmakingRequest) => calculateMatchmaking(request),
    ...options,
  });
}
