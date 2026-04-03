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

const DashaCard = lazy(() => import('@/components/DashaCard'));
const YogaCard = lazy(() => import('@/components/YogaCard'));
const DarkModeToggle = lazy(() => import('@/components/DarkModeToggle'));

const Loader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const parseCoords = (location: string): { lat: number; lon: number } => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) {
    const lat = parseFloat(m[1]), lon = parseFloat(m[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  }
  return { lat: 23.0, lon: 72.0 };
};

const DashaPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);

  const { data: chart, isCalculating } = useChartCalculation(birthInput);

  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setRawBirth(data);
    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });
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
                <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'विंशोत्तरी दशा' : 'Vimshottari Dasha'}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'वैदिक भविष्यवाणी प्रणाली • योग विश्लेषण' : 'Vedic Predictive System • Yoga Analysis'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className={`text-sm text-primary underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'होम' : 'Home'}
              </Link>
              <Suspense fallback={null}>
                <DarkModeToggle showLabel={false} language={hiLang} />
              </Suspense>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
              <p className={`text-center text-sm text-muted-foreground mb-4 ${isHi ? 'font-hindi' : ''}`}>
                {isHi
                  ? 'अपना जन्म विवरण दर्ज करें और अपनी दशा व योग जानें'
                  : 'Enter your birth details to calculate your Dasha periods and Yogas'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{rawBirth.date}</span>
                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{rawBirth.time}</span>
                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{rawBirth.location}</span>
                </div>
                <button
                  onClick={() => { setRawBirth(null); setBirthInput(null); }}
                  className={`text-sm text-primary underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}
                >
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>

              {isCalculating && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  {isHi ? <span className="font-hindi">गणना हो रही है…</span> : 'Calculating…'}
                </div>
              )}

              <Suspense fallback={<Loader />}>
                <DashaCard birthDate={rawBirth.date} birthTime={rawBirth.time} lang={hiLang} />
              </Suspense>

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
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default DashaPage;
