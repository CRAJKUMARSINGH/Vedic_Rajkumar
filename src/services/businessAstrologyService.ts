/**
 * Business Astrology Service - Comprehensive Business Success Analysis
 * Week 16: Business Astrology - Monday Implementation
 * Complete business indicators system with 2nd, 10th, 11th house analysis
 */

export interface HouseAnalysis {
  houseNumber: number;
  rashi: string;
  lord: string;
  lordPosition: {
    house: number;
    rashi: string;
    strength: number;
  };
  planetsInHouse: string[];
  strength: number;
  significance: {
    en: string;
    hi: string;
  };
  effects: {
    en: string[];
    hi: string[];
  };
}

export interface PlanetaryAnalysis {
  planet: string;
  position: {
    house: number;
    rashi: string;
    degrees: number;
  };
  strength: number;
  dignity: string;
  businessSignificance: {
    en: string;
    hi: string;
  };
  businessEffects: {
    en: string[];
    hi: string[];
  };
}

export interface BusinessTypeRecommendation {
  id: string;
  type: string;
  category: 'trade' | 'service' | 'manufacturing' | 'technology' | 'creative' | 'finance';
  suitability: number; // 0-100
  description: {
    en: string;
    hi: string;
  };
  requirements: string[];
  successFactors: string[];
  challenges: string[];
  timing: {
    bestPeriods: string[];
    avoidPeriods: string[];
  };
}

export interface BusinessAnalysis {
  id: string;
  userId: string;
  overallScore: number;
  businessIndicators: {
    secondHouse: HouseAnalysis;
    tenthHouse: HouseAnalysis;
    eleventhHouse: HouseAnalysis;
  };
  keyPlanets: {
    mercury: PlanetaryAnalysis;
    jupiter: PlanetaryAnalysis;
    venus: PlanetaryAnalysis;
    saturn: PlanetaryAnalysis;
  };
  businessTypes: BusinessTypeRecommendation[];
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    en: string[];
    hi: string[];
  };
}

