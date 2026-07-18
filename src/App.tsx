import { lazy, Suspense, useEffect, useRef } from 'react';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { registerServiceWorker, setupConnectionListeners } from '@/utils/serviceWorkerRegistration';
import { ClerkProvider, useClerk } from '@clerk/react';
import { shadcn } from '@clerk/themes';
import MainLayout from '@/components/MainLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import LandingPageV3 from './pages/LandingPageV3';
import CareerAstrology from './pages/CareerAstrology';
import KaalSarpPage from './pages/KaalSarpPage';
import ComprehensiveReportPage from './pages/ComprehensiveReportPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
const MatchMaking = lazy(() => import('./pages/MatchMaking'));
const EnhancedKundliMilan = lazy(() => import('./pages/EnhancedKundliMilan'));
const VaastuAssessmentPage = lazy(() => import('./pages/VaastuAssessmentPage'));
const MuhuratCalendarPage = lazy(() => import('./pages/MuhuratCalendarPage'));
const EnhancedMuhurtaFinder = lazy(() => import('./pages/EnhancedMuhurtaFinder'));
const BabyNameSuggestionsPage = lazy(() => import('./pages/BabyNameSuggestionsPage'));
const LuckyElementsPage = lazy(() => import('./pages/LuckyElementsPage'));
const FestivalCalendarPage = lazy(() => import('./pages/FestivalCalendarPage'));
const MTSSPanel = lazy(() => import('./components/MTSSPanel'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const FeatureRequestPortal = lazy(() => import('./pages/FeatureRequestPortal'));
const FeedbackDashboard = lazy(() => import('./pages/FeedbackDashboard'));
const QuickWinsDashboard = lazy(() => import('./pages/QuickWinsDashboard'));
const DashaPage = lazy(() => import('./pages/DashaPage'));
const JaiminiPage = lazy(() => import('./pages/JaiminiPage'));
const TajikPage = lazy(() => import('./pages/TajikPage'));
const BusinessAstrologyPage = lazy(() => import('./pages/BusinessAstrologyPage'));
const RemediesPage = lazy(() => import('./pages/RemediesPage'));
const DivisionalChartsPage = lazy(() => import('./pages/DivisionalChartsPage'));
const PlanetaryStrengthPage = lazy(() => import('./pages/PlanetaryStrengthPage'));
const HoroscopePage = lazy(() => import('./pages/HoroscopePage'));
const YogasPage = lazy(() => import('./pages/YogasPage'));
const LalKitabPage = lazy(() => import('./pages/LalKitabPage'));
const KPSystemPage = lazy(() => import('./pages/KPSystemPage'));
const LoveAstrologyPage = lazy(() => import('./pages/LoveAstrologyPage'));
const NadiAstrologyPage = lazy(() => import('./pages/NadiAstrologyPage'));
const WesternAstrologyPage = lazy(() => import('./pages/WesternAstrologyPage'));
const ChineseAstrologyPage = lazy(() => import('./pages/ChineseAstrologyPage'));
const AIPredictionsPage = lazy(() => import('./pages/AIPredictionsPage'));
const HoraryAstrologyPage = lazy(() => import('./pages/HoraryAstrologyPage'));
const MedicalAstrologyPage = lazy(() => import('./pages/MedicalAstrologyPage'));
const NumerologyPage = lazy(() => import('./pages/NumerologyPage'));
const FinancialAstrologyPage = lazy(() => import('./pages/FinancialAstrologyPage'));
const LearningPlatformPage = lazy(() => import('./pages/LearningPlatformPage'));
const AstrologerMarketplacePage = lazy(() => import('./pages/AstrologerMarketplacePage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const AllFeaturesPage = lazy(() => import('./pages/AllFeaturesPage'));
const APIDocumentationPage = lazy(() => import('./pages/APIDocumentationPage'));
const SpiritualRemediesPage = lazy(() => import('./pages/SpiritualRemediesPage'));
const PanchangPage = lazy(() => import('./pages/PanchangPage'));
const ComparativeAstrologyPage = lazy(() => import('./pages/ComparativeAstrologyPage'));
const WorldAstrologyPage = lazy(() => import('./pages/WorldAstrologyPage'));
const ElectionalAstrologyPage = lazy(() => import('./pages/ElectionalAstrologyPage'));
const MundaneAstrologyPage = lazy(() => import('./pages/MundaneAstrologyPage'));
const SadeSatiPage = lazy(() => import('./pages/SadeSatiPage'));
const AshtakavargaPage = lazy(() => import('./pages/AshtakavargaPage'));
const GemstonePage = lazy(() => import('./pages/GemstonePage'));
const EnterprisePage = lazy(() => import('./pages/EnterprisePage'));
const VarshaphalPage = lazy(() => import('./pages/VarshaphalPage'));
const BV_RamanPage = lazy(() => import('./pages/BV_RamanPage'));
const RamanArchivePage = lazy(() => import('./pages/RamanArchivePage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const EnterpriseAdminPage = lazy(() => import('./pages/EnterpriseAdminPage'));
const MobileAppPage = lazy(() => import('./pages/MobileAppPage'));
const MahadashaChildrenPage = lazy(() => import('./pages/MahadashaChildrenPage'));
const DynamicTransitPage = lazy(() => import('./pages/DynamicTransitPage'));
const TransitAnalysisPage = lazy(() => import('./pages/TransitAnalysisPage'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const QuestionPage = lazy(() => import('./pages/QuestionPage'));
const KnowledgeBase = lazy(() => import('./pages/knowledge/KnowledgeBase'));
const KnowledgeAdd = lazy(() => import('./pages/knowledge/KnowledgeAdd'));
const KnowledgeIngest = lazy(() => import('./pages/knowledge/KnowledgeIngest'));
const KnowledgeUpload = lazy(() => import('./pages/knowledge/KnowledgeUpload'));
const KnowledgeExport = lazy(() => import('./pages/knowledge/KnowledgeExport'));
const PrashnaEngine = lazy(() => import('./pages/prashna/PrashnaEngine'));
const PrashnaHistory = lazy(() => import('./pages/prashna/PrashnaHistory'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const KanchiPage = lazy(() => import('./pages/KanchiPage'));
const NakshatraPrecautionsPage = lazy(() => import('./pages/NakshatraPrecautionsPage'));
const MyReadingsPage = lazy(() => import('./pages/MyReadingsPage'));
const KundliComparePage = lazy(() => import('./pages/KundliComparePage'));
const WeddingMuhuratPage = lazy(() => import('./pages/WeddingMuhuratPage'));
const DashaTimelinePage = lazy(() => import('./pages/DashaTimelinePage'));
const VedicMarriagePage = lazy(() => import('./pages/VedicMarriagePage'));
const VidhyaKarmaDarshanPage = lazy(() => import('./pages/VidhyaKarmaDarshanPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const LandingPageV2 = lazy(() => import('./pages/LandingPageV2'));
const IndexPage = lazy(() => import('./pages/Index'));
const VedicAPage = lazy(() => import('./pages/VedicAPage'));
const EventTransitPage = lazy(() => import('./pages/EventTransitPage'));

// Loading fallback — animated spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <motion.div
        className="text-4xl"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      ></motion.div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Local pageVariants definition to ensure route transitions don't fail if undefined
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

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
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPageV3 />} />
          <Route path="/app" element={<IndexPage />} />
          <Route path="/welcome" element={<LandingPageV2 />} />
          <Route path="/landing-classic" element={<LandingPage />} />
          <Route path="/landing-v3" element={<Navigate to="/" replace />} />
          <Route path="/landing-v2" element={<Navigate to="/welcome" replace />} />
          <Route path="/career-astrology" element={<CareerAstrology />} />
          <Route path="/kaalsarp" element={<KaalSarpPage />} />
          <Route path="/comprehensive" element={<ComprehensiveReportPage />} />
          <Route path="/matchmaking" element={<MatchMaking />} />
          <Route path="/enhanced-matchmaking" element={<EnhancedKundliMilan />} />
          <Route path="/vaastu" element={<VaastuAssessmentPage />} />
          <Route path="/muhurat" element={<MuhuratCalendarPage />} />
          <Route path="/enhanced-muhurat" element={<EnhancedMuhurtaFinder />} />
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
          <Route path="/raman-archive" element={<RamanArchivePage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/enterprise-admin" element={<EnterpriseAdminPage />} />
          <Route path="/mobile-app" element={<MobileAppPage />} />
          <Route path="/vimshottari-dasha" element={<Navigate to="/dasha" replace />} />
          <Route path="/enhanced-ashtakavarga" element={<Navigate to="/ashtakavarga" replace />} />
          <Route path="/yogas-identification" element={<Navigate to="/yogas" replace />} />
          <Route path="/kundli" element={<Navigate to="/horoscope" replace />} />
          <Route path="/transit" element={<Navigate to="/dynamic-transit" replace />} />
          <Route path="/kaal-sarp" element={<Navigate to="/kaalsarp" replace />} />
          <Route path="/career" element={<Navigate to="/career-astrology" replace />} />
          <Route path="/divisional" element={<Navigate to="/divisional-charts" replace />} />
          <Route path="/prasna" element={<Navigate to="/prashna" replace />} />
          <Route path="/spiritual-remedies" element={<SpiritualRemediesPage />} />
          <Route path="/mahadasha-children" element={<MahadashaChildrenPage />} />
          <Route path="/dynamic-transit" element={<DynamicTransitPage />} />
          <Route path="/transit-analysis" element={<TransitAnalysisPage />} />
          <Route path="/event-transit" element={<EventTransitPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/question" element={<QuestionPage />} />
          <Route path="/prashna" element={<QuestionPage />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/knowledge/add" element={<KnowledgeAdd />} />
          <Route path="/knowledge/ingest" element={<KnowledgeIngest />} />
          <Route path="/knowledge/upload" element={<KnowledgeUpload />} />
          <Route path="/knowledge/export" element={<KnowledgeExport />} />
          <Route path="/prashna-ai" element={<PrashnaEngine />} />
          <Route path="/prashna-history" element={<PrashnaHistory />} />
          <Route path="/prashna/history" element={<PrashnaHistory />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/marriage" element={<VedicMarriagePage />} />
          <Route path="/kanchi" element={<KanchiPage />} />
          <Route path="/vedic-marriage" element={<VedicMarriagePage />} />
          <Route path="/kundli-compare" element={<KundliComparePage />} />
          <Route path="/wedding-muhurat" element={<WeddingMuhuratPage />} />
          <Route path="/dasha-timeline" element={<DashaTimelinePage />} />
          <Route path="/mtss" element={<MTSSPanel />} />
          <Route path="/vidhya-karma" element={<VidhyaKarmaDarshanPage />} />
          <Route path="/nakshatra-precautions" element={<NakshatraPrecautionsPage />} />
          <Route path="/my-readings" element={<MyReadingsPage />} />
          <Route path="/index" element={<Navigate to="/app" replace />} />
          <Route path="/vedic-a" element={<VedicAPage />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  variables: {
    colorPrimary: '#c8860a',
    colorForeground: '#f5e6c8',
    colorBackground: '#1a0a00',
    fontFamily: "'Crimson Pro', Georgia, serif",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qClient]);

  return null;
}

function ClerkProviderWithNavigate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={to => navigate(to.startsWith(basePath) ? to.slice(basePath.length) || '/' : to)}
      routerReplace={to =>
        navigate(to.startsWith(basePath) ? to.slice(basePath.length) || '/' : to, { replace: true })
      }
    >
      <ClerkQueryClientCacheInvalidator />
      {children}
    </ClerkProvider>
  );
}

const App = () => {
  useEffect(() => {
    registerServiceWorker();
    setupConnectionListeners();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter>
              <ClerkProviderWithNavigate>
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <AnimatedRoutes />
                  </Suspense>
                </MainLayout>
              </ClerkProviderWithNavigate>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
