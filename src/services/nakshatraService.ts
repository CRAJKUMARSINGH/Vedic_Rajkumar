/**
 * Nakshatra (Birth Star) Calculation Service
 * Identifies the 27 lunar mansions in Vedic astrology
 */

import { calculatePlanetaryPositions } from './ephemerisService';

/**
 * Nakshatra data structure
 */
export interface NakshatraInfo {
  number: number;
  id: number;
  /** English name string (in NAKSHATRA_DATABASE) or name object (in NAKSHATRAS) */
  name: string | { en: string; hi: string; sanskrit: string };
  nameEn: string;
  nameHi: string;
  nameSanskrit: string;
  /** 1-based nakshatra number */
  nakshatra: number;
  lord: string;
  deity: string;
  symbol: string;
  startDegree: number;
  endDegree: number;
  pada: number;
  characteristics: {
    en: string;
    hi: string;
  };
}

/**
 * Complete Nakshatra database (27 nakshatras)
 */
export const NAKSHATRAS: NakshatraInfo[] = [
  {
    number: 1,
    name: { en: 'Ashwini', hi: 'अश्विनी', sanskrit: 'Aśvinī' },
    lord: 'Ketu',
    deity: 'Ashwini Kumaras',
    symbol: 'Horse Head',
    startDegree: 0,
    endDegree: 13.333333,
    pada: 0,
    characteristics: {
      en: 'Quick, energetic, healing abilities, pioneering spirit',
      hi: 'तीव्र, ऊर्जावान, उपचार क्षमता, अग्रणी भावना'
    }
  },
  {
    number: 2,
    name: { en: 'Bharani', hi: 'भरणी', sanskrit: 'Bharaṇī' },
    lord: 'Venus',
    deity: 'Yama',
    symbol: 'Yoni',
    startDegree: 13.333333,
    endDegree: 26.666667,
    pada: 0,
    characteristics: {
      en: 'Creative, nurturing, transformative, strong willpower',
      hi: 'रचनात्मक, पोषण, परिवर्तनकारी, मजबूत इच्छाशक्ति'
    }
  },
  {
    number: 3,
    name: { en: 'Krittika', hi: 'कृत्तिका', sanskrit: 'Kṛttikā' },
    lord: 'Sun',
    deity: 'Agni',
    symbol: 'Razor/Flame',
    startDegree: 26.666667,
    endDegree: 40,
    pada: 0,
    characteristics: {
      en: 'Sharp intellect, purifying nature, leadership qualities',
      hi: 'तीक्ष्ण बुद्धि, शुद्ध करने वाला स्वभाव, नेतृत्व गुण'
    }
  },
  {
    number: 4,
    name: { en: 'Rohini', hi: 'रोहिणी', sanskrit: 'Rohiṇī' },
    lord: 'Moon',
    deity: 'Brahma',
    symbol: 'Chariot/Cart',
    startDegree: 40,
    endDegree: 53.333333,
    pada: 0,
    characteristics: {
      en: 'Beautiful, creative, materialistic, growth-oriented',
      hi: 'सुंदर, रचनात्मक, भौतिकवादी, विकास-उन्मुख'
    }
  },
  {
    number: 5,
    name: { en: 'Mrigashira', hi: 'मृगशिरा', sanskrit: 'Mṛgaśirā' },
    lord: 'Mars',
    deity: 'Soma',
    symbol: 'Deer Head',
    startDegree: 53.333333,
    endDegree: 66.666667,
    pada: 0,
    characteristics: {
      en: 'Curious, searching, gentle, artistic nature',
      hi: 'जिज्ञासु, खोजी, कोमल, कलात्मक स्वभाव'
    }
  },
  {
    number: 6,
    name: { en: 'Ardra', hi: 'आर्द्रा', sanskrit: 'Ārdrā' },
    lord: 'Rahu',
    deity: 'Rudra',
    symbol: 'Teardrop/Diamond',
    startDegree: 66.666667,
    endDegree: 80,
    pada: 0,
    characteristics: {
      en: 'Intense emotions, transformative, intellectual, stormy',
      hi: 'तीव्र भावनाएं, परिवर्तनकारी, बौद्धिक, तूफानी'
    }
  },
  {
    number: 7,
    name: { en: 'Punarvasu', hi: 'पुनर्वसु', sanskrit: 'Punarvasu' },
    lord: 'Jupiter',
    deity: 'Aditi',
    symbol: 'Bow and Quiver',
    startDegree: 80,
    endDegree: 93.333333,
    pada: 0,
    characteristics: {
      en: 'Renewal, optimism, philosophical, generous nature',
      hi: 'नवीनीकरण, आशावाद, दार्शनिक, उदार स्वभाव'
    }
  },
  {
    number: 8,
    name: { en: 'Pushya', hi: 'पुष्य', sanskrit: 'Puṣya' },
    lord: 'Saturn',
    deity: 'Brihaspati',
    symbol: 'Cow Udder/Lotus',
    startDegree: 93.333333,
    endDegree: 106.666667,
    pada: 0,
    characteristics: {
      en: 'Nourishing, spiritual, disciplined, auspicious',
      hi: 'पोषण, आध्यात्मिक, अनुशासित, शुभ'
    }
  },
  {
    number: 9,
    name: { en: 'Ashlesha', hi: 'आश्लेषा', sanskrit: 'Āśleṣā' },
    lord: 'Mercury',
    deity: 'Nagas',
    symbol: 'Coiled Serpent',
    startDegree: 106.666667,
    endDegree: 120,
    pada: 0,
    characteristics: {
      en: 'Mystical, penetrating insight, hypnotic, secretive',
      hi: 'रहस्यमय, गहरी अंतर्दृष्टि, सम्मोहक, गुप्त'
    }
  },
  {
    number: 10,
    name: { en: 'Magha', hi: 'मघा', sanskrit: 'Maghā' },
    lord: 'Ketu',
    deity: 'Pitris',
    symbol: 'Royal Throne',
    startDegree: 120,
    endDegree: 133.333333,
    pada: 0,
    characteristics: {
      en: 'Royal, ancestral pride, authoritative, traditional',
      hi: 'शाही, पैतृक गौरव, आधिकारिक, पारंपरिक'
    }
  },
  {
    number: 11,
    name: { en: 'Purva Phalguni', hi: 'पूर्व फाल्गुनी', sanskrit: 'Pūrva Phalgunī' },
    lord: 'Venus',
    deity: 'Bhaga',
    symbol: 'Front Legs of Bed',
    startDegree: 133.333333,
    endDegree: 146.666667,
    pada: 0,
    characteristics: {
      en: 'Creative, pleasure-loving, artistic, generous',
      hi: 'रचनात्मक, सुख-प्रेमी, कलात्मक, उदार'
    }
  },
  {
    number: 12,
    name: { en: 'Uttara Phalguni', hi: 'उत्तर फाल्गुनी', sanskrit: 'Uttara Phalgunī' },
    lord: 'Sun',
    deity: 'Aryaman',
    symbol: 'Back Legs of Bed',
    startDegree: 146.666667,
    endDegree: 160,
    pada: 0,
    characteristics: {
      en: 'Helpful, organized, leadership, partnership-oriented',
      hi: 'सहायक, संगठित, नेतृत्व, साझेदारी-उन्मुख'
    }
  },
  {
    number: 13,
    name: { en: 'Hasta', hi: 'हस्त', sanskrit: 'Hasta' },
    lord: 'Moon',
    deity: 'Savitar',
    symbol: 'Hand/Fist',
    startDegree: 160,
    endDegree: 173.333333,
    pada: 0,
    characteristics: {
      en: 'Skillful, dexterous, humorous, clever with hands',
      hi: 'कुशल, निपुण, हास्यप्रिय, हाथों से चतुर'
    }
  },
  {
    number: 14,
    name: { en: 'Chitra', hi: 'चित्रा', sanskrit: 'Citrā' },
    lord: 'Mars',
    deity: 'Tvashtar',
    symbol: 'Bright Jewel/Pearl',
    startDegree: 173.333333,
    endDegree: 186.666667,
    pada: 0,
    characteristics: {
      en: 'Artistic, charismatic, fashionable, creative builder',
      hi: 'कलात्मक, करिश्माई, फैशनेबल, रचनात्मक निर्माता'
    }
  },
  {
    number: 15,
    name: { en: 'Swati', hi: 'स्वाति', sanskrit: 'Svāti' },
    lord: 'Rahu',
    deity: 'Vayu',
    symbol: 'Young Sprout/Coral',
    startDegree: 186.666667,
    endDegree: 200,
    pada: 0,
    characteristics: {
      en: 'Independent, flexible, diplomatic, business-minded',
      hi: 'स्वतंत्र, लचीला, कूटनीतिक, व्यापार-उन्मुख'
    }
  },
  {
    number: 16,
    name: { en: 'Vishakha', hi: 'विशाखा', sanskrit: 'Viśākhā' },
    lord: 'Jupiter',
    deity: 'Indra-Agni',
    symbol: 'Triumphal Arch',
    startDegree: 200,
    endDegree: 213.333333,
    pada: 0,
    characteristics: {
      en: 'Goal-oriented, determined, ambitious, transformative',
      hi: 'लक्ष्य-उन्मुख, दृढ़निश्चयी, महत्वाकांक्षी, परिवर्तनकारी'
    }
  },
  {
    number: 17,
    name: { en: 'Anuradha', hi: 'अनुराधा', sanskrit: 'Anurādhā' },
    lord: 'Saturn',
    deity: 'Mitra',
    symbol: 'Lotus Flower',
    startDegree: 213.333333,
    endDegree: 226.666667,
    pada: 0,
    characteristics: {
      en: 'Devoted, friendly, balanced, success in foreign lands',
      hi: 'समर्पित, मैत्रीपूर्ण, संतुलित, विदेश में सफलता'
    }
  },
  {
    number: 18,
    name: { en: 'Jyeshtha', hi: 'ज्येष्ठा', sanskrit: 'Jyeṣṭhā' },
    lord: 'Mercury',
    deity: 'Indra',
    symbol: 'Circular Amulet/Umbrella',
    startDegree: 226.666667,
    endDegree: 240,
    pada: 0,
    characteristics: {
      en: 'Protective, authoritative, responsible, eldest',
      hi: 'सुरक्षात्मक, आधिकारिक, जिम्मेदार, ज्येष्ठ'
    }
  },
  {
    number: 19,
    name: { en: 'Mula', hi: 'मूल', sanskrit: 'Mūla' },
    lord: 'Ketu',
    deity: 'Nirriti',
    symbol: 'Bundle of Roots',
    startDegree: 240,
    endDegree: 253.333333,
    pada: 0,
    characteristics: {
      en: 'Investigative, philosophical, transformative, root-seeking',
      hi: 'अन्वेषणात्मक, दार्शनिक, परिवर्तनकारी, मूल-खोजी'
    }
  },
  {
    number: 20,
    name: { en: 'Purva Ashadha', hi: 'पूर्व आषाढ़ा', sanskrit: 'Pūrva Āṣāḍhā' },
    lord: 'Venus',
    deity: 'Apas',
    symbol: 'Elephant Tusk/Fan',
    startDegree: 253.333333,
    endDegree: 266.666667,
    pada: 0,
    characteristics: {
      en: 'Invincible, proud, philosophical, purifying',
      hi: 'अजेय, गर्वित, दार्शनिक, शुद्ध करने वाला'
    }
  },
  {
    number: 21,
    name: { en: 'Uttara Ashadha', hi: 'उत्तर आषाढ़ा', sanskrit: 'Uttara Āṣāḍhā' },
    lord: 'Sun',
    deity: 'Vishvadevas',
    symbol: 'Elephant Tusk/Planks',
    startDegree: 266.666667,
    endDegree: 280,
    pada: 0,
    characteristics: {
      en: 'Righteous, leadership, final victory, ethical',
      hi: 'धर्मी, नेतृत्व, अंतिम विजय, नैतिक'
    }
  },
  {
    number: 22,
    name: { en: 'Shravana', hi: 'श्रवण', sanskrit: 'Śravaṇa' },
    lord: 'Moon',
    deity: 'Vishnu',
    symbol: 'Three Footprints/Ear',
    startDegree: 280,
    endDegree: 293.333333,
    pada: 0,
    characteristics: {
      en: 'Listening, learning, knowledge-seeking, connecting',
      hi: 'सुनना, सीखना, ज्ञान-खोजी, जोड़ने वाला'
    }
  },
  {
    number: 23,
    name: { en: 'Dhanishtha', hi: 'धनिष्ठा', sanskrit: 'Dhaniṣṭhā' },
    lord: 'Mars',
    deity: 'Eight Vasus',
    symbol: 'Drum/Flute',
    startDegree: 293.333333,
    endDegree: 306.666667,
    pada: 0,
    characteristics: {
      en: 'Wealthy, musical, adaptable, charitable',
      hi: 'धनी, संगीतमय, अनुकूलनीय, दानशील'
    }
  },
  {
    number: 24,
    name: { en: 'Shatabhisha', hi: 'शतभिषा', sanskrit: 'Śatabhiṣā' },
    lord: 'Rahu',
    deity: 'Varuna',
    symbol: 'Empty Circle/1000 Flowers',
    startDegree: 306.666667,
    endDegree: 320,
    pada: 0,
    characteristics: {
      en: 'Healing, mystical, secretive, independent thinker',
      hi: 'उपचार, रहस्यमय, गुप्त, स्वतंत्र विचारक'
    }
  },
  {
    number: 25,
    name: { en: 'Purva Bhadrapada', hi: 'पूर्व भाद्रपद', sanskrit: 'Pūrva Bhādrapadā' },
    lord: 'Jupiter',
    deity: 'Aja Ekapada',
    symbol: 'Front Legs of Funeral Cot',
    startDegree: 320,
    endDegree: 333.333333,
    pada: 0,
    characteristics: {
      en: 'Intense, transformative, spiritual, dualistic',
      hi: 'तीव्र, परिवर्तनकारी, आध्यात्मिक, द्वैतवादी'
    }
  },
  {
    number: 26,
    name: { en: 'Uttara Bhadrapada', hi: 'उत्तर भाद्रपद', sanskrit: 'Uttara Bhādrapadā' },
    lord: 'Saturn',
    deity: 'Ahir Budhnya',
    symbol: 'Back Legs of Funeral Cot',
    startDegree: 333.333333,
    endDegree: 346.666667,
    pada: 0,
    characteristics: {
      en: 'Deep wisdom, patient, kundalini power, mystical',
      hi: 'गहरी बुद्धि, धैर्यवान, कुंडलिनी शक्ति, रहस्यमय'
    }
  },
  {
    number: 27,
    name: { en: 'Revati', hi: 'रेवती', sanskrit: 'Revatī' },
    lord: 'Mercury',
    deity: 'Pushan',
    symbol: 'Fish/Drum',
    startDegree: 346.666667,
    endDegree: 360,
    pada: 0,
    characteristics: {
      en: 'Nourishing, protective, wealthy, journey-oriented',
      hi: 'पोषण, सुरक्षात्मक, धनी, यात्रा-उन्मुख'
    }
  }
];

