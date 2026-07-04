/**
 * Lucky Colors Service
 * 
 * Determines personalized lucky colors based on:
 * - Life Path Number
 * - Birth Date (day of week)
 * - Planetary associations
 * - Numerology and astrology
 * 
 * Week 21 - Wednesday Implementation
 */

import { calculateLifePathNumber } from './numerologySystemService';

export interface ColorData {
  name: {
    en: string;
    hi: string;
  };
  hex: string;
  rgb: { r: number; g: number; b: number };
  planet: string;
  element: string;
  chakra?: string;
  effects: {
    en: string[];
    hi: string[];
  };
}

export interface LuckyColorsData {
  primaryColors: ColorData[];
  secondaryColors: ColorData[];
  avoidColors: ColorData[];
  dailyColors: { [day: string]: ColorData };
  usageRecommendations: {
    category: string;
    colors: string[];
    description: { en: string; hi: string };
  }[];
}

/**
 * Complete color database with planetary and numerological associations
 */
const COLOR_DATABASE: { [key: string]: ColorData } = {
  red: {
    name: { en: 'Red', hi: 'लाल' },
    hex: '#FF0000',
    rgb: { r: 255, g: 0, b: 0 },
    planet: 'Mars',
    element: 'Fire',
    chakra: 'Root',
    effects: {
      en: ['Energy', 'Passion', 'Courage', 'Action', 'Vitality'],
      hi: ['ऊर्जा', 'जुनून', 'साहस', 'कार्य', 'जीवन शक्ति']
    }
  },
  orange: {
    name: { en: 'Orange', hi: 'नारंगी' },
    hex: '#FFA500',
    rgb: { r: 255, g: 165, b: 0 },
    planet: 'Moon',
    element: 'Water',
    chakra: 'Sacral',
    effects: {
      en: ['Creativity', 'Enthusiasm', 'Joy', 'Emotional Balance'],
      hi: ['रचनात्मकता', 'उत्साह', 'आनंद', 'भावनात्मक संतुलन']
    }
  },
  yellow: {
    name: { en: 'Yellow', hi: 'पीला' },
    hex: '#FFD700',
    rgb: { r: 255, g: 215, b: 0 },
    planet: 'Jupiter',
    element: 'Fire',
    chakra: 'Solar Plexus',
    effects: {
      en: ['Wisdom', 'Optimism', 'Clarity', 'Prosperity', 'Learning'],
      hi: ['ज्ञान', 'आशावाद', 'स्पष्टता', 'समृद्धि', 'सीखना']
    }
  },
  green: {
    name: { en: 'Green', hi: 'हरा' },
    hex: '#00FF00',
    rgb: { r: 0, g: 255, b: 0 },
    planet: 'Mercury',
    element: 'Earth',
    chakra: 'Heart',
    effects: {
      en: ['Growth', 'Harmony', 'Balance', 'Healing', 'Prosperity'],
      hi: ['विकास', 'सामंजस्य', 'संतुलन', 'उपचार', 'समृद्धि']
    }
  },
  skyBlue: {
    name: { en: 'Sky Blue', hi: 'आसमानी नीला' },
    hex: '#87CEEB',
    rgb: { r: 135, g: 206, b: 235 },
    planet: 'Mercury',
    element: 'Air',
    chakra: 'Throat',
    effects: {
      en: ['Communication', 'Freedom', 'Clarity', 'Peace', 'Expression'],
      hi: ['संचार', 'स्वतंत्रता', 'स्पष्टता', 'शांति', 'अभिव्यक्ति']
    }
  },
  pink: {
    name: { en: 'Pink', hi: 'गुलाबी' },
    hex: '#FFC0CB',
    rgb: { r: 255, g: 192, b: 203 },
    planet: 'Venus',
    element: 'Water',
    chakra: 'Heart',
    effects: {
      en: ['Love', 'Compassion', 'Nurturing', 'Romance', 'Harmony'],
      hi: ['प्रेम', 'करुणा', 'पालन-पोषण', 'रोमांस', 'सामंजस्य']
    }
  },
  purple: {
    name: { en: 'Purple', hi: 'बैंगनी' },
    hex: '#800080',
    rgb: { r: 128, g: 0, b: 128 },
    planet: 'Ketu',
    element: 'Water',
    chakra: 'Third Eye',
    effects: {
      en: ['Spirituality', 'Intuition', 'Wisdom', 'Mystery', 'Transformation'],
      hi: ['आध्यात्मिकता', 'अंतर्ज्ञान', 'ज्ञान', 'रहस्य', 'परिवर्तन']
    }
  },
  black: {
    name: { en: 'Black', hi: 'काला' },
    hex: '#000000',
    rgb: { r: 0, g: 0, b: 0 },
    planet: 'Saturn',
    element: 'Earth',
    effects: {
      en: ['Protection', 'Authority', 'Discipline', 'Power', 'Mystery'],
      hi: ['सुरक्षा', 'अधिकार', 'अनुशासन', 'शक्ति', 'रहस्य']
    }
  },
  white: {
    name: { en: 'White', hi: 'सफेद' },
    hex: '#FFFFFF',
    rgb: { r: 255, g: 255, b: 255 },
    planet: 'Moon',
    element: 'Water',
    chakra: 'Crown',
    effects: {
      en: ['Purity', 'Peace', 'Clarity', 'New Beginnings', 'Spirituality'],
      hi: ['शुद्धता', 'शांति', 'स्पष्टता', 'नई शुरुआत', 'आध्यात्मिकता']
    }
  },
  gold: {
    name: { en: 'Gold', hi: 'सुनहरा' },
    hex: '#FFD700',
    rgb: { r: 255, g: 215, b: 0 },
    planet: 'Sun',
    element: 'Fire',
    effects: {
      en: ['Success', 'Abundance', 'Confidence', 'Leadership', 'Prosperity'],
      hi: ['सफलता', 'प्रचुरता', 'आत्मविश्वास', 'नेतृत्व', 'समृद्धि']
    }
  },
  silver: {
    name: { en: 'Silver', hi: 'चांदी' },
    hex: '#C0C0C0',
    rgb: { r: 192, g: 192, b: 192 },
    planet: 'Moon',
    element: 'Water',
    effects: {
      en: ['Intuition', 'Reflection', 'Calmness', 'Feminine Energy'],
      hi: ['अंतर्ज्ञान', 'प्रतिबिंब', 'शांति', 'स्त्री ऊर्जा']
    }
  },
  brown: {
    name: { en: 'Brown', hi: 'भूरा' },
    hex: '#8B4513',
    rgb: { r: 139, g: 69, b: 19 },
    planet: 'Rahu',
    element: 'Earth',
    effects: {
      en: ['Stability', 'Grounding', 'Reliability', 'Comfort', 'Security'],
      hi: ['स्थिरता', 'ग्राउंडिंग', 'विश्वसनीयता', 'आराम', 'सुरक्षा']
    }
  }
};

