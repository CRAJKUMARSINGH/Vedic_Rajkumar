/**
 * use-lang.ts
 * Simple language state hook — no external state manager needed.
 */
import { useState, useEffect } from 'react';

type Lang = 'en' | 'hi';

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
  const toggle = () => setLang(_lang === 'en' ? 'hi' : 'en');
  return { lang, setLang, toggle };
}

export function t(key: { en: string; hi: string }, lang: Lang): string {
  return lang === 'hi' ? key.hi : key.en;
}
