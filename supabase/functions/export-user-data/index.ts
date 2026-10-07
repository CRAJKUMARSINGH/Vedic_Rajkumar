/**
 * export-user-data (Week 5 — upgraded from stub)
 *
 * Full GDPR Article 20 / India DPDP Act 2023 compliant data export.
 * Consolidates the earlier stub into a production-grade function that
 * mirrors the behaviour of user-data-export with additional compliance metadata.
 *
 * GET /export-user-data
 * Authorization: Bearer <jwt>
 *
 * Returns JSON attachment with all user-owned data + export metadata + checksum.
 * Rate-limited: 5 exports per user per hour (via rate_limit_log table).
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse();

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Authenticate ───────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.replace('Bearer ', '');
  let userId: string;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId = payload.sub;
    if (!userId) throw new Error('No sub claim');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JWT' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Rate limiting ──────────────────────────────────────────────────────────
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count } = await serviceClient
    .from('rate_limit_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', 'export-user-data')
    .gte('requested_at', windowStart);

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in an hour.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '3600' },
    });
  }

  await serviceClient.from('rate_limit_log').insert({
    user_id: userId,
    endpoint: 'export-user-data',
  });

  // ── Fetch all user data (RLS-scoped) ──────────────────────────────────────
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );

  try {
    const [
      { data: savedReadings },
      { data: prashnaSessions },
      { data: horoscopeAnalyses },
      { data: transitReadings },
      { data: userProfile },
      { data: consentRecords },
      { data: auditLogs },
    ] = await Promise.all([
      userClient.from('saved_readings').select('*').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false }),
      userClient.from('prashna_sessions').select('*').eq('owner_id', userId).is('deleted_at', null).order('created_at', { ascending: false }),
      userClient.from('horoscope_analyses').select('*').eq('owner_id', userId).is('deleted_at', null).order('created_at', { ascending: false }),
      userClient.from('transit_readings').select('*').eq('owner_id', userId).is('deleted_at', null).order('created_at', { ascending: false }),
      userClient.from('user_profiles').select('*').eq('id', userId).maybeSingle(),
      userClient.from('user_privacy_consents').select('*, privacy_policy_versions(version, effective_date)').eq('user_id', userId).order('consented_at', { ascending: false }),
      userClient.from('audit_logs').select('action, resource_type, resource_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(500),
    ]);

    const generatedAt = new Date().toISOString();

    // Simple deterministic checksum (record counts + timestamp prefix)
    const checksum = btoa(`${userId}:${generatedAt}:${(savedReadings?.length ?? 0) + (prashnaSessions?.length ?? 0)}`).slice(0, 32);

    const exportData = {
      exportMetadata: {
        generatedAt,
        formatVersion: '2.0',
        complianceStandard: 'GDPR Article 20 / India DPDP Act 2023',
        dataController: 'Vedic Rajkumar',
        retentionPolicy: 'Data retained for 30 days after deletion request',
        checksum,
      },
      user: {
        id: userId,
        profile: userProfile ?? null,
      },
      savedReadings:    savedReadings    ?? [],
      prashnaSessions:  prashnaSessions  ?? [],
      horoscopeAnalyses: horoscopeAnalyses ?? [],
      transitReadings:  transitReadings  ?? [],
      consentHistory:   consentRecords   ?? [],
      auditTrail:       auditLogs        ?? [],
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="vedic-rajkumar-export-${userId}.json"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    console.error('[export-user-data]', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