/** Alias for backward compatibility, with flat field aliases added */
export const NAKSHATRA_DATABASE = NAKSHATRAS.map(n => ({
  ...n,
  id: n.number,
  nakshatra: n.number,
  /** Flat string name (English) for test compatibility */
  name: n.name.en,
  nameEn: n.name.en,
  nameHi: n.name.hi,
  nameSanskrit: n.name.sanskrit,
}));

/**
 * Calculate Nakshatra from Moon's sidereal longitude
 */
export function calculateNakshatra(moonLongitude: number): NakshatraInfo {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((moonLongitude % 360) + 360) % 360;
  
  // Each nakshatra is 13°20' (13.333333°)
  let nakshatraIndex = Math.floor(normalizedLongitude / 13.333333);
  
  // Ensure nakshatra index is within valid range (0-26)
  if (nakshatraIndex < 0) nakshatraIndex = 0;
  if (nakshatraIndex > 26) nakshatraIndex = 26;
  
  // Get the nakshatra
  const nakshatra = { ...NAKSHATRAS[nakshatraIndex] };
  
  // Calculate pada (quarter within nakshatra)
  // Each pada is 3°20' (3.333333°)
  const degreesInNakshatra = normalizedLongitude - (nakshatraIndex * 13.333333);
  let pada = Math.floor(degreesInNakshatra / 3.333333) + 1;
  
  // Ensure pada is within valid range (1-4)
  if (pada < 1) pada = 1;
  if (pada > 4) pada = 4;
  
  nakshatra.pada = pada;
  
  // Add flat aliases for test compatibility
  const nameObj = nakshatra.name as { en: string; hi: string; sanskrit: string };
  (nakshatra as NakshatraInfo).id = nakshatra.number;
  (nakshatra as NakshatraInfo).nakshatra = nakshatra.number;
  (nakshatra as NakshatraInfo).nameEn = nameObj.en;
  (nakshatra as NakshatraInfo).nameHi = nameObj.hi;
  (nakshatra as NakshatraInfo).nameSanskrit = nameObj.sanskrit;
  
  return nakshatra;
}

