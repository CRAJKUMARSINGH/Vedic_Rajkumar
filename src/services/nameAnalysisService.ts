/**
 * Name Analysis Service - Comprehensive Name Strength & Recommendations
 * Week 20: Baby Name Suggestions - Wednesday Implementation
 * Analyze names with planetary influences and provide intelligent recommendations
 */

import { calculateNameNumber, analyzeNameNumerology, type NumerologyAnalysis } from './nameNumerologyService';
import { checkNameCompatibility } from './namingLogicService';
import { getNakshatraLetters, type BabyName } from './babyNameService';

export interface NameStrengthAnalysis {
  name: string;
  overallStrength: number; // 0-100
  nakshatraCompatibility: number; // 0-100
  numerologyScore: number; // 0-100
  planetaryScore: number; // 0-100
  meaningScore: number; // 0-100
  pronunciationScore: number; // 0-100
  popularityScore: number; // 0-100
  rating: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Below Average';
  strengths: {
    en: string[];
    hi: string[];
  };
  weaknesses: {
    en: string[];
    hi: string[];
  };
  recommendations: {
    en: string[];
    hi: string[];
  };
}

export interface DetailedNameRecommendation {
  name: BabyName;
  strengthAnalysis: NameStrengthAnalysis;
  numerologyAnalysis: NumerologyAnalysis;
  rank: number;
  score: number; // Combined score 0-100
  isTopChoice: boolean;
}

export interface BirthChartContext {
  nakshatra: string;
  pada: number;
  birthDate: Date;
  rulingPlanet: string;
  moonSign?: string;
  ascendant?: string;
}

/**
 * Planetary strength mapping for nakshatras
 */
const PLANETARY_STRENGTH: Record<string, number> = {
  'Sun': 90,
  'Moon': 85,
  'Mars': 75,
  'Mercury': 80,
  'Jupiter': 95,
  'Venus': 85,
  'Saturn': 70,
  'Rahu': 65,
  'Ketu': 70
};

/**
 * Calculate nakshatra compatibility score
 */
function calculateNakshatraCompatibilityScore(
  name: string,
  nakshatra: string,
  pada: number
): number {
  const compatibility = checkNameCompatibility(name, nakshatra, pada);
  return compatibility.isCompatible ? 100 : 30;
}

/**
 * Calculate planetary influence score
 */
function calculatePlanetaryScore(
  name: string,
  rulingPlanet: string
): number {
  const baseScore = PLANETARY_STRENGTH[rulingPlanet] || 70;
  
  // Bonus for names starting with planet-friendly letters
  const firstLetter = name.charAt(0).toUpperCase();
  const planetaryLetters: Record<string, string[]> = {
    'Sun': ['A', 'I', 'U', 'E'],
    'Moon': ['O', 'V', 'H'],
    'Mars': ['K', 'G', 'C'],
    'Mercury': ['B', 'N', 'P'],
    'Jupiter': ['J', 'Y', 'T'],
    'Venus': ['L', 'S', 'R'],
    'Saturn': ['D', 'M', 'N'],
    'Rahu': ['K', 'G'],
    'Ketu': ['C', 'L']
  };
  
  const friendlyLetters = planetaryLetters[rulingPlanet] || [];
  const hasBonus = friendlyLetters.includes(firstLetter);
  
  return hasBonus ? Math.min(100, baseScore + 10) : baseScore;
}

/**
 * Calculate meaning score based on positive associations
 */
