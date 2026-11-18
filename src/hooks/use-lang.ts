/**
 * use-lang.ts
 * Simple language state hook — no external state manager needed.
 */
import { useState, useEffect } from 'react';
import { toRomanHindi } from '@/lib/hinglish';

type Lang = 'en' | 'hi' | 'hi-Latn';

let _lang: Lang = 'en';
const _listeners = new Set<() => void>();

function notifyAll() { _listeners.forEach(fn => fn()); }

export function useLang() {
  const [lang, setLangState] = useState<Lang>(_lang);
  useEffect(() => {
    const sync = () => setLangState(_lang);
    _listeners.add(sync);
    return () => { _listeners.delete(sync); };
  }, []);
  const setLang = (next: Lang) => { _lang = next; notifyAll(); };
  const cycle = () => setLang(_lang === 'en' ? 'hi' : _lang === 'hi' ? 'hi-Latn' : 'en');
  const toggle = cycle;
  return { lang, setLang, toggle, cycle };
}

export function t(key: { en: string; hi: string }, lang: Lang): string {
  if (lang === 'hi') return key.hi;
  if (lang === 'hi-Latn') return toRomanHindi(key.hi);
  return key.en;
}
