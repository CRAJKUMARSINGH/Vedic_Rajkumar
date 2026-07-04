/**
 * Jaimini Astrology System
 * Implements core Jaimini concepts:
 * - Chara Karakas (7 significators based on planetary degrees)
 * - Jaimini Aspects (Rashi Drishti)
 * - Argala (planetary intervention)
 * - Pada Lagna (Arudha Lagna)
 * - Jaimini Yogas (Raj, Gnati, Daara, etc.)
 * - Chara Dasha (sign-based dasha)
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface JaiminiPlanet {
  name: string;
  rashiIndex: number;
  degrees: number;
  house: number;
}

export type KarakaName =
  | 'Atmakaraka'
  | 'Amatyakaraka'
  | 'Bhratrukaraka'
  | 'Matrukaraka'
  | 'Putrakaraka'
  | 'Gnatikaraka'
  | 'Darakaraka';

export interface Karaka {
  karaka: KarakaName;
  karakaHi: string;
  planet: string;
  degrees: number;
  rashiIndex: number;
  meaning: { en: string; hi: string };
}

export interface RashiAspect {
  fromRashi: number;
  toRashi: number;
  fromName: string;
  toName: string;
}

export interface ArgalaResult {
  rashi: number;
  rashiName: string;
  argalaFrom: string[]; // rashis causing argala
  virodhArgala: string[]; // rashis obstructing argala
  netArgala: boolean;
}

export interface PadaLagna {
  rashiIndex: number;
  rashiName: string;
  degrees: number;
  meaning: { en: string; hi: string };
}

export interface JaiminiYoga {
  name: string;
  nameHi: string;
  isPresent: boolean;
  strength: 'strong' | 'moderate' | 'weak';
  description: { en: string; hi: string };
}

export interface CharaDasha {
  rashi: number;
  rashiName: string;
  years: number;
  startAge: number;
  endAge: number;
}

export interface NarrativeSynthesis {
  publicVsPrivate: string;
  relationshipManifestation: string;
  careerPerception: string;
}

export interface JaiminiAnalysis {
  karakas: Karaka[];
  atmakaraka: Karaka | null;
  rashiAspects: RashiAspect[];
  padaLagna: PadaLagna | null;
  upapadaLagna: PadaLagna | null;
  a4: PadaLagna | null;
  a10: PadaLagna | null;
  yogas: JaiminiYoga[];
  charaDasha: CharaDasha[];
  narrative: NarrativeSynthesis;
  summary: { en: string; hi: string };
}

// ── Constants ────────────────────────────────────────────────────────────────

const RASHI_NAMES = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const RASHI_NAMES_HI = [
  'मेष',
  'वृषभ',
  'मिथुन',
  'कर्क',
  'सिंह',
  'कन्या',
  'तुला',
  'वृश्चिक',
  'धनु',
  'मकर',
  'कुम्भ',
  'मीन',
];

// Movable (Chara), Fixed (Sthira), Dual (Dwiswabhava) signs
const CHARA_RASHIS = [0, 3, 6, 9]; // Aries, Cancer, Libra, Capricorn
const STHIRA_RASHIS = [1, 4, 7, 10]; // Taurus, Leo, Scorpio, Aquarius
// Dual: 2,5,8,11

// Chara Dasha years per sign (traditional Jaimini)
const CHARA_DASHA_YEARS: Record<number, number> = {
  0: 7,
  1: 8,
  2: 9,
  3: 10,
  4: 11,
  5: 12,
  6: 1,
  7: 2,
  8: 3,
  9: 4,
  10: 5,
  11: 6,
};

const KARAKA_MEANINGS: Record<KarakaName, { en: string; hi: string }> = {
  Atmakaraka: {
    en: 'Soul significator — represents the self, life purpose, and spiritual path',
    hi: 'आत्मकारक — आत्मा, जीवन उद्देश्य और आध्यात्मिक मार्ग का प्रतिनिधित्व',
  },
  Amatyakaraka: {
    en: 'Career significator — represents profession, advisors, and livelihood',
    hi: 'अमात्यकारक — व्यवसाय, सलाहकार और आजीविका का प्रतिनिधित्व',
  },
  Bhratrukaraka: {
    en: 'Sibling significator — represents brothers, sisters, and courage',
    hi: 'भ्रातृकारक — भाई-बहन और साहस का प्रतिनिधित्व',
  },
  Matrukaraka: {
    en: 'Mother significator — represents mother, home, and emotions',
    hi: 'मातृकारक — माता, घर और भावनाओं का प्रतिनिधित्व',
  },
  Putrakaraka: {
    en: 'Children significator — represents children, creativity, and intelligence',
    hi: 'पुत्रकारक — संतान, रचनात्मकता और बुद्धि का प्रतिनिधित्व',
  },
  Gnatikaraka: {
    en: 'Obstacles significator — represents enemies, disease, and competition',
    hi: 'ज्ञातिकारक — शत्रु, रोग और प्रतिस्पर्धा का प्रतिनिधित्व',
  },
  Darakaraka: {
    en: 'Spouse significator — represents spouse, partnerships, and desires',
    hi: 'दारकारक — जीवनसाथी, साझेदारी और इच्छाओं का प्रतिनिधित्व',
  },
};

const KARAKA_NAMES_HI: Record<KarakaName, string> = {
  Atmakaraka: 'आत्मकारक',
  Amatyakaraka: 'अमात्यकारक',
  Bhratrukaraka: 'भ्रातृकारक',
  Matrukaraka: 'मातृकारक',
  Putrakaraka: 'पुत्रकारक',
  Gnatikaraka: 'ज्ञातिकारक',
  Darakaraka: 'दारकारक',
};

// ── Karaka Calculation ───────────────────────────────────────────────────────

/**
 * Calculate Chara Karakas (7 significators) based on planetary degrees.
 * Rahu uses reverse degrees (30 - degrees).
 * Planets ranked by degrees descending → assigned karaka roles.
 */
