/**
 * QuestionPage — unified Prashna interface
 *
 * Architecture (top → bottom):
 *   1. UniversalPrasnaResearch bar  — standalone Prasna Marga classifier
 *      with Direction (Arudha Lagna) selector  [prasnaResearchEngine]
 *   2. Ask-Your-Question form       — enrolled jatak OR anonymous querent
 *   3. Results panel                — verdict, PrasnaMargaMeters, indicators, chart
 *      • PrasnaMargaMeters: Tarabala (Ch.3-4), Chandra Bala (Ch.3),
 *        Gulika Kala (Ch.6), Pranakshara Nakshatra (Ch.24)
 *      • Chart tab: PrashnaKundaliChart (horary chart at question time)
 *      • Progeny questions: ProgenyAnalysisCard (Ch.18 Santhana Prasna)
 *   4. PrasnaReadingHistory — localStorage, last 15 readings
 */

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Compass,
  MapPin,
  User,
  HelpCircle,
  Sparkles,
  Loader2,
  AlertCircle,
  Share2,
  MessageSquareQuote,
  BookOpen,
  Calendar,
  HeartHandshake,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SEO } from '@/components/SEO';

import { calculateCompletePlanetaryPositions } from '@/services/ephemerisService';

import {
  analyzeQuestion,
  RASHIS_EN,
  RASHIS_HI,
  type QuestionAnalysis,
} from '@/services/questionAnalysisService';

import {
  generateEnhancedClassicalAnswer,
  type ClassicalAnswer,
  type EnhancedClassicalAnswer,
} from '@/services/classicalAnswerEngine';

import { buildUniversalResearchPayload, type Direction } from '@/services/prasnaResearchEngine';

import UniversalPrasnaResearch from '@/components/UniversalPrasnaResearch';
import ProgenyAnalysisCard from '@/components/ProgenyAnalysisCard';
import PrasnaMargaMeters from '@/components/PrasnaMargaMeters';
import PrasnaReadingHistory from '@/components/PrasnaReadingHistory';

import {
  getPrasnaTarabala,
  getChandraBala,
  getGulikaKala,
  getPranaksharaNakshatraDetail,
  saveReadingHistory,
  type PrasnaTarabalaResult,
  type ChandraBalaResult,
  type GulikaKalaResult,
  type PranaksharaNakshatraDetail,
} from '@/services/prasnaMargaExtras';
import { faqSchema } from '@/components/SEO';

const PrashnaKundaliChart = lazy(() => import('@/components/PrashnaKundaliChart'));

import jataksDb from '@/data/jataks/JATAKS_DATABASE.json';
import { useSubjectiveAnalysis } from '@/hooks/useSubjectiveAnalysis';
import EnhancedAnalysisPanel from '@/components/EnhancedAnalysisPanel';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface JatakRecord {
  id: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  state?: string;
  country?: string;
  coordinates?: { latitude: string; longitude: string };
  relationship?: string;
  moonRashi?: string;
  moonRashiIndex?: number;
}

const JATAKS: JatakRecord[] = (jataksDb as { jataks: JatakRecord[] }).jataks ?? [];

const DIRECTIONS: Direction[] = ['East', 'West', 'North', 'South', 'NE', 'NW', 'SE', 'SW'];

const DIRECTION_HI: Record<Direction, string> = {
  East: 'पूर्व',
  West: 'पश्चिम',
  North: 'उत्तर',
  South: 'दक्षिण',
  NE: 'उत्तर-पूर्व',
  NW: 'उत्तर-पश्चिम',
  SE: 'दक्षिण-पूर्व',
  SW: 'दक्षिण-पश्चिम',
};

