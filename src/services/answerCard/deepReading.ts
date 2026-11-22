/**
 * deepReading.ts — surface the engines the answer card already ran.
 *
 * Drop-in target: src/services/answerCard/deepReading.ts
 *
 * Pure: reads ChartData + DashaForecastResult and returns extra ComposedSection
 * objects. No new ephemeris, no I/O, no LLM call — so `npm run answers:check`
 * stays byte-deterministic.
 *
 * v2 (contract 1.4): adds the essay-grade sections an external model produced —
 * per-planet nakshatra+pada, whole-sign drishti (special aspects) + conjunctions,
 * D9/D10 divisional confirmation, Shadbala delivery strength, an explicit
 * "what the chart does not back" line, a form-of-ownership verdict, and a
 * risks + mitigations block. Every line is read off the positions/engines above,
 * never a general stanza.
 *
 * v3 (Diwali gift): adds the Sri Sudarshana Chakra (Tri-Bhava) section — the same
 * matter read from Lagna, Chandra and Surya at once, with an explicit 0–3
 * agreement count. This is the multi-reference guard that makes a
 * single-reference house error structurally impossible to hide.
 *
 * Bilingual is mandatory (langParity.test.ts). Dynamic yoga text comes bilingual
 * from yogaService; the fixed templates below ship EN + HI.
 *
 * Confidentiality (AGENTS.md): contains no dob/tob/place/lat/lon — only derived
 * positions, which the card already prints.
 */
import type { ChartData } from '@/hooks/useChartCalculation';
import type { DashaForecastResult } from '@/services/dashaForecastService';
import { calculateNakshatra } from '@/services/nakshatraService';
import { getVedicSpecialAspects, calculatePlanetaryAspects } from '@/services/aspectsService';
import { getNavamsha, getDashamsha, type VargaPosition } from '@/services/divisionalChartsService';
import {
  computeSudarshanaChakra,
  type SudarshanaRef,
} from '@/services/sudarshanaChakraService';
import type { Topic } from './AnswerCard.types';
import type { ComposedSection } from './answerComposer';
import type { Bi } from './bilingual';

const SIGN_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;
const SIGN_HI = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन',
] as const;
const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};
const NATURAL_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const ORD_EN = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'] as const;
const ORD_HI = ['', 'प्रथम', 'द्वितीय', 'तृतीय', 'चतुर्थ', 'पंचम', 'षष्ठ', 'सप्तम', 'अष्टम', 'नवम', 'दशम', 'एकादश', 'द्वादश'] as const;

const REF_EN: Record<SudarshanaRef, string> = { lagna: 'Lagna', chandra: 'Chandra', surya: 'Surya' };
const REF_HI: Record<SudarshanaRef, string> = { lagna: 'लग्न', chandra: 'चंद्र', surya: 'सूर्य' };

/** The houses each question actually rests on (whole-sign), for the support block. */
const TARGET_HOUSES: Record<Topic, readonly number[]> = {
  career: [10, 1, 6],
  finance: [2, 11, 9],
  marriage: [7, 2, 5],
  health: [1, 6, 8],
  house_construction: [4, 2, 11],
  business: [7, 10, 3, 11],
};

const fmtDeg = (d: number): string => {
  const deg = Math.floor(d);
  const m = Math.round((d - deg) * 60);
  return `${deg}°${String(m).padStart(2, '0')}′`;
};
const iso = (d: Date): string => d.toISOString().slice(0, 10);
/** Lagna-referenced (whole-sign) house — the invariant the mojibake card violated. */
const lagnaHouse = (sign: number, asc: number): number => ((sign - asc + 12) % 12) + 1;

function dignityTag(dignity: string, lang: 'en' | 'hi'): string {
  const map: Record<string, { en: string; hi: string }> = {
    Exalted: { en: 'exalted', hi: 'उच्च' },
    Moolatrikona: { en: 'moolatrikona', hi: 'मूलत्रिकोण' },
    'Own Sign': { en: 'own sign', hi: 'स्वराशि' },
    'Friend Sign': { en: 'friend sign', hi: 'मित्र राशि' },
    'Enemy Sign': { en: 'enemy sign', hi: 'शत्रु राशि' },
    Debilitated: { en: 'debilitated', hi: 'नीच' },
  };
  const t = map[dignity];
  return t ? ` · ${t[lang]}` : '';
}

