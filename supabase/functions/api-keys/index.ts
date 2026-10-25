import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { withTelemetry } from '../_shared/observability.ts';
import { authenticateRequest } from '../_shared/auth.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(withTelemetry('api-keys', async (req) => {
  if (req.method === 'OPTIONS') return corsResponse(req);

  try {
    const auth = await authenticateRequest(req);
    const userId = auth.userId;

    let body: { action?: string; keyId?: string; env?: string; name?: string } = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, keyId, env, name } = body;

    if (action === 'create') {
      const keyEnv = env === 'test' ? 'test' : 'live';
      const secret = `vk_${keyEnv}_` + crypto.randomUUID().replace(/-/g, '');
      const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
      const hash = Array.from(new Uint8Array(hashBuf), (b) => b.toString(16).padStart(2, '0')).join('');

      const { data, error } = await supabase.from('api_keys').insert({
        user_id: userId,
        name: name?.slice(0, 100) || `${keyEnv} key`,
        key_prefix: secret.slice(0, 12),
        key_hash: hash,
        env: keyEnv,
      }).select().single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to create key' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          plaintext: secret,
          key: { id: data.id, key_prefix: data.key_prefix, env: data.env, created_at: data.created_at },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (action === 'revoke') {
      if (!keyId) {
        return new Response(JSON.stringify({ error: 'Missing keyId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check ownership (BOLA / IDOR defense)
      const query = supabase.from('api_keys').update({ revoked: true }).eq('id', keyId);
      if (!auth.isServiceRole) {
        query.eq('user_id', userId);
      }
      const { error } = await query;
      if (error) {
        return new Response(JSON.stringify({ error: 'Key not found or unauthorized' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'usage') {
      if (!keyId) {
        return new Response(JSON.stringify({ error: 'Missing keyId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify key ownership before returning usage (BOLA / IDOR defense)
      if (!auth.isServiceRole) {
        const { data: keyOwner } = await supabase
          .from('api_keys')
          .select('id')
          .eq('id', keyId)
          .eq('user_id', userId)
          .single();

        if (!keyOwner) {
          return new Response(JSON.stringify({ error: 'Key not found or unauthorized' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      const { data } = await supabase.from('api_usage_daily').select('*').eq('key_id', keyId);
      return new Response(JSON.stringify(data ?? []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list') {
      const query = supabase
        .from('api_keys')
        .select('id, name, key_prefix, env, tier, last_used_at, revoked, expires_at, created_at');

      if (!auth.isServiceRole) {
        query.eq('user_id', userId);
      }
      const { data } = await query.order('created_at', { ascending: false });
      return new Response(JSON.stringify(data ?? []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'unknown_action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
