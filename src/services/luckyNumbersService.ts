/**
 * Lucky Numbers Service
 * 
 * Calculates personalized lucky and unlucky numbers based on:
 * - Life Path Number
 * - Birth Date
 * - Planetary associations
 * - Numerology compatibility
 * 
 * Week 21 - Tuesday Implementation
 */

import { calculateLifePathNumber } from './numerologySystemService';

export interface LuckyNumbersData {
  primaryLuckyNumbers: number[];
  secondaryLuckyNumbers: number[];
  unluckyNumbers: number[];
  favorableDates: number[];
  luckyTimes: string[];
  monthlyLuckyDays: { [month: string]: number[] };
}

export interface NumberCompatibility {
  number: number;
  compatibility: 'Excellent' | 'Good' | 'Neutral' | 'Avoid';
  reason: {
    en: string;
    hi: string;
  };
}

/**
 * Number compatibility matrix based on numerology
 * Each number has friendly, neutral, and enemy numbers
 */
const NUMBER_COMPATIBILITY: { [key: number]: { friendly: number[], neutral: number[], enemy: number[] } } = {
  1: { friendly: [1, 2, 3, 9], neutral: [4, 5, 7], enemy: [6, 8] },
  2: { friendly: [1, 2, 5, 6], neutral: [3, 9], enemy: [4, 7, 8] },
  3: { friendly: [1, 3, 5, 6, 9], neutral: [2], enemy: [4, 7, 8] },
  4: { friendly: [4, 5, 6, 7], neutral: [8], enemy: [1, 2, 3, 9] },
  5: { friendly: [1, 3, 4, 5, 6], neutral: [2, 7, 9], enemy: [8] },
  6: { friendly: [2, 3, 4, 5, 6, 9], neutral: [1, 7], enemy: [8] },
  7: { friendly: [4, 5, 7], neutral: [1, 2, 6, 8], enemy: [3, 9] },
  8: { friendly: [4, 5, 6, 8], neutral: [1, 2, 7], enemy: [3, 9] },
  9: { friendly: [1, 2, 3, 6, 9], neutral: [4, 5, 7], enemy: [8] }
};

/**
 * Planetary ruling days for lucky timing
 */
const PLANETARY_DAYS: { [key: number]: string[] } = {
  1: ['Sunday'], // Sun
  2: ['Monday'], // Moon
  3: ['Thursday'], // Jupiter
  4: ['Sunday', 'Saturday'], // Rahu (Sun/Saturn)
  5: ['Wednesday'], // Mercury
  6: ['Friday'], // Venus
  7: ['Monday', 'Tuesday'], // Ketu (Moon/Mars)
  8: ['Saturday'], // Saturn
  9: ['Tuesday'] // Mars
};

/**
 * Lucky times based on planetary hours
 */
const LUCKY_TIMES: { [key: number]: string[] } = {
  1: ['6:00-7:00 AM', '12:00-1:00 PM', '6:00-7:00 PM'],
  2: ['7:00-8:00 AM', '1:00-2:00 PM', '7:00-8:00 PM'],
  3: ['8:00-9:00 AM', '2:00-3:00 PM', '8:00-9:00 PM'],
  4: ['9:00-10:00 AM', '3:00-4:00 PM', '9:00-10:00 PM'],
  5: ['10:00-11:00 AM', '4:00-5:00 PM', '10:00-11:00 PM'],
  6: ['11:00 AM-12:00 PM', '5:00-6:00 PM', '11:00 PM-12:00 AM'],
  7: ['5:00-6:00 AM', '11:00 AM-12:00 PM', '5:00-6:00 PM'],
  8: ['6:00-7:00 AM', '12:00-1:00 PM', '6:00-7:00 PM'],
  9: ['7:00-8:00 AM', '1:00-2:00 PM', '7:00-8:00 PM']
};

/**
 * Calculate primary lucky numbers based on Life Path Number
 */
export function calculatePrimaryLuckyNumbers(lifePathNumber: number): number[] {
  const compatibility = NUMBER_COMPATIBILITY[lifePathNumber];
  
  // Primary lucky numbers are the life path number itself and its friendly numbers
  return [lifePathNumber, ...compatibility.friendly].filter((num, index, self) => 
    self.indexOf(num) === index // Remove duplicates
  ).sort((a, b) => a - b);
}

/**
 * Calculate secondary lucky numbers (neutral compatibility)
 */
export function calculateSecondaryLuckyNumbers(lifePathNumber: number): number[] {
  const compatibility = NUMBER_COMPATIBILITY[lifePathNumber];
  return compatibility.neutral.sort((a, b) => a - b);
}

/**
 * Calculate unlucky numbers (enemy numbers)
 */
export function calculateUnluckyNumbers(lifePathNumber: number): number[] {
  const compatibility = NUMBER_COMPATIBILITY[lifePathNumber];
  return compatibility.enemy.sort((a, b) => a - b);
}

/**
 * Calculate favorable dates in a month (1-31)
 * Based on primary lucky numbers
 */
export function calculateFavorableDates(lifePathNumber: number): number[] {
  const primaryNumbers = calculatePrimaryLuckyNumbers(lifePathNumber);
  const dates: number[] = [];
  
  // Add dates that reduce to lucky numbers
  for (let date = 1; date <= 31; date++) {
    const reduced = date > 9 ? 
      date.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0) : 
      date;
    
    if (primaryNumbers.includes(reduced)) {
      dates.push(date);
    }
  }
  
  return dates.sort((a, b) => a - b);
}

/**
 * Get lucky times of day based on Life Path Number
 */
export function getLuckyTimes(lifePathNumber: number): string[] {
  return LUCKY_TIMES[lifePathNumber] || LUCKY_TIMES[1];
}

/**
 * Calculate monthly lucky days (day names)
 */