// Business Type Database
export const BUSINESS_TYPES_DATABASE: BusinessTypeRecommendation[] = [
  // TRADE BUSINESSES
  {
    id: 'import_export',
    type: 'Import/Export Business',
    category: 'trade',
    suitability: 85,
    description: {
      en: 'International trade business dealing with import and export of goods',
      hi: 'आयात-निर्यात व्यापार जो अंतर्राष्ट्रीय वस्तुओं के व्यापार से संबंधित है'
    },
    requirements: ['Strong Mercury', 'Good 9th house', 'Favorable Rahu'],
    successFactors: ['Communication skills', 'International connections', 'Market knowledge'],
    challenges: ['Currency fluctuations', 'Regulatory compliance', 'Cultural barriers'],
    timing: {
      bestPeriods: ['Mercury Mahadasha', 'Jupiter transit in 9th/11th'],
      avoidPeriods: ['Saturn in 7th', 'Mars in 10th']
    }
  },

  {
    id: 'retail_business',
    type: 'Retail Business',
    category: 'trade',
    suitability: 75,
    description: {
      en: 'Direct selling to consumers through physical or online stores',
      hi: 'भौतिक या ऑनलाइन स्टोर के माध्यम से उपभोक्ताओं को प्रत्यक्ष बिक्री'
    },
    requirements: ['Strong 2nd house', 'Good Venus', 'Favorable 11th house'],
    successFactors: ['Customer service', 'Location', 'Product selection'],
    challenges: ['Competition', 'Inventory management', 'Seasonal variations'],
    timing: {
      bestPeriods: ['Venus Mahadasha', 'Mercury Antardasha'],
      avoidPeriods: ['Saturn in 2nd', 'Rahu in 11th']
    }
  },

  // SERVICE BUSINESSES
  {
    id: 'consulting_services',
    type: 'Consulting Services',
    category: 'service',
    suitability: 90,
    description: {
      en: 'Professional advisory services based on expertise and knowledge',
      hi: 'विशेषज्ञता और ज्ञान पर आधारित पेशेवर सलाहकार सेवाएं'
    },
    requirements: ['Strong Jupiter', 'Good 10th house', 'Exalted Mercury'],
    successFactors: ['Expertise', 'Reputation', 'Network'],
    challenges: ['Client acquisition', 'Competition', 'Market credibility'],
    timing: {
      bestPeriods: ['Jupiter Mahadasha', 'Mercury in own sign'],
      avoidPeriods: ['Jupiter debilitated', 'Saturn in 10th']
    }
  },

  {
    id: 'healthcare_services',
    type: 'Healthcare Services',
    category: 'service',
    suitability: 80,
    description: {
      en: 'Medical and health-related services including clinics and wellness centers',
      hi: 'क्लिनिक और वेलनेस सेंटर सहित चिकित्सा और स्वास्थ्य संबंधी सेवाएं'
    },
    requirements: ['Strong 6th house', 'Good Jupiter', 'Favorable Mars'],
    successFactors: ['Medical knowledge', 'Compassion', 'Trust'],
    challenges: ['Regulatory compliance', 'High investment', 'Liability'],
    timing: {
      bestPeriods: ['Jupiter in 6th/10th', 'Sun in own sign'],
      avoidPeriods: ['Mars in 6th', 'Saturn in 1st']
    }
  },

  // TECHNOLOGY BUSINESSES
  {
    id: 'software_development',
    type: 'Software Development',
    category: 'technology',
    suitability: 85,
    description: {
      en: 'Creating software applications and technology solutions',
      hi: 'सॉफ्टवेयर एप्लिकेशन और प्रौद्योगिकी समाधान बनाना'
    },
    requirements: ['Strong Mercury', 'Good Rahu', 'Favorable 11th house'],
    successFactors: ['Technical skills', 'Innovation', 'Market timing'],
    challenges: ['Rapid technology changes', 'Competition', 'Talent retention'],
    timing: {
      bestPeriods: ['Rahu Mahadasha', 'Mercury in air signs'],
      avoidPeriods: ['Saturn in 3rd', 'Mars in 11th']
    }
  },

  // CREATIVE BUSINESSES
  {
    id: 'media_entertainment',
    type: 'Media & Entertainment',
    category: 'creative',
    suitability: 75,
    description: {
      en: 'Creative industries including film, music, advertising, and content creation',
      hi: 'फिल्म, संगीत, विज्ञापन और सामग्री निर्माण सहित रचनात्मक उद्योग'
    },
    requirements: ['Strong Venus', 'Good 5th house', 'Favorable Rahu'],
    successFactors: ['Creativity', 'Networking', 'Market appeal'],
    challenges: ['Unpredictable income', 'High competition', 'Changing trends'],
    timing: {
      bestPeriods: ['Venus Mahadasha', 'Rahu in 5th/11th'],
      avoidPeriods: ['Saturn in 5th', 'Mars in 12th']
    }
  },

  // FINANCIAL BUSINESSES
  {
    id: 'financial_services',
    type: 'Financial Services',
    category: 'finance',
    suitability: 80,
    description: {
      en: 'Banking, insurance, investment, and other financial services',
      hi: 'बैंकिंग, बीमा, निवेश और अन्य वित्तीय सेवाएं'
    },
    requirements: ['Strong 2nd house', 'Good Jupiter', 'Favorable 11th house'],
    successFactors: ['Trust', 'Expertise', 'Regulatory compliance'],
    challenges: ['Regulatory changes', 'Market volatility', 'Competition'],
    timing: {
      bestPeriods: ['Jupiter in 2nd/11th', 'Venus in own sign'],
      avoidPeriods: ['Saturn in 2nd', 'Rahu in 8th']
    }
  }
];

/**
 * Analyze business houses (2nd, 10th, 11th)
 */
