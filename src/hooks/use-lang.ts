import { create } from 'zustand';

type Lang = 'en' | 'hi';

interface LangState {
  lang: Lang;
  toggle: () => void;
  setLang: (lang: Lang) => void;
}

export const useLang = create<LangState>((set) => ({
  lang: 'en',
  toggle: () => set((state) => ({ lang: state.lang === 'en' ? 'hi' : 'en' })),
  setLang: (lang) => set({ lang }),
}));

/** Simple translation helper — picks the right string for the active lang. */
export function t(key: { en: string; hi: string }, lang: Lang): string {
  return lang === 'hi' ? key.hi : key.en;
}

/**
 * Tagged-template helper that returns the string for the active lang.
 * Usage: Trans({ en: 'Birth Chart', hi: 'जन्म कुंडली' }, lang)
 */
export function Trans(
  strings: { en: string; hi: string } | string,
  lang: Lang = 'en',
): string {
  if (typeof strings === 'string') return strings;
  return lang === 'hi' ? strings.hi : strings.en;
}
