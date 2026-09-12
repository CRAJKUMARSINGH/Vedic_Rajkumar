/**
 * BirthChartPage.tsx
 *
 * Week 5: Full polish rewrite.
 *
 * Changes from legacy version:
 *  - Removed @ts-nocheck — fully typed
 *  - ChartResult typed state (no more useState<any>)
 *  - ChartEmptyState before first submission
 *  - ChartLoadingState (LoadingSkeleton) during compute
 *  - ChartErrorState (Alert) for calculation failures
 *  - Every input has an associated <label htmlFor> + id
 *  - aria-live="polite" on result container
 *  - aria-busy on submit button during loading
 *  - Responsive grid: grid-cols-1 sm:grid-cols-2
 *  - Background uses bg-background (design tokens)
 *  - Structured result display replacing raw JSON.stringify
 *  - Uses real kundli engine (not stubs)
 */

import React, { useState, useRef, useEffect } from 'react';
import { SunDim, Star, Share2, MessageSquareQuote } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import ChartErrorState from '@/components/ChartErrorState';
import ChartEmptyState from '@/components/ChartEmptyState';
import ErrorBoundary from '@/components/ErrorBoundary';
import { calculateChart } from '@/features/kundli/engine';
import type { ChartResult } from '@/features/kundli/types';
import { ValidationInProgressNotice } from '@/components/PrototypeStatusBanner';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import FamilyProfileSelector from '@/components/FamilyProfileSelector';
import { getProfileById } from '@/lib/familyProfiles';
import type { FamilyProfile } from '@/lib/familyProfiles';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BirthFormValues {
  name: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  latitude: string;
  longitude: string;
  timezone: string;
  place: string;
}

