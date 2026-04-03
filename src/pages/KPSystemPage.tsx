import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { SEO } from '@/components/SEO';
import { calculateKPChart } from '@/services/kpSystemService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const parseCoords = (location: string): { lat: number; lon: number } => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const KPSystemPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [kpChart, setKpChart] = useState<ReturnType<typeof calculateKPChart> | null>(null);
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setRawBirth(data);
    try {
      const chart = calculateKPChart(data.date, data.time, coords.lat, coords.lon);
      setKpChart(chart);
    } catch {
      setKpChart(null);
    }
  };

  return (
    <>
      <SEO title="KP System - Krishnamurti Paddhati" description="KP System astrology with sub-lords, significators and precise event timing using Krishnamurti Paddhati." keywords="KP system, krishnamurti paddhati, sub lord, significator, KP astrology" canonical="/kp-system" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔭</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'केपी पद्धति' : 'KP System'}</h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'कृष्णमूर्ति पद्धति' : 'Krishnamurti Paddhati'}</p>
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
              <p className={`text-center text-sm text-muted-foreground mb-4 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'केपी चार्ट के लिए जन्म विवरण दर्ज करें' : 'Enter birth details for KP chart analysis'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.date}</span>
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.time}</span>
                </div>
                <button onClick={() => { setRawBirth(null); setKpChart(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>
              {kpChart ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'ग्रह उप-स्वामी' : 'Planet Sub-Lords'}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {kpChart.planets.slice(0, 9).map(p => (
                          <div key={p.name} className="p-3 border rounded-lg text-sm">
                            <div className="font-semibold">{isHi ? p.nameHi : p.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <div>{isHi ? 'नक्षत्र स्वामी:' : 'Star Lord:'} {isHi ? p.starLordHi : p.starLord}</div>
                              <div>{isHi ? 'उप-स्वामी:' : 'Sub Lord:'} {isHi ? p.subLordHi : p.subLord}</div>
                              <div>{isHi ? 'भाव:' : 'House:'} {p.house}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'केपी भविष्यवाणियां' : 'KP Predictions'}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {kpChart.predictions.map((pred, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge>{isHi ? pred.categoryHi : pred.category}</Badge>
                            <span className="text-xs text-muted-foreground">{pred.timing}</span>
                            <Badge variant="outline">{pred.probability}%</Badge>
                          </div>
                          <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>{isHi ? pred.predictionHi : pred.prediction}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">{isHi ? 'चार्ट गणना में त्रुटि' : 'Error calculating chart'}</div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default KPSystemPage;
