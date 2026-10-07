/**
 * API Layer Types
 * Central type definitions for HTTP client, requests, responses, and errors.
 */

import type { BirthData, GeoCoordinates, Language } from '@/types/astrology';
import type { KundliData, ChartStyle } from '@/services/kundliService';
import type { MoonDoubleTransitInput, MoonDoubleTransitResult } from '@/services/doubleTransitService';
import type { CompatibilityReport } from '@/services/ashtakutaService';
import type { Panchang } from '@/services/panchangService';

// ─── Generic API Response / Error ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
  source: 'remote' | 'fallback-local';
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  status?: number;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'API_ERROR', status = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ─── Request Interceptors & Config ────────────────────────────────────────────

export interface RequestInterceptorContext {
  url: string;
  options: RequestInit;
}

export interface ResponseInterceptorContext<T = unknown> {
  response: Response;
  data: T;
}

export type RequestInterceptor = (
  context: RequestInterceptorContext
) => Promise<RequestInterceptorContext> | RequestInterceptorContext;

export type ResponseInterceptor = (
  context: ResponseInterceptorContext
) => Promise<ResponseInterceptorContext> | ResponseInterceptorContext;

export type ErrorInterceptor = (
  error: ApiError
) => Promise<ApiError | unknown> | ApiError | unknown;

export interface ApiClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  getAuthToken?: () => Promise<string | null> | string | null;
  enableFallback?: boolean;
}

// ─── Charts API Types ─────────────────────────────────────────────────────────

export interface ChartCalculationRequest {
  birthData: BirthData;
  chartStyle?: ChartStyle;
  ayanamsa?: 'Lahiri' | 'Raman' | 'KP';
  language?: Language;
}

export interface ChartCalculationResponse extends KundliData {
  ayanamsaOffset?: number;
  calculationDate?: string;
}

// ─── Transits API Types ───────────────────────────────────────────────────────

export interface TransitCalculationRequest {
  targetDate?: string; // YYYY-MM-DD
  coordinates?: GeoCoordinates;
  doubleTransitInput?: MoonDoubleTransitInput;
}

export interface DoubleTransitResponse {
  results: MoonDoubleTransitResult[];
  calculatedAt: string;
}

// ─── Matchmaking API Types ───────────────────────────────────────────────────

export interface MatchmakingRequest {
  maleBirthData: BirthData;
  femaleBirthData: BirthData;
  language?: Language;
}

export type MatchmakingResponse = CompatibilityReport;

// ─── Panchang API Types ───────────────────────────────────────────────────────

export interface PanchangRequest {
  date: string; // YYYY-MM-DD
  coordinates?: GeoCoordinates;
  language?: Language;
}

export type PanchangResponse = Panchang;

