/**
 * Central route configuration — Week 3 scope reduction.
 *
 * ACTIVE   — the 4 core features + their sub-pages + infra routes
 * ARCHIVED — every other page is replaced with <ComingSoon> so URLs
 *            stay alive (no hard 404s) but set honest expectations.
 * INTERNAL — admin/analytics pages redirect to /app (not public).
 *
 * When a feature graduates from Coming Soon:
 *   1. Remove its lazy import from the ARCHIVED section comment.
 *   2. Add it back as a lazy import at the top.
 *   3. Replace the ComingSoon element with the real component.
 */

import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ComingSoon from '@/pages/ComingSoon';

// ─── Eagerly-loaded (in main bundle) ─────────────────────────────────────────
import LandingPageV3 from '@/pages/LandingPageV3';
import SignInPage    from '@/pages/SignInPage';
import SignUpPage    from '@/pages/SignUpPage';

// ─── Core Feature 1: Kundli / Birth Chart ─────────────────────────────────────
const HoroscopePage    = lazy(() => import('@/pages/HoroscopePage'));

// ─── Core Feature 2: Prashna (Horary / Ask AI) ───────────────────────────────
const QuestionPage     = lazy(() => import('@/pages/QuestionPage'));
const PrashnaEngine    = lazy(() => import('@/pages/prashna/PrashnaEngine'));
const PrashnaHistory   = lazy(() => import('@/pages/prashna/PrashnaHistory'));

// ─── Core Feature 3: Matchmaking (Kundli Milan) ──────────────────────────────
const MatchMaking           = lazy(() => import('@/pages/MatchMaking'));
const EnhancedKundliMilan   = lazy(() => import('@/pages/EnhancedKundliMilan'));
const KundliComparePage     = lazy(() => import('@/pages/KundliComparePage'));
const VedicMarriagePage     = lazy(() => import('@/pages/VedicMarriagePage'));
const WeddingMuhuratPage    = lazy(() => import('@/pages/WeddingMuhuratPage'));

// ─── Core Feature 4: Panchang + Muhurta ──────────────────────────────────────
const PanchangPage           = lazy(() => import('@/pages/PanchangPage'));
const MuhuratCalendarPage    = lazy(() => import('@/pages/MuhuratCalendarPage'));
const EnhancedMuhurtaFinder  = lazy(() => import('@/pages/EnhancedMuhurtaFinder'));

// ─── Dasha (closely tied to Kundli core — keep active) ───────────────────────
const DashaPage                  = lazy(() => import('@/pages/DashaPage'));
const DashaTimelinePage          = lazy(() => import('@/pages/DashaTimelinePage'));
const DashaTransitTimelinePage   = lazy(() => import('@/pages/DashaTransitTimelinePage'));
const MahadashaChildrenPage      = lazy(() => import('@/pages/MahadashaChildrenPage'));

// ─── Week 5-6: Chart systems, life domains, remedies, transits ───────────────
const VarshaphalPage         = lazy(() => import('@/pages/VarshaphalPage'));
const DivisionalChartsPage   = lazy(() => import('@/pages/DivisionalChartsPage'));
const PlanetaryStrengthPage  = lazy(() => import('@/pages/PlanetaryStrengthPage'));
const AshtakavargaPage       = lazy(() => import('@/pages/AshtakavargaPage'));
const SadeSatiPage           = lazy(() => import('@/pages/SadeSatiPage'));
const KaalSarpPage           = lazy(() => import('@/pages/KaalSarpPage'));
const YogasPage              = lazy(() => import('@/pages/YogasPage'));
const CareerAstrologyPage    = lazy(() => import('@/pages/CareerAstrology'));
const LoveAstrologyPage      = lazy(() => import('@/pages/LoveAstrologyPage'));
const RemediesPage           = lazy(() => import('@/pages/RemediesPage'));
const SpiritualRemediesPage  = lazy(() => import('@/pages/SpiritualRemediesPage'));
const GemstoneRecommendPage  = lazy(() => import('@/pages/GemstonePage'));
const NakshatraPrecautionsPage = lazy(() => import('@/pages/NakshatraPrecautionsPage'));
const DynamicTransitPage     = lazy(() => import('@/pages/DynamicTransitPage'));
const TransitAnalysisPage    = lazy(() => import('@/pages/TransitAnalysisPage'));
const EventTransitPage       = lazy(() => import('@/pages/EventTransitPage'));

