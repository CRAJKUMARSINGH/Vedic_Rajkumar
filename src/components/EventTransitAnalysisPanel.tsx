/**
 * src/components/EventTransitAnalysisPanel.tsx
 *
 * Event Transit Analysis panel with enriched supplement features wired to root app:
 *  Prognosis (+ Tara Bala, SAV, hora countdown, top factors)
 *  Natal (+ D9 Moon)
 *  Transits (+ per-planet AV overlay)
 *  Dasha (antardasha timeline)
 *  Yogas
 *  Guidance (+ Panchanga, company research, direction compass)
 *  Remedies (dynamic from chart)
 *  Journal (outcome tracker, localStorage)
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ChevronDown, ChevronUp, Download, Printer } from 'lucide-react';
import ShareReportModal from '@/components/ShareReportModal';
import DirectionCompass from '@/components/DirectionCompass';
import EventOutcomeJournal from '@/components/EventOutcomeJournal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  generateEventReport,
  type EventProfile,
  type EventInput,
  type PrognosisReport,
  type PrognosisScore,
  type NatalPlanetRow,
  type TransitPlanetRow,
  type GuidanceSection,
  type CareerYoga,
} from '@/services/eventTransitAnalysisService';
import { exportEventTransitPDF } from '@/services/eventTransitPdfService';
import {
  buildApproxMoonDoubleTransitInput,
  checkCareerMoonDoubleTransit,
} from '@/services/doubleTransitService';
import EventCountdownHora from '@/components/EventCountdownHora';
import DynamicRemediesPanel from '@/components/DynamicRemediesPanel';
import CompanyResearchCard from '@/components/CompanyResearchCard';
import PanchangaTiles from '@/components/PanchangaTiles';
import DashaCard from '@/components/DashaCard';
import { buildEventShareUrl } from '@/utils/eventShareUrl';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ShareContext {
  birthCityLabel: string;
  birthDst: boolean;
  eventDst: boolean;
}

interface Props {
  profile: EventProfile;
  event: EventInput;
  lang?: 'en' | 'hi';
  shareContext?: ShareContext;
}

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, label, labelHi, color, detail, lang }: PrognosisScore & { lang: 'en' | 'hi' }) {
  const radius = 36;
  const circ   = 2 * Math.PI * radius;
  const dash   = (score / 100) * circ;

  const colorMap: Record<string, string> = {
    emerald: '#10b981', indigo: '#6366f1', violet: '#8b5cf6',
    amber: '#f59e0b', rose: '#f43f5e',
  };
  const stroke = colorMap[color] ?? '#6366f1';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-2 text-center"
    >
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
          <circle cx="45" cy="45" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="45" cy="45" r={radius} fill="none"
            stroke={stroke} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color: stroke }}>{score}</span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">
          {lang === 'hi' ? labelHi : label}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[140px] leading-snug">{detail}</p>
      </div>
    </motion.div>
  );
}

// ─── Strength Bar ──────────────────────────────────────────────────────────────

function StrengthBar({ value, status }: { value: number; status: string }) {
  const col = status === 'favorable' ? 'bg-emerald-500' : status === 'mixed' ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${col}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-mono w-8 text-right text-muted-foreground">{value}%</span>
    </div>
  );
}

// ─── Prognosis Tab ─────────────────────────────────────────────────────────────

function DoubleTransitBadge({ moonRashiIndex, eventDate, lang }: { moonRashiIndex: number; eventDate: string; lang: 'en' | 'hi' }) {
  const isHi = lang === 'hi';
  const dt = new Date(eventDate + 'T12:00:00Z');
  const dtInput = buildApproxMoonDoubleTransitInput(moonRashiIndex, dt);
  const careerDT = checkCareerMoonDoubleTransit(dtInput);

  const confColor = careerDT.confidence === 'high' ? 'emerald' : careerDT.confidence === 'moderate' ? 'amber' : 'rose';
  const confBg   = `bg-${confColor}-50 dark:bg-${confColor}-950/20 border-${confColor}-300`;
  const confTxt  = `text-${confColor}-700 dark:text-${confColor}-300`;

  return (
    <Card className={`border ${confBg}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm ${confTxt}`}>
          ♃♄ {isHi ? 'दोहरा गोचर परीक्षण (कैरियर)' : 'Double Transit Test (Career)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Jupiter: </span>
            <strong>{careerDT.jupiterRashi}</strong> (H{careerDT.jupiterHouse}/Moon)
          </div>
          <div>
            <span className="text-muted-foreground">Saturn: </span>
            <strong>{careerDT.saturnRashi}</strong> (H{careerDT.saturnHouse}/Moon)
          </div>
          <Badge variant="outline" className={`text-[10px] ml-auto ${confBg} ${confTxt}`}>
            {careerDT.isActive ? '✅ Active' : '○ Inactive'} — {careerDT.confidence}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{careerDT.narrative}</p>
        <p className={`text-xs font-semibold ${confTxt}`}>{careerDT.thereforeVerdict}</p>
      </CardContent>
    </Card>
  );
}

function PrognosisTab({ report, lang }: { report: PrognosisReport; lang: 'en' | 'hi' }) {
  const isHi = lang === 'hi';
  const c = report.overallScore >= 70 ? 'text-emerald-700' : report.overallScore >= 50 ? 'text-amber-700' : 'text-rose-700';
  return (
    <div className="space-y-6">
      {/* Score rings */}
      <Card className="border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-indigo-700 dark:text-indigo-300">
            ✦ {isHi ? 'पूर्वानुमान स्कोर' : 'Prognosis Scores'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-around gap-6 py-2">
            {report.scores.map((s, i) => (
              <ScoreRing key={i} {...s} lang={lang} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall verdict */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 dark:from-emerald-950/20 dark:to-indigo-950/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🔮</span>
            <div>
              <p className={`text-sm font-bold ${c} mb-1`}>
                {isHi ? 'समग्र निर्णय' : 'Overall Verdict'} — {report.overallScore}/100
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {isHi ? report.verdictHi : report.verdict}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active career yogas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🌟 {isHi ? 'सक्रिय कैरियर योग' : 'Active Career Yogas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {report.careerYogas.map((y, i) => (
              <div key={i} className={`flex items-start gap-3 p-2 rounded-lg border ${y.active ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 opacity-60'}`}>
                <span className="text-lg">{y.active ? '✅' : '○'}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{y.name}</p>
                  <p className="text-[10px] text-muted-foreground">{y.description}</p>
                </div>
                {y.active && (
                  <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-700 shrink-0">
                    {y.strength}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tara Bala + SAV */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className={`border ${report.taraBala.isAuspicious ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
          <CardContent className="pt-3 pb-3">
            <p className="text-xs font-bold text-emerald-800 mb-1">
              ☽ {isHi ? 'तारा बल (Transit Quality)' : 'Tara Bala (Transit Quality)'}
            </p>
            <p className="text-sm font-semibold">{report.taraBala.taraName} (#{report.taraBala.taraNumber})</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {report.taraBala.birthNakshatra} → {report.taraBala.transitNakshatra}
            </p>
            <p className="text-xs mt-1">{report.taraBala.description}</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-300 bg-indigo-50">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs font-bold text-indigo-800 mb-1">
              📊 {isHi ? 'नाडी / SAV (घटना भाव)' : 'Nadi / SAV (Event House)'}
            </p>
            <p className="text-2xl font-bold text-indigo-700">{report.eventHouseSavScore} <span className="text-sm font-normal">bindus</span></p>
            <p className="text-[10px] text-muted-foreground">
              House {report.eventHouseNumber} · {report.eventHouseSavScore >= 28 ? 'Strong support' : report.eventHouseSavScore >= 25 ? 'Moderate' : 'Weak — extra remedies advised'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top positive factors */}
      {report.positiveFactors.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">⭐ {isHi ? 'शीर्ष 5 सकारात्मक कारक' : 'Top 5 Positive Factors'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.positiveFactors.map(f => (
              <div key={f.rank} className="flex items-start gap-2 p-2 rounded border border-emerald-200 bg-emerald-50/50">
                <span className="text-lg font-bold text-emerald-600">#{f.rank}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{isHi ? f.titleHi : f.title}</p>
                  <p className="text-[10px] text-muted-foreground">{f.detail}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{f.score}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <EventCountdownHora
        eventDate={report.event.eventDate}
        eventTime={report.event.eventTime}
        horaTimeline={report.horaTimeline}
        lang={lang}
      />

      <PanchangaTiles panchanga={report.panchanga} lang={lang} />

      <Card className="border-violet-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-violet-700">
            🕐 {isHi ? 'मुहूर्त विवरण' : 'Muhurta Details'} — {report.muhurtaDetails.weekday}, {report.muhurtaDetails.hora}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {report.muhurtaDetails.notes.map((n, i) => (
              <p key={i} className="text-xs text-violet-900 dark:text-violet-200">• {n}</p>
            ))}
            <p className="text-xs text-muted-foreground mt-2">{report.muhurtaDetails.tithiDescription}</p>
          </div>
        </CardContent>
      </Card>
      {/* Double transit */}
      <DoubleTransitBadge moonRashiIndex={report.profile.moonRashiIndex} eventDate={report.event.eventDate} lang={lang} />
    </div>
  );
}

// ─── Natal Chart Tab ──────────────────────────────────────────────────────────

function NatalChartTab({ planets, d9MoonSign, lang }: { planets: NatalPlanetRow[]; d9MoonSign: string; lang: 'en' | 'hi' }) {
  const isHi = lang === 'hi';
  const dignityColor: Record<string, string> = {
    Exalted: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    'Own Sign': 'text-blue-700 bg-blue-50 border-blue-300',
    Neutral: 'text-gray-600 bg-gray-50 border-gray-300',
    'Friend Sign': 'text-sky-700 bg-sky-50 border-sky-300',
    'Enemy Sign': 'text-orange-700 bg-orange-50 border-orange-300',
    Debilitated: 'text-rose-700 bg-rose-50 border-rose-300',
  };
  return (
    <div className="space-y-4">
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="pt-3 pb-3">
          <p className="text-xs font-bold text-purple-800">
            D9 {isHi ? 'चंद्र राशि (नवांश)' : 'Moon Sign (Navamsa)'}
          </p>
          <p className="text-lg font-semibold text-purple-900">{d9MoonSign}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {isHi ? 'विवाह, भावनात्मक गहराई और आध्यात्मिक क्षमता का सारांश' : 'Varga dignity summary for emotional depth & spiritual capacity'}
          </p>
        </CardContent>
      </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          ☽ {isHi ? 'जन्म कुंडली — ग्रह स्थिति' : 'Natal Chart — Planetary Positions'}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="p-2 font-semibold">Planet</th>
              <th className="p-2 font-semibold">Rashi</th>
              <th className="p-2 font-semibold">H/Lagna</th>
              <th className="p-2 font-semibold">H/Moon</th>
              <th className="p-2 font-semibold">Dignity</th>
              <th className="p-2 font-semibold">Strength</th>
              <th className="p-2 font-semibold">Career Role</th>
            </tr>
          </thead>
          <tbody>
            {planets.map((p, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="p-2 font-bold">{p.symbol} {p.planet}</td>
                <td className="p-2">{p.rashiName}</td>
                <td className="p-2 text-center">{p.houseFromLagna}</td>
                <td className="p-2 text-center">{p.houseFromMoon}</td>
                <td className="p-2">
                  <Badge variant="outline" className={`text-[10px] border ${dignityColor[p.dignity] ?? ''}`}>
                    {p.dignity}
                  </Badge>
                </td>
                <td className="p-2 w-28">
                  <StrengthBar value={p.strength} status={p.strength >= 65 ? 'favorable' : p.strength >= 45 ? 'mixed' : 'unfavorable'} />
                </td>
                <td className="p-2 text-muted-foreground max-w-[180px]">{p.careerRelevance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
    </div>
  );
}

function TransitTab({ planets, lang, eventLabel }: { planets: TransitPlanetRow[]; lang: 'en' | 'hi'; eventLabel: string }) {
  const isHi = lang === 'hi';
  const statusBadge: Record<string, string> = {
    favorable: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    mixed: 'text-amber-700 bg-amber-50 border-amber-300',
    unfavorable: 'text-rose-700 bg-rose-50 border-rose-300',
  };
  const sorted = [...planets].sort((a, b) => b.strength - a.strength);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          ☉ {isHi ? 'घटना के समय गोचर' : `Transits at Event Time`} — {eventLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="p-2 font-semibold">Planet</th>
              <th className="p-2 font-semibold">Rashi</th>
              <th className="p-2 font-semibold">H/Moon</th>
              <th className="p-2 font-semibold">Vedha</th>
              <th className="p-2 font-semibold">Status</th>
              <th className="p-2 font-semibold">SAV</th>
              <th className="p-2 font-semibold">Strength</th>
              <th className="p-2 font-semibold">Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="p-2 font-bold">{t.symbol} {t.planet}</td>
                <td className="p-2">{t.transitRashiName}</td>
                <td className="p-2 text-center">{t.houseFromMoon}</td>
                <td className="p-2 text-center">
                  {t.vedhaNote && t.vedhaNote !== 'None'
                    ? <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-400">{t.vedhaNote}</Badge>
                    : <span className="text-emerald-600">—</span>}
                </td>
                <td className="p-2">
                  <Badge variant="outline" className={`text-[10px] border ${statusBadge[t.status] ?? ''}`}>
                    {t.status}
                  </Badge>
                </td>
                <td className="p-2 text-center">
                  {t.savScore != null ? (
                    <Badge variant="outline" className={`text-[10px] ${
                      t.savStrength === 'Strong' ? 'border-emerald-400 text-emerald-700' :
                      t.savStrength === 'Moderate' ? 'border-amber-400 text-amber-700' :
                      'border-rose-400 text-rose-700'
                    }`}>{t.savScore}</Badge>
                  ) : '—'}
                </td>
                <td className="p-2 w-28">
                  <StrengthBar value={t.strength} status={t.status} />
                </td>
                <td className="p-2 text-muted-foreground max-w-[200px] text-[10px]">{t.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ─── Guidance Tab ─────────────────────────────────────────────────────────────

function GuidanceTab({ sections, dashaState, event, natalPlanets, panchanga, lang }: {
  sections: GuidanceSection[];
  dashaState: PrognosisReport['dashaState'];
  event: EventInput;
  natalPlanets: NatalPlanetRow[];
  panchanga: PrognosisReport['panchanga'];
  lang: 'en' | 'hi';
}) {
  const isHi = lang === 'hi';
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  return (
    <div className="space-y-3">
      <CompanyResearchCard companyQuery={event.eventCompany ?? event.domainLabel} lang={lang} />
      <PanchangaTiles panchanga={panchanga} lang={lang} />
      <DirectionCompass natalPlanets={natalPlanets} lang={lang} />
      {/* Dasha badge */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-3 pb-3">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
            ♃ Active Dasha
          </p>
          <p className="text-xs text-amber-900 dark:text-amber-200">
            <strong>{dashaState.mahadasha} MD → {dashaState.antardasha} AD → {dashaState.pratyantardasha} PD</strong>
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">{dashaState.dashaInterpretation}</p>
        </CardContent>
      </Card>

      {sections.map((s, i) => (
        <Card key={i} className="border-indigo-100">
          <button
            className="w-full text-left"
            onClick={() => setOpen(prev => ({ ...prev, [i]: !prev[i] }))}
          >
            <CardHeader className="pb-2 pt-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-indigo-700 dark:text-indigo-300">
                {isHi ? s.titleHi : s.title}
              </CardTitle>
              {open[i] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </CardHeader>
          </button>
          {open[i] && (
            <CardContent className="pt-0 pb-3">
              <ul className="space-y-1.5">
                {s.points.map((pt, j) => (
                  <li key={j} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {pt}
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

function YogasTab({ yogas, lang }: { yogas: CareerYoga[]; lang: 'en' | 'hi' }) {
  const isHi = lang === 'hi';
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🌟 {isHi ? 'कैरियर योग' : 'Career Yogas'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {yogas.map((y, i) => (
          <div key={i} className={`p-3 rounded-lg border ${y.active ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 opacity-60'}`}>
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold">{y.active ? '✅' : '○'} {y.name}</p>
              {y.active && <Badge className="text-[10px]">{y.strength}%</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{y.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function EventTransitAnalysisPanel({ profile, event, lang = 'en', shareContext }: Props) {
  const [report, setReport] = useState<PrognosisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('prognosis');
  const printRef = useRef<HTMLDivElement>(null);
  const isHi = lang === 'hi';

  const shareUrl = useMemo(() => {
    if (!shareContext) return undefined;
    return buildEventShareUrl(
      { profile, event, ...shareContext },
      { autoRun: true },
    );
  }, [profile, event, shareContext]);

  const handlePrint = () => {
    window.print();
  };

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await generateEventReport(profile, event);
      setReport(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [profile, event]);

  // Auto-run on mount
  useEffect(() => { runAnalysis(); }, [runAnalysis]);

  const eventLabel = `${event.eventDate} ${event.eventTime} — ${event.eventLocation}`;

  return (
    <div className="space-y-4" ref={printRef}>
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            🎯 {isHi ? 'घटना गोचर विश्लेषण' : 'Event Transit Analysis'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {profile.name} · {event.domainLabel ?? event.eventType} · {eventLabel}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={runAnalysis} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {loading ? (isHi ? 'गणना…' : 'Calculating…') : (isHi ? 'पुनः गणना' : 'Recalculate')}
          </Button>
          {report && (
            <ShareReportModal
              title={`${profile.name} — ${event.domainLabel ?? event.eventType}`}
              shareUrl={shareUrl}
              lang={lang}
            />
          )}
          {report && (
            <Button
              size="sm"
              variant="outline"
              className="border-gray-400"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-1" />
              {isHi ? 'प्रिंट' : 'Print'}
            </Button>
          )}
          {report && (
            <Button
              size="sm"
              variant="outline"
              className="border-violet-400 text-violet-700 hover:bg-violet-50"
              onClick={() => exportEventTransitPDF(report, lang)}
            >
              <Download className="w-4 h-4 mr-1" />
              {isHi ? 'PDF' : 'Export PDF'}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-rose-300 bg-rose-50">
          <CardContent className="pt-3 pb-3 text-xs text-rose-700">{error}</CardContent>
        </Card>
      )}

      {loading && !report && (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {isHi ? 'ग्रह स्थितियाँ गणना हो रही हैं…' : 'Calculating planetary positions…'}
          </p>
        </div>
      )}

      {report && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 sm:grid-cols-8 w-full h-auto p-1 gap-0.5">
            <TabsTrigger value="prognosis" className="text-[10px] sm:text-[11px] py-2 flex flex-col gap-0.5">
              ✦ {isHi ? 'पूर्वानुमान' : 'Prognosis'}
            </TabsTrigger>
            <TabsTrigger value="natal" className="text-[10px] sm:text-[11px] py-2 flex flex-col gap-0.5">
              ☽ {isHi ? 'कुंडली' : 'Natal'}
            </TabsTrigger>
            <TabsTrigger value="transits" className="text-[10px] sm:text-[11px] py-2 flex flex-col gap-0.5">
              ☉ {isHi ? 'गोचर' : 'Transits'}
            </TabsTrigger>
            <TabsTrigger value="dasha" className="text-[10px] sm:text-[11px] py-2 flex flex-col gap-0.5">
              ⏳ {isHi ? 'दशा' : 'Dasha'}
            </TabsTrigger>
            <TabsTrigger value="yogas" className="text-[10px] sm:text-[11px] py-2 flex flex-col gap-0.5">
              🌟 {isHi ? 'योग' : 'Yogas'}
            </TabsTrigger>
            <TabsTrigger value="guidance" className="text-[10px] sm:text-[11px] py-2 flex flex-col gap-0.5">
              ♃ {isHi ? 'मार्गदर्शन' : 'Guidance'}
            </TabsTrigger>
            <TabsTrigger value="remedies" className="text-[10px] sm:text-[11px] py-2 flex flex-col gap-0.5">
              🔮 {isHi ? 'उपाय' : 'Remedies'}
            </TabsTrigger>
            <TabsTrigger value="journal" className="text-[10px] sm:text-[11px] py-2 flex flex-col gap-0.5">
              📓 {isHi ? 'जर्नल' : 'Journal'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prognosis" className="mt-4">
            <PrognosisTab report={report} lang={lang} />
          </TabsContent>
          <TabsContent value="natal" className="mt-4">
            <NatalChartTab planets={report.natalPlanets} d9MoonSign={report.d9MoonSign} lang={lang} />
          </TabsContent>
          <TabsContent value="transits" className="mt-4">
            <TransitTab planets={report.transitPlanets} lang={lang} eventLabel={eventLabel} />
          </TabsContent>
          <TabsContent value="dasha" className="mt-4">
            <DashaCard birthDate={profile.birthDate} birthTime={profile.birthTime} lang={lang} />
          </TabsContent>
          <TabsContent value="yogas" className="mt-4">
            <YogasTab yogas={report.careerYogas} lang={lang} />
          </TabsContent>
          <TabsContent value="guidance" className="mt-4">
            <GuidanceTab
              sections={report.guidanceSections}
              dashaState={report.dashaState}
              event={event}
              natalPlanets={report.natalPlanets}
              panchanga={report.panchanga}
              lang={lang}
            />
          </TabsContent>
          <TabsContent value="remedies" className="mt-4">
            <DynamicRemediesPanel remedies={report.remedies} lang={lang} />
          </TabsContent>
          <TabsContent value="journal" className="mt-4">
            <EventOutcomeJournal profile={profile} event={event} lang={lang} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
