/**
 * Karma-Vidhya Sanhita Panel (कर्म-विद्या संहिता)
 * "The Compendium of Career & Learning"
 *
 * Route: /vidhya-karma
 * 5 tabs: Chart · Education · Career & Auspiciousness · Ups & Downs · Remedies
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Star,
  Sparkles,
  Link,
  Check,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Activity,
} from 'lucide-react';
import KundliChart from '@/components/KundliChart';
import { calculateChart, calculateNavamsa } from '@/lib/vedic/vedicCalc';
import {
  analyzeEducation,
  analyzeCareer,
  analyzeCareerUpsDowns,
  getVidhyaKarmaRemedies,
  type CareerPhase,
  type FieldScore,
} from '@/lib/vedic/educationCareer';

/* ─────────────────────── Sample charts ─────────────────────────────────── */

const SAMPLE_CHARTS = [
  {
    label: 'Priyvrit Singh',
    labelHi: 'प्रियव्रत सिंह',
    name: 'Priyvrit Singh',
    date: '1999-10-08',
    time: '07:43',
    lat: 24.58,
    lon: 73.69,
    place: 'Udaipur, Rajasthan',
  },
] as const;

/* ─────────────────────── Grade colour helpers ─────────────────────────── */

function gradeColor(grade: FieldScore['grade']) {
  switch (grade) {
    case 'Excellent':  return 'bg-emerald-100 border-emerald-300 text-emerald-900';
    case 'Very Good':  return 'bg-green-100 border-green-300 text-green-900';
    case 'Good':       return 'bg-blue-100 border-blue-300 text-blue-900';
    case 'Average':    return 'bg-amber-100 border-amber-300 text-amber-900';
    case 'Challenging': return 'bg-rose-100 border-rose-300 text-rose-900';
  }
}
function gradeBarColor(grade: FieldScore['grade']) {
  switch (grade) {
    case 'Excellent':  return 'bg-emerald-500';
    case 'Very Good':  return 'bg-green-400';
    case 'Good':       return 'bg-blue-400';
    case 'Average':    return 'bg-amber-400';
    case 'Challenging': return 'bg-rose-400';
  }
}
function phaseColor(type: CareerPhase['type']) {
  switch (type) {
    case 'peak':          return 'border-emerald-300 bg-emerald-50/60';
    case 'rise':          return 'border-blue-300 bg-blue-50/60';
    case 'consolidation': return 'border-indigo-200 bg-indigo-50/40';
    case 'challenge':     return 'border-amber-300 bg-amber-50/60';
  }
}
function phaseTitleColor(type: CareerPhase['type']) {
  switch (type) {
    case 'peak':          return 'text-emerald-800';
    case 'rise':          return 'text-blue-800';
    case 'consolidation': return 'text-indigo-700';
    case 'challenge':     return 'text-amber-800';
  }
}

/* ─────────────────────────── Component ────────────────────────────────── */

