/**
 * POST /functions/v1/feedback-screenshot
 *   { action: 'sign-upload', mimeType }   -> 200 { path, token }
 *   { action: 'sign-read',   path }       -> 200 { url }   (author or owner/admin)
 *
 * Mints the short-lived links playbook §3.1 requires for the private
 * `feedback-screenshots` bucket. That bucket has NO storage.objects policy, so
 * this function — running as the service role — is the only door in or out.
 *
 * CONFIDENTIALITY (AGENTS.md standing order): an upload path is always scoped to
 * the caller's own `<uid>/` prefix, and a read is allowed only to the report's
 * author or to owner/admin. The caller never chooses the path. Requires a JWT
 * (the default), so there is no `verify_jwt = false` entry in
 * supabase/config.toml.
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

const BUCKET = 'feedback-screenshots';
const SIGNED_UPLOAD_TTL_SECONDS = 120;
const SIGNED_READ_TTL_SECONDS = 300;

/** MIME -> extension. Anything not listed here is refused (415). */
const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

/** The object-path shape this function writes and submit-feedback accepts. */
const PATH_RE = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(png|jpg|webp)$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

/** Owner/admin may read any report's screenshot; everyone else only their own. */
async function isStaff(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  const role = (data as { role?: string } | null)?.role;
  return role === 'owner' || role === 'admin';
}

serve(withTelemetry('feedback-screenshot', async (req) => {
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

    if (body.action === 'sign-upload') {
      const ext = EXT_BY_MIME[String(body.mimeType)];
      if (!ext) return json({ error: 'unsupported_media_type' }, 415);

      // The caller never picks the path: it is <their uid>/<random uuid>.<ext>.
      const path = `${auth.userId}/${crypto.randomUUID()}.${ext}`;
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUploadUrl(path, { upsert: false });
      if (error || !data) return json({ error: 'sign_failed' }, 500);

      return json({ path: data.path, token: data.token, expiresIn: SIGNED_UPLOAD_TTL_SECONDS });
    }

    if (body.action === 'sign-read') {
      const path = typeof body.path === 'string' ? body.path : '';
      if (!PATH_RE.test(path)) return json({ error: 'invalid_path' }, 400);

      const owner = path.split('/')[0];
      if (owner !== auth.userId && !(await isStaff(auth.userId))) {
        return json({ error: 'forbidden' }, 403);
      }

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_READ_TTL_SECONDS);
      if (error || !data) return json({ error: 'sign_failed' }, 500);

      return json({ url: data.signedUrl, expiresIn: SIGNED_READ_TTL_SECONDS });
    }

    return json({ error: 'unknown_action' }, 400);
  } catch (err) {
    if (err instanceof Response) return err;
    return json({ error: 'Internal server error' }, 500);
  }
}));
