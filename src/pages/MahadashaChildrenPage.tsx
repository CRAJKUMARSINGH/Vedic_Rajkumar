import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { MAHADASHA_CHILDREN } from '@/data/mahadashaChildrenData';

const MahadashaChildrenPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [expanded, setExpanded] = useState<number | null>(null);
  const isHi = lang === 'hi';

  return (
    <>
      <SEO
        title="Mahadasha Effects on Children – Parenting Guide"
        description="Understand how each Vimshottari Mahadasha affects your child's behaviour and needs. Do's and Don'ts for every planetary period based on Brihat Parasara Hora Shastra."
        keywords="mahadasha children, dasha parenting, child astrology, vimshottari dasha kids, planetary period child behaviour"
        canonical="/mahadasha-children"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👶</span>
              <div>
                <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'बच्चों पर महादशा का प्रभाव' : 'Mahadasha Effects on Children'}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi
                    ? 'बृहत् पाराशर होरा शास्त्र • अध्याय 47 • माता-पिता मार्गदर्शिका'
                    : 'Brihat Parasara Hora Shastra • Chapter 47 • Parenting Guide'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className={`text-sm text-primary underline underline-offset-2 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'होम' : 'Home'}
              </Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Intro banner */}
          <div className="bg-card border border-border rounded-xl p-5 text-center space-y-2">
            <p className={`text-sm text-muted-foreground leading-relaxed ${isHi ? 'font-hindi' : ''}`}>
              {isHi
                ? 'प्रत्येक बच्चा एक ग्रह की ऊर्जा के साथ बड़ा होता है। यह मार्गदर्शिका माता-पिता को निराशा के बजाय ज्ञान के साथ प्रतिक्रिया देने में मदद करती है।'
                : 'Every child grows up under the energy of a ruling planet. This guide helps parents respond with wisdom instead of frustration.'}
            </p>
            <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
              {isHi
                ? 'स्रोत: बृहत् पाराशर होरा शास्त्र, अध्याय 47, श्लोक 2-89 • गिरीश चंद शर्मा अनुवाद, सागर प्रकाशन'
                : 'Source: Brihat Parasara Hora Shastra, Ch. 47, Shloka 2-89 • Girish Chand Sharma translation, Sagar Publications'}
            </p>
          </div>

          {/* Dasha cards */}
          <div className="space-y-3">
            {MAHADASHA_CHILDREN.map((d, i) => {
              const isOpen = expanded === i;
              return (
                <div key={d.planet} className={`border rounded-xl overflow-hidden ${d.color}`}>
                  {/* Collapsed header — always visible */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                    onClick={() => setExpanded(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0">{d.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-foreground ${isHi ? 'font-hindi' : ''}`}>
                            {isHi ? d.planetHi : d.planet}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 text-muted-foreground border border-border/50">
                            {d.years} {isHi ? 'वर्ष' : 'yrs'}
                          </span>
                        </div>
                        <p className={`text-xs text-muted-foreground truncate ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? d.taglineHi : d.tagline}
                        </p>
                      </div>
                    </div>
                    <span className="text-muted-foreground text-lg flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className={`px-5 pb-5 space-y-4 border-t border-border/40 pt-4 ${isHi ? 'font-hindi' : ''}`}>
                      {/* Strong / Weak */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-background/60 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                            {isHi ? '✅ मजबूत ग्रह' : '✅ Strong Planet'}
                          </p>
                          <p className="text-sm text-foreground">
                            {isHi ? d.strongEffectHi : d.strongEffect}
                          </p>
                        </div>
                        <div className="bg-background/60 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                            {isHi ? '⚠️ कमजोर ग्रह' : '⚠️ Weak Planet'}
                          </p>
                          <p className="text-sm text-foreground">
                            {isHi ? d.weakEffectHi : d.weakEffect}
                          </p>
                        </div>
                      </div>

                      {/* Do Not */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                          {isHi ? '🚫 यह न करें' : '🚫 Do Not'}
                        </p>
                        <ul className="space-y-1">
                          {(isHi ? d.doNotHi : d.doNot).map((item, idx) => (
                            <li key={idx} className="text-sm text-foreground flex gap-2">
                              <span className="text-red-500 flex-shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Do This */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                          {isHi ? '✅ यह करें' : '✅ Do This'}
                        </p>
                        <ul className="space-y-1">
                          {(isHi ? d.doThisHi : d.doThis).map((item, idx) => (
                            <li key={idx} className="text-sm text-foreground flex gap-2">
                              <span className="text-green-600 flex-shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sade Sati warning box */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700 rounded-xl p-5 space-y-2">
            <p className={`font-semibold text-foreground flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
              🪐 {isHi ? 'जब साढ़े साती कठिन दशा के साथ चले' : 'When Sade Sati Runs Parallel to a Difficult Dasha'}
            </p>
            <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi
                ? 'जन्म चंद्र पर साढ़े साती + कठिन महादशा = दोगुना बोझ। शनि दशा + साढ़े साती एक साथ = बचपन का सबसे भारी समय। यह बच्चा दुर्व्यवहार नहीं कर रहा; वह अधिकतम ग्रहीय दबाव उठा रहा है।'
                : 'Sade Sati pressing the natal Moon + difficult Mahadasha = doubled weight. Saturn Dasha + Sade Sati simultaneously = the heaviest childhood possible. This child is not misbehaving; they are carrying maximum planetary pressure.'}
            </p>
            <p className={`text-sm font-medium text-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi
                ? '→ बच्चे को सबसे अधिक धैर्य और सबसे कम दबाव दें।'
                : '→ Give the child the most patience and the least pressure.'}
            </p>
          </div>

          {/* Footer note */}
          <p className={`text-center text-xs text-muted-foreground pb-4 ${isHi ? 'font-hindi' : ''}`}>
            {isHi
              ? 'ज्योतिष जो भविष्यवाणियों से परे जाकर चार्ट के साथ वास्तव में जीना सिखाता है।'
              : 'Jyotish that goes beyond predictions into how to actually live with the chart.'}
          </p>
        </main>
      </div>
    </>
  );
};

export default MahadashaChildrenPage;
