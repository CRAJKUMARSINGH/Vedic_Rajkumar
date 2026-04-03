/**
 * Career Astrology Service
 * Professional guidance based on 10th house analysis and planetary indicators
 */

import { calculateCompleteAscendant, type AscendantData } from './ascendantService';
import { calculateCompletePlanetaryPositions, type CompletePlanetaryPositions } from './ephemerisService';
import { calculateShodashVarga, getNavamsha } from './divisionalChartsService';
import { searchLocation } from './geocodingService';
import { generateAllAuspiciousTimings, type AuspiciousTimingResult } from './auspiciousTimesService';

// Fallback city coordinates for common Indian cities
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  delhi: { lat: 28.61, lon: 77.23 }, mumbai: { lat: 19.08, lon: 72.88 },
  bangalore: { lat: 12.97, lon: 77.59 }, kolkata: { lat: 22.57, lon: 88.36 },
  chennai: { lat: 13.08, lon: 80.27 }, hyderabad: { lat: 17.39, lon: 78.49 },
  ahmedabad: { lat: 23.03, lon: 72.58 }, pune: { lat: 18.52, lon: 73.86 },
  jaipur: { lat: 26.91, lon: 75.79 }, indore: { lat: 22.72, lon: 75.86 },
  dungarpur: { lat: 23.84, lon: 73.71 }, banswara: { lat: 23.54, lon: 74.44 },
  aspur: { lat: 23.84, lon: 73.71 }, udaipur: { lat: 24.59, lon: 73.71 },
};

async function resolveCoordinates(placeOfBirth: string): Promise<{ lat: number; lon: number }> {
  // Try geocoding API first
  try {
    const results = await searchLocation(placeOfBirth);
    if (results.length > 0) return { lat: results[0].lat, lon: results[0].lon };
  } catch { /* fall through */ }

  // Fallback: match against known cities
  const key = placeOfBirth.toLowerCase().split(',')[0].trim();
  if (CITY_COORDS[key]) return CITY_COORDS[key];

  // Default to central India
  return { lat: 23.0, lon: 77.0 };
}

// ==================== CAREER INDICATORS ====================

export interface CareerIndicator {
  planet: string;
  strength: 'Excellent' | 'Good' | 'Average' | 'Weak';
  position: {
    house: number;
    rashi: number;
    degrees: number;
  };
  significance: string;
  careerFields: string[];
}

export interface TransitPeriod {
  planet: string;
  rashi: number;
  startDate: string;
  endDate: string;
  type: 'Positive' | 'Negative';
}

export interface CareerAnalysis {
  tenthHouse: {
    rashi: number;
    rashiName: string;
    lord: string;
    lordPosition: {
      house: number;
      rashi: number;
      strength: string;
    };
    planetsIn10th: string[];
    strength: 'Excellent' | 'Good' | 'Average' | 'Weak';
  };
  careerIndicators: CareerIndicator[];
  recommendedFields: {
    primary: string[];
    secondary: string[];
    avoid: string[];
  };
  careerStrength: {
    overall: number; // 0-100
    government: number;
    business: number;
    service: number;
    creative: number;
  };
  timing: {
    currentPeriod: string;
    favorablePeriods: string[];
    challengingPeriods: string[];
  };
  auspiciousTimings: Record<string, AuspiciousTimingResult>;
  planetaryPositions: any[];
  ascendantRashi: number;
  doshas?: string[];
  recommendations: {
    en: string[];
    hi: string[];
  };
}

// ==================== CAREER FIELD MAPPINGS ====================

