import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Star, 
  TrendingUp, 
  Shield, 
  BookOpen, 
  ChevronRight, 
  Sparkles, 
  History, 
  LayoutDashboard,
  Zap,
  MessageSquareQuote,
  Calendar,
  Heart
} from "lucide-react";

import EnhancedBirthInputForm from '@/components/EnhancedBirthInputForm';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import UserProfileDialog from '@/components/UserProfileDialog';
import WelcomeModal from '@/components/WelcomeModal';
import UpgradeBanner from '@/components/UpgradeBanner';
import { MuhurtaFinderPanel } from '@/components/MuhurtaFinderPanel';
import { MTSSPanel } from '@/components/MTSSPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  calculateTransits,
  getMoonRashi,
  checkSadeSati,
  type TransitResult,
  type SadeSatiInfo,
} from '@/data/transitData';
import { calculateDynamicTransits } from "@/services/dynamicTransitService";
import { saveReading, getReadings, type SavedReading } from '@/services/readingService';
import { addBirthDetails, getLastUsedProfile, shouldAutoLoad } from '@/services/userProfileService';
import { hasSeenWelcome, isPro, getSubscription } from "@/services/subscriptionService";
import {
  getMoonSign,
  getSunSign,
  calculateAllPlanetaryStrengths,
  type PlanetaryStrength,
} from '@/services/rashiService';
import { calculateKundli, type KundliData } from '@/services/kundliService';
import {
  generateComprehensiveHoroscope,
  type ComprehensiveHoroscope,
} from '@/services/horoscopeService';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { cacheService } from '@/services/cacheService';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { useToast } from '@/hooks/use-toast';
import { useChartCalculation, type BirthInput } from '@/hooks/useChartCalculation';
import { SEO, webAppSchema } from '@/components/SEO';
import RandomQuestionCard from '@/components/RandomQuestionCard';
import { generateEnhancedClassicalAnswer, type EnhancedClassicalAnswer } from '@/services/classicalAnswerEngine';
import EnhancedAnalysisPanel from '@/components/EnhancedAnalysisPanel';

import AstrologyLibraryPanel from "@/components/AstrologyLibraryPanel";

// Lazy load heavy components
const TransitTable = lazy(() => import('@/components/TransitTable'));
const VisualTransitChart = lazy(() => import('@/components/VisualTransitChart'));
const AscendantNakshatraCard = lazy(() => import('@/components/AscendantNakshatraCard'));
const PlanetaryPositionsCard = lazy(() => import('@/components/PlanetaryPositionsCard'));
const PlanetaryAspectsCard = lazy(() => import('@/components/PlanetaryAspectsCard'));
const ManglikDoshaCard = lazy(() => import('@/components/ManglikDoshaCard'));
const RashiSunSignCard = lazy(() => import('@/components/RashiSunSignCard'));
const ReadingHistory = lazy(() => import('@/components/ReadingHistory'));
const PerformanceMonitor = lazy(() => import('@/components/PerformanceMonitor'));
const BreadcrumbNavigation = lazy(() => import('@/components/BreadcrumbNavigation'));
const KeyboardShortcuts = lazy(() => import('@/components/KeyboardShortcuts'));
const MobileNavigation = lazy(() => import('@/components/MobileNavigation'));
const KundliChart = lazy(() => import('@/components/KundliChart'));
const HoroscopeCard = lazy(() => import('@/components/HoroscopeCard'));
const AdvancedAstrologyCard = lazy(() => import('@/components/AdvancedAstrologyCard'));
const PanchangCard = lazy(() => import('@/components/PanchangCard'));
const FeedbackWidget = lazy(() => import('@/components/FeedbackWidget'));
const DarkModeToggle = lazy(() => import('@/components/DarkModeToggle'));
const DashaTransitPanel = lazy(() => import('@/components/DashaTransitPanel'));
const YogaCard = lazy(() => import('@/components/YogaCard'));
const AshtakavargaCard = lazy(() => import('@/components/AshtakavargaCard'));
const ShadabalaCard = lazy(() => import('@/components/ShadabalaCard'));
const DivisionalChartsCard = lazy(() => import('@/components/DivisionalChartsCard'));
const JaiminiCard = lazy(() => import('@/components/JaiminiCard'));
const TajikCard = lazy(() => import('@/components/TajikCard'));

