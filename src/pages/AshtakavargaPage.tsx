// Week 71: Standalone Ashtakavarga Page
import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO } from '@/components/SEO';

const AshtakavargaCard = lazy(() => import('@/components/AshtakavargaCard'));

const parseCoords = (loc: string) => {
  const m = loc.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const AshtakavargaPage = () => {
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
      <SEO title="Ashtakavarga - Transit Strength Calculator" description="Calculate Ashtakavarga scores for all planets. Understand transit strength, favorable periods, and life predictions through the Ashtakavarga system." keywords="ashtakavarga, transit strength, sarvashtakavarga, bindus, vedic astrology" canonical="/ashtakavarga" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'अष्टकवर्ग' : 'Ashtakavarga'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'गोचर शक्ति • बिंदु विश्लेषण' : 'Transit Strength • Bindu Analysis • Sarvashtakavarga'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Explanation */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-xl p-4 text-sm">
            <div className="font-semibold mb-1">🎯 {isHi ? 'अष्टकवर्ग क्या है?' : 'What is Ashtakavarga?'}</div>
            <p className="text-xs text-muted-foreground">
              {isHi
                ? 'अष्टकवर्ग एक अनूठी वैदिक प्रणाली है जो प्रत्येक ग्रह की गोचर शक्ति को 0-8 बिंदुओं में मापती है। 4+ बिंदु शुभ, 4 से कम अशुभ माने जाते हैं।'
                : 'Ashtakavarga is a unique Vedic system that measures each planet\'s transit strength in 0-8 bindus (points). 4+ bindus = favorable, below 4 = challenging. Sarvashtakavarga (total) shows overall life strength.'}
            </p>
          </div>

          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border rounded-xl p-6 shadow-sm">
              <p className="text-center text-sm text-muted-foreground mb-4">
                {isHi ? 'अष्टकवर्ग विश्लेषण के लिए जन्म विवरण दर्ज करें' : 'Enter birth details for Ashtakavarga analysis'}
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
                  <AshtakavargaCard
                    planetRashis={Object.fromEntries(planets.map(p => [p.name, p.rashiIndex]))}
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

export default AshtakavargaPage;
