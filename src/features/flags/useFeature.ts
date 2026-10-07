import { useFlagsmith } from './provider';
import { TIER_FEATURES, UserTier, TIER_LIMITS } from '../tier/config';
import { FeatureFlag } from './config';

export interface UseFeatureResult {
  enabled: boolean;
  isLoading: boolean;
  reason: 'flag' | 'tier' | 'limit' | 'ready';
}

export const useFeature = (
  flag: FeatureFlag,
  userTier: UserTier = 'anonymous'
): UseFeatureResult => {
  const { isReady, hasFeature } = useFlagsmith();

  // Check tier first
  const tierFeatures = TIER_FEATURES[userTier];
  const hasTierAccess = tierFeatures.includes(flag);

  // Check feature flag
  const flagEnabled = hasFeature(flag);

  // Determine final state
  if (!isReady) {
    return { enabled: false, isLoading: true, reason: 'ready' };
  }

  if (!hasTierAccess) {
    return { enabled: false, isLoading: false, reason: 'tier' };
  }

  if (!flagEnabled) {
    return { enabled: false, isLoading: false, reason: 'flag' };
  }

  return { enabled: true, isLoading: false, reason: 'flag' };
};

export const useTierLimits = (userTier: UserTier) => {
  return TIER_LIMITS[userTier];
};

export const useCanAccessFeature = (
  flag: FeatureFlag,
  userTier: UserTier,
  currentUsage: number,
  limitKey: keyof typeof TIER_LIMITS[UserTier]
): boolean => {
  const limits = TIER_LIMITS[userTier];
  const limit = limits[limitKey] as number;

  // Unlimited (-1) or within limit
  const withinLimit = limit === -1 || currentUsage < limit;

  const { enabled } = useFeature(flag, userTier);

  return enabled && withinLimit;
};
