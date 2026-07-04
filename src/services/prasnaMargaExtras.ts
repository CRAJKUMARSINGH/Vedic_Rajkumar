/**
 * Prasna Marga Extras
 * Five classical indicators that go beyond the base engine:
 *   1. Tarabala for Prasna  — Ch. 3-4, Prasna Marga (Panakkattu Nambudiripad)
 *   2. Chandra Bala         — Ch. 3, distance of Prasna Moon from natal Moon
 *   3. Gulika Kala          — Ch. 6, Gulika's hora on the question day
 *   4. Pranakshara Nakshatra — Ch. 24, first letter → rashi → nakshatra full detail
 *   5. Reading History      — localStorage persistence (last 15 readings)
 */

import { getTarabala, type TarabalaResult } from './tarabalaService';
import { NAKSHATRAS } from './nakshatraService';

// ─────────────────────────────────────────────────────────────────────────────
// 1. TARABALA FOR PRASNA (Ch. 3-4, Prasna Marga)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert Moon rashi index (0-11) to approximate nakshatra index (0-26).
 * Each rashi spans exactly 2.25 nakshatras (30° / 13.333°).
 * We use the midpoint of the rashi for a stable approximation.
 */
export function rashiToNakshatraApprox(rashiIndex: number): number {
  const mid = rashiIndex * 2.25 + 1.125;
  return Math.min(26, Math.floor(mid));
}

export interface PrasnaTarabalaResult extends TarabalaResult {
  birthNakshatraName: string;
  questionNakshatraName: string;
  birthNakshatraIndex: number;
  questionNakshatraIndex: number;
  prasnaInterpretation: { en: string; hi: string };
}

const NAKSHATRA_NAMES: string[] = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
  'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
  'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada',
  'Uttara Bhadrapada','Revati',
];

const NAKSHATRA_NAMES_HI: string[] = [
  'अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु',
  'पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी','हस्त',
  'चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्व आषाढ़',
  'उत्तर आषाढ़','श्रवण','धनिष्ठा','शतभिषा','पूर्व भाद्रपद',
  'उत्तर भाद्रपद','रेवती',
];

const TARABALA_PRASNA_INTERP: Record<string, { en: string; hi: string }> = {
  'Janma':        { en: 'Question Nakshatra = Birth star. Outcome tied to querent\'s vitality. Double the remedy.',       hi: 'प्रश्न नक्षत्र = जन्म नक्षत्र। फल जातक की जीवनशक्ति से जुड़ा। दोहरा परिहार करें।' },
  'Sampat':       { en: 'Sampat Tara — wealth & prosperity favored. Question will yield tangible gains.',                  hi: 'संपत् तारा — धन व समृद्धि अनुकूल। प्रश्न से ठोस लाभ मिलेगा।' },
  'Vipat':        { en: 'Vipat Tara — danger, setbacks likely. Prasna Marga Ch.4: add protective Parihara before acting.', hi: 'विपत् तारा — खतरा, बाधा संभव। प्रश्न मार्ग अध्याय 4: कार्य से पहले परिहार करें।' },
  'Kshema':       { en: 'Kshema Tara — comfort & stability. Question resolves in favour of health and family.',             hi: 'क्षेम तारा — सुख व स्थिरता। प्रश्न स्वास्थ्य और परिवार के पक्ष में।' },
  'Pratyak':      { en: 'Pratyak Tara — obstacles likely. A waiting period of 1 lunar fortnight is advised.',              hi: 'प्रत्यक् तारा — बाधाएं संभव। एक पक्ष की प्रतीक्षा करें।' },
  'Sadhana':      { en: 'Sadhana Tara — effort yields fruit. Persistence and consistent action will succeed.',              hi: 'साधन तारा — परिश्रम फलदायक। निरंतर प्रयास से सफलता मिलेगी।' },
  'Naidhana':     { en: 'Naidhana Tara — most malefic. Question indicates risk of loss; proceed only with full Parihara.',  hi: 'नैधन तारा — अत्यंत अशुभ। हानि का संकेत; पूर्ण परिहार के बाद ही आगे बढ़ें।' },
  'Mitra':        { en: 'Mitra Tara — friendly period. Support from others will be pivotal to the outcome.',               hi: 'मित्र तारा — मित्रवत काल। दूसरों का सहयोग परिणाम में निर्णायक।' },
  'Parama Mitra': { en: 'Parama Mitra Tara — best possible star. Question is well-timed; outcome strongly favorable.',     hi: 'परम मित्र तारा — सर्वोत्तम नक्षत्र। प्रश्न सर्वोत्तम समय पर; परिणाम अत्यंत शुभ।' },
};

