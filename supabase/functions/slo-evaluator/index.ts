/**
 * POST /functions/v1/slo-evaluator  (cron, every minute)
 *
 * Computes SLIs + burn rates, writes snapshots, opens/resolves alerts, and
 * notifies on state CHANGE only (not every minute) so on-call is not spammed.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withTelemetry } from '../_shared/telemetry.ts';

interface EvalRow { slo_id: string; sli: number | null; burn_rate: number | null; breached: boolean; action: string }

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

Deno.serve(withTelemetry('slo-evaluator', async (req) => {
  // cron calls arrive unauthenticated; require the service role key OR a shared token
  const token = Deno.env.get('CRON_TOKEN');
  if (token && req.headers.get('x-cron-token') !== token) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await admin.rpc('evaluate_slos');
  if (error) return json({ error: error.message }, 500);

  const rows = (data ?? []) as EvalRow[];
  const transitions = rows.filter((r) => r.action === 'fired' || r.action === 'resolved');

  for (const t of transitions) {
    const { data: slo } = await admin
      .from('slo_definitions')
      .select('name, severity, runbook_url')
      .eq('id', t.slo_id)
      .maybeSingle();

    await notify({
      kind: t.action,
      slo: t.slo_id,
      name: slo?.name ?? t.slo_id,
      severity: slo?.severity ?? 'warning',
      sli: t.sli,
      burnRate: t.burn_rate,
      runbook: slo?.runbook_url,
    });

    await admin.from('alert_events')
      .update({ notified_at: new Date().toISOString() })
      .eq('slo_id', t.slo_id).eq('state', t.action === 'fired' ? 'firing' : 'resolved')
      .is('notified_at', null);
  }

  return json({ evaluated: rows.length, transitions: transitions.length, rows });
}));

async function notify(payload: Record<string, unknown>): Promise<void> {
  const url = Deno.env.get('ALERT_WEBHOOK_URL');
  if (!url) return;                       // no webhook configured -> table is the record
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: `[${payload.kind}] ${payload.name} (${payload.severity}) burn=${payload.burnRate} — ${payload.runbook}` }),
    });
  } catch {
    /* notification failure must not fail the evaluator */
  }
}