export function calculateCharaKarakas(planets: JaiminiPlanet[]): Karaka[] {
  const KARAKA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const KARAKA_ORDER: KarakaName[] = [
    'Atmakaraka',
    'Amatyakaraka',
    'Bhratrukaraka',
    'Matrukaraka',
    'Putrakaraka',
    'Gnatikaraka',
    'Darakaraka',
  ];

  const eligible = planets
    .filter(p => KARAKA_PLANETS.includes(p.name))
    .map(p => ({
      ...p,
      effectiveDegrees: p.name === 'Rahu' ? 30 - p.degrees : p.degrees,
    }))
    .sort((a, b) => b.effectiveDegrees - a.effectiveDegrees);

  return KARAKA_ORDER.map((karaka, i) => {
    const planet = eligible[i];
    if (!planet) return null;
    return {
      karaka,
      karakaHi: KARAKA_NAMES_HI[karaka],
      planet: planet.name,
      degrees: planet.effectiveDegrees,
      rashiIndex: planet.rashiIndex,
      meaning: KARAKA_MEANINGS[karaka],
    };
  }).filter(Boolean) as Karaka[];
}

// ── Rashi Aspects (Jaimini Drishti) ─────────────────────────────────────────

/**
 * Jaimini Rashi Aspects:
 * - Movable signs aspect Fixed signs (except adjacent)
 * - Fixed signs aspect Movable signs (except adjacent)
 * - Dual signs aspect each other (except adjacent)
 * All signs aspect the 3rd, 5th, 7th, 9th, 10th from themselves (simplified).
 * Classic rule: Chara aspects all Sthira except adjacent; Sthira aspects all Chara except adjacent.
 */
export function calculateRashiAspects(): RashiAspect[] {
  const aspects: RashiAspect[] = [];

  for (let from = 0; from < 12; from++) {
    const isChara = CHARA_RASHIS.includes(from);
    const isSthira = STHIRA_RASHIS.includes(from);

    for (let to = 0; to < 12; to++) {
      if (from === to) continue;
      const diff = (to - from + 12) % 12;
      const isAdjacent = diff === 1 || diff === 11;
      if (isAdjacent) continue;

      const toIsChara = CHARA_RASHIS.includes(to);
      const toIsSthira = STHIRA_RASHIS.includes(to);
      const toIsDual = !toIsChara && !toIsSthira;
      const fromIsDual = !isChara && !isSthira;

      let aspects_this = false;
      if (isChara && toIsSthira) aspects_this = true;
      if (isSthira && toIsChara) aspects_this = true;
      if (fromIsDual && toIsDual) aspects_this = true;

      if (aspects_this) {
        aspects.push({
          fromRashi: from,
          toRashi: to,
          fromName: RASHI_NAMES[from],
          toName: RASHI_NAMES[to],
        });
      }
    }
  }
  return aspects;
}

