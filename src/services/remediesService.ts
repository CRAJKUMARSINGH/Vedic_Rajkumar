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

// === V2.1 SIX-LAYER REMEDY STACK ===

export interface SixLayerRemedyStack {
  planet: string;              // Target planet (weakest in promise chain)
  queryContext: string;
  layer1_behavioral: string;   // Concrete daily action
  layer2_psychological: string; // Inner reframe
  layer3_spiritual: string;    // Named mantra + count + mechanism
  layer4_practical: string;    // Dietary/lifestyle
  layer5_karmic: string;       // Service to discharge planetary debt
  layer6_ritual: string;       // Ceremonial (optional)
  duration: string;
  expectedOutcome: string;
}

export interface RemedyInput {
  weakestPlanet: string;
  weakestPlanetRupas: number;
  nakshatraFear?: { coreFear: string; reframe: string };
  saturnWound?: string;
  queryContext: string;
}

const PLANET_BEHAVIORAL_REMEDIES: Record<string, (context: string) => string> = {
  Saturn: () => 'Daily discipline practice: Wake at the same time, complete one difficult task before pleasure, tolerate delay without complaint. Track consistency, not results.',
  Venus: () => 'Receiving pleasure without guilt practice: Each day, accept one compliment without deflection. Give one genuine beauty-acknowledgment to another without expecting return.',
  Mercury: () => 'Communication discipline: Read one paragraph aloud each morning. Write 100 structured words daily. Teach something you know to someone once per week.',
  Mars: () => 'Controlled assertion practice: One act of physical courage daily (cold shower, hard conversation, physical exertion). Channel anger into action within 24 hours — never suppress, never explode.',
  Jupiter: () => 'Structured giving: Teach or expand another person\'s knowledge for 30 minutes weekly. Give without being asked. Mentor someone younger or less experienced.',
  Moon: () => 'Emotional regulation practice: 10 minutes of water contact daily (bath, ocean, drinking mindfully). One nurturing act for another. Track emotional states without judgment.',
  Sun: () => 'Leadership practice: One public action daily — post, speak, decide, lead. 10 minutes solar exposure before 8 AM. Take responsibility for one outcome you did not cause.',
  Rahu: () => 'Confront the obsession: Name your foreign/unconventional desire aloud. Channel one Rahu-impulse productively per week. Study what you fear most for 20 minutes daily.',
  Ketu: () => 'Release practice: Remove one attachment weekly (physical or digital). 10 minutes of structured silence daily. Write what you are done with, burn the paper.',
};

const PLANET_MANTRAS: Record<string, { mantra: string; count: number; timing: string; mechanism: string }> = {
  Saturn: { 
    mantra: 'Om Sham Shanicharaya Namah', 
    count: 23000, 
    timing: 'Saturday evenings, 108 repetitions daily',
    mechanism: 'Vibrates the root chakra, builds patience neural pathways, slows reactive patterns'
  },
  Venus: { 
    mantra: 'Om Shum Shukraya Namah', 
    count: 16000, 
    timing: 'Friday mornings, 108 repetitions daily',
    mechanism: 'Opens heart chakra receptivity, dissolves guilt-pleasure association'
  },
  Mercury: { 
    mantra: 'Om Bum Budhaya Namah', 
    count: 9000, 
    timing: 'Wednesday mornings, 108 repetitions daily',
    mechanism: 'Activates throat chakra, structures neural language processing'
  },
  Mars: { 
    mantra: 'Om Bhaum Bhaumaya Namah', 
    count: 10000, 
    timing: 'Tuesday mornings, 108 repetitions daily',
    mechanism: 'Channels solar plexus energy into disciplined action'
  },
  Jupiter: { 
    mantra: 'Om Gram Grim Graum Sah Guruve Namah', 
    count: 19000, 
    timing: 'Thursday mornings, 108 repetitions daily',
    mechanism: 'Expands prefrontal cortex perspective-taking, opens crown chakra'
  },
  Moon: { 
    mantra: 'Om Som Somaya Namah', 
    count: 11000, 
    timing: 'Monday evenings, 108 repetitions daily',
    mechanism: 'Stabilizes limbic system, regulates emotional tidal patterns'
  },
  Sun: { 
    mantra: 'Om Hram Hrim Hraum Sah Suryaya Namah', 
    count: 7000, 
    timing: 'Sunday sunrise, 108 repetitions daily',
    mechanism: 'Activates solar plexus, builds authentic presence neural circuits'
  },
  Rahu: { 
    mantra: 'Om Bhram Bhramaya Namah', 
    count: 18000, 
    timing: 'Saturday midnight hour, 108 repetitions daily',
    mechanism: 'Integrates shadow material, channels obsessive energy into creation'
  },
  Ketu: { 
    mantra: 'Om Stram Strim Straum Sah Ketave Namah', 
    count: 17000, 
    timing: 'Tuesday late night, 108 repetitions daily',
    mechanism: 'Facilitates release of karmic patterns, opens third eye detachment'
  },
};