function vargaFlag(vp: VargaPosition | undefined, lang: 'en' | 'hi'): string {
  if (!vp) return '';
  if (vp.isExalted) return lang === 'hi' ? ' (उच्च)' : ' (exalted)';
  if (vp.isDebilitated) return lang === 'hi' ? ' (नीच)' : ' (debilitated)';
  if (vp.isOwnSign) return lang === 'hi' ? ' (स्वराशि)' : ' (own)';
  return '';
}

/** Absolute sidereal longitude from a normalized planet. */
const absLon = (rashi: number, degrees: number): number => rashi * 30 + degrees;

/**
 * 1. Positions — with nakshatra + pada per planet (the "rebuilt chart" table),
 * the sandhi (junction-degree) flag, and dignity. All Lagna-referenced.
 */
function positionsSection(chart: ChartData): ComposedSection | null {
  const asc = chart.ascendant?.ascendant?.rashiIndex;
  const planets = chart.planetaryPositions?.planets;
  if (asc == null || !planets?.length) return null;
  const rows: Bi[] = planets.map(p => {
    const h = lagnaHouse(p.rashiIndex, asc);
    const n = calculateNakshatra(absLon(p.rashiIndex, p.degrees));
    const sandhiEn = p.degrees >= 28 ? ' · sandhi (junction degree)' : '';
    const sandhiHi = p.degrees >= 28 ? ' · संधि अंश' : '';
    const retroEn = p.retrograde ? ' (R)' : '';
    const retroHi = p.retrograde ? ' (वक्री)' : '';
    return {
      en: `${p.name} — ${SIGN_EN[p.rashiIndex]} ${fmtDeg(p.degrees)} · house ${h} · ${n.nameEn} ${n.pada}${retroEn}${dignityTag(p.dignity, 'en')}${sandhiEn}`,
      hi: `${PLANET_HI[p.name] ?? p.name} — ${SIGN_HI[p.rashiIndex]} ${fmtDeg(p.degrees)} · भाव ${h} · ${n.nameHi} ${n.pada}${retroHi}${dignityTag(p.dignity, 'hi')}${sandhiHi}`,
    };
  });
  return {
    id: 'positions',
    title: { en: 'Computed positions (Lagna-referenced)', hi: 'गणना की गई स्थितियाँ (लग्न से)' },
    body: {
      en: `Ascendant ${SIGN_EN[asc]}. Positions the verdict above rests on:`,
      hi: `लग्न ${SIGN_HI[asc]}। निर्णय इन्हीं स्थितियों पर टिका है:`,
    },
    citations: rows,
  };
}

/**
 * 2. Aspects — whole-sign special drishti (Mars 4/7/8, Jupiter 5/7/9, Saturn
 * 3/7/10) plus every conjunction. Read off the positions above.
 */
function aspectsSection(chart: ChartData): ComposedSection | null {
  const asc = chart.ascendant?.ascendant?.rashiIndex;
  const planets = chart.planetaryPositions?.planets;
  if (asc == null || !planets?.length) return null;
  const rowsForAspects = planets.map(p => ({
    planet: p.name,
    rashi: p.rashiIndex,
    house: lagnaHouse(p.rashiIndex, asc),
    degree: p.degrees,
  }));
  const houseOf = new Map(rowsForAspects.map(r => [r.planet, r.house] as const));
  const out: Bi[] = [];

  for (const a of getVedicSpecialAspects(rowsForAspects)) {
    out.push({
      en: `${a.planet} (house ${houseOf.get(a.planet) ?? '?'}) casts its special drishti on houses ${a.aspectsHouses.join(', ')}.`,
      hi: `${PLANET_HI[a.planet] ?? a.planet} (भाव ${houseOf.get(a.planet) ?? '?'}) अपनी विशेष दृष्टि भाव ${a.aspectsHouses.join(', ')} पर डालता है।`,
    });
  }
  for (const c of calculatePlanetaryAspects(rowsForAspects).filter(a => a.aspectType === 'Conjunction')) {
    const h = houseOf.get(c.planet1) ?? houseOf.get(c.planet2) ?? '?';
    out.push({
      en: `Conjunction: ${c.planet1} + ${c.planet2} in house ${h}.`,
      hi: `युति: ${PLANET_HI[c.planet1] ?? c.planet1} + ${PLANET_HI[c.planet2] ?? c.planet2} भाव ${h} में।`,
    });
  }
  if (!out.length) return null;
  return {
    id: 'aspects',
    title: { en: 'Aspects (graha drishti)', hi: 'दृष्टि (ग्रह दृष्टि)' },
    body: {
      en: 'Whole-sign drishti and conjunctions, read off the positions above — not a general stanza:',
      hi: 'पूर्ण-राशि दृष्टि व युतियाँ, ऊपर की स्थितियों से — सामान्य श्लोक से नहीं:',
    },
    citations: out,
  };
}

