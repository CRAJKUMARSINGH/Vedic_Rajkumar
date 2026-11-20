/**
 * ChartSurface.tsx — D1/D9/D10 selector plus North/South layout switch (c4 Phase 3).
 *
 * Switching chart type selects a different already-built `ChartViewModel`;
 * switching layout only changes the renderer. Planetary data is therefore
 * preserved verbatim — nothing is recalculated on a visual change.
 */

import { useMemo, useState } from 'react';
import type { Lang } from '../model/labels';
import type { ChartLayout, ChartViewModel } from '../model/chartViewModel';
import { NorthIndianChart } from './NorthIndianChart';
import { SouthIndianChart } from './SouthIndianChart';
import { cn } from '@/lib/utils';

export interface ChartSurfaceProps {
  charts: ChartViewModel[];
  lang?: Lang;
  degreePrecision?: number;
  monochrome?: boolean;
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function ChartSurface({
  charts,
  lang = 'en',
  degreePrecision = 2,
  monochrome = false,
  compact = true,
  showDetails = true,
  className,
}: ChartSurfaceProps) {
  const available = useMemo(() => charts.filter(Boolean), [charts]);
  const [selectedType, setSelectedType] = useState<string>(
    available[0]?.chartType ?? '',
  );
  const [layout, setLayout] = useState<ChartLayout>('north');

  const selected =
    available.find((c) => c.chartType === selectedType) ?? available[0] ?? null;

  if (!selected) {
    return (
      <div data-testid="chart-surface-empty" className={cn('text-sm text-muted-foreground', className)}>
        {lang === 'hi' ? 'कोई चार्ट उपलब्ध नहीं' : 'No chart data available'}
      </div>
    );
  }

  const rendererProps = {
    viewModel: selected,
    lang,
    degreePrecision,
    monochrome,
    compact,
    showDetails,
  };

  return (
    <div data-testid="chart-surface" className={cn('w-full', className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={lang === 'hi' ? 'चार्ट प्रकार' : 'Chart type'} className="flex gap-1">
          {available.map((c) => (
            <button
              key={c.chartType}
              type="button"
              data-testid={`chart-type-${c.chartType}`}
              aria-pressed={c.chartType === selected.chartType}
              onClick={() => setSelectedType(c.chartType)}
              className={cn(
                'rounded-md border px-3 py-1 text-sm',
                c.chartType === selected.chartType
                  ? 'border-primary bg-primary/10 font-semibold'
                  : 'border-border',
              )}
            >
              {c.chartType}
            </button>
          ))}
        </div>

        <div role="group" aria-label={lang === 'hi' ? 'चार्ट शैली' : 'Chart layout'} className="flex gap-1">
          <button
            type="button"
            data-testid="layout-north"
            aria-pressed={layout === 'north'}
            onClick={() => setLayout('north')}
            className={cn(
              'rounded-md border px-3 py-1 text-sm',
              layout === 'north' ? 'border-primary bg-primary/10 font-semibold' : 'border-border',
            )}
          >
            {lang === 'hi' ? 'उत्तर भारतीय' : 'North Indian'}
          </button>
          <button
            type="button"
            data-testid="layout-south"
            aria-pressed={layout === 'south'}
            onClick={() => setLayout('south')}
            className={cn(
              'rounded-md border px-3 py-1 text-sm',
              layout === 'south' ? 'border-primary bg-primary/10 font-semibold' : 'border-border',
            )}
          >
            {lang === 'hi' ? 'दक्षिण भारतीय' : 'South Indian'}
          </button>
        </div>
      </div>

      {layout === 'south' ? (
        <SouthIndianChart {...rendererProps} />
      ) : (
        <NorthIndianChart {...rendererProps} />
      )}

      <p data-testid="chart-calculation-meta" className="mt-2 text-xs text-muted-foreground">
        {`${selected.calculation.ayanamsa} · ${selected.calculation.zodiac} · ${selected.calculation.houseSystem} · ${selected.calculation.engine} v${selected.calculation.version}`}
      </p>
    </div>
  );
}

export default ChartSurface;
