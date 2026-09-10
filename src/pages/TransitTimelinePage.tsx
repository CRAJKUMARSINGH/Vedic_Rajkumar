/**
 * TransitTimelinePage.tsx
 *
 * Week 7: Feature UI Scaffolding — Transit Timeline visual shell.
 *
 * Scaffold for a Gantt-style visual timeline of planetary sign changes
 * (transits) over a configurable date range. This is a front-end-first
 * prototype that can be hardened later with real ephemeris-backed data.
 *
 * Shows:
 *   - Birth data form (with Family Profile quick-load)
 *   - Date range picker (look-ahead horizon)
 *   - 9-row planet × time grid (Gantt chart style)
 *   - Current position marker (today line)
 *   - Key events: retrograde entries / exits, sign ingress / egress
 *   - Legend panel
 *
 * Accessibility:
 *   - All inputs have associated labels
 *   - aria-busy on calculate button
 *   - aria-live on result area
 *   - Loading skeleton, empty state, error state
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  RefreshCw,
  Download,
  Star,
  Info,
  Filter,
  ArrowRightLeft,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANETS: string[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
];

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const PLANET_SYMBOL: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const RASHIS: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const RASHI_HI: Record<string, string> = {
  Aries: 'मेष', Taurus: 'वृषभ', Gemini: 'मिथुन', Cancer: 'कर्क',
  Leo: 'सिंह', Virgo: 'कन्या', Libra: 'तुला', Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु', Capricorn: 'मकर', Aquarius: 'कुंभ', Pisces: 'मीन',
};

const RASHI_COLOR: Record<string, string> = {
  Aries: 'bg-red-400', Taurus: 'bg-amber-400', Gemini: 'bg-yellow-400', Cancer: 'bg-gray-300',
  Leo: 'bg-orange-400', Virgo: 'bg-green-300', Libra: 'bg-pink-300', Scorpio: 'bg-red-600',
  Sagittarius: 'bg-yellow-500', Capricorn: 'bg-slate-400', Aquarius: 'bg-blue-400', Pisces: 'bg-indigo-300',
};

// Mock transit duration in days per sign (approximate values for scaffold UI)
const TRANSIT_DURATION_DAYS: Record<string, number> = {
  Sun: 30, Moon: 2.25, Mars: 45, Mercury: 30,
  Jupiter: 365, Venus: 30, Saturn: 1095, Rahu: 547, Ketu: 547,
};

const LABELS = {
  en: {
    title: 'Transit Timeline',
    subtitle: 'Planetary movements across zodiac signs',
    description:
      'Visual Gantt-style timeline showing when each planet enters and exits zodiac signs over your chosen forecast period.',
    formHeading: 'Birth & Timeframe',
    name: 'Full Name',
    dob: 'Date of Birth',
    tob: 'Time of Birth (24h, optional)',
    timezone: 'Timezone (IANA)',
    timezoneHelper: 'e.g. Asia/Kolkata for India, America/New_York for US Eastern.',
    latitude: 'Latitude',
    latHelper: 'Decimal degrees. Filled automatically when using Family Profiles.',
    longitude: 'Longitude',
    lonHelper: 'Decimal degrees. Filled automatically when using Family Profiles.',
    place: 'Birth Place / City',
    placeHelper: 'City and region for timezone reference.',
    rangeStart: 'Start from',
    rangeStartHelper: 'The timeline begins on this date.',
    rangeMonths: 'Timeline length',
    rangeMonthsHelper:
      'How much data to generate (1–60 months). After generating, use the Zoom buttons below to focus on a shorter window.',
    calculate: 'Generate Timeline',
    calculating: 'Generating…',
    reset: 'Reset',
    exportPdf: 'Export PDF',
    emptyTitle: 'Set up your timeline',
    emptyDesc:
      'Enter birth details and choose a timeline length above, then click Generate Timeline. You can zoom into the results afterwards.',
    timelineHeading: 'Planetary Transit Timeline',
    currentPos: 'Today',
    retrograde: 'Retrograde',
    direct: 'Direct',
    ingress: 'Sign Entry',
    egress: 'Sign Exit',
    legend: 'Legend',
    todayHint: 'Today is marked with the violet (purple) vertical line',
    viewRange: 'Zoom (focus window)',
    viewRangeHelper: 'Zoom into the generated timeline. Does not re-calculate transits. Focuses the visual window without changing the generated dataset.',
    trackEngineProgress: 'Track engine progress \u2192',
    trackEngineProgressHi: 'इंजन प्रगति ट्रैक करें \u2192',
    invalidLatLon: 'Enter valid latitude and longitude (numbers only).',
    invalidRange: 'Timeline length must be between 1 and 60 months.',
  },
  hi: {
    title: 'गोचर टाइमलाइन',
    subtitle: 'राशियों में ग्रहों की गति',
    description:
      'आपके चुने गए पूर्वानुमान अवधि में प्रत्येक ग्रह कब राशि में प्रवेश करता है और कब निकलता है — दृश्य गैंट शैली टाइमलाइन।',
    formHeading: 'जन्म और समय-सीमा',
    name: 'पूरा नाम',
    dob: 'जन्म तिथि',
    tob: 'जन्म समय (24 घंटे, वैकल्पिक)',
    timezone: 'समय क्षेत्र (IANA)',
    timezoneHelper: 'जैसे भारत के लिए Asia/Kolkata, यूएस ईस्टर्न के लिए America/New_York।',
    latitude: 'अक्षांश',
    latHelper: 'दशमलव डिग्री में। परिवार प्रोफ़ाइल का उपयोग करने पर स्वयं भरा जाता है।',
    longitude: 'देशांतर',
    lonHelper: 'दशमलव डिग्री में। परिवार प्रोफ़ाइल का उपयोग करने पर स्वयं भरा जाता है।',
    place: 'जन्म स्थान / शहर',
    placeHelper: 'समय क्षेत्र संदर्भ के लिए शहर और क्षेत्र।',
    rangeStart: 'इस तिथि से शुरू',
    rangeStartHelper: 'टाइमलाइन इस तिथि से शुरू होती है।',
    rangeMonths: 'टाइमलाइन की लंबाई',
    rangeMonthsHelper:
      'कितना डेटा जेनरेट करना है (1–60 महीने)। जेनरेशन के बाद, छोटे विंडो पर फोकस करने के लिए नीचे ज़ूम बटन का उपयोग करें।',
    calculate: 'टाइमलाइन बनाएं',
    calculating: 'बन रहा है…',
    reset: 'रीसेट',
    exportPdf: 'PDF निर्यात',
    emptyTitle: 'अपनी टाइमलाइन सेट करें',
    emptyDesc:
      'ऊपर जन्म विवरण भरें और टाइमलाइन की लंबाई चुनें, फिर टाइमलाइन बनाएं पर क्लिक करें। बाद में परिणामों में ज़ूम कर सकते हैं।',
    timelineHeading: 'ग्रह गोचर टाइमलाइन',
    currentPos: 'आज',
    retrograde: 'वक्री',
    direct: 'मार्गी',
    ingress: 'राशि प्रवेश',
    egress: 'राशि निकास',
    legend: 'संकेत',
    todayHint: 'बैंगनी (वायलेट) ऊर्ध्वाधर रेखा आज की तिथि दर्शाती है',
    viewRange: 'ज़ूम (फोकस विंडो)',
    viewRangeHelper: 'जेनरेट की गई टाइमलाइन में ज़ूम करें। गोचर पुनः गणना नहीं करता। डेटासेट को बदले बिना दृश्य विंडो पर फोकस करता है।',
    trackEngineProgress: 'Track engine progress \u2192',
    trackEngineProgressHi: 'इंजन प्रगति ट्रैक करें \u2192',
    invalidLatLon: 'वैध अक्षांश और देशांतर दर्ज करें (केवल संख्या)।',
    invalidRange: 'टाइमलाइन की लंबाई 1 से 60 महीने के बीच होनी चाहिए।',
  },
} as const;

/** Quick-view range options for the zoom filter */
type ViewRange = '6m' | '12m' | '24m' | 'all';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineSegment {
  sign: string;
  startOffsetDays: number;
  durationDays: number;
  isRetrograde: boolean;
}