// ─── Week 7-8: Advanced features, classical systems, AI ──────────────────────
const ComprehensiveReportPage  = lazy(() => import('@/pages/ComprehensiveReportPage'));
const KPSystemPage             = lazy(() => import('@/pages/KPSystemPage'));
const BusinessAstrologyPage    = lazy(() => import('@/pages/BusinessAstrologyPage'));
const NumerologyPage           = lazy(() => import('@/pages/NumerologyPage'));
const ElectionalAstrologyPage  = lazy(() => import('@/pages/ElectionalAstrologyPage'));
const FestivalCalendarPage     = lazy(() => import('@/pages/FestivalCalendarPage'));
const VidhyaKarmaDarshanPage   = lazy(() => import('@/pages/VidhyaKarmaDarshanPage'));
const AIPredictionsPage        = lazy(() => import('@/pages/AIPredictionsPage'));
const LuckyElementsPage        = lazy(() => import('@/pages/LuckyElementsPage'));
const JaiminiPage              = lazy(() => import('@/pages/JaiminiPage'));
const TajikPage                = lazy(() => import('@/pages/TajikPage'));
const MedicalAstrologyPage     = lazy(() => import('@/pages/MedicalAstrologyPage'));
const FinancialAstrologyPage   = lazy(() => import('@/pages/FinancialAstrologyPage'));
const LalKitabPage             = lazy(() => import('@/pages/LalKitabPage'));
const BabyNameSuggestionsPage  = lazy(() => import('@/pages/BabyNameSuggestionsPage'));
const HoraryAstrologyPage      = lazy(() => import('@/pages/HoraryAstrologyPage'));
const ConsultationPage         = lazy(() => import('@/pages/ConsultationPage'));

// ─── Week 9-10: World systems, platform, community ───────────────────────────
const NadiAstrologyPage        = lazy(() => import('@/pages/NadiAstrologyPage'));
const BV_RamanPage             = lazy(() => import('@/pages/BV_RamanPage'));
const RamanArchivePage         = lazy(() => import('@/pages/RamanArchivePage'));
const KanchiPage               = lazy(() => import('@/pages/KanchiPage'));
const WesternAstrologyPage     = lazy(() => import('@/pages/WesternAstrologyPage'));
const ComparativeAstrologyPage = lazy(() => import('@/pages/ComparativeAstrologyPage'));
const WorldAstrologyPage       = lazy(() => import('@/pages/WorldAstrologyPage'));
const MundaneAstrologyPage     = lazy(() => import('@/pages/MundaneAstrologyPage'));
const LearningPlatformPage     = lazy(() => import('@/pages/LearningPlatformPage'));
const AstrologerMarketplacePage = lazy(() => import('@/pages/AstrologerMarketplacePage'));
const VaastuAssessmentPage     = lazy(() => import('@/pages/VaastuAssessmentPage'));
const APIDocumentationPage     = lazy(() => import('@/pages/APIDocumentationPage'));
const EnterprisePage           = lazy(() => import('@/pages/EnterprisePage'));
const VedicAPage               = lazy(() => import('@/pages/VedicAPage'));
const ChineseAstrologyPage     = lazy(() => import('@/pages/ChineseAstrologyPage'));
const MobileAppPage            = lazy(() => import('@/pages/MobileAppPage'));
const CommunityPage            = lazy(() => import('@/pages/CommunityPage'));

