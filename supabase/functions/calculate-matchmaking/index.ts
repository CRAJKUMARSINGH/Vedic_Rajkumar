import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse();
  }

  try {
    const { maleBirthData, femaleBirthData } = await req.json();

    if (!maleBirthData || !femaleBirthData) {
      return new Response(
        JSON.stringify({ error: 'Missing maleBirthData or femaleBirthData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    const message = error instanceof Error ? error.message : 'Internal edge error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
