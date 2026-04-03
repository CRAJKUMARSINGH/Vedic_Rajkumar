/**
 * Event-Specific Muhurat Service
 * Week 19: Muhurat Calculations - Wednesday Implementation
 * Calculate muhurat for specific life events: Marriage, Business, House warming, etc.
 */

import type { Panchang, Tithi, Nakshatra } from './panchangService';
import type { DailyMuhurat } from './muhuratService';

export type EventType = 
  | 'marriage' 
  | 'business_start' 
  | 'house_warming' 
  | 'vehicle_purchase'
  | 'shop_opening'
  | 'education_start'
  | 'travel'
  | 'naming_ceremony'
  | 'thread_ceremony'
  | 'property_purchase';

export interface EventMuhurat {
  eventType: EventType;
  date: Date;
  startTime: Date;
  endTime: Date;
  quality: number; // 0-100
  panchang: Panchang;
  suitability: 'excellent' | 'good' | 'average' | 'poor';
  auspiciousFactors: {
    en: string[];
    hi: string[];
  };
  inauspiciousFactors: {
    en: string[];
    hi: string[];
  };
  recommendations: {
    en: string[];
    hi: string[];
  };
  alternativeDates?: Date[];
}

export interface EventMuhuratCriteria {
  eventType: EventType;
  auspiciousTithis: string[];
  inauspiciousTithis: string[];
  auspiciousNakshatras: string[];
  inauspiciousNakshatras: string[];
  auspiciousDays: string[];
  inauspiciousDays: string[];
  avoidMonths?: string[];
  specialRules?: string[];
}

/**
 * Marriage Muhurat Criteria
 * Most important event with strict rules
 */
const MARRIAGE_MUHURAT_CRITERIA: EventMuhuratCriteria = {
  eventType: 'marriage',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 
    'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi'
  ],
  inauspiciousTithis: [
    'Pratipada', 'Chaturthi', 'Shashthi', 'Ashtami', 
    'Navami', 'Chaturdashi', 'Amavasya'
  ],
  auspiciousNakshatras: [
    'Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni',
    'Hasta', 'Swati', 'Anuradha', 'Uttara Ashadha',
    'Uttara Bhadrapada', 'Revati'
  ],
  inauspiciousNakshatras: [
    'Bharani', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Mula'
  ],
  auspiciousDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Tuesday', 'Saturday'],
  avoidMonths: ['Chaitra', 'Ashadha', 'Bhadrapada'],
  specialRules: [
    'Avoid Holashtak (8 days before Holi)',
    'Avoid Pitru Paksha (15 days)',
    'Prefer Shukla Paksha (bright fortnight)',
    'Check Manglik dosha compatibility'
  ]
};

/**
 * Business Start Muhurat Criteria
 */
const BUSINESS_START_CRITERIA: EventMuhuratCriteria = {
  eventType: 'business_start',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Saptami',
    'Dashami', 'Ekadashi', 'Trayodashi', 'Purnima'
  ],
  inauspiciousTithis: ['Amavasya', 'Chaturthi', 'Navami'],
  auspiciousNakshatras: [
    'Ashwini', 'Rohini', 'Pushya', 'Hasta', 'Chitra',
    'Swati', 'Anuradha', 'Shravana', 'Revati'
  ],
  inauspiciousNakshatras: ['Bharani', 'Ardra', 'Ashlesha', 'Mula'],
  auspiciousDays: ['Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Saturday'],
  specialRules: [
    'Prefer morning hours',
    'Check Mercury position (business planet)',
    'Avoid Rahu Kaal',
    'Prefer Shukla Paksha'
  ]
};

/**
 * House Warming (Griha Pravesh) Muhurat Criteria
 */
const HOUSE_WARMING_CRITERIA: EventMuhuratCriteria = {
  eventType: 'house_warming',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Saptami',
    'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi'
  ],
  inauspiciousTithis: ['Pratipada', 'Chaturthi', 'Ashtami', 'Navami', 'Amavasya'],
  auspiciousNakshatras: [
    'Ashwini', 'Rohini', 'Mrigashira', 'Pushya', 'Hasta',
    'Chitra', 'Swati', 'Anuradha', 'Revati'
  ],
  inauspiciousNakshatras: ['Bharani', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Mula'],
  auspiciousDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Tuesday', 'Saturday'],
  specialRules: [
    'Perform Vaastu Puja before entry',
    'Enter facing East or North',
    'Carry sacred items (Kalash, etc.)',
    'Avoid inauspicious months'
  ]
};

/**
 * Vehicle Purchase Muhurat Criteria
 */
