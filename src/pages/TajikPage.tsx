/**
 * Tajik (Varshphal) Page — Week 30
 * Annual horoscope system standalone page
 */
import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO } from '@/components/SEO';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TajikCard = lazy(() => import('@/components/TajikCard'));
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

const TajikPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());

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
  const birthYear = rawBirth ? new Date(rawBirth.date).getFullYear() : new Date().getFullYear();

  return (
    <>
      <SEO
        title="Varshphal (Tajik) - Annual Horoscope Calculator"
        description="Get your annual horoscope (Varshphal) with Muntha, Varshesh, Tajik Yogas and Sahams. Solar return chart analysis based on Tajik system."
        keywords="varshphal, tajik astrology, annual horoscope, solar return, muntha, varshesh, tajik yogas"
        canonical="/tajik"
      />
      <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'वर्षफल (ताजिक)' : 'Varshphal (Tajik)'}
              </h1>
              <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'वार्षिक कुंडली • मुंथा • ताजिक योग • सहम' : 'Annual Horoscope • Muntha • Tajik Yogas • Sahams'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className={`text-sm text-primary underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'होम' : 'Home'}
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

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Intro */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
          <h2 className={`text-base font-semibold text-orange-900 dark:text-orange-100 mb-2 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'ताजिक पद्धति के बारे में' : 'About Tajik System'}
          </h2>
          <p className={`text-sm text-orange-800 dark:text-orange-200 ${isHi ? 'font-hindi' : ''}`}>
            {isHi
              ? 'ताजिक (वर्षफल) एक वार्षिक कुंडली पद्धति है जो सूर्य के जन्म राशि में वापस आने पर बनती है। इसमें मुंथा, वर्षेश, ताजिक योग और सहम का विश्लेषण होता है।'
              : 'Tajik (Varshphal) is an annual horoscope system based on the Solar Return chart. It analyzes Muntha (annual progressed ascendant), Year Lord (Varshesh), Tajik Yogas, and Sahams (Arabic Parts).'}
          </p>
        </div>

        {!rawBirth ? (
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
            <p className={`text-center text-sm text-muted-foreground mb-4 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'वर्षफल के लिए अपना जन्म विवरण दर्ज करें' : 'Enter your birth details for Varshphal analysis'}
            </p>
            <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Birth info + year selector */}
            <div className="flex items-center justify-between flex-wrap gap-3">
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

            {/* Year selector */}
            <div className="max-w-xs bg-card border border-border rounded-lg p-4">
              <Label className={`text-sm font-semibold mb-2 block ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'वर्ष चुनें' : 'Select Year'}
              </Label>
              <Input
                type="number"
                min={birthYear}
                max={birthYear + 80}
                value={targetYear}
                onChange={e => setTargetYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full"
              />
            </div>

            {isCalculating && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                {isHi ? <span className="font-hindi">गणना हो रही है…</span> : 'Calculating…'}
              </div>
            )}

            {planets && !isCalculating && (
              <Suspense fallback={<Loader />}>
                <TajikCard
                  planets={planets.map(p => ({
                    name: p.name,
                    rashiIndex: p.rashiIndex,
                    degrees: p.degrees,
                    house: p.house,
                    longitude: p.rashiIndex * 30 + p.degrees,
                  }))}
                  birthAscendantRashi={ascendantRashi}
                  birthYear={birthYear}
                  targetYear={targetYear}
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

export default TajikPage;
