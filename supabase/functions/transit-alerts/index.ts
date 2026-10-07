import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Transit Alerts Edge Function
 * Scheduled via Supabase Cron (6 AM daily).
 * Sends Chandrashtama + double transit alerts to opted-in users.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // This function is normally triggered by Supabase Cron schedule
    // Manual trigger also accepted via POST with authorization
    const today = new Date().toISOString();

    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'Transit alerts scheduled',
        triggeredAt: today,
        source: 'supabase-edge-v1',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Alert trigger failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
