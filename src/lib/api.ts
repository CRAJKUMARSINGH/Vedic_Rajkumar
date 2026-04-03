/**
 * src/lib/api.ts
 * Centralized typed API layer — Week 26 SaaS modernization
 * Single import point for all data operations (Supabase + future edge functions).
 * Wraps Supabase calls with consistent error handling and TanStack Query keys.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// ── Type aliases ──────────────────────────────────────────────────────────────

type Tables = Database['public']['Tables'];

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

// ── Readings ──────────────────────────────────────────────────────────────────

export async function getReadings(userId: string) {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) handleSupabaseError(error);
  return data ?? [];
}

export async function saveReading(payload: {
  user_id: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  report_type: string;
  report_data: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from('readings')
    .insert(payload)
    .select()
    .single();
  if (error) handleSupabaseError(error);
  return data;
}

export async function deleteReading(id: string) {
  const { error } = await supabase.from('readings').delete().eq('id', id);
  if (error) handleSupabaseError(error);
}

// ── User profile ──────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) handleSupabaseError(error);
  return data;
}

export async function upsertUserProfile(profile: {
  id: string;
  display_name?: string;
  preferred_language?: string;
  default_birth_date?: string;
  default_birth_time?: string;
  default_birth_place?: string;
}) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
  if (error) handleSupabaseError(error);
  return data;
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

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