const PLANET_CAREER_FIELDS: Record<string, string[]> = {
  'Sun': [
    'Government Service', 'Administration', 'Politics', 'Leadership Roles',
    'Medicine (Cardiology)', 'Pharmacy', 'Gold/Jewelry Business', 'Authority Positions'
  ],
  'Moon': [
    'Public Relations', 'Hospitality', 'Food Industry', 'Dairy Business',
    'Water-related Business', 'Psychology', 'Nursing', 'Travel Industry'
  ],
  'Mercury': [
    'Communication', 'Writing', 'Journalism', 'Teaching', 'Accounting',
    'Banking', 'IT/Software', 'Sales', 'Publishing', 'Mathematics'
  ],
  'Mars': [
    'Military', 'Police', 'Engineering', 'Surgery', 'Sports', 'Real Estate',
    'Construction', 'Metallurgy', 'Fire-related Work', 'Mechanical Fields'
  ],
  'Jupiter': [
    'Teaching', 'Law', 'Judiciary', 'Religious Work', 'Philosophy',
    'Finance', 'Banking', 'Counseling', 'Advisory Roles', 'Research'
  ],
  'Venus': [
    'Arts', 'Entertainment', 'Fashion', 'Beauty Industry', 'Luxury Goods',
    'Interior Design', 'Music', 'Dance', 'Hospitality', 'Jewelry'
  ],
  'Saturn': [
    'Service Industry', 'Labor Work', 'Mining', 'Agriculture', 'Oil Industry',
    'Iron/Steel', 'Discipline-based Work', 'Social Service', 'Research'
  ]
};
const RASHI_CAREER_TENDENCIES: Record<number, string[]> = {
  0: ['Leadership', 'Military', 'Sports', 'Engineering'], // Aries
  1: ['Banking', 'Agriculture', 'Food Industry', 'Arts'], // Taurus
  2: ['Communication', 'Writing', 'Teaching', 'Sales'], // Gemini
  3: ['Public Service', 'Hospitality', 'Psychology', 'Water Business'], // Cancer
  4: ['Government', 'Administration', 'Entertainment', 'Gold Business'], // Leo
  5: ['Service', 'Health', 'Accounting', 'Analysis'], // Virgo
  6: ['Law', 'Diplomacy', 'Arts', 'Partnership Business'], // Libra
  7: ['Research', 'Investigation', 'Surgery', 'Occult Sciences'], // Scorpio
  8: ['Teaching', 'Law', 'Philosophy', 'Foreign Trade'], // Sagittarius
  9: ['Administration', 'Politics', 'Mining', 'Discipline-based Work'], // Capricorn
  10: ['Social Service', 'Technology', 'Innovation', 'Humanitarian Work'], // Aquarius
  11: ['Creative Arts', 'Spirituality', 'Water Business', 'Healing'] // Pisces
};

// ==================== HOUSE SIGNIFICANCE ====================

const HOUSE_CAREER_SIGNIFICANCE: Record<number, string> = {
  1: 'Self, Personality, Overall Approach to Career',
  2: 'Wealth, Family Business, Speech-based Professions',
  3: 'Communication, Courage, Short Journeys, Media',
  4: 'Real Estate, Agriculture, Mother\'s Influence, Homeland',
  5: 'Creativity, Speculation, Entertainment, Children-related Work',
  6: 'Service, Health, Competition, Daily Work Routine',
  7: 'Partnership, Business, Foreign Connections, Spouse\'s Career',
  8: 'Research, Occult, Insurance, Transformation-based Work',
  9: 'Higher Education, Law, Philosophy, Foreign Connections',
  10: 'Main Career, Reputation, Authority, Government Work',
  11: 'Gains, Network, Large Organizations, Hopes and Wishes',
  12: 'Foreign Lands, Spirituality, Hospitals, Behind-the-scenes Work'
};

// ==================== PLANETARY STRENGTH CALCULATION ====================

function calculatePlanetaryStrength(
  planet: string,
  house: number,
  rashi: number,
  degrees: number
): 'Excellent' | 'Good' | 'Average' | 'Weak' {
  let strength = 50; // Base strength
  
  // Exaltation/Debilitation
  const exaltationRashis: Record<string, number> = {
    'Sun': 0, 'Moon': 1, 'Mercury': 5, 'Mars': 9, 
    'Jupiter': 3, 'Venus': 11, 'Saturn': 6
  };
  
  const debilitationRashis: Record<string, number> = {
    'Sun': 6, 'Moon': 7, 'Mercury': 11, 'Mars': 3,
    'Jupiter': 9, 'Venus': 5, 'Saturn': 0
  };
  
  if (exaltationRashis[planet] === rashi) strength += 30;
  else if (debilitationRashis[planet] === rashi) strength -= 30;
  
  // Own sign (Swakshetra)
  const ownSigns: Record<string, number[]> = {
    'Sun': [4], 'Moon': [3], 'Mercury': [2, 5], 'Mars': [0, 7],
    'Jupiter': [8, 11], 'Venus': [1, 6], 'Saturn': [9, 10]
  };
  
  if (ownSigns[planet]?.includes(rashi)) strength += 20;
  
  // House position strength
  const strongHouses = [1, 4, 7, 10]; // Kendra houses
  const moderateHouses = [5, 9]; // Trikona houses
  
  if (strongHouses.includes(house)) strength += 15;
  else if (moderateHouses.includes(house)) strength += 10;
  else if ([6, 8, 12].includes(house)) strength -= 10; // Dusthana houses
  
  // Convert to category
  if (strength >= 80) return 'Excellent';
  if (strength >= 60) return 'Good';
  if (strength >= 40) return 'Average';
  return 'Weak';
}

