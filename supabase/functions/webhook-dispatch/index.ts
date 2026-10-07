import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logger, withTelemetry } from '../_shared/observability.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const MAX_ATTEMPTS = 6;
const backoffMs = (n: number) => Math.min(2 ** n * 1000, 3600_000);

serve(withTelemetry('webhook-dispatch', async () => {
  const { data: due } = await supabase
    .from('webhook_deliveries')
    .select('*, webhook_endpoints(*)')
    .is('delivered_at', null)
    .lte('next_retry_at', new Date().toISOString())
    .limit(100);

  for (const d of due ?? []) {
    const body = JSON.stringify(d.payload);
    const ts = Math.floor(Date.now() / 1000);
    const sig = await sign(d.webhook_endpoints.secret, ts, body);

    try {
      const res = await fetch(d.webhook_endpoints.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vedic-Signature': `t=${ts},v1=${sig}`,
          'X-Vedic-Event': d.event_type,
          'X-Vedic-Delivery': String(d.id),
        },
        body,
      });
      if (res.ok) {
        await supabase.from('webhook_deliveries')
          .update({ status: res.status, delivered_at: new Date().toISOString(), attempts: d.attempts + 1 })
          .eq('id', d.id);
      } else throw new Error(`status_${res.status}`);
    } catch (err) {
      const attempts = d.attempts + 1;
      await supabase.from('webhook_deliveries').update({
        attempts,
        status: 0,
        next_retry_at: attempts < MAX_ATTEMPTS
          ? new Date(Date.now() + backoffMs(attempts)).toISOString()
          : null,
      }).eq('id', d.id);
      logger.warn('webhook_retry', { id: d.id, attempts, error: (err as Error).message });
    }
  }

  return new Response(JSON.stringify({ processed: due?.length ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
}));

async function sign(secret: string, ts: number, body: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const s = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${body}`));
  return Array.from(new Uint8Array(s), (b) => b.toString(16).padStart(2, '0')).join('');
}
