/**
 * Panchang Service - Five Limbs of Hindu Calendar
 * Week 19: Muhurat Calculations - Monday Implementation
 * Core Panchang calculations: Tithi, Nakshatra, Yoga, Karana, Var
 */

export type TithiPaksha = 'Shukla' | 'Krishna';
export type TithiName = 'Pratipada' | 'Dwitiya' | 'Tritiya' | 'Chaturthi' | 'Panchami' | 
  'Shashthi' | 'Saptami' | 'Ashtami' | 'Navami' | 'Dashami' | 'Ekadashi' | 'Dwadashi' | 
  'Trayodashi' | 'Chaturdashi' | 'Purnima' | 'Amavasya';

export type NakshatraName = 'Ashwini' | 'Bharani' | 'Krittika' | 'Rohini' | 'Mrigashira' | 
  'Ardra' | 'Punarvasu' | 'Pushya' | 'Ashlesha' | 'Magha' | 'Purva Phalguni' | 'Uttara Phalguni' |
  'Hasta' | 'Chitra' | 'Swati' | 'Vishakha' | 'Anuradha' | 'Jyeshtha' | 'Mula' | 'Purva Ashadha' |
  'Uttara Ashadha' | 'Shravana' | 'Dhanishta' | 'Shatabhisha' | 'Purva Bhadrapada' | 
  'Uttara Bhadrapada' | 'Revati';

export type YogaName = 'Vishkambha' | 'Priti' | 'Ayushman' | 'Saubhagya' | 'Shobhana' | 
  'Atiganda' | 'Sukarma' | 'Dhriti' | 'Shula' | 'Ganda' | 'Vriddhi' | 'Dhruva' | 'Vyaghata' |
  'Harshana' | 'Vajra' | 'Siddhi' | 'Vyatipata' | 'Variyan' | 'Parigha' | 'Shiva' | 'Siddha' |
  'Sadhya' | 'Shubha' | 'Shukla' | 'Brahma' | 'Indra' | 'Vaidhriti';

export type KaranaName = 'Bava' | 'Balava' | 'Kaulava' | 'Taitila' | 'Garaja' | 'Vanija' | 
  'Vishti' | 'Shakuni' | 'Chatushpada' | 'Naga' | 'Kimstughna';

export type VarName = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface Tithi {
  number: number; // 1-30
  name: TithiName;
  paksha: TithiPaksha;
  deity: string;
  quality: 'auspicious' | 'neutral' | 'inauspicious';
  description: {
    en: string;
    hi: string;
  };
  suitableFor: {
    en: string[];
    hi: string[];
  };
  avoidFor: {
    en: string[];
    hi: string[];
  };
}

export interface Nakshatra {
  number: number; // 1-27
  name: NakshatraName;
  pada: number; // 1-4
  lord: string;
  deity: string;
  symbol: string;
  quality: 'auspicious' | 'neutral' | 'inauspicious';
  description: {
    en: string;
    hi: string;
  };
}

export interface Yoga {
  number: number; // 1-27
  name: YogaName;
  quality: 'auspicious' | 'neutral' | 'inauspicious';
  description: {
    en: string;
    hi: string;
  };
}

export interface Karana {
  number: number; // 1-11
  name: KaranaName;
  type: 'movable' | 'fixed';
  quality: 'auspicious' | 'neutral' | 'inauspicious';
  description: {
    en: string;
    hi: string;
  };
}

export interface Var {
  day: VarName;
  number: number; // 0-6 (Sunday = 0)
  planet: string;
  deity: string;
  color: string;
  quality: 'auspicious' | 'neutral' | 'inauspicious';
  description: {
    en: string;
    hi: string;
  };
}

export interface Panchang {
  date: Date;
  tithi: Tithi;
  nakshatra: Nakshatra;
  yoga: Yoga;
  karana: Karana;
  var: Var;
  sunrise: Date;
  sunset: Date;
  moonrise?: Date;
  moonset?: Date;
}

/**
 * Calculate Tithi from Moon-Sun longitude difference
 * Tithi = (Moon longitude - Sun longitude) / 12
 */
export function calculateTithi(moonLongitude: number, sunLongitude: number): Tithi {
  // Calculate difference
  let diff = moonLongitude - sunLongitude;
  if (diff < 0) diff += 360;
  
  // Each tithi is 12 degrees
  const tithiNumber = Math.floor(diff / 12) + 1;
  
  // Determine paksha (bright/dark fortnight)
  const paksha: TithiPaksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const tithiInPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;
  
  return getTithiDetails(tithiInPaksha, paksha);
}

/**
 * Calculate Nakshatra from Moon's longitude
 * Each nakshatra is 13°20' (800')
 */