/**
 * Map Life Path Numbers to primary colors
 */
const NUMBER_TO_COLORS: { [key: number]: string[] } = {
  1: ['red', 'gold', 'orange'], // Sun - Fire colors
  2: ['white', 'silver', 'orange'], // Moon - Soft colors
  3: ['yellow', 'gold', 'purple'], // Jupiter - Wisdom colors
  4: ['green', 'brown', 'skyBlue'], // Rahu - Earth/Air colors
  5: ['green', 'skyBlue', 'white'], // Mercury - Communication colors
  6: ['pink', 'white', 'skyBlue'], // Venus - Love colors
  7: ['purple', 'white', 'green'], // Ketu - Spiritual colors
  8: ['black', 'purple', 'brown'], // Saturn - Dark colors
  9: ['red', 'gold', 'orange'] // Mars - Fire colors
};

/**
 * Colors to avoid for each Life Path Number
 */
const AVOID_COLORS: { [key: number]: string[] } = {
  1: ['black', 'brown'], // Avoid Saturn/Rahu colors
  2: ['red', 'black'], // Avoid Mars/Saturn colors
  3: ['black', 'brown'], // Avoid Saturn/Rahu colors
  4: ['red', 'gold'], // Avoid Sun/Mars colors
  5: ['black', 'red'], // Avoid Saturn/Mars colors
  6: ['black', 'red'], // Avoid Saturn/Mars colors
  7: ['red', 'orange'], // Avoid Mars colors
  8: ['red', 'orange', 'yellow'], // Avoid Fire colors
  9: ['black', 'brown'] // Avoid Saturn/Rahu colors
};