export function analyzeBusinessHouses(birthChart: {
  houses: Record<number, { rashi: string; lord: string; planets: string[] }>;
  planetPositions: Record<string, { house: number; rashi: string; degrees: number }>;
  planetaryStrengths: Record<string, number>;
}): {
  secondHouse: HouseAnalysis;
  tenthHouse: HouseAnalysis;
  eleventhHouse: HouseAnalysis;
} {
  
  const analyzeHouse = (houseNum: number, significance: { en: string; hi: string }): HouseAnalysis => {
    const house = birthChart.houses[houseNum];
    const lordPosition = birthChart.planetPositions[house.lord];
    const lordStrength = birthChart.planetaryStrengths[house.lord] || 50;
    
    // Calculate house strength based on lord position and planets
    let houseStrength = lordStrength;
    
    // Bonus for lord in own house or exalted
    if (lordPosition.house === houseNum) houseStrength += 15;
    if (lordStrength > 80) houseStrength += 10;
    
    // Bonus/penalty for planets in house
    house.planets.forEach(planet => {
      const planetStrength = birthChart.planetaryStrengths[planet] || 50;
      if (planetStrength > 70) houseStrength += 5;
      if (planetStrength < 30) houseStrength -= 5;
    });
    
    houseStrength = Math.min(100, Math.max(0, houseStrength));
    
    return {
      houseNumber: houseNum,
      rashi: house.rashi,
      lord: house.lord,
      lordPosition: {
        house: lordPosition.house,
        rashi: lordPosition.rashi,
        strength: lordStrength
      },
      planetsInHouse: house.planets,
      strength: houseStrength,
      significance,
      effects: generateHouseEffects(houseNum, houseStrength, house.planets)
    };
  };

  return {
    secondHouse: analyzeHouse(2, {
      en: 'Wealth, resources, family business, and financial stability',
      hi: 'धन, संसाधन, पारिवारिक व्यापार और वित्तीय स्थिरता'
    }),
    tenthHouse: analyzeHouse(10, {
      en: 'Career, profession, reputation, and social status',
      hi: 'करियर, पेशा, प्रतिष्ठा और सामाजिक स्थिति'
    }),
    eleventhHouse: analyzeHouse(11, {
      en: 'Gains, income, profits, and fulfillment of desires',
      hi: 'लाभ, आय, मुनाफा और इच्छाओं की पूर्ति'
    })
  };
}

/**
 * Generate house effects based on strength and planets
 */
function generateHouseEffects(houseNum: number, strength: number, planets: string[]): {
  en: string[];
  hi: string[];
} {
  const effects = { en: [], hi: [] };
  
  if (houseNum === 2) { // Wealth house
    if (strength > 70) {
      effects.en.push('Strong financial foundation', 'Good family support in business', 'Steady income flow');
      effects.hi.push('मजबूत वित्तीय आधार', 'व्यापार में अच्छा पारिवारिक समर्थन', 'स्थिर आय प्रवाह');
    } else if (strength < 40) {
      effects.en.push('Financial challenges', 'Need to work harder for money', 'Family business issues');
      effects.hi.push('वित्तीय चुनौतियां', 'पैसे के लिए अधिक मेहनत की जरूरत', 'पारिवारिक व्यापार की समस्याएं');
    }
  } else if (houseNum === 10) { // Career house
    if (strength > 70) {
      effects.en.push('Strong professional reputation', 'Leadership qualities', 'Career success');
      effects.hi.push('मजबूत पेशेवर प्रतिष्ठा', 'नेतृत्व गुण', 'करियर में सफलता');
    } else if (strength < 40) {
      effects.en.push('Career struggles', 'Authority issues', 'Professional instability');
      effects.hi.push('करियर संघर्ष', 'अधिकार की समस्याएं', 'पेशेवर अस्थिरता');
    }
  } else if (houseNum === 11) { // Gains house
    if (strength > 70) {
      effects.en.push('Multiple income sources', 'Good profits in business', 'Fulfillment of desires');
      effects.hi.push('कई आय स्रोत', 'व्यापार में अच्छा मुनाफा', 'इच्छाओं की पूर्ति');
    } else if (strength < 40) {
      effects.en.push('Limited income growth', 'Profit challenges', 'Delayed gains');
      effects.hi.push('सीमित आय वृद्धि', 'मुनाफे की चुनौतियां', 'देर से लाभ');
    }
  }
  
  return effects;
}

