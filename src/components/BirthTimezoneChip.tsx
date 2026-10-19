/**
 * BirthTimezoneChip — shows the resolved birth timezone when it differs from
 * modern IST.  Surfaces the historical offset correction so users know the
 * chart used wartime +6:30 rather than blindly defaulting to IST.
 *
 * Renders nothing for modern IST (not historical) — no noise for ordinary charts.
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { getBirthTimezone } from '@/hooks/use-birth-timezone';

interface BirthTimezoneChipProps {
  /** Force a specific offset label — used when not routed through the store */
  label?: string;
  note?: string;
  isHistorical?: boolean;
  lang?: 'en' | 'hi';
}

export function BirthTimezoneChip({ label, note, isHistorical, lang = 'en' }: BirthTimezoneChipProps) {
  // Read from the store when no explicit props are given
  const stored = getBirthTimezone();
  const resolvedLabel      = label      ?? stored?.label;
  const resolvedNote       = note       ?? stored?.note;
  const resolvedHistorical = isHistorical ?? stored?.isHistorical ?? false;

  // Only show when we have a label AND the offset is historical / non-standard
  if (!resolvedLabel || !resolvedHistorical) return null;

  const isHi = lang === 'hi';

  return (
    <div
      role="status"
      aria-label={isHi ? `जन्म समय क्षेत्र: ${resolvedLabel}` : `Birth timezone: ${resolvedLabel}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300"
    >
      <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className={isHi ? 'font-hindi' : ''}>{resolvedLabel}</span>
      {resolvedNote && (
        <span
          className={`ml-0.5 opacity-70 ${isHi ? 'font-hindi' : ''}`}
          title={resolvedNote}
          aria-label={resolvedNote}
        >
          ⓘ
        </span>
      )}
    </div>
  );
}

export default BirthTimezoneChip;