const VEHICLE_PURCHASE_CRITERIA: EventMuhuratCriteria = {
  eventType: 'vehicle_purchase',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Saptami',
    'Dashami', 'Ekadashi', 'Trayodashi'
  ],
  inauspiciousTithis: ['Amavasya', 'Chaturthi', 'Ashtami', 'Navami'],
  auspiciousNakshatras: [
    'Ashwini', 'Pushya', 'Hasta', 'Anuradha', 'Shravana', 'Revati'
  ],
  inauspiciousNakshatras: ['Bharani', 'Ardra', 'Ashlesha', 'Mula'],
  auspiciousDays: ['Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Saturday'],
  specialRules: [
    'Perform vehicle puja',
    'Avoid Rahu Kaal for first drive',
    'Check Mars position (vehicles)',
    'Prefer morning hours'
  ]
};

/**
 * Shop Opening Muhurat Criteria
 */
const SHOP_OPENING_CRITERIA: EventMuhuratCriteria = {
  eventType: 'shop_opening',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Dashami',
    'Ekadashi', 'Trayodashi', 'Purnima'
  ],
  inauspiciousTithis: ['Amavasya', 'Chaturthi', 'Navami'],
  auspiciousNakshatras: [
    'Ashwini', 'Rohini', 'Pushya', 'Hasta', 'Chitra',
    'Swati', 'Anuradha', 'Shravana', 'Revati'
  ],
  inauspiciousNakshatras: ['Bharani', 'Ardra', 'Ashlesha', 'Mula'],
  auspiciousDays: ['Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Saturday'],
  specialRules: [
    'Perform Lakshmi Puja',
    'Light lamp at entrance',
    'Avoid Rahu Kaal',
    'Prefer Shukla Paksha'
  ]
};

/**
 * Education Start (Vidyarambh) Muhurat Criteria
 */
const EDUCATION_START_CRITERIA: EventMuhuratCriteria = {
  eventType: 'education_start',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Saptami',
    'Dashami', 'Ekadashi', 'Trayodashi'
  ],
  inauspiciousTithis: ['Amavasya', 'Chaturthi', 'Ashtami'],
  auspiciousNakshatras: [
    'Ashwini', 'Rohini', 'Punarvasu', 'Pushya', 'Hasta',
    'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Revati'
  ],
  inauspiciousNakshatras: ['Bharani', 'Ardra', 'Ashlesha'],
  auspiciousDays: ['Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Saturday'],
  specialRules: [
    'Perform Saraswati Puja',
    'Check Mercury and Jupiter positions',
    'Prefer morning hours',
    'Avoid Rahu Kaal'
  ]
};

/**
 * Travel (Yatra) Muhurat Criteria
 */
const TRAVEL_CRITERIA: EventMuhuratCriteria = {
  eventType: 'travel',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Saptami',
    'Dashami', 'Ekadashi', 'Trayodashi'
  ],
  inauspiciousTithis: ['Amavasya', 'Chaturthi', 'Ashtami', 'Navami'],
  auspiciousNakshatras: [
    'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
    'Hasta', 'Anuradha', 'Shravana', 'Revati'
  ],
  inauspiciousNakshatras: ['Bharani', 'Ardra', 'Ashlesha', 'Mula'],
  auspiciousDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Saturday'],
  specialRules: [
    'Avoid Rahu Kaal for departure',
    'Check direction compatibility',
    'Prefer morning departure',
    'Perform travel prayer'
  ]
};

/**
 * Naming Ceremony (Namkaran) Muhurat Criteria
 */
const NAMING_CEREMONY_CRITERIA: EventMuhuratCriteria = {
  eventType: 'naming_ceremony',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Saptami',
    'Dashami', 'Ekadashi', 'Dwadashi'
  ],
  inauspiciousTithis: ['Amavasya', 'Chaturthi', 'Ashtami'],
  auspiciousNakshatras: [
    'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
    'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Revati'
  ],
  inauspiciousNakshatras: ['Bharani', 'Ardra', 'Ashlesha'],
  auspiciousDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Saturday'],
  specialRules: [
    'Typically done on 11th, 12th, or 101st day after birth',
    'Name based on birth nakshatra',
    'Perform puja before naming',
    'Avoid Rahu Kaal'
  ]
};

/**
 * Thread Ceremony (Upanayana) Muhurat Criteria
 */
const THREAD_CEREMONY_CRITERIA: EventMuhuratCriteria = {
  eventType: 'thread_ceremony',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Saptami',
    'Dashami', 'Ekadashi', 'Trayodashi'
  ],
  inauspiciousTithis: ['Amavasya', 'Chaturthi', 'Ashtami', 'Navami'],
  auspiciousNakshatras: [
    'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta',
    'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Revati'
  ],
  inauspiciousNakshatras: ['Bharani', 'Ardra', 'Ashlesha', 'Jyeshtha'],
  auspiciousDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Tuesday', 'Saturday'],
  specialRules: [
    'Typically done between ages 7-16',
    'Prefer Vasant (spring) season',
    'Perform elaborate rituals',
    'Check Jupiter position'
  ]
};

