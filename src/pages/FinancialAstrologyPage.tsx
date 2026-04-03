// Week 63: Financial Astrology Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { getMarketForecast, generatePersonalFinancialForecast, type FinancialPeriod, type PersonalFinancialForecast } from '@/services/financialAstrologyService';
import { SEO } from '@/components/SEO';

const parseCoords = (location: string) => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const TREND_COLORS: Record<string, string> = {
  Bullish: 'bg-green-100 text-green-800 border-green-200',
  Bearish: 'bg-red-100 text-red-800 border-red-200',
  Volatile: 'bg-orange-100 text-orange-800 border-orange-200',
  Stable: 'bg-blue-100 text-blue-800 border-blue-200',
};

const FinancialAstrologyPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [personalForecast, setPersonalForecast] = useState<PersonalFinancialForecast | null>(null);
  const [activeTab, setActiveTab] = useState<'market'|'personal'|'yogas'|'remedies'>('market');
  const { data: chart, isCalculating } = useChartCalculation(birthInput);
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const now = new Date();
  const marketForecast = getMarketForecast(now.getFullYear(), now.getMonth() + 1);

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setRawBirth(data);
    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });
  };

  if (chart.planetaryPositions?.planets && !personalForecast && !isCalculating) {
    const planets = chart.planetaryPositions.planets.map(p => ({
      name: p.name, rashiIndex: p.rashiIndex, house: p.house, degrees: p.degrees, isRetrograde: p.retrograde ?? false,
    }));
    setPersonalForecast(generatePersonalFinancialForecast(planets, chart.ascendant?.ascendant.rashiIndex ?? 0));
  }

  return (
    <>
      <SEO title="Financial Astrology - Wealth & Investment Timing" description="Get financial astrology predictions for market timing, investment periods, wealth yogas and personal financial forecast." keywords="financial astrology, wealth astrology, investment timing, stock market astrology, dhana yoga" canonical="/financial-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'वित्तीय ज्योतिष' : 'Financial Astrology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'धन योग • निवेश समय • बाजार भविष्यवाणी' : 'Wealth Yogas • Investment Timing • Market Forecast'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            📊 <strong>Disclaimer:</strong> Financial astrology is for educational purposes only. Always consult a qualified financial advisor before making investment decisions.
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(['market','personal','yogas','remedies'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                {tab === 'market' ? 'Market' : tab === 'personal' ? 'Personal' : tab === 'yogas' ? 'Yogas' : 'Remedies'}
              </button>
            ))}
          </div>

          {activeTab === 'market' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm">Market Forecast (Planetary Cycles)</h2>
              {marketForecast.map((period, i) => (
                <div key={i} className={`border rounded-xl p-4 ${TREND_COLORS[period.trend]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{period.period}</span>
                    <span className="text-xs font-medium">{period.trend} ({period.confidence}%)</span>
                  </div>
                  <p className="text-xs mb-2">{period.advice}</p>
                  <div className="flex flex-wrap gap-1">
                    {period.sectors.map(s => <span key={s} className="text-xs bg-white/50 px-2 py-0.5 rounded">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="space-y-4">
              {!rawBirth ? (
                <div className="bg-card border rounded-xl p-5">
                  <p className="text-sm text-muted-foreground mb-4 text-center">Enter birth details for personalized financial forecast</p>
                  <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-muted px-2 py-1 rounded">{rawBirth.date}</span>
                    <button onClick={() => { setRawBirth(null); setBirthInput(null); setPersonalForecast(null); }} className="text-xs text-primary underline">Change</button>
                  </div>
                  {isCalculating && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}
                  {personalForecast && (
                    <div className="space-y-3">
                      <div className="bg-card border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-xs text-muted-foreground">Wealth Score</div>
                            <div className={`text-3xl font-bold ${personalForecast.wealthScore >= 70 ? 'text-green-600' : personalForecast.wealthScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{personalForecast.wealthScore}/100</div>
                          </div>
                          <div className={`text-sm px-3 py-1 rounded-full ${personalForecast.currentPeriodTrend === 'Favorable' ? 'bg-green-100 text-green-800' : personalForecast.currentPeriodTrend === 'Mixed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {personalForecast.currentPeriodTrend}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{personalForecast.shortTermForecast}</p>
                      </div>
                      <div className="bg-card border rounded-xl p-4">
                        <div className="text-sm font-medium mb-2">Favorable Investment Sectors</div>
                        <div className="flex flex-wrap gap-1">
                          {personalForecast.favorableSectors.map(s => <span key={s} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">{s}</span>)}
                        </div>
                      </div>
                      <div className="bg-card border rounded-xl p-4">
                        <div className="text-sm font-medium mb-2">Long-term Forecast</div>
                        <p className="text-sm text-muted-foreground">{personalForecast.longTermForecast}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'yogas' && (
            <div className="space-y-3">
              {personalForecast ? (
                <>
                  <div className="bg-card border rounded-xl p-4">
                    <div className="text-sm font-medium mb-2">Wealth Yogas in Your Chart</div>
                    {personalForecast.wealthYogas.map(y => (
                      <div key={y} className="flex items-start gap-2 py-2 border-b last:border-0">
                        <span className="text-green-500">✨</span>
                        <span className="text-sm">{y}</span>
                      </div>
                    ))}
                  </div>
                  {personalForecast.financialStrengths.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="text-sm font-medium text-green-800 mb-2">Financial Strengths</div>
                      {personalForecast.financialStrengths.map(s => <div key={s} className="text-xs text-green-700">• {s}</div>)}
                    </div>
                  )}
                  {personalForecast.financialChallenges.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="text-sm font-medium text-red-800 mb-2">Financial Challenges</div>
                      {personalForecast.financialChallenges.map(c => <div key={c} className="text-xs text-red-700">• {c}</div>)}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-8">Enter birth details in the Personal tab to see your wealth yogas</p>
              )}
            </div>
          )}

          {activeTab === 'remedies' && (
            <div className="bg-card border rounded-xl p-4">
              <div className="text-sm font-medium mb-3">Financial Remedies & Wealth Practices</div>
              {(personalForecast?.remedies ?? [
                'Worship Goddess Lakshmi on Fridays',
                'Chant "Om Shreem Mahalakshmiyei Namaha" 108 times daily',
                'Donate to charity on Thursdays (Jupiter day)',
                'Keep a yellow sapphire or citrine for Jupiter strength',
                'Avoid lending money on Saturdays',
              ]).map((r, i) => (
                <div key={i} className="flex items-start gap-2 py-2 border-b last:border-0">
                  <span className="text-yellow-500">💫</span>
                  <span className="text-sm">{r}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default FinancialAstrologyPage;
