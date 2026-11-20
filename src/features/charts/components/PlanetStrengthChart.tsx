/**
 * PlanetStrengthChart.tsx — planetary strength dashboard (c4 Phase 6).
 *
 * Canonical metric: **Shadbala** (six-fold strength) from `shadbalaService`,
 * expressed in **Rupas** (1 Rupa = 60 Shashtiamsas). A single metric at a single
 * scale is shown — no Ishṭa/Kashta or Ashtakavarga figures are mixed in.
 *
 * Each row shows the calculated value, its unit, the planet's required
 * threshold, the ratio, the canonical strength band and the source calculation.
 * Encoding is never colour-only: every bar also carries a text label and an
 * accessible description.
 */

import { VerificationBadge } from '@/components/VerificationBadge';
import { planetName, type Lang } from '../model/labels';
import type { ShadabalaAnalysis } from '@/services/shadabalaService';
import { cn } from '@/lib/utils';

export interface PlanetStrengthChartProps {
  shadbala: ShadabalaAnalysis | null;
  lang?: Lang;
  className?: string;
}

const UNIT = 'Rupas';
const SOURCE = 'shadbalaService — BPHS Ch. 27 (six-fold strength)';

export function PlanetStrengthChart({
  shadbala,
  lang = 'en',
  className,
}: PlanetStrengthChartProps) {
  if (!shadbala || shadbala.planets.length === 0) {
    return (
      <div
        data-testid="planet-strength-empty"
        className={cn('rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground', className)}
      >
        {lang === 'hi'
          ? 'षड्बल गणना उपलब्ध नहीं है।'
          : 'Planetary strength (Shadbala) is unavailable.'}
      </div>
    );
  }

  // Strongest first — deterministic, and matches the service's own sort intent.
  const rows = [...shadbala.planets].sort((a, b) => b.shadabalaRatio - a.shadabalaRatio);

  return (
    <section data-testid="planet-strength-chart" className={cn('w-full', className)}>
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">
          {lang === 'hi' ? 'ग्रह बल (षड्बल)' : 'Planetary Strength (Shadbala)'}
        </h3>
        <span data-testid="strength-unit" className="rounded bg-muted px-2 py-0.5 text-xs">
          {lang === 'hi' ? 'इकाई: रूप' : `Unit: ${UNIT}`}
        </span>
        <VerificationBadge topic="shadbala" lang={lang} />
      </header>

      <p className="mb-3 text-xs text-muted-foreground">
        {lang === 'hi'
          ? 'प्रत्येक ग्रह की कुल षड्बल, रूप में। 1 रूप = 60 षष्ट्यंश। आवश्यक रूप पूरा होना = बलवान।'
          : 'Total Shadbala per graha in Rupas. 1 Rupa = 60 Shashtiamsas. Meeting the required Rupas = strong.'}
      </p>

      <ul data-testid="strength-bars" className="space-y-2">
        {rows.map((r) => {
          // Scale 0 → 2.0 ratio spans the full bar; 1.0 (threshold) sits at 50%.
          const pct = Math.max(0, Math.min(100, (r.shadabalaRatio / 2) * 100));
          const strengthText = lang === 'hi' ? r.label.hi : r.label.en;
          const description =
            `${planetName(r.planet, lang)}: ${r.totalRupas.toFixed(2)} ${UNIT}, ` +
            `${lang === 'hi' ? 'अनुपात' : 'ratio'} ${r.shadabalaRatio.toFixed(2)}, ${strengthText}`;

          return (
            <li key={r.planet} data-testid={`strength-bar-${r.planet}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{planetName(r.planet, lang)}</span>
                <span>
                  {r.totalRupas.toFixed(2)} {UNIT} · {r.shadabalaRatio.toFixed(2)}× · {strengthText}
                </span>
              </div>
              <div
                role="img"
                aria-label={description}
                data-strength={r.strength}
                data-testid={`strength-bar-track-${r.planet}`}
                className="relative mt-1 h-3 w-full overflow-hidden rounded bg-muted"
              >
                <div
                  data-testid={`strength-bar-fill-${r.planet}`}
                  className="h-full rounded bg-amber-600/70"
                  style={{ width: `${pct.toFixed(1)}%` }}
                />
                {/* Required-Rupas threshold marker at ratio = 1.0 */}
                <div
                  data-testid={`strength-threshold-${r.planet}`}
                  className="absolute top-0 h-full border-l border-dashed border-foreground/60"
                  style={{ left: '50%' }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <table data-testid="strength-table" className="mt-4 w-full border-collapse text-xs">
        <caption className="sr-only">
          {lang === 'hi' ? 'षड्बल तालिका (रूप में)' : 'Shadbala table (in Rupas)'}
        </caption>
        <thead>
          <tr className="text-left">
            <th scope="col">{lang === 'hi' ? 'ग्रह' : 'Planet'}</th>
            <th scope="col">{lang === 'hi' ? `षड्बल (${UNIT})` : `Shadbala (${UNIT})`}</th>
            <th scope="col">{lang === 'hi' ? `आवश्यक (${UNIT})` : `Required (${UNIT})`}</th>
            <th scope="col">{lang === 'hi' ? 'अनुपात' : 'Ratio'}</th>
            <th scope="col">{lang === 'hi' ? 'बल' : 'Strength'}</th>
            <th scope="col">{lang === 'hi' ? 'स्रोत' : 'Source'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.planet} data-testid={`strength-row-${r.planet}`}>
              <td>{planetName(r.planet, lang)}</td>
              <td data-testid={`strength-value-${r.planet}`}>{r.totalRupas.toFixed(2)}</td>
              <td>{r.requiredRupas.toFixed(2)}</td>
              <td>{r.shadabalaRatio.toFixed(2)}</td>
              <td>{lang === 'hi' ? r.label.hi : r.label.en}</td>
              <td>{SOURCE}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default PlanetStrengthChart;
