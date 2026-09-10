/**
 * user-data-export
 *
 * Edge function that returns all user-owned data as a JSON export.
 * Requires a valid Clerk JWT in the Authorization header.
 *
 * GET /user-data-export
 *
 * Response: { exportedAt, userId, savedReadings[], prashnaSessions[], horoscopeAnalyses[], transitReadings[], userProfile }
 * Rate limited: 5 exports per user per hour.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Rate limit: 5 exports per user per hour ───────────────────────────────────
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── Extract JWT and resolve user identity ──────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.replace('Bearer ', '')

  // Decode JWT (no verification needed — Supabase RLS verifies on data access)
  let userId: string
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    userId = payload.sub
    if (!userId) throw new Error('No sub claim')
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JWT' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── Service role client (bypasses RLS for rate limit log) ─────────────────
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // ── Check rate limit ───────────────────────────────────────────────────────
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  const { count } = await serviceClient
    .from('rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', 'user-data-export')
    .gte('requested_at', windowStart)

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '3600',
        },
      },
    )
  }

  // Log this request
  await serviceClient.from('rate_limit_log').insert({
    user_id: userId,
    endpoint: 'user-data-export',
  })

  // ── User-scoped client (respects RLS via JWT) ─────────────────────────────
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  )

  try {
    // Fetch all user-owned data in parallel
    const [
      { data: savedReadings },
      { data: prashnaSessionsRaw },
      { data: horoscopeAnalysesRaw },
      { data: transitReadingsRaw },
      { data: userProfile },
    ] = await Promise.all([
      userClient.from('saved_readings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      userClient.from('prashna_sessions').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
      userClient.from('horoscope_analyses').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
      userClient.from('transit_readings').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
      userClient.from('user_profiles').select('*').eq('id', userId).maybeSingle(),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      userProfile: userProfile ?? null,
      savedReadings: savedReadings ?? [],
      prashnaSessions: prashnaSessionsRaw ?? [],
      horoscopeAnalyses: horoscopeAnalysesRaw ?? [],
      transitReadings: transitReadingsRaw ?? [],
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="vedic-data-export-${userId}.json"`,
      },
    })
  } catch (err) {
    console.error('user-data-export error:', err)
    return new Response(JSON.stringify({ error: 'Export failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