/**
 * Analyze key business planets
 */
export function analyzeBusinessPlanets(birthChart: {
  planetPositions: Record<string, { house: number; rashi: string; degrees: number }>;
  planetaryStrengths: Record<string, number>;
}): {
  mercury: PlanetaryAnalysis;
  jupiter: PlanetaryAnalysis;
  venus: PlanetaryAnalysis;
  saturn: PlanetaryAnalysis;
} {
  
  const analyzePlanet = (
    planet: string, 
    significance: { en: string; hi: string },
    businessEffects: { en: string[]; hi: string[] }
  ): PlanetaryAnalysis => {
    const position = birthChart.planetPositions[planet];
    const strength = birthChart.planetaryStrengths[planet] || 50;
    
    let dignity = 'Neutral';
    if (strength > 80) dignity = 'Exalted';
    else if (strength > 60) dignity = 'Own Sign';
    else if (strength < 30) dignity = 'Debilitated';
    else if (strength < 50) dignity = 'Weak';
    
    return {
      planet,
      position,
      strength,
      dignity,
      businessSignificance: significance,
      businessEffects
    };
  };

  return {
    mercury: analyzePlanet('Mercury', 
      {
        en: 'Business intelligence, communication, trade, and analytical skills',
        hi: 'व्यापारिक बुद्धि, संचार, व्यापार और विश्लेषणात्मक कौशल'
      },
      {
        en: ['Quick decision making', 'Good communication skills', 'Trade and commerce success'],
        hi: ['त्वरित निर्णय लेना', 'अच्छे संचार कौशल', 'व्यापार और वाणिज्य में सफलता']
      }
    ),
    jupiter: analyzePlanet('Jupiter',
      {
        en: 'Wisdom, expansion, fortune, and ethical business practices',
        hi: 'ज्ञान, विस्तार, भाग्य और नैतिक व्यापारिक प्रथाएं'
      },
      {
        en: ['Business expansion', 'Good fortune', 'Ethical practices', 'Long-term success'],
        hi: ['व्यापार विस्तार', 'अच्छा भाग्य', 'नैतिक प्रथाएं', 'दीर्घकालिक सफलता']
      }
    ),
    venus: analyzePlanet('Venus',
      {
        en: 'Luxury business, partnerships, creativity, and customer relations',
        hi: 'लक्जरी व्यापार, साझेदारी, रचनात्मकता और ग्राहक संबंध'
      },
      {
        en: ['Luxury goods business', 'Good partnerships', 'Creative ventures', 'Customer appeal'],
        hi: ['लक्जरी वस्तुओं का व्यापार', 'अच्छी साझेदारी', 'रचनात्मक उद्यम', 'ग्राहक अपील']
      }
    ),
    saturn: analyzePlanet('Saturn',
      {
        en: 'Long-term success, discipline, hard work, and systematic approach',
        hi: 'दीर्घकालिक सफलता, अनुशासन, कड़ी मेहनत और व्यवस्थित दृष्टिकोण'
      },
      {
        en: ['Long-term stability', 'Disciplined approach', 'Hard work pays off', 'Systematic growth'],
        hi: ['दीर्घकालिक स्थिरता', 'अनुशासित दृष्टिकोण', 'कड़ी मेहनत का फल', 'व्यवस्थित विकास']
      }
    )
  };
}

/**
 * Calculate overall business success score
 */
