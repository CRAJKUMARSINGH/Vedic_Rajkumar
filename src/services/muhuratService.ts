/**
 * Muhurat Service - Auspicious and Inauspicious Periods
 * Week 19: Muhurat Calculations - Tuesday Implementation
 * Calculate auspicious periods (Abhijit, Brahma, etc.) and inauspicious periods (Rahu Kaal, etc.)
 */

export type AuspiciousPeriodType = 'abhijit' | 'brahma' | 'godhuli' | 'vijaya' | 'amrit';
export type InauspiciousPeriodType = 'rahu_kaal' | 'yamaganda' | 'gulika' | 'dur_muhurat' | 'varjyam';

export interface AuspiciousPeriod {
  name: string;
  type: AuspiciousPeriodType;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  quality: number; // 0-100
  description: {
    en: string;
    hi: string;
  };
  suitableFor: {
    en: string[];
    hi: string[];
  };
}

export interface InauspiciousPeriod {
  name: string;
  type: InauspiciousPeriodType;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  severity: 'low' | 'medium' | 'high';
  description: {
    en: string;
    hi: string;
  };
  effects: {
    en: string[];
    hi: string[];
  };
  avoidActivities: {
    en: string[];
    hi: string[];
  };
}

export interface DailyMuhurat {
  date: Date;
  sunrise: Date;
  sunset: Date;
  auspiciousPeriods: AuspiciousPeriod[];
  inauspiciousPeriods: InauspiciousPeriod[];
  overallQuality: number; // 0-100
  bestTime: Date;
  worstTime: Date;
}

/**
 * Calculate Abhijit Muhurat (Noon period - 24 minutes)
 * Most auspicious period, occurs at midday
 * Duration: 24 minutes (8th muhurat of the day)
 */
export function calculateAbhijitMuhurat(date: Date, sunrise: Date, sunset: Date): AuspiciousPeriod {
  // Calculate day duration
  const dayDuration = sunset.getTime() - sunrise.getTime();
  
  // Abhijit is the 8th muhurat (each muhurat is 1/15th of day)
  // It starts at 7/15th of the day and lasts for 1/15th
  const abhijitStart = new Date(sunrise.getTime() + (dayDuration * 7 / 15));
  const abhijitEnd = new Date(sunrise.getTime() + (dayDuration * 8 / 15));
  
  const duration = (abhijitEnd.getTime() - abhijitStart.getTime()) / 60000; // minutes
  
  return {
    name: 'Abhijit Muhurat',
    type: 'abhijit',
    startTime: abhijitStart,
    endTime: abhijitEnd,
    duration,
    quality: 95,
    description: {
      en: 'Most auspicious period at midday, removes all obstacles',
      hi: 'दोपहर का सबसे शुभ समय, सभी बाधाओं को दूर करता है'
    },
    suitableFor: {
      en: [
        'Starting new ventures',
        'Important meetings',
        'Business deals',
        'Signing contracts',
        'Travel',
        'All auspicious works'
      ],
      hi: [
        'नए उद्यम शुरू करना',
        'महत्वपूर्ण बैठकें',
        'व्यापारिक सौदे',
        'अनुबंध पर हस्ताक्षर',
        'यात्रा',
        'सभी शुभ कार्य'
      ]
    }
  };
}

/**
 * Calculate Brahma Muhurat (Pre-dawn period - 96 minutes)
 * Sacred time for spiritual practices
 * Occurs 96 minutes before sunrise
 */
export function calculateBrahmaMuhurat(sunrise: Date): AuspiciousPeriod {
  const brahmaStart = new Date(sunrise.getTime() - 96 * 60000); // 96 minutes before sunrise
  const brahmaEnd = new Date(sunrise.getTime());
  
  return {
    name: 'Brahma Muhurat',
    type: 'brahma',
    startTime: brahmaStart,
    endTime: brahmaEnd,
    duration: 96,
    quality: 90,
    description: {
      en: 'Sacred pre-dawn period, best for meditation and spiritual practices',
      hi: 'पवित्र प्रभात काल, ध्यान और आध्यात्मिक अभ्यास के लिए सर्वोत्तम'
    },
    suitableFor: {
      en: [
        'Meditation',
        'Yoga',
        'Prayer',
        'Spiritual practices',
        'Study',
        'Planning'
      ],
      hi: [
        'ध्यान',
        'योग',
        'प्रार्थना',
        'आध्यात्मिक अभ्यास',
        'अध्ययन',
        'योजना'
      ]
    }
  };
}

/**
 * Calculate Godhuli Muhurat (Twilight period)
 * Auspicious time during sunset
 */
