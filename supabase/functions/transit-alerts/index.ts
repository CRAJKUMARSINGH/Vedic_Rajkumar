import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { logger, withTelemetry } from '../_shared/observability.ts';

interface TransitSubscriptionRow {
  id: string;
  user_id: string;
  chart_id: string | null;
  event_types: string[];
  grahas: string[];
  channels: string[];
}

interface TransitEvent {
  type: string;
  graha: string;
  date: string;
}

serve(withTelemetry('transit-alerts', async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'missing_supabase_env' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: subs } = await supabase
    .from('transit_subscriptions')
    .select('id, user_id, chart_id, event_types, grahas, channels')
    .eq('active', true);

  let fired = 0;
  const rows = (subs ?? []) as TransitSubscriptionRow[];

  for (const sub of rows) {
    const events = await detectEventsForChart(sub.chart_id, sub.event_types, sub.grahas);
    for (const ev of events) {
      const eventKey = `${ev.type}:${ev.graha}:${ev.date.slice(0, 10)}`;
      const { error } = await supabase
        .from('transit_alerts_sent')
        .insert({ subscription_id: sub.id, event_key: eventKey });
      if (!error) {
        await dispatchNotification(sub, ev, supabaseUrl, serviceKey);
        fired++;
      }
    }
  }

  logger.info('alerts_cycle_complete', { fired });
  return new Response(JSON.stringify({ fired }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}));

async function detectEventsForChart(
  chartId: string | null,
  types: string[],
  grahas: string[],
): Promise<TransitEvent[]> {
  const url = Deno.env.get('TRANSIT_SERVICE_URL');
  if (!url || !chartId) return [];
  const res = await fetch(`${url}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chartId, types, grahas, horizonDays: 7 }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { events?: TransitEvent[] };
  return data.events ?? [];
}

async function dispatchNotification(
  sub: TransitSubscriptionRow,
  ev: TransitEvent,
  supabaseUrl: string,
  serviceKey: string,
): Promise<void> {
  if (!sub.channels.includes('email')) return;
  await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ userId: sub.user_id, template: 'transit_alert', data: ev }),
  });
}
