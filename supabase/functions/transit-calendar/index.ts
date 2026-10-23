import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { withTelemetry } from '../_shared/observability.ts';
import { authenticateRequest } from '../_shared/auth.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';
import { validateUrl } from '../_shared/ssrf.ts';

interface CalendarRequest {
  from?: string;
  to?: string;
  chartId?: string;
}

interface IngressEvent {
  graha: string;
  sign: number;
  date: string;
}

serve(withTelemetry('transit-calendar', async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  // Authenticate caller
  try {
    await authenticateRequest(req);
  } catch (authErr) {
    if (authErr instanceof Response) return authErr;
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate limit
  const allowed = await checkRateLimit(req, {
    endpoint: 'transit-calendar',
    maxRequestsAnon: 0,
    maxRequestsAuth: 120,
    windowSeconds: 60,
  });
  if (!allowed) return rateLimitResponse();

  let body: CalendarRequest = {};
  try {
    body = (await req.json().catch(() => ({}))) as CalendarRequest;
  } catch {
    // defaults will be used
  }

  const from = new Date(body.from ?? new Date().toISOString());
  const to = new Date(body.to ?? new Date(Date.now() + 30 * 86400000).toISOString());

  // Validate date range
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return new Response(JSON.stringify({ error: 'Invalid date range' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Enforce max 90 day window
  const diffDays = (to.getTime() - from.getTime()) / 86400000;
  if (diffDays > 90) {
    return new Response(JSON.stringify({ error: 'Date range exceeds 90 days' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const events = await computeIngressEvents(from, to);

  return new Response(JSON.stringify({ events, chartId: body.chartId ?? null }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}));

async function computeIngressEvents(from: Date, to: Date): Promise<IngressEvent[]> {
  const rawEndpoint = Deno.env.get('EPHEMERIS_ENDPOINT');
  if (!rawEndpoint) {
    return [];
  }

  // SSRF Guard: validate ephemeris endpoint is a safe HTTPS URL
  try {
    validateUrl(`${rawEndpoint}/ingress`);
  } catch {
    return [];
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${rawEndpoint}/ingress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: from.toISOString(), to: to.toISOString() }),
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { events?: IngressEvent[] };
    return data.events ?? [];
  } finally {
    clearTimeout(timer);
  }
}
