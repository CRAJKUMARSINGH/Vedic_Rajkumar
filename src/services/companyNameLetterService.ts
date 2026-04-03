/**
 * Company Name Letter Suggestion Service
 * Suggests auspicious Hindi first letters for a company name
 * based on partners' names (name-only mode) or birth details (full mode)
 *
 * Method:
 *  - Name-only: Chaldean numerology on each partner's name → combined destiny number
 *  - With birth: Life Path number from DOB added to name number for stronger result
 *  - Combined number maps to ruling planet → planet's Hindi aksharas (syllables)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PartnerInput {
  name: string;
  dob?: string;   // YYYY-MM-DD, optional
  tob?: string;   // HH:MM, optional
  place?: string; // optional
}

export interface CompanyLetterResult {
  combinedNumber: number;
  rulingPlanet: { en: string; hi: string };
  suggestedLetters: Array<{
    letter: string;       // Hindi akshara
    romanized: string;    // Roman transliteration
    reason: { en: string; hi: string };
    strength: number;     // 0-100
  }>;
  partnerNumbers: Array<{
    name: string;
    nameNumber: number;
    lifePathNumber?: number;
    effectiveNumber: number;
  }>;
  analysis: { en: string; hi: string };
  tip: { en: string; hi: string };
}

// ─── Chaldean letter values ───────────────────────────────────────────────────

const CHALDEAN: Record<string, number> = {
  A:1, I:1, J:1, Q:1, Y:1,
  B:2, K:2, R:2,
  C:3, G:3, L:3, S:3,
  D:4, M:4, T:4,
  E:5, H:5, N:5, X:5,
  U:6, V:6, W:6,
  O:7, Z:7,
  F:8, P:8,
};

function chaldeanSum(name: string): number {
  return name.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((s, c) => s + (CHALDEAN[c] ?? 0), 0);
}

function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + +d, 0);
    if (n === 11 || n === 22 || n === 33) return n;
  }
  return n;
}

function lifePathFromDob(dob: string): number {
  const [y, m, d] = dob.split('-').map(Number);
  if (!y || !m || !d) return 0;
  return reduce(reduce(d) + reduce(m) + reduce(y));
}

// ─── Planet → Hindi aksharas mapping ─────────────────────────────────────────
// Based on traditional Vedic sound-planet associations

const PLANET_LETTERS: Record<string, {
  en: string; hi: string;
  letters: Array<{ letter: string; romanized: string; strength: number }>;
}> = {
  sun: {
    en: 'Sun (Surya)', hi: 'सूर्य',
    letters: [
      { letter: 'अ', romanized: 'A', strength: 95 },
      { letter: 'उ', romanized: 'U', strength: 88 },
    ],
  },
  moon: {
    en: 'Moon (Chandra)', hi: 'चंद्र',
    letters: [
      { letter: 'क', romanized: 'Ka', strength: 92 },
      { letter: 'ख', romanized: 'Kha', strength: 85 },
    ],
  },
  jupiter: {
    en: 'Jupiter (Guru)', hi: 'गुरु',
    letters: [
      { letter: 'ग', romanized: 'Ga', strength: 96 },
      { letter: 'घ', romanized: 'Gha', strength: 90 },
    ],
  },
  rahu: {
    en: 'Rahu', hi: 'राहु',
    letters: [
      { letter: 'र', romanized: 'Ra', strength: 82 },
      { letter: 'ल', romanized: 'La', strength: 78 },
    ],
  },
  mercury: {
    en: 'Mercury (Budh)', hi: 'बुध',
    letters: [
      { letter: 'च', romanized: 'Cha', strength: 91 },
      { letter: 'छ', romanized: 'Chha', strength: 84 },
    ],
  },
  venus: {
    en: 'Venus (Shukra)', hi: 'शुक्र',
    letters: [
      { letter: 'ट', romanized: 'Ta', strength: 89 },
      { letter: 'ठ', romanized: 'Tha', strength: 83 },
    ],
  },
  ketu: {
    en: 'Ketu', hi: 'केतु',
    letters: [
      { letter: 'प', romanized: 'Pa', strength: 80 },
      { letter: 'फ', romanized: 'Pha', strength: 75 },
    ],
  },
  saturn: {
    en: 'Saturn (Shani)', hi: 'शनि',
    letters: [
      { letter: 'श', romanized: 'Sha', strength: 86 },
      { letter: 'स', romanized: 'Sa', strength: 81 },
    ],
  },
  mars: {
    en: 'Mars (Mangal)', hi: 'मंगल',
    letters: [
      { letter: 'म', romanized: 'Ma', strength: 90 },
      { letter: 'न', romanized: 'Na', strength: 84 },
    ],
  },
};

// Number → ruling planet (Chaldean / Vedic mapping)
const NUMBER_TO_PLANET: Record<number, keyof typeof PLANET_LETTERS> = {
  1: 'sun',
  2: 'moon',
  3: 'jupiter',
  4: 'rahu',
  5: 'mercury',
  6: 'venus',
  7: 'ketu',
  8: 'saturn',
  9: 'mars',
  11: 'moon',
  22: 'saturn',
  33: 'jupiter',
};

const PLANET_ANALYSIS: Record<string, { en: string; hi: string }> = {
  sun:     { en: 'Sun-ruled names bring authority, leadership and recognition to the company.', hi: 'सूर्य-शासित नाम कंपनी को अधिकार, नेतृत्व और प्रसिद्धि देते हैं।' },
  moon:    { en: 'Moon-ruled names attract public goodwill, adaptability and steady growth.', hi: 'चंद्र-शासित नाम जनता का विश्वास, अनुकूलनशीलता और स्थिर विकास लाते हैं।' },
  jupiter: { en: 'Jupiter-ruled names bring wisdom, expansion, prosperity and good fortune.', hi: 'गुरु-शासित नाम ज्ञान, विस्तार, समृद्धि और सौभाग्य लाते हैं।' },
  rahu:    { en: 'Rahu-ruled names suit innovative, technology-driven or unconventional ventures.', hi: 'राहु-शासित नाम नवाचार, प्रौद्योगिकी या अपरंपरागत व्यवसायों के लिए उपयुक्त हैं।' },
  mercury: { en: 'Mercury-ruled names excel in communication, trade, IT and intellectual fields.', hi: 'बुध-शासित नाम संचार, व्यापार, आईटी और बौद्धिक क्षेत्रों में उत्कृष्ट हैं।' },
  venus:   { en: 'Venus-ruled names thrive in luxury, beauty, arts, hospitality and finance.', hi: 'शुक्र-शासित नाम विलासिता, सौंदर्य, कला, आतिथ्य और वित्त में फलते-फूलते हैं।' },
  ketu:    { en: 'Ketu-ruled names suit spiritual, research, healing or niche technical businesses.', hi: 'केतु-शासित नाम आध्यात्मिक, शोध, उपचार या विशेष तकनीकी व्यवसायों के लिए उपयुक्त हैं।' },
  saturn:  { en: 'Saturn-ruled names bring discipline, endurance and long-term stability.', hi: 'शनि-शासित नाम अनुशासन, धैर्य और दीर्घकालिक स्थिरता लाते हैं।' },
  mars:    { en: 'Mars-ruled names bring energy, courage and competitive strength to the company.', hi: 'मंगल-शासित नाम कंपनी को ऊर्जा, साहस और प्रतिस्पर्धात्मक शक्ति देते हैं।' },
};

const PLANET_TIP: Record<string, { en: string; hi: string }> = {
  sun:     { en: 'Register the company on a Sunday or during Sun hora for best results.', hi: 'सर्वोत्तम परिणाम के लिए रविवार या सूर्य होरा में कंपनी पंजीकृत करें।' },
  moon:    { en: 'Monday or Moon hora is ideal for company registration.', hi: 'सोमवार या चंद्र होरा कंपनी पंजीकरण के लिए आदर्श है।' },
  jupiter: { en: 'Thursday or Jupiter hora is highly auspicious for new ventures.', hi: 'गुरुवार या गुरु होरा नए उद्यमों के लिए अत्यंत शुभ है।' },
  rahu:    { en: 'Choose a Rahu Kaal-free muhurat for registration to avoid obstacles.', hi: 'बाधाओं से बचने के लिए राहु काल-मुक्त मुहूर्त में पंजीकरण करें।' },
  mercury: { en: 'Wednesday or Mercury hora suits intellectual and trade businesses.', hi: 'बुधवार या बुध होरा बौद्धिक और व्यापारिक व्यवसायों के लिए उपयुक्त है।' },
  venus:   { en: 'Friday or Venus hora is ideal for luxury and creative businesses.', hi: 'शुक्रवार या शुक्र होरा विलासिता और रचनात्मक व्यवसायों के लिए आदर्श है।' },
  ketu:    { en: 'Consult an astrologer for a Ketu-friendly muhurat for niche businesses.', hi: 'विशेष व्यवसायों के लिए केतु-अनुकूल मुहूर्त हेतु ज्योतिषी से परामर्श करें।' },
  saturn:  { en: 'Saturday or Saturn hora suits long-term infrastructure businesses.', hi: 'शनिवार या शनि होरा दीर्घकालिक बुनियादी ढांचे के व्यवसायों के लिए उपयुक्त है।' },
  mars:    { en: 'Tuesday or Mars hora is ideal for energy, sports or construction businesses.', hi: 'मंगलवार या मंगल होरा ऊर्जा, खेल या निर्माण व्यवसायों के लिए आदर्श है।' },
};

// ─── Main export ──────────────────────────────────────────────────────────────

export function suggestCompanyLetters(partners: PartnerInput[]): CompanyLetterResult {
  if (!partners.length) throw new Error('At least one partner required');

  const partnerNumbers = partners.map(p => {
    const nameNumber = reduce(chaldeanSum(p.name));
    const lifePathNumber = p.dob ? lifePathFromDob(p.dob) : undefined;
    const effectiveNumber = lifePathNumber
      ? reduce(nameNumber + lifePathNumber)
      : nameNumber;
    return { name: p.name, nameNumber, lifePathNumber, effectiveNumber };
  });

  // Average effective numbers, then reduce
  const sum = partnerNumbers.reduce((s, p) => s + p.effectiveNumber, 0);
  const combinedNumber = reduce(Math.round(sum / partnerNumbers.length));

  const planetKey = NUMBER_TO_PLANET[combinedNumber] ?? 'jupiter';
  const planet = PLANET_LETTERS[planetKey];

  const suggestedLetters = planet.letters.map(l => ({
    ...l,
    reason: {
      en: `Ruled by ${planet.en} — brings ${PLANET_ANALYSIS[planetKey].en.split(' ').slice(2, 6).join(' ')}...`,
      hi: `${planet.hi} द्वारा शासित — ${PLANET_ANALYSIS[planetKey].hi.split(' ').slice(0, 5).join(' ')}...`,
    },
  }));

  return {
    combinedNumber,
    rulingPlanet: { en: planet.en, hi: planet.hi },
    suggestedLetters,
    partnerNumbers,
    analysis: PLANET_ANALYSIS[planetKey],
    tip: PLANET_TIP[planetKey],
  };
}
