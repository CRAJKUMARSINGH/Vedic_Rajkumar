/**
 * src/pages/EventTransitPage.tsx
 *
 * Standalone page for single-event (interview / exam / meeting) transit analysis.
 * Route: /event-transit
 *
 * Features:
 *  - Birth profile entry (or select from saved/built-in profiles)
 *  - Event details form (date, time, UTC offset, location, type, label)
 *  - Quick-fill presets (Priyansh Miami Interview, etc.)
 *  - Renders EventTransitAnalysisPanel (8 tabs)
 *  - Supports shareable URL query params to prefill the form
 */

import { useState, Suspense, lazy, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEO } from '@/components/SEO';
import CityPicker, { type CityPickerValue } from '@/components/CityPicker';
import { findCityByLabel, localToUtcTime } from '@/data/worldCities';
import type { EventProfile, EventInput } from '@/services/eventTransitAnalysisService';
import {
  hasEventShareParams,
  parseEventShareParams,
  shouldAutoRunFromShare,
} from '@/utils/eventShareUrl';

const EventTransitAnalysisPanel = lazy(() => import('@/components/EventTransitAnalysisPanel'));

// ─── Presets ──────────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  profile: EventProfile;
  event: EventInput;
}

const DEFAULT_BIRTH = findCityByLabel('Indore, Madhya Pradesh') ?? {
  label: 'Indore, Madhya Pradesh',
  lat: 22.72,
  lon: 75.86,
  utcOffsetHours: 5.5,
  country: 'India',
};
const DEFAULT_EVENT = findCityByLabel('Miami, USA') ?? {
  label: 'Miami, USA',
  lat: 25.77,
  lon: -80.19,
  utcOffsetHours: -5,
  country: 'USA',
};

function toPicker(city: typeof DEFAULT_BIRTH, dst = false): CityPickerValue {
  return {
    label: city.label,
    lat: city.lat,
    lon: city.lon,
    utcOffsetHours: city.utcOffsetHours,
    dst,
  };
}

const PRESETS: Preset[] = [
  {
    label: '🎯 Priyansh — Miami Interview (Jul 1, 2026, 4 PM EDT)',
    profile: {
      name: 'Priyansh Singh Chauhan',
      birthDate: '2000-10-26',
      birthTime: '00:50',
      birthLat: 22.72,
      birthLon: 75.86,
      moonRashiIndex: 3, // Cancer
      ascendantRashiIndex: 3, // Cancer Lagna (approx)
    },
    event: {
      eventDate: '2026-07-01',
      eventTime: '16:00',
      eventTimeUTC: '20:00',
      eventLocation: 'Miami, USA',
      eventType: 'interview',
      domainLabel: 'US Job Interview — RIB U.S. Cost, Miami',
      eventCompany: 'RIB U.S. Cost',
    },
  },
  {
    label: '🌟 Rajkumar — General Event Today',
    profile: {
      name: 'Rajkumar',
      birthDate: '1963-09-15',
      birthTime: '06:00',
      birthLat: 23.84,
      birthLon: 74.07,
      moonRashiIndex: 3, // Cancer
    },
    event: {
      eventDate: new Date().toISOString().split('T')[0],
      eventTime: '10:00',
      eventTimeUTC: '04:30',
      eventLocation: 'Indore, Madhya Pradesh',
      eventType: 'general',
      domainLabel: 'Career / Business Event',
    },
  },
];

