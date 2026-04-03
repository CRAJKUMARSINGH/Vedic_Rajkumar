// Week 59: Horary Astrology (Prashna Kundali) Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { answerHoraryQuestion, getHoraryCategories, type HoraryAnswer } from '@/services/horaryAstrologyService';
import { SEO } from '@/components/SEO';

const HoraryAstrologyPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<HoraryAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isHi = lang === 'hi';
  const categories = getHoraryCategories();

  const handleAsk = () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setAnswer(answerHoraryQuestion(question));
      setIsLoading(false);
    }, 1500);
  };

  const ANSWER_STYLES: Record<string, string> = {
    'Yes': 'bg-green-50 border-green-300 text-green-800',
    'No': 'bg-red-50 border-red-300 text-red-800',
    'Maybe': 'bg-yellow-50 border-yellow-300 text-yellow-800',
    'Timing needed': 'bg-blue-50 border-blue-300 text-blue-800',
  };

  const ANSWER_ICONS: Record<string, string> = { 'Yes': '✅', 'No': '❌', 'Maybe': '🤔', 'Timing needed': '⏳' };

  return (
    <>
      <SEO title="Horary Astrology - Prashna Kundali" description="Ask any question and get answers through Horary Astrology (Prashna Kundali). Get instant astrological guidance for love, career, health and more." keywords="horary astrology, prashna kundali, ask question astrology, vedic horary, prashna jyotish" canonical="/horary" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔮</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'प्रश्न कुंडली' : 'Horary Astrology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'प्रश्न पूछें और उत्तर पाएं' : 'Ask a Question • Get Cosmic Answers'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Intro */}
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="text-4xl mb-2">🌟</div>
            <h2 className="font-semibold mb-1">{isHi ? 'प्रश्न ज्योतिष' : 'Prashna Jyotish'}</h2>
            <p className="text-sm text-muted-foreground">
              {isHi ? 'जब आप कोई प्रश्न पूछते हैं, उस क्षण की ग्रह स्थिति उत्तर देती है।' : 'The planetary positions at the moment you ask a question reveal the answer. Think clearly about your question before asking.'}
            </p>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <button key={cat.value} onClick={() => setQuestion(prev => prev || `Will my ${cat.label.toLowerCase()} improve?`)}
                className="bg-card border rounded-lg p-2 text-center hover:border-primary transition-colors">
                <div className="text-xl">{cat.icon}</div>
                <div className="text-xs mt-1 text-muted-foreground">{cat.label.split(' ')[0]}</div>
              </button>
            ))}
          </div>

          {/* Question Input */}
          <div className="bg-card border rounded-xl p-5 space-y-3">
            <label className="text-sm font-medium">{isHi ? 'अपना प्रश्न लिखें' : 'Type your question'}</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={isHi ? 'उदाहरण: क्या मुझे नई नौकरी मिलेगी?' : 'e.g., Will I get a new job this year? Will my relationship improve?'}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none h-20"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{isHi ? 'प्रश्न स्पष्ट और विशिष्ट होना चाहिए' : 'Be specific and sincere with your question'}</p>
              <button onClick={handleAsk} disabled={!question.trim() || isLoading}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                {isLoading ? <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> Consulting stars...</> : (isHi ? 'उत्तर पाएं' : 'Ask the Stars')}
              </button>
            </div>
          </div>

          {/* Answer */}
          {answer && (
            <div className="space-y-4">
              <div className={`border-2 rounded-xl p-6 text-center ${ANSWER_STYLES[answer.answer]}`}>
                <div className="text-4xl mb-2">{ANSWER_ICONS[answer.answer]}</div>
                <div className="text-2xl font-bold mb-1">{answer.answer}</div>
                <div className="text-sm opacity-80">{answer.confidence}% confidence</div>
                <div className="w-full bg-white/50 rounded-full h-2 mt-3">
                  <div className="h-2 rounded-full bg-current opacity-60 transition-all" style={{ width: `${answer.confidence}%` }} />
                </div>
              </div>

              <div className="bg-card border rounded-xl p-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Question Asked</div>
                  <p className="text-sm italic">"{answer.question}"</p>
                </div>
                <div className="border-t pt-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Astrological Explanation</div>
                  <p className="text-sm">{answer.explanation}</p>
                </div>
                <div className="border-t pt-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Timing</div>
                  <p className="text-sm">⏱ {answer.timing}</p>
                </div>
                <div className="border-t pt-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Advice</div>
                  <p className="text-sm">{answer.advice}</p>
                </div>
                <div className="border-t pt-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Planetary Significators</div>
                  <div className="flex flex-wrap gap-1">
                    {answer.significators.map(s => <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded">{s}</span>)}
                  </div>
                </div>
              </div>

              <button onClick={() => { setAnswer(null); setQuestion(''); }}
                className="w-full border rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {isHi ? 'नया प्रश्न पूछें' : 'Ask Another Question'}
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default HoraryAstrologyPage;
