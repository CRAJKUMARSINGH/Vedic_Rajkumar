/**
 * Mangal Dosha (Kuja Dosha) Analysis
 *
 * Classical basis: Parashara (BPHS Ch. 73), Phaladeepika Ch. 16,
 * Saravali Ch. 41 — "Kuja Dosha" or "Angaraka Dosha"
 *
 * Dosha arises when natal Mars occupies houses 1, 2, 4, 7, 8, or 12
 * counted from: (a) Lagna, (b) Moon, (c) Venus.
 *
 * Cancellation rules from BPHS Ch. 73 and Parashari tradition.
 */

import type { ChartData } from './vedicCalc';
import { RASHIS_HI, RASHIS_EN } from './vedicCalc';

export type DoshaLevel = 'Full' | 'Partial' | 'None';

export interface DoshaCheck {
  reference: string; // "Lagna" | "Moon" | "Venus"
  referenceHi: string;
  referenceRashi: number;
  marsHouse: number; // Mars's house number counted from this reference
  hasDosha: boolean;
  level: DoshaLevel;
  levelHi: string;
  note: string;
  noteHi: string;
}

export interface CancellationRule {
  rule: string;
  ruleHi: string;
  applies: boolean;
  details: string;
  detailsHi: string;
}

export interface MangalDoshaResult {
  /** Mars's natal position */
  marsRashi: number;
  marsHouseFromLagna: number;
  marsRetrograde: boolean;

  /** Three reference checks */
  checks: DoshaCheck[];

  /** Overall verdict */
  overallDosha: boolean;
  overallLevel: DoshaLevel;
  overallLevelHi: string;
  severity: 'Low' | 'Medium' | 'High' | 'Severe' | 'None';
  severityHi: string;

  /** Cancellation rules evaluated */
  cancellations: CancellationRule[];

  /** Final verdict after cancellations */
  finalVerdict: string;
  finalVerdictHi: string;

  /** Detailed interpretation */
  interpretation: string;
  interpretationHi: string;

  /** Remedies */
  remedies: string[];
  remediesHi: string[];
}

/** Houses that create Mangal Dosha */
const DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];

/** Compute house number of Mars counted from a reference rashi */
function marsHouseFrom(marsRashi: number, referenceRashi: number): number {
  let h = marsRashi - referenceRashi + 1;
  if (h <= 0) h += 12;
  return h;
}

