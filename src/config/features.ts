/**
 * Feature Flags and Tier-Based Gating Configuration
 * Week 3 Architecture: Dynamic feature rollout and tier authorization.
 */

export type UserTier = 'anonymous' | 'registered' | 'premium' | 'practitioner' | 'enterprise';

export interface FeatureFlagConfig {
  enabled: boolean;
  tier: UserTier;
  flag?: string;
  limit?: number;
  watermark?: boolean;
}

export const featureFlags: Record<string, FeatureFlagConfig> = {
  // Core features - universally available
  KUNDLI: { enabled: true, tier: 'anonymous' },
  PRASHNA: { enabled: true, tier: 'anonymous' },
  MATCHMAKING: { enabled: true, tier: 'anonymous' },
  PANCHANG: { enabled: true, tier: 'anonymous' },

  // Registered features
  FAMILY_PROFILES: { enabled: true, tier: 'registered', limit: 5 },
  PDF_EXPORT: { enabled: true, tier: 'registered', watermark: true },
  CHART_HISTORY: { enabled: true, tier: 'registered' },

  // Premium features - gated
  DASHA_TIMELINE: { enabled: true, tier: 'premium', flag: 'dasha-v2' },
  TRANSIT_ALERTS: { enabled: true, tier: 'premium', flag: 'transit-alerts' },
  UNLIMITED_PDF: { enabled: true, tier: 'premium', watermark: false },

  // Practitioner & Enterprise features
  WHITE_LABEL: { enabled: true, tier: 'practitioner' },
  CLIENT_CRM: { enabled: true, tier: 'practitioner' },
  CONSULTATION_NOTES: { enabled: true, tier: 'practitioner' },

  // Experimental - dev rollout
  KP_SYSTEM: { enabled: false, tier: 'enterprise', flag: 'kp-alpha' },
  ASHTAKAVARGA_V2: { enabled: false, tier: 'enterprise' },
} as const;

const TIER_LEVELS: Record<UserTier, number> = {
  anonymous: 0,
  registered: 1,
  premium: 2,
  practitioner: 3,
  enterprise: 4,
};

/**
 * Check if a feature is enabled and accessible for a given user tier
 */
export function isFeatureAccessible(featureKey: keyof typeof featureFlags, userTier: UserTier = 'anonymous'): boolean {
  const feature = featureFlags[featureKey];
  if (!feature || !feature.enabled) {
    return false;
  }
  return TIER_LEVELS[userTier] >= TIER_LEVELS[feature.tier];
}

/**
 * Returns list of allowed features for a user tier
 */
export function getAllowedFeatures(userTier: UserTier = 'anonymous'): string[] {
  const userLevel = TIER_LEVELS[userTier];
  return Object.entries(featureFlags)
    .filter(([_, config]) => config.enabled && userLevel >= TIER_LEVELS[config.tier])
    .map(([key]) => key);
}
