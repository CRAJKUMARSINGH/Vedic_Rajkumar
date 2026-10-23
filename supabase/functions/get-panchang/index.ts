import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse(req);
  }

  const allowed = await checkRateLimit(req, { endpoint: 'get-panchang' });
  if (!allowed) {
    return rateLimitResponse();
  }

  try {
    let body: { date?: string; latitude?: number; longitude?: number } = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { date, latitude = 28.6139, longitude = 77.209 } = body;

    if (!date) {
      return new Response(
        JSON.stringify({ error: 'Missing date field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const panchangSnapshot = {
      date,
      coordinates: { latitude, longitude },
      calculatedAt: new Date().toISOString(),
      source: 'supabase-edge-v1',
    };

    return new Response(JSON.stringify({ data: panchangSnapshot }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Panchang edge error:', error);
    return new Response(JSON.stringify({ error: 'Internal edge error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
