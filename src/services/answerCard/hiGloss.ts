/**
 * hiGloss.ts — deterministic Hindi for the engine's own English sentences.
 *
 * The engine emits prose from a closed set of sentence forms. Each form is
 * matched with a regex and re-rendered from a Hindi template. An unmatched
 * sentence passes through in English rather than throwing — a gloss can degrade
 * the prose but must never block the card.
 */

const PLANET: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु',
};
const AREA: Record<string, string> = {
  career: 'करियर',
  wealth: 'धन व संपत्ति',
  marriage: 'विवाह',
  health: 'स्वास्थ्य',
  spirituality: 'आध्यात्म',
};
const DELIVERY: Record<string, string> = {
  full: 'पूर्ण',
  standard: 'सामान्य',
  conditional: 'सशर्त',
  diluted: 'क्षीण',
  broken: 'भंग',
};

const p = (s: string) => PLANET[s] ?? s;
const a = (s: string) => AREA[s] ?? s;

const RULES: Array<[RegExp, (...m: string[]) => string]> = [
  // "career houses average 62/100 by SAV; strongest is house 10 at 34 points and weakest is house 6 at 22 points."
  [
    /^(\w+) houses average (\d+)\/100 by SAV; strongest is house (\d+) at (\d+) points and weakest is house (\d+) at (\d+) points\.$/,
    (_m, area, avg, sh, sp, wh, wp) =>
      `${a(area)} भावों का औसत ${avg}/100 (SAV); सबसे बलवान भाव ${sh} (${sp} अंक), सबसे निर्बल भाव ${wh} (${wp} अंक)।`,
  ],

  // "Sun MD with Moon AD gives 71/100 Dasha clearance for career; delivery class is standard."
  [
    /^(\w+) MD with (\w+) AD gives (\d+)\/100 Dasha clearance for (\w+); delivery class is (\w+)\.$/,
    (_m, md, ad, sc, area, dc) =>
      `${p(md)} महादशा / ${p(ad)} अंतर्दशा: ${a(area)} हेतु दशा-स्वीकृति ${sc}/100; वितरण श्रेणी ${DELIVERY[dc] ?? dc}।`,
  ],

  // "Sun MD gives 64/100 Dasha clearance for health; delivery class is diluted."
  [
    /^(\w+) MD gives (\d+)\/100 Dasha clearance for (\w+); delivery class is (\w+)\.$/,
    (_m, md, sc, area, dc) =>
      `${p(md)} महादशा: ${a(area)} हेतु दशा-स्वीकृति ${sc}/100; वितरण श्रेणी ${DELIVERY[dc] ?? dc}।`,
  ],

  // "Rajyoga gate is open through X, Y; status can rise because ..."
  [/^Rajyoga gate is open through (.+?); .*$/, (_m, names) => `राजयोग द्वार ${names} से खुला है; स्थिति में वृद्धि संभव है।`],

  // "... is present but broken by Shadbala gate; ..."
  [/^(.+?) is present but broken by Shadbala gate;.*$/, (_m, n) => `${n} उपस्थित है परन्तु षड्बल द्वार से भंग है।`],

  // Data-absence sentences
  [/^House promise for (\w+) is not SAV-certified.*$/, (_m, area) => `${a(area)} हेतु भाव-प्रतिज्ञा SAV-प्रमाणित नहीं; दशा व योग अधिक भार रखते हैं।`],
  [/^Transit cannot be certified.*$/, () => `गोचर प्रमाणित नहीं; केवल गोचर से दशा को अधिक्रमित न करें।`],
];

export function glossToHindi(en: string): string {
  for (const [re, render] of RULES) {
    const m = en.match(re);
    if (m) return render(...m);
  }
  return en; // never block
}

/** Rationale = the engine's own "therefore" paragraph, sentence by sentence. */
export function glossRationale(en: string): string {
  return en
    .split(/(?<=\.)\s+/)
    .map(glossToHindi)
    .join(' ');
}