export function calculateBusinessScore(
  businessIndicators: any,
  keyPlanets: any
): number {
  let score = 0;
  
  // House contributions (60% weight)
  score += businessIndicators.secondHouse.strength * 0.2;   // 20%
  score += businessIndicators.tenthHouse.strength * 0.25;   // 25%
  score += businessIndicators.eleventhHouse.strength * 0.15; // 15%
  
  // Planet contributions (40% weight)
  score += keyPlanets.mercury.strength * 0.15;  // 15%
  score += keyPlanets.jupiter.strength * 0.1;   // 10%
  score += keyPlanets.venus.strength * 0.075;   // 7.5%
  score += keyPlanets.saturn.strength * 0.075;  // 7.5%
  
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Recommend business types based on chart analysis
 */
export function recommendBusinessTypes(
  businessIndicators: any,
  keyPlanets: any
): BusinessTypeRecommendation[] {
  const recommendations: BusinessTypeRecommendation[] = [];
  
  BUSINESS_TYPES_DATABASE.forEach(businessType => {
    let suitability = businessType.suitability;
    
    // Adjust suitability based on planetary strengths
    if (businessType.category === 'trade' && keyPlanets.mercury.strength > 70) {
      suitability += 10;
    }
    if (businessType.category === 'service' && keyPlanets.jupiter.strength > 70) {
      suitability += 10;
    }
    if (businessType.category === 'creative' && keyPlanets.venus.strength > 70) {
      suitability += 10;
    }
    if (businessType.category === 'technology' && keyPlanets.mercury.strength > 80) {
      suitability += 15;
    }
    
    // Adjust based on house strengths
    if (businessIndicators.secondHouse.strength > 70) suitability += 5;
    if (businessIndicators.tenthHouse.strength > 70) suitability += 5;
    if (businessIndicators.eleventhHouse.strength > 70) suitability += 5;
    
    suitability = Math.min(100, Math.max(0, suitability));
    
    recommendations.push({
      ...businessType,
      suitability
    });
  });
  
  // Sort by suitability and return top recommendations
  return recommendations
    .sort((a, b) => b.suitability - a.suitability)
    .slice(0, 8);
}

/**
 * Generate comprehensive business analysis
 */
export function generateBusinessAnalysis(
  userId: string,
  birthChart: any
): BusinessAnalysis {
  const businessIndicators = analyzeBusinessHouses(birthChart);
  const keyPlanets = analyzeBusinessPlanets(birthChart);
  const overallScore = calculateBusinessScore(businessIndicators, keyPlanets);
  const businessTypes = recommendBusinessTypes(businessIndicators, keyPlanets);
  
  // Generate strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  if (businessIndicators.secondHouse.strength > 70) {
    strengths.push('Strong financial foundation');
  } else if (businessIndicators.secondHouse.strength < 40) {
    weaknesses.push('Financial challenges need attention');
  }
  
  if (businessIndicators.tenthHouse.strength > 70) {
    strengths.push('Excellent professional reputation');
  } else if (businessIndicators.tenthHouse.strength < 40) {
    weaknesses.push('Career stability needs improvement');
  }
  
  if (keyPlanets.mercury.strength > 70) {
    strengths.push('Excellent business communication');
  } else if (keyPlanets.mercury.strength < 40) {
    weaknesses.push('Communication skills need development');
  }
  
  return {
    id: `business_${userId}_${Date.now()}`,
    userId,
    overallScore,
    businessIndicators,
    keyPlanets,
    businessTypes,
    strengths,
    weaknesses,
    recommendations: {
      en: [
        'Focus on your strongest business indicators',
        'Develop areas showing weakness',
        'Choose business types matching your planetary strengths',
        'Consider partnerships to complement weak areas'
      ],
      hi: [
        'अपने सबसे मजबूत व्यापारिक संकेतकों पर ध्यान दें',
        'कमजोरी दिखाने वाले क्षेत्रों को विकसित करें',
        'अपनी ग्रहीय शक्तियों से मेल खाने वाले व्यापार प्रकार चुनें',
        'कमजोर क्षेत्रों को पूरा करने के लिए साझेदारी पर विचार करें'
      ]
    }
  };
}

export default {
  BUSINESS_TYPES_DATABASE,
  analyzeBusinessHouses,
  analyzeBusinessPlanets,
  calculateBusinessScore,
  recommendBusinessTypes,
  generateBusinessAnalysis
};