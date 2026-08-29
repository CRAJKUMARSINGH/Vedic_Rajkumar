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
const DashaPage              = lazy(() => import('@/pages/DashaPage'));
const DashaTimelinePage      = lazy(() => import('@/pages/DashaTimelinePage'));
const MahadashaChildrenPage  = lazy(() => import('@/pages/MahadashaChildrenPage'));

// ─── Infra / User pages ───────────────────────────────────────────────────────
const IndexPage       = lazy(() => import('@/pages/Index'));
const MyReadingsPage  = lazy(() => import('@/pages/MyReadingsPage'));
const FeedbackPage    = lazy(() => import('@/pages/FeedbackPage'));
const PricingPage     = lazy(() => import('@/pages/PricingPage'));
const NotFound        = lazy(() => import('@/pages/NotFound'));
const PriyanshMuhuratPage = lazy(() => import('@/pages/PriyanshMuhuratPage'));
const PrivacyPolicyPage   = lazy(() => import('@/pages/PrivacyPolicyPage'));
const TermsOfServicePage  = lazy(() => import('@/pages/TermsOfServicePage'));

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
  { path: '/dashboard',           element: <Navigate to="/app"         replace /> },
  { path: '/analytics',           element: <Navigate to="/app"         replace /> },
  { path: '/feature-requests',    element: <Navigate to="/app"         replace /> },
  { path: '/feedback-dashboard',  element: <Navigate to="/app"         replace /> },
  { path: '/quick-wins',          element: <Navigate to="/app"         replace /> },
  { path: '/mtss',                element: <Navigate to="/app"         replace /> },

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
  { path: '/dasha',               element: <DashaPage /> },
  { path: '/dasha-timeline',      element: <DashaTimelinePage /> },
  { path: '/mahadasha-children',  element: <MahadashaChildrenPage /> },
  // Legacy redirect
  { path: '/vimshottari-dasha',   element: <Navigate to="/dasha" replace /> },

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
  { path: '/privacy', element: <PrivacyPolicyPage /> },
  { path: '/terms',   element: <TermsOfServicePage /> },

  // ══════════════════════════════════════════════════════════════════════════════
  // ARCHIVED FEATURES — Coming Soon
  // All URLs are preserved so bookmarks / existing links don't hard-404.
  // Replace ComingSoon with the real page when the feature is ready.
  // ══════════════════════════════════════════════════════════════════════════════

  // Extended chart systems
  {
    path: '/divisional-charts',
    element: <ComingSoon feature="Divisional Charts" eta="Week 5–6"
      description="D1 through D60 Varga charts with individual analysis panels." />,
  },
  {
    path: '/divisional',
    element: <Navigate to="/divisional-charts" replace />,
  },
  {
    path: '/planetary-strength',
    element: <ComingSoon feature="Planetary Strength (Shadbala)" eta="Week 5"
      description="Full Shadbala and Bhavabala calculations for each planet and house." />,
  },
  {
    path: '/ashtakavarga',
    element: <ComingSoon feature="Ashtakavarga" eta="Week 5"
      description="Sarvashtakavarga and Bhinnashtakavarga charts with transit scoring." />,
  },
  {
    path: '/enhanced-ashtakavarga',
    element: <Navigate to="/ashtakavarga" replace />,
  },
  {
    path: '/yogas',
    element: <ComingSoon feature="Yoga Identification" eta="Week 5"
      description="Detection and interpretation of Raj Yogas, Dhana Yogas, Arishta Yogas, and more." />,
  },
  {
    path: '/yogas-identification',
    element: <Navigate to="/yogas" replace />,
  },
  {
    path: '/sade-sati',
    element: <ComingSoon feature="Sade Sati" eta="Week 5"
      description="Saturn's 7.5-year transit analysis with phase-wise impact and remedies." />,
  },
  {
    path: '/varshaphal',
    element: <ComingSoon feature="Varshaphal (Solar Return)" eta="Week 6"
      description="Annual chart, Muntha, and year lord analysis based on solar return." />,
  },
  {
    path: '/comprehensive',
    element: <ComingSoon feature="Comprehensive Report" eta="Week 7"
      description="Full-life PDF report combining chart, dasha, transits, and remedies." />,
  },
  {
    path: '/kaalsarp',
    element: <ComingSoon feature="Kaal Sarp Dosha" eta="Week 5"
      description="Detection of all 12 Kaal Sarp Yoga types with severity and remedies." />,
  },
  {
    path: '/kaal-sarp',
    element: <Navigate to="/kaalsarp" replace />,
  },

  // Extended systems
  {
    path: '/jaimini',
    element: <ComingSoon feature="Jaimini Astrology" eta="Week 8"
      description="Chara Dasha, Atmakaraka, Arudha Lagna, and Jaimini Raj Yogas." />,
  },
  {
    path: '/tajik',
    element: <ComingSoon feature="Tajik (Annual Horoscopy)" eta="Week 8"
      description="Tajik Varshaphal, Sahams, and Tajika yogas for yearly prediction." />,
  },
  {
    path: '/kp-system',
    element: <ComingSoon feature="KP System (Krishnamurti Paddhati)" eta="Week 7"
      description="Sub-lord theory, cuspal sub-lords, and KP significators for precise prediction." />,
  },
  {
    path: '/lal-kitab',
    element: <ComingSoon feature="Lal Kitab" eta="Week 8"
      description="Lal Kitab kundli, debts (Rinam), and practical remedies from this folk tradition." />,
  },
  {
    path: '/nadi-astrology',
    element: <ComingSoon feature="Nadi Astrology" eta="Week 9"
      description="Nadi amsha, Nadi dosha, and life-event prediction using Nadi techniques." />,
  },
  {
    path: '/horary',
    element: <ComingSoon feature="Horary Astrology (Western)" eta="Week 7"
      description="Western horary chart analysis — separate from Vedic Prashna." />,
  },
  {
    path: '/bv-raman',
    element: <ComingSoon feature="BV Raman Archive" eta="Week 9"
      description="Reference charts and commentary from BV Raman's published works." />,
  },
  {
    path: '/raman-archive',
    element: <ComingSoon feature="Raman Chart Archive" eta="Week 9"
      description="Searchable archive of notable horoscopes with analysis notes." />,
  },
  {
    path: '/kanchi',
    element: <ComingSoon feature="Kanchi Jyotish" eta="Week 9"
      description="Specialised readings based on the Kanchi tradition." />,
  },

  // Life-domain modules
  {
    path: '/career-astrology',
    element: <ComingSoon feature="Career Astrology" eta="Week 6"
      description="10th house, Dasamsha (D10), and career-timing windows." />,
  },
  {
    path: '/career',
    element: <Navigate to="/career-astrology" replace />,
  },
  {
    path: '/business-astrology',
    element: <ComingSoon feature="Business Astrology" eta="Week 7"
      description="Electional charts for business launch, partnership analysis, and financial timing." />,
  },
  {
    path: '/love-astrology',
    element: <ComingSoon feature="Love & Relationship Astrology" eta="Week 6"
      description="5th and 7th house analysis, synastry, and relationship timings." />,
  },
  {
    path: '/medical-astrology',
    element: <ComingSoon feature="Medical Astrology" eta="Week 8"
      description="Health indications, 6th house and planetary afflictions, healing periods." />,
  },
  {
    path: '/financial-astrology',
    element: <ComingSoon feature="Financial Astrology" eta="Week 8"
      description="2nd, 11th house analysis, Dhana Yogas, and wealth-timing cycles." />,
  },
  {
    path: '/western-astrology',
    element: <ComingSoon feature="Western Astrology" eta="Week 9"
      description="Tropical chart, aspects, solar/lunar returns, and progressions." />,
  },
  {
    path: '/chinese-astrology',
    element: <ComingSoon feature="Chinese Astrology" eta="Week 10"
      description="Four Pillars (BaZi), Year/Month/Day animals, and elemental analysis." />,
  },
  {
    path: '/numerology',
    element: <ComingSoon feature="Numerology" eta="Week 7"
      description="Pythagorean and Chaldean numerology — life path, destiny, and personal year numbers." />,
  },
  {
    path: '/comparative-astrology',
    element: <ComingSoon feature="Comparative Astrology" eta="Week 9"
      description="Side-by-side multi-system comparison for a single birth chart." />,
  },
  {
    path: '/world-astrology',
    element: <ComingSoon feature="World / Mundane Astrology" eta="Week 9"
      description="National charts, ingress charts, and world-event predictions." />,
  },
  {
    path: '/electional-astrology',
    element: <ComingSoon feature="Electional Astrology" eta="Week 7"
      description="Choosing auspicious moments for important events beyond muhurta." />,
  },
  {
    path: '/mundane-astrology',
    element: <ComingSoon feature="Mundane Astrology" eta="Week 9"
      description="Ingress, lunation, and eclipse charts for geopolitical forecasting." />,
  },

  // Remedies & accessories
  {
    path: '/remedies',
    element: <ComingSoon feature="Vedic Remedies" eta="Week 6"
      description="Personalised gemstone, mantra, fast, and charity recommendations from your chart." />,
  },
  {
    path: '/spiritual-remedies',
    element: <ComingSoon feature="Spiritual Remedies" eta="Week 6"
      description="Puja prescriptions, Yantra recommendations, and pilgrimage timing." />,
  },
  {
    path: '/gemstones',
    element: <ComingSoon feature="Gemstone Recommendations" eta="Week 6"
      description="Planet-specific gemstone advice with carat, metal, and finger guidance." />,
  },
  {
    path: '/nakshatra-precautions',
    element: <ComingSoon feature="Nakshatra Precautions" eta="Week 6"
      description="Daily nakshatra-based dos and don'ts for health, travel, and decisions." />,
  },
  {
    path: '/lucky-elements',
    element: <ComingSoon feature="Lucky Elements" eta="Week 7"
      description="Lucky numbers, colours, directions, and days from your natal chart." />,
  },

  // Transit modules
  {
    path: '/dynamic-transit',
    element: <ComingSoon feature="Dynamic Transit Tracker" eta="Week 6"
      description="Real-time Gochar overlay on natal chart with Vedha correction." />,
  },
  {
    path: '/transit',
    element: <Navigate to="/dynamic-transit" replace />,
  },
  {
    path: '/transit-analysis',
    element: <ComingSoon feature="Transit Analysis" eta="Week 6"
      description="Bilingual transit report covering all 9 planets over a chosen period." />,
  },
  {
    path: '/event-transit',
    element: <ComingSoon feature="Event Transit Analysis" eta="Week 7"
      description="Superimpose a specific event chart over natal transits for correlation." />,
  },

  // AI predictions
  {
    path: '/ai-predictions',
    element: <ComingSoon feature="AI Predictions Engine" eta="Week 7"
      description="Multi-system AI synthesis combining Dasha, Gochar, and Prashna for a unified forecast." />,
  },

  // Knowledge base
  {
    path: '/knowledge',
    element: <ComingSoon feature="Knowledge Base" eta="Week 8"
      description="Searchable Jyotish reference — Grahas, Rashis, Nakshatras, Yogas, and classics." />,
  },
  {
    path: '/knowledge/add',
    element: <Navigate to="/knowledge" replace />,
  },
  {
    path: '/knowledge/ingest',
    element: <Navigate to="/knowledge" replace />,
  },
  {
    path: '/knowledge/upload',
    element: <Navigate to="/knowledge" replace />,
  },
  {
    path: '/knowledge/export',
    element: <Navigate to="/knowledge" replace />,
  },

  // Platform / Community
  {
    path: '/consultation',
    element: <ComingSoon feature="Live Consultation" eta="Week 8"
      description="Book a session with a certified Jyotishi through the platform." />,
  },
  {
    path: '/learn',
    element: <ComingSoon feature="Learning Platform" eta="Week 9"
      description="Structured courses on Vedic astrology from beginner to advanced." />,
  },
  {
    path: '/marketplace',
    element: <ComingSoon feature="Astrologer Marketplace" eta="Week 9"
      description="Connect with verified astrologers for paid readings and reports." />,
  },
  {
    path: '/community',
    element: <ComingSoon feature="Community Forum" eta="Week 10"
      description="Discuss charts, techniques, and experiences with fellow Jyotish enthusiasts." />,
  },
  {
    path: '/features',
    element: <ComingSoon feature="All Features" eta="Ongoing"
      description="Complete feature roadmap and module index for Vedic Rajkumar." />,
  },
  {
    path: '/api-docs',
    element: <ComingSoon feature="API Documentation" eta="Week 9"
      description="REST and WebSocket API reference for developers integrating Jyotish data." />,
  },
  {
    path: '/enterprise',
    element: <ComingSoon feature="Enterprise Plan" eta="Week 9"
      description="White-label Jyotish API, bulk chart processing, and SLA support." />,
  },
  {
    path: '/enterprise-admin',
    element: <Navigate to="/app" replace />,
  },
  {
    path: '/mobile-app',
    element: <ComingSoon feature="Mobile App" eta="Week 10"
      description="Native iOS and Android app with offline Panchang and push alerts." />,
  },
  {
    path: '/festival-calendar',
    element: <ComingSoon feature="Festival Calendar" eta="Week 7"
      description="Annual Hindu festival and Vrat calendar with regional variations." />,
  },
  {
    path: '/baby-names',
    element: <ComingSoon feature="Baby Name Suggestions" eta="Week 8"
      description="Nakshatra-based name suggestions with Rashi akshara and numerological check." />,
  },
  {
    path: '/vaastu',
    element: <ComingSoon feature="Vaastu Assessment" eta="Week 9"
      description="Home and office Vaastu analysis with directional remedies." />,
  },

  // Personal / misc
  {
    path: '/vidhya-karma',
    element: <ComingSoon feature="Vidhya-Karma Darshan" eta="Week 7"
      description="4th and 5th house education analysis combined with 10th house karma." />,
  },
  {
    path: '/vedic-a',
    element: <ComingSoon feature="Vedic-A Module" eta="Week 8"
      description="Extended Vedic analysis module — detailed feature list coming soon." />,
  },

  // 404
  { path: '*', element: <NotFound /> },
];
