/**
 * WeeklyDriveCard — surfaces the weekly free-user allowance.
 *
 * The allowance itself is defined in src/features/tier/weeklyDrive.ts and is
 * authoritative on the server (weekly_drive_grants + the `weekly-drive` edge
 * function). This card is a read-only projection of the offline mirror; it never
 * grants or consumes. `data-remaining` (-1 = unlimited) is the robot contract.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Infinity as InfinityIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveTier } from '@/features/tier/resolveTier';
import {
  grantFor,
  readMirror,
  remainingFrom,
} from '@/features/tier/weeklyDrive';

interface WeeklyDriveCardProps {
  isHi?: boolean;
  className?: string;
}

export function WeeklyDriveCard({ isHi = false, className = '' }: WeeklyDriveCardProps) {
  // Computed on first render so `data-remaining` is already correct on first
  // paint (see TierBadge for why an effect would race the robot).
  const remaining = useMemo(() => {
    const grant = grantFor(resolveTier());
    const consumed = readMirror()?.questionsConsumed ?? 0;
    return remainingFrom(grant.questions, consumed);
  }, []);

  const unlimited = remaining === -1;
  const exhausted = !unlimited && remaining <= 0;

  const heading = isHi ? 'साप्ताहिक प्रश्न' : 'Weekly questions';
  const value = unlimited
    ? isHi
      ? 'असीमित'
      : 'Unlimited'
    : isHi
      ? `${remaining} शेष`
      : `${remaining} left`;

  return (
    <div
      data-testid="weekly-drive-card"
      data-remaining={remaining}
      className={`flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--auspicious-accent)/0.4)] bg-white/5 px-4 py-2.5 text-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-[hsl(var(--auspicious-accent))]" aria-hidden />
        <span className="font-medium text-foreground/90">{heading}</span>
        <span className="font-semibold text-[hsl(var(--auspicious-accent))]">
          {unlimited && <InfinityIcon className="mr-0.5 inline h-3.5 w-3.5" aria-hidden />}
          {value}
        </span>
      </div>

      {/* No nudge for paid grades. */}
      {exhausted && (
        <Link to="/pricing">
          <Button size="sm" className="h-7 bg-amber-500 px-3 text-xs text-white hover:bg-amber-600">
            {isHi ? 'प्रो अपग्रेड' : 'Upgrade'}
          </Button>
        </Link>
      )}
    </div>
  );
}

export default WeeklyDriveCard;