// ==================== 10TH HOUSE ANALYSIS ====================

function analyze10thHouse(
  ascendantData: AscendantData,
  planetaryPositions: CompletePlanetaryPositions
): CareerAnalysis['tenthHouse'] {
  const tenthHouseCusp = ascendantData.houseCusps[9]; // 10th house (0-indexed)
  const tenthRashi = tenthHouseCusp.rashi;
  const tenthLord = tenthHouseCusp.lord;
  
  // Find 10th lord position
  const lordPlanetName = tenthLord.toLowerCase();
  let lordPosition = { house: 1, rashi: 0, strength: 'Average' };
  
  // Find planets in 10th house
  const planetsIn10th: string[] = [];
  
  planetaryPositions.planets.forEach((position) => {
    const planet = position.name;
    const longitude = position.rashiIndex * 30 + position.degrees;
    const planetHouse = findHouseForPlanet(longitude, ascendantData.houseCusps);
    
    if (planetHouse === 10) {
      planetsIn10th.push(planet);
    }
    
    if (planet.toLowerCase() === lordPlanetName) {
      lordPosition = {
        house: planetHouse,
        rashi: position.rashiIndex,
        strength: calculatePlanetaryStrength(planet, planetHouse, position.rashiIndex, position.degrees)
      };
    }
  });
  
  // Calculate 10th house strength
  let houseStrength = 'Average';
  if (lordPosition.strength === 'Excellent' && planetsIn10th.length > 0) {
    houseStrength = 'Excellent';
  } else if (lordPosition.strength === 'Good' || planetsIn10th.length > 0) {
    houseStrength = 'Good';
  } else if (lordPosition.strength === 'Weak') {
    houseStrength = 'Weak';
  }
  
  return {
    rashi: tenthRashi,
    rashiName: tenthHouseCusp.rashiName,
    lord: tenthLord,
    lordPosition,
    planetsIn10th,
    strength: houseStrength as 'Excellent' | 'Good' | 'Average' | 'Weak'
  };
}

// ==================== HELPER FUNCTIONS ====================

function findHouseForPlanet(planetLongitude: number, houseCusps: AscendantData['houseCusps']): number {
  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i].cusp;
    const nextCusp = houseCusps[(i + 1) % 12].cusp;
    
    if (nextCusp > currentCusp) {
      if (planetLongitude >= currentCusp && planetLongitude < nextCusp) {
        return i + 1;
      }
    } else {
      // Handle wrap-around (e.g., 350° to 30°)
      if (planetLongitude >= currentCusp || planetLongitude < nextCusp) {
        return i + 1;
      }
    }
  }
  return 1; // Default to 1st house
}

function calculateCareerStrength(
  tenthHouse: CareerAnalysis['tenthHouse'],
  indicators: CareerIndicator[]
): CareerAnalysis['careerStrength'] {
  let overall = 50;
  let government = 30;
  let business = 30;
  let service = 30;
  let creative = 30;
  
  // 10th house strength contribution
  const houseStrengthBonus = {
    'Excellent': 25, 'Good': 15, 'Average': 5, 'Weak': -10
  };
  overall += houseStrengthBonus[tenthHouse.strength];
  
  // Planetary indicators contribution
  indicators.forEach(indicator => {
    const strengthBonus = {
      'Excellent': 20, 'Good': 10, 'Average': 5, 'Weak': -5
    };
    const bonus = strengthBonus[indicator.strength];
    
    overall += bonus / 2; // Reduced impact for overall
    
    // Specific career type bonuses
    if (indicator.planet === 'Sun') government += bonus;
    if (['Mercury', 'Jupiter'].includes(indicator.planet)) business += bonus;
    if (['Saturn', 'Moon'].includes(indicator.planet)) service += bonus;
    if (['Venus', 'Moon'].includes(indicator.planet)) creative += bonus;
  });
  
  // Normalize to 0-100 range
  return {
    overall: Math.max(0, Math.min(100, overall)),
    government: Math.max(0, Math.min(100, government)),
    business: Math.max(0, Math.min(100, business)),
    service: Math.max(0, Math.min(100, service)),
    creative: Math.max(0, Math.min(100, creative))
  };
}
// ==================== CAREER RECOMMENDATIONS ====================

