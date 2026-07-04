/**
 * Ashtakoot Milan — 8-Factor Kundli Compatibility
 *
 * Uses Moon's sidereal longitude from ChartData.
 * All nakshatra indices are 0-based (0 = Ashwini … 26 = Revati).
 * All rashi indices are 1-based (1 = Aries … 12 = Pisces).
 *
 * Reference: B.V. Raman "Hindu Predictive Astrology", classical Ashtakoot tables.
 */

import type { ChartData } from './vedicCalc';

/* ─────────────────────────────── Types ─────────────────────────────────── */

export interface KootScore {
  name: string;
  nameHi: string;
  maxScore: number;
  score: number;
  gradeEn: string;
  gradeHi: string;
  detail: string;
  detailHi: string;
  isCritical: boolean; // Nadi dosha / Bhakuta dosha flag
}

export interface AshtakootResult {
  koots: KootScore[];
  total: number;
  maxTotal: 36;
  percentage: number;
  verdict: string;
  verdictHi: string;
  verdictColor: 'excellent' | 'good' | 'average' | 'poor' | 'rejected';
  nadiDosha: boolean;
  bhakutaDosha: boolean;
  doshaNote: string;
  doshaNoteHi: string;
  boyNakshatra: string;
  boyNakshatraHi: string;
  girlNakshatra: string;
  girlNakshatraHi: string;
  boyRashi: string;
  girlRashi: string;
}

/* ─────────────────────── Nakshatra & planet tables ─────────────────────── */

const NAKSHATRA_EN = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mool', 'Purva Ashadha', 'Uttara Ashadha', 'Shravan', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const NAKSHATRA_HI = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा',
  'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्व फाल्गुनी', 'उत्तर फाल्गुनी',
  'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्व आषाढ़', 'उत्तर आषाढ़', 'श्रवण', 'धनिष्ठा', 'शतभिषा',
  'पूर्व भाद्रपद', 'उत्तर भाद्रपद', 'रेवती',
];