export function getMonthlyLuckyDays(lifePathNumber: number): string[] {
  return PLANETARY_DAYS[lifePathNumber] || ['Sunday'];
}

/**
 * Get lucky days for each month of the year
 * Returns dates that fall on lucky weekdays
 */
export function getMonthlyLuckyDates(year: number, lifePathNumber: number): { [month: string]: number[] } {
  const luckyDayNames = getMonthlyLuckyDays(lifePathNumber);
  const favorableDates = calculateFavorableDates(lifePathNumber);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const result: { [month: string]: number[] } = {};
  
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const luckyDates: number[] = [];
    
    for (let date = 1; date <= daysInMonth; date++) {
      const dayOfWeek = new Date(year, month, date).toLocaleDateString('en-US', { weekday: 'long' });
      
      // Date is lucky if it's on a lucky weekday OR it's a favorable date
      if (luckyDayNames.includes(dayOfWeek) || favorableDates.includes(date)) {
        luckyDates.push(date);
      }
    }
    
    result[monthNames[month]] = luckyDates;
  }
  
  return result;
}

/**
 * Calculate all lucky numbers data at once
 */
export function calculateAllLuckyNumbers(birthDate: Date): LuckyNumbersData {
  const lifePathNumber = calculateLifePathNumber(birthDate);
  const currentYear = new Date().getFullYear();
  
  return {
    primaryLuckyNumbers: calculatePrimaryLuckyNumbers(lifePathNumber),
    secondaryLuckyNumbers: calculateSecondaryLuckyNumbers(lifePathNumber),
    unluckyNumbers: calculateUnluckyNumbers(lifePathNumber),
    favorableDates: calculateFavorableDates(lifePathNumber),
    luckyTimes: getLuckyTimes(lifePathNumber),
    monthlyLuckyDays: getMonthlyLuckyDates(currentYear, lifePathNumber)
  };
}

/**
 * Check if a specific number is lucky for a person
 */
export function isNumberLucky(number: number, lifePathNumber: number): NumberCompatibility {
  const primaryLucky = calculatePrimaryLuckyNumbers(lifePathNumber);
  const secondaryLucky = calculateSecondaryLuckyNumbers(lifePathNumber);
  const unlucky = calculateUnluckyNumbers(lifePathNumber);
  
  if (primaryLucky.includes(number)) {
    return {
      number,
      compatibility: 'Excellent',
      reason: {
        en: `Number ${number} is highly compatible with your Life Path Number ${lifePathNumber}. Use it for important decisions.`,
        hi: `अंक ${number} आपके जीवन पथ अंक ${lifePathNumber} के साथ अत्यधिक अनुकूल है। महत्वपूर्ण निर्णयों के लिए इसका उपयोग करें।`
      }
    };
  }
  
  if (secondaryLucky.includes(number)) {
    return {
      number,
      compatibility: 'Good',
      reason: {
        en: `Number ${number} has neutral compatibility with your Life Path Number ${lifePathNumber}. Safe to use.`,
        hi: `अंक ${number} आपके जीवन पथ अंक ${lifePathNumber} के साथ तटस्थ अनुकूलता रखता है। उपयोग के लिए सुरक्षित।`
      }
    };
  }
  
  if (unlucky.includes(number)) {
    return {
      number,
      compatibility: 'Avoid',
      reason: {
        en: `Number ${number} is incompatible with your Life Path Number ${lifePathNumber}. Avoid using it for important matters.`,
        hi: `अंक ${number} आपके जीवन पथ अंक ${lifePathNumber} के साथ असंगत है। महत्वपूर्ण मामलों के लिए इसका उपयोग न करें।`
      }
    };
  }
  
  return {
    number,
    compatibility: 'Neutral',
    reason: {
      en: `Number ${number} has neutral effect with your Life Path Number ${lifePathNumber}.`,
      hi: `अंक ${number} आपके जीवन पथ अंक ${lifePathNumber} के साथ तटस्थ प्रभाव रखता है।`
    }
  };
}

/**
 * Get lucky number recommendations for specific purposes
 */
export function getLuckyNumberRecommendations(lifePathNumber: number): {
  purpose: string;
  numbers: number[];
  description: { en: string; hi: string };
}[] {
  const primaryLucky = calculatePrimaryLuckyNumbers(lifePathNumber);
  
  return [
    {
      purpose: 'Mobile Number',
      numbers: primaryLucky.slice(0, 3),
      description: {
        en: 'Use these digits in your mobile number for positive energy',
        hi: 'सकारात्मक ऊर्जा के लिए अपने मोबाइल नंबर में इन अंकों का उपयोग करें'
      }
    },
    {
      purpose: 'Vehicle Number',
      numbers: primaryLucky.slice(0, 2),
      description: {
        en: 'Choose vehicle numbers containing these digits',
        hi: 'इन अंकों वाले वाहन नंबर चुनें'
      }
    },
    {
      purpose: 'House Number',
      numbers: [primaryLucky[0]],
      description: {
        en: 'Ideal house number for prosperity and harmony',
        hi: 'समृद्धि और सद्भाव के लिए आदर्श घर संख्या'
      }
    },
    {
      purpose: 'Bank Account',
      numbers: primaryLucky.slice(0, 3),
      description: {
        en: 'Include these digits in your bank account for financial growth',
        hi: 'वित्तीय विकास के लिए अपने बैंक खाते में इन अंकों को शामिल करें'
      }
    },
    {
      purpose: 'Important Dates',
      numbers: calculateFavorableDates(lifePathNumber).slice(0, 5),
      description: {
        en: 'Best dates for important events and decisions',
        hi: 'महत्वपूर्ण घटनाओं और निर्णयों के लिए सर्वोत्तम तिथियां'
      }
    }
  ];
}
