/**
 * GuidedTour.tsx — Gap 7: In-App Onboarding & Contextual Help
 * Lightweight step-by-step guided tour for first-time users.
 * Uses DOM element targeting via data-tour attributes (no heavy deps).
 */

import React, { useCallback, useEffect, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TourStep {
  /** CSS selector for the target element (data-tour="xxx" preferred). */
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  /** Whether the tour is active. Pass false after user dismisses. */
  active: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

// ── Tour Steps Definition ─────────────────────────────────────────────────────

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="chart-lagna"]',
    title: 'Your Lagna (Ascendant)',
    content:
      'The Lagna is the most important point in your chart — the zodiac sign rising on the eastern horizon at your birth moment. All 12 houses are counted from here.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="dasha-timeline"]',
    title: 'Vimshottari Dasha',
    content:
      'Dasha periods show which planet governs a phase of your life. The sequence follows: Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury.',
    placement: 'top',
  },
  {
    target: '[data-tour="ashtakavarga"]',
    title: 'Ashtakavarga Scores',
    content:
      'Each house gets a strength score (0\u20138) from 8 sources. Houses scoring 4+ during a transit are considered favorable for that planet\'s transiting energy.',
    placement: 'left',
  },
  {
    target: '[data-tour="transits-panel"]',
    title: 'Live Transits (Gochar)',
    content:
      'Current planetary positions overlaid on your natal chart. Watch for double transits of Jupiter + Saturn — they mark life-defining periods.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="panchang"]',
    title: 'Daily Panchang',
    content:
      'Five limbs of Vedic time: Tithi (lunar day), Nakshatra (star), Yoga, Karana, and Vara (weekday). Auspicious timing (Muhurta) combines all five.',
    placement: 'right',
  },
];

const STORAGE_KEY = 'vedic_tour_completed';

// ── Tooltip Positioning ───────────────────────────────────────────────────────

function getTooltipStyle(
  rect: DOMRect,
  placement: TourStep['placement'] = 'bottom',
): React.CSSProperties {
  const GAP = 12;
  const scrollY = window.scrollY;

  switch (placement) {
    case 'top':
      return { bottom: window.innerHeight - rect.top - scrollY + GAP, left: rect.left };
    case 'left':
      return { top: rect.top + scrollY, right: window.innerWidth - rect.left + GAP };
    case 'right':
      return { top: rect.top + scrollY, left: rect.right + GAP };
    default: // bottom
      return { top: rect.bottom + scrollY + GAP, left: rect.left };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GuidedTour({ active, onComplete, onSkip }: GuidedTourProps) {
  const [step, setStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [visible, setVisible] = useState(false);

  const currentStep = TOUR_STEPS[step];

  // Position tooltip relative to target element
  const positionTooltip = useCallback(() => {
    if (!currentStep) return;

    const el = document.querySelector(currentStep.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTooltipStyle(getTooltipStyle(rect, currentStep.placement));
    setVisible(true);
  }, [currentStep]);

  useEffect(() => {
    if (!active) { setVisible(false); return; }
    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    return () => window.removeEventListener('resize', positionTooltip);
  }, [active, positionTooltip]);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, 'true');
      setVisible(false);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onSkip?.();
  };

  if (!visible || !currentStep) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />

      {/* Tooltip */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label={`Tour step ${step + 1} of ${TOUR_STEPS.length}: ${currentStep.title}`}
        style={{
          position: 'absolute',
          zIndex: 9999,
          maxWidth: 320,
          background: '#1c1917',
          border: '1px solid #78350f',
          borderRadius: 10,
          padding: '16px 20px',
          color: '#fef3c7',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          ...tooltipStyle,
        }}
      >
        {/* Step counter */}
        <p style={{ fontSize: 11, color: '#92400e', margin: '0 0 6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Step {step + 1} of {TOUR_STEPS.length}
        </p>

        {/* Title */}
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#fbbf24' }}>
          {currentStep.title}
        </h3>

        {/* Body */}
        <p style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.5, color: '#d6d3d1' }}>
          {currentStep.content}
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleSkip}
            style={{ fontSize: 12, color: '#78716c', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Skip Tour
          </button>

          <button
            onClick={handleNext}
            style={{
              background: '#b45309',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {step < TOUR_STEPS.length - 1 ? 'Next →' : 'Done ✓'}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Hook for first-time tour trigger ─────────────────────────────────────────

export function useGuidedTour() {
  const [tourActive, setTourActive] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay so the UI is fully rendered
      const timer = setTimeout(() => setTourActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTourActive(true);
  };

  const endTour = () => setTourActive(false);

  return { tourActive, startTour, endTour };
}