const RASHI_EN = [
  '', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** Get nakshatra index (0–26) from sidereal longitude (0–360) */
function nakshatraFromLon(lon: number): number {
  return Math.floor((((lon % 360) + 360) % 360) * 27 / 360);
}

/** Get Moon's planet data from chart */
function moon(chart: ChartData) {
  const m = chart.planets.find(p => p.name === 'Moon');
  if (!m) throw new Error('Moon not found in chart');
  return m;
}

/* ─────────────────────────── 1. Varna (1 pt) ───────────────────────────── */
// Brahmin(4)=Water, Kshatriya(3)=Fire, Vaishya(2)=Earth, Shudra(1)=Air

const VARNA: Record<number, { rank: number; name: string; nameHi: string }> = {
  1: { rank: 3, name: 'Kshatriya', nameHi: 'क्षत्रिय' },   // Aries
  2: { rank: 2, name: 'Vaishya',   nameHi: 'वैश्य'    },   // Taurus
  3: { rank: 1, name: 'Shudra',    nameHi: 'शूद्र'    },   // Gemini
  4: { rank: 4, name: 'Brahmin',   nameHi: 'ब्राह्मण' },   // Cancer
  5: { rank: 3, name: 'Kshatriya', nameHi: 'क्षत्रिय' },   // Leo
  6: { rank: 2, name: 'Vaishya',   nameHi: 'वैश्य'    },   // Virgo
  7: { rank: 1, name: 'Shudra',    nameHi: 'शूद्र'    },   // Libra
  8: { rank: 4, name: 'Brahmin',   nameHi: 'ब्राह्मण' },   // Scorpio
  9: { rank: 3, name: 'Kshatriya', nameHi: 'क्षत्रिय' },   // Sagittarius
  10:{ rank: 2, name: 'Vaishya',   nameHi: 'वैश्य'    },   // Capricorn
  11:{ rank: 1, name: 'Shudra',    nameHi: 'शूद्र'    },   // Aquarius
  12:{ rank: 4, name: 'Brahmin',   nameHi: 'ब्राह्मण' },   // Pisces
};

function scoreVarna(boy: ChartData, girl: ChartData): KootScore {
  const bR = moon(boy).rashi;
  const gR = moon(girl).rashi;
  const bV = VARNA[bR];
  const gV = VARNA[gR];
  const score = bV.rank >= gV.rank ? 1 : 0;
  return {
    name: 'Varna',
    nameHi: 'वर्ण',
    maxScore: 1,
    score,
    gradeEn: score === 1 ? 'Pass' : 'Fail',
    gradeHi: score === 1 ? 'उत्तीर्ण' : 'अनुत्तीर्ण',
    detail: `Boy: ${bV.name} (${RASHI_EN[bR]}), Girl: ${gV.name} (${RASHI_EN[gR]})`,
    detailHi: `वर (${RASHI_EN[bR]}): ${bV.nameHi}, कन्या (${RASHI_EN[gR]}): ${gV.nameHi}`,
    isCritical: false,
  };
}

/* ─────────────────────────── 2. Vashya (2 pts) ──────────────────────────── */
// Each rashi commands certain other rashis — vashya compatibility

const VASHYA_GROUP: Record<number, number> = {
  1: 1, // Aries → Vanchar
  2: 2, // Taurus → Chatushpada
  3: 3, // Gemini → Manav
  4: 4, // Cancer → Jalachara
  5: 1, // Leo → Vanchar
  6: 3, // Virgo → Manav
  7: 3, // Libra → Manav
  8: 5, // Scorpio → Keeta
  9: 2, // Sagittarius → Chatushpada
  10:2, // Capricorn → Chatushpada
  11:3, // Aquarius → Manav
  12:4, // Pisces → Jalachara
};

// Vashya (who commands whom) — boy rashi: girl rashis it commands
const VASHYA_COMMANDS: Record<number, number[]> = {
  1: [4, 8],   2: [4],      3: [6],      4: [8, 9],
  5: [7],      6: [3, 12],  7: [3, 10],  8: [4],
  9: [12],     10:[1, 11],  11:[1],      12:[10],
};

function scoreVashya(boy: ChartData, girl: ChartData): KootScore {
  const bR = moon(boy).rashi;
  const gR = moon(girl).rashi;
  const bCommands = VASHYA_COMMANDS[bR] ?? [];
  const gCommands = VASHYA_COMMANDS[gR] ?? [];
  let score = 0;
  if (bCommands.includes(gR) && gCommands.includes(bR)) score = 2;
  else if (bCommands.includes(gR)) score = 2;
  else if (gCommands.includes(bR)) score = 1; // partial — girl commands boy
  else if (VASHYA_GROUP[bR] === VASHYA_GROUP[gR]) score = 1; // same group
  return {
    name: 'Vashya',
    nameHi: 'वश्य',
    maxScore: 2,
    score,
    gradeEn: score === 2 ? 'Excellent' : score === 1 ? 'Partial' : 'Incompatible',
    gradeHi: score === 2 ? 'उत्कृष्ट' : score === 1 ? 'आंशिक' : 'असंगत',
    detail: `Boy rashi: ${RASHI_EN[bR]}, Girl rashi: ${RASHI_EN[gR]}`,
    detailHi: `वर राशि: ${RASHI_EN[bR]}, कन्या राशि: ${RASHI_EN[gR]}`,
    isCritical: false,
  };
}

/* ─────────────────────────── 3. Tara (3 pts) ───────────────────────────── */

function scoreTara(boy: ChartData, girl: ChartData): KootScore {
  const bN = nakshatraFromLon(moon(boy).longitude) + 1; // 1-27
  const gN = nakshatraFromLon(moon(girl).longitude) + 1;
  const boyCount = ((bN - gN + 27) % 27) + 1;
  const girlCount = ((gN - bN + 27) % 27) + 1;
  const boyPos = boyCount % 9 || 9;
  const girlPos = girlCount % 9 || 9;
  const GOOD_POS = [1, 3, 5, 7];
  const boyGood = GOOD_POS.includes(boyPos);
  const girlGood = GOOD_POS.includes(girlPos);
  const score = boyGood && girlGood ? 3 : boyGood || girlGood ? 1.5 : 0;
  return {
    name: 'Tara',
    nameHi: 'तारा',
    maxScore: 3,
    score,
    gradeEn: score === 3 ? 'Excellent' : score === 1.5 ? 'Partial' : 'Poor',
    gradeHi: score === 3 ? 'उत्कृष्ट' : score === 1.5 ? 'आंशिक' : 'कमज़ोर',
    detail: `Boy position: ${boyPos}/9 (${boyGood ? 'favourable' : 'unfavourable'}), Girl position: ${girlPos}/9 (${girlGood ? 'favourable' : 'unfavourable'})`,
    detailHi: `वर स्थिति: ${boyPos}/9 (${boyGood ? 'अनुकूल' : 'प्रतिकूल'}), कन्या स्थिति: ${girlPos}/9 (${girlGood ? 'अनुकूल' : 'प्रतिकूल'})`,
    isCritical: false,
  };
}

/* ─────────────────────────── 4. Yoni (4 pts) ───────────────────────────── */

type YoniAnimal = 'Horse'|'Elephant'|'Goat'|'Serpent'|'Dog'|'Cat'|'Rat'|'Cow'|'Buffalo'|'Tiger'|'Hare'|'Deer'|'Monkey'|'Mongoose'|'Lion';

const YONI_MAP: Array<{ animal: YoniAnimal; gender: 'M'|'F' }> = [
  { animal: 'Horse',    gender: 'M' }, // 0 Ashwini
  { animal: 'Elephant', gender: 'M' }, // 1 Bharani
  { animal: 'Goat',     gender: 'F' }, // 2 Krittika
  { animal: 'Serpent',  gender: 'M' }, // 3 Rohini
  { animal: 'Serpent',  gender: 'F' }, // 4 Mrigashira
  { animal: 'Dog',      gender: 'F' }, // 5 Ardra
  { animal: 'Cat',      gender: 'M' }, // 6 Punarvasu
  { animal: 'Goat',     gender: 'M' }, // 7 Pushya
  { animal: 'Cat',      gender: 'F' }, // 8 Ashlesha
  { animal: 'Rat',      gender: 'M' }, // 9 Magha
  { animal: 'Rat',      gender: 'F' }, // 10 Purva Phalguni
  { animal: 'Cow',      gender: 'M' }, // 11 Uttara Phalguni
  { animal: 'Buffalo',  gender: 'F' }, // 12 Hasta
  { animal: 'Tiger',    gender: 'F' }, // 13 Chitra
  { animal: 'Buffalo',  gender: 'M' }, // 14 Swati
  { animal: 'Tiger',    gender: 'M' }, // 15 Vishakha
  { animal: 'Hare',     gender: 'F' }, // 16 Anuradha
  { animal: 'Hare',     gender: 'M' }, // 17 Jyeshtha
  { animal: 'Dog',      gender: 'M' }, // 18 Mool
  { animal: 'Monkey',   gender: 'F' }, // 19 Purva Ashadha
  { animal: 'Mongoose', gender: 'M' }, // 20 Uttara Ashadha
  { animal: 'Monkey',   gender: 'M' }, // 21 Shravan
  { animal: 'Lion',     gender: 'F' }, // 22 Dhanishtha
  { animal: 'Horse',    gender: 'F' }, // 23 Shatabhisha
  { animal: 'Lion',     gender: 'M' }, // 24 Purva Bhadrapada
  { animal: 'Cow',      gender: 'F' }, // 25 Uttara Bhadrapada
  { animal: 'Elephant', gender: 'F' }, // 26 Revati
];

// Natural enemies (mutual): score 0; unfriendly: 1; neutral: 2; friendly: 3; same animal: 4
const YONI_ENEMY: Array<[YoniAnimal, YoniAnimal]> = [
  ['Dog', 'Hare'],
  ['Elephant', 'Lion'],
  ['Horse', 'Buffalo'],
  ['Rat', 'Cat'],
  ['Serpent', 'Mongoose'],
  ['Monkey', 'Tiger'],
  ['Cow', 'Tiger'],
  ['Goat', 'Monkey'],
  ['Dog', 'Deer'],
  ['Elephant', 'Cat'],
];

function yoniRelation(a: YoniAnimal, b: YoniAnimal): number {
  if (a === b) return 4;
  const isEnemy = YONI_ENEMY.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a)
  );
  if (isEnemy) return 0;
  return 2; // neutral otherwise (simplified)
}

