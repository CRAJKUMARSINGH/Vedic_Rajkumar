/**
 * Anushthan (Ritual) Recommendations Service
 * 
 * Provides personalized ritual and puja recommendations based on:
 * - Planetary positions
 * - Birth chart analysis
 * - Current transits
 * - Specific needs/goals
 * 
 * Week 22 - Tuesday Implementation
 */

import { calculateLifePathNumber } from './numerologySystemService';

export interface Anushthan {
  id: string;
  name: {
    en: string;
    hi: string;
    sanskrit?: string;
  };
  type: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Occasional';
  purpose: {
    en: string;
    hi: string;
  };
  planet?: string;
  deity: string;
  duration: {
    days: number;
    description: {
      en: string;
      hi: string;
    };
  };
  timing: {
    bestTime: string;
    nakshatra?: string[];
    tithi?: string[];
    day?: string[];
  };
  materials: {
    essential: string[];
    optional: string[];
  };
  procedure: {
    en: string[];
    hi: string[];
  };
  mantras: {
    main: string;
    count: number;
    additional?: string[];
  };
  offerings: {
    en: string[];
    hi: string[];
  };
  benefits: {
    en: string[];
    hi: string[];
  };
  precautions: {
    en: string[];
    hi: string[];
  };
}

/**
 * Planetary Anushthan Database
 */
