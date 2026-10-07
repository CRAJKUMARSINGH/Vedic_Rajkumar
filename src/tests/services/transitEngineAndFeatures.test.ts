import { describe, it, expect } from 'vitest';
import { isChandrashtama, generateTransitDashboard } from '@/services/transitEngine';
import { isFeatureAccessible, getAllowedFeatures } from '@/config/features';

describe('Transit Engine & Feature Flags', () => {
  describe('Chandrashtama & Gochar Snapshot', () => {
    it('detects Chandrashtama when transit Moon is in the 8th rashi from natal Moon', () => {
      expect(isChandrashtama(0, 7)).toBe(true); // Aries (0) -> Scorpio (7) = 8th
      expect(isChandrashtama(0, 0)).toBe(false); // 1st
      expect(isChandrashtama(3, 10)).toBe(true); // Cancer (3) -> Aquarius (10) = 8th
    });

    it('generates complete transit dashboard snapshot', () => {
      const snapshot = generateTransitDashboard(0, new Date('2026-10-07'), 7);
      expect(snapshot.isChandrashtama).toBe(true);
      expect(snapshot.chandrashtamaMessage).toContain('Chandrashtama active');
      expect(snapshot.doubleTransitResults.length).toBe(5);
      expect(snapshot.favorablePeriods.length).toBeGreaterThan(0);
    });
  });

  describe('Feature Flag Tier Access', () => {
    it('allows core features for anonymous users', () => {
      expect(isFeatureAccessible('KUNDLI', 'anonymous')).toBe(true);
      expect(isFeatureAccessible('PANCHANG', 'anonymous')).toBe(true);
      expect(isFeatureAccessible('DASHA_TIMELINE', 'anonymous')).toBe(false);
    });

    it('allows premium features for premium and practitioner tiers', () => {
      expect(isFeatureAccessible('DASHA_TIMELINE', 'premium')).toBe(true);
      expect(isFeatureAccessible('WHITE_LABEL', 'premium')).toBe(false);
      expect(isFeatureAccessible('WHITE_LABEL', 'practitioner')).toBe(true);
    });

    it('returns correct allowed features list', () => {
      const anonFeatures = getAllowedFeatures('anonymous');
      const practitionerFeatures = getAllowedFeatures('practitioner');
      expect(practitionerFeatures.length).toBeGreaterThan(anonFeatures.length);
      expect(anonFeatures).toContain('KUNDLI');
    });
  });
});
