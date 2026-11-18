/**
 * TrialBanner — "Beta access · N days left".
 *
 * The window is SERVER state: `user_entitlements.expires_at` on a
 * `source = 'beta_trial'` grant, surfaced by `resolve_entitlement()`
 * (20261128_entitlement_expiry.sql) → edge `tier-entitlement` → `useTrialWindow()`.
 *
 * It renders ONLY while such a grant is live. Free, paid, perpetual and untimed
 * entitlements show nothing, so no one ever sees a countdown they do not have.
 * Dismissal is session-local React state, never persisted — the trial itself lives
 * on the server and cannot be dismissed from the client.
 *
 * Robot contract: `data-testid="trial-banner"`, `data-days-left`, `data-trial-source`.
 */
import { useState } from 'react';
import { FlaskConical, X } from 'lucide-react';
import { useTrialWindow } from '@/features/tier/useEntitlement';

interface TrialBannerProps {
  isHi?: boolean;
  className?: string;
}

export function TrialBanner({ isHi = false, className = '' }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { active, daysLeft, source } = useTrialWindow();

  if (dismissed || !active || daysLeft === null) return null;

  const label = isHi
    ? `बीटा एक्सेस · ${daysLeft} दिन शेष`
    : `Beta access · ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;

  return (
    <div
      data-testid="trial-banner"
      data-days-left={daysLeft}
      data-trial-source={source}
      className={`flex items-center justify-between gap-3 border-b border-[hsl(var(--auspicious-accent)/0.4)] bg-[hsl(var(--auspicious-accent)/0.12)] px-4 py-2 text-sm text-foreground ${className}`}
    >
      <div className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
        <FlaskConical className="h-4 w-4 shrink-0 text-[hsl(var(--auspicious-accent))]" aria-hidden />
        <span className="font-medium">{label}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label={isHi ? 'बैनर बंद करें' : 'Dismiss banner'}
        className="shrink-0 text-foreground/50 hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export default TrialBanner;