const PLANETARY_ANUSHTHANS: { [planet: string]: Anushthan } = {
  Sun: {
    id: 'surya-anushthan',
    name: {
      en: 'Surya Anushthan',
      hi: 'सूर्य अनुष्ठान',
      sanskrit: 'सूर्य अनुष्ठानम्'
    },
    type: 'Daily',
    purpose: {
      en: 'Strengthen Sun, gain confidence, leadership, health, and father\'s blessings',
      hi: 'सूर्य को मजबूत करें, आत्मविश्वास, नेतृत्व, स्वास्थ्य और पिता का आशीर्वाद प्राप्त करें'
    },
    planet: 'Sun',
    deity: 'Surya Dev',
    duration: {
      days: 21,
      description: {
        en: '21 consecutive Sundays or 21 days starting from Sunday',
        hi: '21 लगातार रविवार या रविवार से शुरू होने वाले 21 दिन'
      }
    },
    timing: {
      bestTime: 'Sunrise (within 1 hour)',
      day: ['Sunday'],
      nakshatra: ['Krittika', 'Uttara Phalguni', 'Uttara Ashadha']
    },
    materials: {
      essential: ['Red flowers', 'Copper vessel', 'Water', 'Red cloth', 'Wheat', 'Jaggery'],
      optional: ['Ruby gemstone', 'Copper coin', 'Red sandalwood', 'Saffron']
    },
    procedure: {
      en: [
        'Wake up before sunrise and take bath',
        'Face east direction',
        'Offer water (arghya) to rising sun with copper vessel',
        'Chant Surya mantra 108 times',
        'Offer red flowers and jaggery',
        'Donate wheat and jaggery to needy on Sundays'
      ],
      hi: [
        'सूर्योदय से पहले उठें और स्नान करें',
        'पूर्व दिशा की ओर मुख करें',
        'तांबे के बर्तन से उगते सूर्य को जल (अर्घ्य) अर्पित करें',
        'सूर्य मंत्र 108 बार जपें',
        'लाल फूल और गुड़ चढ़ाएं',
        'रविवार को जरूरतमंदों को गेहूं और गुड़ दान करें'
      ]
    },
    mantras: {
      main: 'Om Suryaya Namaha',
      count: 108,
      additional: ['Aditya Hridayam', 'Gayatri Mantra']
    },
    offerings: {
      en: ['Red flowers', 'Wheat', 'Jaggery', 'Red cloth'],
      hi: ['लाल फूल', 'गेहूं', 'गुड़', 'लाल कपड़ा']
    },
    benefits: {
      en: ['Strong willpower', 'Leadership qualities', 'Good health', 'Government favor', 'Father\'s blessings'],
      hi: ['मजबूत इच्छाशक्ति', 'नेतृत्व गुण', 'अच्छा स्वास्थ्य', 'सरकारी अनुग्रह', 'पिता का आशीर्वाद']
    },
    precautions: {
      en: ['Avoid non-vegetarian food', 'Maintain celibacy during anushthan', 'Keep fast on Sundays if possible'],
      hi: ['मांसाहार से बचें', 'अनुष्ठान के दौरान ब्रह्मचर्य रखें', 'संभव हो तो रविवार को उपवास रखें']
    }
  },

  Moon: {
    id: 'chandra-anushthan',
    name: {
      en: 'Chandra Anushthan',
      hi: 'चंद्र अनुष्ठान',
      sanskrit: 'चन्द्र अनुष्ठानम्'
    },
    type: 'Daily',
    purpose: {
      en: 'Strengthen Moon, gain emotional stability, mental peace, and mother\'s blessings',
      hi: 'चंद्र को मजबूत करें, भावनात्मक स्थिरता, मानसिक शांति और माता का आशीर्वाद प्राप्त करें'
    },
    planet: 'Moon',
    deity: 'Chandra Dev',
    duration: {
      days: 21,
      description: {
        en: '21 consecutive Mondays or 21 days starting from Monday',
        hi: '21 लगातार सोमवार या सोमवार से शुरू होने वाले 21 दिन'
      }
    },
    timing: {
      bestTime: 'Evening (moonrise)',
      day: ['Monday'],
      nakshatra: ['Rohini', 'Hasta', 'Shravana']
    },
    materials: {
      essential: ['White flowers', 'Silver vessel', 'Milk', 'White cloth', 'Rice', 'Sugar'],
      optional: ['Pearl', 'Camphor', 'White sandalwood', 'Jasmine']
    },
    procedure: {
      en: [
        'Take bath in evening before moonrise',
        'Wear white clothes',
        'Offer milk and water to moon',
        'Chant Chandra mantra 108 times',
        'Offer white flowers and rice',
        'Donate milk and white items on Mondays'
      ],
      hi: [
        'चंद्रोदय से पहले शाम को स्नान करें',
        'सफेद कपड़े पहनें',
        'चंद्रमा को दूध और पानी अर्पित करें',
        'चंद्र मंत्र 108 बार जपें',
        'सफेद फूल और चावल चढ़ाएं',
        'सोमवार को दूध और सफेद वस्तुएं दान करें'
      ]
    },
    mantras: {
      main: 'Om Chandraya Namaha',
      count: 108,
      additional: ['Om Som Somaya Namaha']
    },
    offerings: {
      en: ['White flowers', 'Milk', 'Rice', 'White cloth'],
      hi: ['सफेद फूल', 'दूध', 'चावल', 'सफेद कपड़ा']
    },
    benefits: {
      en: ['Mental peace', 'Emotional balance', 'Good relationships', 'Mother\'s blessings', 'Intuition'],
      hi: ['मानसिक शांति', 'भावनात्मक संतुलन', 'अच्छे संबंध', 'माता का आशीर्वाद', 'अंतर्ज्ञान']
    },
    precautions: {
      en: ['Avoid anger and harsh words', 'Maintain purity', 'Respect mother and women'],
      hi: ['क्रोध और कठोर शब्दों से बचें', 'पवित्रता बनाए रखें', 'माता और महिलाओं का सम्मान करें']
    }
  },

  Mars: {
    id: 'mangal-anushthan',
    name: {
      en: 'Mangal Anushthan',
      hi: 'मंगल अनुष्ठान',
      sanskrit: 'मङ्गल अनुष्ठानम्'
    },
    type: 'Weekly',
    purpose: {
      en: 'Strengthen Mars, gain courage, energy, property, and remove Manglik dosha',
      hi: 'मंगल को मजबूत करें, साहस, ऊर्जा, संपत्ति प्राप्त करें और मांगलिक दोष दूर करें'
    },
    planet: 'Mars',
    deity: 'Hanuman',
    duration: {
      days: 21,
      description: {
        en: '21 consecutive Tuesdays',
        hi: '21 लगातार मंगलवार'
      }
    },
    timing: {
      bestTime: 'Morning or evening',
      day: ['Tuesday'],
      nakshatra: ['Mrigashira', 'Chitra', 'Dhanishta']
    },
    materials: {
      essential: ['Red flowers', 'Sindoor', 'Red cloth', 'Jaggery', 'Red lentils'],
      optional: ['Red coral', 'Copper', 'Betel leaves']
    },
    procedure: {
      en: [
        'Visit Hanuman temple on Tuesdays',
        'Offer sindoor to Hanuman',
        'Recite Hanuman Chalisa',
        'Chant Mangal mantra 108 times',
        'Donate red items and jaggery',
        'Feed monkeys if possible'
      ],
      hi: [
        'मंगलवार को हनुमान मंदिर जाएं',
        'हनुमान को सिंदूर चढ़ाएं',
        'हनुमान चालीसा पाठ करें',
        'मंगल मंत्र 108 बार जपें',
        'लाल वस्तुएं और गुड़ दान करें',
        'संभव हो तो बंदरों को खिलाएं'
      ]
    },
    mantras: {
      main: 'Om Mangalaya Namaha',
      count: 108,
      additional: ['Hanuman Chalisa', 'Om Angarakaya Namaha']
    },
    offerings: {
      en: ['Red flowers', 'Sindoor', 'Jaggery', 'Red lentils'],
      hi: ['लाल फूल', 'सिंदूर', 'गुड़', 'लाल मसूर']
    },
    benefits: {
      en: ['Physical strength', 'Courage', 'Property gains', 'Manglik dosha removal', 'Victory over enemies'],
      hi: ['शारीरिक शक्ति', 'साहस', 'संपत्ति लाभ', 'मांगलिक दोष निवारण', 'शत्रुओं पर विजय']
    },
    precautions: {
      en: ['Control anger', 'Avoid conflicts', 'Maintain discipline'],
      hi: ['क्रोध पर नियंत्रण', 'संघर्ष से बचें', 'अनुशासन बनाए रखें']
    }
  }
};