/**
 * 3. Divisional confirmation — where each planet lands in D9 (navamsa, the
 * "will it hold" chart) and D10 (dasamsa, the career chart), with dignity.
 */
function divisionalSection(chart: ChartData): ComposedSection | null {
  const dc = chart.divisionalCharts;
  if (!dc) return null;
  const d9 = getNavamsha(dc);
  const d10 = getDashamsha(dc);
  if (!d9 && !d10) return null;
  const segEn = (vp?: VargaPosition): string => (vp ? `${SIGN_EN[vp.vargaRashi]}${vargaFlag(vp, 'en')}` : '—');
  const segHi = (vp?: VargaPosition): string => (vp ? `${SIGN_HI[vp.vargaRashi]}${vargaFlag(vp, 'hi')}` : '—');
  const rows: Bi[] = [];
  for (const name of NATURAL_ORDER) {
    const p9 = d9?.positions.find(p => p.planet === name);
    const p10 = d10?.positions.find(p => p.planet === name);
    if (!p9 && !p10) continue;
    rows.push({
      en: `${name} — D9 ${segEn(p9)} · D10 ${segEn(p10)}`,
      hi: `${PLANET_HI[name] ?? name} — D9 ${segHi(p9)} · D10 ${segHi(p10)}`,
    });
  }
  if (!rows.length) return null;
  const heads: string[] = [];
  if (d9) heads.push(`D9 asc ${SIGN_EN[d9.ascendantRashi]}`);
  if (d10) heads.push(`D10 asc ${SIGN_EN[d10.ascendantRashi]}`);
  return {
    id: 'divisional',
    title: { en: 'Divisional confirmation (D9 · D10)', hi: 'वर्ग पुष्टि (D9 · D10)' },
    body: {
      en: `${heads.join(' · ')}. D9 shows whether a promise holds; D10 is the career chart.`,
      hi: `${heads.join(' · ')}। D9 दिखाता है प्रतिज्ञा टिकती है या नहीं; D10 कार्य-कुंडली है।`,
    },
    citations: rows,
  };
}

/**
 * 3b. Sri Sudarshana Chakra (Tri-Bhava) — the same matter read from Lagna,
 * Chandra and Surya at once. A call is firm only where the three agree. This is
 * the multi-reference counterpart of the positions table above; it is what makes
 * a single-reference house projection impossible to hide.
 */