export function calculateArudhaPada(
  houseNumber: number,
  ascendantRashi: number,
  planets: JaiminiPlanet[]
): PadaLagna | null {
  const RASHI_LORDS: Record<number, string> = {
    0: 'Mars',
    1: 'Venus',
    2: 'Mercury',
    3: 'Moon',
    4: 'Sun',
    5: 'Mercury',
    6: 'Venus',
    7: 'Mars',
    8: 'Jupiter',
    9: 'Saturn',
    10: 'Saturn',
    11: 'Jupiter',
  };

  const targetRashi = (ascendantRashi + houseNumber - 1) % 12;
  const lordName = RASHI_LORDS[targetRashi];
  const lordPlanet = planets.find(p => p.name === lordName);
  if (!lordPlanet) return null;

  const dist = (lordPlanet.rashiIndex - targetRashi + 12) % 12 || 12;
  let padaRashi = (lordPlanet.rashiIndex + dist - 1) % 12;

  if (padaRashi === targetRashi || padaRashi === (targetRashi + 6) % 12) {
    padaRashi = (padaRashi + 10) % 12;
  }

  return {
    rashiIndex: padaRashi,
    rashiName: RASHI_NAMES[padaRashi],
    degrees: 0,
    meaning: {
      en: `Arudha of house ${houseNumber} in ${RASHI_NAMES[padaRashi]}`,
      hi: `भाव ${houseNumber} का आरूढ ${RASHI_NAMES_HI[padaRashi]} में`,
    },
  };
}

export function calculatePadaLagna(
  ascendantRashi: number,
  ascendantDegrees: number,
  planets: JaiminiPlanet[]
): PadaLagna | null {
  return calculateArudhaPada(1, ascendantRashi, planets);
}

export function calculateUpapadaLagna(
  ascendantRashi: number,
  planets: JaiminiPlanet[]
): PadaLagna | null {
  return calculateArudhaPada(12, ascendantRashi, planets);
}

export function calculateA4(ascendantRashi: number, planets: JaiminiPlanet[]): PadaLagna | null {
  return calculateArudhaPada(4, ascendantRashi, planets);
}

export function calculateA10(ascendantRashi: number, planets: JaiminiPlanet[]): PadaLagna | null {
  return calculateArudhaPada(10, ascendantRashi, planets);
}

// ── Arudha Psychology Narrative ──────────────────────────────────────────────

export interface ArudhaPsychologyOutput {
  alPosition: number; // AL from Lagna (1-12)
  alRashiName: string;
  psychologicalMask: string;
  coreTension: string;
  privateState: string;
  publicProjection: string;
  gapConsequence: string;
  shiftRequired: string; // "Therefore: what must shift"
  narrative: string; // Full formatted paragraph
  ul?: ArudhaDetail; // Upapada Lagna detail
  a4?: ArudhaDetail; // A4 detail
  a10?: ArudhaDetail; // A10 detail
}

export interface ArudhaDetail {
  house: number;
  rashiName: string;
  meaning: string;
}

const AL_PSYCHOLOGY_MAP: Record<
  number,
  {
    mask: string;
    tension: string;
    privateState: string;
    publicProjection: string;
    consequence: string;
    shift: string;
  }
