/**
 * DashaTransitTimelineView.tsx
 *
 * Week 08: Dasha + Transit Timeline View
 *
 * A clean, readable timeline that presents:
 *   - Current Mahadasha and Antardasha periods
 *   - Major transit windows for key planets
 *   - Monthly outlook with activation levels
 *   - Key astrological events and timings
 *
 * Features:
 *   - Integrates with existing dashaTransitCorrelationService
 *   - Mobile-optimized responsive design
 *   - Clear visual hierarchy without information overload
 *   - Supports both English and Hindi
 *   - Uses existing calculation services for accuracy
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, TrendingUp, AlertCircle, Info, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import ChartErrorState from '@/components/ChartErrorState';
import ChartEmptyState from '@/components/ChartEmptyState';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { ValidationInProgressNotice } from '@/components/PrototypeStatusBanner';
import FamilyProfileSelector from '@/components/FamilyProfileSelector';
import { getProfileById } from '@/lib/familyProfiles';
import type { FamilyProfile } from '@/lib/familyProfiles';
import { cn } from '@/lib/utils';
import { computeCorrelation } from '@/services/dashaTransitCorrelationService';
import type { BirthData } from '@/features/kundli/types';
import { calculateChart } from '@/features/kundli/engine';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
  Rahu: '☊', Ketu: '☋',
};

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const LEVEL_COLORS: Record<string, string> = {
  High: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const LABELS = {
  en: {
    title: 'Dasha + Transit Timeline',
    subtitle: 'Current periods and upcoming transits',
    description: 'View your active Mahadasha and Antardasha alongside major planetary transits and monthly activation levels.',
    formHeading: 'Birth Details',
    name: 'Name',
    dob: 'Date of Birth',
    tob: 'Time of Birth',
    timezone: 'Timezone',
    latitude: 'Latitude',
    longitude: 'Longitude',
    place: 'Place of Birth',
    targetDate: 'Analysis Date',
    calculate: 'Generate Timeline',
    calculating: 'Generating…',
    reset: 'Reset',
    emptyTitle: 'Enter birth details',
    emptyDesc: 'Provide your birth information above to generate your personalized Dasha and Transit timeline.',
    currentPeriod: 'Current Period',
    mahadasha: 'Mahadasha',
    antardasha: 'Antardasha',
    pratyantar: 'Pratyantar',
    monthlyOutlook: 'Monthly Outlook',
    majorTransits: 'Major Transits',
    keyEvents: 'Key Events',
    activationLevel: 'Activation Level',
    favorable: 'Favorable',
    unfavorable: 'Unfavorable',
    chandrashtama: 'Chandrashtama Period',
    chandrashtamaDesc: 'Moon in 8th house from natal Moon. Avoid important decisions.',
    ashtakavargaStrength: 'Ashtakavarga Strength',
    transitWindow: 'Transit Window',
    viewRange: 'View Range',
  },
  hi: {
    title: 'दशा + गोचर टाइमलाइन',
    subtitle: 'वर्तमान अवधि और आगामी गोचर',
    description: 'अपनी सक्रिय महादशा और अंतर्दशा को प्रमुख ग्रह गोचर और मासिक सक्रियण स्तर के साथ देखें।',
    formHeading: 'जन्म विवरण',
    name: 'नाम',
    dob: 'जन्म तिथि',
    tob: 'जन्म समय',
    timezone: 'समय क्षेत्र',
    latitude: 'अक्षांश',
    longitude: 'देशांतर',
    place: 'जन्म स्थान',
    targetDate: 'विश्लेषण तिथि',
    calculate: 'टाइमलाइन बनाएं',
    calculating: 'बन रहा है…',
    reset: 'रीसेट',
    emptyTitle: 'जन्म विवरण दर्ज करें',
    emptyDesc: 'अपनी व्यक्तिगत दशा और गोचर टाइमलाइन बनाने के लिए ऊपर अपनी जन्म जानकारी प्रदान करें।',
    currentPeriod: 'वर्तमान अवधि',
    mahadasha: 'महादशा',
    antardasha: 'अंतर्दशा',
    pratyantar: 'प्रत्यंतर',
    monthlyOutlook: 'मासिक दृष्टिकोण',
    majorTransits: 'प्रमुख गोचर',
    keyEvents: 'मुख्य घटनाएं',
    activationLevel: 'सक्रियण स्तर',
    favorable: 'अनुकूल',
    unfavorable: 'प्रतिकूल',
    chandrashtama: 'चंद्राष्टम अवधि',
    chandrashtamaDesc: 'चंद्रमा नटल चंद्रमा से 8वें भाव में। महत्वपूर्ण निर्णय से बचें।',
    ashtakavargaStrength: 'अष्टकवर्ग शक्ति',
    transitWindow: 'गोचर खिड़की',
    viewRange: 'दृश्य सीमा',
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  name: string;
  date: string;
  time: string;
  timezone: string;
  latitude: string;
  longitude: string;
  place: string;
  targetDate: string;
}

const DEFAULT_FORM: FormValues = {
  name: 'Rajkumar',
  date: '1963-09-15',
  time: '06:00',
  timezone: 'Asia/Kolkata',
  latitude: '23.5',
  longitude: '74.32',
  place: 'Aspur, Rajasthan',
  targetDate: new Date().toISOString().split('T')[0],
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function CurrentPeriodCard({
  activeDasha,
  correlation,
  lang,
}: {
  activeDasha: any;
  correlation: any;
  lang: 'en' | 'hi';
}) {
  const t = LABELS[lang];
  const isHi = lang === 'hi';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
          {t.currentPeriod}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mahadasha */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t.mahadasha}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {PLANET_SYMBOLS[activeDasha.mahaLord] ?? ''}{' '}
                {isHi ? (PLANET_HI[activeDasha.mahaLord] ?? activeDasha.mahaLord) : activeDasha.mahaLord}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{formatDate(activeDasha.mahaStart)}</p>
            <p className="text-xs text-muted-foreground">→ {formatDate(activeDasha.mahaEnd)}</p>
          </div>
        </div>

        {/* Antardasha */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t.antardasha}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {PLANET_SYMBOLS[activeDasha.antarLord] ?? ''}{' '}
                {isHi ? (PLANET_HI[activeDasha.antarLord] ?? activeDasha.antarLord) : activeDasha.antarLord}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{formatDate(activeDasha.antarStart)}</p>
            <p className="text-xs text-muted-foreground">→ {formatDate(activeDasha.antarEnd)}</p>
          </div>
        </div>

        {/* Pratyantar */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t.pratyantar}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-violet-300">
                {PLANET_SYMBOLS[activeDasha.pratyanLord] ?? ''}{' '}
                {isHi ? (PLANET_HI[activeDasha.pratyanLord] ?? activeDasha.pratyanLord) : activeDasha.pratyanLord}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{formatDate(activeDasha.pratyanStart)}</p>
            <p className="text-xs text-muted-foreground">→ {formatDate(activeDasha.pratyanEnd)}</p>
          </div>
        </div>

        {/* Activation Level */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">{t.activationLevel}</span>
          <Badge className={LEVEL_COLORS[correlation.activationLevel]}>
            {correlation.activationLevel} — {correlation.score}/100
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyOutlookCard({
  monthlyOutlook,
  lang,
}: {
  monthlyOutlook: any[];
  lang: 'en' | 'hi';
}) {
  const t = LABELS[lang];
  const isHi = lang === 'hi';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-teal-500" aria-hidden="true" />
          {t.monthlyOutlook}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {monthlyOutlook.slice(0, 6).map((month, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{month.month}</span>
                <Badge className={LEVEL_COLORS[month.activationLevel]} variant="outline">
                  {month.activationLevel}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {PLANET_SYMBOLS[month.mahaLord] ?? ''} {month.mahaLord} / {month.antarLord}
                </p>
                <p className="text-xs font-mono text-muted-foreground">{month.score}/100</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MajorTransitsCard({
  transitPositions,
  lang,
}: {
  transitPositions: any[];
  lang: 'en' | 'hi';
}) {
  const t = LABELS[lang];
  const isHi = lang === 'hi';

  // Focus on major slow-moving planets
  const majorPlanets = ['Saturn', 'Jupiter', 'Rahu', 'Ketu'];
  const majorTransits = transitPositions.filter(tp => majorPlanets.includes(tp.planet));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Star className="h-4 w-4 text-purple-500" aria-hidden="true" />
          {t.majorTransits}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {majorTransits.map((tp, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  {PLANET_SYMBOLS[tp.planet] ?? ''}
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {isHi ? (PLANET_HI[tp.planet] ?? tp.planet) : tp.planet}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    House {tp.houseFromMoon} from Moon
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  className={tp.isFavorable ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}
                  variant="outline"
                >
                  {tp.isFavorable ? t.favorable : t.unfavorable}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">SAV: {tp.savScore}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KeyEventsCard({
  correlation,
  lang,
}: {
  correlation: any;
  lang: 'en' | 'hi';
}) {
  const t = LABELS[lang];
  const isHi = lang === 'hi';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500" aria-hidden="true" />
          {t.keyEvents}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Chandrashtama Warning */}
        {correlation.isChandrashtama && (
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-orange-300">{t.chandrashtama}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.chandrashtamaDesc}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ashtakavarga Summary */}
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-2">{t.ashtakavargaStrength}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{correlation.ashtakavargaSummary.overallStrength}</span>
            <span className="text-xs text-muted-foreground">
              Avg: {correlation.ashtakavargaSummary.averageScore.toFixed(1)}
            </span>
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-emerald-400">Favorable: {correlation.ashtakavargaSummary.favorableTransits}</span>
            <span className="text-red-400">Unfavorable: {correlation.ashtakavargaSummary.unfavorableTransits}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DashaTransitTimelineView() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(undefined);

  const isHi = lang === 'hi';
  const t = LABELS[isHi ? 'hi' : 'en'];

  const handleProfileSelect = (profile: FamilyProfile) => {
    const validatedProfile = getProfileById(profile.id);
    if (!validatedProfile) {
      setError(isHi ? 'अमान्य प्रोफ़ाइल' : 'Invalid profile');
      return;
    }
    setSelectedProfileId(profile.id);
    setForm((prev) => ({
      ...prev,
      name: validatedProfile.name,
      date: validatedProfile.birthDate,
      time: validatedProfile.birthTime || prev.time,
      timezone: validatedProfile.birthTimezone || prev.timezone,
      latitude: String(validatedProfile.birthLat ?? prev.latitude),
      longitude: String(validatedProfile.birthLon ?? prev.longitude),
      place: validatedProfile.birthPlace || prev.place,
    }));
    setError(null);
    setResult(null);
  };

  const handleChange =
    (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError(null);
    };

  const handleCalculate = async () => {
    setError(null);
    setResult(null);
    setIsLoading(true);
    await Promise.resolve();
    try {
      const lat = parseFloat(form.latitude);
      const lon = parseFloat(form.longitude);
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error(isHi ? 'वैध अक्षांश और देशांतर दर्ज करें' : 'Please enter valid latitude and longitude');
      }

      const birthData: BirthData = {
        name: form.name,
        date: form.date,
        time: form.time,
        timezone: form.timezone,
        latitude: lat,
        longitude: lon,
        place: form.place,
      };

      const correlationResult = computeCorrelation(birthData, form.targetDate);
      setResult(correlationResult);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to generate timeline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Dasha + Transit Timeline — Vedic Rajkumar"
        description="View your active Mahadasha and Antardasha alongside major planetary transits and monthly activation levels."
        canonical="/dasha-transit-timeline"
      />

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-teal-500" aria-hidden="true" />
            <div>
              <h1 className={cn('text-xl font-bold text-foreground', isHi && 'font-hindi')}>
                {t.title}
              </h1>
              <p className={cn('text-xs text-muted-foreground', isHi && 'font-hindi')}>
                {t.subtitle}
              </p>
            </div>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-border text-sm">
            <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        <ValidationInProgressNotice />

        {/* Intro description */}
        <p className={cn('text-sm text-muted-foreground max-w-3xl', isHi && 'font-hindi')}>
          {t.description}
        </p>

        {/* Form Section */}
        <section
          aria-labelledby="form-heading"
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2
              id="form-heading"
              className={cn('text-base font-semibold text-foreground flex items-center gap-2', isHi && 'font-hindi')}
            >
              <Info className="h-4 w-4 text-teal-500" aria-hidden="true" />
              {t.formHeading}
            </h2>
            <FamilyProfileSelector
              onSelect={handleProfileSelect}
              selectedId={selectedProfileId}
              triggerLabel={isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profiles'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3 flex flex-col gap-1.5">
              <label htmlFor="name" className={cn('text-sm font-medium', isHi && 'font-hindi')}>{t.name}</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className={cn('text-sm font-medium', isHi && 'font-hindi')}>{t.dob}</label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={handleChange('date')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="time" className={cn('text-sm font-medium', isHi && 'font-hindi')}>{t.tob}</label>
              <input
                id="time"
                type="time"
                value={form.time}
                onChange={handleChange('time')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="timezone" className={cn('text-sm font-medium', isHi && 'font-hindi')}>{t.timezone}</label>
              <input
                id="timezone"
                type="text"
                value={form.timezone}
                onChange={handleChange('timezone')}
                placeholder="Asia/Kolkata"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="latitude" className={cn('text-sm font-medium', isHi && 'font-hindi')}>{t.latitude}</label>
              <input
                id="latitude"
                type="number"
                step="0.01"
                value={form.latitude}
                onChange={handleChange('latitude')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="longitude" className={cn('text-sm font-medium', isHi && 'font-hindi')}>{t.longitude}</label>
              <input
                id="longitude"
                type="number"
                step="0.01"
                value={form.longitude}
                onChange={handleChange('longitude')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="place" className={cn('text-sm font-medium', isHi && 'font-hindi')}>{t.place}</label>
              <input
                id="place"
                type="text"
                value={form.place}
                onChange={handleChange('place')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="targetDate" className={cn('text-sm font-medium', isHi && 'font-hindi')}>
                <Clock className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {t.targetDate}
              </label>
              <input
                id="targetDate"
                type="date"
                value={form.targetDate}
                onChange={handleChange('targetDate')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 justify-end flex-wrap">
            {result && (
              <Button variant="outline" onClick={handleReset} className="gap-2">
                {t.reset}
              </Button>
            )}
            <Button
              onClick={() => void handleCalculate()}
              disabled={isLoading}
              className="gap-2 bg-teal-600 hover:bg-teal-500 text-white"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {isLoading ? t.calculating : t.calculate}
            </Button>
          </div>
        </section>

        {/* Results Section */}
        <div aria-live="polite" aria-atomic="false">
          {isLoading && (
            <div className="space-y-4">
              <LoadingSkeleton variant="card" rows={3} />
              <LoadingSkeleton variant="table" rows={4} />
            </div>
          )}

          {!isLoading && error && (
            <ChartErrorState message={error} onRetry={() => void handleCalculate()} />
          )}

          {!isLoading && !error && !result && (
            <ChartEmptyState
              icon={<Calendar className="h-8 w-8" />}
              title={t.emptyTitle}
              description={t.emptyDesc}
            />
          )}

          {!isLoading && result && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Current Period */}
              <CurrentPeriodCard
                activeDasha={result.activeDasha}
                correlation={result.correlation}
                lang={isHi ? 'hi' : 'en'}
              />

              {/* Monthly Outlook */}
              <MonthlyOutlookCard
                monthlyOutlook={result.monthlyOutlook}
                lang={isHi ? 'hi' : 'en'}
              />

              {/* Major Transits */}
              <MajorTransitsCard
                transitPositions={result.transitPositions}
                lang={isHi ? 'hi' : 'en'}
              />

              {/* Key Events */}
              <KeyEventsCard
                correlation={result}
                lang={isHi ? 'hi' : 'en'}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}