const RASHI_NAMES = [
  'Aries (0)', 'Taurus (1)', 'Gemini (2)', 'Cancer (3)',
  'Leo (4)', 'Virgo (5)', 'Libra (6)', 'Scorpio (7)',
  'Sagittarius (8)', 'Capricorn (9)', 'Aquarius (10)', 'Pisces (11)',
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventTransitPage() {
  const [searchParams] = useSearchParams();
  const shareApplied = useRef(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const isHi = lang === 'hi';

  // Profile state
  const [pName,      setPName]      = useState('Priyansh Singh Chauhan');
  const [pBirthDate, setPBirthDate] = useState('2000-10-26');
  const [pBirthTime, setPBirthTime] = useState('00:50');
  const [pBirthCity, setPBirthCity] = useState<CityPickerValue>(() => toPicker(DEFAULT_BIRTH));
  const [pMoonRashi, setPMoonRashi] = useState<number>(3);
  const [pAscRashi,  setPAscRashi]  = useState<number>(3);

  // Event state
  const [eDate,    setEDate]    = useState('2026-07-01');
  const [eTime,    setETime]    = useState('16:00');
  const [eUTC,     setEUTC]     = useState('20:00');
  const [eEventCity, setEEventCity] = useState<CityPickerValue>(() => toPicker(DEFAULT_EVENT, true));
  const [eType,    setEType]    = useState<EventInput['eventType']>('interview');
  const [eLabel,   setELabel]   = useState('US Job Interview — RIB U.S. Cost, Miami');
  const [eCompany, setECompany] = useState('RIB U.S. Cost');

  const [showPanel, setShowPanel] = useState(false);
  const [profile, setProfile] = useState<EventProfile | null>(null);
  const [event,   setEvent]   = useState<EventInput | null>(null);

  const syncUtcFromEvent = (time: string, city: CityPickerValue) => {
    setEUTC(localToUtcTime(time, city.utcOffsetHours, city.dst));
  };

  const applyPreset = (p: Preset) => {
    setPName(p.profile.name);
    setPBirthDate(p.profile.birthDate);
    setPBirthTime(p.profile.birthTime);
    const birthCity =
      findCityByLabel('Indore, Madhya Pradesh') ??
      { ...DEFAULT_BIRTH, lat: p.profile.birthLat, lon: p.profile.birthLon };
    setPBirthCity(toPicker(birthCity));
    setPMoonRashi(p.profile.moonRashiIndex);
    setPAscRashi(p.profile.ascendantRashiIndex ?? p.profile.moonRashiIndex);
    setEDate(p.event.eventDate);
    setETime(p.event.eventTime);
    setEUTC(p.event.eventTimeUTC);
    const eventCity = findCityByLabel(p.event.eventLocation) ?? {
      ...DEFAULT_EVENT,
      label: p.event.eventLocation,
    };
    setEEventCity(toPicker(eventCity, p.event.eventLocation.includes('Miami')));
    setEType(p.event.eventType);
    setELabel(p.event.domainLabel ?? '');
    setECompany(p.event.eventCompany ?? '');
    setShowPanel(false);
  };

  const handleAnalyse = () => {
    setProfile({
      name: pName,
      birthDate: pBirthDate,
      birthTime: pBirthTime,
      birthLat: pBirthCity.lat,
      birthLon: pBirthCity.lon,
      moonRashiIndex: pMoonRashi,
      ascendantRashiIndex: pAscRashi,
    });
    setEvent({
      eventDate: eDate,
      eventTime: eTime,
      eventTimeUTC: eUTC,
      eventLocation: eEventCity.label,
      eventType: eType,
      domainLabel: eLabel,
      eventCompany: eCompany || undefined,
    });
    setShowPanel(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (shareApplied.current || !hasEventShareParams(searchParams)) return;
    const snapshot = parseEventShareParams(searchParams);
    if (!snapshot) return;
    shareApplied.current = true;

    const { profile: p, event: ev, birthCityLabel, birthDst, eventDst } = snapshot;
    setPName(p.name);
    setPBirthDate(p.birthDate);
    setPBirthTime(p.birthTime);
    setPBirthCity({
      label: birthCityLabel,
      lat: p.birthLat,
      lon: p.birthLon,
      utcOffsetHours: findCityByLabel(birthCityLabel)?.utcOffsetHours ?? 5.5,
      dst: birthDst,
    });
    setPMoonRashi(p.moonRashiIndex);
    setPAscRashi(p.ascendantRashiIndex ?? p.moonRashiIndex);
    setEDate(ev.eventDate);
    setETime(ev.eventTime);
    setEUTC(ev.eventTimeUTC);
    const eventCity = findCityByLabel(ev.eventLocation);
    setEEventCity({
      label: ev.eventLocation,
      lat: eventCity?.lat ?? 25.77,
      lon: eventCity?.lon ?? -80.19,
      utcOffsetHours: eventCity?.utcOffsetHours ?? -5,
      dst: eventDst,
    });
    setEType(ev.eventType);
    setELabel(ev.domainLabel ?? '');
    setECompany(ev.eventCompany ?? '');

    if (shouldAutoRunFromShare(searchParams)) {
      setProfile(p);
      setEvent(ev);
      setShowPanel(true);
    }
  }, [searchParams]);

  return (
    <>
      <SEO
        title="Event Transit Analysis — Interview, Exam & Meeting"
        description="Get a full Vedic transit prognosis for any important event: interview, exam, or meeting. Includes natal chart, event transits, dasha state, and guidance."
        keywords="event transit analysis, interview astrology, exam muhurta, vedic astrology"
        canonical="/event-transit"
      />

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 dark:from-violet-950 dark:via-indigo-950 dark:to-blue-950 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  🎯 {isHi ? 'घटना गोचर विश्लेषण' : 'Event Transit Analysis'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {isHi
                    ? 'साक्षात्कार / परीक्षा / बैठक के लिए पूर्ण वैदिक पूर्वानुमान'
                    : 'Full Vedic prognosis for any interview, exam or important meeting'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}>
                  {isHi ? 'EN' : 'हिं'}
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/transit-analysis">← {isHi ? 'गोचर विश्लेषण' : 'Transit Analysis'}</Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick presets */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                <Zap className="w-4 h-4" />
                {isHi ? 'त्वरित प्रीसेट' : 'Quick Presets'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <Button key={i} size="sm" variant="outline"
                  className="border-amber-300 text-amber-800 hover:bg-amber-50 text-xs"
                  onClick={() => applyPreset(p)}>
                  {p.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Profile form */}
          <Card className="border-indigo-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                {isHi ? 'जन्म विवरण' : 'Birth Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>{isHi ? 'नाम' : 'Name'}</Label>
                <Input value={pName} onChange={e => setPName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{isHi ? 'जन्म तिथि' : 'Birth Date'}</Label>
                <Input type="date" value={pBirthDate} onChange={e => setPBirthDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{isHi ? 'जन्म समय' : 'Birth Time'}</Label>
                <Input type="time" value={pBirthTime} onChange={e => setPBirthTime(e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <CityPicker
                  label={isHi ? 'जन्म स्थान' : 'Birth City'}
                  value={pBirthCity}
                  onChange={setPBirthCity}
                  showDst={false}
                  lang={lang}
                />
              </div>
              <div className="space-y-1">
                <Label>{isHi ? 'चंद्र राशि' : 'Moon Rashi'}</Label>
                <Select value={String(pMoonRashi)} onValueChange={v => setPMoonRashi(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RASHI_NAMES.map((r, i) => <SelectItem key={i} value={String(i)}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{isHi ? 'लग्न राशि' : 'Ascendant Rashi'}</Label>
                <Select value={String(pAscRashi)} onValueChange={v => setPAscRashi(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RASHI_NAMES.map((r, i) => <SelectItem key={i} value={String(i)}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Event form */}
          <Card className="border-violet-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                {isHi ? 'घटना विवरण' : 'Event Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>{isHi ? 'तिथि' : 'Date'}</Label>
                <Input type="date" value={eDate} onChange={e => setEDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isHi ? 'स्थानीय समय' : 'Local Time'}
                </Label>
                <Input
                  type="time"
                  value={eTime}
                  onChange={e => {
                    setETime(e.target.value);
                    syncUtcFromEvent(e.target.value, eEventCity);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {isHi ? 'UTC समय (एफेमेरिस)' : 'UTC Time (ephemeris)'}
                </Label>
                <Input type="time" value={eUTC} onChange={e => setEUTC(e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <CityPicker
                  label={isHi ? 'घटना स्थान' : 'Event Location'}
                  value={eEventCity}
                  onChange={city => {
                    setEEventCity(city);
                    syncUtcFromEvent(eTime, city);
                  }}
                  showDst
                  lang={lang}
                />
              </div>
              <div className="space-y-1">
                <Label>{isHi ? 'प्रकार' : 'Type'}</Label>
                <Select value={eType} onValueChange={v => setEType(v as typeof eType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interview">{isHi ? 'साक्षात्कार' : 'Interview'}</SelectItem>
                    <SelectItem value="exam">{isHi ? 'परीक्षा' : 'Exam'}</SelectItem>
                    <SelectItem value="business">{isHi ? 'व्यापार' : 'Business'}</SelectItem>
                    <SelectItem value="general">{isHi ? 'सामान्य' : 'General'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <Label>{isHi ? 'संदर्भ लेबल' : 'Label'}</Label>
                <Input value={eLabel} onChange={e => setELabel(e.target.value)} placeholder="US Job Interview..." />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>{isHi ? 'कंपनी / संगठन' : 'Company / Organization'}</Label>
                <Input value={eCompany} onChange={e => setECompany(e.target.value)} placeholder="RIB U.S. Cost, Google, etc." />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyse}
            size="lg"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white text-base py-6"
          >
            <Zap className="w-5 h-5 mr-2" />
            {isHi ? '🎯 घटना का विश्लेषण करें' : '🎯 Analyse This Event'}
          </Button>

          {/* Results panel */}
          {showPanel && profile && event && (
            <Suspense fallback={
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">
                  {isHi ? 'ग्रह स्थितियाँ गणना हो रही हैं…' : 'Calculating planetary positions…'}
                </p>
              </div>
            }>
              <EventTransitAnalysisPanel
                profile={profile}
                event={event}
                lang={lang}
                shareContext={{
                  birthCityLabel: pBirthCity.label,
                  birthDst: pBirthCity.dst,
                  eventDst: eEventCity.dst,
                }}
              />
            </Suspense>
          )}
        </div>
      </div>
    </>
  );
}
