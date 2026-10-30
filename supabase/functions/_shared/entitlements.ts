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
  return { tier, features: row.features, limits: { ...row } };
}
