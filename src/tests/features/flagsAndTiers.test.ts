import { describe, it, expect } from 'vitest';
import { FEATURE_FLAGS } from '@/features/flags/config';
import { TIER_FEATURES, TIER_LIMITS } from '@/features/tier/config';

describe('Feature Flags and Tier Configuration', () => {
  it('defines essential core feature flags', () => {
    expect(FEATURE_FLAGS.KUNDLI).toBe('kundli');
    expect(FEATURE_FLAGS.PRASHNA).toBe('prashna');
    expect(FEATURE_FLAGS.MATCHMAKING).toBe('matchmaking');
    expect(FEATURE_FLAGS.PANCHANG).toBe('panchang');
  });

  it('defines premium and practitioner feature flags', () => {
    expect(FEATURE_FLAGS.DASHA_TIMELINE).toBe('dasha_timeline');
    expect(FEATURE_FLAGS.TRANSIT_ALERTS).toBe('transit_alerts');
    expect(FEATURE_FLAGS.ADVANCED_PDF).toBe('advanced_pdf');
    expect(FEATURE_FLAGS.CLIENT_CRM).toBe('client_crm');
    expect(FEATURE_FLAGS.WHITE_LABEL).toBe('white_label');
  });

  it('provides appropriate feature access per tier', () => {
    const anonymousFeatures = TIER_FEATURES.anonymous;
    expect(anonymousFeatures).toContain(FEATURE_FLAGS.KUNDLI);
    expect(anonymousFeatures).toContain(FEATURE_FLAGS.PANCHANG);
    expect(anonymousFeatures).not.toContain(FEATURE_FLAGS.DASHA_TIMELINE);

    const premiumFeatures = TIER_FEATURES.premium;
    expect(premiumFeatures).toContain(FEATURE_FLAGS.DASHA_TIMELINE);
    expect(premiumFeatures).toContain(FEATURE_FLAGS.TRANSIT_ALERTS);
    expect(premiumFeatures).toContain(FEATURE_FLAGS.ADVANCED_PDF);

    const practitionerFeatures = TIER_FEATURES.practitioner;
    expect(practitionerFeatures).toContain(FEATURE_FLAGS.CLIENT_CRM);
    expect(practitionerFeatures).toContain(FEATURE_FLAGS.WHITE_LABEL);
  });

  it('enforces tier limits correctly', () => {
    expect(TIER_LIMITS.anonymous.maxChartsPerDay).toBe(5);
    expect(TIER_LIMITS.anonymous.canAccessAdvancedFeatures).toBe(false);

    expect(TIER_LIMITS.registered.maxProfiles).toBe(5);
    expect(TIER_LIMITS.registered.maxChartsPerDay).toBe(20);

    expect(TIER_LIMITS.premium.maxChartsPerDay).toBe(100);
    expect(TIER_LIMITS.premium.maxPdfExports).toBe(-1); // unlimited
    expect(TIER_LIMITS.premium.canAccessAdvancedFeatures).toBe(true);

    expect(TIER_LIMITS.practitioner.maxProfiles).toBe(-1);
    expect(TIER_LIMITS.practitioner.canWhiteLabel).toBe(true);
    expect(TIER_LIMITS.practitioner.supportLevel).toBe('dedicated');
  });
});
