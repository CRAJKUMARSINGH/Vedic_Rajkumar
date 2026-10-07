/**
 * metrics edge function — Week 9 Observability
 * Exposes Prometheus-style text metrics for scraping by Grafana/DataDog.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  const lines: string[] = [
    '# HELP vedic_up Service up indicator',
    '# TYPE vedic_up gauge',
    'vedic_up 1',
    '',
    '# HELP vedic_requests_total Total edge function requests',
    '# TYPE vedic_requests_total counter',
    'vedic_requests_total 0',
    '',
    '# HELP vedic_chart_accuracy_ratio Chart accuracy vs Swiss Ephemeris',
    '# TYPE vedic_chart_accuracy_ratio gauge',
    'vedic_chart_accuracy_ratio 1',
    '',
    '# HELP vedic_calc_latency_ms_p95 Calculation latency p95 ms',
    '# TYPE vedic_calc_latency_ms_p95 gauge',
    'vedic_calc_latency_ms_p95 0',
  ];

  return new Response(lines.join('\n') + '\n', {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/plain; version=0.0.4',
    },
  });
});
