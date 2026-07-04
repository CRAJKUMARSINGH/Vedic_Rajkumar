import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO } from '@/components/SEO';
import { generateNadiReading } from '@/services/nadiAstrologyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const parseCoords = (location: string): { lat: number; lon: number } => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const NadiAstrologyPage = () => {
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

  const nadiReading = rawBirth && chart.planetaryPositions
    ? generateNadiReading(rawBirth.date, rawBirth.time, chart.planetaryPositions.planets)
    : null;

  return (
    <>
      <SEO title="Nadi Astrology - Ancient Palm Leaf Predictions" description="Nadi astrology readings based on ancient palm leaf manuscripts. Discover past life karma, life events and remedies." keywords="nadi astrology, palm leaf reading, past life karma, nadi jyotish" canonical="/nadi-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌿</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'नाड़ी ज्योतिष' : 'Nadi Astrology'}</h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'प्राचीन ताड़पत्र भविष्यवाणी' : 'Ancient Palm Leaf Predictions'}</p>
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
                {isHi ? 'नाड़ी पठन के लिए जन्म विवरण दर्ज करें' : 'Enter birth details for Nadi reading'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.date}</span>
                </div>
                <button onClick={() => { setRawBirth(null); setBirthInput(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>
              {isCalculating && <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>}
              {nadiReading && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'ग्रहीय हस्ताक्षर' : 'Planetary Signature'}</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="font-semibold">{isHi ? 'प्रमुख ग्रह:' : 'Dominant:'}</span> {isHi ? nadiReading.planetarySignature.dominantPlanetHi : nadiReading.planetarySignature.dominantPlanet}</div>
                      <div><span className="font-semibold">{isHi ? 'द्वितीय ग्रह:' : 'Secondary:'}</span> {isHi ? nadiReading.planetarySignature.secondaryPlanetHi : nadiReading.planetarySignature.secondaryPlanet}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'जीवन घटनाएं' : 'Life Events'}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {nadiReading.lifeEvents.map((ev, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge>{isHi ? ev.eventHi : ev.event}</Badge>
                            <span className="text-xs text-muted-foreground">{isHi ? 'आयु:' : 'Age:'} {ev.age}</span>
                            <Badge variant="outline">{ev.probability}%</Badge>
                          </div>
                          <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>{isHi ? ev.descriptionHi : ev.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'पूर्व जन्म कर्म' : 'Past Life Karma'}</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div><span className="font-semibold">{isHi ? 'पेशा:' : 'Profession:'}</span> {isHi ? nadiReading.pastLifeKarma.professionHi : nadiReading.pastLifeKarma.profession}</div>
                      <div><span className="font-semibold">{isHi ? 'स्थान:' : 'Location:'}</span> {isHi ? nadiReading.pastLifeKarma.locationHi : nadiReading.pastLifeKarma.location}</div>
                      <div className={isHi ? 'font-hindi' : ''}>{isHi ? nadiReading.pastLifeKarma.currentLifeImpactHi : nadiReading.pastLifeKarma.currentLifeImpact}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className={isHi ? 'font-hindi' : ''}>{isHi ? 'भविष्यवाणियां' : 'Predictions'}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {nadiReading.predictions.map((pred, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex gap-2 mb-1">
                            <Badge>{pred.timeframe}</Badge>
                            <Badge variant="outline">{isHi ? pred.categoryHi : pred.category}</Badge>
                          </div>
                          <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>{isHi ? pred.predictionHi : pred.prediction}</p>
                        </div>
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

export default NadiAstrologyPage;
