// Week 34-35: Chinese Astrology Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { calculateChineseChart, getChineseCompatibility, ANIMALS, type ChineseChart } from '@/services/chineseAstrologyService';
import { SEO } from '@/components/SEO';

const ANIMAL_EMOJIS: Record<string, string> = {
  Rat:'🐀',Ox:'🐂',Tiger:'🐅',Rabbit:'🐇',Dragon:'🐉',Snake:'🐍',
  Horse:'🐎',Goat:'🐐',Monkey:'🐒',Rooster:'🐓',Dog:'🐕',Pig:'🐖'
};

const ChineseAstrologyPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [chart, setChart] = useState<ChineseChart | null>(null);
  const [compat1, setCompat1] = useState('Rat');
  const [compat2, setCompat2] = useState('Dragon');
  const [activeTab, setActiveTab] = useState<'chart'|'compat'|'forecast'>('chart');
  const isHi = lang === 'hi';

  const handleCalculate = () => {
    if (!birthDate) return;
    setChart(calculateChineseChart(birthDate, birthTime));
  };

  const compat = getChineseCompatibility(compat1, compat2);

  return (
    <>
      <SEO title="Chinese Astrology - Animal Signs & BaZi" description="Discover your Chinese zodiac animal sign, five elements balance, compatibility and yearly forecast." keywords="chinese astrology, chinese zodiac, animal sign, bazi, five elements, year of the dragon" canonical="/chinese-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐉</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'चीनी ज्योतिष' : 'Chinese Astrology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'पशु राशि • पंच तत्व • भविष्यफल' : 'Animal Signs • Five Elements • BaZi'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Input */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-sm">{isHi ? 'जन्म विवरण' : 'Birth Details'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'जन्म तिथि' : 'Birth Date'}</label>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'जन्म समय' : 'Birth Time'}</label>
                <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
              </div>
            </div>
            <button onClick={handleCalculate} disabled={!birthDate}
              className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium disabled:opacity-50">
              {isHi ? 'चीनी कुंडली देखें' : 'Calculate Chinese Chart'}
            </button>
          </div>

          {chart && (
            <>
              {/* Animal Sign Hero */}
              <div className="bg-card border rounded-xl p-6 text-center">
                <div className="text-6xl mb-2">{ANIMAL_EMOJIS[chart.yearSign.animal]}</div>
                <div className="text-2xl font-bold">{chart.yearSign.animalChinese} {chart.yearSign.animal}</div>
                <div className="text-sm text-muted-foreground mt-1">{chart.yearSign.element} {chart.yearSign.yin_yang} • Year {chart.yearSign.year}</div>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {chart.yearSign.traits.map(t => (
                    <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {(['chart','compat','forecast'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${activeTab === tab ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                    {tab === 'chart' ? 'Four Pillars' : tab === 'compat' ? 'Compatibility' : 'Forecast'}
                  </button>
                ))}
              </div>

              {activeTab === 'chart' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Year Pillar', sign: chart.yearSign.animal, emoji: ANIMAL_EMOJIS[chart.yearSign.animal] },
                      { label: 'Month Pillar', sign: chart.monthSign, emoji: ANIMAL_EMOJIS[chart.monthSign] },
                      { label: 'Day Pillar', sign: chart.daySign, emoji: ANIMAL_EMOJIS[chart.daySign] },
                      { label: 'Hour Pillar', sign: chart.hourSign, emoji: ANIMAL_EMOJIS[chart.hourSign] },
                    ].map(p => (
                      <div key={p.label} className="bg-card border rounded-xl p-4 text-center">
                        <div className="text-2xl">{p.emoji}</div>
                        <div className="text-xs text-muted-foreground mt-1">{p.label}</div>
                        <div className="font-semibold text-sm">{p.sign}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-card border rounded-xl p-4">
                    <h3 className="font-semibold text-sm mb-3">Five Elements Balance</h3>
                    {Object.entries(chart.fiveElements).map(([el, val]) => (
                      <div key={el} className="flex items-center gap-2 mb-2">
                        <span className="text-xs w-12 capitalize">{el}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(val * 20, 100)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-4">{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-card border rounded-xl p-4 space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Lucky Numbers: </span>{chart.yearSign.luckyNumbers.join(', ')}</div>
                    <div><span className="text-muted-foreground">Lucky Colors: </span>{chart.yearSign.luckyColors.join(', ')}</div>
                    <div><span className="text-muted-foreground">Lucky Flowers: </span>{chart.yearSign.luckyFlowers}</div>
                    <div><span className="text-muted-foreground">Life Path: </span>{chart.lifePathNumber}</div>
                  </div>

                  <div className="bg-card border rounded-xl p-4 space-y-3 text-sm">
                    <p>{chart.yearSign.description}</p>
                    <div><span className="font-medium">Career: </span>{chart.yearSign.career}</div>
                    <div><span className="font-medium">Love: </span>{chart.yearSign.love}</div>
                    <div><span className="font-medium">Health: </span>{chart.yearSign.health}</div>
                  </div>
                </div>
              )}

              {activeTab === 'compat' && (
                <div className="space-y-4">
                  <div className="bg-card border rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Check Compatibility</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ val: compat1, set: setCompat1, label: 'Sign 1' }, { val: compat2, set: setCompat2, label: 'Sign 2' }].map(({ val, set, label }) => (
                        <div key={label}>
                          <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                          <select value={val} onChange={e => set(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                            {ANIMALS.map(a => <option key={a} value={a}>{ANIMAL_EMOJIS[a]} {a}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card border rounded-xl p-5 text-center">
                    <div className="text-3xl mb-2">{ANIMAL_EMOJIS[compat1]} + {ANIMAL_EMOJIS[compat2]}</div>
                    <div className="text-2xl font-bold mb-1">{compat.score}%</div>
                    <div className="w-full bg-muted rounded-full h-3 mb-3">
                      <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${compat.score}%` }} />
                    </div>
                    <p className="text-sm text-muted-foreground">{compat.description}</p>
                  </div>
                </div>
              )}

              {activeTab === 'forecast' && (
                <div className="bg-card border rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold">2026 Year Forecast</h3>
                  <p className="text-sm text-muted-foreground">{chart.currentYearForecast}</p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[
                      { label: 'Compatible Signs', items: chart.yearSign.compatibility },
                      { label: 'Challenging Signs', items: chart.yearSign.incompatibility },
                    ].map(({ label, items }) => (
                      <div key={label} className="bg-muted rounded-lg p-3">
                        <div className="text-xs font-medium mb-2">{label}</div>
                        <div className="flex flex-wrap gap-1">
                          {items.map(a => <span key={a} className="text-sm">{ANIMAL_EMOJIS[a]} {a}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default ChineseAstrologyPage;
