/**
 * dataLayerService.ts
 *
 * Week 3: Unified data layer for all user-owned records.
 *
 * Provides:
 *  - saveSavedReading   — save a reading under the authenticated user
 *  - getSavedReadings   — fetch the current user's readings
 *  - deleteSavedReading — delete a single reading (owner check enforced by RLS)
 *  - upsertUserProfile  — create or update the user's profile row
 *  - getUserProfile     — fetch the user's profile
 *
 * All write operations run input through sanitizeText before inserting.
 * The Supabase client passed in should come from useAuthenticatedSupabase()
 * so the JWT is forwarded correctly.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '@/integrations/supabase/types';
import { sanitizeText } from '@/lib/sanitize';

export type SavedReading = Tables<'saved_readings'>;
export type UserProfile  = Tables<'user_profiles'>;
export type TransitReading = Tables<'transit_readings'>;
export type PrashnaSession = Tables<'prashna_sessions'>;
export type HoroscopeAnalysis = Tables<'horoscope_analyses'>;

// ── Saved Readings ────────────────────────────────────────────────────────────

export interface SaveReadingPayload {
  userId: string;
  title?: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  chartType?: string;
  notes?: string;
  results?: Record<string, unknown>;
}

export async function saveSavedReading(
  supabase: SupabaseClient<Database>,
  payload: SaveReadingPayload,
): Promise<SavedReading> {
  const { data, error } = await supabase
    .from('saved_readings')
    .insert({
      user_id:        sanitizeText(payload.userId),
      title:          payload.title          ? sanitizeText(payload.title)         : null,
      birth_date:     sanitizeText(payload.birthDate),
      birth_time:     payload.birthTime      ? sanitizeText(payload.birthTime)      : null,
      birth_location: payload.birthLocation  ? sanitizeText(payload.birthLocation)  : null,
      chart_type:     payload.chartType      ? sanitizeText(payload.chartType)      : 'transit',
      notes:          payload.notes          ? sanitizeText(payload.notes)          : null,
      results:        payload.results ? (JSON.parse(JSON.stringify(payload.results)) as import('@/integrations/supabase/types').Json) : null,
    })
    .select()
    .single();

  if (error) throw new Error(`saveSavedReading: ${error.message}`);
  return data;
}

export async function getSavedReadings(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 50,
): Promise<SavedReading[]> {
  const { data, error } = await supabase
    .from('saved_readings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getSavedReadings: ${error.message}`);
  return data ?? [];
}

export async function deleteSavedReading(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('saved_readings')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteSavedReading: ${error.message}`);
}

// ── User Profile ──────────────────────────────────────────────────────────────

export interface UpsertProfilePayload {
  id: string;
  displayName?: string;
  preferredLanguage?: string;
  defaultBirthDate?: string;
  defaultBirthTime?: string;
  defaultBirthPlace?: string;
}

export async function upsertUserProfile(
  supabase: SupabaseClient<Database>,
  payload: UpsertProfilePayload,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        id:                   sanitizeText(payload.id),
        display_name:         payload.displayName        ? sanitizeText(payload.displayName)       : null,
        preferred_language:   payload.preferredLanguage  ? sanitizeText(payload.preferredLanguage) : 'en',
        default_birth_date:   payload.defaultBirthDate   ? sanitizeText(payload.defaultBirthDate)  : null,
        default_birth_time:   payload.defaultBirthTime   ? sanitizeText(payload.defaultBirthTime)  : null,
        default_birth_place:  payload.defaultBirthPlace  ? sanitizeText(payload.defaultBirthPlace) : null,
        updated_at:           new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select()
    .single();

  if (error) throw new Error(`upsertUserProfile: ${error.message}`);
  return data;
}

export async function getUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(`getUserProfile: ${error.message}`);
  return data;
}

// ── Transit Readings ─────────────────────────────────────────────────────────────

export interface TransitReadingPayload {
  ownerId: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  moonRashiIndex: number;
  transitDate: string;
  overallScore: number;
  results: Record<string, unknown>;
}

export async function saveTransitReading(
  supabase: SupabaseClient<Database>,
  payload: TransitReadingPayload,
): Promise<TransitReading> {
  const { data, error } = await supabase
    .from('transit_readings')
    .insert({
      owner_id:       sanitizeText(payload.ownerId),
      birth_date:     sanitizeText(payload.birthDate),
      birth_time:     sanitizeText(payload.birthTime),
      birth_location: sanitizeText(payload.birthLocation),
      moon_rashi_index: payload.moonRashiIndex,
      transit_date:   sanitizeText(payload.transitDate),
      overall_score:  payload.overallScore,
      results:        payload.results ? (JSON.parse(JSON.stringify(payload.results)) as import('@/integrations/supabase/types').Json) : null,
    })
    .select()
    .single();

  if (error) throw new Error(`saveTransitReading: ${error.message}`);
  return data;
}

export async function getTransitReadings(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  limit = 50,
): Promise<TransitReading[]> {
  const { data, error } = await supabase
    .from('transit_readings')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getTransitReadings: ${error.message}`);
  return data ?? [];
}

export async function deleteTransitReading(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('transit_readings')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteTransitReading: ${error.message}`);
}

// ── Prashna Sessions ───────────────────────────────────────────────────────────

export interface PrashnaSessionPayload {
  ownerId: string;
  question: string;
  direction?: string;
  prashnaLagna: string;
  prashnaLagnaHindi?: string;
  category: string;
  categoryHindi?: string;
  briefSummaryEn: string;
  briefSummaryHi: string;
  coreMethodEn?: string;
  coreMethodHi?: string;
  answerEn: string;
  answerHi: string;
  remediesEn?: string;
  remediesHi?: string;
  classicalSource?: string;
  confidencePercent?: number;
  birthName?: string;
}

export async function savePrashnaSession(
  supabase: SupabaseClient<Database>,
  payload: PrashnaSessionPayload,
): Promise<PrashnaSession> {
  const { data, error } = await supabase
    .from('prashna_sessions')
    .insert({
      owner_id:             sanitizeText(payload.ownerId),
      question:             sanitizeText(payload.question),
      direction:            payload.direction           ? sanitizeText(payload.direction)           : null,
      prashna_lagna:        sanitizeText(payload.prashnaLagna),
      prashna_lagna_hindi:  payload.prashnaLagnaHindi  ? sanitizeText(payload.prashnaLagnaHindi)  : null,
      category:             sanitizeText(payload.category),
      category_hindi:       payload.categoryHindi       ? sanitizeText(payload.categoryHindi)       : null,
      brief_summary_en:     sanitizeText(payload.briefSummaryEn),
      brief_summary_hi:     sanitizeText(payload.briefSummaryHi),
      core_method_en:       payload.coreMethodEn       ? sanitizeText(payload.coreMethodEn)       : null,
      core_method_hi:       payload.coreMethodHi       ? sanitizeText(payload.coreMethodHi)       : null,
      answer_en:            sanitizeText(payload.answerEn),
      answer_hi:            sanitizeText(payload.answerHi),
      remedies_en:          payload.remediesEn         ? sanitizeText(payload.remediesEn)         : null,
      remedies_hi:          payload.remediesHi         ? sanitizeText(payload.remediesHi)         : null,
      classical_source:     payload.classicalSource    ? sanitizeText(payload.classicalSource)    : null,
      confidence_percent:   payload.confidencePercent ?? 70,
      birth_name:           payload.birthName          ? sanitizeText(payload.birthName)          : null,
    })
    .select()
    .single();

  if (error) throw new Error(`savePrashnaSession: ${error.message}`);
  return data;
}

export async function getPrashnaSessions(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  limit = 50,
): Promise<PrashnaSession[]> {
  const { data, error } = await supabase
    .from('prashna_sessions')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getPrashnaSessions: ${error.message}`);
  return data ?? [];
}

export async function deletePrashnaSession(
  supabase: SupabaseClient<Database>,
  id: number,
): Promise<void> {
  const { error } = await supabase
    .from('prashna_sessions')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deletePrashnaSession: ${error.message}`);
}

// ── Horoscope Analyses ───────────────────────────────────────────────────────

export interface HoroscopeAnalysisPayload {
  ownerId: string;
  question: string;
  name?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  latitude?: string;
  longitude?: string;
  moonSign?: string;
  ascendant?: string;
  additionalDetails?: string;
  chartSummary: string;
  analysisEn: string;
  analysisHi: string;
  keyYogas?: unknown[];
  remediesEn?: string;
  remediesHi?: string;
  classicalSources?: unknown[];
}

export async function saveHoroscopeAnalysis(
  supabase: SupabaseClient<Database>,
  payload: HoroscopeAnalysisPayload,
): Promise<HoroscopeAnalysis> {
  const { data, error } = await supabase
    .from('horoscope_analyses')
    .insert({
      owner_id:            sanitizeText(payload.ownerId),
      question:            sanitizeText(payload.question),
      name:                payload.name                ? sanitizeText(payload.name)                : null,
      date_of_birth:       payload.dateOfBirth         ? sanitizeText(payload.dateOfBirth)         : null,
      time_of_birth:       payload.timeOfBirth         ? sanitizeText(payload.timeOfBirth)         : null,
      place_of_birth:      payload.placeOfBirth        ? sanitizeText(payload.placeOfBirth)        : null,
      latitude:            payload.latitude            ? sanitizeText(payload.latitude)            : null,
      longitude:           payload.longitude           ? sanitizeText(payload.longitude)           : null,
      moon_sign:           payload.moonSign            ? sanitizeText(payload.moonSign)            : null,
      ascendant:           payload.ascendant           ? sanitizeText(payload.ascendant)           : null,
      additional_details:  payload.additionalDetails   ? sanitizeText(payload.additionalDetails)   : null,
      chart_summary:       sanitizeText(payload.chartSummary),
      analysis_en:         sanitizeText(payload.analysisEn),
      analysis_hi:         sanitizeText(payload.analysisHi),
      key_yogas:           payload.keyYogas            ? (JSON.parse(JSON.stringify(payload.keyYogas)) as import('@/integrations/supabase/types').Json) : [],
      remedies_en:         payload.remediesEn          ? sanitizeText(payload.remediesEn)          : null,
      remedies_hi:         payload.remediesHi          ? sanitizeText(payload.remediesHi)          : null,
      classical_sources:   payload.classicalSources    ? (JSON.parse(JSON.stringify(payload.classicalSources)) as import('@/integrations/supabase/types').Json) : [],
    })
    .select()
    .single();

  if (error) throw new Error(`saveHoroscopeAnalysis: ${error.message}`);
  return data;
}

export async function getHoroscopeAnalyses(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  limit = 50,
): Promise<HoroscopeAnalysis[]> {
  const { data, error } = await supabase
    .from('horoscope_analyses')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getHoroscopeAnalyses: ${error.message}`);
  return data ?? [];
}

export async function deleteHoroscopeAnalysis(
  supabase: SupabaseClient<Database>,
  id: number,
): Promise<void> {
  const { error } = await supabase
    .from('horoscope_analyses')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteHoroscopeAnalysis: ${error.message}`);
}

// ── Data export: all user-owned rows ─────────────────────────────────────────

export interface UserDataExport {
  exportedAt: string;
  userId: string;
  savedReadings: SavedReading[];
  userProfile: UserProfile | null;
  transitReadings: TransitReading[];
  prashnaSessions: PrashnaSession[];
  horoscopeAnalyses: HoroscopeAnalysis[];
}

export async function exportAllUserData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserDataExport> {
  const [readings, profile, transitReadings, prashnaSessions, horoscopeAnalyses] = await Promise.all([
    getSavedReadings(supabase, userId, 1000),
    getUserProfile(supabase, userId),
    getTransitReadings(supabase, userId, 1000),
    getPrashnaSessions(supabase, userId, 1000),
    getHoroscopeAnalyses(supabase, userId, 1000),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    userId,
    savedReadings: readings,
    userProfile: profile,
    transitReadings,
    prashnaSessions,
    horoscopeAnalyses,
  };
}

// ── Data delete: all user-owned rows ─────────────────────────────────────────

export interface DeleteUserDataResult {
  deletedReadings: number;
  deletedTransitReadings: number;
  deletedPrashnaSessions: number;
  deletedHoroscopeAnalyses: number;
  deletedUserProfile: number;
}

export async function deleteAllUserData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DeleteUserDataResult> {
  // Fetch counts first so we can report what was deleted
  const [readings, transitReadings, prashnaSessions, horoscopeAnalyses] = await Promise.all([
    getSavedReadings(supabase, userId, 1000),
    getTransitReadings(supabase, userId, 1000),
    getPrashnaSessions(supabase, userId, 1000),
    getHoroscopeAnalyses(supabase, userId, 1000),
  ]);

  const errors: string[] = [];

  // Delete from all tables in parallel
  const [
    { error: readingsError },
    { error: transitError },
    { error: prashnaError },
    { error: horoscopeError },
    { error: profileError },
  ] = await Promise.all([
    supabase.from('saved_readings').delete().eq('user_id', userId),
    supabase.from('transit_readings').delete().eq('owner_id', userId),
    supabase.from('prashna_sessions').delete().eq('owner_id', userId),
    supabase.from('horoscope_analyses').delete().eq('owner_id', userId),
    supabase.from('user_profiles').delete().eq('id', userId),
  ]);

  if (readingsError) errors.push(`saved_readings: ${readingsError.message}`);
  if (transitError) errors.push(`transit_readings: ${transitError.message}`);
  if (prashnaError) errors.push(`prashna_sessions: ${prashnaError.message}`);
  if (horoscopeError) errors.push(`horoscope_analyses: ${horoscopeError.message}`);
  if (profileError) errors.push(`user_profiles: ${profileError.message}`);

  if (errors.length > 0) {
    throw new Error(`deleteAllUserData failed: ${errors.join(', ')}`);
  }

  return {
    deletedReadings: readings.length,
    deletedTransitReadings: transitReadings.length,
    deletedPrashnaSessions: prashnaSessions.length,
    deletedHoroscopeAnalyses: horoscopeAnalyses.length,
    deletedUserProfile: 1, // Profile is always deleted if it exists
  };
}

