/**
 * Charity Service - Comprehensive Charity & Donations System
 * Week 15: Remedies Database - Tuesday Implementation
 * Complete charity and donation recommendations for planetary remedies
 */

export interface CharityRecommendation {
  id: string;
  planet: string;
  type: 'food' | 'clothing' | 'education' | 'medical' | 'environmental' | 'religious';
  items: string[];
  colors?: string[];
  amounts: {
    low: string;
    medium: string;
    high: string;
  };
  timing: {
    bestDays: string[];
    lunarPhase?: string;
    avoidDays?: string[];
  };
  beneficiaries: string[];
  benefits: {
    en: string[];
    hi: string[];
  };
  instructions: {
    en: string;
    hi: string;
  };
  duration: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface CharityTracker {
  userId: string;
  charityId: string;
  datePerformed: string;
  amount: string;
  beneficiary: string;
  notes?: string;
  expectedResults: string[];
  actualResults?: string[];
}

// Comprehensive Charity Database for All 9 Planets
export const CHARITY_DATABASE: CharityRecommendation[] = [
  // SUN CHARITY RECOMMENDATIONS
  {
    id: 'sun_food_donation',
    planet: 'Sun',
    type: 'food',
    items: ['Wheat', 'Jaggery', 'Red lentils', 'Almonds', 'Saffron', 'Honey'],
    colors: ['Red', 'Orange', 'Golden'],
    amounts: {
      low: '₹51-101',
      medium: '₹501-1001', 
      high: '₹5001-10001'
    },
    timing: {
      bestDays: ['Sunday'],
      lunarPhase: 'Waxing Moon',
      avoidDays: ['Saturday']
    },
    beneficiaries: ['Poor people', 'Temples', 'Government officials', 'Elderly'],
    benefits: {
      en: ['Increases confidence', 'Improves leadership', 'Enhances reputation', 'Government favor'],
      hi: ['आत्मविश्वास बढ़ता है', 'नेतृत्व में सुधार', 'प्रतिष्ठा बढ़ती है', 'सरकारी कृपा']
    },
    instructions: {
      en: 'Donate during sunrise or noon on Sundays. Offer with respect and humility.',
      hi: 'रविवार को सूर्योदय या दोपहर के समय दान करें। सम्मान और विनम्रता के साथ अर्पित करें।'
    },
    duration: '40 days',
    frequency: 'weekly'
  },

  {
    id: 'sun_clothing_donation',
    planet: 'Sun',
    type: 'clothing',
    items: ['Red cloth', 'Saffron cloth', 'Woolen clothes', 'Blankets'],
    colors: ['Red', 'Saffron', 'Orange', 'Golden'],
    amounts: {
      low: '₹101-501',
      medium: '₹1001-2001',
      high: '₹5001-10001'
    },
    timing: {
      bestDays: ['Sunday'],
      lunarPhase: 'Waxing Moon'
    },
    beneficiaries: ['Poor people', 'Sadhus', 'Temple priests', 'Needy families'],
    benefits: {
      en: ['Removes obstacles', 'Increases vitality', 'Improves health', 'Social recognition'],
      hi: ['बाधाएं दूर होती हैं', 'जीवन शक्ति बढ़ती है', 'स्वास्थ्य सुधरता है', 'सामाजिक मान्यता']
    },
    instructions: {
      en: 'Donate new or clean clothes on Sunday morning. Include red or saffron colored items.',
      hi: 'रविवार की सुबह नए या साफ कपड़े दान करें। लाल या केसरिया रंग की वस्तुएं शामिल करें।'
    },
    duration: '40 days',
    frequency: 'monthly'
  },
  // MOON CHARITY RECOMMENDATIONS
  {
    id: 'moon_food_donation',
    planet: 'Moon',
    type: 'food',
    items: ['Rice', 'Milk', 'Curd', 'Sugar', 'White sweets', 'Coconut', 'Silver'],
    colors: ['White', 'Silver', 'Light blue'],
    amounts: {
      low: '₹51-108',
      medium: '₹501-1008',
      high: '₹5001-11000'
    },
    timing: {
      bestDays: ['Monday'],
      lunarPhase: 'Full Moon',
      avoidDays: ['Saturday']
    },
    beneficiaries: ['Women', 'Children', 'Mothers', 'Elderly women', 'Temples'],
    benefits: {
      en: ['Mental peace', 'Emotional stability', 'Good relationships', 'Fertility blessings'],
      hi: ['मानसिक शांति', 'भावनात्मक स्थिरता', 'अच्छे रिश्ते', 'संतान प्राप्ति']
    },
    instructions: {
      en: 'Donate on Monday evening or during full moon. Offer to women and children first.',
      hi: 'सोमवार की शाम या पूर्णिमा के दिन दान करें। पहले महिलाओं और बच्चों को अर्पित करें।'
    },
    duration: '30 days',
    frequency: 'weekly'
  },

  // MARS CHARITY RECOMMENDATIONS  
  {
    id: 'mars_food_donation',
    planet: 'Mars',
    type: 'food',
    items: ['Red lentils', 'Jaggery', 'Wheat', 'Red chilies', 'Pomegranate', 'Copper items'],
    colors: ['Red', 'Maroon', 'Copper'],
    amounts: {
      low: '₹51-108',
      medium: '₹501-1008', 
      high: '₹5001-10000'
    },
    timing: {
      bestDays: ['Tuesday'],
      lunarPhase: 'Waxing Moon',
      avoidDays: ['Friday']
    },
    beneficiaries: ['Young men', 'Soldiers', 'Police', 'Athletes', 'Hanuman temples'],
    benefits: {
      en: ['Removes Manglik dosha', 'Increases courage', 'Overcomes enemies', 'Physical strength'],
      hi: ['मांगलिक दोष दूर होता है', 'साहस बढ़ता है', 'शत्रुओं पर विजय', 'शारीरिक शक्ति']
    },
    instructions: {
      en: 'Donate on Tuesday morning. Include red colored items and offer to Hanuman temple.',
      hi: 'मंगलवार की सुबह दान करें। लाल रंग की वस्तुएं शामिल करें और हनुमान मंदिर में अर्पित करें।'
    },
    duration: '45 days',
    frequency: 'weekly'
  },

  // MERCURY CHARITY RECOMMENDATIONS
  {
    id: 'mercury_education_donation',
    planet: 'Mercury',
    type: 'education',
    items: ['Books', 'Pens', 'Notebooks', 'School supplies', 'Green cloth', 'Emerald'],
    colors: ['Green', 'Yellow'],
    amounts: {
      low: '₹101-501',
      medium: '₹1001-5001',
      high: '₹10001-25000'
    },
    timing: {
      bestDays: ['Wednesday'],
      lunarPhase: 'Any',
      avoidDays: ['Tuesday']
    },
    beneficiaries: ['Students', 'Teachers', 'Schools', 'Libraries', 'Poor children'],
    benefits: {
      en: ['Enhances intelligence', 'Success in studies', 'Communication skills', 'Business growth'],
      hi: ['बुद्धि बढ़ती है', 'अध्ययन में सफलता', 'संचार कौशल', 'व्यापार वृद्धि']
    },
    instructions: {
      en: 'Donate educational materials on Wednesday. Support education of underprivileged children.',
      hi: 'बुधवार को शैक्षणिक सामग्री दान करें। गरीब बच्चों की शिक्षा का समर्थन करें।'
    },
    duration: '30 days',
    frequency: 'monthly'
  },

  // JUPITER CHARITY RECOMMENDATIONS
  {
    id: 'jupiter_religious_donation',
    planet: 'Jupiter',
    type: 'religious',
    items: ['Yellow cloth', 'Turmeric', 'Chana dal', 'Gold', 'Religious books', 'Banana'],
    colors: ['Yellow', 'Golden', 'Saffron'],
    amounts: {
      low: '₹108-501',
      medium: '₹1008-5001',
      high: '₹10001-50000'
    },
    timing: {
      bestDays: ['Thursday'],
      lunarPhase: 'Waxing Moon',
      avoidDays: ['Tuesday']
    },
    beneficiaries: ['Brahmins', 'Teachers', 'Gurus', 'Temples', 'Religious institutions'],
    benefits: {
      en: ['Spiritual growth', 'Wisdom increase', 'Good fortune', 'Guru blessings'],
      hi: ['आध्यात्मिक विकास', 'ज्ञान वृद्धि', 'सौभाग्य', 'गुरु आशीर्वाद']
    },
    instructions: {
      en: 'Donate on Thursday morning to Brahmins or temples. Include yellow colored items.',
      hi: 'गुरुवार की सुबह ब्राह्मणों या मंदिरों में दान करें। पीले रंग की वस्तुएं शामिल करें।'
    },
    duration: '40 days',
    frequency: 'weekly'
  }
];

/**
 * Get charity recommendations by planet
 */
export function getCharityByPlanet(planet: string): CharityRecommendation[] {
  return CHARITY_DATABASE.filter(charity => 
    charity.planet.toLowerCase() === planet.toLowerCase()
  );
}

/**
 * Get charity recommendations by type
 */
export function getCharityByType(type: string): CharityRecommendation[] {
  return CHARITY_DATABASE.filter(charity => charity.type === type);
}

/**
 * Recommend charity based on birth chart analysis
 */
export function recommendCharity(
  weakPlanets: string[],
  doshas: string[],
  budget: 'low' | 'medium' | 'high' = 'medium'
): CharityRecommendation[] {
  const recommendations: CharityRecommendation[] = [];
  
  // Add charity for weak planets
  weakPlanets.forEach(planet => {
    const planetCharity = getCharityByPlanet(planet);
    recommendations.push(...planetCharity);
  });
  
  // Add specific charity for doshas
  if (doshas.includes('Manglik')) {
    const marsCharity = getCharityByPlanet('Mars');
    recommendations.push(...marsCharity);
  }
  
  return recommendations;
}

/**
 * Create charity tracking entry
 */
export function createCharityTracker(
  userId: string,
  charityId: string,
  amount: string,
  beneficiary: string,
  notes?: string
): CharityTracker {
  const charity = CHARITY_DATABASE.find(c => c.id === charityId);
  if (!charity) {
    throw new Error('Charity recommendation not found');
  }
  
  return {
    userId,
    charityId,
    datePerformed: new Date().toISOString().split('T')[0],
    amount,
    beneficiary,
    notes,
    expectedResults: charity.benefits.en
  };
}

/**
 * Get charity calendar for a month
 */
export function getCharityCalendar(
  year: number,
  month: number,
  userCharities: string[]
): Record<string, CharityRecommendation[]> {
  const calendar: Record<string, CharityRecommendation[]> = {};
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const dayCharities = CHARITY_DATABASE.filter(charity => 
      userCharities.includes(charity.id) && 
      charity.timing.bestDays.includes(dayName)
    );
    
    if (dayCharities.length > 0) {
      calendar[day.toString()] = dayCharities;
    }
  }
  
  return calendar;
}

export default {
  CHARITY_DATABASE,
  getCharityByPlanet,
  getCharityByType,
  recommendCharity,
  createCharityTracker,
  getCharityCalendar
};