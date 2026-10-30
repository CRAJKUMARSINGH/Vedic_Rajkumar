/**
 * edgeClient.ts — satisfies the `@/integrations/supabase/client` and
 * `@/lib/supabaseClient` specifiers when src/api/v1 runs on the edge.
 *
 * LIMITATION: this is a module-level singleton using the anon key, so the mounted
 * v1 API runs as `anon` and inherits anon RLS. Per-request RLS-as-caller needs the
 * router to accept an injected client — tracked in ADR-003.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
