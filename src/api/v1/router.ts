import { Hono } from 'hono';
import { authenticate, requireScope, type ApiContext } from './middleware/auth';
import { consume, rateLimitHeaders, type BucketState } from '../rateLimit/bucket';
import { checkIdempotency, storeIdempotency } from './middleware/idempotency';
import { BirthInput } from './schemas/chart';
import { AnswerQuery, parseTopics, ISO_DATE_RE } from './schemas/answer';
import { transitService } from '@/services/transits/transitService';
import { buildAnswerCard, buildAnswerCardByName, DEFAULT_ASK } from '@/services/answerCard/answerCardBuilder';
import { redactAnswerCard } from '@/services/answerCard/redact';
import { resolveJatak } from '@/lib/jataks/resolveJatak';
import { generateApiKey } from '../keys/keygen';
import { supabase } from '@/integrations/supabase/client';

const buckets = new Map<string, BucketState>();
export const api = new Hono<{ Variables: { ctx: ApiContext } }>();

// ---- Auth + rate limit middleware ----
api.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') return next();
  const ctx = await authenticate(c.req.raw);
  if (!ctx) {
    return c.json({ error: { code: 'unauthorized', message: 'Invalid or missing API key', requestId: crypto.randomUUID() } }, 401);
  }
  const rl = consume(ctx.keyId, ctx.tier, buckets);
  for (const [k, v] of Object.entries(rateLimitHeaders(rl))) c.header(k, v);
  if (!rl.allowed) {
    return c.json({ error: { code: 'rate_limited', message: 'Too many requests', requestId: crypto.randomUUID() } }, 429);
  }
  c.set('ctx', ctx);
  await next();
});

// ---- Charts ----
api.post('/v1/charts', async (c) => {
  const ctx = c.get('ctx');
  if (!requireScope(ctx, 'charts:write')) return c.json({ error: { code: 'forbidden', message: 'Missing charts:write' } }, 403);

  const idem = c.req.header('idempotency-key');
  if (idem) {
    const cached = await checkIdempotency(c.req.raw, ctx.keyId);
    if (cached) return c.json(cached.body as never, cached.status as never);
  }

  const parsed = BirthInput.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: { code: 'invalid_input', message: parsed.error.message } }, 422);

  // delegate to compute service
  const chart = await computeChart(parsed.data);
  if (idem) await storeIdempotency(ctx.keyId, idem, 201, chart);
  return c.json(chart, 201);
});

api.get('/v1/charts/:id', async (c) => {
  const ctx = c.get('ctx');
  if (!requireScope(ctx, 'charts:read')) return c.json({ error: { code: 'forbidden', message: 'Missing charts:read' } }, 403);
  const chart = await getChart(c.req.param('id'), ctx.userId);
  return chart ? c.json(chart) : c.json({ error: { code: 'not_found', message: 'Chart not found' } }, 404);
});

// ---- Transits ----
api.get('/v1/transits/:chartId', async (c) => {
  const ctx = c.get('ctx');
  if (!requireScope(ctx, 'transits:read')) return c.json({ error: { code: 'forbidden', message: 'Missing transits:read' } }, 403);
  // `asOf` is optional; when present it must be a real `YYYY-MM-DD` (or full
  // ISO-8601) date. Passing a bare string to `new Date()` silently yields an
  // `Invalid Date`, which would then flow into transitService.snapshot as NaN
  // Julian days instead of failing loudly.
  const asOfRaw = c.req.query('asOf');
  let asOf = new Date();
  if (asOfRaw !== undefined) {
    // Anchor date-only input to UTC midnight so the instant is deterministic
    // regardless of the server's local zone.
    asOf = new Date(ISO_DATE_RE.test(asOfRaw) ? `${asOfRaw}T00:00:00Z` : asOfRaw);
    if (Number.isNaN(asOf.getTime())) {
      return c.json({ error: { code: 'invalid_input', message: 'asOf must be a valid date' } }, 422);
    }
  }
  const natal = await getNatal(c.req.param('chartId'));
  const snap = await transitService.snapshot(natal, asOf);
  return c.json(snap);
});

// ---- Answer cards (verdict-first agent contract) ----
api.get('/v1/answer', async (c) => {
  const ctx = c.get('ctx');
  if (!requireScope(ctx, 'answers:read')) return c.json({ error: { code: 'forbidden', message: 'Missing answers:read' } }, 403);

  const parsed = AnswerQuery.safeParse({
    person: c.req.query('person'),
    topics: c.req.query('topics'),
    lang: c.req.query('lang'),
    asOf: c.req.query('asOf'),
    asked: c.req.query('asked'),
  });
  if (!parsed.success) return c.json({ error: { code: 'invalid_input', message: parsed.error.message } }, 422);

  const { person, topics, lang, asked } = parsed.data;
  const asOf = parsed.data.asOf ?? new Date().toISOString().slice(0, 10);
  const jatak = resolveJatak(person);
  const card = jatak
    ? buildAnswerCard(jatak, asked ?? DEFAULT_ASK, parseTopics(topics), lang, asOf)
    : buildAnswerCardByName(person, asked ?? DEFAULT_ASK, parseTopics(topics), lang, asOf);
  // Public surface, deny by default: an API key is not proof of subject
  // ownership, so this route always answers with the verdict-only projection.
  // The full card (raw birth data) is served only by the `answer-cards` Edge
  // Function after it has verified the caller is the subject's owner or an
  // owner/admin — see supabase/functions/answer-cards/index.ts.
  return c.json(redactAnswerCard(card, 'public'));
});

// ---- Key management ----
api.post('/v1/keys', async (c) => {
  const ctx = c.get('ctx');
  const env = (c.req.query('env') as 'live' | 'test') ?? 'live';
  const key = await generateApiKey(env);
  await persistKey(ctx.userId, key, ctx.tier);
  return c.json({ prefix: key.prefix, plaintext: key.plaintext }, 201); // plaintext shown once
});

async function computeChart(input: unknown) { return { id: crypto.randomUUID(), ...(input as object) }; }
async function getChart(id: string, userId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from('charts').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
  return data;
}
 
async function getNatal(_chartId: string) { return { lagnaSign: 0, planets: { Moon: 45 } }; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function persistKey(userId: string, key: any, tier: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('api_keys').insert({
    user_id: userId,
    key_prefix: key.prefix,
    key_hash: key.hash,
    tier,
  });
}

export default api;
