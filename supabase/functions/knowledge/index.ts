import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.replace(/\/+$/, '')

    // Route: /knowledge/ingest-url
    if (req.method === 'POST' && path.endsWith('/ingest-url')) {
      const { url: ingestUrl, category, authorName } = await req.json()
      
      // 1. Fetch content
      const res = await fetch(ingestUrl)
      const html = await res.text()
      
      // 2. Simple HTML stripping (Edge compatible)
      const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 10000)

      // 3. AI Extraction via OpenAI
      const openaiKey = Deno.env.get('OPENAI_API_KEY')
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
              content: 'You are a Vedic astrology knowledge curator. Extract 1-3 valuable astrological knowledge entries (rules, shlokas, combinations) from the text. Respond ONLY with JSON array of {title, content, tags}.'
            },
            {
              role: 'user',
              content: `Text: ${textContent}`
            }
          ]
        })
      })
      
      const aiData = await aiRes.json()
      const rawAiContent = aiData.choices[0]?.message?.content ?? '[]'
      let entries = []
      try {
        const jsonMatch = rawAiContent.match(/\[[\s\S]*\]/)
        entries = jsonMatch ? JSON.parse(jsonMatch[0]) : []
      } catch (e) {
        console.error("AI parsing error", e)
      }

      // 4. Save to DB
      let created = 0
      for (const entry of entries) {
        const { data, error } = await supabaseClient
          .from('knowledge_entries')
          .insert({
            title: entry.title,
            content: entry.content,
            category: category || 'general',
            source_type: 'web',
            source_url: ingestUrl,
            author_name: authorName || null,
            tags: entry.tags || []
          })
        if (!error) created++
      }

      return new Response(JSON.stringify({ 
        success: true, 
        entriesCreated: created,
        message: `Successfully extracted ${created} entries.` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
