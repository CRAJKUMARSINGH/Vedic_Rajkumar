/**
 * POST /functions/v1/erasure-sweep   (cron, every 5 minutes)
 *
 * Claims due steps with FOR UPDATE SKIP LOCKED, runs the adapter, records the
 * outcome. Never throws on a processor failure — the step goes back to pending
 * with exponential backoff and the request stays `partial` until it clears.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ADAPTERS } from '../_shared/erasure/adapters.ts';
import { withTelemetry } from '../_shared/telemetry.ts';

interface Claim { step_id: number; request_id: string; processor: string; subject_id: string; subject_ref: string }
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

Deno.serve(withTelemetry('erasure-sweep', async (req) => {
  const token = Deno.env.get('CRON_TOKEN');
  if (token && req.headers.get('x-cron-token') !== token) return json({ error: 'unauthorized' }, 401);

  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { data: claims, error } = await client.rpc('claim_erasure_steps', { p_limit: 10 });
  if (error) return json({ error: error.message }, 500);

  const results: Record<string, string>[] = [];

  for (const c of (claims ?? []) as Claim[]) {
    const adapter = ADAPTERS[c.processor];
    if (!adapter) {
      await client.rpc('record_erasure_step', {
        p_step: c.step_id, p_status: 'skipped', p_evidence: { reason: 'no_adapter' },
      });
      results.push({ step: String(c.step_id), processor: c.processor, outcome: 'skipped' });
      continue;
    }

    try {
      const outcome = await adapter({ subjectId: c.subject_id, subjectRef: c.subject_ref });
      await client.rpc('record_erasure_step', {
        p_step: c.step_id,
        p_status: outcome.status,
        p_evidence: outcome.evidence ?? null,
        p_error: outcome.error ?? null,
      });
      results.push({ step: String(c.step_id), processor: c.processor, outcome: outcome.status });
    } catch (err) {
      // transport-level failure -> retry with backoff, never lose the step
      await client.rpc('record_erasure_step', {
        p_step: c.step_id,
        p_status: 'pending',
        p_error: err instanceof Error ? err.message : String(err),
      });
      results.push({ step: String(c.step_id), processor: c.processor, outcome: 'retry' });
    }
  }

  return json({ claimed: claims?.length ?? 0, results });
}));
