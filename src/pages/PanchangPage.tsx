// Week 48: Standalone Panchang Page
import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { SEO } from '@/components/SEO';

const PanchangCard = lazy(() => import('@/components/PanchangCard'));

const CITIES: Record<string, { lat: number; lon: number }> = {
  'Delhi': { lat: 28.61, lon: 77.23 },
  'Mumbai': { lat: 19.08, lon: 72.88 },
  'Bangalore': { lat: 12.97, lon: 77.59 },
  'Kolkata': { lat: 22.57, lon: 88.36 },
  'Chennai': { lat: 13.08, lon: 80.27 },
  'Hyderabad': { lat: 17.39, lon: 78.49 },
  'Ahmedabad': { lat: 23.03, lon: 72.58 },
  'Pune': { lat: 18.52, lon: 73.86 },
  'Jaipur': { lat: 26.91, lon: 75.79 },
  'Varanasi': { lat: 25.32, lon: 83.01 },
};

const PanchangPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [city, setCity] = useState('Delhi');
  const [coords, setCoords] = useState(CITIES['Delhi']);
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleCityChange = (c: string) => {
    setCity(c);
    setCoords(CITIES[c]);
  };

  return (
    <>
      <SEO title="Daily Panchang - Hindu Almanac" description="Get daily Panchang with Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset and auspicious timings for any date and city." keywords="panchang, hindu almanac, tithi, nakshatra, yoga, karana, sunrise, sunset, auspicious time" canonical="/panchang" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📆</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'पंचांग' : 'Daily Panchang'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'तिथि • नक्षत्र • योग • करण • वार' : 'Tithi • Nakshatra • Yoga • Karana • Vara'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'तिथि' : 'Date'}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'शहर' : 'City'}</label>
                <select value={city} onChange={e => handleCityChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                  {Object.keys(CITIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <PanchangCard date={date} latitude={coords.lat} longitude={coords.lon} lang={hiLang} />
          </Suspense>
        </main>
      </div>
    </>
  );
};

export default PanchangPage;