export function calculateNakshatra(moonLongitude: number): Nakshatra {
  // Each nakshatra is 13.333... degrees
  const nakshatraNumber = Math.floor(moonLongitude / 13.333333333) + 1;
  
  // Calculate pada (quarter within nakshatra)
  const positionInNakshatra = moonLongitude % 13.333333333;
  const pada = Math.floor(positionInNakshatra / 3.333333333) + 1;
  
  return getNakshatraDetails(nakshatraNumber, pada);
}

/**
 * Calculate Yoga from Sun + Moon longitude
 * Yoga = (Sun longitude + Moon longitude) / 13.333...
 */
export function calculateYoga(sunLongitude: number, moonLongitude: number): Yoga {
  const sum = (sunLongitude + moonLongitude) % 360;
  const yogaNumber = Math.floor(sum / 13.333333333) + 1;
  
  return getYogaDetails(yogaNumber);
}

/**
 * Calculate Karana from Tithi
 * Each tithi has 2 karanas (60 karanas in lunar month)
 */
export function calculateKarana(tithiNumber: number, isFirstHalf: boolean): Karana {
  // 7 movable karanas repeat 8 times, 4 fixed karanas occur once
  const karanaPosition = (tithiNumber - 1) * 2 + (isFirstHalf ? 0 : 1);
  
  let karanaNumber: number;
  if (karanaPosition < 57) {
    // Movable karanas (Bava to Vishti)
    karanaNumber = (karanaPosition % 7) + 1;
  } else {
    // Fixed karanas (Shakuni, Chatushpada, Naga, Kimstughna)
    karanaNumber = karanaPosition - 57 + 8;
  }
  
  return getKaranaDetails(karanaNumber);
}

/**
 * Get Var (weekday) details
 */
export function getVarDetails(date: Date): Var {
  const dayNumber = date.getDay(); // 0 = Sunday
  const varNames: VarName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return VAR_DATABASE[varNames[dayNumber]];
}

/**
 * Calculate complete Panchang for a given date
 */
export function calculatePanchang(
  date: Date,
  latitude: number,
  longitude: number,
  moonLongitude: number,
  sunLongitude: number
): Panchang {
  const tithi = calculateTithi(moonLongitude, sunLongitude);
  const nakshatra = calculateNakshatra(moonLongitude);
  const yoga = calculateYoga(sunLongitude, moonLongitude);
  const karana = calculateKarana(tithi.number, true); // Simplified: using first half
  const var_ = getVarDetails(date);
  
  // Calculate sunrise/sunset (simplified - would use actual astronomical calculations)
  const sunrise = new Date(date);
  sunrise.setHours(6, 0, 0, 0);
  
  const sunset = new Date(date);
  sunset.setHours(18, 0, 0, 0);
  
  return {
    date,
    tithi,
    nakshatra,
    yoga,
    karana,
    var: var_,
    sunrise,
    sunset
  };
}


/**
 * Get Tithi details by number and paksha
 */
function getTithiDetails(tithiInPaksha: number, paksha: TithiPaksha): Tithi {
  const tithiNames: TithiName[] = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
    paksha === 'Shukla' ? 'Purnima' : 'Amavasya'
  ];
  
  const name = tithiNames[tithiInPaksha - 1];
  const number = paksha === 'Shukla' ? tithiInPaksha : tithiInPaksha + 15;
  
  // Get from database
  const key = `${paksha}_${name}`;
  return TITHI_DATABASE[key] || {
    number,
    name,
    paksha,
    deity: 'Various',
    quality: 'neutral',
    description: { en: name, hi: name },
    suitableFor: { en: [], hi: [] },
    avoidFor: { en: [], hi: [] }
  };
}

/**
 * Get Nakshatra details by number
 */
function getNakshatraDetails(number: number, pada: number): Nakshatra {
  const nakshatraNames: NakshatraName[] = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
    'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  
  const name = nakshatraNames[number - 1];
  return NAKSHATRA_DATABASE[name] || {
    number,
    name,
    pada,
    lord: 'Unknown',
    deity: 'Unknown',
    symbol: 'Unknown',
    quality: 'neutral',
    description: { en: name, hi: name }
  };
}

/**
 * Get Yoga details by number
 */
function getYogaDetails(number: number): Yoga {
  const yogaNames: YogaName[] = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
    'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata',
    'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha',
    'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
  ];
  
  const name = yogaNames[number - 1];
  return YOGA_DATABASE[name] || {
    number,
    name,
    quality: 'neutral',
    description: { en: name, hi: name }
  };
}

/**
 * Get Karana details by number
 */
function getKaranaDetails(number: number): Karana {
  const karanaNames: KaranaName[] = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
    'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
  ];
  
  const name = karanaNames[number - 1];
  const type = number <= 7 ? 'movable' : 'fixed';
  
  return KARANA_DATABASE[name] || {
    number,
    name,
    type,
    quality: 'neutral',
    description: { en: name, hi: name }
  };
}

