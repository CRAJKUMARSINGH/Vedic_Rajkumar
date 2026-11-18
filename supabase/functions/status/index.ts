/**
 * GET /functions/v1/status -> machine-readable status. Public, cacheable.
 * Replaces the hand-edited ops/status/status.json (scripts/emit-status.mjs writes it).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withTelemetry } from '../_shared/telemetry.ts';

const json = (b: unknown, s = 200, maxAge = 30) =>
  new Response(JSON.stringify(b, null, 2), {
    status: s,
    headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${maxAge}` },
  });

Deno.serve(withTelemetry('status', async () => {
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const [{ data: defs }, { data: snaps }, { data: open }] = await Promise.all([
    admin.from('slo_definitions').select('id, name, target, severity').eq('enabled', true),
    admin.from('slo_snapshots').select('slo_id, sli, burn_rate, breached, computed_at').order('computed_at', { ascending: false }).limit(50),
    admin.from('alert_events').select('slo_id, severity, value, created_at').eq('state', 'firing'),
  ]);

  const latest = new Map<string, { sli: number | null; burn_rate: number | null; breached: boolean }>();
  for (const s of snaps ?? []) if (!latest.has(s.slo_id)) latest.set(s.slo_id, s);

  const services = (defs ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    target: d.target,
    severity: d.severity,
    sli: latest.get(d.id)?.sli ?? null,
    burnRate: latest.get(d.id)?.burn_rate ?? null,
    state: latest.get(d.id)?.breached ? 'degraded' : 'operational',
  }));

  const overall = (open ?? []).some((a) => a.severity === 'critical')
    ? 'major_outage'
    : (open ?? []).length ? 'degraded' : 'operational';

  return json({
    status: overall,
    updatedAt: new Date().toISOString(),
    services,
    activeAlerts: open ?? [],
  });
}));