export function calculateGodhulMuhurat(sunset: Date): AuspiciousPeriod {
  const godhulStart = new Date(sunset.getTime() - 24 * 60000); // 24 minutes before sunset
  const godhulEnd = new Date(sunset.getTime() + 24 * 60000); // 24 minutes after sunset
  
  return {
    name: 'Godhuli Muhurat',
    type: 'godhuli',
    startTime: godhulStart,
    endTime: godhulEnd,
    duration: 48,
    quality: 85,
    description: {
      en: 'Twilight period, auspicious for worship and charity',
      hi: 'गोधूलि बेला, पूजा और दान के लिए शुभ'
    },
    suitableFor: {
      en: [
        'Worship',
        'Charity',
        'Lighting lamps',
        'Evening prayers',
        'Religious ceremonies'
      ],
      hi: [
        'पूजा',
        'दान',
        'दीप जलाना',
        'संध्या प्रार्थना',
        'धार्मिक समारोह'
      ]
    }
  };
}

/**
 * Calculate Vijaya Muhurat (Victory time)
 * Afternoon auspicious period
 */
export function calculateVijayaMuhurat(date: Date, sunrise: Date, sunset: Date): AuspiciousPeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  
  // Vijaya is typically in the afternoon (around 2-3 PM)
  const vijayaStart = new Date(sunrise.getTime() + (dayDuration * 9 / 15));
  const vijayaEnd = new Date(sunrise.getTime() + (dayDuration * 10 / 15));
  
  const duration = (vijayaEnd.getTime() - vijayaStart.getTime()) / 60000;
  
  return {
    name: 'Vijaya Muhurat',
    type: 'vijaya',
    startTime: vijayaStart,
    endTime: vijayaEnd,
    duration,
    quality: 88,
    description: {
      en: 'Victory time, ensures success in endeavors',
      hi: 'विजय मुहूर्त, प्रयासों में सफलता सुनिश्चित करता है'
    },
    suitableFor: {
      en: [
        'Competitions',
        'Exams',
        'Interviews',
        'Court cases',
        'Challenges',
        'Important decisions'
      ],
      hi: [
        'प्रतियोगिताएं',
        'परीक्षाएं',
        'साक्षात्कार',
        'अदालती मामले',
        'चुनौतियां',
        'महत्वपूर्ण निर्णय'
      ]
    }
  };
}

/**
 * Calculate Amrit Kaal (Nectar period)
 * Highly auspicious period
 */
export function calculateAmritKaal(date: Date, sunrise: Date, sunset: Date): AuspiciousPeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  
  // Amrit Kaal varies by day, simplified calculation
  const amritStart = new Date(sunrise.getTime() + (dayDuration * 5 / 15));
  const amritEnd = new Date(sunrise.getTime() + (dayDuration * 6 / 15));
  
  const duration = (amritEnd.getTime() - amritStart.getTime()) / 60000;
  
  return {
    name: 'Amrit Kaal',
    type: 'amrit',
    startTime: amritStart,
    endTime: amritEnd,
    duration,
    quality: 92,
    description: {
      en: 'Nectar period, highly auspicious for all activities',
      hi: 'अमृत काल, सभी गतिविधियों के लिए अत्यंत शुभ'
    },
    suitableFor: {
      en: [
        'All auspicious works',
        'Ceremonies',
        'Purchases',
        'Investments',
        'New beginnings'
      ],
      hi: [
        'सभी शुभ कार्य',
        'समारोह',
        'खरीदारी',
        'निवेश',
        'नई शुरुआत'
      ]
    }
  };
}

/**
 * Calculate Rahu Kaal (Inauspicious period ruled by Rahu)
 * Duration: 90 minutes daily, timing varies by weekday
 */
export function calculateRahuKaal(date: Date, sunrise: Date, sunset: Date): InauspiciousPeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const muhuratDuration = dayDuration / 8; // Day divided into 8 parts
  
  // Rahu Kaal timing by weekday (0 = Sunday)
  const dayOfWeek = date.getDay();
  const rahuKaalMuhurat = [7, 1, 6, 4, 5, 3, 2][dayOfWeek]; // Which muhurat (1-8)
  
  const rahuStart = new Date(sunrise.getTime() + (muhuratDuration * (rahuKaalMuhurat - 1)));
  const rahuEnd = new Date(sunrise.getTime() + (muhuratDuration * rahuKaalMuhurat));
  
  const duration = (rahuEnd.getTime() - rahuStart.getTime()) / 60000;
  
  return {
    name: 'Rahu Kaal',
    type: 'rahu_kaal',
    startTime: rahuStart,
    endTime: rahuEnd,
    duration,
    severity: 'high',
    description: {
      en: 'Inauspicious period ruled by Rahu, avoid starting new work',
      hi: 'राहु काल, अशुभ समय, नया काम शुरू करने से बचें'
    },
    effects: {
      en: [
        'Obstacles in new ventures',
        'Delays and confusion',
        'Unexpected problems',
        'Mental stress'
      ],
      hi: [
        'नए उद्यमों में बाधाएं',
        'देरी और भ्रम',
        'अप्रत्याशित समस्याएं',
        'मानसिक तनाव'
      ]
    },
    avoidActivities: {
      en: [
        'Starting new ventures',
        'Important meetings',
        'Travel',
        'Purchases',
        'Signing contracts',
        'Interviews'
      ],
      hi: [
        'नए उद्यम शुरू करना',
        'महत्वपूर्ण बैठकें',
        'यात्रा',
        'खरीदारी',
        'अनुबंध पर हस्ताक्षर',
        'साक्षात्कार'
      ]
    }
  };
}

