/**
 * ingest-logs edge function — Week 9 Observability
 * Receives warn+ client log events and forwards to a log drain (Logtail/BetterStack).
 * Falls back to console.log when LOGTAIL_SOURCE_TOKEN is absent.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { logger } from '../_shared/observability.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';

const MAX_PAYLOAD_BYTES = 128 * 1024; // 128 KB max batch size

serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse(req);

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate limit client logs to prevent flood / DOS
  const allowed = await checkRateLimit(req, {
    endpoint: 'ingest-logs',
    maxRequestsAnon: 60,
    maxRequestsAuth: 300,
    windowSeconds: 60,
  });
  if (!allowed) return rateLimitResponse();

  // Guard against giant payloads
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return new Response(JSON.stringify({ error: 'Payload too large' }), {
      status: 413,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = Deno.env.get('LOGTAIL_SOURCE_TOKEN');

    if (token) {
      // Forward to BetterStack / Logtail with timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      await fetch('https://in.logtail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Array.isArray(body) ? body : [body]),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));
    }

    const eventRecord = (Array.isArray(body) ? body[0] : body) as Record<string, unknown> | null;
    logger.debug('log_ingested', {
      level: eventRecord?.level as string,
      correlationId: eventRecord?.correlationId as string,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'ingest error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