function scoreYoni(boy: ChartData, girl: ChartData): KootScore {
  const bN = nakshatraFromLon(moon(boy).longitude);
  const gN = nakshatraFromLon(moon(girl).longitude);
  const bY = YONI_MAP[bN];
  const gY = YONI_MAP[gN];
  const score = yoniRelation(bY.animal, gY.animal);
  const gradeMap: Record<number, [string, string]> = {
    4: ['Same Yoni — Excellent', 'समान योनि — उत्कृष्ट'],
    3: ['Friendly Yoni', 'मित्र योनि'],
    2: ['Neutral Yoni', 'सम योनि'],
    1: ['Unfriendly Yoni', 'शत्रु योनि'],
    0: ['Hostile Yoni — Dosha', 'विरोधी योनि — दोष'],
  };
  const [gradeEn, gradeHi] = gradeMap[score] ?? ['Unknown', 'अज्ञात'];
  return {
    name: 'Yoni',
    nameHi: 'योनि',
    maxScore: 4,
    score,
    gradeEn,
    gradeHi,
    detail: `Boy Yoni: ${bY.animal} (${bY.gender}), Girl Yoni: ${gY.animal} (${gY.gender})`,
    detailHi: `वर योनि: ${bY.animal} (${bY.gender === 'M' ? 'पुरुष' : 'स्त्री'}), कन्या योनि: ${gY.animal} (${gY.gender === 'M' ? 'पुरुष' : 'स्त्री'})`,
    isCritical: false,
  };
}

