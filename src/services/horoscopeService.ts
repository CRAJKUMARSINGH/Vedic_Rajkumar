/**
 * Horoscope Service - Advanced Prediction System
 * Week 11: AstroSage Feature Integration - Part 1
 * 
 * Provides daily, weekly, monthly, yearly horoscope predictions
 * Moon sign-based personalized horoscopes with multiple categories
 */

import { calculateTransits, CURRENT_POSITIONS, type TransitResult } from '@/data/transitData';
import { getMoonRashi } from '@/data/transitData';

export type HoroscopePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type HoroscopeCategory = 'general' | 'love' | 'career' | 'health' | 'finance';

export interface HoroscopePrediction {
  period: HoroscopePeriod;
  category: HoroscopeCategory;
  moonSign: number;
  moonSignName: string;
  moonSignNameHi: string;
  date: string;
  score: number;
  title: string;
  titleHi: string;
  prediction: string;
  predictionHi: string;
  luckyNumbers: number[];
  luckyColors: string[];
  luckyColorsHi: string[];
  advice: string;
  adviceHi: string;
  warnings?: string;
  warningsHi?: string;
}

export interface ComprehensiveHoroscope {
  general: HoroscopePrediction;
  love: HoroscopePrediction;
  career: HoroscopePrediction;
  health: HoroscopePrediction;
  finance: HoroscopePrediction;
  overall: {
    score: number;
    summary: string;
    summaryHi: string;
  };
}

// Moon sign names
const MOON_SIGNS = [
  { name: 'Aries', nameHi: 'मेष' },
  { name: 'Taurus', nameHi: 'वृषभ' },
  { name: 'Gemini', nameHi: 'मिथुन' },
  { name: 'Cancer', nameHi: 'कर्क' },
  { name: 'Leo', nameHi: 'सिंह' },
  { name: 'Virgo', nameHi: 'कन्या' },
  { name: 'Libra', nameHi: 'तुला' },
  { name: 'Scorpio', nameHi: 'वृश्चिक' },
  { name: 'Sagittarius', nameHi: 'धनु' },
  { name: 'Capricorn', nameHi: 'मकर' },
  { name: 'Aquarius', nameHi: 'कुंभ' },
  { name: 'Pisces', nameHi: 'मीन' }
];

