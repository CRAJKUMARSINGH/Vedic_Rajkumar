/**
 * mod.ts — the edge-function toolkit.
 *
 * One import for what almost every function needs: a JSON response, an OPTIONS
 * short-circuit, the caller's id, and the shared token bucket — the simple
 * `rateLimit()` guard and the tier-aware `enforceRateLimit()`. Kept
 * deliberately tiny so a function's import graph stays readable.
 *
 * The token bucket lives in Postgres (public.admit_request) — a per-isolate
 * counter is not a limit. See ADR-005.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { RATE_LIMITS, type Tier } from '@/api/v1/scopes';
import { rateLimitHeaders } from '@/api/rateLimit/algorithm';
import { getCorsHeaders } from './cors.ts';

/** JSON response with CORS headers. Caller-supplied headers win. */
export function json(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(),
      'content-type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Preflight short-circuit. Returns a Response for OPTIONS, or null so the
 * caller carries on with the real method.
 */
export function handleOptions(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null;
  return new Response('ok', { status: 200, headers: getCorsHeaders(req) });
}

const service = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

/**
 * The caller's user id, read from the JWT subject. NOT verified here — this is
 * a bucket key, not an authorisation decision. A forged sub only lets a caller
 * rate-limit themselves.
 */
export function clientIdFrom(req: Request): string | null {
  const header = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!header?.toLowerCase().startsWith('bearer ')) return null;
  const parts = header.slice(7).trim().split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64)) as { sub?: unknown };
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : '0.0.0.0';
}

export interface RateLimitConfig {
  /** Bucket namespace, e.g. "funnel". Distinct per endpoint. */
  bucket: string;
  /** Requests admitted per `windowSec` (bucket capacity). */
  limit: number;
  windowSec: number;
  cost?: number;
  /** What a store outage means here. Defaults to open. */
  failOpen?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
}

export async function rateLimit(req: Request, cfg: RateLimitConfig): Promise<RateLimitResult> {
  const limit = Math.max(1, cfg.limit);
  const windowMs = Math.max(1, cfg.windowSec) * 1000;
  const subject = clientIdFrom(req) ?? `ip:${clientIp(req)}`;

  try {
    const { data, error } = await service.rpc('admit_request', {
      p_bucket_key: `${cfg.bucket}:${subject}`,
      p_capacity: limit,
      p_refill_per_ms: limit / windowMs,
      p_now_ms: Date.now(),
      p_cost: Math.max(1, cfg.cost ?? 1),
    });
    if (error) throw error;

    const row = (Array.isArray(data) ? data[0] : data) as
      | { allowed?: boolean; retry_after_ms?: number; remaining?: number }
      | null;
    if (!row) throw new Error('admit_request returned no row');

    return {
      allowed: row.allowed === true,
      retryAfterMs: Number(row.retry_after_ms ?? 0),
      remaining: Number(row.remaining ?? 0),
    };
  } catch (err) {
    console.warn('[rateLimit] store unavailable', err instanceof Error ? err.message : err);
    return { allowed: cfg.failOpen !== false, retryAfterMs: 0, remaining: -1 };
  }
}

// ── tier-aware enforcement ───────────────────────────────────────────────────
//
// The simple guard above is enough for a public, unauthenticated bucket. A
// privileged endpoint owes the caller three things the guard cannot express:
// a stable identity (api key > user > hashed IP), a tier-derived policy, and
// the daily quota — all settled in the SAME admit_request() round trip, so a
// quota trip never burns a token and a burst never skips the quota.
//
// No endpoint calls this yet; that migration is deliberate and tracked in
// docs/api/RATE_LIMITS.md. Adding the machinery first keeps the wiring change
// reviewable on its own.

export interface RateLimitContext {
  userId?: string;
  apiKeyId?: string;
}

export interface EnforceOptions {
  /** bucket namespace — keep separate so a chart burst cannot kill panchang */
  scope: string;
  cost?: number;
  tier?: Tier;
  /** null disables the daily quota check (e.g. webhooks) */
  quotaKey?: string | null;
}

export interface EnforceResult {
  allowed: boolean;
  reason: 'ok' | 'rate_limited' | 'quota_exceeded' | 'store_error';
  headers: Record<string, string>;
  response?: Response;
}

/**
 * Identity for bucketing. api key > user > hashed IP.
 * Raw IP is hashed because it is a weak PII signal and NAT collapses thousands
 * of users onto one value.
 */
export async function resolveIdentity(req: Request, ctx: RateLimitContext): Promise<string> {
  if (ctx.apiKeyId) return `key:${ctx.apiKeyId}`;
  if (ctx.userId) return `user:${ctx.userId}`;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `ip:${hex.slice(0, 16)}`;
}

export const bucketKey = (identity: string, scope: string): string => `rl:${scope}:${identity}`;

export async function enforceRateLimit(
  req: Request,
  ctx: RateLimitContext,
  opts: EnforceOptions,
): Promise<EnforceResult> {
  const tier: Tier = opts.tier ?? 'free';
  const { rpm, burst, dailyQuota } = RATE_LIMITS[tier] ?? RATE_LIMITS.free;
  const policy = `${rpm};w=60;burst=${burst};quota=${dailyQuota}/day`;

  const identity = await resolveIdentity(req, ctx);
  const nowMs = Date.now();
  const quotaKey = opts.quotaKey === null ? null : (opts.quotaKey ?? identity);

  try {
    const { data, error } = await service.rpc('admit_request', {
      p_bucket_key: bucketKey(identity, opts.scope),
      p_capacity: burst,
      p_refill_per_ms: rpm / 60_000,
      p_now_ms: nowMs,
      p_cost: opts.cost ?? 1,
      p_quota_key: quotaKey,
      p_day: new Date().toISOString().slice(0, 10),
      p_quota: dailyQuota === Infinity ? -1 : dailyQuota,
    });

    if (error) throw error;
    const row = (Array.isArray(data) ? data[0] : data) as
      | {
          allowed?: boolean;
          reason?: string;
          remaining?: number;
          retry_after_ms?: number;
          quota_remaining?: number;
        }
      | null;

    const headers = rateLimitHeaders(
      {
        limit: rpm,
        remaining: Number(row?.remaining ?? 0),
        retryAfterMs: Number(row?.retry_after_ms ?? 0),
      },
      policy,
    );
    if (row?.quota_remaining !== undefined && row.quota_remaining >= 0) {
      headers['X-Quota-Remaining'] = String(row.quota_remaining);
    }

    if (row?.allowed) return { allowed: true, reason: 'ok', headers };

    const reason = row?.reason === 'quota_exceeded' ? 'quota_exceeded' : 'rate_limited';
    return {
      allowed: false,
      reason,
      headers,
      response: new Response(
        JSON.stringify({ error: reason, retryAfter: Number(row?.retry_after_ms ?? 0) / 1000 }),
        { status: 429, headers: { 'content-type': 'application/json', ...headers } },
      ),
    };
  } catch (err) {
    // Fail-open, but never silent.
    console.error('ratelimit_store_error', {
      scope: opts.scope,
      error: err instanceof Error ? err.message : String(err),
    });
    return { allowed: true, reason: 'store_error', headers: { 'X-RateLimit-Policy': policy } };
  }
}
