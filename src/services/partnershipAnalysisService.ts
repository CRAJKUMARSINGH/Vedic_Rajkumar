/**
 * Partnership Analysis Service - Business Partnership Guidance
 * Week 16: Business Astrology - Tuesday Implementation
 * Complete partnership compatibility and risk assessment system
 */

export interface PartnershipCompatibility {
  overallScore: number;
  compatibilityFactors: {
    mentalCompatibility: number;
    financialCompatibility: number;
    communicationCompatibility: number;
    trustFactor: number;
    visionAlignment: number;
  };
  strengths: string[];
  challenges: string[];
  recommendations: {
    en: string[];
    hi: string[];
  };
}

export interface PartnerCharacteristics {
  idealPartner: {
    planetaryQualities: string[];
    businessSkills: string[];
    personality: string[];
    background: string[];
  };
  avoidPartner: {
    planetaryConflicts: string[];
    businessRisks: string[];
    personalityClashes: string[];
    redFlags: string[];
  };
}

export interface PartnershipTiming {
  favorablePeriods: {
    period: string;
    description: {
      en: string;
      hi: string;
    };
    duration: string;
    successProbability: number;
  }[];
  unfavorablePeriods: {
    period: string;
    description: {
      en: string;
      hi: string;
    };
    duration: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: {
    financial: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
      mitigation: string[];
    };
    operational: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
      mitigation: string[];
    };
    personal: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
      mitigation: string[];
    };
  };
  warningSignals: string[];
  protectiveStrategies: string[];
}

export interface PartnershipAnalysis {
  id: string;
  userId: string;
  seventhHouseAnalysis: {
    rashi: string;
    lord: string;
    lordPosition: { house: number; rashi: string; strength: number };
    planetsInSeventh: string[];
    strength: number;
    partnershipPotential: number;
  };
  compatibility: PartnershipCompatibility;
  idealPartner: PartnerCharacteristics;
  timing: PartnershipTiming;
  riskAssessment: RiskAssessment;
}

/**
 * Analyze 7th house for business partnerships
 */
export function analyzeSeventhHouse(birthChart: {
  houses: Record<number, { rashi: string; lord: string; planets: string[] }>;
  planetPositions: Record<string, { house: number; rashi: string; degrees: number }>;
  planetaryStrengths: Record<string, number>;
}): {
  rashi: string;
  lord: string;
  lordPosition: { house: number; rashi: string; strength: number };
  planetsInSeventh: string[];
  strength: number;
  partnershipPotential: number;
} {
  const seventhHouse = birthChart.houses[7];
  const lordPosition = birthChart.planetPositions[seventhHouse.lord];
  const lordStrength = birthChart.planetaryStrengths[seventhHouse.lord] || 50;
  
  // Calculate 7th house strength
  let houseStrength = lordStrength;
  
  // Bonus for lord in favorable positions
  if ([1, 4, 5, 7, 9, 10, 11].includes(lordPosition.house)) houseStrength += 10;
  if ([6, 8, 12].includes(lordPosition.house)) houseStrength -= 15;
  
  // Analyze planets in 7th house
  seventhHouse.planets.forEach(planet => {
    const planetStrength = birthChart.planetaryStrengths[planet] || 50;
    if (['Venus', 'Jupiter', 'Mercury'].includes(planet) && planetStrength > 60) {
      houseStrength += 10; // Beneficial planets
    }
    if (['Mars', 'Saturn', 'Rahu', 'Ketu'].includes(planet)) {
      houseStrength -= 5; // Challenging planets for partnerships
    }
  });
  
  houseStrength = Math.min(100, Math.max(0, houseStrength));
  
  // Calculate partnership potential
  let partnershipPotential = houseStrength;
  
  // Bonus for Venus and Jupiter strength
  const venusStrength = birthChart.planetaryStrengths['Venus'] || 50;
  const jupiterStrength = birthChart.planetaryStrengths['Jupiter'] || 50;
  
  if (venusStrength > 70) partnershipPotential += 10;
  if (jupiterStrength > 70) partnershipPotential += 5;
  
  partnershipPotential = Math.min(100, Math.max(0, partnershipPotential));
  
  return {
    rashi: seventhHouse.rashi,
    lord: seventhHouse.lord,
    lordPosition: {
      house: lordPosition.house,
      rashi: lordPosition.rashi,
      strength: lordStrength
    },
    planetsInSeventh: seventhHouse.planets,
    strength: houseStrength,
    partnershipPotential
  };
}

