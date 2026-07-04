/**
 * Ashtakavarga Transit Strength Overlay Service
 * Source: BV Raman Magazine Enhancement Plan
 * Implements Sarvashtakavarga (SAV) score analysis for transits
 */

export interface AshtakavargaTransitResult {
  planet: string;
  transitHouse: number;
  savScore: number;
  strength: 'Strong' | 'Moderate' | 'Weak';
  effect: {
    en: string;
    hi: string;
  };
  recommendation: {
    en: string;
    hi: string;
  };
  confidence: number;
}

export interface Sarvashtakavarga {
  house1: number;
  house2: number;
  house3: number;
  house4: number;
  house5: number;
  house6: number;
  house7: number;
  house8: number;
  house9: number;
  house10: number;
  house11: number;
  house12: number;
}

// Default SAV scores (can be calculated from individual Ashtakavarga charts)
const DEFAULT_SAV_SCORES: Sarvashtakavarga = {
  house1: 28, house2: 25, house3: 32, house4: 29, house5: 31,
  house6: 27, house7: 24, house8: 30, house9: 33, house10: 35,
  house11: 26, house12: 23
};

// Planet-specific modifiers for transit strength
const PLANET_MODIFIERS: Record<string, number> = {
  Sun: 1.0,
  Moon: 1.2,
  Mars: 1.1,
  Mercury: 0.9,
  Jupiter: 1.3,
  Venus: 1.1,
  Saturn: 1.0,
  Rahu: 0.8,
  Ketu: 0.8
};

// House-wise effects based on SAV scores
const getHouseEffect = (savScore: number, planet: string): {
  en: string;
  hi: string;
} => {
  if (savScore >= 33) {
    return {
      en: `Exceptional SAV score (${savScore}) - ${planet} gives maximum benefits`,
      hi: `असाधारण SAV स्कोर (${savScore}) - ${planet} अधिकतम लाभ देता है`
    };
  } else if (savScore >= 28) {
    return {
      en: `Strong SAV score (${savScore}) - ${planet} gives full benefits`,
      hi: `मजबूत SAV स्कोर (${savScore}) - ${planet} पूर्ण लाभ देता है`
    };
  } else if (savScore >= 25) {
    return {
      en: `Moderate SAV score (${savScore}) - ${planet} gives mixed results`,
      hi: `मध्यम SAV स्कोर (${savScore}) - ${planet} मिश्रित परिणाम देता है`
    };
  } else {
    return {
      en: `Weak SAV score (${savScore}) - ${planet} gives reduced results`,
      hi: `कमजोर SAV स्कोर (${savScore}) - ${planet} कम परिणाम देता है`
    };
  }
};

const getRecommendation = (savScore: number, planet: string): {
  en: string;
  hi: string;
} => {
  if (savScore >= 28) {
    return {
      en: `Favorable transit - proceed with plans involving ${planet}`,
      hi: `अनुकूल गोचर - ${planet} से संबंधित योजनाओं में आगे बढ़ें`
    };
  } else if (savScore >= 25) {
    return {
      en: `Cautious approach recommended for ${planet} matters`,
      hi: `${planet} मामलों के लिए सावधानीपूर्वक दृष्टिकोण अपनाएं`
    };
  } else {
    return {
      en: `Avoid major decisions involving ${planet} during this transit`,
      hi: `इस गोचर के दौरान ${planet} से संबंधित महत्वपूर्ण निर्णय लेने से बचें`
    };
  }
};

/**
 * Calculate transit strength from Sarvashtakavarga
 */
export function getTransitStrengthFromSAV(
  savScore: number,
  planet: string
): AshtakavargaTransitResult {
  const modifiedScore = savScore * (PLANET_MODIFIERS[planet] || 1.0);
  
  let strength: 'Strong' | 'Moderate' | 'Weak';
  let confidence: number;
  
  if (modifiedScore >= 28) {
    strength = 'Strong';
    confidence = Math.min(0.95, 0.7 + (modifiedScore - 28) * 0.05);
  } else if (modifiedScore >= 25) {
    strength = 'Moderate';
    confidence = 0.6 + (modifiedScore - 25) * 0.04;
  } else {
    strength = 'Weak';
    confidence = Math.max(0.3, 0.4 + (modifiedScore - 20) * 0.02);
  }

  const effect = getHouseEffect(savScore, planet);
  const recommendation = getRecommendation(savScore, planet);

  return {
    planet,
    transitHouse: 0, // Will be set by caller
    savScore,
    strength,
    effect,
    recommendation,
    confidence
  };
}