interface PlanetTimeline {
  planet: string;
  segments: TimelineSegment[];
}

interface TimelineResult {
  startDate: string;
  totalDays: number;
  planets: PlanetTimeline[];
  events: TimelineEvent[];
}

interface TimelineEvent {
  dateOffset: number;
  planet: string;
  type: 'ingress' | 'egress' | 'retrograde-start' | 'retrograde-end';
  label: string;
}

interface FormValues {
  name: string;
  date: string;
  time: string;
  timezone: string;
  latitude: string;
  longitude: string;
  place: string;
  rangeStart: string;
  rangeMonths: string;
}

const DEFAULT_FORM: FormValues = {
  name: 'Rajkumar',
  date: '1963-09-15',
  time: '06:00',
  timezone: 'Asia/Kolkata',
  latitude: '23.5',
  longitude: '74.32',
  place: 'Aspur, Rajasthan',
  rangeStart: new Date().toISOString().split('T')[0],
  rangeMonths: '12',
};

// ─── Mock Generator (for scaffold UI — replace with real ephemeris later) ─────

function generateMockTimeline(form: FormValues): TimelineResult {
  const start = new Date(form.rangeStart);
  const months = Math.max(1, Math.min(60, parseInt(form.rangeMonths) || 12));
  const totalDays = months * 30;

  // Seed a "starting rashi" per planet for visual variety
  const startIdxMap: Record<string, number> = {};
  PLANETS.forEach((p, i) => {
    startIdxMap[p] = Math.floor((Date.now() / 86400000 / 7 + i * 3) % 12);
  });

  const planets: PlanetTimeline[] = PLANETS.map((planet) => {
    const perSign = TRANSIT_DURATION_DAYS[planet] || 30;
    const segments: TimelineSegment[] = [];
    let offset = 0;
    let rashiIdx = startIdxMap[planet];
    let segCounter = 0;

    while (offset < totalDays) {
      const duration = Math.min(perSign, totalDays - offset);
      // Jupiter / Saturn / Rahu / Ketu occasionally retrograde
      const isRetrograde =
        (planet === 'Jupiter' || planet === 'Saturn' || planet === 'Mercury' || planet === 'Mars' || planet === 'Venus') &&
        segCounter % 5 === 2 &&
        duration > 15;

      segments.push({
        sign: RASHIS[rashiIdx % 12],
        startOffsetDays: offset,
        durationDays: duration,
        isRetrograde,
      });

      offset += duration;
      rashiIdx++;
      segCounter++;
    }
    return { planet, segments };
  });

  // Build events from segment boundaries
  const events: TimelineEvent[] = [];
  planets.forEach(({ planet, segments }) => {
    const p = LABELS.en;
    segments.forEach((seg, idx) => {
      if (idx > 0) {
        events.push({
          dateOffset: seg.startOffsetDays,
          planet,
          type: 'ingress',
          label: `${planet} enters ${seg.sign}`,
        });
      }
      if (seg.isRetrograde) {
        events.push({
          dateOffset: seg.startOffsetDays + seg.durationDays * 0.1,
          planet,
          type: 'retrograde-start',
          label: `${planet} retrograde`,
        });
        events.push({
          dateOffset: seg.startOffsetDays + seg.durationDays * 0.9,
          planet,
          type: 'retrograde-end',
          label: `${planet} direct`,
        });
      }
    });
  });

  return {
    startDate: form.rangeStart,
    totalDays,
    planets,
    events,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LegendPanel({ lang }: { lang: 'en' | 'hi' }) {
  const t = LABELS[lang];
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {t.legend}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {RASHIS.slice(0, 6).map((r) => (
            <div key={r} className="flex items-center gap-1.5">
              <span className={cn('w-3 h-3 rounded-sm', RASHI_COLOR[r])} aria-hidden="true" />
              <span className="text-xs text-muted-foreground">
                {lang === 'hi' ? (RASHI_HI[r] ?? r) : r}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {RASHIS.slice(6, 12).map((r) => (
            <div key={r} className="flex items-center gap-1.5">
              <span className={cn('w-3 h-3 rounded-sm', RASHI_COLOR[r])} aria-hidden="true" />
              <span className="text-xs text-muted-foreground">
                {lang === 'hi' ? (RASHI_HI[r] ?? r) : r}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-2 flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-3 rounded-sm bg-foreground/70" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">
              {t.direct}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-3 rounded-sm bg-foreground/30 border-t-2 border-b-2 border-dashed border-foreground/70" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">
              {t.retrograde} (Rx)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-0.5 h-4 bg-violet-500" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">
              {t.currentPos}
            </span>
          </div>
        </div>
        {/* Today hint */}
        <p className={cn('text-[11px] text-violet-600 dark:text-violet-400 mt-1', lang === 'hi' && 'font-hindi')}>
          ℹ️ {t.todayHint}
        </p>
      </CardContent>
    </Card>
  );
}

function TimelineGrid({
  result,
  lang,
  viewDays,
}: {
  result: TimelineResult;
  lang: 'en' | 'hi';
  /** Optionally restrict the visible window to this many days from startDate */
  viewDays?: number;
}) {
  const isHi = lang === 'hi';
  const today = new Date();
  const start = new Date(result.startDate);
  // Clamp to viewDays if provided, otherwise use full range
  const displayDays = viewDays ? Math.min(viewDays, result.totalDays) : result.totalDays;
  const todayOffset = Math.max(0, Math.min(displayDays, Math.round((today.getTime() - start.getTime()) / 86400000)));
  const todayPct = (todayOffset / displayDays) * 100;

  // Month tick marks (approx every 30 days)
  const ticks: { offset: number; label: string }[] = [];
  for (let i = 0; i <= displayDays; i += Math.max(30, Math.round(displayDays / 8))) {
    const d = new Date(start.getTime() + i * 86400000);
    ticks.push({
      offset: i,
      label: `${d.toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { month: 'short', year: '2-digit' })}`,
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Axis ticks */}
      <div className="ml-24 mb-1 relative h-6">
        {ticks.map((tk) => (
          <div
            key={tk.offset}
            className="absolute top-0 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap"
            style={{ left: `${(tk.offset / displayDays) * 100}%` }}
          >
            <div className="w-px h-2 bg-border mx-auto mb-0.5" />
            {tk.label}
          </div>
        ))}
      </div>

      {/* Planet rows */}
      <div className="space-y-2">
        {result.planets.map(({ planet, segments }) => {
          const pName = isHi ? (PLANET_HI[planet] ?? planet) : planet;
          // Only render segments that fall within displayDays
          const visibleSegments = segments.filter((seg) => seg.startOffsetDays < displayDays);
          return (
            <div key={planet} className="flex items-stretch gap-3">
              {/* Planet label */}
              <div className="w-24 flex-shrink-0 flex items-center justify-end pr-2">
                <span className="text-sm font-medium text-foreground truncate">
                  <span className="mr-1" aria-hidden="true">{PLANET_SYMBOL[planet]}</span>
                  {pName}
                </span>
              </div>

              {/* Timeline bar */}
              <div className="relative flex-1 h-10 rounded-lg bg-muted/40 border border-border overflow-hidden">
                {visibleSegments.map((seg, idx) => {
                  const clampedDuration = Math.min(seg.durationDays, displayDays - seg.startOffsetDays);
                  const left = (seg.startOffsetDays / displayDays) * 100;
                  const width = (clampedDuration / displayDays) * 100;
                  const signLabel = isHi ? (RASHI_HI[seg.sign] ?? seg.sign) : seg.sign;
                  // Compute start/end dates for tooltip
                  const segStart = new Date(start.getTime() + seg.startOffsetDays * 86400000);
                  const segEnd = new Date(start.getTime() + (seg.startOffsetDays + seg.durationDays) * 86400000);
                  const segStartStr = segStart.toISOString().split('T')[0];
                  const segEndStr = segEnd.toISOString().split('T')[0];
                  const tooltipText = `${planet} in ${seg.sign}${seg.isRetrograde ? ' (Rx)' : ''} · ${segStartStr} → ${segEndStr}`;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'absolute top-1 bottom-1 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white/20',
                        RASHI_COLOR[seg.sign],
                        seg.isRetrograde && 'opacity-70 border-t-4 border-b-4 border-dashed border-white/40',
                      )}
                      style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
                      title={tooltipText}
                      aria-label={`${planet} in ${signLabel}${seg.isRetrograde ? ' retrograde' : ''}, from ${segStartStr} to ${segEndStr}`}
                    >
                      {width > 5 && (
                        <span className="truncate px-1 mix-blend-multiply dark:mix-blend-screen">
                          {signLabel.slice(0, 3)}
                          {seg.isRetrograde && width > 10 && ' ℞'}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Today marker */}
                {todayPct >= 0 && todayPct <= 100 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-violet-500 z-10"
                    style={{ left: `${todayPct}%` }}
                    aria-hidden="true"
                  >
                    <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 bg-violet-500 rotate-45" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<keyof FormValues, string>>;
type TouchedFields = Partial<Record<keyof FormValues, boolean>>;

export default function TransitTimelinePage() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
  const [result, setResult] = useState<TimelineResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'timeline' | 'events'>('timeline');
  const [viewRange, setViewRange] = useState<ViewRange>('all');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const resultRef = useRef<HTMLHeadingElement>(null);

  const isHi = lang === 'hi';
  const t = LABELS[isHi ? 'hi' : 'en'];
  const formLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

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
    setFieldErrors({});
    setResult(null);
  };

  const handleChange =
    (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      // Clear field-level error as user types
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
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
      const newErrors: FieldErrors = {};

      if (isNaN(lat) || isNaN(lon)) {
        newErrors.latitude = t.invalidLatLon;
        newErrors.longitude = t.invalidLatLon;
      }
      const months = parseInt(form.rangeMonths);
      if (isNaN(months) || months < 1 || months > 60) {
        newErrors.rangeMonths = t.invalidRange;
      }

      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        setTouched({
          latitude: true,
          longitude: true,
          rangeMonths: true,
          ...touched,
        });
        throw new Error(
          newErrors.rangeMonths ?? newErrors.latitude ?? (isHi ? 'अमान्य मान' : 'Invalid values'),
        );
      }

      setFieldErrors({});
      const res = generateMockTimeline(form);
      setResult(res);
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

  const handleExportPdf = async () => {
    if (!result) return;
    setIsPdfLoading(true);
    // Placeholder for PDF export — integrate in later weeks
    await new Promise((r) => setTimeout(r, 600));
    setIsPdfLoading(false);
  };

  // Filtered events list for "events" tab
  const sortedEvents = useMemo(() => {
    if (!result) return [];
    return [...result.events].sort((a, b) => a.dateOffset - b.dateOffset).slice(0, 30);
  }, [result]);

  // Compute viewDays from quick-range filter
  const viewDays = useMemo((): number | undefined => {
    if (!result || viewRange === 'all') return undefined;
    const daysMap: Record<Exclude<ViewRange, 'all'>, number> = { '6m': 180, '12m': 365, '24m': 730 };
    return Math.min(daysMap[viewRange as Exclude<ViewRange, 'all'>], result.totalDays);
  }, [result, viewRange]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Transit Timeline — Planetary Movement Visualization"
        description="Visual Gantt-style timeline of planetary transits across zodiac signs. Track sign entries, retrogrades, and key movements."
        canonical="/transit-timeline"
      />

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="h-6 w-6 text-teal-500" aria-hidden="true" />
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

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="tt-form-heading"
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2
              id="tt-form-heading"
              className={cn('text-base font-semibold text-foreground flex items-center gap-2', isHi && 'font-hindi')}
            >
              <CalendarDays className="h-4 w-4 text-teal-500" aria-hidden="true" />
              {t.formHeading}
            </h2>
            <FamilyProfileSelector
              onSelect={handleProfileSelect}
              selectedId={selectedProfileId}
              triggerLabel={isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profile'}
              lang={formLang}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name */}
            <div className="lg:col-span-3 flex flex-col gap-1.5">
              <Label htmlFor="tt-name" className={isHi ? 'font-hindi' : ''}>{t.name}</Label>
              <input
                id="tt-name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* DOB */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tt-date" className={isHi ? 'font-hindi' : ''}>{t.dob}</Label>
              <input
                id="tt-date"
                type="date"
                value={form.date}
                onChange={handleChange('date')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* TOB */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tt-time" className={isHi ? 'font-hindi' : ''}>{t.tob}</Label>
              <input
                id="tt-time"
                type="time"
                value={form.time}
                onChange={handleChange('time')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Timezone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tt-tz" className={isHi ? 'font-hindi' : ''}>{t.timezone}</Label>
              <input
                id="tt-tz"
                type="text"
                value={form.timezone}
                onChange={handleChange('timezone')}
                placeholder="Asia/Kolkata"
                aria-describedby="tt-tz-helper"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p
                id="tt-tz-helper"
                className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
              >
                {t.timezoneHelper}
              </p>
            </div>

            {/* Latitude */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tt-lat" className={isHi ? 'font-hindi' : ''}>{t.latitude}</Label>
              <input
                id="tt-lat"
                type="number"
                step="0.01"
                value={form.latitude}
                onChange={handleChange('latitude')}
                aria-invalid={touched.latitude && !!fieldErrors.latitude ? 'true' : 'false'}
                aria-describedby="tt-lat-helper"
                className={cn(
                  'rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  touched.latitude && fieldErrors.latitude
                    ? 'border-destructive ring-1 ring-destructive/30 focus-visible:ring-destructive'
                    : 'border-input',
                )}
              />
              <p
                id="tt-lat-helper"
                className={cn(
                  'text-[11px] leading-snug',
                  touched.latitude && fieldErrors.latitude
                    ? 'text-destructive'
                    : 'text-muted-foreground',
                  isHi && 'font-hindi',
                )}
              >
                {touched.latitude && fieldErrors.latitude ? fieldErrors.latitude : t.latHelper}
              </p>
            </div>

            {/* Longitude */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tt-lon" className={isHi ? 'font-hindi' : ''}>{t.longitude}</Label>
              <input
                id="tt-lon"
                type="number"
                step="0.01"
                value={form.longitude}
                onChange={handleChange('longitude')}
                aria-invalid={touched.longitude && !!fieldErrors.longitude ? 'true' : 'false'}
                aria-describedby="tt-lon-helper"
                className={cn(
                  'rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  touched.longitude && fieldErrors.longitude
                    ? 'border-destructive ring-1 ring-destructive/30 focus-visible:ring-destructive'
                    : 'border-input',
                )}
              />
              <p
                id="tt-lon-helper"
                className={cn(
                  'text-[11px] leading-snug',
                  touched.longitude && fieldErrors.longitude
                    ? 'text-destructive'
                    : 'text-muted-foreground',
                  isHi && 'font-hindi',
                )}
              >
                {touched.longitude && fieldErrors.longitude ? fieldErrors.longitude : t.lonHelper}
              </p>
            </div>

            {/* Place */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tt-place" className={isHi ? 'font-hindi' : ''}>{t.place}</Label>
              <input
                id="tt-place"
                type="text"
                value={form.place}
                onChange={handleChange('place')}
                aria-describedby="tt-place-helper"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p
                id="tt-place-helper"
                className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
              >
                {t.placeHelper}
              </p>
            </div>

            {/* Range Start */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tt-start" className={isHi ? 'font-hindi' : ''}>
                <Clock className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {t.rangeStart}
              </Label>
              <input
                id="tt-start"
                type="date"
                value={form.rangeStart}
                onChange={handleChange('rangeStart')}
                aria-describedby="tt-start-helper"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p
                id="tt-start-helper"
                className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
              >
                {t.rangeStartHelper}
              </p>
            </div>

            {/* Range Months */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tt-months" className={isHi ? 'font-hindi' : ''}>
                <CalendarDays className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {t.rangeMonths}
              </Label>
              <select
                id="tt-months"
                value={form.rangeMonths}
                onChange={handleChange('rangeMonths') as any}
                aria-invalid={touched.rangeMonths && !!fieldErrors.rangeMonths ? 'true' : 'false'}
                aria-describedby="tt-months-helper"
                className={cn(
                  'rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  touched.rangeMonths && fieldErrors.rangeMonths
                    ? 'border-destructive ring-1 ring-destructive/30 focus-visible:ring-destructive'
                    : 'border-input',
                )}
              >
                {[1, 3, 6, 12, 24, 36, 60].map((m) => (
                  <option key={m} value={String(m)}>{m} {isHi ? 'महीने' : (m === 1 ? 'month' : 'months')}</option>
                ))}
              </select>
              <p
                id="tt-months-helper"
                className={cn(
                  'text-[11px] leading-snug',
                  touched.rangeMonths && fieldErrors.rangeMonths
                    ? 'text-destructive'
                    : 'text-muted-foreground',
                  isHi && 'font-hindi',
                )}
              >
                {touched.rangeMonths && fieldErrors.rangeMonths
                  ? fieldErrors.rangeMonths
                  : t.rangeMonthsHelper}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 justify-end flex-wrap">
            {result && (
              <>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.reset}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handleExportPdf()}
                  disabled={isPdfLoading}
                  aria-busy={isPdfLoading}
                  className="gap-2"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  {isPdfLoading ? (isHi ? 'बन रहा है…' : 'Preparing…') : t.exportPdf}
                </Button>
              </>
            )}
            <Button
              onClick={() => void handleCalculate()}
              disabled={isLoading}
              aria-busy={isLoading}
              className="gap-2 bg-teal-600 hover:bg-teal-500 text-white"
            >
              <Star className="h-4 w-4" aria-hidden="true" />
              {isLoading ? t.calculating : t.calculate}
            </Button>
          </div>
        </section>

        {/* ── Result area ──────────────────────────────────────────────── */}
        <div aria-live="polite" aria-atomic="false">
          {isLoading && (
            <div className="space-y-4">
              <LoadingSkeleton variant="card" rows={3} />
              <LoadingSkeleton variant="table" rows={9} />
            </div>
          )}

          {!isLoading && error && (
            <ChartErrorState message={error} onRetry={() => void handleCalculate()} />
          )}

          {!isLoading && !error && !result && (
            <ChartEmptyState
              icon={<ArrowRightLeft className="h-8 w-8" />}
              title={t.emptyTitle}
              description={t.emptyDesc}
            />
          )}

          {!isLoading && result && (
            <div className="space-y-6">
              {/* Scaffold disclaimer — top of result area */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                <Badge variant="secondary" className="shrink-0 text-xs">{isHi ? 'स्कैफोल्ड' : 'Scaffold'}</Badge>
                <p className={cn('text-xs text-muted-foreground', isHi && 'font-hindi')}>
                  {isHi
                    ? 'यह टाइमलाइन स्कैफोल्ड डेटा दिखाती है। '
                    : 'This timeline uses scaffold data. '}
                  <a href="/accuracy" className="underline text-violet-700 dark:text-violet-400 hover:no-underline">
                    {isHi ? t.trackEngineProgressHi : t.trackEngineProgress}
                  </a>
                </p>
              </div>
              <ValidationInProgressNotice compact={true} />
              <h2
                ref={resultRef}
                tabIndex={-1}
                className={cn('text-lg font-bold text-foreground flex items-center gap-2 outline-none', isHi && 'font-hindi')}
              >
                <Star className="h-5 w-5 text-teal-500" aria-hidden="true" />
                {t.timelineHeading}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {result.startDate} → {(() => {
                    const d = new Date(result.startDate);
                    d.setDate(d.getDate() + result.totalDays);
                    return d.toISOString().split('T')[0];
                  })()}
                </Badge>
              </h2>

              {/* ── Quick-range view filter ──────────────────────────────── */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-xs text-muted-foreground', isHi && 'font-hindi')}>
                    {t.viewRange}:
                  </span>
                  {(['6m', '12m', '24m', 'all'] as ViewRange[]).map((vr) => (
                    <button
                      key={vr}
                      type="button"
                      onClick={() => setViewRange(vr)}
                      aria-pressed={viewRange === vr}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        viewRange === vr
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-background text-muted-foreground border-border hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300',
                      )}
                    >
                      {vr === 'all' ? (isHi ? 'सभी' : 'All') : vr}
                    </button>
                  ))}
                </div>
                <p
                  className={cn(
                    'text-[11px] text-muted-foreground leading-snug pl-1',
                    isHi && 'font-hindi',
                  )}
                >
                  {t.viewRangeHelper}
                </p>
              </div>

              <LegendPanel lang={isHi ? 'hi' : 'en'} />

              <Tabs defaultValue="timeline" value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="timeline">{isHi ? 'टाइमलाइन' : 'Timeline'}</TabsTrigger>
                  <TabsTrigger value="events">
                    {isHi ? 'घटनाएँ' : 'Events'}
                    <Badge variant="outline" className="ml-2 text-[10px]">{sortedEvents.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-0">
                  <TimelineGrid result={result} lang={isHi ? 'hi' : 'en'} viewDays={viewDays} />
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                  <Card>
                    <CardHeader className="py-3 px-4">
                      <CardTitle className={cn('text-sm', isHi && 'font-hindi')}>
                        <Filter className="inline h-4 w-4 mr-1.5 text-muted-foreground" aria-hidden="true" />
                        {isHi ? 'गोचर घटनाएँ' : 'Transit Events'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" aria-label="Transit events">
                          <thead>
                            <tr className="bg-muted/50 text-left">
                              <th className="px-4 py-2.5 font-semibold">
                                {isHi ? 'दिनांक' : 'Date'}
                              </th>
                              <th className="px-4 py-2.5 font-semibold">
                                {isHi ? 'ग्रह' : 'Planet'}
                              </th>
                              <th className="px-4 py-2.5 font-semibold">
                                {isHi ? 'प्रकार' : 'Type'}
                              </th>
                              <th className="px-4 py-2.5 font-semibold">
                                {isHi ? 'विवरण' : 'Details'}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedEvents.map((ev, i) => {
                              const d = new Date(result.startDate);
                              d.setDate(d.getDate() + ev.dateOffset);
                              const isRetro = ev.type.includes('retrograde');
                              return (
                                <tr key={i} className="border-t border-border/60 hover:bg-muted/20 transition-colors">
                                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                                    {d.toISOString().split('T')[0]}
                                  </td>
                                  <td className="px-4 py-2 font-medium text-amber-700 dark:text-amber-400">
                                    {PLANET_SYMBOL[ev.planet]}{' '}
                                    {isHi ? (PLANET_HI[ev.planet] ?? ev.planet) : ev.planet}
                                  </td>
                                  <td className="px-4 py-2">
                                    <Badge
                                      variant={isRetro ? 'destructive' : 'secondary'}
                                      className="text-[10px]"
                                    >
                                      {ev.type.replace('-', ' ')}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-2 text-muted-foreground">
                                    {ev.label}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <p className={cn('text-xs text-center text-muted-foreground', isHi && 'font-hindi')}>
                {isHi
                  ? 'स्कैफ़ोल्ड: UI डेमो के लिए अनुमानित गोचर अवधि। वास्तविक एफ़ेमेरिस बैकएंड बाद में जोड़ा जाएगा।'
                  : 'Scaffold: Approximate transit durations for UI demo. Real ephemeris backend will be connected in a later phase.'}
                {' '}
                <a
                  href="/accuracy"
                  className="underline underline-offset-2 text-teal-600 dark:text-teal-400 hover:text-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {isHi ? t.trackEngineProgressHi : t.trackEngineProgress}
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
