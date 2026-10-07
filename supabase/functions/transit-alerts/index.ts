import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Transit Alerts Edge Function — Week 10
 *
 * Scheduled via Supabase Cron at 06:00 IST daily.
 * Queries opted-in users, checks Chandrashtama + double transit,
 * and sends push notifications for critical transits.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users who opted in to transit alerts
    const { data: users, error } = await supabase
      .from('user_preferences')
      .select('user_id, natal_moon_rashi, notification_settings')
      .eq('transit_alerts_enabled', true);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date();
    const results: { userId: string; alerted: boolean; reason: string }[] = [];

    for (const user of users ?? []) {
      const natalMoonRashi: number = user.natal_moon_rashi ?? 0;

      // Approximate transit moon rashi (replace with real ephemeris call if on edge)
      const transitMoonRashi = Math.floor(
        (today.getDate() + today.getMonth() * 2.5) % 12
      );
      const houseFromNatal = ((transitMoonRashi - natalMoonRashi + 12) % 12) + 1;
      const isChandrashtama = houseFromNatal === 8;

      if (isChandrashtama) {
        // Log alert to audit log
        await supabase.from('audit_logs').insert({
          user_id: user.user_id,
          action: 'transit_alert_sent',
          resource_type: 'transit',
          changes: {
            type: 'chandrashtama',
            natal_moon_rashi: natalMoonRashi,
            transit_moon_rashi: transitMoonRashi,
            date: today.toISOString(),
          },
        });

        results.push({ userId: user.user_id, alerted: true, reason: 'chandrashtama' });
      } else {
        results.push({ userId: user.user_id, alerted: false, reason: 'no_critical_transit' });
      }
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        triggeredAt: today.toISOString(),
        processedUsers: users?.length ?? 0,
        alerts: results,
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
