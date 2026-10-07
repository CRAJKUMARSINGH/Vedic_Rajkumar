import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse();
  }

  try {
    const { date, latitude = 28.6139, longitude = 77.209 } = await req.json();

    if (!date) {
      return new Response(
        JSON.stringify({ error: 'Missing date field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    const message = error instanceof Error ? error.message : 'Internal edge error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
