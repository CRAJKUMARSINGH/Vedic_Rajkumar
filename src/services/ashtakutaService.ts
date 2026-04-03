/**
 * Ashtakuta Service - Kundali Milan (Marriage Compatibility)
 * Implements the traditional 8-category compatibility system (36 points total)
 */

import { getNakshatraInfo } from './nakshatraService';
import { getMoonSign } from './rashiService';

// ==================== ASHTAKUTA CATEGORIES ====================

export interface AshtakutaResult {
  category: string;
  points: number;
  maxPoints: number;
  percentage: number;
  compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  description: { en: string; hi: string };
  details?: any;
}

export interface CompatibilityReport {
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  overallCompatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  categories: AshtakutaResult[];
  recommendations: { en: string[]; hi: string[] };
  dosha?: { present: boolean; type: string; remedies: string[] };
}

// ==================== VARNA MATCHING (1 POINT) ====================

export enum Varna {
  BRAHMIN = 'Brahmin',
  KSHATRIYA = 'Kshatriya', 
  VAISHYA = 'Vaishya',
  SHUDRA = 'Shudra'
}

// Nakshatra to Varna mapping
const NAKSHATRA_VARNA: Record<string, Varna> = {
  // Brahmin (Spiritual/Intellectual)
  'Krittika': Varna.BRAHMIN,
  'Rohini': Varna.BRAHMIN,
  'Mrigashirsha': Varna.BRAHMIN,
  'Punarvasu': Varna.BRAHMIN,
  'Pushya': Varna.BRAHMIN,
  'Ashlesha': Varna.BRAHMIN,
  'Magha': Varna.BRAHMIN,
  'Purva Phalguni': Varna.BRAHMIN,
  'Uttara Phalguni': Varna.BRAHMIN,
  
  // Kshatriya (Warrior/Leader)
  'Bharani': Varna.KSHATRIYA,
  'Ardra': Varna.KSHATRIYA,
  'Hasta': Varna.KSHATRIYA,
  'Chitra': Varna.KSHATRIYA,
  'Swati': Varna.KSHATRIYA,
  'Anuradha': Varna.KSHATRIYA,
  'Jyeshtha': Varna.KSHATRIYA,
  'Mula': Varna.KSHATRIYA,
  
  // Vaishya (Merchant/Business)
  'Ashwini': Varna.VAISHYA,
  'Vishakha': Varna.VAISHYA,
  'Purva Ashadha': Varna.VAISHYA,
  'Uttara Ashadha': Varna.VAISHYA,
  'Shravana': Varna.VAISHYA,
  'Dhanishta': Varna.VAISHYA,
  
  // Shudra (Service/Labor)
  'Shatabhisha': Varna.SHUDRA,
  'Purva Bhadrapada': Varna.SHUDRA,
  'Uttara Bhadrapada': Varna.SHUDRA,
  'Revati': Varna.SHUDRA
};

export function calculateVarnaMatching(
  maleNakshatra: string,
  femaleNakshatra: string
): AshtakutaResult {
  const maleVarna = NAKSHATRA_VARNA[maleNakshatra];
  const femaleVarna = NAKSHATRA_VARNA[femaleNakshatra];
  
  // Varna hierarchy: Brahmin > Kshatriya > Vaishya > Shudra
  const varnaOrder = [Varna.BRAHMIN, Varna.KSHATRIYA, Varna.VAISHYA, Varna.SHUDRA];
  const maleIndex = varnaOrder.indexOf(maleVarna);
  const femaleIndex = varnaOrder.indexOf(femaleVarna);
  
  // Male's varna should be equal or higher than female's for 1 point
  const points = maleIndex <= femaleIndex ? 1 : 0;
  const percentage = (points / 1) * 100;
  
  let compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  if (points === 1) compatibility = 'Excellent';
  else compatibility = 'Poor';
  
  return {
    category: 'Varna',
    points,
    maxPoints: 1,
    percentage,
    compatibility,
    description: {
      en: points === 1 
        ? `Varna compatibility is good. Male (${maleVarna}) and Female (${femaleVarna}) have compatible social nature.`
        : `Varna mismatch detected. Male (${maleVarna}) and Female (${femaleVarna}) may have social compatibility issues.`,
      hi: points === 1
        ? `वर्ण मेल अच्छा है। पुरुष (${maleVarna}) और स्त्री (${femaleVarna}) की सामाजिक प्रकृति अनुकूल है।`
        : `वर्ण मेल नहीं है। पुरुष (${maleVarna}) और स्त्री (${femaleVarna}) में सामाजिक अनुकूलता की समस्या हो सकती है।`
    },
    details: { maleVarna, femaleVarna }
  };
}

// ==================== VASHYA MATCHING (2 POINTS) ====================

export enum Vashya {
  CHATUSHPADA = 'Chatushpada', // Quadruped
  DWIPADA = 'Dwipada',         // Biped
  JALACHARA = 'Jalachara',     // Aquatic
  VANACHARA = 'Vanachara',     // Wild
  KEETA = 'Keeta'              // Insect
}

