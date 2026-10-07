import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { withTelemetry } from '../_shared/observability.ts';

interface CalendarRequest {
  from?: string;
  to?: string;
  chartId?: string;
}

interface IngressEvent {
  graha: string;
  sign: number;
  date: string;
}

serve(withTelemetry('transit-calendar', async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  const body = (await req.json().catch(() => ({}))) as CalendarRequest;
  const from = new Date(body.from ?? new Date().toISOString());
  const to = new Date(body.to ?? new Date(Date.now() + 30 * 86400000).toISOString());

  const events = await computeIngressEvents(from, to);

  return new Response(JSON.stringify({ events, chartId: body.chartId ?? null }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}));

async function computeIngressEvents(from: Date, to: Date): Promise<IngressEvent[]> {
  const endpoint = Deno.env.get('EPHEMERIS_ENDPOINT');
  if (!endpoint) {
    return [];
  }
  const res = await fetch(`${endpoint}/ingress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: from.toISOString(), to: to.toISOString() }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { events?: IngressEvent[] };
  return data.events ?? [];
}
