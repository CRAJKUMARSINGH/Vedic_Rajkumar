/**
 * Standalone Dasha Page
 * Uses useChartCalculation hook for unified reactive data
 */

import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { SEO } from '@/components/SEO';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import type { ReferenceType } from '@/services/dashaForecastService';
import { Users } from 'lucide-react';

const DashaCard = lazy(() => import('@/components/DashaCard'));
const YogaCard = lazy(() => import('@/components/YogaCard'));
const DarkModeToggle = lazy(() => import('@/components/DarkModeToggle'));
const VimshottariDashaDashboard = lazy(() => import('@/components/VimshottariDashaDashboard'));
const DashaAIInsights = lazy(() => import('@/components/DashaAIInsights'));
const DashaForecastPanel = lazy(() => import('@/components/DashaForecastPanel'));

const Loader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const parseCoords = (location: string): { lat: number; lon: number } => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) {
    const lat = parseFloat(m[1]),
      lon = parseFloat(m[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  }
  return { lat: 23.0, lon: 72.0 };
};

const DashaPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(
    null
  );
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [referenceType, setReferenceType] = useState<ReferenceType | null>(null);

  const { data: chart, isCalculating } = useChartCalculation(birthInput);

  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setReferenceType('natal');
    setRawBirth(data);
    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });
  };

  const handleQuestionTime = () => {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setReferenceType('prashna');
    setRawBirth({ date, time, location: 'Question-time chart, default location (23.0, 72.0)' });
    setBirthInput({ date, time, lat: 23.0, lon: 72.0 });
  };

  const planets = chart.planetaryPositions?.planets ?? null;

  return (
    <>
      <SEO
        title="Vimshottari Dasha - Planetary Period Calculator"
        description="Calculate your Vimshottari Dasha periods with sub-periods (Antardasha). Get detailed predictions for each planetary period based on your birth chart."
        keywords="vimshottari dasha, dasha calculator, antardasha, planetary periods, mahadasha, vedic astrology"
        canonical="/dasha"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🪐</span>
              <div>
                <h1
                  className={`text-xl font-heading font-bold text-secondary ${isHi ? 'font-hindi' : ''}`}
                >
                  {isHi ? 'विंशोत्तरी दशा' : 'Vimshottari Dasha'}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi
                    ? 'वैदिक भविष्यवाणी प्रणाली • योग विश्लेषण'
                    : 'Vedic Predictive System • Yoga Analysis'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className={`text-sm text-primary underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}
              >
                {isHi ? 'होम' : 'Home'}
              </Link>
              <Suspense fallback={null}>
                <DarkModeToggle showLabel={false} language={hiLang} />
              </Suspense>
              <EnhancedLanguageToggle
                currentLang={lang}
                onChange={setLang}
                showRegion={false}
                autoDetect={false}
              />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {!referenceType && (
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  {isHi ? 'विश्लेषण का आधार चुनें' : 'Choose the analysis basis'}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isHi
                    ? 'दशा उत्तर जन्म कुंडली से चाहिए या प्रश्न पूछने के समय की कुंडली से?'
                    : 'Should the dasha answer use birth data, or the exact question-time chart?'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto justify-start rounded-lg p-4 text-left"
                  onClick={() => setReferenceType('natal')}
                >
                  <span>
                    <span className="block font-semibold">
                      {isHi ? 'जन्म डेटा आधारित' : 'Birth data based'}
                    </span>
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {isHi
                        ? 'जातक की जन्म कुंडली, जन्म चंद्र और जीवन-धारा।'
                        : 'Jatak-wise natal promise, birth Moon dasha, and life-pattern reading.'}
                    </span>
                  </span>
                </Button>
                <Button
                  type="button"
                  className="h-auto justify-start rounded-lg p-4 text-left"
                  onClick={handleQuestionTime}
                >
                  <span>
                    <span className="block font-semibold">
                      {isHi ? 'प्रश्न समय आधारित' : 'Question-time based'}
                    </span>
                    <span className="mt-1 block text-xs font-normal opacity-85">
                      {isHi
                        ? 'अभी के समय की प्रश्न कुंडली; केवल इस प्रश्न के लिए।'
                        : 'Prashna chart for this question only; no natal-life assumption.'}
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          )}

          {!rawBirth ? (
            <div
              className={`max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm ${referenceType === 'natal' ? '' : 'hidden'}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi
                    ? 'अपना जन्म विवरण दर्ज करें और अपनी दशा व योग जानें'
                    : 'Enter your birth details to calculate your Dasha periods and Yogas'}
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleSubmit({ date: '2011-09-18', time: '06:58', location: 'Vidisha, Madhya Pradesh (23.5251, 77.8081)' })}
                  className="mt-4 sm:mt-0"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Quick Load: Veerpratap
                </Button>
              </div>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <Tabs defaultValue="chart" className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="chart" className={isHi ? 'font-hindi' : ''}>
                    {isHi ? 'आपकी कुंडली' : 'Your chart'}
                  </TabsTrigger>
                  <TabsTrigger value="extended" className={isHi ? 'font-hindi' : ''}>
                    {isHi ? 'विस्तृत डैशबोर्ड' : 'Extended dashboard'}
                  </TabsTrigger>
                </TabsList>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                      {rawBirth.date}
                    </span>
                    <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                      {rawBirth.time}
                    </span>
                    <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                      {rawBirth.location}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRawBirth(null);
                      setBirthInput(null);
                      setReferenceType(null);
                    }}
                    className={`text-sm text-primary underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}
                  >
                    {isHi ? 'बदलें' : 'Change'}
                  </button>
                </div>
              </div>

              <TabsContent value="chart" className="space-y-4 mt-0">
                {isCalculating && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    {isHi ? <span className="font-hindi">गणना हो रही है…</span> : 'Calculating…'}
                  </div>
                )}

                <Suspense fallback={<Loader />}>
                  <DashaAIInsights
                    currentMahadasha="Jupiter"
                    currentAntardasha="Saturn"
                    lang={hiLang}
                  />
                </Suspense>

                <Suspense fallback={<Loader />}>
                  <DashaCard birthDate={rawBirth.date} birthTime={rawBirth.time} lang={hiLang} />
                </Suspense>

                {referenceType && (
                  <Suspense fallback={<Loader />}>
                    <DashaForecastPanel chart={chart} referenceType={referenceType} />
                  </Suspense>
                )}

                {planets && (
                  <Suspense fallback={<Loader />}>
                    <YogaCard
                      planets={planets.map(p => ({
                        name: p.name,
                        rashiIndex: p.rashiIndex,
                        house: p.house,
                        degrees: p.degrees,
                        isRetrograde: p.retrograde ?? false,
                      }))}
                      ascendantRashi={chart.ascendant?.ascendant.rashiIndex ?? 0}
                      lang={hiLang}
                    />
                  </Suspense>
                )}
              </TabsContent>

              <TabsContent value="extended" className="mt-0">
                <p className="text-xs text-muted-foreground mb-4">
                  {isHi
                    ? 'डेमो डेटा पर आधारित विस्तृत विंशोत्तरी दृश्य (सेवा से जोड़ा जा सकता है)।'
                    : 'Detailed Vimshottari-style view using demo data (can be wired to your chart service).'}
                </p>
                <Suspense fallback={<Loader />}>
                  <VimshottariDashaDashboard />
                </Suspense>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </>
  );
};

export default DashaPage;
