/**
 * funnel/index.ts — event ingest.
 *
 * Design rules:
 *   1. NEVER block the UI. Analytics failing must not break a chart. The client
 *      fires-and-forgets and the endpoint always returns 202.
 *   2. Batched. One request per event per page is a request storm; the client
 *      flushes on idle and on unload.
 *   3. Validated against the same enum as the DB, so a typo'd event is rejected
 *      here rather than silently inserted.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { json, handleOptions, rateLimit, clientIdFrom } from '../../_shared/mod.ts';

const EVENTS = new Set([
  'landing_view','pricing_view','signup_start','signup_complete',
  'chart_created','weekly_limit_hit','upgrade_click',
  'checkout_start','checkout_complete','export_attempted','export_gated',
  'invite_sent','share_clicked','feedback_submitted',
]);

interface Incoming { event: string; anon_id: string; props?: Record<string, unknown>; at?: string }

Deno.serve(async (req) => {
  const pre = handleOptions(req); if (pre) return pre;
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // Cheap abuse guard — funnel spam should not cost a DB round trip per event.
  const rl = await rateLimit(req, { bucket: 'funnel', limit: 240, windowSec: 60, failOpen: true });
  if (!rl.allowed) return json({ accepted: 0, reason: 'rate_limited' }, 429);

  let body: { events?: Incoming[] };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }

  const incoming = Array.isArray(body.events) ? body.events.slice(0, 100) : [];
  if (!incoming.length) return json({ accepted: 0 }, 202);

  const rows = [];
  for (const e of incoming) {
    if (!EVENTS.has(e.event)) continue;               // drop, never 400 the batch
    if (!/^[0-9a-f-]{36}$/i.test(e.anon_id ?? '')) continue;
    rows.push({
      anon_id: e.anon_id,
      event: e.event,
      props: sanitise(e.props),
      occurred_at: e.at && !Number.isNaN(Date.parse(e.at)) ? e.at : new Date().toISOString(),
    });
  }
  if (!rows.length) return json({ accepted: 0 }, 202);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Link to a user if the request carries one — no extra round trip.
  const userId = clientIdFrom(req);
  if (userId) for (const r of rows) (r as Record<string, unknown>).user_id = userId;

  const { error } = await sb.from('funnel_events').insert(rows);
  // A funnel write failure is NEVER a user-facing error.
  if (error) console.warn('[funnel] insert failed', error.message);

  return json({ accepted: rows.length }, 202);
});

/** No PII. Cap string length so a runaway prop cannot bloat the table. */
function sanitise(props?: Record<string, unknown>): Record<string, unknown> {
  if (!props) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props).slice(0, 12)) {
    if (typeof v === 'string') out[k] = v.slice(0, 120);
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  return out;
}