/* ─────────────────────── 5. Graha Maitri (5 pts) ───────────────────────── */

const RASHI_LORD_MAP: Record<number, string> = {
  1:'Mars', 2:'Venus', 3:'Mercury', 4:'Moon', 5:'Sun', 6:'Mercury',
  7:'Venus', 8:'Mars', 9:'Jupiter', 10:'Saturn', 11:'Saturn', 12:'Jupiter',
};

// Planetary friendship: 2=best friend, 1=friend, 0=neutral, -1=enemy, -2=bitter enemy
const PLANET_FRIENDSHIP: Record<string, Record<string, number>> = {
  Sun:     { Sun:2, Moon:1, Mars:1, Mercury:-1, Jupiter:1, Venus:-1, Saturn:-1 },
  Moon:    { Sun:1, Moon:2, Mars:0, Mercury:1,  Jupiter:1, Venus:0,  Saturn:0  },
  Mars:    { Sun:1, Moon:1, Mars:2, Mercury:-1, Jupiter:1, Venus:0,  Saturn:-1 },
  Mercury: { Sun:1, Moon:0, Mars:0, Mercury:2,  Jupiter:0, Venus:1,  Saturn:1  },
  Jupiter: { Sun:1, Moon:1, Mars:1, Mercury:-1, Jupiter:2, Venus:-1, Saturn:-1 },
  Venus:   { Sun:-1,Moon:0, Mars:0, Mercury:1,  Jupiter:-1,Venus:2,  Saturn:1  },
  Saturn:  { Sun:-1,Moon:-1,Mars:-1,Mercury:1,  Jupiter:-1,Venus:1,  Saturn:2  },
};

function scoreGrahaMaitri(boy: ChartData, girl: ChartData): KootScore {
  const bLord = RASHI_LORD_MAP[moon(boy).rashi] ?? 'Moon';
  const gLord = RASHI_LORD_MAP[moon(girl).rashi] ?? 'Moon';
  const bgRel = PLANET_FRIENDSHIP[bLord]?.[gLord] ?? 0;
  const gbRel = PLANET_FRIENDSHIP[gLord]?.[bLord] ?? 0;
  const sum = bgRel + gbRel;
  let score = 0;
  if (sum >= 4) score = 5;
  else if (sum === 3) score = 4;
  else if (sum === 2) score = 3;
  else if (sum === 1) score = 2;
  else if (sum === 0) score = 1;
  else score = 0;
  const friendLabel = (r: number) =>
    r >= 2 ? 'Best Friend' : r === 1 ? 'Friend' : r === 0 ? 'Neutral' : r === -1 ? 'Enemy' : 'Bitter Enemy';
  return {
    name: 'Graha Maitri',
    nameHi: 'ग्रह मैत्री',
    maxScore: 5,
    score,
    gradeEn: score >= 4 ? 'Excellent' : score >= 2 ? 'Acceptable' : 'Poor',
    gradeHi: score >= 4 ? 'उत्कृष्ट' : score >= 2 ? 'स्वीकार्य' : 'कमज़ोर',
    detail: `${bLord}→${gLord}: ${friendLabel(bgRel)}, ${gLord}→${bLord}: ${friendLabel(gbRel)}`,
    detailHi: `${bLord}→${gLord}: ${friendLabel(bgRel)}, ${gLord}→${bLord}: ${friendLabel(gbRel)}`,
    isCritical: false,
  };
}

