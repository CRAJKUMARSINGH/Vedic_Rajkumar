// Week 60: Electional Astrology Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { getEventTypes, analyzeElectionalDate, findBestDates, type ElectionalResult } from '@/services/electionalAstrologyService';
import { SEO } from '@/components/SEO';

const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const QUALITY_COLORS = { Excellent: 'bg-green-100 text-green-800 border-green-300', Good: 'bg-blue-100 text-blue-800 border-blue-300', Average: 'bg-yellow-100 text-yellow-800 border-yellow-300', Avoid: 'bg-red-100 text-red-800 border-red-300' };

const ElectionalAstrologyPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [eventType, setEventType] = useState('marriage');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nakshatra, setNakshatra] = useState('');
  const [result, setResult] = useState<ElectionalResult | null>(null);
  const [bestDates, setBestDates] = useState<ElectionalResult[]>([]);
  const [activeTab, setActiveTab] = useState<'check'|'find'>('check');
  const isHi = lang === 'hi';
  const events = getEventTypes();

  const handleCheck = () => setResult(analyzeElectionalDate(eventType, date, nakshatra || undefined));
  const handleFind = () => setBestDates(findBestDates(eventType, date, 60));

  return (
    <>
      <SEO title="Electional Astrology - Best Dates for Events" description="Find the most auspicious dates for marriage, business, travel, property purchase and more using Vedic electional astrology." keywords="electional astrology, muhurat, auspicious date, best date marriage, business muhurat" canonical="/electional-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'निर्वाचन ज्योतिष' : 'Electional Astrology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'शुभ मुहूर्त खोजें' : 'Find Auspicious Dates for Life Events'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Event type selector */}
          <div className="grid grid-cols-4 gap-2">
            {events.map(e => (
              <button key={e.key} onClick={() => setEventType(e.key)}
                className={`p-3 rounded-xl border text-center transition-colors ${eventType === e.key ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}>
                <div className="text-2xl">{e.icon}</div>
                <div className="text-xs mt-1 font-medium">{e.label}</div>
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {[{k:'check',l:'Check a Date',lh:'तिथि जांचें'},{k:'find',l:'Find Best Dates',lh:'शुभ तिथि खोजें'}].map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k as 'check'|'find')}
                className={`flex-1 py-2 text-xs rounded-md font-medium transition-colors ${activeTab === t.k ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                {isHi ? t.lh : t.l}
              </button>
            ))}
          </div>

          {activeTab === 'check' && (
            <div className="space-y-4">
              <div className="bg-card border rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'तिथि' : 'Date to Check'}</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'नक्षत्र (वैकल्पिक)' : 'Nakshatra (optional)'}</label>
                    <select value={nakshatra} onChange={e => setNakshatra(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                      <option value="">-- Select Nakshatra --</option>
                      {NAKSHATRAS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleCheck} className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium">
                  {isHi ? 'तिथि जांचें' : 'Analyze Date'}
                </button>
              </div>

              {result && (
                <div className="space-y-3">
                  <div className={`border-2 rounded-xl p-5 ${QUALITY_COLORS[result.quality]}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg">{result.quality}</div>
                      <div className="text-2xl font-bold">{result.score}/100</div>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2 mb-3">
                      <div className="h-2 rounded-full bg-current opacity-60" style={{ width: `${result.score}%` }} />
                    </div>
                    <p className="text-sm">{result.recommendation}</p>
                  </div>
                  <div className="bg-card border rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Best Time: </span><span className="font-medium">{result.bestTime}</span></div>
                    <div><span className="text-muted-foreground">Avoid: </span><span className="font-medium">{result.avoidTime}</span></div>
                  </div>
                  <div className="bg-card border rounded-xl p-4">
                    <div className="text-sm font-medium mb-2">Factors</div>
                    {result.factors.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 py-1 border-b last:border-0 text-sm">
                        <span>{f.positive ? '✅' : '⚠️'}</span>
                        <span className="flex-1">{f.factor}</span>
                        <span className="text-xs text-muted-foreground">Weight: {f.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'find' && (
            <div className="space-y-4">
              <div className="bg-card border rounded-xl p-5 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'खोज शुरू तिथि' : 'Search from Date'}</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background max-w-xs" />
                </div>
                <button onClick={handleFind} className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium">
                  {isHi ? 'अगले 60 दिनों में शुभ तिथियां खोजें' : 'Find Best Dates in Next 60 Days'}
                </button>
              </div>
              {bestDates.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Top {bestDates.length} Auspicious Dates</div>
                  {bestDates.map((r, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${QUALITY_COLORS[r.quality]}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{r.date}</div>
                          <div className="text-xs mt-0.5">{r.bestTime}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{r.score}/100</div>
                          <div className="text-xs">{r.quality}</div>
                        </div>
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

export default ElectionalAstrologyPage;
