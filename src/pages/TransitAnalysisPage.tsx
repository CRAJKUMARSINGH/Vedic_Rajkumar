/**
 * src/pages/TransitAnalysisPage.tsx
 * Professional Bilingual Transit Analysis Page
 *
 * Features:
 *  - Profile selector (localStorage + hardcoded profiles)
 *  - Date range: 30 / 90 / 365 / custom
 *  - Reference: Moon / Lagna / Both  (default Moon)
 *  - Transit results table with Vedha analysis
 *  - Ashtakavarga overlay tab
 *  - 4+ Favorable Transit scanner
 *  - Bilingual narrative (EN + HI)
 *  - PDF export via pdfExportService
 *  - Save to Supabase via /api/readings
 */

import React, { useState, useCallback, Suspense, lazy, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  Search,
  Zap,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
  CheckCircle2,
  Gem,
  Calendar,
  Printer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

import {
  calculateDynamicTransits,
  type DynamicTransitOutput,
} from '@/services/dynamicTransitService';
import {
  scanFourPlusTransits,
  findNearestFourPlusDate,
  generateWindowNarrative,
  type FavorableWindow,
  type HotDay,
  type FourPlusTransitResult,
} from '@/services/fourPlusTransitService';
import {
  buildApproxMoonDoubleTransitInput,
  checkMarriageMoonDoubleTransit,
  checkCareerMoonDoubleTransit,
  checkWealthMoonDoubleTransit,
  checkMoonDoubleTransit,
} from '@/services/doubleTransitService';
import { exportTransitWithNarrative } from '@/services/pdfExportService';
import { RASHIS } from '@/data/transitData';
import { calculateVimshottariDasha } from '@/services/dashaService';
import { generateRemedies, toJD, computePanchanga } from '@/services/vedicAstroEngine';
import DynamicRemediesPanel from '@/components/DynamicRemediesPanel';
import PanchangaTiles from '@/components/PanchangaTiles';
import CityPicker, { type CityPickerValue } from '@/components/CityPicker';
import { findCityByLabel, localToUtcTime } from '@/data/worldCities';

const AshtakavargaTransitOverlay = lazy(() => import('@/components/AshtakavargaTransitOverlay'));
const EventTransitAnalysisPanel  = lazy(() => import('@/components/EventTransitAnalysisPanel'));

// ─── Profiles ─────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  name: string;
  moonRashiIndex: number;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
}

const BUILT_IN_PROFILES: Profile[] = [
  {
    id: 'rajkumar',
    name: 'Rajkumar (Cancer / कर्क)',
    moonRashiIndex: 3,
    birthDate: '1963-09-15',
    birthTime: '06:00',
    birthLocation: 'Aspur, Dungarpur, Rajasthan',
  },
  {
    id: 'vishwaraj',
    name: 'Vishwaraj Singh Chauhan',
    moonRashiIndex: 4, // Leo — derived from DOB 26-Sep-1994
    birthDate: '1994-09-26',
    birthTime: '02:17',
    birthLocation: 'Indore, Madhya Pradesh',
  },
  {
    id: 'priyanka',
    name: 'Priyanka Jain',
    moonRashiIndex: 6, // Libra — from test reports
    birthDate: '1993-01-01',
    birthTime: '06:00',
    birthLocation: 'Indore, Madhya Pradesh',
  },
  {
    id: 'priyansh',
    name: 'Priyansh Singh Chauhan',
    moonRashiIndex: 3, // Cancer — DOB 2000-10-26, 00:50, Indore
    birthDate: '2000-10-26',
    birthTime: '00:50',
    birthLocation: 'Indore, Madhya Pradesh',
  },
];

function loadStoredProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem('userProfile');
    if (!raw) return [];
    const p = JSON.parse(raw);
    const details = p?.savedBirthDetails ?? [];
    return details
      .filter((d: Record<string, unknown>) => typeof d.moonRashiIndex === 'number')
      .map((d: Record<string, unknown>, i: number) => ({
        id: `stored-${i}`,
        name: d.name || d.location || `Profile ${i + 1}`,
        moonRashiIndex: d.moonRashiIndex,
        birthDate: d.date,
        birthTime: d.time,
        birthLocation: d.location,
      }));
  } catch {
    return [];
  }
}

function profileToBirthCity(p: Profile): CityPickerValue {
  const found = p.birthLocation ? findCityByLabel(p.birthLocation) : null;
  if (found) {
    return {
      label: found.label,
      lat: found.lat,
      lon: found.lon,
      utcOffsetHours: found.utcOffsetHours,
      dst: false,
    };
  }
  if (p.birthLocation?.includes('Aspur') || p.birthLocation?.includes('Rajasthan')) {
    return {
      label: p.birthLocation,
      lat: 23.84,
      lon: 74.07,
      utcOffsetHours: 5.5,
      dst: false,
    };
  }
  return {
    label: p.birthLocation ?? 'Indore, Madhya Pradesh',
    lat: 22.72,
    lon: 75.86,
    utcOffsetHours: 5.5,
    dst: false,
  };
}

const DEFAULT_EVENT_CITY: CityPickerValue = {
  label: 'Miami, USA',
  lat: 25.77,
  lon: -80.19,
  utcOffsetHours: -5,
  dst: true,
};