const PLANET_PRACTICAL_REMEDIES: Record<string, string> = {
  Saturn: 'Iron-rich foods (spinach, lentils). Avoid cold/raw after sunset. Black sesame in diet. Strict sleep schedule — same time, every day.',
  Venus: 'Sweet fruits, white foods (rice, milk). Avoid over-sour. Rose water. Maintain beauty/art in living space. Silk or cotton fabrics only.',
  Mercury: 'Green vegetables, moong dal. Avoid excess salt. Brahmi herb. Clean, organized workspace. Digital sunset at 8 PM.',
  Mars: 'Red lentils, turmeric, ginger. Avoid excess oil. Pitta-calming diet. Morning exercise before 8 AM. Red/pink accents in environment.',
  Jupiter: 'Yellow foods (turmeric, saffron). Avoid excess alcohol. Chickpeas. Expand knowledge — one philosophical text monthly. Yellow clothing on Thursdays.',
  Moon: 'Hydration protocol — warm water every hour. Dairy in moderation. White foods. Sleep by 10 PM. Moon-gazing when visible.',
  Sun: 'Protein-rich breakfast before 9 AM. Citrus fruits. Avoid excessive fasting. Leadership role in one group activity weekly. Gold or orange accents.',
  Rahu: 'Blue/purple foods (blueberries, eggplant). Avoid processed food entirely. Foreign cuisine once weekly. Technology fast one day weekly.',
  Ketu: 'Fasting one day weekly (EKADASHI). Simple foods — one grain, one vegetable. Meditation before sleep. Grey or brown earth tones.',
};

const PLANET_KARMIC_SERVICES: Record<string, string> = {
  Saturn: 'Service to elderly: Visit an old age home monthly. Mentor someone from a disadvantaged background. Complete tasks others abandon — without complaint, without credit.',
  Venus: 'Beauty service: Help someone feel attractive/loved weekly. Arrange flowers for a temple. Fund or create art for public spaces. Relationship counseling — volunteer.',
  Mercury: 'Teaching literacy: Volunteer teach reading to adults or children. Translate spiritual texts. Help someone write their story. Library service.',
  Mars: 'Physical protection: Train in self-defense and teach it. Blood donation quarterly. Stand up for someone who cannot defend themselves. Build/fix something for community.',
  Jupiter: 'Wisdom transmission: Mentor a student pro bono. Fund a child\'s education. Give spiritual counsel without charge. Expand someone else\'s opportunity — be the door-opener.',
  Moon: 'Nurturing service: Cook for sick or elderly. Emotional support — genuinely listen to someone weekly. Childcare for struggling parents. Water conservation work.',
  Sun: 'Leadership service: Lead a community project without seeking office. Take public responsibility for a collective problem. Father-figure mentorship — guide a young man.',
  Rahu: 'Shadow integration work: Help rehabilitate addicts or prisoners. Foreigner service — help immigrants integrate. Technology for good — build tools for underserved communities.',
  Ketu: 'Release and liberation: Help others let go — grief counseling, decluttering service. Animal shelter work (animals = Ketu). Spiritual retreat service — maintain a sacred space.',
};

const PLANET_RITUAL_REMEDIES: Record<string, string> = {
  Saturn: 'Saturday: Black sesame oil lamp at Shani temple. Iron donation. Hanuman Chalisa. Feed black dogs or crows.',
  Venus: 'Friday: White flower offering at Lakshmi temple. Silver donation. Wear white. Feed white sweets to young girls (kanya puja).',
  Mercury: 'Wednesday: Green cloth to Vishnu temple. Emerald prayer. Feed green vegetables to cows. Budha Graha Shanti puja.',
  Mars: 'Tuesday: Red flower at Hanuman temple. Copper donation. Feed red lentils to poor. Light red sandalwood incense.',
  Jupiter: 'Thursday: Yellow cloth at Dakshinamurthy/Guru temple. Yellow sapphire prayer. Feed brahmins or teachers. Yellow banana donation.',
  Moon: 'Monday: White rice pudding at Shiva temple. Pearl prayer. Feed rice to poor. Moon-water: leave water in silver vessel under moonlight, drink next morning.',
  Sun: 'Sunday: Red flower at Surya temple. Ruby prayer. Surya Namaskar at sunrise. Feed wheat to poor. Gold donation to worthy cause.',
  Rahu: 'Saturday (Rahu kalam): Blue flower at Durga/Kali temple. Hessonite prayer. Feed shadow-caste or foreigners. Rahu Kavacham recitation.',
  Ketu: 'Tuesday (Ketu kalam): Grey cloth at Ganesha temple. Cat\'s eye prayer. Feed dogs or temple maintenance. Ketu Kavacham recitation.',
};

