/**
 * GET  /functions/v1/weekly-drive   -> current week grant (idempotent; grants on first call)
 * POST /functions/v1/weekly-drive   -> consume 1 question; 409 when exhausted
 *
 * The server (weekly_drive_grants + these RPCs) is the authority; the client
 * mirror in src/features/tier/weeklyDrive.ts is offline-first only.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsResponse } from '../_shared/cors.ts';
import { withTelemetry } from '../_shared/observability.ts';
import { authenticateRequest } from '../_shared/auth.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const IST_OFFSET_MIN = 330;
const MS_DAY = 86_400_000;
const MS_WEEK = 604_800_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

function weekKeyIst(at: Date): string {
  const ist = new Date(at.getTime() + IST_OFFSET_MIN * 60_000);
  const dow = ist.getUTCDay();
  const isoDow = dow === 0 ? 7 : dow;
  const monday = new Date(ist);
  monday.setUTCDate(ist.getUTCDate() - (isoDow - 1));
  monday.setUTCHours(0, 0, 0, 0);
  const thursday = new Date(monday.getTime() + 3 * MS_DAY);
  const year = thursday.getUTCFullYear();
  const week = Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / MS_WEEK) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Monday 00:00 IST -> next Monday 00:00 IST for the given instant. */
function weekWindowIst(at: Date): { start: Date; end: Date } {
  const ist = new Date(at.getTime() + IST_OFFSET_MIN * 60_000);
  const dow = ist.getUTCDay();
  const isoDow = dow === 0 ? 7 : dow;
  const mondayIst = new Date(ist);
  mondayIst.setUTCDate(ist.getUTCDate() - (isoDow - 1));
  mondayIst.setUTCHours(0, 0, 0, 0);
  const start = new Date(mondayIst.getTime() - IST_OFFSET_MIN * 60_000);
  const end = new Date(start.getTime() + 7 * MS_DAY);
  return { start, end };
}

/**
 * Mirror of WEEKLY_DRIVE.grants — keep in sync with
 * src/features/tier/weeklyDrive.ts.
 *
 * `canonical` is the server entitlement tier (user_entitlements: free|pro|enterprise);
 * `internal` is the legacy client UserTier the grants table is keyed by.
 */
const INTERNAL_BY_CANONICAL: Record<string, string> = {
  free: 'registered',
  pro: 'premium',
  enterprise: 'practitioner',
};

const GRANTS: Record<string, number> = {
  anonymous: 7,
  registered: 21,
  premium: -1,
  practitioner: -1,
};

/** Resolve the caller's canonical tier from the DB. Never trusts the client. */
async function canonicalTier(userId: string): Promise<string> {
  const { data, error } = await supabase.rpc('resolve_entitlement', { p_user: userId });
  if (error) return 'free'; // table/row absent -> deny by default
  return (data?.tier as string) ?? 'free';
}

serve(withTelemetry('weekly-drive', async (req) => {
  if (req.method === 'OPTIONS') return corsResponse(req);

  try {
    const auth = await authenticateRequest(req);
    const userId = auth.userId;

    const canonical = await canonicalTier(userId);
    const internal = INTERNAL_BY_CANONICAL[canonical] ?? 'registered';
    const granted = GRANTS[internal] ?? GRANTS.anonymous;

    const now = new Date();
    const w = weekWindowIst(now);

    const { data: grant, error } = await supabase.rpc('grant_weekly_drive', {
      p_user: userId,
      p_week_key: weekKeyIst(now),
      p_start: w.start.toISOString(),
      p_end: w.end.toISOString(),
      p_questions: granted,
      p_features: { premiumTrials: granted === -1 ? -1 : 1 },
    });
    if (error) return json({ error: error.message }, 500);

    if (req.method === 'POST') {
      const { data: consumed, error: cErr } = await supabase.rpc('consume_weekly_drive', {
        p_user: userId,
        p_week_key: weekKeyIst(now),
      });
      if (cErr) {
        if (cErr.message.includes('weekly_drive_exhausted')) {
          return json({ error: 'weekly_drive_exhausted', grant }, 409);
        }
        return json({ error: cErr.message }, 500);
      }
      return json({ grant: consumed }, 200);
    }

    return json({ grant }, 200);
  } catch (err) {
    if (err instanceof Response) return err;
    return json({ error: 'Internal server error' }, 500);
  }
}));
