/**
 * Rashi Service - Enhanced Rashi Calculations
 * Comprehensive rashi analysis with planetary dignities and strengths
 */

import { calculateCompletePlanetaryPositions, RASHI_NAMES, type PlanetPosition } from './ephemerisService';

// ==================== RASHI DATA ====================

export interface RashiInfo {
  index: number;
  name: { en: string; hi: string; sanskrit: string };
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  lord: string;
  exaltationPlanet?: string;
  exaltationDegree?: number;
  debilitationPlanet?: string;
  debilitationDegree?: number;
  moolatrikona?: { planet: string; startDegree: number; endDegree: number };
  characteristics: { en: string; hi: string };
  bodyParts: string[];
  diseases: string[];
  colors: string[];
  gemstone: string;
}

export const RASHI_DATA: RashiInfo[] = [
  {
    index: 0,
    name: { en: 'Aries', hi: 'मेष', sanskrit: 'Mesha' },
    element: 'Fire',
    quality: 'Cardinal',
    lord: 'Mars',
    exaltationPlanet: 'Sun',
    exaltationDegree: 10,
    debilitationPlanet: 'Saturn',
    debilitationDegree: 20,
    moolatrikona: { planet: 'Mars', startDegree: 0, endDegree: 12 },
    characteristics: {
      en: 'Energetic, pioneering, courageous, impulsive',
      hi: 'ऊर्जावान, अग्रणी, साहसी, आवेगी'
    },
    bodyParts: ['Head', 'Face', 'Brain'],
    diseases: ['Headaches', 'Fever', 'Eye problems'],
    colors: ['Red', 'Scarlet'],
    gemstone: 'Red Coral'
  },
  {
    index: 1,
    name: { en: 'Taurus', hi: 'वृषभ', sanskrit: 'Vrishabha' },
    element: 'Earth',
    quality: 'Fixed',
    lord: 'Venus',
    exaltationPlanet: 'Moon',
    exaltationDegree: 3,
    debilitationPlanet: 'None',
    moolatrikona: { planet: 'Venus', startDegree: 4, endDegree: 20 },
    characteristics: {
      en: 'Stable, practical, sensual, stubborn',
      hi: 'स्थिर, व्यावहारिक, कामुक, जिद्दी'
    },
    bodyParts: ['Neck', 'Throat', 'Vocal cords'],
    diseases: ['Throat problems', 'Thyroid', 'Neck pain'],
    colors: ['White', 'Pink', 'Light Blue'],
    gemstone: 'Diamond'
  },
  {
    index: 2,
    name: { en: 'Gemini', hi: 'मिथुन', sanskrit: 'Mithuna' },
    element: 'Air',
    quality: 'Mutable',
    lord: 'Mercury',
    exaltationPlanet: 'Rahu',
    debilitationPlanet: 'Ketu',
    moolatrikona: { planet: 'Mercury', startDegree: 16, endDegree: 20 },
    characteristics: {
      en: 'Communicative, versatile, intellectual, restless',
      hi: 'संवादी, बहुमुखी, बौद्धिक, बेचैन'
    },
    bodyParts: ['Shoulders', 'Arms', 'Hands', 'Lungs'],
    diseases: ['Respiratory issues', 'Nervous disorders'],
    colors: ['Green', 'Yellow'],
    gemstone: 'Emerald'
  },
  {
    index: 3,
    name: { en: 'Cancer', hi: 'कर्क', sanskrit: 'Karka' },
    element: 'Water',
    quality: 'Cardinal',
    lord: 'Moon',
    exaltationPlanet: 'Jupiter',
    exaltationDegree: 5,
    debilitationPlanet: 'Mars',
    debilitationDegree: 28,
    moolatrikona: { planet: 'Moon', startDegree: 3, endDegree: 30 },
    characteristics: {
      en: 'Emotional, nurturing, intuitive, moody',
      hi: 'भावुक, पोषण करने वाला, सहज, मूडी'
    },
    bodyParts: ['Chest', 'Breasts', 'Stomach'],
    diseases: ['Digestive problems', 'Chest issues'],
    colors: ['White', 'Silver', 'Cream'],
    gemstone: 'Pearl'
  },
  {
    index: 4,
    name: { en: 'Leo', hi: 'सिंह', sanskrit: 'Simha' },
    element: 'Fire',
    quality: 'Fixed',
    lord: 'Sun',
    exaltationPlanet: 'None',
    debilitationPlanet: 'None',
    moolatrikona: { planet: 'Sun', startDegree: 0, endDegree: 20 },
    characteristics: {
      en: 'Confident, generous, dramatic, proud',
      hi: 'आत्मविश्वासी, उदार, नाटकीय, गर्वित'
    },
    bodyParts: ['Heart', 'Upper back', 'Spine'],
    diseases: ['Heart problems', 'Back pain'],
    colors: ['Gold', 'Orange', 'Red'],
    gemstone: 'Ruby'
  },
  {
    index: 5,
    name: { en: 'Virgo', hi: 'कन्या', sanskrit: 'Kanya' },
    element: 'Earth',
    quality: 'Mutable',
    lord: 'Mercury',
    exaltationPlanet: 'Mercury',
    exaltationDegree: 15,
    debilitationPlanet: 'Venus',
    debilitationDegree: 27,
    moolatrikona: { planet: 'Mercury', startDegree: 16, endDegree: 20 },
    characteristics: {
      en: 'Analytical, perfectionist, practical, critical',
      hi: 'विश्लेषणात्मक, पूर्णतावादी, व्यावहारिक, आलोचनात्मक'
    },
    bodyParts: ['Intestines', 'Abdomen', 'Digestive system'],
    diseases: ['Digestive disorders', 'Constipation'],
    colors: ['Green', 'Brown', 'Navy Blue'],
    gemstone: 'Emerald'
  },
  {
    index: 6,
    name: { en: 'Libra', hi: 'तुला', sanskrit: 'Tula' },
    element: 'Air',
    quality: 'Cardinal',
    lord: 'Venus',
    exaltationPlanet: 'Saturn',
    exaltationDegree: 20,
    debilitationPlanet: 'Sun',
    debilitationDegree: 10,
    characteristics: {
      en: 'Balanced, diplomatic, social, indecisive',
      hi: 'संतुलित, कूटनीतिक, सामाजिक, अनिर्णायक'
    },
    bodyParts: ['Kidneys', 'Lower back', 'Bladder'],
    diseases: ['Kidney problems', 'Lower back pain'],
    colors: ['Pink', 'Light Blue', 'White'],
    gemstone: 'Diamond'
  },
  {
    index: 7,
    name: { en: 'Scorpio', hi: 'वृश्चिक', sanskrit: 'Vrishchika' },
    element: 'Water',
    quality: 'Fixed',
    lord: 'Mars',
    exaltationPlanet: 'None',
    debilitationPlanet: 'Moon',
    debilitationDegree: 3,
    characteristics: {
      en: 'Intense, passionate, secretive, transformative',
      hi: 'तीव्र, भावुक, गुप्त, परिवर्तनकारी'
    },
    bodyParts: ['Reproductive organs', 'Pelvis'],
    diseases: ['Reproductive issues', 'Piles'],
    colors: ['Red', 'Maroon', 'Black'],
    gemstone: 'Red Coral'
  },
  {
    index: 8,
    name: { en: 'Sagittarius', hi: 'धनु', sanskrit: 'Dhanu' },
    element: 'Fire',
    quality: 'Mutable',
    lord: 'Jupiter',
    exaltationPlanet: 'Ketu',
    debilitationPlanet: 'Rahu',
    moolatrikona: { planet: 'Jupiter', startDegree: 0, endDegree: 10 },
    characteristics: {
      en: 'Optimistic, philosophical, adventurous, restless',
      hi: 'आशावादी, दार्शनिक, साहसी, बेचैन'
    },
    bodyParts: ['Thighs', 'Hips', 'Liver'],
    diseases: ['Hip problems', 'Liver issues'],
    colors: ['Yellow', 'Orange', 'Gold'],
    gemstone: 'Yellow Sapphire'
  },
  {
    index: 9,
    name: { en: 'Capricorn', hi: 'मकर', sanskrit: 'Makara' },
    element: 'Earth',
    quality: 'Cardinal',
    lord: 'Saturn',
    exaltationPlanet: 'Mars',
    exaltationDegree: 28,
    debilitationPlanet: 'Jupiter',
    debilitationDegree: 5,
    moolatrikona: { planet: 'Saturn', startDegree: 0, endDegree: 20 },
    characteristics: {
      en: 'Ambitious, disciplined, practical, pessimistic',
      hi: 'महत्वाकांक्षी, अनुशासित, व्यावहारिक, निराशावादी'
    },
    bodyParts: ['Knees', 'Bones', 'Joints'],
    diseases: ['Knee problems', 'Arthritis', 'Bone issues'],
    colors: ['Black', 'Dark Blue', 'Brown'],
    gemstone: 'Blue Sapphire'
  },
  {
    index: 10,
    name: { en: 'Aquarius', hi: 'कुंभ', sanskrit: 'Kumbha' },
    element: 'Air',
    quality: 'Fixed',
    lord: 'Saturn',
    exaltationPlanet: 'None',
    debilitationPlanet: 'None',
    moolatrikona: { planet: 'Saturn', startDegree: 20, endDegree: 30 },
    characteristics: {
      en: 'Innovative, humanitarian, detached, eccentric',
      hi: 'नवीन, मानवतावादी, अलग, विलक्षण'
    },
    bodyParts: ['Calves', 'Ankles', 'Circulatory system'],
    diseases: ['Ankle problems', 'Circulatory issues'],
    colors: ['Blue', 'Electric Blue', 'Grey'],
    gemstone: 'Blue Sapphire'
  },
  {
    index: 11,
    name: { en: 'Pisces', hi: 'मीन', sanskrit: 'Meena' },
    element: 'Water',
    quality: 'Mutable',
    lord: 'Jupiter',
    exaltationPlanet: 'Venus',
    exaltationDegree: 27,
    debilitationPlanet: 'Mercury',
    debilitationDegree: 15,
    moolatrikona: { planet: 'Jupiter', startDegree: 0, endDegree: 10 },
    characteristics: {
      en: 'Compassionate, intuitive, artistic, escapist',
      hi: 'दयालु, सहज, कलात्मक, पलायनवादी'
    },
    bodyParts: ['Feet', 'Lymphatic system'],
    diseases: ['Foot problems', 'Addiction issues'],
    colors: ['Sea Green', 'Lavender', 'Purple'],
    gemstone: 'Yellow Sapphire'
  }
];

