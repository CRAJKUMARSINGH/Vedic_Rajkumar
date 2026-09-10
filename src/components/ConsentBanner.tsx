/**
 * ConsentBanner.tsx
 *
 * Week 4: GDPR/CCPA privacy consent banner.
 *
 * Appears on first visit if the user has not yet given or declined consent.
 * Slides in from the bottom of the viewport without blocking page content.
 * Stores the user's choice in localStorage via the useConsent hook.
 *
 * Accessibility:
 * - role="dialog" with aria-labelledby and aria-describedby
 * - Focus is moved into the banner on mount
 * - Keyboard: Tab cycles within banner, Enter/Space activates buttons
 *
 * Usage:
 *   <ConsentBanner />    // self-contained; reads/writes its own state
 */

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, X } from 'lucide-react';
import { useConsent } from '@/hooks/useConsent';

// ─── Component ────────────────────────────────────────────────────────────────

const ConsentBanner: React.FC = () => {
  const { hasDismissed, giveConsent, declineConsent } = useConsent();
  const acceptBtnRef = useRef<HTMLButtonElement>(null);

  // Move focus to the Accept button when banner appears
  useEffect(() => {
    if (!hasDismissed) {
      // Small delay so the animation is visible before focus moves
      const t = setTimeout(() => acceptBtnRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [hasDismissed]);

  // Hidden once the user has made a choice
  if (hasDismissed) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-desc"
      className={[
        // Position: fixed bottom bar
        'fixed bottom-0 left-0 right-0 z-50',
        // Layout
        'flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6',
        'px-5 py-4 sm:px-8 sm:py-5',
        // Visual
        'bg-[#140d04]/95 backdrop-blur-md',
        'border-t border-amber-500/20',
        'shadow-[0_-4px_24px_rgba(0,0,0,0.5)]',
        // Entry animation
        'animate-[slideUp_0.35s_cubic-bezier(0.16,1,0.3,1)_both]',
      ].join(' ')}
      style={{
        // Fallback for the keyframe animation defined in index.css / Tailwind config
        // Uses a CSS custom property so the keyframe works regardless of Tailwind setup
      }}
    >
      {/* ── Icon + Text ───────────────────────────────────────────── */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Shield
          className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p
            id="consent-banner-title"
            className="text-sm font-semibold text-amber-200 leading-snug"
          >
            Your privacy, your choice
          </p>
          <p
            id="consent-banner-desc"
            className="text-xs text-amber-100/70 mt-0.5 leading-relaxed"
          >
            We use essential cookies to run this app, and optional analytics to
            understand how it's used. Birth data is always encrypted and
            owner-scoped.{' '}
            <Link
              to="/privacy"
              className="underline underline-offset-2 text-amber-300/90 hover:text-amber-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded"
            >
              Privacy Policy
            </Link>
            {' · '}
            <Link
              to="/terms"
              className="underline underline-offset-2 text-amber-300/90 hover:text-amber-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded"
            >
              Terms
            </Link>
            {' · '}
            <Link
              to="/privacy-settings"
              className="underline underline-offset-2 text-amber-300/90 hover:text-amber-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded"
            >
              Manage preferences · गोपनीयता सेटिंग्स
            </Link>
          </p>
        </div>
      </div>

      {/* ── Action buttons ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
        <button
          type="button"
          onClick={declineConsent}
          className={[
            'text-xs text-amber-200/60 hover:text-amber-200',
            'px-3 py-1.5 rounded-lg transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
          ].join(' ')}
          aria-label="Decline optional cookies"
        >
          Decline
        </button>

        <button
          ref={acceptBtnRef}
          type="button"
          onClick={giveConsent}
          className={[
            'text-xs font-semibold text-stone-900',
            'bg-amber-400 hover:bg-amber-300 active:bg-amber-500',
            'px-4 py-1.5 rounded-lg transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'focus-visible:ring-amber-400 focus-visible:ring-offset-[#140d04]',
          ].join(' ')}
          aria-label="Accept cookies and continue"
        >
          Accept
        </button>

        {/* Dismiss without choosing — equivalent to Decline */}
        <button
          type="button"
          onClick={declineConsent}
          className={[
            'text-amber-200/40 hover:text-amber-200/80',
            'p-1.5 rounded-lg transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
          ].join(' ')}
          aria-label="Close consent banner"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;