// Rashi to Vashya mapping
const RASHI_VASHYA: Record<number, Vashya> = {
  0: Vashya.CHATUSHPADA,  // Aries
  1: Vashya.CHATUSHPADA,  // Taurus
  2: Vashya.DWIPADA,      // Gemini
  3: Vashya.JALACHARA,    // Cancer
  4: Vashya.VANACHARA,    // Leo
  5: Vashya.DWIPADA,      // Virgo
  6: Vashya.DWIPADA,      // Libra
  7: Vashya.KEETA,        // Scorpio
  8: Vashya.CHATUSHPADA,  // Sagittarius
  9: Vashya.CHATUSHPADA,  // Capricorn
  10: Vashya.DWIPADA,     // Aquarius
  11: Vashya.JALACHARA    // Pisces
};

// Vashya compatibility matrix
const VASHYA_COMPATIBILITY: Record<Vashya, Vashya[]> = {
  [Vashya.CHATUSHPADA]: [Vashya.CHATUSHPADA, Vashya.VANACHARA],
  [Vashya.DWIPADA]: [Vashya.DWIPADA, Vashya.VANACHARA, Vashya.JALACHARA],
  [Vashya.JALACHARA]: [Vashya.JALACHARA, Vashya.DWIPADA],
  [Vashya.VANACHARA]: [Vashya.VANACHARA, Vashya.CHATUSHPADA, Vashya.DWIPADA],
  [Vashya.KEETA]: [Vashya.KEETA]
};

export function calculateVashyaMatching(
  maleRashi: number,
  femaleRashi: number
): AshtakutaResult {
  const maleVashya = RASHI_VASHYA[maleRashi];
  const femaleVashya = RASHI_VASHYA[femaleRashi];
  
  // Check mutual compatibility
  const maleCompatible = VASHYA_COMPATIBILITY[maleVashya].includes(femaleVashya);
  const femaleCompatible = VASHYA_COMPATIBILITY[femaleVashya].includes(maleVashya);
  
  let points = 0;
  if (maleCompatible && femaleCompatible) points = 2;
  else if (maleCompatible || femaleCompatible) points = 1;
  
  const percentage = (points / 2) * 100;
  
  let compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  if (points === 2) compatibility = 'Excellent';
  else if (points === 1) compatibility = 'Good';
  else compatibility = 'Poor';
  
  return {
    category: 'Vashya',
    points,
    maxPoints: 2,
    percentage,
    compatibility,
    description: {
      en: `Vashya compatibility: ${points}/2 points. Male (${maleVashya}) and Female (${femaleVashya}) ${points > 0 ? 'have good' : 'lack'} mutual attraction and control.`,
      hi: `वश्य मेल: ${points}/2 अंक। पुरुष (${maleVashya}) और स्त्री (${femaleVashya}) में ${points > 0 ? 'अच्छा' : 'कमी है'} पारस्परिक आकर्षण और नियंत्रण।`
    },
    details: { maleVashya, femaleVashya, maleCompatible, femaleCompatible }
  };
}

// ==================== TARA MATCHING (3 POINTS) ====================

// Nakshatra numbers (1-27)
const NAKSHATRA_NUMBERS: Record<string, number> = {
  'Ashwini': 1, 'Bharani': 2, 'Krittika': 3, 'Rohini': 4, 'Mrigashirsha': 5,
  'Ardra': 6, 'Punarvasu': 7, 'Pushya': 8, 'Ashlesha': 9, 'Magha': 10,
  'Purva Phalguni': 11, 'Uttara Phalguni': 12, 'Hasta': 13, 'Chitra': 14,
  'Swati': 15, 'Vishakha': 16, 'Anuradha': 17, 'Jyeshtha': 18, 'Mula': 19,
  'Purva Ashadha': 20, 'Uttara Ashadha': 21, 'Shravana': 22, 'Dhanishta': 23,
  'Shatabhisha': 24, 'Purva Bhadrapada': 25, 'Uttara Bhadrapada': 26, 'Revati': 27
};

export function calculateTaraMatching(
  maleNakshatra: string,
  femaleNakshatra: string
): AshtakutaResult {
  const maleNumber = NAKSHATRA_NUMBERS[maleNakshatra];
  const femaleNumber = NAKSHATRA_NUMBERS[femaleNakshatra];
  
  // Calculate Tara (count from female's nakshatra to male's)
  let tara = ((maleNumber - femaleNumber + 27) % 27);
  if (tara === 0) tara = 27;
  
  // Tara classification (1-9 cycle)
  const taraType = ((tara - 1) % 9) + 1;
  
  // Favorable Taras: 1, 3, 5, 7 (Janma, Sampat, Kshema, Sadhana)
  const favorableTaras = [1, 3, 5, 7];
  const isFavorable = favorableTaras.includes(taraType);
  
  const points = isFavorable ? 3 : 0;
  const percentage = (points / 3) * 100;
  
  let compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  if (points === 3) compatibility = 'Excellent';
  else compatibility = 'Poor';
  
  const taraNames = ['', 'Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhana', 'Vadha', 'Mitra', 'Param Mitra'];
  
  return {
    category: 'Tara',
    points,
    maxPoints: 3,
    percentage,
    compatibility,
    description: {
      en: `Tara matching: ${points}/3 points. Birth star compatibility shows ${taraNames[taraType]} Tara (${isFavorable ? 'favorable' : 'unfavorable'}).`,
      hi: `तारा मेल: ${points}/3 अंक। जन्म नक्षत्र अनुकूलता ${taraNames[taraType]} तारा दिखाती है (${isFavorable ? 'अनुकूल' : 'प्रतिकूल'})।`
    },
    details: { maleNumber, femaleNumber, tara, taraType, taraName: taraNames[taraType] }
  };
}