> = {
  1: {
    mask: 'No mask. World sees you as you are. Vulnerable but authentic.',
    tension: 'Authenticity vs. exposure',
    privateState: 'You are exactly what you appear to be',
    publicProjection: 'Transparent, unguarded authenticity',
    consequence: 'The native cannot hide — which is both a gift and a burden',
    shift: 'Continue being exactly who you are. The world needs your unfiltered presence.',
  },
  2: {
    mask: 'Identity = wealth, speech, family. "I am what I own and what I say."',
    tension: 'Worth vs. value',
    privateState: 'Internally questioning your own value',
    publicProjection: 'Material security and verbal confidence',
    consequence: 'The native accumulates to feel valid, then feels hollow inside the accumulation',
    shift: 'Separate your net worth from your self-worth. Your value precedes everything you own.',
  },
  3: {
    mask: 'The warrior-mask. Courage and competition define perceived identity.',
    tension: 'Action vs. inner stillness',
    privateState: 'Internally exhausted from constant striving',
    publicProjection: 'Unstoppable initiative and bold action',
    consequence: 'The native outruns their own anxiety until the body forces a stop',
    shift: 'Courage includes the courage to rest. Stillness is not weakness.',
  },
  4: {
    mask: 'Nurturing/protective image. Home and emotional safety are the stage.',
    tension: 'Care-giving vs. receiving',
    privateState: 'Privately craving the nurturing you give others',
    publicProjection: 'The reliable anchor, the safe harbor',
    consequence: "The native becomes everyone's home but has no home of their own",
    shift: 'Receive before you give. An empty well cannot water a village.',
  },
  5: {
    mask: 'Creative/authority image. Seen as brilliant or entitled.',
    tension: 'Creation vs. ego',
    privateState: 'Privately afraid of being ordinary',
    publicProjection: 'Brilliant, authoritative, creatively gifted',
    consequence: 'The native performs genius until they forget what genuine creation feels like',
    shift: 'Create for the joy of creating, not for the validation of being seen as creative.',
  },
  6: {
    mask: 'Service/conflict image. Seen through work or through enemies.',
    tension: 'Service vs. recognition',
    privateState: 'Internally resentful that effort goes unnoticed',
    publicProjection: 'The indispensable worker, the problem-solver',
    consequence: "The native solves everyone's problems except their own",
    shift: 'Your service is valuable only when you are valued while serving.',
  },
  7: {
    mask: 'Relationship mirror. Identity exists only in partnership.',
    tension: 'Union vs. self',
    privateState: 'Uncertain who you are when alone',
    publicProjection: 'Defined entirely by your significant relationships',
    consequence:
      'The native loses themselves in every partnership and must rebuild after each ends',
    shift: 'Become complete alone. Then partnerships become chosen, not needed.',
  },
  8: {
    mask: 'Mystery/transformation image. Inscrutable. Taboo as brand.',
    tension: 'Concealment vs. revelation',
    privateState: 'Holding secrets that would change everything if spoken',
    publicProjection: 'Magnetic mystery, transformational presence',
    consequence: "The native's power is in what they hide — but hiding becomes its own prison",
    shift: 'Reveal one truth at a time. Authenticity does not require full exposure.',
  },
  9: {
    mask: 'Guru/guide image. The wise foreigner or spiritual authority.',
    tension: 'Knowledge vs. wisdom',
    privateState: 'Privately aware of how much you do not know',
    publicProjection: 'The teacher, the guide, the truth-teller',
    consequence: 'The native is expected to have answers they are still seeking',
    shift: 'Teach what you are still learning. The best guru is an eternal student.',
  },
  10: {
    mask: 'Career/public achievement as identity. The workaholic mask.',
    tension: 'Achievement vs. being',
    privateState: 'Privately uncertain but publicly unstoppable',
    publicProjection: 'Competent, driven, professionally unassailable',
    consequence:
      'The world believes in your competence more than you do. The gap creates performance anxiety invisible to everyone except you.',
    shift: 'Success arrives when you stop performing competence and start embodying it.',
  },
  11: {
    mask: 'Network/visionary image. Known by associations and causes.',
    tension: 'Vision vs. belonging',
    privateState: 'Afraid of being excluded from the very groups you lead',
    publicProjection: 'The connector, the visionary, the network hub',
    consequence: "The native's identity disperses across too many affiliations",
    shift: 'A focused vision attracts more than a scattered presence.',
  },
  12: {
    mask: 'Hidden/self-undoing image. Fame through loss or exile.',
    tension: 'Sacrifice vs. surrender',
    privateState: 'Holding grief that the world never sees',
    publicProjection: 'The mystic, the exile, the one who walked away',
    consequence: "The native's public image is built on private sacrifice",
    shift: 'Surrender is not defeat. Letting go is the final victory.',
  },
};

function ordinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

export function buildArudhaPsychology(
  padaLagna: PadaLagna | null,
  lagnaRashiIdx: number,
  dasha: { currentMahadasha?: { planet: string; startDate: Date; endDate: Date } | null }
): ArudhaPsychologyOutput {
  if (!padaLagna) {
    return {
      alPosition: 0,
      alRashiName: 'Unknown',
      psychologicalMask: 'AL cannot be computed — insufficient data.',
      coreTension: 'Unknown',
      privateState: 'Unknown',
      publicProjection: 'Unknown',
      gapConsequence: 'Unknown',
      shiftRequired: 'Unknown',
      narrative: 'AL computation failed. Check ascendant data.',
    };
  }

  const alPosition = ((padaLagna.rashiIndex - lagnaRashiIdx + 12) % 12) + 1;
  const psych = AL_PSYCHOLOGY_MAP[alPosition];

  const md = dasha.currentMahadasha;
  const dashaNote = md
    ? ` [Level 3: Current ${md.planet} MD is the crucible — ${md.startDate.getFullYear()}-${md.endDate.getFullYear()}]`
    : '';

  const narrative = `AL in the ${alPosition}${ordinalSuffix(alPosition)} from Lagna: ${psych.mask} ${psych.privateState} privately, but ${psych.publicProjection} publicly. ${psych.consequence}. Therefore: ${psych.shift}.${dashaNote}`;

  return {
    alPosition,
    alRashiName: padaLagna.rashiName,
    psychologicalMask: psych.mask,
    coreTension: psych.tension,
    privateState: psych.privateState,
    publicProjection: psych.publicProjection,
    gapConsequence: psych.consequence,
    shiftRequired: psych.shift,
    narrative,
  };
}

// ── Narrative Synthesis ──────────────────────────────────────────────────────

export function generateJaiminiNarrative(
  ascendantRashi: number,
  al: PadaLagna | null,
  ul: PadaLagna | null,
  a10: PadaLagna | null
): NarrativeSynthesis {
  let publicVsPrivate = '';
  if (al) {
    const diff = (al.rashiIndex - ascendantRashi + 12) % 12;
    if (diff === 0)
      publicVsPrivate =
        'Your public image perfectly aligns with your true internal self. You are seen exactly as you are.';
    else if (diff === 6)
      publicVsPrivate =
        'Your public image is often the mirror opposite of your internal reality. People see what you project, not what you feel.';
    else if ([5, 7, 11].includes(diff))
      publicVsPrivate =
        'There is significant friction between who you are and how the world sees you. Your public image may feel like a burden or challenge.';
    else
      publicVsPrivate =
        'You maintain a healthy separation between your private self and public persona, with both supporting each other in different ways.';
  }

  let relationshipManifestation = '';
  if (ul) {
    relationshipManifestation = `Upapada Lagna (UL) in ${ul.rashiName}: This sign dictates the actual manifestation of your marriage and long-term partnerships. `;
    if ([0, 4, 8].includes(ul.rashiIndex))
      relationshipManifestation += 'Expect passionate, independent, and dynamic partnerships.';
    else if ([1, 5, 9].includes(ul.rashiIndex))
      relationshipManifestation += 'Expect stable, practical, and grounded partnerships.';
    else if ([2, 6, 10].includes(ul.rashiIndex))
      relationshipManifestation +=
        'Expect communicative, intellectual, and socially active partnerships.';
    else
      relationshipManifestation +=
        'Expect emotional, nurturing, and deeply connected partnerships.';
  }

  let careerPerception = '';
  if (a10) {
    careerPerception = `A10 in ${a10.rashiName}: The world perceives your career and professional status through this lens. Ensure your professional actions align with the qualities of ${a10.rashiName} to maximize recognition.`;
  }

  return { publicVsPrivate, relationshipManifestation, careerPerception };
}

// ── Jaimini Yogas ────────────────────────────────────────────────────────────