export default function VidhyaKarmaDarshanPage() {
  const [searchParams] = useSearchParams();

  const [name,  setName]  = useState(() => searchParams.get('name')  ?? '');
  const [place, setPlace] = useState(() => searchParams.get('place') ?? '');
  const [date,  setDate]  = useState(() => searchParams.get('dob')   ?? '');
  const [time,  setTime]  = useState(() => searchParams.get('tob')   ?? '');
  const [lat,   setLat]   = useState(() => Number(searchParams.get('lat') ?? 24.58));
  const [lon,   setLon]   = useState(() => Number(searchParams.get('lon') ?? 73.69));
  const [lang,  setLang]  = useState<'en' | 'hi'>('hi');
  const [copied, setCopied] = useState(false);

  const isHi = lang === 'hi';

  const fillSample = (s: (typeof SAMPLE_CHARTS)[number]) => {
    setName(s.name); setDate(s.date); setTime(s.time);
    setLat(s.lat);   setLon(s.lon);  setPlace(s.place);
  };

  const handleCopyLink = () => {
    const p = new URLSearchParams();
    if (name)  p.set('name',  name);
    if (date)  p.set('dob',   date);
    if (time)  p.set('tob',   time);
    p.set('lat', String(lat));
    p.set('lon', String(lon));
    if (place) p.set('place', place);
    navigator.clipboard.writeText(
      `${window.location.origin}${window.location.pathname}?${p}`
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  const chartData = useMemo(() => {
    if (!date || !time) return null;
    const [y, m, d] = date.split('-').map(Number);
    const [h, min]  = time.split(':').map(Number);
    return calculateChart(y, m, d, h, min, lat, lon);
  }, [date, time, lat, lon]);

  const navamsaData = useMemo(
    () => (chartData ? calculateNavamsa(chartData) : null),
    [chartData]
  );

  const education = useMemo(
    () => (chartData && navamsaData ? analyzeEducation(chartData, navamsaData) : null),
    [chartData, navamsaData]
  );

  const career = useMemo(
    () => (chartData && navamsaData ? analyzeCareer(chartData, navamsaData) : null),
    [chartData, navamsaData]
  );

  const birthYear = useMemo(() => date ? Number(date.split('-')[0]) : 1999, [date]);

  const phases = useMemo(
    () => (chartData ? analyzeCareerUpsDowns(chartData, birthYear) : []),
    [chartData, birthYear]
  );

  const remedies = useMemo(() => getVidhyaKarmaRemedies(), []);
  const hasChart = !!chartData;

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      {/* Panel Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-500/10 to-teal-500/10 p-6 rounded-2xl border border-indigo-200">
        <div>
          <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            {isHi ? 'कर्म-विद्या संहिता' : 'Karma-Vidhya Sanhita'}
          </h1>
          <p className="text-sm text-indigo-700 font-medium mt-0.5">
            {isHi
              ? 'शिक्षा · करियर उपयुक्तता · व्यावसायिक गुण · उतार-चढ़ाव · उपाय'
              : 'Education · Career Auspiciousness · Profession · Ups & Downs · Remedies'}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {isHi
              ? 'भाव ४·५·९·१० + बुध·गुरु·शनि·सूर्य का समग्र विद्या-कर्म विश्लेषण'
              : 'Houses 4·5·9·10 + Mercury·Jupiter·Saturn·Sun — holistic analysis'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}>
            {isHi ? 'English' : 'हिंदी'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            disabled={!date || !time}
            className={copied ? 'border-green-500 text-green-700' : ''}
          >
            {copied
              ? <><Check className="w-4 h-4 mr-2 text-green-600" />{isHi ? 'कॉपी!' : 'Copied!'}</>
              : <><Link className="w-4 h-4 mr-2" />{isHi ? 'लिंक' : 'Share'}</>
            }
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={!hasChart}
            onClick={() => window.print()}
          >
            {isHi ? 'रिपोर्ट प्रिंट करें' : 'Print Report'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: Birth Details ── */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{isHi ? 'जन्म विवरण' : 'Birth Details'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample prefill */}
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
                <p className="text-xs font-semibold text-indigo-800 mb-2">
                  {isHi ? '▶ नमूना चार्ट:' : '▶ Sample chart:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_CHARTS.map(s => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => fillSample(s)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                    >
                      <span>🎓</span>
                      <span>{isHi ? s.labelHi : s.label}</span>
                    </button>
                  ))}
                </div>
                {(name || date) && (
                  <button
                    type="button"
                    onClick={() => { setName(''); setDate(''); setTime(''); setPlace(''); setLat(24.58); setLon(73.69); }}
                    className="mt-1.5 text-[10px] text-indigo-400 hover:text-indigo-700 underline underline-offset-2"
                  >
                    {isHi ? '✕ साफ़ करें' : '✕ Clear'}
                  </button>
                )}
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">{isHi ? 'नाम' : 'Name'}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder={isHi ? 'प्रियव्रत सिंह' : 'Priyvrit Singh'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              {/* Date */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">{isHi ? 'जन्म तिथि' : 'Date of Birth'}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              {/* Time */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">{isHi ? 'जन्म समय' : 'Time of Birth'}</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              {/* Lat/Lon */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{isHi ? 'अक्षांश' : 'Latitude'}</label>
                  <input type="number" step="0.01" value={lat} onChange={e => setLat(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">{isHi ? 'देशांतर' : 'Longitude'}</label>
                  <input type="number" step="0.01" value={lon} onChange={e => setLon(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>

              {/* Place */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">{isHi ? 'जन्म स्थान' : 'Place (optional)'}</label>
                <input type="text" value={place} onChange={e => setPlace(e.target.value)}
                  placeholder={isHi ? 'उदयपुर, राजस्थान' : 'Udaipur, Rajasthan'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <p className="text-xs text-muted-foreground">{isHi ? 'latlong.net से अक्षांश/देशांतर लें' : 'Get lat/lon from latlong.net'}</p>
              </div>

              {!hasChart && (
                <p className="text-xs text-indigo-600 bg-indigo-50 rounded p-2 border border-indigo-100">
                  {isHi ? '⬆ तिथि व समय दर्ज करें — विश्लेषण स्वतः होगा' : '⬆ Enter date & time — analysis auto-generates'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick summary */}
          {hasChart && career && (
            <Card className="border-indigo-200 bg-indigo-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-indigo-800">
                  <Star className="w-4 h-4" />
                  {isHi ? 'त्वरित सारांश' : 'Quick Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                  <span className="text-indigo-900">{isHi ? education?.levelHi : education?.level}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                  <span className="text-teal-900">{isHi ? career.primaryFieldHi : career.primaryField}</span>
                </div>
                {career.auspiciousness.length > 0 && (
                  <div className="flex items-start gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-emerald-900">
                      {isHi ? 'शीर्ष क्षेत्र:' : 'Top field:'} {career.auspiciousness[0].icon}{' '}
                      {isHi ? career.auspiciousness[0].fieldHi : career.auspiciousness[0].field}{' '}
                      ({career.auspiciousness[0].score}%)
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-emerald-900">{isHi ? career.businessVsServiceHi : career.businessVsService}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: Tabs ── */}
        <div className="lg:col-span-2">
          {!hasChart ? (
            <div className="flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30">
              <div className="text-center space-y-2">
                <div className="text-4xl">🎓</div>
                <p className="text-indigo-800 font-medium">{isHi ? 'जन्म विवरण दर्ज करें' : 'Enter birth details'}</p>
                <p className="text-xs text-muted-foreground">
                  {isHi ? 'कर्म-विद्या संहिता विश्लेषण स्वतः प्रारम्भ होगा' : 'Karma-Vidhya Sanhita analysis will appear automatically'}
                </p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="education" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4 h-auto">
                {[
                  { value: 'chart',     icon: '🪐', en: 'Chart',    hi: 'कुण्डली' },
                  { value: 'education', icon: '📚', en: 'Education', hi: 'शिक्षा' },
                  { value: 'career',    icon: '💼', en: 'Career',    hi: 'करियर' },
                  { value: 'phases',    icon: '📈', en: 'Journey',   hi: 'उतार-चढ़ाव' },
                  { value: 'remedies',  icon: '🕉️', en: 'Remedies', hi: 'उपाय' },
                ].map(t => (
                  <TabsTrigger key={t.value} value={t.value}
                    className="flex flex-col items-center py-2 text-xs gap-0.5">
                    <span>{t.icon}</span>
                    <span>{isHi ? t.hi : t.en}</span>
                    <span className="text-[9px] opacity-60">{isHi ? t.en : t.hi}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ── Chart Tab ── */}
              <TabsContent value="chart">
                <KundliChart date={date} time={time} latitude={lat} longitude={lon}
                  lang={lang} className="w-full border-none shadow-none" />
              </TabsContent>

              {/* ── Education Tab ── */}
              <TabsContent value="education" className="space-y-4">
                {education && (
                  <>
                    <Card className="border-indigo-100">
                      <CardHeader className="bg-indigo-50/50 pb-3">
                        <CardTitle className="text-base text-indigo-900 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                          {isHi ? 'शिक्षा स्तर अनुमान' : 'Education Level Forecast'}
                        </CardTitle>
                        <CardDescription className="text-indigo-800/80 font-medium">
                          {isHi ? education.levelHi : education.level}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-3 space-y-2">
                        <div className="text-xs bg-indigo-50 rounded px-3 py-2 text-indigo-800">
                          <span className="font-semibold">{isHi ? 'उच्च शिक्षा: ' : 'Higher Ed: '}</span>
                          {isHi ? education.higherEducationProspectHi : education.higherEducationProspect}
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
                          {isHi ? education.educationTimingHi : education.educationTiming}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border-green-100 bg-green-50/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-green-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            {isHi ? 'शैक्षणिक शक्तियां' : 'Academic Strengths'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {(isHi ? education.strengthsHi : education.strengths).map((s, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 shrink-0">✓</span><span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-amber-100 bg-amber-50/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-amber-800 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4" />
                            {isHi ? 'चुनौतियां' : 'Challenges'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {(isHi ? education.challengesHi : education.challenges).map((c, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5 shrink-0">●</span><span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-indigo-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-indigo-800 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          {isHi ? 'अनुकूल विषय / सर्वश्रेष्ठ शाखाएं' : 'Best Subjects & Streams'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {(isHi ? education.bestSubjectsHi : education.bestSubjects).map((s, i) => (
                            <Badge key={i} variant="outline"
                              className="border-indigo-300 text-indigo-800 bg-indigo-50 text-xs">{s}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* ── Career & Auspiciousness Tab ── */}
              <TabsContent value="career" className="space-y-4">
                {career && (
                  <>
                    {/* Auspiciousness ranking */}
                    <Card className="border-teal-200">
                      <CardHeader className="bg-teal-50/60 pb-3">
                        <CardTitle className="text-base text-teal-900 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-teal-600" />
                          {isHi
                            ? 'करियर क्षेत्र — शुभता श्रेणीकरण'
                            : 'Career Field — Auspiciousness Ranking'}
                        </CardTitle>
                        <CardDescription className="text-teal-700 text-xs">
                          {isHi
                            ? 'ग्रह-शक्ति के आधार पर तकनीकी · चिकित्सा · प्रशासन · शिक्षण · व्यापार · सरकारी · निजी का स्कोर'
                            : 'Technical · Medical · Admin · Academics · Business · Govt · Private scored by planetary strength'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        {career.auspiciousness.map((f, i) => (
                          <div key={f.field}
                            className={`rounded-lg border p-3 ${i === 0 ? gradeColor(f.grade) + ' ring-1 ring-offset-1 ring-teal-300' : gradeColor(f.grade)}`}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{f.icon}</span>
                                <span className="font-semibold text-sm">
                                  {isHi ? f.fieldHi : f.field}
                                </span>
                                {i === 0 && <Badge className="text-[9px] bg-teal-600 ml-1">{isHi ? '★ सर्वश्रेष्ठ' : '★ Best'}</Badge>}
                              </div>
                              <span className="font-bold text-base">{f.score}%</span>
                            </div>
                            {/* Score bar */}
                            <div className="w-full h-2 bg-white/60 rounded-full mb-1.5">
                              <div
                                className={`h-2 rounded-full transition-all ${gradeBarColor(f.grade)}`}
                                style={{ width: `${f.score}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] opacity-70">
                                {isHi ? f.reasonHi : f.reason}
                              </span>
                              <Badge variant="outline" className="text-[9px]">
                                {isHi ? f.gradeHi : f.grade}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Profession characteristics */}
                    <Card className="border-indigo-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-indigo-800 flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4" />
                          {isHi ? 'व्यावसायिक गुण एवं कार्यशैली' : 'Profession Characteristics & Work Style'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {isHi ? career.primaryFieldHi : career.primaryField}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(isHi ? career.professionCharacteristicsHi : career.professionCharacteristics).map((c, i) => (
                            <li key={i} className="text-xs flex items-start gap-2 p-2 rounded bg-indigo-50/50">
                              <span className="text-indigo-500 mt-0.5 shrink-0 font-bold">{i + 1}.</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Business vs Service + Professions */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border-green-100 bg-green-50/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-green-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            {isHi ? 'करियर शक्तियां' : 'Career Strengths'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {(isHi ? career.careerStrengthsHi : career.careerStrengths).map((s, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 shrink-0">✓</span><span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-teal-100">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-teal-800 flex items-center gap-1.5">
                            <Star className="w-4 h-4" />
                            {isHi ? 'उपयुक्त व्यवसाय' : 'Suitable Professions'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1.5">
                            {(isHi ? career.suitableProfessionsHi : career.suitableProfessions).map((p, i) => (
                              <Badge key={i} variant="outline"
                                className="border-teal-300 text-teal-800 bg-teal-50 text-[10px]">{p}</Badge>
                            ))}
                          </div>
                          <div className="mt-3 text-xs bg-teal-50 border border-teal-100 rounded px-2 py-1.5">
                            {isHi ? career.businessVsServiceHi : career.businessVsService}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Favorable years */}
                    <Card className="border-indigo-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-indigo-800 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" />
                          {isHi ? 'शुभ करियर काल' : 'Favorable Career Windows'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {(isHi ? career.favorableYearsHi : career.favorableYears).map((y, i) => (
                            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                              <span className="text-indigo-500 font-bold text-sm shrink-0">{i + 1}.</span>
                              <span className="text-sm">{y}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* ── Career Ups & Downs Tab ── */}
              <TabsContent value="phases" className="space-y-4">
                <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">
                  <p className="text-sm text-indigo-800 font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 shrink-0" />
                    {isHi
                      ? `${name || 'जातक'} के लिए प्रमुख करियर उतार-चढ़ाव — दशा-गोचर मॉडल`
                      : `Major career phases for ${name || 'native'} — Dasha-transit model`}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {isHi
                      ? '🟢 चरम/उत्कर्ष  🔵 उदय  🟣 स्थिरीकरण  🟡 चुनौती'
                      : '🟢 Peak  🔵 Rise  🟣 Consolidation  🟡 Challenge'}
                  </p>
                </div>

                {phases.map((phase, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${phaseColor(phase.type)}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{phase.icon}</span>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${phaseTitleColor(phase.type)}`}>
                          {isHi ? phase.periodHi : phase.period}
                        </div>
                        <p className="text-sm mt-1">
                          {isHi ? phase.descriptionHi : phase.description}
                        </p>
                        <div className="mt-2 flex items-start gap-1.5 text-xs bg-white/60 rounded px-2.5 py-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-500" />
                          <span className="italic">
                            {isHi
                              ? <><span className="font-semibold">सुझाव:</span> {phase.adviceHi}</>
                              : <><span className="font-semibold">Advice:</span> {phase.advice}</>
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Card className="border-indigo-100">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {isHi
                        ? '⚠️ ये संकेत ग्रह-शक्ति और दशा-सिद्धांत पर आधारित सामान्य संकेत हैं। विस्तृत विश्लेषण के लिए पूर्ण दशा-अन्तर्दशा गणना और विद्वान ज्योतिषी से परामर्श करें।'
                        : '⚠️ These are indicative phases based on planetary strength and dasha principles. For precision, consult a qualified astrologer with full dasha-antardasha calculations.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Remedies Tab ── */}
              <TabsContent value="remedies" className="space-y-4">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-sm text-amber-800 font-medium">
                    {isHi
                      ? `🕉️ ${name || 'जातक'} के लिए विद्या-करियर उपाय (कर्म-विद्या संहिता)`
                      : `🕉️ Education & Career remedies for ${name || 'native'} (Karma-Vidhya Sanhita)`}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {isHi
                      ? 'बुध · गुरु · सरस्वती · शनि · सूर्य की कृपा के लिए'
                      : 'For the grace of Mercury · Jupiter · Saraswati · Saturn · Sun'}
                  </p>
                </div>

                {remedies.map(r => (
                  <div key={r.planet} className="rounded-xl border bg-white p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{r.icon}</span>
                      <span className="font-semibold text-sm">{r.planet}</span>
                    </div>
                    <p className="text-sm text-gray-700">{isHi ? r.remedyHi : r.remedy}</p>
                    <div className="mt-2 text-xs bg-amber-50 border border-amber-200 rounded px-3 py-1.5 font-mono tracking-wide text-amber-900 select-all cursor-text">
                      {r.mantra}
                    </div>
                  </div>
                ))}

                <div className="text-center pt-2 pb-4 space-y-2">
                  <a href="/spiritual-remedies"
                    className="block text-sm text-indigo-700 underline underline-offset-2 hover:text-indigo-900">
                    {isHi
                      ? '→ पूर्ण उपाय केन्द्र — मंत्र · यंत्र · रुद्राक्ष'
                      : '→ Full Remedies Hub — Mantra · Yantra · Rudraksha'}
                  </a>
                  <a href="/marriage"
                    className="block text-sm text-rose-600 underline underline-offset-2 hover:text-rose-800">
                    {isHi
                      ? '→ MTSS पैनल — विवाह विश्लेषण भी देखें'
                      : '→ Also see MTSS Panel — Marriage Analysis'}
                  </a>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
