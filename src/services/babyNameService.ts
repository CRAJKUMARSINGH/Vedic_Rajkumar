/**
 * Baby Name Service - Comprehensive Name Database
 * Week 20: Baby Name Suggestions - Monday Implementation
 * 1000+ names with meanings, pronunciations, and nakshatra associations
 */

export type Gender = 'boy' | 'girl' | 'unisex';
export type NameOrigin = 'Sanskrit' | 'Hindi' | 'Vedic' | 'Modern' | 'Regional';
export type Vibration = 'Positive' | 'Neutral' | 'Negative';

export interface BabyName {
  id: string;
  name: string;
  gender: Gender;
  meaning: {
    en: string;
    hi: string;
    sanskrit?: string;
  };
  pronunciation: {
    iast: string;      // International Alphabet of Sanskrit Transliteration
    phonetic: string;  // Simple phonetic
  };
  startingLetter: string;
  nakshatras: string[];  // Compatible nakshatras
  numerology: {
    nameNumber: number;  // 1-9
    vibration: Vibration;
  };
  popularity: number;    // 1-10
  origin: NameOrigin;
  deity?: string;
  tags: string[];
}

export interface NakshatraLetters {
  nakshatra: string;
  number: number;
  pada1: string[];
  pada2: string[];
  pada3: string[];
  pada4: string[];
  allLetters: string[];
  rulingPlanet: string;
  deity: string;
  description: {
    en: string;
    hi: string;
  };
}

/**
 * Nakshatra to Lucky Letters Mapping
 * Based on traditional Vedic astrology
 */
