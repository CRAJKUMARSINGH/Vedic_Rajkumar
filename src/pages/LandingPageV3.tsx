/**
 * LandingPageV3 — AI-first landing page (Vedicgrok patch)
 * Cosmic dark theme, prominent Ask-AI entry, trust signals, pricing CTA.
 *
 * Enriched (Lovable-hub selective adoption): bilingual toggle, illustrative
 * Kundli preview computed from a synthetic fixture, transparent calculation
 * pipeline, accuracy methodology, developer quick-start, responsive nav and
 * documentation/source links. Numeric claims are pinned to docs/CLAIMS.md.
 */

import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  GitBranch,
  Menu,
  MessageSquareQuote,
  Sparkles,
  Star,
  Sun,
  Telescope,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO, webAppSchema } from '@/components/SEO';
import { useLang, t } from '@/hooks/use-lang';

const FeedbackEmailWidget = lazy(() =>
  import('@/components/FeedbackEmailWidget').then(m => ({ default: m.FeedbackEmailWidget }))
);

/** Lazy: the preview pulls the chart renderers + engine, so keep it off the critical path. */
const ChartPreview = lazy(() =>
  import('@/components/landing/ChartPreview').then(m => ({ default: m.ChartPreview }))
);

const REPO_URL = 'https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar';
const CLAIMS_URL = `${REPO_URL}/blob/main/docs/CLAIMS.md`;

type Bi = { en: string; hi: string };

/**
 * CORE FEATURES — the four active features in the current release.
 * All other features are Coming Soon (see /features for the roadmap).
 * Do not add features here that are not yet working end-to-end.
 */
const FEATURES = [
  {
    icon: '🌟',
    title: { en: 'Kundli — Birth Chart', hi: 'कुंडली — जन्म कुंडली' } as Bi,
    href: '/horoscope',
    desc: {
      en: 'Sidereal Vedic birth chart using Lahiri ayanamsa — 9-planet positions, 12-house analysis, Vimshottari Dasha sequence, and Ascendant-based whole-sign houses.',
      hi: 'लाहिरी अयनांश से सायन जन्म कुंडली — 9 ग्रह स्थितियाँ, 12 भाव विश्लेषण, विंशोत्तरी दशा क्रम और लग्न-आधारित पूर्ण-राशि भाव।',
    } as Bi,
  },
  {
    icon: '🔮',
    title: { en: 'Prashna — Ask a Question', hi: 'प्रश्न — प्रश्न कुंडली' } as Bi,
    href: '/prashna',
    desc: {
      en: 'Vedic horary astrology: cast a chart for the moment your question arises. Get a clear yes/no/maybe verdict with significators, timing, and remedies.',
      hi: 'वैदिक प्रश्न ज्योतिष: जब प्रश्न उठे उसी क्षण की कुंडली। स्पष्ट हाँ/नहीं/शायद निर्णय, कारक ग्रह, समय और उपाय सहित।',
    } as Bi,
  },
  {
    icon: '💑',
    title: { en: 'Kundli Milan — Matchmaking', hi: 'कुंडली मिलान' } as Bi,
    href: '/matchmaking',
    desc: {
      en: 'Complete Ashtakuta analysis (36-point, all 8 kutas), Manglik Dosha check, Navamsha D9 comparison, Dasha period matching, and remedies for doshas.',
      hi: 'संपूर्ण अष्टकूट विश्लेषण (36 अंक, सभी 8 कूट), मांगलिक दोष जाँच, नवांश D9 तुलना, दशा मिलान और दोषों के उपाय।',
    } as Bi,
  },
  {
    icon: '📅',
    title: { en: 'Panchang & Muhurta', hi: 'पंचांग और मुहूर्त' } as Bi,
    href: '/panchang',
    desc: {
      en: 'Daily Panchang with all five limbs (Tithi, Vara, Nakshatra, Yoga, Karana), Rahu Kalam, Abhijit Muhurta, and a purpose-specific auspicious window finder.',
      hi: 'दैनिक पंचांग पाँचों अंगों सहित (तिथि, वार, नक्षत्र, योग, करण), राहु काल, अभिजित मुहूर्त और शुभ मुहूर्त खोज।',
    } as Bi,
  },
];

