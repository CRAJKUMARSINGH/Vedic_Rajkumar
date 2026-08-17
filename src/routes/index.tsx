/**
 * Central route configuration.
 * All lazy imports and route definitions live here; App.tsx stays thin.
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// ─── Eagerly-loaded pages (part of the main bundle) ──────────────────────────
import LandingPageV3 from '@/pages/LandingPageV3';
import LandingPage from '@/pages/LandingPage';
import CareerAstrology from '@/pages/CareerAstrology';
import KaalSarpPage from '@/pages/KaalSarpPage';
import ComprehensiveReportPage from '@/pages/ComprehensiveReportPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';

// ─── Lazy-loaded pages (code-split) ──────────────────────────────────────────

// Core features (Week 3 target: these four stay active)
const HoroscopePage = lazy(() => import('@/pages/HoroscopePage'));           // Kundli / Birth Chart
const PanchangPage = lazy(() => import('@/pages/PanchangPage'));              // Panchang + Muhurta
const MatchMaking = lazy(() => import('@/pages/MatchMaking'));                // Matchmaking
const QuestionPage = lazy(() => import('@/pages/QuestionPage'));              // Prashna (horary)
const PrashnaEngine = lazy(() => import('@/pages/prashna/PrashnaEngine'));
const PrashnaHistory = lazy(() => import('@/pages/prashna/PrashnaHistory'));

// Matchmaking variants
const EnhancedKundliMilan = lazy(() => import('@/pages/EnhancedKundliMilan'));
const KundliComparePage = lazy(() => import('@/pages/KundliComparePage'));
const VedicMarriagePage = lazy(() => import('@/pages/VedicMarriagePage'));
const WeddingMuhuratPage = lazy(() => import('@/pages/WeddingMuhuratPage'));

// Muhurta / Panchang
const MuhuratCalendarPage = lazy(() => import('@/pages/MuhuratCalendarPage'));
const EnhancedMuhurtaFinder = lazy(() => import('@/pages/EnhancedMuhurtaFinder'));

// Dasha / Timing
const DashaPage = lazy(() => import('@/pages/DashaPage'));
const MahadashaChildrenPage = lazy(() => import('@/pages/MahadashaChildrenPage'));
const DashaTimelinePage = lazy(() => import('@/pages/DashaTimelinePage'));

// Chart systems
const DivisionalChartsPage = lazy(() => import('@/pages/DivisionalChartsPage'));
const PlanetaryStrengthPage = lazy(() => import('@/pages/PlanetaryStrengthPage'));
const AshtakavargaPage = lazy(() => import('@/pages/AshtakavargaPage'));
const YogasPage = lazy(() => import('@/pages/YogasPage'));
const SadeSatiPage = lazy(() => import('@/pages/SadeSatiPage'));
const VarshaphalPage = lazy(() => import('@/pages/VarshaphalPage'));

// Extended systems
const JaiminiPage = lazy(() => import('@/pages/JaiminiPage'));
const TajikPage = lazy(() => import('@/pages/TajikPage'));
const KPSystemPage = lazy(() => import('@/pages/KPSystemPage'));
const LalKitabPage = lazy(() => import('@/pages/LalKitabPage'));
const NadiAstrologyPage = lazy(() => import('@/pages/NadiAstrologyPage'));
const HoraryAstrologyPage = lazy(() => import('@/pages/HoraryAstrologyPage'));
const BV_RamanPage = lazy(() => import('@/pages/BV_RamanPage'));
const RamanArchivePage = lazy(() => import('@/pages/RamanArchivePage'));
const KanchiPage = lazy(() => import('@/pages/KanchiPage'));

// Life domains
const LoveAstrologyPage = lazy(() => import('@/pages/LoveAstrologyPage'));
const BusinessAstrologyPage = lazy(() => import('@/pages/BusinessAstrologyPage'));
const MedicalAstrologyPage = lazy(() => import('@/pages/MedicalAstrologyPage'));
const FinancialAstrologyPage = lazy(() => import('@/pages/FinancialAstrologyPage'));
const WesternAstrologyPage = lazy(() => import('@/pages/WesternAstrologyPage'));
const ChineseAstrologyPage = lazy(() => import('@/pages/ChineseAstrologyPage'));
const NumerologyPage = lazy(() => import('@/pages/NumerologyPage'));
const ComparativeAstrologyPage = lazy(() => import('@/pages/ComparativeAstrologyPage'));
const WorldAstrologyPage = lazy(() => import('@/pages/WorldAstrologyPage'));
const ElectionalAstrologyPage = lazy(() => import('@/pages/ElectionalAstrologyPage'));
const MundaneAstrologyPage = lazy(() => import('@/pages/MundaneAstrologyPage'));

// Remedies / Accessories
const RemediesPage = lazy(() => import('@/pages/RemediesPage'));
const SpiritualRemediesPage = lazy(() => import('@/pages/SpiritualRemediesPage'));
const GemstonePage = lazy(() => import('@/pages/GemstonePage'));
const NakshatraPrecautionsPage = lazy(() => import('@/pages/NakshatraPrecautionsPage'));
const LuckyElementsPage = lazy(() => import('@/pages/LuckyElementsPage'));

// Transits
const DynamicTransitPage = lazy(() => import('@/pages/DynamicTransitPage'));
const TransitAnalysisPage = lazy(() => import('@/pages/TransitAnalysisPage'));
const EventTransitPage = lazy(() => import('@/pages/EventTransitPage'));

// AI / Predictions
const AIPredictionsPage = lazy(() => import('@/pages/AIPredictionsPage'));

// Knowledge base
const KnowledgeBase = lazy(() => import('@/pages/knowledge/KnowledgeBase'));
const KnowledgeAdd = lazy(() => import('@/pages/knowledge/KnowledgeAdd'));
const KnowledgeIngest = lazy(() => import('@/pages/knowledge/KnowledgeIngest'));
const KnowledgeUpload = lazy(() => import('@/pages/knowledge/KnowledgeUpload'));
const KnowledgeExport = lazy(() => import('@/pages/knowledge/KnowledgeExport'));

// Platform / Community
const ConsultationPage = lazy(() => import('@/pages/ConsultationPage'));
const LearningPlatformPage = lazy(() => import('@/pages/LearningPlatformPage'));
const AstrologerMarketplacePage = lazy(() => import('@/pages/AstrologerMarketplacePage'));
const CommunityPage = lazy(() => import('@/pages/CommunityPage'));
const AllFeaturesPage = lazy(() => import('@/pages/AllFeaturesPage'));
const APIDocumentationPage = lazy(() => import('@/pages/APIDocumentationPage'));
const EnterprisePage = lazy(() => import('@/pages/EnterprisePage'));
const EnterpriseAdminPage = lazy(() => import('@/pages/EnterpriseAdminPage'));
const MobileAppPage = lazy(() => import('@/pages/MobileAppPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const FestivalCalendarPage = lazy(() => import('@/pages/FestivalCalendarPage'));
const BabyNameSuggestionsPage = lazy(() => import('@/pages/BabyNameSuggestionsPage'));
const VaastuAssessmentPage = lazy(() => import('@/pages/VaastuAssessmentPage'));

// User / Personal
const MyReadingsPage = lazy(() => import('@/pages/MyReadingsPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const VidhyaKarmaDarshanPage = lazy(() => import('@/pages/VidhyaKarmaDarshanPage'));
const VedicAPage = lazy(() => import('@/pages/VedicAPage'));

// Admin / Analytics
const AnalyticsDashboard = lazy(() => import('@/pages/AnalyticsDashboard'));
const FeatureRequestPortal = lazy(() => import('@/pages/FeatureRequestPortal'));
const FeedbackDashboard = lazy(() => import('@/pages/FeedbackDashboard'));
const QuickWinsDashboard = lazy(() => import('@/pages/QuickWinsDashboard'));
const MTSSPanel = lazy(() => import('@/components/MTSSPanel'));

// Alternate landings
const LandingPageV2 = lazy(() => import('@/pages/LandingPageV2'));
const IndexPage = lazy(() => import('@/pages/Index'));

// Utility
const NotFound = lazy(() => import('@/pages/NotFound'));

// ─── Route definitions ────────────────────────────────────────────────────────

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

export const routes: RouteConfig[] = [
  // Landing
  { path: '/', element: <LandingPageV3 /> },
  { path: '/app', element: <IndexPage /> },
  { path: '/welcome', element: <LandingPageV2 /> },
  { path: '/landing-classic', element: <LandingPage /> },

  // Redirects (canonical URLs)
  { path: '/landing-v3', element: <Navigate to="/" replace /> },
  { path: '/landing-v2', element: <Navigate to="/welcome" replace /> },
  { path: '/vimshottari-dasha', element: <Navigate to="/dasha" replace /> },
  { path: '/enhanced-ashtakavarga', element: <Navigate to="/ashtakavarga" replace /> },
  { path: '/yogas-identification', element: <Navigate to="/yogas" replace /> },
  { path: '/kundli', element: <Navigate to="/horoscope" replace /> },
  { path: '/transit', element: <Navigate to="/dynamic-transit" replace /> },
  { path: '/kaal-sarp', element: <Navigate to="/kaalsarp" replace /> },
  { path: '/career', element: <Navigate to="/career-astrology" replace /> },
  { path: '/divisional', element: <Navigate to="/divisional-charts" replace /> },
  { path: '/prasna', element: <Navigate to="/prashna" replace /> },
  { path: '/index', element: <Navigate to="/app" replace /> },
  { path: '/vedic-marriage', element: <Navigate to="/marriage" replace /> },

  // ── Core features (Week 3: Kundli + Prashna + Matchmaking + Panchang) ─────
  { path: '/horoscope', element: <HoroscopePage /> },
  { path: '/panchang', element: <PanchangPage /> },
  { path: '/matchmaking', element: <MatchMaking /> },
  { path: '/question', element: <QuestionPage /> },
  { path: '/prashna', element: <QuestionPage /> },
  { path: '/prashna-ai', element: <PrashnaEngine /> },
  { path: '/prashna-history', element: <PrashnaHistory /> },
  { path: '/prashna/history', element: <PrashnaHistory /> },

  // ── Matchmaking variants ────────────────────────────────────────────────────
  { path: '/enhanced-matchmaking', element: <EnhancedKundliMilan /> },
  { path: '/kundli-compare', element: <KundliComparePage /> },
  { path: '/marriage', element: <VedicMarriagePage /> },
  { path: '/wedding-muhurat', element: <WeddingMuhuratPage /> },

  // ── Muhurta ─────────────────────────────────────────────────────────────────
  { path: '/muhurat', element: <MuhuratCalendarPage /> },
  { path: '/enhanced-muhurat', element: <EnhancedMuhurtaFinder /> },

  // ── Dasha / Timing ──────────────────────────────────────────────────────────
  { path: '/dasha', element: <DashaPage /> },
  { path: '/mahadasha-children', element: <MahadashaChildrenPage /> },
  { path: '/dasha-timeline', element: <DashaTimelinePage /> },

  // ── Chart systems ───────────────────────────────────────────────────────────
  { path: '/divisional-charts', element: <DivisionalChartsPage /> },
  { path: '/planetary-strength', element: <PlanetaryStrengthPage /> },
  { path: '/ashtakavarga', element: <AshtakavargaPage /> },
  { path: '/yogas', element: <YogasPage /> },
  { path: '/sade-sati', element: <SadeSatiPage /> },
  { path: '/varshaphal', element: <VarshaphalPage /> },
  { path: '/comprehensive', element: <ComprehensiveReportPage /> },

  // ── Extended systems ────────────────────────────────────────────────────────
  { path: '/jaimini', element: <JaiminiPage /> },
  { path: '/tajik', element: <TajikPage /> },
  { path: '/kp-system', element: <KPSystemPage /> },
  { path: '/lal-kitab', element: <LalKitabPage /> },
  { path: '/nadi-astrology', element: <NadiAstrologyPage /> },
  { path: '/horary', element: <HoraryAstrologyPage /> },
  { path: '/bv-raman', element: <BV_RamanPage /> },
  { path: '/raman-archive', element: <RamanArchivePage /> },
  { path: '/kanchi', element: <KanchiPage /> },

  // ── Life domains ────────────────────────────────────────────────────────────
  { path: '/love-astrology', element: <LoveAstrologyPage /> },
  { path: '/career-astrology', element: <CareerAstrology /> },
  { path: '/business-astrology', element: <BusinessAstrologyPage /> },
  { path: '/medical-astrology', element: <MedicalAstrologyPage /> },
  { path: '/financial-astrology', element: <FinancialAstrologyPage /> },
  { path: '/western-astrology', element: <WesternAstrologyPage /> },
  { path: '/chinese-astrology', element: <ChineseAstrologyPage /> },
  { path: '/numerology', element: <NumerologyPage /> },
  { path: '/comparative-astrology', element: <ComparativeAstrologyPage /> },
  { path: '/world-astrology', element: <WorldAstrologyPage /> },
  { path: '/electional-astrology', element: <ElectionalAstrologyPage /> },
  { path: '/mundane-astrology', element: <MundaneAstrologyPage /> },
  { path: '/kaalsarp', element: <KaalSarpPage /> },

  // ── Remedies / Accessories ──────────────────────────────────────────────────
  { path: '/remedies', element: <RemediesPage /> },
  { path: '/spiritual-remedies', element: <SpiritualRemediesPage /> },
  { path: '/gemstones', element: <GemstonePage /> },
  { path: '/nakshatra-precautions', element: <NakshatraPrecautionsPage /> },
  { path: '/lucky-elements', element: <LuckyElementsPage /> },

  // ── Transits ────────────────────────────────────────────────────────────────
  { path: '/dynamic-transit', element: <DynamicTransitPage /> },
  { path: '/transit-analysis', element: <TransitAnalysisPage /> },
  { path: '/event-transit', element: <EventTransitPage /> },

  // ── AI ──────────────────────────────────────────────────────────────────────
  { path: '/ai-predictions', element: <AIPredictionsPage /> },

  // ── Knowledge ───────────────────────────────────────────────────────────────
  { path: '/knowledge', element: <KnowledgeBase /> },
  { path: '/knowledge/add', element: <KnowledgeAdd /> },
  { path: '/knowledge/ingest', element: <KnowledgeIngest /> },
  { path: '/knowledge/upload', element: <KnowledgeUpload /> },
  { path: '/knowledge/export', element: <KnowledgeExport /> },

  // ── Platform / Community ────────────────────────────────────────────────────
  { path: '/consultation', element: <ConsultationPage /> },
  { path: '/learn', element: <LearningPlatformPage /> },
  { path: '/marketplace', element: <AstrologerMarketplacePage /> },
  { path: '/community', element: <CommunityPage /> },
  { path: '/features', element: <AllFeaturesPage /> },
  { path: '/api-docs', element: <APIDocumentationPage /> },
  { path: '/enterprise', element: <EnterprisePage /> },
  { path: '/enterprise-admin', element: <EnterpriseAdminPage /> },
  { path: '/mobile-app', element: <MobileAppPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/festival-calendar', element: <FestivalCalendarPage /> },
  { path: '/baby-names', element: <BabyNameSuggestionsPage /> },
  { path: '/vaastu', element: <VaastuAssessmentPage /> },

  // ── User / Personal ─────────────────────────────────────────────────────────
  { path: '/my-readings', element: <MyReadingsPage /> },
  { path: '/feedback', element: <FeedbackPage /> },
  { path: '/vidhya-karma', element: <VidhyaKarmaDarshanPage /> },
  { path: '/vedic-a', element: <VedicAPage /> },

  // ── Admin / Internal ────────────────────────────────────────────────────────
  { path: '/analytics', element: <AnalyticsDashboard /> },
  { path: '/feature-requests', element: <FeatureRequestPortal /> },
  { path: '/feedback-dashboard', element: <FeedbackDashboard /> },
  { path: '/quick-wins', element: <QuickWinsDashboard /> },
  { path: '/mtss', element: <MTSSPanel /> },

  // ── Auth ─────────────────────────────────────────────────────────────────────
  { path: '/sign-in/*', element: <SignInPage /> },
  { path: '/sign-up/*', element: <SignUpPage /> },

  // 404
  { path: '*', element: <NotFound /> },
];
