/**
 * DashaTimeline.tsx — elegant Vimshottari dasha visualisation (c4 Phase 5).
 *
 * Uses the canonical dasha engine output (`DashaResult` from `dashaService`)
 * only — dates are the calculated dates for the chart, never transcribed from
 * any reference image. Mahadasha → Antardasha → Pratyantardasha are expandable;
 * a flattened, printable table carries the same hierarchy for print and for
 * screen readers.
 */

import { useMemo, useState } from 'react';
import { VerificationBadge } from '@/components/VerificationBadge';
import { planetName, type Lang } from '@/features/charts/model/labels';
import type { DashaResult } from '@/services/dashaService';
import { cn } from '@/lib/utils';

export interface DashaTimelineProps {
  dasha: DashaResult | null;
  lang?: Lang;
  className?: string;
  initialExpanded?: number | null;
}

const MS_TOLERANCE = 1000;

/** Local, timezone-stable date formatter (avoids UTC day-shift). */
function fmtDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fmtYears(years: number): string {
  return `${years.toFixed(1)} y`;
}

function fmtDays(days: number): string {
  return `${Math.round(days)} d`;
}

/**
 * Chronological validation: every period must be well-ordered and each level
 * must tile its parent contiguously. Returns human-readable issues (empty = OK).
 */
export function validateDashaChronology(dasha: DashaResult | null): string[] {
  const issues: string[] = [];
  if (!dasha) {
    issues.push('Dasha data unavailable.');
    return issues;
  }

  let prevMahaEnd: number | null = null;
  dasha.mahadashas.forEach((md) => {
    if (md.startDate.getTime() >= md.endDate.getTime()) {
      issues.push(`Mahadasha ${md.planet}: start is not before end.`);
    }
    if (prevMahaEnd !== null && md.startDate.getTime() < prevMahaEnd - MS_TOLERANCE) {
      issues.push(`Mahadasha ${md.planet}: starts before the previous Mahadasha ends.`);
    }
    prevMahaEnd = md.endDate.getTime();

    let prevAntarEnd: number | null = null;
    md.antardashas.forEach((ad) => {
      if (ad.startDate.getTime() >= ad.endDate.getTime()) {
        issues.push(`Antardasha ${md.planet}/${ad.planet}: start is not before end.`);
      }
      if (prevAntarEnd !== null && ad.startDate.getTime() < prevAntarEnd - MS_TOLERANCE) {
        issues.push(`Antardasha ${md.planet}/${ad.planet}: overlaps the previous Antardasha.`);
      }
      prevAntarEnd = ad.endDate.getTime();
    });

    if (
      md.antardashas.length > 0 &&
      Math.abs(md.antardashas[0].startDate.getTime() - md.startDate.getTime()) > MS_TOLERANCE
    ) {
      issues.push(`Antardashas of ${md.planet} do not begin with the Mahadasha.`);
    }
  });

  return issues;
}

