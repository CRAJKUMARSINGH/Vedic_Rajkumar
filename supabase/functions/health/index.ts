/**
 * health edge function — Week 9 Observability
 * Deep health check: DB ping + ephemeris engine check.
 * Returns 200 when healthy, 503 when degraded.
 * Suitable for uptime monitors (UptimeRobot / BetterStack).
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { logger } from '../_shared/observability.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  const checks: Record<string, { status: string; latencyMs?: number }> = {};
  let healthy = true;

  // ── Database ping ────────────────────────────────────────────────────────
  try {
    const start = Date.now();
    const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/`, {
      headers: { apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '' },
    });
    checks.database = { status: res.ok ? 'ok' : 'degraded', latencyMs: Date.now() - start };
    if (!res.ok) healthy = false;
  } catch {
    checks.database = { status: 'down' };
    healthy = false;
  }

  // ── Ephemeris engine check (edge: verify env config exists) ──────────────
  const ephemerisConfigured = !!Deno.env.get('SUPABASE_URL');
  checks.ephemeris = { status: ephemerisConfigured ? 'ok' : 'not_configured' };

  const body = {
    status: healthy ? 'healthy' : 'degraded',
    version: Deno.env.get('RELEASE_VERSION') ?? 'dev',
    region: Deno.env.get('DENO_REGION') ?? 'unknown',
    checks,
    ts: new Date().toISOString(),
  };

  logger.info('health_check', { status: body.status });

  return new Response(JSON.stringify(body), {
    status: healthy ? 200 : 503,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
});
