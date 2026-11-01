/**
 * tiers.ts — ONE canonical tier taxonomy.
 *
 * Before this file there were three contradictory taxonomies:
 *   src/features/tier/config.ts          anonymous | registered | premium | practitioner
 *   src/api/v1/scopes.ts                 free | developer | business | enterprise
 *   src/services/subscriptionService.ts  free | pro
 *
 * New code MUST use `Tier`. Legacy enums are mapped, not deleted, so nothing
 * breaks. Deleting them is a follow-up — see docs/adr/ADR-001-tier-taxonomy.md.
 */

export type Tier = 'free' | 'pro' | 'enterprise';

export const TIERS: readonly Tier[] = ['free', 'pro', 'enterprise'] as const;

export interface Entitlement {
  tier: Tier;
  /** FEATURE_FLAGS keys this tier may use. */
  features: readonly string[];
  limits: {
    weeklyQuestions: number; // -1 = unlimited
    maxProfiles: number; // -1 = unlimited
    maxChartsPerDay: number; // -1 = unlimited
    maxPdfExports: number; // -1 = unlimited
    canWhiteLabel: boolean;
    supportLevel: 'email' | 'priority' | 'dedicated';
  };
}

/** THE entitlement table. Server mirror: supabase/functions/_shared/entitlements.ts */
export const ENTITLEMENTS: Record<Tier, Entitlement> = {
  free: {
    tier: 'free',
    features: ['kundli', 'prashna', 'matchmaking', 'panchang', 'export_data'],
    limits: { weeklyQuestions: 21, maxProfiles: 5, maxChartsPerDay: 20, maxPdfExports: 10, canWhiteLabel: false, supportLevel: 'email' },
  },
  pro: {
    tier: 'pro',
    features: ['kundli', 'prashna', 'matchmaking', 'panchang', 'export_data', 'dasha_timeline', 'transit_alerts', 'advanced_pdf'],
    limits: { weeklyQuestions: -1, maxProfiles: 20, maxChartsPerDay: 100, maxPdfExports: -1, canWhiteLabel: false, supportLevel: 'priority' },
  },
  enterprise: {
    tier: 'enterprise',
    features: ['kundli', 'prashna', 'matchmaking', 'panchang', 'export_data', 'dasha_timeline', 'transit_alerts', 'advanced_pdf', 'client_crm', 'white_label'],
    limits: { weeklyQuestions: -1, maxProfiles: -1, maxChartsPerDay: -1, maxPdfExports: -1, canWhiteLabel: true, supportLevel: 'dedicated' },
  },
};

// ─── Legacy bridges ──────────────────────────────────────────────────────────

export type LegacyUserTier = 'anonymous' | 'registered' | 'premium' | 'practitioner';
export type LegacyApiTier = 'free' | 'developer' | 'business' | 'enterprise';
export type LegacyPlan = 'free' | 'pro';

export const FROM_LEGACY_USER_TIER: Record<LegacyUserTier, Tier> = {
  anonymous: 'free', registered: 'free', premium: 'pro', practitioner: 'enterprise',
};
export const FROM_LEGACY_API_TIER: Record<LegacyApiTier, Tier> = {
  free: 'free', developer: 'pro', business: 'pro', enterprise: 'enterprise',
};
export const FROM_LEGACY_PLAN: Record<LegacyPlan, Tier> = { free: 'free', pro: 'pro' };

/**
 * Reverse bridge — canonical `Tier` -> the legacy `UserTier` the UI badge still
 * renders (`data-tier` contract in docs/testing/TIER_MATRIX.md). Round-trips the
 * three paid/unpaid identities the tier robot seeds:
 *   free <-> registered · pro <-> premium · enterprise <-> practitioner
 */
export const TO_LEGACY_USER_TIER: Record<Tier, LegacyUserTier> = {
  free: 'registered', pro: 'premium', enterprise: 'practitioner',
};

/** Deny by default: anything unrecognised resolves to 'free'. */
export function toTier(value: string | null | undefined): Tier {
  if (!value) return 'free';
  if ((TIERS as readonly string[]).includes(value)) return value as Tier;
  return (
    FROM_LEGACY_USER_TIER[value as LegacyUserTier] ??
    FROM_LEGACY_API_TIER[value as LegacyApiTier] ??
    FROM_LEGACY_PLAN[value as LegacyPlan] ??
    'free'
  );
}

export const entitlementFor = (tier: Tier): Entitlement => ENTITLEMENTS[tier];
export const tierHasFeature = (tier: Tier, flag: string): boolean => ENTITLEMENTS[tier].features.includes(flag);
export const isUnlimited = (n: number): boolean => n === -1;
