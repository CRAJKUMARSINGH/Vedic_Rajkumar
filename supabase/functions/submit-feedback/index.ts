/**
 * POST /functions/v1/submit-feedback
 *   { category, title, description, page?, userAgent?, appVersion?, sessionId?, tags? }
 *
 * The private sink for the in-app feedback widget (closes DEF-015). This function
 * is the ONLY writer to public.user_feedback, so the client never writes to the
 * table directly and RLS stays deny-by-default. The caller's tier is derived
 * server-side — never trusted from the payload — and the response echoes only a
 * row id.
 *
 * CONFIDENTIALITY (AGENTS.md standing order): rows are private; nothing here is
 * served to an unauthenticated caller. Requires a JWT, so no `verify_jwt = false`
 * entry in supabase/config.toml.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { withTelemetry } from '../_shared/observability.ts';
import { authenticateRequest } from '../_shared/auth.ts';

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

const LIMITS = {
  title: 200,
  description: 5000,
  category: 32,
  page: 512,
  userAgent: 512,
  appVersion: 64,
  sessionId: 128,
  screenshot: 256,
} as const;

/**
 * `<uid>/<uuid>.<ext>` — the only object shape `feedback-screenshot` mints. A
 * screenshot path is honoured only when it sits under the caller's own uid, so
 * one user can never attach another user's object.
 */
const SCREENSHOT_PATH_RE = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(png|jpg|webp)$/;
function validScreenshotPath(path: string, userId: string): boolean {
  return path.startsWith(`${userId}/`) && SCREENSHOT_PATH_RE.test(path);
}

/** Required field: must be a non-empty string within `max`. */
function required(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s && s.length <= max ? s : null;
}

/** Optional field: absent/blank becomes null; over-long is truncated. */
function optional(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

serve(withTelemetry('submit-feedback', async (req) => {
  if (req.method === 'OPTIONS') return corsResponse(req);
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const auth = await authenticateRequest(req);
    if (auth.isServiceRole) return json({ error: 'forbidden' }, 403);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }

    const title = required(body.title, LIMITS.title);
    const description = required(body.description, LIMITS.description);
    const category = required(body.category, LIMITS.category);
    if (!title || !description || !category) return json({ error: 'invalid_payload' }, 400);

    const tags = Array.isArray(body.tags)
      ? body.tags.filter((t): t is string => typeof t === 'string' && t.length <= 64).slice(0, 20)
      : [];

    // A screenshot is optional. If a path is supplied it must be one this caller
    // could have uploaded (server-minted, under their own uid); anything else is
    // dropped rather than rejected, so the report itself still lands.
    const rawPath = optional(body.screenshotPath, LIMITS.screenshot);
    const screenshotPath =
      rawPath && validScreenshotPath(rawPath, auth.userId) ? rawPath : null;

    // Server is the authority on tier; the payload's tier (if any) is ignored.
    const { data: entitlement } = await supabase.rpc('resolve_entitlement', {
      p_user: auth.userId,
    });
    const tier = (entitlement as { tier?: string } | null)?.tier ?? 'free';

    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: auth.userId,
        tier,
        category,
        title,
        description,
        page_url: optional(body.page, LIMITS.page),
        user_agent: optional(body.userAgent, LIMITS.userAgent),
        app_version: optional(body.appVersion, LIMITS.appVersion),
        session_id: optional(body.sessionId, LIMITS.sessionId),
        screenshot_path: screenshotPath,
        tags,
      })
      .select('id')
      .single();

    if (error) return json({ error: 'insert_failed' }, 500);
    return json({ id: (data as { id: string }).id }, 201);
  } catch (err) {
    if (err instanceof Response) return err;
    return json({ error: 'Internal server error' }, 500);
  }
}));