/**
 * Tithi Database (Sample - First 5 tithis of each paksha)
 */
const TITHI_DATABASE: Record<string, Tithi> = {
  'Shukla_Pratipada': {
    number: 1,
    name: 'Pratipada',
    paksha: 'Shukla',
    deity: 'Agni',
    quality: 'auspicious',
    description: {
      en: 'First day of bright fortnight, new beginnings',
      hi: 'शुक्ल पक्ष का पहला दिन, नई शुरुआत'
    },
    suitableFor: {
      en: ['New ventures', 'Starting projects', 'Purchases'],
      hi: ['नए उद्यम', 'परियोजना शुरू करना', 'खरीदारी']
    },
    avoidFor: {
      en: ['Marriage', 'Travel'],
      hi: ['विवाह', 'यात्रा']
    }
  },
  'Shukla_Dwitiya': {
    number: 2,
    name: 'Dwitiya',
    paksha: 'Shukla',
    deity: 'Brahma',
    quality: 'auspicious',
    description: {
      en: 'Second day, good for all auspicious works',
      hi: 'दूसरा दिन, सभी शुभ कार्यों के लिए अच्छा'
    },
    suitableFor: {
      en: ['Marriage', 'Education', 'Business'],
      hi: ['विवाह', 'शिक्षा', 'व्यापार']
    },
    avoidFor: {
      en: [],
      hi: []
    }
  },
  'Shukla_Purnima': {
    number: 15,
    name: 'Purnima',
    paksha: 'Shukla',
    deity: 'Chandra',
    quality: 'auspicious',
    description: {
      en: 'Full moon day, highly auspicious',
      hi: 'पूर्णिमा, अत्यंत शुभ'
    },
    suitableFor: {
      en: ['Worship', 'Charity', 'Spiritual practices'],
      hi: ['पूजा', 'दान', 'आध्यात्मिक अभ्यास']
    },
    avoidFor: {
      en: [],
      hi: []
    }
  },
  'Krishna_Amavasya': {
    number: 30,
    name: 'Amavasya',
    paksha: 'Krishna',
    deity: 'Pitru',
    quality: 'inauspicious',
    description: {
      en: 'New moon day, for ancestor worship',
      hi: 'अमावस्या, पितृ पूजा के लिए'
    },
    suitableFor: {
      en: ['Ancestor worship', 'Meditation'],
      hi: ['पितृ पूजा', 'ध्यान']
    },
    avoidFor: {
      en: ['Marriage', 'New ventures', 'Travel'],
      hi: ['विवाह', 'नए उद्यम', 'यात्रा']
    }
  }
};

/**
 * Nakshatra Database (Sample - First 5 nakshatras)
 */
const NAKSHATRA_DATABASE: Record<string, Omit<Nakshatra, 'pada'>> = {
  'Ashwini': {
    number: 1,
    name: 'Ashwini',
    lord: 'Ketu',
    deity: 'Ashwini Kumaras',
    symbol: 'Horse head',
    quality: 'auspicious',
    description: {
      en: 'Swift, healing, new beginnings',
      hi: 'तीव्र, उपचार, नई शुरुआत'
    }
  },
  'Bharani': {
    number: 2,
    name: 'Bharani',
    lord: 'Venus',
    deity: 'Yama',
    symbol: 'Yoni',
    quality: 'neutral',
    description: {
      en: 'Nurturing, transformation',
      hi: 'पोषण, परिवर्तन'
    }
  },
  'Krittika': {
    number: 3,
    name: 'Krittika',
    lord: 'Sun',
    deity: 'Agni',
    symbol: 'Razor',
    quality: 'auspicious',
    description: {
      en: 'Sharp, purifying, cutting',
      hi: 'तीक्ष्ण, शुद्ध करने वाला'
    }
  },
  'Rohini': {
    number: 4,
    name: 'Rohini',
    lord: 'Moon',
    deity: 'Brahma',
    symbol: 'Cart',
    quality: 'auspicious',
    description: {
      en: 'Growth, beauty, fertility',
      hi: 'वृद्धि, सुंदरता, उर्वरता'
    }
  },
  'Pushya': {
    number: 8,
    name: 'Pushya',
    lord: 'Saturn',
    deity: 'Brihaspati',
    symbol: 'Cow udder',
    quality: 'auspicious',
    description: {
      en: 'Nourishment, most auspicious',
      hi: 'पोषण, सबसे शुभ'
    }
  }
};

/**
 * Yoga Database (Sample - First 5 yogas)
 */
