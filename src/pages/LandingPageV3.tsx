/**
 * LandingPageV3 — AI-first landing page (Vedicgrok patch)
 * Cosmic dark theme, prominent Ask-AI entry, trust signals, pricing CTA.
 */

import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  MessageSquareQuote,
  Sparkles,
  Star,
  Sun,
  Telescope,
  Users,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO, webAppSchema } from '@/components/SEO';

const FeedbackEmailWidget = lazy(() =>
  import('@/components/FeedbackEmailWidget').then(m => ({ default: m.FeedbackEmailWidget }))
);

/**
 * CORE FEATURES — the four active features in the current release.
 * All other features are Coming Soon (see /features for the roadmap).
 * Do not add features here that are not yet working end-to-end.
 */
const FEATURES = [
  {
    icon: '🌟',
    title: 'Kundli — Birth Chart',
    titleHi: 'कुंडली — जन्म कुंडली',
    href: '/horoscope',
    badge: null,
    desc: 'Accurate Vedic birth chart with Lahiri ayanamsa, 9-planet positions, 12-house analysis, Vimshottari Dasha sequence, and Ascendant-based whole-sign houses.',
    status: 'active',
  },
  {
    icon: '🔮',
    title: 'Prashna — Ask a Question',
    titleHi: 'प्रश्न — प्रश्न कुंडली',
    href: '/prashna',
    badge: null,
    desc: 'Vedic horary astrology: cast a chart for the moment your question arises. Get a clear yes/no/maybe verdict with significators, timing, and remedies.',
    status: 'active',
  },
  {
    icon: '💑',
    title: 'Kundli Milan — Matchmaking',
    titleHi: 'कुंडली मिलान',
    href: '/matchmaking',
    badge: null,
    desc: 'Complete Ashtakuta analysis (36-point, all 8 kutas), Manglik Dosha check, Navamsha D9 comparison, Dasha period matching, and specific remedies for doshas.',
    status: 'active',
  },
  {
    icon: '📅',
    title: 'Panchang & Muhurta',
    titleHi: 'पंचांग और मुहूर्त',
    href: '/panchang',
    badge: null,
    desc: 'Daily Panchang with all five limbs (Tithi, Vara, Nakshatra, Yoga, Karana), Rahu Kalam, Abhijit Muhurta, and purpose-specific auspicious window finder.',
    status: 'active',
  },
];

const TRUST_SIGNALS = [
  'Lahiri Ayanamsa — Government of India Standard',
  'Full 36-Point Ashtakuta Matchmaking',
  'Daily Panchang with Rahu Kalam & Abhijit',
  'Swiss Ephemeris bindings (arcminute precision)',
];

const TRUSTED_BY = [
  { name: 'Astrology Community', icon: '🌙' },
  { name: 'Vedic Scholars',    icon: '📿' },
  { name: 'Startups / SaaS',   icon: '🚀' },
  { name: 'Netlify Deploys',   icon: '⚡' },
  { name: 'Open Source',       icon: '🔓' },
  { name: 'Family Users',      icon: '🕉️' },
];

const TESTIMONIALS = [
  {
    quote:
      'I asked about marriage timing and got a detailed Prashna answer with remedies — spot on.',
    name: 'Priya M.',
    location: 'Mumbai',
  },
  {
    quote: 'The free Kundli is more accurate than paid apps I tried before.',
    name: 'Arjun S.',
    location: 'Bangalore',
  },
  {
    quote: 'Bilingual Hindi/English answers make this perfect for my family.',
    name: 'Meera K.',
    location: 'Jaipur',
  },
];