export function analyzeMangalDosha(d1: ChartData): MangalDoshaResult {
  const mars = d1.planets.find(p => p.name === 'Mars')!;
  const moon = d1.planets.find(p => p.name === 'Moon')!;
  const venus = d1.planets.find(p => p.name === 'Venus')!;
  const jupiter = d1.planets.find(p => p.name === 'Jupiter')!;
  const saturn = d1.planets.find(p => p.name === 'Saturn')!;
  const rahu = d1.planets.find(p => p.name === 'Rahu')!;

  const lagnaRashi = d1.lagna;

  // ── 1. Three reference checks ──────────────────────────────────────────
  const checks: DoshaCheck[] = [
    buildCheck('Lagna', 'लग्न', lagnaRashi, mars.rashi),
    buildCheck('Moon', 'चन्द्र', moon.rashi, mars.rashi),
    buildCheck('Venus', 'शुक्र', venus.rashi, mars.rashi),
  ];

  const doshaCount = checks.filter(c => c.hasDosha).length;
  const overallDosha = doshaCount > 0;
  const overallLevel: DoshaLevel = doshaCount === 3 ? 'Full' : doshaCount >= 1 ? 'Partial' : 'None';

  // ── 2. Cancellation rules ──────────────────────────────────────────────
  const cancellations: CancellationRule[] = [];

  // Rule 1: Mars in own sign (Aries=1 or Scorpio=8) → dosha cancelled
  const marsInOwnSign = [1, 8].includes(mars.rashi);
  cancellations.push({
    rule: 'Mars in own sign (Aries / Scorpio)',
    ruleHi: 'मंगल स्वगृही (मेष / वृश्चिक)',
    applies: marsInOwnSign,
    details: `Mars in ${RASHIS_EN[mars.rashi - 1]}. Own signs: Aries, Scorpio.`,
    detailsHi: `मंगल ${RASHIS_HI[mars.rashi - 1]} में। स्वगृह: मेष, वृश्चिक।`,
  });

  // Rule 2: Mars exalted (Capricorn=10) → dosha cancelled
  const marsExalted = mars.rashi === 10;
  cancellations.push({
    rule: 'Mars in exaltation sign (Capricorn)',
    ruleHi: 'मंगल उच्च (मकर राशि)',
    applies: marsExalted,
    details: `Mars exaltation sign is Capricorn. Mars is in ${RASHIS_EN[mars.rashi - 1]}.`,
    detailsHi: `मंगल की उच्च राशि मकर है। मंगल ${RASHIS_HI[mars.rashi - 1]} में है।`,
  });

  // Rule 3: Lagna in Aries or Scorpio (Mars-ruled lagna) → dosha nullified
  const marsRuledLagna = [1, 8].includes(lagnaRashi);
  cancellations.push({
    rule: 'Lagna ruled by Mars (Aries / Scorpio Lagna)',
    ruleHi: 'मंगल का लग्न (मेष / वृश्चिक लग्न)',
    applies: marsRuledLagna,
    details: `Lagna is ${RASHIS_EN[lagnaRashi - 1]}. Mars-ruled lagnas: Aries, Scorpio.`,
    detailsHi: `लग्न ${RASHIS_HI[lagnaRashi - 1]} है। मंगल-लग्न: मेष, वृश्चिक।`,
  });

  // Rule 4: Jupiter aspects Mars (Jupiter's 5th, 7th, 9th aspect on Mars's house)
  const jupAspectHouses = [
    jupiter.house,
    ((jupiter.house - 1 + 4) % 12) + 1,
    ((jupiter.house - 1 + 6) % 12) + 1,
    ((jupiter.house - 1 + 8) % 12) + 1,
  ];
  const jupAspectsMars = jupAspectHouses.includes(mars.house);
  cancellations.push({
    rule: 'Jupiter aspects Mars',
    ruleHi: 'गुरु की दृष्टि मंगल पर',
    applies: jupAspectsMars,
    details: `Jupiter in house ${jupiter.house} aspects houses ${jupAspectHouses.join(', ')}. Mars in house ${mars.house}.`,
    detailsHi: `गुरु ${jupiter.house}वें भाव में, दृष्टि ${jupAspectHouses.join(', ')}वें भाव पर। मंगल ${mars.house}वें भाव में।`,
  });

  // Rule 5: Mars in 7th in Gemini or Virgo (Mercury's signs) — reduced dosha (some schools)
  const marsIn7thMercurySigns = mars.house === 7 && [3, 6].includes(mars.rashi);
  cancellations.push({
    rule: 'Mars in 7th in Gemini or Virgo (Mercury sign, some schools)',
    ruleHi: 'मंगल सप्तम में मिथुन/कन्या राशि (कुछ मत)',
    applies: marsIn7thMercurySigns,
    details: `Mars in house ${mars.house} (${RASHIS_EN[mars.rashi - 1]}). Gemini/Virgo in 7th reduces dosha.`,
    detailsHi: `मंगल ${mars.house}वें भाव में ${RASHIS_HI[mars.rashi - 1]} राशि। मिथुन/कन्या में मंगल का दोष कम होता है।`,
  });

  // Rule 6: Mars in Leo in 8th house → dosha nullified (Parashara)
  const marsLeo8th = mars.house === 8 && mars.rashi === 5;
  cancellations.push({
    rule: 'Mars in Leo in 8th house (Parashara cancellation)',
    ruleHi: 'अष्टम में सिंह राशि का मंगल (पाराशरी मत)',
    applies: marsLeo8th,
    details: `Mars in 8th house in Leo cancels dosha per BPHS.`,
    detailsHi: `अष्टम भाव में सिंह राशि में मंगल होने पर BPHS के अनुसार दोष निरस्त।`,
  });

  // Rule 7: Saturn conjunct or aspects Mars — reduces intensity
  const satAspectHouses = [
    saturn.house,
    ((saturn.house - 1 + 2) % 12) + 1,
    ((saturn.house - 1 + 6) % 12) + 1,
    ((saturn.house - 1 + 9) % 12) + 1,
  ];
  const satAspectsMars = satAspectHouses.includes(mars.house);
  cancellations.push({
    rule: 'Saturn aspects or conjuncts Mars (reduces intensity)',
    ruleHi: 'शनि की दृष्टि/युति मंगल पर (तीव्रता कम)',
    applies: satAspectsMars,
    details: `Saturn in house ${saturn.house} (3rd/7th/10th aspects + conjunction). Mars in house ${mars.house}.`,
    detailsHi: `शनि ${saturn.house}वें भाव में, दृष्टि ${satAspectHouses.join(', ')}वें पर। मंगल ${mars.house}वें भाव में।`,
  });

  // Rule 8: If Moon is in Aries or Scorpio (Mars sign) — dosha mitigated from Moon reference
  const moonInMarsSign = [1, 8].includes(moon.rashi);
  cancellations.push({
    rule: 'Moon in Aries or Scorpio (Mars sign) — mitigates Moon-reference dosha',
    ruleHi: 'चन्द्र मेष/वृश्चिक में (मंगल-राशि) — चन्द्र से दोष शांत',
    applies: moonInMarsSign,
    details: `Moon in ${RASHIS_EN[moon.rashi - 1]}. Mars signs: Aries, Scorpio.`,
    detailsHi: `चन्द्र ${RASHIS_HI[moon.rashi - 1]} में। मंगल राशियाँ: मेष, वृश्चिक।`,
  });

  // ── 3. Compute final verdict & Severity ─────────────────────────────────
  const activeCancellations = cancellations.filter(c => c.applies);

  // Base severity by house from Lagna
  const houseSeverityMap: Record<number, 'Low' | 'Medium' | 'High' | 'Severe'> = {
    1: 'High',
    2: 'Medium',
    4: 'Medium',
    7: 'Severe',
    8: 'High',
    12: 'Medium',
  };
  const baseSeverity = houseSeverityMap[mars.house] || 'None';

  let finalLevel: DoshaLevel = overallLevel;
  let finalSeverity = baseSeverity;

  if (overallDosha && activeCancellations.length >= 2) {
    finalLevel = 'None';
    finalSeverity = 'None';
  } else if (overallDosha && activeCancellations.length === 1) {
    finalLevel = 'Partial';
    // Reduce severity level
    if (finalSeverity === 'Severe') finalSeverity = 'High';
    else if (finalSeverity === 'High') finalSeverity = 'Medium';
    else if (finalSeverity === 'Medium') finalSeverity = 'Low';
  }

  if (!overallDosha) finalSeverity = 'None';

  const severityHiMap: Record<string, string> = {
    None: 'कोई नहीं',
    Low: 'अल्प',
    Medium: 'मध्यम',
    High: 'उच्च',
    Severe: 'अत्यधिक',
  };

  const verdictMap: Record<DoshaLevel, { en: string; hi: string }> = {
    None: { en: 'No Mangal Dosha', hi: 'मंगल दोष नहीं' },
    Partial: {
      en: 'Mild / Partial Mangal Dosha (reduced by cancellations)',
      hi: 'आंशिक मंगल दोष (निवारण से शांत)',
    },
    Full: { en: 'Mangal Dosha Present', hi: 'मंगल दोष विद्यमान' },
  };

  const finalVerdict = verdictMap[finalLevel].en;
  const finalVerdictHi = verdictMap[finalLevel].hi;

  // ── 4. Interpretation ──────────────────────────────────────────────────
  const interpretation = buildInterpretation(finalLevel, checks, activeCancellations, mars);
  const interpretationHi = buildInterpretationHi(finalLevel, checks, activeCancellations, mars);

  // ── 5. Remedies (only if dosha present) ───────────────────────────────
  const remedies: string[] = [];
  const remediesHi: string[] = [];
  if (finalLevel !== 'None') {
    remedies.push(
      'Perform Mangal Graha Shanti puja on Tuesdays',
      'Recite Mangal Stotram or Hanuman Chalisa on Tuesdays',
      'Donate red lentils (masoor dal), red cloth on Tuesdays',
      'Wear a coral (moonga) gemstone in gold on the ring finger (after expert consultation)',
      'Fast on Tuesdays and pray at Hanuman or Skanda temple',
      'Marry a partner who also has Mangal Dosha (dosha cancels each other)'
    );
    remediesHi.push(
      'मंगलवार को मंगल ग्रह शांति पूजा करें',
      'मंगलवार को मंगल स्तोत्र या हनुमान चालीसा का पाठ करें',
      'मंगलवार को लाल मसूर दाल, लाल वस्त्र दान करें',
      'विशेषज्ञ परामर्श के बाद सोने में मूंगा (प्रवाल) पहनें',
      'मंगलवार का व्रत रखें, हनुमान/कार्तिकेय मंदिर में पूजा करें',
      'मंगली वर से विवाह करें (दोनों का दोष परस्पर शांत होता है)'
    );
  }

  return {
    marsRashi: mars.rashi,
    marsHouseFromLagna: mars.house,
    marsRetrograde: mars.retrograde,
    checks,
    overallDosha,
    overallLevel,
    overallLevelHi: verdictMap[overallLevel].hi,
    severity: finalSeverity as any,
    severityHi: severityHiMap[finalSeverity],
    cancellations,
    finalVerdict,
    finalVerdictHi,
    interpretation,
    interpretationHi,
    remedies,
    remediesHi,
  };
}

