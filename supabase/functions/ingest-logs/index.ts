/**
 * ingest-logs edge function — Week 9 Observability
 * Receives warn+ client log events and forwards to a log drain (Logtail/BetterStack).
 * Falls back to console.log when LOGTAIL_SOURCE_TOKEN is absent.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { logger } from '../_shared/observability.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const body = await req.json();
    const token = Deno.env.get('LOGTAIL_SOURCE_TOKEN');

    if (token) {
      // Forward to BetterStack / Logtail
      await fetch('https://in.logtail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Array.isArray(body) ? body : [body]),
      });
    }

    logger.debug('log_ingested', {
      level: body.level,
      correlationId: body.correlationId,
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
