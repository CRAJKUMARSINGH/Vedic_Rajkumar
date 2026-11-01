/**
 * POST /functions/v1/redeem-invite  { "code": "<invite code>" }
 *
 * Claims a single-use beta invite for the authenticated caller and stamps the
 * 7-day trial window. The database (public.claim_beta_invite) is the authority;
 * this function only hashes the code, maps the outcome to an HTTP status and
 * records an audit row. See supabase/migrations/20261126_beta_trials.sql.
 *
 * CONFIDENTIALITY (AGENTS.md standing order): the raw code, the caller's email
 * and any birth field are never logged or echoed. Only sha256(code) reaches the
 * DB, and the response carries cohort + expiry — nothing identifying.
 *
 * Requires a JWT, so no `verify_jwt = false` entry in supabase/config.toml.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { withTelemetry } from '../_shared/observability.ts';
import { authenticateRequest } from '../_shared/auth.ts';
import { guardKillSwitch } from '../_shared/killSwitch.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

/** sha256 hex — must equal Postgres encode(digest(code, 'sha256'), 'hex'). */
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Outcome -> HTTP. 200 means "you have a window"; the rest explain why not. */
const STATUS_BY_CODE: Record<string, number> = {
  ok: 200,
  avoid_dup: 200,
  not_found: 404,
  email_mismatch: 403,
  already_redeemed: 409,
};

interface Tester {
  id: string;
  cohort: string;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
}

/** The JWT normally carries `email`; fall back to the admin API when it does not. */
async function resolveEmail(userId: string, fromJwt?: string): Promise<string | undefined> {
  if (fromJwt) return fromJwt;
  const { data } = await supabase.auth.admin.getUserById(userId);
  return data?.user?.email ?? undefined;
}

serve(withTelemetry('redeem-invite', async (req) => {
  if (req.method === 'OPTIONS') return corsResponse(req);
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const killed = await guardKillSwitch('kill_beta_trial');
    if (killed) return killed;

    const auth = await authenticateRequest(req);
    if (auth.isServiceRole) return json({ error: 'forbidden' }, 403);

    let body: { code?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }

    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (code.length < 8) return json({ error: 'invalid_code' }, 400);

    const email = await resolveEmail(auth.userId, auth.email);
    if (!email) return json({ error: 'email_unavailable' }, 400);

    const { data, error } = await supabase.rpc('claim_beta_invite', {
      p_hash: await sha256Hex(code),
      p_user: auth.userId,
      p_email: email,
    });
    if (error) return json({ error: 'claim_failed' }, 500);

    const result = (data ?? { code: 'not_found' }) as { code: string; tester?: Tester };
    const status = STATUS_BY_CODE[result.code] ?? 500;

    // Audit the privileged transition. No code, email or birth field is stored.
    if (result.tester) {
      await supabase.from('audit_logs').insert({
        user_id: auth.userId,
        action: 'redeem_invite',
        resource_type: 'beta_tester',
        resource_id: result.tester.id,
        changes: { outcome: result.code, cohort: result.tester.cohort },
      });
    }

    return json(
      {
        outcome: result.code,
        ...(result.tester
          ? { cohort: result.tester.cohort, expiresAt: result.tester.expiresAt }
          : {}),
      },
      status,
    );
  } catch (err) {
    if (err instanceof Response) return err;
    return json({ error: 'Internal server error' }, 500);
  }
}));
