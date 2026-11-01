/**
 * flags/index.ts — flag evaluation.
 *
 * Served from a table, not a code deploy — that is the whole point. But the
 * client ALSO has baked defaults, so this endpoint being down is survivable.
 *
 * Cache-Control is short (30s) and it is aggressively cheap: no auth needed for
 * the kill flags, since knowing whether checkout is on is not sensitive.
 *
 * Served at /functions/v1/flags (verify_jwt = false in supabase/config.toml) —
 * an anonymous visitor has no JWT and must still be able to read the flags.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { json, handleOptions } from '../_shared/mod.ts';

Deno.serve(async (req) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await sb.from('flags').select('key, enabled, rollout');

  // On error, return an EMPTY map — the client falls back to baked fail-safes.
  // Returning a wrong value is worse than returning nothing.
  if (error) {
    return json({ flags: {}, degraded: true }, 200, { 'cache-control': 'no-store' });
  }

  const flags: Record<string, boolean> = {};
  for (const row of data ?? []) {
    // A rollout below 100 is resolved client-side (needs the anon id).
    flags[row.key] = row.rollout >= 100 ? row.enabled : row.enabled;
  }

  return json({ flags, generatedAt: new Date().toISOString() }, 200, {
    'cache-control': 'public, max-age=30, stale-while-revalidate=60',
  });
});
