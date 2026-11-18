/**
 * POST /functions/v1/user-erasure   (subject-initiated)
 * GET  /functions/v1/user-erasure   (own request status)
 *
 * Opens the ledger. Does NOT do the work inline — the sweep does, so a slow
 * processor cannot time out a user's HTTP request.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { withTelemetry } from '../_shared/telemetry.ts';

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

Deno.serve(withTelemetry('user-erasure', async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const auth = await authenticateRequest(req);
  if (!auth.userId) return jsonResponse({ error: 'unauthorized' }, 401, corsHeaders);

  const client = admin();

  if (req.method === 'GET') {
    const { data } = await client
      .from('erasure_requests')
      .select('id, status, requested_at, due_at, grace_until, completed_at')
      .eq('subject_id', auth.userId)
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return jsonResponse({ request: data ?? null }, 200, corsHeaders);
  }

  const body = await req.json().catch(() => ({}));
  const graceDays = Number.isFinite(body.graceDays) ? Number(body.graceDays) : 30;
  const email = auth.email ?? body.email ?? '';

  const { data: id, error } = await client.rpc('open_erasure_request', {
    p_subject: auth.userId,
    p_email: email,
    p_reason: body.reason ?? 'user_requested',
    p_grace_days: graceDays,
  });
  if (error) return jsonResponse({ error: error.message }, 500, corsHeaders);

  const { data: reqRow } = await client
    .from('erasure_requests')
    .select('id, status, due_at, grace_until')
    .eq('id', id)
    .single();

  return jsonResponse({ request: reqRow, processors: ['posthog','sentry','storage','clerk','supabase_auth'] }, 202, corsHeaders);
}));