// Horoscope templates for different periods and categories
const HOROSCOPE_TEMPLATES = {
  daily: {
    general: {
      positive: {
        en: "Today brings positive energy and opportunities. Your natural {moonSignTrait} will help you navigate the day successfully. The planetary alignments favor {favorableArea}.",
        hi: "आज सकारात्मक ऊर्जा और अवसर लाता है। आपका प्राकृतिक {moonSignTraitHi} आपको दिन को सफलतापूर्वक पार करने में मदद करेगा। ग्रहीय संरेखण {favorableAreaHi} के लिए अनुकूल है।"
      },
      neutral: {
        en: "A balanced day ahead with mixed influences. Your {moonSignTrait} nature will guide you through any challenges. Focus on {focusArea} for best results.",
        hi: "मिश्रित प्रभावों के साथ एक संतुलित दिन आगे है। आपका {moonSignTraitHi} स्वभाव आपको किसी भी चुनौती से निपटने में मार्गदर्शन करेगा। सर्वोत्तम परिणामों के लिए {focusAreaHi} पर ध्यान दें।"
      },
      challenging: {
        en: "Today may present some challenges, but your {moonSignTrait} strength will see you through. Be cautious with {cautionArea} and focus on patience.",
        hi: "आज कुछ चुनौतियां हो सकती हैं, लेकिन आपकी {moonSignTraitHi} शक्ति आपको पार लगाएगी। {cautionAreaHi} के साथ सावधान रहें और धैर्य पर ध्यान दें।"
      }
    },
    love: {
      positive: {
        en: "Romance is in the air! Your charm and {moonSignTrait} nature attract positive attention. Single? Someone special may enter your life.",
        hi: "प्रेम हवा में है! आपका आकर्षण और {moonSignTraitHi} स्वभाव सकारात्मक ध्यान आकर्षित करता है। अकेले हैं? कोई खास आपके जीवन में आ सकता है।"
      },
      neutral: {
        en: "Relationships require balance today. Your {moonSignTrait} approach helps maintain harmony. Communication is key for couples.",
        hi: "आज रिश्तों में संतुलन की आवश्यकता है। आपका {moonSignTraitHi} दृष्टिकोण सामंजस्य बनाए रखने में मदद करता है। जोड़ों के लिए संवाद महत्वपूर्ण है।"
      },
      challenging: {
        en: "Love life may face some turbulence. Your {moonSignTrait} nature can help resolve conflicts. Avoid arguments and practice understanding.",
        hi: "प्रेम जीवन में कुछ अशांति हो सकती है। आपका {moonSignTraitHi} स्वभाव संघर्षों को हल करने में मदद कर सकता है। बहस से बचें और समझदारी का अभ्यास करें।"
      }
    },
    career: {
      positive: {
        en: "Professional success awaits! Your {moonSignTrait} qualities shine in the workplace. New opportunities or recognition may come your way.",
        hi: "व्यावसायिक सफलता का इंतजार है! आपके {moonSignTraitHi} गुण कार्यक्षेत्र में चमकते हैं। नए अवसर या पहचान आपके रास्ते में आ सकती है।"
      },
      neutral: {
        en: "A steady day at work. Your {moonSignTrait} approach helps maintain productivity. Focus on completing pending tasks.",
        hi: "काम पर एक स्थिर दिन। आपका {moonSignTraitHi} दृष्टिकोण उत्पादकता बनाए रखने में मदद करता है। लंबित कार्यों को पूरा करने पर ध्यान दें।"
      },
      challenging: {
        en: "Workplace challenges may arise. Your {moonSignTrait} resilience will help overcome obstacles. Stay focused and avoid conflicts.",
        hi: "कार्यक्षेत्र में चुनौतियां आ सकती हैं। आपकी {moonSignTraitHi} लचीलापन बाधाओं को पार करने में मदद करेगी। केंद्रित रहें और संघर्षों से बचें।"
      }
    },
    health: {
      positive: {
        en: "Excellent health energy today! Your {moonSignTrait} vitality is at its peak. Great day for physical activities and wellness routines.",
        hi: "आज उत्कृष्ट स्वास्थ्य ऊर्जा! आपकी {moonSignTraitHi} जीवन शक्ति अपने चरम पर है। शारीरिक गतिविधियों और कल्याण दिनचर्या के लिए बेहतरीन दिन।"
      },
      neutral: {
        en: "Maintain your health routine. Your {moonSignTrait} constitution supports steady wellness. Stay hydrated and get adequate rest.",
        hi: "अपनी स्वास्थ्य दिनचर्या बनाए रखें। आपका {moonSignTraitHi} संविधान स्थिर कल्याण का समर्थन करता है। हाइड्रेटेड रहें और पर्याप्त आराम करें।"
      },
      challenging: {
        en: "Pay attention to your health today. Your {moonSignTrait} tendency may need extra care. Avoid stress and prioritize rest.",
        hi: "आज अपने स्वास्थ्य पर ध्यान दें। आपकी {moonSignTraitHi} प्रवृत्ति को अतिरिक्त देखभाल की आवश्यकता हो सकती है। तनाव से बचें और आराम को प्राथमिकता दें।"
      }
    },
    finance: {
      positive: {
        en: "Financial opportunities knock at your door! Your {moonSignTrait} approach to money management pays off. Consider investments or savings.",
        hi: "वित्तीय अवसर आपके दरवाजे पर दस्तक देते हैं! धन प्रबंधन के लिए आपका {moonSignTraitHi} दृष्टिकोण फल देता है। निवेश या बचत पर विचार करें।"
      },
      neutral: {
        en: "Steady financial day ahead. Your {moonSignTrait} money habits serve you well. Review your budget and plan wisely.",
        hi: "आगे स्थिर वित्तीय दिन। आपकी {moonSignTraitHi} धन आदतें आपकी अच्छी सेवा करती हैं। अपने बजट की समीक्षा करें और बुद्धिमानी से योजना बनाएं।"
      },
      challenging: {
        en: "Be cautious with finances today. Your {moonSignTrait} nature may lead to impulsive decisions. Avoid major purchases or investments.",
        hi: "आज वित्त के साथ सावधान रहें। आपका {moonSignTraitHi} स्वभाव आवेगशील निर्णयों की ओर ले जा सकता है। बड़ी खरीदारी या निवेश से बचें।"
      }
    }
  }
};