function generateCareerRecommendations(
  tenthHouse: CareerAnalysis['tenthHouse'],
  indicators: CareerIndicator[],
  strength: CareerAnalysis['careerStrength']
): { primary: string[]; secondary: string[]; avoid: string[] } {
  const primary: string[] = [];
  const secondary: string[] = [];
  const avoid: string[] = [];
  
  // Add fields from 10th house rashi
  const rashiFields = RASHI_CAREER_TENDENCIES[tenthHouse.rashi] || [];
  primary.push(...rashiFields.slice(0, 2));
  secondary.push(...rashiFields.slice(2));
  
  // Add fields from strong planetary indicators
  indicators.forEach(indicator => {
    if (indicator.strength === 'Excellent' || indicator.strength === 'Good') {
      const planetFields = PLANET_CAREER_FIELDS[indicator.planet] || [];
      primary.push(...planetFields.slice(0, 3));
      secondary.push(...planetFields.slice(3));
    } else if (indicator.strength === 'Weak') {
      const planetFields = PLANET_CAREER_FIELDS[indicator.planet] || [];
      avoid.push(...planetFields.slice(0, 2));
    }
  });
  
  // Remove duplicates and limit
  return {
    primary: [...new Set(primary)].slice(0, 8),
    secondary: [...new Set(secondary)].slice(0, 6),
    avoid: [...new Set(avoid)].slice(0, 4)
  };
}

function generateRecommendations(
  analysis: Omit<CareerAnalysis, 'recommendations'>
): { en: string[]; hi: string[] } {
  const recommendations: { en: string[]; hi: string[] } = { en: [], hi: [] };
  
  // Overall strength recommendations
  if (analysis.careerStrength.overall >= 80) {
    recommendations.en.push('Excellent career potential! You have strong planetary support for professional success.');
    recommendations.hi.push('उत्कृष्ट करियर क्षमता! आपके पास व्यावसायिक सफलता के लिए मजबूत ग्रह समर्थन है।');
  } else if (analysis.careerStrength.overall >= 60) {
    recommendations.en.push('Good career prospects. Focus on your strengths and work on weak areas.');
    recommendations.hi.push('अच्छी करियर संभावनाएं। अपनी शक्तियों पर ध्यान दें और कमजोर क्षेत्रों पर काम करें।');
  } else {
    recommendations.en.push('Career requires extra effort. Consider remedies and skill development.');
    recommendations.hi.push('करियर में अतिरिक्त प्रयास की आवश्यकता। उपाय और कौशल विकास पर विचार करें।');
  }
  
  // 10th house specific recommendations
  if (analysis.tenthHouse.strength === 'Excellent') {
    recommendations.en.push('Your 10th house is very strong. Leadership and authority roles suit you well.');
    recommendations.hi.push('आपका 10वां भाव बहुत मजबूत है। नेतृत्व और अधिकार की भूमिकाएं आपके लिए उपयुक्त हैं।');
  } else if (analysis.tenthHouse.strength === 'Weak') {
    recommendations.en.push('Strengthen your 10th house through remedies and hard work.');
    recommendations.hi.push('उपाय और कड़ी मेहनत के माध्यम से अपने 10वें भाव को मजबूत करें।');
  }
  
  // Field-specific recommendations
  if (analysis.recommendedFields.primary.length > 0) {
    recommendations.en.push(`Primary career fields: ${analysis.recommendedFields.primary.slice(0, 3).join(', ')}`);
    recommendations.hi.push(`प्राथमिक करियर क्षेत्र: ${analysis.recommendedFields.primary.slice(0, 3).join(', ')}`);
  }
  
  // Strength-based recommendations
  const maxStrength = Math.max(
    analysis.careerStrength.government,
    analysis.careerStrength.business,
    analysis.careerStrength.service,
    analysis.careerStrength.creative
  );
  
  if (analysis.careerStrength.government === maxStrength && maxStrength >= 70) {
    recommendations.en.push('Government service and administrative roles are highly favorable for you.');
    recommendations.hi.push('सरकारी सेवा और प्रशासनिक भूमिकाएं आपके लिए अत्यधिक अनुकूल हैं।');
  } else if (analysis.careerStrength.business === maxStrength && maxStrength >= 70) {
    recommendations.en.push('Business and entrepreneurship show excellent potential.');
    recommendations.hi.push('व्यापार और उद्यमिता उत्कृष्ट क्षमता दिखाते हैं।');
  } else if (analysis.careerStrength.creative === maxStrength && maxStrength >= 70) {
    recommendations.en.push('Creative fields and artistic pursuits are your forte.');
    recommendations.hi.push('रचनात्मक क्षेत्र और कलात्मक गतिविधियां आपकी विशेषता हैं।');
  }
  
  return recommendations;
}

