/**
 * POST /functions/v1/ingest-rum — Web Vitals sink.
 * Batched by the client; validates metric name and route length so a rogue
 * caller cannot blow up cardinality.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withTelemetry, normalizeRoute } from '../_shared/telemetry.ts';

const METRICS = new Set(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']);
const MAX_BATCH = 50;

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

Deno.serve(withTelemetry('ingest-rum', async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const body = await req.json().catch(() => null);
  const samples = Array.isArray(body?.samples) ? body.samples.slice(0, MAX_BATCH) : [];
  if (!samples.length) return json({ accepted: 0 });

  const rows = samples
    .filter((s: { metric?: string; value?: number }) => s.metric && METRICS.has(s.metric) && Number.isFinite(s.value))
    .map((s: { metric: string; value: number; route?: string }) => ({
      metric: s.metric,
      value: s.value,
      route: normalizeRoute(s.route ?? '/').slice(0, 80),
    }));

  if (!rows.length) return json({ accepted: 0 });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
  const { error } = await admin.from('rum_samples').insert(rows);
  if (error) return json({ error: error.message }, 500);
  return json({ accepted: rows.length });
}));
