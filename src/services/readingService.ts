/**
 * readingService.ts
 *
 * Transit reading persistence — Supabase with localStorage fallback.
 *
 * Week 3 update:
 *  - owner_id is now set on every INSERT so RLS policies are satisfied.
 *  - accepts an optional SupabaseClient (authenticated via Clerk JWT) instead of
 *    always using the global anon client.  Falls back to anon client when no
 *    authenticated client is passed (e.g. unauthenticated visits still write to
 *    localStorage only).
 */

import { supabase as anonClient } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { TransitResult } from '@/data/transitData';

export interface SavedReading {
  id: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  moon_rashi_index: number;
  transit_date: string;
  overall_score: number;
  results: TransitResult[];
  created_at: string;
  owner_id?: string | null;
}

type SupabaseOrAnon = SupabaseClient<Database> | typeof anonClient;

/**
 * Persist a transit reading to Supabase.
 *
 * @param data       The reading payload
 * @param ownerId    The Clerk user ID (JWT sub). Pass null for anonymous sessions.
 * @param client     Optionally supply an authenticated Supabase client.
 *                   If omitted and ownerId is null, falls back to anon client.
 */
export async function saveReading(
  data: {
    birth_date: string;
    birth_time: string;
    birth_location: string;
    moon_rashi_index: number;
    transit_date: string;
    overall_score: number;
    results: TransitResult[];
  },
  ownerId: string | null = null,
  client?: SupabaseOrAnon,
): Promise<SavedReading | null> {
  const db = client ?? anonClient;

  try {
    const { data: saved, error } = await (db as SupabaseClient<Database>)
      .from('transit_readings')
      .insert({
        birth_date:       data.birth_date,
        birth_time:       data.birth_time,
        birth_location:   data.birth_location,
        moon_rashi_index: data.moon_rashi_index,
        transit_date:     data.transit_date,
        overall_score:    data.overall_score,
        results:          JSON.parse(JSON.stringify(data.results)) as import('@/integrations/supabase/types').Json,
        owner_id:         ownerId,
      })
      .select()
      .single();

    if (error) throw error;

    const reading = saved as unknown as SavedReading;
    saveToLocalStorage(reading);
    return reading;
  } catch (error) {
    console.error('Error saving reading to Supabase:', error);

    // Fallback to local storage only
    const localReading: SavedReading = {
      id: crypto.randomUUID(),
      ...data,
      owner_id: ownerId,
      created_at: new Date().toISOString(),
    };
    saveToLocalStorage(localReading);
    return localReading;
  }
}

function saveToLocalStorage(reading: SavedReading): void {
  try {
    const stored = localStorage.getItem('vedic_readings_backup');
    const readings: SavedReading[] = stored ? JSON.parse(stored) : [];
    readings.unshift(reading);
    // Keep last 50 readings
    localStorage.setItem('vedic_readings_backup', JSON.stringify(readings.slice(0, 50)));
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
}

/**
 * Fetch transit readings for a user.
 *
 * When an authenticated client + ownerId are supplied, fetches by owner_id
 * (respects RLS). Falls back to birth-data matching for backward compatibility.
 */
export async function getReadings(
  birthDate: string,
  birthLocation: string,
  options?: { ownerId?: string; client?: SupabaseOrAnon },
): Promise<SavedReading[]> {
  const db = options?.client ?? anonClient;

  try {
    let query = (db as SupabaseClient<Database>)
      .from('transit_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Prefer owner_id scoping when available (honoring RLS correctly)
    if (options?.ownerId) {
      query = query.eq('owner_id', options.ownerId);
    } else {
      query = query.eq('birth_date', birthDate).eq('birth_location', birthLocation);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown as SavedReading[];
  } catch (error) {
    console.error('Error fetching readings from Supabase:', error);
    return getFromLocalStorage(birthDate, birthLocation);
  }
}

function getFromLocalStorage(birthDate: string, birthLocation: string): SavedReading[] {
  try {
    const stored = localStorage.getItem('vedic_readings_backup');
    if (!stored) return [];
    const readings: SavedReading[] = JSON.parse(stored);
    return readings
      .filter((r) => r.birth_date === birthDate && r.birth_location === birthLocation)
      .slice(0, 10);
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return [];
  }
}