function sudarshanaSection(chart: ChartData, topic: Topic): ComposedSection | null {
  const sc = computeSudarshanaChakra(chart);
  if (!sc) return null;
  const primary = (TARGET_HOUSES[topic] ?? [1])[0] ?? 1;
  const read = sc.bhavas[primary - 1];
  if (!read) return null;

  const rows: Bi[] = [
    {
      en: `Three references read at once — Lagna ${SIGN_EN[sc.ascSign]} (body), Chandra ${SIGN_EN[sc.moonSign]} (mind), Surya ${SIGN_EN[sc.sunSign]} (soul). A matter is firm where all three agree.`,
      hi: `तीन संदर्भ एक साथ — लग्न ${SIGN_HI[sc.ascSign]} (देह), चंद्र ${SIGN_HI[sc.moonSign]} (मन), सूर्य ${SIGN_HI[sc.sunSign]} (आत्मा)। जहाँ तीनों सहमत, वही पक्का।`,
    },
  ];

  for (const slot of read.refs) {
    const occEn = slot.occupants.length ? slot.occupants.join(', ') : 'empty';
    const occHi = slot.occupants.length
      ? slot.occupants.map(n => PLANET_HI[n] ?? n).join(', ')
      : 'रिक्त';
    rows.push({
      en: `${REF_EN[slot.ref]} chart — the ${ORD_EN[primary]} bhava falls in ${SIGN_EN[slot.bhavaSign]}: occupants ${occEn}; lord ${slot.lord} in house ${slot.lordHouse}${slot.lordStrong ? ', strong' : ''}.`,
      hi: `${REF_HI[slot.ref]} कुंडली — ${ORD_HI[primary]} भाव ${SIGN_HI[slot.bhavaSign]} में: स्थित ${occHi}; स्वामी ${PLANET_HI[slot.lord] ?? slot.lord} भाव ${slot.lordHouse}${slot.lordStrong ? ', बलवान' : ''}।`,
    });
  }

  rows.push({
    en: `Agreement: the ${ORD_EN[primary]} bhava is confirmed in ${read.confirmation}/3 charts (occupied in ${read.refsOccupied}, benefic-present in ${read.refsBenefic}, strong lord in ${read.refsLordStrong}) — ${read.verdict.en}.`,
    hi: `सहमति: ${ORD_HI[primary]} भाव ${read.confirmation}/3 कुंडलियों में पुष्ट (${read.refsOccupied} में स्थित, ${read.refsBenefic} में शुभ, ${read.refsLordStrong} में बलवान स्वामी) — ${read.verdict.hi}।`,
  });

  const strongest = sc.bhavas[sc.strongestBhava - 1];
  if (strongest) {
    rows.push({
      en: `Most triple-confirmed bhava on this chart: the ${ORD_EN[sc.strongestBhava]} (${strongest.confirmation}/3) — the matter the three references jointly back.`,
      hi: `इस कुंडली का सर्वाधिक त्रि-पुष्ट भाव: ${ORD_HI[sc.strongestBhava]} (${strongest.confirmation}/3) — जिसका तीनों संदर्भ मिलकर समर्थन करते हैं।`,
    });
  }

  return {
    id: 'sudarshana-chakra',
    title: { en: 'Sri Sudarshana Chakra (Tri-Bhava)', hi: 'श्री सुदर्शन चक्र (त्रि-भाव)' },
    body: {
      en: 'The same question read from three references at once — certainty is their agreement, not one chart:',
      hi: 'एक ही प्रश्न तीन संदर्भों से एक साथ — निश्चय उनकी सहमति है, कोई एक कुंडली नहीं:',
    },
    citations: rows,
  };
}

/**
 * 4. Shadbala — which planets can actually deliver (BPHS six-fold strength),
 * with the vargottama / combustion / neecha-bhanga modifiers the engine applied.
 */
function shadbalaSection(chart: ChartData): ComposedSection | null {
  const sb = chart.shadbala;
  if (!sb?.planets?.length) return null;
  const flagEn = (p: (typeof sb.planets)[number]): string =>
    `${p.isVargottama ? ' · vargottama' : ''}${p.isCombust ? ' · combust' : ''}${p.neechaBhangaActive ? ' · neecha-bhanga' : ''}`;
  const flagHi = (p: (typeof sb.planets)[number]): string =>
    `${p.isVargottama ? ' · वर्गोत्तम' : ''}${p.isCombust ? ' · अस्त' : ''}${p.neechaBhangaActive ? ' · नीचभंग' : ''}`;
  const rows: Bi[] = sb.planets.map(p => ({
    en: `${p.planet} — ${p.strength}, ${p.shadabalaRatio.toFixed(2)}× required · delivery: ${p.deliveryClass}${flagEn(p)}`,
    hi: `${PLANET_HI[p.planet] ?? p.planet} — ${p.strength}, आवश्यकता का ${p.shadabalaRatio.toFixed(2)}× · वितरण: ${p.deliveryClass}${flagHi(p)}`,
  }));
  return {
    id: 'shadbala',
    title: { en: 'Delivery strength (Shadbala)', hi: 'वितरण बल (षड्बल)' },
    body: { en: sb.summary.en, hi: sb.summary.hi },
    citations: rows,
  };
}

