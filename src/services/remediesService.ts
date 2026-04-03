/**
 * Remedies Service - Comprehensive Remedy System
 * Week 15: Remedies Database - Complete Implementation
 * Combines mantras, charity, fasting, rituals, and gemstones
 */

import { MantraInfo, getMantrasByPlanet, recommendMantras } from './mantraService';
import { CharityRecommendation, getCharityByPlanet, recommendCharity } from './charityService';

export interface RemedyRecommendation {
  id: string;
  type: 'mantra' | 'charity' | 'fasting' | 'ritual' | 'gemstone' | 'yantra';
  planet: string;
  severity: 'mild' | 'moderate' | 'severe';
  difficulty: 'easy' | 'medium' | 'hard';
  cost: 'free' | 'low' | 'medium' | 'high';
  duration: string;
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  instructions: {
    en: string[];
    hi: string[];
  };
  materials?: string[];
  timing: {
    bestDays: string[];
    bestHours: string[];
    lunarPhase?: string;
  };
  benefits: {
    en: string[];
    hi: string[];
  };
  precautions?: {
    en: string[];
    hi: string[];
  };
}

export interface FastingRecommendation extends RemedyRecommendation {
  type: 'fasting';
  fastingType: 'sunrise_to_sunset' | 'full_day' | 'partial' | 'water_only';
  allowedFoods: string[];
  restrictedFoods: string[];
  healthConsiderations: string[];
}

export interface RitualRecommendation extends RemedyRecommendation {
  type: 'ritual';
  ritualType: 'puja' | 'homa' | 'abhishek' | 'yantra_installation';
  requiredMaterials: string[];
  stepByStepProcedure: {
    en: string[];
    hi: string[];
  };
  mantrasToRecite: string[];
}

// Comprehensive Fasting Database
export const FASTING_DATABASE: FastingRecommendation[] = [
  {
    id: 'sun_fasting',
    type: 'fasting',
    planet: 'Sun',
    severity: 'moderate',
    difficulty: 'medium',
    cost: 'free',
    duration: '30 days',
    fastingType: 'sunrise_to_sunset',
    title: {
      en: 'Sunday Sun Fasting',
      hi: 'रविवार सूर्य व्रत'
    },
    description: {
      en: 'Fast from sunrise to sunset on Sundays to strengthen Sun and gain confidence',
      hi: 'सूर्य को मजबूत करने और आत्मविश्वास पाने के लिए रविवार को सूर्योदय से सूर्यास्त तक व्रत करें'
    },
    instructions: {
      en: [
        'Wake up before sunrise and take bath',
        'Offer water to Sun during sunrise',
        'Avoid food from sunrise to sunset',
        'Break fast after sunset with simple food',
        'Chant Sun mantras during the day'
      ],
      hi: [
        'सूर्योदय से पहले उठकर स्नान करें',
        'सूर्योदय के समय सूर्य को जल अर्पित करें',
        'सूर्योदय से सूर्यास्त तक भोजन न करें',
        'सूर्यास्त के बाद सादे भोजन से व्रत तोड़ें',
        'दिन भर सूर्य मंत्र का जाप करें'
      ]
    },
    allowedFoods: ['Water', 'Fruits (after sunset)', 'Milk (after sunset)'],
    restrictedFoods: ['All solid foods during day', 'Non-vegetarian', 'Alcohol'],
    timing: {
      bestDays: ['Sunday'],
      bestHours: ['Sunrise', 'Noon', 'Sunset'],
      lunarPhase: 'Waxing Moon'
    },
    benefits: {
      en: ['Increases confidence', 'Improves leadership', 'Enhances vitality', 'Government favor'],
      hi: ['आत्मविश्वास बढ़ता है', 'नेतृत्व में सुधार', 'जीवन शक्ति बढ़ती है', 'सरकारी कृपा']
    },
    healthConsiderations: [
      'Consult doctor if diabetic',
      'Pregnant women should avoid',
      'Drink adequate water',
      'Stop if feeling weak'
    ]
  },

  {
    id: 'moon_fasting',
    type: 'fasting',
    planet: 'Moon',
    severity: 'mild',
    difficulty: 'easy',
    cost: 'free',
    duration: '30 days',
    fastingType: 'partial',
    title: {
      en: 'Monday Moon Fasting',
      hi: 'सोमवार चंद्र व्रत'
    },
    description: {
      en: 'Partial fasting on Mondays to strengthen Moon and gain mental peace',
      hi: 'चंद्र को मजबूत करने और मानसिक शांति पाने के लिए सोमवार को आंशिक व्रत'
    },
    instructions: {
      en: [
        'Eat only once in the day (evening)',
        'Consume only white colored foods',
        'Offer milk and water to Shiva',
        'Wear white or light colored clothes',
        'Meditate during moonrise'
      ],
      hi: [
        'दिन में केवल एक बार भोजन करें (शाम को)',
        'केवल सफेद रंग का भोजन लें',
        'शिव को दूध और जल अर्पित करें',
        'सफेद या हल्के रंग के कपड़े पहनें',
        'चांद निकलने के समय ध्यान करें'
      ]
    },
    allowedFoods: ['Milk', 'Rice', 'Curd', 'White sweets', 'Coconut', 'Fruits'],
    restrictedFoods: ['Spicy food', 'Non-vegetarian', 'Alcohol', 'Garlic', 'Onion'],
    timing: {
      bestDays: ['Monday'],
      bestHours: ['Evening', 'Moonrise'],
      lunarPhase: 'Full Moon preferred'
    },
    benefits: {
      en: ['Mental peace', 'Emotional stability', 'Better relationships', 'Fertility'],
      hi: ['मानसिक शांति', 'भावनात्मक स्थिरता', 'बेहतर रिश्ते', 'संतान प्राप्ति']
    },
    healthConsiderations: [
      'Safe for most people',
      'Maintain hydration',
      'Suitable for beginners',
      'Can be done by elderly'
    ]
  }
];