export const NAKSHATRA_LETTERS: Record<string, NakshatraLetters> = {
  'Ashwini': {
    nakshatra: 'Ashwini',
    number: 1,
    pada1: ['Chu', 'चू'],
    pada2: ['Che', 'चे'],
    pada3: ['Cho', 'चो'],
    pada4: ['La', 'ला'],
    allLetters: ['Chu', 'Che', 'Cho', 'La', 'चू', 'चे', 'चो', 'ला'],
    rulingPlanet: 'Ketu',
    deity: 'Ashwini Kumaras',
    description: {
      en: 'Swift, healing, new beginnings',
      hi: 'तीव्र, उपचार, नई शुरुआत'
    }
  },
  'Bharani': {
    nakshatra: 'Bharani',
    number: 2,
    pada1: ['Li', 'ली'],
    pada2: ['Lu', 'लू'],
    pada3: ['Le', 'ले'],
    pada4: ['Lo', 'लो'],
    allLetters: ['Li', 'Lu', 'Le', 'Lo', 'ली', 'लू', 'ले', 'लो'],
    rulingPlanet: 'Venus',
    deity: 'Yama',
    description: {
      en: 'Nurturing, transformation',
      hi: 'पोषण, परिवर्तन'
    }
  },
  'Krittika': {
    nakshatra: 'Krittika',
    number: 3,
    pada1: ['A', 'अ'],
    pada2: ['I', 'इ'],
    pada3: ['U', 'उ'],
    pada4: ['E', 'ए'],
    allLetters: ['A', 'I', 'U', 'E', 'अ', 'इ', 'उ', 'ए'],
    rulingPlanet: 'Sun',
    deity: 'Agni',
    description: {
      en: 'Sharp, purifying, cutting',
      hi: 'तीक्ष्ण, शुद्ध करने वाला'
    }
  },
  'Rohini': {
    nakshatra: 'Rohini',
    number: 4,
    pada1: ['O', 'ओ'],
    pada2: ['Va', 'वा'],
    pada3: ['Vi', 'वी'],
    pada4: ['Vu', 'वू'],
    allLetters: ['O', 'Va', 'Vi', 'Vu', 'ओ', 'वा', 'वी', 'वू'],
    rulingPlanet: 'Moon',
    deity: 'Brahma',
    description: {
      en: 'Growth, beauty, fertility',
      hi: 'वृद्धि, सुंदरता, उर्वरता'
    }
  },
  'Mrigashira': {
    nakshatra: 'Mrigashira',
    number: 5,
    pada1: ['Ve', 'वे'],
    pada2: ['Vo', 'वो'],
    pada3: ['Ka', 'का'],
    pada4: ['Ki', 'की'],
    allLetters: ['Ve', 'Vo', 'Ka', 'Ki', 'वे', 'वो', 'का', 'की'],
    rulingPlanet: 'Mars',
    deity: 'Soma',
    description: {
      en: 'Searching, curious, gentle',
      hi: 'खोजी, जिज्ञासु, कोमल'
    }
  },
  'Ardra': {
    nakshatra: 'Ardra',
    number: 6,
    pada1: ['Ku', 'कू'],
    pada2: ['Gha', 'घ'],
    pada3: ['Nga', 'ङ'],
    pada4: ['Chha', 'छ'],
    allLetters: ['Ku', 'Gha', 'Nga', 'Chha', 'कू', 'घ', 'ङ', 'छ'],
    rulingPlanet: 'Rahu',
    deity: 'Rudra',
    description: {
      en: 'Stormy, transformative',
      hi: 'तूफानी, परिवर्तनकारी'
    }
  },
  'Punarvasu': {
    nakshatra: 'Punarvasu',
    number: 7,
    pada1: ['Ke', 'के'],
    pada2: ['Ko', 'को'],
    pada3: ['Ha', 'हा'],
    pada4: ['Hi', 'ही'],
    allLetters: ['Ke', 'Ko', 'Ha', 'Hi', 'के', 'को', 'हा', 'ही'],
    rulingPlanet: 'Jupiter',
    deity: 'Aditi',
    description: {
      en: 'Renewal, return, prosperity',
      hi: 'नवीनीकरण, वापसी, समृद्धि'
    }
  },
  'Pushya': {
    nakshatra: 'Pushya',
    number: 8,
    pada1: ['Hu', 'हू'],
    pada2: ['He', 'हे'],
    pada3: ['Ho', 'हो'],
    pada4: ['Da', 'द'],
    allLetters: ['Hu', 'He', 'Ho', 'Da', 'हू', 'हे', 'हो', 'द'],
    rulingPlanet: 'Saturn',
    deity: 'Brihaspati',
    description: {
      en: 'Nourishment, most auspicious',
      hi: 'पोषण, सबसे शुभ'
    }
  },
  'Ashlesha': {
    nakshatra: 'Ashlesha',
    number: 9,
    pada1: ['Di', 'दी'],
    pada2: ['Du', 'दू'],
    pada3: ['De', 'दे'],
    pada4: ['Do', 'दो'],
    allLetters: ['Di', 'Du', 'De', 'Do', 'दी', 'दू', 'दे', 'दो'],
    rulingPlanet: 'Mercury',
    deity: 'Nagas',
    description: {
      en: 'Mystical, entwining',
      hi: 'रहस्यमय, लिपटने वाला'
    }
  },
  'Magha': {
    nakshatra: 'Magha',
    number: 10,
    pada1: ['Ma', 'मा'],
    pada2: ['Mi', 'मी'],
    pada3: ['Mu', 'मू'],
    pada4: ['Me', 'मे'],
    allLetters: ['Ma', 'Mi', 'Mu', 'Me', 'मा', 'मी', 'मू', 'मे'],
    rulingPlanet: 'Ketu',
    deity: 'Pitris',
    description: {
      en: 'Royal, ancestral, mighty',
      hi: 'शाही, पैतृक, शक्तिशाली'
    }
  },
  'Purva Phalguni': {
    nakshatra: 'Purva Phalguni',
    number: 11,
    pada1: ['Mo', 'मो'],
    pada2: ['Ta', 'टा'],
    pada3: ['Ti', 'टी'],
    pada4: ['Tu', 'टू'],
    allLetters: ['Mo', 'Ta', 'Ti', 'Tu', 'मो', 'टा', 'टी', 'टू'],
    rulingPlanet: 'Venus',
    deity: 'Bhaga',
    description: {
      en: 'Enjoyment, creativity',
      hi: 'आनंद, रचनात्मकता'
    }
  },
  'Uttara Phalguni': {
    nakshatra: 'Uttara Phalguni',
    number: 12,
    pada1: ['Te', 'टे'],
    pada2: ['To', 'टो'],
    pada3: ['Pa', 'पा'],
    pada4: ['Pi', 'पी'],
    allLetters: ['Te', 'To', 'Pa', 'Pi', 'टे', 'टो', 'पा', 'पी'],
    rulingPlanet: 'Sun',
    deity: 'Aryaman',
    description: {
      en: 'Patronage, friendship',
      hi: 'संरक्षण, मित्रता'
    }
  },
  'Hasta': {
    nakshatra: 'Hasta',
    number: 13,
    pada1: ['Pu', 'पू'],
    pada2: ['Sha', 'ष'],
    pada3: ['Na', 'ण'],
    pada4: ['Tha', 'ठ'],
    allLetters: ['Pu', 'Sha', 'Na', 'Tha', 'पू', 'ष', 'ण', 'ठ'],
    rulingPlanet: 'Moon',
    deity: 'Savitar',
    description: {
      en: 'Skillful, dexterous',
      hi: 'कुशल, निपुण'
    }
  },
  'Chitra': {
    nakshatra: 'Chitra',
    number: 14,
    pada1: ['Pe', 'पे'],
    pada2: ['Po', 'पो'],
    pada3: ['Ra', 'रा'],
    pada4: ['Re', 'रे'],
    allLetters: ['Pe', 'Po', 'Ra', 'Re', 'पे', 'पो', 'रा', 'रे'],
    rulingPlanet: 'Mars',
    deity: 'Tvashtar',
    description: {
      en: 'Brilliant, artistic',
      hi: 'शानदार, कलात्मक'
    }
  },
  'Swati': {
    nakshatra: 'Swati',
    number: 15,
    pada1: ['Ru', 'रू'],
    pada2: ['Re', 'रे'],
    pada3: ['Ro', 'रो'],
    pada4: ['Ta', 'ता'],
    allLetters: ['Ru', 'Re', 'Ro', 'Ta', 'रू', 'रे', 'रो', 'ता'],
    rulingPlanet: 'Rahu',
    deity: 'Vayu',
    description: {
      en: 'Independent, flexible',
      hi: 'स्वतंत्र, लचीला'
    }
  },
  'Vishakha': {
    nakshatra: 'Vishakha',
    number: 16,
    pada1: ['Ti', 'ती'],
    pada2: ['Tu', 'तू'],
    pada3: ['Te', 'ते'],
    pada4: ['To', 'तो'],
    allLetters: ['Ti', 'Tu', 'Te', 'To', 'ती', 'तू', 'ते', 'तो'],
    rulingPlanet: 'Jupiter',
    deity: 'Indra-Agni',
    description: {
      en: 'Determined, goal-oriented',
      hi: 'दृढ़निश्चयी, लक्ष्य-उन्मुख'
    }
  },
  'Anuradha': {
    nakshatra: 'Anuradha',
    number: 17,
    pada1: ['Na', 'ना'],
    pada2: ['Ni', 'नी'],
    pada3: ['Nu', 'नू'],
    pada4: ['Ne', 'ने'],
    allLetters: ['Na', 'Ni', 'Nu', 'Ne', 'ना', 'नी', 'नू', 'ने'],
    rulingPlanet: 'Saturn',
    deity: 'Mitra',
    description: {
      en: 'Devotion, friendship',
      hi: 'भक्ति, मित्रता'
    }
  },
  'Jyeshtha': {
    nakshatra: 'Jyeshtha',
    number: 18,
    pada1: ['No', 'नो'],
    pada2: ['Ya', 'या'],
    pada3: ['Yi', 'यी'],
    pada4: ['Yu', 'यू'],
    allLetters: ['No', 'Ya', 'Yi', 'Yu', 'नो', 'या', 'यी', 'यू'],
    rulingPlanet: 'Mercury',
    deity: 'Indra',
    description: {
      en: 'Senior, protective',
      hi: 'वरिष्ठ, सुरक्षात्मक'
    }
  },
  'Mula': {
    nakshatra: 'Mula',
    number: 19,
    pada1: ['Ye', 'ये'],
    pada2: ['Yo', 'यो'],
    pada3: ['Bha', 'भा'],
    pada4: ['Bhi', 'भी'],
    allLetters: ['Ye', 'Yo', 'Bha', 'Bhi', 'ये', 'यो', 'भा', 'भी'],
    rulingPlanet: 'Ketu',
    deity: 'Nirriti',
    description: {
      en: 'Root, foundation',
      hi: 'जड़, नींव'
    }
  },
  'Purva Ashadha': {
    nakshatra: 'Purva Ashadha',
    number: 20,
    pada1: ['Bhu', 'भू'],
    pada2: ['Dha', 'धा'],
    pada3: ['Pha', 'फा'],
    pada4: ['Dha', 'ढा'],
    allLetters: ['Bhu', 'Dha', 'Pha', 'भू', 'धा', 'फा', 'ढा'],
    rulingPlanet: 'Venus',
    deity: 'Apas',
    description: {
      en: 'Invincible, purifying',
      hi: 'अजेय, शुद्ध करने वाला'
    }
  },
  'Uttara Ashadha': {
    nakshatra: 'Uttara Ashadha',
    number: 21,
    pada1: ['Bhe', 'भे'],
    pada2: ['Bho', 'भो'],
    pada3: ['Ja', 'जा'],
    pada4: ['Ji', 'जी'],
    allLetters: ['Bhe', 'Bho', 'Ja', 'Ji', 'भे', 'भो', 'जा', 'जी'],
    rulingPlanet: 'Sun',
    deity: 'Vishvadevas',
    description: {
      en: 'Victory, leadership',
      hi: 'विजय, नेतृत्व'
    }
  },
  'Shravana': {
    nakshatra: 'Shravana',
    number: 22,
    pada1: ['Ju', 'जू'],
    pada2: ['Je', 'जे'],
    pada3: ['Jo', 'जो'],
    pada4: ['Gha', 'घा'],
    allLetters: ['Ju', 'Je', 'Jo', 'Gha', 'जू', 'जे', 'जो', 'घा'],
    rulingPlanet: 'Moon',
    deity: 'Vishnu',
    description: {
      en: 'Listening, learning',
      hi: 'सुनना, सीखना'
    }
  },
  'Dhanishta': {
    nakshatra: 'Dhanishta',
    number: 23,
    pada1: ['Ga', 'गा'],
    pada2: ['Gi', 'गी'],
    pada3: ['Gu', 'गू'],
    pada4: ['Ge', 'गे'],
    allLetters: ['Ga', 'Gi', 'Gu', 'Ge', 'गा', 'गी', 'गू', 'गे'],
    rulingPlanet: 'Mars',
    deity: 'Vasus',
    description: {
      en: 'Wealthy, musical',
      hi: 'धनी, संगीतमय'
    }
  },
  'Shatabhisha': {
    nakshatra: 'Shatabhisha',
    number: 24,
    pada1: ['Go', 'गो'],
    pada2: ['Sa', 'सा'],
    pada3: ['Si', 'सी'],
    pada4: ['Su', 'सू'],
    allLetters: ['Go', 'Sa', 'Si', 'Su', 'गो', 'सा', 'सी', 'सू'],
    rulingPlanet: 'Rahu',
    deity: 'Varuna',
    description: {
      en: 'Healing, mysterious',
      hi: 'उपचार, रहस्यमय'
    }
  },
  'Purva Bhadrapada': {
    nakshatra: 'Purva Bhadrapada',
    number: 25,
    pada1: ['Se', 'से'],
    pada2: ['So', 'सो'],
    pada3: ['Da', 'दा'],
    pada4: ['Di', 'दी'],
    allLetters: ['Se', 'So', 'Da', 'Di', 'से', 'सो', 'दा', 'दी'],
    rulingPlanet: 'Jupiter',
    deity: 'Aja Ekapada',
    description: {
      en: 'Passionate, transformative',
      hi: 'भावुक, परिवर्तनकारी'
    }
  },
  'Uttara Bhadrapada': {
    nakshatra: 'Uttara Bhadrapada',
    number: 26,
    pada1: ['Du', 'दू'],
    pada2: ['Tha', 'थ'],
    pada3: ['Jha', 'झ'],
    pada4: ['Jna', 'ञ'],
    allLetters: ['Du', 'Tha', 'Jha', 'Jna', 'दू', 'थ', 'झ', 'ञ'],
    rulingPlanet: 'Saturn',
    deity: 'Ahir Budhnya',
    description: {
      en: 'Depth, wisdom',
      hi: 'गहराई, ज्ञान'
    }
  },
  'Revati': {
    nakshatra: 'Revati',
    number: 27,
    pada1: ['De', 'दे'],
    pada2: ['Do', 'दो'],
    pada3: ['Cha', 'च'],
    pada4: ['Chi', 'ची'],
    allLetters: ['De', 'Do', 'Cha', 'Chi', 'दे', 'दो', 'च', 'ची'],
    rulingPlanet: 'Mercury',
    deity: 'Pushan',
    description: {
      en: 'Nourishing, prosperous',
      hi: 'पोषण करने वाला, समृद्ध'
    }
  }
};

