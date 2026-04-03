/**
 * Numerology System Service
 * 
 * Implements comprehensive numerology calculations:
 * - Life Path Number (from birth date)
 * - Destiny Number (from full name)
 * - Soul Urge Number (from vowels in name)
 * - Personality Number (from consonants in name)
 * 
 * Uses Pythagorean numerology system (1-9)
 * Week 21 - Monday Implementation
 */

export interface NumerologyNumbers {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
}

export interface NumberMeaning {
  number: number;
  title: {
    en: string;
    hi: string;
  };
  characteristics: {
    en: string[];
    hi: string[];
  };
  strengths: {
    en: string[];
    hi: string[];
  };
  weaknesses: {
    en: string[];
    hi: string[];
  };
  career: {
    en: string[];
    hi: string[];
  };
  planet: string;
  element: string;
  color: string;
}

// Pythagorean letter-to-number mapping
const LETTER_VALUES: { [key: string]: number } = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

/**
 * Reduce a number to single digit (1-9)
 * Master numbers (11, 22, 33) are preserved
 */
function reduceToSingleDigit(num: number): number {
  // Preserve master numbers
  if (num === 11 || num === 22 || num === 33) {
    return num;
  }
  
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  
  return num;
}

/**
 * Calculate Life Path Number from birth date
 * Most important number - reveals life purpose and destiny
 */
export function calculateLifePathNumber(birthDate: Date): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1; // 0-indexed
  const year = birthDate.getFullYear();
  
  // Reduce each component separately
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  
  // Sum and reduce
  const total = dayReduced + monthReduced + yearReduced;
  return reduceToSingleDigit(total);
}

/**
 * Calculate Destiny Number from full name
 * Reveals life goals and what you're meant to accomplish
 */
export function calculateDestinyNumber(fullName: string): number {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  
  let sum = 0;
  for (const char of cleanName) {
    sum += LETTER_VALUES[char] || 0;
  }
  
  return reduceToSingleDigit(sum);
}

/**
 * Calculate Soul Urge Number from vowels in name
 * Reveals inner desires, motivations, and what drives you
 */
export function calculateSoulUrgeNumber(fullName: string): number {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  
  let sum = 0;
  for (const char of cleanName) {
    if (VOWELS.includes(char)) {
      sum += LETTER_VALUES[char] || 0;
    }
  }
  
  return reduceToSingleDigit(sum);
}

/**
 * Calculate Personality Number from consonants in name
 * Reveals how others perceive you and your outer personality
 */
export function calculatePersonalityNumber(fullName: string): number {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
  
  let sum = 0;
  for (const char of cleanName) {
    if (!VOWELS.includes(char)) {
      sum += LETTER_VALUES[char] || 0;
    }
  }
  
  return reduceToSingleDigit(sum);
}

/**
 * Calculate all numerology numbers at once
 */
export function calculateAllNumerologyNumbers(
  birthDate: Date,
  fullName: string
): NumerologyNumbers {
  return {
    lifePathNumber: calculateLifePathNumber(birthDate),
    destinyNumber: calculateDestinyNumber(fullName),
    soulUrgeNumber: calculateSoulUrgeNumber(fullName),
    personalityNumber: calculatePersonalityNumber(fullName)
  };
}

/**
 * Get detailed meaning for a number (1-9)
 */