// ─── Infra / User pages ───────────────────────────────────────────────────────
const IndexPage       = lazy(() => import('@/pages/Index'));
const MyReadingsPage  = lazy(() => import('@/pages/MyReadingsPage'));
const FeedbackPage    = lazy(() => import('@/pages/FeedbackPage'));
const PricingPage     = lazy(() => import('@/pages/PricingPage'));
const AllFeaturesPage = lazy(() => import('@/pages/AllFeaturesPage'));
const NotFound        = lazy(() => import('@/pages/NotFound'));
const PriyanshMuhuratPage = lazy(() => import('@/pages/PriyanshMuhuratPage'));
const PrivacyPolicyPage   = lazy(() => import('@/pages/PrivacyPolicyPage'));
const TermsOfServicePage  = lazy(() => import('@/pages/TermsOfServicePage'));
const PrivacySettingsPage = lazy(() => import('@/pages/PrivacySettingsPage'));
// ─── Internal / Engineering pages ─────────────────────────────────────────────────────────
const ValidationDashboardPage = lazy(() => import('@/pages/ValidationDashboardPage'));
const AccuracyDashboardPage   = lazy(() => import('@/pages/AccuracyDashboardPage'));

// ─── Supplement / Synthesis pages ─────────────────────────────────────────────
const SupplementsPage             = lazy(() => import('@/pages/SupplementsPage'));
const SynthesisPage               = lazy(() => import('@/pages/SynthesisPage'));
const ShadbalaSupplementPage      = lazy(() => import('@/pages/ShadbalaSupplementPage'));
const JaiminiSupplementPage       = lazy(() => import('@/pages/JaiminiSupplementPage'));
const YogaInsightsSupplementPage  = lazy(() => import('@/pages/YogaInsightsSupplementPage'));
const PsychologicalProfilePage    = lazy(() => import('@/pages/PsychologicalProfilePage'));

