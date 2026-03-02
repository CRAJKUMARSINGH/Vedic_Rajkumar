/**
 * Planetary Aspects Service
 * Calculates aspects between planets and their interpretations
 */

export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  orb: number; // Degrees of separation from exact aspect
  strength: 'Strong' | 'Moderate' | 'Weak';
  nature: 'Benefic' | 'Malefic' | 'Neutral';
  description: {
    en: string;
    hi: string;
  };
}

export type AspectType = 
  | 'Conjunction'      // 0° (same sign/close degrees)
  | 'Opposition'       // 180° (7th house aspect)
  | 'Trine'           // 120° (5th & 9th house aspect)
  | 'Square'          // 90° (4th & 10th house aspect)
  | 'Sextile';        // 60° (3rd & 11th house aspect)

// Vedic special aspects
export interface VedicAspect {
  planet: string;
  aspectsHouses: number[]; // Houses aspected from planet's position
  description: {
    en: string;
    hi: string;
  };
}

/**
 * Calculate angular separation between two planets
 */
function calculateAngularSeparation(rashi1: number, degree1: number, rashi2: number, degree2: number): number {
  const totalDegrees1 = rashi1 * 30 + degree1;
  const totalDegrees2 = rashi2 * 30 + degree2;
  
  let separation = Math.abs(totalDegrees2 - totalDegrees1);
  
  // Take shorter arc
  if (separation > 180) {
    separation = 360 - separation;
  }
  
  return separation;
}

/**
 * Determine aspect type based on angular separation
 */
function getAspectType(separation: number): AspectType | null {
  const orb = 8; // Orb of influence (±8 degrees)
  
  if (Math.abs(separation - 0) <= orb) return 'Conjunction';
  if (Math.abs(separation - 60) <= orb) return 'Sextile';
  if (Math.abs(separation - 90) <= orb) return 'Square';
  if (Math.abs(separation - 120) <= orb) return 'Trine';
  if (Math.abs(separation - 180) <= orb) return 'Opposition';
  
  return null;
}

/**
 * Calculate aspect strength based on orb
 */
function calculateStrength(orb: number): 'Strong' | 'Moderate' | 'Weak' {
  if (orb <= 3) return 'Strong';
  if (orb <= 6) return 'Moderate';
  return 'Weak';
}

/**
 * Determine aspect nature (benefic/malefic)
 */
function getAspectNature(aspectType: AspectType, planet1: string, planet2: string): 'Benefic' | 'Malefic' | 'Neutral' {
  const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];
  
  const isBenefic1 = benefics.includes(planet1);
  const isBenefic2 = benefics.includes(planet2);
  
  // Conjunction and Trine are generally good
  if (aspectType === 'Conjunction' || aspectType === 'Trine') {
    if (isBenefic1 && isBenefic2) return 'Benefic';
    if (!isBenefic1 && !isBenefic2) return 'Malefic';
    return 'Neutral';
  }
  
  // Square and Opposition are challenging
  if (aspectType === 'Square' || aspectType === 'Opposition') {
    if (isBenefic1 && isBenefic2) return 'Neutral';
    return 'Malefic';
  }
  
  // Sextile is mildly positive
  if (aspectType === 'Sextile') {
    return 'Benefic';
  }
  
  return 'Neutral';
}

/**
 * Get aspect description
 */
function getAspectDescription(aspectType: AspectType, planet1: string, planet2: string, nature: string): { en: string; hi: string } {
  const descriptions: Record<AspectType, { en: string; hi: string }> = {
    'Conjunction': {
      en: `${planet1} and ${planet2} are together, blending their energies. ${nature === 'Benefic' ? 'Harmonious combination.' : nature === 'Malefic' ? 'Challenging combination.' : 'Mixed effects.'}`,
      hi: `${planet1} और ${planet2} एक साथ हैं, अपनी ऊर्जाओं को मिला रहे हैं। ${nature === 'Benefic' ? 'सामंजस्यपूर्ण संयोजन।' : nature === 'Malefic' ? 'चुनौतीपूर्ण संयोजन।' : 'मिश्रित प्रभाव।'}`
    },
    'Opposition': {
      en: `${planet1} opposes ${planet2}, creating tension and awareness. Balance needed between these energies.`,
      hi: `${planet1} ${planet2} का विरोध करता है, तनाव और जागरूकता पैदा करता है। इन ऊर्जाओं के बीच संतुलन की आवश्यकता है।`
    },
    'Trine': {
      en: `${planet1} trines ${planet2}, creating harmony and flow. Natural talents and ease in these areas.`,
      hi: `${planet1} ${planet2} को त्रिकोण करता है, सामंजस्य और प्रवाह बनाता है। इन क्षेत्रों में प्राकृतिक प्रतिभा और आसानी।`
    },
    'Square': {
      en: `${planet1} squares ${planet2}, creating friction and growth opportunities. Challenges lead to development.`,
      hi: `${planet1} ${planet2} को वर्ग करता है, घर्षण और विकास के अवसर पैदा करता है। चुनौतियां विकास की ओर ले जाती हैं।`
    },
    'Sextile': {
      en: `${planet1} sextiles ${planet2}, offering opportunities and support. Positive potential with effort.`,
      hi: `${planet1} ${planet2} को षष्ठांश करता है, अवसर और समर्थन प्रदान करता है। प्रयास के साथ सकारात्मक क्षमता।`
    }
  };
  
  return descriptions[aspectType];
}

