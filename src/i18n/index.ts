/**
 * index.ts — i18n with typed keys.
 *
 * WHY TYPED: the app shipped bilingual copy with hardcoded strings. A missing
 * Hindi string rendered the English one silently, so nobody noticed. A typed key
 * set turns that into a compile error.
 *
 * No runtime dependency on a heavy i18n library — the shape we need is a lookup
 * plus interpolation, and a 40-line module beats a 30KB one here.
 */
export const LOCALES = ['en', 'hi'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** The English catalogue is the source of truth for the key set. */
export const en = {
  'nav.home': 'Home',
  'nav.horoscope': 'Horoscope',
  'nav.dasha': 'Dasha',
  'nav.pricing': 'Pricing',
  'tier.free': 'Free',
  'tier.pro': 'Pro',
  'tier.enterprise': 'Enterprise',
  'weekly.title': 'This week',
  'weekly.remaining': '{n} questions left this week',
  'weekly.unlimited': 'Unlimited questions',
  'weekly.exhausted': "You've used your questions for this week",
  'upgrade.cta': 'Upgrade to Pro',
  'upgrade.body': 'Unlimited questions, dasha timeline and transit alerts.',
  'export.pdf': 'Export PDF',
  'export.gated': 'Upgrade to export',
  'error.generic': 'Something went wrong. Please try again.',
} as const;

export type MessageKey = keyof typeof en;

export const hi: Record<MessageKey, string> = {
  'nav.home': 'होम',
  'nav.horoscope': 'राशिफल',
  'nav.dasha': 'दशा',
  'nav.pricing': 'मूल्य',
  'tier.free': 'फ्री',
  'tier.pro': 'प्रो',
  'tier.enterprise': 'एंटरप्राइज़',
  'weekly.title': 'इस सप्ताह',
  'weekly.remaining': 'इस सप्ताह {n} प्रश्न शेष',
  'weekly.unlimited': 'असीमित प्रश्न',
  'weekly.exhausted': 'इस सप्ताह के प्रश्न समाप्त',
  'upgrade.cta': 'प्रो में अपग्रेड करें',
  'upgrade.body': 'असीमित प्रश्न, दशा टाइमलाइन और गोचर अलर्ट।',
  'export.pdf': 'PDF निर्यात करें',
  'export.gated': 'निर्यात के लिए अपग्रेड करें',
  'error.generic': 'कुछ गलत हो गया। पुनः प्रयास करें।',
};

export const CATALOGUES: Record<Locale, Record<MessageKey, string>> = { en, hi };

let current: Locale = DEFAULT_LOCALE;

export function setLocale(locale: Locale): void {
  if (LOCALES.includes(locale)) current = locale;
}
export const getLocale = (): Locale => current;

/** Interpolates {name} tokens. A missing token renders empty, never "undefined". */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const raw = CATALOGUES[current][key] ?? en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : ''));
}

/** Detect from the browser, defaulting to English. */
export function detectLocale(): Locale {
  try {
    const langs = [navigator.language, ...(navigator.languages ?? [])];
    return langs.some((l) => l?.toLowerCase().startsWith('hi')) ? 'hi' : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