/* ─────────────────────────── 6. Gana (6 pts) ───────────────────────────── */

const GANA_MAP: ('Deva'|'Manav'|'Rakshasa')[] = [
  'Deva',    // 0 Ashwini
  'Manav',   // 1 Bharani
  'Rakshasa',// 2 Krittika
  'Manav',   // 3 Rohini
  'Deva',    // 4 Mrigashira
  'Manav',   // 5 Ardra
  'Deva',    // 6 Punarvasu
  'Deva',    // 7 Pushya
  'Rakshasa',// 8 Ashlesha
  'Rakshasa',// 9 Magha
  'Manav',   // 10 Purva Phalguni
  'Manav',   // 11 Uttara Phalguni
  'Deva',    // 12 Hasta
  'Rakshasa',// 13 Chitra
  'Deva',    // 14 Swati
  'Rakshasa',// 15 Vishakha
  'Deva',    // 16 Anuradha
  'Rakshasa',// 17 Jyeshtha
  'Rakshasa',// 18 Mool
  'Manav',   // 19 Purva Ashadha
  'Manav',   // 20 Uttara Ashadha
  'Deva',    // 21 Shravan
  'Rakshasa',// 22 Dhanishtha
  'Manav',   // 23 Shatabhisha
  'Manav',   // 24 Purva Bhadrapada
  'Deva',    // 25 Uttara Bhadrapada
  'Deva',    // 26 Revati
];

const GANA_SCORE: Record<string, Record<string, number>> = {
  Deva:     { Deva: 6, Manav: 5, Rakshasa: 1 },
  Manav:    { Deva: 5, Manav: 6, Rakshasa: 0 },
  Rakshasa: { Deva: 0, Manav: 0, Rakshasa: 6 },
};

function scoreGana(boy: ChartData, girl: ChartData): KootScore {
  const bN = nakshatraFromLon(moon(boy).longitude);
  const gN = nakshatraFromLon(moon(girl).longitude);
  const bG = GANA_MAP[bN];
  const gG = GANA_MAP[gN];
  const score = GANA_SCORE[bG]?.[gG] ?? 0;
  return {
    name: 'Gana',
    nameHi: 'गण',
    maxScore: 6,
    score,
    gradeEn: score === 6 ? 'Same Gana' : score === 5 ? 'Compatible' : score === 1 ? 'Marginal' : 'Incompatible',
    gradeHi: score === 6 ? 'समान गण' : score === 5 ? 'अनुकूल' : score === 1 ? 'सीमांत' : 'असंगत',
    detail: `Boy Gana: ${bG}, Girl Gana: ${gG}`,
    detailHi: `वर गण: ${bG === 'Deva' ? 'देव' : bG === 'Manav' ? 'मानव' : 'राक्षस'}, कन्या गण: ${gG === 'Deva' ? 'देव' : gG === 'Manav' ? 'मानव' : 'राक्षस'}`,
    isCritical: false,
  };
}

/* ─────────────────────────── 7. Bhakuta (7 pts) ────────────────────────── */

