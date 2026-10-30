/**
 * tierSessions.ts — grade personas + browser seeding for the tier robot.
 *
 * The robot must not depend on real Clerk/Supabase credentials, so each grade is
 * materialised as a deterministic local persona written into localStorage before
 * app code boots (same technique as robustness-random-birth.spec.ts).
 */
import type { Page } from '@playwright/test';
import * as path from 'node:path';

export type Grade = 'free' | 'pro' | 'enterprise';

export interface GradePersona {
  id: Grade;
  label: string;
  /** localStorage['vedic_subscription'] — read by src/services/subscriptionService.ts */
  subscription: { plan: 'free' | 'pro'; name: string; email: string } | null;
  /** internal UserTier — src/features/tier/config.ts */
  userTier: 'anonymous' | 'registered' | 'premium' | 'practitioner';
  /** API tier — src/api/v1/scopes.ts */
  apiTier: 'free' | 'developer' | 'enterprise';
  /** seeded family profiles — exercises TIER_LIMITS.maxProfiles */
  profiles: number;
  expect: {
    upgradeBannerVisible: boolean;
    pdfExportEnabled: boolean;
    dashaTimelineEnabled: boolean;
    whiteLabelEnabled: boolean;
    clientCrmEnabled: boolean;
    weeklyUnlimited: boolean;
  };
}

export const GRADES: Record<Grade, GradePersona> = {
  free: {
    id: 'free',
    label: 'Grade A — Free',
    subscription: { plan: 'free', name: 'Free Robot', email: 'robot+free@example.test' },
    userTier: 'registered',
    apiTier: 'free',
    profiles: 3,
    expect: {
      upgradeBannerVisible: true,
      pdfExportEnabled: true,
      dashaTimelineEnabled: false,
      whiteLabelEnabled: false,
      clientCrmEnabled: false,
      weeklyUnlimited: false,
    },
  },
  pro: {
    id: 'pro',
    label: 'Grade B — Pro',
    subscription: { plan: 'pro', name: 'Pro Robot', email: 'robot+pro@example.test' },
    userTier: 'premium',
    apiTier: 'developer',
    profiles: 12,
    expect: {
      upgradeBannerVisible: false,
      pdfExportEnabled: true,
      dashaTimelineEnabled: true,
      whiteLabelEnabled: false,
      clientCrmEnabled: false,
      weeklyUnlimited: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    label: 'Grade C — Enterprise',
    subscription: { plan: 'pro', name: 'Enterprise Robot', email: 'robot+ent@example.test' },
    userTier: 'practitioner',
    apiTier: 'enterprise',
    profiles: 40,
    expect: {
      upgradeBannerVisible: false,
      pdfExportEnabled: true,
      dashaTimelineEnabled: true,
      whiteLabelEnabled: true,
      clientCrmEnabled: true,
      weeklyUnlimited: true,
    },
  },
};

export function storageStatePath(grade: Grade): string {
  return path.join(process.cwd(), 'reports', 'tiers', `.auth-${grade}.json`);
}

export function personaForProject(projectName: string): GradePersona {
  const p = GRADES[projectName as Grade];
  if (!p) {
    throw new Error(`Unknown project "${projectName}". Expected: ${Object.keys(GRADES).join(', ')}`);
  }
  return p;
}

/** Write the persona into localStorage before any app script runs. */
export async function seedGrade(page: Page, persona: GradePersona): Promise<void> {
  await page.addInitScript((p) => {
    const write = (k: string, v: unknown) => {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
    };
    write('vr-consent', { given: true, timestamp: new Date().toISOString(), version: 1 });
    write('vedic_subscription', p.subscription);
    // Harness contract — see docs/testing/TIER_ROBOTIC_TESTING.md §4.
    write('vr_tier', p.userTier);
    write('vr_api_tier', p.apiTier);
    write('vedic_welcome_seen', '1');
    write('vedic_user_profile', {
      name: p.subscription?.name ?? 'Robot',
      email: p.subscription?.email ?? '',
      profiles: Array.from({ length: p.profiles }, (_, i) => ({
        id: `robot-${p.id}-${i}`,
        name: `Robot ${i + 1}`,
        dob: '1990-01-01',
        tob: '06:00',
        pob: 'Jaipur, Rajasthan',
      })),
    });
  }, persona);
}
