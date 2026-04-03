import { useState, useEffect, lazy, Suspense } from "react";
import EnhancedBirthInputForm from "@/components/EnhancedBirthInputForm";
import EnhancedLanguageToggle from "@/components/EnhancedLanguageToggle";
import UserProfileDialog from "@/components/UserProfileDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateTransits, getMoonRashi, CURRENT_POSITIONS, checkSadeSati, type TransitResult, type SadeSatiInfo } from "@/data/transitData";
import { saveReading, getReadings, type SavedReading } from "@/services/readingService";
import { addBirthDetails, getLastUsedProfile, shouldAutoLoad } from "@/services/userProfileService";
import { getMoonSign, getSunSign, calculateAllPlanetaryStrengths, type PlanetaryStrength } from "@/services/rashiService";
import { calculateKundli, type KundliData } from "@/services/kundliService";
import { generateComprehensiveHoroscope, type ComprehensiveHoroscope } from "@/services/horoscopeService";
import { type SupportedLanguage } from "@/services/multiLanguageService";
import { cacheService } from "@/services/cacheService";
import { performanceMonitor } from "@/utils/performanceMonitor";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useChartCalculation, type BirthInput } from "@/hooks/useChartCalculation";
import { SEO, webAppSchema } from "@/components/SEO";

// Lazy load heavy components
const TransitTable = lazy(() => import("@/components/TransitTable"));
const VisualTransitChart = lazy(() => import("@/components/VisualTransitChart"));
const AscendantNakshatraCard = lazy(() => import("@/components/AscendantNakshatraCard"));
const PlanetaryPositionsCard = lazy(() => import("@/components/PlanetaryPositionsCard"));
const PlanetaryAspectsCard = lazy(() => import("@/components/PlanetaryAspectsCard"));
const ManglikDoshaCard = lazy(() => import("@/components/ManglikDoshaCard"));
const RashiSunSignCard = lazy(() => import("@/components/RashiSunSignCard"));
const ReadingHistory = lazy(() => import("@/components/ReadingHistory"));
const PerformanceMonitor = lazy(() => import("@/components/PerformanceMonitor"));
const BreadcrumbNavigation = lazy(() => import("@/components/BreadcrumbNavigation"));
const KeyboardShortcuts = lazy(() => import("@/components/KeyboardShortcuts"));
const MobileNavigation = lazy(() => import("@/components/MobileNavigation"));
const KundliChart = lazy(() => import("@/components/KundliChart"));
const HoroscopeCard = lazy(() => import("@/components/HoroscopeCard"));
const AdvancedAstrologyCard = lazy(() => import("@/components/AdvancedAstrologyCard"));
const PanchangCard = lazy(() => import("@/components/PanchangCard"));
const FeedbackWidget = lazy(() => import("@/components/FeedbackWidget"));
const DarkModeToggle = lazy(() => import("@/components/DarkModeToggle"));
const DashaCard = lazy(() => import("@/components/DashaCard"));
const YogaCard = lazy(() => import("@/components/YogaCard"));
const AshtakavargaCard = lazy(() => import("@/components/AshtakavargaCard"));
const ShadabalaCard = lazy(() => import("@/components/ShadabalaCard"));
const DivisionalChartsCard = lazy(() => import("@/components/DivisionalChartsCard"));
const JaiminiCard = lazy(() => import("@/components/JaiminiCard"));

const ComponentLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// Parse coordinates from "City (lat, lon)" or fallback to city defaults
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
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [rawBirthData, setRawBirthData] = useState<{ date: string; time: string; location: string } | null>(null);
  const [transitDate, setTransitDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [results, setResults] = useState<TransitResult[] | null>(null);
  const [moonRashiIndex, setMoonRashiIndex] = useState(3);
  const [sadeSatiInfo, setSadeSatiInfo] = useState<SadeSatiInfo | null>(null);
  const [pastReadings, setPastReadings] = useState<SavedReading[]>([]);
  const [saving, setSaving] = useState(false);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);
  // Legacy state kept for RashiSunSignCard (uses rashiService, not ephemerisService)
  const [moonRashiInfo, setMoonRashiInfo] = useState<any | null>(null);
  const [sunSignInfo, setSunSignInfo] = useState<any | null>(null);
  const [planetaryStrengths, setPlanetaryStrengths] = useState<PlanetaryStrength[]>([]);
  const [kundliData, setKundliData] = useState<KundliData | null>(null);
  const [horoscopeData, setHoroscopeData] = useState<ComprehensiveHoroscope | null>(null);
  const { toast } = useToast();

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Single reactive hook replaces all scattered service calls ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const { data: chart, isCalculating } = useChartCalculation(birthInput);

  const isHi = lang === "hi";
  const hiLang = (lang === "hi" ? "hi" : "en") as "en" | "hi";
  const today = new Date().toLocaleDateString(isHi ? "hi-IN" : "en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

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
        handleSubmit(last);
        toast({
          title: isHi ? "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¤Ã‚Â¤ ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¸!" : "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Welcome Back!",
          description: isHi
            ? `ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¦ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â® ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã‚Â«ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â²: ${last.name || last.location}`
            : `Last profile: ${last.name || last.location}`,
        });
      }
    }
  }, [autoLoadAttempted, rawBirthData]);

  const handleSubmit = async (data: { date: string; time: string; location: string }) => {
    const coords = parseCoordinates(data.location);
    setRawBirthData(data);
    addBirthDetails(data);

    // Set birth input ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â hook auto-calculates all chart data
    setBirthInput({ date: data.date, time: data.time, lat: coords.lat, lon: coords.lon });

    // Legacy supplemental calculations (rashiService / kundliService / horoscopeService)
    try { setMoonRashiInfo(getMoonSign(data.date, data.time)); } catch { setMoonRashiInfo(null); }
    try { setSunSignInfo(getSunSign(data.date, data.time)); } catch { setSunSignInfo(null); }
    try { setPlanetaryStrengths(calculateAllPlanetaryStrengths(data.date, data.time)); } catch { setPlanetaryStrengths([]); }
    try { setKundliData(calculateKundli(data.date, data.time, coords.lat, coords.lon)); } catch { setKundliData(null); }
    try { setHoroscopeData(generateComprehensiveHoroscope(data.date)); } catch { setHoroscopeData(null); }

    // Transit calculations
    const birthDate = new Date(data.date);
    const moonIdx = getMoonRashi(birthDate);
    setMoonRashiIndex(moonIdx);

    const transitCacheKey = `transits_${moonIdx}_${transitDate}`;
    const cachedTransits = await cacheService.get(transitCacheKey) as { results: TransitResult[]; sadeSati: SadeSatiInfo } | null;
    if (cachedTransits) {
      setResults(cachedTransits.results);
      setSadeSatiInfo(cachedTransits.sadeSati);
    } else {
      const transitResults = calculateTransits(moonIdx, CURRENT_POSITIONS);
      const sadeSati = checkSadeSati(moonIdx, CURRENT_POSITIONS.Saturn);
      setResults(transitResults);
      setSadeSatiInfo(sadeSati);
      await cacheService.set(transitCacheKey, { results: transitResults, sadeSati }, 5 * 60 * 1000);
    }

    // Save reading
    setSaving(true);
    const saved = await saveReading({
      birth_date: data.date, birth_time: data.time, birth_location: data.location,
      moon_rashi_index: moonIdx, transit_date: transitDate,
      overall_score: 0, results: [],
    });
    setSaving(false);
    if (saved) toast({ title: isHi ? "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ÃƒÂ Ã‚Â¤Ã‚Â¡ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã…â€œÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¤Ã‹â€ " : "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Reading Saved" });

    const past = await getReadings(data.date, data.location);
    setPastReadings(past);
  };

  const handleViewPast = (reading: SavedReading) => {
    setRawBirthData({ date: reading.birth_date, time: reading.birth_time, location: reading.birth_location });
    setMoonRashiIndex(reading.moon_rashi_index);
    setResults(reading.results);
  };

  const handleReset = () => {
    setResults(null); setRawBirthData(null); setBirthInput(null);
    setPastReadings([]); setMoonRashiInfo(null); setSunSignInfo(null);
    setPlanetaryStrengths([]); setKundliData(null); setHoroscopeData(null);
  };

  // Derived from hook data
  const planets = chart.planetaryPositions?.planets ?? null;
  const ascendantRashi = chart.ascendant?.ascendant.rashiIndex ?? 0;

  return (
    <>
      <SEO
        title="Gochar Phal - Free Vedic Astrology & Transit Calculator"
        description="Free Vedic astrology with accurate Kundli, transit predictions (Gochar Phal), matchmaking, career guidance, Dasha, Jaimini, and more. Bilingual Hindi/English."
        keywords="vedic astrology, gochar phal, kundli, transit calculator, nakshatra, rashi, dasha, jyotish, free horoscope"
        canonical="/"
        structuredData={webAppSchema}
      />
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">ÃƒÂ°Ã…Â¸Ã¢â‚¬Â¢Ã¢â‚¬Â°ÃƒÂ¯Ã‚Â¸Ã‚Â</span>
            <div>
              <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚Â«ÃƒÂ Ã‚Â¤Ã‚Â²" : "Gochar Phal"}
              </h1>
              <p className={`text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¤Ã‚Â£ ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒÂ Ã‚Â¤Ã‚Â«ÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚ÂÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ ÃƒÂ Ã‚Â¤Ã‚Â¬ÃƒÂ Ã‚Â¥Ã†â€™ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã‚Â ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¤Ã‚Â°" : "Vedic Transit Analysis ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Phaladeepika & BPHS"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Core Tools */}
            <Link to="/matchmaking" className={`text-sm text-red-600 hover:text-red-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â¡ÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¨" : "Match Making"}
            </Link>
            <Link to="/dasha" className={`text-sm text-violet-600 hover:text-violet-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¤Ã‚Â¾" : "Dasha"}
            </Link>
            <Link to="/career-astrology" className={`text-sm text-blue-600 hover:text-blue-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¤Ã‚Â°" : "Career"}
            </Link>
            <Link to="/remedies" className={`text-sm text-rose-600 hover:text-rose-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â°ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¯" : "Remedies"}
            </Link>
            <Link to="/horoscope" className={`text-sm text-amber-600 hover:text-amber-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â«ÃƒÂ Ã‚Â¤Ã‚Â²" : "Horoscope"}
            </Link>
            <Link to="/yogas" className={`text-sm text-teal-600 hover:text-teal-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã¢â‚¬â€" : "Yogas"}
            </Link>
            {/* Advanced */}
            <Link to="/lal-kitab" className={`text-sm text-orange-600 hover:text-orange-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â² ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¬" : "Lal Kitab"}
            </Link>
            <Link to="/kp-system" className={`text-sm text-purple-600 hover:text-purple-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¥Ã¢â€šÂ¬" : "KP System"}
            </Link>
            <Link to="/jaimini" className={`text-sm text-amber-600 hover:text-amber-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã…â€œÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬" : "Jaimini"}
            </Link>
            {/* Global & AI */}
            <Link to="/western-astrology" className={`text-sm text-sky-600 hover:text-sky-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯" : "Western"}
            </Link>
            <Link to="/chinese-astrology" className={`text-sm text-red-500 hover:text-red-600 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬" : "Chinese"}
            </Link>
            <Link to="/ai-predictions" className={`text-sm text-indigo-600 hover:text-indigo-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "AI ÃƒÂ Ã‚Â¤Ã‚Â­ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯" : "AI Predictions"}
            </Link>
            <Link to="/numerology" className={`text-sm text-cyan-600 hover:text-cyan-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¦ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ ÃƒÂ Ã‚Â¤Ã…â€œÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â·" : "Numerology"}
            </Link>
            <Link to="/financial-astrology" className={`text-sm text-green-600 hover:text-green-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¤" : "Financial"}
            </Link>
            <Link to="/medical-astrology" className={`text-sm text-emerald-600 hover:text-emerald-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¥ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯" : "Medical"}
            </Link>
            <Link to="/horary" className={`text-sm text-fuchsia-600 hover:text-fuchsia-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¨" : "Horary"}
            </Link>
            {/* Community & Learning */}
            <Link to="/panchang" className={`text-sm text-orange-500 hover:text-orange-600 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã¢â‚¬â€" : "Panchang"}
            </Link>
            <Link to="/comparative-astrology" className={`text-sm text-slate-600 hover:text-slate-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¤Ã‚Â¾" : "Compare"}
            </Link>
            <Link to="/world-astrology" className={`text-sm text-emerald-500 hover:text-emerald-600 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Âµ ÃƒÂ Ã‚Â¤Ã…â€œÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â·" : "World Astro"}
            </Link>
            <Link to="/electional-astrology" className={`text-sm text-violet-500 hover:text-violet-600 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¤" : "Electional"}
            </Link>
            <Link to="/mundane-astrology" className={`text-sm text-blue-500 hover:text-blue-600 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â¡ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â¨" : "Mundane"}
            </Link>
            <Link to="/sade-sati" className={`text-sm text-orange-500 hover:text-orange-600 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¢ÃƒÂ Ã‚Â¤Ã‚Â¼ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬" : "Sade Sati"}
            </Link>
            <Link to="/ashtakavarga" className={`text-sm text-teal-500 hover:text-teal-600 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¦ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã…Â¸ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã¢â‚¬â€" : "Ashtakavarga"}
            </Link>
            <Link to="/learn" className={`text-sm text-lime-600 hover:text-lime-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ÃƒÂ Ã‚Â¤Ã¢â‚¬â€œÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡" : "Learn"}
            </Link>
            <Link to="/community" className={`text-sm text-pink-600 hover:text-pink-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¯" : "Community"}
            </Link>
            <Link to="/marketplace" className={`text-sm text-yellow-600 hover:text-yellow-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã…â€œÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬" : "Marketplace"}
            </Link>
            {/* All Features Hub */}
            <Link to="/features" className={`text-sm bg-primary text-primary-foreground px-2 py-1 rounded-md font-semibold hover:bg-primary/90 ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â­ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â§ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚ÂÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ ÃƒÂ¢Ã…â€œÃ‚Â¦" : "All Features ÃƒÂ¢Ã…â€œÃ‚Â¦"}
            </Link>
            <UserProfileDialog lang={hiLang} />
            <Suspense fallback={null}><DarkModeToggle showLabel={false} language={hiLang} /></Suspense>
            <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={true} autoDetect={true} />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Suspense fallback={null}>
          <BreadcrumbNavigation lang={hiLang} showHome={true} className="mb-4" />
        </Suspense>

        <p className={`text-center text-sm text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
          {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¥ÃƒÂ Ã‚Â¤Ã‚Â¿" : "Transit Date"}: {today}
        </p>

        {/* Input form */}
        {!results && (
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
            <EnhancedBirthInputForm lang={hiLang} onSubmit={handleSubmit} showAutoSave={true} showProgress={true} />
          </div>
        )}

        {/* Calculating indicator */}
        {isCalculating && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            {isHi ? <span className="font-hindi">ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¤Ã‚Â£ÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</span> : "CalculatingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦"}
          </div>
        )}

        {/* Results */}
        {results && rawBirthData && (
          <div className="space-y-4">
            {/* Transit Date Selector */}
            <div className="max-w-md mx-auto bg-card border border-border rounded-lg p-4">
              <Label htmlFor="transitDate" className={`text-sm font-semibold mb-2 block ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¥ÃƒÂ Ã‚Â¤Ã‚Â¿ ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡" : "Select Transit Date"}
              </Label>
              <div className="flex gap-2">
                <Input id="transitDate" type="date" value={transitDate}
                  onChange={(e) => setTransitDate(e.target.value)} className="flex-1" required />
                <Button size="sm" onClick={() => {
                  const tr = calculateTransits(moonRashiIndex, CURRENT_POSITIONS);
                  setResults(tr);
                  setSadeSatiInfo(checkSadeSati(moonRashiIndex, CURRENT_POSITIONS.Saturn));
                }}>
                  {isHi ? <span className="font-hindi">अद्यतन</span> : "Update"}
                </Button>
              </div>
              <p className={`text-xs text-muted-foreground mt-2 ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "अद्यतन करें" : "Update"}
                {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â­ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¥ÃƒÂ Ã‚Â¤Ã‚Â¿ ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ ÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬â€œÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ (ÃƒÂ Ã‚Â¤Ã‚Â­ÃƒÂ Ã‚Â¥Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â¤/ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¨/ÃƒÂ Ã‚Â¤Ã‚Â­ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯)" : "View transits for any date (past/present/future)"}
              </p>
            </div>

            {/* Birth info chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                {isHi ? <span className="font-hindi">ÃƒÂ Ã‚Â¤Ã…â€œÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â®: {rawBirthData.date}</span> : `Birth: ${rawBirthData.date}`}
              </span>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                {isHi ? <span className="font-hindi">ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¤Ã‚Â¯: {rawBirthData.time}</span> : `Time: ${rawBirthData.time}`}
              </span>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                {isHi ? <span className="font-hindi">ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¥ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¨: {rawBirthData.location}</span> : `Place: ${rawBirthData.location}`}
              </span>
              {saving && (
                <span className="px-2 py-1 rounded bg-primary/10 text-primary animate-pulse">
                  {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã…â€œ ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡..." : "Saving..."}
                </span>
              )}
            </div>

            {/* Ascendant & Nakshatra */}
            {(chart.ascendant || chart.nakshatra) && (
              <Suspense fallback={<ComponentLoader />}>
                <AscendantNakshatraCard
                  ascendant={chart.ascendant ? {
                    rashiName: chart.ascendant.ascendant.rashiName,
                    degrees: chart.ascendant.ascendant.degrees,
                  } : undefined}
                  nakshatra={chart.nakshatra ? {
                    name: typeof chart.nakshatra.name === "string"
                      ? { en: chart.nakshatra.name, hi: chart.nakshatra.name }
                      : { en: chart.nakshatra.name.en, hi: chart.nakshatra.name.hi },
                    pada: chart.nakshatra.pada,
                    lord: chart.nakshatra.lord,
                    symbol: chart.nakshatra.symbol,
                  } : undefined}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Rashi & Sun Sign */}
            {(moonRashiInfo || sunSignInfo) && (
              <Suspense fallback={<ComponentLoader />}>
                <RashiSunSignCard
                  moonRashi={moonRashiInfo ? {
                    rashi: moonRashiInfo.rashi,
                    rashiName: moonRashiInfo.rashiName,
                    degrees: moonRashiInfo.degrees,
                    element: moonRashiInfo.rashiInfo.element,
                    quality: moonRashiInfo.rashiInfo.quality,
                    lord: moonRashiInfo.rashiInfo.lord,
                    characteristics: lang === "hi"
                      ? moonRashiInfo.rashiInfo.characteristics.hi
                      : moonRashiInfo.rashiInfo.characteristics.en,
                  } : { rashi: 0, rashiName: "Unknown", degrees: 0, element: "Unknown", quality: "Unknown", lord: "Unknown", characteristics: "Unknown" }}
                  sunSign={sunSignInfo || { tropical: { rashi: 0, rashiName: "Unknown", degrees: 0 }, sidereal: { rashi: 0, rashiName: "Unknown", degrees: 0 } }}
                  planetaryStrengths={planetaryStrengths}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Kundli Chart */}
            {kundliData && (
              <Suspense fallback={<ComponentLoader />}>
                <KundliChart
                  date={rawBirthData.date} time={rawBirthData.time}
                  latitude={parseCoordinates(rawBirthData.location).lat}
                  longitude={parseCoordinates(rawBirthData.location).lon}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Horoscope */}
            {horoscopeData && (
              <Suspense fallback={<ComponentLoader />}>
                <HoroscopeCard birthDate={rawBirthData.date} lang={hiLang} />
              </Suspense>
            )}

            {/* Advanced Astrology */}
            {planets && (
              <Suspense fallback={<ComponentLoader />}>
                <AdvancedAstrologyCard
                  birthDate={rawBirthData.date} birthTime={rawBirthData.time}
                  latitude={parseCoordinates(rawBirthData.location).lat}
                  longitude={parseCoordinates(rawBirthData.location).lon}
                  planetaryPositions={planets}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Panchang */}
            <Suspense fallback={<ComponentLoader />}>
              <PanchangCard
                date={transitDate}
                latitude={parseCoordinates(rawBirthData.location).lat}
                longitude={parseCoordinates(rawBirthData.location).lon}
                lang={hiLang}
              />
            </Suspense>

            {/* Advanced Yoga & Varga Analysis is already integrated elsewhere */}

            {/* Planetary Positions */}
            {chart.planetaryPositions && (
              <Suspense fallback={<ComponentLoader />}>
                <PlanetaryPositionsCard positions={chart.planetaryPositions} lang={hiLang} />
              </Suspense>
            )}

            {/* Planetary Aspects */}
            {planets && (
              <Suspense fallback={<ComponentLoader />}>
                <PlanetaryAspectsCard
                  planetaryPositions={planets.map(p => ({ planet: p.name, rashi: p.rashiIndex, degree: p.degrees, house: p.house }))}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Manglik Dosha */}
            {chart.manglik && (
              <Suspense fallback={<ComponentLoader />}>
                <ManglikDoshaCard result={chart.manglik} lang={hiLang} />
              </Suspense>
            )}

            {/* Vimshottari Dasha */}
            <Suspense fallback={<ComponentLoader />}>
              <DashaCard birthDate={rawBirthData.date} birthTime={rawBirthData.time} lang={hiLang} />
            </Suspense>

            {/* Yoga Analysis */}
            {planets && (
              <Suspense fallback={<ComponentLoader />}>
                <YogaCard
                  planets={planets.map(p => ({
                    name: p.name, rashiIndex: p.rashiIndex,
                    house: p.house, degrees: p.degrees,
                    isRetrograde: p.retrograde ?? false,
                  }))}
                  ascendantRashi={ascendantRashi}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Ashtakavarga */}
            {planets && (
              <Suspense fallback={<ComponentLoader />}>
                <AshtakavargaCard
                  planetRashis={Object.fromEntries(planets.map(p => [p.name, p.rashiIndex]))}
                  ascendantRashi={ascendantRashi}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Shadbala */}
            {planets && rawBirthData && (
              <Suspense fallback={<ComponentLoader />}>
                <ShadabalaCard
                  planets={planets.map(p => ({
                    name: p.name, rashiIndex: p.rashiIndex, house: p.house,
                    degrees: p.degrees, isRetrograde: p.retrograde ?? false,
                    longitude: p.rashiIndex * 30 + p.degrees,
                  }))}
                  isDaytime={parseInt(rawBirthData.time.split(":")[0]) >= 6 && parseInt(rawBirthData.time.split(":")[0]) < 18}
                  birthMonth={new Date(rawBirthData.date).getMonth() + 1}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Divisional Charts */}
            {planets && (
              <Suspense fallback={<ComponentLoader />}>
                <DivisionalChartsCard
                  planetLongitudes={Object.fromEntries(planets.map(p => [p.name, p.rashiIndex * 30 + p.degrees]))}
                  ascendantLongitude={ascendantRashi * 30 + (chart.ascendant?.ascendant.degrees ?? 0)}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Jaimini System */}
            {planets && rawBirthData && (
              <Suspense fallback={<ComponentLoader />}>
                <JaiminiCard
                  planets={planets.map(p => ({ name: p.name, rashiIndex: p.rashiIndex, degrees: p.degrees, house: p.house }))}
                  ascendantRashi={ascendantRashi}
                  ascendantDegrees={chart.ascendant?.ascendant.degrees ?? 0}
                  birthYear={new Date(rawBirthData.date).getFullYear()}
                  lang={hiLang}
                />
              </Suspense>
            )}

            {/* Sade Sati Alert */}
            {sadeSatiInfo?.active && (
              <div className="max-w-2xl mx-auto bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â</span>
                  <div className="flex-1">
                    <h3 className={`font-bold text-orange-900 dark:text-orange-100 mb-2 ${isHi ? "font-hindi" : ""}`}>
                      {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¢ÃƒÂ Ã‚Â¤Ã‚Â¼ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¯!" : "Sade Sati Active!"}
                    </h3>
                    <p className={`text-sm text-orange-800 dark:text-orange-200 mb-3 ${isHi ? "font-hindi" : ""}`}>
                      {isHi ? sadeSatiInfo.description.hi : sadeSatiInfo.description.en}
                    </p>
                    <details className="text-sm">
                      <summary className={`cursor-pointer text-orange-700 dark:text-orange-300 font-semibold mb-2 ${isHi ? "font-hindi" : ""}`}>
                        {isHi ? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â°ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¯ ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬â€œÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡" : "View Remedies"}
                      </summary>
                      <ul className={`list-disc list-inside space-y-1 text-orange-800 dark:text-orange-200 ${isHi ? "font-hindi" : ""}`}>
                        {(isHi ? sadeSatiInfo.remedies.hi : sadeSatiInfo.remedies.en).map((remedy, idx) => (
                          <li key={idx}>{remedy}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
              </div>
            )}

            {/* Transit Table / Chart Tabs */}
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="table" className={isHi ? "font-hindi" : ""}>{isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¥Ã†â€™ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯" : "Table View"}</TabsTrigger>
                <TabsTrigger value="chart" className={isHi ? "font-hindi" : ""}>{isHi ? "ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¥Ã†â€™ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯" : "Chart View"}</TabsTrigger>
              </TabsList>
              <TabsContent value="table" className="mt-4">
                <Suspense fallback={<ComponentLoader />}>
                  <TransitTable results={results} lang={hiLang} moonRashiIndex={moonRashiIndex} birthData={rawBirthData} transitDate={today} />
                </Suspense>
              </TabsContent>
              <TabsContent value="chart" className="mt-4">
                <Suspense fallback={<ComponentLoader />}>
                  <VisualTransitChart results={results} moonRashiIndex={moonRashiIndex} lang={hiLang} />
                </Suspense>
              </TabsContent>
            </Tabs>

            {/* Past Readings */}
            {pastReadings.length > 1 && (
              <Suspense fallback={<ComponentLoader />}>
                <ReadingHistory readings={pastReadings} lang={hiLang} onView={handleViewPast} />
              </Suspense>
            )}

            {/* Reset */}
            <div className="flex justify-center">
              <button onClick={handleReset}
                className={`text-sm text-primary underline underline-offset-2 hover:text-primary/80 ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "ÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â£ ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã…â€œ ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡" : "Enter new details"}
              </button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className={`text-center text-xs text-muted-foreground max-w-lg mx-auto ${isHi ? "font-hindi" : ""}`}>
          {isHi
            ? "ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¤Ã‚Â¹ ÃƒÂ Ã‚Â¤Ã‚Â«ÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚Âµ ÃƒÂ Ã‚Â¤Ã‚Â¬ÃƒÂ Ã‚Â¥Ã†â€™ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã‚Â ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã¢â‚¬Â ÃƒÂ Ã‚Â¤Ã‚Â§ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¤ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯ ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¤Ã‚Â£ ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ Ã‚Â¥Ã‚Â¤ ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â§ (ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¦ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã‚Â§) ÃƒÂ Ã‚Â¤Ã‚Âµ ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ÃƒÂ Ã‚Â¤Ã‚Â¤ ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â§ ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ Ã‚Â¥Ã‚Â¤ ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¤Ã‚Â¤ ÃƒÂ Ã‚Â¤Ã‚Â«ÃƒÂ Ã‚Â¤Ã‚Â² ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã‚Â ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¥Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â£ ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â¡ÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬, ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚Âµ ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¦ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã…Â¸ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã¢â‚¬â€ ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¤Ã‚Â£ ÃƒÂ Ã‚Â¤Ã¢â‚¬Â ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ Ã‚Â¥Ã‚Â¤"
            : "ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â General transit analysis based on Phaladeepika & BPHS principles. Vedha (obstruction) & Vipreet Vedha are considered. For personalized results, full chart, Dasha & Ashtakavarga analysis is needed."}
        </p>

        {import.meta.env.DEV && (
          <Suspense fallback={null}><PerformanceMonitor /></Suspense>
        )}
        <Suspense fallback={null}><KeyboardShortcuts lang={hiLang} showHelp={true} /></Suspense>
        <Suspense fallback={null}><MobileNavigation lang={hiLang} /></Suspense>
        <Suspense fallback={null}><FeedbackWidget language={hiLang} /></Suspense>
      </main>
    </div>
    </>
  );
};

export default Index;