/**
 * Get complete Nakshatra information for a birth chart
 * Does not throw — returns Ashwini (nakshatra 1) as fallback for invalid input.
 */
export function getNakshatraInfo(
  dateStr: string,
  timeStr: string
): NakshatraInfo {
  try {
    // Calculate planetary positions
    const positions = calculatePlanetaryPositions(dateStr, timeStr);
    
    // Get Moon's sidereal longitude
    const moonLongitude = positions.moon.sidereal;
    
    // Calculate Nakshatra
    return calculateNakshatra(moonLongitude);
  } catch {
    // Return Ashwini as safe fallback
    return calculateNakshatra(0);
  }
}

/**
 * Calculate Nakshatra from degrees (for testing)
 */
export function calculateNakshatraFromDegrees(degrees: number): {
  nakshatra: number;
  pada: number;
  nakshatraName: string;
} {
  const nakshatraInfo = calculateNakshatra(degrees);
  return {
    nakshatra: nakshatraInfo.number,
    pada: nakshatraInfo.pada,
    nakshatraName: nakshatraInfo.name.en
  };
}

/**
 * Format Nakshatra for display
 */
export function formatNakshatra(nakshatra: NakshatraInfo, lang: 'en' | 'hi' = 'en'): string {
  const name = lang === 'hi' ? nakshatra.name.hi : nakshatra.name.en;
  return `${name} (Pada ${nakshatra.pada})`;
}