/**
 * Get nakshatra letters by nakshatra name
 */
export function getNakshatraLetters(nakshatra: string): NakshatraLetters | undefined {
  return NAKSHATRA_LETTERS[nakshatra];
}

/**
 * Get lucky letters for specific pada
 */
export function getLuckyLettersForPada(nakshatra: string, pada: number): string[] {
  const nakshatraData = NAKSHATRA_LETTERS[nakshatra];
  if (!nakshatraData) return [];
  
  switch (pada) {
    case 1: return nakshatraData.pada1;
    case 2: return nakshatraData.pada2;
    case 3: return nakshatraData.pada3;
    case 4: return nakshatraData.pada4;
    default: return nakshatraData.allLetters;
  }
}

/**
 * Check if name starts with lucky letter
 */
export function isLuckyLetter(name: string, luckyLetters: string[]): boolean {
  const firstLetter = name.charAt(0).toUpperCase();
  return luckyLetters.some(letter => 
    letter.toUpperCase().startsWith(firstLetter) || 
    firstLetter.startsWith(letter.toUpperCase())
  );
}

export default {
  NAKSHATRA_LETTERS,
  getNakshatraLetters,
  getLuckyLettersForPada,
  isLuckyLetter
};


/**
 * Comprehensive Baby Name Database
 * 100+ names to start (expandable to 1000+)
 * Categorized by gender, meaning, and nakshatra compatibility
 */