function scoreBhakuta(boy: ChartData, girl: ChartData): KootScore {
  const bR = moon(boy).rashi;
  const gR = moon(girl).rashi;
  // Count from girl to boy (1–12), and boy to girl (1–12)
  const gtb = ((bR - gR + 12) % 12) + 1; // girl→boy
  const btg = ((gR - bR + 12) % 12) + 1; // boy→girl
  // Inauspicious patterns: 6-8, 2-12, 5-9
  const pairs = [[gtb, btg], [btg, gtb]];
  const isBad = pairs.some(([a, b]) =>
    (a === 6 && b === 8) || (a === 8 && b === 6) ||
    (a === 2 && b === 12) || (a === 12 && b === 2) ||
    (a === 5 && b === 9) || (a === 9 && b === 5)
  );
  const score = isBad ? 0 : 7;
  return {
    name: 'Bhakuta',
    nameHi: 'भकूट',
    maxScore: 7,
    score,
    gradeEn: score === 7 ? 'Auspicious' : 'Bhakuta Dosha',
    gradeHi: score === 7 ? 'शुभ' : 'भकूट दोष',
    detail: score === 0
      ? `Rashi pattern ${gtb}-${btg} (Girl→Boy / Boy→Girl) creates Bhakuta Dosha`
      : `Rashi pattern ${gtb}-${btg} is auspicious`,
    detailHi: score === 0
      ? `राशि क्रम ${gtb}-${btg} भकूट दोष उत्पन्न करता है`
      : `राशि क्रम ${gtb}-${btg} शुभ है`,
    isCritical: score === 0,
  };
}

/* ─────────────────────────── 8. Nadi (8 pts) ───────────────────────────── */

const NADI_MAP: ('Aadi'|'Madhya'|'Antya')[] = [
  'Aadi',   // 0 Ashwini
  'Madhya', // 1 Bharani
  'Antya',  // 2 Krittika
  'Antya',  // 3 Rohini
  'Madhya', // 4 Mrigashira
  'Aadi',   // 5 Ardra
  'Aadi',   // 6 Punarvasu
  'Madhya', // 7 Pushya
  'Antya',  // 8 Ashlesha
  'Antya',  // 9 Magha
  'Madhya', // 10 Purva Phalguni
  'Aadi',   // 11 Uttara Phalguni
  'Aadi',   // 12 Hasta
  'Madhya', // 13 Chitra
  'Antya',  // 14 Swati
  'Antya',  // 15 Vishakha
  'Madhya', // 16 Anuradha
  'Aadi',   // 17 Jyeshtha
  'Aadi',   // 18 Mool
  'Madhya', // 19 Purva Ashadha
  'Antya',  // 20 Uttara Ashadha
  'Antya',  // 21 Shravan
  'Madhya', // 22 Dhanishtha
  'Aadi',   // 23 Shatabhisha
  'Aadi',   // 24 Purva Bhadrapada
  'Madhya', // 25 Uttara Bhadrapada
  'Antya',  // 26 Revati
];

function scoreNadi(boy: ChartData, girl: ChartData): KootScore {
  const bN = nakshatraFromLon(moon(boy).longitude);
  const gN = nakshatraFromLon(moon(girl).longitude);
  const bNadi = NADI_MAP[bN];
  const gNadi = NADI_MAP[gN];
  const sameNadi = bNadi === gNadi;
  const score = sameNadi ? 0 : 8;
  return {
    name: 'Nadi',
    nameHi: 'नाड़ी',
    maxScore: 8,
    score,
    gradeEn: sameNadi ? 'Nadi Dosha — Critical' : 'Excellent',
    gradeHi: sameNadi ? 'नाड़ी दोष — अत्यंत गंभीर' : 'उत्कृष्ट',
    detail: sameNadi
      ? `Both have ${bNadi} Nadi — Nadi Dosha present (health/progeny concern)`
      : `Boy: ${bNadi} Nadi, Girl: ${gNadi} Nadi — compatible`,
    detailHi: sameNadi
      ? `दोनों की ${bNadi === 'Aadi' ? 'आदि' : bNadi === 'Madhya' ? 'मध्य' : 'अंत्य'} नाड़ी — नाड़ी दोष (स्वास्थ्य/संतान चिंता)`
      : `वर: ${bNadi} नाड़ी, कन्या: ${gNadi} नाड़ी — अनुकूल`,
    isCritical: sameNadi,
  };
}

/* ──────────────────────── Main export function ──────────────────────────── */

