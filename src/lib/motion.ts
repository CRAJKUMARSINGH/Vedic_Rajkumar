/**
 * src/lib/motion.ts
 * Shared Framer Motion animation variants — Week 26 SaaS modernization
 * Respects prefers-reduced-motion via the `useReducedMotion` hook at call site.
 */

import type { Variants, Transition } from 'framer-motion';

// ── Base transitions ──────────────────────────────────────────────────────────

export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const smooth: Transition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94], // cubic-bezier ease-out-quart
  duration: 0.35,
};

export const snappy: Transition = {
  type: 'tween',
  ease: [0.16, 1, 0.3, 1], // expo-out
  duration: 0.4,
};

// ── Page / route transitions ──────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: snappy },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ── Card / panel entrance ─────────────────────────────────────────────────────

export const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1,    y: 0, transition: smooth },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};

// ── Staggered list children ───────────────────────────────────────────────────

export const listContainer: Variants = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const listItem: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: smooth },
};

// ── Fade in ───────────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

// ── Slide up ──────────────────────────────────────────────────────────────────

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: snappy },
  exit:    { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

// ── Scale pop (for planet badges, score indicators) ───────────────────────────

export const scalePop: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1,   opacity: 1, transition: spring },
  exit:    { scale: 0.8, opacity: 0, transition: { duration: 0.15 } },
};

// ── Neon pulse (for planet glow cards) ───────────────────────────────────────

export const neonPulse: Variants = {
  animate: {
    boxShadow: [
      '0 0 8px hsl(320 100% 60% / 0.3)',
      '0 0 20px hsl(320 100% 60% / 0.6)',
      '0 0 8px hsl(320 100% 60% / 0.3)',
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

// ── Glassmorphism card hover ──────────────────────────────────────────────────

export const glassHover = {
  whileHover: { scale: 1.015, transition: spring },
  whileTap:   { scale: 0.985, transition: spring },
};

// ── Bento tile entrance (used with index-based delay) ────────────────────────

export function bentoTile(index: number): Variants {
  return {
    initial: { opacity: 0, y: 16, scale: 0.96 },
    animate: {
      opacity: 1, y: 0, scale: 1,
      transition: { ...snappy, delay: index * 0.07 },
    },
  };
}
