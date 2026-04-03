/**
 * Name Numerology Service - Chaldean Numerology System
 * Week 20: Baby Name Suggestions - Tuesday Implementation
 * Calculate name numbers and check compatibility with birth date
 */

export interface NumerologyAnalysis {
  nameNumber: number;
  destinyNumber: number;
  compatibility: number; // 0-100
  vibration: 'Positive' | 'Neutral' | 'Negative';
  meaning: {
    en: string;
    hi: string;
  };
  characteristics: {
    en: string[];
    hi: string[];
  };
  recommendations: {
    en: string[];
    hi: string[];
  };
}

/**
 * Chaldean Numerology Letter Values
 * More accurate than Pythagorean system for name analysis
 */
const CHALDEAN_VALUES: Record<string, number> = {
  'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
  'B': 2, 'K': 2, 'R': 2,
  'C': 3, 'G': 3, 'L': 3, 'S': 3,
  'D': 4, 'M': 4, 'T': 4,
  'E': 5, 'H': 5, 'N': 5, 'X': 5,
  'U': 6, 'V': 6, 'W': 6,
  'O': 7, 'Z': 7,
  'F': 8, 'P': 8
};

/**
 * Number meanings in Chaldean numerology
 */
const NUMBER_MEANINGS: Record<number, {
  vibration: 'Positive' | 'Neutral' | 'Negative';
  meaning: { en: string; hi: string };
  characteristics: { en: string[]; hi: string[] };
}> = {
  1: {
    vibration: 'Positive',
    meaning: {
      en: 'Leadership, Independence, Ambition',
      hi: 'नेतृत्व, स्वतंत्रता, महत्वाकांक्षा'
    },
    characteristics: {
      en: [
        'Natural leader',
        'Independent thinker',
        'Ambitious and driven',
        'Innovative and creative',
        'Strong willpower'
      ],
      hi: [
        'स्वाभाविक नेता',
        'स्वतंत्र विचारक',
        'महत्वाकांक्षी और प्रेरित',
        'नवीन और रचनात्मक',
        'मजबूत इच्छाशक्ति'
      ]
    }
  },
  2: {
    vibration: 'Positive',
    meaning: {
      en: 'Cooperation, Harmony, Diplomacy',
      hi: 'सहयोग, सामंजस्य, कूटनीति'
    },
    characteristics: {
      en: [
        'Diplomatic and tactful',
        'Cooperative nature',
        'Peacemaker',
        'Sensitive and intuitive',
        'Good mediator'
      ],
      hi: [
        'कूटनीतिक और चतुर',
        'सहयोगी स्वभाव',
        'शांतिदूत',
        'संवेदनशील और सहज',
        'अच्छा मध्यस्थ'
      ]
    }
  },
  3: {
    vibration: 'Positive',
    meaning: {
      en: 'Creativity, Expression, Joy',
      hi: 'रचनात्मकता, अभिव्यक्ति, आनंद'
    },
    characteristics: {
      en: [
        'Creative and artistic',
        'Excellent communicator',
        'Optimistic outlook',
        'Social and friendly',
        'Expressive personality'
      ],
      hi: [
        'रचनात्मक और कलात्मक',
        'उत्कृष्ट संचारक',
        'आशावादी दृष्टिकोण',
        'सामाजिक और मैत्रीपूर्ण',
        'अभिव्यंजक व्यक्तित्व'
      ]
    }
  },
  4: {
    vibration: 'Neutral',
    meaning: {
      en: 'Stability, Hard Work, Discipline',
      hi: 'स्थिरता, कड़ी मेहनत, अनुशासन'
    },
    characteristics: {
      en: [
        'Practical and organized',
        'Hard working',
        'Disciplined approach',
        'Reliable and trustworthy',
        'Strong foundation builder'
      ],
      hi: [
        'व्यावहारिक और संगठित',
        'मेहनती',
        'अनुशासित दृष्टिकोण',
        'विश्वसनीय और भरोसेमंद',
        'मजबूत नींव निर्माता'
      ]
    }
  },
  5: {
    vibration: 'Positive',
    meaning: {
      en: 'Freedom, Adventure, Change',
      hi: 'स्वतंत्रता, साहसिक, परिवर्तन'
    },
    characteristics: {
      en: [
        'Adventurous spirit',
        'Loves freedom',
        'Adaptable to change',
        'Curious and versatile',
        'Dynamic personality'
      ],
      hi: [
        'साहसिक भावना',
        'स्वतंत्रता से प्यार',
        'परिवर्तन के अनुकूल',
        'जिज्ञासु और बहुमुखी',
        'गतिशील व्यक्तित्व'
      ]
    }
  },
  6: {
    vibration: 'Positive',
    meaning: {
      en: 'Love, Responsibility, Harmony',
      hi: 'प्रेम, जिम्मेदारी, सामंजस्य'
    },
    characteristics: {
      en: [
        'Loving and caring',
        'Responsible nature',
        'Family oriented',
        'Harmonious relationships',
        'Nurturing personality'
      ],
      hi: [
        'प्रेमपूर्ण और देखभाल करने वाला',
        'जिम्मेदार स्वभाव',
        'परिवार उन्मुख',
        'सामंजस्यपूर्ण संबंध',
        'पोषण करने वाला व्यक्तित्व'
      ]
    }
  },
  7: {
    vibration: 'Positive',
    meaning: {
      en: 'Spirituality, Wisdom, Analysis',
      hi: 'आध्यात्मिकता, ज्ञान, विश्लेषण'
    },
    characteristics: {
      en: [
        'Spiritual seeker',
        'Analytical mind',
        'Wise and intuitive',
        'Introspective nature',
        'Deep thinker'
      ],
      hi: [
        'आध्यात्मिक साधक',
        'विश्लेषणात्मक मन',
        'बुद्धिमान और सहज',
        'आत्मनिरीक्षण स्वभाव',
        'गहरा विचारक'
      ]
    }
  },
  8: {
    vibration: 'Neutral',
    meaning: {
      en: 'Power, Success, Material Wealth',
      hi: 'शक्ति, सफलता, भौतिक धन'
    },
    characteristics: {
      en: [
        'Ambitious and powerful',
        'Business minded',
        'Material success',
        'Strong determination',
        'Executive abilities'
      ],
      hi: [
        'महत्वाकांक्षी और शक्तिशाली',
        'व्यापार उन्मुख',
        'भौतिक सफलता',
        'मजबूत दृढ़ संकल्प',
        'कार्यकारी क्षमताएं'
      ]
    }
  },
  9: {
    vibration: 'Positive',
    meaning: {
      en: 'Compassion, Humanitarianism, Completion',
      hi: 'करुणा, मानवतावाद, पूर्णता'
    },
    characteristics: {
      en: [
        'Compassionate nature',
        'Humanitarian outlook',
        'Generous and giving',
        'Universal love',
        'Spiritual completion'
      ],
      hi: [
        'दयालु स्वभाव',
        'मानवतावादी दृष्टिकोण',
        'उदार और देने वाला',
        'सार्वभौमिक प्रेम',
        'आध्यात्मिक पूर्णता'
      ]
    }
  }
};

