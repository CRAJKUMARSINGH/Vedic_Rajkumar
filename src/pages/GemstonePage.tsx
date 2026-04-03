// Week 72: Standalone Gemstone Recommendation Page
import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO } from '@/components/SEO';

const GemstoneRecommendationCard = lazy(() => import('@/components/GemstoneRecommendationCard'));

const parseCoords = (loc: string) => {
  const m = loc.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const GemstonePage = () => {
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
      <SEO title="Gemstone Recommendations - Vedic Ratna Shastra" description="Get personalized gemstone recommendations based on your birth chart. Find your lucky gemstone, wearing method, and activation rituals." keywords="gemstone recommendation, ratna shastra, lucky gemstone, ruby, emerald, yellow sapphire, vedic gems" canonical="/gemstones" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💎</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'रत्न शास्त्र' : 'Gemstone Recommendations'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'व्यक्तिगत रत्न सुझाव • धारण विधि' : 'Personalized Gems • Wearing Method • Activation'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            💎 <strong>Note:</strong> Gemstone recommendations are based on Vedic astrology principles. Always consult a qualified astrologer before wearing gemstones. Quality and authenticity of gems matter significantly.
          </div>
          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border rounded-xl p-6 shadow-sm">
              <p className="text-center text-sm text-muted-foreground mb-4">
                {isHi ? 'रत्न सुझाव के लिए जन्म विवरण दर्ज करें' : 'Enter birth details for personalized gemstone recommendations'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.date}</span>
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.time}</span>
                </div>
                <button onClick={() => { setRawBirth(null); setBirthInput(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>
              {isCalculating && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}
              {planets && (
                <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
                  <GemstoneRecommendationCard
                    planetaryPositions={planets}
                    ascendantRashi={chart.ascendant?.ascendant.rashiIndex ?? 0}
                    birthDate={rawBirth.date}
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

export default GemstonePage;
