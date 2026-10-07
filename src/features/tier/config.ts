import { FEATURE_FLAGS } from '../flags/config';

export type UserTier = 'anonymous' | 'registered' | 'premium' | 'practitioner';

export interface TierLimits {
  maxProfiles: number;
  maxChartsPerDay: number;
  maxPdfExports: number;
  canAccessAdvancedFeatures: boolean;
  canWhiteLabel: boolean;
  supportLevel: 'none' | 'email' | 'priority' | 'dedicated';
}

export const TIER_FEATURES: Record<UserTier, string[]> = {
  anonymous: [
    FEATURE_FLAGS.KUNDLI,
    FEATURE_FLAGS.PRASHNA,
    FEATURE_FLAGS.MATCHMAKING,
    FEATURE_FLAGS.PANCHANG,
  ],
  registered: [
    FEATURE_FLAGS.KUNDLI,
    FEATURE_FLAGS.PRASHNA,
    FEATURE_FLAGS.MATCHMAKING,
    FEATURE_FLAGS.PANCHANG,
    FEATURE_FLAGS.EXPORT_DATA,
  ],
  premium: [
    FEATURE_FLAGS.KUNDLI,
    FEATURE_FLAGS.PRASHNA,
    FEATURE_FLAGS.MATCHMAKING,
    FEATURE_FLAGS.PANCHANG,
    FEATURE_FLAGS.EXPORT_DATA,
    FEATURE_FLAGS.DASHA_TIMELINE,
    FEATURE_FLAGS.TRANSIT_ALERTS,
    FEATURE_FLAGS.ADVANCED_PDF,
  ],
  practitioner: [
    // All features
    ...Object.values(FEATURE_FLAGS),
  ],
};

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  anonymous: {
    maxProfiles: 0,
    maxChartsPerDay: 5,
    maxPdfExports: 0,
    canAccessAdvancedFeatures: false,
    canWhiteLabel: false,
    supportLevel: 'none',
  },
  registered: {
    maxProfiles: 5,
    maxChartsPerDay: 20,
    maxPdfExports: 10,
    canAccessAdvancedFeatures: false,
    canWhiteLabel: false,
    supportLevel: 'email',
  },
  premium: {
    maxProfiles: 20,
    maxChartsPerDay: 100,
    maxPdfExports: -1, // unlimited
    canAccessAdvancedFeatures: true,
    canWhiteLabel: false,
    supportLevel: 'priority',
  },
  practitioner: {
    maxProfiles: -1,
    maxChartsPerDay: -1,
    maxPdfExports: -1,
    canAccessAdvancedFeatures: true,
    canWhiteLabel: true,
    supportLevel: 'dedicated',
  },
};