/**
 * Calculate Yamaganda (Inauspicious period ruled by Yama)
 * Similar to Rahu Kaal but different timing
 */
export function calculateYamaganda(date: Date, sunrise: Date, sunset: Date): InauspiciousPeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const muhuratDuration = dayDuration / 8;
  
  // Yamaganda timing by weekday
  const dayOfWeek = date.getDay();
  const yamagandaMuhurat = [5, 4, 3, 2, 1, 7, 6][dayOfWeek];
  
  const yamaStart = new Date(sunrise.getTime() + (muhuratDuration * (yamagandaMuhurat - 1)));
  const yamaEnd = new Date(sunrise.getTime() + (muhuratDuration * yamagandaMuhurat));
  
  const duration = (yamaEnd.getTime() - yamaStart.getTime()) / 60000;
  
  return {
    name: 'Yamaganda',
    type: 'yamaganda',
    startTime: yamaStart,
    endTime: yamaEnd,
    duration,
    severity: 'medium',
    description: {
      en: 'Inauspicious period, avoid important activities',
      hi: 'यमगंड, अशुभ समय, महत्वपूर्ण गतिविधियों से बचें'
    },
    effects: {
      en: [
        'Health issues',
        'Accidents',
        'Conflicts',
        'Bad decisions'
      ],
      hi: [
        'स्वास्थ्य समस्याएं',
        'दुर्घटनाएं',
        'संघर्ष',
        'गलत निर्णय'
      ]
    },
    avoidActivities: {
      en: [
        'Medical procedures',
        'Travel',
        'Important decisions',
        'Risky activities'
      ],
      hi: [
        'चिकित्सा प्रक्रियाएं',
        'यात्रा',
        'महत्वपूर्ण निर्णय',
        'जोखिम भरी गतिविधियां'
      ]
    }
  };
}

/**
 * Calculate Gulika Kaal (Inauspicious period ruled by Saturn's son)
 */
export function calculateGulikaKaal(date: Date, sunrise: Date, sunset: Date): InauspiciousPeriod {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const muhuratDuration = dayDuration / 8;
  
  // Gulika timing by weekday
  const dayOfWeek = date.getDay();
  const gulikaMuhurat = [6, 5, 4, 3, 2, 1, 7][dayOfWeek];
  
  const gulikaStart = new Date(sunrise.getTime() + (muhuratDuration * (gulikaMuhurat - 1)));
  const gulikaEnd = new Date(sunrise.getTime() + (muhuratDuration * gulikaMuhurat));
  
  const duration = (gulikaEnd.getTime() - gulikaStart.getTime()) / 60000;
  
  return {
    name: 'Gulika Kaal',
    type: 'gulika',
    startTime: gulikaStart,
    endTime: gulikaEnd,
    duration,
    severity: 'medium',
    description: {
      en: 'Inauspicious period, causes obstacles',
      hi: 'गुलिक काल, अशुभ समय, बाधाएं उत्पन्न करता है'
    },
    effects: {
      en: [
        'Obstacles',
        'Delays',
        'Misunderstandings',
        'Financial losses'
      ],
      hi: [
        'बाधाएं',
        'देरी',
        'गलतफहमी',
        'आर्थिक नुकसान'
      ]
    },
    avoidActivities: {
      en: [
        'Financial transactions',
        'Business deals',
        'Investments',
        'Important purchases'
      ],
      hi: [
        'वित्तीय लेनदेन',
        'व्यापारिक सौदे',
        'निवेश',
        'महत्वपूर्ण खरीदारी'
      ]
    }
  };
}

/**
 * Calculate Dur Muhurat (Bad periods)
 * Short inauspicious periods throughout the day
 */
