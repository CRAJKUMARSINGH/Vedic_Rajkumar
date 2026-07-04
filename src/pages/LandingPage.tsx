/**
 * LandingPage.tsx ??? Vedic Rajkumar
 * Premium professional landing page showcasing ALL app features.
 * Fully responsive, with interactive glassmorphism and ambient glowing backdrops.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Heart,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Sun,
  Telescope,
  Zap,
  Star,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO, webAppSchema } from '@/components/SEO';
import { FeedbackEmailWidget } from '@/components/FeedbackEmailWidget';

// ?????? Feature registry ??? every major app feature ?????????????????????????????????????????????????????????????????????????????????????????????
const ALL_FEATURES = [
  {
    title: 'Kundli / Birth Chart',
    titleHi: '???????????? ??????????????????',
    href: '/app?tab=kundli',
    icon: '???',
    desc: 'North & South Indian chart layouts with precise planetary coordinates, house aspects, and detailed planetary states.',
  },
  {
    title: 'Vimshottari Dasha',
    titleHi: '?????????????????????????????? ?????????',
    href: '/dasha',
    icon: '????',
    desc: 'Complete 120-year timeline down to Pratyanardasha with real-time transit (Gochar) correlation overlays.',
  },
  {
    title: 'Gochar / Transits',
    titleHi: '???????????? ??????',
    href: '/app?tab=transit',
    icon: '????',
    desc: 'Dynamic transit calculation with full Vedha obstruction analysis and planet-wise score outputs.',
  },
  {
    title: 'Panchang',
    titleHi: '??????????????????',
    href: '/panchang',
    icon: '????',
    desc: 'Daily Panchang elements (Tithi, Nakshatra, Yoga, Karana), Rahu Kaal tracking, and Abhijit Muhurta.',
  },
  {
    title: 'Prashna / Horary',
    titleHi: '?????????????????? ?????????????????????',
    href: '/question',
    icon: '????',
    desc: 'Classical Prashna system with a 13-layer reasoning engine delivering a decisive yes/no answer.',
  },
  {
    title: 'Kundli Milan',
    titleHi: '?????????????????? ???????????????',
    href: '/matchmaking',
    icon: '??????',
    desc: 'Comprehensive matchmaking analysis utilizing Ashtakoot Guna Milan and planetary compatibility.',
  },
  {
    title: 'Yogas',
    titleHi: '?????????',
    href: '/yogas',
    icon: '????',
    desc: 'Automated scan for over 50+ classical Yogas including Raj Yoga, Dhana Yoga, and Mahapurusha Yogas.',
  },
  {
    title: 'Ashtakavarga',
    titleHi: '???????????????????????????',
    href: '/ashtakavarga',
    icon: '????',
    desc: 'Sarvashtakavarga bindu distribution tables and transit-intensity correlation grids.',
  },
  {
    title: 'Shadbala',
    titleHi: '???????????????',
    href: '/planetary-strength',
    icon: '????',
    desc: 'Detailed planetary strength evaluation based on the classical six-fold Parashari method.',
  },
  {
    title: 'Divisional Charts',
    titleHi: '????????????????????????',
    href: '/divisional-charts',
    icon: '????',
    desc: 'All 16 divisional charts (D-1 to D-60) including Navamsha, Dasamsha, and Saptamsha.',
  },
  {
    title: 'Sade Sati',
    titleHi: '??????????????? ????????????',
    href: '/sade-sati',
    icon: '????',
    desc: "Saturn's 7.5-year cycle calculation, detailing current phase, intensity, and Vedic remedies.",
  },
  {
    title: 'Manglik Dosha',
    titleHi: '????????????????????? ?????????',
    href: '/app?tab=overview',
    icon: '??????',
    desc: 'Exact calculation of Mars placement from Lagna, Moon, and Venus to determine Manglik influence.',
  },
  {
    title: 'Muhurta / Electional',
    titleHi: '?????????????????????',
    href: '/wedding-muhurat',
    icon: '???',
    desc: 'Find highly auspicious times for weddings, business launches, and new beginnings.',
  },
  {
    title: 'Career Astrology',
    titleHi: '??????????????? ?????????????????????',
    href: '/career-astrology',
    icon: '????',
    desc: 'Detailed vocational analysis scanning the 10th house, lord placement, and Dasamsha (D-10) chart.',
  },
  {
    title: 'Jaimini Astrology',
    titleHi: '?????????????????? ?????????????????????',
    href: '/jaimini',
    icon: '????',
    desc: 'Access Chara Dasha, Karakas (Atmakaraka to Darakaraka), and Argala calculations.',
  },
  {
    title: 'Tajik / Varshaphal',
    titleHi: '??????????????? / ??????????????????',
    href: '/varshaphal',
    icon: '????',
    desc: 'Annual solar return charts showing Muntha, Harsha Bal, and Tajik aspect yogas.',
  },
  {
    title: 'KP System',
    titleHi: '???????????? ??????????????????',
    href: '/kp-system',
    icon: '????',
    desc: 'Krishnamurti Paddhati star-lords, sub-lords, sub-sub-lords, and significators.',
  },
  {
    title: 'Lal Kitab',
    titleHi: '????????? ???????????????',
    href: '/lal-kitab',
    icon: '????',
    desc: 'Unique Lal Kitab planet placements, debt/karmic analysis, and specific simple remedies.',
  },
  {
    title: 'Vedic Remedies',
    titleHi: '??????????????? ????????????',
    href: '/remedies',
    icon: '????',
    desc: 'Custom gemstone recommendations, mantras, fasts, and charity practices based on birth chart.',
  },
  {
    title: 'Numerology',
    titleHi: '????????? ?????????????????????',
    href: '/numerology',
    icon: '????',
    desc: 'Derive your Psychic number, Destiny number, Name compatibility, and year forecasts.',
  },
  {
    title: 'Medical Astrology',
    titleHi: '???????????????????????? ?????????????????????',
    href: '/medical-astrology',
    icon: '????',
    desc: 'A detailed analysis of health strengths and potential weaknesses mapped to houses and signs.',
  },
  {
    title: 'Financial Astrology',
    titleHi: '????????????????????? ?????????????????????',
    href: '/financial-astrology',
    icon: '????',
    desc: 'Evaluation of wealth configurations, house combinations, and auspicious dasha timing.',
  },
  {
    title: 'Compatibility',
    titleHi: '??????????????? ??????????????????',
    href: '/love-astrology',
    icon: '????',
    desc: 'Dual-chart synastry grids mapping aspects between charts for comprehensive compatibility.',
  },
  {
    title: 'Knowledge Library',
    titleHi: '??????????????? ???????????????????????????',
    href: '/knowledge',
    icon: '????',
    desc: 'Vedic scriptural sources, algorithms, and analytical text definitions used by our AI.',
  },
  {
    title: 'Transit Analysis',
    titleHi: '???????????? ????????????????????????',
    href: '/transit-analysis',
    icon: '????',
    desc: 'Professional bilingual transit report with Vedha analysis, Ashtakavarga overlay, and PDF export. EN + HI.',
  },
  {
    title: '4+ Transit Scanner',
    titleHi: '4+ ????????? ???????????? ??????????????????',
    href: '/transit-analysis',
    icon: '???',
    desc: 'Find the nearest date window where ???4 planets are effectively favorable (no Vedha). Scan up to 365 days ahead.',
  },
];

const STATS = [
  { value: '9', label: 'Calculated Grahas', labelHi: '???????????? ????????????' },
  { value: '12', label: 'House Systems', labelHi: '????????? ??????????????????' },
  { value: '27', label: 'Nakshatras', labelHi: '?????????????????????' },
  { value: '120', label: 'Dasha Cycle Years', labelHi: '????????? ???????????? ????????????' },
  { value: '26+', label: 'Feature Modules', labelHi: '???????????? ?????????????????????' },
  { value: 'EN/HI', label: 'Bilingual Engine', labelHi: '???????????????????????? ????????????' },
];

const ACCURACY_POINTS = [
  {
    title: 'Lahiri Ayanamsa',
    detail:
      'Standardized Chitrapaksha Lahiri calculations representing the official sidereal standard.',
  },
  {
    title: 'Meeus Ascendant',
    detail:
      'Uses the precise high-accuracy trigonometric formulas: atan2(cos RAMC, ???sin????tan?? ??? cos????sinRAMC).',
  },
  {
    title: 'Timezone-aware Lagna',
    detail:
      'UTC offset derived directly from geographic birth longitude, fixing the legacy Indian-only IST bias.',
  },
  {
    title: 'Whole-sign houses',
    detail:
      'Planets assigned cleanly to houses relative to the ascendant rashi index as per Parashari standards.',
  },
  {
    title: 'Dasha from Moon Nak.',
    detail:
      "Vimshottari balance computed directly from the Moon's exact degree inside the birth nakshatra.",
  },
  {
    title: 'Vedha-corrected transit',
    detail:
      'Gochar beneficence blocked automatically when a transiting planet receives Vedha obstruction.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#020208] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-white relative overflow-hidden">
      <SEO
        title="Vedic Rajkumar | Complete Vedic Astrology Platform"
        description="Kundli, Dasha, Gochar, Panchang, Prashna AI, Kundli Milan, Yogas, Ashtakavarga ??? bilingual EN/HI. Accurate Lahiri sidereal calculations."
        keywords="vedic astrology, kundli, dasha, gochar, panchang, prashna, kundli milan, ashtakavarga, jyotish"
        canonical="/"
        structuredData={webAppSchema}
      />

      {/* ?????? Ambient Background Glows & Stars ?????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle pulsating glows */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.06)_0%,transparent_70%)] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] animate-pulse"
          style={{ animationDuration: '12s' }}
        />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,rgba(217,70,239,0.04)_0%,transparent_70%)]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />
      </div>

      {/* ?????? Navigation Header ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      <nav className="relative z-20 border-b border-slate-800/60 bg-[#020208]/75 backdrop-blur-xl sticky top-0">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-orange-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Sun
                className="h-5.5 w-5.5 text-amber-400 animate-spin"
                style={{ animationDuration: '30s' }}
              />
            </span>
            <div>
              <div className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                VEDIC RAJKUMAR
              </div>
              <div className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                ??????????????? ???????????????????????? ?????????????????????
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-400 lg:flex">
            <a href="#features" className="hover:text-amber-400 transition-colors">
              Features
            </a>
            <a href="#accuracy" className="hover:text-amber-400 transition-colors">
              Accuracy
            </a>
            <a href="#workflow" className="hover:text-amber-400 transition-colors">
              Workflow
            </a>
            <Link to="/panchang" className="hover:text-amber-400 transition-colors">
              Panchang
            </Link>
            <Link to="/dasha" className="hover:text-amber-400 transition-colors">
              Dasha
            </Link>
            <Link to="/transit-analysis" className="hover:text-amber-400 transition-colors">
              Transit Analysis
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-slate-800/80 bg-slate-900/40 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all hidden sm:inline-flex px-5 h-9"
            >
              <Link to="/question">Prashna AI</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all px-5 h-9"
            >
              <Link to="/app?tab=kundli" className="flex items-center gap-1">
                Open Chart <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ?????? Hero Section ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      <header className="relative z-10 py-16 sm:py-24 overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-8 relative">
          {/* Pulsating glowing core behind hero */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            <Badge className="rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-2 inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Lahiri Sidereal ??? DD/MM/YYYY ??? Bilingual (EN/HI)
            </Badge>

            <h1 className="text-4xl sm:text-7xl font-extrabold leading-tight tracking-tight text-white">
              Vedic Astrology
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                Perfected for Precision
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
              A comprehensive calculations platform computing high-fidelity Kundli charts,
              dashboards, transit Vedha analysis, and Prashna AI. Rooted in classical references
              (BPHS &amp; Phaladeepika) with zero approximations.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-500 h-13 px-8 shadow-[0_5px_25px_rgba(245,158,11,0.3)] transition-all"
              >
                <Link to="/app?tab=kundli" className="flex items-center gap-2">
                  Open Birth Chart <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-slate-800 bg-slate-900/30 text-slate-300 hover:bg-slate-800/80 hover:text-white h-13 px-8 transition-all"
              >
                <Link to="/dasha">Dasha Timeline</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-slate-800 bg-slate-900/30 text-slate-300 hover:bg-slate-800/80 hover:text-white h-13 px-8 transition-all"
              >
                <Link to="/question">Prashna AI</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto pt-8"
          >
            {STATS.map(s => (
              <div
                key={s.value}
                className="rounded-2xl border border-slate-800/50 bg-[#050512]/60 p-4 backdrop-blur-md hover:border-amber-500/20 hover:bg-amber-500/[0.02] transition-all duration-300"
              >
                <div className="text-2xl font-extrabold text-amber-400 bg-gradient-to-b from-amber-300 to-amber-500 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-[11px] font-bold text-slate-300 mt-1 tracking-wide">
                  {s.label}
                </div>
                <div className="text-[9px] font-semibold text-slate-500 mt-0.5">{s.labelHi}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ?????? Main Content Area ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      <main className="relative z-10 space-y-32 pb-32">
        {/* ?????? Feature Registry Section ??????????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-20">
          <div className="text-center mb-16 space-y-4">
            <Badge className="rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs font-semibold px-4 py-1 inline-flex items-center gap-1.5 uppercase">
              <Telescope className="h-3.5 w-3.5" /> Comprehensive Astro Suite
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              24+ Specialized Vedic Modules
            </h2>
            <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Every classical Vedic system is wired into our unified core. Get instant calculations,
              remedies, and logical breakdowns on a clean, modern interface.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {ALL_FEATURES.map(f => (
              <motion.div key={f.href + f.title} variants={cardVariants} className="group relative">
                {/* Glow border overlay */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />

                <Link
                  to={f.href}
                  className="relative flex flex-col justify-between h-full rounded-2xl border border-slate-800/80 bg-[#050512]/60 backdrop-blur-md p-5 
                             hover:border-slate-700/80 hover:bg-[#070719]/80 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-2xl group-hover:scale-110 transition-transform duration-300">
                        {f.icon}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors duration-300">
                        {f.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{f.titleHi}</p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">{f.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ?????? Mathematical Accuracy Section ???????????????????????????????????????????????????????????????????????????????????????????????? */}
        <section
          id="accuracy"
          className="relative overflow-hidden border-y border-slate-900 bg-gradient-to-b from-[#03030f] via-[#050515] to-[#03030f] py-24 scroll-mt-20"
        >
          {/* Subtle grid accent inside section */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.03),transparent_50%)]" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs font-semibold px-4 py-1.5 uppercase inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> High-Accuracy Engine
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                No Approximations. Just Math.
              </h2>
              <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                We resolved critical astronomical bugs commonly found in web calculators. Our
                platform delivers reliable Lahiri planetary states matching NASA &amp; IAU
                references.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ACCURACY_POINTS.map(p => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.01] p-6 hover:border-emerald-500/25 hover:bg-emerald-500/[0.02] transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                      ???
                    </span>
                    <h3 className="text-base font-bold text-emerald-200">{p.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ?????? Workflow Steps Section ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
        <section id="workflow" className="max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-20">
          <div className="text-center mb-16 space-y-4">
            <Badge className="rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs font-semibold px-4 py-1 uppercase inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Workflow
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Three Steps to Insight
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Enter Birth Details',
                detail:
                  'Enter date (DD/MM/YYYY), birth time, and location. Our system automatically resolves precise coordinates and correct local offsets.',
              },
              {
                step: '02',
                title: 'Compute All Modules',
                detail:
                  'The core calculation engine calculates Kundli, Gochar, Dashas, and Yogas instantly. No loading times or partial loads.',
              },
              {
                step: '03',
                title: 'Review Actionable Output',
                detail:
                  'Each section includes descriptive verdicts, timing windows, remedies, and simple interpretations for practitioners and beginners alike.',
              },
            ].map(s => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-slate-800 bg-[#050512]/60 p-6 shadow-xl hover:border-slate-700 hover:bg-[#070719]/80 transition-all duration-300"
              >
                <div className="absolute top-[-20px] left-[25px] flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm shadow-[0_4px_12px_rgba(245,158,11,0.25)]">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 pt-2">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ?????? Quick Access Tiles Section ????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-10 tracking-tight">
            Jump Straight In
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                title: 'Birth Chart',
                titleHi: '???????????? ??????????????????',
                href: '/app?tab=kundli',
                bg: 'from-amber-600 to-orange-700 shadow-orange-950/20',
                icon: <Star className="h-6 w-6" />,
              },
              {
                title: 'Prashna AI',
                titleHi: '?????????????????? ?????????',
                href: '/question',
                bg: 'from-rose-600 to-red-700 shadow-rose-950/20',
                icon: <MessageSquareQuote className="h-6 w-6" />,
              },
              {
                title: 'Dasha',
                titleHi: '?????????',
                href: '/dasha',
                bg: 'from-violet-600 to-purple-700 shadow-purple-950/20',
                icon: <Clock className="h-6 w-6" />,
              },
              {
                title: 'Panchang',
                titleHi: '??????????????????',
                href: '/panchang',
                bg: 'from-teal-600 to-cyan-700 shadow-teal-950/20',
                icon: <CalendarCheck className="h-6 w-6" />,
              },
              {
                title: 'Kundli Milan',
                titleHi: '?????????????????? ???????????????',
                href: '/matchmaking',
                bg: 'from-pink-600 to-rose-700 shadow-pink-950/20',
                icon: <Heart className="h-6 w-6" />,
              },
              {
                title: 'Knowledge',
                titleHi: '??????????????? ???????????????????????????',
                href: '/knowledge',
                bg: 'from-emerald-600 to-green-700 shadow-emerald-950/20',
                icon: <BookOpen className="h-6 w-6" />,
              },
              {
                title: 'Transit Analysis',
                titleHi: '???????????? ????????????????????????',
                href: '/transit-analysis',
                bg: 'from-indigo-600 to-violet-700 shadow-indigo-950/20',
                icon: <Telescope className="h-6 w-6" />,
              },
            ].map(tile => (
              <Link
                key={tile.href}
                to={tile.href}
                className={`group relative flex items-center gap-4 rounded-2xl bg-gradient-to-br ${tile.bg} p-6 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300`}
              >
                <span className="text-white/80 group-hover:text-white group-hover:rotate-12 transition-transform duration-300">
                  {tile.icon}
                </span>
                <div>
                  <div className="text-white font-extrabold tracking-wide text-base">
                    {tile.title}
                  </div>
                  <div className="text-white/60 text-xs font-semibold mt-0.5">{tile.titleHi}</div>
                </div>
                <ArrowRight className="ml-auto h-5 w-5 text-white/50 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </section>

        {/* ?????? Feedback Form Section ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-3xl border border-slate-800/80 bg-[#050512]/60 p-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-2xl font-extrabold text-white mb-3">Feedback &amp; Suggestions</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 font-medium">
              Calculations look off or have suggestions for new features? Let us know ??? we review
              every single report.
            </p>
            <FeedbackEmailWidget />
          </div>
        </section>
      </main>

      {/* ?????? Footer ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      <footer className="relative z-10 border-t border-slate-850 py-10 bg-[#020208]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-semibold tracking-wide">
          <p className="text-center md:text-left">
            ?? 2026 Vedic Rajkumar ??? Official Lahiri Sidereal reference calculations based on
            Phaladeepika &amp; BPHS
          </p>
          <div className="flex gap-5 flex-wrap justify-center uppercase tracking-widest text-[10px]">
            <Link to="/app?tab=kundli" className="hover:text-amber-400 transition-colors">
              Chart
            </Link>
            <Link to="/dasha" className="hover:text-amber-400 transition-colors">
              Dasha
            </Link>
            <Link to="/panchang" className="hover:text-amber-400 transition-colors">
              Panchang
            </Link>
            <Link to="/question" className="hover:text-amber-400 transition-colors">
              Prashna
            </Link>
            <Link to="/transit-analysis" className="hover:text-amber-400 transition-colors">
              Transit
            </Link>
            <Link to="/knowledge" className="hover:text-amber-400 transition-colors">
              Library
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
