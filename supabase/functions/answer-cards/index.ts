/**
 * answer-cards — the ONLY surface that serves a full (unredacted) answer card.
 *
 * `GET /answer-cards?person=<name or alias>&topics=<csv>&lang=hi|en`
 *
 * Authorization (AGENTS.md — CONFIDENTIALITY standing order):
 *   unauthenticated      → 401, nothing served
 *   authenticated owner  → full card (raw birth data)
 *   owner/admin          → full card
 *   anyone else          → 404 — same answer as "no such subject", so a
 *                          non-owner cannot probe for who is in the seed bank
 *
 * The card itself is read with a client that carries the caller's own JWT, so
 * RLS — not this handler — is what decides whether the row is visible
 * (`20261025120000_answer_cards_rls.sql`). The service-role client is used only
 * to resolve a name to a slug and to read role metadata.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { authenticateRequest } from '../_shared/auth.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';

type Viewer = 'owner' | 'admin';

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const slugify = (s: string): string =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Exact name or alias match, case/punctuation-insensitive — same rule as the emitter. */
async function findCardSlug(admin: ReturnType<typeof createClient>, person: string): Promise<string | null> {
  const slug = slugify(person);
  const { data, error } = await admin.from('answer_cards').select('slug').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (data) return data.slug as string;

  const { data: rows, error: scanError } = await admin.from('answer_cards').select('slug, subject_name');
  if (scanError) throw scanError;
  const hit = (rows ?? []).find(r => slugify(r.subject_name as string) === slug);
  return hit ? (hit.slug as string) : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse(req);

  const allowed = await checkRateLimit(req, { endpoint: 'answer-cards' });
  if (!allowed) return rateLimitResponse();

  let auth;
  try {
    auth = await authenticateRequest(req);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  const url = new URL(req.url);
  const person = url.searchParams.get('person');
  if (!person) return json({ error: 'invalid_input: person is required' }, 422);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: 'misconfigured: missing Supabase credentials' }, 500);
  }

  // `admin`: metadata only — role lookup and name→slug resolution.
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  // `asCaller`: the card read. Carries the caller's JWT, so RLS applies.
  const asCaller = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });

  try {
    // Is the caller an owner/admin? A service-role caller trivially is.
    let viewer: Viewer | null = auth.isServiceRole ? 'admin' : null;
    if (!viewer) {
      const { data: roleRow } = await admin
        .from('user_roles')
        .select('role')
        .eq('user_id', auth.userId)
        .in('role', ['owner', 'admin'])
        .limit(1)
        .maybeSingle();
      if (roleRow) viewer = 'admin';
    }

    const slug = await findCardSlug(admin, person);
    if (!slug) return json({ error: 'not_found' }, 404);

    // RLS decides: an owner/admin sees the row, anyone else sees nothing. Both
    // "not yours" and "does not exist" therefore answer 404 — no probing.
    const { data, error } = await asCaller
      .from('answer_cards')
      .select('card, updated_at')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: 'not_found' }, 404);

    return json({ data: data.card, viewer: viewer ?? 'owner', updated_at: data.updated_at }, 200);
  } catch (error) {
    console.error('answer-cards edge error:', error);
    return json({ error: 'Internal edge error' }, 500);
  }
});
