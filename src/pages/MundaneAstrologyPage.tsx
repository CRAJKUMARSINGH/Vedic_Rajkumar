// Week 62: Mundane Astrology Page - World Events & National Predictions
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { getPlanetaryCycles, getMundaneEvents, getNationalCharts, getCurrentPlanetaryInfluences } from '@/services/mundaneAstrologyService';
import { SEO } from '@/components/SEO';

const TYPE_COLORS: Record<string, string> = {
  Political: 'bg-red-50 border-red-200 text-red-800',
  Economic: 'bg-green-50 border-green-200 text-green-800',
  Natural: 'bg-blue-50 border-blue-200 text-blue-800',
  Social: 'bg-purple-50 border-purple-200 text-purple-800',
  Spiritual: 'bg-amber-50 border-amber-200 text-amber-800',
};

const MundaneAstrologyPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<'cycles'|'events'|'nations'|'current'>('current');
  const isHi = lang === 'hi';
  const cycles = getPlanetaryCycles();
  const events = getMundaneEvents();
  const nations = getNationalCharts();
  const influences = getCurrentPlanetaryInfluences();

  return (
    <>
      <SEO title="Mundane Astrology - World Events & Predictions" description="Mundane astrology predictions for world events, national charts, planetary cycles and global forecasts for 2026." keywords="mundane astrology, world astrology, national chart, planetary cycles, global predictions 2026" canonical="/mundane-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌐</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'मुंडेन ज्योतिष' : 'Mundane Astrology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'विश्व घटनाएं • राष्ट्रीय भविष्यवाणी' : 'World Events • National Charts • Global Forecasts'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="flex gap-1 bg-muted rounded-lg p-1 flex-wrap">
            {[
              {k:'current',l:'Current Sky',lh:'वर्तमान आकाश'},
              {k:'events',l:'2026 Events',lh:'2026 घटनाएं'},
              {k:'cycles',l:'Planetary Cycles',lh:'ग्रह चक्र'},
              {k:'nations',l:'National Charts',lh:'राष्ट्रीय कुंडली'},
            ].map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)}
                className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors min-w-[80px] ${activeTab === t.k ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                {isHi ? t.lh : t.l}
              </button>
            ))}
          </div>

          {activeTab === 'current' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground">Current Planetary Positions & Effects (2026)</h2>
              {influences.map((inf, i) => (
                <div key={i} className="bg-card border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-lg font-bold text-primary w-20">{inf.planet}</div>
                    <div className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{inf.sign}</div>
                    <div className="text-xs text-muted-foreground ml-auto">{inf.since} → {inf.until}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{inf.effect}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground">World Event Predictions 2026</h2>
              {events.map((ev, i) => (
                <div key={i} className={`border rounded-xl p-4 ${TYPE_COLORS[ev.type]}`}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-sm">{ev.period}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">{ev.type}</span>
                    <span className="text-xs ml-auto">{ev.probability}% probability</span>
                  </div>
                  <p className="text-sm mb-2">{ev.prediction}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ev.planets.map(p => <span key={p} className="text-xs bg-white/50 px-2 py-0.5 rounded">{p}</span>)}
                  </div>
                  <div className="text-xs opacity-70">Regions: {ev.regions.join(', ')}</div>
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer font-medium">Remedies</summary>
                    <ul className="mt-1 space-y-0.5">
                      {ev.remedies.map(r => <li key={r} className="text-xs">• {r}</li>)}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cycles' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground">Major Planetary Cycles</h2>
              {cycles.map((c, i) => (
                <div key={i} className="bg-card border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-primary">{c.planets}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">{c.cycle}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{c.duration}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">Current: {c.currentPhase}</div>
                  <p className="text-sm mb-2">{c.effect}</p>
                  <div className="flex flex-wrap gap-1">
                    {c.areas.map(a => <span key={a} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{a}</span>)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{c.startYear} – {c.endYear}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'nations' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground">National Horoscopes</h2>
              {nations.map((n, i) => (
                <div key={i} className="bg-card border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{n.country === 'India' ? '🇮🇳' : n.country === 'USA' ? '🇺🇸' : '🇨🇳'}</div>
                    <div>
                      <div className="font-bold">{n.country}</div>
                      <div className="text-xs text-muted-foreground">Founded: {n.foundingDate}</div>
                    </div>
                    <div className="ml-auto text-right text-xs">
                      <div>Sun: {n.sunSign}</div>
                      <div>Moon: {n.moonSign}</div>
                      <div>Asc: {n.ascendant}</div>
                    </div>
                  </div>
                  <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded mb-2 inline-block">Current Dasha: {n.currentDasha}</div>
                  <p className="text-sm text-muted-foreground mb-3">{n.forecast}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-lg p-2">
                      <div className="text-xs font-medium text-green-800 mb-1">Strengths</div>
                      {n.strengths.map(s => <div key={s} className="text-xs text-green-700">✓ {s}</div>)}
                    </div>
                    <div className="bg-red-50 rounded-lg p-2">
                      <div className="text-xs font-medium text-red-800 mb-1">Challenges</div>
                      {n.challenges.map(c => <div key={c} className="text-xs text-red-700">⚠ {c}</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MundaneAstrologyPage;
