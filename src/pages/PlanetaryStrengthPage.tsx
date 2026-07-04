/**
 * Planetary Strength Page — Week 32
 * Shadbala (6-fold strength) + Ashtakavarga (8-point system) combined analysis
 */
import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO } from '@/components/SEO';

const ShadabalaCard = lazy(() => import('@/components/ShadabalaCard'));
const AshtakavargaCard = lazy(() => import('@/components/AshtakavargaCard'));
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

const PlanetaryStrengthPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [activeTab, setActiveTab] = useState<'shadbala' | 'ashtakavarga'>('shadbala');

  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  // Derive isDaytime from birth time
  const isDaytime = rawBirth
    ? parseInt(rawBirth.time.split(':')[0]) >= 6 && parseInt(rawBirth.time.split(':')[0]) < 18
    : true;

  const { data: chart, isCalculating } = useChartCalculation(birthInput, isDaytime);

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setRawBirth(data);
    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });
  };

  const planets = chart.planetaryPositions?.planets ?? null;
  const ascendantRashi = chart.ascendant?.ascendant.rashiIndex ?? 0;
  const birthMonth = rawBirth ? new Date(rawBirth.date).getMonth() + 1 : 1;

  const planetRashis = planets
    ? Object.fromEntries(planets.map(p => [p.name, p.rashiIndex]))
    : null;

  const shadabalaInput = planets
    ? planets.map(p => ({
        name: p.name,
        rashiIndex: p.rashiIndex,
        house: p.house,
        degrees: p.degrees,
        isRetrograde: p.retrograde ?? false,
        longitude: p.rashiIndex * 30 + p.degrees,
      }))
    : null;

  const tabs = [
    {
      id: 'shadbala' as const,
      label: isHi ? 'षड्बल' : 'Shadbala',
      sublabel: isHi ? '6-गुना शक्ति' : '6-fold strength',
      icon: '⚖️',
    },
    {
      id: 'ashtakavarga' as const,
      label: isHi ? 'अष्टकवर्ग' : 'Ashtakavarga',
      sublabel: isHi ? '8-बिंदु प्रणाली' : '8-point system',
      icon: '📊',
    },
  ];

  return (
    <>
      <SEO
        title="Planetary Strength - Shadbala & Ashtakavarga"
        description="Calculate planetary strength with Shadbala (6-fold strength: Sthana, Dig, Kala, Chesta, Naisargika, Drik Bala) and Ashtakavarga (BAV/SAV transit analysis)."
        keywords="shadbala, ashtakavarga, planetary strength, sthana bala, dig bala, BAV, SAV, vedic astrology"
        canonical="/planetary-strength"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💪</span>
              <div>
                <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'ग्रह शक्ति विश्लेषण' : 'Planetary Strength Analysis'}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'षड्बल • अष्टकवर्ग • BPHS' : 'Shadbala • Ashtakavarga • BPHS'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className={`text-sm text-primary underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'होम' : 'Home'}
              </Link>
              <Link to="/divisional-charts" className={`text-sm text-indigo-600 underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'D-चार्ट' : 'D-Charts'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚖️</span>
                <h2 className={`font-semibold text-emerald-900 dark:text-emerald-100 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'षड्बल' : 'Shadbala'}
                </h2>
              </div>
              <p className={`text-xs text-emerald-800 dark:text-emerald-200 ${isHi ? 'font-hindi' : ''}`}>
                {isHi
                  ? 'छह प्रकार की ग्रह शक्ति: स्थान, दिग्, काल, चेष्टा, नैसर्गिक और दृक् बल। BPHS के अनुसार।'
                  : 'Six types of planetary strength: Sthana, Dig, Kala, Chesta, Naisargika & Drik Bala per BPHS.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📊</span>
                <h2 className={`font-semibold text-teal-900 dark:text-teal-100 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'अष्टकवर्ग' : 'Ashtakavarga'}
                </h2>
              </div>
              <p className={`text-xs text-teal-800 dark:text-teal-200 ${isHi ? 'font-hindi' : ''}`}>
                {isHi
                  ? 'प्रत्येक ग्रह के लिए 8-बिंदु प्रणाली। BAV (भिन्नाष्टकवर्ग) और SAV (सर्वाष्टकवर्ग) गोचर शक्ति।'
                  : '8-point system per planet. BAV (individual) and SAV (combined) for transit strength analysis.'}
              </p>
            </div>
          </div>

          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
              <p className={`text-center text-sm text-muted-foreground mb-4 ${isHi ? 'font-hindi' : ''}`}>
                {isHi
                  ? 'ग्रह शक्ति विश्लेषण के लिए अपना जन्म विवरण दर्ज करें'
                  : 'Enter your birth details for planetary strength analysis'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Birth info bar */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{rawBirth.date}</span>
                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{rawBirth.time}</span>
                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground">{rawBirth.location}</span>
                  <span className={`px-2 py-1 rounded text-xs ${isDaytime ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                    {isDaytime ? (isHi ? '☀️ दिन' : '☀️ Day') : (isHi ? '🌙 रात' : '🌙 Night')}
                  </span>
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

              {!isCalculating && planets && (
                <>
                  {/* Tab switcher */}
                  <div className="flex gap-2 border-b border-border">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span className={isHi ? 'font-hindi' : ''}>{tab.label}</span>
                        <span className={`text-xs text-muted-foreground hidden sm:inline ${isHi ? 'font-hindi' : ''}`}>
                          {tab.sublabel}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  {activeTab === 'shadbala' && shadabalaInput && (
                    <Suspense fallback={<Loader />}>
                      <ShadabalaCard
                        planets={shadabalaInput}
                        isDaytime={isDaytime}
                        birthMonth={birthMonth}
                        lang={lang}
                      />
                    </Suspense>
                  )}

                  {activeTab === 'ashtakavarga' && planetRashis && (
                    <Suspense fallback={<Loader />}>
                      <AshtakavargaCard
                        planetRashis={planetRashis}
                        ascendantRashi={ascendantRashi}
                        lang={lang}
                      />
                    </Suspense>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default PlanetaryStrengthPage;
