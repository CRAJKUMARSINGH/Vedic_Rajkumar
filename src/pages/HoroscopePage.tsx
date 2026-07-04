import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { SEO } from '@/components/SEO';

const HoroscopeCard = lazy(() => import('@/components/HoroscopeCard'));

const parseCoords = (location: string): { lat: number; lon: number } => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const HoroscopePage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    setRawBirth(data);
  };

  return (
    <>
      <SEO title="Daily Horoscope - Vedic Astrology Predictions" description="Get personalized daily, weekly, monthly and yearly horoscope predictions based on your Moon sign." keywords="daily horoscope, weekly horoscope, monthly horoscope, rashi bhavishya, vedic horoscope" canonical="/horoscope" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌙</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'राशिफल' : 'Horoscope'}</h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'दैनिक / साप्ताहिक / मासिक' : 'Daily / Weekly / Monthly'}</p>
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
                {isHi ? 'व्यक्तिगत राशिफल के लिए जन्म तिथि दर्ज करें' : 'Enter your birth date for personalized horoscope'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-2 py-1 rounded bg-muted text-xs">{rawBirth.date}</span>
                <button onClick={() => setRawBirth(null)} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>
              <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />}>
                <HoroscopeCard birthDate={rawBirth.date} lang={hiLang} />
              </Suspense>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default HoroscopePage;
