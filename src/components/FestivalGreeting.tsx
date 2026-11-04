/**
 * FestivalGreeting — dismissible festival strip with a diya row.
 *
 * Purely decorative: no data, no fetch, no state shared with the engine.
 * Reads the seasonal skin registry, applies its tokens to <html>, and renders
 * nothing outside the active window, for density-1 skins, or after dismissal.
 */

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { applyFestivalTokens } from '@/lib/festivals';
import { resolveFestival, isGreetingDismissed, dismissGreeting } from '@/lib/festival';
import '@/styles/festival.css';

interface FestivalGreetingProps {
  lang?: 'en' | 'hi' | 'hi-Latn';
  className?: string;
}

const Diya = ({ delayIndex }: { delayIndex: number }) => (
  <svg
    className="festival-diya"
    viewBox="0 0 32 32"
    role="presentation"
    aria-hidden="true"
    focusable="false"
    data-diya={delayIndex}
  >
    <path
      className="festival-diya__flame"
      d="M16 5c2.6 2.6 3.6 4.6 3.6 6.3a3.6 3.6 0 0 1-7.2 0C12.4 9.6 13.4 7.6 16 5Z"
    />
    <path className="festival-diya__core" d="M16 8.4c1.1 1.3 1.5 2.2 1.5 3a1.5 1.5 0 0 1-3 0c0-.8.4-1.7 1.5-3Z" />
    <path className="festival-diya__body" d="M6 18h20c-1.2 4.6-5.1 7.5-10 7.5S7.2 22.6 6 18Z" />
    <path className="festival-diya__rim" d="M6 18h20" />
  </svg>
);

const Rangoli = () => (
  <svg className="festival-rangoli" viewBox="0 0 100 100" role="presentation" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="50" cy="50" r="9" />
      <circle cx="50" cy="50" r="22" strokeDasharray="3 5" />
      <circle cx="50" cy="50" r="36" strokeDasharray="1 7" />
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="20"
          rx="3.4"
          ry="8.5"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
    </g>
  </svg>
);

export const FestivalGreeting = ({ lang = 'en', className = '' }: FestivalGreetingProps) => {
  // `?festival=<id>` forces a named skin for design review; `?festival=off`
  // suppresses it; otherwise the calendar decides.
  const skin = useMemo(() => resolveFestival(window.location.search), []);
  const [dismissed, setDismissed] = useState(() =>
    isGreetingDismissed(typeof window === 'undefined' ? null : window.localStorage)
  );

  useEffect(() => {
    if (!skin || skin.density < 2) return;
    return applyFestivalTokens(skin, document.documentElement);
  }, [skin]);

  if (!skin || skin.density < 2 || dismissed) return null;

  const copy = skin.copy[lang] ?? skin.copy.en;

  const close = () => {
    dismissGreeting(window.localStorage);
    setDismissed(true);
  };

  return (
    <section
      className={`festival-greeting ${className}`}
      aria-label={copy.title}
      data-testid="festival-greeting"
    >
      <Rangoli />
      <div className="festival-greeting__text">
        <span className="festival-greeting__title">{copy.title}</span>
        <span className="festival-greeting__sub">{copy.sub}</span>
      </div>
      <div className="festival-diyas">
        {[0, 1, 2, 3, 4].map(i => (
          <Diya key={i} delayIndex={i} />
        ))}
      </div>
      <button
        type="button"
        className="festival-greeting__close"
        onClick={close}
        aria-label={lang === 'hi' ? 'बंद करें' : lang === 'hi-Latn' ? 'Band karein' : 'Dismiss'}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </section>
  );
};

export default FestivalGreeting;