/**
 * Property Purchase Muhurat Criteria
 */
const PROPERTY_PURCHASE_CRITERIA: EventMuhuratCriteria = {
  eventType: 'property_purchase',
  auspiciousTithis: [
    'Dwitiya', 'Tritiya', 'Panchami', 'Saptami',
    'Dashami', 'Ekadashi', 'Trayodashi'
  ],
  inauspiciousTithis: ['Amavasya', 'Chaturthi', 'Ashtami'],
  auspiciousNakshatras: [
    'Rohini', 'Mrigashira', 'Pushya', 'Hasta', 'Chitra',
    'Swati', 'Anuradha', 'Shravana', 'Revati'
  ],
  inauspiciousNakshatras: ['Bharani', 'Ardra', 'Ashlesha', 'Mula'],
  auspiciousDays: ['Wednesday', 'Thursday', 'Friday'],
  inauspiciousDays: ['Saturday'],
  specialRules: [
    'Check Vaastu compliance',
    'Perform property puja',
    'Avoid Rahu Kaal for signing',
    'Check Mars and Saturn positions'
  ]
};

/**
 * Get criteria for event type
 */
export function getEventCriteria(eventType: EventType): EventMuhuratCriteria {
  const criteriaMap: Record<EventType, EventMuhuratCriteria> = {
    marriage: MARRIAGE_MUHURAT_CRITERIA,
    business_start: BUSINESS_START_CRITERIA,
    house_warming: HOUSE_WARMING_CRITERIA,
    vehicle_purchase: VEHICLE_PURCHASE_CRITERIA,
    shop_opening: SHOP_OPENING_CRITERIA,
    education_start: EDUCATION_START_CRITERIA,
    travel: TRAVEL_CRITERIA,
    naming_ceremony: NAMING_CEREMONY_CRITERIA,
    thread_ceremony: THREAD_CEREMONY_CRITERIA,
    property_purchase: PROPERTY_PURCHASE_CRITERIA
  };
  
  return criteriaMap[eventType];
}

/**
 * Calculate event muhurat quality based on Panchang
 */
export function calculateEventMuhuratQuality(
  eventType: EventType,
  panchang: Panchang,
  dailyMuhurat: DailyMuhurat
): number {
  const criteria = getEventCriteria(eventType);
  let quality = 50; // Base quality
  
  // Check Tithi
  if (criteria.auspiciousTithis.includes(panchang.tithi.name)) {
    quality += 15;
  } else if (criteria.inauspiciousTithis.includes(panchang.tithi.name)) {
    quality -= 20;
  }
  
  // Check Nakshatra
  if (criteria.auspiciousNakshatras.includes(panchang.nakshatra.name)) {
    quality += 15;
  } else if (criteria.inauspiciousNakshatras.includes(panchang.nakshatra.name)) {
    quality -= 20;
  }
  
  // Check Day
  if (criteria.auspiciousDays.includes(panchang.var.day)) {
    quality += 10;
  } else if (criteria.inauspiciousDays.includes(panchang.var.day)) {
    quality -= 15;
  }
  
  // Add daily muhurat quality bonus
  quality += (dailyMuhurat.overallQuality - 50) * 0.2;
  
  return Math.max(0, Math.min(100, Math.round(quality)));
}

/**
 * Get suitability rating from quality score
 */
export function getSuitability(quality: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (quality >= 80) return 'excellent';
  if (quality >= 65) return 'good';
  if (quality >= 50) return 'average';
  return 'poor';
}

/**
 * Identify auspicious factors for event
 */
export function identifyAuspiciousFactors(
  eventType: EventType,
  panchang: Panchang
): { en: string[]; hi: string[] } {
  const criteria = getEventCriteria(eventType);
  const factors = { en: [] as string[], hi: [] as string[] };
  
  if (criteria.auspiciousTithis.includes(panchang.tithi.name)) {
    factors.en.push(`Auspicious Tithi: ${panchang.tithi.name}`);
    factors.hi.push(`शुभ तिथि: ${panchang.tithi.name}`);
  }
  
  if (criteria.auspiciousNakshatras.includes(panchang.nakshatra.name)) {
    factors.en.push(`Auspicious Nakshatra: ${panchang.nakshatra.name}`);
    factors.hi.push(`शुभ नक्षत्र: ${panchang.nakshatra.name}`);
  }
  
  if (criteria.auspiciousDays.includes(panchang.var.day)) {
    factors.en.push(`Auspicious Day: ${panchang.var.day}`);
    factors.hi.push(`शुभ दिन: ${panchang.var.day}`);
  }
  
  if (panchang.tithi.quality === 'auspicious') {
    factors.en.push('Favorable lunar day');
    factors.hi.push('अनुकूल चंद्र दिवस');
  }
  
  return factors;
}

/**
 * Identify inauspicious factors for event
 */
