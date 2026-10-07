import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse();
  }

  try {
    const { targetDate = new Date().toISOString(), natalMoonRashi = 0 } = await req.json();

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
    const message = error instanceof Error ? error.message : 'Internal edge error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