function yogasSection(chart: ChartData): ComposedSection | null {
  const y = chart.yogas;
  const present = [...(y?.rajYogas ?? []), ...(y?.presentYogas ?? [])];
  const distinct = Array.from(new Map(present.map(v => [v.name, v])).values());
  if (!distinct.length) return null;
  return {
    id: 'yogas',
    title: { en: 'Yogas present', hi: 'उपस्थित योग' },
    body: {
      en: `${distinct.length} named yoga(s) formed on this chart — each read off the positions above, not a general stanza:`,
      hi: `${distinct.length} नामित योग इस कुंडली में बने हैं — ऊपर की स्थितियों से, सामान्य श्लोक से नहीं:`,
    },
    citations: distinct.map(v => {
      const who = [
        v.planets?.length ? v.planets.join(', ') : '',
        v.houses?.length ? `houses ${v.houses.join(', ')}` : '',
      ].filter(Boolean).join(' · ');
      return {
        en: `${v.name} (${v.strength}) — ${v.description.en}${who ? ` [${who}]` : ''}`,
        hi: `${v.nameHi} (${v.strength}) — ${v.description.hi}${who ? ` [${who}]` : ''}`,
      };
    }),
  };
}

function dashaSection(chart: ChartData): ComposedSection | null {
  const d = chart.dasha;
  const md = d?.currentMahadasha;
  const ad = d?.currentAntardasha;
  const pd = d?.currentPratyantardasha;
  if (!d || !md) return null;
  const f = (x?: { startDate: Date; endDate: Date }): string =>
    x ? `${iso(x.startDate)} → ${iso(x.endDate)}` : '—';
  const rows: Bi[] = [
    {
      en: `Moon nakshatra ${d.moonNakshatraName} · lord ${d.moonNakshatraLord} · balance ${d.balanceYears.toFixed(1)}y at birth`,
      hi: `चंद्र नक्षत्र ${d.moonNakshatraName} · स्वामी ${d.moonNakshatraLord} · जन्म पर शेष ${d.balanceYears.toFixed(1)} वर्ष`,
    },
    { en: `Mahadasha ${md.planet}: ${f(md)}`, hi: `महादशा ${md.planet}: ${f(md)}` },
    { en: `Antardasha ${ad?.planet ?? '—'}: ${f(ad ?? undefined)}`, hi: `अंतर्दशा ${ad?.planet ?? '—'}: ${f(ad ?? undefined)}` },
    { en: `Pratyantardasha ${pd?.planet ?? '—'}: ${f(pd ?? undefined)}`, hi: `प्रत्यंतर्दशा ${pd?.planet ?? '—'}: ${f(pd ?? undefined)}` },
  ];
  for (const p of (ad?.pratyantardashas ?? []).slice(0, 4)) {
    rows.push({ en: `  ↳ next PD ${p.planet}: ${f(p)}`, hi: `  ↳ अगली प्रत्यंतर्दशा ${p.planet}: ${f(p)}` });
  }
  return {
    id: 'dasha-timeline',
    title: { en: 'Where this juncture sits (Vimshottari)', hi: 'यह समय-बिंदु कहाँ है (विंशोत्तरी)' },
    body: { en: 'Timing is read from the running dasha, not from intent:', hi: 'समय चालू दशा से पढ़ा जाता है, इरादे से नहीं:' },
    citations: rows,
  };
}

function windowsSection(forecast: DashaForecastResult): ComposedSection | null {
  const phase = forecast.phaseAnalysis;
  const rows: Bi[] = [];
  if (phase) {
    rows.push({ en: `Rising: ${phase.rising.period} — ${phase.rising.keyAction}`, hi: `उदय: ${phase.rising.period} — ${phase.rising.keyAction}` });
    rows.push({ en: `Peak: ${phase.peak.period} — ${phase.peak.keyAction}`, hi: `शिखर: ${phase.peak.period} — ${phase.peak.keyAction}` });
    rows.push({ en: `Decline: ${phase.decline.period} — ${phase.decline.keyAction}`, hi: `ह्रास: ${phase.decline.period} — ${phase.decline.keyAction}` });
  }
  if (!rows.length) return null;
  return {
    id: 'timing-windows',
    title: { en: 'Timing windows', hi: 'समय-सीमाएँ' },
    body: { en: forecast.thereforeClause || 'Windows are read from the running dasha:', hi: 'समय-सीमाएँ चालू दशा से पढ़ी जाती हैं:' },
    citations: rows,
  };
}