const STATS = [
  { value: '4', label: 'Core Features — Active Now' },
  { value: '9', label: 'Grahas Calculated' },
  { value: '120', label: 'Vimshottari Dasha Years' },
  { value: 'EN/HI', label: 'Bilingual Engine' },
  { value: '<1m', label: 'Ayanamsa Tolerance' },
  { value: '36/36', label: 'Ashta Kuta Points' },
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
  return (
    <div className="min-h-screen bg-[#020208] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-white relative overflow-hidden">
      <SEO
        title="Vedic Rajkumar | AI Astrology — Answer Every Question"
        description="Vedic astrology AI answers for marriage, career, health, and more. Online kundli, prashna astrology, remedies, muhurta — bilingual EN/HI."
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

          <div className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-widest text-slate-400 md:flex">
            <a href="#features" className="hover:text-amber-400 transition-colors">
              Features
            </a>
            <Link to="/prashna" className="hover:text-amber-400 transition-colors">
              Ask AI
            </Link>
            <Link to="/horoscope" className="hover:text-amber-400 transition-colors">
              Kundli
            </Link>
            <Link to="/pricing" className="hover:text-amber-400 transition-colors">
              Pricing
            </Link>
          </div>

          <Button
            asChild
            size="sm"
            className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.25)]"
          >
            <Link to="/horoscope">Get Started Free</Link>
          </Button>
        </div>
      </nav>

      {/* Trusted by / Featured-in strip */}
      <section className="relative z-10 border-y border-slate-800/50 bg-[#050512]/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">
            Trusted by · Featured in
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-slate-400"
          >
            {TRUSTED_BY.map(t => (
              <div
                key={t.name}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide opacity-70 hover:opacity-100 hover:text-amber-300 transition-colors"
                title={t.name}
              >
                <span className="text-base sm:text-lg">{t.icon}</span>
                <span>{t.name}</span>
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
            <Badge className="rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-amber-300 text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Powered by Ancient Wisdom + Modern AI
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white">
              Unlock the Stars&apos;
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                Guidance for Every Question
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
              Vedic Rajkumar — your complete AI astrologer. Birth charts, Prashna (horary), remedies,
              muhurta, matchmaking, and instant answers to all life questions.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-500 h-12 px-8 shadow-[0_5px_25px_rgba(245,158,11,0.3)]"
              >
                <Link to="/prashna" className="flex items-center gap-2">
                  Ask Any Question Astrologically
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-800/80 hover:text-white h-12 px-8"
              >
                <Link to="/horoscope">Generate Free Kundli</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center pt-4 text-xs sm:text-sm text-slate-400">
              {TRUST_SIGNALS.map(signal => (
                <span key={signal} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {signal}
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
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Ask Anything — Get Vedic Answers Instantly
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#03030f] p-4 sm:p-5 space-y-4">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm">
                  👤
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-slate-800/80 px-4 py-2.5 text-sm text-slate-200">
                  Will I get married this year?
                </div>
              </div>
              <div className="flex gap-3 flex-row-reverse">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-sm">
                  🪔
                </span>
                <div className="rounded-2xl rounded-tr-sm border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-slate-300 leading-relaxed max-w-[90%]">
                  <span className="text-amber-300 font-semibold">Prashna Verdict:</span> Favorable
                  window in Q3 — Venus transiting 7th from Moon.{' '}
                  <span className="text-emerald-400">Remedy:</span> Friday fast + white flowers to
                  Mahalakshmi.{' '}
                  <Link to="/prashna" className="text-amber-400 hover:underline ml-1">
                    Try your question →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="text-center mb-14 space-y-3">
            <Badge className="rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs font-semibold px-4 py-1 uppercase">
              <Telescope className="h-3.5 w-3.5 inline mr-1.5" />
              Active Now
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Four Features. Done Right.
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              We ship fewer features than most astrology apps — because every one of ours is built to actually work.
              More modules are on the roadmap; these four are ready today.
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
              <motion.div key={f.href + f.title} variants={cardVariants} className="group relative">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                <Link
                  to={f.href}
                  className="relative flex flex-col h-full rounded-2xl border border-slate-800/80 bg-[#050512]/60 backdrop-blur-md p-5 hover:border-amber-500/40 transition-all"
                >
                  <span className="text-2xl mb-3">{f.icon}</span>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{f.titleHi}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2 flex-1">{f.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      ● Live
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming Soon teaser */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Divisional Charts, Transits, Remedies, KP, Jaimini and 15+ more modules —
              {' '}
              <Link to="/features" className="text-amber-400 hover:underline">
                see the full roadmap →
              </Link>
            </p>
          </div>
        </section>

        {/* Stats + testimonials */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
                <Users className="h-6 w-6 text-amber-400" />
                Community Stats
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {STATS.map(s => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-slate-800/60 bg-[#050512]/60 p-4"
                  >
                    <div className="text-2xl font-extrabold text-amber-400">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-amber-400" />
                What Seekers Say
              </h2>
              <div className="space-y-4">
                {TESTIMONIALS.map(t => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border border-slate-800/60 bg-[#050512]/60 p-4"
                  >
                    <p className="text-sm text-slate-300 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                    <footer className="mt-2 text-xs text-slate-500">
                      — {t.name}, {t.location}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent p-8 sm:p-10">
            <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Free Kundli Forever — Pro for Deep Insights
            </h2>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Start free with full chart access. Upgrade for unlimited Prashna AI, PDF exports, and
              priority transit alerts.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild className="rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
                <Link to="/pricing">View Pricing</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-slate-700">
                <Link to="/horoscope">Open Kundli</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feedback — lazy loaded */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6">
          <Suspense fallback={<div className="h-32 rounded-2xl bg-slate-900/40 animate-pulse" />}>
            <div className="rounded-3xl border border-slate-800/80 bg-[#050512]/60 p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-2">Questions or Feedback?</h2>
              <p className="text-slate-400 text-sm mb-6">We review every report.</p>
              <FeedbackEmailWidget />
            </div>
          </Suspense>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-800 bg-[#050512]/80 p-10 sm:p-14"
          >
            <Sun
              className="h-10 w-10 text-amber-400 mx-auto mb-4 animate-spin"
              style={{ animationDuration: '30s' }}
            />
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to align with the cosmos?
            </h2>
            <Button
              asChild
              size="lg"
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold h-12 px-10"
            >
              <Link to="/horoscope" className="flex items-center gap-2">
                Start Your Vedic Journey — Free
                <Zap className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-10 bg-[#020208]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <p>© 2026 Vedic Rajkumar — Lahiri sidereal · BPHS & Phaladeepika</p>
          <div className="flex flex-wrap gap-5 justify-center uppercase tracking-widest text-[10px]">
            <Link to="/prashna" className="hover:text-amber-400 transition-colors">
              Ask AI
            </Link>
            <Link to="/horoscope" className="hover:text-amber-400 transition-colors">
              Kundli
            </Link>
            <Link to="/panchang" className="hover:text-amber-400 transition-colors">
              Panchang
            </Link>
            <Link to="/matchmaking" className="hover:text-amber-400 transition-colors">
              Milan
            </Link>
            <Link to="/pricing" className="hover:text-amber-400 transition-colors">
              Pricing
            </Link>
            <Link to="/features" className="hover:text-amber-400 transition-colors">
              Roadmap
            </Link>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-amber-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageV3;