export function getPrasnaTarabala(
  birthMoonRashiIndex: number,
  prasnaMoonRashiIndex: number,
): PrasnaTarabalaResult {
  const birthNakIdx = rashiToNakshatraApprox(birthMoonRashiIndex);
  const questionNakIdx = rashiToNakshatraApprox(prasnaMoonRashiIndex);
  const base = getTarabala(birthNakIdx, questionNakIdx);
  const interp = TARABALA_PRASNA_INTERP[base.category] ?? { en: base.advice.en, hi: base.advice.hi };

  return {
    ...base,
    birthNakshatraIndex: birthNakIdx,
    questionNakshatraIndex: questionNakIdx,
    birthNakshatraName: NAKSHATRA_NAMES[birthNakIdx] ?? '—',
    questionNakshatraName: NAKSHATRA_NAMES[questionNakIdx] ?? '—',
    prasnaInterpretation: interp,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CHANDRA BALA (Ch. 3, Prasna Marga)
// ─────────────────────────────────────────────────────────────────────────────

export interface ChandraBalaResult {
  houseFromNatal: number;
  isFavorable: boolean;
  strength: 'Strong' | 'Moderate' | 'Weak';
  label: { en: string; hi: string };
  description: { en: string; hi: string };
  color: string;
}

const CHANDRA_BALA_FAVORABLE = new Set([1, 3, 6, 7, 10, 11]);
const CHANDRA_BALA_WEAK      = new Set([4, 8, 12]);

const CHANDRA_BALA_HOUSE_DESC: Record<number, { en: string; hi: string }> = {
  1:  { en: 'Moon on natal Moon — Tara Bala 1 / Janma. Strong emotional connection; outcome deeply personal.', hi: 'प्रश्न चंद्र = जन्म चंद्र। भावनात्मक जुड़ाव गहरा; फल व्यक्तिगत।' },
  2:  { en: '2nd house — Neutral. Wealth matters are in focus. Mixed results for the question.', hi: 'द्वितीय भाव — सामान्य। धन विषय प्रभावित। मिश्रित परिणाम।' },
  3:  { en: '3rd house — Favorable (Tara Bala 3). Effort and courage bring the desired result.', hi: 'तृतीय भाव — अनुकूल। साहस व प्रयास से फल मिलेगा।' },
  4:  { en: '4th house — Weak. Emotional turbulence; home/property matters face delays.', hi: 'चतुर्थ भाव — कमज़ोर। भावनात्मक अशांति; घर/संपत्ति में विलंब।' },
  5:  { en: '5th house — Neutral. Creative and speculative outcomes; children signified.', hi: 'पंचम भाव — सामान्य। रचनात्मक व सट्टे का फल; संतान का संकेत।' },
  6:  { en: '6th house — Favorable (Tara Bala 6). Victory over enemies; health improves.', hi: 'षष्ठ भाव — अनुकूल। शत्रु-विजय; स्वास्थ्य में सुधार।' },
  7:  { en: '7th house — Favorable (Tara Bala 7). Partnership and marriage matters blessed.', hi: 'सप्तम भाव — अनुकूल। साझेदारी और विवाह के लिए शुभ।' },
  8:  { en: '8th house — Weak. Hidden obstacles; longevity and inheritance matters need caution.', hi: 'अष्टम भाव — कमज़ोर। छिपी बाधाएं; आयु और विरासत में सावधानी।' },
  9:  { en: '9th house — Neutral. Dharma and fortune are in play; father and guru signified.', hi: 'नवम भाव — सामान्य। धर्म और भाग्य प्रभावित; पिता और गुरु।' },
  10: { en: '10th house — Favorable (Tara Bala 10). Career and public standing strongly supported.', hi: 'दशम भाव — अनुकूल। करियर और सामाजिक प्रतिष्ठा का बल।' },
  11: { en: '11th house — Favorable (Tara Bala 11). Gains, elder siblings, and wishes fulfilled.', hi: 'एकादश भाव — अनुकूल। लाभ, बड़े भाई-बहन और इच्छा पूर्ण।' },
  12: { en: '12th house — Weak. Loss, isolation, or foreign travel; expenditure rises.', hi: 'द्वादश भाव — कमज़ोर। हानि, अकेलापन या विदेश यात्रा; व्यय वृद्धि।' },
};

export function getChandraBala(
  birthMoonRashiIndex: number,
  prasnaMoonRashiIndex: number,
): ChandraBalaResult {
  const houseFromNatal = ((prasnaMoonRashiIndex - birthMoonRashiIndex + 12) % 12) + 1;
  const isFavorable = CHANDRA_BALA_FAVORABLE.has(houseFromNatal);
  const isWeak      = CHANDRA_BALA_WEAK.has(houseFromNatal);
  const strength: ChandraBalaResult['strength'] = isFavorable ? 'Strong' : isWeak ? 'Weak' : 'Moderate';
  const color = isFavorable ? 'emerald' : isWeak ? 'rose' : 'amber';

  const desc = CHANDRA_BALA_HOUSE_DESC[houseFromNatal] ?? { en: '—', hi: '—' };

  const labelMap: Record<ChandraBalaResult['strength'], { en: string; hi: string }> = {
    Strong:   { en: 'Strong Chandra Bala', hi: 'बलवान चंद्र बल' },
    Moderate: { en: 'Moderate Chandra Bala', hi: 'सामान्य चंद्र बल' },
    Weak:     { en: 'Weak Chandra Bala', hi: 'निर्बल चंद्र बल' },
  };

  return { houseFromNatal, isFavorable, strength, label: labelMap[strength], description: desc, color };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GULIKA KALA (Ch. 6, Prasna Marga)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classical Gulika position:
 *   Day = Sun, Mon, Tue, Wed, Thu, Fri, Sat
 *   Daytime Gulika hora offset from sunrise (assuming 6 am):
 *     Sun=6, Mon=7, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5  (hora index, 1-based, 0 = first hora)
 *   Night-time is separate but we only handle daytime for simplicity.
 */

export interface GulikaKalaResult {
  dayName: string;
  gulikaHoraStart: string;
  gulikaHoraEnd: string;
  isQuestionInGulikaHora: boolean;
  gulikaRashi: string;
  gulikaRashiHi: string;
  warning: { en: string; hi: string };
  color: string;
}

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Gulika hora ordinal (0-based from 6am) for each weekday (0=Sun … 6=Sat)
const GULIKA_HORA_OFFSET = [5, 6, 0, 1, 2, 3, 4];

const RASHIS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHIS_HI = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन'];

export function getGulikaKala(questionTime: Date, prashnaLagnaRashi: number): GulikaKalaResult {
  const dayOfWeek = questionTime.getDay(); // 0=Sun
  const horaOffset = GULIKA_HORA_OFFSET[dayOfWeek];

  const sunriseHour = 6;
  const gulikaStartH = sunriseHour + horaOffset;
  const gulikaEndH   = gulikaStartH + 1;

  const currentHour = questionTime.getHours();
  const isInGulika  = currentHour >= gulikaStartH && currentHour < gulikaEndH;

  const fmt = (h: number) => `${((h - 1) % 12) + 1}:00 ${h < 12 || h === 24 ? 'AM' : 'PM'}`;

  // Gulika occupies a rashi 8 places from the Prasna Lagna (classical approximation)
  const gulikaRashiIdx = (prashnaLagnaRashi + 7) % 12;

  return {
    dayName: DAY_NAMES[dayOfWeek],
    gulikaHoraStart: fmt(gulikaStartH > 12 ? gulikaStartH - 12 : gulikaStartH) + (gulikaStartH < 12 ? ' AM' : ' PM'),
    gulikaHoraEnd:   fmt(gulikaEndH   > 12 ? gulikaEndH   - 12 : gulikaEndH)   + (gulikaEndH   < 12 ? ' AM' : ' PM'),
    isQuestionInGulikaHora: isInGulika,
    gulikaRashi: RASHIS_EN[gulikaRashiIdx],
    gulikaRashiHi: RASHIS_HI[gulikaRashiIdx],
    color: isInGulika ? 'red' : 'slate',
    warning: isInGulika
      ? { en: 'Question asked during Gulika hora — Prasna Marga Ch.6 advises double caution. Delay if possible.', hi: 'प्रश्न गुलिक होरा में पूछा — प्रश्न मार्ग अध्याय 6: दोहरी सावधानी। यदि संभव हो तो प्रतीक्षा करें।' }
      : { en: 'Question not in Gulika hora — auspicious timing from Prasna Marga Ch.6 perspective.', hi: 'प्रश्न गुलिक होरा में नहीं — प्रश्न मार्ग अध्याय 6 की दृष्टि से शुभ समय।' },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PRANAKSHARA NAKSHATRA DETAIL (Ch. 24, Prasna Marga)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Beeja Mantras (seed syllables) for each Nakshatra lord.
 * Source: classical Vedic tradition, used in Japa Parihara.
 */
const PLANET_BEEJA: Record<string, string> = {
  Sun:     'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
  Moon:    'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
  Mars:    'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
  Mercury: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
  Jupiter: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
  Venus:   'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
  Saturn:  'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
  Rahu:    'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
  Ketu:    'ॐ स्त्रां स्त्रीं स्त्रौं सः केतवे नमः',
};

const PLANET_BEEJA_TRANSLITERATED: Record<string, string> = {
  Sun:     'Om Hraam Hreem Hraum Sah Suryaya Namah',
  Moon:    'Om Shraam Shreem Shraum Sah Chandramase Namah',
  Mars:    'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
  Mercury: 'Om Braam Breem Braum Sah Budhaya Namah',
  Jupiter: 'Om Graam Greem Graum Sah Gurave Namah',
  Venus:   'Om Draam Dreem Draum Sah Shukraya Namah',
  Saturn:  'Om Praam Preem Praum Sah Shanaischaraya Namah',
  Rahu:    'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
  Ketu:    'Om Straam Streem Straum Sah Ketave Namah',
};

export const PRANAKSHARA_RASHI: Record<string, number> = {
  A:0, Aa:0, I:0, Oo:0, E:0,
  U:1, Ba:1, Va:1, Vi:1, Vu:1,
  Ka:2, Ki:2, Ku:2, Ge:2, Ko:2,
  Da:3, Di:3, Du:3, De:3, Do:3,
  Ma:4, Mi:4, Mu:4, Me:4, Mo:4,
  Pa:5, Pi:5, Pu:5, Sha:5, Na:5,
  Ra:6, Ri:6, Ru:6, Re:6, Ro:6,
  Ta:7, Ti:7, Tu:7, Te:7, To:7,
  Dha:8, Pha:8, Bha:8, Sa:8, Dhi:8,
  Bho:9, Ja:9, Ji:9, Khi:9, Khe:9,
  Ga:10, Gi:10, Gu:10, Ge2:10, Go:10,
  Cha:11, Chi:11, Chu:11, Che:11, Cho:11,
};

export interface PranaksharaNakshatraDetail {
  letter: string;
  rashiIndex: number;
  rashiName: string;
  rashiNameHi: string;
  nakshatra: {
    index: number;
    nameEn: string;
    nameHi: string;
    lord: string;
    deity: string;
    symbol: string;
    characteristics: { en: string; hi: string };
  };
  beejaMantra: string;
  beejaMantraTranslit: string;
  chapterNote: { en: string; hi: string };
}

export function getPranaksharaNakshatraDetail(letter: string): PranaksharaNakshatraDetail {
  const L = letter.toUpperCase();
  let rashiIndex = 0;
  for (const [key, val] of Object.entries(PRANAKSHARA_RASHI)) {
    if (key.toUpperCase().startsWith(L)) { rashiIndex = val; break; }
  }

  const nakIdx = rashiToNakshatraApprox(rashiIndex);
  const nak = NAKSHATRAS[nakIdx];

  const nameEn = typeof nak.name === 'object' ? nak.name.en : (nak.nameEn ?? '');
  const nameHi = typeof nak.name === 'object' ? nak.name.hi : (nak.nameHi ?? '');

  return {
    letter: L,
    rashiIndex,
    rashiName: RASHIS_EN[rashiIndex],
    rashiNameHi: RASHIS_HI[rashiIndex],
    nakshatra: {
      index: nakIdx,
      nameEn,
      nameHi,
      lord: nak.lord,
      deity: nak.deity,
      symbol: nak.symbol,
      characteristics: nak.characteristics,
    },
    beejaMantra: PLANET_BEEJA[nak.lord] ?? '',
    beejaMantraTranslit: PLANET_BEEJA_TRANSLITERATED[nak.lord] ?? '',
    chapterNote: {
      en: `Prasna Marga Ch. 24: The first letter "${L}" maps to ${RASHIS_EN[rashiIndex]} (${RASHIS_HI[rashiIndex]}), whose ruling Nakshatra is ${nameEn}. The Nakshatra lord ${nak.lord} (deity: ${nak.deity}) gives the primary color of the query. Japa of this lord's Beeja Mantra (108×) is the indicated Parihara.`,
      hi: `प्रश्न मार्ग अ. 24: प्राणाक्षर "${L}" → ${RASHIS_HI[rashiIndex]} → नक्षत्र ${nameHi}, स्वामी ${nak.lord} (देवता: ${nak.deity})। बीज मंत्र का 108 बार जप परिहार स्वरूप।`,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. READING HISTORY (localStorage)
// ─────────────────────────────────────────────────────────────────────────────

export interface PrasnaReading {
  id: string;
  timestamp: string;
  question: string;
  direction: string;
  jatakName: string | null;
  outcome: 'favorable' | 'unfavorable' | 'neutral';
  score: number;
  tarabalaCat: string;
  chandraBalaStrength: string;
  gulikaInHora: boolean;
  pranaksharaLetter: string;
  pranaksharaNakshatra: string;
}

const HISTORY_KEY = 'prasna_reading_history_v1';
const MAX_READINGS = 15;

export function saveReadingHistory(reading: Omit<PrasnaReading, 'id'>): void {
  try {
    const existing = getReadingHistory();
    const newReading: PrasnaReading = { ...reading, id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
    const updated = [newReading, ...existing].slice(0, MAX_READINGS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
  }
}

export function getReadingHistory(): PrasnaReading[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PrasnaReading[];
  } catch {
    return [];
  }
}

export function clearReadingHistory(): void {
  try { localStorage.removeItem(HISTORY_KEY); } catch { }
}
