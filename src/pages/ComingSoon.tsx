/**
 * ComingSoon — reusable placeholder for features not yet in the active scope.
 *
 * Usage in routes:
 *   { path: '/kp-system', element: <ComingSoon feature="KP System" /> }
 *
 * Props:
 *   feature      — human-readable feature name shown as the heading
 *   eta          — optional rough timeline string, e.g. "Week 5"
 *   description  — optional one-liner about what the feature will do
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

interface ComingSoonProps {
  feature: string;
  eta?: string;
  description?: string;
}

export default function ComingSoon({
  feature,
  eta,
  description,
}: ComingSoonProps) {
  return (
    <>
      <SEO
        title={`${feature} — Coming Soon | Vedic Rajkumar`}
        description={`${feature} is under active development and will be available soon on Vedic Rajkumar.`}
        canonical=""
      />

      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020208] text-slate-100 px-4 py-16 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative z-10 max-w-md w-full text-center space-y-6"
        >
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl mx-auto w-fit"
            aria-hidden="true"
          >
            🪔
          </motion.div>

          {/* Badge */}
          <Badge className="rounded-full border border-amber-500/25 bg-amber-500/8 text-amber-300 text-xs font-semibold px-4 py-1.5 uppercase inline-flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Coming Soon
          </Badge>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {feature}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
          )}

          {/* ETA */}
          {eta && (
            <p className="text-xs text-slate-500 inline-flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500/60" />
              Estimated: {eta}
            </p>
          )}

          {/* Card */}
          <div className="rounded-2xl border border-slate-800/70 bg-[#050512]/60 backdrop-blur p-6 space-y-3 text-left">
            <p className="text-sm text-slate-300 font-semibold">
              While you wait, try our active features:
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/horoscope" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  🌟 <span>Birth Chart (Kundli)</span>
                </Link>
              </li>
              <li>
                <Link to="/prashna" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  🔮 <span>Prashna — Ask a Question</span>
                </Link>
              </li>
              <li>
                <Link to="/matchmaking" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  💑 <span>Kundli Milan (Matchmaking)</span>
                </Link>
              </li>
              <li>
                <Link to="/panchang" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  📅 <span>Panchang &amp; Muhurta</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Back button */}
          <Button
            asChild
            variant="outline"
            className="rounded-full border-slate-700 text-slate-300 hover:bg-slate-800/60 hover:text-white"
          >
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </>
  );
}
