import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const Section: React.FC<{ title: string; items: string[]; idx: number }> = ({ title, items, idx }) => (
  <motion.section
    custom={idx}
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.15 }}
    className="rounded-2xl border border-amber-500/15 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8 shadow-[0_0_0_1px_rgba(251,191,36,0.06)_inset]"
  >
    <h2 className="text-xl sm:text-2xl font-bold text-amber-200 mb-4 flex items-center gap-2">
      <Shield className="w-5 h-5 text-amber-400" />
      {title}
    </h2>
    <ul className="space-y-3 text-amber-50/85 leading-relaxed text-sm sm:text-base">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  </motion.section>
);

const PrivacyPage: React.FC = () => {
  const sections: Array<{ title: string; items: string[] }> = [
    {
      title: '1. Data We Collect',
      items: [
        'Name, email, and authentication data via Clerk when you sign up.',
        'Birth details you voluntarily provide: date of birth, time of birth, place of birth (city, latitude, longitude).',
        'Questions you ask in Prashna / AI flows, matchmaking inputs, and saved charts.',
        'Device/browser metadata and basic analytics for performance and abuse detection.',
      ],
    },
    {
      title: '2. How We Use Your Data',
      items: [
        'Generate Vedic birth charts, dashas, compatibility scores, panchang, transits, muhurat and related astrological calculations.',
        'Power AI-assisted interpretations (when enabled) using chart context; prompts are not used to re-train models.',
        'Authenticate sessions, manage your saved readings, and send service-related emails (e.g., password reset).',
        'Enforce abuse protection, rate limits, and comply with lawful requests from competent authorities.',
      ],
    },
    {
      title: '3. Birth Data Sensitivity & Retention',
      items: [
        'Birth data (date/time/place) is treated as highly sensitive and stored with Supabase Row Level Security policies so only your account can read or write it.',
        'You can export all your saved charts and readings via the My Readings page at any time.',
        'You can permanently delete your account and associated data from account settings; deleted data is hard-removed within 30 days from backups where technically possible.',
        'We do not sell, rent, or license any personal data — especially birth and biographical data — to third parties.',
      ],
    },
    {
      title: '4. AI & Interpretations',
      items: [
        'AI-generated astrology insights are advisory in nature and not a substitute for professional medical, legal, financial, or psychological advice.',
        'We send only the birth chart context necessary for a given question to the AI provider; nothing extra.',
        'Your raw birth data and question history are not included in training datasets unless you opt in to an explicit research program.',
      ],
    },
    {
      title: '5. Third Parties & Sub-processors',
      items: [
        'Clerk — authentication (privacy.clerk.com).',
        'Supabase — database, storage, edge functions (supabase.com/privacy).',
        'Netlify — hosting and edge compute (netlify.com/privacy).',
        'OpenRouter / equivalent LLM gateway — AI interpretation requests, processed with data-in-transit encryption.',
      ],
    },
    {
      title: '6. Security & Your Rights',
      items: [
        'All data in transit uses HTTPS/TLS 1.3; Supabase uses at-rest AES-256 encryption.',
        'Access to production data is limited to named maintainers on a need-to-access basis.',
        'You have the right to access, correct, export, and erase your personal data under GDPR, CCPA/CPRA, and similar regimes — write to privacy@vedicrajkumar.com.',
        'We will respond to verified rights requests within 30 calendar days.',
      ],
    },
    {
      title: '7. Cookies & Local Storage',
      items: [
        'We use essential Clerk and Supabase session cookies plus React app state in localStorage (e.g., language preference, birth draft form).',
        'We do not use third-party advertising cookies; analytics (if enabled) are anonymised.',
      ],
    },
    {
      title: '8. Changes & Contact',
      items: [
        'This Privacy Policy may be updated materially; changes will be posted here with a revised effective date and, where required, we will notify you by email.',
        'Effective date: 2026-08-29.',
        'Data Protection contact: privacy@vedicrajkumar.com — Grievance Officer: Rajkumar Singh.',
      ],
    },
  ];

  return (
    <div className="relative min-h-screen text-amber-50 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.10),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.10),_transparent_55%)] bg-[#0b0a13]">
      <div className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-amber-300/80 hover:text-amber-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-9 h-9 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
          </div>
          <p className="text-amber-100/70 text-base sm:text-lg max-w-2xl">
            Vedic Rajkumar treats birth data as sacred. This document explains exactly what we
            collect, why we store it, and how you can export or delete anything, anytime.
          </p>
          <p className="mt-3 text-xs text-amber-200/50">
            Last updated: 29 August 2026 · Effective date: 29 August 2026
          </p>
        </motion.div>

        <div className="space-y-5">
          {sections.map((s, i) => (
            <Section key={s.title} title={s.title} items={s.items} idx={i + 1} />
          ))}
        </div>

        <footer className="mt-12 text-center text-amber-200/40 text-xs sm:text-sm">
          © {new Date().getFullYear()} Vedic Rajkumar · Om Shanti
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPage;