// Moon sign traits for personalization
const MOON_SIGN_TRAITS = [
  { en: 'dynamic leadership', hi: 'गतिशील नेतृत्व' },      // Aries
  { en: 'steady determination', hi: 'स्थिर दृढ़ता' },        // Taurus
  { en: 'adaptable communication', hi: 'अनुकूल संचार' },     // Gemini
  { en: 'nurturing intuition', hi: 'पोषणकारी अंतर्ज्ञान' },   // Cancer
  { en: 'confident creativity', hi: 'आत्मविश्वासी रचनात्मकता' }, // Leo
  { en: 'analytical precision', hi: 'विश्लेषणात्मक सटीकता' }, // Virgo
  { en: 'diplomatic balance', hi: 'कूटनीतिक संतुलन' },       // Libra
  { en: 'transformative intensity', hi: 'परिवर्तनकारी तीव्रता' }, // Scorpio
  { en: 'adventurous optimism', hi: 'साहसिक आशावाद' },      // Sagittarius
  { en: 'disciplined ambition', hi: 'अनुशासित महत्वाकांक्षा' }, // Capricorn
  { en: 'innovative independence', hi: 'नवाचार स्वतंत्रता' }, // Aquarius
  { en: 'compassionate wisdom', hi: 'करुणामय बुद्धि' }       // Pisces
];

/**
 * Generate horoscope prediction for specific period and category
 */
export function generateHoroscope(
  birthDate: string,
  period: HoroscopePeriod,
  category: HoroscopeCategory,
  targetDate: string = new Date().toISOString().split('T')[0]
): HoroscopePrediction {
  const birthDateObj = new Date(birthDate);
  const moonSign = getMoonRashi(birthDateObj);
  const moonSignData = MOON_SIGNS[moonSign];
  const moonSignTrait = MOON_SIGN_TRAITS[moonSign];
  
  // Calculate transit score for the target date
  const transitResults = calculateTransits(moonSign, CURRENT_POSITIONS);
  const overallScore = Math.round(transitResults.reduce((sum, result) => sum + result.scoreContribution, 0));
  
  // Determine prediction tone based on score
  let tone: 'positive' | 'neutral' | 'challenging';
  if (overallScore >= 7) tone = 'positive';
  else if (overallScore >= 4) tone = 'neutral';
  else tone = 'challenging';
  
  // Get template for the category and tone
  const template = HOROSCOPE_TEMPLATES.daily[category][tone];
  
  // Generate personalized content
  const prediction = template.en
    .replace('{moonSignTrait}', moonSignTrait.en)
    .replace('{favorableArea}', getFavorableArea(category, moonSign).en)
    .replace('{focusArea}', getFocusArea(category, moonSign).en)
    .replace('{cautionArea}', getCautionArea(category, moonSign).en);
    
  const predictionHi = template.hi
    .replace('{moonSignTraitHi}', moonSignTrait.hi)
    .replace('{favorableAreaHi}', getFavorableArea(category, moonSign).hi)
    .replace('{focusAreaHi}', getFocusArea(category, moonSign).hi)
    .replace('{cautionAreaHi}', getCautionArea(category, moonSign).hi);
  
  // Generate lucky numbers and colors
  const luckyNumbers = generateLuckyNumbers(moonSign, targetDate);
  const luckyColors = generateLuckyColors(moonSign, category);
  
  return {
    period,
    category,
    moonSign,
    moonSignName: moonSignData.name,
    moonSignNameHi: moonSignData.nameHi,
    date: targetDate,
    score: overallScore,
    title: generateTitle(category, tone),
    titleHi: generateTitleHi(category, tone),
    prediction,
    predictionHi,
    luckyNumbers,
    luckyColors: luckyColors.en,
    luckyColorsHi: luckyColors.hi,
    advice: generateAdvice(category, tone, moonSign),
    adviceHi: generateAdviceHi(category, tone, moonSign),
    warnings: tone === 'challenging' ? generateWarning(category, moonSign) : undefined,
    warningsHi: tone === 'challenging' ? generateWarningHi(category, moonSign) : undefined
  };
}

/**
 * Generate comprehensive horoscope for all categories
 */
