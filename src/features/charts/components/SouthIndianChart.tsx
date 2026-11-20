/**
 * SouthIndianChart.tsx — South Indian (square) chart renderer (c4 Phase 3).
 *
 * In the South Indian layout the *signs* are fixed to the 4×4 border cells and
 * the houses rotate with the ascendant. The renderer only reads the view model:
 * planets are placed by their already-computed rashi, never by pixel position.
 */

import { useMemo, useState, type KeyboardEvent } from 'react';
import { label, planetAbbr, type Lang } from '../model/labels';
import { planetsInSign, type ChartViewModel, type PlanetView } from '../model/chartViewModel';
import { ChartDetailsTable } from './ChartDetailsTable';
import { cn } from '@/lib/utils';

/** Fixed sign → grid cell map (row, col) for the 4×4 South Indian layout. */
const SIGN_CELLS: readonly { sign: number; row: number; col: number }[] = [
  { sign: 11, row: 0, col: 0 },
  { sign: 0, row: 0, col: 1 },
  { sign: 1, row: 0, col: 2 },
  { sign: 2, row: 0, col: 3 },
  { sign: 10, row: 1, col: 0 },
  { sign: 3, row: 1, col: 3 },
  { sign: 9, row: 2, col: 0 },
  { sign: 4, row: 2, col: 3 },
  { sign: 8, row: 3, col: 0 },
  { sign: 7, row: 3, col: 1 },
  { sign: 6, row: 3, col: 2 },
  { sign: 5, row: 3, col: 3 },
];

const CELL = 25;

export interface SouthIndianChartProps {
  viewModel: ChartViewModel;
  lang?: Lang;
  degreePrecision?: number;
  monochrome?: boolean;
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function SouthIndianChart({
  viewModel,
  lang = 'en',
  degreePrecision = 2,
  monochrome = false,
  compact = true,
  showDetails = true,
  className,
}: SouthIndianChartProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const planetsBySign = useMemo(() => {
    const map = new Map<number, PlanetView[]>();
    for (let s = 0; s < 12; s++) map.set(s, planetsInSign(viewModel, s));
    return map;
  }, [viewModel]);

  const maxInline = compact ? 4 : 5;

  const toggle = (sign: number) =>
    setExpanded((current) => (current === sign ? null : sign));

  const onCellKey = (event: KeyboardEvent<SVGGElement>, sign: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle(sign);
    }
  };

  const empty = lang === 'hi' ? 'खाली' : 'Empty';

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full">
        <svg
          data-testid="south-indian-chart"
          data-layout="south"
          data-monochrome={monochrome ? 'true' : 'false'}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          role="img"
          aria-label={`South Indian ${viewModel.chartType} chart, ${viewModel.houses.length} signs, ${viewModel.planets.length} planets`}
          className="w-full h-auto block text-foreground"
        >
          {/* 4×4 grid: outer ring holds the twelve signs, inner 2×2 is empty. */}
          {Array.from({ length: 16 }, (_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const isBorder = row === 0 || row === 3 || col === 0 || col === 3;
            if (!isBorder) return null;
            return (
              <rect
                key={`bg-${row}-${col}`}
                x={col * CELL}
                y={row * CELL}
                width={CELL}
                height={CELL}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {SIGN_CELLS.map(({ sign, row, col }) => {
            const x = col * CELL;
            const y = row * CELL;
            const planets = planetsBySign.get(sign) ?? [];
            const shown = planets.slice(0, maxInline);
            const overflow = planets.length - shown.length;
            const isAscendant = viewModel.ascendantSign === sign;
            const planetNames = planets.map((p) => label(p.name, lang)).join(', ');
            const cellLabel =
              `${label(viewModel.houses.find((h) => h.sign === sign)?.signName ?? null, lang) || `Rashi ${sign + 1}`}` +
              (isAscendant ? ` (${lang === 'hi' ? 'लग्न' : 'Ascendant'})` : '') +
              (planetNames ? ` · ${planetNames}` : '');

            return (
              <g
                key={sign}
                data-testid={`sign-cell-${sign}`}
                data-sign={sign}
                role="button"
                tabIndex={0}
                aria-label={cellLabel}
                aria-pressed={expanded === sign}
                onClick={() => toggle(sign)}
                onKeyDown={(e) => onCellKey(e, sign)}
                className="cursor-pointer outline-none focus-visible:opacity-70"
              >
                <title>{cellLabel}</title>
                {isAscendant && (
                  <line
                    data-testid="ascendant-marker"
                    x1={x}
                    y1={y}
                    x2={x + 8}
                    y2={y + 8}
                    stroke="currentColor"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                <text
                  data-testid={`sign-cell-${sign}-number`}
                  x={x + 1.5}
                  y={y + 5}
                  fontSize={4}
                  fill="currentColor"
                  opacity={0.7}
                >
                  {sign + 1}
                </text>
                {shown.map((p, i) => (
                  <text
                    key={p.key}
                    data-testid={`sign-cell-${sign}-planet-${p.key}`}
                    x={x + CELL / 2}
                    y={y + 11 + i * 4.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={3.6}
                    fill="currentColor"
                    className={lang === 'hi' ? 'font-hindi' : undefined}
                  >
                    {planetAbbr(p.key, lang)}
                    {p.retrograde ? '℞' : ''}
                  </text>
                ))}
                {overflow > 0 && (
                  <text
                    data-testid={`sign-cell-${sign}-overflow`}
                    x={x + CELL / 2}
                    y={y + 11 + shown.length * 4.5}
                    textAnchor="middle"
                    fontSize={3.2}
                    fill="currentColor"
                    opacity={0.7}
                  >
                    {`+${overflow}`}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {expanded !== null && (
        <div
          data-testid={`sign-detail-${expanded}`}
          className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-sm"
        >
          <h4 className="mb-2 font-semibold">
            {label(viewModel.houses.find((h) => h.sign === expanded)?.signName ?? null, lang) ||
              `Rashi ${expanded + 1}`}
          </h4>
          {(planetsBySign.get(expanded) ?? []).length === 0 ? (
            <p className="text-muted-foreground">{empty}</p>
          ) : (
            <ul className="space-y-1">
              {(planetsBySign.get(expanded) ?? []).map((p) => (
                <li key={p.key} data-testid={`sign-detail-${expanded}-${p.key}`}>
                  {label(p.name, lang)}
                  {p.retrograde ? ` · ${lang === 'hi' ? 'वक्री' : 'Retrograde'}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showDetails && (
        <ChartDetailsTable
          viewModel={viewModel}
          lang={lang}
          degreePrecision={degreePrecision}
        />
      )}

      {viewModel.warnings.length > 0 && (
        <ul data-testid="chart-warnings" className="mt-2 list-disc pl-5 text-xs text-amber-700">
          {viewModel.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SouthIndianChart;