const YOGA_DATABASE: Record<string, Yoga> = {
  'Vishkambha': {
    number: 1,
    name: 'Vishkambha',
    quality: 'inauspicious',
    description: {
      en: 'Obstacles, avoid important work',
      hi: 'बाधाएं, महत्वपूर्ण कार्य से बचें'
    }
  },
  'Priti': {
    number: 2,
    name: 'Priti',
    quality: 'auspicious',
    description: {
      en: 'Love, affection, good for relationships',
      hi: 'प्रेम, स्नेह, संबंधों के लिए अच्छा'
    }
  },
  'Ayushman': {
    number: 3,
    name: 'Ayushman',
    quality: 'auspicious',
    description: {
      en: 'Longevity, health, prosperity',
      hi: 'दीर्घायु, स्वास्थ्य, समृद्धि'
    }
  },
  'Siddhi': {
    number: 16,
    name: 'Siddhi',
    quality: 'auspicious',
    description: {
      en: 'Success, achievement, perfection',
      hi: 'सफलता, उपलब्धि, पूर्णता'
    }
  },
  'Vyatipata': {
    number: 17,
    name: 'Vyatipata',
    quality: 'inauspicious',
    description: {
      en: 'Calamity, avoid all important work',
      hi: 'विपत्ति, सभी महत्वपूर्ण कार्यों से बचें'
    }
  }
};

/**
 * Karana Database
 */
const KARANA_DATABASE: Record<string, Karana> = {
  'Bava': {
    number: 1,
    name: 'Bava',
    type: 'movable',
    quality: 'auspicious',
    description: {
      en: 'Good for all auspicious works',
      hi: 'सभी शुभ कार्यों के लिए अच्छा'
    }
  },
  'Vishti': {
    number: 7,
    name: 'Vishti',
    type: 'movable',
    quality: 'inauspicious',
    description: {
      en: 'Bhadra, avoid important work',
      hi: 'भद्रा, महत्वपूर्ण कार्य से बचें'
    }
  }
};

/**
 * Var (Weekday) Database
 */
const VAR_DATABASE: Record<VarName, Var> = {
  'Sunday': {
    day: 'Sunday',
    number: 0,
    planet: 'Sun',
    deity: 'Surya',
    color: 'Red',
    quality: 'auspicious',
    description: {
      en: 'Day of Sun, good for authority and government work',
      hi: 'सूर्य का दिन, अधिकार और सरकारी कार्य के लिए अच्छा'
    }
  },
  'Monday': {
    day: 'Monday',
    number: 1,
    planet: 'Moon',
    deity: 'Chandra',
    color: 'White',
    quality: 'auspicious',
    description: {
      en: 'Day of Moon, good for emotions and creativity',
      hi: 'चंद्रमा का दिन, भावनाओं और रचनात्मकता के लिए अच्छा'
    }
  },
  'Tuesday': {
    day: 'Tuesday',
    number: 2,
    planet: 'Mars',
    deity: 'Mangal',
    color: 'Red',
    quality: 'neutral',
    description: {
      en: 'Day of Mars, good for courage and action',
      hi: 'मंगल का दिन, साहस और कार्य के लिए अच्छा'
    }
  },
  'Wednesday': {
    day: 'Wednesday',
    number: 3,
    planet: 'Mercury',
    deity: 'Budha',
    color: 'Green',
    quality: 'auspicious',
    description: {
      en: 'Day of Mercury, good for business and communication',
      hi: 'बुध का दिन, व्यापार और संचार के लिए अच्छा'
    }
  },
  'Thursday': {
    day: 'Thursday',
    number: 4,
    planet: 'Jupiter',
    deity: 'Guru',
    color: 'Yellow',
    quality: 'auspicious',
    description: {
      en: 'Day of Jupiter, most auspicious for all works',
      hi: 'गुरु का दिन, सभी कार्यों के लिए सबसे शुभ'
    }
  },
  'Friday': {
    day: 'Friday',
    number: 5,
    planet: 'Venus',
    deity: 'Shukra',
    color: 'White',
    quality: 'auspicious',
    description: {
      en: 'Day of Venus, good for love and luxury',
      hi: 'शुक्र का दिन, प्रेम और विलासिता के लिए अच्छा'
    }
  },
  'Saturday': {
    day: 'Saturday',
    number: 6,
    planet: 'Saturn',
    deity: 'Shani',
    color: 'Black',
    quality: 'inauspicious',
    description: {
      en: 'Day of Saturn, avoid new beginnings',
      hi: 'शनि का दिन, नई शुरुआत से बचें'
    }
  }
};

export default {
  calculateTithi,
  calculateNakshatra,
  calculateYoga,
  calculateKarana,
  getVarDetails,
  calculatePanchang,
  TITHI_DATABASE,
  NAKSHATRA_DATABASE,
  YOGA_DATABASE,
  KARANA_DATABASE,
  VAR_DATABASE
};