export function generateComprehensiveHoroscope(
  birthDate: string,
  period: HoroscopePeriod = 'daily',
  targetDate: string = new Date().toISOString().split('T')[0]
): ComprehensiveHoroscope {
  const general = generateHoroscope(birthDate, period, 'general', targetDate);
  const love = generateHoroscope(birthDate, period, 'love', targetDate);
  const career = generateHoroscope(birthDate, period, 'career', targetDate);
  const health = generateHoroscope(birthDate, period, 'health', targetDate);
  const finance = generateHoroscope(birthDate, period, 'finance', targetDate);
  
  const overallScore = Math.round((general.score + love.score + career.score + health.score + finance.score) / 5);
  
  let summary: string, summaryHi: string;
  if (overallScore >= 7) {
    summary = "Excellent day ahead with positive energy in most areas of life!";
    summaryHi = "जीवन के अधिकांश क्षेत्रों में सकारात्मक ऊर्जा के साथ उत्कृष्ट दिन आगे है!";
  } else if (overallScore >= 4) {
    summary = "A balanced day with mixed influences across different life areas.";
    summaryHi = "जीवन के विभिन्न क्षेत्रों में मिश्रित प्रभावों के साथ एक संतुलित दिन।";
  } else {
    summary = "Challenging day ahead. Focus on patience and careful decision-making.";
    summaryHi = "चुनौतीपूर्ण दिन आगे है। धैर्य और सावधान निर्णय लेने पर ध्यान दें।";
  }
  
  return {
    general,
    love,
    career,
    health,
    finance,
    overall: {
      score: overallScore,
      summary,
      summaryHi
    }
  };
}

// Helper functions
function getFavorableArea(category: HoroscopeCategory, moonSign: number) {
  const areas = {
    general: [
      { en: 'personal growth', hi: 'व्यक्तिगत विकास' },
      { en: 'relationships', hi: 'रिश्ते' },
      { en: 'creativity', hi: 'रचनात्मकता' }
    ],
    love: [
      { en: 'romantic connections', hi: 'रोमांटिक संबंध' },
      { en: 'emotional bonding', hi: 'भावनात्मक बंधन' },
      { en: 'partnership harmony', hi: 'साझेदारी सामंजस्य' }
    ],
    career: [
      { en: 'professional advancement', hi: 'व्यावसायिक प्रगति' },
      { en: 'team collaboration', hi: 'टीम सहयोग' },
      { en: 'skill development', hi: 'कौशल विकास' }
    ],
    health: [
      { en: 'physical vitality', hi: 'शारीरिक जीवन शक्ति' },
      { en: 'mental clarity', hi: 'मानसिक स्पष्टता' },
      { en: 'emotional balance', hi: 'भावनात्मक संतुलन' }
    ],
    finance: [
      { en: 'investment opportunities', hi: 'निवेश के अवसर' },
      { en: 'income growth', hi: 'आय वृद्धि' },
      { en: 'financial planning', hi: 'वित्तीय योजना' }
    ]
  };
  
  return areas[category][moonSign % 3];
}

function getFocusArea(category: HoroscopeCategory, moonSign: number) {
  return getFavorableArea(category, moonSign); // Same logic for simplicity
}

function getCautionArea(category: HoroscopeCategory, moonSign: number) {
  const areas = {
    general: [
      { en: 'hasty decisions', hi: 'जल्दबाजी के फैसले' },
      { en: 'communication gaps', hi: 'संचार अंतर' },
      { en: 'emotional reactions', hi: 'भावनात्मक प्रतिक्रियाएं' }
    ],
    love: [
      { en: 'misunderstandings', hi: 'गलतफहमियां' },
      { en: 'jealousy issues', hi: 'ईर्ष्या के मुद्दे' },
      { en: 'commitment fears', hi: 'प्रतिबद्धता का डर' }
    ],
    career: [
      { en: 'workplace conflicts', hi: 'कार्यक्षेत्र संघर्ष' },
      { en: 'deadline pressure', hi: 'समय सीमा का दबाव' },
      { en: 'authority issues', hi: 'अधिकार के मुद्दे' }
    ],
    health: [
      { en: 'stress levels', hi: 'तनाव का स्तर' },
      { en: 'dietary habits', hi: 'आहार की आदतें' },
      { en: 'sleep patterns', hi: 'नींद के पैटर्न' }
    ],
    finance: [
      { en: 'impulsive spending', hi: 'आवेगशील खर्च' },
      { en: 'risky investments', hi: 'जोखिम भरे निवेश' },
      { en: 'budget overruns', hi: 'बजट ओवरन' }
    ]
  };
  
  return areas[category][moonSign % 3];
}

function generateLuckyNumbers(moonSign: number, date: string): number[] {
  const dateNum = new Date(date).getDate();
  const base = (moonSign + 1) * dateNum;
  return [
    (base % 9) + 1,
    ((base * 2) % 9) + 1,
    ((base * 3) % 9) + 1
  ].filter((num, index, arr) => arr.indexOf(num) === index);
}

function generateLuckyColors(moonSign: number, category: HoroscopeCategory) {
  const colorSets = [
    { en: ['Red', 'Orange', 'Yellow'], hi: ['लाल', 'नारंगी', 'पीला'] },
    { en: ['Green', 'Blue', 'White'], hi: ['हरा', 'नीला', 'सफेद'] },
    { en: ['Purple', 'Pink', 'Silver'], hi: ['बैंगनी', 'गुलाबी', 'चांदी'] }
  ];
  
  return colorSets[moonSign % 3];
}