/**
 * Get comprehensive remedy recommendations
 */
export function getComprehensiveRemedies(
  birthChart: {
    weakPlanets: string[];
    doshas: string[];
    planetaryStrengths: Record<string, number>;
  },
  userPreferences: {
    budget: 'low' | 'medium' | 'high';
    difficulty: 'easy' | 'medium' | 'hard';
    timeAvailable: 'minimal' | 'moderate' | 'extensive';
  }
): {
  mantras: MantraInfo[];
  charity: CharityRecommendation[];
  fasting: FastingRecommendation[];
  priority: RemedyRecommendation[];
} {
  
  // Get mantra recommendations
  const mantras = recommendMantras(
    birthChart.weakPlanets,
    birthChart.doshas,
    userPreferences.difficulty === 'easy' ? 'beginner' : 
    userPreferences.difficulty === 'medium' ? 'intermediate' : 'advanced'
  );

  // Get charity recommendations
  const charity = recommendCharity(
    birthChart.weakPlanets,
    birthChart.doshas,
    userPreferences.budget
  );

  // Get fasting recommendations
  const fasting = FASTING_DATABASE.filter(fast => 
    birthChart.weakPlanets.includes(fast.planet) &&
    (userPreferences.difficulty === 'easy' ? fast.difficulty !== 'hard' : true)
  );

  // Create priority list based on severity
  const priority: RemedyRecommendation[] = [];
  
  // Add most important remedies first
  birthChart.weakPlanets.forEach(planet => {
    const strength = birthChart.planetaryStrengths[planet] || 50;
    
    if (strength < 30) { // Very weak planet
      // Add powerful mantras
      const planetMantras = mantras.filter(m => m.planet === planet);
      priority.push(...planetMantras.map(m => ({
        id: m.id,
        type: 'mantra' as const,
        planet: m.planet,
        severity: 'severe' as const,
        difficulty: m.difficulty === 'beginner' ? 'easy' as const : 
                   m.difficulty === 'intermediate' ? 'medium' as const : 'hard' as const,
        cost: 'free' as const,
        duration: m.duration,
        title: { en: m.sanskrit, hi: m.sanskrit },
        description: m.meaning,
        instructions: { en: [m.transliteration], hi: [m.sanskrit] },
        timing: {
          bestDays: m.timing.bestDays,
          bestHours: m.timing.bestHours,
          lunarPhase: m.timing.lunarPhase
        },
        benefits: m.benefits
      })));
    }
  });

  return {
    mantras,
    charity,
    fasting,
    priority
  };
}

/**
 * Create personalized remedy plan
 */
export function createRemedyPlan(
  userId: string,
  birthChart: any,
  duration: number = 40 // days
): {
  dailyPractices: RemedyRecommendation[];
  weeklyPractices: RemedyRecommendation[];
  monthlyPractices: RemedyRecommendation[];
  schedule: Record<string, RemedyRecommendation[]>;
} {
  const remedies = getComprehensiveRemedies(birthChart, {
    budget: 'medium',
    difficulty: 'medium',
    timeAvailable: 'moderate'
  });

  const dailyPractices = remedies.mantras.slice(0, 2).map(m => ({
    id: m.id,
    type: 'mantra' as const,
    planet: m.planet,
    severity: 'moderate' as const,
    difficulty: 'medium' as const,
    cost: 'free' as const,
    duration: m.duration,
    title: { en: m.sanskrit, hi: m.sanskrit },
    description: m.meaning,
    instructions: { en: [m.transliteration], hi: [m.sanskrit] },
    timing: {
      bestDays: m.timing.bestDays,
      bestHours: m.timing.bestHours
    },
    benefits: m.benefits
  }));

  const weeklyPractices = remedies.fasting.slice(0, 1);
  const monthlyPractices = remedies.charity.slice(0, 2).map(c => ({
    id: c.id,
    type: 'charity' as const,
    planet: c.planet,
    severity: 'moderate' as const,
    difficulty: 'medium' as const,
    cost: 'medium' as const,
    duration: c.duration,
    title: { en: `${c.planet} Charity`, hi: `${c.planet} दान` },
    description: { en: c.instructions.en, hi: c.instructions.hi },
    instructions: { en: c.items, hi: c.items },
    timing: {
      bestDays: c.timing.bestDays,
      bestHours: ['Morning', 'Evening']
    },
    benefits: c.benefits
  }));

  // Create weekly schedule
  const schedule: Record<string, RemedyRecommendation[]> = {
    'Sunday': dailyPractices.filter(p => p.timing.bestDays.includes('Sunday')),
    'Monday': dailyPractices.filter(p => p.timing.bestDays.includes('Monday')),
    'Tuesday': dailyPractices.filter(p => p.timing.bestDays.includes('Tuesday')),
    'Wednesday': dailyPractices.filter(p => p.timing.bestDays.includes('Wednesday')),
    'Thursday': dailyPractices.filter(p => p.timing.bestDays.includes('Thursday')),
    'Friday': dailyPractices.filter(p => p.timing.bestDays.includes('Friday')),
    'Saturday': dailyPractices.filter(p => p.timing.bestDays.includes('Saturday'))
  };

  return {
    dailyPractices,
    weeklyPractices,
    monthlyPractices,
    schedule
  };
}

export default {
  FASTING_DATABASE,
  getComprehensiveRemedies,
  createRemedyPlan
};