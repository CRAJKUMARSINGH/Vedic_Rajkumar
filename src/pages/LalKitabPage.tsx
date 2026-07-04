import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO } from '@/components/SEO';
import { LAL_KITAB_PRINCIPLES } from '@/services/lalKitabService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const parseCoords = (location: string): { lat: number; lon: number } => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const LalKitabPage = () => {
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
      <SEO title="Lal Kitab - Red Book Astrology" description="Lal Kitab analysis with Pucca Ghar, Andha planets, karmic debts and simple totke remedies." keywords="lal kitab, red book astrology, totke, pucca ghar, karmic debt" canonical="/lal-kitab" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📕</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'लाल किताब' : 'Lal Kitab'}</h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'लाल किताब ज्योतिष विश्लेषण' : 'Red Book Astrology Analysis'}</p>
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
            <div className="space-y-6">
              <div className="max-w-2xl mx-auto bg-card border rounded-xl p-6 shadow-sm">
                <p className={`text-center text-sm text-muted-foreground mb-4 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'लाल किताब विश्लेषण के लिए जन्म विवरण दर्ज करें' : 'Enter birth details for Lal Kitab analysis'}
                </p>
                <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
              </div>
              <Card className="max-w-2xl mx-auto">
                <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'लाल किताब के मूल सिद्धांत' : 'Lal Kitab Key Principles'}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(isHi ? LAL_KITAB_PRINCIPLES.concepts.hi : LAL_KITAB_PRINCIPLES.concepts.en).map((c, i) => (
                      <li key={i} className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>• {c}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.date}</span>
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.time}</span>
                </div>
                <button onClick={() => { setRawBirth(null); setBirthInput(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>
              {isCalculating && <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>}
              {planets && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'ग्रह स्थिति (लाल किताब)' : 'Planetary Positions (Lal Kitab)'}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {planets.map(p => {
                          const puccaGhar = LAL_KITAB_PRINCIPLES.puccaGhar[p.name as keyof typeof LAL_KITAB_PRINCIPLES.puccaGhar];
                          const isPucca = p.house === puccaGhar;
                          const andhaHouses = LAL_KITAB_PRINCIPLES.andhaPlanets[p.name as keyof typeof LAL_KITAB_PRINCIPLES.andhaPlanets] || [];
                          const isAndha = andhaHouses.includes(p.house);
                          return (
                            <div key={p.name} className="p-3 border rounded-lg text-sm">
                              <div className="font-semibold">{p.name} — H{p.house}</div>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {isPucca && <Badge className="text-xs bg-green-600 text-white">{isHi ? 'पक्का घर' : 'Pucca'}</Badge>}
                                {isAndha && <Badge className="text-xs bg-red-600 text-white">{isHi ? 'अंधा' : 'Andha'}</Badge>}
                                {puccaGhar && <Badge variant="outline" className="text-xs">{isHi ? 'पक्का:' : 'Pucca:'} H{puccaGhar}</Badge>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'लाल किताब उपाय' : 'Lal Kitab Remedies'}</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(isHi ? LAL_KITAB_PRINCIPLES.concepts.hi : LAL_KITAB_PRINCIPLES.concepts.en).map((c, i) => (
                          <li key={i} className={`text-sm ${isHi ? 'font-hindi' : ''}`}>• {c}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default LalKitabPage;