/**
 * LAYER 12 — Six-Layer Behavioral Remedy Stack
 * Diagnostically targeted to the weakest planet in the specific promise chain.
 * NOT generic. Each layer addresses a different dimension of the same deficiency.
 */
export function assembleSixLayerStack(input: RemedyInput): SixLayerRemedyStack {
  const { weakestPlanet, weakestPlanetRupas, nakshatraFear, saturnWound, queryContext } = input;
  
  // Normalize planet name
  const planet = weakestPlanet.charAt(0).toUpperCase() + weakestPlanet.slice(1).toLowerCase();
  
  // Layer 1: Behavioral — concrete daily action
  const behavioralFn = PLANET_BEHAVIORAL_REMEDIES[planet];
  const layer1_behavioral = behavioralFn ? behavioralFn(queryContext) : `Daily practice aligned with ${planet}'s domain. Consult a Jyotishi for planet-specific guidance.`;
  
  // Layer 2: Psychological — inner reframe
  let layer2_psychological: string;
  if (nakshatraFear?.reframe) {
    layer2_psychological = nakshatraFear.reframe;
  } else if (saturnWound && planet === 'Saturn') {
    layer2_psychological = `The wound is not a curse — it is the exact curriculum. ${saturnWound}. Your suffering has a purpose: to build the discipline that success cannot teach.`;
  } else {
    layer2_psychological = `Reframe ${planet}'s challenge as curriculum, not punishment. The planet is not blocking you — it is teaching you what must be learned before the promise can arrive.`;
  }
  
  // Layer 3: Spiritual — mantra
  const mantraData = PLANET_MANTRAS[planet];
  const layer3_spiritual = mantraData
    ? `${mantraData.mantra} — ${mantraData.count} repetitions total (${mantraData.timing}). Mechanism: ${mantraData.mechanism}.`
    : `Consult mantra database for ${planet}-specific bija mantra and count.`;
  
  // Layer 4: Practical — lifestyle
  const layer4_practical = PLANET_PRACTICAL_REMEDIES[planet] || `Lifestyle adjustments aligned with ${planet}'s element and dosha.`;
  
  // Layer 5: Karmic — service
  const layer5_karmic = PLANET_KARMIC_SERVICES[planet] || `Service to others in ${planet}'s domain to discharge planetary debt.`;
  
  // Layer 6: Ritual — ceremonial
  const layer6_ritual = PLANET_RITUAL_REMEDIES[planet] || `Weekday-specific temple offering and donation protocol for ${planet}. Consult panchang for optimal muhurta.`;
  
  // Duration based on weakness severity
  const duration = weakestPlanetRupas < 0.40 ? 'Minimum 6 months sustained, daily practice required' :
                   weakestPlanetRupas < 0.75 ? '3-6 months consistent application' :
                   '40 days minimum with disciplined daily adherence';
  
  const expectedOutcome = weakestPlanetRupas < 0.40 
    ? `With sustained practice, probability increases from low base to moderate. This is a long-term restructuring, not a quick fix. ${planet} requires proof of commitment before releasing its blessings.`
    : `With consistent application, significant improvement in ${queryContext} outcomes within the stated timeframe. ${planet} responds to disciplined effort with disproportionate reward.`;
  
  return {
    planet,
    queryContext,
    layer1_behavioral,
    layer2_psychological,
    layer3_spiritual,
    layer4_practical,
    layer5_karmic,
    layer6_ritual,
    duration,
    expectedOutcome,
  };
}

/**
 * Convenience wrapper used by interpretationEngine.ts
 */
export function assembleSixLayerStackFromStrings(
  weakestPlanet: string,
  nakshatraFearReframe: string,
  saturnWound: string
): SixLayerRemedyStack {
  return assembleSixLayerStack({
    weakestPlanet,
    weakestPlanetRupas: 0.5, // default — caller should override
    nakshatraFear: { coreFear: '', reframe: nakshatraFearReframe },
    saturnWound,
    queryContext: 'general',
  });
}

export default {
  FASTING_DATABASE,
  getComprehensiveRemedies,
  createRemedyPlan
};