// ==================== MAIN CAREER ANALYSIS FUNCTION ====================

export async function analyzeCareer(
  dateOfBirth: string,
  timeOfBirth: string,
  placeOfBirth: string
): Promise<CareerAnalysis> {
  try {
    // Resolve coordinates from place name
    const coordinates = await resolveCoordinates(placeOfBirth);
    
    // Calculate ascendant and houses
    const ascendantData = calculateCompleteAscendant(
      dateOfBirth,
      timeOfBirth,
      coordinates.lat,
      coordinates.lon
    );
    
    // Calculate planetary positions
    const planetaryPositions = calculateCompletePlanetaryPositions(
      dateOfBirth,
      timeOfBirth
    );
    
    // Analyze 10th house
    const tenthHouse = analyze10thHouse(ascendantData, planetaryPositions);
    
    // Analyze career indicators
    const careerIndicators: CareerIndicator[] = [];
    
    // Major career planets: Sun, Mercury, Jupiter, Saturn
    const majorCareerPlanets = ['Sun', 'Mercury', 'Jupiter', 'Saturn'];
    
    majorCareerPlanets.forEach(planet => {
      const position = planetaryPositions.planets.find(p => p.name.toLowerCase() === planet.toLowerCase());
      if (position) {
        const longitude = position.rashiIndex * 30 + position.degrees;
        const house = findHouseForPlanet(longitude, ascendantData.houseCusps);
        const strength = calculatePlanetaryStrength(planet, house, position.rashiIndex, position.degrees);
        
        careerIndicators.push({
          planet,
          strength,
          position: {
            house,
            rashi: position.rashiIndex,
            degrees: position.degrees
          },
          significance: HOUSE_CAREER_SIGNIFICANCE[house],
          careerFields: PLANET_CAREER_FIELDS[planet] || []
        });
      }
    });
    
    // Calculate career strength
    const careerStrength = calculateCareerStrength(tenthHouse, careerIndicators);
    
    // Generate field recommendations
    const recommendedFields = generateCareerRecommendations(tenthHouse, careerIndicators, careerStrength);
    
    // Simple timing analysis (can be enhanced with dasha system later)
    const timing = {
      currentPeriod: 'General Period',
      favorablePeriods: ['Jupiter Transit', 'Sun Period'],
      challengingPeriods: ['Saturn Transit', 'Rahu Period']
    };
    
    // Calculate All Auspicious Timings Engine
    const auspiciousTimings = generateAllAuspiciousTimings(ascendantData, planetaryPositions);
    
    // Create analysis object without recommendations first
    const analysisWithoutRecs: Omit<CareerAnalysis, 'recommendations'> = {
      tenthHouse,
      careerIndicators,
      recommendedFields,
      careerStrength,
      timing,
      auspiciousTimings,
      planetaryPositions: planetaryPositions.planets,
      ascendantRashi: ascendantData.ascendant.rashiIndex,
      doshas: []
    };
    
    // Generate recommendations
    const recommendations = generateRecommendations(analysisWithoutRecs);
    
    return {
      ...analysisWithoutRecs,
      recommendations
    };
    
  } catch (error) {
    throw new Error(`Career analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default {
  analyzeCareer,
  PLANET_CAREER_FIELDS,
  RASHI_CAREER_TENDENCIES,
  HOUSE_CAREER_SIGNIFICANCE
};