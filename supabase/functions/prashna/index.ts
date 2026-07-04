import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RASHIS_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const RASHIS_HI = ["मेष", "वृष", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"];

function computePrashnaLagna(date: Date, direction?: string): number {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const totalMinutes = hour * 60 + minute + dayOfYear * 4;
  let lagnaIndex = Math.floor((totalMinutes / 120) % 12);
  
  const DIRECTION_LAGNAS: Record<string, number> = {
    East: 0, NE: 1, North: 2, NW: 3, West: 6, SW: 7, South: 8, SE: 9
  };
  
  if (direction && DIRECTION_LAGNAS[direction] !== undefined) {
    lagnaIndex = (lagnaIndex + DIRECTION_LAGNAS[direction]) % 12;
  }
  return lagnaIndex;
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

    const { question, direction, birthName, questionTime } = await req.json()
    const qTime = questionTime ? new Date(questionTime) : new Date()
    
    const lagnaIndex = computePrashnaLagna(qTime, direction)
    const prashnaLagna = RASHIS_EN[lagnaIndex]
    const prashnaLagnaHindi = RASHIS_HI[lagnaIndex]

    // 1. Fetch relevant knowledge context
    const { data: knowledge } = await supabaseClient
      .from('knowledge_entries')
      .select('title, content')
      .in('category', ['prashna', 'general'])
      .order('created_at', { ascending: false })
      .limit(3)

    const knowledgeContext = knowledge?.map(k => `[${k.title}] ${k.content}`).join("\n\n") ?? ""

    // 2. AI Consultation
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
            content: `You are a Vedic Prashna expert. Analyze the question using the provided context and lagna. Respond ONLY with JSON matching the schema: {briefSummaryEn, briefSummaryHi, answerEn, answerHi, remediesEn, remediesHi, confidencePercent, classicalSource}.`
          },
          {
            role: 'user',
            content: `Question: ${question}\nLagna: ${prashnaLagna}\nContext: ${knowledgeContext}`
          }
        ]
      })
    })

    const aiData = await aiRes.json()
    const aiResult = JSON.parse(aiData.choices[0]?.message?.content.match(/\{[\s\S]*\}/)[0] ?? '{}')

    // 3. Save Session
    const { data: session, error } = await supabaseClient
      .from('prashna_sessions')
      .insert({
        question,
        question_time: qTime.toISOString(),
        direction: direction || null,
        prashna_lagna: prashnaLagna,
        prashna_lagna_hindi: prashnaLagnaHindi,
        category: 'General', // Simplified for now
        brief_summary_en: aiResult.briefSummaryEn || "",
        brief_summary_hi: aiResult.briefSummaryHi || "",
        answer_en: aiResult.answerEn || "",
        answer_hi: aiResult.answerHi || "",
        remedies_en: aiResult.remediesEn || null,
        remedies_hi: aiResult.remediesHi || null,
        classical_source: aiResult.classicalSource || "Prasna Marga",
        confidence_percent: aiResult.confidencePercent || 70,
        birth_name: birthName || null
      })
      .select()
      .single()

    return new Response(JSON.stringify(session), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
