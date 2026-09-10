/**
 * dataDeleteService.ts
 *
 * Frontend service for deleting user data from Supabase.
 * Integrates with the user-data-delete edge function.
 */

import { assertNotRateLimited } from '@/lib/rateLimiter';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export interface DeleteResult {
  deletedAt: string;
  userId: string;
  deleted: {
    saved_readings: number;
    transit_readings: number;
    prashna_sessions: number;
    horoscope_analyses: number;
    user_profile: number;
  };
}

/**
 * Delete all user data permanently.
 * Requires authentication and explicit confirmation (?confirm=true).
 * Rate-limited (3 deletes per user per day).
 */
export async function deleteUserData(supabase: SupabaseClient<Database>): Promise<DeleteResult> {
  // Client-side rate limiting check
  assertNotRateLimited('user-data-delete', {
    capacity: 3,
    refillAmount: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  try {
    const { data, error } = await supabase.functions.invoke('user-data-delete', {
      method: 'DELETE',
      body: { confirm: true },
    });

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Delete failed: No data returned');
    }

    return data as DeleteResult;
  } catch (err) {
    console.error('Error deleting user data:', err);
    throw err;
  }
}
