import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
import { registerServiceWorker, setupConnectionListeners } from "@/utils/serviceWorkerRegistration";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { pageVariants } from "@/lib/motion";

// Lazy load all page components for better performance
const Index = lazy(() => import("./pages/Index"));
const CareerAstrology = lazy(() => import("./pages/CareerAstrology"));
const KaalSarpPage = lazy(() => import("./pages/KaalSarpPage"));
const ComprehensiveReportPage = lazy(() => import("./pages/ComprehensiveReportPage"));
const MatchMaking = lazy(() => import("./pages/MatchMaking"));
const VaastuAssessmentPage = lazy(() => import("./pages/VaastuAssessmentPage"));
const MuhuratCalendarPage = lazy(() => import("./pages/MuhuratCalendarPage"));
const BabyNameSuggestionsPage = lazy(() => import("./pages/BabyNameSuggestionsPage"));
const LuckyElementsPage = lazy(() => import("./pages/LuckyElementsPage"));
const FestivalCalendarPage = lazy(() => import("./pages/FestivalCalendarPage"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const FeatureRequestPortal = lazy(() => import("./pages/FeatureRequestPortal"));
const FeedbackDashboard = lazy(() => import("./pages/FeedbackDashboard"));
const QuickWinsDashboard = lazy(() => import("./pages/QuickWinsDashboard"));
const DashaPage = lazy(() => import("./pages/DashaPage"));
const JaiminiPage = lazy(() => import("./pages/JaiminiPage"));
const TajikPage = lazy(() => import("./pages/TajikPage"));
const BusinessAstrologyPage = lazy(() => import("./pages/BusinessAstrologyPage"));
const RemediesPage = lazy(() => import("./pages/RemediesPage"));
const DivisionalChartsPage = lazy(() => import("./pages/DivisionalChartsPage"));
const PlanetaryStrengthPage = lazy(() => import("./pages/PlanetaryStrengthPage"));
const HoroscopePage = lazy(() => import("./pages/HoroscopePage"));
const YogasPage = lazy(() => import("./pages/YogasPage"));
const LalKitabPage = lazy(() => import("./pages/LalKitabPage"));
const KPSystemPage = lazy(() => import("./pages/KPSystemPage"));
const LoveAstrologyPage = lazy(() => import("./pages/LoveAstrologyPage"));
const NadiAstrologyPage = lazy(() => import("./pages/NadiAstrologyPage"));
const WesternAstrologyPage = lazy(() => import("./pages/WesternAstrologyPage"));
const ChineseAstrologyPage = lazy(() => import("./pages/ChineseAstrologyPage"));
const AIPredictionsPage = lazy(() => import("./pages/AIPredictionsPage"));
const HoraryAstrologyPage = lazy(() => import("./pages/HoraryAstrologyPage"));
const MedicalAstrologyPage = lazy(() => import("./pages/MedicalAstrologyPage"));
const NumerologyPage = lazy(() => import("./pages/NumerologyPage"));
const FinancialAstrologyPage = lazy(() => import("./pages/FinancialAstrologyPage"));
const LearningPlatformPage = lazy(() => import("./pages/LearningPlatformPage"));
const AstrologerMarketplacePage = lazy(() => import("./pages/AstrologerMarketplacePage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const AllFeaturesPage = lazy(() => import("./pages/AllFeaturesPage"));
const APIDocumentationPage = lazy(() => import("./pages/APIDocumentationPage"));
const SpiritualRemediesPage = lazy(() => import("./pages/SpiritualRemediesPage"));
const PanchangPage = lazy(() => import("./pages/PanchangPage"));
const ComparativeAstrologyPage = lazy(() => import("./pages/ComparativeAstrologyPage"));
const WorldAstrologyPage = lazy(() => import("./pages/WorldAstrologyPage"));
const ElectionalAstrologyPage = lazy(() => import("./pages/ElectionalAstrologyPage"));
const MundaneAstrologyPage = lazy(() => import("./pages/MundaneAstrologyPage"));
const SadeSatiPage = lazy(() => import("./pages/SadeSatiPage"));
const AshtakavargaPage = lazy(() => import("./pages/AshtakavargaPage"));
const GemstonePage = lazy(() => import("./pages/GemstonePage"));
const EnterprisePage = lazy(() => import("./pages/EnterprisePage"));
const VarshaphalPage = lazy(() => import("./pages/VarshaphalPage"));
const BV_RamanPage = lazy(() => import("./pages/BV_RamanPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback — animated 🕉️ spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <motion.div
        className="text-4xl"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        🕉️
      </motion.div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Animated routes — smooth page transitions via Framer Motion
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: "100vh" }}
      >
        <Routes location={location}>
          <Route path="/" element={
            <ErrorBoundary fallback={<Navigate to="/business-astrology" replace />}>
              <Index />
            </ErrorBoundary>
          } />
          <Route path="/career-astrology" element={<CareerAstrology />} />
          <Route path="/kaalsarp" element={<KaalSarpPage />} />
          <Route path="/comprehensive" element={<ComprehensiveReportPage />} />
          <Route path="/matchmaking" element={<MatchMaking />} />
          <Route path="/vaastu" element={<VaastuAssessmentPage />} />
          <Route path="/muhurat" element={<MuhuratCalendarPage />} />
          <Route path="/baby-names" element={<BabyNameSuggestionsPage />} />
          <Route path="/lucky-elements" element={<LuckyElementsPage />} />
          <Route path="/festival-calendar" element={<FestivalCalendarPage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/feature-requests" element={<FeatureRequestPortal />} />
          <Route path="/feedback-dashboard" element={<FeedbackDashboard />} />
          <Route path="/quick-wins" element={<QuickWinsDashboard />} />
          <Route path="/dasha" element={<DashaPage />} />
          <Route path="/jaimini" element={<JaiminiPage />} />
          <Route path="/tajik" element={<TajikPage />} />
          <Route path="/business-astrology" element={<BusinessAstrologyPage />} />
          <Route path="/remedies" element={<RemediesPage />} />
          <Route path="/divisional-charts" element={<DivisionalChartsPage />} />
          <Route path="/planetary-strength" element={<PlanetaryStrengthPage />} />
          <Route path="/horoscope" element={<HoroscopePage />} />
          <Route path="/yogas" element={<YogasPage />} />
          <Route path="/lal-kitab" element={<LalKitabPage />} />
          <Route path="/kp-system" element={<KPSystemPage />} />
          <Route path="/love-astrology" element={<LoveAstrologyPage />} />
          <Route path="/nadi-astrology" element={<NadiAstrologyPage />} />
          <Route path="/western-astrology" element={<WesternAstrologyPage />} />
          <Route path="/chinese-astrology" element={<ChineseAstrologyPage />} />
          <Route path="/ai-predictions" element={<AIPredictionsPage />} />
          <Route path="/horary" element={<HoraryAstrologyPage />} />
          <Route path="/medical-astrology" element={<MedicalAstrologyPage />} />
          <Route path="/numerology" element={<NumerologyPage />} />
          <Route path="/financial-astrology" element={<FinancialAstrologyPage />} />
          <Route path="/learn" element={<LearningPlatformPage />} />
          <Route path="/marketplace" element={<AstrologerMarketplacePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/features" element={<AllFeaturesPage />} />
          <Route path="/api-docs" element={<APIDocumentationPage />} />
          <Route path="/panchang" element={<PanchangPage />} />
          <Route path="/comparative-astrology" element={<ComparativeAstrologyPage />} />
          <Route path="/world-astrology" element={<WorldAstrologyPage />} />
          <Route path="/electional-astrology" element={<ElectionalAstrologyPage />} />
          <Route path="/mundane-astrology" element={<MundaneAstrologyPage />} />
          <Route path="/sade-sati" element={<SadeSatiPage />} />
          <Route path="/ashtakavarga" element={<AshtakavargaPage />} />
          <Route path="/gemstones" element={<GemstonePage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/varshaphal" element={<VarshaphalPage />} />
          <Route path="/bv-raman" element={<BV_RamanPage />} />
          <Route path="/spiritual-remedies" element={<SpiritualRemediesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min
      gcTime:    30 * 60 * 1000,  // 30 min
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    registerServiceWorker();
    setupConnectionListeners();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <AnimatedRoutes />
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