/**
 * Calculate partnership compatibility between two charts
 */
export function calculatePartnershipCompatibility(
  chart1: any,
  chart2?: any // Optional partner chart
): PartnershipCompatibility {
  // If no partner chart provided, analyze general compatibility potential
  const baseCompatibility = chart1.planetaryStrengths['Venus'] || 50;
  const communicationFactor = chart1.planetaryStrengths['Mercury'] || 50;
  const trustFactor = chart1.planetaryStrengths['Jupiter'] || 50;
  const financialFactor = chart1.businessIndicators?.secondHouse?.strength || 50;
  
  const compatibilityFactors = {
    mentalCompatibility: Math.round((communicationFactor + trustFactor) / 2),
    financialCompatibility: financialFactor,
    communicationCompatibility: communicationFactor,
    trustFactor: trustFactor,
    visionAlignment: Math.round((trustFactor + chart1.planetaryStrengths['Jupiter']) / 2)
  };
  
  const overallScore = Math.round(
    (compatibilityFactors.mentalCompatibility * 0.25 +
     compatibilityFactors.financialCompatibility * 0.2 +
     compatibilityFactors.communicationCompatibility * 0.2 +
     compatibilityFactors.trustFactor * 0.2 +
     compatibilityFactors.visionAlignment * 0.15)
  );
  
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  if (compatibilityFactors.communicationCompatibility > 70) {
    strengths.push('Excellent communication potential');
  } else if (compatibilityFactors.communicationCompatibility < 40) {
    challenges.push('Communication barriers may arise');
  }
  
  if (compatibilityFactors.trustFactor > 70) {
    strengths.push('High trust and reliability factor');
  } else if (compatibilityFactors.trustFactor < 40) {
    challenges.push('Trust building will require effort');
  }
  
  if (compatibilityFactors.financialCompatibility > 70) {
    strengths.push('Strong financial partnership potential');
  } else if (compatibilityFactors.financialCompatibility < 40) {
    challenges.push('Financial management needs careful planning');
  }
  
  return {
    overallScore,
    compatibilityFactors,
    strengths,
    challenges,
    recommendations: {
      en: [
        'Focus on building trust through transparent communication',
        'Establish clear financial agreements and responsibilities',
        'Regular partnership reviews to maintain alignment',
        'Leverage individual strengths for collective success'
      ],
      hi: [
        'पारदर्शी संचार के माध्यम से विश्वास निर्माण पर ध्यान दें',
        'स्पष्ट वित्तीय समझौते और जिम्मेदारियां स्थापित करें',
        'संरेखण बनाए रखने के लिए नियमित साझेदारी समीक्षा',
        'सामूहिक सफलता के लिए व्यक्तिगत शक्तियों का लाभ उठाएं'
      ]
    }
  };
}

/**
 * Determine ideal partner characteristics
 */