/**
 * Calculate name number using Chaldean system
 */
export function calculateNameNumber(name: string): number {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  
  for (const char of cleanName) {
    sum += CHALDEAN_VALUES[char] || 0;
  }
  
  // Reduce to single digit (1-9)
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  return sum;
}

/**
 * Calculate destiny number from birth date
 */
export function calculateDestinyNumber(birthDate: Date): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();
  
  let sum = day + month + year;
  
  // Reduce to single digit (1-9)
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  return sum;
}

/**
 * Calculate compatibility between name number and destiny number
 */
export function calculateNumerologyCompatibility(
  nameNumber: number,
  destinyNumber: number
): number {
  // Compatibility matrix (0-100)
  const compatibilityMatrix: Record<number, Record<number, number>> = {
    1: { 1: 85, 2: 70, 3: 90, 4: 60, 5: 95, 6: 75, 7: 80, 8: 65, 9: 85 },
    2: { 1: 70, 2: 90, 3: 75, 4: 85, 5: 70, 6: 95, 7: 80, 8: 70, 9: 85 },
    3: { 1: 90, 2: 75, 3: 95, 4: 70, 5: 85, 6: 90, 7: 75, 8: 70, 9: 95 },
    4: { 1: 60, 2: 85, 3: 70, 4: 90, 5: 65, 6: 80, 7: 85, 8: 95, 9: 70 },
    5: { 1: 95, 2: 70, 3: 85, 4: 65, 5: 90, 6: 75, 7: 80, 8: 70, 9: 85 },
    6: { 1: 75, 2: 95, 3: 90, 4: 80, 5: 75, 6: 95, 7: 85, 8: 75, 9: 90 },
    7: { 1: 80, 2: 80, 3: 75, 4: 85, 5: 80, 6: 85, 7: 95, 8: 80, 9: 90 },
    8: { 1: 65, 2: 70, 3: 70, 4: 95, 5: 70, 6: 75, 7: 80, 8: 90, 9: 75 },
    9: { 1: 85, 2: 85, 3: 95, 4: 70, 5: 85, 6: 90, 7: 90, 8: 75, 9: 95 }
  };
  
  return compatibilityMatrix[nameNumber]?.[destinyNumber] || 50;
}

