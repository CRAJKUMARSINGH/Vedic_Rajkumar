/**
 * Naming Logic Service - Nakshatra-Based Name Selection
 * Week 20: Baby Name Suggestions - Tuesday Implementation
 * Calculate nakshatra, extract lucky letters, and filter names
 */

import { calculateNakshatra } from './panchangService';
import { 
  getNakshatraLetters, 
  getLuckyLettersForPada, 
  searchNamesByLuckyLetters,
  searchNamesByNakshatra,
  type BabyName,
  type Gender
} from './babyNameService';

export interface BirthDetails {
  date: Date;
  time: string;  // HH:MM format
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface NamingRecommendation {
  nakshatra: string;
  pada: number;
  luckyLetters: string[];
  rulingPlanet: string;
  deity: string;
  description: {
    en: string;
    hi: string;
  };
  recommendedNames: BabyName[];
  totalNamesAvailable: number;
}

/**
 * Calculate Moon's longitude from birth details
 * Simplified calculation - in production, use Swiss Ephemeris
 */
function calculateMoonLongitude(birthDetails: BirthDetails): number {
  // Simplified calculation for demonstration
  // In production, integrate with ephemerisService or Swiss Ephemeris
  
  const date = birthDetails.date;
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Approximate Moon's position (moves ~13° per day)
  // Starting position + daily movement
  const approximateLongitude = (dayOfYear * 13.176358) % 360;
  
  // Add time-based adjustment (Moon moves ~0.5° per hour)
  const [hours, minutes] = birthDetails.time.split(':').map(Number);
  const timeAdjustment = (hours + minutes / 60) * 0.5;
  
  return (approximateLongitude + timeAdjustment) % 360;
}

/**
 * Calculate baby's birth nakshatra from birth details
 */
export function calculateBirthNakshatra(birthDetails: BirthDetails): {
  nakshatra: string;
  pada: number;
  moonLongitude: number;
} {
  const moonLongitude = calculateMoonLongitude(birthDetails);
  const nakshatraData = calculateNakshatra(moonLongitude);
  
  return {
    nakshatra: nakshatraData.name,
    pada: nakshatraData.pada,
    moonLongitude
  };
}

/**
 * Get lucky letters for baby based on birth nakshatra and pada
 */
export function getLuckyLettersForBaby(
  nakshatra: string,
  pada: number
): string[] {
  return getLuckyLettersForPada(nakshatra, pada);
}

/**
 * Get complete naming recommendation
 */
export function getNamingRecommendation(
  birthDetails: BirthDetails,
  gender: Gender
): NamingRecommendation {
  // Calculate birth nakshatra
  const { nakshatra, pada } = calculateBirthNakshatra(birthDetails);
  
  // Get nakshatra details
  const nakshatraDetails = getNakshatraLetters(nakshatra);
  if (!nakshatraDetails) {
    throw new Error(`Nakshatra ${nakshatra} not found in database`);
  }
  
  // Get lucky letters for specific pada
  const luckyLetters = getLuckyLettersForPada(nakshatra, pada);
  
  // Search names by lucky letters
  const namesByLetters = searchNamesByLuckyLetters(luckyLetters, gender);
  
  // Also get names by nakshatra compatibility
  const namesByNakshatra = searchNamesByNakshatra(nakshatra, gender);
  
  // Combine and deduplicate
  const allNames = [...namesByLetters];
  namesByNakshatra.forEach(name => {
    if (!allNames.find(n => n.id === name.id)) {
      allNames.push(name);
    }
  });
  
  // Sort by popularity
  const sortedNames = allNames.sort((a, b) => b.popularity - a.popularity);
  
  return {
    nakshatra,
    pada,
    luckyLetters,
    rulingPlanet: nakshatraDetails.rulingPlanet,
    deity: nakshatraDetails.deity,
    description: nakshatraDetails.description,
    recommendedNames: sortedNames,
    totalNamesAvailable: sortedNames.length
  };
}

/**
 * Filter names by multiple criteria
 */
export function filterNames(
  names: BabyName[],
  filters: {
    startingLetter?: string;
    minPopularity?: number;
    tags?: string[];
    origin?: string;
  }
): BabyName[] {
  return names.filter(name => {
    // Starting letter filter
    if (filters.startingLetter && 
        name.startingLetter.toUpperCase() !== filters.startingLetter.toUpperCase()) {
      return false;
    }
    
    // Popularity filter
    if (filters.minPopularity && name.popularity < filters.minPopularity) {
      return false;
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => 
        name.tags.some(nameTag => nameTag.toLowerCase() === tag.toLowerCase())
      );
      if (!hasTag) return false;
    }
    
    // Origin filter
    if (filters.origin && name.origin !== filters.origin) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get name suggestions with multiple sorting options
 */
export function getNameSuggestions(
  birthDetails: BirthDetails,
  gender: Gender,
  options: {
    sortBy?: 'popularity' | 'alphabetical' | 'numerology';
    limit?: number;
    filters?: {
      startingLetter?: string;
      minPopularity?: number;
      tags?: string[];
      origin?: string;
    };
  } = {}
): NamingRecommendation {
  // Get base recommendation
  const recommendation = getNamingRecommendation(birthDetails, gender);
  
  // Apply filters if provided
  let filteredNames = recommendation.recommendedNames;
  if (options.filters) {
    filteredNames = filterNames(filteredNames, options.filters);
  }
  
  // Apply sorting
  if (options.sortBy === 'alphabetical') {
    filteredNames.sort((a, b) => a.name.localeCompare(b.name));
  } else if (options.sortBy === 'numerology') {
    filteredNames.sort((a, b) => a.numerology.nameNumber - b.numerology.nameNumber);
  } else {
    // Default: sort by popularity
    filteredNames.sort((a, b) => b.popularity - a.popularity);
  }
  
  // Apply limit if provided
  if (options.limit && options.limit > 0) {
    filteredNames = filteredNames.slice(0, options.limit);
  }
  
  return {
    ...recommendation,
    recommendedNames: filteredNames,
    totalNamesAvailable: filteredNames.length
  };
}

/**
 * Check if a custom name is compatible with nakshatra
 */
export function checkNameCompatibility(
  name: string,
  nakshatra: string,
  pada: number
): {
  isCompatible: boolean;
  luckyLetters: string[];
  nameStartsWith: string;
  reason: {
    en: string;
    hi: string;
  };
} {
  const luckyLetters = getLuckyLettersForPada(nakshatra, pada);
  const firstLetter = name.charAt(0).toUpperCase();
  
  const isCompatible = luckyLetters.some(letter => 
    letter.toUpperCase().startsWith(firstLetter) || 
    firstLetter.startsWith(letter.toUpperCase())
  );
  
  return {
    isCompatible,
    luckyLetters,
    nameStartsWith: firstLetter,
    reason: isCompatible ? {
      en: `Name starts with lucky letter for ${nakshatra} nakshatra, pada ${pada}`,
      hi: `नाम ${nakshatra} नक्षत्र, पद ${pada} के शुभ अक्षर से शुरू होता है`
    } : {
      en: `Name does not start with lucky letters (${luckyLetters.join(', ')}) for ${nakshatra} nakshatra, pada ${pada}`,
      hi: `नाम ${nakshatra} नक्षत्र, पद ${pada} के शुभ अक्षरों (${luckyLetters.join(', ')}) से शुरू नहीं होता`
    }
  };
}

/**
 * Get naming guidelines for parents
 */
export function getNamingGuidelines(nakshatra: string): {
  en: string[];
  hi: string[];
} {
  const nakshatraDetails = getNakshatraLetters(nakshatra);
  if (!nakshatraDetails) {
    return { en: [], hi: [] };
  }
  
  return {
    en: [
      `Choose a name starting with one of the lucky letters: ${nakshatraDetails.allLetters.slice(0, 4).join(', ')}`,
      `Consider the ruling planet ${nakshatraDetails.rulingPlanet} when selecting the name`,
      `The deity ${nakshatraDetails.deity} is associated with this nakshatra`,
      'Ensure the name has a positive meaning and is easy to pronounce',
      'Check numerology compatibility with birth date',
      'Consider family traditions and cultural preferences'
    ],
    hi: [
      `शुभ अक्षरों में से एक से शुरू होने वाला नाम चुनें: ${nakshatraDetails.allLetters.slice(0, 4).join(', ')}`,
      `नाम चुनते समय शासक ग्रह ${nakshatraDetails.rulingPlanet} पर विचार करें`,
      `देवता ${nakshatraDetails.deity} इस नक्षत्र से जुड़े हैं`,
      'सुनिश्चित करें कि नाम का सकारात्मक अर्थ है और उच्चारण करना आसान है',
      'जन्म तिथि के साथ अंकशास्त्र संगतता की जांच करें',
      'पारिवारिक परंपराओं और सांस्कृतिक प्राथमिकताओं पर विचार करें'
    ]
  };
}

/**
 * Get popular names for nakshatra
 */
export function getPopularNamesForNakshatra(
  nakshatra: string,
  gender: Gender,
  limit: number = 10
): BabyName[] {
  const names = searchNamesByNakshatra(nakshatra, gender);
  return names
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Get all available starting letters for nakshatra
 */
export function getAvailableLettersForNakshatra(nakshatra: string): {
  pada1: string[];
  pada2: string[];
  pada3: string[];
  pada4: string[];
  all: string[];
} {
  const nakshatraDetails = getNakshatraLetters(nakshatra);
  if (!nakshatraDetails) {
    return { pada1: [], pada2: [], pada3: [], pada4: [], all: [] };
  }
  
  return {
    pada1: nakshatraDetails.pada1,
    pada2: nakshatraDetails.pada2,
    pada3: nakshatraDetails.pada3,
    pada4: nakshatraDetails.pada4,
    all: nakshatraDetails.allLetters
  };
}

export default {
  calculateBirthNakshatra,
  getLuckyLettersForBaby,
  getNamingRecommendation,
  getNameSuggestions,
  filterNames,
  checkNameCompatibility,
  getNamingGuidelines,
  getPopularNamesForNakshatra,
  getAvailableLettersForNakshatra
};
