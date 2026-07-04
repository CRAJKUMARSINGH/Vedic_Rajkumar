"""Rewrites LandingPage.tsx with clean UTF-8 (no BOM)."""
import os, pathlib

ROOT = pathlib.Path(__file__).parent.parent
OUT  = ROOT / "src" / "pages" / "LandingPage.tsx"

CODE = r"""/**
 * LandingPage.tsx - Vedic Rajkumar
 * Colourful Replit-style landing page. All 60+ features wired.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Star, Zap, BookOpen, Heart, Clock,
  CalendarCheck, MessageSquareQuote, ShieldCheck, Telescope,
  Sun, Globe, Gem, Brain, Users, ChevronDown, ChevronUp,
  BarChart3, Map, Compass, Scroll, FlaskConical, Trophy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO, webAppSchema } from '@/components/SEO';
import { FeedbackEmailWidget } from '@/components/FeedbackEmailWidget';
import { FEATURE_CATALOG, FEATURE_CATEGORIES } from '@/routes/featureRegistry';
import { repoMetrics, repoHighlights } from '@/data/siteContent';

const CAT_COLORS: Record<string, string> = {
  foundation:           'from-amber-500 to-orange-500',
  timing:               'from-violet-500 to-purple-600',
  'daily-muhurat':      'from-teal-500 to-cyan-500',
  marriage:             'from-pink-500 to-rose-600',
  'life-domains':       'from-blue-500 to-indigo-600',
  'advanced-classical': 'from-yellow-500 to-amber-600',
  'world-systems':      'from-emerald-500 to-green-600',
  remedies:             'from-red-500 to-rose-500',
  'ai-prashna':         'from-fuchsia-500 to-purple-500',
  platform:             'from-sky-500 to-blue-600',
};

const CAT_BG: Record<string, string> = {
  foundation:           'bg-amber-500/10 border-amber-500/25',
  timing:               'bg-violet-500/10 border-violet-500/25',
  'daily-muhurat':      'bg-teal-500/10 border-teal-500/25',
  marriage:             'bg-pink-500/10 border-pink-500/25',
  'life-domains':       'bg-blue-500/10 border-blue-500/25',
  'advanced-classical': 'bg-yellow-500/10 border-yellow-500/25',
  'world-systems':      'bg-emerald-500/10 border-emerald-500/25',
  remedies:             'bg-red-500/10 border-red-500/25',
  'ai-prashna':         'bg-fuchsia-500/10 border-fuchsia-500/25',
  platform:             'bg-sky-500/10 border-sky-500/25',
};
"""

OUT.write_text(CODE, encoding="utf-8")
print(f"Written {len(CODE)} chars to {OUT}")