interface Structure {
  asc: number | null;
  occupied: Set<number>;
  empty: number[];
  strong: number[];
  weak: number[];
}

function readStructure(chart: ChartData): Structure {
  const asc = chart.ascendant?.ascendant?.rashiIndex ?? null;
  const planets = chart.planetaryPositions?.planets ?? [];
  const hs = chart.ashtakavarga?.houseStrengths ?? [];
  const strong = hs.filter(h => h.strength === 'excellent' || h.strength === 'good').map(h => h.house);
  const weak = hs.filter(h => h.strength === 'weak' || h.strength === 'very-weak').map(h => h.house);
  const occupiedSigns = new Set(planets.map(p => p.rashiIndex));
  const occupied = new Set<number>();
  for (const h of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    if (asc == null) break;
    if (occupiedSigns.has((asc + h - 1) % 12)) occupied.add(h);
  }
  const empty = asc == null ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(h => !occupied.has(h));
  return { asc, occupied, empty, strong, weak };
}

function supportSection(chart: ChartData, topic: Topic, score: number): ComposedSection | null {
  const { empty, strong, weak } = readStructure(chart);
  const rows: Bi[] = [];
  if (strong.length) rows.push({ en: `Structurally strong houses (SAV): ${strong.join(', ')}.`, hi: `संरचनात्मक रूप से सबल भाव (सर्वाष्टकवर्ग): ${strong.join(', ')}।` });
  if (weak.length) rows.push({ en: `Structurally weak houses: ${weak.join(', ')} — do not lean on these.`, hi: `संरचनात्मक रूप से निर्बल भाव: ${weak.join(', ')} — इन पर भार न डालें।` });
  if (empty.length) rows.push({ en: `Unoccupied houses: ${empty.join(', ')} — no direct support here.`, hi: `रिक्त भाव: ${empty.join(', ')} — यहाँ सीधा समर्थन नहीं।` });
  const key = TARGET_HOUSES[topic] ?? [];
  const unsupported = key.filter(h => empty.includes(h) || weak.includes(h));
  if (unsupported.length) {
    rows.push({
      en: `This question rests on houses ${key.join(', ')}; ${unsupported.join(', ')} among them are empty/weak — that is the part the chart does not back.`,
      hi: `यह प्रश्न भाव ${key.join(', ')} पर टिका है; इनमें ${unsupported.join(', ')} रिक्त/निर्बल हैं — यही वह भाग है जिसका समर्थन कुंडली नहीं करती।`,
    });
  }
  if (!rows.length) return null;
  return {
    id: 'what-the-chart-supports',
    title: { en: 'What the chart supports — and what it does not', hi: 'कुंडली किसका समर्थन करती है — और किसका नहीं' },
    body: { en: `For ${topic} at ${score}/100:`, hi: `${topic} हेतु ${score}/100 पर:` },
    citations: rows,
  };
}

/**
 * 5. Form of ownership — the actual answer to a "should I own X" question:
 * a capital/asset structure (2/6/8/11 occupied) with no institutional command
 * house (10 empty) pays for ownership-as-asset, not hands-on operation.
 */
function ownershipSection(chart: ChartData, topic: Topic): ComposedSection | null {
  if (topic !== 'business' && topic !== 'career') return null;
  const { empty } = readStructure(chart);
  const engine = [2, 6, 8, 11].filter(h => !empty.includes(h));
  if (!empty.includes(10) || engine.length < 2) return null;
  const rows: Bi[] = [
    {
      en: `The earning engine is real: houses ${engine.join(', ')} are occupied (cash, service, leverage, gains).`,
      hi: `कमाई का इंजन वास्तविक है: भाव ${engine.join(', ')} भरे हैं (धन, सेवा, उधार, लाभ)।`,
    },
    {
      en: 'The 10th (institutional command) is empty — you are not handed an institution; you must build or borrow one.',
      hi: 'दशम भाव (संस्थागत नेतृत्व) रिक्त है — तैयार संस्था नहीं मिलती; बनानी या उधार लेनी पड़ेगी।',
    },
    {
      en: 'Form of ownership the chart pays for: own the asset and the brand; delegate operations (management contract, lease-back, or franchise) rather than running it yourself.',
      hi: 'कुंडली जिस स्वामित्व-रूप का भुगतान करती है: संपत्ति व ब्रांड अपने नाम रखें; संचालन सौंपें (प्रबंधन अनुबंध, लीज़-बैक या फ्रैंचाइज़ी) — स्वयं न चलाएँ।',
    },
    {
      en: 'Avoid a 50:50 partnership (7th empty); put every term in writing.',
      hi: '50:50 साझेदारी से बचें (सप्तम रिक्त); हर शर्त लिखित रखें।',
    },
  ];
  return {
    id: 'form-of-ownership',
    title: { en: 'The form of ownership the chart pays for', hi: 'कुंडली जिस स्वामित्व-रूप का भुगतान करती है' },
    body: { en: 'Read off the occupied vs empty houses above:', hi: 'ऊपर के भरे व रिक्त भावों से पढ़ा गया:' },
    citations: rows,
  };
}

