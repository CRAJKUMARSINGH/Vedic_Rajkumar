/**
 * Jaimini Astrology Page
 * Standalone page for full Jaimini system analysis
 */
import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO } from '@/components/SEO';

const JaiminiCard = lazy(() => import('@/components/JaiminiCard'));
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

const JaiminiPage = () => {
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
  const ascendantRashi = chart.ascendant?.ascendant.rashiIndex ?? 0;
  const ascendantDegrees = chart.ascendant?.ascendant.degrees ?? 0;
  const birthYear = rawBirth ? new Date(rawBirth.date).getFullYear() : new Date().getFullYear();

  return (
    <>
      <SEO
        title="Jaimini Astrology - Chara Dasha & Karakas"
        description="Get complete Jaimini astrology analysis with Chara Karakas, Pada Lagna, Rashi aspects, Jaimini Yogas and Chara Dasha periods."
        keywords="jaimini astrology, chara dasha, atmakaraka, pada lagna, jaimini yogas, vedic astrology"
        canonical="/jaimini"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔮</span>
              <div>
                <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'जैमिनी ज्योतिष' : 'Jaimini Astrology'}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'चर कारक • आरूढ लग्न • जैमिनी योग • चर दशा' : 'Chara Karakas • Arudha Lagna • Jaimini Yogas • Chara Dasha'}
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
              <Suspense fallback={null}>
                <DarkModeToggle showLabel={false} language={hiLang} />
              </Suspense>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <h2 className={`text-base font-semibold text-amber-900 dark:text-amber-100 mb-2 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'जैमिनी पद्धति के बारे में' : 'About Jaimini System'}
            </h2>
            <p className={`text-sm text-amber-800 dark:text-amber-200 ${isHi ? 'font-hindi' : ''}`}>
              {isHi
                ? 'जैमिनी ज्योतिष महर्षि जैमिनी द्वारा प्रतिपादित एक प्राचीन वैदिक पद्धति है। इसमें चर कारक, राशि दृष्टि, आरूढ लग्न और चर दशा का उपयोग होता है।'
                : 'Jaimini astrology is an ancient Vedic system by Maharishi Jaimini. It uses Chara Karakas, Rashi Drishti, Arudha Lagna, and Chara Dasha.'}
            </p>
          </div>

          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
              <p className={`text-center text-sm text-muted-foreground mb-4 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'जैमिनी विश्लेषण के लिए अपना जन्म विवरण दर्ज करें' : 'Enter your birth details for Jaimini analysis'}
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

              {planets && !isCalculating && (
                <Suspense fallback={<Loader />}>
                  <JaiminiCard
                    planets={planets.map(p => ({
                      name: p.name,
                      rashiIndex: p.rashiIndex,
                      degrees: p.degrees,
                      house: p.house,
                    }))}
                    ascendantRashi={ascendantRashi}
                    ascendantDegrees={ascendantDegrees}
                    birthYear={birthYear}
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

export default JaiminiPage;