/**
 * Calculate all aspects between planets
 */
export function calculatePlanetaryAspects(
  planetaryPositions: Array<{ planet: string; rashi: number; degree: number }>
): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];
  
  // Check each pair of planets
  for (let i = 0; i < planetaryPositions.length; i++) {
    for (let j = i + 1; j < planetaryPositions.length; j++) {
      const planet1 = planetaryPositions[i];
      const planet2 = planetaryPositions[j];
      
      const separation = calculateAngularSeparation(
        planet1.rashi,
        planet1.degree,
        planet2.rashi,
        planet2.degree
      );
      
      const aspectType = getAspectType(separation);
      
      if (aspectType) {
        const exactAspect = aspectType === 'Conjunction' ? 0 :
                           aspectType === 'Sextile' ? 60 :
                           aspectType === 'Square' ? 90 :
                           aspectType === 'Trine' ? 120 : 180;
        
        const orb = Math.abs(separation - exactAspect);
        const strength = calculateStrength(orb);
        const nature = getAspectNature(aspectType, planet1.planet, planet2.planet);
        const description = getAspectDescription(aspectType, planet1.planet, planet2.planet, nature);
        
        aspects.push({
          planet1: planet1.planet,
          planet2: planet2.planet,
          aspectType,
          orb,
          strength,
          nature,
          description
        });
      }
    }
  }
  
  return aspects;
}

/**
 * Get Vedic special aspects (Mars, Jupiter, Saturn)
 */
export function getVedicSpecialAspects(
  planetaryPositions: Array<{ planet: string; rashi: number; house: number }>
): VedicAspect[] {
  const vedicAspects: VedicAspect[] = [];
  
  planetaryPositions.forEach(pos => {
    let aspectsHouses: number[] = [];
    let description = { en: '', hi: '' };
    
    switch (pos.planet) {
      case 'Mars':
        // Mars aspects 4th, 7th, 8th houses from its position
        aspectsHouses = [
          (pos.house + 3) % 12 || 12,  // 4th house
          (pos.house + 6) % 12 || 12,  // 7th house
          (pos.house + 7) % 12 || 12   // 8th house
        ];
        description = {
          en: 'Mars casts special aspects on 4th (property), 7th (partnership), and 8th (transformation) houses, bringing energy and action.',
          hi: 'मंगल 4वें (संपत्ति), 7वें (साझेदारी), और 8वें (परिवर्तन) भावों पर विशेष दृष्टि डालता है, ऊर्जा और कार्य लाता है।'
        };
        break;
        
      case 'Jupiter':
        // Jupiter aspects 5th, 7th, 9th houses from its position
        aspectsHouses = [
          (pos.house + 4) % 12 || 12,  // 5th house
          (pos.house + 6) % 12 || 12,  // 7th house
          (pos.house + 8) % 12 || 12   // 9th house
        ];
        description = {
          en: 'Jupiter casts special aspects on 5th (creativity), 7th (partnership), and 9th (fortune) houses, bringing wisdom and expansion.',
          hi: 'गुरु 5वें (रचनात्मकता), 7वें (साझेदारी), और 9वें (भाग्य) भावों पर विशेष दृष्टि डालता है, ज्ञान और विस्तार लाता है।'
        };
        break;
        
      case 'Saturn':
        // Saturn aspects 3rd, 7th, 10th houses from its position
        aspectsHouses = [
          (pos.house + 2) % 12 || 12,  // 3rd house
          (pos.house + 6) % 12 || 12,  // 7th house
          (pos.house + 9) % 12 || 12   // 10th house
        ];
        description = {
          en: 'Saturn casts special aspects on 3rd (effort), 7th (partnership), and 10th (career) houses, bringing discipline and structure.',
          hi: 'शनि 3रे (प्रयास), 7वें (साझेदारी), और 10वें (करियर) भावों पर विशेष दृष्टि डालता है, अनुशासन और संरचना लाता है।'
        };
        break;
    }
    
    if (aspectsHouses.length > 0) {
      vedicAspects.push({
        planet: pos.planet,
        aspectsHouses,
        description
      });
    }
  });
  
  return vedicAspects;
}

/**
 * Get aspect summary for a chart
 */
export function getAspectSummary(aspects: PlanetaryAspect[]): {
  total: number;
  benefic: number;
  malefic: number;
  neutral: number;
  strong: number;
  byType: Record<AspectType, number>;
} {
  return {
    total: aspects.length,
    benefic: aspects.filter(a => a.nature === 'Benefic').length,
    malefic: aspects.filter(a => a.nature === 'Malefic').length,
    neutral: aspects.filter(a => a.nature === 'Neutral').length,
    strong: aspects.filter(a => a.strength === 'Strong').length,
    byType: {
      'Conjunction': aspects.filter(a => a.aspectType === 'Conjunction').length,
      'Opposition': aspects.filter(a => a.aspectType === 'Opposition').length,
      'Trine': aspects.filter(a => a.aspectType === 'Trine').length,
      'Square': aspects.filter(a => a.aspectType === 'Square').length,
      'Sextile': aspects.filter(a => a.aspectType === 'Sextile').length,
    }
  };
}
