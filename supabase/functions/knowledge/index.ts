import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';
import { authenticateRequest } from '../_shared/auth.ts';
import { safeFetch } from '../_shared/ssrf.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse(req);
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');

    // Route: /knowledge/ingest-url
    if (req.method === 'POST' && path.endsWith('/ingest-url')) {
      // 1. Authenticate caller
      await authenticateRequest(req);

      // 2. Enforce rate limiting
      const allowed = await checkRateLimit(req, {
        endpoint: 'knowledge-ingest',
        maxRequestsAnon: 0,
        maxRequestsAuth: 10,
        windowSeconds: 60,
      });
      if (!allowed) return rateLimitResponse();

      let body: { url?: string; category?: string; authorName?: string } = {};
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { url: ingestUrl, category, authorName } = body;
      if (!ingestUrl || typeof ingestUrl !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing valid url parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 3. Fetch content with SSRF protection, timeout, and size limit
      let html = '';
      try {
        const res = await safeFetch(
          ingestUrl,
          {
            headers: {
              'User-Agent': 'VedicKnowledgeBot/1.0 (+https://vedic-rajkumar.app)',
              'Accept': 'text/html,application/xhtml+xml',
            },
          },
          {
            allowHttp: false, // strictly HTTPS
            timeoutMs: 10_000,
            maxBytes: 500_000, // 500 KB limit
          },
        );

        if (!res.ok) {
          return new Response(JSON.stringify({ error: `Source URL returned HTTP ${res.status}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        html = await res.text();
      } catch (fetchErr: unknown) {
        const errMsg = fetchErr instanceof Error ? fetchErr.message : 'Failed to fetch URL';
        return new Response(JSON.stringify({ error: `URL fetch blocked: ${errMsg}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 4. Simple HTML text extraction (Edge compatible)
      const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 10000);

      // 5. AI Extraction via OpenAI
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiKey) {
        return new Response(JSON.stringify({ error: 'OpenAI integration not configured' }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'You are a Vedic astrology knowledge curator. Extract 1-3 valuable astrological knowledge entries (rules, shlokas, combinations) from the text. Respond ONLY with JSON array of {title, content, tags}.',
            },
            {
              role: 'user',
              content: `Text: ${textContent}`,
            },
          ],
        }),
      });

      if (!aiRes.ok) {
        return new Response(JSON.stringify({ error: 'AI extraction service failed' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const aiData = await aiRes.json();
      const rawAiContent = aiData.choices?.[0]?.message?.content ?? '[]';
      let entries: Array<{ title: string; content: string; tags?: string[] }> = [];
      try {
        const jsonMatch = rawAiContent.match(/\[[\s\S]*\]/);
        entries = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch (e) {
        console.error('AI parsing error', e);
      }

      // 6. Save to DB
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      let created = 0;
      for (const entry of entries) {
        if (!entry.title || !entry.content) continue;
        const { error: insertError } = await supabaseClient.from('knowledge_entries').insert({
          title: String(entry.title).slice(0, 200),
          content: String(entry.content).slice(0, 5000),
          category: typeof category === 'string' ? category.slice(0, 50) : 'general',
          source_type: 'web',
          source_url: ingestUrl.slice(0, 500),
          author_name: typeof authorName === 'string' ? authorName.slice(0, 100) : null,
          tags: Array.isArray(entry.tags) ? entry.tags.map((t) => String(t).slice(0, 50)) : [],
        });
        if (!insertError) created++;
      }

      return new Response(
        JSON.stringify({
          success: true,
          entriesCreated: created,
          message: `Successfully extracted ${created} entries.`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
