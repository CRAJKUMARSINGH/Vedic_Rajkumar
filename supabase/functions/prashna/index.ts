import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';

const RASHIS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const RASHIS_HI = [
  'मेष', 'वृष', 'मिथुन', 'कर्क',
  'सिंह', 'कन्या', 'तुला', 'वृश्चिक',
  'धनु', 'मकर', 'कुम्भ', 'मीन',
];

function computePrashnaLagna(date: Date, direction?: string): number {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const totalMinutes = hour * 60 + minute + dayOfYear * 4;
  let lagnaIndex = Math.floor((totalMinutes / 120) % 12);

  const DIRECTION_LAGNAS: Record<string, number> = {
    East: 0,
    NE: 1,
    North: 2,
    NW: 3,
    West: 6,
    SW: 7,
    South: 8,
    SE: 9,
  };

  if (direction && DIRECTION_LAGNAS[direction] !== undefined) {
    lagnaIndex = (lagnaIndex + DIRECTION_LAGNAS[direction]) % 12;
  }
  return lagnaIndex;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse(req);
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 1. Rate limiting
  const allowed = await checkRateLimit(req, {
    endpoint: 'prashna',
    maxRequestsAnon: 5,
    maxRequestsAuth: 50,
    windowSeconds: 60,
  });
  if (!allowed) return rateLimitResponse();

  try {
    let body: {
      question?: string;
      direction?: string;
      birthName?: string;
      questionTime?: string;
    } = {};

    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { question, direction, birthName, questionTime } = body;

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'Question must be at least 3 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const sanitizedQuestion = question.trim().slice(0, 1000);
    const qTime = questionTime ? new Date(questionTime) : new Date();

    // Extract user id from JWT if present
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (typeof payload.sub === 'string') userId = payload.sub;
      } catch {
        // Continue as anonymous
      }
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const lagnaIndex = computePrashnaLagna(qTime, direction);
    const prashnaLagna = RASHIS_EN[lagnaIndex];
    const prashnaLagnaHindi = RASHIS_HI[lagnaIndex];

    // 2. Fetch relevant knowledge context
    const { data: knowledge } = await supabaseClient
      .from('knowledge_entries')
      .select('title, content')
      .in('category', ['prashna', 'general'])
      .order('created_at', { ascending: false })
      .limit(3);

    const knowledgeContext =
      knowledge?.map((k) => `[${k.title}] ${k.content}`).join('\n\n') ?? '';

    // 3. AI Consultation
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    let aiResult: Record<string, unknown> = {};

    if (openaiKey) {
      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'You are a Vedic Prashna expert. Analyze the question using the provided context and lagna. Respond ONLY with JSON matching the schema: {briefSummaryEn, briefSummaryHi, answerEn, answerHi, remediesEn, remediesHi, confidencePercent, classicalSource}.',
            },
            {
              role: 'user',
              content: `Question: ${sanitizedQuestion}\nLagna: ${prashnaLagna}\nContext: ${knowledgeContext}`,
            },
          ],
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const rawContent = aiData.choices?.[0]?.message?.content ?? '{}';
        const match = rawContent.match(/\{[\s\S]*\}/);
        aiResult = match ? JSON.parse(match[0]) : {};
      }
    }

    // 4. Save Session with owner_id
    const { data: session, error: insertError } = await supabaseClient
      .from('prashna_sessions')
      .insert({
        owner_id: userId,
        question: sanitizedQuestion,
        question_time: qTime.toISOString(),
        direction: typeof direction === 'string' ? direction.slice(0, 10) : null,
        prashna_lagna: prashnaLagna,
        prashna_lagna_hindi: prashnaLagnaHindi,
        category: 'General',
        brief_summary_en: typeof aiResult.briefSummaryEn === 'string' ? aiResult.briefSummaryEn : '',
        brief_summary_hi: typeof aiResult.briefSummaryHi === 'string' ? aiResult.briefSummaryHi : '',
        answer_en: typeof aiResult.answerEn === 'string' ? aiResult.answerEn : 'Analysis computed for ' + prashnaLagna,
        answer_hi: typeof aiResult.answerHi === 'string' ? aiResult.answerHi : '',
        remedies_en: typeof aiResult.remediesEn === 'string' ? aiResult.remediesEn : null,
        remedies_hi: typeof aiResult.remediesHi === 'string' ? aiResult.remediesHi : null,
        classical_source: typeof aiResult.classicalSource === 'string' ? aiResult.classicalSource : 'Prasna Marga',
        confidence_percent: typeof aiResult.confidencePercent === 'number' ? aiResult.confidencePercent : 75,
        birth_name: typeof birthName === 'string' ? birthName.slice(0, 100) : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Session insert error:', insertError);
    }

    return new Response(JSON.stringify(session ?? { prashnaLagna, prashnaLagnaHindi, ...aiResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('Prashna function error:', err);
    return new Response(JSON.stringify({ error: 'Prashna calculation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
