/**
 * src/lib/api.ts
 *
 * Centralized typed API layer.
 * Single import point for all data operations (Supabase + edge functions).
 * Wraps Supabase calls with consistent error handling and TanStack Query keys.
 *
 * Week 3: Updated to use correct table names (saved_readings, user_profiles)
 * and removed @ts-nocheck in favour of proper Database types.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;

// ── Query key factory (for TanStack Query cache management) ──────────────────

export const queryKeys = {
  readings:    (userId?: string) => ['readings', userId] as const,
  reading:     (id: string)      => ['readings', id] as const,
  userProfile: (userId: string)  => ['profile', userId] as const,
  feedback:    ()                => ['feedback'] as const,
} as const;

// ── Error helper ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleSupabaseError(error: { message: string; code?: string } | null): never {
  throw new ApiError(error?.message ?? 'Unknown API error', error?.code);
}

// ── Saved Readings ────────────────────────────────────────────────────────────

export async function getReadings(userId: string, client?: DbClient) {
  const db = client ?? (supabase as unknown as DbClient);
  const { data, error } = await db
    .from('saved_readings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) handleSupabaseError(error);
  return data ?? [];
}

export async function saveReading(
  payload: {
    user_id: string;
    birth_date: string;
    birth_time?: string | null;
    birth_location?: string | null;
    chart_type?: string;
    title?: string | null;
    notes?: string | null;
    results?: Record<string, unknown> | null;
  },
  client?: DbClient,
) {
  const db = client ?? (supabase as unknown as DbClient);
  const { data, error } = await db
    .from('saved_readings')
    .insert({
      user_id:        payload.user_id,
      birth_date:     payload.birth_date,
      birth_time:     payload.birth_time ?? null,
      birth_location: payload.birth_location ?? null,
      chart_type:     payload.chart_type ?? 'transit',
      title:          payload.title ?? null,
      notes:          payload.notes ?? null,
      results:        payload.results ? JSON.parse(JSON.stringify(payload.results)) : null,
    })
    .select()
    .single();
  if (error) handleSupabaseError(error);
  return data;
}

export async function deleteReading(id: string, client?: DbClient) {
  const db = client ?? (supabase as unknown as DbClient);
  const { error } = await db.from('saved_readings').delete().eq('id', id);
  if (error) handleSupabaseError(error);
}

// ── User profile ──────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string, client?: DbClient) {
  const db = client ?? (supabase as unknown as DbClient);
  const { data, error } = await db
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) handleSupabaseError(error);
  return data;
}

export async function upsertUserProfile(
  profile: {
    id: string;
    display_name?: string | null;
    preferred_language?: string;
    default_birth_date?: string | null;
    default_birth_time?: string | null;
    default_birth_place?: string | null;
  },
  client?: DbClient,
) {
  const db = client ?? (supabase as unknown as DbClient);
  const { data, error } = await db
    .from('user_profiles')
    .upsert(
      {
        ...profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select()
    .single();
  if (error) handleSupabaseError(error);
  return data;
}

// ── Auth helpers (Supabase native auth — use alongside Clerk) ─────────────────

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) handleSupabaseError(error);
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) handleSupabaseError(error);
}

// ── Re-export supabase client for direct use when needed ─────────────────────

export { supabase };
