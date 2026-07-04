// Week 68: Standalone Sade Sati Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { checkSadeSati, CURRENT_POSITIONS, getMoonRashi } from '@/data/transitData';
import { SEO } from '@/components/SEO';

const RASHI_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHI_NAMES_HI = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];

const PHASES = [
  { phase: 'Rising Phase', hi: 'उदय चरण', desc: 'Saturn enters the sign before your Moon sign. Mental unrest, travel, and changes begin.', descHi: 'शनि आपकी चंद्र राशि से पहले की राशि में प्रवेश करता है। मानसिक अशांति, यात्रा और परिवर्तन शुरू होते हैं।', intensity: 'Moderate', color: 'bg-yellow-50 border-yellow-300' },
  { phase: 'Peak Phase', hi: 'चरम चरण', desc: 'Saturn transits your Moon sign directly. Maximum challenges, health issues, and karmic lessons.', descHi: 'शनि सीधे आपकी चंद्र राशि में गोचर करता है। अधिकतम चुनौतियां, स्वास्थ्य समस्याएं और कर्मिक पाठ।', intensity: 'High', color: 'bg-red-50 border-red-300' },
  { phase: 'Setting Phase', hi: 'अस्त चरण', desc: 'Saturn moves to the sign after your Moon sign. Gradual relief, lessons learned, new beginnings.', descHi: 'शनि आपकी चंद्र राशि के बाद की राशि में जाता है। धीरे-धीरे राहत, सीखे गए पाठ, नई शुरुआत।', intensity: 'Moderate', color: 'bg-blue-50 border-blue-300' },
];

const REMEDIES = [
  { en: 'Worship Lord Shani every Saturday with sesame oil lamp', hi: 'प्रत्येक शनिवार तिल के तेल के दीपक से शनि देव की पूजा करें' },
  { en: 'Chant "Om Sham Shanicharaya Namaha" 108 times daily', hi: '"ॐ शं शनिश्चराय नमः" का 108 बार दैनिक जाप करें' },
  { en: 'Donate black sesame, mustard oil, and iron on Saturdays', hi: 'शनिवार को काले तिल, सरसों का तेल और लोहा दान करें' },
  { en: 'Feed crows and black dogs regularly', hi: 'नियमित रूप से कौवों और काले कुत्तों को खाना खिलाएं' },
  { en: 'Wear blue sapphire (Neelam) after proper consultation', hi: 'उचित परामर्श के बाद नीलम रत्न धारण करें' },
  { en: 'Visit Shani temples, especially Shani Shingnapur', hi: 'शनि मंदिरों में जाएं, विशेषकर शनि शिंगणापुर' },
  { en: 'Read Shani Chalisa and Hanuman Chalisa daily', hi: 'प्रतिदिन शनि चालीसा और हनुमान चालीसा पढ़ें' },
  { en: 'Perform Shani Shanti Puja with a qualified priest', hi: 'योग्य पुजारी के साथ शनि शांति पूजा करें' },
];

const SadeSatiPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [rawBirth, setRawBirth] = useState<{ date: string; time: string; location: string } | null>(null);
  const [moonRashi, setMoonRashi] = useState<number | null>(null);
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    setRawBirth(data);
    const idx = getMoonRashi(new Date(data.date));
    setMoonRashi(idx);
  };

  const sadeSati = moonRashi !== null ? checkSadeSati(moonRashi, CURRENT_POSITIONS.Saturn) : null;
  const saturnRashi = CURRENT_POSITIONS.Saturn;

  // Calculate which phase
  const getPhase = () => {
    if (!moonRashi) return null;
    if (saturnRashi === (moonRashi + 11) % 12) return 0; // sign before
    if (saturnRashi === moonRashi) return 1; // same sign
    if (saturnRashi === (moonRashi + 1) % 12) return 2; // sign after
    return null;
  };
  const phaseIdx = getPhase();

  // Past/future Sade Sati periods (simplified)
  const getPeriods = (rashi: number) => {
    const periods = [];
    // Saturn takes ~29.5 years per cycle, ~7.5 years per Sade Sati
    const baseYear = 2026;
    for (let i = -2; i <= 2; i++) {
      const startYear = baseYear + (i * 29.5) - 3.75;
      periods.push({
        start: Math.round(startYear),
        end: Math.round(startYear + 7.5),
        isCurrent: i === 0,
      });
    }
    return periods;
  };

  return (
    <>
      <SEO title="Sade Sati Calculator - Saturn 7.5 Year Period" description="Check if you are in Sade Sati (Saturn's 7.5 year transit). Get phase analysis, effects, and powerful remedies." keywords="sade sati, saturn transit, shani sade sati, 7.5 years saturn, shani dhaiya" canonical="/sade-sati" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🪐</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'साढ़े साती' : 'Sade Sati'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'शनि का साढ़े सात वर्षीय गोचर' : "Saturn's 7.5 Year Transit Analysis"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* What is Sade Sati */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl p-4 text-sm">
            <div className="font-semibold mb-1">🪐 {isHi ? 'साढ़े साती क्या है?' : 'What is Sade Sati?'}</div>
            <p className="text-muted-foreground text-xs">
              {isHi
                ? 'साढ़े साती तब होती है जब शनि आपकी जन्म चंद्र राशि से पहले, उसमें और बाद की राशि में गोचर करता है। यह लगभग 7.5 वर्ष तक चलती है और जीवन में महत्वपूर्ण परिवर्तन लाती है।'
                : "Sade Sati occurs when Saturn transits through the sign before, the sign of, and the sign after your natal Moon sign. It lasts ~7.5 years and brings significant life changes, karmic lessons, and transformation."}
            </p>
          </div>

          {!rawBirth ? (
            <div className="max-w-2xl mx-auto bg-card border rounded-xl p-6 shadow-sm">
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-muted">{rawBirth.date}</span>
                  <span className="px-2 py-1 rounded bg-muted">Moon: {isHi ? RASHI_NAMES_HI[moonRashi!] : RASHI_NAMES[moonRashi!]}</span>
                  <span className="px-2 py-1 rounded bg-muted">Saturn: {isHi ? RASHI_NAMES_HI[saturnRashi] : RASHI_NAMES[saturnRashi]}</span>
                </div>
                <button onClick={() => { setRawBirth(null); setMoonRashi(null); }} className="text-sm text-primary underline underline-offset-2">
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>

              {/* Status */}
              <div className={`border-2 rounded-xl p-5 ${sadeSati?.active ? 'bg-orange-50 border-orange-400' : 'bg-green-50 border-green-400'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{sadeSati?.active ? '⚠️' : '✅'}</span>
                  <div>
                    <div className={`text-xl font-bold ${sadeSati?.active ? 'text-orange-800' : 'text-green-800'}`}>
                      {sadeSati?.active
                        ? (isHi ? 'साढ़े साती सक्रिय है' : 'Sade Sati is ACTIVE')
                        : (isHi ? 'साढ़े साती नहीं है' : 'Not in Sade Sati')}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {sadeSati?.active
                        ? (isHi ? sadeSati.description.hi : sadeSati.description.en)
                        : (isHi ? 'आप अभी साढ़े साती में नहीं हैं। अगली साढ़े साती की तैयारी करें।' : 'You are not currently in Sade Sati. Prepare for the next cycle.')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase details */}
              {sadeSati?.active && phaseIdx !== null && (
                <div className={`border-2 rounded-xl p-4 ${PHASES[phaseIdx].color}`}>
                  <div className="font-semibold mb-1">{isHi ? PHASES[phaseIdx].hi : PHASES[phaseIdx].phase} — {PHASES[phaseIdx].intensity} Intensity</div>
                  <p className="text-sm">{isHi ? PHASES[phaseIdx].descHi : PHASES[phaseIdx].desc}</p>
                </div>
              )}

              {/* All 3 phases */}
              <div className="bg-card border rounded-xl p-4">
                <div className="text-sm font-medium mb-3">{isHi ? 'तीन चरण' : 'Three Phases of Sade Sati'}</div>
                <div className="space-y-2">
                  {PHASES.map((p, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${phaseIdx === i ? p.color + ' border-2' : 'border-border bg-muted/20'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{isHi ? p.hi : p.phase}</span>
                        <span className="text-xs bg-white/50 px-2 py-0.5 rounded">{p.intensity}</span>
                        {phaseIdx === i && <span className="text-xs font-bold ml-auto">← Current</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{isHi ? p.descHi : p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              {moonRashi !== null && (
                <div className="bg-card border rounded-xl p-4">
                  <div className="text-sm font-medium mb-3">{isHi ? 'साढ़े साती कालक्रम' : 'Sade Sati Timeline'}</div>
                  <div className="space-y-2">
                    {getPeriods(moonRashi).map((p, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${p.isCurrent ? 'bg-orange-100 border border-orange-300' : 'bg-muted/30'}`}>
                        <span className={p.isCurrent ? 'text-orange-600 font-bold' : 'text-muted-foreground'}>{p.start}–{p.end}</span>
                        {p.isCurrent && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Current</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remedies */}
              <div className="bg-card border rounded-xl p-4">
                <div className="text-sm font-medium mb-3">{isHi ? 'साढ़े साती उपाय' : 'Sade Sati Remedies'}</div>
                <div className="space-y-2">
                  {REMEDIES.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b last:border-0 text-sm">
                      <span className="text-primary mt-0.5">🪐</span>
                      <span className={isHi ? 'font-hindi' : ''}>{isHi ? r.hi : r.en}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default SadeSatiPage;
