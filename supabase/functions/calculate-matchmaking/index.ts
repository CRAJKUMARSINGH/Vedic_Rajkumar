import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse(req);
  }

  const allowed = await checkRateLimit(req, { endpoint: 'calculate-matchmaking' });
  if (!allowed) {
    return rateLimitResponse();
  }

  try {
    let body: { maleBirthData?: unknown; femaleBirthData?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { maleBirthData, femaleBirthData } = body;

    if (!maleBirthData || !femaleBirthData) {
      return new Response(
        JSON.stringify({ error: 'Missing maleBirthData or femaleBirthData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const matchSummary = {
      system: 'Ashta Koota 36-point Milan',
      calculatedAt: new Date().toISOString(),
      male: maleBirthData,
      female: femaleBirthData,
      source: 'supabase-edge-v1',
    };

    return new Response(JSON.stringify({ data: matchSummary }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Matchmaking edge error:', error);
    return new Response(JSON.stringify({ error: 'Internal edge error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