export function getNumberMeaning(number: number): NumberMeaning {
  const meanings: { [key: number]: NumberMeaning } = {
    1: {
      number: 1,
      title: {
        en: "The Leader",
        hi: "नेता"
      },
      characteristics: {
        en: [
          "Independent and self-reliant",
          "Natural born leader",
          "Innovative and creative",
          "Strong willpower and determination"
        ],
        hi: [
          "स्वतंत्र और आत्मनिर्भर",
          "जन्मजात नेता",
          "नवीन और रचनात्मक",
          "मजबूत इच्छाशक्ति और दृढ़ संकल्प"
        ]
      },
      strengths: {
        en: ["Leadership", "Courage", "Originality", "Initiative"],
        hi: ["नेतृत्व", "साहस", "मौलिकता", "पहल"]
      },
      weaknesses: {
        en: ["Arrogance", "Stubbornness", "Impatience", "Dominating"],
        hi: ["अहंकार", "जिद", "अधीरता", "दबंग"]
      },
      career: {
        en: ["Entrepreneur", "CEO", "Manager", "Politician", "Inventor"],
        hi: ["उद्यमी", "सीईओ", "प्रबंधक", "राजनेता", "आविष्कारक"]
      },
      planet: "Sun",
      element: "Fire",
      color: "Red"
    },
    2: {
      number: 2,
      title: {
        en: "The Peacemaker",
        hi: "शांतिदूत"
      },
      characteristics: {
        en: [
          "Diplomatic and cooperative",
          "Sensitive and intuitive",
          "Patient and understanding",
          "Excellent mediator"
        ],
        hi: [
          "कूटनीतिक और सहयोगी",
          "संवेदनशील और सहज",
          "धैर्यवान और समझदार",
          "उत्कृष्ट मध्यस्थ"
        ]
      },
      strengths: {
        en: ["Cooperation", "Balance", "Harmony", "Empathy"],
        hi: ["सहयोग", "संतुलन", "सामंजस्य", "सहानुभूति"]
      },
      weaknesses: {
        en: ["Indecisiveness", "Over-sensitivity", "Shyness", "Dependency"],
        hi: ["अनिर्णय", "अति संवेदनशीलता", "शर्मीलापन", "निर्भरता"]
      },
      career: {
        en: ["Counselor", "Diplomat", "Teacher", "Nurse", "Mediator"],
        hi: ["परामर्शदाता", "राजनयिक", "शिक्षक", "नर्स", "मध्यस्थ"]
      },
      planet: "Moon",
      element: "Water",
      color: "Orange"
    },
    3: {
      number: 3,
      title: {
        en: "The Creative",
        hi: "रचनाकार"
      },
      characteristics: {
        en: [
          "Artistic and expressive",
          "Optimistic and enthusiastic",
          "Social and charming",
          "Excellent communicator"
        ],
        hi: [
          "कलात्मक और अभिव्यंजक",
          "आशावादी और उत्साही",
          "सामाजिक और आकर्षक",
          "उत्कृष्ट संचारक"
        ]
      },
      strengths: {
        en: ["Creativity", "Communication", "Optimism", "Inspiration"],
        hi: ["रचनात्मकता", "संचार", "आशावाद", "प्रेरणा"]
      },
      weaknesses: {
        en: ["Scattered energy", "Superficiality", "Extravagance", "Gossip"],
        hi: ["बिखरी ऊर्जा", "सतहीपन", "फिजूलखर्ची", "गपशप"]
      },
      career: {
        en: ["Artist", "Writer", "Actor", "Designer", "Entertainer"],
        hi: ["कलाकार", "लेखक", "अभिनेता", "डिजाइनर", "मनोरंजनकर्ता"]
      },
      planet: "Jupiter",
      element: "Fire",
      color: "Yellow"
    },
    4: {
      number: 4,
      title: {
        en: "The Builder",
        hi: "निर्माता"
      },
      characteristics: {
        en: [
          "Practical and organized",
          "Hardworking and disciplined",
          "Reliable and trustworthy",
          "Detail-oriented"
        ],
        hi: [
          "व्यावहारिक और संगठित",
          "मेहनती और अनुशासित",
          "विश्वसनीय और भरोसेमंद",
          "विस्तार-उन्मुख"
        ]
      },
      strengths: {
        en: ["Stability", "Organization", "Loyalty", "Practicality"],
        hi: ["स्थिरता", "संगठन", "वफादारी", "व्यावहारिकता"]
      },
      weaknesses: {
        en: ["Rigidity", "Stubbornness", "Narrow-mindedness", "Workaholic"],
        hi: ["कठोरता", "जिद", "संकीर्ण सोच", "कार्यसक्त"]
      },
      career: {
        en: ["Engineer", "Accountant", "Builder", "Manager", "Analyst"],
        hi: ["इंजीनियर", "लेखाकार", "बिल्डर", "प्रबंधक", "विश्लेषक"]
      },
      planet: "Rahu",
      element: "Earth",
      color: "Green"
    },
    5: {
      number: 5,
      title: {
        en: "The Adventurer",
        hi: "साहसी"
      },
      characteristics: {
        en: [
          "Freedom-loving and adventurous",
          "Versatile and adaptable",
          "Curious and energetic",
          "Quick-thinking"
        ],
        hi: [
          "स्वतंत्रता-प्रेमी और साहसी",
          "बहुमुखी और अनुकूलनशील",
          "जिज्ञासु और ऊर्जावान",
          "तीव्र-बुद्धि"
        ]
      },
      strengths: {
        en: ["Adaptability", "Freedom", "Versatility", "Curiosity"],
        hi: ["अनुकूलनशीलता", "स्वतंत्रता", "बहुमुखी प्रतिभा", "जिज्ञासा"]
      },
      weaknesses: {
        en: ["Restlessness", "Impulsiveness", "Irresponsibility", "Inconsistency"],
        hi: ["बेचैनी", "आवेगशीलता", "गैर-जिम्मेदारी", "असंगति"]
      },
      career: {
        en: ["Travel Agent", "Journalist", "Sales", "Entrepreneur", "Performer"],
        hi: ["ट्रैवल एजेंट", "पत्रकार", "बिक्री", "उद्यमी", "कलाकार"]
      },
      planet: "Mercury",
      element: "Air",
      color: "Sky Blue"
    },
    6: {
      number: 6,
      title: {
        en: "The Nurturer",
        hi: "पालनकर्ता"
      },
      characteristics: {
        en: [
          "Caring and compassionate",
          "Responsible and protective",
          "Family-oriented",
          "Harmonious and balanced"
        ],
        hi: [
          "देखभाल करने वाला और दयालु",
          "जिम्मेदार और सुरक्षात्मक",
          "परिवार-उन्मुख",
          "सामंजस्यपूर्ण और संतुलित"
        ]
      },
      strengths: {
        en: ["Responsibility", "Compassion", "Service", "Balance"],
        hi: ["जिम्मेदारी", "करुणा", "सेवा", "संतुलन"]
      },
      weaknesses: {
        en: ["Worry", "Anxiety", "Self-sacrifice", "Interference"],
        hi: ["चिंता", "व्यग्रता", "आत्म-बलिदान", "हस्तक्षेप"]
      },
      career: {
        en: ["Teacher", "Doctor", "Counselor", "Chef", "Interior Designer"],
        hi: ["शिक्षक", "डॉक्टर", "परामर्शदाता", "रसोइया", "इंटीरियर डिजाइनर"]
      },
      planet: "Venus",
      element: "Earth",
      color: "Pink"
    },
    7: {
      number: 7,
      title: {
        en: "The Seeker",
        hi: "खोजी"
      },
      characteristics: {
        en: [
          "Analytical and introspective",
          "Spiritual and philosophical",
          "Perfectionist and reserved",
          "Wisdom-seeking"
        ],
        hi: [
          "विश्लेषणात्मक और आत्मनिरीक्षण",
          "आध्यात्मिक और दार्शनिक",
          "पूर्णतावादी और आरक्षित",
          "ज्ञान-खोजी"
        ]
      },
      strengths: {
        en: ["Analysis", "Intuition", "Wisdom", "Spirituality"],
        hi: ["विश्लेषण", "अंतर्ज्ञान", "ज्ञान", "आध्यात्मिकता"]
      },
      weaknesses: {
        en: ["Aloofness", "Skepticism", "Isolation", "Coldness"],
        hi: ["अलगाव", "संदेह", "एकांत", "शीतलता"]
      },
      career: {
        en: ["Researcher", "Scientist", "Philosopher", "Analyst", "Spiritual Teacher"],
        hi: ["शोधकर्ता", "वैज्ञानिक", "दार्शनिक", "विश्लेषक", "आध्यात्मिक गुरु"]
      },
      planet: "Ketu",
      element: "Water",
      color: "Purple"
    },
    8: {
      number: 8,
      title: {
        en: "The Powerhouse",
        hi: "शक्तिशाली"
      },
      characteristics: {
        en: [
          "Ambitious and goal-oriented",
          "Authoritative and confident",
          "Business-minded",
          "Material success-focused"
        ],
        hi: [
          "महत्वाकांक्षी और लक्ष्य-उन्मुख",
          "अधिकारपूर्ण और आत्मविश्वासी",
          "व्यापार-उन्मुख",
          "भौतिक सफलता-केंद्रित"
        ]
      },
      strengths: {
        en: ["Ambition", "Authority", "Efficiency", "Management"],
        hi: ["महत्वाकांक्षा", "अधिकार", "दक्षता", "प्रबंधन"]
      },
      weaknesses: {
        en: ["Materialism", "Workaholism", "Controlling", "Impatience"],
        hi: ["भौतिकवाद", "कार्यसक्तता", "नियंत्रण", "अधीरता"]
      },
      career: {
        en: ["Executive", "Banker", "Real Estate", "Judge", "Surgeon"],
        hi: ["कार्यकारी", "बैंकर", "रियल एस्टेट", "न्यायाधीश", "सर्जन"]
      },
      planet: "Saturn",
      element: "Earth",
      color: "Black"
    },
    9: {
      number: 9,
      title: {
        en: "The Humanitarian",
        hi: "मानवतावादी"
      },
      characteristics: {
        en: [
          "Compassionate and generous",
          "Idealistic and visionary",
          "Selfless and giving",
          "Universal love"
        ],
        hi: [
          "दयालु और उदार",
          "आदर्शवादी और दूरदर्शी",
          "निःस्वार्थ और देने वाला",
          "सार्वभौमिक प्रेम"
        ]
      },
      strengths: {
        en: ["Compassion", "Generosity", "Idealism", "Wisdom"],
        hi: ["करुणा", "उदारता", "आदर्शवाद", "ज्ञान"]
      },
      weaknesses: {
        en: ["Impracticality", "Emotional", "Martyrdom", "Scattered"],
        hi: ["अव्यावहारिकता", "भावुक", "शहादत", "बिखरा हुआ"]
      },
      career: {
        en: ["Social Worker", "Healer", "Artist", "Philanthropist", "Teacher"],
        hi: ["समाज सेवक", "चिकित्सक", "कलाकार", "परोपकारी", "शिक्षक"]
      },
      planet: "Mars",
      element: "Fire",
      color: "Gold"
    }
  };
  
  return meanings[number] || meanings[1];
}

/**
 * Get all number meanings (1-9)
 */
export function getAllNumberMeanings(): NumberMeaning[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => getNumberMeaning(num));
}