export function detectJaiminiYogas(
  karakas: Karaka[],
  planets: JaiminiPlanet[],
  ascendantRashi: number
): JaiminiYoga[] {
  const ak = karakas.find(k => k.karaka === 'Atmakaraka');
  const amk = karakas.find(k => k.karaka === 'Amatyakaraka');
  const dk = karakas.find(k => k.karaka === 'Darakaraka');
  const gk = karakas.find(k => k.karaka === 'Gnatikaraka');

  const planetMap = Object.fromEntries(planets.map(p => [p.name, p]));
  const aspects = calculateRashiAspects();
  const aspectsRashi = (from: number, to: number) =>
    aspects.some(a => a.fromRashi === from && a.toRashi === to);

  const yogas: JaiminiYoga[] = [];

  // 1. Raj Yoga: AK and AMK in Kendra/Trikona from each other
  if (ak && amk) {
    const akPlanet = planetMap[ak.planet];
    const amkPlanet = planetMap[amk.planet];
    if (akPlanet && amkPlanet) {
      const diff = Math.abs(akPlanet.house - amkPlanet.house);
      const isKendraTrikona =
        [0, 1, 4, 5, 8, 9].includes(diff) || [0, 1, 4, 5, 8, 9].includes(12 - diff);
      yogas.push({
        name: 'Jaimini Raj Yoga',
        nameHi: 'जैमिनी राज योग',
        isPresent: isKendraTrikona,
        strength: isKendraTrikona ? 'strong' : 'weak',
        description: {
          en: 'Atmakaraka and Amatyakaraka in Kendra/Trikona — indicates power, authority, and success in career',
          hi: 'आत्मकारक और अमात्यकारक केंद्र/त्रिकोण में — शक्ति, अधिकार और करियर में सफलता का संकेत',
        },
      });
    }
  }

  // 2. Gnati Yoga: GK in 6th/8th/12th from AK
  if (ak && gk) {
    const akPlanet = planetMap[ak.planet];
    const gkPlanet = planetMap[gk.planet];
    if (akPlanet && gkPlanet) {
      const diff = (gkPlanet.house - akPlanet.house + 12) % 12;
      const isDusthana = [5, 7, 11].includes(diff); // 6th, 8th, 12th
      yogas.push({
        name: 'Gnati Yoga',
        nameHi: 'ज्ञाति योग',
        isPresent: isDusthana,
        strength: isDusthana ? 'moderate' : 'weak',
        description: {
          en: 'Gnatikaraka in 6/8/12 from Atmakaraka — indicates obstacles, health issues, or competition from relatives',
          hi: 'ज्ञातिकारक आत्मकारक से 6/8/12 में — बाधाएं, स्वास्थ्य समस्याएं या रिश्तेदारों से प्रतिस्पर्धा',
        },
      });
    }
  }

  // 3. Daara Yoga: DK in 7th from AK or aspects AK's rashi
  if (ak && dk) {
    const akPlanet = planetMap[ak.planet];
    const dkPlanet = planetMap[dk.planet];
    if (akPlanet && dkPlanet) {
      const is7th = (dkPlanet.house - akPlanet.house + 12) % 12 === 6;
      const aspectsAK = aspectsRashi(dkPlanet.rashiIndex, akPlanet.rashiIndex);
      yogas.push({
        name: 'Daara Yoga',
        nameHi: 'दार योग',
        isPresent: is7th || aspectsAK,
        strength: is7th ? 'strong' : aspectsAK ? 'moderate' : 'weak',
        description: {
          en: 'Darakaraka connected to Atmakaraka — indicates strong marital happiness and partnership success',
          hi: 'दारकारक आत्मकारक से जुड़ा — वैवाहिक सुख और साझेदारी में सफलता का संकेत',
        },
      });
    }
  }

  // 4. Atmakaraka in Kendra: strong soul purpose
  if (ak) {
    const akPlanet = planetMap[ak.planet];
    if (akPlanet) {
      const inKendra = [1, 4, 7, 10].includes(akPlanet.house);
      yogas.push({
        name: 'Atmakaraka Kendra Yoga',
        nameHi: 'आत्मकारक केंद्र योग',
        isPresent: inKendra,
        strength: inKendra ? 'strong' : 'weak',
        description: {
          en: 'Atmakaraka in Kendra house — strong soul purpose, leadership, and spiritual clarity',
          hi: 'आत्मकारक केंद्र भाव में — मजबूत आत्मिक उद्देश्य, नेतृत्व और आध्यात्मिक स्पष्टता',
        },
      });
    }
  }

  // 5. Jupiter aspects Atmakaraka's rashi → Hamsa-like Jaimini yoga
  if (ak) {
    const akPlanet = planetMap[ak.planet];
    const jupiter = planetMap['Jupiter'];
    if (akPlanet && jupiter) {
      const jupAspectsAK = aspectsRashi(jupiter.rashiIndex, akPlanet.rashiIndex);
      yogas.push({
        name: 'Jaimini Hamsa Yoga',
        nameHi: 'जैमिनी हंस योग',
        isPresent: jupAspectsAK,
        strength: jupAspectsAK ? 'strong' : 'weak',
        description: {
          en: "Jupiter aspects Atmakaraka's sign — wisdom, dharma, and spiritual elevation",
          hi: 'बृहस्पति आत्मकारक की राशि को देखता है — ज्ञान, धर्म और आध्यात्मिक उन्नति',
        },
      });
    }
  }

  return yogas;
}