function parseCoord(raw: string | undefined): number {
  if (!raw) return 0;
  const m = raw.match(/(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  const num = parseFloat(m[1]);
  if (/[Ss]/.test(raw) || /[Ww]/.test(raw)) return -num;
  return num;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const QuestionPage = () => {
  const [isHi, setIsHi] = useState(false);
  useEffect(() => {
    setIsHi(new URLSearchParams(window.location.search).get('lang') === 'hi');
  }, []);

  // Mode: jatak vs anonymous
  const [mode, setMode] = useState<'jatak' | 'anonymous'>(
    JATAKS.length > 0 ? 'jatak' : 'anonymous'
  );
  const [selectedJatakId, setSelectedJatakId] = useState<string>(JATAKS[0]?.id ?? '');

  // Custom birth details states
  const [customName, setCustomName] = useState('Guest');
  const [customDate, setCustomDate] = useState('1995-01-01');
  const [customTime, setCustomTime] = useState('12:00');
  const [customPlace, setCustomPlace] = useState('New Delhi');
  const [customLat, setCustomLat] = useState('28.6139');
  const [customLon, setCustomLon] = useState('77.2090');

  // Prompt states
  const [showBirthPrompt, setShowBirthPrompt] = useState(false);
  const [hasPromptedForBirth, setHasPromptedForBirth] = useState(false);

  // Direction (Arudha Lagna) — used both by UniversalPrasnaResearch and the form
  const [direction, setDirection] = useState<Direction>('East');

  // Question fields
  const [question, setQuestion] = useState('');
  const nowDefault = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  }, []);
  const [qDate, setQDate] = useState(nowDefault.date);
  const [qTime, setQTime] = useState(nowDefault.time);

  // Anonymous-only: question location (defaults to New Delhi)
  const [qLat, setQLat] = useState('28.6139');
  const [qLon, setQLon] = useState('77.2090');
  const [qPlace, setQPlace] = useState('New Delhi');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuestionAnalysis | null>(null);
  const [classicalAnswer, setClassicalAnswer] = useState<EnhancedClassicalAnswer | null>(null);
  const [prasnaPayload, setPrasnaPayload] = useState<ReturnType<
    typeof buildUniversalResearchPayload
  > | null>(null);

  // ── Five-step extra indicators (prasnaMargaExtras) ──
  const [prasnaTarabala, setPrasnaTarabala] = useState<PrasnaTarabalaResult | null>(null);
  const [chandraBala, setChandraBala] = useState<ChandraBalaResult | null>(null);
  const [gulikaKala, setGulikaKala] = useState<GulikaKalaResult | null>(null);
  const [pranaksharaDetail, setPranaksharaDetail] = useState<PranaksharaNakshatraDetail | null>(
    null
  );
  const [historyKey, setHistoryKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedJatak = JATAKS.find(j => j.id === selectedJatakId);

  // Hook for 13-layer subjective analysis engine
  const subjectiveReading = useSubjectiveAnalysis({
    enabled: !!result,
    question,
    questionDate: qDate,
    questionTime: qTime,
    questionLat:
      mode === 'jatak' && selectedJatak?.coordinates ? selectedJatak.coordinates.latitude : qLat,
    questionLon:
      mode === 'jatak' && selectedJatak?.coordinates ? selectedJatak.coordinates.longitude : qLon,
    mode,
    referenceType: mode === 'jatak' ? 'natal' : 'prashna',
    jatakDetails:
      mode === 'jatak'
        ? {
            name: selectedJatakId === 'custom' ? customName : (selectedJatak?.name ?? 'Guest'),
            date:
              selectedJatakId === 'custom'
                ? customDate
                : (selectedJatak?.dateOfBirth ?? '1995-01-01'),
            time:
              selectedJatakId === 'custom' ? customTime : (selectedJatak?.timeOfBirth ?? '12:00'),
            lat:
              selectedJatakId === 'custom'
                ? parseFloat(customLat)
                : parseCoord(selectedJatak?.coordinates?.latitude),
            lon:
              selectedJatakId === 'custom'
                ? parseFloat(customLon)
                : parseCoord(selectedJatak?.coordinates?.longitude),
          }
        : undefined,
  });

  const onSubmit = async (overrideAnon = false) => {
    setError(null);
    setResult(null);
    setClassicalAnswer(null);
    setPrasnaPayload(null);
    setPrasnaTarabala(null);
    setChandraBala(null);
    setGulikaKala(null);
    setPranaksharaDetail(null);
    if (!question.trim()) {
      setError(isHi ? 'कृपया अपना प्रश्न लिखें।' : 'Please type your question.');
      return;
    }

    if (mode === 'anonymous' && !hasPromptedForBirth && !overrideAnon) {
      setShowBirthPrompt(true);
      return;
    }

    setLoading(true);
    try {
      const questionTime = new Date(`${qDate}T${qTime}:00`);
      let qLatNum = parseFloat(qLat);
      let qLonNum = parseFloat(qLon);

      if (mode === 'jatak') {
        if (selectedJatakId === 'custom') {
          qLatNum = parseFloat(customLat) || 28.6139;
          qLonNum = parseFloat(customLon) || 77.209;
        } else if (selectedJatak?.coordinates) {
          qLatNum = parseCoord(selectedJatak.coordinates.latitude);
          qLonNum = parseCoord(selectedJatak.coordinates.longitude);
        }
      }

      // Build Prasna Marga research payload (direction-aware)
      const payload = buildUniversalResearchPayload(question.trim(), direction, questionTime);
      setPrasnaPayload(payload);

      const natal =
        mode === 'jatak'
          ? selectedJatakId === 'custom'
            ? {
                name: customName,
                date: customDate,
                time: customTime,
                lat: parseFloat(customLat) || 28.6139,
                lon: parseFloat(customLon) || 77.209,
                moonRashiIndex: undefined,
              }
            : selectedJatak
              ? {
                  name: selectedJatak.name,
                  date: selectedJatak.dateOfBirth,
                  time: selectedJatak.timeOfBirth,
                  lat: parseCoord(selectedJatak.coordinates?.latitude),
                  lon: parseCoord(selectedJatak.coordinates?.longitude),
                  moonRashiIndex: selectedJatak.moonRashiIndex,
                }
              : undefined
          : undefined;

      const analysis = await analyzeQuestion({
        question: question.trim(),
        questionTime,
        questionLocation: { lat: qLatNum, lon: qLonNum, label: qPlace },
        natal,
      });
      setResult(analysis);

      const classicalAns = await generateEnhancedClassicalAnswer({
        question: question.trim(),
        verdict: {
          outcome: analysis.verdict.outcome as 'favorable' | 'mixed' | 'unfavorable',
          score: analysis.verdict.score,
        },
        horaLord: analysis.horaLord,
        moonRashi: analysis.moonRashi,
        prashnaLagna: analysis.prashnaLagnaRashi,
        direction,
        isHi,
        questionTime: questionTime,
        lat: qLatNum,
        lon: qLonNum,
      });
      setClassicalAnswer(classicalAns);

      // ── Compute the five Prasna Marga Extra indicators ──
      const prasnaMoonRashi = analysis.moonRashi;

      // Extract or dynamically compute birth Moon rashi
      let birthMoonRashiIndex: number | undefined = undefined;
      if (mode === 'jatak') {
        if (selectedJatakId === 'custom') {
          try {
            const birthPositions = calculateCompletePlanetaryPositions(
              customDate,
              customTime
            );

            const getMoonRashi = (positions: any): number => {
              for (const k of ['moon', 'Moon']) {
                const v = positions[k];
                if (v && typeof v === 'object') {
                  if (typeof v.rashi === 'number') return v.rashi;
                  if (typeof v.sign === 'number') return v.sign;
                  if (typeof v.longitude === 'number') return Math.floor(v.longitude / 30) % 12;
                }
              }
              return 0;
            };
            birthMoonRashiIndex = getMoonRashi(birthPositions);
          } catch (e) {
            console.warn('Could not calculate custom birth Moon', e);
          }
        } else {
          birthMoonRashiIndex = selectedJatak?.moonRashiIndex;
        }
      }

      // 1 & 2: Tarabala + Chandra Bala (require birth Moon rashi)
      if (mode === 'jatak' && birthMoonRashiIndex !== undefined) {
        const bMoon = birthMoonRashiIndex;
        const tb = getPrasnaTarabala(bMoon, prasnaMoonRashi);
        const cb = getChandraBala(bMoon, prasnaMoonRashi);
        setPrasnaTarabala(tb);
        setChandraBala(cb);

        // 5: Save to history
        const pranaksharaLetter = question.trim()[0]?.toUpperCase() ?? '?';
        const pranakshara = getPranaksharaNakshatraDetail(pranaksharaLetter);
        setPranaksharaDetail(pranakshara);

        // 3: Gulika Kala
        const gulika = getGulikaKala(questionTime, analysis.prashnaLagnaRashi);
        setGulikaKala(gulika);

        const rawOutcome = analysis.verdict.outcome as string;
        const mappedOutcome: 'favorable' | 'unfavorable' | 'neutral' =
          rawOutcome === 'favorable'
            ? 'favorable'
            : rawOutcome === 'unfavorable'
              ? 'unfavorable'
              : 'neutral';
        saveReadingHistory({
          timestamp: questionTime.toISOString(),
          question: question.trim(),
          direction,
          jatakName: selectedJatakId === 'custom' ? customName : (selectedJatak?.name ?? 'Guest'),
          outcome: mappedOutcome,
          score: analysis.verdict.score,
          tarabalaCat: tb.category,
          chandraBalaStrength: cb.strength,
          gulikaInHora: gulika.isQuestionInGulikaHora,
          pranaksharaLetter,
          pranaksharaNakshatra: pranakshara.nakshatra.nameEn,
        });
        setHistoryKey(k => k + 1);
      } else {
        // Anonymous: still show Gulika + Pranakshara
        const pranaksharaLetter = question.trim()[0]?.toUpperCase() ?? '?';
        const pranakshara = getPranaksharaNakshatraDetail(pranaksharaLetter);
        setPranaksharaDetail(pranakshara);
        const gulika = getGulikaKala(questionTime, analysis.prashnaLagnaRashi);
        setGulikaKala(gulika);

        const rawOutcomeAnon = analysis.verdict.outcome as string;
        const mappedOutcomeAnon: 'favorable' | 'unfavorable' | 'neutral' =
          rawOutcomeAnon === 'favorable'
            ? 'favorable'
            : rawOutcomeAnon === 'unfavorable'
              ? 'unfavorable'
              : 'neutral';
        saveReadingHistory({
          timestamp: questionTime.toISOString(),
          question: question.trim(),
          direction,
          jatakName: null,
          outcome: mappedOutcomeAnon,
          score: analysis.verdict.score,
          tarabalaCat: '—',
          chandraBalaStrength: '—',
          gulikaInHora: gulika.isQuestionInGulikaHora,
          pranaksharaLetter,
          pranaksharaNakshatra: pranakshara.nakshatra.nameEn,
        });
        setHistoryKey(k => k + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const rashiName = (i: number) => (isHi ? RASHIS_HI[i] : RASHIS_EN[i]);
  const faqs = [
    {
      q: isHi
        ? 'क्या यह प्रश्न कुंडली हिंदी में उत्तर देती है?'
        : 'Does this question page answer in Hindi?',
      a: isHi
        ? 'हाँ, enrolled-user foreign-travel questions के लिए bilingual जवाब मिलता है।'
        : 'Yes, enrolled-user foreign-travel questions return bilingual English/Hindi replies.',
    },
    {
      q: isHi ? 'क्या यहाँ जन्म डेटा सेव होता है?' : 'Is birth data saved here?',
      a: isHi
        ? 'हाँ, enrolled jataks database से चुने गए प्रोफाइल का उपयोग होता है।'
        : 'Yes, enrolled jataks use the saved profile database.',
    },
  ];
  const shareText = result
    ? `${isHi ? 'प्रश्न शास्त्र' : 'Question / Prashna'}: ${question.trim()}\n${isHi ? 'उत्तर' : 'Answer'}: ${isHi ? result.answer.hi : result.answer.en}\n${typeof window !== 'undefined' ? window.location.href : ''}`
    : '';
  const copyShare = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Detect if this is a progeny question (house 5)
  const isProgenyQuestion = result?.category.house === 5;

  // Question time for PrashnaKundaliChart
  const questionTime = useMemo(() => new Date(`${qDate}T${qTime}:00`), [qDate, qTime]);
  const chartLat =
    mode === 'jatak' && selectedJatak?.coordinates
      ? parseCoord(selectedJatak.coordinates.latitude)
      : parseFloat(qLat);
  const chartLon =
    mode === 'jatak' && selectedJatak?.coordinates
      ? parseCoord(selectedJatak.coordinates.longitude)
      : parseFloat(qLon);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Helmet>
        <title>
          {isHi ? 'प्रश्न शास्त्र — Question / Prashna' : 'Question / Prashna — Vedic Answers'}
        </title>
        <meta
          name="description"
          content="Ask any question and receive a classical Prasna Marga analysis based on B.V. Raman's Prasnatantra."
        />
      </Helmet>
      <SEO
        title={isHi ? 'प्रश्न शास्त्र — Question / Prashna' : 'Question / Prashna — Vedic Answers'}
        description={
          isHi
            ? 'प्रश्न मार्ग, जन्म + गोचर, और द्विभाषी उत्तर.'
            : 'Prasna Marga, natal + transit, and bilingual answers.'
        }
        canonical="/question"
        structuredData={faqSchema(faqs)}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-amber-700 hover:text-amber-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {isHi ? 'होम' : 'Home'}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setIsHi(v => !v)}>
            {isHi ? 'EN' : 'हिं'}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-7 h-7 text-amber-600" />
            <h1 className={`text-4xl font-bold text-amber-900 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'प्रश्न शास्त्र — Prashna' : 'Question / Prashna'}
            </h1>
          </div>
          <p className={`text-amber-800 max-w-2xl mx-auto ${isHi ? 'font-hindi' : ''}`}>
            {isHi
              ? 'अपना प्रश्न पूछें — नामांकित जातक को जन्म कुंडली + गोचर का उत्तर मिलेगा; अन्य को प्रश्न समय की कुंडली।'
              : 'Ask any question. Enrolled jataks get a combined natal + transit verdict; others get a pure Prasna chart from the time and place of the question.'}
          </p>
          <p className="text-xs text-amber-700 mt-2">
            {isHi ? 'स्रोत: ' : 'Source: '}
            <em>Prasna Marga</em> (Panakkattu Nambudiripad) &amp; B.V. Raman, <em>Prasnatantra</em>.
          </p>
        </motion.div>

        {/* ── SECTION 1: Universal Prasna Research bar ── */}
        <UniversalPrasnaResearch isHi={isHi} initialQuestion={question} />

        {/* ── SECTION 2: Ask-Your-Question form ── */}
        <Card className="border-amber-200 shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
            <CardTitle className={`text-amber-900 ${isHi ? 'font-hindi' : ''}`}>
              <HelpCircle className="inline w-5 h-5 mr-2" />
              {isHi ? 'पूर्ण प्रश्न विश्लेषण (फलादेश)' : 'Full Prashna Analysis (Phaladesh)'}
            </CardTitle>
            <p className="text-xs text-amber-700 mt-1">
              {isHi
                ? 'नीचे दिए गए फ़ॉर्म से जन्म कुंडली + गोचर + प्रश्न कुंडली का सम्पूर्ण विश्लेषण पाएं।'
                : 'Get a combined natal + transit + horary verdict from the form below.'}
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {/* Mode: jatak vs anonymous */}
            <RadioGroup
              value={mode}
              onValueChange={v => setMode(v as 'jatak' | 'anonymous')}
              className="flex flex-wrap gap-4"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="jatak" id="m-jatak" />
                <span className={isHi ? 'font-hindi' : ''}>
                  {isHi
                    ? 'नामांकित जातक (जन्म डेटा उपलब्ध)'
                    : 'Enrolled jatak (birth data on file)'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="anonymous" id="m-anon" />
                <span className={isHi ? 'font-hindi' : ''}>
                  {isHi ? 'अन्य (केवल प्रश्न समय)' : 'Other (time of question only)'}
                </span>
              </label>
            </RadioGroup>

            {/* Jatak selector */}
            {mode === 'jatak' && (
              <div className="space-y-4">
                <div>
                  <Label className={`flex items-center gap-1 ${isHi ? 'font-hindi' : ''}`}>
                    <User className="w-4 h-4" />
                    {isHi ? 'जातक चुनें' : 'Select jatak'}
                  </Label>
                  <Select value={selectedJatakId} onValueChange={setSelectedJatakId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {JATAKS.map(j => (
                        <SelectItem key={j.id} value={j.id}>
                          {j.name} — {j.dateOfBirth} {j.timeOfBirth} ({j.placeOfBirth})
                          {j.relationship ? ` · ${j.relationship}` : ''}
                        </SelectItem>
                      ))}
                      <SelectItem key="custom" value="custom">
                        ✨{' '}
                        {isHi
                          ? 'नया जातक (कस्टम जन्म विवरण प्रविष्ट करें)...'
                          : 'New Jatak (Enter custom birth details)...'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedJatak && selectedJatakId !== 'custom' && (
                    <p className="text-xs text-slate-600 mt-1">
                      {isHi ? 'जन्म' : 'Born'}: {selectedJatak.dateOfBirth}{' '}
                      {selectedJatak.timeOfBirth} — {selectedJatak.placeOfBirth},{' '}
                      {selectedJatak.state}
                      {selectedJatak.moonRashi
                        ? ` · ${isHi ? 'चंद्र राशि' : 'Moon'}: ${selectedJatak.moonRashi}`
                        : ''}
                    </p>
                  )}
                </div>

                {/* Custom Birth Details Input Form */}
                {selectedJatakId === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-4 shadow-inner"
                  >
                    <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                      {isHi ? 'कस्टम जन्म विवरण प्रविष्ट करें' : 'Enter Custom Birth Details'}
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label>{isHi ? 'नाम' : 'Name'}</Label>
                        <Input
                          value={customName}
                          onChange={e => setCustomName(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <Label>{isHi ? 'जन्म तिथि' : 'Birth Date'}</Label>
                        <Input
                          type="date"
                          value={customDate}
                          onChange={e => setCustomDate(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <Label>{isHi ? 'जन्म समय' : 'Birth Time'}</Label>
                        <Input
                          type="time"
                          value={customTime}
                          onChange={e => setCustomTime(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label>{isHi ? 'जन्म स्थान' : 'Birth Place'}</Label>
                        <Input
                          value={customPlace}
                          onChange={e => setCustomPlace(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <Label>{isHi ? 'अक्षांश (Lat)' : 'Latitude'}</Label>
                        <Input
                          value={customLat}
                          onChange={e => setCustomLat(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <Label>{isHi ? 'रेखांश (Lon)' : 'Longitude'}</Label>
                        <Input
                          value={customLon}
                          onChange={e => setCustomLon(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Question textarea */}
            <div>
              <Label className={isHi ? 'font-hindi' : ''}>
                {isHi ? 'आपका प्रश्न' : 'Your question'}
              </Label>
              <Textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder={
                  isHi
                    ? 'उदा. क्या मेरी नौकरी में पदोन्नति होगी? / क्या यह विवाह सफल होगा?'
                    : 'e.g. Will I get the promotion at work? / Is this the right time to buy a house?'
                }
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                {isHi
                  ? 'अपनी भाषा में (हिं/अंग्रेजी) प्रश्न पूछें — विषय स्वतः वर्गीकृत होगा।'
                  : 'Ask in your own words — the topic is auto-classified into a Bhava (house).'}
              </p>
            </div>

            {/* Date + Time + Direction */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className={`flex items-center gap-1 ${isHi ? 'font-hindi' : ''}`}>
                  <Clock className="w-4 h-4" />
                  {isHi ? 'प्रश्न तिथि' : 'Question date'}
                </Label>
                <Input
                  type="date"
                  value={qDate}
                  onChange={e => setQDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className={isHi ? 'font-hindi' : ''}>{isHi ? 'समय' : 'Time'}</Label>
                <Input
                  type="time"
                  value={qTime}
                  onChange={e => setQTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className={`flex items-center gap-1 ${isHi ? 'font-hindi' : ''}`}>
                  <Compass className="w-4 h-4" />
                  {isHi ? 'दिशा (अरुढ़ लग्न)' : 'Direction (Arudha)'}
                </Label>
                <Select value={direction} onValueChange={v => setDirection(v as Direction)}>
                  <SelectTrigger className="mt-1 border-amber-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map(d => (
                      <SelectItem key={d} value={d}>
                        {isHi ? `${DIRECTION_HI[d]} (${d})` : d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-amber-700 mt-1">
                  {isHi
                    ? 'प्रश्न करते समय आप किस दिशा में मुख करके बैठे हैं?'
                    : 'Which direction are you facing when asking the question?'}
                </p>
              </div>
            </div>

            {/* Arudha hint display (from prasnaResearchEngine) */}
            {direction && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-xs text-amber-800">
                <span className="font-semibold">
                  {isHi ? 'अरुढ़ लग्न संकेत:' : 'Arudha Lagna hint:'}
                </span>{' '}
                {direction} →{' '}
                {buildUniversalResearchPayload(
                  'question',
                  direction,
                  new Date()
                ).researchPrompt.match(/ARUDHA LAGNA HINT: (.+)/)?.[1] ?? ''}
              </div>
            )}

            {/* Anonymous location */}
            {mode === 'anonymous' && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <Label className={`flex items-center gap-1 ${isHi ? 'font-hindi' : ''}`}>
                    <MapPin className="w-4 h-4" />
                    {isHi ? 'प्रश्न स्थान' : 'Question place'}
                  </Label>
                  <Input
                    value={qPlace}
                    onChange={e => setQPlace(e.target.value)}
                    placeholder="City"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Lat</Label>
                  <Input value={qLat} onChange={e => setQLat(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Lon</Label>
                  <Input value={qLon} onChange={e => setQLon(e.target.value)} className="mt-1" />
                </div>
              </div>
            )}

            {showBirthPrompt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-slate-900 space-y-4 shadow-xl"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-amber-600 animate-pulse shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-1">
                      {isHi
                        ? '🌌 अपनी सटीक जन्म कुंडली + गोचर विश्लेषण सक्रिय करें!'
                        : '🌌 Personalize Your Astrological Analysis!'}
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                      {isHi
                        ? 'जन्म विवरण (तिथि, समय, स्थान) जोड़ने से आपकी कुंडली और वर्तमान गोचर का गहरा विश्लेषण मिलकर 90% तक सटीक भविष्यवाणियां देता है। क्या आप जन्म विवरण प्रदान करना चाहेंगे?'
                        : 'Providing your birth details enables combined Natal Chart + Gochar (Transit) calculations. This yields up to 90% higher predictive precision. Would you like to enter your birth details?'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow"
                    onClick={() => {
                      setMode('jatak');
                      setSelectedJatakId('custom');
                      setShowBirthPrompt(false);
                      setHasPromptedForBirth(true);
                    }}
                  >
                    ✨ {isHi ? 'हाँ, जन्म विवरण दर्ज करें' : 'Yes, enter birth details'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-400 hover:bg-amber-100 text-amber-900 dark:text-amber-100 dark:hover:bg-slate-800"
                    onClick={() => {
                      setHasPromptedForBirth(true);
                      setShowBirthPrompt(false);
                      setTimeout(() => {
                        onSubmit(true);
                      }, 0);
                    }}
                  >
                    🚫{' '}
                    {isHi
                      ? 'नहीं, केवल प्रश्न समय (प्रश्न लग्न) पर उत्तर दें'
                      : 'No, proceed with Horary (Prashna)'}
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                onClick={() => onSubmit(false)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isHi ? 'विश्लेषण...' : 'Analysing...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isHi ? 'फलादेश पाएं' : 'Get Phaladesh'}
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{isHi ? 'त्रुटि' : 'Error'}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* ── SECTION 3: Results panel ── */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-amber-300 shadow-xl">
              <CardHeader
                className={
                  result.verdict.outcome === 'favorable'
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100'
                    : result.verdict.outcome === 'unfavorable'
                      ? 'bg-gradient-to-r from-rose-100 to-red-100'
                      : 'bg-gradient-to-r from-amber-100 to-yellow-100'
                }
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className={`text-2xl ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? result.verdict.outcomeLabel.hi : result.verdict.outcomeLabel.en}
                  </CardTitle>
                  <Badge variant="outline" className="text-base">
                    {isHi ? 'अंक' : 'Score'}: {result.verdict.score}
                  </Badge>
                </div>

                {/* Direction + Pranakshara meta (from prasnaPayload) */}
                {prasnaPayload && (
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-amber-800">
                    <Badge variant="secondary">
                      <Compass className="w-3 h-3 mr-1" />
                      {isHi ? 'दिशा:' : 'Direction:'} {prasnaPayload.metadata.direction}
                    </Badge>
                    <Badge variant="secondary">
                      {isHi ? 'अरुढ़:' : 'Arudha:'}{' '}
                      {prasnaPayload.researchPrompt
                        .match(/ARUDHA LAGNA HINT: (.+)/)?.[1]
                        ?.split('—')[0]
                        ?.trim() ?? ''}
                    </Badge>
                    <Badge variant="secondary">
                      {isHi ? 'प्राणाक्षर:' : 'Pranakshara:'} {prasnaPayload.metadata.pranakshara}
                      {' → '}
                      {prasnaPayload.researchPrompt.match(/Rashi: (.+)/)?.[1] ?? ''}
                    </Badge>
                    <Badge variant="secondary">
                      {prasnaPayload.chapterFocus.chapterRef.split(',')[0]}
                    </Badge>
                  </div>
                )}

                {result.jatakName && (
                  <p className="text-sm text-slate-700 mt-1">
                    <User className="inline w-3 h-3 mr-1" />
                    {isHi ? 'जातक' : 'Jatak'}: <strong>{result.jatakName}</strong> ·{' '}
                    {isHi ? 'मोड: जन्म + गोचर' : 'mode: natal + transit'}
                  </p>
                )}
                {!result.jatakName && (
                  <p className="text-sm text-slate-700 mt-1">
                    {isHi ? 'मोड: शुद्ध प्रश्न कुंडली' : 'Mode: pure Prasna chart'}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-6">
                <Tabs defaultValue="summary">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">{isHi ? 'सारांश' : 'Summary'}</TabsTrigger>
                    <TabsTrigger value="classical">
                      {isHi ? 'शास्त्रीय फलादेश' : 'Classical Reading'}
                    </TabsTrigger>
                    <TabsTrigger value="indicators">{isHi ? 'योग' : 'Indicators'}</TabsTrigger>
                    <TabsTrigger value="chart">
                      {isHi ? 'प्रश्न कुंडली' : 'Prashna Chart'}
                    </TabsTrigger>
                  </TabsList>

                  {/* Summary tab */}
                  <TabsContent value="summary" className="space-y-4 mt-4">
                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-sm text-slate-500 mb-1">
                        {isHi ? 'प्रश्न का विषय' : 'Question topic'}
                      </p>
                      <p className={`text-lg font-semibold ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? result.category.label.hi : result.category.label.en}{' '}
                        <Badge variant="secondary" className="ml-2">
                          {isHi ? 'भाव' : 'House'} {result.category.house}
                        </Badge>
                        <Badge variant="outline" className="ml-1">
                          {isHi ? 'कारक' : 'Karaka'}: {result.category.karaka}
                        </Badge>
                      </p>
                    </div>

                    {/* Pancha Sutra from prasnaPayload */}
                    {prasnaPayload && (
                      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4">
                        <p className="text-xs font-semibold text-amber-800 mb-2">
                          {isHi
                            ? 'पंच सूत्र विधि (प्रश्न मार्ग)'
                            : 'Pancha Sutra Method (Prasna Marga)'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {prasnaPayload.chapterFocus.pancha_sutra.split(' → ').map((step, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs text-amber-800 border-amber-300"
                            >
                              {i + 1}. {step}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-amber-700 mt-2 italic">
                          {prasnaPayload.chapterFocus.chapterHint}
                        </p>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border bg-white p-3">
                        <p className="text-xs text-slate-500">
                          {isHi ? 'प्रश्न लग्न' : 'Prashna Lagna'}
                        </p>
                        <p className={`text-lg font-semibold ${isHi ? 'font-hindi' : ''}`}>
                          {rashiName(result.prashnaLagnaRashi)}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-white p-3">
                        <p className="text-xs text-slate-500">
                          {isHi ? 'चंद्र राशि' : 'Moon Rashi'}
                        </p>
                        <p className={`text-lg font-semibold ${isHi ? 'font-hindi' : ''}`}>
                          {rashiName(result.moonRashi)}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-white p-3">
                        <p className="text-xs text-slate-500">
                          {isHi ? 'होरा स्वामी' : 'Hora Lord'}
                        </p>
                        <p className="text-lg font-semibold">{result.horaLord}</p>
                      </div>
                      <div className="rounded-lg border bg-white p-3">
                        <p className="text-xs text-slate-500">{isHi ? 'वार स्वामी' : 'Day Lord'}</p>
                        <p className="text-lg font-semibold">{result.dayLord}</p>
                      </div>
                    </div>

                    {/* Bilingual Analysis Cards — Ported from Replit aesthetic */}
                    <div className="grid gap-6">
                      {/* English Analysis Card */}
                      <Card className="border-border bg-card shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                          <CardTitle className="font-heading text-lg flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            English Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                              Predictive Answer
                            </h4>
                            <p className="text-base leading-relaxed text-foreground/90 font-medium">
                              {result.answer.en}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                              Timing Advice
                            </h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {result.timing.en}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                              Conclusion
                            </h4>
                            <p className="text-sm leading-relaxed">
                              {result.verdict.conclusion.en}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Hindi Analysis Card */}
                      <Card className="border-border bg-card shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                          <CardTitle className="font-heading text-lg flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            हिन्दी विश्लेषण
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-6 font-hindi">
                          <div>
                            <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">
                              भविष्यवाणी
                            </h4>
                            <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                              {result.answer.hi}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">
                              समय निर्देश
                            </h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {result.timing.hi}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">
                              निष्कर्ष
                            </h4>
                            <p className="text-sm leading-relaxed">
                              {result.verdict.conclusion.hi}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={copyShare} className="gold-glow">
                        <Share2 className="w-4 h-4 mr-2" />
                        {copied ? (isHi ? 'कॉपी हुआ' : 'Copied') : isHi ? 'शेयर करें' : 'Share'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => window.print()}>
                        <MessageSquareQuote className="w-4 h-4 mr-2" />
                        {isHi ? 'प्रिंट / सेव' : 'Print / Save'}
                      </Button>
                    </div>

                    {/* Parihara from prasnaPayload */}
                    {prasnaPayload?.parihara && (
                      <Alert className="border-rose-300 bg-rose-50">
                        <AlertTitle className="text-rose-800">
                          {isHi ? 'परिहार (उपाय) आवश्यक' : 'Parihara (Remedial Measures) Advised'}
                        </AlertTitle>
                        <AlertDescription className="text-rose-700 space-y-1 text-sm mt-1">
                          {prasnaPayload.parihara.deity && (
                            <p>
                              <strong>{isHi ? 'देवता:' : 'Deity:'}</strong>{' '}
                              {prasnaPayload.parihara.deity}
                            </p>
                          )}
                          {prasnaPayload.parihara.mantra && (
                            <p>
                              <strong>{isHi ? 'मंत्र:' : 'Mantra:'}</strong>{' '}
                              {prasnaPayload.parihara.mantra}
                            </p>
                          )}
                          {prasnaPayload.parihara.day && (
                            <p>
                              <strong>{isHi ? 'दिन:' : 'Day:'}</strong> {prasnaPayload.parihara.day}
                            </p>
                          )}
                          {prasnaPayload.parihara.ritual && (
                            <p>
                              <strong>{isHi ? 'अनुष्ठान:' : 'Ritual:'}</strong>{' '}
                              {prasnaPayload.parihara.ritual}
                            </p>
                          )}
                          <p className="text-xs italic mt-1">{prasnaPayload.parihara.note}</p>
                        </AlertDescription>
                      </Alert>
                    )}

                    <p className="text-xs text-slate-500 italic">{result.reference}</p>
                  </TabsContent>

                  {/* Classical tab */}
                  <TabsContent value="classical" className="space-y-4 mt-4">
                    {classicalAnswer ? (
                      <div className="space-y-6">
                        {/* Section 1: Direct Answer */}
                        <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50/20 p-4">
                          <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-700" />
                            {isHi
                              ? '१. प्रत्यक्ष उत्तर (संभाव्यता)'
                              : '1. Direct Answer (Probability Frame)'}
                          </h4>
                          <p className="text-slate-800 leading-relaxed font-semibold">
                            {isHi
                              ? classicalAnswer.directAnswer.hi
                              : classicalAnswer.directAnswer.en}
                          </p>
                          <div className="mt-3 flex gap-2 flex-wrap">
                            <Badge variant="secondary">
                              {isHi ? 'विश्वास स्तर: ' : 'Confidence: '}
                              {classicalAnswer.directAnswer.confidence.toUpperCase()}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-amber-500 text-amber-700 bg-amber-50"
                            >
                              {isHi ? 'संभाव्यता: ' : 'Probability: '}
                              {isHi
                                ? classicalAnswer.directAnswer.probabilityLabel.hi
                                : classicalAnswer.directAnswer.probabilityLabel.en}
                            </Badge>
                          </div>
                        </div>

                        {/* Section 2: Astrological Reasoning */}
                        <div className="rounded-lg border bg-white p-4">
                          <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <MessageSquareQuote className="w-5 h-5 text-amber-700" />
                            {isHi
                              ? '२. ज्योतिषीय तर्क एवं शास्त्रीय प्रमाण'
                              : '2. Astrological Reasoning & Classical Sources'}
                          </h4>
                          <p className="text-slate-700 leading-relaxed mb-4">
                            {isHi ? classicalAnswer.reasoning.hi : classicalAnswer.reasoning.en}
                          </p>
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-800">
                              {isHi ? 'शास्त्रीय सूत्र:' : 'Classical Rules Applied:'}
                            </p>
                            <div className="grid gap-3">
                              {classicalAnswer.reasoning.classicalRules.map((rule, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded border text-xs">
                                  <span className="font-bold text-amber-800 block mb-1">
                                    {rule.source}
                                  </span>
                                  <p className="text-slate-600 mb-1">
                                    <strong>Rule:</strong> {rule.rule}
                                  </p>
                                  <p className="text-slate-800">
                                    <strong>Application:</strong> {rule.application}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Timing Windows */}
                        <div className="rounded-lg border bg-white p-4">
                          <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-700" />
                            {isHi
                              ? '३. अनुकूल समय सीमा (गोचर एवं दशा)'
                              : '3. Auspicious Timing Windows (Transit + Dasha)'}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 mt-2">
                            {classicalAnswer.timing.windows.map((win, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-amber-50/50 rounded border border-amber-100"
                              >
                                <span className="font-bold text-amber-900 block">{win.label}</span>
                                <p className="text-sm text-slate-700 mt-1">{win.basis}</p>
                                <Badge className="mt-2" variant="outline">
                                  {isHi ? 'विश्वास: ' : 'Confidence: '}
                                  {win.confidence}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 text-xs text-rose-800">
                            <strong>{isHi ? 'वर्जित समय सीमा:' : 'Periods to Avoid:'}</strong>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                              {classicalAnswer.timing.avoidPeriods.map((p, i) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Section 4: Cautions */}
                        <div className="rounded-lg border border-rose-200 bg-rose-50/10 p-4">
                          <h4 className="font-bold text-rose-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-600" />
                            {isHi
                              ? '४. जोखिम और चेतावनियां'
                              : '4. Risks & Cautions (Non-Fatalistic)'}
                          </h4>
                          <ul className="list-disc pl-5 text-slate-700 text-sm space-y-1 mb-3">
                            {classicalAnswer.risks.cautions.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                          <p className="text-xs text-slate-500 italic border-t pt-2">
                            {classicalAnswer.risks.antiHarmNote}
                          </p>
                        </div>

                        {/* Section 5: Remedies */}
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50/10 p-4">
                          <h4 className="font-bold text-emerald-950 mb-2 flex items-center gap-2">
                            <HeartHandshake className="w-5 h-5 text-emerald-600" />
                            {isHi
                              ? '५. व्यावहारिक क्रियाएं एवं वैदिक उपाय'
                              : '5. Practical Actions & Vedic Remedies'}
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-800 mb-1">
                                {isHi ? 'व्यावहारिक सुझाव:' : 'Practical Actions:'}
                              </p>
                              <ul className="list-disc pl-5 text-slate-700 text-sm space-y-1">
                                {classicalAnswer.remedies.actions.map((act, i) => (
                                  <li key={i}>{act}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800 mb-1">
                                {isHi ? 'वैदिक उपाय (वैकल्पिक):' : 'Vedic Remedies (Optional):'}
                              </p>
                              <div className="grid gap-2">
                                {classicalAnswer.remedies.optionalRemedies.map((rem, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2 bg-emerald-50/40 rounded border border-emerald-100 text-xs"
                                  >
                                    <span className="font-semibold text-emerald-950 block capitalize">
                                      {rem.type}
                                    </span>
                                    <p className="text-slate-800 mt-0.5">{rem.description}</p>
                                    <span className="text-slate-500 text-[10px] block mt-0.5">
                                      Source: {rem.source}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 border-t pt-2">
                              {classicalAnswer.remedies.disclaimer}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        {isHi
                          ? 'शास्त्रीय फलादेश लोड हो रहा है...'
                          : 'Loading classical reading...'}
                      </div>
                    )}
                  </TabsContent>

                  {/* Indicators tab */}
                  <TabsContent value="indicators" className="space-y-2 mt-4">
                    {result.verdict.indicators.map((ind, i) => (
                      <div
                        key={i}
                        className={`rounded-lg border p-3 flex items-start justify-between ${
                          ind.weight > 0
                            ? 'bg-emerald-50 border-emerald-200'
                            : ind.weight < 0
                              ? 'bg-rose-50 border-rose-200'
                              : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {ind.name}
                          </p>
                          <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? ind.detail.hi : ind.detail.en}
                          </p>
                        </div>
                        <Badge
                          variant={
                            ind.weight > 0
                              ? 'default'
                              : ind.weight < 0
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {ind.weight > 0 ? `+${ind.weight}` : ind.weight}
                        </Badge>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Chart tab — PrashnaKundaliChart */}
                  <TabsContent value="chart" className="mt-4">
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {isHi ? 'कुंडली लोड हो रही है...' : 'Loading chart...'}
                        </div>
                      }
                    >
                      <PrashnaKundaliChart
                        questionTime={questionTime}
                        questionLat={chartLat}
                        questionLon={chartLon}
                        question={question}
                        lang={isHi ? 'hi' : 'en'}
                      />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 🔮 SECTION 3d: Deep Subjective Analysis (13-Layer Convergence) 🔮 */}
            {classicalAnswer && <EnhancedAnalysisPanel answer={classicalAnswer} isHi={isHi} />}

            {/* ── SECTION 3b: Prasna Marga Classical Meters (five-step extras) ── */}
            {gulikaKala && pranaksharaDetail && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <PrasnaMargaMeters
                  tarabala={prasnaTarabala}
                  chandraBala={chandraBala}
                  gulikaKala={gulikaKala}
                  pranakshara={pranaksharaDetail}
                  isHi={isHi}
                />
              </motion.div>
            )}

            {/* ── SECTION 3c: Santhana Prasna (Ch.18) — shown for progeny questions ── */}
            {isProgenyQuestion && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {isHi ? 'प्रश्न मार्ग अध्याय १८' : 'Prasna Marga Chapter 18'}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {isHi
                      ? '— संतान प्रश्न विस्तृत विश्लेषण'
                      : '— Santhana Prasna detailed analysis'}
                  </span>
                </div>
                <ProgenyAnalysisCard isHi={isHi} />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── SECTION 4: Reading History (localStorage, last 15) ── */}
        <div className="mt-8">
          <PrasnaReadingHistory
            key={historyKey}
            isHi={isHi}
            onReload={() => setHistoryKey(k => k + 1)}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