/**
 * Daily colors based on weekday (planetary day)
 */
const DAILY_COLORS: { [day: string]: string } = {
  Sunday: 'gold', // Sun
  Monday: 'white', // Moon
  Tuesday: 'red', // Mars
  Wednesday: 'green', // Mercury
  Thursday: 'yellow', // Jupiter
  Friday: 'pink', // Venus
  Saturday: 'black' // Saturn
};

/**
 * Get primary lucky colors for a Life Path Number
 */
export function getPrimaryColors(lifePathNumber: number): ColorData[] {
  const colorKeys = NUMBER_TO_COLORS[lifePathNumber] || NUMBER_TO_COLORS[1];
  return colorKeys.map(key => COLOR_DATABASE[key]);
}

/**
 * Get secondary lucky colors (complementary colors)
 */
export function getSecondaryColors(lifePathNumber: number): ColorData[] {
  // Secondary colors are those not in primary or avoid lists
  const primaryKeys = NUMBER_TO_COLORS[lifePathNumber] || [];
  const avoidKeys = AVOID_COLORS[lifePathNumber] || [];
  
  const allColorKeys = Object.keys(COLOR_DATABASE);
  const secondaryKeys = allColorKeys.filter(
    key => !primaryKeys.includes(key) && !avoidKeys.includes(key)
  );
  
  return secondaryKeys.slice(0, 3).map(key => COLOR_DATABASE[key]);
}

/**
 * Get colors to avoid
 */
export function getAvoidColors(lifePathNumber: number): ColorData[] {
  const colorKeys = AVOID_COLORS[lifePathNumber] || [];
  return colorKeys.map(key => COLOR_DATABASE[key]);
}

/**
 * Get daily color for each day of the week
 */
export function getDailyColors(): { [day: string]: ColorData } {
  const result: { [day: string]: ColorData } = {};
  
  for (const [day, colorKey] of Object.entries(DAILY_COLORS)) {
    result[day] = COLOR_DATABASE[colorKey];
  }
  
  return result;
}

/**
 * Get color for today
 */
export function getTodayColor(): ColorData {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const colorKey = DAILY_COLORS[today];
  return COLOR_DATABASE[colorKey];
}

/**
 * Get color recommendations for specific uses
 */
export function getColorUsageRecommendations(lifePathNumber: number): {
  category: string;
  colors: string[];
  description: { en: string; hi: string };
}[] {
  const primaryColors = getPrimaryColors(lifePathNumber);
  const primaryColorNames = primaryColors.map(c => c.name.en);
  
  return [
    {
      category: 'Clothing',
      colors: primaryColorNames,
      description: {
        en: 'Wear these colors for confidence and positive energy',
        hi: 'आत्मविश्वास और सकारात्मक ऊर्जा के लिए इन रंगों को पहनें'
      }
    },
    {
      category: 'Home Decor',
      colors: primaryColorNames.slice(0, 2),
      description: {
        en: 'Use these colors in your living space for harmony',
        hi: 'सामंजस्य के लिए अपने रहने की जगह में इन रंगों का उपयोग करें'
      }
    },
    {
      category: 'Office/Workspace',
      colors: [primaryColorNames[0]],
      description: {
        en: 'Incorporate this color for productivity and success',
        hi: 'उत्पादकता और सफलता के लिए इस रंग को शामिल करें'
      }
    },
    {
      category: 'Important Events',
      colors: primaryColorNames.slice(0, 2),
      description: {
        en: 'Wear these colors during important meetings and events',
        hi: 'महत्वपूर्ण बैठकों और कार्यक्रमों के दौरान इन रंगों को पहनें'
      }
    },
    {
      category: 'Meditation/Spiritual',
      colors: ['White', 'Purple'],
      description: {
        en: 'Use these colors for spiritual practices and meditation',
        hi: 'आध्यात्मिक प्रथाओं और ध्यान के लिए इन रंगों का उपयोग करें'
      }
    },
    {
      category: 'Vehicle',
      colors: primaryColorNames.slice(0, 2),
      description: {
        en: 'Choose vehicle colors from these for safe travels',
        hi: 'सुरक्षित यात्रा के लिए इनमें से वाहन रंग चुनें'
      }
    }
  ];
}

