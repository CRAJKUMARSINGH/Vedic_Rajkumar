import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { withTelemetry } from '../_shared/observability.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

serve(withTelemetry('api-keys', async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const { action, keyId, env } = await req.json();

  if (action === 'create') {
    const secret = `vk_${env}_` + crypto.randomUUID().replace(/-/g, '');
    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
    const hash = Array.from(new Uint8Array(hashBuf), (b) => b.toString(16).padStart(2, '0')).join('');
    await supabase.from('api_keys').insert({ key_prefix: secret.slice(0, 12), key_hash: hash, env });
    return new Response(JSON.stringify({ plaintext: secret }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (action === 'revoke') {
    await supabase.from('api_keys').update({ revoked: true }).eq('id', keyId);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (action === 'usage') {
    const { data } = await supabase.from('api_usage_daily').select('*').eq('key_id', keyId);
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'unknown_action' }), { status: 400, headers: corsHeaders });
}));
