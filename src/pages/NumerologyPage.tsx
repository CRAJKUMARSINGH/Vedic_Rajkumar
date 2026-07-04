// Week 41-42: Numerology Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { calculateNumerologyProfile, type NumerologyProfile } from '@/services/numerologyService';
import { SEO } from '@/components/SEO';

const NumerologyPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'core'|'pinnacles'|'career'|'compatibility'>('core');
  const isHi = lang === 'hi';

  const handleCalculate = () => {
    if (!fullName.trim() || !birthDate) return;
    setProfile(calculateNumerologyProfile(fullName, birthDate));
  };

  const NumberBadge = ({ n, label }: { n: number; label: string }) => (
    <div className="bg-card border rounded-xl p-4 text-center">
      <div className="text-3xl font-bold text-primary">{n}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );

  return (
    <>
      <SEO title="Numerology - Life Path & Destiny Numbers" description="Calculate your Life Path, Expression, Soul Urge, and Personality numbers. Get complete numerology profile with career guidance and compatibility." keywords="numerology, life path number, destiny number, expression number, soul urge, numerology calculator" canonical="/numerology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔢</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'अंक ज्योतिष' : 'Numerology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'जीवन पथ • भाग्यांक • आत्मा संख्या' : 'Life Path • Expression • Soul Urge'}</p>
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
            <h2 className="font-semibold text-sm">{isHi ? 'अपना विवरण दर्ज करें' : 'Enter Your Details'}</h2>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'पूरा नाम (जन्म नाम)' : 'Full Name (as on birth certificate)'}</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="e.g., Rajkumar Sharma"
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'जन्म तिथि' : 'Birth Date'}</label>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <button onClick={handleCalculate} disabled={!fullName.trim() || !birthDate}
              className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium disabled:opacity-50">
              {isHi ? 'अंक ज्योतिष देखें' : 'Calculate Numerology'}
            </button>
          </div>

          {profile && (
            <>
              {/* Core Numbers */}
              <div className="grid grid-cols-4 gap-2">
                <NumberBadge n={profile.lifePathNumber} label="Life Path" />
                <NumberBadge n={profile.expressionNumber} label="Expression" />
                <NumberBadge n={profile.soulUrgeNumber} label="Soul Urge" />
                <NumberBadge n={profile.personalityNumber} label="Personality" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <NumberBadge n={profile.birthdayNumber} label="Birthday" />
                <NumberBadge n={profile.maturityNumber} label="Maturity" />
                <NumberBadge n={profile.currentYearNumber} label="Current Year" />
                <NumberBadge n={profile.currentMonthNumber} label="Current Month" />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {(['core','pinnacles','career','compatibility'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'core' && (
                <div className="space-y-3">
                  {[
                    { label: `Life Path ${profile.lifePathNumber}`, desc: profile.lifePathDescription, icon: '🛤️' },
                    { label: `Expression ${profile.expressionNumber}`, desc: profile.expressionDescription, icon: '💬' },
                    { label: `Soul Urge ${profile.soulUrgeNumber}`, desc: profile.soulUrgeDescription, icon: '💫' },
                    { label: `Personality ${profile.personalityNumber}`, desc: profile.personalityDescription, icon: '🎭' },
                  ].map(item => (
                    <div key={item.label} className="bg-card border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{item.icon}</span>
                        <span className="font-semibold text-sm">{item.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <div className="text-xs font-medium text-green-800 mb-2">Strengths</div>
                      <ul className="text-xs text-green-700 space-y-0.5">
                        {profile.strengths.map(s => <li key={s}>• {s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                      <div className="text-xs font-medium text-orange-800 mb-2">Challenges</div>
                      <ul className="text-xs text-orange-700 space-y-0.5">
                        {profile.challenges.map(c => <li key={c}>• {c}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-card border rounded-xl p-4 space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Lucky Numbers: </span>{profile.luckyNumbers.join(', ')}</div>
                    <div><span className="text-muted-foreground">Lucky Days: </span>{profile.luckyDays.join(', ')}</div>
                    <div><span className="text-muted-foreground">Lucky Colors: </span>{profile.luckyColors.join(', ')}</div>
                  </div>
                </div>
              )}

              {activeTab === 'pinnacles' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Life Pinnacles</h3>
                  {profile.pinnacles.map((p, i) => (
                    <div key={i} className="bg-card border rounded-xl p-4 flex items-start gap-3">
                      <div className="text-2xl font-bold text-primary w-10 text-center">{p.number}</div>
                      <div>
                        <div className="text-xs text-muted-foreground">{p.period}</div>
                        <div className="text-sm font-medium">{p.theme}</div>
                      </div>
                    </div>
                  ))}
                  <h3 className="font-semibold text-sm mt-4">Life Challenges</h3>
                  {profile.challenges_periods.map((c, i) => (
                    <div key={i} className="bg-card border rounded-xl p-4 flex items-start gap-3">
                      <div className="text-2xl font-bold text-orange-500 w-10 text-center">{c.number}</div>
                      <div>
                        <div className="text-xs text-muted-foreground">{c.period}</div>
                        <div className="text-sm">{c.lesson}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'career' && (
                <div className="bg-card border rounded-xl p-4">
                  <div className="text-sm font-medium mb-3">Career Suggestions for Life Path {profile.lifePathNumber}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {profile.careerSuggestions.map(c => (
                      <div key={c} className="bg-muted rounded-lg px-3 py-2 text-sm">💼 {c}</div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'compatibility' && (
                <div className="bg-card border rounded-xl p-4">
                  <div className="text-sm font-medium mb-3">Compatible Life Path Numbers</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.compatibleNumbers.map(n => (
                      <div key={n} className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">{n}</div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">These numbers tend to harmonize well with your Life Path {profile.lifePathNumber} energy in relationships and partnerships.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default NumerologyPage;