/**
 * Purpose-based Anushthan recommendations
 */
const PURPOSE_ANUSHTHANS: { [purpose: string]: Anushthan } = {
  'wealth': {
    id: 'lakshmi-anushthan',
    name: {
      en: 'Lakshmi Anushthan',
      hi: 'लक्ष्मी अनुष्ठान',
      sanskrit: 'लक्ष्मी अनुष्ठानम्'
    },
    type: 'Weekly',
    purpose: {
      en: 'Attract wealth, prosperity, and financial abundance',
      hi: 'धन, समृद्धि और वित्तीय प्रचुरता आकर्षित करें'
    },
    deity: 'Lakshmi',
    duration: {
      days: 21,
      description: {
        en: '21 consecutive Fridays',
        hi: '21 लगातार शुक्रवार'
      }
    },
    timing: {
      bestTime: 'Evening (after sunset)',
      day: ['Friday'],
      tithi: ['Purnima', 'Ashtami']
    },
    materials: {
      essential: ['Lotus flowers', 'Coins', 'Turmeric', 'Kumkum', 'Sweets'],
      optional: ['Gold', 'Silver', 'Saffron', 'Camphor']
    },
    procedure: {
      en: [
        'Clean house and puja area thoroughly',
        'Light ghee lamp',
        'Offer lotus flowers and coins',
        'Chant Lakshmi mantra 108 times',
        'Recite Lakshmi Ashtakam',
        'Keep coins in puja for prosperity'
      ],
      hi: [
        'घर और पूजा स्थल को अच्छी तरह साफ करें',
        'घी का दीपक जलाएं',
        'कमल के फूल और सिक्के चढ़ाएं',
        'लक्ष्मी मंत्र 108 बार जपें',
        'लक्ष्मी अष्टकम पाठ करें',
        'समृद्धि के लिए पूजा में सिक्के रखें'
      ]
    },
    mantras: {
      main: 'Om Shreem Mahalakshmiyei Namaha',
      count: 108,
      additional: ['Lakshmi Ashtakam', 'Mahalakshmi Ashtakam']
    },
    offerings: {
      en: ['Lotus flowers', 'Sweets', 'Fruits', 'Coins'],
      hi: ['कमल के फूल', 'मिठाई', 'फल', 'सिक्के']
    },
    benefits: {
      en: ['Financial prosperity', 'Business success', 'Debt removal', 'Abundance'],
      hi: ['वित्तीय समृद्धि', 'व्यापार में सफलता', 'ऋण मुक्ति', 'प्रचुरता']
    },
    precautions: {
      en: ['Keep house clean', 'Avoid negativity', 'Be generous'],
      hi: ['घर साफ रखें', 'नकारात्मकता से बचें', 'उदार बनें']
    }
  },

  'education': {
    id: 'saraswati-anushthan',
    name: {
      en: 'Saraswati Anushthan',
      hi: 'सरस्वती अनुष्ठान',
      sanskrit: 'सरस्वती अनुष्ठानम्'
    },
    type: 'Daily',
    purpose: {
      en: 'Enhance knowledge, wisdom, academic success, and creative abilities',
      hi: 'ज्ञान, बुद्धि, शैक्षणिक सफलता और रचनात्मक क्षमताओं को बढ़ाएं'
    },
    deity: 'Saraswati',
    duration: {
      days: 40,
      description: {
        en: '40 consecutive days, best started on Vasant Panchami',
        hi: '40 लगातार दिन, वसंत पंचमी से शुरू करना सर्वोत्तम'
      }
    },
    timing: {
      bestTime: 'Early morning (Brahma Muhurta)',
      nakshatra: ['Revati', 'Ashwini', 'Pushya']
    },
    materials: {
      essential: ['Yellow flowers', 'Books', 'Pen', 'White cloth', 'Honey'],
      optional: ['Yellow sapphire', 'Turmeric', 'Saffron']
    },
    procedure: {
      en: [
        'Wake up early and take bath',
        'Wear yellow or white clothes',
        'Place books near deity',
        'Offer yellow flowers',
        'Chant Saraswati mantra 108 times',
        'Study after puja for best results'
      ],
      hi: [
        'जल्दी उठें और स्नान करें',
        'पीले या सफेद कपड़े पहनें',
        'देवी के पास किताबें रखें',
        'पीले फूल चढ़ाएं',
        'सरस्वती मंत्र 108 बार जपें',
        'सर्वोत्तम परिणामों के लिए पूजा के बाद अध्ययन करें'
      ]
    },
    mantras: {
      main: 'Om Aim Saraswatyai Namaha',
      count: 108,
      additional: ['Saraswati Vandana', 'Medha Suktam']
    },
    offerings: {
      en: ['Yellow flowers', 'Honey', 'Fruits', 'Sweets'],
      hi: ['पीले फूल', 'शहद', 'फल', 'मिठाई']
    },
    benefits: {
      en: ['Academic excellence', 'Memory power', 'Creative skills', 'Speech clarity'],
      hi: ['शैक्षणिक उत्कृष्टता', 'स्मरण शक्ति', 'रचनात्मक कौशल', 'वाणी स्पष्टता']
    },
    precautions: {
      en: ['Maintain silence during study', 'Respect books and teachers', 'Avoid distractions'],
      hi: ['अध्ययन के दौरान मौन रखें', 'पुस्तकों और शिक्षकों का सम्मान करें', 'विकर्षणों से बचें']
    }
  }
};

