import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { generateAIReport } from '@/services/aiPredictionService';
import { answerHoraryQuestion } from '@/services/horaryAstrologyService';
import { SEO } from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldAlert, Briefcase, TrendingUp, Send, Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Lazy load chart for performance
const KundliChart = lazy(() => import('@/components/KundliChart'));

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'general' | 'health' | 'career' | 'wealth';
  showChart?: boolean;
  chartData?: BirthInput;
}

const ConsultationPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [mode, setMode] = useState<'jatak' | 'prashna'>('jatak');
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const { data: chart, isCalculating } = useChartCalculation(birthInput);
  
  const isHi = lang === 'hi';
  const hiLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';

  useEffect(() => {
    // Initial welcome message
    const welcome = isHi 
      ? "नमस्ते! मैं आपका बी.वी. रमन (B.V. Raman) पद्धति पर आधारित AI ज्योतिषी हूँ। आप 'जातक' (जन्म कुंडली) या 'प्रश्न' (समय आधारित) मोड चुनकर परामर्श शुरू कर सकते हैं।"
      : "Namaste! I am your AI Astrologer based on B.V. Raman's classical principles. You can start a consultation by choosing 'Jatak' (Birth Chart) or 'Prashna' (Time-based) mode.";
    setMessages([{ id: '1', role: 'assistant', content: welcome }]);
  }, [lang]);

  const handleSubmit = (data: { date: string; time: string; location: string }) => {
    const coords = parseCoords(data.location);
    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });
    
    const greeting = isHi 
      ? `धन्यवाद! मैंने विवरण लोड कर लिया है। अब आप मुझसे अपने स्वास्थ्य, करियर या अन्य क्षेत्रों के बारे में प्रश्न पूछ सकते हैं।`
      : `Thank you! I have loaded the details. Now you can ask me questions about your health, career, or other life areas.`;
      
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: greeting }]);
  };

  const parseCoords = (location: string) => {
    const m = location.match(/\(([^,]+),\s*([^)]+)\)/);
    if (m) { const lat = parseFloat(m[1]), lon = parseFloat(m[2]); if (!isNaN(lat) && !isNaN(lon)) return { lat, lon }; }
    return { lat: 23.0, lon: 72.0 };
  };

  const handleQuickQuestion = (q: string, type: Message['type']) => {
    if (mode === 'jatak' && (!birthInput || !chart.planetaryPositions)) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: q, type };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let answer = "";
      let showChart = false;
      let chartData: BirthInput | undefined;
      
      if (mode === 'prashna') {
        const now = new Date();
        const prashnaResult = answerHoraryQuestion(q, now);
        showChart = true;
        chartData = { 
          date: now.toISOString().split('T')[0], 
          time: now.toTimeString().split(' ')[0].substring(0, 5), 
          lat: 23.0, lon: 72.0 // Default location for prashna
        };

        answer = isHi
          ? `🔮 **प्रश्न ज्योतिष (Prashna Tantra) विश्लेषण:**\n\n**उत्तर:** ${prashnaResult.answer}\n**योग:** ${prashnaResult.yoga}\n\n**विवरण:** ${prashnaResult.explanation}\n\n**बी.वी. रमन सुझाव:** ${prashnaResult.advice}\n\n*नीचे दिए गए चार्ट में उस क्षण की ग्रह स्थिति देखें।*`
          : `🔮 **Prashna (Horary) Analysis:**\n\n**Result:** ${prashnaResult.answer}\n**Yoga:** ${prashnaResult.yoga}\n\n**Astrological Details:** ${prashnaResult.explanation}\n\n**B.V. Raman's Advice:** ${prashnaResult.advice}\n\n*See the Prasna Chart below for the exact moment of query.*`;
      } else {
        const planets = chart.planetaryPositions!.planets.map(p => ({
          name: p.name, rashiIndex: p.rashiIndex, house: p.house, degrees: p.degrees, isRetrograde: p.retrograde ?? false,
        }));
        const report = generateAIReport(planets, chart.ascendant?.ascendant.rashiIndex ?? 0);
        
        if (type === 'health') {
          answer = isHi 
            ? `🏥 **स्वास्थ्य विश्लेषण:** ${report.predictions.find(p => p.category === 'Health')?.prediction}\n\n**सुझाव:** नियमित व्यायाम और सूर्य उपासना करें क्योंकि सूर्य जीवन शक्ति का कारक है।`
            : `🏥 **Health Analysis:** ${report.predictions.find(p => p.category === 'Health')?.prediction}\n\n**Advice:** Regular exercise and Sun worship are recommended as Sun is the significator of vitality.`;
        } else if (type === 'career') {
          answer = isHi
            ? `💼 **करियर का पूर्वानुमान:** ${report.predictions.find(p => p.category === 'Career')?.prediction}\n\n**बी.वी. रमन सूत्र:** 10वें भाव के स्वामी की स्थिति सफलता की कुंजी है।`
            : `💼 **Career Forecast:** ${report.predictions.find(p => p.category === 'Career')?.prediction}\n\n**B.V. Raman Principle:** The strength of the 10th lord is the key to your professional success.`;
        } else {
          answer = isHi
            ? `🌟 **सामान्य विश्लेषण:** ${report.naturalLanguageSummary}`
            : `🌟 **General Analysis:** ${report.naturalLanguageSummary}`;
        }
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: answer, showChart, chartData };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    if (mode === 'jatak' && !birthInput) return;
    
    const q = userInput;
    setUserInput('');
    handleQuickQuestion(q, 'general');
  };

  const startPrashna = () => {
    setMode('prashna');
    setBirthInput(null);
    const greeting = isHi
      ? `प्रश्न ज्योतिष (Prashna Tantra) मोड सक्रिय है। यह प्रश्न पूछे जाने वाले समय (${new Date().toLocaleTimeString()}) के आधार पर उत्तर देता है। अपना प्रश्न पूछें।`
      : `Prashna (Horary) Mode active. This answers based on the time of the question (${new Date().toLocaleTimeString()}). Ask your question.`;
    setMessages([{ id: Date.now().toString(), role: 'assistant', content: greeting }]);
  };

  return (
    <>
      <SEO title="AI Jatak & Prashna Consultation" description="Ask specific questions about your birth chart or time of question based on B.V. Raman's principles." canonical="/consultation" />
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✨</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'ज्योतिष परामर्श' : 'AI Consultation'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'बी.वी. रमन सिद्धांतों पर आधारित' : 'Based on B.V. Raman Principles'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="flex-1 container max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 overflow-hidden">
          <div className="flex justify-center gap-4">
            <Button variant={mode === 'jatak' ? 'default' : 'outline'} size="sm" className="gap-2" onClick={() => setMode('jatak')}>
              <User className="h-4 w-4" /> {isHi ? 'जातक (Birth)' : 'Jatak (Birth)'}
            </Button>
            <Button variant={mode === 'prashna' ? 'default' : 'outline'} size="sm" className="gap-2" onClick={startPrashna}>
              <Clock className="h-4 w-4" /> {isHi ? 'प्रश्न (Horary)' : 'Prashna (Horary)'}
            </Button>
          </div>

          {!birthInput && mode === 'jatak' ? (
            <div className="max-w-2xl mx-auto w-full bg-card border rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🕉️</div>
                <h2 className="text-2xl font-bold mb-2">{isHi ? 'जातक का विवरण' : 'Jatak Details'}</h2>
                <p className="text-muted-foreground">
                  {isHi ? 'जन्म कुंडली आधारित परामर्श के लिए जातक चुनें' : 'Select a Jatak for birth-chart based consultation'}
                </p>
              </div>
              <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <Card className="flex-1 overflow-hidden flex flex-col border-primary/20 bg-card/50 backdrop-blur-sm shadow-inner">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm border ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-card border-border'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            
                            {msg.showChart && msg.chartData && (
                              <div className="mt-4 p-2 bg-white rounded-xl border shadow-md w-full max-w-sm mx-auto overflow-hidden">
                                <p className="text-[10px] text-center font-bold text-muted-foreground uppercase mb-2">Prasna Kundli (Moment of Query)</p>
                                <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs">Loading Chart...</div>}>
                                  <KundliChart 
                                    date={msg.chartData.date} 
                                    time={msg.chartData.time} 
                                    latitude={msg.chartData.lat} 
                                    longitude={msg.chartData.lon} 
                                    lang={hiLang}
                                  />
                                </Suspense>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isCalculating && (
                      <div className="flex justify-start">
                        <div className="bg-muted/50 rounded-2xl px-4 py-2 animate-pulse text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          Consulting the stars...
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border bg-muted/20">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight gap-1.5 rounded-full" onClick={() => handleQuickQuestion(isHi ? "मेरे स्वास्थ्य का पूर्वानुमान क्या है?" : "What is my health forecast?", 'health')}>
                      <Heart className="h-3 w-3 text-red-500" /> {isHi ? 'स्वास्थ्य' : 'Health'}
                    </Button>
                    <Button variant="secondary" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight gap-1.5 rounded-full" onClick={() => handleQuickQuestion(isHi ? "क्या किसी गंभीर बीमारी का खतरा है?" : "Any risk of serious disease?", 'health')}>
                      <ShieldAlert className="h-3 w-3 text-orange-500" /> {isHi ? 'गंभीर रोग' : 'Disease Risk'}
                    </Button>
                    <Button variant="secondary" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight gap-1.5 rounded-full" onClick={() => handleQuickQuestion(isHi ? "मेरा करियर भविष्य कैसा है?" : "How is my career future?", 'career')}>
                      <Briefcase className="h-3 w-3 text-blue-500" /> {isHi ? 'करियर' : 'Career'}
                    </Button>
                    <Button variant="secondary" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight gap-1.5 rounded-full" onClick={() => handleQuickQuestion(isHi ? "आर्थिक स्थिति कैसी रहेगी?" : "How will my financial status be?", 'wealth')}>
                      <TrendingUp className="h-3 w-3 text-green-500" /> {isHi ? 'धन/सम्पत्ति' : 'Wealth'}
                    </Button>
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isHi ? "अपना प्रश्न यहाँ पूछें..." : "Ask your question here..."}
                      className="flex-1 bg-muted/50 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button size="icon" className="rounded-full shadow-lg" onClick={handleSendMessage} disabled={!userInput.trim() || (mode === 'jatak' && !birthInput)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <button onClick={() => { setBirthInput(null); setMessages([]); setMode('jatak'); }} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary font-bold">
                  {isHi ? 'रीसेट / जातक बदलें (Reset / Change)' : 'Reset / Change Jatak'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ConsultationPage;