export function DashaTimeline({
  dasha,
  lang = 'en',
  className,
  initialExpanded = null,
}: DashaTimelineProps) {
  const [expandedMaha, setExpandedMaha] = useState<number | null>(initialExpanded);
  const [expandedAntar, setExpandedAntar] = useState<string | null>(null);

  const issues = useMemo(() => validateDashaChronology(dasha), [dasha]);

  if (!dasha) {
    return (
      <div
        data-testid="dasha-timeline-empty"
        className={cn('rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground', className)}
      >
        {lang === 'hi' ? 'दशा गणना उपलब्ध नहीं है।' : 'Dasha calculation is unavailable.'}
      </div>
    );
  }

  const currentLabel = lang === 'hi' ? 'वर्तमान' : 'Current';

  return (
    <section data-testid="dasha-timeline" className={cn('w-full', className)}>
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">
          {lang === 'hi' ? 'विंशोत्तरी दशा' : 'Vimshottari Dasha'}
        </h3>
        <VerificationBadge topic="dasha" lang={lang} />
      </header>

      <p className="mb-3 text-xs text-muted-foreground">
        {lang === 'hi'
          ? `जन्म नक्षत्र: ${dasha.moonNakshatraName} · प्रारंभिक शेष: ${dasha.balanceYears.toFixed(1)} वर्ष`
          : `Birth Nakshatra: ${dasha.moonNakshatraName} · Balance at birth: ${dasha.balanceYears.toFixed(1)} y`}
      </p>

      {issues.length > 0 && (
        <ul data-testid="dasha-warnings" className="mb-3 list-disc pl-5 text-xs text-amber-700">
          {issues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      )}

      <ol className="space-y-1">
        {dasha.mahadashas.map((md, i) => {
          const isOpen = expandedMaha === i;
          return (
            <li
              key={`${md.planet}-${i}`}
              data-testid={`maha-${i}`}
              data-active={md.isActive ? 'true' : 'false'}
              className={cn(
                'rounded-md border',
                md.isActive ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <button
                type="button"
                data-testid={`maha-toggle-${i}`}
                aria-expanded={isOpen}
                onClick={() => setExpandedMaha(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm"
              >
                <span className="font-medium">
                  {planetName(md.planet, lang)}
                  {md.isActive && (
                    <span
                      data-testid={`maha-current-${i}`}
                      className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold"
                    >
                      {currentLabel}
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {fmtDate(md.startDate)} → {fmtDate(md.endDate)} · {fmtYears(md.durationYears)}
                </span>
              </button>

              {isOpen && (
                <ul data-testid={`antar-list-${i}`} className="border-t border-border/60 pl-3">
                  {md.antardashas.map((ad, j) => {
                    const antarKey = `${i}-${j}`;
                    const antarOpen = expandedAntar === antarKey;
                    const pd = ad.pratyantardashas ?? [];
                    return (
                      <li
                        key={antarKey}
                        data-testid={`antar-${i}-${j}`}
                        data-active={ad.isActive ? 'true' : 'false'}
                        className={cn(
                          'border-b border-border/40 last:border-b-0',
                          ad.isActive ? 'bg-primary/5' : '',
                        )}
                      >
                        <button
                          type="button"
                          data-testid={`antar-toggle-${i}-${j}`}
                          aria-expanded={antarOpen}
                          disabled={pd.length === 0}
                          onClick={() =>
                            setExpandedAntar(antarOpen ? null : antarKey)
                          }
                          className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs disabled:cursor-default"
                        >
                          <span>
                            {planetName(ad.planet, lang)}
                            {ad.isActive && (
                              <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px]">
                                {currentLabel}
                              </span>
                            )}
                          </span>
                          <span className="text-muted-foreground">
                            {fmtDate(ad.startDate)} → {fmtDate(ad.endDate)} · {fmtDays(ad.durationDays)}
                          </span>
                        </button>

                        {antarOpen && pd.length > 0 && (
                          <ul data-testid={`pd-list-${i}-${j}`} className="pl-4 pb-1">
                            {pd.map((pdItem, k) => (
                              <li
                                key={k}
                                data-testid={`pd-${i}-${j}-${k}`}
                                data-active={pdItem.isActive ? 'true' : 'false'}
                                className={cn(
                                  'flex items-center justify-between gap-2 px-3 py-1 text-[11px]',
                                  pdItem.isActive ? 'font-semibold text-primary' : 'text-muted-foreground',
                                )}
                              >
                                <span>{planetName(pdItem.planet, lang)}</span>
                                <span>
                                  {fmtDate(pdItem.startDate)} → {fmtDate(pdItem.endDate)} · {fmtDays(pdItem.durationDays)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      {/* Printable + screen-reader flattened table */}
      <table data-testid="dasha-table" className="mt-4 w-full border-collapse text-xs">
        <caption className="sr-only">
          {lang === 'hi' ? 'विंशोत्तरी दशा तालिका' : 'Vimshottari dasha table'}
        </caption>
        <thead>
          <tr className="text-left">
            <th scope="col">{lang === 'hi' ? 'स्तर' : 'Level'}</th>
            <th scope="col">{lang === 'hi' ? 'ग्रह' : 'Planet'}</th>
            <th scope="col">{lang === 'hi' ? 'प्रारंभ' : 'Start'}</th>
            <th scope="col">{lang === 'hi' ? 'समाप्ति' : 'End'}</th>
            <th scope="col">{lang === 'hi' ? 'अवधि' : 'Duration'}</th>
          </tr>
        </thead>
        <tbody>
          {dasha.mahadashas.flatMap((md, i) => [
            <tr key={`md-${i}`} data-testid={`table-md-${i}`}>
              <td>{lang === 'hi' ? 'महादशा' : 'Mahadasha'}</td>
              <td>{planetName(md.planet, lang)}</td>
              <td>{fmtDate(md.startDate)}</td>
              <td>{fmtDate(md.endDate)}</td>
              <td>{fmtYears(md.durationYears)}</td>
            </tr>,
            ...md.antardashas.flatMap((ad, j) => [
              <tr key={`ad-${i}-${j}`} data-testid={`table-ad-${i}-${j}`}>
                <td>{lang === 'hi' ? 'अंतर्दशा' : 'Antardasha'}</td>
                <td>{planetName(ad.planet, lang)}</td>
                <td>{fmtDate(ad.startDate)}</td>
                <td>{fmtDate(ad.endDate)}</td>
                <td>{fmtDays(ad.durationDays)}</td>
              </tr>,
              ...(ad.pratyantardashas ?? []).map((pdItem, k) => (
                <tr key={`pd-${i}-${j}-${k}`} data-testid={`table-pd-${i}-${j}-${k}`}>
                  <td>{lang === 'hi' ? 'प्रत्यंतर्दशा' : 'Pratyantardasha'}</td>
                  <td>{planetName(pdItem.planet, lang)}</td>
                  <td>{fmtDate(pdItem.startDate)}</td>
                  <td>{fmtDate(pdItem.endDate)}</td>
                  <td>{fmtDays(pdItem.durationDays)}</td>
                </tr>
              )),
            ]),
          ])}
        </tbody>
      </table>
    </section>
  );
}

export default DashaTimeline;