// ==================== PLANETARY DIGNITIES ====================

export type PlanetaryDignity = 
  | 'Exalted' 
  | 'Debilitated' 
  | 'Own Sign' 
  | 'Moolatrikona' 
  | 'Friend Sign' 
  | 'Enemy Sign' 
  | 'Neutral';

export interface PlanetaryStrength {
  planet: string;
  rashi: number;
  rashiName: string;
  degrees: number;
  dignity: PlanetaryDignity;
  strength: number; // 0-100
  isRetrograde: boolean;
  description: { en: string; hi: string };
}

// Planet lordship
export const PLANET_LORDSHIP: Record<string, number[]> = {
  'Sun': [4], // Leo
  'Moon': [3], // Cancer
  'Mars': [0, 7], // Aries, Scorpio
  'Mercury': [2, 5], // Gemini, Virgo
  'Jupiter': [8, 11], // Sagittarius, Pisces
  'Venus': [1, 6], // Taurus, Libra
  'Saturn': [9, 10], // Capricorn, Aquarius
};

// Planetary friendships
export const PLANETARY_FRIENDSHIPS: Record<string, { friends: string[]; enemies: string[]; neutral: string[] }> = {
  'Sun': { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'], neutral: ['Mercury'] },
  'Moon': { friends: ['Sun', 'Mercury'], enemies: [], neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn'] },
  'Mars': { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'], neutral: ['Venus', 'Saturn'] },
  'Mercury': { friends: ['Sun', 'Venus'], enemies: ['Moon'], neutral: ['Mars', 'Jupiter', 'Saturn'] },
  'Jupiter': { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'], neutral: ['Saturn'] },
  'Venus': { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'], neutral: ['Mars', 'Jupiter'] },
  'Saturn': { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'], neutral: ['Jupiter'] },
};

/**
 * Get rashi information
 */
export function getRashiInfo(rashiIndex: number): RashiInfo {
  // Validate rashi index
  if (rashiIndex < 0 || rashiIndex > 11) {
    throw new Error(`Invalid rashi index: ${rashiIndex}. Must be between 0 and 11.`);
  }
  return RASHI_DATA[rashiIndex];
}

/**
 * Calculate planetary dignity
 */
export function calculatePlanetaryDignity(
  planet: string,
  rashiIndex: number,
  degrees: number
): PlanetaryDignity {
  const rashiInfo = RASHI_DATA[rashiIndex];
  
  // Check exaltation (exact degree gets priority)
  if (rashiInfo.exaltationPlanet === planet) {
    if (rashiInfo.exaltationDegree && Math.abs(degrees - rashiInfo.exaltationDegree) < 1) {
      return 'Exalted'; // Deep exaltation (within 1 degree)
    }
    return 'Exalted';
  }
  
  // Check debilitation (exact degree gets priority)
  if (rashiInfo.debilitationPlanet === planet) {
    if (rashiInfo.debilitationDegree && Math.abs(degrees - rashiInfo.debilitationDegree) < 1) {
      return 'Debilitated'; // Deep debilitation (within 1 degree)
    }
    // If not at exact degree, check if it's still enemy sign
    const rashiLord = rashiInfo.lord;
    const friendships = PLANETARY_FRIENDSHIPS[planet];
    if (friendships && friendships.enemies.includes(rashiLord)) {
      return 'Enemy Sign'; // Debilitated sign but not at exact degree
    }
    return 'Debilitated';
  }
  
  // Check own sign
  const ownSigns = PLANET_LORDSHIP[planet] || [];
  if (ownSigns.includes(rashiIndex)) {
    // Check moolatrikona
    if (rashiInfo.moolatrikona && 
        rashiInfo.moolatrikona.planet === planet &&
        degrees >= rashiInfo.moolatrikona.startDegree &&
        degrees <= rashiInfo.moolatrikona.endDegree) {
      return 'Moolatrikona';
    }
    return 'Own Sign';
  }
  
  // Check friendship
  const rashiLord = rashiInfo.lord;
  const friendships = PLANETARY_FRIENDSHIPS[planet];
  
  if (friendships) {
    if (friendships.friends.includes(rashiLord)) {
      return 'Friend Sign';
    }
    if (friendships.enemies.includes(rashiLord)) {
      return 'Enemy Sign';
    }
  }
  
  return 'Neutral';
}

/**
 * Calculate planetary strength (0-100)
 */
export function calculatePlanetaryStrength(
  dignity: PlanetaryDignity,
  degrees: number,
  isRetrograde: boolean
): number {
  let strength = 50; // Base strength
  
  // Dignity strength
  switch (dignity) {
    case 'Exalted':
      strength = 100;
      break;
    case 'Moolatrikona':
      strength = 90;
      break;
    case 'Own Sign':
      strength = 80;
      break;
    case 'Friend Sign':
      strength = 70;
      break;
    case 'Neutral':
      strength = 50;
      break;
    case 'Enemy Sign':
      strength = 30;
      break;
    case 'Debilitated':
      strength = 10;
      break;
  }
  
  // Retrograde adjustment (increases strength for outer planets)
  if (isRetrograde && ['Mars', 'Jupiter', 'Saturn'].includes(dignity)) {
    strength += 10;
  }
  
  // Degree-based adjustment (planets are stronger in middle degrees)
  const degreeStrength = 1 - Math.abs(degrees - 15) / 15;
  strength = strength * (0.8 + 0.2 * degreeStrength);
  
  return Math.min(100, Math.max(0, Math.round(strength)));
}

/**
 * Get dignity description
 */
export function getDignityDescription(dignity: PlanetaryDignity, planet: string): { en: string; hi: string } {
  const descriptions: Record<PlanetaryDignity, { en: string; hi: string }> = {
    'Exalted': {
      en: `${planet} is exalted, giving maximum positive results and strength`,
      hi: `${planet} उच्च है, अधिकतम सकारात्मक परिणाम और शक्ति देता है`
    },
    'Moolatrikona': {
      en: `${planet} is in Moolatrikona, very strong and auspicious`,
      hi: `${planet} मूलत्रिकोण में है, बहुत मजबूत और शुभ है`
    },
    'Own Sign': {
      en: `${planet} is in own sign, comfortable and strong`,
      hi: `${planet} अपनी राशि में है, आरामदायक और मजबूत है`
    },
    'Friend Sign': {
      en: `${planet} is in friend's sign, generally favorable`,
      hi: `${planet} मित्र की राशि में है, आम तौर पर अनुकूल है`
    },
    'Neutral': {
      en: `${planet} is in neutral sign, moderate results`,
      hi: `${planet} तटस्थ राशि में है, मध्यम परिणाम देता है`
    },
    'Enemy Sign': {
      en: `${planet} is in enemy's sign, challenging placement`,
      hi: `${planet} शत्रु की राशि में है, चुनौतीपूर्ण स्थिति है`
    },
    'Debilitated': {
      en: `${planet} is debilitated, weak and challenging`,
      hi: `${planet} नीच है, कमजोर और चुनौतीपूर्ण है`
    }
  };
  
  return descriptions[dignity];
}

/**
 * Calculate complete planetary strengths
 */
export function calculateAllPlanetaryStrengths(
  dateStr: string,
  timeStr: string
): PlanetaryStrength[] {
  const positions = calculateCompletePlanetaryPositions(dateStr, timeStr);
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const;
  
  return planets.map(planetKey => {
    const position = positions[planetKey];
    const planetName = planetKey.charAt(0).toUpperCase() + planetKey.slice(1);
    const dignity = calculatePlanetaryDignity(planetName, position.rashi, position.degrees);
    const strength = calculatePlanetaryStrength(dignity, position.degrees, position.retrograde || false);
    const description = getDignityDescription(dignity, planetName);
    
    return {
      planet: planetName,
      rashi: position.rashi,
      rashiName: position.rashiName,
      degrees: position.degrees,
      dignity,
      strength,
      isRetrograde: position.retrograde || false,
      description
    };
  });
}

/**
 * Get Sun sign (tropical zodiac)
 */
export function getSunSign(dateStr: string, timeStr: string): {
  tropical: { rashi: number; rashiName: string; degrees: number };
  sidereal: { rashi: number; rashiName: string; degrees: number };
} {
  const positions = calculateCompletePlanetaryPositions(dateStr, timeStr);
  const tropicalRashi = Math.floor(positions.sun.tropical / 30);
  const siderealRashi = positions.sun.rashi;
  
  return {
    tropical: {
      rashi: tropicalRashi,
      rashiName: RASHI_NAMES.en[tropicalRashi],
      degrees: positions.sun.tropical % 30
    },
    sidereal: {
      rashi: siderealRashi,
      rashiName: positions.sun.rashiName,
      degrees: positions.sun.degrees
    }
  };
}

/**
 * Get Moon sign (always sidereal in Vedic astrology)
 */
export function getMoonSign(dateStr: string, timeStr: string): {
  rashi: number;
  rashiName: string;
  degrees: number;
  rashiInfo: RashiInfo;
} {
  const positions = calculateCompletePlanetaryPositions(dateStr, timeStr);
  const rashiInfo = getRashiInfo(positions.moon.rashi);
  
  return {
    rashi: positions.moon.rashi,
    rashiName: positions.moon.rashiName,
    degrees: positions.moon.degrees,
    rashiInfo
  };
}

export default {
  getRashiInfo,
  calculatePlanetaryDignity,
  calculatePlanetaryStrength,
  calculateAllPlanetaryStrengths,
  getSunSign,
  getMoonSign,
  RASHI_DATA,
  PLANET_LORDSHIP,
  PLANETARY_FRIENDSHIPS
};