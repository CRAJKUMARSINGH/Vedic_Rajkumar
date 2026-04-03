import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const parseCoords = (location: string): { lat: number; lon: number } => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const LoveAstrologyPage = () => {
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
  const venusStrength = planets ? (chart.shadbala?.planets?.find(p => p.planet === 'Venus')?.totalStrength ?? 50) : null;
  const moonStrength = planets ? (chart.shadbala?.planets?.find(p => p.planet === 'Moon')?.totalStrength ?? 50) : null;
  const venus = planets?.find(p => p.name === 'Venus');
  const moon = planets?.find(p => p.name === 'Moon');

  const loveScore = venusStrength !== null && moonStrength !== null
    ? Math.round((venusStrength + moonStrength) / 2)
    : null;

  return (
    <>
      <SEO title="Love Astrology - Relationships & Romance" description="Discover your love life through Vedic astrology. Venus and Moon analysis for romance, relationships and marriage timing." keywords="love astrology, venus astrology, romance horoscope, relationship astrology, marriage timing" canonical="/love-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💕</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'प्रेम ज्योतिष' : 'Love Astrology'}</h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'प्रेम, रिश्ते और विवाह' : 'Love, Relationships & Marriage'}</p>
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
                {isHi ? 'प्रेम ज्योतिष विश्लेषण के लिए जन्म विवरण दर्ज करें' : 'Enter birth details for love astrology analysis'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-2 py-1 rounded bg-muted text-xs">{rawBirth.date}</span>
                <button onClick={() => { setRawBirth(null); setBirthInput(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>
              {isCalculating && <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>}
              {planets && (
                <div className="space-y-4">
                  {loveScore !== null && (
                    <Card>
                      <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'प्रेम स्कोर' : 'Love Score'}</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-bold text-pink-500">{loveScore}%</span>
                          <div className="flex-1">
                            <Progress value={loveScore} className="h-3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {venus && (
                      <Card>
                        <CardHeader><CardTitle className="text-base">{isHi ? 'शुक्र (प्रेम)' : 'Venus (Love)'}</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <div>{isHi ? 'राशि:' : 'Sign:'} {venus.rashiName}</div>
                          <div>{isHi ? 'भाव:' : 'House:'} {venus.house}</div>
                          {venusStrength !== null && (
                            <div>
                              <div className="flex justify-between mb-1"><span>{isHi ? 'शक्ति:' : 'Strength:'}</span><span>{Math.round(venusStrength)}%</span></div>
                              <Progress value={venusStrength} className="h-2" />
                            </div>
                          )}
                          <p className={`text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? 'शुक्र प्रेम, सौंदर्य और विवाह का कारक है।' : 'Venus governs love, beauty and marriage.'}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {moon && (
                      <Card>
                        <CardHeader><CardTitle className="text-base">{isHi ? 'चंद्र (भावनाएं)' : 'Moon (Emotions)'}</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <div>{isHi ? 'राशि:' : 'Sign:'} {moon.rashiName}</div>
                          <div>{isHi ? 'भाव:' : 'House:'} {moon.house}</div>
                          {moonStrength !== null && (
                            <div>
                              <div className="flex justify-between mb-1"><span>{isHi ? 'शक्ति:' : 'Strength:'}</span><span>{Math.round(moonStrength)}%</span></div>
                              <Progress value={moonStrength} className="h-2" />
                            </div>
                          )}
                          <p className={`text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? 'चंद्र भावनात्मक स्वभाव और मन का कारक है।' : 'Moon governs emotional nature and mind.'}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <Card>
                    <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'प्रेम सुझाव' : 'Love Insights'}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { en: 'Strengthen Venus by wearing white on Fridays', hi: 'शुक्रवार को सफेद पहनकर शुक्र को मजबूत करें' },
                        { en: 'Chant Venus mantra: Om Shukraya Namaha', hi: 'शुक्र मंत्र जाप करें: ॐ शुक्राय नमः' },
                        { en: 'Donate white sweets on Fridays for love blessings', hi: 'प्रेम आशीर्वाद के लिए शुक्रवार को सफेद मिठाई दान करें' },
                      ].map((tip, i) => (
                        <div key={i} className={`text-sm p-2 bg-pink-50 rounded ${isHi ? 'font-hindi' : ''}`}>• {isHi ? tip.hi : tip.en}</div>
                      ))}
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

export default LoveAstrologyPage;
