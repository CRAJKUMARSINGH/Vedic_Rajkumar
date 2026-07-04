// Week 49: Comparative Astrology - Vedic vs Western
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { calculateWesternChart } from '@/services/westernAstrologyService';
import { SEO } from '@/components/SEO';

const parseCoords = (loc: string) => {
  const m = loc.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const RASHIS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHIS_HI = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];

const ComparativeAstrologyPage = () => {
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

  const westernChart = rawBirth ? (() => {
    try { const c = parseCoords(rawBirth.location); return calculateWesternChart(rawBirth.date, rawBirth.time, c.lat, c.lon); }
    catch { return null; }
  })() : null;

  const vedicPlanets = chart.planetaryPositions?.planets ?? null;

  return (
    <>
      <SEO title="Comparative Astrology - Vedic vs Western" description="Compare your Vedic and Western astrology charts side by side. Understand the differences between sidereal and tropical zodiac systems." keywords="comparative astrology, vedic vs western, sidereal tropical, ayanamsa, zodiac comparison" canonical="/comparative-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚖️</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'तुलनात्मक ज्योतिष' : 'Comparative Astrology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'वैदिक बनाम पाश्चात्य' : 'Vedic (Sidereal) vs Western (Tropical)'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>
        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border rounded-xl p-6 shadow-sm">
              <p className="text-center text-sm text-muted-foreground mb-4">
                {isHi ? 'वैदिक और पाश्चात्य कुंडली की तुलना के लिए जन्म विवरण दर्ज करें' : 'Enter birth details to compare Vedic and Western charts'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.date}</span>
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.time}</span>
                </div>
                <button onClick={() => { setRawBirth(null); setBirthInput(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>

              {isCalculating && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}

              {/* Ayanamsa explanation */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-xl p-4 text-sm">
                <div className="font-semibold mb-1">🔭 {isHi ? 'अयनांश अंतर' : 'Ayanamsa Difference'}</div>
                <p className="text-muted-foreground text-xs">
                  {isHi
                    ? 'वैदिक ज्योतिष निरयण (सायन) राशि चक्र का उपयोग करता है जो लगभग 23-24° पीछे है। इसलिए अधिकांश ग्रह एक राशि पीछे दिखते हैं।'
                    : 'Vedic astrology uses the sidereal zodiac (~23-24° behind tropical). Most planets appear one sign earlier in Vedic vs Western.'}
                </p>
              </div>

              {/* Side by side comparison */}
              {vedicPlanets && westernChart && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Vedic */}
                  <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="bg-orange-50 dark:bg-orange-950/20 px-4 py-3 border-b">
                      <div className="font-bold text-orange-800 dark:text-orange-200">🕉️ {isHi ? 'वैदिक (निरयण)' : 'Vedic (Sidereal)'}</div>
                      <div className="text-xs text-muted-foreground">{isHi ? 'लग्न: ' : 'Ascendant: '}{isHi ? RASHIS_HI[chart.ascendant?.ascendant.rashiIndex??0] : RASHIS[chart.ascendant?.ascendant.rashiIndex??0]}</div>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50"><tr><th className="text-left p-2 text-xs">Planet</th><th className="text-left p-2 text-xs">Sign</th><th className="text-left p-2 text-xs">House</th></tr></thead>
                      <tbody>
                        {vedicPlanets.map((p, i) => (
                          <tr key={p.name} className={i%2===0?'bg-background':'bg-muted/20'}>
                            <td className="p-2 font-medium">{p.name}</td>
                            <td className="p-2">{isHi ? RASHIS_HI[p.rashiIndex] : p.rashiName}</td>
                            <td className="p-2 text-muted-foreground">H{p.house}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Western */}
                  <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="bg-blue-50 dark:bg-blue-950/20 px-4 py-3 border-b">
                      <div className="font-bold text-blue-800 dark:text-blue-200">⭐ {isHi ? 'पाश्चात्य (सायन)' : 'Western (Tropical)'}</div>
                      <div className="text-xs text-muted-foreground">{isHi ? 'लग्न: ' : 'Ascendant: '}{westernChart.ascendant}</div>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50"><tr><th className="text-left p-2 text-xs">Planet</th><th className="text-left p-2 text-xs">Sign</th><th className="text-left p-2 text-xs">House</th></tr></thead>
                      <tbody>
                        {westernChart.planets.map((p, i) => (
                          <tr key={p.name} className={i%2===0?'bg-background':'bg-muted/20'}>
                            <td className="p-2 font-medium">{p.symbol} {p.name}</td>
                            <td className="p-2">{p.sign}</td>
                            <td className="p-2 text-muted-foreground">H{p.house}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Key differences */}
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold mb-3">{isHi ? 'मुख्य अंतर' : 'Key Differences'}</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {[
                    { vedic: 'Sidereal zodiac (fixed stars)', western: 'Tropical zodiac (seasons)', label: 'Zodiac' },
                    { vedic: 'Moon sign primary', western: 'Sun sign primary', label: 'Focus' },
                    { vedic: '27 Nakshatras', western: '12 Signs only', label: 'Stars' },
                    { vedic: 'Dasha system for timing', western: 'Progressions & transits', label: 'Timing' },
                    { vedic: 'Whole sign houses', western: 'Placidus/Koch houses', label: 'Houses' },
                    { vedic: 'Rahu/Ketu (nodes)', western: 'Outer planets (Uranus/Neptune/Pluto)', label: 'Planets' },
                  ].map(d => (
                    <div key={d.label} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs font-bold text-muted-foreground w-16 flex-shrink-0">{d.label}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1"><span className="text-orange-600 text-xs">🕉️</span><span className="text-xs">{d.vedic}</span></div>
                        <div className="flex items-center gap-1"><span className="text-blue-600 text-xs">⭐</span><span className="text-xs">{d.western}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ComparativeAstrologyPage;
