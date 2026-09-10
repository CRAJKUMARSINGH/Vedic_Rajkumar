/**
 * DashaTransitCorrelationPage.tsx
 *
 * Week 7: Dasha + Transit Correlation View — standalone page.
 *
 * B.V. Raman principle: "Transit results manifest only when supported by Dasha."
 *
 * Shows:
 *   - Birth form input
 *   - Active Mahadasha / Antardasha banner
 *   - Dasha–Gochar correlation score + activation level
 *   - 9 planet transit positions (sign, house from Moon, nakshatra)
 *   - 12-month monthly outlook grid
 *
 * Accessibility:
 *   - aria-live on result section
 *   - aria-busy on calculate button
 *   - Focus moves to result heading after calculation
 *   - All inputs have associated labels
 */

import React, { useState, useRef, useEffect } from 'react';
import { Activity, Sun, Moon, Star, CalendarDays, RefreshCw, Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import ChartErrorState from '@/components/ChartErrorState';
import ChartEmptyState from '@/components/ChartEmptyState';
import DashaTransitOutlook from '@/components/DashaTransitOutlook';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ValidationInProgressNotice } from '@/components/PrototypeStatusBanner';
import {
  computeCorrelation,
  type DashaTransitCorrelationResult,
  type ActivationLevel,
} from '@/services/dashaTransitCorrelationService';
import { exportDashaTransitPdf } from '@/services/dashaTransitPdfService';
import type { BirthData } from '@/features/kundli/types';
import FamilyProfileSelector from '@/components/FamilyProfileSelector';
import { getProfileById } from '@/lib/familyProfiles';
import type { FamilyProfile } from '@/lib/familyProfiles';

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_BADGE: Record<ActivationLevel, string> = {
  High:   'bg-green-600 text-white border-green-600',
  Medium: 'bg-amber-500 text-white border-amber-500',
  Low:    'bg-red-500 text-white border-red-500',
};

const LEVEL_BG: Record<ActivationLevel, string> = {
  High:   'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800',
  Medium: 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800',
  Low:    'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-900',
};

const PLANET_SYMBOL: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃',
  Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

const PLANET_HI: Record<string, string> = {
  Sun:'सूर्य', Moon:'चंद्र', Mars:'मंगल', Mercury:'बुध',
  Jupiter:'गुरु', Venus:'शुक्र', Saturn:'शनि', Rahu:'राहु', Ketu:'केतु',
};

