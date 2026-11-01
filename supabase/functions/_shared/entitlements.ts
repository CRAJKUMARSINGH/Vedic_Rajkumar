/**
 * _shared/entitlements.ts — SERVER authority for tier + limits.
 * Mirror of src/features/tier/tiers.ts. Keep both in sync; tierTaxonomy.test.ts
 * guards the client side, the parity spec guards the pair.
 */
export type Tier = 'free' | 'pro' | 'enterprise';

export const ENTITLEMENTS = {
  free: {
    weeklyQuestions: 21, maxProfiles: 5, maxChartsPerDay: 20, maxPdfExports: 10, canWhiteLabel: false,
    features: ['kundli', 'prashna', 'matchmaking', 'panchang', 'export_data'],
  },
  pro: {
    weeklyQuestions: -1, maxProfiles: 20, maxChartsPerDay: 100, maxPdfExports: -1, canWhiteLabel: false,
    features: ['kundli', 'prashna', 'matchmaking', 'panchang', 'export_data', 'dasha_timeline', 'transit_alerts', 'advanced_pdf'],
  },
  enterprise: {
    weeklyQuestions: -1, maxProfiles: -1, maxChartsPerDay: -1, maxPdfExports: -1, canWhiteLabel: true,
    features: ['kundli', 'prashna', 'matchmaking', 'panchang', 'export_data', 'dasha_timeline', 'transit_alerts', 'advanced_pdf', 'client_crm', 'white_label'],
  },
} as const;

export interface ResolvedEntitlement {
  tier: Tier;
  features: readonly string[];
  limits: Record<string, number | boolean>;
  /** Provenance of the grant (e.g. 'beta_trial'); 'default' when unset. */
  source: string;
  /** ISO expiry of a time-boxed grant (beta trial); null = perpetual. */
  expiresAt: string | null;
}

/** Reads tier from the DB. Never trusts a client-supplied value. */
export async function resolveEntitlement(
  // deno-lint-ignore no-explicit-any
  client: any,
  userId: string,
): Promise<ResolvedEntitlement> {
  const { data } = await client.rpc('resolve_entitlement', { p_user: userId });
  const tier: Tier = ((data?.tier ?? 'free') as Tier);
  const row = ENTITLEMENTS[tier] ?? ENTITLEMENTS.free;
  // `source`/`expires_at` come from resolve_entitlement() (20261128). They are
  // display-only: the tier itself is still the sole gate, and expiry is honoured
  // in SQL, so a stale/absent pair can never widen access.
  return {
    tier,
    features: row.features,
    limits: { ...row },
    source: (data?.source ?? 'default') as string,
    expiresAt: (data?.expires_at ?? null) as string | null,
  };
}