function generateTitle(category: HoroscopeCategory, tone: string): string {
  const titles = {
    general: {
      positive: "Bright Day Ahead!",
      neutral: "Balanced Energies",
      challenging: "Navigate with Care"
    },
    love: {
      positive: "Love Blooms Today!",
      neutral: "Relationship Balance",
      challenging: "Love Needs Patience"
    },
    career: {
      positive: "Professional Success!",
      neutral: "Steady Progress",
      challenging: "Career Caution"
    },
    health: {
      positive: "Vibrant Health!",
      neutral: "Maintain Wellness",
      challenging: "Health Awareness"
    },
    finance: {
      positive: "Financial Fortune!",
      neutral: "Money Matters",
      challenging: "Financial Caution"
    }
  };
  
  return titles[category][tone as keyof typeof titles[typeof category]];
}

function generateTitleHi(category: HoroscopeCategory, tone: string): string {
  const titles = {
    general: {
      positive: "उज्ज्वल दिन आगे!",
      neutral: "संतुलित ऊर्जा",
      challenging: "सावधानी से आगे बढ़ें"
    },
    love: {
      positive: "आज प्रेम खिलता है!",
      neutral: "रिश्ते में संतुलन",
      challenging: "प्रेम में धैर्य चाहिए"
    },
    career: {
      positive: "व्यावसायिक सफलता!",
      neutral: "स्थिर प्रगति",
      challenging: "करियर में सावधानी"
    },
    health: {
      positive: "जीवंत स्वास्थ्य!",
      neutral: "कल्याण बनाए रखें",
      challenging: "स्वास्थ्य जागरूकता"
    },
    finance: {
      positive: "वित्तीय भाग्य!",
      neutral: "धन के मामले",
      challenging: "वित्तीय सावधानी"
    }
  };
  
  return titles[category][tone as keyof typeof titles[typeof category]];
}

function generateAdvice(category: HoroscopeCategory, tone: string, moonSign: number): string {
  const advice = {
    general: "Stay positive and trust your instincts. Your natural wisdom will guide you.",
    love: "Open communication and understanding are key to relationship success today.",
    career: "Focus on your strengths and maintain professional relationships.",
    health: "Listen to your body and maintain a balanced lifestyle.",
    finance: "Make informed decisions and avoid impulsive financial choices."
  };
  
  return advice[category];
}

function generateAdviceHi(category: HoroscopeCategory, tone: string, moonSign: number): string {
  const advice = {
    general: "सकारात्मक रहें और अपनी अंतर्ज्ञान पर भरोसा करें। आपकी प्राकृतिक बुद्धि आपका मार्गदर्शन करेगी।",
    love: "खुला संचार और समझ आज रिश्ते की सफलता की कुंजी है।",
    career: "अपनी शक्तियों पर ध्यान दें और व्यावसायिक रिश्ते बनाए रखें।",
    health: "अपने शरीर की सुनें और संतुलित जीवनशैली बनाए रखें।",
    finance: "सूचित निर्णय लें और आवेगशील वित्तीय विकल्पों से बचें।"
  };
  
  return advice[category];
}

function generateWarning(category: HoroscopeCategory, moonSign: number): string {
  const warnings = {
    general: "Avoid major decisions today. Take time to reflect before acting.",
    love: "Misunderstandings may arise. Practice patience and avoid arguments.",
    career: "Workplace tensions possible. Stay diplomatic and focused.",
    health: "Pay attention to stress levels. Prioritize rest and relaxation.",
    finance: "Avoid major financial commitments. Review all details carefully."
  };
  
  return warnings[category];
}

function generateWarningHi(category: HoroscopeCategory, moonSign: number): string {
  const warnings = {
    general: "आज बड़े फैसलों से बचें। कार्य करने से पहले विचार करने का समय लें।",
    love: "गलतफहमियां हो सकती हैं। धैर्य का अभ्यास करें और बहस से बचें।",
    career: "कार्यक्षेत्र में तनाव संभव है। कूटनीतिक और केंद्रित रहें।",
    health: "तनाव के स्तर पर ध्यान दें। आराम और विश्राम को प्राथमिकता दें।",
    finance: "बड़ी वित्तीय प्रतिबद्धताओं से बचें। सभी विवरणों की सावधानीपूर्वक समीक्षा करें।"
  };
  
  return warnings[category];
}