export function analyzeAshtakoot(
  boyChart: ChartData,
  girlChart: ChartData
): AshtakootResult {
  const koots = [
    scoreVarna(boyChart, girlChart),
    scoreVashya(boyChart, girlChart),
    scoreTara(boyChart, girlChart),
    scoreYoni(boyChart, girlChart),
    scoreGrahaMaitri(boyChart, girlChart),
    scoreGana(boyChart, girlChart),
    scoreBhakuta(boyChart, girlChart),
    scoreNadi(boyChart, girlChart),
  ];

  const total = koots.reduce((s, k) => s + k.score, 0);
  const percentage = Math.round((total / 36) * 100);
  const nadiDosha = koots[7].isCritical;
  const bhakutaDosha = koots[6].isCritical;

  let verdictColor: AshtakootResult['verdictColor'];
  let verdict: string;
  let verdictHi: string;

  if (nadiDosha && bhakutaDosha) {
    verdictColor = 'rejected';
    verdict = 'Not Recommended — Nadi + Bhakuta Dosha';
    verdictHi = 'अनुशंसित नहीं — नाड़ी + भकूट दोष';
  } else if (nadiDosha) {
    verdictColor = 'poor';
    verdict = 'Nadi Dosha Present — Expert consultation essential';
    verdictHi = 'नाड़ी दोष विद्यमान — विशेषज्ञ परामर्श अत्यावश्यक';
  } else if (bhakutaDosha) {
    verdictColor = 'poor';
    verdict = 'Bhakuta Dosha Present — Remedies recommended';
    verdictHi = 'भकूट दोष विद्यमान — उपाय अनुशंसित';
  } else if (total >= 28) {
    verdictColor = 'excellent';
    verdict = `Excellent Match — ${total}/36 (${percentage}%)`;
    verdictHi = `उत्कृष्ट मिलान — ${total}/36 (${percentage}%)`;
  } else if (total >= 21) {
    verdictColor = 'good';
    verdict = `Good Match — ${total}/36 (${percentage}%)`;
    verdictHi = `अच्छा मिलान — ${total}/36 (${percentage}%)`;
  } else if (total >= 18) {
    verdictColor = 'average';
    verdict = `Average Match — ${total}/36 (${percentage}%) — Proceed with care`;
    verdictHi = `सामान्य मिलान — ${total}/36 (${percentage}%) — सावधानी से आगे बढ़ें`;
  } else {
    verdictColor = 'poor';
    verdict = `Below Average — ${total}/36 (${percentage}%) — Detailed chart analysis needed`;
    verdictHi = `औसत से कम — ${total}/36 (${percentage}%) — विस्तृत कुण्डली विश्लेषण आवश्यक`;
  }

  const doshaNote = [
    nadiDosha ? 'Nadi Dosha: health/progeny risk. Cancelled if both have same nakshatra or both are Brahmins.' : '',
    bhakutaDosha ? 'Bhakuta Dosha: financial/emotional tensions. Cancelled if Graha Maitri and Nadi scores are high.' : '',
  ].filter(Boolean).join(' | ') || 'No major doshas detected.';

  const doshaNoteHi = [
    nadiDosha ? 'नाड़ी दोष: स्वास्थ्य/संतान जोखिम। यदि दोनों का नक्षत्र एक हो या ब्राह्मण हों तो निरस्त।' : '',
    bhakutaDosha ? 'भकूट दोष: आर्थिक/भावनात्मक तनाव। ग्रह मैत्री और नाड़ी स्कोर अधिक हो तो निरस्त।' : '',
  ].filter(Boolean).join(' | ') || 'कोई प्रमुख दोष नहीं।';

  const bN = nakshatraFromLon(moon(boyChart).longitude);
  const gN = nakshatraFromLon(moon(girlChart).longitude);

  return {
    koots,
    total,
    maxTotal: 36,
    percentage,
    verdict,
    verdictHi,
    verdictColor,
    nadiDosha,
    bhakutaDosha,
    doshaNote,
    doshaNoteHi,
    boyNakshatra: NAKSHATRA_EN[bN] ?? 'Unknown',
    boyNakshatraHi: NAKSHATRA_HI[bN] ?? 'अज्ञात',
    girlNakshatra: NAKSHATRA_EN[gN] ?? 'Unknown',
    girlNakshatraHi: NAKSHATRA_HI[gN] ?? 'अज्ञात',
    boyRashi: RASHI_EN[moon(boyChart).rashi] ?? '',
    girlRashi: RASHI_EN[moon(girlChart).rashi] ?? '',
  };
}
