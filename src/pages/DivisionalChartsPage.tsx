/**
 * Divisional Charts Page — Week 31
 * Standalone page for full Shodashvarga (16 D-charts) analysis
 */
import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO } from '@/components/SEO';

const DivisionalChartsCard = lazy(() => import('@/components/DivisionalChartsCard'));
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

const DivisionalChartsPage = () => {
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

  // Build planet longitudes map from chart data
  const planetLongitudes: Record<string, number> | null =
    chart.planetaryPositions?.planets
      ? Object.fromEntries(
          chart.planetaryPositions.planets.map(p => [p.name, p.rashiIndex * 30 + p.degrees])
        )
      : null;

  const ascendantLongitude = chart.ascendant
    ? chart.ascendant.ascendant.rashiIndex * 30 + chart.ascendant.ascendant.degrees
    : null;

  return (
    <>
      <SEO
        title="Divisional Charts - Shodashvarga D1 to D60"
        description="Get complete Shodashvarga analysis with all 16 divisional charts (D1 to D60). Navamsha, Dashamsha, Drekkana, Chaturthamsha and more with Vimshopaka Bala."
        keywords="divisional charts, shodashvarga, navamsha, dashamsha, drekkana, varga charts, D9, D10, vedic astrology"
        canonical="/divisional-charts"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔢</span>
              <div>
                <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'षोडशवर्ग (विभागीय चार्ट)' : 'Shodashvarga (Divisional Charts)'}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'D1 से D60 • नवमांश • दशमांश • विंशोपक बल' : 'D1 to D60 • Navamsha • Dashamsha • Vimshopaka Bala'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className={`text-sm text-primary underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'होम' : 'Home'}
              </Link>
              <Link to="/dasha" className={`text-sm text-violet-600 underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'दशा' : 'Dasha'}
              </Link>
              <Link to="/jaimini" className={`text-sm text-amber-600 underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'जैमिनी' : 'Jaimini'}
              </Link>
              <Suspense fallback={null}>
                <DarkModeToggle showLabel={false} language={hiLang} />
              </Suspense>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Intro */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <h2 className={`text-base font-semibold text-blue-900 dark:text-blue-100 mb-2 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'षोडशवर्ग के बारे में' : 'About Shodashvarga'}
            </h2>
            <p className={`text-sm text-blue-800 dark:text-blue-200 mb-3 ${isHi ? 'font-hindi' : ''}`}>
              {isHi
                ? 'षोडशवर्ग 16 विभागीय चार्टों का समूह है जो जीवन के विभिन्न पहलुओं का विश्लेषण करता है। D1 (राशि) से D60 (षष्ट्यांश) तक प्रत्येक चार्ट एक विशेष क्षेत्र दर्शाता है।'
                : 'Shodashvarga is a set of 16 divisional charts that analyze different aspects of life. From D1 (Rashi) to D60 (Shashtiamsha), each chart reveals a specific life area.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { d: 'D1', en: 'Overall Life', hi: 'समग्र जीवन' },
                { d: 'D9', en: 'Marriage & Dharma', hi: 'विवाह और धर्म' },
                { d: 'D10', en: 'Career', hi: 'करियर' },
                { d: 'D12', en: 'Parents', hi: 'माता-पिता' },
                { d: 'D3', en: 'Siblings', hi: 'भाई-बहन' },
                { d: 'D4', en: 'Property', hi: 'संपत्ति' },
                { d: 'D7', en: 'Children', hi: 'संतान' },
                { d: 'D60', en: 'Past Life Karma', hi: 'पूर्व जन्म कर्म' },
              ].map(item => (
                <div key={item.d} className="bg-white/60 dark:bg-white/5 rounded px-2 py-1 text-center">
                  <span className="font-bold text-blue-700 dark:text-blue-300">{item.d}</span>
                  <span className={`ml-1 text-blue-600 dark:text-blue-400 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? item.hi : item.en}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
              <p className={`text-center text-sm text-muted-foreground mb-4 ${isHi ? 'font-hindi' : ''}`}>
                {isHi
                  ? 'विभागीय चार्ट विश्लेषण के लिए अपना जन्म विवरण दर्ज करें'
                  : 'Enter your birth details for divisional chart analysis'}
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

              {planetLongitudes && ascendantLongitude !== null && !isCalculating && (
                <Suspense fallback={<Loader />}>
                  <DivisionalChartsCard
                    planetLongitudes={planetLongitudes}
                    ascendantLongitude={ascendantLongitude}
                    lang={lang}
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

export default DivisionalChartsPage;
