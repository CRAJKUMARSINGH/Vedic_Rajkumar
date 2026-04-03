/**
 * Mantra Service - Comprehensive Mantra Database
 * Week 15: Remedies Database - Monday Implementation
 * Complete mantra system for all 9 planets with pronunciation and timing
 */

export interface MantraInfo {
  id: string;
  planet: string;
  type: 'beej' | 'vedic' | 'stotra' | 'gayatri' | 'universal';
  sanskrit: string;
  transliteration: string;
  pronunciation: string;
  meaning: {
    en: string;
    hi: string;
  };
  repetitions: number[];
  timing: {
    bestDays: string[];
    bestHours: string[];
    lunarPhase?: string;
  };
  benefits: {
    en: string[];
    hi: string[];
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  precautions?: string[];
}

export interface PronunciationGuide {
  syllables: string[];
  stressPattern: number[];
  audioReference: string;
  tips: {
    en: string[];
    hi: string[];
  };
}

// Comprehensive Mantra Database for All 9 Planets
export const MANTRA_DATABASE: MantraInfo[] = [
  // SUN MANTRAS
  {
    id: 'sun_beej',
    planet: 'Sun',
    type: 'beej',
    sanskrit: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    transliteration: 'Om Hraam Hreem Hraum Sah Suryaya Namah',
    pronunciation: 'Om H-raam H-reem H-raum Sah Sur-ya-ya Na-mah',
    meaning: {
      en: 'Salutations to the Sun God, the source of all energy and life',
      hi: 'सूर्य देव को नमस्कार, सभी ऊर्जा और जीवन के स्रोत को'
    },
    repetitions: [108, 1008, 7000],
    timing: {
      bestDays: ['Sunday'],
      bestHours: ['Sunrise', '6-7 AM', '12-1 PM'],
      lunarPhase: 'Waxing Moon'
    },
    benefits: {
      en: ['Increases confidence', 'Improves leadership', 'Enhances vitality', 'Removes obstacles'],
      hi: ['आत्मविश्वास बढ़ाता है', 'नेतृत्व में सुधार', 'जीवन शक्ति बढ़ाता है', 'बाधाओं को दूर करता है']
    },
    difficulty: 'beginner',
    duration: '15-30 minutes daily'
  },
  {
    id: 'sun_gayatri',
    planet: 'Sun',
    type: 'gayatri',
    sanskrit: 'ॐ भास्कराय विद्महे महादुत्याथिकराय धीमहि तन्नो आदित्य प्रचोदयात्',
    transliteration: 'Om Bhaskaraya Vidmahe Mahadutyathikaraya Dhimahi Tanno Aditya Prachodayat',
    pronunciation: 'Om Bhas-ka-ra-ya Vid-ma-he Ma-ha-dut-ya-thi-ka-ra-ya Dhi-ma-hi Tan-no A-dit-ya Pra-cho-da-yat',
    meaning: {
      en: 'We meditate on the great Sun God, may that brilliant deity inspire our intellect',
      hi: 'हम महान सूर्य देव का ध्यान करते हैं, वह तेजस्वी देवता हमारी बुद्धि को प्रेरित करे'
    },
    repetitions: [108, 1008],
    timing: {
      bestDays: ['Sunday'],
      bestHours: ['Sunrise', 'Noon'],
      lunarPhase: 'Any'
    },
    benefits: {
      en: ['Spiritual growth', 'Mental clarity', 'Divine blessings', 'Inner strength'],
      hi: ['आध्यात्मिक विकास', 'मानसिक स्पष्टता', 'दिव्य आशीर्वाद', 'आंतरिक शक्ति']
    },
    difficulty: 'intermediate',
    duration: '20-45 minutes daily'
  },

  // MOON MANTRAS
  {
    id: 'moon_beej',
    planet: 'Moon',
    type: 'beej',
    sanskrit: 'ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः',
    transliteration: 'Om Shraam Shreem Shraum Sah Chandraya Namah',
    pronunciation: 'Om Sh-raam Sh-reem Sh-raum Sah Chan-dra-ya Na-mah',
    meaning: {
      en: 'Salutations to the Moon God, the controller of mind and emotions',
      hi: 'चंद्र देव को नमस्कार, मन और भावनाओं के नियंत्रक को'
    },
    repetitions: [108, 1008, 11000],
    timing: {
      bestDays: ['Monday'],
      bestHours: ['Evening', '7-9 PM', 'Moonrise'],
      lunarPhase: 'Full Moon'
    },
    benefits: {
      en: ['Emotional balance', 'Mental peace', 'Intuition enhancement', 'Stress relief'],
      hi: ['भावनात्मक संतुलन', 'मानसिक शांति', 'अंतर्ज्ञान वृद्धि', 'तनाव मुक्ति']
    },
    difficulty: 'beginner',
    duration: '15-30 minutes daily'
  },

  // MARS MANTRAS
  {
    id: 'mars_beej',
    planet: 'Mars',
    type: 'beej',
    sanskrit: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    transliteration: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
    pronunciation: 'Om K-raam K-reem K-raum Sah Bhau-ma-ya Na-mah',
    meaning: {
      en: 'Salutations to Mars, the planet of energy, courage and strength',
      hi: 'मंगल को नमस्कार, ऊर्जा, साहस और शक्ति के ग्रह को'
    },
    repetitions: [108, 1008, 10000],
    timing: {
      bestDays: ['Tuesday'],
      bestHours: ['Early morning', '5-7 AM', 'Sunset'],
      lunarPhase: 'Waxing Moon'
    },
    benefits: {
      en: ['Increases courage', 'Removes Manglik dosha', 'Enhances energy', 'Overcomes enemies'],
      hi: ['साहस बढ़ाता है', 'मांगलिक दोष दूर करता है', 'ऊर्जा बढ़ाता है', 'शत्रुओं पर विजय']
    },
    difficulty: 'beginner',
    duration: '15-30 minutes daily'
  },

  // MERCURY MANTRAS
  {
    id: 'mercury_beej',
    planet: 'Mercury',
    type: 'beej',
    sanskrit: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    transliteration: 'Om Braam Breem Braum Sah Budhaya Namah',
    pronunciation: 'Om B-raam B-reem B-raum Sah Bu-dha-ya Na-mah',
    meaning: {
      en: 'Salutations to Mercury, the planet of intelligence and communication',
      hi: 'बुध को नमस्कार, बुद्धि और संचार के ग्रह को'
    },
    repetitions: [108, 1008, 17000],
    timing: {
      bestDays: ['Wednesday'],
      bestHours: ['Morning', '6-8 AM', '10-12 PM'],
      lunarPhase: 'Any'
    },
    benefits: {
      en: ['Enhances intelligence', 'Improves communication', 'Success in studies', 'Business growth'],
      hi: ['बुद्धि बढ़ाता है', 'संचार में सुधार', 'अध्ययन में सफलता', 'व्यापार वृद्धि']
    },
    difficulty: 'beginner',
    duration: '15-30 minutes daily'
  }
];
// JUPITER MANTRAS
const JUPITER_MANTRAS: MantraInfo[] = [
  {
    id: 'jupiter_beej',
    planet: 'Jupiter',
    type: 'beej',
    sanskrit: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    transliteration: 'Om Graam Greem Graum Sah Gurave Namah',
    pronunciation: 'Om G-raam G-reem G-raum Sah Gu-ra-ve Na-mah',
    meaning: {
      en: 'Salutations to Jupiter, the teacher and bestower of wisdom',
      hi: 'गुरु को नमस्कार, शिक्षक और ज्ञान दाता को'
    },
    repetitions: [108, 1008, 19000],
    timing: {
      bestDays: ['Thursday'],
      bestHours: ['Morning', '6-8 AM', 'Evening 6-8 PM'],
      lunarPhase: 'Waxing Moon'
    },
    benefits: {
      en: ['Increases wisdom', 'Spiritual growth', 'Good fortune', 'Success in education'],
      hi: ['ज्ञान बढ़ाता है', 'आध्यात्मिक विकास', 'सौभाग्य', 'शिक्षा में सफलता']
    },
    difficulty: 'beginner',
    duration: '15-30 minutes daily'
  },

  // VENUS MANTRAS
  {
    id: 'venus_beej',
    planet: 'Venus',
    type: 'beej',
    sanskrit: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    transliteration: 'Om Draam Dreem Draum Sah Shukraya Namah',
    pronunciation: 'Om D-raam D-reem D-raum Sah Shuk-ra-ya Na-mah',
    meaning: {
      en: 'Salutations to Venus, the planet of love, beauty and prosperity',
      hi: 'शुक्र को नमस्कार, प्रेम, सौंदर्य और समृद्धि के ग्रह को'
    },
    repetitions: [108, 1008, 16000],
    timing: {
      bestDays: ['Friday'],
      bestHours: ['Morning', '6-8 AM', 'Evening 7-9 PM'],
      lunarPhase: 'Full Moon'
    },
    benefits: {
      en: ['Attracts love', 'Enhances beauty', 'Financial prosperity', 'Artistic abilities'],
      hi: ['प्रेम आकर्षित करता है', 'सौंदर्य बढ़ाता है', 'आर्थिक समृद्धि', 'कलात्मक क्षमता']
    },
    difficulty: 'beginner',
    duration: '15-30 minutes daily'
  },

  // SATURN MANTRAS
  {
    id: 'saturn_beej',
    planet: 'Saturn',
    type: 'beej',
    sanskrit: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    transliteration: 'Om Praam Preem Praum Sah Shanaishcharaya Namah',
    pronunciation: 'Om P-raam P-reem P-raum Sah Sha-naish-cha-ra-ya Na-mah',
    meaning: {
      en: 'Salutations to Saturn, the planet of discipline and justice',
      hi: 'शनि को नमस्कार, अनुशासन और न्याय के ग्रह को'
    },
    repetitions: [108, 1008, 23000],
    timing: {
      bestDays: ['Saturday'],
      bestHours: ['Evening', '6-8 PM', 'Late evening'],
      lunarPhase: 'New Moon'
    },
    benefits: {
      en: ['Removes obstacles', 'Brings discipline', 'Karmic healing', 'Long-term success'],
      hi: ['बाधाएं दूर करता है', 'अनुशासन लाता है', 'कर्म चिकित्सा', 'दीर्घकालिक सफलता']
    },
    difficulty: 'intermediate',
    duration: '20-45 minutes daily'
  }
];

// RAHU & KETU MANTRAS
const RAHU_KETU_MANTRAS: MantraInfo[] = [
  {
    id: 'rahu_beej',
    planet: 'Rahu',
    type: 'beej',
    sanskrit: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
    transliteration: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
    pronunciation: 'Om Bh-raam Bh-reem Bh-raum Sah Ra-ha-ve Na-mah',
    meaning: {
      en: 'Salutations to Rahu, the north node that brings material success',
      hi: 'राहु को नमस्कार, उत्तरी छाया ग्रह जो भौतिक सफलता लाता है'
    },
    repetitions: [108, 1008, 18000],
    timing: {
      bestDays: ['Saturday', 'Wednesday'],
      bestHours: ['Evening', '7-9 PM', 'Night'],
      lunarPhase: 'New Moon'
    },
    benefits: {
      en: ['Material success', 'Removes Rahu dosha', 'Foreign opportunities', 'Technology mastery'],
      hi: ['भौतिक सफलता', 'राहु दोष दूर करता है', 'विदेशी अवसर', 'तकनीक में निपुणता']
    },
    difficulty: 'intermediate',
    duration: '20-30 minutes daily'
  },

  {
    id: 'ketu_beej',
    planet: 'Ketu',
    type: 'beej',
    sanskrit: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
    transliteration: 'Om Sraam Sreem Sraum Sah Ketave Namah',
    pronunciation: 'Om S-raam S-reem S-raum Sah Ke-ta-ve Na-mah',
    meaning: {
      en: 'Salutations to Ketu, the south node that brings spiritual liberation',
      hi: 'केतु को नमस्कार, दक्षिणी छाया ग्रह जो आध्यात्मिक मुक्ति लाता है'
    },
    repetitions: [108, 1008, 17000],
    timing: {
      bestDays: ['Tuesday', 'Thursday'],
      bestHours: ['Early morning', '4-6 AM', 'Evening'],
      lunarPhase: 'Waning Moon'
    },
    benefits: {
      en: ['Spiritual growth', 'Removes Ketu dosha', 'Psychic abilities', 'Detachment from materialism'],
      hi: ['आध्यात्मिक विकास', 'केतु दोष दूर करता है', 'मानसिक शक्तियां', 'भौतिकता से मुक्ति']
    },
    difficulty: 'advanced',
    duration: '30-45 minutes daily'
  }
];

// Combine all mantras
MANTRA_DATABASE.push(...JUPITER_MANTRAS, ...RAHU_KETU_MANTRAS);
// UNIVERSAL POWERFUL MANTRAS
const UNIVERSAL_MANTRAS: MantraInfo[] = [
  {
    id: 'mahamrityunjaya',
    planet: 'Universal',
    type: 'universal',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्',
    transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    pronunciation: 'Om Try-am-ba-kam Ya-ja-ma-he Su-gan-dhim Push-ti-var-dha-nam Ur-va-ru-ka-mi-va Ban-dha-nan Mrit-yor Muk-shi-ya Maam-ri-tat',
    meaning: {
      en: 'We worship the three-eyed Lord Shiva who is fragrant and nourishes all. Like a ripe cucumber falls from its bondage to the vine, may we be liberated from death and attain immortality',
      hi: 'हम त्रिनेत्र भगवान शिव की पूजा करते हैं जो सुगंधित हैं और सभी का पोषण करते हैं। जैसे पका हुआ खीरा अपनी बेल से मुक्त हो जाता है, वैसे ही हम मृत्यु से मुक्त होकर अमरता प्राप्त करें'
    },
    repetitions: [108, 1008, 125000],
    timing: {
      bestDays: ['Monday', 'Any day'],
      bestHours: ['Early morning', '4-6 AM', 'Evening'],
      lunarPhase: 'Any'
    },
    benefits: {
      en: ['Protection from death', 'Healing diseases', 'Spiritual liberation', 'Removes all fears'],
      hi: ['मृत्यु से सुरक्षा', 'रोगों का उपचार', 'आध्यात्मिक मुक्ति', 'सभी भयों का नाश']
    },
    difficulty: 'intermediate',
    duration: '30-60 minutes daily'
  },

  {
    id: 'gayatri_universal',
    planet: 'Universal',
    type: 'gayatri',
    sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
    transliteration: 'Om Bhur Bhuva Swaha Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat',
    pronunciation: 'Om Bhur Bhu-va Swa-ha Tat Sa-vi-tur Va-ren-yam Bhar-go De-vas-ya Dhi-ma-hi Dhi-yo Yo Nah Pra-cho-da-yat',
    meaning: {
      en: 'We meditate on the divine light of the Sun God who illuminates the three worlds. May that divine light inspire our intellect and guide us on the righteous path',
      hi: 'हम सूर्य देव के दिव्य प्रकाश का ध्यान करते हैं जो तीनों लोकों को प्रकाशित करता है। वह दिव्य प्रकाश हमारी बुद्धि को प्रेरित करे और धर्म के पथ पर ले चले'
    },
    repetitions: [108, 1008, 24000],
    timing: {
      bestDays: ['Any day'],
      bestHours: ['Sunrise', 'Noon', 'Sunset'],
      lunarPhase: 'Any'
    },
    benefits: {
      en: ['Universal blessings', 'Intellectual enhancement', 'Spiritual purification', 'Divine protection'],
      hi: ['सार्वभौमिक आशीर्वाद', 'बौद्धिक वृद्धि', 'आध्यात्मिक शुद्धता', 'दिव्य सुरक्षा']
    },
    difficulty: 'beginner',
    duration: '15-45 minutes daily'
  }
];

MANTRA_DATABASE.push(...UNIVERSAL_MANTRAS);

/**
 * Pronunciation Guide System
 */
export const PRONUNCIATION_GUIDES: Record<string, PronunciationGuide> = {
  'sun_beej': {
    syllables: ['Om', 'H-raam', 'H-reem', 'H-raum', 'Sah', 'Sur-ya-ya', 'Na-mah'],
    stressPattern: [1, 2, 2, 2, 1, 3, 2], // 1=light, 2=medium, 3=strong
    audioReference: 'Emphasize the "H" sound with breath, roll the "R" sounds',
    tips: {
      en: [
        'Start with "Om" from deep in the chest',
        'The "Hr" sounds should be aspirated with breath',
        'Roll the "R" sounds gently',
        'End with "Namah" as a humble offering'
      ],
      hi: [
        'ॐ को छाती की गहराई से शुरू करें',
        'ह्र की ध्वनि सांस के साथ करें',
        'र की ध्वनि को धीरे से घुमाएं',
        'नमः को विनम्र भेंट के रूप में समाप्त करें'
      ]
    }
  }
};

/**
 * Get mantras by planet
 */
export function getMantrasByPlanet(planet: string): MantraInfo[] {
  return MANTRA_DATABASE.filter(mantra => 
    mantra.planet.toLowerCase() === planet.toLowerCase()
  );
}

/**
 * Get mantras by type
 */
export function getMantrasByType(type: string): MantraInfo[] {
  return MANTRA_DATABASE.filter(mantra => mantra.type === type);
}

/**
 * Get pronunciation guide for a mantra
 */
export function getPronunciationGuide(mantraId: string): PronunciationGuide | null {
  return PRONUNCIATION_GUIDES[mantraId] || null;
}

/**
 * Recommend mantras based on birth chart analysis
 */
export function recommendMantras(
  weakPlanets: string[],
  doshas: string[],
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): MantraInfo[] {
  const recommendations: MantraInfo[] = [];
  
  // Add mantras for weak planets
  weakPlanets.forEach(planet => {
    const planetMantras = getMantrasByPlanet(planet)
      .filter(mantra => mantra.difficulty === userLevel || mantra.difficulty === 'beginner');
    recommendations.push(...planetMantras);
  });
  
  // Add universal mantras for overall benefit
  const universalMantras = getMantrasByPlanet('Universal')
    .filter(mantra => mantra.difficulty === userLevel || mantra.difficulty === 'beginner');
  recommendations.push(...universalMantras.slice(0, 2));
  
  return recommendations;
}

/**
 * Get mantra chanting schedule
 */
export function getChantingSchedule(mantraId: string): {
  dailyCount: number;
  weeklyGoal: number;
  monthlyGoal: number;
  bestTimes: string[];
} {
  const mantra = MANTRA_DATABASE.find(m => m.id === mantraId);
  if (!mantra) {
    throw new Error('Mantra not found');
  }
  
  const dailyCount = mantra.repetitions[0]; // Start with minimum
  return {
    dailyCount,
    weeklyGoal: dailyCount * 7,
    monthlyGoal: dailyCount * 30,
    bestTimes: mantra.timing.bestHours
  };
}

export default {
  MANTRA_DATABASE,
  PRONUNCIATION_GUIDES,
  getMantrasByPlanet,
  getMantrasByType,
  getPronunciationGuide,
  recommendMantras,
  getChantingSchedule
};