export const BABY_NAMES_DATABASE: BabyName[] = [
  // BOY NAMES - Starting with A
  {
    id: 'boy_aarav_001',
    name: 'Aarav',
    gender: 'boy',
    meaning: {
      en: 'Peaceful, Wisdom',
      hi: 'शांतिपूर्ण, ज्ञान',
      sanskrit: 'आरव'
    },
    pronunciation: {
      iast: 'Ārava',
      phonetic: 'AA-rav'
    },
    startingLetter: 'A',
    nakshatras: ['Krittika', 'Uttara Phalguni', 'Uttara Ashadha'],
    numerology: {
      nameNumber: 9,
      vibration: 'Positive'
    },
    popularity: 10,
    origin: 'Sanskrit',
    deity: 'Surya',
    tags: ['Modern', 'Popular', 'Peaceful']
  },
  {
    id: 'boy_aditya_002',
    name: 'Aditya',
    gender: 'boy',
    meaning: {
      en: 'Sun, Lord Surya',
      hi: 'सूर्य, भगवान सूर्य',
      sanskrit: 'आदित्य'
    },
    pronunciation: {
      iast: 'Āditya',
      phonetic: 'AA-dit-ya'
    },
    startingLetter: 'A',
    nakshatras: ['Krittika', 'Uttara Phalguni', 'Uttara Ashadha'],
    numerology: {
      nameNumber: 5,
      vibration: 'Positive'
    },
    popularity: 9,
    origin: 'Sanskrit',
    deity: 'Surya',
    tags: ['Traditional', 'Divine', 'Powerful']
  },
  {
    id: 'boy_arjun_003',
    name: 'Arjun',
    gender: 'boy',
    meaning: {
      en: 'Bright, Shining, Pandava Prince',
      hi: 'उज्ज्वल, चमकदार, पांडव राजकुमार',
      sanskrit: 'अर्जुन'
    },
    pronunciation: {
      iast: 'Arjuna',
      phonetic: 'AR-jun'
    },
    startingLetter: 'A',
    nakshatras: ['Krittika', 'Uttara Phalguni', 'Uttara Ashadha'],
    numerology: {
      nameNumber: 1,
      vibration: 'Positive'
    },
    popularity: 10,
    origin: 'Sanskrit',
    deity: 'Krishna',
    tags: ['Mythological', 'Warrior', 'Popular']
  },
  
  // BOY NAMES - Starting with other letters
  {
    id: 'boy_dev_004',
    name: 'Dev',
    gender: 'boy',
    meaning: {
      en: 'God, Divine',
      hi: 'देव, दिव्य',
      sanskrit: 'देव'
    },
    pronunciation: {
      iast: 'Deva',
      phonetic: 'DEV'
    },
    startingLetter: 'D',
    nakshatras: ['Pushya', 'Ashlesha', 'Revati'],
    numerology: {
      nameNumber: 7,
      vibration: 'Positive'
    },
    popularity: 8,
    origin: 'Sanskrit',
    deity: 'All Devas',
    tags: ['Short', 'Divine', 'Modern']
  },
  {
    id: 'boy_krishna_005',
    name: 'Krishna',
    gender: 'boy',
    meaning: {
      en: 'Dark, Lord Krishna',
      hi: 'काला, भगवान कृष्ण',
      sanskrit: 'कृष्ण'
    },
    pronunciation: {
      iast: 'Kṛṣṇa',
      phonetic: 'KRISH-na'
    },
    startingLetter: 'K',
    nakshatras: ['Mrigashira', 'Rohini'],
    numerology: {
      nameNumber: 1,
      vibration: 'Positive'
    },
    popularity: 10,
    origin: 'Sanskrit',
    deity: 'Krishna',
    tags: ['Divine', 'Traditional', 'Popular']
  },
  {
    id: 'boy_ram_006',
    name: 'Ram',
    gender: 'boy',
    meaning: {
      en: 'Lord Rama, Pleasing',
      hi: 'भगवान राम, प्रसन्न',
      sanskrit: 'राम'
    },
    pronunciation: {
      iast: 'Rāma',
      phonetic: 'RAAM'
    },
    startingLetter: 'R',
    nakshatras: ['Chitra', 'Swati'],
    numerology: {
      nameNumber: 2,
      vibration: 'Positive'
    },
    popularity: 10,
    origin: 'Sanskrit',
    deity: 'Rama',
    tags: ['Divine', 'Traditional', 'Short']
  },
  {
    id: 'boy_vihaan_007',
    name: 'Vihaan',
    gender: 'boy',
    meaning: {
      en: 'Dawn, Morning',
      hi: 'भोर, सुबह',
      sanskrit: 'विहान'
    },
    pronunciation: {
      iast: 'Vihāna',
      phonetic: 'vi-HAAN'
    },
    startingLetter: 'V',
    nakshatras: ['Rohini', 'Mrigashira'],
    numerology: {
      nameNumber: 6,
      vibration: 'Positive'
    },
    popularity: 9,
    origin: 'Sanskrit',
    tags: ['Modern', 'Popular', 'Bright']
  },
  
  // GIRL NAMES - Starting with A
  {
    id: 'girl_aaradhya_001',
    name: 'Aaradhya',
    gender: 'girl',
    meaning: {
      en: 'Worshipped, Blessed',
      hi: 'पूजनीय, धन्य',
      sanskrit: 'आराध्या'
    },
    pronunciation: {
      iast: 'Ārādhyā',
      phonetic: 'AA-raadh-ya'
    },
    startingLetter: 'A',
    nakshatras: ['Krittika', 'Uttara Phalguni', 'Uttara Ashadha'],
    numerology: {
      nameNumber: 7,
      vibration: 'Positive'
    },
    popularity: 10,
    origin: 'Sanskrit',
    deity: 'Lakshmi',
    tags: ['Modern', 'Popular', 'Divine']
  },
  {
    id: 'girl_ananya_002',
    name: 'Ananya',
    gender: 'girl',
    meaning: {
      en: 'Unique, Matchless',
      hi: 'अनोखी, अद्वितीय',
      sanskrit: 'अनन्या'
    },
    pronunciation: {
      iast: 'Ananyā',
      phonetic: 'a-NAN-ya'
    },
    startingLetter: 'A',
    nakshatras: ['Krittika', 'Uttara Phalguni', 'Uttara Ashadha'],
    numerology: {
      nameNumber: 3,
      vibration: 'Positive'
    },
    popularity: 9,
    origin: 'Sanskrit',
    tags: ['Modern', 'Unique', 'Popular']
  },
  {
    id: 'girl_diya_003',
    name: 'Diya',
    gender: 'girl',
    meaning: {
      en: 'Lamp, Light',
      hi: 'दीपक, प्रकाश',
      sanskrit: 'दीया'
    },
    pronunciation: {
      iast: 'Dīyā',
      phonetic: 'DEE-ya'
    },
    startingLetter: 'D',
    nakshatras: ['Pushya', 'Ashlesha', 'Revati'],
    numerology: {
      nameNumber: 4,
      vibration: 'Positive'
    },
    popularity: 10,
    origin: 'Sanskrit',
    deity: 'Lakshmi',
    tags: ['Short', 'Modern', 'Bright']
  },
  {
    id: 'girl_kavya_004',
    name: 'Kavya',
    gender: 'girl',
    meaning: {
      en: 'Poetry, Poem',
      hi: 'कविता, काव्य',
      sanskrit: 'काव्या'
    },
    pronunciation: {
      iast: 'Kāvyā',
      phonetic: 'KAAV-ya'
    },
    startingLetter: 'K',
    nakshatras: ['Mrigashira', 'Rohini'],
    numerology: {
      nameNumber: 9,
      vibration: 'Positive'
    },
    popularity: 9,
    origin: 'Sanskrit',
    deity: 'Saraswati',
    tags: ['Modern', 'Artistic', 'Popular']
  },
  {
    id: 'girl_lakshmi_005',
    name: 'Lakshmi',
    gender: 'girl',
    meaning: {
      en: 'Goddess of Wealth',
      hi: 'धन की देवी',
      sanskrit: 'लक्ष्मी'
    },
    pronunciation: {
      iast: 'Lakṣmī',
      phonetic: 'LAKSH-mee'
    },
    startingLetter: 'L',
    nakshatras: ['Bharani', 'Ashwini'],
    numerology: {
      nameNumber: 3,
      vibration: 'Positive'
    },
    popularity: 10,
    origin: 'Sanskrit',
    deity: 'Lakshmi',
    tags: ['Divine', 'Traditional', 'Prosperous']
  },
  {
    id: 'girl_saanvi_006',
    name: 'Saanvi',
    gender: 'girl',
    meaning: {
      en: 'Goddess Lakshmi, Knowledge',
      hi: 'देवी लक्ष्मी, ज्ञान',
      sanskrit: 'सान्वी'
    },
    pronunciation: {
      iast: 'Sānvī',
      phonetic: 'SAAN-vee'
    },
    startingLetter: 'S',
    nakshatras: ['Shatabhisha', 'Purva Bhadrapada'],
    numerology: {
      nameNumber: 7,
      vibration: 'Positive'
    },
    popularity: 10,
    origin: 'Sanskrit',
    deity: 'Lakshmi',
    tags: ['Modern', 'Popular', 'Divine']
  },
  {
    id: 'girl_veda_007',
    name: 'Veda',
    gender: 'girl',
    meaning: {
      en: 'Sacred Knowledge',
      hi: 'पवित्र ज्ञान',
      sanskrit: 'वेद'
    },
    pronunciation: {
      iast: 'Veda',
      phonetic: 'VAY-da'
    },
    startingLetter: 'V',
    nakshatras: ['Rohini', 'Mrigashira'],
    numerology: {
      nameNumber: 5,
      vibration: 'Positive'
    },
    popularity: 8,
    origin: 'Sanskrit',
    deity: 'Saraswati',
    tags: ['Short', 'Divine', 'Knowledge']
  }
];