export function calculateDurMuhurat(date: Date, sunrise: Date, sunset: Date): InauspiciousPeriod[] {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const durMuhurats: InauspiciousPeriod[] = [];
  
  // Simplified: 2-3 dur muhurats per day
  const durStart1 = new Date(sunrise.getTime() + (dayDuration * 0.3));
  const durEnd1 = new Date(durStart1.getTime() + 24 * 60000); // 24 minutes
  
  durMuhurats.push({
    name: 'Dur Muhurat',
    type: 'dur_muhurat',
    startTime: durStart1,
    endTime: durEnd1,
    duration: 24,
    severity: 'low',
    description: {
      en: 'Short inauspicious period, avoid starting important work',
      hi: 'छोटा अशुभ समय, महत्वपूर्ण कार्य शुरू करने से बचें'
    },
    effects: {
      en: ['Minor obstacles', 'Small delays'],
      hi: ['छोटी बाधाएं', 'छोटी देरी']
    },
    avoidActivities: {
      en: ['Starting new work', 'Important decisions'],
      hi: ['नया काम शुरू करना', 'महत्वपूर्ण निर्णय']
    }
  });
  
  return durMuhurats;
}

/**
 * Calculate all auspicious periods for a day
 */
export function calculateAuspiciousPeriods(
  date: Date,
  sunrise: Date,
  sunset: Date
): AuspiciousPeriod[] {
  return [
    calculateBrahmaMuhurat(sunrise),
    calculateAmritKaal(date, sunrise, sunset),
    calculateAbhijitMuhurat(date, sunrise, sunset),
    calculateVijayaMuhurat(date, sunrise, sunset),
    calculateGodhulMuhurat(sunset)
  ];
}

/**
 * Calculate all inauspicious periods for a day
 */
export function calculateInauspiciousPeriods(
  date: Date,
  sunrise: Date,
  sunset: Date
): InauspiciousPeriod[] {
  return [
    calculateRahuKaal(date, sunrise, sunset),
    calculateYamaganda(date, sunrise, sunset),
    calculateGulikaKaal(date, sunrise, sunset),
    ...calculateDurMuhurat(date, sunrise, sunset)
  ];
}

/**
 * Calculate overall muhurat quality for a day (0-100)
 */
export function calculateOverallMuhuratQuality(
  auspiciousPeriods: AuspiciousPeriod[],
  inauspiciousPeriods: InauspiciousPeriod[]
): number {
  // Calculate total auspicious time
  const auspiciousMinutes = auspiciousPeriods.reduce((sum, p) => sum + p.duration, 0);
  const auspiciousQuality = auspiciousPeriods.reduce((sum, p) => sum + p.quality, 0) / auspiciousPeriods.length;
  
  // Calculate total inauspicious time
  const inauspiciousMinutes = inauspiciousPeriods.reduce((sum, p) => sum + p.duration, 0);
  const inauspiciousSeverity = inauspiciousPeriods.filter(p => p.severity === 'high').length * 20;
  
  // Overall quality calculation
  const baseQuality = 50;
  const auspiciousBonus = (auspiciousMinutes / 10) * (auspiciousQuality / 100);
  const inauspiciousPenalty = (inauspiciousMinutes / 10) + inauspiciousSeverity;
  
  const quality = Math.max(0, Math.min(100, baseQuality + auspiciousBonus - inauspiciousPenalty));
  
  return Math.round(quality);
}

/**
 * Find best time in a day
 */
export function findBestTime(auspiciousPeriods: AuspiciousPeriod[]): Date {
  const bestPeriod = auspiciousPeriods.reduce((best, current) => 
    current.quality > best.quality ? current : best
  );
  
  return bestPeriod.startTime;
}

/**
 * Find worst time in a day
 */
export function findWorstTime(inauspiciousPeriods: InauspiciousPeriod[]): Date {
  const worstPeriod = inauspiciousPeriods.reduce((worst, current) => 
    current.severity === 'high' ? current : worst
  );
  
  return worstPeriod.startTime;
}

/**
 * Calculate complete daily muhurat
 */
export function calculateDailyMuhurat(
  date: Date,
  sunrise: Date,
  sunset: Date
): DailyMuhurat {
  const auspiciousPeriods = calculateAuspiciousPeriods(date, sunrise, sunset);
  const inauspiciousPeriods = calculateInauspiciousPeriods(date, sunrise, sunset);
  const overallQuality = calculateOverallMuhuratQuality(auspiciousPeriods, inauspiciousPeriods);
  const bestTime = findBestTime(auspiciousPeriods);
  const worstTime = findWorstTime(inauspiciousPeriods);
  
  return {
    date,
    sunrise,
    sunset,
    auspiciousPeriods,
    inauspiciousPeriods,
    overallQuality,
    bestTime,
    worstTime
  };
}

export default {
  calculateAbhijitMuhurat,
  calculateBrahmaMuhurat,
  calculateGodhulMuhurat,
  calculateVijayaMuhurat,
  calculateAmritKaal,
  calculateRahuKaal,
  calculateYamaganda,
  calculateGulikaKaal,
  calculateDurMuhurat,
  calculateAuspiciousPeriods,
  calculateInauspiciousPeriods,
  calculateOverallMuhuratQuality,
  calculateDailyMuhurat,
  findBestTime,
  findWorstTime
};