// ==================== YONI MATCHING (4 POINTS) ====================

export enum YoniAnimal {
  HORSE = 'Horse',
  ELEPHANT = 'Elephant', 
  GOAT = 'Goat',
  SERPENT = 'Serpent',
  DOG = 'Dog',
  CAT = 'Cat',
  RAT = 'Rat',
  COW = 'Cow',
  BUFFALO = 'Buffalo',
  TIGER = 'Tiger',
  DEER = 'Deer',
  MONKEY = 'Monkey',
  LION = 'Lion',
  MONGOOSE = 'Mongoose'
}

// Nakshatra to Yoni mapping
const NAKSHATRA_YONI: Record<string, YoniAnimal> = {
  'Ashwini': YoniAnimal.HORSE,
  'Bharani': YoniAnimal.ELEPHANT,
  'Krittika': YoniAnimal.GOAT,
  'Rohini': YoniAnimal.SERPENT,
  'Mrigashirsha': YoniAnimal.SERPENT,
  'Ardra': YoniAnimal.DOG,
  'Punarvasu': YoniAnimal.CAT,
  'Pushya': YoniAnimal.GOAT,
  'Ashlesha': YoniAnimal.CAT,
  'Magha': YoniAnimal.RAT,
  'Purva Phalguni': YoniAnimal.RAT,
  'Uttara Phalguni': YoniAnimal.COW,
  'Hasta': YoniAnimal.BUFFALO,
  'Chitra': YoniAnimal.TIGER,
  'Swati': YoniAnimal.BUFFALO,
  'Vishakha': YoniAnimal.TIGER,
  'Anuradha': YoniAnimal.DEER,
  'Jyeshtha': YoniAnimal.DEER,
  'Mula': YoniAnimal.DOG,
  'Purva Ashadha': YoniAnimal.MONKEY,
  'Uttara Ashadha': YoniAnimal.MONGOOSE,
  'Shravana': YoniAnimal.MONKEY,
  'Dhanishta': YoniAnimal.LION,
  'Shatabhisha': YoniAnimal.HORSE,
  'Purva Bhadrapada': YoniAnimal.LION,
  'Uttara Bhadrapada': YoniAnimal.COW,
  'Revati': YoniAnimal.ELEPHANT
};