// ── Chara Dasha ──────────────────────────────────────────────────────────────

/**
 * Calculate Chara Dasha sequence starting from Lagna rashi.
 * Sequence goes through all 12 signs; direction depends on sign type.
 */
export function calculateCharaDasha(ascendantRashi: number, birthYear: number): CharaDasha[] {
  const dashas: CharaDasha[] = [];
  let currentAge = 0;

  // Determine direction: Chara/Dual signs go forward, Sthira go backward
  const isOdd = ascendantRashi % 2 === 0; // Aries=0 is odd sign
  let rashi = ascendantRashi;

  for (let i = 0; i < 12; i++) {
    const years = CHARA_DASHA_YEARS[rashi] ?? 7;
    dashas.push({
      rashi,
      rashiName: RASHI_NAMES[rashi],
      years,
      startAge: currentAge,
      endAge: currentAge + years,
    });
    currentAge += years;
    // Advance: odd ascendants go forward, even go backward
    rashi = isOdd ? (rashi + 1) % 12 : (rashi - 1 + 12) % 12;
  }

  return dashas;
}

// ── Main Analysis ────────────────────────────────────────────────────────────

export function analyzeJaimini(
  planets: JaiminiPlanet[],
  ascendantRashi: number,
  ascendantDegrees: number,
  birthYear: number
): JaiminiAnalysis {
  const karakas = calculateCharaKarakas(planets);
  const atmakaraka = karakas.find(k => k.karaka === 'Atmakaraka') ?? null;
  const rashiAspects = calculateRashiAspects();
  const padaLagna = calculatePadaLagna(ascendantRashi, ascendantDegrees, planets);
  const upapadaLagna = calculateArudhaPada(12, ascendantRashi, planets);
  const a4 = calculateArudhaPada(4, ascendantRashi, planets);
  const a10 = calculateArudhaPada(10, ascendantRashi, planets);
  const narrative = generateJaiminiNarrative(ascendantRashi, padaLagna, upapadaLagna, a10);

  const yogas = detectJaiminiYogas(karakas, planets, ascendantRashi);
  const charaDasha = calculateCharaDasha(ascendantRashi, birthYear);

  const presentYogas = yogas.filter(y => y.isPresent);
  const akName = atmakaraka?.planet ?? 'Unknown';

  return {
    karakas,
    atmakaraka,
    rashiAspects,
    padaLagna,
    upapadaLagna,
    a4,
    a10,
    yogas,
    charaDasha,
    narrative,
    summary: {
      en: `Atmakaraka is ${akName} — your soul's primary significator. ${presentYogas.length} Jaimini yoga${presentYogas.length !== 1 ? 's' : ''} active. Arudha Lagna in ${padaLagna?.rashiName ?? 'Unknown'}.`,
      hi: `आत्मकारक ${akName} है — आपकी आत्मा का प्राथमिक कारक। ${presentYogas.length} जैमिनी योग सक्रिय। आरूढ लग्न ${padaLagna ? RASHI_NAMES_HI[padaLagna.rashiIndex] : 'अज्ञात'} में।`,
    },
  };
}
