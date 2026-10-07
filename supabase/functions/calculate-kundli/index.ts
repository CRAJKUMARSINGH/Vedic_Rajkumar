import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse();
  }

  const allowed = await checkRateLimit(req, { endpoint: 'calculate-kundli' });
  if (!allowed) {
    return rateLimitResponse();
  }

  try {
    const { birthDate, birthTime, latitude, longitude, timezone = 5.5, ayanamsa = 'Lahiri' } = await req.json();

    if (!birthDate || !birthTime || latitude === undefined || longitude === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (birthDate, birthTime, latitude, longitude)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Response structure
    const calculation = {
      birthDate,
      birthTime,
      latitude,
      longitude,
      timezone,
      ayanamsa,
      calculatedAt: new Date().toISOString(),
      source: 'supabase-edge-v1',
    };

    return new Response(JSON.stringify({ data: calculation }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal edge error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