/**
 * 6. Risks + mitigations — the three things most likely to go wrong, each derived
 * from a weak planet / weak house / empty command house, each with its hedge.
 */
function risksSection(chart: ChartData, topic: Topic): ComposedSection | null {
  const asc = chart.ascendant?.ascendant?.rashiIndex;
  const planets = chart.planetaryPositions?.planets ?? [];
  const { empty } = readStructure(chart);
  const rows: Bi[] = [];

  const weakest = chart.shadbala?.weakestPlanet;
  if (weakest) {
    const w = chart.shadbala?.planets.find(p => p.planet === weakest);
    rows.push({
      en: `Risk: ${weakest} is the weakest-verified planet${w ? ` (delivery: ${w.deliveryClass})` : ''} — outcomes routed through it are the ones to hedge. Mitigation: strengthen ${weakest} and de-risk what depends on it.`,
      hi: `जोखिम: ${PLANET_HI[weakest] ?? weakest} सबसे निर्बल प्रमाणित ग्रह है${w ? ` (वितरण: ${w.deliveryClass})` : ''} — इससे जुड़े परिणामों को सुरक्षित रखें। उपाय: ${PLANET_HI[weakest] ?? weakest} को बल दें और उस पर निर्भर कार्य कम जोखिम वाले करें।`,
    });
  }

  for (const h of TARGET_HOUSES[topic] ?? []) {
    if (asc == null) break;
    const sign = (asc + h - 1) % 12;
    const p = planets.find(x => x.rashiIndex === sign && x.dignity === 'Debilitated');
    if (p) {
      rows.push({
        en: `Risk: ${p.name} is debilitated in house ${h} — the promise there needs repair. Mitigation: repair it before you rely on it.`,
        hi: `जोखिम: ${PLANET_HI[p.name] ?? p.name} भाव ${h} में नीच है — वहाँ की प्रतिज्ञा मरम्मत चाहती है। उपाय: भरोसा करने से पहले उसे सुधारें।`,
      });
      break;
    }
  }

  if (empty.includes(10)) {
    rows.push({
      en: 'Risk: no institutional command house (10th empty) — you are the single point of failure. Mitigation: a professional manager with a real mandate, and succession from day one.',
      hi: 'जोखिम: संस्थागत नेतृत्व भाव नहीं (दशम रिक्त) — आप ही एकमात्र केंद्र हैं। उपाय: वास्तविक अधिकार वाला पेशेवर प्रबंधक, और पहले दिन से उत्तराधिकार।',
    });
  }

  if (!rows.length) return null;
  return {
    id: 'risks-mitigations',
    title: { en: 'What can go wrong — and the hedge', hi: 'क्या गड़बड़ हो सकती है — और उपाय' },
    body: { en: 'Derived from the weak planets and empty houses above:', hi: 'ऊपर के निर्बल ग्रहों व रिक्त भावों से:' },
    citations: rows.slice(0, 3),
  };
}

export function buildDeepReading(
  chart: ChartData,
  forecast: DashaForecastResult,
  topic: Topic,
  score: number,
): ComposedSection[] {
  return [
    positionsSection(chart),
    aspectsSection(chart),
    divisionalSection(chart),
    sudarshanaSection(chart, topic),
    shadbalaSection(chart),
    yogasSection(chart),
    dashaSection(chart),
    windowsSection(forecast),
    supportSection(chart, topic, score),
    ownershipSection(chart, topic),
    risksSection(chart, topic),
  ].filter((s): s is ComposedSection => s !== null);
}
