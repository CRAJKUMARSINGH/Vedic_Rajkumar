/**
 * PanchangPage.tsx
 *
 * Week 5: Accessibility and loading state polish.
 *
 * Changes from legacy version:
 *  - Suspense fallback replaced with LoadingSkeleton variant="card"
 *  - Date input and city select have proper accessible labels (htmlFor + id)
 *  - aria-live="polite" on the Panchang result container
 *  - ErrorBoundary wraps PanchangCard so one crash doesn't blank the page
 *  - role="status" on Suspense fallback for screen reader announcement
 *  - Consistent design token background (bg-background)
 */

import { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import ChartErrorState from '@/components/ChartErrorState';
import ErrorBoundary from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { SEO } from '@/components/SEO';
import { ValidationInProgressNotice } from '@/components/PrototypeStatusBanner';

const PanchangCard = lazy(() => import('@/components/PanchangCard'));

const CITIES: Record<string, { lat: number; lon: number }> = {
  Delhi:     { lat: 28.61, lon: 77.23 },
  Mumbai:    { lat: 19.08, lon: 72.88 },
  Bangalore: { lat: 12.97, lon: 77.59 },
  Kolkata:   { lat: 22.57, lon: 88.36 },
  Chennai:   { lat: 13.08, lon: 80.27 },
  Hyderabad: { lat: 17.39, lon: 78.49 },
  Ahmedabad: { lat: 23.03, lon: 72.58 },
  Pune:      { lat: 18.52, lon: 73.86 },
  Jaipur:    { lat: 26.91, lon: 75.79 },
  Varanasi:  { lat: 25.32, lon: 83.01 },
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
      <SEO
        title="Daily Panchang - Hindu Almanac"
        description="Get daily Panchang with Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset and auspicious timings for any date and city."
        keywords="panchang, hindu almanac, tithi, nakshatra, yoga, karana, sunrise, sunset, auspicious time"
        canonical="/panchang"
        noIndex={true}
      />

      <div className="min-h-screen bg-background">
        {/* Page header */}
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">📆</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'पंचांग' : 'Daily Panchang'}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi
                    ? 'तिथि • नक्षत्र • योग • करण • वार'
                    : 'Tithi • Nakshatra • Yoga • Karana • Vara'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-sm text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {isHi ? 'होम' : 'Home'}
              </Link>
              <EnhancedLanguageToggle
                currentLang={lang}
                onChange={setLang}
                showRegion={false}
                autoDetect={false}
              />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="mb-6">
            <ValidationInProgressNotice isHi={isHi} compact={true} />
          </div>
          {/* Controls */}
          <section
            aria-labelledby="panchang-controls-heading"
            className="bg-card border rounded-xl p-5 space-y-4"
          >
            <h2 id="panchang-controls-heading" className="sr-only">
              {isHi ? 'पंचांग विकल्प' : 'Panchang Options'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="panchang-date">
                    {isHi ? 'तिथि' : 'Date'}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDate(new Date().toISOString().split('T')[0])}
                    className="h-7 text-[11px] gap-1.5"
                    aria-label={isHi ? 'आज की तिथि पर वापस जाएँ' : 'Reset date to today'}
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    {isHi ? 'आज' : 'Today'}
                  </Button>
                </div>
                <input
                  id="panchang-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label={isHi ? 'तिथि चुनें' : 'Select date'}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="panchang-city">
                  {isHi ? 'शहर' : 'City'}
                </Label>
                <select
                  id="panchang-city"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  aria-label={isHi ? 'शहर चुनें' : 'Select city'}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {Object.keys(CITIES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className={cn("text-[11px] text-muted-foreground mt-0.5", isHi && "font-hindi text-[12px]")}>
                  {isHi
                    ? "10 प्रमुख भारतीय शहर — सटीक सूर्योदय/सूर्यास्त के आधार पर पंचांग समय के लिए।"
                    : "10 major Indian cities preset for accurate sunrise/sunset-based Panchang timings."}
                </p>
              </div>
            </div>

            {/* Quick 5-limbs legend — reduce jargon confusion (Week 08 polish) */}
            <div className="rounded-lg border border-dashed border-muted p-3">
              <p
                className={cn(
                  "text-[11px] font-semibold text-foreground/80 uppercase tracking-wider mb-2",
                  isHi && "font-hindi normal-case tracking-normal",
                )}
              >
                {isHi ? 'पंचांग के 5 अंग — संक्षिप्त परिचय' : 'The 5 Limbs of Panchang — quick guide'}
              </p>
              <dl
                className={cn(
                  "grid grid-cols-1 sm:grid-cols-5 gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground",
                  isHi && "font-hindi text-[12px]",
                )}
              >
                <div>
                  <dt className="font-semibold text-foreground/80">Tithi · तिथि</dt>
                  <dd>{isHi ? 'सूर्य-चंद्र दूरी का 1/30 — लूनर डे' : 'Lunar day — 1/30 of Sun–Moon angle'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground/80">Vara · वार</dt>
                  <dd>{isHi ? 'सप्ताह का दिन — सूर्य से शनि' : 'Weekday — Sun through Saturn'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground/80">Nakshatra · नक्षत्र</dt>
                  <dd>{isHi ? 'चन्द्रमा के 27 स्टेलर में से एक' : 'One of 27 stellar mansions of the Moon'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground/80">Yoga · योग</dt>
                  <dd>{isHi ? 'सूर्य+चन्द्र की लंबित युति' : 'Sum of Sun + Moon longitudes'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground/80">Karana · करण</dt>
                  <dd>{isHi ? 'तिथि का आधा — 11 प्रकार' : 'Half a Tithi — 11 varieties'}</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Panchang result — aria-live so screen readers announce updates */}
          <div
            role="region"
            aria-live="polite"
            aria-atomic="false"
            aria-label={isHi ? 'पंचांग परिणाम' : 'Panchang result'}
          >
            <ErrorBoundary
              fallback={
                <ChartErrorState
                  message={
                    isHi
                      ? 'पंचांग लोड करने में त्रुटि हुई।'
                      : 'Failed to load Panchang. Please try a different date or city.'
                  }
                />
              }
            >
              <Suspense
                fallback={
                  <div
                    role="status"
                    aria-label={isHi ? 'पंचांग लोड हो रहा है…' : 'Loading Panchang…'}
                  >
                    <div className="rounded-xl border border-border overflow-hidden" aria-hidden="true">
                      {/* Header strip: title + PDF button area */}
                      <div className="h-[60px] animate-pulse rounded-t-xl border-b border-border bg-card" />
                      <div className="p-6 space-y-4">
                        {/* 3-tab TabsList strip */}
                        <div className="mx-auto w-full max-w-md h-[36px] animate-pulse rounded-md bg-muted" />
                        {/* Tithi/Nakshatra/Yoga cards grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="h-[130px] animate-pulse rounded-xl border border-border bg-card"
                            />
                          ))}
                        </div>
                        {/* Sunrise/Sunset time strip */}
                        <div className="h-[90px] animate-pulse rounded-xl border border-border bg-muted/30" />
                      </div>
                    </div>
                    <LoadingSkeleton variant="card" rows={4} className="mt-4 hidden" />
                  </div>
                }
              >
                <PanchangCard
                  date={date}
                  latitude={coords.lat}
                  longitude={coords.lon}
                  lang={hiLang}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </>
  );
};

export default PanchangPage;