const DEFAULT_FORM: BirthFormValues = {
  name:      'Sample Native',
  date:      '1999-10-08',
  time:      '07:43',
  latitude:  '24.58',
  longitude: '73.68',
  timezone:  'Asia/Kolkata',
  place:     'Udaipur, Rajasthan',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanetTable({ result, isHi }: { result: ChartResult; isHi: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm" aria-label="Planetary positions">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className={`px-4 py-2 font-semibold text-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'ग्रह' : 'Planet'}
            </th>
            <th className={`px-4 py-2 font-semibold text-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'राशि' : 'Sign'}
            </th>
            <th className={`px-4 py-2 font-semibold text-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'भाव' : 'House'}
            </th>
            <th className={`px-4 py-2 font-semibold text-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'नक्षत्र' : 'Nakshatra'}
            </th>
            <th className={`px-4 py-2 font-semibold text-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'पद' : 'Pada'}
            </th>
            <th className={`px-4 py-2 font-semibold text-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'वक्री' : 'Retro'}
            </th>
          </tr>
        </thead>
        <tbody>
          {result.planets.map((p) => (
            <tr key={p.planet} className="border-t border-border/60 hover:bg-muted/20 transition-colors">
              <td className="px-4 py-2 font-medium text-amber-700 dark:text-amber-400">{p.planet}</td>
              <td className="px-4 py-2 text-foreground">{p.sign}</td>
              <td className="px-4 py-2 text-foreground">{p.house}</td>
              <td className="px-4 py-2 text-muted-foreground">{p.nakshatra}</td>
              <td className="px-4 py-2 text-muted-foreground">{p.pada}</td>
              <td className="px-4 py-2">
                {p.isRetrograde
                  ? <span className="text-xs text-orange-500 font-medium">R</span>
                  : <span className="text-xs text-muted-foreground/50">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartSummaryBar({ result }: { result: ChartResult }) {
  const lagna = result.planets.find((p) => p.planet === 'Ascendant');
  const moon  = result.planets.find((p) => p.planet === 'Moon');
  const sun   = result.planets.find((p) => p.planet === 'Sun');

  return (
    <div className="grid grid-cols-3 gap-3 text-center" aria-label="Chart summary">
      {[
        { label: 'Lagna', value: lagna?.sign ?? '—' },
        { label: 'Moon Sign', value: moon?.sign ?? '—' },
        { label: 'Sun Sign', value: sun?.sign ?? '—' },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="rounded-xl border border-amber-200/40 bg-amber-50/60 dark:bg-amber-900/20 p-3"
        >
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <p className="text-base font-bold text-amber-700 dark:text-amber-400">{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BirthChartPage() {
  const [form, setForm] = useState<BirthFormValues>(DEFAULT_FORM);
  const [result, setResult] = useState<ChartResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [copied, setCopied] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>();
  const resultRef = useRef<HTMLDivElement>(null);

  const isHi = lang === 'hi';

  // Handle profile selection
  const handleProfileSelect = (profile: FamilyProfile) => {
    // Validate profile before using it to prevent data leakage
    const validatedProfile = getProfileById(profile.id);
    if (!validatedProfile) {
      setError('Invalid profile selected');
      return;
    }
    
    setSelectedProfileId(profile.id);
    setForm({
      name: validatedProfile.name,
      date: validatedProfile.birthDate,
      time: validatedProfile.birthTime,
      latitude: validatedProfile.birthLat.toString(),
      longitude: validatedProfile.birthLon.toString(),
      timezone: validatedProfile.birthTimezone,
      place: validatedProfile.birthPlace,
    });
  };

  // Move focus to results when they arrive
  useEffect(() => {
    if (result) {
      resultRef.current?.focus();
    }
  }, [result]);

  const handleChange =
    (field: keyof BirthFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCompute = async () => {
    setError(null);
    setResult(null);
    setIsLoading(true);
    // Yield via a microtask so React can flush the loading state to the DOM
    // before the synchronous calculateChart() call. This keeps the loading
    // state observable for tests and for actual renders on slower devices.
    await Promise.resolve();
    try {
      const res = calculateChart({
        name:      form.name || 'Native',
        date:      form.date,
        time:      form.time,
        timezone:  form.timezone || 'Asia/Kolkata',
        latitude:  parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        place:     form.place || 'Unknown',
      });
      setResult(res);
    } catch (err) {
      setError((err as Error).message ?? 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    void handleCompute();
  };

  const handleCopySummary = async () => {
    if (!result) return;
    const lagna = result.planets.find((p) => p.planet === 'Ascendant')?.sign ?? '—';
    const moon  = result.planets.find((p) => p.planet === 'Moon')?.sign ?? '—';
    const sun   = result.planets.find((p) => p.planet === 'Sun')?.sign ?? '—';
    const summary =
      `Birth Chart for ${result.birthData.name}\n` +
      `Lagna: ${lagna}\n` +
      `Moon: ${moon}\n` +
      `Sun: ${sun}\n` +
      `Ayanamsa: ${result.ayanamsaValue.toFixed(3)}°\n` +
      `Generated by Vedic Rajkumar.`;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Birth Chart Insights"
        description="Compute a detailed Vedic birth chart using the Lahiri ayanamsa and precision ephemeris engine."
        canonical="/birth-chart"
      />

      <div className="container max-w-3xl mx-auto px-4 py-10">
        {/* Page heading */}
        <header className="mb-8">
          <div className="flex items-start sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <SunDim className="h-7 w-7 text-amber-500" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-foreground">Birth Chart</h1>
            </div>
            <div className="flex items-center gap-3">
              <FamilyProfileSelector
                onSelect={handleProfileSelect}
                selectedId={selectedProfileId}
                triggerLabel={isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profile'}
                lang={lang}
              />
              <EnhancedLanguageToggle
                currentLang={lang}
                onChange={setLang}
                showRegion={false}
                autoDetect={false}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Sidereal Vedic chart — Lahiri ayanamsa — Whole-sign houses
          </p>
        </header>

        <div className="mb-6">
          <ValidationInProgressNotice isHi={isHi} compact={true} />
        </div>

        {/* Input form */}
        <section
          aria-labelledby="form-heading"
          className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-6"
        >
          <h2 id="form-heading" className="text-base font-semibold text-foreground mb-5">
            Birth Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="bc-name" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'नाम' : 'Name'}
              </Label>
              <input
                id="bc-name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Full name"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bc-date" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'जन्म तिथि' : 'Date of Birth'}
              </Label>
              <input
                id="bc-date"
                type="date"
                value={form.date}
                onChange={handleChange('date')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-required="true"
                aria-describedby="bc-date-help"
              />
              <p
                id="bc-date-help"
                className={cn(
                  'text-[11px] text-muted-foreground mt-0.5',
                  isHi && 'font-hindi text-[12px]',
                )}
              >
                {isHi ? 'यू.सी. प्रारूप YYYY-MM-DD' : 'ISO format YYYY-MM-DD'}
              </p>
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bc-time" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'जन्म समय (24 घंटे)' : 'Time of Birth (24h)'}
              </Label>
              <input
                id="bc-time"
                type="time"
                value={form.time}
                onChange={handleChange('time')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-required="true"
                aria-describedby="bc-time-help"
              />
              <p
                id="bc-time-help"
                className={cn(
                  'text-[11px] text-muted-foreground mt-0.5',
                  isHi && 'font-hindi text-[12px]',
                )}
              >
                {isHi
                  ? 'जन्म प्रमाण-पत्र पर छपा सटीक समय प्रयोग करें'
                  : 'Use the exact clock time shown on the birth certificate'}
              </p>
            </div>

            {/* Latitude */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bc-lat" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'अक्षांश (दशमलव)' : 'Latitude (decimal)'}
              </Label>
              <input
                id="bc-lat"
                type="number"
                step="0.01"
                value={form.latitude}
                onChange={handleChange('latitude')}
                placeholder="e.g. 24.58"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-required="true"
                aria-describedby="bc-lat-help"
              />
              <p
                id="bc-lat-help"
                className={cn(
                  'text-[11px] text-muted-foreground mt-0.5',
                  isHi && 'font-hindi text-[12px]',
                )}
              >
                {isHi
                  ? 'उत्तरी गोलार्ध = धनात्मक (+), दक्षिणी = ऋणात्मक (−)'
                  : 'Northern hemisphere = positive (+), Southern = negative (−)'}
              </p>
            </div>

            {/* Longitude */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bc-lon" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'रेखांश (दशमलव)' : 'Longitude (decimal)'}
              </Label>
              <input
                id="bc-lon"
                type="number"
                step="0.01"
                value={form.longitude}
                onChange={handleChange('longitude')}
                placeholder="e.g. 73.68"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-required="true"
                aria-describedby="bc-lon-help"
              />
              <p
                id="bc-lon-help"
                className={cn(
                  'text-[11px] text-muted-foreground mt-0.5',
                  isHi && 'font-hindi text-[12px]',
                )}
              >
                {isHi
                  ? 'पूर्वी गोलार्ध = धनात्मक (+), पश्चिमी = ऋणात्मक (−)'
                  : 'Eastern hemisphere = positive (+), Western = negative (−)'}
              </p>
            </div>

            {/* Timezone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bc-tz" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'IANA समय क्षेत्र' : 'IANA Timezone'}
              </Label>
              <input
                id="bc-tz"
                type="text"
                value={form.timezone}
                onChange={handleChange('timezone')}
                placeholder="e.g. Asia/Kolkata"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-describedby="bc-tz-help"
              />
              <p
                id="bc-tz-help"
                className={cn(
                  'text-[11px] text-muted-foreground mt-0.5',
                  isHi && 'font-hindi text-[12px]',
                )}
              >
                {isHi
                  ? 'उदा. Asia/Kolkata · America/New_York · Europe/London'
                  : 'Examples: Asia/Kolkata · America/New_York · Europe/London'}
              </p>
            </div>

            {/* Place */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bc-place" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'जन्म स्थान' : 'Place of Birth'}
              </Label>
              <input
                id="bc-place"
                type="text"
                value={form.place}
                onChange={handleChange('place')}
                placeholder="e.g. Udaipur, Rajasthan"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-describedby="bc-place-help"
              />
              <p
                id="bc-place-help"
                className={cn(
                  'text-[11px] text-muted-foreground mt-0.5',
                  isHi && 'font-hindi text-[12px]',
                )}
              >
                {isHi
                  ? 'शहर, राज्य — केवल आपकी सुविधा के लिए'
                  : 'City, State/Region — displayed for your reference only'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => void handleCompute()}
              disabled={isLoading}
              aria-busy={isLoading}
              aria-label={isLoading ? 'Calculating chart, please wait' : 'Calculate birth chart'}
              className="gap-2"
            >
              {isLoading
                ? 'Calculating…'
                : 'Calculate Chart'}
            </Button>
          </div>
        </section>

        {/* Result area — screen readers notified on change */}
        <div
          aria-live="polite"
          aria-atomic="true"
          ref={resultRef}
          tabIndex={-1}
          className="outline-none"
        >
          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-3 gap-3" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-[80px] animate-pulse rounded-xl border border-border bg-card"
                  />
                ))}
              </div>
              <LoadingSkeleton variant="table" rows={10} />
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <ChartErrorState
              message={error}
              onRetry={handleRetry}
              className="mb-4"
            />
          )}

          {/* Empty state — before first submission */}
          {!isLoading && !error && !result && (
            <ChartEmptyState
              icon={<Star className="h-8 w-8" />}
              title="Ready to calculate"
              description="Enter birth details above and click Calculate Chart to generate the sidereal Vedic chart."
            />
          )}

          {/* Result — structured display */}
          {!isLoading && result && (
            <ErrorBoundary
              fallback={
                <ChartErrorState
                  message="Failed to display the chart result."
                  onRetry={() => setResult(null)}
                />
              }
            >
              <section
                aria-labelledby="result-heading"
                className="space-y-5"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  <h2 id="result-heading" className="text-lg font-bold text-foreground">
                    Chart for {result.birthData.name}
                  </h2>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Ayanamsa: {result.ayanamsaValue.toFixed(3)}°
                  </span>
                </div>

                <ChartSummaryBar result={result} />

                <PlanetTable result={result} isHi={isHi} />

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                  >
                    <MessageSquareQuote className="w-4 h-4 mr-2" />
                    {isHi ? 'प्रिंट / सेव' : 'Print / Save'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleCopySummary()}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {copied
                      ? (isHi ? 'कॉपी हुआ' : 'Copied')
                      : (isHi ? 'कॉपी / शेयर' : 'Copy / Share')}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Engine: Meeus precision series · House system: {result.houseSystem}
                </p>
              </section>
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}