// ─── Route config type ────────────────────────────────────────────────────────
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route table
// ─────────────────────────────────────────────────────────────────────────────
export const routes: RouteConfig[] = [

  // ── Landing / shell ─────────────────────────────────────────────────────────
  { path: '/',                element: <LandingPageV3 /> },
  { path: '/app',             element: <IndexPage /> },
  { path: '/welcome',         element: <Navigate to="/" replace /> },

  // ── Canonical redirects (keep old URLs alive) ────────────────────────────────
  { path: '/landing-v3',          element: <Navigate to="/"           replace /> },
  { path: '/landing-v2',          element: <Navigate to="/"           replace /> },
  { path: '/kundli',              element: <Navigate to="/horoscope"   replace /> },
  { path: '/prasna',              element: <Navigate to="/prashna"     replace /> },
  { path: '/vedic-marriage',      element: <Navigate to="/marriage"    replace /> },
  { path: '/index',               element: <Navigate to="/app"         replace /> },
  // Internal admin redirects — no public Coming Soon needed
  { path: '/dashboard',           element: <Navigate to="/app" replace /> },
  { path: '/analytics',           element: <Navigate to="/app" replace /> },
  { path: '/feature-requests',    element: <Navigate to="/app" replace /> },
  { path: '/feedback-dashboard',  element: <Navigate to="/app" replace /> },
  { path: '/quick-wins',          element: <Navigate to="/app" replace /> },
  { path: '/mtss',                element: <Navigate to="/app" replace /> },
  // Week 2 — Internal accuracy validation dashboards (no core nav promotion)
  { path: '/validation',          element: <ValidationDashboardPage /> },
  { path: '/accuracy',          element: <AccuracyDashboardPage /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // CORE FEATURE 1 — Kundli / Birth Chart
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/horoscope',           element: <HoroscopePage /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // CORE FEATURE 2 — Prashna (Horary / Ask AI)
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/prashna',             element: <QuestionPage /> },
  { path: '/question',            element: <QuestionPage /> },
  { path: '/prashna-ai',          element: <PrashnaEngine /> },
  { path: '/prashna-history',     element: <PrashnaHistory /> },
  { path: '/prashna/history',     element: <PrashnaHistory /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // CORE FEATURE 3 — Matchmaking (Kundli Milan)
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/matchmaking',         element: <MatchMaking /> },
  { path: '/enhanced-matchmaking',element: <EnhancedKundliMilan /> },
  { path: '/kundli-compare',      element: <KundliComparePage /> },
  { path: '/marriage',            element: <VedicMarriagePage /> },
  { path: '/wedding-muhurat',     element: <WeddingMuhuratPage /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // CORE FEATURE 4 — Panchang + Muhurta
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/panchang',            element: <PanchangPage /> },
  { path: '/muhurat',             element: <MuhuratCalendarPage /> },
  { path: '/enhanced-muhurat',    element: <EnhancedMuhurtaFinder /> },

  // ── Dasha (active — integral to Kundli) ─────────────────────────────────────
  { path: '/dasha',                    element: <DashaPage /> },
  { path: '/dasha-timeline',           element: <DashaTimelinePage /> },
  { path: '/dasha-transit-timeline',   element: <DashaTransitTimelinePage /> },
  { path: '/mahadasha-children',       element: <MahadashaChildrenPage /> },
  // Legacy redirect
  { path: '/vimshottari-dasha',        element: <Navigate to="/dasha" replace /> },

  // ── Infra / User ─────────────────────────────────────────────────────────────
  { path: '/my-readings',         element: <MyReadingsPage /> },
  { path: '/feedback',            element: <FeedbackPage /> },
  { path: '/pricing',             element: <PricingPage /> },

  // ── Auth ─────────────────────────────────────────────────────────────────────
  { path: '/sign-in/*',           element: <SignInPage /> },
  { path: '/sign-up/*',           element: <SignUpPage /> },

  // ── Special Reports ──────────────────────────────────────────────────────────
  { path: '/priyansh-joining-muhurat', element: <PriyanshMuhuratPage /> },
  { path: '/priyansh-muhurat',         element: <Navigate to="/priyansh-joining-muhurat" replace /> },

  // ── Legal ────────────────────────────────────────────────────────────────────
  { path: '/privacy',            element: <PrivacyPolicyPage /> },
  { path: '/terms',              element: <TermsOfServicePage /> },
  { path: '/privacy-settings',   element: <PrivacySettingsPage /> },

  // ── Supplements & Synthesis (active — supplement core features with deep analysis)
  //   These are not the 4 core features but are working end-to-end, so they get
  //   the real page component instead of ComingSoon. Nav does not promote them.
  { path: '/supplements',                       element: <SupplementsPage /> },
  { path: '/supplements/shadbala',              element: <ShadbalaSupplementPage /> },
  { path: '/supplements/jaimini',               element: <JaiminiSupplementPage /> },
  { path: '/supplements/yoga-insights',         element: <YogaInsightsSupplementPage /> },
  { path: '/supplements/psychological-profile', element: <PsychologicalProfilePage /> },
  { path: '/shadbala-supplement',               element: <Navigate to="/supplements/shadbala" replace /> },
  { path: '/jaimini-supplement',                element: <Navigate to="/supplements/jaimini" replace /> },
  { path: '/yoga-insights-supplement',          element: <Navigate to="/supplements/yoga-insights" replace /> },
  { path: '/psychological-profile',             element: <Navigate to="/supplements/psychological-profile" replace /> },
  { path: '/synthesis',                         element: <SynthesisPage /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // WEEK 5 — Chart Analysis Systems
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/divisional-charts',    element: <DivisionalChartsPage /> },
  { path: '/divisional',           element: <Navigate to="/divisional-charts" replace /> },
  { path: '/planetary-strength',   element: <PlanetaryStrengthPage /> },
  { path: '/ashtakavarga',         element: <AshtakavargaPage /> },
  { path: '/sade-sati',            element: <SadeSatiPage /> },
  { path: '/kaalsarp',             element: <KaalSarpPage /> },
  { path: '/kaal-sarp',            element: <Navigate to="/kaalsarp" replace /> },
  { path: '/yogas',                element: <YogasPage /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // WEEK 6 — Timing, Life Domains, Remedies & Transits
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/varshaphal',           element: <VarshaphalPage /> },
  { path: '/career-astrology',     element: <CareerAstrologyPage /> },
  { path: '/career',               element: <Navigate to="/career-astrology" replace /> },
  { path: '/love-astrology',       element: <LoveAstrologyPage /> },
  { path: '/remedies',             element: <RemediesPage /> },
  { path: '/spiritual-remedies',   element: <SpiritualRemediesPage /> },
  { path: '/gemstones',            element: <GemstoneRecommendPage /> },
  { path: '/nakshatra-precautions', element: <NakshatraPrecautionsPage /> },
  { path: '/dynamic-transit',      element: <DynamicTransitPage /> },
  { path: '/transit',              element: <Navigate to="/dynamic-transit" replace /> },
  { path: '/transit-analysis',     element: <TransitAnalysisPage /> },
  { path: '/event-transit',        element: <EventTransitPage /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // WEEK 7 — Advanced Features, Classical Systems & AI
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/comprehensive',        element: <ComprehensiveReportPage /> },
  { path: '/kp-system',            element: <KPSystemPage /> },
  { path: '/business-astrology',   element: <BusinessAstrologyPage /> },
  { path: '/numerology',           element: <NumerologyPage /> },
  { path: '/electional-astrology', element: <ElectionalAstrologyPage /> },
  { path: '/festival-calendar',    element: <FestivalCalendarPage /> },
  { path: '/vidhya-karma',         element: <VidhyaKarmaDarshanPage /> },
  { path: '/ai-predictions',       element: <AIPredictionsPage /> },
  { path: '/lucky-elements',       element: <LuckyElementsPage /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // WEEK 8 — Classical Systems & Extended Modules
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/jaimini',              element: <JaiminiPage /> },
  { path: '/tajik',                element: <TajikPage /> },
  { path: '/medical-astrology',    element: <MedicalAstrologyPage /> },
  { path: '/financial-astrology',  element: <FinancialAstrologyPage /> },
  { path: '/lal-kitab',            element: <LalKitabPage /> },
  { path: '/baby-names',           element: <BabyNameSuggestionsPage /> },
  { path: '/horary',               element: <HoraryAstrologyPage /> },
  { path: '/consultation',         element: <ConsultationPage /> },
  { path: '/vedic-a',              element: <VedicAPage /> },
  {
    path: '/knowledge',
    element: <ComingSoon feature="Knowledge Base" eta="Week 8"
      description="Searchable Jyotish reference — Grahas, Rashis, Nakshatras, Yogas, and classics." />,
  },
  { path: '/knowledge/add',        element: <Navigate to="/knowledge" replace /> },
  { path: '/knowledge/ingest',     element: <Navigate to="/knowledge" replace /> },
  { path: '/knowledge/upload',     element: <Navigate to="/knowledge" replace /> },
  { path: '/knowledge/export',     element: <Navigate to="/knowledge" replace /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // WEEK 9 — World Systems, Platform & Advanced Classical
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/nadi-astrology',       element: <NadiAstrologyPage /> },
  { path: '/bv-raman',             element: <BV_RamanPage /> },
  { path: '/raman-archive',        element: <RamanArchivePage /> },
  { path: '/kanchi',               element: <KanchiPage /> },
  { path: '/western-astrology',    element: <WesternAstrologyPage /> },
  { path: '/comparative-astrology', element: <ComparativeAstrologyPage /> },
  { path: '/world-astrology',      element: <WorldAstrologyPage /> },
  { path: '/mundane-astrology',    element: <MundaneAstrologyPage /> },
  { path: '/learn',                element: <LearningPlatformPage /> },
  { path: '/marketplace',          element: <AstrologerMarketplacePage /> },
  { path: '/vaastu',               element: <VaastuAssessmentPage /> },
  { path: '/api-docs',             element: <APIDocumentationPage /> },
  { path: '/enterprise',           element: <EnterprisePage /> },
  { path: '/enterprise-admin',     element: <Navigate to="/app" replace /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // WEEK 10 — Community & Mobile
  // ══════════════════════════════════════════════════════════════════════════════
  { path: '/chinese-astrology',    element: <ChineseAstrologyPage /> },
  { path: '/mobile-app',           element: <MobileAppPage /> },
  { path: '/community',            element: <CommunityPage /> },

  { path: '/features',             element: <AllFeaturesPage /> },

  // 404
  { path: '*', element: <NotFound /> },
];
