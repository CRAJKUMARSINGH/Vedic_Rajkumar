/**
 * dataExportService.ts
 *
 * Frontend service for exporting user data from Supabase.
 * Integrates with the user-data-export edge function.
 */

import { assertNotRateLimited } from '@/lib/rateLimiter';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export interface ExportedUserData {
  exportedAt: string;
  userId: string;
  userProfile: any | null;
  savedReadings: any[];
  prashnaSessions: any[];
  horoscopeAnalyses: any[];
  transitReadings: any[];
}

/**
 * Export all user data as JSON using authenticated Supabase client.
 * Requires authentication and is rate-limited (5 requests per hour).
 */
export async function exportUserData(supabase: SupabaseClient<Database>): Promise<ExportedUserData> {
  // Client-side rate limiting check
  assertNotRateLimited('user-data-export', {
    capacity: 5,
    refillAmount: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  });
  
  try {
    const { data, error } = await supabase.functions.invoke('user-data-export', {
      method: 'GET',
    });

    if (error) {
      throw new Error(`Export failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Export failed: No data returned');
    }

    return data as ExportedUserData;
  } catch (err) {
    console.error('Error exporting user data:', err);
    throw err;
  }
}

/**
 * Export user data and trigger file download.
 */
export async function exportAndDownloadUserData(supabase: SupabaseClient<Database>): Promise<void> {
  const data = await exportUserData(supabase);
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `vedic-data-export-${data.userId}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