// ── helpers ────────────────────────────────────────────────────────────────

function buildCheck(
  reference: string,
  referenceHi: string,
  referenceRashi: number,
  marsRashi: number
): DoshaCheck {
  const mh = marsHouseFrom(marsRashi, referenceRashi);
  const hasDosha = DOSHA_HOUSES.includes(mh);
  const level: DoshaLevel = hasDosha ? 'Full' : 'None';

  const houseNotesEn: Partial<Record<number, string>> = {
    1: 'Mars in 1st from reference — affects personality & health of relationship',
    2: 'Mars in 2nd from reference — affects family & speech in marriage',
    4: 'Mars in 4th from reference — affects domestic happiness',
    7: 'Mars in 7th from reference — directly afflicts the spouse house',
    8: 'Mars in 8th from reference — affects longevity of marriage',
    12: 'Mars in 12th from reference — affects marital bed & loss in marriage',
  };
  const houseNotesHi: Partial<Record<number, string>> = {
    1: 'संदर्भ से १म — व्यक्तित्व व वैवाहिक स्वास्थ्य प्रभावित',
    2: 'संदर्भ से २रा — परिवार व वाणी प्रभावित',
    4: 'संदर्भ से ४था — गृहसुख प्रभावित',
    7: 'संदर्भ से ७वाँ — सप्तम भाव सीधे प्रभावित',
    8: 'संदर्भ से ८वाँ — विवाह की दीर्घायु प्रभावित',
    12: 'संदर्भ से १२वाँ — शयनसुख व विवाह में हानि',
  };

  return {
    reference,
    referenceHi,
    referenceRashi,
    marsHouse: mh,
    hasDosha,
    level,
    levelHi: hasDosha ? 'दोष है' : 'दोष नहीं',
    note: hasDosha
      ? (houseNotesEn[mh] ?? `Mars in ${mh}th from ${reference}`)
      : `Mars in ${mh}th from ${reference} — not a dosha house`,
    noteHi: hasDosha
      ? (houseNotesHi[mh] ?? `${referenceHi} से ${mh}वें भाव में मंगल`)
      : `${referenceHi} से ${mh}वें भाव में मंगल — दोष भाव नहीं`,
  };
}