const QUICK_LINKS = [
  { href: "/matchmaking", label: "Match Making", labelHi: "कुंडली मिलान", icon: "❤️" },
  { href: "/marriage", label: "Vedic Marriage", labelHi: "वैदिक विवाह", icon: "💍" },
  { href: "/nakshatra-precautions", label: "Precautions", labelHi: "सावधानी", icon: "⚠️" },
  { href: "/dasha", label: "Dasha", labelHi: "दशा", icon: "⏳" },
  { href: "/career-astrology", label: "Career", labelHi: "करियर", icon: "💼" },
  { href: "/remedies", label: "Remedies", labelHi: "उपाय", icon: "🌹" },
  { href: "/horoscope", label: "Horoscope", labelHi: "राशिफल", icon: "♈" },
  { href: "/yogas", label: "Yogas", labelHi: "योग", icon: "🧘" },
  { href: "/lal-kitab", label: "Lal Kitab", labelHi: "लाल किताब", icon: "📖" },
  { href: "/kp-system", label: "KP System", labelHi: "केपी", icon: "🔍" },
  { href: "/jaimini", label: "Jaimini", labelHi: "जैमिनी", icon: "🏺" },
  { href: "/vaastu", label: "Vaastu", labelHi: "वास्तु", icon: "🏠" },
  { href: "/ai-predictions", label: "AI Prediction", labelHi: "एआई भविष्य", icon: "🤖" },
  { href: "/numerology", label: "Numerology", labelHi: "अंक ज्योतिष", icon: "🔢" },
  { href: "/financial-astrology", label: "Financial", labelHi: "वित्तीय", icon: "💰" },
  { href: "/medical-astrology", label: "Medical", labelHi: "चिकित्सा", icon: "🏥" },
  { href: "/horary", label: "Horary", labelHi: "प्रश्न", icon: "🔮" },
  { href: "/panchang", label: "Panchang", labelHi: "पंचांग", icon: "📅" },
  { href: "/sade-sati", label: "Sade Sati", labelHi: "साढ़े साती", icon: "🪐" },
  { href: "/ashtakavarga", label: "Ashtakavarga", labelHi: "अष्टकवर्ग", icon: "🎯" },
  { href: "/gemstones", label: "Gemstones", labelHi: "रत्न", icon: "💎" },
  { href: "/western-astrology", label: "Western", labelHi: "पाश्चात्य", icon: "🌟" },
  { href: "/chinese-astrology", label: "Chinese", labelHi: "चीनी", icon: "🐉" },
  { href: "/learn", label: "Learn", labelHi: "सीखें", icon: "📚" },
];

const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const parseCoordinates = (location: string): { lat: number; lon: number } => {
  const coordMatch = location.match(/\(([^,]+),\s*([^)]+)\)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  }
  const cityDefaults: Record<string, { lat: number; lon: number }> = {
    delhi: { lat: 28.61, lon: 77.23 }, mumbai: { lat: 19.08, lon: 72.88 },
    bangalore: { lat: 12.97, lon: 77.59 }, kolkata: { lat: 22.57, lon: 88.36 },
    chennai: { lat: 13.08, lon: 80.27 }, hyderabad: { lat: 17.39, lon: 78.49 },
    ahmedabad: { lat: 23.03, lon: 72.58 }, pune: { lat: 18.52, lon: 73.86 },
    jaipur: { lat: 26.91, lon: 75.79 }, indore: { lat: 22.72, lon: 75.86 },
    dungarpur: { lat: 23.84, lon: 73.71 }, banswara: { lat: 23.54, lon: 74.44 },
    nandli: { lat: 23.55, lon: 74.08 }, aspur: { lat: 23.84, lon: 73.71 },
    idar: { lat: 23.84, lon: 73.01 },
  };
  const key = location.toLowerCase().split("(")[0].trim();
  return cityDefaults[key] ?? { lat: 23.0, lon: 72.0 };
};