// Yoni compatibility scoring
const YONI_COMPATIBILITY: Record<YoniAnimal, Record<YoniAnimal, number>> = {
  [YoniAnimal.HORSE]: {
    [YoniAnimal.HORSE]: 4, [YoniAnimal.ELEPHANT]: 2, [YoniAnimal.GOAT]: 2,
    [YoniAnimal.SERPENT]: 3, [YoniAnimal.DOG]: 2, [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 2, [YoniAnimal.COW]: 3, [YoniAnimal.BUFFALO]: 0,
    [YoniAnimal.TIGER]: 1, [YoniAnimal.DEER]: 2, [YoniAnimal.MONKEY]: 3,
    [YoniAnimal.LION]: 1, [YoniAnimal.MONGOOSE]: 2
  },
  [YoniAnimal.ELEPHANT]: {
    [YoniAnimal.HORSE]: 2, [YoniAnimal.ELEPHANT]: 4, [YoniAnimal.GOAT]: 3,
    [YoniAnimal.SERPENT]: 3, [YoniAnimal.DOG]: 2, [YoniAnimal.CAT]: 2,
    [YoniAnimal.RAT]: 2, [YoniAnimal.COW]: 2, [YoniAnimal.BUFFALO]: 3,
    [YoniAnimal.TIGER]: 2, [YoniAnimal.DEER]: 2, [YoniAnimal.MONKEY]: 3,
    [YoniAnimal.LION]: 0, [YoniAnimal.MONGOOSE]: 2
  },
  // Add more mappings as needed - simplified for now
};

export function calculateYoniMatching(
  maleNakshatra: string,
  femaleNakshatra: string
): AshtakutaResult {
  const maleYoni = NAKSHATRA_YONI[maleNakshatra];
  const femaleYoni = NAKSHATRA_YONI[femaleNakshatra];
  
  // Get compatibility score (0-4)
  let points = 0;
  if (YONI_COMPATIBILITY[maleYoni] && YONI_COMPATIBILITY[maleYoni][femaleYoni] !== undefined) {
    points = YONI_COMPATIBILITY[maleYoni][femaleYoni];
  } else {
    // Default scoring for missing combinations
    if (maleYoni === femaleYoni) points = 4;
    else points = 2; // Average compatibility
  }
  
  const percentage = (points / 4) * 100;
  
  let compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  if (points >= 3) compatibility = 'Excellent';
  else if (points === 2) compatibility = 'Good';
  else if (points === 1) compatibility = 'Average';
  else compatibility = 'Poor';
  
  return {
    category: 'Yoni',
    points,
    maxPoints: 4,
    percentage,
    compatibility,
    description: {
      en: `Yoni matching: ${points}/4 points. Sexual and physical compatibility between ${maleYoni} and ${femaleYoni} is ${compatibility.toLowerCase()}.`,
      hi: `योनि मेल: ${points}/4 अंक। ${maleYoni} और ${femaleYoni} के बीच यौन और शारीरिक अनुकूलता ${compatibility === 'Excellent' ? 'उत्कृष्ट' : compatibility === 'Good' ? 'अच्छी' : compatibility === 'Average' ? 'औसत' : 'खराब'} है।`
    },
    details: { maleYoni, femaleYoni }
  };
}

// ==================== GRAHA MAITRI MATCHING (5 POINTS) ====================

export function calculateGrahaMaitriMatching(
  maleRashi: number,
  femaleRashi: number
): AshtakutaResult {
  // Get rashi lords
  const rashiLords = [
    'Mars',    // Aries
    'Venus',   // Taurus
    'Mercury', // Gemini
    'Moon',    // Cancer
    'Sun',     // Leo
    'Mercury', // Virgo
    'Venus',   // Libra
    'Mars',    // Scorpio
    'Jupiter', // Sagittarius
    'Saturn',  // Capricorn
    'Saturn',  // Aquarius
    'Jupiter'  // Pisces
  ];
  
  const maleLord = rashiLords[maleRashi];
  const femaleLord = rashiLords[femaleRashi];
  
  // Planetary friendships
  const friendships: Record<string, { friends: string[]; enemies: string[]; neutral: string[] }> = {
    'Sun': { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'], neutral: ['Mercury'] },
    'Moon': { friends: ['Sun', 'Mercury'], enemies: [], neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn'] },
    'Mars': { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'], neutral: ['Venus', 'Saturn'] },
    'Mercury': { friends: ['Sun', 'Venus'], enemies: ['Moon'], neutral: ['Mars', 'Jupiter', 'Saturn'] },
    'Jupiter': { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'], neutral: ['Saturn'] },
    'Venus': { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'], neutral: ['Mars', 'Jupiter'] },
    'Saturn': { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'], neutral: ['Jupiter'] }
  };
  
  // Calculate mutual friendship
  const maleFriendship = friendships[maleLord];
  const femaleFriendship = friendships[femaleLord];
  
  let maleToFemale = 'neutral';
  let femaleToMale = 'neutral';
  
  if (maleFriendship.friends.includes(femaleLord)) maleToFemale = 'friend';
  else if (maleFriendship.enemies.includes(femaleLord)) maleToFemale = 'enemy';
  
  if (femaleFriendship.friends.includes(maleLord)) femaleToMale = 'friend';
  else if (femaleFriendship.enemies.includes(maleLord)) femaleToMale = 'enemy';
  
  // Calculate points
  let points = 0;
  if (maleToFemale === 'friend' && femaleToMale === 'friend') points = 5;
  else if (maleToFemale === 'friend' || femaleToMale === 'friend') points = 4;
  else if (maleToFemale === 'neutral' && femaleToMale === 'neutral') points = 3;
  else if (maleToFemale === 'enemy' || femaleToMale === 'enemy') points = 1;
  else points = 0;
  
  const percentage = (points / 5) * 100;
  
  let compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  if (points >= 4) compatibility = 'Excellent';
  else if (points === 3) compatibility = 'Good';
  else if (points >= 1) compatibility = 'Average';
  else compatibility = 'Poor';
  
  return {
    category: 'Graha Maitri',
    points,
    maxPoints: 5,
    percentage,
    compatibility,
    description: {
      en: `Graha Maitri: ${points}/5 points. Mental compatibility between ${maleLord} and ${femaleLord} lords shows ${compatibility.toLowerCase()} psychological harmony.`,
      hi: `ग्रह मैत्री: ${points}/5 अंक। ${maleLord} और ${femaleLord} स्वामियों के बीच मानसिक अनुकूलता ${compatibility === 'Excellent' ? 'उत्कृष्ट' : compatibility === 'Good' ? 'अच्छी' : compatibility === 'Average' ? 'औसत' : 'खराब'} मनोवैज्ञानिक सामंजस्य दिखाती है।`
    },
    details: { maleLord, femaleLord, maleToFemale, femaleToMale }
  };
}

// ==================== GANA MATCHING (6 POINTS) ====================

export enum Gana {
  DEVA = 'Deva',     // Divine
  MANUSHYA = 'Manushya', // Human
  RAKSHASA = 'Rakshasa'  // Demonic
}

// Nakshatra to Gana mapping
const NAKSHATRA_GANA: Record<string, Gana> = {
  // Deva Gana (Divine nature - gentle, spiritual)
  'Ashwini': Gana.DEVA,
  'Mrigashirsha': Gana.DEVA,
  'Punarvasu': Gana.DEVA,
  'Pushya': Gana.DEVA,
  'Hasta': Gana.DEVA,
  'Swati': Gana.DEVA,
  'Anuradha': Gana.DEVA,
  'Shravana': Gana.DEVA,
  'Revati': Gana.DEVA,
  
  // Manushya Gana (Human nature - balanced)
  'Bharani': Gana.MANUSHYA,
  'Rohini': Gana.MANUSHYA,
  'Ardra': Gana.MANUSHYA,
  'Purva Phalguni': Gana.MANUSHYA,
  'Uttara Phalguni': Gana.MANUSHYA,
  'Purva Ashadha': Gana.MANUSHYA,
  'Uttara Ashadha': Gana.MANUSHYA,
  'Purva Bhadrapada': Gana.MANUSHYA,
  'Uttara Bhadrapada': Gana.MANUSHYA,
  
  // Rakshasa Gana (Demonic nature - aggressive, materialistic)
  'Krittika': Gana.RAKSHASA,
  'Ashlesha': Gana.RAKSHASA,
  'Magha': Gana.RAKSHASA,
  'Chitra': Gana.RAKSHASA,
  'Vishakha': Gana.RAKSHASA,
  'Jyeshtha': Gana.RAKSHASA,
  'Mula': Gana.RAKSHASA,
  'Dhanishta': Gana.RAKSHASA,
  'Shatabhisha': Gana.RAKSHASA
};

export function calculateGanaMatching(
  maleNakshatra: string,
  femaleNakshatra: string
): AshtakutaResult {
  const maleGana = NAKSHATRA_GANA[maleNakshatra];
  const femaleGana = NAKSHATRA_GANA[femaleNakshatra];
  
  let points = 0;
  
  // Gana compatibility rules
  if (maleGana === femaleGana) {
    points = 6; // Same gana - perfect compatibility
  } else if (
    (maleGana === Gana.DEVA && femaleGana === Gana.MANUSHYA) ||
    (maleGana === Gana.MANUSHYA && femaleGana === Gana.DEVA) ||
    (maleGana === Gana.MANUSHYA && femaleGana === Gana.RAKSHASA)
  ) {
    points = 5; // Compatible combinations
  } else if (maleGana === Gana.DEVA && femaleGana === Gana.RAKSHASA) {
    points = 1; // Difficult but manageable
  } else if (maleGana === Gana.RAKSHASA && femaleGana === Gana.DEVA) {
    points = 0; // Most challenging combination
  } else {
    points = 3; // Other combinations
  }
  
  const percentage = (points / 6) * 100;
  
  let compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  if (points >= 5) compatibility = 'Excellent';
  else if (points >= 3) compatibility = 'Good';
  else if (points >= 1) compatibility = 'Average';
  else compatibility = 'Poor';
  
  return {
    category: 'Gana',
    points,
    maxPoints: 6,
    percentage,
    compatibility,
    description: {
      en: `Gana matching: ${points}/6 points. Temperament compatibility between ${maleGana} and ${femaleGana} is ${compatibility.toLowerCase()}.`,
      hi: `गण मेल: ${points}/6 अंक। ${maleGana} और ${femaleGana} के बीच स्वभाव अनुकूलता ${compatibility === 'Excellent' ? 'उत्कृष्ट' : compatibility === 'Good' ? 'अच्छी' : compatibility === 'Average' ? 'औसत' : 'खराब'} है।`
    },
    details: { maleGana, femaleGana }
  };
}

// ==================== BHAKOOT MATCHING (7 POINTS) ====================

export function calculateBhakootMatching(
  maleRashi: number,
  femaleRashi: number
): AshtakutaResult {
  // Calculate the difference between rashis
  const diff1 = Math.abs(maleRashi - femaleRashi);
  const diff2 = 12 - diff1; // Alternative difference
  const minDiff = Math.min(diff1, diff2);
  
  let points = 0;
  
  // Bhakoot compatibility rules based on rashi positions
  if (minDiff === 0) {
    points = 7; // Same rashi - excellent
  } else if (minDiff === 1 || minDiff === 5) {
    points = 0; // 2nd and 6th positions - inauspicious
  } else if (minDiff === 2 || minDiff === 4) {
    points = 7; // 3rd and 5th positions - very good
  } else if (minDiff === 3) {
    points = 7; // 4th position - good
  } else {
    points = 4; // Other positions - average
  }
  
  // Special case: 6th and 8th positions (vedha dosha)
  const vedhaPositions = [
    [0, 5], [1, 4], [2, 3], [6, 11], [7, 10], [8, 9] // Aries-Virgo, Taurus-Leo, etc.
  ];
  
  const hasVedhaDosha = vedhaPositions.some(([r1, r2]) => 
    (maleRashi === r1 && femaleRashi === r2) || 
    (maleRashi === r2 && femaleRashi === r1)
  );
  
  if (hasVedhaDosha && points > 0) {
    points = Math.max(0, points - 2); // Reduce points for vedha dosha
  }
  
  const percentage = (points / 7) * 100;
  
  let compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  if (points >= 6) compatibility = 'Excellent';
  else if (points >= 4) compatibility = 'Good';
  else if (points >= 2) compatibility = 'Average';
  else compatibility = 'Poor';
  
  const rashiNames = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  return {
    category: 'Bhakoot',
    points,
    maxPoints: 7,
    percentage,
    compatibility,
    description: {
      en: `Bhakoot matching: ${points}/7 points. Love and affection compatibility between ${rashiNames[maleRashi]} and ${rashiNames[femaleRashi]} is ${compatibility.toLowerCase()}.${hasVedhaDosha ? ' Vedha dosha detected.' : ''}`,
      hi: `भकूट मेल: ${points}/7 अंक। ${rashiNames[maleRashi]} और ${rashiNames[femaleRashi]} के बीच प्रेम और स्नेह अनुकूलता ${compatibility === 'Excellent' ? 'उत्कृष्ट' : compatibility === 'Good' ? 'अच्छी' : compatibility === 'Average' ? 'औसत' : 'खराब'} है।${hasVedhaDosha ? ' वेध दोष का पता चला।' : ''}`
    },
    details: { 
      maleRashi: rashiNames[maleRashi], 
      femaleRashi: rashiNames[femaleRashi], 
      difference: minDiff,
      hasVedhaDosha 
    }
  };
}

// ==================== NADI MATCHING (8 POINTS) ====================

export enum Nadi {
  AADI = 'Aadi',       // Beginning
  MADHYA = 'Madhya',   // Middle  
  ANTYA = 'Antya'      // End
}

// Nakshatra to Nadi mapping
const NAKSHATRA_NADI: Record<string, Nadi> = {
  // Aadi Nadi (Vata constitution)
  'Ashwini': Nadi.AADI,
  'Ardra': Nadi.AADI,
  'Punarvasu': Nadi.AADI,
  'Uttara Phalguni': Nadi.AADI,
  'Hasta': Nadi.AADI,
  'Jyeshtha': Nadi.AADI,
  'Mula': Nadi.AADI,
  'Shatabhisha': Nadi.AADI,
  'Purva Bhadrapada': Nadi.AADI,
  
  // Madhya Nadi (Pitta constitution)
  'Bharani': Nadi.MADHYA,
  'Mrigashirsha': Nadi.MADHYA,
  'Pushya': Nadi.MADHYA,
  'Purva Phalguni': Nadi.MADHYA,
  'Chitra': Nadi.MADHYA,
  'Anuradha': Nadi.MADHYA,
  'Purva Ashadha': Nadi.MADHYA,
  'Dhanishta': Nadi.MADHYA,
  'Uttara Bhadrapada': Nadi.MADHYA,
  
  // Antya Nadi (Kapha constitution)
  'Krittika': Nadi.ANTYA,
  'Rohini': Nadi.ANTYA,
  'Ashlesha': Nadi.ANTYA,
  'Magha': Nadi.ANTYA,
  'Swati': Nadi.ANTYA,
  'Vishakha': Nadi.ANTYA,
  'Uttara Ashadha': Nadi.ANTYA,
  'Shravana': Nadi.ANTYA,
  'Revati': Nadi.ANTYA
};

export function calculateNadiMatching(
  maleNakshatra: string,
  femaleNakshatra: string
): AshtakutaResult {
  const maleNadi = NAKSHATRA_NADI[maleNakshatra];
  const femaleNadi = NAKSHATRA_NADI[femaleNakshatra];
  
  let points = 0;
  let hasNadiDosha = false;
  
  // Nadi compatibility rules
  if (maleNadi !== femaleNadi) {
    points = 8; // Different nadis - excellent for health and progeny
  } else {
    points = 0; // Same nadi - Nadi dosha (health and progeny issues)
    hasNadiDosha = true;
  }
  
  // Nadi dosha exceptions (when same nadi is acceptable)
  const exceptions = [
    // Same nakshatra but different padas
    maleNakshatra === femaleNakshatra,
    // Same rashi lord (needs rashi calculation - simplified here)
    false
  ];
  
  if (hasNadiDosha && exceptions.some(ex => ex)) {
    points = 4; // Partial points for exceptions
    hasNadiDosha = false; // Dosha cancelled
  }
  
  const percentage = (points / 8) * 100;
  
  let compatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
  if (points >= 7) compatibility = 'Excellent';
  else if (points >= 4) compatibility = 'Good';
  else if (points >= 2) compatibility = 'Average';
  else compatibility = 'Poor';
  
  return {
    category: 'Nadi',
    points,
    maxPoints: 8,
    percentage,
    compatibility,
    description: {
      en: `Nadi matching: ${points}/8 points. Health and progeny compatibility between ${maleNadi} and ${femaleNadi} nadi is ${compatibility.toLowerCase()}.${hasNadiDosha ? ' Nadi dosha present - may affect health and children.' : ''}`,
      hi: `नाड़ी मेल: ${points}/8 अंक। ${maleNadi} और ${femaleNadi} नाड़ी के बीच स्वास्थ्य और संतान अनुकूलता ${compatibility === 'Excellent' ? 'उत्कृष्ट' : compatibility === 'Good' ? 'अच्छी' : compatibility === 'Average' ? 'औसत' : 'खराब'} है।${hasNadiDosha ? ' नाड़ी दोष मौजूद - स्वास्थ्य और संतान को प्रभावित कर सकता है।' : ''}`
    },
    details: { maleNadi, femaleNadi, hasNadiDosha }
  };
}

// ==================== MAIN ASHTAKUTA CALCULATION ====================

export interface PartnerData {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  nakshatra?: string;
  rashi?: number;
}

export async function calculateAshtakuta(
  male: PartnerData,
  female: PartnerData
): Promise<CompatibilityReport> {
  try {
    // Get nakshatra and rashi data for both partners
    const maleNakshatra = male.nakshatra || (await getNakshatraInfo(male.dateOfBirth, male.timeOfBirth)).name;
    const femaleNakshatra = female.nakshatra || (await getNakshatraInfo(female.dateOfBirth, female.timeOfBirth)).name;
    
    const maleRashi = male.rashi ?? (await getMoonSign(male.dateOfBirth, male.timeOfBirth)).rashi;
    const femaleRashi = female.rashi ?? (await getMoonSign(female.dateOfBirth, female.timeOfBirth)).rashi;
    
    // Calculate all 8 categories (Week 10 - Complete system)
    const categories: AshtakutaResult[] = [
      calculateVarnaMatching(maleNakshatra, femaleNakshatra),
      calculateVashyaMatching(maleRashi, femaleRashi),
      calculateTaraMatching(maleNakshatra, femaleNakshatra),
      calculateYoniMatching(maleNakshatra, femaleNakshatra),
      calculateGrahaMaitriMatching(maleRashi, femaleRashi),
      calculateGanaMatching(maleNakshatra, femaleNakshatra),
      calculateBhakootMatching(maleRashi, femaleRashi),
      calculateNadiMatching(maleNakshatra, femaleNakshatra)
    ];
    
    // Calculate totals
    const totalPoints = categories.reduce((sum, cat) => sum + cat.points, 0);
    const maxPoints = categories.reduce((sum, cat) => sum + cat.maxPoints, 0); // 36 points total
    const percentage = (totalPoints / maxPoints) * 100;
    
    // Determine overall compatibility (traditional thresholds)
    let overallCompatibility: 'Excellent' | 'Good' | 'Average' | 'Poor';
    if (totalPoints >= 28) overallCompatibility = 'Excellent'; // 28+ points
    else if (totalPoints >= 21) overallCompatibility = 'Good';     // 21-27 points
    else if (totalPoints >= 14) overallCompatibility = 'Average';  // 14-20 points
    else overallCompatibility = 'Poor';                            // <14 points
    
    // Check for major doshas
    const doshas = checkMajorDoshas(categories);
    
    // Generate recommendations
    const recommendations = generateRecommendations(categories, overallCompatibility, doshas);
    
    return {
      totalPoints,
      maxPoints,
      percentage,
      overallCompatibility,
      categories,
      recommendations,
      dosha: doshas.length > 0 ? {
        present: true,
        type: doshas.map(d => d.type).join(', '),
        remedies: doshas.flatMap(d => d.remedies)
      } : { present: false, type: '', remedies: [] }
    };
    
  } catch (error) {
    throw new Error(`Ashtakuta calculation failed: ${error.message}`);
  }
}

function checkMajorDoshas(categories: AshtakutaResult[]): Array<{type: string; remedies: string[]}> {
  const doshas = [];
  
  // Check for Nadi Dosha
  const nadiCategory = categories.find(cat => cat.category === 'Nadi');
  if (nadiCategory?.details?.hasNadiDosha) {
    doshas.push({
      type: 'Nadi Dosha',
      remedies: [
        'Perform Nadi Dosha Nivaran Puja',
        'Donate gold or silver to Brahmins',
        'Chant Mahamrityunjaya Mantra 108 times daily',
        'Worship Lord Shiva and Goddess Parvati together'
      ]
    });
  }
  
  // Check for Bhakoot Dosha (Vedha)
  const bhakootCategory = categories.find(cat => cat.category === 'Bhakoot');
  if (bhakootCategory?.details?.hasVedhaDosha) {
    doshas.push({
      type: 'Bhakoot Dosha (Vedha)',
      remedies: [
        'Perform Bhakoot Dosha Shanti Puja',
        'Donate food to poor on Thursdays',
        'Worship Goddess Durga',
        'Recite Vishnu Sahasranama'
      ]
    });
  }
  
  // Check for Gana Dosha (Deva-Rakshasa combination)
  const ganaCategory = categories.find(cat => cat.category === 'Gana');
  if (ganaCategory?.points === 0) {
    doshas.push({
      type: 'Gana Dosha',
      remedies: [
        'Perform Gana Dosha Nivaran Puja',
        'Donate white clothes and sweets',
        'Worship Lord Vishnu',
        'Chant Gayatri Mantra daily'
      ]
    });
  }
  
  return doshas;
}

function generateRecommendations(
  categories: AshtakutaResult[],
  overall: 'Excellent' | 'Good' | 'Average' | 'Poor',
  doshas?: Array<{type: string; remedies: string[]}>
): { en: string[]; hi: string[] } {
  const recommendations = { en: [], hi: [] };
  
  // Overall recommendations based on total score
  if (overall === 'Excellent') {
    recommendations.en.push('Excellent compatibility! This match shows great potential for a harmonious and prosperous marriage.');
    recommendations.hi.push('उत्कृष्ट अनुकूलता! यह मेल एक सामंजस्यपूर्ण और समृद्ध विवाह की महान संभावना दिखाता है।');
    
    recommendations.en.push('The couple shares strong compatibility across multiple dimensions of life.');
    recommendations.hi.push('दंपति जीवन के कई आयामों में मजबूत अनुकूलता साझा करते हैं।');
  } else if (overall === 'Good') {
    recommendations.en.push('Good compatibility. With mutual understanding and respect, this can be a successful marriage.');
    recommendations.hi.push('अच्छी अनुकूलता। पारस्परिक समझ और सम्मान के साथ, यह एक सफल विवाह हो सकता है।');
    
    recommendations.en.push('Focus on strengthening areas with lower scores through communication and compromise.');
    recommendations.hi.push('संवाद और समझौते के माध्यम से कम अंक वाले क्षेत्रों को मजबूत बनाने पर ध्यान दें।');
  } else if (overall === 'Average') {
    recommendations.en.push('Average compatibility. Consider pre-marital counseling and remedial measures for better harmony.');
    recommendations.hi.push('औसत अनुकूलता। बेहतर सामंजस्य के लिए विवाह-पूर्व परामर्श और उपचारात्मक उपायों पर विचार करें।');
    
    recommendations.en.push('Both partners should work on understanding and accepting each other\'s differences.');
    recommendations.hi.push('दोनों साझीदारों को एक-दूसरे के अंतर को समझने और स्वीकार करने पर काम करना चाहिए।');
  } else {
    recommendations.en.push('Poor compatibility detected. Serious consideration and extensive remedial measures recommended before marriage.');
    recommendations.hi.push('खराब अनुकूलता का पता चला। विवाह से पहले गंभीर विचार और व्यापक उपचारात्मक उपायों की सिफारिश की जाती है।');
    
    recommendations.en.push('Consult with experienced astrologers for detailed analysis and remedies.');
    recommendations.hi.push('विस्तृत विश्लेषण और उपायों के लिए अनुभवी ज्योतिषियों से सलाह लें।');
  }
  
  // Category-specific recommendations
  categories.forEach(category => {
    if (category.points === 0) {
      recommendations.en.push(`${category.category} shows no compatibility. Consider specific remedies and counseling.`);
      recommendations.hi.push(`${category.category} में कोई अनुकूलता नहीं दिखती। विशिष्ट उपाय और परामर्श पर विचार करें।`);
    } else if (category.points < category.maxPoints / 2) {
      recommendations.en.push(`${category.category} compatibility is below average. Focus on this area for improvement.`);
      recommendations.hi.push(`${category.category} अनुकूलता औसत से कम है। सुधार के लिए इस क्षेत्र पर ध्यान दें।`);
    }
  });
  
  // Dosha-specific recommendations
  if (doshas && doshas.length > 0) {
    recommendations.en.push('Important: Major doshas detected. Perform recommended remedies before marriage.');
    recommendations.hi.push('महत्वपूर्ण: प्रमुख दोष का पता चला। विवाह से पहले सुझाए गए उपाय करें।');
    
    doshas.forEach(dosha => {
      recommendations.en.push(`For ${dosha.type}: ${dosha.remedies[0]}`);
      recommendations.hi.push(`${dosha.type} के लिए: ${dosha.remedies[0]}`);
    });
  }
  
  // General marriage advice
  recommendations.en.push('Remember: Compatibility is important, but mutual love, respect, and understanding are equally vital for a successful marriage.');
  recommendations.hi.push('याद रखें: अनुकूलता महत्वपूर्ण है, लेकिन पारस्परिक प्रेम, सम्मान और समझ भी सफल विवाह के लिए उतने ही महत्वपूर्ण हैं।');
  
  return recommendations;
}

export default {
  calculateVarnaMatching,
  calculateVashyaMatching,
  calculateTaraMatching,
  calculateYoniMatching,
  calculateGrahaMaitriMatching,
  calculateGanaMatching,
  calculateBhakootMatching,
  calculateNadiMatching,
  calculateAshtakuta,
  Varna,
  Vashya,
  YoniAnimal,
  Gana,
  Nadi
};