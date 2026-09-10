/**
 * useAuthenticatedSupabase
 *
 * Returns a Supabase client that carries the current Clerk JWT so that
 * Supabase RLS policies keyed on `auth.jwt() ->> 'sub'` resolve to the
 * signed-in Clerk user ID.
 *
 * Usage:
 *   const supabase = useAuthenticatedSupabase();
 *   const { data } = await supabase.from('saved_readings').select('*');
 *
 * Falls back to the anonymous client when the user is not signed in or
 * when Clerk is not configured (dev / demo mode).
 *
 * How it works:
 *   Supabase JS v2 accepts an `accessToken` async function in its `auth`
 *   options. Every time Supabase needs to make an authenticated request it
 *   calls that function and injects the returned token as the Authorization
 *   header. We supply Clerk's active session token there.
 *
 * ⚠️ Important: You must also configure a Clerk JWT Template in the Clerk
 * dashboard that sets `iss` and `aud` to match your Supabase project so
 * Supabase can verify the token signature. See:
 * https://clerk.com/docs/integrations/databases/supabase
 */

import { useMemo } from 'react';
import { useSession } from '@clerk/react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key';

/**
 * Creates a Supabase client whose Authorization header is refreshed from
 * Clerk on every request, enabling owner-scoped RLS.
 */
export function useAuthenticatedSupabase() {
  const { session } = useSession();

  return useMemo(() => {
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // Disable Supabase's own session management — Clerk owns identity.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        // Inject Clerk JWT as Bearer token on every fetch Supabase makes.
        fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
          let token: string | null = null;
          try {
            if (session) {
              // getToken() returns the raw JWT string from Clerk's active session.
              token = await session.getToken({ template: 'supabase' });
            }
          } catch {
            // Session expired or Clerk not configured — fall through to anon.
          }

          const headers = new Headers(options.headers);
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          return fetch(url, { ...options, headers });
        },
      },
    });
  }, [session]);
}

export default useAuthenticatedSupabase;
