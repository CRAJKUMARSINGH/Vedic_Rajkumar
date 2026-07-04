import { useState, useMemo } from 'react';
import {
  Download,
  RefreshCw,
  Star,
  Calendar,
  Compass,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import NorthIndianChart from '@/components/NorthIndianChart';
import {
  calculateChart,
  calculateNavamsa,
  calculateDasha,
  KANCHI_BIRTH,
  CURRENT_TRANSITS_2026,
  getSeventhLord,
  getTrines,
  getSixthHouseRashi,
  RASHIS_HI,
  RASHIS_EN,
  PLANET_SYMBOLS,
  RASHI_LORDS_HI,
  DIRECTIONS,
  formatDegree,
  formatDateEn,
} from '@/lib/vedic/vedicCalc';
import {
  analyzeMarriageTiming,
  forecastMarriageDate,
  analyzeSpouse,
} from '@/lib/vedic/marriageTiming';
import { analyzeMangalDosha } from '@/lib/vedic/mangalDosha';
import { generatePDF } from '@/lib/vedic/pdfExport';

const TRANSIT_PLANETS_2026 = [
  { name: 'Jupiter', nameHi: 'गुरु', rashi: 3, symbol: 'गु' },
  { name: 'Saturn', nameHi: 'शनि', rashi: 12, symbol: 'श' },
];

export default function KanchiPage() {
  const [activeTab, setActiveTab] = useState<
    'd1' | 'd9' | 'marriage' | 'spouse' | 'transits' | 'dasha' | 'mangal'
  >('d1');
  const [showTransits, setShowTransits] = useState(true);
  const [expandedMethod, setExpandedMethod] = useState<number | null>(0);
  const [pdfLoading, setPdfLoading] = useState(false);

  const d1 = useMemo(
    () =>
      calculateChart(
        KANCHI_BIRTH.year,
        KANCHI_BIRTH.month,
        KANCHI_BIRTH.day,
        KANCHI_BIRTH.hour,
        KANCHI_BIRTH.minute,
        KANCHI_BIRTH.lat,
        KANCHI_BIRTH.lon,
        KANCHI_BIRTH.timezone
      ),
    []
  );

  const d9 = useMemo(() => calculateNavamsa(d1), [d1]);

  const birthDate = useMemo(() => new Date(2004, 8, 8, 1, 5), []);
  const moon = d1.planets.find(p => p.name === 'Moon');
  const dashas = useMemo(() => calculateDasha(birthDate, moon?.longitude ?? 0), [birthDate, moon]);

  const seventhLordD1 = useMemo(() => getSeventhLord(d1), [d1]);
  const seventhLordD9 = useMemo(() => getSeventhLord(d9), [d9]);
  const trinesD1 = useMemo(() => getTrines(seventhLordD1.house), [seventhLordD1]);
  const trinesD9 = useMemo(() => getTrines(seventhLordD9.house), [seventhLordD9]);
  const sixthHouseD1 = useMemo(() => getSixthHouseRashi(d1), [d1]);
  const sixthHouseD9 = useMemo(() => getSixthHouseRashi(d9), [d9]);

  const marriageResults = useMemo(
    () => analyzeMarriageTiming(d1, d9, dashas, birthDate),
    [d1, d9, dashas, birthDate]
  );
  const marriageForecast = useMemo(() => forecastMarriageDate(d1, d9, dashas), [d1, d9, dashas]);
  const spouseAnalysis = useMemo(() => analyzeSpouse(d1, d9), [d1, d9]);
  const mangalDosha = useMemo(() => analyzeMangalDosha(d1), [d1]);

  const today = new Date(2026, 4, 10);
  const activeDasha = dashas.find(d => d.start <= today && d.end >= today);
  const activeAntar = activeDasha?.antarDashas.find(a => a.start <= today && a.end >= today);

  async function handleDownloadPDF() {
    setPdfLoading(true);
    try {
      await generatePDF(
        d1,
        d9,
        marriageResults,
        spouseAnalysis,
        `${KANCHI_BIRTH.name} (${KANCHI_BIRTH.nameEn})`,
        `${KANCHI_BIRTH.day}/${KANCHI_BIRTH.month}/${KANCHI_BIRTH.year} • ${KANCHI_BIRTH.hour}:${String(KANCHI_BIRTH.minute).padStart(2, '0')} IST • ${KANCHI_BIRTH.placeEn}`
      );
    } finally {
      setPdfLoading(false);
    }
  }

  const tabs = [
    { id: 'd1', label: 'D-1 जन्म कुण्डली', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'd9', label: 'D-9 नवांश', icon: <RefreshCw className="w-3.5 h-3.5" /> },
    { id: 'transits', label: 'गोचर', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'marriage', label: 'विवाह काल', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'spouse', label: 'जीवनसाथी', icon: <ArrowRight className="w-3.5 h-3.5" /> },
    { id: 'dasha', label: 'दशा', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'mangal', label: 'मंगल दोष', icon: <Star className="w-3.5 h-3.5 text-red-500" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-background" data-testid="kanchi-page">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 text-amber-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-devanagari text-xl font-bold tracking-wide">
              ॥ वैदिक ज्योतिष कुण्डली ॥
            </div>
            <div className="font-devanagari text-2xl font-bold mt-1">{KANCHI_BIRTH.name}</div>
            <div className="text-amber-200 text-sm mt-0.5">
              {KANCHI_BIRTH.nameEn} • {KANCHI_BIRTH.relationshipEn}
            </div>
            <div className="font-devanagari text-amber-200 text-sm mt-1">
              जन्म: {KANCHI_BIRTH.day}/{KANCHI_BIRTH.month}/{KANCHI_BIRTH.year} • समय:{' '}
              {KANCHI_BIRTH.hour}:{String(KANCHI_BIRTH.minute).padStart(2, '0')} IST • स्थान:{' '}
              {KANCHI_BIRTH.place}
            </div>
            <div className="text-amber-300 text-xs mt-0.5">
              {KANCHI_BIRTH.lat}°N {KANCHI_BIRTH.lon}°E • Lahiri Ayanamsa • उत्तर भारतीय शैली
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            data-testid="btn-download-pdf"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow shrink-0"
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? 'तैयार हो रहा है...' : 'PDF Download'}
          </button>
        </div>

        {/* Key info bar */}
        <div className="border-t border-amber-700 bg-amber-950/40">
          <div className="max-w-5xl mx-auto px-4 py-2 flex flex-wrap gap-4 text-xs text-amber-200">
            <span className="font-devanagari">
              लग्न: <span className="text-amber-100 font-bold">{RASHIS_HI[d1.lagna - 1]}</span> (
              {RASHIS_EN[d1.lagna - 1]})
            </span>
            <span className="font-devanagari">
              चन्द्र:{' '}
              <span className="text-amber-100 font-bold">
                {moon ? RASHIS_HI[moon.rashi - 1] : '—'}
              </span>
            </span>
            <span className="font-devanagari">
              सप्तमेश: <span className="text-amber-100 font-bold">{seventhLordD1.planetHi}</span> (
              {seventhLordD1.house}वाँ भाव)
            </span>
            <span className="font-devanagari">
              षष्ठ भाव: <span className="text-amber-100 font-bold">{sixthHouseD1.rashiNameHi}</span>
            </span>
            <span className="font-devanagari">
              सक्रिय दशा:{' '}
              <span className="text-amber-100 font-bold">
                {activeDasha?.lordHi}/{activeAntar?.lordHi}
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-1.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium font-devanagari whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* D-1 Tab */}
        {activeTab === 'd1' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <NorthIndianChart
                chart={d1}
                title="D-1 Birth Chart (Rashi)"
                titleHi="D-1 जन्म कुण्डली (राशि)"
                size={400}
                highlightSeventh
                showTransits={showTransits}
                transitPlanets={TRANSIT_PLANETS_2026}
                id="d1-chart"
              />
              <div className="space-y-4">
                <div className="bg-card rounded-xl border p-4 shadow-sm">
                  <h3 className="font-devanagari font-bold text-primary text-base mb-3">
                    ग्रह स्थिति / Planetary Positions
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1 pr-3 font-devanagari text-muted-foreground text-xs">
                            ग्रह
                          </th>
                          <th className="text-left py-1 pr-3 font-devanagari text-muted-foreground text-xs">
                            राशि
                          </th>
                          <th className="text-center py-1 pr-3 font-devanagari text-muted-foreground text-xs">
                            भाव
                          </th>
                          <th className="text-left py-1 font-devanagari text-muted-foreground text-xs">
                            अंश
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-amber-200 bg-amber-50">
                          <td className="py-1 pr-3 font-devanagari font-bold text-amber-800">
                            लग्न
                          </td>
                          <td className="py-1 pr-3 font-devanagari">{RASHIS_HI[d1.lagna - 1]}</td>
                          <td className="py-1 pr-3 text-center font-bold">1</td>
                          <td className="py-1 text-xs font-mono">
                            {formatDegree(d1.lagnaLongitude)}
                          </td>
                        </tr>
                        {d1.planets.map(p => (
                          <tr
                            key={p.name}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-1 pr-3">
                              <span className="font-devanagari">
                                {PLANET_SYMBOLS[p.name]} {p.nameHi}
                              </span>
                              {p.retrograde && (
                                <span className="text-xs text-purple-600 ml-1">(व)</span>
                              )}
                            </td>
                            <td className="py-1 pr-3 font-devanagari">{p.rashiNameHi}</td>
                            <td className="py-1 pr-3 text-center font-mono font-bold">{p.house}</td>
                            <td className="py-1 text-xs font-mono text-muted-foreground">
                              {formatDegree(p.longitude)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-4 shadow-sm">
                  <h3 className="font-devanagari font-bold text-primary text-base mb-3">
                    भाव राशि / House Rashis
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5">
                    {d1.houseRashis.map((rashi, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-2 text-center text-xs border ${
                          i === 0
                            ? 'bg-amber-100 border-amber-400 font-bold'
                            : i === 5
                              ? 'bg-yellow-50 border-yellow-400'
                              : i === 6
                                ? 'bg-pink-50 border-pink-400'
                                : 'bg-muted/40 border-border'
                        }`}
                      >
                        <div className="font-mono text-muted-foreground">{i + 1}</div>
                        <div className="font-devanagari font-medium mt-0.5">
                          {RASHIS_HI[rashi - 1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                  <h3 className="font-devanagari font-bold text-amber-900 text-sm mb-2">
                    षष्ठ भाव विचार (6th House)
                  </h3>
                  <p className="font-devanagari text-sm text-amber-800">
                    <span className="font-bold">{sixthHouseD1.rashiNameHi}</span> राशि (
                    {sixthHouseD1.rashiName}) षष्ठ भाव में। स्वामी:{' '}
                    {RASHI_LORDS_HI[sixthHouseD1.rashi]}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    षष्ठ भाव शत्रु, रोग, ऋण, और सेवा का कारक है।
                  </p>
                </div>
              </div>
            </div>

            {/* 7th Lord Analysis */}
            <div className="bg-pink-50 border border-pink-300 rounded-xl p-4">
              <h3 className="font-devanagari font-bold text-pink-900 text-base mb-2">
                सप्तमेश विचार (7th Lord Analysis)
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm font-devanagari">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">D-1 सप्तम भाव</div>
                  <div className="font-bold text-pink-800">
                    {RASHIS_HI[d1.houseRashis[6] - 1]} ({RASHIS_EN[d1.houseRashis[6] - 1]})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    स्वामी: {seventhLordD1.planetHi}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">
                    सप्तमेश ({seventhLordD1.planetHi}) की स्थिति
                  </div>
                  <div className="font-bold text-pink-800">
                    {seventhLordD1.house}वाँ भाव (
                    {RASHIS_HI[d1.houseRashis[seventhLordD1.house - 1] - 1]})
                  </div>
                  <div className="text-xs text-muted-foreground">D-1 में स्थित</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">सप्तमेश के त्रिकोण</div>
                  <div className="font-bold text-pink-800">
                    भाव {trinesD1.join(', ')} (
                    {trinesD1.map(h => RASHIS_HI[d1.houseRashis[h - 1] - 1]).join(', ')})
                  </div>
                  <div className="text-xs text-muted-foreground">D-1 में त्रिकोण</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">D-9 सप्तम भाव</div>
                  <div className="font-bold text-pink-800">
                    {RASHIS_HI[d9.houseRashis[6] - 1]} ({RASHIS_EN[d9.houseRashis[6] - 1]})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    स्वामी: {seventhLordD9.planetHi}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">D-9 सप्तमेश की स्थिति</div>
                  <div className="font-bold text-pink-800">{seventhLordD9.house}वाँ भाव</div>
                  <div className="text-xs text-muted-foreground">D-9 में स्थित</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">D-9 सप्तमेश के त्रिकोण</div>
                  <div className="font-bold text-pink-800">भाव {trinesD9.join(', ')}</div>
                  <div className="text-xs text-muted-foreground">D-9 में त्रिकोण</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* D-9 Tab */}
        {activeTab === 'd9' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <NorthIndianChart
                chart={d9}
                title="D-9 Navamsa Chart"
                titleHi="D-9 नवांश कुण्डली"
                size={400}
                highlightSeventh
                showTransits={showTransits}
                transitPlanets={TRANSIT_PLANETS_2026}
                id="d9-chart"
              />
              <div className="space-y-4">
                <div className="bg-card rounded-xl border p-4 shadow-sm">
                  <h3 className="font-devanagari font-bold text-primary text-base mb-3">
                    नवांश ग्रह स्थिति
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1 pr-3 font-devanagari text-muted-foreground text-xs">
                          ग्रह
                        </th>
                        <th className="text-left py-1 pr-3 font-devanagari text-muted-foreground text-xs">
                          नवांश राशि
                        </th>
                        <th className="text-center py-1 font-devanagari text-muted-foreground text-xs">
                          भाव
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-amber-200 bg-amber-50">
                        <td className="py-1 pr-3 font-devanagari font-bold text-amber-800">
                          नवांश लग्न
                        </td>
                        <td className="py-1 pr-3 font-devanagari">{RASHIS_HI[d9.lagna - 1]}</td>
                        <td className="py-1 text-center font-bold">1</td>
                      </tr>
                      {d9.planets.map(p => (
                        <tr key={p.name} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-1 pr-3 font-devanagari">
                            {PLANET_SYMBOLS[p.name]} {p.nameHi}
                          </td>
                          <td className="py-1 pr-3 font-devanagari">{p.rashiNameHi}</td>
                          <td className="py-1 text-center font-mono font-bold">{p.house}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-purple-50 border border-purple-300 rounded-xl p-4">
                  <h3 className="font-devanagari font-bold text-purple-900 text-sm mb-2">
                    नवांश महत्व
                  </h3>
                  <div className="space-y-2 text-sm font-devanagari text-purple-800">
                    <p>• नवांश कुण्डली विवाह और जीवनसाथी की स्थिति दर्शाती है</p>
                    <p>
                      • <span className="font-bold">D-9 लग्न: {RASHIS_HI[d9.lagna - 1]}</span> —
                      नवांश की आत्मा
                    </p>
                    <p>
                      •{' '}
                      <span className="font-bold">
                        D-9 सप्तम: {RASHIS_HI[d9.houseRashis[6] - 1]}
                      </span>{' '}
                      — जीवनसाथी का स्वभाव
                    </p>
                    <p>• D-1 और D-9 का तालमेल विवाह की सफलता दर्शाता है</p>
                    <div className="mt-2 p-2 bg-purple-100 rounded-lg">
                      <div className="text-xs font-medium">D-9 षष्ठ भाव</div>
                      <div className="font-bold">
                        {sixthHouseD9.rashiNameHi} ({sixthHouseD9.rashiName})
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border rounded-xl p-4">
                  <h3 className="font-devanagari font-bold text-sm mb-2 text-primary">
                    D-9 सप्तमेश के त्रिकोण
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {trinesD9.map(h => (
                      <div
                        key={h}
                        className="bg-green-50 border border-green-300 rounded-lg p-2 text-center"
                      >
                        <div className="text-xs text-muted-foreground">भाव</div>
                        <div className="font-bold text-green-800">{h}</div>
                        <div className="font-devanagari text-xs">
                          {RASHIS_HI[d9.houseRashis[h - 1] - 1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transits Tab */}
        {activeTab === 'transits' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <NorthIndianChart
                  chart={d1}
                  title="D-1 with Transits (गोचर सहित)"
                  titleHi="D-1 + गोचर (मई २०२६)"
                  size={390}
                  highlightSeventh
                  showTransits
                  transitPlanets={TRANSIT_PLANETS_2026}
                  id="transit-d1-chart"
                />
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-300 rounded-xl p-4">
                  <h3 className="font-devanagari font-bold text-blue-900 text-base mb-3">
                    वर्तमान गोचर — {CURRENT_TRANSITS_2026.dateEn}
                  </h3>

                  {/* Jupiter */}
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-devanagari font-bold text-yellow-800 text-lg">गु</span>
                      <div>
                        <div className="font-devanagari font-bold text-yellow-900">
                          गुरु (Jupiter) — {CURRENT_TRANSITS_2026.Jupiter.rashiHi}
                        </div>
                        <div className="text-xs text-yellow-700">
                          {CURRENT_TRANSITS_2026.Jupiter.degree} •{' '}
                          {CURRENT_TRANSITS_2026.Jupiter.retrograde ? 'वक्री' : 'मार्गी'}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-devanagari text-yellow-800">
                      {CURRENT_TRANSITS_2026.Jupiter.transitDate}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {CURRENT_TRANSITS_2026.Jupiter.notes}
                    </p>
                  </div>

                  {/* Saturn */}
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-devanagari font-bold text-slate-700 text-lg">श</span>
                      <div>
                        <div className="font-devanagari font-bold text-slate-900">
                          शनि (Saturn) — {CURRENT_TRANSITS_2026.Saturn.rashiHi}
                        </div>
                        <div className="text-xs text-slate-600">
                          {CURRENT_TRANSITS_2026.Saturn.degree} •{' '}
                          {CURRENT_TRANSITS_2026.Saturn.retrograde ? 'वक्री' : 'मार्गी'}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-devanagari text-slate-700">
                      {CURRENT_TRANSITS_2026.Saturn.transitDate}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {CURRENT_TRANSITS_2026.Saturn.notes}
                    </p>
                  </div>
                </div>

                {/* Transit dates table */}
                <div className="bg-card border rounded-xl p-4">
                  <h3 className="font-devanagari font-bold text-primary text-sm mb-3">
                    प्रमुख गोचर तिथियाँ
                  </h3>
                  <div className="space-y-2">
                    {CURRENT_TRANSITS_2026.transitDates.map((td, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-2 rounded-lg text-sm ${
                          td.planet === 'गुरु'
                            ? 'bg-yellow-50 border border-yellow-200'
                            : 'bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <span className="font-devanagari font-bold text-xs shrink-0 w-6">
                          {td.planet === 'गुरु' ? 'गु' : 'श'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-devanagari font-medium">{td.event}</div>
                          <div className="text-xs text-muted-foreground">
                            {td.date} • {td.rashi}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Transit effect on Kanchi's chart */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-devanagari font-bold text-primary text-base mb-3">
                काँची की कुण्डली पर गोचर प्रभाव
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm font-devanagari">
                <div className="space-y-2">
                  <div className="font-bold text-yellow-800">गुरु गोचर प्रभाव:</div>
                  <p>• गुरु (मिथुन) लग्न से {((3 - d1.lagna + 12) % 12) + 1}वें भाव में</p>
                  <p>• गुरु कर्क में (जून २०२६) — नई स्थिति</p>
                  <p>• गुरु की दृष्टि ५वें, ७वें, ९वें भाव पर</p>
                  <p className="text-green-700 font-medium">• विवाह योग बलवान होगा</p>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-slate-700">शनि गोचर प्रभाव:</div>
                  <p>• शनि (मीन) लग्न से {((12 - d1.lagna + 12) % 12) + 1}वें भाव में</p>
                  <p>• चन्द्र राशि {moon ? RASHIS_HI[moon.rashi - 1] : '—'} से स्थिति जाँचें</p>
                  <p>
                    • साढ़ेसाती/ढैय्या:{' '}
                    {Math.abs(12 - (moon?.rashi ?? 1)) <= 1 ? '⚠️ सक्रिय' : '✓ नहीं'}
                  </p>
                  <p>• अप्रैल २०२७ — शनि मेष में प्रवेश</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marriage Timing Tab */}
        {activeTab === 'marriage' && (
          <div className="space-y-4">
            {/* Forecast Banner */}
            <div className="bg-gradient-to-r from-pink-900 to-rose-800 text-white rounded-xl p-5">
              <div className="font-devanagari font-bold text-xl mb-2">विवाह काल पूर्वानुमान</div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-pink-200 text-xs font-devanagari mb-1">
                    प्राथमिक विवाह काल
                  </div>
                  <div className="font-devanagari font-bold text-xl">
                    {marriageForecast.primaryWindowHi}
                  </div>
                  <div className="text-pink-200 text-sm">{marriageForecast.primaryWindow}</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-pink-200 text-xs font-devanagari mb-1">द्वितीयक काल</div>
                  <div className="font-devanagari font-bold text-xl">
                    {marriageForecast.secondaryWindowHi}
                  </div>
                  <div className="text-pink-200 text-sm">{marriageForecast.secondaryWindow}</div>
                </div>
              </div>
              <div className="mt-3 bg-white/10 rounded-lg p-3">
                <div className="text-pink-200 text-xs font-devanagari mb-1">आयु अनुमान</div>
                <div className="font-devanagari font-bold">{marriageForecast.agePredictionHi}</div>
              </div>
            </div>

            {/* Key factors */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-devanagari font-bold text-primary text-base mb-3">
                विवाह के मुख्य कारक
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm font-devanagari">
                <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">D-1 सप्तम भाव</div>
                  <div className="font-bold">
                    {RASHIS_HI[d1.houseRashis[6] - 1]} — स्वामी: {seventhLordD1.planetHi}
                  </div>
                  <div className="text-xs">
                    {seventhLordD1.planetHi} {seventhLordD1.house}वें भाव में
                  </div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">D-9 सप्तम भाव</div>
                  <div className="font-bold">
                    {RASHIS_HI[d9.houseRashis[6] - 1]} — स्वामी: {seventhLordD9.planetHi}
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">सक्रिय दशा (मई २०२६)</div>
                  <div className="font-bold">{activeDasha?.lordHi} महादशा</div>
                  <div className="text-xs">
                    {activeDasha?.lordHi}/{activeAntar?.lordHi} अन्तर्दशा
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">गोचरी गुरु</div>
                  <div className="font-bold">मिथुन → कर्क (जून २०२६)</div>
                  <div className="text-xs">सप्तम दृष्टि सक्रिय</div>
                </div>
              </div>
            </div>

            {/* Methods */}
            <h3 className="font-devanagari font-bold text-foreground text-base">
              विवाह काल निर्धारण की पद्धतियाँ
            </h3>
            {marriageResults.map((result, i) => (
              <div key={i} className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <button
                  className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedMethod(expandedMethod === i ? null : i)}
                  data-testid={`method-${i}`}
                >
                  <div className="flex-1">
                    <div className="font-devanagari font-bold text-primary">
                      {result.methodNameHi}
                    </div>
                    <div className="text-sm text-muted-foreground">{result.methodName}</div>
                    <div className="flex gap-2 mt-1.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          result.confidence === 'High'
                            ? 'bg-green-100 text-green-800'
                            : result.confidence === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {result.confidenceHi} विश्वसनीयता
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-devanagari">
                        {result.forecastWindowHi}
                      </span>
                    </div>
                  </div>
                  {expandedMethod === i ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                  )}
                </button>

                {expandedMethod === i && (
                  <div className="px-4 pb-4 border-t border-border bg-muted/20">
                    <p className="font-devanagari text-sm mt-3 text-foreground">
                      {result.descriptionHi}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                    {result.favorablePeriods.length > 0 && (
                      <div className="mt-3">
                        <div className="font-devanagari text-xs font-bold text-muted-foreground mb-2">
                          अनुकूल काल:
                        </div>
                        <div className="space-y-1">
                          {result.favorablePeriods.map((p, j) => (
                            <div
                              key={j}
                              className="font-devanagari text-sm p-2 bg-green-50 border border-green-200 rounded-lg"
                            >
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Reasoning */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-devanagari font-bold text-primary text-sm mb-2">
                विस्तृत विश्लेषण
              </h3>
              <pre className="font-devanagari text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {marriageForecast.reasoningHi}
              </pre>
            </div>
          </div>
        )}

        {/* Spouse Tab */}
        {activeTab === 'spouse' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-teal-900 to-cyan-800 text-white rounded-xl p-5">
              <div className="font-devanagari font-bold text-xl mb-1">जीवनसाथी विचार</div>
              <div className="text-teal-200 text-sm">
                Spouse Analysis — Nature, Direction & Characteristics
              </div>
              <div className="mt-3 grid md:grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-teal-200 text-xs font-devanagari mb-1">ससुराल की दिशा</div>
                  <div className="font-devanagari font-bold text-2xl">
                    {spouseAnalysis.directionHi}
                  </div>
                  <div className="text-teal-200 text-sm">{spouseAnalysis.direction} Direction</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-teal-200 text-xs font-devanagari mb-1">D-9 सप्तम</div>
                  <div className="font-devanagari font-bold text-xl">
                    {RASHIS_HI[d9.houseRashis[6] - 1]}
                  </div>
                  <div className="text-teal-200 text-sm">Navamsa 7th House</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card border rounded-xl p-4">
                <h3 className="font-devanagari font-bold text-primary text-sm mb-3">
                  स्वभाव / Nature
                </h3>
                <div className="space-y-2">
                  {spouseAnalysis.natureHi.map((n, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="font-devanagari text-sm">{n}</span>
                    </div>
                  ))}
                  {spouseAnalysis.nature.map((n, i) => (
                    <div key={i} className="text-xs text-muted-foreground pl-4">
                      {n}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border rounded-xl p-4">
                <h3 className="font-devanagari font-bold text-primary text-sm mb-3">
                  शारीरिक गुण / Physique
                </h3>
                <div className="space-y-2">
                  {spouseAnalysis.physiqueHi.map((p, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="font-devanagari text-sm">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border rounded-xl p-4">
                <h3 className="font-devanagari font-bold text-primary text-sm mb-3">
                  व्यवसाय / Profession
                </h3>
                <div className="space-y-2">
                  {spouseAnalysis.professionHi.map((p, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="font-devanagari text-sm">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                <h3 className="font-devanagari font-bold text-amber-900 text-sm mb-3">
                  ससुराल दिशा विवरण
                </h3>
                <p className="font-devanagari text-sm text-amber-800">
                  {spouseAnalysis.overallDescHi}
                </p>
                <div className="mt-3 p-2 bg-amber-100 rounded-lg text-xs text-amber-700 font-devanagari">
                  आधार: D-1 सप्तमेश ({seventhLordD1.planetHi}) {seventhLordD1.house}वें भाव में।
                  दिशा कारक: {DIRECTIONS[seventhLordD1.house]}।
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-devanagari font-bold text-primary text-sm mb-2">
                सारांश / Summary
              </h3>
              <p className="font-devanagari text-sm text-foreground leading-relaxed">
                {spouseAnalysis.overallDescHi}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{spouseAnalysis.overallDesc}</p>
            </div>
          </div>
        )}

        {/* Dasha Tab */}
        {activeTab === 'dasha' && (
          <div className="space-y-4">
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="bg-amber-800 text-amber-50 px-4 py-3">
                <h3 className="font-devanagari font-bold text-base">
                  विंशोत्तरी दशा — {KANCHI_BIRTH.name}
                </h3>
                <p className="text-amber-200 text-xs mt-0.5">
                  Vimshottari Mahadasha Sequence (120-year cycle)
                </p>
              </div>
              <div className="divide-y divide-border">
                {dashas.map((d, i) => {
                  const isActive = d.start <= today && d.end >= today;
                  const isPast = d.end < today;
                  return (
                    <div
                      key={i}
                      className={`p-4 ${isActive ? 'bg-amber-50 border-l-4 border-l-amber-600' : isPast ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-devanagari font-bold text-lg text-primary">
                              {d.lordHi} महादशा
                            </span>
                            {isActive && (
                              <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-medium">
                                सक्रिय
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateEn(d.start)} — {formatDateEn(d.end)} ({d.years} वर्ष)
                          </div>
                        </div>
                        {isActive && activeAntar && (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground font-devanagari">
                              अन्तर्दशा
                            </div>
                            <div className="font-devanagari font-bold text-amber-700">
                              {activeAntar.lordHi}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateEn(activeAntar.start)} – {formatDateEn(activeAntar.end)}
                            </div>
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <div className="mt-3 grid grid-cols-3 gap-1.5">
                          {d.antarDashas.map((a, j) => {
                            const aActive = a.start <= today && a.end >= today;
                            const aUpcoming =
                              a.start > today && a.start < new Date(today.getFullYear() + 3, 0, 1);
                            return (
                              <div
                                key={j}
                                className={`rounded-lg p-1.5 text-center text-xs border ${
                                  aActive
                                    ? 'bg-amber-100 border-amber-400 font-bold'
                                    : aUpcoming
                                      ? 'bg-green-50 border-green-300'
                                      : a.end < today
                                        ? 'opacity-50 bg-muted/40 border-border'
                                        : 'bg-muted/20 border-border'
                                }`}
                              >
                                <div className="font-devanagari">
                                  {d.lordHi}/{a.lordHi}
                                </div>
                                <div className="text-muted-foreground mt-0.5">
                                  {formatDateEn(a.start).replace(/\d{4}/, y => "'" + y.slice(2))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mangal Dosha Tab */}
        {activeTab === 'mangal' && (
          <div className="space-y-5">
            {/* Verdict Banner */}
            <div
              className={`rounded-xl p-5 text-white ${
                mangalDosha.finalVerdict.startsWith('No')
                  ? 'bg-gradient-to-r from-green-800 to-emerald-700'
                  : mangalDosha.overallLevel === 'Full'
                    ? 'bg-gradient-to-r from-red-900 to-rose-800'
                    : 'bg-gradient-to-r from-orange-800 to-amber-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium opacity-80 mb-1">
                    मंगल दोष निर्णय / Final Verdict
                  </div>
                  <div className="font-devanagari font-bold text-2xl">
                    {mangalDosha.finalVerdictHi}
                  </div>
                  <div className="text-sm opacity-90 mt-0.5">{mangalDosha.finalVerdict}</div>
                </div>
                <div
                  className={`text-4xl font-bold px-4 py-2 rounded-xl ${
                    mangalDosha.finalVerdict.startsWith('No') ? 'bg-white/20' : 'bg-white/20'
                  }`}
                >
                  {mangalDosha.finalVerdict.startsWith('No') ? '✓' : '⚠'}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
                <div className="bg-white/15 rounded-lg p-2 text-center">
                  <div className="opacity-70 text-xs font-devanagari">मंगल राशि</div>
                  <div className="font-devanagari font-bold">
                    {RASHIS_HI[mangalDosha.marsRashi - 1]}
                  </div>
                  <div className="opacity-70 text-xs">{RASHIS_EN[mangalDosha.marsRashi - 1]}</div>
                </div>
                <div className="bg-white/15 rounded-lg p-2 text-center">
                  <div className="opacity-70 text-xs font-devanagari">मंगल भाव</div>
                  <div className="font-bold text-xl">{mangalDosha.marsHouseFromLagna}</div>
                  <div className="opacity-70 text-xs">House from Lagna</div>
                </div>
                <div className="bg-white/15 rounded-lg p-2 text-center">
                  <div className="opacity-70 text-xs font-devanagari">तीव्रता</div>
                  <div className="font-devanagari font-bold text-xl">{mangalDosha.severityHi}</div>
                  <div className="opacity-70 text-xs">{mangalDosha.severity}</div>
                </div>
                <div className="bg-white/15 rounded-lg p-2 text-center">
                  <div className="opacity-70 text-xs font-devanagari">निवारण</div>
                  <div className="font-bold text-xl">
                    {mangalDosha.cancellations.filter(c => c.applies).length}
                  </div>
                  <div className="opacity-70 text-xs">Cancellations</div>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-devanagari font-bold text-primary text-sm mb-2">
                विस्तृत विवरण / Interpretation
              </h3>
              <p className="font-devanagari text-sm leading-relaxed text-foreground">
                {mangalDosha.interpretationHi}
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {mangalDosha.interpretation}
              </p>
            </div>

            {/* Three Reference Checks */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-devanagari font-bold text-primary text-base mb-3">
                तीन संदर्भों से जाँच / Three-Reference Check
              </h3>
              <p className="text-xs text-muted-foreground mb-3 font-devanagari">
                मंगल दोष लग्न, चन्द्र और शुक्र — तीनों से जाँचा जाता है (BPHS अ॰ ७३)
              </p>
              <div className="space-y-3">
                {mangalDosha.checks.map((check, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 ${
                      check.hasDosha ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              check.hasDosha
                                ? 'bg-red-200 text-red-800'
                                : 'bg-green-200 text-green-800'
                            }`}
                          >
                            {check.hasDosha ? '⚠ दोष' : '✓ दोष नहीं'}
                          </span>
                          <span className="font-devanagari font-bold text-sm">
                            {check.referenceHi} से
                          </span>
                          <span className="text-xs text-muted-foreground">({check.reference})</span>
                        </div>
                        <div className="text-sm font-devanagari text-foreground">
                          {check.noteHi}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{check.note}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-muted-foreground font-devanagari">
                          मंगल भाव
                        </div>
                        <div className="font-bold text-lg">{check.marsHouse}</div>
                        <div className="text-xs text-muted-foreground">
                          {RASHIS_HI[check.referenceRashi - 1]} →{' '}
                          {RASHIS_HI[mangalDosha.marsRashi - 1]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation Rules */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-devanagari font-bold text-primary text-base mb-1">
                निवारण नियम / Cancellation Rules
              </h3>
              <p className="text-xs text-muted-foreground mb-3 font-devanagari">
                BPHS अ॰ ७३, पालदीपिका अ॰ १६, सारावली अ॰ ४१ के आधार पर
              </p>
              <div className="space-y-2">
                {mangalDosha.cancellations.map((c, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 ${
                      c.applies ? 'bg-green-50 border-green-300' : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 text-base shrink-0 ${c.applies ? 'text-green-600' : 'text-muted-foreground'}`}
                      >
                        {c.applies ? '✓' : '○'}
                      </span>
                      <div className="flex-1">
                        <div
                          className={`font-devanagari text-sm font-medium ${c.applies ? 'text-green-800' : 'text-foreground'}`}
                        >
                          {c.ruleHi}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{c.rule}</div>
                        <div className="text-xs text-foreground/70 mt-1">{c.detailsHi}</div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                          c.applies
                            ? 'bg-green-200 text-green-800 font-bold'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {c.applies ? 'लागू' : 'नहीं'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remedies — only shown if dosha present */}
            {mangalDosha.remediesHi.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                <h3 className="font-devanagari font-bold text-amber-900 text-base mb-3">
                  उपाय / Remedies
                </h3>
                <div className="space-y-2">
                  {mangalDosha.remediesHi.map((r, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-amber-700 font-bold shrink-0">{i + 1}.</span>
                      <div>
                        <div className="font-devanagari text-sm text-amber-800">{r}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {mangalDosha.remedies[i]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Classical source note */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 text-xs text-muted-foreground">
              <div className="font-bold font-devanagari text-foreground mb-1">
                शास्त्रीय आधार / Classical Sources
              </div>
              <p>
                Mangal Dosha rules from:{' '}
                <span className="font-medium">Brihat Parashara Hora Shastra Ch. 73</span> (primary),{' '}
                <span className="font-medium">Phaladeepika Ch. 16</span>,{' '}
                <span className="font-medium">Saravali Ch. 41</span>. Cancellation rules follow the
                widely accepted Parashara tradition. Full derivation in{' '}
                <code>docs/calculations-reference.md §10</code>.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center">
        <div className="font-devanagari text-muted-foreground text-sm">
          ॥ ज्योतिष ज्ञान — शिक्षा हेतु ॥
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Vedic Astrology Charts — For Educational Purposes Only
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Lahiri Ayanamsa • North Indian Style • Generated May 2026
        </div>
      </footer>
    </div>
  );
}
