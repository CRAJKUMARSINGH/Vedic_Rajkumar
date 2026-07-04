// Week 61: Medical Astrology Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { generateMedicalReport, type MedicalAstrologyReport } from '@/services/medicalAstrologyService';
import { SEO } from '@/components/SEO';

const parseCoords = (location: string) => {
  const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
  return { lat: 23.0, lon: 72.0 };
};

const RISK_COLORS = { Low: 'bg-green-100 text-green-800', Moderate: 'bg-yellow-100 text-yellow-800', High: 'bg-red-100 text-red-800' };
const DOSHA_COLORS: Record<string, string> = { Pitta: 'text-orange-600', Vata: 'text-blue-600', Kapha: 'text-green-600' };

const MedicalAstrologyPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [report, setReport] = useState<MedicalAstrologyReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview'|'vulnerable'|'diet'|'mental'>('overview');
  const { data: chart, isCalculating } = useChartCalculation(birthInput);
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setRawBirth(data);
    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });
  };

  if (chart.planetaryPositions?.planets && !report && !isCalculating) {
    const planets = chart.planetaryPositions.planets.map(p => ({
      name: p.name, rashiIndex: p.rashiIndex, house: p.house, degrees: p.degrees, isRetrograde: p.retrograde ?? false,
    }));
    setReport(generateMedicalReport(planets, chart.ascendant?.ascendant.rashiIndex ?? 0));
  }

  return (
    <>
      <SEO title="Medical Astrology - Health Predictions & Ayurveda" description="Discover your Ayurvedic constitution, health vulnerabilities, and preventive measures through Medical Astrology." keywords="medical astrology, health astrology, ayurveda, dosha, health prediction, body constitution" canonical="/medical-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌿</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'चिकित्सा ज्योतिष' : 'Medical Astrology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'स्वास्थ्य • आयुर्वेद • दोष' : 'Health • Ayurveda • Dosha Analysis'}</p>
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
            ⚕️ <strong>Disclaimer:</strong> Medical Astrology provides complementary insights only. Always consult qualified medical professionals for health concerns.
          </div>

          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border rounded-xl p-6 shadow-sm">
              <p className="text-center text-sm text-muted-foreground mb-4">
                {isHi ? 'स्वास्थ्य विश्लेषण के लिए जन्म विवरण दर्ज करें' : 'Enter birth details for health analysis'}
              </p>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-2 py-1 rounded bg-muted text-xs">{rawBirth.date}</span>
                <button onClick={() => { setRawBirth(null); setBirthInput(null); setReport(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>

              {isCalculating && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}

              {report && (
                <>
                  {/* Constitution */}
                  <div className="bg-card border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Ayurvedic Constitution</div>
                        <div className={`text-xl font-bold ${DOSHA_COLORS[report.dominantDosha]}`}>{report.constitution}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Health Strength</div>
                        <div className={`text-2xl font-bold ${report.healthStrength >= 70 ? 'text-green-600' : report.healthStrength >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{report.healthStrength}/100</div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${report.healthStrength >= 70 ? 'bg-green-500' : report.healthStrength >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${report.healthStrength}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{report.overallHealthForecast}</p>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(['overview','vulnerable','diet','mental'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                        {tab === 'overview' ? 'Overview' : tab === 'vulnerable' ? 'Risk Areas' : tab === 'diet' ? 'Diet & Exercise' : 'Mental Health'}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'overview' && (
                    <div className="space-y-3">
                      <div className="bg-card border rounded-xl p-4">
                        <div className="text-sm font-medium mb-2">Seasonal Advice</div>
                        <p className="text-sm text-muted-foreground">{report.seasonalAdvice}</p>
                      </div>
                      {report.strongAreas.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="text-sm font-medium text-green-800 mb-2">✅ Strong Health Areas</div>
                          <ul className="text-sm text-green-700 space-y-1">
                            {report.strongAreas.map(a => <li key={a}>• {a}</li>)}
                          </ul>
                        </div>
                      )}
                      {report.criticalPlanets.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="text-sm font-medium text-red-800 mb-2">⚠️ Planets Requiring Attention</div>
                          <div className="flex flex-wrap gap-1">
                            {report.criticalPlanets.map(p => <span key={p} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">{p}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'vulnerable' && (
                    <div className="space-y-3">
                      {report.vulnerableAreas.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No significant health vulnerabilities detected</p>}
                      {report.vulnerableAreas.map((area, i) => (
                        <div key={i} className="bg-card border rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm">{area.bodyPart}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${RISK_COLORS[area.riskLevel]}`}>{area.riskLevel} Risk</span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">{area.planet} in {area.sign} (House {area.house})</div>
                          <p className="text-sm mb-3">{area.description}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs font-medium mb-1">Preventive Measures</div>
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {area.preventiveMeasures.slice(0, 2).map(m => <li key={m}>• {m}</li>)}
                              </ul>
                            </div>
                            <div>
                              <div className="text-xs font-medium mb-1">Ayurvedic Remedies</div>
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {area.ayurvedicRemedies.slice(0, 2).map(r => <li key={r}>• {r}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'diet' && (
                    <div className="space-y-3">
                      <div className="bg-card border rounded-xl p-4">
                        <div className="text-sm font-medium mb-2">Diet Recommendations ({report.dominantDosha} Constitution)</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {report.dietRecommendations.map(r => <li key={r}>• {r}</li>)}
                        </ul>
                      </div>
                      <div className="bg-card border rounded-xl p-4">
                        <div className="text-sm font-medium mb-2">Exercise Recommendations</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {report.exerciseRecommendations.map(r => <li key={r}>• {r}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'mental' && (
                    <div className="bg-card border rounded-xl p-4">
                      <div className="text-sm font-medium mb-2">Mental Health Insights</div>
                      <p className="text-sm text-muted-foreground">{report.mentalHealthInsights}</p>
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

export default MedicalAstrologyPage;