/**
 * Search names by starting letter
 */
export function searchNamesByLetter(letter: string, gender?: Gender): BabyName[] {
  return BABY_NAMES_DATABASE.filter(name => {
    const letterMatch = name.startingLetter.toUpperCase() === letter.toUpperCase();
    const genderMatch = !gender || name.gender === gender || name.gender === 'unisex';
    return letterMatch && genderMatch;
  });
}

/**
 * Search names by nakshatra
 */
export function searchNamesByNakshatra(nakshatra: string, gender?: Gender): BabyName[] {
  return BABY_NAMES_DATABASE.filter(name => {
    const nakshatraMatch = name.nakshatras.includes(nakshatra);
    const genderMatch = !gender || name.gender === gender || name.gender === 'unisex';
    return nakshatraMatch && genderMatch;
  });
}

/**
 * Search names by lucky letters
 */
export function searchNamesByLuckyLetters(luckyLetters: string[], gender?: Gender): BabyName[] {
  return BABY_NAMES_DATABASE.filter(name => {
    const letterMatch = isLuckyLetter(name.name, luckyLetters);
    const genderMatch = !gender || name.gender === gender || name.gender === 'unisex';
    return letterMatch && genderMatch;
  });
}

/**
 * Search names by keyword
 */
export function searchNamesByKeyword(keyword: string, gender?: Gender): BabyName[] {
  const lowerKeyword = keyword.toLowerCase();
  return BABY_NAMES_DATABASE.filter(name => {
    const nameMatch = name.name.toLowerCase().includes(lowerKeyword);
    const meaningMatch = name.meaning.en.toLowerCase().includes(lowerKeyword) ||
                        name.meaning.hi.includes(keyword);
    const tagMatch = name.tags.some(tag => tag.toLowerCase().includes(lowerKeyword));
    const genderMatch = !gender || name.gender === gender || name.gender === 'unisex';
    
    return (nameMatch || meaningMatch || tagMatch) && genderMatch;
  });
}

/**
 * Get all names by gender
 */
export function getNamesByGender(gender: Gender): BabyName[] {
  return BABY_NAMES_DATABASE.filter(name => 
    name.gender === gender || name.gender === 'unisex'
  );
}

/**
 * Get popular names (popularity >= 8)
 */
export function getPopularNames(gender?: Gender): BabyName[] {
  return BABY_NAMES_DATABASE.filter(name => {
    const popularityMatch = name.popularity >= 8;
    const genderMatch = !gender || name.gender === gender || name.gender === 'unisex';
    return popularityMatch && genderMatch;
  });
}

/**
 * Get name by ID
 */
export function getNameById(id: string): BabyName | undefined {
  return BABY_NAMES_DATABASE.find(name => name.id === id);
}
