// Week 36-40: AI Predictions Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { generateAIReport, type AIReport } from '@/services/aiPredictionService';
import { SEO } from '@/components/SEO';

const parseCoords = (location: string) => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const ScoreRing = ({ score, size = 80 }: { score: number; size?: number }) => {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" className="rotate-90" style={{ transform: `rotate(90deg) translate(0, -${size/2}px)`, fontSize: '14px', fontWeight: 'bold', fill: color }}>
      </text>
    </svg>
  );
};

const AIPredictionsPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview'|'predictions'|'insights'|'periods'>('overview');
  const { data: chart, isCalculating } = useChartCalculation(birthInput);
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setRawBirth(data);
    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });
  };

  // Generate report when chart is ready
  if (chart.planetaryPositions?.planets && !report && !isCalculating) {
    const planets = chart.planetaryPositions.planets.map(p => ({
      name: p.name, rashiIndex: p.rashiIndex, house: p.house, degrees: p.degrees, isRetrograde: p.retrograde ?? false,
    }));
    setReport(generateAIReport(planets, chart.ascendant?.ascendant.rashiIndex ?? 0));
  }

  const TYPE_COLORS = { opportunity: 'bg-green-50 border-green-200 text-green-800', challenge: 'bg-red-50 border-red-200 text-red-800', neutral: 'bg-blue-50 border-blue-200 text-blue-800' };

  return (
    <>
      <SEO title="AI Astrology Predictions - Personalized Insights" description="Get AI-powered personalized astrology predictions for career, love, health, wealth and spiritual growth based on your birth chart." keywords="ai astrology, personalized predictions, birth chart analysis, career prediction, love prediction" canonical="/ai-predictions" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'AI भविष्यवाणी' : 'AI Predictions'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'व्यक्तिगत ज्योतिष अंतर्दृष्टि' : 'Personalized Astrological Intelligence'}</p>
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
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔮</div>
                <p className="text-sm text-muted-foreground">
                  {isHi ? 'AI-संचालित व्यक्तिगत ज्योतिष भविष्यवाणी के लिए जन्म विवरण दर्ज करें' : 'Enter birth details for AI-powered personalized astrology predictions'}
                </p>
              </div>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.date}</span>
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.time}</span>
                </div>
                <button onClick={() => { setRawBirth(null); setBirthInput(null); setReport(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>

              {isCalculating && (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                  <p className="text-sm text-muted-foreground">AI analyzing your birth chart...</p>
                </div>
              )}

              {report && (
                <>
                  {/* Overall Score */}
                  <div className="bg-card border rounded-xl p-6 flex items-center gap-6">
                    <div className="relative">
                      <ScoreRing score={report.overallScore} size={90} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">{report.overallScore}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">Overall Life Score</div>
                      <p className="text-sm text-muted-foreground">{report.naturalLanguageSummary}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {report.strongestAreas.map(a => <span key={a} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{a}</span>)}
                        {report.challengeAreas.map(a => <span key={a} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{a}</span>)}
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(['overview','predictions','insights','periods'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'overview' && (
                    <div className="space-y-3">
                      <div className="bg-card border rounded-xl p-4">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Personality Profile</div>
                        <p className="text-sm">{report.personalityProfile}</p>
                      </div>
                      <div className="bg-card border rounded-xl p-4">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Life Theme</div>
                        <p className="text-sm font-medium">{report.lifeTheme}</p>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {report.predictions.map(p => (
                          <div key={p.category} className="bg-card border rounded-xl p-3 text-center">
                            <div className="text-xl mb-1">{p.icon}</div>
                            <div className="text-xs text-muted-foreground">{p.category}</div>
                            <div className={`text-sm font-bold ${p.confidence >= 70 ? 'text-green-600' : p.confidence >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{p.confidence}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'predictions' && (
                    <div className="space-y-3">
                      {report.predictions.map(p => (
                        <div key={p.category} className="bg-card border rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{p.icon}</span>
                            <span className="font-semibold">{p.title}</span>
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${p.confidence >= 70 ? 'bg-green-100 text-green-800' : p.confidence >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {p.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{p.prediction}</p>
                          <div className="text-xs text-muted-foreground mb-2">⏱ {p.timeframe}</div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {p.supportingFactors.map(f => <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded">{f}</span>)}
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="text-xs font-medium mb-1">Remedies:</div>
                            <ul className="text-xs text-muted-foreground space-y-0.5">
                              {p.remedies.map(r => <li key={r}>• {r}</li>)}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'insights' && (
                    <div className="space-y-2">
                      {report.insights.map((ins, i) => (
                        <div key={i} className={`border rounded-lg p-3 ${TYPE_COLORS[ins.type]}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{ins.type === 'opportunity' ? '✅' : ins.type === 'challenge' ? '⚠️' : 'ℹ️'}</span>
                            <span className="text-sm font-medium">{ins.planet}</span>
                            <span className="text-xs ml-auto">{ins.duration}</span>
                          </div>
                          <p className="text-xs mt-1">{ins.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'periods' && (
                    <div className="space-y-3">
                      {report.keyPeriods.map((kp, i) => (
                        <div key={i} className="bg-card border rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{['🌱','🌿','🌳'][i]}</span>
                            <div>
                              <div className="font-semibold text-sm">{kp.period}</div>
                              <div className="text-xs text-muted-foreground">{kp.theme}</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{kp.advice}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AIPredictionsPage;