function buildInterpretation(
  level: DoshaLevel,
  checks: DoshaCheck[],
  active: CancellationRule[],
  mars: { rashi: number; house: number; retrograde: boolean }
): string {
  if (level === 'None' && checks.every(c => !c.hasDosha)) {
    return `Mars occupies the ${mars.house}th house from Lagna (${RASHIS_EN[mars.rashi - 1]}), which is not among the classical Mangal Dosha houses (1, 2, 4, 7, 8, 12). Similarly, Mars is not in a dosha house from Moon or Venus. This chart is entirely free from Mangal Dosha — a very positive factor for marriage compatibility matching.`;
  }
  if (level === 'None') {
    return `While Mars initially triggers dosha from ${checks
      .filter(c => c.hasDosha)
      .map(c => c.reference)
      .join(
        ' and '
      )}, the following cancellation rules apply: ${active.map(c => c.rule).join('; ')}. After these cancellations the dosha is fully neutralised. No special remedies are required.`;
  }
  if (level === 'Partial') {
    return `Mars triggers mild Mangal Dosha from ${checks
      .filter(c => c.hasDosha)
      .map(c => c.reference)
      .join(
        ' and '
      )}. However, ${active.length} cancellation rule(s) apply, reducing the intensity. Mild remedies are recommended. Matching with a partner who has similar Mangal placement is advisable.`;
  }
  return `Mars triggers Mangal Dosha from ${checks
    .filter(c => c.hasDosha)
    .map(c => c.reference)
    .join(
      ', '
    )}. No cancellation rules apply. Remedies should be performed before marriage, and matching with a Mangali partner is strongly recommended.`;
}

