/**
 * TierBadge — the visible identity of the current grade.
 *
 * The tier robot (docs/testing/TIER_ROBOTIC_TESTING.md) reads `data-testid` +
 * `data-tier` from here to prove each grade boots with the right entitlement.
 * The attribute is the contract; the copy is for humans.
 */
import { useMemo } from 'react';
import { Crown, Sparkles, User, UserCheck } from 'lucide-react';
import { resolveTier } from '@/features/tier/resolveTier';
import type { UserTier } from '@/features/tier/config';

const COPY: Record<UserTier, { en: string; hi: string }> = {
  anonymous: { en: 'Guest', hi: 'अतिथि' },
  registered: { en: 'Free', hi: 'निःशुल्क' },
  premium: { en: 'Pro', hi: 'प्रो' },
  practitioner: { en: 'Enterprise', hi: 'एंटरप्राइज़' },
};

const ICON: Record<UserTier, typeof User> = {
  anonymous: User,
  registered: UserCheck,
  premium: Sparkles,
  practitioner: Crown,
};

interface TierBadgeProps {
  isHi?: boolean;
  className?: string;
}

export function TierBadge({ isHi = false, className = '' }: TierBadgeProps) {
  // Resolve during the first render: this is a client-only SPA, so the seeded
  // value is already present and the attribute is correct on first paint (an
  // effect would race the robot's attribute read).
  const tier = useMemo<UserTier>(() => resolveTier(), []);

  const Icon = ICON[tier];
  const label = isHi ? COPY[tier].hi : COPY[tier].en;

  return (
    <span
      data-testid="tier-badge"
      data-tier={tier}
      className={`inline-flex items-center gap-1 rounded-full border border-[hsl(var(--auspicious-accent)/0.6)] bg-white/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--auspicious-accent))] ${className}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

export default TierBadge;
