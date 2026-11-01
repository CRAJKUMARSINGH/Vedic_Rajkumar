import { describe, it, expect } from 'vitest';
import { toTier, ENTITLEMENTS, tierHasFeature, isUnlimited, TIERS, TO_LEGACY_USER_TIER } from '@/features/tier/tiers';

describe('tier taxonomy — canonical + legacy bridge', () => {
  it('passes canonical tiers through unchanged', () => {
    for (const t of TIERS) expect(toTier(t)).toBe(t);
  });

  it('maps every legacy enum onto a canonical tier', () => {
    expect(toTier('anonymous')).toBe('free');
    expect(toTier('registered')).toBe('free');
    expect(toTier('premium')).toBe('pro');
    expect(toTier('practitioner')).toBe('enterprise');
    expect(toTier('developer')).toBe('pro');
    expect(toTier('business')).toBe('pro');
    expect(toTier('enterprise')).toBe('enterprise');
  });

  it('denies by default', () => {
    expect(toTier(null)).toBe('free');
    expect(toTier(undefined)).toBe('free');
    expect(toTier('nonsense')).toBe('free');
  });

  it('round-trips the identities the tier robot seeds', () => {
    // data-tier stays the legacy UserTier, so canonical -> legacy must be stable.
    expect(TO_LEGACY_USER_TIER.free).toBe('registered');
    expect(TO_LEGACY_USER_TIER.pro).toBe('premium');
    expect(TO_LEGACY_USER_TIER.enterprise).toBe('practitioner');
    for (const t of TIERS) expect(toTier(TO_LEGACY_USER_TIER[t])).toBe(t);
  });
});

describe('tier taxonomy — entitlement table matches TIER_MATRIX.md', () => {
  it('free is capped, pro/enterprise are not', () => {
    expect(ENTITLEMENTS.free.limits.weeklyQuestions).toBe(21);
    expect(isUnlimited(ENTITLEMENTS.pro.limits.weeklyQuestions)).toBe(true);
    expect(isUnlimited(ENTITLEMENTS.enterprise.limits.maxProfiles)).toBe(true);
  });

  it('white_label is enterprise-only', () => {
    expect(tierHasFeature('free', 'white_label')).toBe(false);
    expect(tierHasFeature('pro', 'white_label')).toBe(false);
    expect(tierHasFeature('enterprise', 'white_label')).toBe(true);
    expect(ENTITLEMENTS.enterprise.limits.canWhiteLabel).toBe(true);
  });

  it('dasha_timeline is gated on free only', () => {
    expect(tierHasFeature('free', 'dasha_timeline')).toBe(false);
    expect(tierHasFeature('pro', 'dasha_timeline')).toBe(true);
  });
});
