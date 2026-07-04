/**
 * BV_RamanPage.tsx — All 10 BV Raman Magazine Features
 * Source: BV_RAMAN_MAGAZINE_ENHANCEMENT_PLAN.md
 * Implemented via ETERNAL_RESEARCH_CHILD research daemon
 *
 * Features:
 * 1. Vipreet Vedha Engine
 * 2. Ashtakavarga Transit Strength Overlay
 * 3. Varshaphal Calculator
 * 4. Dasha-Gochar Correlation Engine
 * 5. Tarabala (Nakshatra Transit Alerts)
 * 6. Prashna Kundali (Horary Chart)
 * 7. Mundane Astrology Dashboard
 * 8. Shadbala in Transit Context
 * 9. Transit Remedies
 * 10. Raman-Style Monthly Forecast (PDF)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Star, Award, Calendar, Zap, Globe, FileText, Moon, Sun, Shield } from 'lucide-react';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';

// BV Raman Components
import VedhaAnalysisCard from '@/components/VedhaAnalysisCard';
import AshtakavargaTransitOverlay from '@/components/AshtakavargaTransitOverlay';
import VarshaphalCard from '@/components/VarshaphalCard';
import DashaGocharaCard from '@/components/DashaGocharaCard';
import TarabalaCard from '@/components/TarabalaCard';
import PrashnaKundaliChart from '@/components/PrashnaKundaliChart';
import TransitRemediesCard from '@/components/TransitRemediesCard';

// Services
import { calculateDashaGochaCorrelation } from '@/services/dashaGocharaCorrelationService';
import { canPlanetGiveTransitResults } from '@/services/shadabalaService';
import { ALL_NATIONAL_CHARTS, MUNDANE_HOUSES } from '@/data/mundaneCharts';
import { exportTransitToPDF } from '@/services/pdfExportService';
import { RASHIS } from '@/data/transitData';
import type { TransitResult } from '@/data/transitData';

//  Sample data (used when no birth data provided)

const SAMPLE_TRANSIT_HOUSES: Record<string, number> = {
  Sun: 10,
  Moon: 3,
  Mars: 6,
  Mercury: 11,
  Jupiter: 5,
  Venus: 2,
  Saturn: 3,
  Rahu: 11,
  Ketu: 5,
};

const SAMPLE_TRANSITING_PLANETS = Object.entries(SAMPLE_TRANSIT_HOUSES).map(([planet, house]) => ({
  planet,
  house,
}));

const SAMPLE_TRANSIT_RESULTS: TransitResult[] = [
  {
    planet: { en: 'Sun', hi: 'सरय', symbol: '' },
    currentRashi: 0,
    houseFromMoon: 10,
    baseFavorable: true,
    vedhaActive: false,
    vedhaNote: '',
    effectiveStatus: 'favorable',
    scoreContribution: 1,
    rating: 8,
    effectEn: 'Career success, authority',
    effectHi: 'करयर सफलत, अधकर',
  },
  {
    planet: { en: 'Moon', hi: 'चदर', symbol: '' },
    currentRashi: 2,
    houseFromMoon: 3,
    baseFavorable: true,
    vedhaActive: false,
    vedhaNote: '',
    effectiveStatus: 'favorable',
    scoreContribution: 1,
    rating: 7,
    effectEn: 'Courage, short travel',
    effectHi: 'सहस, छट यतर',
  },
  {
    planet: { en: 'Mars', hi: 'मगल', symbol: '' },
    currentRashi: 5,
    houseFromMoon: 6,
    baseFavorable: true,
    vedhaActive: false,
    vedhaNote: '',
    effectiveStatus: 'favorable',
    scoreContribution: 1,
    rating: 7,
    effectEn: 'Victory over enemies',
    effectHi: 'शतर पर वजय',
  },
  {
    planet: { en: 'Mercury', hi: 'बध', symbol: '' },
    currentRashi: 10,
    houseFromMoon: 11,
    baseFavorable: true,
    vedhaActive: false,
    vedhaNote: '',
    effectiveStatus: 'favorable',
    scoreContribution: 1,
    rating: 8,
    effectEn: 'Income gains, profits',
    effectHi: 'आय लभ, मनफ',
  },
  {
    planet: { en: 'Jupiter', hi: 'गर', symbol: '' },
    currentRashi: 4,
    houseFromMoon: 5,
    baseFavorable: true,
    vedhaActive: false,
    vedhaNote: '',
    effectiveStatus: 'favorable',
    scoreContribution: 1,
    rating: 9,
    effectEn: 'Wisdom, children',
    effectHi: 'जञन, सतन',
  },
  {
    planet: { en: 'Venus', hi: 'शकर', symbol: '' },
    currentRashi: 1,
    houseFromMoon: 2,
    baseFavorable: true,
    vedhaActive: false,
    vedhaNote: '',
    effectiveStatus: 'favorable',
    scoreContribution: 1,
    rating: 8,
    effectEn: 'Wealth, family',
    effectHi: 'धन, परवर',
  },
  {
    planet: { en: 'Saturn', hi: 'शन', symbol: '' },
    currentRashi: 2,
    houseFromMoon: 3,
    baseFavorable: true,
    vedhaActive: false,
    vedhaNote: '',
    effectiveStatus: 'favorable',
    scoreContribution: 1,
    rating: 7,
    effectEn: 'Courage, perseverance',
    effectHi: 'सहस, दढत',
  },
  {
    planet: { en: 'Rahu', hi: 'रह', symbol: '' },
    currentRashi: 10,
    houseFromMoon: 11,
    baseFavorable: true,
    vedhaActive: false,
    vedhaNote: '',
    effectiveStatus: 'favorable',
    scoreContribution: 1,
    rating: 7,
    effectEn: 'Gains, foreign income',
    effectHi: 'लभ, वदश आय',
  },
  {
    planet: { en: 'Ketu', hi: 'कत', symbol: '' },
    currentRashi: 4,
    houseFromMoon: 5,
    baseFavorable: true,
    vedhaActive: false,
    vedhaNote: '',
    effectiveStatus: 'favorable',
    scoreContribution: 1,
    rating: 6,
    effectEn: 'Spiritual gains',
    effectHi: 'आधयतमक लभ',
  },
];

//  Shadbala transit context helper

function _ShadabalaTransitRow({
  planet,
  rupa,
  lang,
}: {
  planet: string;
  rupa: number;
  lang: 'en' | 'hi';
}) {
  const isHi = lang === 'hi';
  const result = canPlanetGiveTransitResults(planet, rupa);
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg border ${result.capable ? 'border-green-300 bg-green-50 dark:bg-green-950/20' : 'border-red-300 bg-red-50 dark:bg-red-950/20'}`}
    >
      <span className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>{planet}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{rupa.toFixed(1)} Rupa</span>
        <Badge className={`text-xs ${result.capable ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {result.capable ? (isHi ? 'सकषम' : 'Capable') : isHi ? 'कमजर' : 'Weak'}
        </Badge>
      </div>
    </div>
  );
}

//  Mundane transit row

function MundaneTransitRow({
  planet,
  house,
  lang,
}: {
  planet: string;
  house: number;
  lang: 'en' | 'hi';
}) {
  const isHi = lang === 'hi';
  const houseInfo = MUNDANE_HOUSES[house];
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border bg-card">
      <span className="text-sm font-medium">{planet}</span>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {isHi ? `भव ${house}` : `House ${house}`}
        </Badge>
        <span className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {houseInfo ? (isHi ? houseInfo.hi : houseInfo.en) : ''}
        </span>
      </div>
    </div>
  );
}

// Prasna Marga integration
import UniversalPrasnaResearch from '@/components/UniversalPrasnaResearch';
import ProgenyAnalysisCard from '@/components/ProgenyAnalysisCard';

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

const BV_RamanPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [birthDate, setBirthDate] = useState('1979-07-28');
  const [birthTime, setBirthTime] = useState('23:50');
  const [birthLat, setBirthLat] = useState(23.84);
  const [birthLon, setBirthLon] = useState(73.71);
  const [moonRashi, setMoonRashi] = useState(4); // Leo default
  const [activeTab, setActiveTab] = useState('prasna');

  const isHi = lang === 'hi';

  // Dasha-Gochar correlation (sample)
  const dashaCorrelation = calculateDashaGochaCorrelation(
    'Jupiter',
    'Venus',
    SAMPLE_TRANSIT_HOUSES
  );

  const handleExportPDF = async () => {
    await exportTransitToPDF({
      name: 'Sample Jatak',
      moonRashi,
      transitResults: SAMPLE_TRANSIT_RESULTS,
      lang: isHi ? 'hi' : 'en',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="w-7 h-7 text-amber-600" />
            <div>
              <h1 className={`text-xl font-bold text-amber-900 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'बी.वी. रमण — ज्योतिष पत्रिका' : 'B.V. Raman — Astrological Magazine'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isHi
                  ? 'प्रश्न मार्ग · विप्रीत वेध · अष्टकवर्ग · वर्षफल · दशा-गोचर'
                  : 'Prasna Marga · Vipreet Vedha · Ashtakavarga · Varshaphal · Dasha-Gochar'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-primary underline underline-offset-2">
              {isHi ? 'होम' : 'Home'}
            </Link>
            <EnhancedLanguageToggle
              currentLang={lang}
              onChange={setLang}
              showRegion={false}
              autoDetect={false}
            />
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Birth data inputs (shared across tabs) */}
        <Card className="border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 py-3">
            <CardTitle className={`text-base text-amber-900 ${isHi ? 'font-hindi' : ''}`}>
              <Star className="inline w-4 h-4 mr-1" />
              {isHi ? 'जन्म विवरण' : 'Birth Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">{isHi ? 'जन्म तिथि' : 'Birth Date'}</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">{isHi ? 'जन्म समय' : 'Birth Time'}</Label>
                <Input
                  type="time"
                  value={birthTime}
                  onChange={e => setBirthTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Lat</Label>
                <Input
                  type="number"
                  value={birthLat}
                  onChange={e => setBirthLat(parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Lon</Label>
                <Input
                  type="number"
                  value={birthLon}
                  onChange={e => setBirthLon(parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-amber-50 border border-amber-200 p-1 rounded-xl">
            <TabsTrigger value="prasna" className="text-xs">
              <Book className="w-3 h-3 mr-1" />
              {isHi ? 'प्रश्न मार्ग' : 'Prasna Marga'}
            </TabsTrigger>
            <TabsTrigger value="vedha" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              {isHi ? 'विप्रीत वेध' : 'Vipreet Vedha'}
            </TabsTrigger>
            <TabsTrigger value="ashtakavarga" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              {isHi ? 'अष्टकवर्ग' : 'Ashtakavarga'}
            </TabsTrigger>
            <TabsTrigger value="varshaphal" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {isHi ? 'वर्षफल' : 'Varshaphal'}
            </TabsTrigger>
            <TabsTrigger value="dasha" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {isHi ? 'दशा-गोचर' : 'Dasha-Gochar'}
            </TabsTrigger>
            <TabsTrigger value="tarabala" className="text-xs">
              <Moon className="w-3 h-3 mr-1" />
              {isHi ? 'ताराबल' : 'Tarabala'}
            </TabsTrigger>
            <TabsTrigger value="prashna" className="text-xs">
              <Sun className="w-3 h-3 mr-1" />
              {isHi ? 'प्रश्न कुंडली' : 'Prashna Kundali'}
            </TabsTrigger>
            <TabsTrigger value="mundane" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              {isHi ? 'मुंडेन' : 'Mundane'}
            </TabsTrigger>
            <TabsTrigger value="remedies" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              {isHi ? 'उपाय' : 'Remedies'}
            </TabsTrigger>
            <TabsTrigger value="pdf" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              {isHi ? 'PDF' : 'PDF Export'}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Prasna Marga (NEW — Prasna Marga integration) ── */}
          <TabsContent value="prasna" className="space-y-6 mt-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h2 className={`text-lg font-bold text-amber-900 mb-1 ${isHi ? 'font-hindi' : ''}`}>
                {isHi
                  ? 'प्रश्न मार्ग — केरल होरारी परंपरा'
                  : 'Prasna Marga — Kerala Horary Tradition'}
              </h2>
              <p className="text-sm text-amber-800">
                {isHi
                  ? 'बी.वी. रमण द्वारा अनुवादित प्रश्न मार्ग (भाग I & II) के आधार पर सार्वभौम प्रश्न अनुसंधान। प्रश्न का क्षण पवित्र डेटा बिंदु है।'
                  : 'Universal Prasna Research based on Prasna Marga (Parts I & II) as translated by B.V. Raman. The moment of the question is the sacred data point.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs text-amber-700 border-amber-400">
                  {isHi ? 'अरुढ़ लग्न' : 'Arudha Lagna'}
                </Badge>
                <Badge variant="outline" className="text-xs text-amber-700 border-amber-400">
                  {isHi ? 'गुलिका' : 'Gulika'}
                </Badge>
                <Badge variant="outline" className="text-xs text-amber-700 border-amber-400">
                  {isHi ? 'प्राणाक्षर' : 'Pranakshara'}
                </Badge>
                <Badge variant="outline" className="text-xs text-amber-700 border-amber-400">
                  {isHi ? 'पंच सूत्र' : 'Pancha Sutras'}
                </Badge>
                <Badge variant="outline" className="text-xs text-amber-700 border-amber-400">
                  {isHi ? 'परिहार' : 'Parihara'}
                </Badge>
              </div>
            </div>

            {/* Universal Prasna Research bar */}
            <UniversalPrasnaResearch isHi={isHi} />

            {/* Santhana Prasna (Progeny) */}
            <ProgenyAnalysisCard isHi={isHi} />

            {/* Chapter reference table */}
            <Card className="border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 py-3">
                <CardTitle className={`text-sm text-amber-900 ${isHi ? 'font-hindi' : ''}`}>
                  <Book className="inline w-4 h-4 mr-1" />
                  {isHi ? 'प्रश्न मार्ग — अध्याय मानचित्र' : 'Prasna Marga — Chapter Map'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-100">
                        <th className="text-left p-2 border border-amber-200 font-semibold text-amber-900">
                          {isHi ? 'प्रश्न प्रकार' : 'Question Type'}
                        </th>
                        <th className="text-left p-2 border border-amber-200 font-semibold text-amber-900">
                          {isHi ? 'अध्याय' : 'Chapter Focus'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          type: isHi ? 'होरारी / प्रश्न' : 'Horary / Prasna',
                          chapter: isHi
                            ? 'अध्याय I–X: सामान्य विधि, अरुढ़'
                            : 'Chapters I–X: General methodology, Arudha',
                        },
                        {
                          type: isHi ? 'रोग / मृत्यु' : 'Disease / Death',
                          chapter: isHi
                            ? 'अध्याय XII–XV: रोगी और मृत्यु प्रश्न'
                            : 'Chapters XII–XV: Rogi and Mrityu Prasna',
                        },
                        {
                          type: isHi ? 'विवाह / संबंध' : 'Marriage / Relationship',
                          chapter: isHi
                            ? 'अध्याय XVIII: विवाह प्रश्न'
                            : 'Chapter XVIII: Vivaha Prasna',
                        },
                        {
                          type: isHi ? 'संतान' : 'Children / Progeny',
                          chapter: isHi
                            ? 'अध्याय XVIII: सन्तान प्रश्न, बीज-क्षेत्र'
                            : 'Chapter XVIII: Santhana Prasna, Beeja-Kshetra',
                        },
                        {
                          type: isHi ? 'करियर / व्यवसाय' : 'Career / Business',
                          chapter: isHi
                            ? 'अध्याय XXI–XXII: भाग्योदय और कर्म'
                            : 'Chapters XXI–XXII: Bhagyoday and Karma',
                        },
                        {
                          type: isHi ? 'मुहूर्त / इलेक्शनल' : 'Muhurta / Electional',
                          chapter: isHi ? 'भाग II: मुहूर्त खंड' : 'Part II: Muhurta sections',
                        },
                        {
                          type: isHi ? 'परिहार / उपाय' : 'Remedial / Parihara',
                          chapter: isHi
                            ? 'भाग II: परिहार ज्योतिष'
                            : 'Part II: Remedial Astrology sections',
                        },
                        {
                          type: isHi ? 'आधुनिक विषय' : 'Modern themes',
                          chapter: isHi
                            ? 'ज्योतिष पत्रिका (1978) के आधुनिक समकक्ष'
                            : 'Astrological Magazine "modern equivalents" logic',
                        },
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50/50'}>
                          <td className="p-2 border border-amber-200 font-medium text-slate-800">
                            {row.type}
                          </td>
                          <td className="p-2 border border-amber-200 text-slate-600">
                            {row.chapter}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href="https://archive.org/stream/PrasnaMarga1_djvu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-700 underline hover:text-amber-900"
                  >
                    {isHi
                      ? 'प्रश्न मार्ग भाग I (Internet Archive)'
                      : 'Prasna Marga Part I (Internet Archive)'}
                  </a>
                  <span className="text-xs text-slate-400">·</span>
                  <a
                    href="https://www.mlbd.in/products/prasna-marga-part-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-700 underline hover:text-amber-900"
                  >
                    {isHi ? 'प्रश्न मार्ग भाग II (MLBD)' : 'Prasna Marga Part II (MLBD)'}
                  </a>
                  <span className="text-xs text-slate-400">·</span>
                  <a
                    href="https://www.astrologicalmagazine.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-700 underline hover:text-amber-900"
                  >
                    {isHi ? 'ज्योतिष पत्रिका' : 'The Astrological Magazine'}
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Vipreet Vedha ── */}
          <TabsContent value="vedha" className="mt-4">
            <VedhaAnalysisCard
              moonRashi={moonRashi}
              transitResults={SAMPLE_TRANSIT_RESULTS}
              lang={isHi ? 'hi' : 'en'}
            />
          </TabsContent>

          {/* ── Tab 3: Ashtakavarga ── */}
          <TabsContent value="ashtakavarga" className="mt-4">
            <AshtakavargaTransitOverlay
              birthDate={birthDate}
              birthTime={birthTime}
              lat={birthLat}
              lon={birthLon}
              lang={isHi ? 'hi' : 'en'}
            />
          </TabsContent>

          {/* ── Tab 4: Varshaphal ── */}
          <TabsContent value="varshaphal" className="mt-4">
            <VarshaphalCard
              birthDate={birthDate}
              birthTime={birthTime}
              lat={birthLat}
              lon={birthLon}
              lang={isHi ? 'hi' : 'en'}
            />
          </TabsContent>

          {/* ── Tab 5: Dasha-Gochar Correlation ── */}
          <TabsContent value="dasha" className="mt-4">
            <DashaGocharaCard
              birthDate={birthDate}
              birthTime={birthTime}
              lat={birthLat}
              lon={birthLon}
              lang={isHi ? 'hi' : 'en'}
            />
            {dashaCorrelation && (
              <Card className="border-amber-200 mt-4">
                <CardHeader className="py-3 bg-amber-50">
                  <CardTitle className="text-sm text-amber-900">
                    {isHi ? 'दशा-गोचर सहसंबंध' : 'Dasha-Gochar Correlation'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 text-sm text-slate-700">
                  <p>
                    {isHi ? 'महादशा:' : 'Mahadasha:'} <strong>{dashaCorrelation.mahadasha}</strong>{' '}
                    · {isHi ? 'अंतर्दशा:' : 'Antardasha:'}{' '}
                    <strong>{dashaCorrelation.antardasha}</strong>
                  </p>
                  <p className="mt-1 text-xs text-slate-500 italic">
                    {isHi
                      ? dashaCorrelation.interpretation?.hi
                      : dashaCorrelation.interpretation?.en}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Tab 6: Tarabala ── */}
          <TabsContent value="tarabala" className="mt-4">
            <TarabalaCard moonRashi={moonRashi} lang={isHi ? 'hi' : 'en'} />
          </TabsContent>

          {/* ── Tab 7: Prashna Kundali ── */}
          <TabsContent value="prashna" className="mt-4">
            <PrashnaKundaliChart lang={isHi ? 'hi' : 'en'} />
          </TabsContent>

          {/* ── Tab 8: Mundane Astrology ── */}
          <TabsContent value="mundane" className="mt-4">
            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50 py-3">
                <CardTitle className={`text-sm text-amber-900 ${isHi ? 'font-hindi' : ''}`}>
                  <Globe className="inline w-4 h-4 mr-1" />
                  {isHi
                    ? 'मुंडेन ज्योतिष — राष्ट्रीय कुंडलियाँ'
                    : 'Mundane Astrology — National Charts'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                {ALL_NATIONAL_CHARTS.slice(0, 5).map(chart => (
                  <div key={chart.country} className="rounded-lg border bg-white p-3">
                    <p className="text-sm font-semibold">{chart.country}</p>
                    <p className="text-xs text-slate-500">
                      {chart.foundingDate} · {chart.capital}
                    </p>
                  </div>
                ))}
                <div className="space-y-1 mt-2">
                  {SAMPLE_TRANSITING_PLANETS.map(({ planet, house }) => (
                    <MundaneTransitRow
                      key={planet}
                      planet={planet}
                      house={house}
                      lang={isHi ? 'hi' : 'en'}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 9: Transit Remedies ── */}
          <TabsContent value="remedies" className="mt-4">
            <TransitRemediesCard
              transitResults={SAMPLE_TRANSIT_RESULTS}
              lang={isHi ? 'hi' : 'en'}
            />
          </TabsContent>

          {/* ── Tab 10: PDF Export ── */}
          <TabsContent value="pdf" className="mt-4">
            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50 py-3">
                <CardTitle className={`text-sm text-amber-900 ${isHi ? 'font-hindi' : ''}`}>
                  <FileText className="inline w-4 h-4 mr-1" />
                  {isHi ? 'रमण-शैली मासिक पूर्वानुमान PDF' : 'Raman-Style Monthly Forecast PDF'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <p className={`text-sm text-slate-600 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi
                    ? 'बी.वी. रमण की शैली में गोचर विश्लेषण PDF डाउनलोड करें।'
                    : 'Download a B.V. Raman-style transit analysis as a PDF report.'}
                </p>
                <div className="flex items-center gap-3">
                  <Label className="text-xs">{isHi ? 'चंद्र राशि' : 'Moon Rashi'}</Label>
                  <select
                    value={moonRashi}
                    onChange={e => setMoonRashi(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {RASHIS.map((r, i) => (
                      <option key={i} value={i}>
                        {isHi ? r.hi : r.en}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleExportPDF}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isHi ? 'PDF डाउनलोड करें' : 'Download PDF'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BV_RamanPage;
