import { describe, it, expect } from 'vitest';
import {
  toRomanHindi,
  deepTransliterate,
  normalizeQuestion,
  detectLanguage,
} from '@/lib/hinglish';

describe('toRomanHindi', () => {
  it('leaves Latin text untouched', () => {
    expect(toRomanHindi('Will I get a job?')).toBe('Will I get a job?');
  });

  it('deletes cluster schwas so real words stay readable', () => {
    expect(toRomanHindi('नौकरी')).toBe('naukri');
    expect(toRomanHindi('कुंडली')).toBe('kundli');
    expect(toRomanHindi('शादी')).toBe('shaadi');
  });

  it('keeps the schwa where the cluster is not followed by a vowel', () => {
    expect(toRomanHindi('जन्म')).toBe('janm');
    expect(toRomanHindi('समय')).toBe('samay');
  });

  it('handles visarga, anusvara, digits and danda', () => {
    expect(toRomanHindi('भाव ७।')).toBe('bhaav 7.');
  });

  it('preserves spacing and punctuation around words', () => {
    expect(toRomanHindi('क्या, नौकरी?')).toBe('kya, naukri?');
  });
});

describe('deepTransliterate', () => {
  it('walks nested objects and arrays', () => {
    const out = deepTransliterate({ a: { b: 'कुंडली' }, c: ['मेष'] });
    expect(out.a.b).toBe('kundli');
    expect(out.c[0]).toBe('mesh');
  });

  it('preserves non-string values', () => {
    expect(deepTransliterate({ n: 3, ok: true }).n).toBe(3);
  });
});

describe('normalizeQuestion', () => {
  it('drops particles even when they dominate the sentence', () => {
    const out = normalizeQuestion('kya meri naukri theek hogi');
    expect(out.split(' ')).not.toContain('kya');
    expect(out).toContain('job');
    expect(out).toContain('okay');
  });

  it('maps marriage, money and health words', () => {
    expect(normalizeQuestion('meri shaadi kab hogi')).toContain('marriage');
    expect(normalizeQuestion('paisa aayega kya')).toContain('money');
    expect(normalizeQuestion('meri bimari theek hogi')).toContain('illness');
  });

  it('leaves English and Devanagari alone', () => {
    expect(normalizeQuestion('Will I get the job')).toBe('Will I get the job');
    expect(normalizeQuestion('क्या नौकरी मिलेगी')).toBe('क्या नौकरी मिलेगी');
  });
});

describe('detectLanguage', () => {
  it('detects the three input scripts', () => {
    expect(detectLanguage('kya meri shaadi hogi')).toBe('hi-Latn');
    expect(detectLanguage('क्या मेरी शादी होगी')).toBe('hi');
    expect(detectLanguage('Will my marriage happen')).toBe('en');
  });

  it('does not flip short English that happens to contain a mapped word', () => {
    expect(detectLanguage('my case')).toBe('en');
    expect(detectLanguage('the loan officer')).toBe('en');
  });

  it('treats a bare particle pair as Hinglish', () => {
    expect(detectLanguage('kya hoga')).toBe('hi-Latn');
  });
});

describe('transliteration idempotence', () => {
  it('is stable under re-render: same input, same output, byte for byte', () => {
    const hi = 'क्या मेरी नौकरी में पदोन्नति होगी?';
    const first = toRomanHindi(hi);
    for (let i = 0; i < 5; i++) expect(toRomanHindi(hi)).toBe(first);
    expect(first).not.toMatch(/[\u0900-\u097F]/);
  });
});