/**
 * Get anushthan by planet
 */
export function getAnushthanByPlanet(planet: string): Anushthan | undefined {
  return PLANETARY_ANUSHTHANS[planet];
}

/**
 * Get anushthan by purpose
 */
export function getAnushthanByPurpose(purpose: string): Anushthan | undefined {
  return PURPOSE_ANUSHTHANS[purpose.toLowerCase()];
}

/**
 * Get all planetary anushthans
 */
export function getAllPlanetaryAnushthans(): Anushthan[] {
  return Object.values(PLANETARY_ANUSHTHANS);
}

/**
 * Get all purpose-based anushthans
 */
export function getAllPurposeAnushthans(): Anushthan[] {
  return Object.values(PURPOSE_ANUSHTHANS);
}

/**
 * Get recommended anushthans based on birth date
 */
export function getRecommendedAnushthans(birthDate: Date): Anushthan[] {
  const lifePathNumber = calculateLifePathNumber(birthDate);
  const recommendations: Anushthan[] = [];

  // Recommend based on life path number
  const numberToPlanet: { [key: number]: string } = {
    1: 'Sun',
    2: 'Moon',
    3: 'Jupiter',
    4: 'Rahu',
    5: 'Mercury',
    6: 'Venus',
    7: 'Ketu',
    8: 'Saturn',
    9: 'Mars'
  };

  const planet = numberToPlanet[lifePathNumber];
  if (planet && PLANETARY_ANUSHTHANS[planet]) {
    recommendations.push(PLANETARY_ANUSHTHANS[planet]);
  }

  // Add general purpose anushthans
  recommendations.push(PURPOSE_ANUSHTHANS['wealth']);
  recommendations.push(PURPOSE_ANUSHTHANS['education']);

  return recommendations;
}

/**
 * Get anushthan by ID
 */
export function getAnushthanById(id: string): Anushthan | undefined {
  const allAnushthans = [...getAllPlanetaryAnushthans(), ...getAllPurposeAnushthans()];
  return allAnushthans.find(a => a.id === id);
}

/**
 * Search anushthans
 */
export function searchAnushthans(query: string): Anushthan[] {
  const allAnushthans = [...getAllPlanetaryAnushthans(), ...getAllPurposeAnushthans()];
  const lowerQuery = query.toLowerCase();

  return allAnushthans.filter(a =>
    a.name.en.toLowerCase().includes(lowerQuery) ||
    a.name.hi.includes(query) ||
    a.deity.toLowerCase().includes(lowerQuery) ||
    a.purpose.en.toLowerCase().includes(lowerQuery)
  );
}
