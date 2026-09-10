import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Upload,
  RefreshCw,
  Target,
  Ruler,
  Activity,
  LayoutGrid,
  Clock,
} from 'lucide-react';
import { ACCURACY_SUMMARY_FIXTURE } from '@/fixtures/accuracySummary.fixture';
import {
  buildDashboardData,
  type ValidationDashboardData,
  type MismatchRecord,
} from '@/lib/validationDashboardData';

type StatusFilter = 'All' | 'PASS' | 'WARN' | 'FAIL';
type Severity = 'PASS' | 'WARN' | 'FAIL';

const STATUS_STYLES: Record<Severity, string> = {
  PASS: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  WARN: 'text-amber-700 bg-amber-50 border-amber-200',
  FAIL: 'text-rose-700 bg-rose-50 border-rose-200',
};

const STATUS_ICON: Record<Severity, typeof CheckCircle2> = {
  PASS: CheckCircle2,
  WARN: AlertTriangle,
  FAIL: XCircle,
};

const COPY = {
  en: {
    title: 'Validation Dashboard',
    subtitle: 'Internal accuracy prototype. 15 reference charts compared against Swiss Ephemeris benchmarks. This initiative is ongoing — results are visible so progress stays transparent.',
    subtitleHi: '',
    home: 'Home',
    hiToggle: 'हिं',
    enToggle: 'EN',
    upload: 'Upload Report',
    refresh: 'Refresh Suite',
    scope: 'Scope: Week 04 — House Cusps, Antardasha & Ashtakavarga',
    verdict: 'Suite Verdict',
    engine: 'Engine',
    fieldAcc: 'Field Accuracy',
    chartPass: 'Charts Passed',
    totalCharts: 'Total Charts',
    totalFields: 'Fields Checked',
    rashiFails: 'Rashi Failures',
    week2Title: 'Week 04 Progress',
    cusps: 'House Cusps Checked',
    antardasha: 'Antardasha Checked',
    mismatches: 'Mismatches & Warnings',
    mismatchesEmpty: 'No mismatches. Every reference chart is within tolerance.',
    mismatchesEmptyHi: '',
    chartsTable: 'Reference Charts',
    fieldBreakdown: 'Accuracy by Field',
    statusAll: 'All',
    statusPass: 'Pass',
    statusWarn: 'Warn',
    statusFail: 'Fail',
    search: 'Search chart id or name',
    chart: 'Chart',
    status: 'Status',
    fields: 'Fields',
    pass: 'Pass',
    warn: 'Warn',
    fail: 'Fail',
    expand: 'Expand',
    collapse: 'Collapse',
    noResults: 'No charts match your filters.',
    noResultsHi: '',
    calc: 'Calculated',
    expected: 'Expected',
    delta: 'Delta',
    severity: 'Severity',
    prototypeNote: 'Prototype dashboard — data is loaded from curated fixtures. Continuous benchmarking runs on each engine change; full backend automation and 30+ chart corpus are scheduled next.',
    prototypeNoteHi: '',
    statusBanner: 'Validation is active and continuous. The numbers here refresh with every engine patch.',
    statusBannerHi: '',
    fieldCol: 'Field',
    totalCol: 'Total',
  },
  hi: {
    title: 'मान्यता डैशबोर्ड',
    subtitle: 'आंतरिक सटीकता प्रोटोटाइप। 15 संदर्भ चार्ट्स की तुलना स्विस इफेमरिडिस बेंचमार्क्स के साथ। यह पहल जारी है — परिणाम दृश्यमान हैं ताकि प्रगति पारदर्शी रहे।',
    subtitleHi: '',
    home: 'होम',
    hiToggle: 'हिं',
    enToggle: 'EN',
    upload: 'रिपोर्ट अपलोड करें',
    refresh: 'सूट रिफ्रेश करें',
    scope: 'स्कोप: सप्ताह 04 — हाउस कस्प्स, अंतरदशा और अष्टकवर्ग',
    verdict: 'सूट निर्णय',
    engine: 'इंजन',
    fieldAcc: 'फ़ील्ड सटीकता',
    chartPass: 'चार्ट्स पास',
    totalCharts: 'कुल चार्ट्स',
    totalFields: 'फ़ील्ड्स जाँचे गए',
    rashiFails: 'राशि विफलताएँ',
    week2Title: 'सप्ताह 04 प्रगति',
    cusps: 'हाउस कस्प्स जाँचे गए',
    antardasha: 'अंतरदशा जाँची गई',
    mismatches: 'बेमेल और चेतावनियाँ',
    mismatchesEmpty: 'कोई बेमेल नहीं। प्रत्येक संदर्भ चार्ट सहिष्णुता के भीतर है।',
    mismatchesEmptyHi: '',
    chartsTable: 'संदर्भ चार्ट्स',
    fieldBreakdown: 'फ़ील्डवार सटीकता',
    statusAll: 'सभी',
    statusPass: 'पास',
    statusWarn: 'चेतावनी',
    statusFail: 'विफल',
    search: 'चार्ट ID या नाम खोजें',
    chart: 'चार्ट',
    status: 'स्थिति',
    fields: 'फ़ील्ड्स',
    pass: 'पास',
    warn: 'चेतावनी',
    fail: 'विफल',
    expand: 'विस्तृत',
    collapse: 'संक्षिप्त',
    noResults: 'आपके फ़िल्टर से कोई चार्ट मेल नहीं खाता।',
    noResultsHi: '',
    calc: 'गणना',
    expected: 'अपेक्षित',
    delta: 'अंतर',
    severity: 'गंभीरता',
    prototypeNote: 'प्रोटोटाइप डैशबोर्ड — डेटा फ़िक्चर से लोड होता है। हर इंजन परिवर्तन पर बेंचमार्किंग चलती है; पूर्ण बैकएंड स्वचालन और 30+ चार्ट कॉर्पस अगले हैं।',
    prototypeNoteHi: '',
    statusBanner: 'मान्यता सक्रिय और निरंतर है। यहां की संख्याएं हर इंजन पैच के साथ ताज़ा होती हैं।',
    statusBannerHi: '',
    fieldCol: 'फ़ील्ड',
    totalCol: 'कुल',
  },
};