export function identifyInauspiciousFactors(
  eventType: EventType,
  panchang: Panchang
): { en: string[]; hi: string[] } {
  const criteria = getEventCriteria(eventType);
  const factors = { en: [] as string[], hi: [] as string[] };
  
  if (criteria.inauspiciousTithis.includes(panchang.tithi.name)) {
    factors.en.push(`Inauspicious Tithi: ${panchang.tithi.name}`);
    factors.hi.push(`अशुभ तिथि: ${panchang.tithi.name}`);
  }
  
  if (criteria.inauspiciousNakshatras.includes(panchang.nakshatra.name)) {
    factors.en.push(`Inauspicious Nakshatra: ${panchang.nakshatra.name}`);
    factors.hi.push(`अशुभ नक्षत्र: ${panchang.nakshatra.name}`);
  }
  
  if (criteria.inauspiciousDays.includes(panchang.var.day)) {
    factors.en.push(`Inauspicious Day: ${panchang.var.day}`);
    factors.hi.push(`अशुभ दिन: ${panchang.var.day}`);
  }
  
  if (panchang.tithi.quality === 'inauspicious') {
    factors.en.push('Unfavorable lunar day');
    factors.hi.push('प्रतिकूल चंद्र दिवस');
  }
  
  return factors;
}

/**
 * Generate recommendations for event
 */
export function generateEventRecommendations(
  eventType: EventType,
  quality: number,
  panchang: Panchang
): { en: string[]; hi: string[] } {
  const criteria = getEventCriteria(eventType);
  const recommendations = { en: [] as string[], hi: [] as string[] };
  
  if (quality >= 80) {
    recommendations.en.push('Excellent time for this event');
    recommendations.hi.push('इस कार्यक्रम के लिए उत्कृष्ट समय');
  } else if (quality >= 65) {
    recommendations.en.push('Good time for this event');
    recommendations.hi.push('इस कार्यक्रम के लिए अच्छा समय');
  } else if (quality < 50) {
    recommendations.en.push('Consider alternative dates');
    recommendations.hi.push('वैकल्पिक तिथियों पर विचार करें');
  }
  
  // Add special rules
  if (criteria.specialRules) {
    recommendations.en.push(...criteria.specialRules);
    // Simplified Hindi translations
    recommendations.hi.push(...criteria.specialRules.map(rule => rule));
  }
  
  return recommendations;
}

/**
 * Calculate complete event muhurat
 */
export function calculateEventMuhurat(
  eventType: EventType,
  panchang: Panchang,
  dailyMuhurat: DailyMuhurat
): EventMuhurat {
  const quality = calculateEventMuhuratQuality(eventType, panchang, dailyMuhurat);
  const suitability = getSuitability(quality);
  const auspiciousFactors = identifyAuspiciousFactors(eventType, panchang);
  const inauspiciousFactors = identifyInauspiciousFactors(eventType, panchang);
  const recommendations = generateEventRecommendations(eventType, quality, panchang);
  
  // Use best time from daily muhurat
  const startTime = dailyMuhurat.bestTime;
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours
  
  return {
    eventType,
    date: panchang.date,
    startTime,
    endTime,
    quality,
    panchang,
    suitability,
    auspiciousFactors,
    inauspiciousFactors,
    recommendations
  };
}

/**
 * Find best dates for event in date range
 */
export function findBestDatesForEvent(
  eventType: EventType,
  startDate: Date,
  endDate: Date,
  panchangList: Panchang[],
  dailyMuhuratList: DailyMuhurat[],
  count: number = 5
): EventMuhurat[] {
  const eventMuhurats: EventMuhurat[] = [];
  
  for (let i = 0; i < panchangList.length && i < dailyMuhuratList.length; i++) {
    const muhurat = calculateEventMuhurat(eventType, panchangList[i], dailyMuhuratList[i]);
    eventMuhurats.push(muhurat);
  }
  
  // Sort by quality and return top dates
  return eventMuhurats
    .sort((a, b) => b.quality - a.quality)
    .slice(0, count);
}

export default {
  getEventCriteria,
  calculateEventMuhuratQuality,
  getSuitability,
  identifyAuspiciousFactors,
  identifyInauspiciousFactors,
  generateEventRecommendations,
  calculateEventMuhurat,
  findBestDatesForEvent,
  MARRIAGE_MUHURAT_CRITERIA,
  BUSINESS_START_CRITERIA,
  HOUSE_WARMING_CRITERIA,
  VEHICLE_PURCHASE_CRITERIA,
  SHOP_OPENING_CRITERIA,
  EDUCATION_START_CRITERIA,
  TRAVEL_CRITERIA,
  NAMING_CEREMONY_CRITERIA,
  THREAD_CEREMONY_CRITERIA,
  PROPERTY_PURCHASE_CRITERIA
};