const DEFAULT_FORM = {
  name:      'Rajkumar',
  date:      '1963-09-15',
  time:      '06:00',
  latitude:  '23.5',
  longitude: '74.32',
  timezone:  'Asia/Kolkata',
  place:     'Aspur, Rajasthan',
  targetDate: new Date().toISOString().split('T')[0],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DashaBanner({
  result,
  lang,
}: {
  result: DashaTransitCorrelationResult;
  lang: 'en' | 'hi';
}) {
  const isHi = lang === 'hi';
  const { activeDasha, moonSign, correlation } = result;

  return (
    <div
      className={`rounded-2xl border-2 p-5 space-y-4 ${LEVEL_BG[correlation.activationLevel]}`}
      aria-label={isHi ? 'वर्तमान दशा' : 'Current Dasha'}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🪐</span>
          <h3 className={`text-base font-bold text-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'वर्तमान दशा काल' : 'Active Dasha Period'}
          </h3>
        </div>
        <Badge className={LEVEL_BADGE[correlation.activationLevel]}>
          {correlation.activationLevel} — {correlation.score}/100
        </Badge>
      </div>

      {/* Maha + Antar + Pratyantar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className={`text-xs text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'महादशा' : 'Mahadasha'}
          </p>
          <p className="text-xl font-bold">
            {PLANET_SYMBOL[activeDasha.mahaLord]}{' '}
            {isHi ? (PLANET_HI[activeDasha.mahaLord] ?? activeDasha.mahaLord) : activeDasha.mahaLord}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeDasha.mahaStart} – {activeDasha.mahaEnd}
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className={`text-xs text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'अंतर्दशा' : 'Antardasha'}
          </p>
          <p className="text-xl font-bold">
            {PLANET_SYMBOL[activeDasha.antarLord]}{' '}
            {isHi ? (PLANET_HI[activeDasha.antarLord] ?? activeDasha.antarLord) : activeDasha.antarLord}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeDasha.antarStart} – {activeDasha.antarEnd}
          </p>
        </div>

        {/* Week 07 AC-1: Pratyantar Dasha tier */}
        <div className="rounded-xl bg-card border border-violet-200 dark:border-violet-800 p-3 text-center">
          <p className={`text-xs text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'प्रत्यंतर दशा' : 'Pratyantar Dasha'}
          </p>
          <p className="text-xl font-bold text-violet-700 dark:text-violet-300">
            {PLANET_SYMBOL[activeDasha.pratyanLord]}{' '}
            {isHi ? (PLANET_HI[activeDasha.pratyanLord] ?? activeDasha.pratyanLord) : activeDasha.pratyanLord}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeDasha.pratyanStart} – {activeDasha.pratyanEnd}
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className={`text-xs text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'जन्म नक्षत्र / चंद्र राशि' : 'Birth Nakshatra / Moon Sign'}
          </p>
          <p className="text-base font-bold leading-snug">
            {activeDasha.moonNakshatra}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ☽ {moonSign}
          </p>
        </div>
      </div>

      {/* Score bar */}
      <div>
        <p className={`text-xs text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'सक्रियता स्कोर' : 'Activation Score'}
        </p>
        <div
          className="w-full bg-muted rounded-full h-3"
          role="progressbar"
          aria-valuenow={correlation.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Activation score: ${correlation.score} out of 100`}
        >
          <div
            className={`h-3 rounded-full transition-all ${
              correlation.score >= 70 ? 'bg-green-500' :
              correlation.score >= 45 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${correlation.score}%` }}
          />
        </div>
      </div>

      {/* Prediction */}
      <div className="rounded-xl bg-card/70 border border-border p-3">
        <p className={`text-xs font-semibold text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? '🔮 भविष्यवाणी' : '🔮 Prediction'}
        </p>
        <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? correlation.prediction.hi : correlation.prediction.en}
        </p>
      </div>

      {/* Timing */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-3">
        <p className={`text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 ${isHi ? 'font-hindi' : ''}`}>
          ⏱ {isHi ? 'समय' : 'Timing'}
        </p>
        <p className={`text-sm text-blue-800 dark:text-blue-300 ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? correlation.timing.hi : correlation.timing.en}
        </p>
      </div>

      <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
        {isHi
          ? '📖 स्रोत: डॉ. बी.वी. रमण — हिंदू प्रेडिक्टिव एस्ट्रोलॉजी'
          : '📖 Source: Dr. B.V. Raman — Hindu Predictive Astrology'}
      </p>
    </div>
  );
}

function TransitTable({
  result,
  lang,
}: {
  result: DashaTransitCorrelationResult;
  lang: 'en' | 'hi';
}) {
  const isHi = lang === 'hi';

  return (
    <section aria-labelledby="transit-table-heading">
      <h3
        id="transit-table-heading"
        className={`text-base font-semibold text-foreground mb-3 ${isHi ? 'font-hindi' : ''}`}
      >
        {isHi ? 'गोचर ग्रह स्थिति' : 'Transit Planetary Positions'}
        <span className="text-xs font-normal text-muted-foreground ml-2">
          ({result.targetDate})
        </span>
      </h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm" aria-label={isHi ? 'गोचर ग्रह स्थिति' : 'Transit planet positions'}>
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="px-4 py-2.5 font-semibold">{isHi ? 'ग्रह' : 'Planet'}</th>
              <th className="px-4 py-2.5 font-semibold">{isHi ? 'राशि' : 'Sign'}</th>
              <th className="px-4 py-2.5 font-semibold">{isHi ? 'चंद्र से भाव' : 'House from ☽'}</th>
              <th className="px-4 py-2.5 font-semibold hidden sm:table-cell">{isHi ? 'नक्षत्र' : 'Nakshatra'}</th>
              <th className="px-4 py-2.5 font-semibold hidden md:table-cell">{isHi ? 'SAV स्कोर' : 'SAV Score'}</th>
              <th className="px-4 py-2.5 font-semibold">{isHi ? 'अनुकूल' : 'Favorable'}</th>
            </tr>
          </thead>
          <tbody>
            {result.transitPositions.map((tp) => (
              <tr
                key={tp.planet}
                className="border-t border-border/60 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-2.5 font-medium text-amber-700 dark:text-amber-400">
                  {PLANET_SYMBOL[tp.planet]}{' '}
                  {isHi ? (PLANET_HI[tp.planet] ?? tp.planet) : tp.planet}
                </td>
                <td className="px-4 py-2.5">{tp.sign}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      tp.isFavorable
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    aria-label={`House ${tp.houseFromMoon}`}
                  >
                    {tp.houseFromMoon}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">
                  {tp.nakshatra}
                </td>
                {/* Week 07 AC-3: SAV score column */}
                <td className="px-4 py-2.5 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    tp.savStrength === 'Strong'   ? 'text-green-600 dark:text-green-400' :
                    tp.savStrength === 'Moderate' ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {tp.savScore}
                    <span className="font-normal text-muted-foreground">/ {tp.savStrength}</span>
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {tp.isFavorable
                    ? <span className="text-green-600 font-bold" aria-label="favorable">✓</span>
                    : <span className="text-muted-foreground/40" aria-label="not favorable">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`text-xs text-muted-foreground mt-2 ${isHi ? 'font-hindi' : ''}`}>
        {isHi
          ? '* भाव चंद्र राशि से गिने गए हैं (जन्म चंद्र)। ✓ = Vedic अनुकूल स्थान। SAV = सार्वाष्टकवर्ग स्कोर (Strong ≥28, Weak <25)।'
          : '* Houses counted from natal Moon sign. ✓ = classically favorable. SAV = Sarvashtakavarga score (Strong ≥28, Weak <25).'}
      </p>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashaTransitCorrelationPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState<DashaTransitCorrelationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(undefined);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const isHi = lang === 'hi';

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  const handleProfileSelect = (profile: FamilyProfile) => {
    // Validate profile before using it to prevent data leakage
    const validatedProfile = getProfileById(profile.id);
    if (!validatedProfile) {
      setError('Invalid profile selected');
      return;
    }
    
    setSelectedProfileId(profile.id);
    setForm((prev) => ({
      ...prev,
      name:      validatedProfile.name,
      date:      validatedProfile.birthDate,
      time:      validatedProfile.birthTime || prev.time,
      latitude:  String(validatedProfile.birthLat || prev.latitude),
      longitude: String(validatedProfile.birthLon || prev.longitude),
      timezone:  validatedProfile.birthTimezone || prev.timezone,
      place:     validatedProfile.birthPlace || prev.place,
    }));
    setError(null);
    setResult(null);
  };

  const handleChange =
    (field: keyof typeof DEFAULT_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError(null);
    };

  const handleCalculate = async () => {
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const birthData: BirthData = {
        name:      form.name || 'Native',
        date:      form.date,
        time:      form.time || '12:00',
        timezone:  form.timezone || 'Asia/Kolkata',
        latitude:  parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        place:     form.place || 'Unknown',
      };

      if (isNaN(birthData.latitude) || isNaN(birthData.longitude)) {
        throw new Error(isHi ? 'कृपया वैध अक्षांश और देशांतर दर्ज करें' : 'Please enter valid latitude and longitude');
      }

      const res = computeCorrelation(birthData, form.targetDate);
      setResult(res);
    } catch (err) {
      setError((err as Error).message ?? 'Calculation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const handleExportPdf = async () => {
    if (!result) return;
    setIsPdfLoading(true);
    try {
      await exportDashaTransitPdf(result, { lang, nativeName: form.name || 'Native' });
    } catch (err) {
      setError((err as Error).message ?? 'PDF export failed');
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Dasha Transit Correlation — Vedic Timing Analysis"
        description="Find when your Dasha and transits align for peak activation. Combines Vimshottari Dasha with live planetary transits using the B.V. Raman correlation method."
        canonical="/dasha-transit"
      />

      {/* Page header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-violet-500" aria-hidden="true" />
            <div>
              <h1 className={`text-xl font-bold text-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'दशा–गोचर संगम' : 'Dasha + Transit Correlation'}
              </h1>
              <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi
                  ? 'रमण सिद्धांत: गोचर फल तभी मिलता है जब दशा अनुकूल हो'
                  : 'Raman principle: Transit results manifest only when Dasha supports'}
              </p>
            </div>
          </div>

          {/* Language toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border text-sm">
            {(['en', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 transition-colors ${
                  lang === l
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
                aria-pressed={lang === l}
                aria-label={l === 'en' ? 'English' : 'हिन्दी'}
              >
                {l === 'en' ? 'EN' : 'हि'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Prototype status notice */}
        <ValidationInProgressNotice />

        {/* ── Birth + Target Date Form ──────────────────────────────────── */}
        <section
          aria-labelledby="dtc-form-heading"
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2
              id="dtc-form-heading"
              className={`text-base font-semibold text-foreground flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}
            >
              <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" />
              {isHi ? 'जन्म विवरण' : 'Birth Details'}
            </h2>
            {/* Family profile quick-load */}
            <FamilyProfileSelector
              onSelect={handleProfileSelect}
              selectedId={selectedProfileId}
              triggerLabel={isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profile'}
              lang={lang}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name */}
            <div className="lg:col-span-3 flex flex-col gap-1.5">
              <Label htmlFor="dtc-name" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'नाम' : 'Name'}
              </Label>
              <input
                id="dtc-name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder={isHi ? 'पूरा नाम' : 'Full name'}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dtc-date" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'जन्म तिथि' : 'Date of Birth'}
              </Label>
              <input
                id="dtc-date"
                type="date"
                value={form.date}
                onChange={handleChange('date')}
                aria-required="true"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dtc-time" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'जन्म समय' : 'Birth Time (24h)'}
              </Label>
              <input
                id="dtc-time"
                type="time"
                value={form.time}
                onChange={handleChange('time')}
                aria-required="true"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Timezone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dtc-tz" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'टाइमज़ोन' : 'Timezone (IANA)'}
              </Label>
              <input
                id="dtc-tz"
                type="text"
                value={form.timezone}
                onChange={handleChange('timezone')}
                placeholder="Asia/Kolkata"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Latitude */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dtc-lat" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'अक्षांश' : 'Latitude'}
              </Label>
              <input
                id="dtc-lat"
                type="number"
                step="0.01"
                value={form.latitude}
                onChange={handleChange('latitude')}
                placeholder="23.5"
                aria-required="true"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Longitude */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dtc-lon" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'देशांतर' : 'Longitude'}
              </Label>
              <input
                id="dtc-lon"
                type="number"
                step="0.01"
                value={form.longitude}
                onChange={handleChange('longitude')}
                placeholder="74.32"
                aria-required="true"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Place */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dtc-place" className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'जन्म स्थान' : 'Place of Birth'}
              </Label>
              <input
                id="dtc-place"
                type="text"
                value={form.place}
                onChange={handleChange('place')}
                placeholder="e.g. Mumbai, India"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Target Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dtc-target" className={isHi ? 'font-hindi' : ''}>
                <CalendarDays className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {isHi ? 'लक्ष्य तिथि' : 'Target Date'}
              </Label>
              <input
                id="dtc-target"
                type="date"
                value={form.targetDate}
                onChange={handleChange('targetDate')}
                aria-required="true"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 justify-end flex-wrap">
            {result && (
              <>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  {isHi ? 'रीसेट' : 'Reset'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handleExportPdf()}
                  disabled={isPdfLoading}
                  aria-busy={isPdfLoading}
                  aria-label={isPdfLoading ? 'Generating PDF…' : (isHi ? 'PDF निर्यात करें' : 'Export PDF')}
                  className="gap-2"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  {isPdfLoading ? (isHi ? 'PDF बन रहा है…' : 'Generating…') : (isHi ? 'PDF निर्यात' : 'Export PDF')}
                </Button>
              </>
            )}
            <Button
              onClick={() => void handleCalculate()}
              disabled={isLoading}
              aria-busy={isLoading}
              aria-label={isLoading
                ? (isHi ? 'गणना हो रही है…' : 'Calculating, please wait')
                : (isHi ? 'दशा–गोचर की गणना करें' : 'Calculate Dasha–Transit correlation')}
              className="gap-2 bg-violet-600 hover:bg-violet-500 text-white"
            >
              <Activity className="h-4 w-4" aria-hidden="true" />
              {isLoading
                ? (isHi ? 'गणना हो रही है…' : 'Calculating…')
                : (isHi ? 'संगम की गणना करें' : 'Calculate Correlation')}
            </Button>
          </div>
        </section>

        {/* ── Result area ───────────────────────────────────────────────── */}
        <div aria-live="polite" aria-atomic="false">

          {/* Loading */}
          {isLoading && (
            <div className="space-y-4">
              <LoadingSkeleton variant="card" rows={4} />
              <LoadingSkeleton variant="table" rows={9} />
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <ChartErrorState
              message={error}
              onRetry={() => void handleCalculate()}
            />
          )}

          {/* Empty state */}
          {!isLoading && !error && !result && (
            <ChartEmptyState
              icon={<Moon className="h-8 w-8" />}
              title={isHi ? 'जन्म विवरण भरें' : 'Enter birth details'}
              description={
                isHi
                  ? 'ऊपर जन्म विवरण और लक्ष्य तिथि दर्ज करें, फिर "संगम की गणना करें" पर क्लिक करें।'
                  : 'Fill in birth details and a target date above, then click Calculate Correlation.'
              }
            />
          )}

          {/* Result */}
          {!isLoading && result && (
            <ErrorBoundary
              fallback={
                <ChartErrorState
                  message="Failed to render correlation result."
                  onRetry={handleReset}
                />
              }
            >
              <div className="space-y-6">
                {/* Result heading — receives focus */}
                <h2
                  ref={resultRef}
                  tabIndex={-1}
                  className={`text-lg font-bold text-foreground flex items-center gap-2 outline-none ${isHi ? 'font-hindi' : ''}`}
                >
                  <Star className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  {isHi ? `${form.name} — दशा–गोचर विश्लेषण` : `${form.name} — Dasha–Transit Analysis`}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    {result.targetDate}
                  </span>
                </h2>

                {/* Active dasha banner */}
                <DashaBanner result={result} lang={lang} />

                {/* Week 07 AC-2: Chandrashtama warning */}
                {result.isChandrashtama && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-2xl border-2 border-red-400 bg-red-50 dark:bg-red-950/30 dark:border-red-700 p-4 flex gap-3 items-start"
                  >
                    <span className="text-2xl flex-shrink-0" aria-hidden="true">⚠️</span>
                    <div>
                      <p className={`font-bold text-red-800 dark:text-red-300 text-sm mb-1 ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? 'चंद्राष्टम — Moon in 8th House' : 'Chandrashtama — Moon in 8th from Natal Moon'}
                      </p>
                      <p className={`text-xs text-red-700 dark:text-red-300 ${isHi ? 'font-hindi' : ''}`}>
                        {isHi
                          ? 'आज चंद्रमा आपकी जन्म राशि से 8वें भाव में है (चंद्राष्टम)। इस काल में महत्वपूर्ण निर्णय, नई शुरुआत, यात्रा, और वित्तीय लेन-देन से बचें। शारीरिक व मानसिक तनाव संभव। आराम और ध्यान को प्राथमिकता दें।'
                          : 'Transiting Moon is in the 8th house from your natal Moon (Chandrashtama). Avoid important decisions, new ventures, travel, and financial transactions. Increased physical and mental stress is possible. Prioritize rest and spiritual practice.'}
                      </p>
                      <p className={`text-xs text-red-600 dark:text-red-400 mt-1 italic ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? '📖 स्रोत: BPHS, B.V. Raman — Hindu Predictive Astrology' : '📖 Source: BPHS, B.V. Raman — Hindu Predictive Astrology'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Week 07 AC-3: Ashtakavarga overall summary */}
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 p-4">
                  <h3 className={`text-sm font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-3 ${isHi ? 'font-hindi' : ''}`}>
                    <span aria-hidden="true">📊</span>
                    {isHi ? 'अष्टकवर्ग गोचर शक्ति' : 'Ashtakavarga Transit Strength'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="rounded-xl bg-card border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {isHi ? 'समग्र शक्ति' : 'Overall'}
                      </p>
                      <p className={`text-base font-bold ${
                        result.ashtakavargaSummary.overallStrength === 'Strong'   ? 'text-green-600' :
                        result.ashtakavargaSummary.overallStrength === 'Moderate' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {result.ashtakavargaSummary.overallStrength}
                      </p>
                    </div>
                    <div className="rounded-xl bg-card border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {isHi ? 'औसत SAV' : 'Avg SAV'}
                      </p>
                      <p className="text-base font-bold">
                        {result.ashtakavargaSummary.averageScore.toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-card border border-green-200 bg-green-50/50 dark:bg-green-950/20 p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {isHi ? 'अनुकूल ग्रह' : 'Favorable'}
                      </p>
                      <p className="text-base font-bold text-green-600">
                        {result.ashtakavargaSummary.favorableTransits}
                      </p>
                    </div>
                    <div className="rounded-xl bg-card border border-red-200 bg-red-50/50 dark:bg-red-950/20 p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {isHi ? 'प्रतिकूल ग्रह' : 'Unfavorable'}
                      </p>
                      <p className="text-base font-bold text-red-600">
                        {result.ashtakavargaSummary.unfavorableTransits}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transit table */}
                <TransitTable result={result} lang={lang} />

                {/* 12-month outlook */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <DashaTransitOutlook
                    outlook={result.monthlyOutlook}
                    lang={lang}
                  />
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {isHi
                    ? 'इंजन: Meeus परिशुद्धता श्रृंखला · लाहिरी अयनांश · संपूर्ण राशि भाव · सार्वाष्टकवर्ग'
                    : 'Engine: Meeus precision series · Lahiri ayanamsa · Whole-sign houses · Sarvashtakavarga'}
                </p>
              </div>
            </ErrorBoundary>
          )}
        </div>
      </main>
    </div>
  );
}
