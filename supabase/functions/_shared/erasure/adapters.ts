/**
 * erasure/adapters.ts — one adapter per processor. Each is idempotent and returns
 * EVIDENCE an auditor can read (ids, counts, status codes) — never a bare boolean.
 *
 * A processor with no credentials configured returns `skipped`, not `ok`. Silence
 * is the enemy: "we think it worked" is not proof.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface ErasureContext {
  subjectId: string;
  subjectRef: string;   // sha256(lower(email))
  email?: string;
}

export interface ErasureOutcome {
  status: 'ok' | 'skipped' | 'pending';
  evidence?: Record<string, unknown>;
  error?: string;
}

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

// ─── PostHog ────────────────────────────────────────────────────────────────
async function posthog(ctx: ErasureContext): Promise<ErasureOutcome> {
  const key = Deno.env.get('POSTHOG_PERSONAL_API_KEY');
  const project = Deno.env.get('POSTHOG_PROJECT_ID');
  const host = Deno.env.get('POSTHOG_HOST') ?? 'https://eu.posthog.com';
  if (!key || !project) return { status: 'skipped', evidence: { reason: 'not_configured' } };

  const res = await fetch(`${host}/api/projects/${project}/persons/`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ distinct_ids: [ctx.subjectId, ctx.email].filter(Boolean) }),
  });
  return {
    status: res.ok ? 'ok' : 'pending',
    evidence: { http: res.status, host, distinctIds: [ctx.subjectId, ctx.email].filter(Boolean).length },
    error: res.ok ? undefined : `posthog ${res.status}`,
  };
}

// ─── Sentry ─────────────────────────────────────────────────────────────────
async function sentry(ctx: ErasureContext): Promise<ErasureOutcome> {
  const token = Deno.env.get('SENTRY_AUTH_TOKEN');
  const org = Deno.env.get('SENTRY_ORG');
  const project = Deno.env.get('SENTRY_PROJECT');
  if (!token || !org || !project) return { status: 'skipped', evidence: { reason: 'not_configured' } };

  const res = await fetch(
    `https://sentry.io/api/0/projects/${org}/${project}/users/${encodeURIComponent(ctx.subjectId)}/`,
    { method: 'DELETE', headers: { authorization: `Bearer ${token}` } },
  );
  return {
    status: res.status === 404 ? 'ok' : res.ok ? 'ok' : 'pending',
    evidence: { http: res.status, org, project },
    error: res.ok || res.status === 404 ? undefined : `sentry ${res.status}`,
  };
}

// ─── Supabase Storage ───────────────────────────────────────────────────────
async function storage(ctx: ErasureContext): Promise<ErasureOutcome> {
  const client = admin();
  const bucket = Deno.env.get('EXPORT_BUCKET') ?? 'user-exports';
  const { data: objects, error: listErr } = await client.storage.from(bucket).list(ctx.subjectId, { limit: 1000 });
  if (listErr) return { status: 'pending', error: listErr.message };
  if (!objects?.length) return { status: 'ok', evidence: { bucket, removed: 0 } };

  const paths = objects.map((o) => `${ctx.subjectId}/${o.name}`);
  const { error } = await client.storage.from(bucket).remove(paths);
  return error
    ? { status: 'pending', error: error.message, evidence: { bucket, attempted: paths.length } }
    : { status: 'ok', evidence: { bucket, removed: paths.length } };
}

// ─── Clerk ──────────────────────────────────────────────────────────────────
async function clerk(ctx: ErasureContext): Promise<ErasureOutcome> {
  const secret = Deno.env.get('CLERK_SECRET_KEY');
  if (!secret) return { status: 'skipped', evidence: { reason: 'not_configured' } };

  const res = await fetch(`https://api.clerk.com/v1/users/${ctx.subjectId}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${secret}` },
  });
  return {
    status: res.ok || res.status === 404 ? 'ok' : 'pending',
    evidence: { http: res.status },
    error: res.ok || res.status === 404 ? undefined : `clerk ${res.status}`,
  };
}

// ─── Supabase auth (runs LAST — cascades our own rows) ──────────────────────
async function supabaseAuth(ctx: ErasureContext): Promise<ErasureOutcome> {
  const { error } = await admin().auth.admin.deleteUser(ctx.subjectId);
  if (error) {
    // already gone counts as success
    if (/not found/i.test(error.message)) return { status: 'ok', evidence: { note: 'already_deleted' } };
    return { status: 'pending', error: error.message };
  }
  return { status: 'ok', evidence: { cascaded: true } };
}

export const ADAPTERS: Record<string, (ctx: ErasureContext) => Promise<ErasureOutcome>> = {
  posthog,
  sentry,
  storage,
  clerk,
  supabase_auth: supabaseAuth,
};