/**
 * Calculate complete Ashtakavarga transit analysis
 */
export function calculateAshtakavargaTransitAnalysis(
  transitingPlanets: { planet: string; house: number }[],
  savScores: Sarvashtakavarga = DEFAULT_SAV_SCORES
): AshtakavargaTransitResult[] {
  const results: AshtakavargaTransitResult[] = [];

  for (const transit of transitingPlanets) {
    const houseKey = `house${transit.house}` as keyof Sarvashtakavarga;
    const savScore = savScores[houseKey];
    
    const result = getTransitStrengthFromSAV(savScore, transit.planet);
    result.transitHouse = transit.house;
    
    results.push(result);
  }

  return results;
}

/**
 * Get overall transit strength summary
 */
export function getAshtakavargaSummary(results: AshtakavargaTransitResult[]): {
  overallStrength: 'Strong' | 'Moderate' | 'Weak';
  averageScore: number;
  favorableTransits: number;
  unfavorableTransits: number;
  summary: {
    en: string;
    hi: string;
  };
  recommendations: string[];
} {
  const averageScore = results.reduce((sum, r) => sum + r.savScore, 0) / results.length;
  const favorableTransits = results.filter(r => r.savScore >= 28).length;
  const unfavorableTransits = results.filter(r => r.savScore < 25).length;

  let overallStrength: 'Strong' | 'Moderate' | 'Weak';
  let summary: { en: string; hi: string };
  let recommendations: string[] = [];

  if (averageScore >= 28) {
    overallStrength = 'Strong';
    summary = {
      en: `Strong overall transit strength (avg SAV: ${averageScore.toFixed(1)}) - favorable period ahead`,
      hi: `मजबूत समग्र गोचर शक्ति (औसत SAV: ${averageScore.toFixed(1)}) - अनुकूल अवधि आगे`
    };
    recommendations = [
      'Excellent time for new ventures and important decisions',
      'Planetary energies support your goals and ambitions',
      'High probability of success in undertaken activities'
    ];
  } else if (averageScore >= 25) {
    overallStrength = 'Moderate';
    summary = {
      en: `Moderate overall transit strength (avg SAV: ${averageScore.toFixed(1)}) - mixed period ahead`,
      hi: `मध्यम समग्र गोचर शक्ति (औसत SAV: ${averageScore.toFixed(1)}) - मिश्रित अवधि आगे`
    };
    recommendations = [
      'Exercise caution in important matters',
      'Some areas will be favorable while others challenging',
      'Choose your timing carefully for major decisions'
    ];
  } else {
    overallStrength = 'Weak';
    summary = {
      en: `Weak overall transit strength (avg SAV: ${averageScore.toFixed(1)}) - challenging period ahead`,
      hi: `कमजोर समग्र गोचर शक्ति (औसत SAV: ${averageScore.toFixed(1)}) - चुनौतीपूर्ण अवधि आगे`
    };
    recommendations = [
      'Avoid major commitments and new ventures',
      'Focus on spiritual practices and self-improvement',
      'Wait for better planetary configurations before acting'
    ];
  }

  return {
    overallStrength,
    averageScore,
    favorableTransits,
    unfavorableTransits,
    summary,
    recommendations
  };
}

/**
 * Calculate Sarvashtakavarga from individual planet Ashtakavarga charts
 */
export function calculateSarvashtakavarga(
  planetAshtakavargas: Record<string, number[]>
): Sarvashtakavarga {
  const sav: Sarvashtakavarga = {
    house1: 0, house2: 0, house3: 0, house4: 0, house5: 0,
    house6: 0, house7: 0, house8: 0, house9: 0, house10: 0,
    house11: 0, house12: 0
  };

  // Sum up bindus from all planets for each house
  for (let house = 1; house <= 12; house++) {
    let total = 0;
    for (const planet in planetAshtakavargas) {
      const scores = planetAshtakavargas[planet];
      if (scores && scores[house - 1] !== undefined) {
        total += scores[house - 1];
      }
    }
    (sav as any)[`house${house}`] = total;
  }

  return sav;
}

/**
 * Validate SAV scores (should be between 0-56 for each house)
 */
export function validateSAVScores(savScores: Sarvashtakavarga): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  for (let house = 1; house <= 12; house++) {
    const houseKey = `house${house}` as keyof Sarvashtakavarga;
    const score = savScores[houseKey];
    
    if (typeof score !== 'number' || score < 0 || score > 56) {
      errors.push(`Invalid SAV score for house ${house}: ${score} (should be 0-56)`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
