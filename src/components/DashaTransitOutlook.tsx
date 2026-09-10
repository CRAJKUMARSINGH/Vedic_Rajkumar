/**
 * DashaTransitOutlook.tsx
 *
 * Week 7: 12-month Dasha + Transit activation outlook grid.
 *
 * Displays each of 12 future months as a colour-coded card:
 *   High   → green
 *   Medium → amber
 *   Low    → red/orange
 *
 * Responsive: 2 cols mobile → 3 cols sm → 4 cols lg → 6 cols xl
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { MonthlyOutlookItem, ActivationLevel } from '@/services/dashaTransitCorrelationService';

// ─── Colour helpers ───────────────────────────────────────────────────────────

const LEVEL_COLOUR: Record<ActivationLevel, string> = {
  High:   'border-green-300  bg-green-50   dark:bg-green-950/30  dark:border-green-700',
  Medium: 'border-amber-300  bg-amber-50   dark:bg-amber-950/30  dark:border-amber-700',
  Low:    'border-red-300    bg-red-50     dark:bg-red-950/30    dark:border-red-800',
};

const LEVEL_BADGE: Record<ActivationLevel, string> = {
  High:   'bg-green-600  text-white',
  Medium: 'bg-amber-500  text-white',
  Low:    'bg-red-500    text-white',
};

const LEVEL_BAR: Record<ActivationLevel, string> = {
  High:   'bg-green-500',
  Medium: 'bg-amber-500',
  Low:    'bg-red-500',
};

const PLANET_SYMBOL: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃',
  Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

const PLANET_HI: Record<string, string> = {
  Sun:'सूर्य', Moon:'चंद्र', Mars:'मंगल', Mercury:'बुध',
  Jupiter:'गुरु', Venus:'शुक्र', Saturn:'शनि', Rahu:'राहु', Ketu:'केतु',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashaTransitOutlookProps {
  outlook: MonthlyOutlookItem[];
  lang?: 'en' | 'hi';
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DashaTransitOutlook: React.FC<DashaTransitOutlookProps> = ({
  outlook,
  lang = 'en',
  className,
}) => {
  const isHi = lang === 'hi';

  if (!outlook || outlook.length === 0) return null;

  const pName = (p: string) =>
    isHi ? (PLANET_HI[p] ?? p) : p;

  return (
    <section
      aria-labelledby="outlook-heading"
      className={className}
    >
      <h3
        id="outlook-heading"
        className={cn('text-base font-semibold text-foreground mb-4', isHi && 'font-hindi')}
      >
        {isHi ? '12-मास दृष्टिकोण' : '12-Month Outlook'}
      </h3>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"
        role="list"
        aria-label={isHi ? 'मासिक सक्रियता स्तर' : 'Monthly activation levels'}
      >
        {outlook.map((item) => (
          <div
            key={item.monthKey}
            role="listitem"
            className={cn(
              'rounded-xl border-2 p-3 flex flex-col gap-2',
              LEVEL_COLOUR[item.activationLevel],
            )}
          >
            {/* Month label */}
            <p className="text-xs font-semibold text-foreground">{item.month}</p>

            {/* Activation badge */}
            <span
              className={cn(
                'self-start text-xs font-bold px-2 py-0.5 rounded-full',
                LEVEL_BADGE[item.activationLevel],
              )}
              aria-label={`${item.month}: ${item.activationLevel} activation`}
            >
              {item.activationLevel}
            </span>

            {/* Score bar */}
            <div
              className="w-full bg-muted rounded-full h-1.5"
              role="progressbar"
              aria-valuenow={item.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Score: ${item.score}/100`}
            >
              <div
                className={cn('h-1.5 rounded-full', LEVEL_BAR[item.activationLevel])}
                style={{ width: `${item.score}%` }}
              />
            </div>

            {/* Dasha lords */}
            <p className={cn('text-xs text-muted-foreground leading-tight', isHi && 'font-hindi')}>
              {PLANET_SYMBOL[item.mahaLord] ?? ''} {pName(item.mahaLord)}{' '}
              <span className="opacity-60">/{' '}</span>
              {PLANET_SYMBOL[item.antarLord] ?? ''} {pName(item.antarLord)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DashaTransitOutlook;