const TRUST_SIGNALS: Bi[] = [
  { en: 'Sidereal Lahiri ayanamsa by default', hi: 'डिफ़ॉल्ट रूप से सायन लाहिरी अयनांश' },
  { en: 'All 8 Ashtakuta kutas (36-point scale)', hi: 'सभी 8 अष्टकूट (36 अंक)' },
  { en: '15-chart accuracy corpus, re-run per commit', hi: '15-चार्ट सटीकता कोष, प्रति कमिट' },
  { en: 'Installable — works offline as a PWA', hi: 'इंस्टॉल योग्य — PWA के रूप में ऑफ़लाइन' },
];

const FOUNDATIONS = [
  { name: 'Lahiri Ayanamsa', icon: '🌙' },
  { name: 'BPHS & Phaladeepika', icon: '📿' },
  { name: 'Swiss Ephemeris (opt-in)', icon: '🌐' },
  { name: 'Netlify Deploys', icon: '⚡' },
  { name: 'Open Source Core', icon: '🔓' },
  { name: 'Family-first UX', icon: '🕉️' },
];

const FOCUS_POINTS = [
  {
    label: 'Depth over breadth',
    quote: {
      en: 'Four focused Jyotish tools — Kundli, Prashna, Matchmaking, and Panchang — refined one module at a time.',
      hi: 'चार केंद्रित ज्योतिष उपकरण — कुंडली, प्रश्न, मिलान और पंचांग — एक-एक मॉड्यूल सुधारते हुए।',
    } as Bi,
  },
  {
    label: 'Bilingual by default',
    quote: {
      en: 'English and Hindi at parity throughout, designed for families and serious students.',
      hi: 'अंग्रेज़ी और हिंदी समान स्तर पर — परिवारों और गंभीर विद्यार्थियों के लिए।',
    } as Bi,
  },
  {
    label: 'Honest disclosure',
    quote: {
      en: 'Validation work is active and limits are stated openly — Shadbala and interpretation prose are not yet validated.',
      hi: 'सत्यापन कार्य सक्रिय है और सीमाएँ खुलकर बताई जाती हैं — षड्बल व व्याख्या अभी सत्यापित नहीं।',
    } as Bi,
  },
];

const STATS = [
  { value: '4', label: { en: 'Core features — active now', hi: 'मुख्य फ़ीचर — अभी सक्रिय' } as Bi },
  { value: '9', label: { en: 'Grahas calculated', hi: 'ग्रह गणना' } as Bi },
  { value: '120', label: { en: 'Vimshottari dasha years', hi: 'विंशोत्तरी दशा वर्ष' } as Bi },
  { value: 'EN/HI', label: { en: 'Bilingual engine', hi: 'द्विभाषी इंजन' } as Bi },
  { value: 'Lahiri', label: { en: 'Ayanamsa standard', hi: 'अयनांश मानक' } as Bi },
  { value: '8/8', label: { en: 'Ashta Kuta kutas', hi: 'अष्ट कूट' } as Bi },
];

/** Transparent pipeline — what happens between a birth time and a rendered chart. */
const PIPELINE = [
  {
    step: '01',
    title: { en: 'Enter birth details', hi: 'जन्म विवरण भरें' } as Bi,
    body: {
      en: 'Date, time and place. Timezone and coordinates resolve from the place; the sidereal Lahiri ayanamsa is applied.',
      hi: 'तिथि, समय और स्थान। स्थान से समय-क्षेत्र व निर्देशांक तय होते हैं; सायन लाहिरी अयनांश लागू होता है।',
    } as Bi,
  },
  {
    step: '02',
    title: { en: 'Cast the chart', hi: 'कुंडली बनाएँ' } as Bi,
    body: {
      en: 'The local MIT engine computes the nine graha longitudes, the Ascendant, twelve whole-sign houses, nakshatra and pada.',
      hi: 'स्थानीय MIT इंजन नौ ग्रहों के देशांतर, लग्न, बारह पूर्ण-राशि भाव, नक्षत्र और पद की गणना करता है।',
    } as Bi,
  },
  {
    step: '03',
    title: { en: 'Derive the Jyotish layers', hi: 'ज्योतिष परतें निकालें' } as Bi,
    body: {
      en: 'Vimshottari dasha timeline, Ashtakavarga and divisional vargas are all derived from those same longitudes.',
      hi: 'विंशोत्तरी दशा, अष्टकवर्ग और विभाजन वर्ग उन्हीं देशांतरों से निकाले जाते हैं।',
    } as Bi,
  },
  {
    step: '04',
    title: { en: 'Present and export', hi: 'प्रस्तुत करें और निर्यात' } as Bi,
    body: {
      en: 'The chart, planetary table and dasha are shown bilingually; PDF export is available on the registered tier.',
      hi: 'कुंडली, ग्रह तालिका और दशा द्विभाषी रूप में दिखती हैं; PDF निर्यात पंजीकृत स्तर पर उपलब्ध।',
    } as Bi,
  },
];

