/**
 * NorthIndianChart.tsx — premium North Indian (diamond) chart renderer (c4 Phase 2).
 *
 * Pure presentational SVG. It reads a `ChartViewModel` and never computes
 * longitudes or infers planet placement from layout — houses and signs come
 * pre-projected from the canonical model.
 *
 * Layout rules are deterministic: the twelve compartments, their label anchors
 * and the stacking direction are fixed constants (traditional geometry).
 */

import { useMemo, useState, type KeyboardEvent } from 'react';
import {
  formatDegrees,
  label,
  planetAbbr,
  type Lang,
} from '../model/labels';
import { planetsInHouse, type ChartViewModel, type PlanetView } from '../model/chartViewModel';
import { ChartDetailsTable } from './ChartDetailsTable';
import { cn } from '@/lib/utils';

/**
 * Twelve compartments (house 1..12) of the traditional North Indian square,
 * expressed in a 0–100 coordinate space. House 1 is the top-centre rhombus and
 * the sequence runs anticlockwise (2 upper-left → 4 left → 7 bottom → 10 right).
 */
const HOUSE_POLYGONS: readonly string[] = [
  '50,0 75,25 50,50 25,25', // 1  — Lagna (top centre)
  '50,0 0,0 25,25', // 2
  '0,0 0,50 25,25', // 3
  '50,50 25,75 0,50 25,25', // 4  — left centre
  '0,100 0,50 25,75', // 5
  '0,100 25,75 50,100', // 6
  '50,50 75,75 50,100 25,75', // 7  — bottom centre
  '100,100 50,100 75,75', // 8
  '100,100 75,75 100,50', // 9
  '50,50 75,25 100,50 75,75', // 10 — right centre
  '100,0 75,25 100,50', // 11
  '100,0 50,0 75,25', // 12
];

/** Text anchor (compartment centroid) for each house. */
const HOUSE_ANCHORS: readonly { x: number; y: number }[] = [
  { x: 50, y: 25 },
  { x: 25, y: 10 },
  { x: 10, y: 25 },
  { x: 25, y: 50 },
  { x: 10, y: 75 },
  { x: 25, y: 90 },
  { x: 50, y: 75 },
  { x: 75, y: 90 },
  { x: 90, y: 75 },
  { x: 75, y: 50 },
  { x: 90, y: 25 },
  { x: 75, y: 10 },
];

export interface NorthIndianChartProps {
  viewModel: ChartViewModel;
  lang?: Lang;
  /** Decimal precision for the degree value in the details panel (0–6). */
  degreePrecision?: number;
  /** Print-safe monochrome rendering (no colour fill). */
  monochrome?: boolean;
  /** Compact single/double-letter labels inside each compartment. */
  compact?: boolean;
  /** Render the accessible/printable details table beneath the SVG. */
  showDetails?: boolean;
  className?: string;
}

