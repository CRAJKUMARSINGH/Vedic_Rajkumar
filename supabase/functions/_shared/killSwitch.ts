import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import { logger } from './observability.ts';

/**
 * Kill-switch resolution, in two layers:
 *
 *  1. `kill_switches` table (migration 20241007000008) — an operator flips a row
 *     and the next request short-circuits, no deploy. This is the real switch.
 *  2. `Deno.env` — a belt-and-braces override for the case where the DB is the
 *     thing that is broken.
 *
 * `KILL_SWITCH_FLAGS` are the three coarse flags the week-17 spec names; they are
 * mirrored in Flagsmith for the UI (src/features/flags/config.ts) and seeded into
 * `kill_switches` (migration 20261026130000).
 */
export const KILL_SWITCH_FLAGS = {
  api: 'killswitch.api',
  edge: 'killswitch.edge',
  telemetry: 'killswitch.telemetry',
} as const;

const ENV_BY_FEATURE: Record<string, string> = {
  kill_kundli: 'KILL_KUNDLI',
  kill_match: 'KILL_MATCH',
  kill_pdf: 'KILL_PDF',
  kill_api: 'KILL_API',
  kill_transits: 'KILL_TRANSITS',
  'killswitch.api': 'KILL_EDGE_API',
  'killswitch.edge': 'KILL_EDGE',
  'killswitch.telemetry': 'KILL_TELEMETRY',
};

/** The env-var half of the check. Cheap, no I/O. */
export const isFeatureKilled = (feature: string): boolean => {
  const envName = ENV_BY_FEATURE[feature] ?? feature.toUpperCase();
  const value = Deno.env.get(envName);
  return value === 'true' || value === '1';
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

/** The table half of the check. Fails open so a DB hiccup cannot take the site down. */
export const isFeatureKilledInDb = async (feature: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_feature_killed', { p_feature: feature });
  if (error) {
    logger.warn('kill_switch_lookup_failed', { feature, error: error.message });
    return false;
  }
  return data === true;
};

export const isKilled = async (feature: string): Promise<boolean> =>
  isFeatureKilled(feature) || (await isFeatureKilledInDb(feature));

/** Bilingual 503. A kill switch never answers in one language only. */
export const killedResponse = (feature: string): Response =>
  new Response(
    JSON.stringify({
      error: 'service_unavailable',
      feature,
      message: {
        hi: 'यह सेवा अस्थायी रूप से बंद है। कृपया कुछ देर बाद पुनः प्रयास करें।',
        en: 'This service is temporarily unavailable. Please try again shortly.',
      },
    }),
    {
      status: 503,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    },
  );

/**
 * Returns a 503 Response when any of `features` is killed, otherwise null.
 *
 *   const killed = await guardKillSwitch(KILL_SWITCH_FLAGS.edge, 'kill_kundli');
 *   if (killed) return killed;
 */
export const guardKillSwitch = async (
  ...features: string[]
): Promise<Response | null> => {
  const killed = await Promise.all(features.map(isKilled));
  const index = killed.findIndex(Boolean);
  if (index === -1) return null;
  const feature = features[index];
  logger.error('kill_switch_triggered', { feature });
  return killedResponse(feature);
};
