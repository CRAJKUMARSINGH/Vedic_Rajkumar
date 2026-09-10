/**
 * user-data-delete
 *
 * Edge function that permanently deletes all user-owned data.
 * Requires a valid Clerk JWT in the Authorization header.
 * Requires ?confirm=true query param as a safety gate.
 *
 * DELETE /user-data-delete?confirm=true
 *
 * Response: { deletedAt, userId, deleted: { savedReadings, prashna_sessions, ... } }
 *
 * ⚠️  This operation is irreversible. The function is idempotent
 *     (calling it twice on an empty dataset is fine).
 *
 * Rate limited: 3 deletes per user per day.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use DELETE.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Safety gate — confirm must be passed either as ?confirm=true query param
  // or in the request body as { confirm: true }.
  // supabase.functions.invoke() sends body JSON, not query params.
  const url = new URL(req.url)
  let bodyConfirm = false
  try {
    const body = await req.json()
    bodyConfirm = body?.confirm === true
  } catch {
    // Body is absent or not JSON — fall through to query-param check
  }

  const queryConfirm = url.searchParams.get('confirm') === 'true'

  if (!bodyConfirm && !queryConfirm) {
    return new Response(
      JSON.stringify({ error: 'Missing confirmation. Pass { confirm: true } in the request body or ?confirm=true as a query param. This operation is irreversible.' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  // ── Extract JWT ────────────────────────────────────────────────────────────
  // Note: req body was already consumed above for the confirm check.
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.replace('Bearer ', '')
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

  // ── Service role client for rate limit log ─────────────────────────────────
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  const { count } = await serviceClient
    .from('rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', 'user-data-delete')
    .gte('requested_at', windowStart)

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '86400',
        },
      },
    )
  }

  await serviceClient.from('rate_limit_log').insert({
    user_id: userId,
    endpoint: 'user-data-delete',
  })

  // ── User-scoped client for deletion (RLS enforces ownership) ──────────────
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  )

  try {
    // Count before deletion for audit response
    const [
      { count: readingsCount },
      { count: prashnaCount },
      { count: horoscopeCount },
      { count: transitCount },
    ] = await Promise.all([
      userClient.from('saved_readings').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      userClient.from('prashna_sessions').select('*', { count: 'exact', head: true }).eq('owner_id', userId),
      userClient.from('horoscope_analyses').select('*', { count: 'exact', head: true }).eq('owner_id', userId),
      userClient.from('transit_readings').select('*', { count: 'exact', head: true }).eq('owner_id', userId),
    ])

    // Delete all user data (RLS ensures only this user's rows are affected)
    await Promise.all([
      userClient.from('saved_readings').delete().eq('user_id', userId),
      userClient.from('prashna_sessions').delete().eq('owner_id', userId),
      userClient.from('horoscope_analyses').delete().eq('owner_id', userId),
      userClient.from('transit_readings').delete().eq('owner_id', userId),
      userClient.from('user_profiles').delete().eq('id', userId),
    ])

    return new Response(
      JSON.stringify({
        deletedAt: new Date().toISOString(),
        userId,
        deleted: {
          saved_readings: readingsCount ?? 0,
          transit_readings: transitCount ?? 0,
          prashna_sessions: prashnaCount ?? 0,
          horoscope_analyses: horoscopeCount ?? 0,
          user_profile: 1,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('user-data-delete error:', err)
    return new Response(JSON.stringify({ error: 'Deletion failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