function calculateMeaningScore(name: BabyName): number {
  const meaning = name.meaning.en.toLowerCase();
  
  // Positive keywords
  const positiveKeywords = [
    'god', 'divine', 'blessed', 'auspicious', 'prosperity', 'wealth',
    'wisdom', 'knowledge', 'peace', 'love', 'light', 'bright',
    'victory', 'success', 'powerful', 'strong', 'beautiful', 'pure'
  ];
  
  // Negative keywords
  const negativeKeywords = [
    'dark', 'death', 'destruction', 'anger', 'sorrow', 'pain'
  ];
  
  let score = 70; // Base score
  
  // Add points for positive keywords
  positiveKeywords.forEach(keyword => {
    if (meaning.includes(keyword)) {
      score += 5;
    }
  });
  
  // Subtract points for negative keywords
  negativeKeywords.forEach(keyword => {
    if (meaning.includes(keyword)) {
      score -= 10;
    }
  });
  
  // Bonus for deity association
  if (name.deity) {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate pronunciation score
 */
function calculatePronunciationScore(name: BabyName): number {
  const nameLength = name.name.length;
  let score = 80; // Base score
  
  // Ideal length: 4-8 characters
  if (nameLength >= 4 && nameLength <= 8) {
    score += 10;
  } else if (nameLength < 4) {
    score += 5; // Short names are still good
  } else if (nameLength > 10) {
    score -= 10; // Very long names are harder
  }
  
  // Check for difficult consonant clusters
  const difficultClusters = ['thr', 'shr', 'ksh', 'jny', 'dny'];
  const hasdifficultCluster = difficultClusters.some(cluster => 
    name.name.toLowerCase().includes(cluster)
  );
  
  if (hasdifficultCluster) {
    score -= 5;
  }
  
  // Bonus for phonetic clarity
  if (name.pronunciation.phonetic.length > 0) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate popularity score
 */
function calculatePopularityScore(name: BabyName): number {
  // Convert popularity (1-10) to score (0-100)
  return name.popularity * 10;
}

/**
 * Analyze name strength comprehensively
 */
export function analyzeNameStrength(
  name: BabyName,
  birthContext: BirthChartContext
): NameStrengthAnalysis {
  // Calculate individual scores
  const nakshatraCompatibility = calculateNakshatraCompatibilityScore(
    name.name,
    birthContext.nakshatra,
    birthContext.pada
  );
  
  const numerologyAnalysis = analyzeNameNumerology(name.name, birthContext.birthDate);
  const numerologyScore = numerologyAnalysis.compatibility;
  
  const planetaryScore = calculatePlanetaryScore(name.name, birthContext.rulingPlanet);
  const meaningScore = calculateMeaningScore(name);
  const pronunciationScore = calculatePronunciationScore(name);
  const popularityScore = calculatePopularityScore(name);
  
  // Calculate weighted overall strength
  const overallStrength = Math.round(
    (nakshatraCompatibility * 0.30) +  // 30% weight
    (numerologyScore * 0.25) +          // 25% weight
    (planetaryScore * 0.20) +           // 20% weight
    (meaningScore * 0.10) +             // 10% weight
    (pronunciationScore * 0.10) +       // 10% weight
    (popularityScore * 0.05)            // 5% weight
  );
  
  // Determine rating
  let rating: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Below Average';
  if (overallStrength >= 85) rating = 'Excellent';
  else if (overallStrength >= 75) rating = 'Very Good';
  else if (overallStrength >= 65) rating = 'Good';
  else if (overallStrength >= 50) rating = 'Average';
  else rating = 'Below Average';
  
  // Identify strengths
  const strengths = { en: [] as string[], hi: [] as string[] };
  
  if (nakshatraCompatibility >= 90) {
    strengths.en.push('Perfect nakshatra compatibility');
    strengths.hi.push('पूर्ण नक्षत्र संगतता');
  }
  
  if (numerologyScore >= 80) {
    strengths.en.push('Excellent numerology harmony');
    strengths.hi.push('उत्कृष्ट अंकशास्त्र सामंजस्य');
  }
  
  if (planetaryScore >= 85) {
    strengths.en.push('Strong planetary support');
    strengths.hi.push('मजबूत ग्रह समर्थन');
  }
  
  if (meaningScore >= 85) {
    strengths.en.push('Highly auspicious meaning');
    strengths.hi.push('अत्यंत शुभ अर्थ');
  }
  
  if (pronunciationScore >= 85) {
    strengths.en.push('Easy to pronounce');
    strengths.hi.push('उच्चारण में आसान');
  }
  
  if (popularityScore >= 80) {
    strengths.en.push('Popular and well-accepted');
    strengths.hi.push('लोकप्रिय और सुस्वीकृत');
  }
  
  // Identify weaknesses
  const weaknesses = { en: [] as string[], hi: [] as string[] };
  
  if (nakshatraCompatibility < 50) {
    weaknesses.en.push('Not compatible with birth nakshatra');
    weaknesses.hi.push('जन्म नक्षत्र के साथ संगत नहीं');
  }
  
  if (numerologyScore < 60) {
    weaknesses.en.push('Low numerology compatibility');
    weaknesses.hi.push('कम अंकशास्त्र संगतता');
  }
  
  if (planetaryScore < 70) {
    weaknesses.en.push('Weak planetary influence');
    weaknesses.hi.push('कमजोर ग्रह प्रभाव');
  }
  
  if (pronunciationScore < 70) {
    weaknesses.en.push('Difficult pronunciation');
    weaknesses.hi.push('कठिन उच्चारण');
  }
  
  // Generate recommendations
  const recommendations = { en: [] as string[], hi: [] as string[] };
  
  if (overallStrength >= 85) {
    recommendations.en.push('Highly recommended - excellent choice for your baby');
    recommendations.hi.push('अत्यधिक अनुशंसित - आपके बच्चे के लिए उत्कृष्ट विकल्प');
  } else if (overallStrength >= 75) {
    recommendations.en.push('Very good choice with strong astrological support');
    recommendations.hi.push('मजबूत ज्योतिषीय समर्थन के साथ बहुत अच्छा विकल्प');
  } else if (overallStrength >= 65) {
    recommendations.en.push('Good name with positive influences');
    recommendations.hi.push('सकारात्मक प्रभावों के साथ अच्छा नाम');
  } else if (overallStrength >= 50) {
    recommendations.en.push('Average choice - consider other options');
    recommendations.hi.push('औसत विकल्प - अन्य विकल्पों पर विचार करें');
  } else {
    recommendations.en.push('Not recommended - explore better alternatives');
    recommendations.hi.push('अनुशंसित नहीं - बेहतर विकल्प तलाशें');
  }
  
  if (nakshatraCompatibility >= 90 && numerologyScore >= 80) {
    recommendations.en.push('Perfect combination of nakshatra and numerology');
    recommendations.hi.push('नक्षत्र और अंकशास्त्र का सही संयोजन');
  }
  
  if (name.deity) {
    recommendations.en.push(`Associated with deity ${name.deity} - brings divine blessings`);
    recommendations.hi.push(`देवता ${name.deity} से जुड़ा - दिव्य आशीर्वाद लाता है`);
  }
  
  return {
    name: name.name,
    overallStrength,
    nakshatraCompatibility,
    numerologyScore,
    planetaryScore,
    meaningScore,
    pronunciationScore,
    popularityScore,
    rating,
    strengths,
    weaknesses,
    recommendations
  };
}

/**
 * Get top name recommendations with detailed analysis
 */
export function getTopNameRecommendations(
  names: BabyName[],
  birthContext: BirthChartContext,
  limit: number = 10
): DetailedNameRecommendation[] {
  // Analyze all names
  const analyzed = names.map(name => {
    const strengthAnalysis = analyzeNameStrength(name, birthContext);
    const numerologyAnalysis = analyzeNameNumerology(name.name, birthContext.birthDate);
    
    return {
      name,
      strengthAnalysis,
      numerologyAnalysis,
      rank: 0,
      score: strengthAnalysis.overallStrength,
      isTopChoice: false
    };
  });
  
  // Sort by score
  analyzed.sort((a, b) => b.score - a.score);
  
  // Assign ranks and mark top choices
  analyzed.forEach((item, index) => {
    item.rank = index + 1;
    item.isTopChoice = index < 3; // Top 3 are marked as top choices
  });
  
  // Return top N
  return analyzed.slice(0, limit);
}

/**
 * Compare multiple names side by side
 */
export function compareNames(
  names: BabyName[],
  birthContext: BirthChartContext
): {
  names: string[];
  comparison: {
    category: string;
    scores: number[];
  }[];
  winner: string;
  recommendations: {
    en: string[];
    hi: string[];
  };
} {
  const analyses = names.map(name => analyzeNameStrength(name, birthContext));
  
  const comparison = [
    {
      category: 'Overall Strength',
      scores: analyses.map(a => a.overallStrength)
    },
    {
      category: 'Nakshatra Compatibility',
      scores: analyses.map(a => a.nakshatraCompatibility)
    },
    {
      category: 'Numerology Score',
      scores: analyses.map(a => a.numerologyScore)
    },
    {
      category: 'Planetary Score',
      scores: analyses.map(a => a.planetaryScore)
    },
    {
      category: 'Meaning Score',
      scores: analyses.map(a => a.meaningScore)
    },
    {
      category: 'Pronunciation Score',
      scores: analyses.map(a => a.pronunciationScore)
    }
  ];
  
  // Find winner (highest overall strength)
  const winnerIndex = analyses.reduce((maxIdx, curr, idx, arr) => 
    curr.overallStrength > arr[maxIdx].overallStrength ? idx : maxIdx, 0
  );
  
  const winner = names[winnerIndex].name;
  
  // Generate comparison recommendations
  const recommendations = {
    en: [
      `${winner} has the highest overall strength (${analyses[winnerIndex].overallStrength}/100)`,
      `All names are compatible with ${birthContext.nakshatra} nakshatra`,
      'Consider personal preference and family traditions in final selection'
    ],
    hi: [
      `${winner} की समग्र शक्ति सबसे अधिक है (${analyses[winnerIndex].overallStrength}/100)`,
      `सभी नाम ${birthContext.nakshatra} नक्षत्र के साथ संगत हैं`,
      'अंतिम चयन में व्यक्तिगत पसंद और पारिवारिक परंपराओं पर विचार करें'
    ]
  };
  
  return {
    names: names.map(n => n.name),
    comparison,
    winner,
    recommendations
  };
}

/**
 * Find best name from custom list
 */
export function findBestNameFromList(
  nameStrings: string[],
  birthContext: BirthChartContext
): {
  bestName: string;
  score: number;
  analysis: {
    nakshatraCompatible: boolean;
    numerologyScore: number;
    recommendations: {
      en: string[];
      hi: string[];
    };
  };
} {
  let bestName = nameStrings[0];
  let bestScore = 0;
  let bestAnalysis: any = null;
  
  nameStrings.forEach(name => {
    const compatibility = checkNameCompatibility(name, birthContext.nakshatra, birthContext.pada);
    const numerology = analyzeNameNumerology(name, birthContext.birthDate);
    
    const score = (compatibility.isCompatible ? 50 : 20) + (numerology.compatibility * 0.5);
    
    if (score > bestScore) {
      bestScore = score;
      bestName = name;
      bestAnalysis = {
        nakshatraCompatible: compatibility.isCompatible,
        numerologyScore: numerology.compatibility,
        recommendations: {
          en: [
            compatibility.isCompatible 
              ? 'Compatible with birth nakshatra' 
              : 'Not compatible with birth nakshatra',
            `Numerology compatibility: ${numerology.compatibility}/100`,
            numerology.compatibility >= 75 
              ? 'Good numerology harmony' 
              : 'Consider names with better numerology'
          ],
          hi: [
            compatibility.isCompatible 
              ? 'जन्म नक्षत्र के साथ संगत' 
              : 'जन्म नक्षत्र के साथ संगत नहीं',
            `अंकशास्त्र संगतता: ${numerology.compatibility}/100`,
            numerology.compatibility >= 75 
              ? 'अच्छा अंकशास्त्र सामंजस्य' 
              : 'बेहतर अंकशास्त्र वाले नामों पर विचार करें'
          ]
        }
      };
    }
  });
  
  return {
    bestName,
    score: Math.round(bestScore),
    analysis: bestAnalysis
  };
}

export default {
  analyzeNameStrength,
  getTopNameRecommendations,
  compareNames,
  findBestNameFromList,
  PLANETARY_STRENGTH
};