/**
 * Calculate all lucky colors data at once
 */
export function calculateAllLuckyColors(birthDate: Date): LuckyColorsData {
  const lifePathNumber = calculateLifePathNumber(birthDate);
  
  return {
    primaryColors: getPrimaryColors(lifePathNumber),
    secondaryColors: getSecondaryColors(lifePathNumber),
    avoidColors: getAvoidColors(lifePathNumber),
    dailyColors: getDailyColors(),
    usageRecommendations: getColorUsageRecommendations(lifePathNumber)
  };
}

/**
 * Get color by name
 */
export function getColorByName(colorName: string): ColorData | undefined {
  return COLOR_DATABASE[colorName.toLowerCase()];
}

/**
 * Get all available colors
 */
export function getAllColors(): ColorData[] {
  return Object.values(COLOR_DATABASE);
}

/**
 * Check if a color is lucky for a person
 */
export function isColorLucky(colorName: string, lifePathNumber: number): {
  lucky: boolean;
  category: 'Primary' | 'Secondary' | 'Avoid' | 'Neutral';
  reason: { en: string; hi: string };
} {
  const primaryColors = getPrimaryColors(lifePathNumber);
  const secondaryColors = getSecondaryColors(lifePathNumber);
  const avoidColors = getAvoidColors(lifePathNumber);
  
  const isPrimary = primaryColors.some(c => c.name.en.toLowerCase() === colorName.toLowerCase());
  const isSecondary = secondaryColors.some(c => c.name.en.toLowerCase() === colorName.toLowerCase());
  const isAvoid = avoidColors.some(c => c.name.en.toLowerCase() === colorName.toLowerCase());
  
  if (isPrimary) {
    return {
      lucky: true,
      category: 'Primary',
      reason: {
        en: `${colorName} is a primary lucky color for you. Use it frequently for maximum benefit.`,
        hi: `${colorName} आपके लिए एक प्राथमिक भाग्यशाली रंग है। अधिकतम लाभ के लिए इसे बार-बार उपयोग करें।`
      }
    };
  }
  
  if (isSecondary) {
    return {
      lucky: true,
      category: 'Secondary',
      reason: {
        en: `${colorName} is a secondary lucky color for you. Safe to use regularly.`,
        hi: `${colorName} आपके लिए एक द्वितीयक भाग्यशाली रंग है। नियमित रूप से उपयोग के लिए सुरक्षित।`
      }
    };
  }
  
  if (isAvoid) {
    return {
      lucky: false,
      category: 'Avoid',
      reason: {
        en: `${colorName} is not favorable for you. Minimize its use in important matters.`,
        hi: `${colorName} आपके लिए अनुकूल नहीं है। महत्वपूर्ण मामलों में इसका उपयोग कम करें।`
      }
    };
  }
  
  return {
    lucky: true,
    category: 'Neutral',
    reason: {
      en: `${colorName} has neutral effect for you. Can be used occasionally.`,
      hi: `${colorName} आपके लिए तटस्थ प्रभाव रखता है। कभी-कभी उपयोग किया जा सकता है।`
    }
  };
}
