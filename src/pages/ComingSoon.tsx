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

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Map, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { BOTTOM_BAR_NAV_LINKS, FEATURE_CATEGORIES, getFeatureByPath } from '@/routes/featureRegistry';

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
  const location = useLocation();
  const catalogFeature = getFeatureByPath(location.pathname);
  const category = FEATURE_CATEGORIES.find(c => c.id === catalogFeature?.category);
  const activeCoreFeatures = BOTTOM_BAR_NAV_LINKS.filter(item => item.href !== '/');
  const displayDescription = description ?? catalogFeature?.description;

  return (
    <>
      <SEO
        title={`${feature} | Roadmap | Vedic Rajkumar`}
        description={`${feature} is on the Vedic Rajkumar roadmap. Use the active Kundli, Prashna, Kundli Milan, and Panchang tools today.`}
        canonical=""
        noIndex
      />

      <div className="min-h-[calc(100vh-5rem)] bg-[#07070b] text-slate-100 px-4 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mx-auto grid w-full max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
        >
          <section className="rounded-lg border border-slate-800 bg-[#101018] p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase text-amber-300">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Roadmap
              </Badge>
              {category && (
                <Badge className="border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                  {category.label}
                </Badge>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium uppercase tracking-wider text-amber-300/80">
                Focused app enrichment in progress
              </p>
              <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {feature}
              </h1>

              {displayDescription && (
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  {displayDescription}
                </p>
              )}

              {eta && (
                <p className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Roadmap stage: {eta}
                </p>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button asChild className="justify-between rounded-md bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link to="/features">
                  View Full Roadmap
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-between rounded-md border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <Link to="/app">
                  Open Workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-[#101018] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Available Now
              </div>
              <div className="mt-4 space-y-2">
                {activeCoreFeatures.map(item => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-amber-500/50 hover:text-amber-300"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-[#101018] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Map className="h-4 w-4 text-amber-400" />
                Build Standard
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Roadmap modules stay visible, but the app now promotes finished, validated tools
                first. This keeps expectations honest while the deeper Jyotish systems are refined.
              </p>
            </div>

            <Button
              asChild
              variant="ghost"
              className="w-full justify-start rounded-md text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </aside>
        </motion.div>
      </div>
    </>
  );
}
