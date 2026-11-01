/**
 * telemetry.ts — replaces _shared/observability.ts as the edge wrapper.
 *
 * Every request produces: a correlation id, a structured log line, and one
 * sampled row in edge_request_samples. The row is what the SLO evaluator reads,
 * so the SLO is computed from real traffic instead of from a browser.
 *
 * PII: samples carry route + status + duration + tier only. No user id, no IP.
 */
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

let admin: SupabaseClient | null = null;
function service(): SupabaseClient {
  admin ??= createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
  return admin;
}

/** Strip the query string and collapse ids so cardinality stays bounded. */
export function normalizeRoute(path: string): string {
  return path
    .split('?')[0]
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:n')
    .replace(/^\/functions\/v1\//, '')
    .replace(/^\/+/, '');
}

export interface TelemetryContext {
  requestId: string;
  route: string;
  startedAt: number;
  tier?: string;
}

export interface TelemetryOptions {
  /** 1.0 = sample every request. Lower it only if the table grows too fast. */
  sampleRate?: number;
}

function newRequestId(): string {
  return crypto.randomUUID();
}

export function withTelemetry(
  name: string,
  handler: (req: Request, ctx: TelemetryContext) => Promise<Response>,
  opts: TelemetryOptions = {},
): (req: Request) => Promise<Response> {
  const sampleRate = opts.sampleRate ?? 1;

  return async (req: Request): Promise<Response> => {
    const startedAt = Date.now();
    const requestId = req.headers.get('x-request-id') ?? newRequestId();
    const route = normalizeRoute(new URL(req.url).pathname) || name;
    const ctx: TelemetryContext = { requestId, route, startedAt };

    let res: Response;
    try {
      res = await handler(req, ctx);
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      console.error(JSON.stringify({ level: 'error', fn: name, route, requestId, durationMs, msg: err instanceof Error ? err.message : String(err) }));
      void sample(route, 500, durationMs, ctx.tier, sampleRate);
      return new Response(JSON.stringify({ error: 'internal_error', requestId }), {
        status: 500,
        headers: { 'content-type': 'application/json', 'x-request-id': requestId },
      });
    }

    const durationMs = Date.now() - startedAt;
    console.log(JSON.stringify({ level: 'info', fn: name, route, requestId, status: res.status, durationMs }));
    void sample(route, res.status, durationMs, ctx.tier, sampleRate);

    res.headers.set('x-request-id', requestId);
    return res;
  };
}

async function sample(route: string, status: number, durationMs: number, tier: string | undefined, rate: number): Promise<void> {
  if (rate < 1 && Math.random() > rate) return;
  try {
    await service().rpc('record_edge_sample', {
      p_route: route, p_status: status, p_duration_ms: durationMs, p_tier: tier ?? null,
    });
  } catch {
    /* telemetry must never break a request */
  }
}