/**
 * Get complete numerology analysis
 */
export function analyzeNameNumerology(
  name: string,
  birthDate: Date
): NumerologyAnalysis {
  const nameNumber = calculateNameNumber(name);
  const destinyNumber = calculateDestinyNumber(birthDate);
  const compatibility = calculateNumerologyCompatibility(nameNumber, destinyNumber);
  
  const numberData = NUMBER_MEANINGS[nameNumber];
  
  // Generate recommendations based on compatibility
  const recommendations = {
    en: [] as string[],
    hi: [] as string[]
  };
  
  if (compatibility >= 80) {
    recommendations.en.push('Excellent numerology compatibility with birth date');
    recommendations.en.push('This name will bring positive energy and success');
    recommendations.hi.push('जन्म तिथि के साथ उत्कृष्ट अंकशास्त्र संगतता');
    recommendations.hi.push('यह नाम सकारात्मक ऊर्जा और सफलता लाएगा');
  } else if (compatibility >= 65) {
    recommendations.en.push('Good numerology compatibility with birth date');
    recommendations.en.push('This name will support personal growth');
    recommendations.hi.push('जन्म तिथि के साथ अच्छी अंकशास्त्र संगतता');
    recommendations.hi.push('यह नाम व्यक्तिगत विकास का समर्थन करेगा');
  } else if (compatibility >= 50) {
    recommendations.en.push('Average numerology compatibility');
    recommendations.en.push('Consider other name options for better harmony');
    recommendations.hi.push('औसत अंकशास्त्र संगतता');
    recommendations.hi.push('बेहतर सामंजस्य के लिए अन्य नाम विकल्पों पर विचार करें');
  } else {
    recommendations.en.push('Low numerology compatibility');
    recommendations.en.push('Strongly consider alternative names');
    recommendations.hi.push('कम अंकशास्त्र संगतता');
    recommendations.hi.push('वैकल्पिक नामों पर दृढ़ता से विचार करें');
  }
  
  return {
    nameNumber,
    destinyNumber,
    compatibility,
    vibration: numberData.vibration,
    meaning: numberData.meaning,
    characteristics: numberData.characteristics,
    recommendations
  };
}

/**
 * Get number meaning
 */
export function getNumberMeaning(number: number): {
  vibration: 'Positive' | 'Neutral' | 'Negative';
  meaning: { en: string; hi: string };
  characteristics: { en: string[]; hi: string[] };
} {
  return NUMBER_MEANINGS[number] || {
    vibration: 'Neutral',
    meaning: { en: 'Unknown', hi: 'अज्ञात' },
    characteristics: { en: [], hi: [] }
  };
}

/**
 * Find best name numbers for destiny number
 */
export function getBestNameNumbersForDestiny(destinyNumber: number): number[] {
  const compatibilities: { number: number; score: number }[] = [];
  
  for (let nameNumber = 1; nameNumber <= 9; nameNumber++) {
    const score = calculateNumerologyCompatibility(nameNumber, destinyNumber);
    compatibilities.push({ number: nameNumber, score });
  }
  
  // Sort by score and return top 3
  return compatibilities
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(c => c.number);
}

/**
 * Check if name number is lucky for destiny number
 */
export function isLuckyNameNumber(
  nameNumber: number,
  destinyNumber: number
): boolean {
  const compatibility = calculateNumerologyCompatibility(nameNumber, destinyNumber);
  return compatibility >= 75;
}

export default {
  calculateNameNumber,
  calculateDestinyNumber,
  calculateNumerologyCompatibility,
  analyzeNameNumerology,
  getNumberMeaning,
  getBestNameNumbersForDestiny,
  isLuckyNameNumber,
  CHALDEAN_VALUES,
  NUMBER_MEANINGS
};
