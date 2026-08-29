import { describe, it, expect } from 'vitest';
import {
  DESKTOP_NAV_LINKS,
  MOBILE_SHEET_NAV_LINKS,
  BOTTOM_BAR_NAV_LINKS,
  getFeatureByPath,
  FEATURE_CATALOG,
} from '@/routes/featureRegistry';

const CORE_4_PATHS = ['/horoscope', '/prashna', '/matchmaking', '/panchang'];
const CORE_4_LABELS = ['Kundli', 'Prashna', 'Matchmaking', 'Panchang'];

describe('Feature Registry — Week 3 Core Feature Prioritization', () => {
  describe('BOTTOM_BAR_NAV_LINKS', () => {
    it('should have exactly 5 items (Home + 4 core features)', () => {
      expect(BOTTOM_BAR_NAV_LINKS).toHaveLength(5);
    });

    it('should be ordered: Home → Kundli → Prashna → Matchmaking → Panchang', () => {
      const labels = BOTTOM_BAR_NAV_LINKS.map(l => l.label);
      expect(labels).toEqual(['Home', 'Kundli', 'Prashna', 'Matchmaking', 'Panchang']);
    });

    it('should have isCoreFeature=true for the 4 non-Home items', () => {
      const nonHome = BOTTOM_BAR_NAV_LINKS.filter(l => l.href !== '/');
      expect(nonHome).toHaveLength(4);
      nonHome.forEach(l => {
        expect(l.isCoreFeature).toBe(true);
      });
    });

    it('should NOT contain non-core items (My Readings, Dasha, Enterprise, Knowledge, etc.)', () => {
      const labels = BOTTOM_BAR_NAV_LINKS.map(l => l.label);
      expect(labels).not.toContain('My Readings');
      expect(labels).not.toContain('Dasha');
      expect(labels).not.toContain('Enterprise');
      expect(labels).not.toContain('Knowledge');
    });
  });

  describe('DESKTOP_NAV_LINKS', () => {
    it('should have Home first, then the 4 core features before any section headers', () => {
      const beforeSection = DESKTOP_NAV_LINKS.filter(l => !l.isSectionHeader);
      const firstFive = beforeSection.slice(0, 5);
      const firstFiveLabels = firstFive.map(l => l.label);
      expect(firstFiveLabels[0]).toBe('Home');
      expect(firstFiveLabels.slice(1)).toEqual(expect.arrayContaining(CORE_4_LABELS));
    });

    it('should have a "More" section header', () => {
      const moreHeader = DESKTOP_NAV_LINKS.find(l => l.isSectionHeader && l.label === 'More');
      expect(moreHeader).toBeDefined();
    });

    it('should mark all 4 core features with isCoreFeature=true in FEATURE_CATALOG', () => {
      CORE_4_PATHS.forEach(path => {
        const f = FEATURE_CATALOG.find(feat => feat.path === path);
        expect(f).toBeDefined();
        expect(f!.isCoreFeature).toBe(true);
      });
    });

    it('should have all features (no deletions) - count should be >= 68', () => {
      expect(DESKTOP_NAV_LINKS.filter(l => !l.isSectionHeader).length).toBeGreaterThanOrEqual(68);
    });
  });

  describe('MOBILE_SHEET_NAV_LINKS', () => {
    it('should have "Core Tools" as the first section header', () => {
      const firstHeader = MOBILE_SHEET_NAV_LINKS.find(l => l.isSectionHeader);
      expect(firstHeader?.label).toBe('Core Tools');
    });

    it('should contain the 4 core features in Core Tools group', () => {
      const coreGroup = MOBILE_SHEET_NAV_LINKS.filter(l => l.group === 'core' && !l.isSectionHeader);
      const coreLabels = coreGroup.map(l => l.label);
      expect(coreLabels).toContain('Home');
      CORE_4_LABELS.forEach(label => expect(coreLabels).toContain(label));
    });

    it('should have "Advanced / Coming Soon" section header further down', () => {
      const advHeader = MOBILE_SHEET_NAV_LINKS.find(
        l => l.isSectionHeader && l.label === 'Advanced / Coming Soon'
      );
      expect(advHeader).toBeDefined();
    });

    it('should place non-core items (Dasha, Enterprise, Knowledge, Marketplace, etc.) in Advanced group', () => {
      const advItems = MOBILE_SHEET_NAV_LINKS.filter(l => l.group === 'advanced' && !l.isSectionHeader);
      const advLabels = advItems.map(l => l.label);
      expect(advLabels).toContain('Dasha');
      expect(advLabels).toContain('Enterprise');
      expect(advLabels).toContain('Knowledge');
      expect(advLabels).toContain('Marketplace');
      expect(advLabels).toContain('Ashtakavarga');
      expect(advLabels).toContain('Numerology');
      expect(advLabels).toContain('Western');
      expect(advLabels).toContain('Chinese');
      expect(advLabels).toContain('Lal Kitab');
      expect(advLabels).toContain('KP System');
      expect(advLabels).toContain('Jaimini');
      expect(advLabels).toContain('Nadi');
      expect(advLabels).toContain('Gemstones');
      expect(advLabels).toContain('Sade Sati');
      expect(advLabels).toContain('Medical');
      expect(advLabels).toContain('Financial');
      expect(advLabels).toContain('Learn');
    });
  });

  describe('getFeatureByPath with isCoreFeature flag', () => {
    it('should return isCoreFeature=true for the 4 core features', () => {
      CORE_4_PATHS.forEach(path => {
        const f = getFeatureByPath(path);
        expect(f).toBeDefined();
        expect(f!.isCoreFeature).toBe(true);
      });
    });

    it('should return isCoreFeature=false or undefined for non-core features', () => {
      const nonCorePaths = ['/dasha', '/ashtakavarga', '/knowledge', '/enterprise', '/marketplace', '/learn', '/western-astrology', '/numerology'];
      nonCorePaths.forEach(path => {
        const f = getFeatureByPath(path);
        expect(f).toBeDefined();
        expect(f!.isCoreFeature).not.toBe(true);
      });
    });
  });

  describe('FEATURE_CATALOG integrity (no features deleted)', () => {
    it('should still have all 4 core paths AND all previous non-core paths', () => {
      const catalogPaths = FEATURE_CATALOG.map(f => f.path);
      const expectedToExist = [
        '/',
        '/horoscope', '/prashna', '/matchmaking', '/panchang',
        '/dasha', '/ashtakavarga', '/sade-sati',
        '/knowledge', '/learn', '/marketplace', '/enterprise',
        '/western-astrology', '/chinese-astrology', '/numerology',
        '/medical-astrology', '/financial-astrology',
        '/lal-kitab', '/kp-system', '/jaimini', '/nadi-astrology',
        '/gemstones', '/remedies', '/vaastu',
      ];
      expectedToExist.forEach(path => {
        expect(catalogPaths).toContain(path);
      });
    });
  });
});
