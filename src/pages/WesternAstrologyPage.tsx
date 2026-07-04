// Week 30-31: Western Astrology Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { calculateWesternChart, getWesternSignDescription, type WesternChart } from '@/services/westernAstrologyService';
import { SEO } from '@/components/SEO';

const parseCoords = (location: string) => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const ELEMENT_COLORS: Record<string, string> = { Fire: 'text-orange-500', Earth: 'text-green-600', Air: 'text-blue-500', Water: 'text-cyan-500' };
const STRENGTH_COLORS = { strong: 'bg-green-100 text-green-800', moderate: 'bg-yellow-100 text-yellow-800', weak: 'bg-gray-100 text-gray-600' };
const DIGNITY_COLORS: Record<string, string> = { Domicile: 'text-green-600', Exaltation: 'text-yellow-600', Detriment: 'text-red-500', Fall: 'text-orange-500', Peregrine: 'text-gray-500' };

const WesternAstrologyPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [chart, setChart] = useState<WesternChart | null>(null);
  const [activeTab, setActiveTab] = useState<'planets' | 'aspects' | 'overview'>('overview');
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setRawBirth(data);
    setChart(calculateWesternChart(data.date, data.time, coords.lat, coords.lon));
  };

  return (
    <>
      <SEO title="Western Astrology - Tropical Zodiac Birth Chart" description="Get your Western astrology birth chart with tropical zodiac, planetary aspects, house positions and detailed interpretations." keywords="western astrology, tropical zodiac, birth chart, sun sign, moon sign, rising sign, aspects" canonical="/western-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'पाश्चात्य ज्योतिष' : 'Western Astrology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'उष्णकटिबंधीय राशि चक्र' : 'Tropical Zodiac • Aspects • Houses'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border rounded-xl p-6 shadow-sm">
              <p className="text-center text-sm text-muted-foreground mb-4">
                {isHi ? 'पाश्चात्य जन्म कुंडली के लिए विवरण दर्ज करें' : 'Enter birth details for your Western astrology chart'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : chart && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.date}</span>
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.time}</span>
                </div>
                <button onClick={() => { setRawBirth(null); setChart(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>

              {/* Big 3 */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: isHi ? 'सूर्य राशि' : 'Sun Sign', value: chart.sunSign, icon: '☉' },
                  { label: isHi ? 'चंद्र राशि' : 'Moon Sign', value: chart.moonSign, icon: '☽' },
                  { label: isHi ? 'लग्न' : 'Rising Sign', value: chart.ascendant, icon: '↑' },
                ].map(item => (
                  <div key={item.label} className="bg-card border rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                    <div className="font-bold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart overview */}
              <div className="bg-card border rounded-xl p-4 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Dominant Element: </span><span className={`font-semibold ${ELEMENT_COLORS[chart.dominantElement]}`}>{chart.dominantElement}</span></div>
                  <div><span className="text-muted-foreground">Dominant Modality: </span><span className="font-semibold">{chart.dominantModality}</span></div>
                  <div><span className="text-muted-foreground">Chart Ruler: </span><span className="font-semibold">{chart.chartRuler}</span></div>
                  <div><span className="text-muted-foreground">Aspects: </span><span className="font-semibold">{chart.aspects.length}</span></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{chart.interpretation}</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {(['overview','planets','aspects'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                    {tab === 'overview' ? (isHi ? 'अवलोकन' : 'Overview') : tab === 'planets' ? (isHi ? 'ग्रह' : 'Planets') : (isHi ? 'दृष्टि' : 'Aspects')}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-3">
                  {chart.planets.slice(0, 3).map(p => (
                    <div key={p.name} className="bg-card border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{p.symbol}</span>
                        <span className="font-semibold">{p.name} in {p.sign}</span>
                        <span className={`text-xs ml-auto ${DIGNITY_COLORS[p.dignity]}`}>{p.dignity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{getWesternSignDescription(p.sign, hiLang)}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'planets' && (
                <div className="bg-card border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium">Planet</th>
                        <th className="text-left p-3 text-xs font-medium">Sign</th>
                        <th className="text-left p-3 text-xs font-medium">House</th>
                        <th className="text-left p-3 text-xs font-medium">Dignity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chart.planets.map((p, i) => (
                        <tr key={p.name} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="p-3"><span className="mr-1">{p.symbol}</span>{p.name}</td>
                          <td className="p-3">{p.degrees}°{p.minutes}' {p.sign}</td>
                          <td className="p-3">House {p.house}</td>
                          <td className={`p-3 text-xs ${DIGNITY_COLORS[p.dignity]}`}>{p.dignity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'aspects' && (
                <div className="space-y-2">
                  {chart.aspects.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No major aspects found</p>}
                  {chart.aspects.map((asp, i) => (
                    <div key={i} className="bg-card border rounded-lg p-3 flex items-start gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-0.5 ${STRENGTH_COLORS[asp.strength]}`}>{asp.strength}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{asp.planet1} {asp.aspectName} {asp.planet2} <span className="text-xs text-muted-foreground">(orb {asp.orb}°)</span></div>
                        <div className="text-xs text-muted-foreground mt-0.5">{asp.influence}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default WesternAstrologyPage;
