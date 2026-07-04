/**
 * Raman Archive Page
 * Notable Horoscopes + Ayanamsa Comparison + Tarabala + Remedies + Dasha-Gocha
 * All BV Raman Magazine-inspired features in one hub
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { NOTABLE_HOROSCOPES, getAllCategories, type NotableHoroscope } from '@/data/notableHoroscopes';
import { compareAyanamsas, formatDMS } from '@/services/ayanamsaService';
import TarabalaCard from '@/components/TarabalaCard';
import DashaGochaCard from '@/components/DashaGochaCard';
import { getRemedyForPlanet } from '@/data/transitRemedies';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const parseCoords = (loc: string) => {
  const m = loc.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const CATEGORY_ICONS: Record<string, string> = {
  saint: '🕉️', scientist: '🔬', leader: '👑', artist: '🎨', athlete: '🏆', historical: '📜'
};

// Unfavorable houses from Moon for each planet
const UNFAVORABLE_HOUSES: Record<string, number[]> = {
  Sun: [1,2,4,5,6,7,8,9,12], Moon: [2,4,5,8,9,12], Mars: [1,2,4,5,7,8,9,10,12],
  Mercury: [1,3,5,7,9,12], Jupiter: [1,3,4,6,8,10,12], Venus: [6,7,10],
  Saturn: [1,2,4,5,7,8,9,10,12], Rahu: [1,2,4,5,7,8,9,10,12], Ketu: [1,2,4,5,7,8,9,10,12],
};

const TABS = ['horoscopes', 'ayanamsa', 'tarabala', 'remedies', 'dasha-gocha'] as const;
type Tab = typeof TABS[number];

export default function RamanArchivePage() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [tab, setTab] = useState<Tab>('horoscopes');
  const [selectedCategory, setSelectedCategory] = useState<NotableHoroscope['category'] | 'all'>('all');
  const [selectedHoroscope, setSelectedHoroscope] = useState<NotableHoroscope | null>(null);
  const [ayanamsaDate, setAyanamsaDate] = useState(new Date().toISOString().split('T')[0]);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);

  const { data: chart } = useChartCalculation(birthInput);
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setRawBirth(data);
    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });
  };

  const resetBirth = () => { setRawBirth(null); setBirthInput(null); };

  const filteredHoroscopes = selectedCategory === 'all'
    ? NOTABLE_HOROSCOPES
    : NOTABLE_HOROSCOPES.filter(h => h.category === selectedCategory);

  const ayanamsaResult = compareAyanamsas(ayanamsaDate);

  // Build transit houses from chart
  const transitHouses: Record<string, number> = {};
  if (chart.planetaryPositions?.planets) {
    chart.planetaryPositions.planets.forEach(p => { transitHouses[p.name] = p.house ?? 1; });
  }

  const currentDasha = chart.dasha?.currentMahadasha?.planet ?? 'Jupiter';
  const currentAntar = chart.dasha?.currentAntardasha?.planet ?? 'Saturn';

  // Planets in unfavorable transit
  const unfavorablePlanets = Object.entries(transitHouses)
    .filter(([planet, house]) => UNFAVORABLE_HOUSES[planet]?.includes(house))
    .map(([planet]) => planet);

  const TAB_LABELS: Record<Tab, { en: string; hi: string }> = {
    'horoscopes':  { en: '📚 Notable Charts', hi: '📚 प्रसिद्ध कुंडलियां' },
    'ayanamsa':    { en: '🔭 Ayanamsa', hi: '🔭 अयनांश' },
    'tarabala':    { en: '⭐ Tarabala', hi: '⭐ ताराबल' },
    'remedies':    { en: '🕉️ Remedies', hi: '🕉️ उपाय' },
    'dasha-gocha': { en: '🪐 Dasha-Gocha', hi: '🪐 दशा-गोचर' },
  };

  const BirthForm = () => (
    <div className="max-w-xl mx-auto bg-card border rounded-xl p-6">
      <p className={`text-sm text-center text-muted-foreground mb-4 ${isHi ? 'font-hindi' : ''}`}>
        {isHi ? 'जन्म विवरण दर्ज करें' : 'Enter birth details'}
      </p>
      <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
    </div>
  );

  const BirthChip = () => (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-muted">{rawBirth?.date}</span>
        <span className="px-2 py-1 rounded bg-muted">{rawBirth?.time}</span>
      </div>
      <button onClick={resetBirth} className="text-xs text-primary underline">{isHi ? 'बदलें' : 'Change'}</button>
    </div>
  );

  return (
    <>
      <SEO
        title="B.V. Raman Archive — Notable Horoscopes, Ayanamsa, Tarabala"
        description="B.V. Raman inspired features: Notable horoscopes, ayanamsa comparison, Tarabala, transit remedies, Dasha-Gocha correlation."
        keywords="BV Raman, notable horoscopes, ayanamsa comparison, tarabala, transit remedies, dasha gocha"
        canonical="/raman-archive"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📖</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'रमण पुरालेख' : 'Raman Archive'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isHi ? 'द एस्ट्रोलॉजिकल मैगज़ीन परंपरा • 1936-2007' : 'The Astrological Magazine tradition • 1936–2007'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/bv-raman" className="text-xs text-primary underline underline-offset-2">BV Raman</Link>
              <Link to="/" className="text-xs text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Tab bar */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 flex-wrap">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors min-w-[80px] ${tab === t ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {isHi ? TAB_LABELS[t].hi : TAB_LABELS[t].en}
              </button>
            ))}
          </div>

          {/* ── Notable Horoscopes ── */}
          {tab === 'horoscopes' && (
            <div className="space-y-4">
              <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'डॉ. बी.वी. रमण की "नोटेबल होरोस्कोप्स" श्रृंखला से प्रेरित शैक्षिक पुस्तकालय' : 'Educational library inspired by Dr. B.V. Raman\'s "Notable Horoscopes" series'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(['all', ...getAllCategories()] as const).map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}>
                    {cat === 'all' ? (isHi ? 'सभी' : 'All') : `${CATEGORY_ICONS[cat]} ${cat}`}
                  </button>
                ))}
              </div>
              {!selectedHoroscope ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHoroscopes.map(h => (
                    <button key={h.id} onClick={() => setSelectedHoroscope(h)}
                      className="text-left bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{CATEGORY_ICONS[h.category]}</span>
                        <div>
                          <p className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>{isHi ? h.nameHi : h.name}</p>
                          <p className="text-xs text-muted-foreground">{h.born}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge className="text-xs bg-amber-100 text-amber-800">☉ {h.sunSign}</Badge>
                        <Badge className="text-xs bg-blue-100 text-blue-800">☽ {h.moonSign}</Badge>
                        <Badge className="text-xs bg-purple-100 text-purple-800">↑ {h.ascendant}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <button onClick={() => setSelectedHoroscope(null)} className="text-sm text-primary underline underline-offset-2">
                    ← {isHi ? 'वापस जाएं' : 'Back'}
                  </button>
                  <Card>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-3 ${isHi ? 'font-hindi' : ''}`}>
                        <span className="text-3xl">{CATEGORY_ICONS[selectedHoroscope.category]}</span>
                        {isHi ? selectedHoroscope.nameHi : selectedHoroscope.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedHoroscope.born} • {selectedHoroscope.place}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-amber-100 text-amber-800">☉ {selectedHoroscope.sunSign}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">☽ {selectedHoroscope.moonSign}</Badge>
                        <Badge className="bg-purple-100 text-purple-800">↑ {selectedHoroscope.ascendant}</Badge>
                        <Badge className="bg-green-100 text-green-800">Dasha: {selectedHoroscope.dashaAtBirth}</Badge>
                      </div>
                      <div>
                        <p className={`text-xs font-semibold text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'जीवन की मुख्य घटनाएं:' : 'Life Highlights:'}</p>
                        <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>{isHi ? selectedHoroscope.lifeHighlights.hi : selectedHoroscope.lifeHighlights.en}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                        <p className={`text-xs font-semibold text-amber-700 mb-1 ${isHi ? 'font-hindi' : ''}`}>🔭 {isHi ? 'ज्योतिष विश्लेषण:' : 'Astrological Insight:'}</p>
                        <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>{isHi ? selectedHoroscope.astroInsight.hi : selectedHoroscope.astroInsight.en}</p>
                      </div>
                      <div>
                        <p className={`text-xs font-semibold text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'प्रमुख योग:' : 'Key Yogas:'}</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedHoroscope.keyYogas.map(y => <Badge key={y} className="text-xs bg-violet-100 text-violet-800">{y}</Badge>)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">📖 {selectedHoroscope.source}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* ── Ayanamsa Comparison ── */}
          {tab === 'ayanamsa' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'तिथि:' : 'Date:'}</label>
                <input type="date" value={ayanamsaDate} onChange={e => setAyanamsaDate(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm bg-background" />
              </div>
              <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? ayanamsaResult.recommendation.hi : ayanamsaResult.recommendation.en}
              </p>
              <div className="space-y-2">
                {ayanamsaResult.results.map(r => (
                  <Card key={r.name} className={r.name.includes('Raman') ? 'border-amber-400 border-2' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>{isHi ? r.nameHi : r.name}</span>
                          {r.name.includes('Raman') && <Badge className="bg-amber-500 text-white text-xs">Raman</Badge>}
                        </div>
                        <span className="font-mono font-bold text-primary">{formatDMS(r.value)}</span>
                      </div>
                      <p className={`text-xs text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>{isHi ? r.description.hi : r.description.en}</p>
                      <p className="text-xs text-muted-foreground">Used by: {r.usedBy}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Spread: {ayanamsaResult.difference.spread}</p>
            </div>
          )}

          {/* ── Tarabala ── */}
          {tab === 'tarabala' && (
            <div className="space-y-4">
              {!rawBirth ? <BirthForm /> : (
                <div className="space-y-3">
                  <BirthChip />
                  {chart.nakshatra && (
                    <TarabalaCard
                      birthNakshatraIndex={(chart.nakshatra.number ?? 1) - 1}
                      moonNakshatraIndex={(chart.nakshatra.number ?? 1) - 1}
                      lang={hiLang}
                      showFullTable={true}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Transit Remedies ── */}
          {tab === 'remedies' && (
            <div className="space-y-4">
              {!rawBirth ? <BirthForm /> : (
                <div className="space-y-3">
                  <BirthChip />
                  {unfavorablePlanets.length === 0 ? (
                    <Card className="border-green-200">
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl mb-2">🙏</p>
                        <p className={`text-sm text-green-700 font-semibold ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? 'सभी ग्रह अनुकूल हैं — कोई उपाय आवश्यक नहीं' : 'All planets favorable — no remedies needed'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                        {isHi ? `${unfavorablePlanets.length} ग्रह अशुभ गोचर में:` : `${unfavorablePlanets.length} planet(s) in unfavorable transit:`}
                      </p>
                      {unfavorablePlanets.map(planet => {
                        const remedy = getRemedyForPlanet(planet);
                        if (!remedy) return null;
                        return (
                          <Card key={planet} className="border-orange-200 dark:border-orange-800">
                            <CardHeader className="pb-2">
                              <CardTitle className={`text-base flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                                <span>{planet}</span>
                                <Badge className="bg-red-100 text-red-700 text-xs">
                                  {isHi ? `भाव ${transitHouses[planet]}` : `House ${transitHouses[planet]}`}
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-amber-50 dark:bg-amber-950/20 rounded p-2">
                                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>🔔 {isHi ? 'मंत्र' : 'Mantra'}</p>
                                <p className={`font-medium ${isHi ? 'font-hindi' : ''}`}>{isHi ? remedy.mantra.hi : remedy.mantra.en} ×{remedy.count}</p>
                              </div>
                              <div className="bg-amber-50 dark:bg-amber-950/20 rounded p-2">
                                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>💎 {isHi ? 'रत्न' : 'Gemstone'}</p>
                                <p className={`font-medium ${isHi ? 'font-hindi' : ''}`}>{isHi ? remedy.gemstone.hi : remedy.gemstone.en}</p>
                              </div>
                              <div className="bg-amber-50 dark:bg-amber-950/20 rounded p-2">
                                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>📅 {isHi ? 'दान दिन' : 'Charity Day'}</p>
                                <p className={`font-medium ${isHi ? 'font-hindi' : ''}`}>{isHi ? remedy.charityDay.hi : remedy.charityDay.en}</p>
                              </div>
                              <div className="bg-amber-50 dark:bg-amber-950/20 rounded p-2">
                                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>🙏 {isHi ? 'देवता' : 'Deity'}</p>
                                <p className={`font-medium ${isHi ? 'font-hindi' : ''}`}>{isHi ? remedy.deity.hi : remedy.deity.en}</p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Dasha-Gocha ── */}
          {tab === 'dasha-gocha' && (
            <div className="space-y-4">
              {!rawBirth ? <BirthForm /> : (
                <div className="space-y-3">
                  <BirthChip />
                  <DashaGochaCard
                    dashaLord={currentDasha}
                    antarLord={currentAntar}
                    transitHouses={transitHouses}
                    lang={hiLang}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
