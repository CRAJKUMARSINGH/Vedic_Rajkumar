import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import {
  type NavLink,
  DESKTOP_NAV_LINKS,
  MOBILE_SHEET_NAV_LINKS,
  BOTTOM_BAR_NAV_LINKS,
  getFeatureByPath,
} from '@/routes/featureRegistry';

export type { NavLink };
export { DESKTOP_NAV_LINKS, MOBILE_SHEET_NAV_LINKS, BOTTOM_BAR_NAV_LINKS };

export type AppRoute = {
  path: string;
  element: JSX.Element;
};

const LandingPageV3 = lazy(() => import('@/pages/LandingPageV3'));
const CareerAstrology = lazy(() => import('@/pages/CareerAstrology'));
const KaalSarpPage = lazy(() => import('@/pages/KaalSarpPage'));
const ComprehensiveReportPage = lazy(() => import('@/pages/ComprehensiveReportPage'));
const SignInPage = lazy(() => import('@/pages/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/SignUpPage'));
const MatchMaking = lazy(() => import('@/pages/MatchMaking'));
const EnhancedKundliMilan = lazy(() => import('@/pages/EnhancedKundliMilan'));
const VaastuAssessmentPage = lazy(() => import('@/pages/VaastuAssessmentPage'));
const MuhuratCalendarPage = lazy(() => import('@/pages/MuhuratCalendarPage'));
const EnhancedMuhurtaFinder = lazy(() => import('@/pages/EnhancedMuhurtaFinder'));
const BabyNameSuggestionsPage = lazy(() => import('@/pages/BabyNameSuggestionsPage'));
const LuckyElementsPage = lazy(() => import('@/pages/LuckyElementsPage'));
const FestivalCalendarPage = lazy(() => import('@/pages/FestivalCalendarPage'));
const MTSSPanel = lazy(() => import('@/components/MTSSPanel'));
const AnalyticsDashboard = lazy(() => import('@/pages/AnalyticsDashboard'));
const FeatureRequestPortal = lazy(() => import('@/pages/FeatureRequestPortal'));
const FeedbackDashboard = lazy(() => import('@/pages/FeedbackDashboard'));
const QuickWinsDashboard = lazy(() => import('@/pages/QuickWinsDashboard'));
const DashaPage = lazy(() => import('@/pages/DashaPage'));
const JaiminiPage = lazy(() => import('@/pages/JaiminiPage'));
const TajikPage = lazy(() => import('@/pages/TajikPage'));
const BusinessAstrologyPage = lazy(() => import('@/pages/BusinessAstrologyPage'));
const RemediesPage = lazy(() => import('@/pages/RemediesPage'));
const DivisionalChartsPage = lazy(() => import('@/pages/DivisionalChartsPage'));
const PlanetaryStrengthPage = lazy(() => import('@/pages/PlanetaryStrengthPage'));
const HoroscopePage = lazy(() => import('@/pages/HoroscopePage'));
const YogasPage = lazy(() => import('@/pages/YogasPage'));
const LalKitabPage = lazy(() => import('@/pages/LalKitabPage'));
const KPSystemPage = lazy(() => import('@/pages/KPSystemPage'));
const LoveAstrologyPage = lazy(() => import('@/pages/LoveAstrologyPage'));
const NadiAstrologyPage = lazy(() => import('@/pages/NadiAstrologyPage'));
const WesternAstrologyPage = lazy(() => import('@/pages/WesternAstrologyPage'));
const ChineseAstrologyPage = lazy(() => import('@/pages/ChineseAstrologyPage'));
const AIPredictionsPage = lazy(() => import('@/pages/AIPredictionsPage'));
const HoraryAstrologyPage = lazy(() => import('@/pages/HoraryAstrologyPage'));
const MedicalAstrologyPage = lazy(() => import('@/pages/MedicalAstrologyPage'));
const NumerologyPage = lazy(() => import('@/pages/NumerologyPage'));
const FinancialAstrologyPage = lazy(() => import('@/pages/FinancialAstrologyPage'));
const LearningPlatformPage = lazy(() => import('@/pages/LearningPlatformPage'));
const AstrologerMarketplacePage = lazy(() => import('@/pages/AstrologerMarketplacePage'));
const CommunityPage = lazy(() => import('@/pages/CommunityPage'));
const AllFeaturesPage = lazy(() => import('@/pages/AllFeaturesPage'));
const APIDocumentationPage = lazy(() => import('@/pages/APIDocumentationPage'));
const SpiritualRemediesPage = lazy(() => import('@/pages/SpiritualRemediesPage'));
const PanchangPage = lazy(() => import('@/pages/PanchangPage'));
const ComparativeAstrologyPage = lazy(() => import('@/pages/ComparativeAstrologyPage'));
const WorldAstrologyPage = lazy(() => import('@/pages/WorldAstrologyPage'));
const ElectionalAstrologyPage = lazy(() => import('@/pages/ElectionalAstrologyPage'));
const MundaneAstrologyPage = lazy(() => import('@/pages/MundaneAstrologyPage'));
const SadeSatiPage = lazy(() => import('@/pages/SadeSatiPage'));
const AshtakavargaPage = lazy(() => import('@/pages/AshtakavargaPage'));
const GemstonePage = lazy(() => import('@/pages/GemstonePage'));
const EnterprisePage = lazy(() => import('@/pages/EnterprisePage'));
const VarshaphalPage = lazy(() => import('@/pages/VarshaphalPage'));
const BV_RamanPage = lazy(() => import('@/pages/BV_RamanPage'));
const RamanArchivePage = lazy(() => import('@/pages/RamanArchivePage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const EnterpriseAdminPage = lazy(() => import('@/pages/EnterpriseAdminPage'));
const MobileAppPage = lazy(() => import('@/pages/MobileAppPage'));
const MahadashaChildrenPage = lazy(() => import('@/pages/MahadashaChildrenPage'));
const DynamicTransitPage = lazy(() => import('@/pages/DynamicTransitPage'));
const ConsultationPage = lazy(() => import('@/pages/ConsultationPage'));
const QuestionPage = lazy(() => import('@/pages/QuestionPage'));
const KnowledgeBase = lazy(() => import('@/pages/knowledge/KnowledgeBase'));
const KnowledgeAdd = lazy(() => import('@/pages/knowledge/KnowledgeAdd'));
const KnowledgeIngest = lazy(() => import('@/pages/knowledge/KnowledgeIngest'));
const KnowledgeUpload = lazy(() => import('@/pages/knowledge/KnowledgeUpload'));
const KnowledgeExport = lazy(() => import('@/pages/knowledge/KnowledgeExport'));
const PrashnaEngine = lazy(() => import('@/pages/prashna/PrashnaEngine'));
const PrashnaHistory = lazy(() => import('@/pages/prashna/PrashnaHistory'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const KanchiPage = lazy(() => import('@/pages/KanchiPage'));
const NakshatraPrecautionsPage = lazy(() => import('@/pages/NakshatraPrecautionsPage'));
const MyReadingsPage = lazy(() => import('@/pages/MyReadingsPage'));
const KundliComparePage = lazy(() => import('@/pages/KundliComparePage'));
const WeddingMuhuratPage = lazy(() => import('@/pages/WeddingMuhuratPage'));
const DashaTimelinePage = lazy(() => import('@/pages/DashaTimelinePage'));
const VedicMarriagePage = lazy(() => import('@/pages/VedicMarriagePage'));
const VidhyaKarmaDarshanPage = lazy(() => import('@/pages/VidhyaKarmaDarshanPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const IndexPage = lazy(() => import('@/pages/Index'));
const VedicAPage = lazy(() => import('@/pages/VedicAPage'));
const PriyanshMuhuratPage = lazy(() => import('@/pages/PriyanshMuhuratPage'));

function route(path: string, element: JSX.Element): AppRoute {
  return { path, element };
}

export const APP_ROUTES: AppRoute[] = [
  route('/', <LandingPageV3 />),
  route('/welcome', <Navigate to="/" replace />),
  route('/landing-classic', <Navigate to="/" replace />),
  route('/landing-v3', <Navigate to="/" replace />),
  route('/landing-v2', <Navigate to="/" replace />),
  route('/career-astrology', <CareerAstrology />),
  route('/kaalsarp', <KaalSarpPage />),
  route('/comprehensive', <ComprehensiveReportPage />),
  route('/matchmaking', <MatchMaking />),
  route('/enhanced-matchmaking', <EnhancedKundliMilan />),
  route('/vaastu', <VaastuAssessmentPage />),
  route('/muhurat', <MuhuratCalendarPage />),
  route('/enhanced-muhurat', <EnhancedMuhurtaFinder />),
  route('/baby-names', <BabyNameSuggestionsPage />),
  route('/lucky-elements', <LuckyElementsPage />),
  route('/festival-calendar', <FestivalCalendarPage />),
  route('/analytics', <AnalyticsDashboard />),
  route('/feature-requests', <FeatureRequestPortal />),
  route('/feedback-dashboard', <FeedbackDashboard />),
  route('/quick-wins', <QuickWinsDashboard />),
  route('/dasha', <DashaPage />),
  route('/jaimini', <JaiminiPage />),
  route('/tajik', <TajikPage />),
  route('/business-astrology', <BusinessAstrologyPage />),
  route('/remedies', <RemediesPage />),
  route('/divisional-charts', <DivisionalChartsPage />),
  route('/planetary-strength', <PlanetaryStrengthPage />),
  route('/horoscope', <HoroscopePage />),
  route('/yogas', <YogasPage />),
  route('/lal-kitab', <LalKitabPage />),
  route('/kp-system', <KPSystemPage />),
  route('/love-astrology', <LoveAstrologyPage />),
  route('/nadi-astrology', <NadiAstrologyPage />),
  route('/western-astrology', <WesternAstrologyPage />),
  route('/chinese-astrology', <ChineseAstrologyPage />),
  route('/ai-predictions', <AIPredictionsPage />),
  route('/horary', <HoraryAstrologyPage />),
  route('/medical-astrology', <MedicalAstrologyPage />),
  route('/numerology', <NumerologyPage />),
  route('/financial-astrology', <FinancialAstrologyPage />),
  route('/learn', <LearningPlatformPage />),
  route('/marketplace', <AstrologerMarketplacePage />),
  route('/community', <CommunityPage />),
  route('/features', <AllFeaturesPage />),
  route('/api-docs', <APIDocumentationPage />),
  route('/panchang', <PanchangPage />),
  route('/comparative-astrology', <ComparativeAstrologyPage />),
  route('/world-astrology', <WorldAstrologyPage />),
  route('/electional-astrology', <ElectionalAstrologyPage />),
  route('/mundane-astrology', <MundaneAstrologyPage />),
  route('/sade-sati', <SadeSatiPage />),
  route('/ashtakavarga', <AshtakavargaPage />),
  route('/gemstones', <GemstonePage />),
  route('/enterprise', <EnterprisePage />),
  route('/varshaphal', <VarshaphalPage />),
  route('/bv-raman', <BV_RamanPage />),
  route('/raman-archive', <RamanArchivePage />),
  route('/feedback', <FeedbackPage />),
  route('/enterprise-admin', <EnterpriseAdminPage />),
  route('/mobile-app', <MobileAppPage />),
  route('/vimshottari-dasha', <Navigate to="/dasha" replace />),
  route('/enhanced-ashtakavarga', <Navigate to="/ashtakavarga" replace />),
  route('/yogas-identification', <Navigate to="/yogas" replace />),
  route('/kundli', <Navigate to="/horoscope" replace />),
  route('/transit', <Navigate to="/dynamic-transit" replace />),
  route('/kaal-sarp', <Navigate to="/kaalsarp" replace />),
  route('/career', <Navigate to="/career-astrology" replace />),
  route('/divisional', <Navigate to="/divisional-charts" replace />),
  route('/prasna', <Navigate to="/prashna-ai" replace />),
  route('/spiritual-remedies', <SpiritualRemediesPage />),
  route('/mahadasha-children', <MahadashaChildrenPage />),
  route('/dynamic-transit', <DynamicTransitPage />),
  route('/consultation', <ConsultationPage />),
  route('/question', <QuestionPage />),
  route('/prashna', <Navigate to="/prashna-ai" replace />),
  route('/knowledge', <KnowledgeBase />),
  route('/knowledge/add', <KnowledgeAdd />),
  route('/knowledge/ingest', <KnowledgeIngest />),
  route('/knowledge/upload', <KnowledgeUpload />),
  route('/knowledge/export', <KnowledgeExport />),
  route('/prashna-ai', <PrashnaEngine />),
  route('/prashna-history', <PrashnaHistory />),
  route('/prashna/history', <PrashnaHistory />),
  route('/pricing', <PricingPage />),
  route('/marriage', <Navigate to="/vedic-marriage" replace />),
  route('/kanchi', <KanchiPage />),
  route('/vedic-marriage', <VedicMarriagePage />),
  route('/kundli-compare', <KundliComparePage />),
  route('/wedding-muhurat', <WeddingMuhuratPage />),
  route('/dasha-timeline', <DashaTimelinePage />),
  route('/mtss', <MTSSPanel />),
  route('/vidhya-karma', <VidhyaKarmaDarshanPage />),
  route('/nakshatra-precautions', <NakshatraPrecautionsPage />),
  route('/my-readings', <MyReadingsPage />),
  route('/index', <IndexPage />),
  route('/vedic-a', <VedicAPage />),
  route('/priyansh-joining-muhurat', <PriyanshMuhuratPage />),
  route('/sign-in/*', <SignInPage />),
  route('/sign-up/*', <SignUpPage />),
  route('*', <NotFound />),
];

/** Breadcrumb labels from the feature registry (falls back to path segment). */
export function getRouteLabel(path: string, lang: 'en' | 'hi' = 'en'): string {
  const feature = getFeatureByPath(path);
  if (feature) {
    return lang === 'hi' ? feature.labelHi : feature.label;
  }
  return path;
}