export function determineIdealPartner(birthChart: any): PartnerCharacteristics {
  const weakPlanets = Object.entries(birthChart.planetaryStrengths)
    .filter(([_, strength]) => (strength as number) < 50)
    .map(([planet, _]) => planet);
  
  const strongPlanets = Object.entries(birthChart.planetaryStrengths)
    .filter(([_, strength]) => (strength as number) > 70)
    .map(([planet, _]) => planet);
  
  const idealPartner = {
    planetaryQualities: [],
    businessSkills: [],
    personality: [],
    background: []
  };
  
  const avoidPartner = {
    planetaryConflicts: [],
    businessRisks: [],
    personalityClashes: [],
    redFlags: []
  };
  
  // Complement weak planets
  if (weakPlanets.includes('Mercury')) {
    idealPartner.planetaryQualities.push('Strong Mercury - Good communication');
    idealPartner.businessSkills.push('Excellent communication and negotiation skills');
  }
  
  if (weakPlanets.includes('Jupiter')) {
    idealPartner.planetaryQualities.push('Strong Jupiter - Wisdom and ethics');
    idealPartner.personality.push('Ethical, wise, and principled approach');
  }
  
  if (weakPlanets.includes('Venus')) {
    idealPartner.planetaryQualities.push('Strong Venus - Relationship skills');
    idealPartner.businessSkills.push('Customer relations and creative thinking');
  }
  
  if (weakPlanets.includes('Saturn')) {
    idealPartner.planetaryQualities.push('Strong Saturn - Discipline and persistence');
    idealPartner.personality.push('Disciplined, hardworking, and systematic');
  }
  
  // Avoid conflicting energies
  if (strongPlanets.includes('Mars')) {
    avoidPartner.planetaryConflicts.push('Another strong Mars - Too much aggression');
    avoidPartner.personalityClashes.push('Overly aggressive or impulsive nature');
  }
  
  if (strongPlanets.includes('Saturn')) {
    avoidPartner.planetaryConflicts.push('Weak Jupiter - Lack of optimism');
    avoidPartner.personalityClashes.push('Overly pessimistic or rigid thinking');
  }
  
  // General recommendations
  idealPartner.businessSkills.push(
    'Complementary skill set to yours',
    'Strong financial management',
    'Good market understanding',
    'Reliable and trustworthy nature'
  );
  
  idealPartner.background.push(
    'Relevant industry experience',
    'Good business network',
    'Financial stability',
    'Shared business values'
  );
  
  avoidPartner.businessRisks.push(
    'History of business failures without learning',
    'Poor financial management record',
    'Conflicting business ethics',
    'Unrealistic expectations'
  );
  
  avoidPartner.redFlags.push(
    'Lack of transparency in dealings',
    'Unwillingness to share responsibilities',
    'History of partnership conflicts',
    'Unreliable or inconsistent behavior'
  );
  
  return { idealPartner, avoidPartner };
}

/**
 * Calculate partnership timing
 */
export function calculatePartnershipTiming(birthChart: any): PartnershipTiming {
  const currentYear = new Date().getFullYear();
  
  const favorablePeriods = [
    {
      period: `${currentYear} - Jupiter Transit`,
      description: {
        en: 'Jupiter transit brings expansion and good fortune to partnerships',
        hi: 'गुरु गोचर साझेदारी में विस्तार और सौभाग्य लाता है'
      },
      duration: '12 months',
      successProbability: 85
    },
    {
      period: `${currentYear + 1} - Venus Mahadasha`,
      description: {
        en: 'Venus period enhances partnership harmony and business relationships',
        hi: 'शुक्र काल साझेदारी सामंजस्य और व्यापारिक संबंधों को बढ़ाता है'
      },
      duration: '20 years',
      successProbability: 90
    }
  ];
  
  const unfavorablePeriods = [
    {
      period: `${currentYear} - Saturn in 7th`,
      description: {
        en: 'Saturn transit may bring delays and challenges in partnerships',
        hi: 'शनि गोचर साझेदारी में देरी और चुनौतियां ला सकता है'
      },
      duration: '2.5 years',
      riskLevel: 'medium' as const
    },
    {
      period: `${currentYear + 2} - Mars Transit`,
      description: {
        en: 'Mars transit may cause conflicts and disagreements with partners',
        hi: 'मंगल गोचर भागीदारों के साथ संघर्ष और असहमति का कारण बन सकता है'
      },
      duration: '6 months',
      riskLevel: 'high' as const
    }
  ];
  
  return { favorablePeriods, unfavorablePeriods };
}