const RASHI_NAMES_EN = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];
const RASHI_NAMES_HI = [
  'मेष',
  'वृष',
  'मिथुन',
  'कर्क',
  'सिंह',
  'कन्या',
  'तुला',
  'वृश्चिक',
  'धनु',
  'मकर',
  'कुंभ',
  'मीन',
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function TransitAnalysisPage() {
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const allProfiles = [...BUILT_IN_PROFILES, ...loadStoredProfiles()];
  const [selectedProfileId, setSelectedProfileId] = useState<string>(allProfiles[0]?.id ?? '');
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [reference, setReference] = useState<'moon' | 'lagna' | 'both'>('moon');
  const [dateRange, setDateRange] = useState<'30' | '90' | '365' | 'custom'>('30');
  const [customStart, setCustomStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState<string>('');
  const [singleDate, setSingleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transitResult, setTransitResult] = useState<DynamicTransitOutput | null>(null);
  const [scanResult, setScanResult] = useState<FourPlusTransitResult | null>(null);
  const [nearestHotDay, setNearestHotDay] = useState<HotDay | null>(null);
  const [scanning, setScanning] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('results');

  // ── Event analysis state ───────────────────────────────────────────────────
  const [eventDate, setEventDate] = useState('2026-07-01');
  const [eventTime, setEventTime] = useState('16:00');
  const [eventTimeUTC, setEventTimeUTC] = useState('20:00'); // 4 PM EDT = 20:00 UTC
  const [eventCity, setEventCity] = useState<CityPickerValue>(DEFAULT_EVENT_CITY);
  const [birthCity, setBirthCity] = useState<CityPickerValue>(() =>
    profileToBirthCity(BUILT_IN_PROFILES[0] ?? { id: 'x', name: 'Guest', moonRashiIndex: 3 }),
  );
  const [eventType, setEventType] = useState<'interview' | 'exam' | 'business' | 'general'>('interview');
  const [eventDomainLabel, setEventDomainLabel] = useState('US Job Interview');
  const [showEventPanel, setShowEventPanel] = useState(false);

  const isHi = lang === 'hi';

  const selectedProfile = allProfiles.find(p => p.id === selectedProfileId) ?? allProfiles[0];
  const moonRashiIndex = selectedProfile?.moonRashiIndex ?? 3;
  const moonRashiName = isHi ? RASHI_NAMES_HI[moonRashiIndex] : RASHI_NAMES_EN[moonRashiIndex];

  const transitPanchanga = useMemo(() => {
    const [y, m, d] = singleDate.split('-').map(Number);
    if (!y || !m || !d) return null;
    return computePanchanga(toJD(y, m, d, 6));
  }, [singleDate]);

  useEffect(() => {
    if (selectedProfile) {
      setBirthCity(profileToBirthCity(selectedProfile));
    }
  }, [selectedProfileId, selectedProfile?.birthLocation]);

  const syncEventUtc = (time: string, city: CityPickerValue) => {
    setEventTimeUTC(localToUtcTime(time, city.utcOffsetHours, city.dst));
  };

  // ── Calculate single-date transit ─────────────────────────────────────────
  const handleCalculate = useCallback(async () => {
    if (!selectedProfile) return;
    setCalculating(true);
    try {
      const result = await calculateDynamicTransits({
        moonRashiIndex: selectedProfile.moonRashiIndex,
        date: new Date(singleDate + 'T06:00:00'),
        time: '06:00',
      });
      setTransitResult(result);
      setActiveTab('results');
      toast({ title: isHi ? '✓ गोचर गणना पूर्ण' : '✓ Transit calculated' });
    } catch (err) {
      toast({ title: isHi ? 'त्रुटि' : 'Error', description: String(err), variant: 'destructive' });
    } finally {
      setCalculating(false);
    }
  }, [selectedProfile, singleDate, isHi, toast]);

  // ── 4+ Transit scanner ─────────────────────────────────────────────────────
  const handleScan = useCallback(async () => {
    if (!selectedProfile) return;
    setScanning(true);
    setScanProgress(0);
    setScanResult(null);

    try {
      let start = new Date();
      let end: Date;

      if (dateRange === 'custom') {
        start = new Date(customStart + 'T00:00:00');
        end = customEnd
          ? new Date(customEnd + 'T00:00:00')
          : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        end = new Date(start.getTime() + parseInt(dateRange) * 24 * 60 * 60 * 1000);
      }

      const result = await scanFourPlusTransits(
        {
          moonRashiIndex: selectedProfile.moonRashiIndex,
          startDate: start,
          endDate: end,
          minFavorable: 4,
          minWindowDuration: 1,
        },
        (done, total) => setScanProgress(Math.round((done / total) * 100))
      );

      setScanResult(result);
      setActiveTab('scanner');
      toast({
        title: isHi
          ? `✓ ${result.summary.totalWindows} शुभ खिड़कियाँ मिलीं`
          : `✓ Found ${result.summary.totalWindows} favorable window(s)`,
      });
    } catch (err) {
      toast({ title: isHi ? 'त्रुटि' : 'Error', description: String(err), variant: 'destructive' });
    } finally {
      setScanning(false);
      setScanProgress(0);
    }
  }, [selectedProfile, dateRange, customStart, customEnd, isHi, toast]);

  // ── Find nearest 4+ date ───────────────────────────────────────────────────
  const handleFindNearest = useCallback(async () => {
    if (!selectedProfile) return;
    setScanning(true);
    try {
      const hot = await findNearestFourPlusDate(selectedProfile.moonRashiIndex);
      setNearestHotDay(hot);
      if (hot) {
        toast({
          title: isHi ? `✓ निकटतम शुभ तिथि: ${hot.date}` : `✓ Nearest favorable date: ${hot.date}`,
          description: isHi
            ? `${hot.score} ग्रह शुभ: ${hot.favorablePlanets.join(', ')}`
            : `${hot.score} favorable: ${hot.favorablePlanets.join(', ')}`,
        });
      } else {
        toast({ title: isHi ? 'कोई शुभ तिथि नहीं मिली' : 'No favorable date found in 365 days' });
      }
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  }, [selectedProfile, isHi, toast]);

  // ── PDF export ─────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (!transitResult || !selectedProfile) return;
    const narrativeEn = buildNarrativeEn(transitResult, selectedProfile);
    const narrativeHi = buildNarrativeHi(transitResult, selectedProfile);
    exportTransitWithNarrative(
      {
        birthDate: selectedProfile.birthDate ?? singleDate,
        birthTime: selectedProfile.birthTime ?? '06:00',
        birthLocation: selectedProfile.birthLocation ?? '',
        moonRashi: moonRashiName,
        transitDate: singleDate,
        results: transitResult.transits,
        overallScore: transitResult.totalScore,
        narrativeEn,
        narrativeHi,
        ayanamsa: 'Lahiri',
        ephemerisMode: 'SwissEph',
      },
      lang
    );
    toast({ title: isHi ? 'PDF डाउनलोड हो रही है…' : 'PDF downloading…' });
  }, [transitResult, selectedProfile, singleDate, moonRashiName, lang, isHi, toast]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1
                className={`text-3xl font-bold text-gray-900 dark:text-white ${isHi ? 'font-hindi' : ''}`}
              >
                {isHi ? '🔭 गोचर विश्लेषण' : '🔭 Transit Analysis'}
              </h1>
              <p className={`text-sm text-muted-foreground mt-1 ${isHi ? 'font-hindi' : ''}`}>
                {isHi
                  ? 'द्विभाषी पेशेवर रिपोर्ट • वेध-शुद्ध 4+ ग्रह स्कैनर'
                  : 'Bilingual professional report • Vedha-corrected 4+ planet scanner'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLang(l => (l === 'en' ? 'hi' : 'en'))}
              >
                {isHi ? 'EN' : 'हिं'}
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dynamic-transit">← {isHi ? 'सरल गोचर' : 'Simple Transit'}</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-violet-400 text-violet-700">
                <Link to="/event-transit">🎯 {isHi ? 'घटना विश्लेषण' : 'Event Analysis'}</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Controls ──────────────────────────────────────────────────── */}
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardHeader className="pb-3">
            <CardTitle className={`text-base ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? '⚙️ विश्लेषण सेटिंग्स' : '⚙️ Analysis Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Profile */}
            <div className="space-y-1">
              <Label className={isHi ? 'font-hindi' : ''}>{isHi ? 'प्रोफाइल' : 'Profile'}</Label>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allProfiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Birth place (CityPicker — lat/lon for event analysis) */}
            <div className="space-y-1 sm:col-span-2">
              <CityPicker
                label={isHi ? 'जन्म स्थान' : 'Birth Place'}
                value={birthCity}
                onChange={setBirthCity}
                showDst={false}
                lang={lang}
              />
            </div>

            {/* Reference */}
            <div className="space-y-1">
              <Label className={isHi ? 'font-hindi' : ''}>{isHi ? 'संदर्भ' : 'Reference'}</Label>
              <Select
                value={reference}
                onValueChange={v => setReference(v as 'moon' | 'lagna' | 'both')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moon">{isHi ? 'चंद्र राशि' : 'Moon Sign'}</SelectItem>
                  <SelectItem value="lagna">{isHi ? 'लग्न' : 'Lagna'}</SelectItem>
                  <SelectItem value="both">{isHi ? 'दोनों' : 'Both'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Single date */}
            <div className="space-y-1">
              <Label className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'गोचर तिथि' : 'Transit Date'}
              </Label>
              <Input type="date" value={singleDate} onChange={e => setSingleDate(e.target.value)} />
            </div>

            {/* Calculate button */}
            <div className="flex items-end">
              <Button
                onClick={handleCalculate}
                disabled={calculating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {calculating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                <span className={isHi ? 'font-hindi' : ''}>
                  {calculating
                    ? isHi
                      ? 'गणना…'
                      : 'Calculating…'
                    : isHi
                      ? 'गोचर देखें'
                      : 'Calculate Transit'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── 4+ Scanner Controls ────────────────────────────────────────── */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className={`text-base flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
              <Zap className="w-4 h-4 text-amber-500" />
              {isHi ? '4+ शुभ गोचर स्कैनर' : '4+ Favorable Transit Scanner'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date range */}
            <div className="space-y-1">
              <Label className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'तिथि सीमा' : 'Date Range'}
              </Label>
              <Select
                value={dateRange}
                onValueChange={v => setDateRange(v as '30' | '90' | '365' | 'custom')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">{isHi ? '30 दिन' : '30 days'}</SelectItem>
                  <SelectItem value="90">{isHi ? '90 दिन' : '90 days'}</SelectItem>
                  <SelectItem value="365">{isHi ? '1 वर्ष' : '1 year'}</SelectItem>
                  <SelectItem value="custom">{isHi ? 'कस्टम' : 'Custom'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom range */}
            {dateRange === 'custom' && (
              <>
                <div className="space-y-1">
                  <Label>{isHi ? 'शुरू' : 'From'}</Label>
                  <Input
                    type="date"
                    value={customStart}
                    onChange={e => setCustomStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{isHi ? 'अंत' : 'To'}</Label>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={e => setCustomEnd(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Scan + nearest buttons */}
            <div className="flex items-end gap-2 col-span-1 sm:col-span-2 lg:col-span-1">
              <Button
                onClick={handleScan}
                disabled={scanning}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {scanning ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-1" />
                )}
                <span className={isHi ? 'font-hindi' : ''}>
                  {scanning ? `${scanProgress}%` : isHi ? 'स्कैन करें' : 'Scan'}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={handleFindNearest}
                disabled={scanning}
                className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50"
              >
                <Star className="w-4 h-4 mr-1" />
                <span className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'निकटतम' : 'Nearest'}
                </span>
              </Button>
            </div>
          </CardContent>

          {/* Nearest hot day banner */}
          {nearestHotDay && (
            <CardContent className="pt-0">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 p-4 flex flex-wrap gap-4 items-start">
                <div>
                  <p
                    className={`text-sm font-bold text-amber-800 dark:text-amber-200 ${isHi ? 'font-hindi' : ''}`}
                  >
                    {isHi
                      ? `⭐ निकटतम 4+ शुभ तिथि: ${nearestHotDay.date}`
                      : `⭐ Nearest 4+ date: ${nearestHotDay.date}`}
                  </p>
                  <p
                    className={`text-xs text-amber-700 dark:text-amber-300 mt-1 ${isHi ? 'font-hindi' : ''}`}
                  >
                    {isHi
                      ? `${nearestHotDay.score} ग्रह शुभ (वेध-रहित): ${nearestHotDay.favorablePlanets.join(', ')}`
                      : `${nearestHotDay.score} effectively favorable (no Vedha): ${nearestHotDay.favorablePlanets.join(', ')}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto border-amber-400 text-amber-700"
                  onClick={() => {
                    setSingleDate(nearestHotDay.date);
                    handleCalculate();
                  }}
                >
                  {isHi ? 'विश्लेषण देखें' : 'View Analysis'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* -- Event Transit Analysis Card ------------------------------------ */}
        <Card className="border-violet-200 dark:border-violet-800">
          <CardHeader className="pb-3">
            <CardTitle className={`text-base flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
              <Calendar className="w-4 h-4 text-violet-500" />
              {isHi ? '🎯 घटना गोचर विश्लेषण' : '🎯 Event Transit Analysis'}
              <span className="text-xs font-normal text-muted-foreground ml-2">
                {isHi ? '(साक्षात्कार / परीक्षा / बैठक)' : '(Interview / Exam / Meeting)'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label>{isHi ? 'घटना तिथि' : 'Event Date'}</Label>
              <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{isHi ? 'स्थानीय समय' : 'Local Time'}</Label>
              <Input
                type="time"
                value={eventTime}
                onChange={e => {
                  setEventTime(e.target.value);
                  syncEventUtc(e.target.value, eventCity);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>{isHi ? 'UTC समय (एप्स के लिए)' : 'UTC Time (for ephemeris)'}</Label>
              <Input type="time" value={eventTimeUTC} onChange={e => setEventTimeUTC(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <CityPicker
                label={isHi ? 'घटना स्थान' : 'Event Location'}
                value={eventCity}
                onChange={city => {
                  setEventCity(city);
                  syncEventUtc(eventTime, city);
                }}
                showDst
                lang={lang}
              />
            </div>
            <div className="space-y-1">
              <Label>{isHi ? 'प्रकार' : 'Event Type'}</Label>
              <Select value={eventType} onValueChange={v => setEventType(v as typeof eventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview">{isHi ? 'साक्षात्कार' : 'Interview'}</SelectItem>
                  <SelectItem value="exam">{isHi ? 'परीक्षा' : 'Exam'}</SelectItem>
                  <SelectItem value="business">{isHi ? 'व्यापार' : 'Business'}</SelectItem>
                  <SelectItem value="general">{isHi ? 'सामान्य' : 'General'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>{isHi ? 'संदर्भ लेबल' : 'Domain Label'}</Label>
              <Input value={eventDomainLabel} onChange={e => setEventDomainLabel(e.target.value)} placeholder="US Job Interview at RIB U.S. Cost" />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setShowEventPanel(true)}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Star className="w-4 h-4 mr-2" />
                <span className={isHi ? 'font-hindi' : ''}>
                  {isHi ? 'विश्लेषण करें' : 'Analyse Event'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* -- Event Panel results -------------------------------------------- */}
        {showEventPanel && selectedProfile && (
          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading event analysis…</div>}>
            <EventTransitAnalysisPanel
              profile={{
                name: selectedProfile.name,
                birthDate: selectedProfile.birthDate ?? '2000-01-01',
                birthTime: selectedProfile.birthTime ?? '06:00',
                birthLat: birthCity.lat,
                birthLon: birthCity.lon,
                moonRashiIndex: selectedProfile.moonRashiIndex,
              }}
              event={{
                eventDate,
                eventTime,
                eventTimeUTC,
                eventLocation: eventCity.label,
                eventType,
                domainLabel: eventDomainLabel,
              }}
              lang={lang}
              shareContext={{
                birthCityLabel: birthCity.label,
                birthDst: birthCity.dst,
                eventDst: eventCity.dst,
              }}
            />
          </Suspense>
        )}

        {/* -- Results Tabs ---------------------------------------------------- */}
        {(transitResult || scanResult) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full h-auto p-1">
              <TabsTrigger
                value="results"
                className={`text-[10px] py-2 flex flex-col gap-0.5 ${isHi ? 'font-hindi' : ''}`}
              >
                <TrendingUp className="w-3 h-3" />
                {isHi ? '??????' : 'Results'}
              </TabsTrigger>
              <TabsTrigger
                value="activation"
                className={`text-[10px] py-2 flex flex-col gap-0.5 ${isHi ? 'font-hindi' : ''}`}
              >
                <Users className="w-3 h-3" />
                {isHi ? '????????' : 'Activation'}
              </TabsTrigger>
              <TabsTrigger
                value="remedies"
                className={`text-[10px] py-2 flex flex-col gap-0.5 ${isHi ? 'font-hindi' : ''}`}
              >
                <Gem className="w-3 h-3" />
                {isHi ? '????' : 'Remedies'}
              </TabsTrigger>
              <TabsTrigger
                value="ashtakavarga"
                className={`text-[10px] py-2 flex flex-col gap-0.5 ${isHi ? 'font-hindi' : ''}`}
              >
                <Star className="w-3 h-3" />
                {isHi ? '?????' : 'Ashtak'}
              </TabsTrigger>
              <TabsTrigger
                value="scanner"
                className={`text-[10px] py-2 flex flex-col gap-0.5 ${isHi ? 'font-hindi' : ''}`}
              >
                <Zap className="w-3 h-3" />
                {isHi ? '4+ ?????' : '4+ Scan'}
              </TabsTrigger>
            </TabsList>

            {/* Transit Results */}
            <TabsContent value="results" className="mt-4">
              {transitResult && (
                <TransitResultsPanel
                  result={transitResult}
                  moonRashiName={moonRashiName}
                  lang={lang}
                  onExport={handleExport}
                  singleDate={singleDate}
                  profileName={selectedProfile?.name ?? ''}
                  panchanga={transitPanchanga}
                />
              )}
            </TabsContent>

            {/* Topic Activation � Double Transit */}
            <TabsContent value="activation" className="mt-4">
              {transitResult && (
                <TopicActivationPanel
                  moonRashiIndex={moonRashiIndex}
                  transitDate={singleDate}
                  lang={lang}
                />
              )}
            </TabsContent>

            {/* Remedies & Guidance */}
            <TabsContent value="remedies" className="mt-4">
              {transitResult && <RemediesPanel result={transitResult} profile={selectedProfile} lang={lang} />}
            </TabsContent>

            {/* Ashtakavarga */}
            <TabsContent value="ashtakavarga" className="mt-4">
              {transitResult && (
                <Suspense
                  fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}
                >
                  <AshtakavargaTransitOverlay
                    transitingPlanets={transitResult.transits.map(t => ({
                      planet: t.planet.en,
                      house: t.houseFromMoon,
                    }))}
                    lang={lang}
                  />
                </Suspense>
              )}
            </TabsContent>

            {/* 4+ Scanner results */}
            <TabsContent value="scanner" className="mt-4">
              {scanResult && (
                <FourPlusScannerPanel
                  result={scanResult}
                  moonRashiName={moonRashiName}
                  lang={lang}
                  onSelectDate={date => {
                    setSingleDate(date);
                    setActiveTab('results');
                    handleCalculate();
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        )}

        {!transitResult && !scanResult && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-20">🔭</div>
            <p className={`text-muted-foreground text-sm ${isHi ? 'font-hindi' : ''}`}>
              {isHi
                ? 'तिथि चुनें और "गोचर देखें" दबाएं, या "स्कैन करें" से शुभ खिड़कियाँ खोजें।'
                : 'Select a date and click "Calculate Transit", or use "Scan" to find favorable windows.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Transit Results Panel ─────────────────────────────────────────────────────

interface TransitResultsPanelProps {
  result: DynamicTransitOutput;
  moonRashiName: string;
  lang: 'en' | 'hi';
  onExport: () => void;
  singleDate: string;
  profileName: string;
  panchanga: ReturnType<typeof computePanchanga> | null;
}

function TransitResultsPanel({ result, lang, onExport, profileName, panchanga }: TransitResultsPanelProps) {
  const isHi = lang === 'hi';
  const favorable = result.transits.filter(t => t.effectiveStatus === 'favorable');
  const obstructed = result.transits.filter(t => t.effectiveStatus === 'mixed');
  const unfavorable = result.transits.filter(t => t.effectiveStatus === 'unfavorable');

  const statusColor = {
    favorable: 'text-green-600 bg-green-50 border-green-200',
    mixed: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    unfavorable: 'text-red-600 bg-red-50 border-red-200',
  };

  const narrativeEn = buildNarrativeEn(result, {
    name: profileName,
    moonRashiIndex: result.moonRashiIndex,
  });
  const narrativeHi = buildNarrativeHi(result, {
    name: profileName,
    moonRashiIndex: result.moonRashiIndex,
  });

  return (
    <div className="space-y-4">
      {panchanga && (
        <Card className="border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? '📅 गोचर तिथि पंचांग' : '📅 Transit Date Panchanga'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PanchangaTiles panchanga={panchanga} lang={lang} />
          </CardContent>
        </Card>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-indigo-700">{result.totalScore}</div>
          <div className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'कुल स्कोर' : 'Total Score'}
          </div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-green-600">{favorable.length}</div>
          <div className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'शुभ (वेध-रहित)' : 'Favorable (no Vedha)'}
          </div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-yellow-600">{obstructed.length}</div>
          <div className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'वेध-बाधित' : 'Vedha-blocked'}
          </div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-red-600">{unfavorable.length}</div>
          <div className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'अशुभ' : 'Unfavorable'}
          </div>
        </Card>
      </div>

      {/* Bilingual narrative */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-800 dark:text-blue-300">
              🇬🇧 English Narrative
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed whitespace-pre-line">
              {narrativeEn}
            </p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-orange-800 dark:text-orange-300 font-hindi">
              🇮🇳 हिंदी विवरण
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-hindi text-orange-900 dark:text-orange-200 leading-relaxed whitespace-pre-line">
              {narrativeHi}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Planet-by-planet table */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className={`text-base ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'ग्रह-वार गोचर विवरण' : 'Planet-wise Transit Details'}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1" />
              {isHi ? 'प्रिंट' : 'Print'}
            </Button>
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download className="w-4 h-4 mr-1" />
              {isHi ? 'PDF' : 'Export PDF'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left bg-muted/50">
                <th className={`p-2 font-semibold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'ग्रह' : 'Planet'}
                </th>
                <th className={`p-2 font-semibold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'राशि' : 'Rashi'}
                </th>
                <th className={`p-2 font-semibold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'भाव' : 'House'}
                </th>
                <th className={`p-2 font-semibold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'वेध' : 'Vedha'}
                </th>
                <th className={`p-2 font-semibold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'स्थिति' : 'Status'}
                </th>
                <th className={`p-2 font-semibold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'प्रभाव' : 'Effect'}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.transits.map((t, i) => (
                <tr key={i} className="border-b hover:bg-muted/30">
                  <td className="p-2 font-bold">
                    {t.planet.symbol} {isHi ? t.planet.hi : t.planet.en}
                  </td>
                  <td className="p-2">
                    {RASHIS[t.currentRashi]?.symbol}{' '}
                    {isHi ? RASHIS[t.currentRashi]?.hi : RASHIS[t.currentRashi]?.en}
                  </td>
                  <td className="p-2 text-center">{t.houseFromMoon}</td>
                  <td className="p-2 text-center">
                    {t.vedhaActive ? (
                      <Badge
                        variant="outline"
                        className="text-yellow-700 border-yellow-400 bg-yellow-50 text-[10px]"
                      >
                        {t.vedhaNote}
                      </Badge>
                    ) : (
                      <span className="text-green-600 text-[10px]">{isHi ? 'नहीं' : 'None'}</span>
                    )}
                  </td>
                  <td className="p-2">
                    <Badge
                      className={`text-[10px] border ${statusColor[t.effectiveStatus as keyof typeof statusColor]}`}
                    >
                      {t.effectiveStatus === 'favorable'
                        ? isHi
                          ? 'शुभ'
                          : 'Favorable'
                        : t.effectiveStatus === 'mixed'
                          ? isHi
                            ? 'वेध-बाधित'
                            : 'Vedha-blocked'
                          : isHi
                            ? 'अशुभ'
                            : 'Unfavorable'}
                    </Badge>
                  </td>
                  <td className={`p-2 text-muted-foreground max-w-xs ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? t.effectHi : t.effectEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 4+ Scanner Panel ──────────────────────────────────────────────────────────

interface FourPlusScannerPanelProps {
  result: FourPlusTransitResult;
  moonRashiName: string;
  lang: 'en' | 'hi';
  onSelectDate: (date: string) => void;
}

function FourPlusScannerPanel({
  result,
  moonRashiName,
  lang,
  onSelectDate,
}: FourPlusScannerPanelProps) {
  const isHi = lang === 'hi';

  if (result.windows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className={`text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi
              ? 'इस सीमा में कोई 4+ शुभ खिड़की नहीं मिली।'
              : 'No 4+ favorable windows found in this range.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-indigo-700">
            {result.summary.totalDaysScanned}
          </div>
          <div className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'दिन स्कैन किए' : 'Days scanned'}
          </div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-amber-600">{result.summary.totalHotDays}</div>
          <div className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'शुभ दिन' : 'Hot days'}
          </div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-green-600">{result.summary.totalWindows}</div>
          <div className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'अनुकूल खिड़कियाँ' : 'Favorable windows'}
          </div>
        </Card>
      </div>

      {/* Windows list */}
      <div className="space-y-3">
        {result.windows.map((w, i) => (
          <WindowCard
            key={i}
            window={w}
            moonRashiName={moonRashiName}
            lang={lang}
            rank={i + 1}
            onSelect={onSelectDate}
          />
        ))}
      </div>
    </div>
  );
}

function WindowCard({
  window: w,
  moonRashiName,
  lang,
  rank,
  onSelect,
}: {
  window: FavorableWindow;
  moonRashiName: string;
  lang: 'en' | 'hi';
  rank: number;
  onSelect: (date: string) => void;
}) {
  const isHi = lang === 'hi';
  const narrative = generateWindowNarrative(w, moonRashiName, lang);

  const peakBg =
    w.peakScore >= 6
      ? 'from-green-600 to-emerald-500'
      : w.peakScore >= 5
        ? 'from-amber-500 to-yellow-400'
        : 'from-indigo-500 to-purple-500';

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <div
        className={`bg-gradient-to-r ${peakBg} text-white p-3 flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <span className="font-black text-lg">#{rank}</span>
          <span className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>
            {w.startDate === w.endDate ? w.startDate : `${w.startDate} → ${w.endDate}`}
            {w.durationDays > 1 && ` (${w.durationDays}d)`}
          </span>
        </div>
        <Badge className="bg-white/20 text-white border-white/30 font-bold">
          {isHi ? `${w.peakScore} शुभ` : `${w.peakScore} favorable`}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {w.commonPlanets.map(p => (
            <Badge key={p} className="bg-green-100 text-green-800 border-green-300 text-[10px]">
              ✓ {p}
            </Badge>
          ))}
          {w.allPlanets
            .filter(p => !w.commonPlanets.includes(p))
            .map(p => (
              <Badge key={p} variant="outline" className="text-[10px]">
                {p}
              </Badge>
            ))}
        </div>
        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{narrative}</p>
        <Button
          size="sm"
          variant="outline"
          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          onClick={() => onSelect(w.peakDate)}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          {isHi ? 'शिखर तिथि विश्लेषण' : `Analyze peak date (${w.peakDate})`}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Bilingual narrative builders ──────────────────────────────────────────────

function buildNarrativeEn(
  result: DynamicTransitOutput,
  profile: { name?: string; moonRashiIndex: number }
): string {
  const rashi = RASHI_NAMES_EN[result.moonRashiIndex] ?? '';
  const favorable = result.transits.filter(t => t.effectiveStatus === 'favorable');
  const blocked = result.transits.filter(t => t.effectiveStatus === 'mixed');
  const unfav = result.transits.filter(t => t.effectiveStatus === 'unfavorable');

  const overallWord =
    result.totalScore >= 6
      ? 'strongly favorable'
      : result.totalScore >= 4
        ? 'moderately favorable'
        : result.totalScore >= 2
          ? 'mixed'
          : 'challenging';

  let text = `Transit Analysis for ${profile.name ?? 'the native'} — Moon in ${rashi}\n\n`;
  text += `Date: ${result.date instanceof Date ? result.date.toISOString().split('T')[0] : String(result.date)}\n`;
  text += `Overall status: ${overallWord} (Score ${result.totalScore}/9).\n\n`;

  if (favorable.length > 0) {
    text += `FAVORABLE (${favorable.length} planets, no Vedha): ${favorable.map(t => t.planet.en).join(', ')}.\n`;
    text +=
      favorable.map(t => `  • ${t.planet.en} in H${t.houseFromMoon}: ${t.effectEn}`).join('\n') +
      '\n\n';
  }
  if (blocked.length > 0) {
    text += `VEDHA-BLOCKED (${blocked.length}): ${blocked.map(t => `${t.planet.en} (${t.vedhaNote})`).join(', ')}.\n\n`;
  }
  if (unfav.length > 0) {
    text += `UNFAVORABLE (${unfav.length}): ${unfav.map(t => t.planet.en).join(', ')}.\n`;
    text +=
      unfav.map(t => `  • ${t.planet.en} in H${t.houseFromMoon}: ${t.effectEn}`).join('\n') +
      '\n\n';
  }
  text += `Source: Vedic Rajkumar | Ayanamsa: Lahiri | Engine: Swiss Ephemeris`;
  return text;
}

function buildNarrativeHi(
  result: DynamicTransitOutput,
  profile: { name?: string; moonRashiIndex: number }
): string {
  const rashi = RASHI_NAMES_HI[result.moonRashiIndex] ?? '';
  const favorable = result.transits.filter(t => t.effectiveStatus === 'favorable');
  const blocked = result.transits.filter(t => t.effectiveStatus === 'mixed');
  const unfav = result.transits.filter(t => t.effectiveStatus === 'unfavorable');

  const overallWord =
    result.totalScore >= 6
      ? 'अत्यंत शुभ'
      : result.totalScore >= 4
        ? 'मध्यम शुभ'
        : result.totalScore >= 2
          ? 'मिश्रित'
          : 'चुनौतीपूर्ण';

  let text = `${profile.name ?? 'जातक'} के लिए गोचर विश्लेषण — चंद्र राशि: ${rashi}\n\n`;
  text += `तिथि: ${result.date instanceof Date ? result.date.toISOString().split('T')[0] : String(result.date)}\n`;
  text += `समग्र स्थिति: ${overallWord} (स्कोर ${result.totalScore}/9)।\n\n`;

  if (favorable.length > 0) {
    text += `शुभ ग्रह (${favorable.length}, वेध-रहित): ${favorable.map(t => t.planet.hi).join(', ')}।\n`;
    text +=
      favorable.map(t => `  • ${t.planet.hi} भाव ${t.houseFromMoon}: ${t.effectHi}`).join('\n') +
      '\n\n';
  }
  if (blocked.length > 0) {
    text += `वेध-बाधित (${blocked.length}): ${blocked.map(t => `${t.planet.hi} (${t.vedhaNote})`).join(', ')}।\n\n`;
  }
  if (unfav.length > 0) {
    text += `अशुभ ग्रह (${unfav.length}): ${unfav.map(t => t.planet.hi).join(', ')}।\n`;
    text +=
      unfav.map(t => `  • ${t.planet.hi} भाव ${t.houseFromMoon}: ${t.effectHi}`).join('\n') +
      '\n\n';
  }
  text += `स्रोत: वैदिक राजकुमार | अयनांश: लाहिरी | इंजन: स्विस एफेमेरिस`;
  return text;
}

// --- Topic Activation Panel (Double Transit) ----------------------------------

interface TopicActivationPanelProps {
  moonRashiIndex: number;
  transitDate: string;
  lang: 'en' | 'hi';
}

function TopicActivationPanel({ moonRashiIndex, transitDate, lang }: TopicActivationPanelProps) {
  const isHi = lang === 'hi';
  const date = new Date(transitDate + 'T06:00:00');
  const dtInput = buildApproxMoonDoubleTransitInput(moonRashiIndex, date);

  const topics = [
    {
      key: 'marriage',
      labelEn: 'Marriage & Partnership',
      labelHi: 'vivah',
      result: checkMarriageMoonDoubleTransit(dtInput),
    },
    {
      key: 'career',
      labelEn: 'Career & Status',
      labelHi: 'career',
      result: checkCareerMoonDoubleTransit(dtInput),
    },
    {
      key: 'wealth',
      labelEn: 'Wealth & Family',
      labelHi: 'dhan',
      result: checkWealthMoonDoubleTransit(dtInput),
    },
    {
      key: 'property',
      labelEn: 'Property & Comforts',
      labelHi: 'sampatti',
      result: checkMoonDoubleTransit(dtInput, 'custom', { jupiter: [4, 12], saturn: [4, 7] }),
    },
    {
      key: 'child',
      labelEn: 'Progeny & Creativity',
      labelHi: 'santan',
      result: checkMoonDoubleTransit(dtInput, 'child', { jupiter: [5, 9], saturn: [5, 3] }),
    },
    {
      key: 'foreign',
      labelEn: 'Foreign & Spiritual',
      labelHi: 'videsh',
      result: checkMoonDoubleTransit(dtInput, 'foreign', { jupiter: [12, 9], saturn: [12, 3] }),
    },
  ] as const;

  const activeCount = topics.filter(t => t.result.isActive).length;

  const confidenceColor = (c: string) =>
    c === 'high'
      ? 'border-green-400 text-green-700'
      : c === 'moderate'
        ? 'border-amber-400 text-amber-700'
        : 'border-slate-300 text-slate-500';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-xs text-muted-foreground">{isHi ? 'Active' : 'Active'}</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-amber-600">
            {topics.filter(t => !t.result.isActive && t.result.confidence === 'moderate').length}
          </div>
          <div className="text-xs text-muted-foreground">Partial</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-slate-500">{topics.length - activeCount}</div>
          <div className="text-xs text-muted-foreground">Inactive</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {topics.map(topic => (
          <Card
            key={topic.key}
            className={`border ${topic.result.isActive ? 'border-green-300 bg-green-50/50 dark:bg-green-950/10' : 'border-slate-200 dark:border-slate-700'}`}
          >
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${topic.result.isActive ? 'text-green-600' : 'text-slate-300'}`}
                />
                <CardTitle className="text-sm font-semibold">{topic.labelEn}</CardTitle>
                <Badge
                  variant="outline"
                  className={`ml-auto text-[9px] px-1.5 py-0 ${confidenceColor(topic.result.confidence)}`}
                >
                  {topic.result.confidence}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  Jupiter H{topic.result.jupiterHouse} ({topic.result.jupiterRashi})
                </span>
                <span>
                  Saturn H{topic.result.saturnHouse} ({topic.result.saturnRashi})
                </span>
              </div>
              <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                {topic.result.narrative}
              </p>
              <p
                className={`text-xs font-semibold ${topic.result.isActive ? 'text-green-700' : 'text-slate-400'}`}
              >
                {topic.result.thereforeVerdict}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground italic px-1">
        {isHi
          ? 'Note: Jupiter/Saturn positions use approximate table. Cross-check with Results tab for exact data.'
          : 'Note: Jupiter/Saturn positions use an approximate table. Cross-check with Results tab for exact data.'}
      </p>
    </div>
  );
}

// --- Remedies & Guidance Panel -------------------------------------------------

interface RemediesPanelProps {
  result: DynamicTransitOutput;
  profile: Profile;
  lang: 'en' | 'hi';
}

function RemediesPanel({ result, profile, lang }: RemediesPanelProps) {
  const isHi = lang === 'hi';

  const challenged = result.transits.filter(
    t => t.effectiveStatus === 'unfavorable' || t.effectiveStatus === 'mixed'
  );
  const favorable = result.transits.filter(t => t.effectiveStatus === 'favorable');

  const dynamicRemedies = React.useMemo(() => {
    const dasha = calculateVimshottariDasha(
      profile.birthDate ?? '2000-01-01',
      profile.birthTime ?? '06:00',
    );
    const md = dasha.currentMahadasha?.planet ?? 'Jupiter';
    const ad = dasha.currentAntardasha?.planet ?? md;
    const debilitated = challenged.map(t => t.planet.en);
    const afflicted = challenged.map(t => ({ planet: t.planet.en, house: t.houseFromMoon }));
    return generateRemedies(md, ad, debilitated, afflicted);
  }, [profile.birthDate, profile.birthTime, challenged]);

  const overallWord =
    result.totalScore >= 6
      ? 'Very Favorable'
      : result.totalScore >= 4
        ? 'Moderately Favorable'
        : result.totalScore >= 2
          ? 'Mixed'
          : 'Challenging';

  const overallBg =
    result.totalScore >= 6
      ? 'bg-green-50 border-green-200'
      : result.totalScore >= 4
        ? 'bg-amber-50 border-amber-200'
        : result.totalScore >= 2
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-5">
      <Card className={`border ${overallBg}`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="text-3xl">
            {result.totalScore >= 6
              ? '??'
              : result.totalScore >= 4
                ? '??'
                : result.totalScore >= 2
                  ? '?'
                  : '??'}
          </div>
          <div>
            <p className="font-bold text-base">
              {isHi ? 'Overall: ' : 'Overall: '}
              {overallWord} ({result.totalScore}/9)
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {result.totalScore <= 2
                ? 'Exercise caution. Favor spiritual activities and reflection.'
                : result.totalScore <= 5
                  ? 'Mixed day � maintain balance and avoid major decisions.'
                  : 'Favorable day � proceed with plans.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <DynamicRemediesPanel remedies={dynamicRemedies} lang={lang} />

      {challenged.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">
            {isHi ? 'चुनौतीपूर्ण ग्रह — गोचर विवरण' : 'Challenged Planets — Transit Detail'}
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {challenged.map((t, i) => (
              <Card key={i} className="border-red-100 dark:border-red-900/30">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span>{t.planet.symbol}</span>
                    <span>{isHi ? t.planet.hi : t.planet.en}</span>
                    <Badge
                      variant="outline"
                      className={`ml-auto text-[9px] ${
                        t.effectiveStatus === 'mixed'
                          ? 'border-amber-400 text-amber-700'
                          : 'border-red-400 text-red-700'
                      }`}
                    >
                      {t.effectiveStatus === 'mixed' ? 'Vedha' : 'Unfav'}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    House {t.houseFromMoon} from Moon
                    {t.vedhaActive && ` · Vedha: ${t.vedhaNote}`}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isHi ? t.effectHi : t.effectEn}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {favorable.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">
            Best Use of Favorable Planets
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {favorable.map((t, i) => (
              <Card key={i} className="border-green-100 dark:border-green-900/30 bg-green-50/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{t.planet.symbol}</span>
                    <span className="font-semibold text-sm">
                      {isHi ? t.planet.hi : t.planet.en}
                    </span>
                    <Badge className="ml-auto text-[9px] bg-green-100 text-green-800 border-green-300">
                      H{t.houseFromMoon}
                    </Badge>
                  </div>
                  <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                    {isHi ? t.effectHi : t.effectEn}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
            General Guidance
          </p>
          <p className="text-xs leading-5 text-indigo-700 dark:text-indigo-400">
            {isHi
              ? 'Transit results are based on Phaladeepika and BPHS principles. For important decisions, consult a qualified astrologer.'
              : 'Transit results are based on Phaladeepika and BPHS principles. Individual chart analysis may yield different results. For important decisions, consult a qualified astrologer.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