const Index = () => {
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [rawBirthData, setRawBirthData] = useState<{ date: string; time: string; location: string; name?: string } | null>(null);
  // Honour ?tab=xxx deep links from the landing page
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') ?? "overview");
  const [transitDate, setTransitDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [results, setResults] = useState<TransitResult[] | null>(null);
  const [moonRashiIndex, setMoonRashiIndex] = useState(3);
  const [sadeSatiInfo, setSadeSatiInfo] = useState<SadeSatiInfo | null>(null);
  const [pastReadings, setPastReadings] = useState<SavedReading[]>([]);
  const [saving, setSaving] = useState(false);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => !hasSeenWelcome());

  const { toast } = useToast();
  const { data: chart, isCalculating } = useChartCalculation(birthInput);

  const accurateMoonLongitude = chart?.planetaryPositions?.moon
    ? (chart.planetaryPositions.moon.sidereal || (chart.planetaryPositions.moon.rashi * 30 + chart.planetaryPositions.moon.degrees))
    : undefined;

  // Hook for 13-layer subjective analysis engine (migrated to EnhancedClassicalAnswer)
  const [subjectiveReading, setSubjectiveReading] = useState<EnhancedClassicalAnswer | null>(null);

  useEffect(() => {
    if (!rawBirthData) return;
    
    const fetchSubjective = async () => {
      try {
        const qDate = rawBirthData.date || '2026-05-19';
        const qTime = rawBirthData.time || '12:00';
        const coords = parseCoordinates(rawBirthData.location);
        
        const ans = await generateEnhancedClassicalAnswer({
          question: 'What does my birth chart show about my overall life theme and career path?',
          verdict: { outcome: 'favorable', score: 85 },
          horaLord: 'Jupiter', 
          moonRashi: 0,
          prashnaLagna: 0,
          direction: 'N',
          isHi: lang === 'hi',
          questionTime: new Date(`${qDate}T${qTime}:00`),
          lat: coords.lat,
          lon: coords.lon
        });
        setSubjectiveReading(ans);
      } catch (err) {
        console.error("Failed to generate natal subjective reading", err);
      }
    };
    fetchSubjective();
  }, [rawBirthData, lang]);

  const isHi = lang === "hi";
  const hiLang = (lang === "hi" ? "hi" : "en") as "en" | "hi";
  const proActive = isPro();
  const sub = getSubscription();

  // Performance monitoring
  useEffect(() => {
    performanceMonitor.startMonitoring((report) => {
      if (report.score < 70) console.warn("Performance:", report.recommendations);
    });
    return () => performanceMonitor.stopMonitoring();
  }, []);

  // Auto-load last profile
  useEffect(() => {
    if (!autoLoadAttempted && !rawBirthData && shouldAutoLoad()) {
      const last = getLastUsedProfile();
      if (last) {
        setAutoLoadAttempted(true);
        handleSubmit({
          date: last.date,
          time: last.time,
          location: last.location,
          name: last.name || ""
        });
        toast({
          title: isHi ? "✓ स्वागत वापस!" : "✓ Welcome Back!",
          description: isHi
            ? `अंतिम प्रोफाईल: ${last.name || last.location}`
            : `Last profile: ${last.name || last.location}`,
        });
      }
    }
  }, [autoLoadAttempted, rawBirthData]);

  const handleSubmit = useCallback(async (data: { date: string; time: string; location: string; name?: string }) => {
    const coords = parseCoordinates(data.location);
    setRawBirthData(data);
    addBirthDetails(data);

    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });

    const birthDate = new Date(data.date);
    const moonIdx = getMoonRashi(birthDate);
    setMoonRashiIndex(moonIdx);
    setActiveTab("overview");

    // Transit calculations
    const transitCacheKey = `transits_${moonIdx}_${transitDate}`;
    const cachedTransits = await cacheService.get(transitCacheKey);
    
    if (cachedTransits) {
      setResults((cachedTransits as any).results);
      setSadeSatiInfo((cachedTransits as any).sadeSati);
    } else {
      // Use Swiss Ephemeris via dynamicTransitService for real-time accuracy
      const transitDateObj = new Date(transitDate + 'T12:00:00');
      const dynamicOutput = await calculateDynamicTransits({
        moonRashiIndex: moonIdx,
        date: transitDateObj,
        time: '12:00',
      });
      const transitResults = dynamicOutput.transits;
      const sadeSati = checkSadeSati(moonIdx, dynamicOutput.planetPositions['Saturn'] ?? 0);

      setResults(transitResults);
      setSadeSatiInfo(sadeSati);
      await cacheService.set(transitCacheKey, { results: transitResults, sadeSati }, 5 * 60 * 1000);
    }

    setSaving(true);
    await saveReading({
      birth_date: data.date, birth_time: data.time, birth_location: data.location,
      moon_rashi_index: moonIdx, transit_date: transitDate,
      overall_score: 0, results: [],
    });
    setSaving(false);

    const past = await getReadings(data.date, data.location);
    setPastReadings(past);
    
    toast({ title: isHi ? "✓ कुंडली तैयार है" : "✓ Chart Calculated Successfully" });
  }, [transitDate, isHi, toast]);

  const handleReset = () => {
    setResults(null); setRawBirthData(null); setBirthInput(null);
    setPastReadings([]); setActiveTab("overview");
  };

  return (
    <>
      <SEO
        title={isHi ? "वैदिक राजकुमार - ज्योतिष और गोचर" : "Vedic Rajkumar - Astrology & Transit"}
        description="Accurate Kundli, transit predictions (Gochar Phal), matchmaking, career guidance, Dasha, and more. Bilingual Hindi/English."
        keywords="vedic astrology, gochar phal, kundli, transit calculator, dasha, jyotish, free horoscope"
        canonical="/"
        structuredData={webAppSchema}
      />
      
    <div className="min-h-screen bg-auspicious-pattern text-foreground font-body antialiased selection:bg-primary/20">
        <WelcomeModal open={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} isHi={isHi} />
        <UpgradeBanner isHi={isHi} />


        {/* Hero Section (Auspicious Design - Enhanced with Hindi Bill Note Colors) */}
        {!rawBirthData && (
          <section className="relative overflow-hidden border-b border-[hsl(var(--auspicious-accent)/0.5)] bg-gradient-to-br from-[#8B0000] via-[#A52A2A] via-[#C05000] to-[#8B4513] pt-16 pb-24">
            {/* Sacred mandala background pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ 
                   backgroundImage: `
                     radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
                     radial-gradient(circle at 80% 20%, rgba(255, 140, 0, 0.1) 0%, transparent 50%),
                     radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 60%),
                     radial-gradient(#FFF 1px, transparent 0)
                   `, 
                   backgroundSize: '100% 100%, 100% 100%, 100% 100%, 40px 40px' 
                 }} />
            
            {/* Floating auspicious symbols */}
            <div className="absolute top-20 left-10 text-6xl opacity-10 animate-[float-auspicious_6s_ease-in-out_infinite]">🪔</div>
            <div className="absolute top-40 right-20 text-5xl opacity-10 animate-[float-auspicious_8s_ease-in-out_infinite_1s]">🕉️</div>
            <div className="absolute bottom-32 left-20 text-4xl opacity-10 animate-[float-auspicious_7s_ease-in-out_infinite_2s]">✨</div>
            <div className="absolute top-60 right-10 text-5xl opacity-10 animate-[float-auspicious_9s_ease-in-out_infinite_3s]">🌟</div>
            
            <div className="max-w-5xl mx-auto px-4 text-center space-y-12 relative z-10">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-6">
                  <Sparkles className="w-3 h-3" /> {isHi ? "शुभ ज्योतिष" : "Auspicious Astrology"}
                </div>
                <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight drop-shadow-lg">
                  {isHi ? "ईश्वरीय बुद्धि," : "Divine Intelligence,"} <br />
                  <span className="text-[hsl(var(--auspicious-accent))] italic flex items-center justify-center gap-3">
                    <span className="text-xl opacity-50">✦</span>
                    {isHi ? "प्राचीन ज्ञान" : "Ancient Wisdom"}
                    <span className="text-xl opacity-50">✦</span>
                  </span>
                </h2>
                <p className="text-white/80 text-base max-w-2xl mx-auto font-medium leading-relaxed">
                  {isHi 
                    ? "त्वरित मार्गदर्शन के लिए प्रश्न एआई से परामर्श करें, अपनी कुंडली देखें, या शाश्वत ज्ञान कोष में गहराई से उतरें।"
                    : "Consult the Prashna AI for immediate guidance, explore your horoscope, or delve into the Eternal Knowledge base."}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
                {/* Prashna AI Card - Vermilion Theme */}
                <div className="auspicious-card group hover:scale-[1.02] transition-all cursor-default bg-white/95 backdrop-blur-sm border-2 border-[hsl(var(--auspicious-vermilion)/0.3)]">
                  <div className="auspicious-header bg-gradient-to-r from-[#8B0000] via-[#C05000] to-[#E34234]">
                    <div className="flex items-center gap-2">
                      <MessageSquareQuote className="h-5 w-5" />
                      <span className="font-bold tracking-wide">{isHi ? "प्रश्न एआई" : "Prashna AI"}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="py-6 space-y-6">
                    <p className="text-sm text-[#3E2723]/80 font-medium leading-relaxed">
                      {isHi 
                        ? "कोई भी प्रश्न पूछें और शास्त्रीय ग्रंथों के आधार पर तत्काल होरारी विश्लेषण प्राप्त करें।"
                        : "Ask any question and receive instant horary analysis based on classical texts."}
                    </p>
                    <div className="flex gap-3">
                      <Button asChild className="flex-1 bg-gradient-to-r from-[#E65100] to-[#E34234] hover:from-[#D84315] hover:to-[#C73E2E] shadow-lg shadow-[hsl(var(--auspicious-vermilion)/0.3)] border-b-4 border-[#8B4513] transition-all active:border-b-0 active:translate-y-1">
                        <Link to="/question">{isHi ? "अभी पूछें" : "Ask Now"}</Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1 border-[hsl(var(--auspicious-gold))] text-[#8B4513] hover:bg-[hsl(var(--auspicious-gold)/0.1)]">
                        <Link to="/prashna/history">{isHi ? "इतिहास" : "History"}</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Eternal Knowledge Card - Emerald Theme */}
                <div className="auspicious-card group hover:scale-[1.02] transition-all cursor-default bg-white/95 backdrop-blur-sm border-2 border-[hsl(var(--auspicious-emerald)/0.3)]">
                  <div className="auspicious-header bg-gradient-to-r from-[#2E8B57] via-[#3D9970] to-[#2ECC71]">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      <span className="font-bold tracking-wide">{isHi ? "शाश्वत ज्ञान" : "Eternal Knowledge"}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="py-6 space-y-6">
                    <p className="text-sm text-[#3E2723]/80 font-medium leading-relaxed">
                      {isHi 
                        ? "हमारे एआई को शक्ति प्रदान करने वाले शास्त्रीय वैदिक ग्रंथों के विशाल पुस्तकालय तक पहुंचें।"
                        : "Access a vast, structured library of classical Vedic texts powering our AI."}
                    </p>
                    <Button asChild className="w-full bg-gradient-to-r from-[#2E8B57] to-[#2ECC71] hover:from-[#276749] hover:to-[#27AE60] shadow-lg shadow-[hsl(var(--auspicious-emerald)/0.3)] border-b-4 border-[#1E5F3E] transition-all active:border-b-0 active:translate-y-1 text-white">
                      <Link to="/knowledge">{isHi ? "पुस्तकालय" : "Browse Library"}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="sacred-divider">
              <span className="text-2xl animate-glow-pulse">🪔</span>
            </div>
          </section>
        )}

        <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
          <AstrologyLibraryPanel isHi={isHi} />
          
          <RandomQuestionCard lang={hiLang} />
          
          {/* Quick feature links */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {QUICK_LINKS.map((l, i) => (
              <motion.div key={l.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={l.href}>
                  <Button variant="outline" className="w-full h-auto flex-col py-3 px-2 gap-1 text-center border-primary/10 hover:border-primary/40 hover:bg-primary/5 group">
                    <span className="text-xl">{l.icon}</span>
                    <span className={`text-[10px] leading-tight font-medium ${isHi ? "font-hindi" : ""}`}>{isHi ? l.labelHi : l.label}</span>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
                <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} showAutoSave={true} />
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-2">
              {!rawBirthData ? (
                <div className="h-full flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border rounded-xl bg-card/30">
                  <div className="text-6xl mb-6 opacity-20">♈ ♌ ♐</div>
                  <p className="text-muted-foreground text-sm font-medium">Enter birth details to generate your Vedic chart</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Results Header */}
                  <Card className="glass-card border-primary/30 overflow-hidden shadow-md">
                    <CardHeader className="bg-primary/5 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-serif font-bold text-primary text-xl">
                            {rawBirthData?.name || (isHi ? "आपकी कुंडली" : "Your Chart")}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rawBirthData?.date} • {rawBirthData?.time} • {rawBirthData?.location}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-primary/20 text-primary border-primary/30 h-6">
                            {isHi ? "लग्न: " : "Asc: "} {chart.ascendant?.ascendant.rashiName}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={handleReset} className="h-6 w-6">✕</Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-10 h-auto p-1 bg-muted/50 border border-border/50 rounded-lg">
                      <TabsTrigger value="overview" className="text-[10px] py-2.5 flex flex-col gap-1"><LayoutDashboard className="h-3.5 w-3.5" /> Overview</TabsTrigger>
                      <TabsTrigger value="kundli" className="text-[10px] py-2.5 flex flex-col gap-1"><Star className="h-3.5 w-3.5" /> Kundli</TabsTrigger>
                      <TabsTrigger value="transit" className="text-[10px] py-2.5 flex flex-col gap-1"><TrendingUp className="h-3.5 w-3.5" /> Transit</TabsTrigger>
                      <TabsTrigger value="dasha" className="text-[10px] py-2.5 flex flex-col gap-1"><History className="h-3.5 w-3.5" /> Dasha</TabsTrigger>
                      <TabsTrigger value="yogas" className="text-[10px] py-2.5 flex flex-col gap-1"><Shield className="h-3.5 w-3.5" /> Yogas</TabsTrigger>
                      <TabsTrigger value="advanced" className="text-[10px] py-2.5 flex flex-col gap-1"><Sparkles className="h-3.5 w-3.5" /> Advanced</TabsTrigger>
                      <TabsTrigger value="tajik" className="text-[10px] py-2.5 flex flex-col gap-1"><Zap className="h-3.5 w-3.5" /> Tajik</TabsTrigger>
                      <TabsTrigger value="subjective" className="text-[10px] py-2.5 flex flex-col gap-1"><Sparkles className="h-3.5 w-3.5 text-indigo-500" /> {isHi ? 'गहन फलादेश' : 'Deep Reading'}</TabsTrigger>
                      <TabsTrigger value="muhurta" className="text-[10px] py-2.5 flex flex-col gap-1"><Calendar className="h-3.5 w-3.5 text-amber-500" /> {isHi ? 'मुहूर्त' : 'Muhurta'}</TabsTrigger>
                      <TabsTrigger value="mtss" className="text-[10px] py-2.5 flex flex-col gap-1"><Heart className="h-3.5 w-3.5 text-pink-500" /> {isHi ? 'विवाह (MTSS)' : 'Marriage'}</TabsTrigger>
                    </TabsList>

                    <Suspense fallback={<ComponentLoader />}>
                      <TabsContent value="overview" className="space-y-6 mt-6">
                        {/* Sade Sati Alert */}
                        {sadeSatiInfo?.active && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500 rounded-xl p-5 shadow-lg shadow-orange-500/10"
                          >
                            <div className="flex items-start gap-4">
                              <span className="text-3xl">🪐</span>
                              <div className="flex-1">
                                <h3 className={`font-bold text-orange-900 dark:text-orange-100 text-lg mb-1 ${isHi ? "font-hindi" : ""}`}>
                                  {isHi ? "साढ़े साती सक्रिय!" : "Sade Sati Active!"}
                                </h3>
                                <p className={`text-sm text-orange-800 dark:text-orange-200 mb-3 ${isHi ? "font-hindi" : ""}`}>
                                  {isHi ? sadeSatiInfo.description.hi : sadeSatiInfo.description.en}
                                </p>
                                <div className="flex gap-4">
                                  <Link to="/sade-sati" className="text-sm font-bold text-orange-600 hover:underline">
                                    {isHi ? "विस्तृत विश्लेषण" : "Detailed Analysis"} →
                                  </Link>
                                  <details className="text-sm inline-block">
                                    <summary className={`cursor-pointer text-orange-700 dark:text-orange-300 font-semibold ${isHi ? "font-hindi" : ""}`}>
                                      {isHi ? "त्वरित उपाय" : "Quick Remedies"}
                                    </summary>
                                    <ul className={`mt-2 list-disc list-inside space-y-1 text-orange-800 dark:text-orange-200 ${isHi ? "font-hindi" : ""}`}>
                                      {(isHi ? sadeSatiInfo.remedies.hi : sadeSatiInfo.remedies.en).map((remedy, idx) => (
                                        <li key={idx}>{remedy}</li>
                                      ))}
                                    </ul>
                                  </details>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                          <AscendantNakshatraCard ascendant={chart.ascendant?.ascendant} nakshatra={chart.nakshatra} lang={hiLang} />
                          <RashiSunSignCard moonRashi={chart.planetaryPositions?.moon} sunSign={chart.planetaryPositions?.sun} lang={hiLang} />
                        </div>
                        <HoroscopeCard birthDate={rawBirthData?.date || ""} lang={hiLang} />
                        {/* Manglik Dosha — wired via /app?tab=overview deep link */}
                        {chart.manglik && (
                          <ManglikDoshaCard manglikData={chart.manglik} lang={hiLang} />
                        )}
                      </TabsContent>

                      <TabsContent value="kundli" className="mt-6">
                        <div className="grid lg:grid-cols-2 gap-6">
                          <Card className="p-4 flex justify-center bg-card"><KundliChart date={rawBirthData.date} time={rawBirthData.time} latitude={parseCoordinates(rawBirthData.location).lat} longitude={parseCoordinates(rawBirthData.location).lon} lang={hiLang} /></Card>
                          <PlanetaryPositionsCard positions={chart.planetaryPositions} lang={hiLang} />
                        </div>
                      </TabsContent>

                      <TabsContent value="transit" className="mt-6 space-y-6">
                        <div className="max-w-md mx-auto bg-card border border-border rounded-lg p-4 flex gap-2">
                          <Input type="date" value={transitDate} onChange={e => setTransitDate(e.target.value)} className="flex-1" />
                          <Button size="sm" onClick={() => handleSubmit(rawBirthData!)}>Update</Button>
                        </div>
                        <VisualTransitChart results={results || []} moonRashiIndex={moonRashiIndex} lang={hiLang} />
                        <TransitTable results={results || []} lang={hiLang} moonRashiIndex={moonRashiIndex} birthData={rawBirthData} transitDate={transitDate} />
                      </TabsContent>

                      <TabsContent value="dasha" className="mt-6">
                        <DashaTransitPanel
                          birthDate={rawBirthData.date}
                          birthTime={rawBirthData.time}
                          lang={hiLang}
                          moonRashiIndex={moonRashiIndex}
                          transitResults={results || []}
                          transitDate={transitDate}
                          rawBirthData={rawBirthData}
                          accurateMoonLongitude={accurateMoonLongitude}
                        />
                      </TabsContent>

                      <TabsContent value="yogas" className="mt-6">
                        <YogaCard planets={chart.planetaryPositions?.planets || []} ascendantRashi={chart.ascendant?.ascendant.rashiIndex || 0} lang={hiLang} />
                      </TabsContent>

                      <TabsContent value="advanced" className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <ShadabalaCard planets={chart.planetaryPositions?.planets || []} lang={hiLang} />
                          <AshtakavargaCard planetRashis={Object.fromEntries(chart.planetaryPositions?.planets.map(p => [p.name, p.rashiIndex]) || [])} ascendantRashi={chart.ascendant?.ascendant.rashiIndex || 0} lang={hiLang} />
                        </div>
                        <DivisionalChartsCard planetLongitudes={Object.fromEntries(chart.planetaryPositions?.planets.map(p => [p.name, p.rashiIndex * 30 + p.degrees]) || [])} ascendantLongitude={(chart.ascendant?.ascendant.rashiIndex || 0) * 30 + (chart.ascendant?.ascendant.degrees || 0)} lang={hiLang} />
                      </TabsContent>

                      <TabsContent value="tajik" className="mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <TajikCard birthDate={rawBirthData.date} planetaryPositions={chart.planetaryPositions?.planets || []} lang={hiLang} />
                          <JaiminiCard planetaryPositions={chart.planetaryPositions?.planets || []} lang={hiLang} />
                        </div>
                      </TabsContent>

                      <TabsContent value="subjective" className="mt-6">
                        {subjectiveReading && <EnhancedAnalysisPanel answer={subjectiveReading} isHi={isHi} />}
                      </TabsContent>

                      <TabsContent value="muhurta" className="mt-6">
                        <MuhurtaFinderPanel isHi={isHi} natalMoonRashi={chart.planetaryPositions?.planets.find(p => p.name.toLowerCase() === 'moon')?.rashiIndex ?? 3} />
                      </TabsContent>

                      <TabsContent value="mtss" className="mt-6">
                        <MTSSPanel />
                      </TabsContent>
                    </Suspense>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="border-t border-border mt-12 py-8 bg-card/30">
          <div className="container max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground">© 2026 Vedic Rajkumar • Based on Phaladeepika & BPHS</p>
          </div>
        </footer>

        <Suspense fallback={null}>
          <KeyboardShortcuts />
          <FeedbackWidget lang={hiLang} />
        </Suspense>
      </div>
    </>
  );
};

export default Index;