function buildInterpretationHi(
  level: DoshaLevel,
  checks: DoshaCheck[],
  active: CancellationRule[],
  mars: { rashi: number; house: number; retrograde: boolean }
): string {
  if (level === 'None' && checks.every(c => !c.hasDosha)) {
    return `मंगल लग्न से ${mars.house}वें भाव (${RASHIS_HI[mars.rashi - 1]}) में है, जो मंगल दोष के पारम्परिक भावों (१, २, ४, ७, ८, १२) में नहीं है। चन्द्र और शुक्र से भी मंगल दोष भाव में नहीं है। यह कुण्डली मंगल दोष से पूर्णतः मुक्त है — विवाह कुण्डली मिलान के लिए यह अत्यन्त शुभ संकेत है।`;
  }
  if (level === 'None') {
    return `${checks
      .filter(c => c.hasDosha)
      .map(c => c.referenceHi)
      .join(
        ' और '
      )} से मंगल दोष भाव में था, परन्तु निम्न निवारण नियम लागू होते हैं: ${active.map(c => c.ruleHi).join('; ')}। इन निवारणों के पश्चात दोष पूर्णतः शान्त है। कोई उपाय आवश्यक नहीं।`;
  }
  if (level === 'Partial') {
    return `${checks
      .filter(c => c.hasDosha)
      .map(c => c.referenceHi)
      .join(
        ' और '
      )} से आंशिक मंगल दोष है, परन्तु ${active.length} निवारण नियम लागू होने से तीव्रता कम है। हल्के उपाय सुझाए जाते हैं। मंगली वर से विवाह उचित रहेगा।`;
  }
  return `${checks
    .filter(c => c.hasDosha)
    .map(c => c.referenceHi)
    .join(
      ', '
    )} से मंगल दोष विद्यमान है। कोई निवारण नहीं लागू। विवाह से पूर्व उपाय अवश्य करें तथा मंगली वर से ही विवाह करें।`;
}