/** Accuracy methodology — mirrors docs/accuracy/METHODOLOGY.md and docs/CLAIMS.md. */
const ACCURACY_POINTS = [
  {
    value: '15',
    label: { en: 'Reference charts in the golden corpus', hi: 'गोल्डन कोष में संदर्भ कुंडलियाँ' } as Bi,
  },
  {
    value: '≤ 2″',
    label: { en: 'Ascendant tolerance (arcseconds)', hi: 'लग्न सहनशीलता (आर्कसेकंड)' } as Bi,
  },
  {
    value: '155',
    label: { en: 'Discrete accuracy assertions per run', hi: 'प्रति रन सटीकता जाँच' } as Bi,
  },
  {
    value: 'exact',
    label: { en: 'Match required for rashi / nakshatra / pada / dasha seed', hi: 'राशि / नक्षत्र / पद / दशा बीज में पूर्ण मेल' } as Bi,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export const LandingPageV3 = () => {
  const { lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDevanagari = lang === 'hi';
  const devClass = isDevanagari ? 'font-devanagari' : '';
  const chartLang: 'en' | 'hi' = isDevanagari ? 'hi' : 'en';

  const NAV_LINKS: { label: Bi; href: string; to?: boolean }[] = [
    { label: { en: 'Features', hi: 'फ़ीचर' }, href: '#features' },
    { label: { en: 'Preview', hi: 'नमूना' }, href: '#preview' },
    { label: { en: 'Accuracy', hi: 'सटीकता' }, href: '#accuracy' },
    { label: { en: 'Ask AI', hi: 'प्रश्न AI' }, href: '/prashna', to: true },
    { label: { en: 'Pricing', hi: 'मूल्य' }, href: '/pricing', to: true },
  ];

  return (
    <div className="min-h-screen bg-[#020208] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-white relative overflow-hidden">
      <SEO
        title="Vedic Rajkumar | Focused Vedic Astrology Tools"
        description="Focused Vedic astrology tools for Kundli, Prashna, Matchmaking, and Panchang/Muhurta. Sidereal Lahiri ayanamsa, bilingual EN/HI, accuracy pinned to a 15-chart corpus."
        keywords="vedic astrology AI, online kundli, prashna astrology, jyotish answers, vedic remedies, muhurta"
        canonical="/"
        structuredData={webAppSchema}
      />

      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute bottom-[-20%] right-[-15%] w-[65%] h-[65%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)] animate-pulse"
          style={{ animationDuration: '14s' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_65%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 border-b border-slate-800/60 bg-[#020208]/80 backdrop-blur-xl sticky top-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-lg">
              🪔
            </span>
            <span className="text-sm font-extrabold tracking-wide bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">
              Vedic Rajkumar
            </span>
          </Link>

          <div className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-widest text-slate-400 lg:flex">
            {NAV_LINKS.map(l =>
              l.to ? (
                <Link key={l.href} to={l.href} className="hover:text-amber-400 transition-colors">
                  {t(l.label, lang)}
                </Link>
              ) : (
                <a key={l.href} href={l.href} className="hover:text-amber-400 transition-colors">
                  {t(l.label, lang)}
                </a>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bilingual toggle */}
            <button
              type="button"
              onClick={() => setLang(isDevanagari ? 'en' : 'hi')}
              aria-label={isDevanagari ? 'Switch to English' : 'हिंदी में देखें'}
              className="rounded-full border border-slate-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
            >
              {isDevanagari ? 'EN' : 'हिं'}
            </button>

            <Button
              asChild
              size="sm"
              className="hidden rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.25)] sm:inline-flex"
            >
              <Link to="/horoscope">{t({ en: 'Get Started Free', hi: 'मुफ़्त शुरू करें' }, lang)}</Link>
            </Button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:text-amber-300 lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Responsive navigation panel */}
        {menuOpen && (
          <div
            id="mobile-nav"
            className="border-t border-slate-800/60 bg-[#020208]/95 px-4 py-3 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(l =>
                l.to ? (
                  <Link
                    key={l.href}
                    to={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-amber-300"
                  >
                    {t(l.label, lang)}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-amber-300"
                  >
                    {t(l.label, lang)}
                  </a>
                )
              )}
              <Link
                to="/horoscope"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-slate-950"
              >
                {t({ en: 'Get Started Free', hi: 'मुफ़्त शुरू करें' }, lang)}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Foundations / Built-on strip */}
      <section className="relative z-10 border-y border-slate-800/50 bg-[#050512]/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">
            {t({ en: 'Foundations · Built on', hi: 'आधार · निर्मित' }, lang)}
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-slate-400"
          >
            {FOUNDATIONS.map(f => (
              <div
                key={f.name}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide opacity-70 hover:opacity-100 hover:text-amber-300 transition-colors"
                title={f.name}
              >
                <span className="text-base sm:text-lg" aria-hidden="true">{f.icon}</span>
                <span>{f.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hero */}
      <header className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 relative"
          >
            <Badge variant="outline" className="rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-amber-300 text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t({ en: 'Sidereal · Lahiri · openly validated', hi: 'सायन · लाहिरी · खुला सत्यापन' }, lang)}
            </Badge>

            <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white ${devClass}`}>
              {isDevanagari ? (
                <>
                  हर प्रश्न के लिए
                  <br />
                  <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                    तारों का मार्गदर्शन
                  </span>
                </>
              ) : (
                <>
                  Unlock the Stars&apos;
                  <br />
                  <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                    Guidance for Every Question
                  </span>
                </>
              )}
            </h1>

            <p className={`max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed ${devClass}`}>
              {t(
                {
                  en: 'Vedic Rajkumar focuses on four practical Jyotish tools: Kundli, Prashna, Matchmaking, and Panchang/Muhurta — computed sidereally and explained in plain English or Hindi.',
                  hi: 'वैदिक राजकुमार चार व्यावहारिक ज्योतिष उपकरणों पर केंद्रित है: कुंडली, प्रश्न, मिलान और पंचांग/मुहूर्त — सायन गणना, सरल अंग्रेज़ी या हिंदी में।',
                },
                lang
              )}
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-500 h-12 px-8 shadow-[0_5px_25px_rgba(245,158,11,0.3)]"
              >
                <Link to="/prashna" className="flex items-center gap-2">
                  {t({ en: 'Ask a Prashna Question', hi: 'प्रश्न पूछें' }, lang)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-800/80 hover:text-white h-12 px-8"
              >
                <Link to="/horoscope">{t({ en: 'Generate Free Kundli', hi: 'मुफ़्त कुंडली बनाएँ' }, lang)}</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center pt-4 text-xs sm:text-sm text-slate-400">
              {TRUST_SIGNALS.map(signal => (
                <span key={signal.en} className={`inline-flex items-center gap-1.5 ${devClass}`}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {t(signal, lang)}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 space-y-28 pb-28">
        {/* Ask AI teaser */}
        <section id="ask-ai" className="max-w-4xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-800/80 bg-[#050512]/70 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.06)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquareQuote className="h-5 w-5 text-amber-400" />
              <h2 className={`text-lg sm:text-xl font-bold text-white ${devClass}`}>
                {t({ en: 'Ask a Focused Prashna Question', hi: 'केंद्रित प्रश्न पूछें' }, lang)}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#03030f] p-4 sm:p-5 space-y-4">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm" aria-hidden="true">
                  👤
                </span>
                <div className={`rounded-2xl rounded-tl-sm bg-slate-800/80 px-4 py-2.5 text-sm text-slate-200 ${devClass}`}>
                  {t({ en: 'Will I get married this year?', hi: 'क्या इस वर्ष विवाह होगा?' }, lang)}
                </div>
              </div>
              <div className="flex gap-3 flex-row-reverse">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-sm" aria-hidden="true">
                  🪔
                </span>
                <div className={`rounded-2xl rounded-tr-sm border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-slate-300 leading-relaxed max-w-[90%] ${devClass}`}>
                  <span className="text-amber-300 font-semibold">
                    {t({ en: 'Prashna Verdict:', hi: 'प्रश्न निर्णय:' }, lang)}
                  </span>{' '}
                  {t(
                    {
                      en: 'Favourable window opening — Venus gaining strength from the 7th.',
                      hi: 'अनुकूल समय आ रहा है — शुक्र सप्तम से बल पा रहा है।',
                    },
                    lang
                  )}{' '}
                  <span className="text-emerald-400">{t({ en: 'Remedy:', hi: 'उपाय:' }, lang)}</span>{' '}
                  {t(
                    { en: 'Friday fast and white flowers to Mahalakshmi.', hi: 'शुक्रवार व्रत व महालक्ष्मी को श्वेत पुष्प।' },
                    lang
                  )}{' '}
                  <Link to="/prashna" className="text-amber-400 hover:underline ml-1">
                    {t({ en: 'Try your question', hi: 'अपना प्रश्न पूछें' }, lang)} →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Illustrative Kundli preview (canonical synthetic fixture) */}
        <section id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-center mb-10 space-y-3">
            <Badge variant="outline" className="rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-300 text-xs font-semibold px-4 py-1 uppercase">
              <Sun className="h-3.5 w-3.5 inline mr-1.5" />
              {t({ en: 'Live preview', hi: 'जीवंत नमूना' }, lang)}
            </Badge>
            <h2 className={`text-3xl sm:text-5xl font-extrabold text-white tracking-tight ${devClass}`}>
              {t({ en: 'See the chart before you trust it', hi: 'भरोसे से पहले कुंडली देखें' }, lang)}
            </h2>
            <p className={`text-slate-400 text-sm max-w-2xl mx-auto ${devClass}`}>
              {t(
                {
                  en: 'This is a real output of the shipped engine, produced from synthetic inputs. The graphic and the planetary table below are projected from the same computed longitudes — they cannot disagree.',
                  hi: 'यह इसी इंजन का वास्तविक आउटपुट है, काल्पनिक इनपुट से बना। नीचे का चित्र और ग्रह तालिका उन्हीं गणित देशांतरों से बने हैं — वे परस्पर विरोधी नहीं हो सकते।',
                },
                lang
              )}
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-80 rounded-2xl bg-slate-900/40 animate-pulse" />
                <div className="h-80 rounded-2xl bg-slate-900/40 animate-pulse" />
              </div>
            }
          >
            <ChartPreview lang={chartLang} />
          </Suspense>
        </section>

        {/* Transparent calculation pipeline */}
        <section id="pipeline" className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="rounded-full border border-sky-500/20 bg-sky-500/5 text-sky-300 text-xs font-semibold px-4 py-1 uppercase">
              <GitBranch className="h-3.5 w-3.5 inline mr-1.5" />
              {t({ en: 'No black box', hi: 'कोई काला बक्सा नहीं' }, lang)}
            </Badge>
            <h2 className={`text-3xl sm:text-4xl font-extrabold text-white tracking-tight ${devClass}`}>
              {t({ en: 'How a chart is cast', hi: 'कुंडली कैसे बनती है' }, lang)}
            </h2>
          </div>

          <motion.ol
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-4 md:grid-cols-4"
          >
            {PIPELINE.map(p => (
              <motion.li
                key={p.step}
                variants={cardVariants}
                className="relative rounded-2xl border border-slate-800/80 bg-[#050512]/60 backdrop-blur-md p-5"
              >
                <span className="text-xs font-black tracking-widest text-amber-500/70">{p.step}</span>
                <h3 className={`mt-2 text-base font-bold text-white ${devClass}`}>{t(p.title, lang)}</h3>
                <p className={`mt-2 text-xs text-slate-400 leading-relaxed ${devClass}`}>{t(p.body, lang)}</p>
              </motion.li>
            ))}
          </motion.ol>
        </section>

        {/* Features grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-center mb-14 space-y-3">
            <Badge variant="outline" className="rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs font-semibold px-4 py-1 uppercase">
              <Telescope className="h-3.5 w-3.5 inline mr-1.5" />
              {t({ en: 'Active now', hi: 'अभी सक्रिय' }, lang)}
            </Badge>
            <h2 className={`text-3xl sm:text-5xl font-extrabold text-white tracking-tight ${devClass}`}>
              {t({ en: 'Four Features. Built with Care.', hi: 'चार फ़ीचर। सावधानी से बने।' }, lang)}
            </h2>
            <p className={`text-slate-400 text-sm max-w-xl mx-auto ${devClass}`}>
              {t(
                {
                  en: 'The app favours depth over breadth: Kundli, Prashna, Matchmaking, and Panchang/Muhurta are the active focus while advanced modules graduate one by one.',
                  hi: 'ऐप विस्तार से अधिक गहराई पर ज़ोर देता है: कुंडली, प्रश्न, मिलान और पंचांग/मुहूर्त सक्रिय केंद्र हैं।',
                },
                lang
              )}
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {FEATURES.map(f => (
              <motion.div key={f.href} variants={cardVariants} className="group relative">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                <Link
                  to={f.href}
                  className="relative flex flex-col h-full rounded-2xl border border-slate-800/80 bg-[#050512]/60 backdrop-blur-md p-5 hover:border-amber-500/40 transition-all"
                >
                  <span className="text-2xl mb-3" aria-hidden="true">{f.icon}</span>
                  <h3 className={`text-base font-bold text-white group-hover:text-amber-300 transition-colors ${devClass}`}>
                    {t(f.title, lang)}
                  </h3>
                  <p className={`text-xs text-slate-400 leading-relaxed mt-2 flex-1 ${devClass}`}>{t(f.desc, lang)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      ● {t({ en: 'Live', hi: 'सक्रिय' }, lang)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 text-center">
            <p className={`text-slate-500 text-sm ${devClass}`}>
              {t(
                {
                  en: 'Divisional Charts, Transits, Remedies, KP, Jaimini and more modules are on the roadmap.',
                  hi: 'विभाजन चार्ट, गोचर, उपाय, केपी, जैमिनी और अन्य मॉड्यूल रोडमैप पर हैं।',
                },
                lang
              )}{' '}
              <Link to="/features" className="text-amber-400 hover:underline">
                {t({ en: 'see the full roadmap', hi: 'पूरा रोडमैप देखें' }, lang)} →
              </Link>
            </p>
          </div>
        </section>

        {/* Accuracy methodology */}
        <section id="accuracy" className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="rounded-3xl border border-slate-800/80 bg-[#050512]/60 backdrop-blur-md p-6 sm:p-10">
            <div className="text-center mb-10 space-y-3">
              <Badge variant="outline" className="rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs font-semibold px-4 py-1 uppercase">
                <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5" />
                {t({ en: 'Methodology, stated plainly', hi: 'कार्यप्रणाली, स्पष्ट रूप में' }, lang)}
              </Badge>
              <h2 className={`text-3xl sm:text-4xl font-extrabold text-white tracking-tight ${devClass}`}>
                {t({ en: 'Accuracy you can check', hi: 'जाँचने योग्य सटीकता' }, lang)}
              </h2>
              <p className={`text-slate-400 text-sm max-w-2xl mx-auto ${devClass}`}>
                {t(
                  {
                    en: 'Every commit is re-run against a fixed corpus of reference charts with published tolerances. Unvalidated modules are labelled as such — never dressed up as finished.',
                    hi: 'प्रत्येक कमिट को संदर्भ कुंडलियों के निश्चित कोष पर प्रकाशित सहनशीलता के साथ दोबारा जाँचा जाता है। असत्यापित मॉड्यूल स्पष्ट रूप से चिह्नित रहते हैं।',
                  },
                  lang
                )}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ACCURACY_POINTS.map(a => (
                <div key={a.value} className="rounded-2xl border border-slate-800/60 bg-[#03030f]/70 p-5 text-center">
                  <div className="text-3xl font-extrabold text-amber-400">{a.value}</div>
                  <div className={`text-xs text-slate-400 mt-2 leading-snug ${devClass}`}>{t(a.label, lang)}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-5">
                <h3 className={`text-sm font-bold text-emerald-300 ${devClass}`}>
                  {t({ en: 'Validated against reference charts', hi: 'संदर्भ कुंडलियों से सत्यापित' }, lang)}
                </h3>
                <p className={`mt-2 text-xs text-slate-400 leading-relaxed ${devClass}`}>
                  {t(
                    {
                      en: 'Planetary longitudes, Ascendant, nakshatra/pada, Vimshottari dasha seeds and Ashta Koota arithmetic.',
                      hi: 'ग्रह देशांतर, लग्न, नक्षत्र/पद, विंशोत्तरी दशा बीज और अष्ट कूट गणित।',
                    },
                    lang
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
                <h3 className={`text-sm font-bold text-amber-300 ${devClass}`}>
                  {t({ en: 'Disclosed as not yet validated', hi: 'अभी असत्यापित घोषित' }, lang)}
                </h3>
                <p className={`mt-2 text-xs text-slate-400 leading-relaxed ${devClass}`}>
                  {t(
                    {
                      en: 'Shadbala strength values and the hand-authored classical/inter­pretation prose.',
                      hi: 'षड्बल बल-मान और हस्तलिखित शास्त्रीय/व्याख्या पाठ।',
                    },
                    lang
                  )}
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-slate-500">
              <a href={CLAIMS_URL} target="_blank" rel="noreferrer" className="hover:text-amber-400 underline">
                {t({ en: 'Metric sources & tolerances — docs/CLAIMS.md', hi: 'मीट्रिक स्रोत व सहनशीलता — docs/CLAIMS.md' }, lang)}
              </a>
            </p>
          </div>
        </section>

        {/* Stats + focus principles */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className={`text-2xl font-extrabold text-white mb-6 flex items-center gap-2 ${devClass}`}>
                <Users className="h-6 w-6 text-amber-400" />
                {t({ en: 'Engine Snapshot', hi: 'इंजन झलक' }, lang)}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {STATS.map(s => (
                  <div
                    key={s.label.en}
                    className="rounded-2xl border border-slate-800/60 bg-[#050512]/60 p-4"
                  >
                    <div className="text-2xl font-extrabold text-amber-400">{s.value}</div>
                    <div className={`text-xs text-slate-400 mt-1 ${devClass}`}>{t(s.label, lang)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className={`text-2xl font-extrabold text-white mb-6 flex items-center gap-2 ${devClass}`}>
                <Star className="h-6 w-6 text-amber-400" />
                {t({ en: 'Product Principles', hi: 'उत्पाद सिद्धांत' }, lang)}
              </h2>
              <div className="space-y-4">
                {FOCUS_POINTS.map(fp => (
                  <div
                    key={fp.label}
                    className="rounded-2xl border border-slate-800/60 bg-[#050512]/60 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                        {fp.label}
                      </p>
                    </div>
                    <p className={`text-sm text-slate-300 leading-relaxed ${devClass}`}>{t(fp.quote, lang)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Developer quick-start */}
        <section id="developers" className="max-w-4xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="rounded-3xl border border-slate-800/80 bg-[#050512]/70 backdrop-blur-md p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-5 w-5 text-amber-400" />
              <h2 className={`text-lg sm:text-xl font-bold text-white ${devClass}`}>
                {t({ en: 'Run it yourself', hi: 'स्वयं चलाएँ' }, lang)}
              </h2>
            </div>
            <p className={`text-sm text-slate-400 mb-4 ${devClass}`}>
              {t(
                {
                  en: 'The core engine is open source under MIT. The AGPL-licensed Swiss Ephemeris path is opt-in and off by default, so the shipped bundle stays MIT.',
                  hi: 'मुख्य इंजन MIT के अंतर्गत ओपन सोर्स है। AGPL लाइसेंस वाला Swiss Ephemeris पथ वैकल्पिक और डिफ़ॉल्ट रूप से बंद है।',
                },
                lang
              )}
            </p>

            <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#03030f] p-4 text-xs leading-relaxed text-slate-300">
              <code>{`git clone ${REPO_URL}.git
cd Vedic_Rajkumar
npm install
npm run dev            # local dev server
npm run test:run       # full test suite
npm run validate:accuracy   # 15-chart golden corpus`}</code>
            </pre>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full border-slate-700 text-slate-300 hover:text-amber-300">
                <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  {t({ en: 'Source on GitHub', hi: 'GitHub पर स्रोत' }, lang)}
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-slate-700 text-slate-300 hover:text-amber-300">
                <a href={CLAIMS_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t({ en: 'Read the claims register', hi: 'दावा-रजिस्टर पढ़ें' }, lang)}
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent p-8 sm:p-10">
            <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-4" />
            <h2 className={`text-2xl sm:text-3xl font-extrabold text-white mb-3 ${devClass}`}>
              {t({ en: 'Free Kundli Forever — Pro for Deep Insights', hi: 'कुंडली सदा मुफ़्त — गहन अंतर्दृष्टि हेतु Pro' }, lang)}
            </h2>
            <p className={`text-slate-400 text-sm mb-6 max-w-md mx-auto ${devClass}`}>
              {t(
                {
                  en: 'Start free with full chart access. Upgrade for unlimited Prashna AI, PDF exports, and priority transit alerts.',
                  hi: 'पूर्ण कुंडली पहुँच के साथ मुफ़्त शुरू करें। असीमित प्रश्न AI, PDF निर्यात व प्राथमिकता गोचर सूचनाओं हेतु अपग्रेड करें।',
                },
                lang
              )}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild className="rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
                <Link to="/pricing">{t({ en: 'View Pricing', hi: 'मूल्य देखें' }, lang)}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-slate-700">
                <Link to="/horoscope">{t({ en: 'Open Kundli', hi: 'कुंडली खोलें' }, lang)}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feedback — lazy loaded */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6">
          <Suspense fallback={<div className="h-32 rounded-2xl bg-slate-900/40 animate-pulse" />}>
            <div className="rounded-3xl border border-slate-800/80 bg-[#050512]/60 p-8 text-center">
              <h2 className={`text-xl font-bold text-white mb-2 ${devClass}`}>
                {t({ en: 'Questions or Feedback?', hi: 'प्रश्न या प्रतिक्रिया?' }, lang)}
              </h2>
              <p className={`text-slate-400 text-sm mb-6 ${devClass}`}>
                {t({ en: 'We review every report.', hi: 'हम हर रिपोर्ट देखते हैं।' }, lang)}
              </p>
              <FeedbackEmailWidget />
            </div>
          </Suspense>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-800 bg-[#050512]/80 p-10 sm:p-14"
          >
            <Sun
              className="h-10 w-10 text-amber-400 mx-auto mb-4 motion-safe:animate-spin"
              style={{ animationDuration: '30s' }}
            />
            <h2 className={`text-2xl sm:text-4xl font-extrabold text-white mb-4 ${devClass}`}>
              {t({ en: 'Ready to align with the cosmos?', hi: 'ब्रह्मांड से तालमेल के लिए तैयार?' }, lang)}
            </h2>
            <Button
              asChild
              size="lg"
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold h-12 px-10"
            >
              <Link to="/horoscope" className="flex items-center gap-2">
                {t({ en: 'Start Your Vedic Journey — Free', hi: 'अपनी वैदिक यात्रा शुरू करें — मुफ़्त' }, lang)}
                <Zap className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-10 bg-[#020208]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <p>{t({ en: '© 2026 Vedic Rajkumar — Lahiri sidereal · BPHS & Phaladeepika', hi: '© 2026 वैदिक राजकुमार — लाहिरी सायन · BPHS व फलदीपिका' }, lang)}</p>
          <div className="flex flex-wrap gap-5 justify-center uppercase tracking-widest text-[10px]">
            <Link to="/prashna" className="hover:text-amber-400 transition-colors">{t({ en: 'Ask AI', hi: 'प्रश्न AI' }, lang)}</Link>
            <Link to="/horoscope" className="hover:text-amber-400 transition-colors">{t({ en: 'Kundli', hi: 'कुंडली' }, lang)}</Link>
            <Link to="/panchang" className="hover:text-amber-400 transition-colors">{t({ en: 'Panchang', hi: 'पंचांग' }, lang)}</Link>
            <Link to="/matchmaking" className="hover:text-amber-400 transition-colors">{t({ en: 'Milan', hi: 'मिलान' }, lang)}</Link>
            <Link to="/pricing" className="hover:text-amber-400 transition-colors">{t({ en: 'Pricing', hi: 'मूल्य' }, lang)}</Link>
            <Link to="/features" className="hover:text-amber-400 transition-colors">{t({ en: 'Roadmap', hi: 'रोडमैप' }, lang)}</Link>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">{t({ en: 'Privacy', hi: 'गोपनीयता' }, lang)}</Link>
            <Link to="/terms" className="hover:text-amber-400 transition-colors">{t({ en: 'Terms', hi: 'शर्तें' }, lang)}</Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
              {t({ en: 'Source', hi: 'स्रोत' }, lang)}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageV3;