/**
 * Assess partnership risks
 */
export function assessPartnershipRisks(birthChart: any): RiskAssessment {
  const marsStrength = birthChart.planetaryStrengths['Mars'] || 50;
  const saturnStrength = birthChart.planetaryStrengths['Saturn'] || 50;
  const rahuStrength = birthChart.planetaryStrengths['Rahu'] || 50;
  
  let overallRisk: 'low' | 'medium' | 'high' = 'low';
  
  // Calculate risk levels
  const financialRisk = birthChart.businessIndicators?.secondHouse?.strength < 40 ? 'high' : 
                       birthChart.businessIndicators?.secondHouse?.strength < 60 ? 'medium' : 'low';
  
  const operationalRisk = marsStrength > 80 || saturnStrength < 30 ? 'high' :
                         marsStrength > 60 || saturnStrength < 50 ? 'medium' : 'low';
  
  const personalRisk = rahuStrength > 80 || birthChart.planetaryStrengths['Jupiter'] < 30 ? 'high' :
                      rahuStrength > 60 || birthChart.planetaryStrengths['Jupiter'] < 50 ? 'medium' : 'low';
  
  // Determine overall risk
  const riskLevels = [financialRisk, operationalRisk, personalRisk];
  if (riskLevels.includes('high')) overallRisk = 'high';
  else if (riskLevels.includes('medium')) overallRisk = 'medium';
  
  return {
    overallRisk,
    riskFactors: {
      financial: {
        level: financialRisk,
        factors: financialRisk === 'high' ? 
          ['Weak 2nd house', 'Poor financial management', 'Cash flow issues'] :
          ['Moderate financial stability', 'Need careful planning'],
        mitigation: ['Separate financial agreements', 'Regular financial reviews', 'Emergency fund planning']
      },
      operational: {
        level: operationalRisk,
        factors: operationalRisk === 'high' ?
          ['High Mars energy - conflicts', 'Weak Saturn - lack of discipline'] :
          ['Moderate operational challenges', 'Need clear processes'],
        mitigation: ['Clear role definitions', 'Regular communication', 'Conflict resolution protocols']
      },
      personal: {
        level: personalRisk,
        factors: personalRisk === 'high' ?
          ['High Rahu - deception risk', 'Weak Jupiter - lack of wisdom'] :
          ['Moderate personal compatibility', 'Need trust building'],
        mitigation: ['Background verification', 'Gradual trust building', 'Clear expectations']
      }
    },
    warningSignals: [
      'Sudden changes in partner behavior',
      'Reluctance to share financial information',
      'Consistent disagreements on major decisions',
      'Lack of commitment to agreed responsibilities'
    ],
    protectiveStrategies: [
      'Legal partnership agreements',
      'Regular performance reviews',
      'Exit clauses in contracts',
      'Independent financial audits'
    ]
  };
}

/**
 * Generate comprehensive partnership analysis
 */
export function generatePartnershipAnalysis(
  userId: string,
  birthChart: any,
  partnerChart?: any
): PartnershipAnalysis {
  const seventhHouseAnalysis = analyzeSeventhHouse(birthChart);
  const compatibility = calculatePartnershipCompatibility(birthChart, partnerChart);
  const idealPartner = determineIdealPartner(birthChart);
  const timing = calculatePartnershipTiming(birthChart);
  const riskAssessment = assessPartnershipRisks(birthChart);
  
  return {
    id: `partnership_${userId}_${Date.now()}`,
    userId,
    seventhHouseAnalysis,
    compatibility,
    idealPartner,
    timing,
    riskAssessment
  };
}

export default {
  analyzeSeventhHouse,
  calculatePartnershipCompatibility,
  determineIdealPartner,
  calculatePartnershipTiming,
  assessPartnershipRisks,
  generatePartnershipAnalysis
};