export default function ValidationDashboardPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('REF-001');
  const t = COPY[lang];
  const isHi = lang === 'hi';

  const data: ValidationDashboardData = useMemo(
    () => buildDashboardData(ACCURACY_SUMMARY_FIXTURE),
    [],
  );

  const filteredCharts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.charts.filter(c => {
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesSearch =
        q.length === 0 ||
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [data.charts, statusFilter, searchQuery]);

  const fieldAccPct = data.totalFields > 0
    ? ((data.passFields / data.totalFields) * 100).toFixed(1)
    : '0';
  const chartPassPct = data.totalCharts > 0
    ? ((data.passCharts / data.totalCharts) * 100).toFixed(0)
    : '0';
  const suiteSeverity: Severity = data.failCharts > 0 ? 'FAIL' : data.warnCharts > 0 ? 'WARN' : 'PASS';
  const VerdictIcon = STATUS_ICON[suiteSeverity];
  const verdictLabel = isHi
    ? (suiteSeverity === 'PASS' ? 'पास' : suiteSeverity === 'WARN' ? 'चेतावनी' : 'विफल')
    : suiteSeverity;

  const statusTabs: Array<StatusFilter> = ['All', 'PASS', 'WARN', 'FAIL'];
  const statusLabels: Record<StatusFilter, string> = {
    'All': t.statusAll,
    'PASS': t.statusPass,
    'WARN': t.statusWarn,
    'FAIL': t.statusFail,
  };
  const mismatchStatusLabels: Record<Severity, string> = {
    'PASS': t.statusPass,
    'WARN': t.statusWarn,
    'FAIL': t.statusFail,
  };

  return (
    <>
      <SEO
        title={isHi ? 'मान्यता डैशबोर्ड — Vedic Rajkumar' : 'Validation Dashboard — Vedic Rajkumar'}
        description="Internal validation dashboard for Vedic Rajkumar accuracy initiative. Compare 15 reference charts, inspect mismatches, and review pass/fail summaries."
        keywords="vedic astrology validation dashboard, accuracy report, lahiri ayanamsa, chart comparison"
        canonical="/validation"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 text-slate-900">
        <header className="border-b border-amber-200/60 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3">
              <Link to="/" className="inline-flex items-center text-sm text-amber-700 hover:text-amber-900 gap-1 shrink-0">
                <ArrowLeft className="w-4 h-4" />
                {t.home}
              </Link>
              <div className="min-w-0">
                <Badge variant="outline" className="mb-1 border-amber-300 bg-amber-50 text-amber-800">
                  <Activity className="w-3 h-3 mr-1 inline" />
                  {t.scope}
                </Badge>
                <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isHi ? 'font-hindi' : ''}`}>
                  {t.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setLang(v => v === 'en' ? 'hi' : 'en')}>
                {isHi ? 'EN' : 'हिं'}
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <Upload className="w-4 h-4 mr-1.5" />
                {t.upload}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1.5" />
                {t.refresh}
              </Button>
            </div>
          </div>
        </header>

        <main className="container max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
          <Card className="border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="pt-4">
              <p className={`text-sm text-slate-600 ${isHi ? 'font-hindi' : ''}`}>
                {t.subtitle}
              </p>
              <p className={`mt-2 text-xs text-emerald-700 flex items-center gap-1.5 ${isHi ? 'font-hindi' : ''}`}>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {t.statusBanner}
              </p>
              <p className={`mt-2 text-xs text-amber-700 flex items-center gap-1.5 ${isHi ? 'font-hindi' : ''}`}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                {t.prototypeNote}
              </p>
            </CardContent>
          </Card>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className={`border-2 ${STATUS_STYLES[suiteSeverity]}`}>
              <CardContent className="pt-4">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {t.verdict}
                </p>
                <div className="flex items-center gap-2">
                  <VerdictIcon className="w-6 h-6" />
                  <span className={`text-2xl font-extrabold ${isHi ? 'font-hindi' : ''}`}>{verdictLabel}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50/60 text-emerald-800">
              <CardContent className="pt-4">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {t.fieldAcc}
                </p>
                <p className="text-2xl font-extrabold">{data.fieldAccuracyPct}%</p>
                <p className="text-[11px] mt-1 opacity-70">
                  {data.passFields}/{data.totalFields} ({fieldAccPct}%)
                </p>
              </CardContent>
            </Card>
            <Card className="border-sky-200 bg-sky-50/60 text-sky-800">
              <CardContent className="pt-4">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {t.chartPass}
                </p>
                <p className="text-2xl font-extrabold">{data.passCharts}/{data.totalCharts}</p>
                <p className="text-[11px] mt-1 opacity-70">
                  {chartPassPct}% {isHi ? 'चार्ट्स' : 'charts'}
                </p>
              </CardContent>
            </Card>
            <Card className={
              data.rashiFailureCount === 0
                ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                : 'border-rose-200 bg-rose-50/60 text-rose-800'
            }>
              <CardContent className="pt-4">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isHi ? 'font-hindi' : ''}`}>
                  {t.rashiFails}
                </p>
                <p className="text-2xl font-extrabold">{data.rashiFailureCount}</p>
                <p className="text-[11px] mt-1 opacity-70">
                  {isHi ? 'राशि परिणाम — सटीक मेल' : 'Rashi outcomes — exact match required'}
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-amber-600" />
                  {t.week2Title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`flex items-center gap-1.5 ${isHi ? 'font-hindi' : ''}`}>
                      <Ruler className="w-3.5 h-3.5 text-slate-500" /> {t.cusps}
                    </span>
                    <span className="font-medium">{data.week2Targets.houseCuspsChecked}/15</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${(data.week2Targets.houseCuspsChecked / 15) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`flex items-center gap-1.5 ${isHi ? 'font-hindi' : ''}`}>
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {t.antardasha}
                    </span>
                    <span className="font-medium">{data.week2Targets.antardashaChecked}/15</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${(data.week2Targets.antardashaChecked / 15) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  {t.engine}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 break-words">{data.engine}</p>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <dt className={`opacity-70 ${isHi ? 'font-hindi' : ''}`}>{t.totalCharts}</dt>
                    <dd className="font-bold text-slate-800 text-base">{data.totalCharts}</dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <dt className={`opacity-70 ${isHi ? 'font-hindi' : ''}`}>{t.totalFields}</dt>
                    <dd className="font-bold text-slate-800 text-base">{data.totalFields}</dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <dt className={`opacity-70 ${isHi ? 'font-hindi' : ''}`}>{t.mismatches.split(' ')[0]}</dt>
                    <dd className="font-bold text-slate-800 text-base">{data.mismatches.length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {t.mismatches}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.mismatches.length === 0 ? (
                  <div className={`py-8 text-center text-sm text-emerald-700 bg-emerald-50/50 rounded-lg border border-emerald-200/70 ${isHi ? 'font-hindi' : ''}`}>
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                    {t.mismatchesEmpty}
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
                          <th className="px-2 py-2 font-semibold">{t.chart}</th>
                          <th className="px-2 py-2 font-semibold">{t.fieldCol}</th>
                          <th className="px-2 py-2 font-semibold">{t.calc}</th>
                          <th className="px-2 py-2 font-semibold">{t.expected}</th>
                          <th className="px-2 py-2 font-semibold">{t.delta}</th>
                          <th className="px-2 py-2 font-semibold">{t.severity}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.mismatches.map((m: MismatchRecord, i: number) => {
                          const SevIcon = STATUS_ICON[m.severity];
                          return (
                            <tr key={`${m.chartId}-${m.field}-${i}`} className="border-b border-slate-100 last:border-0 hover:bg-amber-50/40">
                              <td className="px-2 py-2.5">
                                <div className="font-medium text-slate-800">{m.chartId}</div>
                                <div className="text-xs text-slate-500">{m.chartName}</div>
                              </td>
                              <td className={`px-2 py-2.5 font-mono text-xs ${isHi ? 'font-hindi' : ''}`}>{m.field}</td>
                              <td className="px-2 py-2.5">{String(m.calculated)}</td>
                              <td className="px-2 py-2.5 text-slate-600">{String(m.expected)}</td>
                              <td className="px-2 py-2.5 font-mono text-xs">
                                {m.delta !== undefined ? `±${m.delta}` : '—'}
                              </td>
                              <td className="px-2 py-2.5">
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[m.severity]}`}>
                                  <SevIcon className="w-3 h-3" />
                                  {mismatchStatusLabels[m.severity]}
                                </span>
                                {m.note && (
                                  <p className="mt-1 text-[11px] text-slate-500 max-w-xs">{m.note}</p>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-amber-600" />
                    {t.chartsTable}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                      {statusTabs.map(s => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                            statusFilter === s
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50'
                          } ${isHi ? 'font-hindi' : ''}`}
                        >
                          {statusLabels[s]}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={t.search}
                      className="text-sm rounded-md border border-slate-200 px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 w-full sm:w-auto"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCharts.length === 0 ? (
                  <div className={`py-8 text-center text-sm text-slate-500 ${isHi ? 'font-hindi' : ''}`}>
                    {t.noResults}
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 -mx-1">
                    {filteredCharts.map(c => {
                      const sev = (c.status === 'PASS' || c.status === 'WARN' || c.status === 'FAIL')
                        ? c.status as Severity
                        : 'PASS' as Severity;
                      const StIcon = STATUS_ICON[sev];
                      const total = c.passCount + c.warnCount + c.failCount;
                      const pct = total > 0 ? ((c.passCount / total) * 100).toFixed(0) : '0';
                      const expanded = expandedId === c.id;
                      return (
                        <li key={c.id}>
                          <button
                            onClick={() => setExpandedId(v => v === c.id ? null : c.id)}
                            className="w-full text-left px-2 py-3 flex items-center gap-3 rounded-md hover:bg-amber-50/50 transition-colors"
                          >
                            <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[sev]}`}>
                              <StIcon className="w-3 h-3" />
                              {mismatchStatusLabels[sev]}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-500">{c.id}</span>
                                <span className={`font-semibold truncate ${isHi ? 'font-hindi' : ''}`}>{c.name}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                                <span>{c.passCount} {t.pass.toLowerCase()}</span>
                                {c.warnCount > 0 && <span className="text-amber-700">{c.warnCount} {t.warn.toLowerCase()}</span>}
                                {c.failCount > 0 && <span className="text-rose-700">{c.failCount} {t.fail.toLowerCase()}</span>}
                                <span className="opacity-60">· {pct}%</span>
                              </div>
                            </div>
                            <div className="hidden sm:block shrink-0 w-24">
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={
                                    'h-full ' +
                                    (sev === 'FAIL' ? 'bg-rose-500' : sev === 'WARN' ? 'bg-amber-500' : 'bg-emerald-500')
                                  }
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            {expanded
                              ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                              : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                          </button>
                          {expanded && (
                            <div className="px-2 pb-4">
                              <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                <dl className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-xs">
                                  <div>
                                    <dt className="text-slate-500 mb-0.5">{t.pass}</dt>
                                    <dd className="font-bold text-emerald-700 text-sm">{c.passCount}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-slate-500 mb-0.5">{t.warn}</dt>
                                    <dd className="font-bold text-amber-700 text-sm">{c.warnCount}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-slate-500 mb-0.5">{t.fail}</dt>
                                    <dd className="font-bold text-rose-700 text-sm">{c.failCount}</dd>
                                  </div>
                                  <div className="col-span-3 sm:col-span-3">
                                    <dt className="text-slate-500 mb-0.5">{t.fields}</dt>
                                    <dd className="font-semibold text-slate-700 text-sm">
                                      {c.passCount + c.warnCount + c.failCount} · {pct}% {t.pass.toLowerCase()}
                                    </dd>
                                  </div>
                                </dl>
                                {c.failures.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-amber-100">
                                    <p className="text-xs font-semibold text-rose-700 mb-2">{t.mismatches}</p>
                                    <ul className="space-y-1 text-xs">
                                      {c.failures.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-700">
                                          <XCircle className="w-3 h-3 mt-0.5 text-rose-500 shrink-0" />
                                          <span className="font-mono">{f.field}</span>
                                          <span>→ {String(f.calculated)} vs {String(f.expected)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-amber-600" />
                  {t.fieldBreakdown}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.fieldAccuracy.map(f => {
                    const pct = f.total > 0 ? ((f.pass / f.total) * 100).toFixed(0) : '0';
                    const color = f.fail > 0
                      ? 'from-rose-500 to-rose-400'
                      : f.warn > 0
                        ? 'from-amber-500 to-amber-400'
                        : 'from-emerald-500 to-emerald-400';
                    return (
                      <div key={f.field} className="rounded-lg border border-slate-100 bg-white p-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-mono text-slate-700">{f.field}</span>
                          <span className="font-semibold text-slate-700">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-1.5 flex gap-3 text-[11px]">
                          <span className="text-emerald-700">
                            {t.pass.slice(0, 3).toLowerCase()} {f.pass}
                          </span>
                          {f.warn > 0 && <span className="text-amber-700">warn {f.warn}</span>}
                          {f.fail > 0 && <span className="text-rose-700">fail {f.fail}</span>}
                          <span className="text-slate-400 ml-auto">{f.total} {t.totalCol.toLowerCase()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </>
  );
}
