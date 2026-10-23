import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse(req);
  }

  const allowed = await checkRateLimit(req, { endpoint: 'calculate-transits' });
  if (!allowed) {
    return rateLimitResponse();
  }

  try {
    let body: { targetDate?: string; natalMoonRashi?: number } = {};
    try {
      body = await req.json();
    } catch {
      // Body optional with defaults
    }

    const { targetDate = new Date().toISOString(), natalMoonRashi = 0 } = body;

    const transitSnapshot = {
      targetDate,
      natalMoonRashi,
      calculatedAt: new Date().toISOString(),
      source: 'supabase-edge-v1',
    };

    return new Response(JSON.stringify({ data: transitSnapshot }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Transits edge error:', error);
    return new Response(JSON.stringify({ error: 'Internal edge error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