export function NorthIndianChart({
  viewModel,
  lang = 'en',
  degreePrecision = 2,
  monochrome = false,
  compact = true,
  showDetails = true,
  className,
}: NorthIndianChartProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const planetsByHouse = useMemo(() => {
    const map = new Map<number, PlanetView[]>();
    for (let h = 1; h <= 12; h++) map.set(h, planetsInHouse(viewModel, h));
    return map;
  }, [viewModel]);

  const maxInline = compact ? 3 : 4;
  const ascendantFill = monochrome ? 'none' : 'rgba(217,119,6,0.10)';

  const toggle = (house: number) =>
    setExpanded((current) => (current === house ? null : house));

  const onHouseKey = (event: KeyboardEvent<SVGGElement>, house: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle(house);
    }
  };

  const empty = lang === 'hi' ? 'खाली' : 'Empty';
  const unavailable = '—';

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full">
        <svg
          data-testid="north-indian-chart"
          data-layout="north"
          data-monochrome={monochrome ? 'true' : 'false'}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          role="img"
          aria-label={`North Indian ${viewModel.chartType} chart, ${viewModel.houses.length} houses, ${viewModel.planets.length} planets`}
          className="w-full h-auto block text-foreground"
        >
          <rect x={0} y={0} width={100} height={100} fill="none" stroke="currentColor" strokeWidth={0.8} />
          {viewModel.houses.map((house, idx) => {
            const anchor = HOUSE_ANCHORS[idx];
            const planets = planetsByHouse.get(house.house) ?? [];
            const dir = anchor.y > 55 ? -1 : 1;
            const shown = planets.slice(0, maxInline);
            const overflow = planets.length - shown.length;
            const signNumber = house.sign === null ? null : house.sign + 1;
            const planetNames = planets.map((p) => label(p.name, lang)).join(', ');
            const houseLabel =
              `${lang === 'hi' ? 'भाव' : 'House'} ${house.house}` +
              (house.signName ? ` · ${label(house.signName, lang)}` : '') +
              (planetNames ? ` · ${planetNames}` : '');

            return (
              <g
                key={house.house}
                data-testid={`house-${house.house}`}
                data-house={house.house}
                role="button"
                tabIndex={0}
                aria-label={houseLabel}
                aria-pressed={expanded === house.house}
                onClick={() => toggle(house.house)}
                onKeyDown={(e) => onHouseKey(e, house.house)}
                className="cursor-pointer outline-none focus-visible:opacity-70"
              >
                <title>{houseLabel}</title>
                <polygon
                  data-testid={`house-polygon-${house.house}`}
                  points={HOUSE_POLYGONS[idx]}
                  fill={house.isAscendant ? ascendantFill : 'none'}
                  stroke="currentColor"
                  strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                />
                {signNumber !== null && (
                  <text
                    data-testid={`house-sign-${house.house}`}
                    x={anchor.x}
                    y={anchor.y + dir * 2.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={5}
                    fill="currentColor"
                    opacity={0.7}
                  >
                    {signNumber}
                  </text>
                )}
                {house.isAscendant && (
                  <text
                    data-testid="ascendant-marker"
                    x={anchor.x}
                    y={anchor.y - 5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={3.2}
                    fontWeight={600}
                    fill="currentColor"
                    className={lang === 'hi' ? 'font-hindi' : undefined}
                  >
                    {lang === 'hi' ? 'लग्न' : 'Asc'}
                  </text>
                )}
                {shown.map((p, i) => (
                  <text
                    key={p.key}
                    data-testid={`house-${house.house}-planet-${p.key}`}
                    x={anchor.x}
                    y={anchor.y + dir * (6 + i * 4.4)}
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
                    data-testid={`house-${house.house}-overflow`}
                    x={anchor.x}
                    y={anchor.y + dir * (6 + shown.length * 4.4)}
                    textAnchor="middle"
                    dominantBaseline="middle"
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
          data-testid={`house-detail-${expanded}`}
          className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-sm"
        >
          <h4 className="mb-2 font-semibold">
            {lang === 'hi' ? 'भाव' : 'House'} {expanded}
            {viewModel.houses[expanded - 1]?.signName
              ? ` · ${label(viewModel.houses[expanded - 1].signName, lang)}`
              : ''}
          </h4>
          {(planetsByHouse.get(expanded) ?? []).length === 0 ? (
            <p className="text-muted-foreground">{empty}</p>
          ) : (
            <ul className="space-y-1">
              {(planetsByHouse.get(expanded) ?? []).map((p) => (
                <li key={p.key} data-testid={`house-detail-${expanded}-${p.key}`}>
                  {label(p.name, lang)} — {formatDegrees(p.degrees, degreePrecision) ?? unavailable}
                  {p.nakshatra ? ` · ${label(p.nakshatra.name, lang)} ${p.nakshatra.pada ?? ''}`.trim() : ''}
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
        <ul
          data-testid="chart-warnings"
          className="mt-2 list-disc pl-5 text-xs text-amber-700"
        >
          {viewModel.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NorthIndianChart;
