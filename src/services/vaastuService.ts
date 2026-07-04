/**
 * Vaastu Service - Ancient Indian Science of Architecture
 * Week 18: Vaastu Assessment - Monday Implementation
 * Core Vaastu principles, direction analysis, and room placement guidelines
 */

export type Direction = 'North' | 'South' | 'East' | 'West' | 'NorthEast' | 'NorthWest' | 'SouthEast' | 'SouthWest';
export type Element = 'Earth' | 'Water' | 'Fire' | 'Air' | 'Space';
export type RoomType = 'Bedroom' | 'Kitchen' | 'Bathroom' | 'Living Room' | 'Pooja Room' | 'Study Room' | 'Dining Room' | 'Store Room' | 'Entrance';

export interface DirectionInfo {
  direction: Direction;
  element: Element;
  planet: string;
  deity: string;
  color: string[];
  significance: {
    en: string;
    hi: string;
  };
  idealRooms: RoomType[];
  avoidRooms: RoomType[];
  benefits: {
    en: string[];
    hi: string[];
  };
  doshaEffects: {
    en: string[];
    hi: string[];
  };
}

export interface RoomPlacement {
  roomType: RoomType;
  direction: Direction;
  isIdeal: boolean;
  score: number;
  recommendations: {
    en: string[];
    hi: string[];
  };
}

/**
 * Comprehensive Vaastu Direction Database
 * Based on traditional Vaastu Shastra principles
 */
export const VAASTU_DIRECTIONS: Record<Direction, DirectionInfo> = {
  'North': {
    direction: 'North',
    element: 'Water',
    planet: 'Mercury',
    deity: 'Kubera (God of Wealth)',
    color: ['Green', 'Blue', 'White'],
    significance: {
      en: 'Direction of wealth, prosperity, and career growth',
      hi: 'धन, समृद्धि और करियर वृद्धि की दिशा'
    },
    idealRooms: ['Living Room', 'Study Room', 'Entrance'],
    avoidRooms: ['Kitchen', 'Bathroom'],
    benefits: {
      en: ['Financial prosperity', 'Career advancement', 'Business growth', 'Mental clarity'],
      hi: ['आर्थिक समृद्धि', 'करियर उन्नति', 'व्यापार वृद्धि', 'मानसिक स्पष्टता']
    },
    doshaEffects: {
      en: ['Financial losses', 'Career obstacles', 'Mental stress', 'Business failures'],
      hi: ['आर्थिक नुकसान', 'करियर बाधाएं', 'मानसिक तनाव', 'व्यापार विफलता']
    }
  },

  'South': {
    direction: 'South',
    element: 'Fire',
    planet: 'Mars',
    deity: 'Yama (God of Death)',
    color: ['Red', 'Orange', 'Brown'],
    significance: {
      en: 'Direction of strength, stability, and protection',
      hi: 'शक्ति, स्थिरता और सुरक्षा की दिशा'
    },
    idealRooms: ['Bedroom', 'Store Room'],
    avoidRooms: ['Entrance', 'Pooja Room'],
    benefits: {
      en: ['Physical strength', 'Stability', 'Protection', 'Longevity'],
      hi: ['शारीरिक शक्ति', 'स्थिरता', 'सुरक्षा', 'दीर्घायु']
    },
    doshaEffects: {
      en: ['Health issues', 'Instability', 'Legal problems', 'Accidents'],
      hi: ['स्वास्थ्य समस्याएं', 'अस्थिरता', 'कानूनी समस्याएं', 'दुर्घटनाएं']
    }
  },

  'East': {
    direction: 'East',
    element: 'Air',
    planet: 'Sun',
    deity: 'Indra (King of Gods)',
    color: ['White', 'Light Blue', 'Cream'],
    significance: {
      en: 'Direction of health, vitality, and new beginnings',
      hi: 'स्वास्थ्य, जीवन शक्ति और नई शुरुआत की दिशा'
    },
    idealRooms: ['Pooja Room', 'Living Room', 'Entrance', 'Bathroom'],
    avoidRooms: ['Kitchen', 'Store Room'],
    benefits: {
      en: ['Good health', 'Vitality', 'Success', 'Positive energy'],
      hi: ['अच्छा स्वास्थ्य', 'जीवन शक्ति', 'सफलता', 'सकारात्मक ऊर्जा']
    },
    doshaEffects: {
      en: ['Health problems', 'Lack of energy', 'Obstacles', 'Depression'],
      hi: ['स्वास्थ्य समस्याएं', 'ऊर्जा की कमी', 'बाधाएं', 'अवसाद']
    }
  },

  'West': {
    direction: 'West',
    element: 'Space',
    planet: 'Saturn',
    deity: 'Varuna (God of Water)',
    color: ['White', 'Silver', 'Grey'],
    significance: {
      en: 'Direction of gains, profits, and social connections',
      hi: 'लाभ, मुनाफा और सामाजिक संबंधों की दिशा'
    },
    idealRooms: ['Dining Room', 'Study Room', 'Bedroom'],
    avoidRooms: ['Entrance', 'Pooja Room'],
    benefits: {
      en: ['Financial gains', 'Social status', 'Fame', 'Relationships'],
      hi: ['आर्थिक लाभ', 'सामाजिक स्थिति', 'प्रसिद्धि', 'संबंध']
    },
    doshaEffects: {
      en: ['Financial instability', 'Social problems', 'Relationship issues'],
      hi: ['आर्थिक अस्थिरता', 'सामाजिक समस्याएं', 'संबंध मुद्दे']
    }
  },

  'NorthEast': {
    direction: 'NorthEast',
    element: 'Water',
    planet: 'Jupiter',
    deity: 'Shiva (Supreme God)',
    color: ['Yellow', 'White', 'Light Blue'],
    significance: {
      en: 'Most auspicious direction - spiritual growth and divine blessings',
      hi: 'सबसे शुभ दिशा - आध्यात्मिक विकास और दिव्य आशीर्वाद'
    },
    idealRooms: ['Pooja Room', 'Entrance', 'Bathroom'],
    avoidRooms: ['Kitchen', 'Bedroom', 'Store Room'],
    benefits: {
      en: ['Spiritual growth', 'Divine blessings', 'Peace', 'Prosperity', 'Wisdom'],
      hi: ['आध्यात्मिक विकास', 'दिव्य आशीर्वाद', 'शांति', 'समृद्धि', 'ज्ञान']
    },
    doshaEffects: {
      en: ['Spiritual obstacles', 'Mental confusion', 'Health issues', 'Financial problems'],
      hi: ['आध्यात्मिक बाधाएं', 'मानसिक भ्रम', 'स्वास्थ्य समस्याएं', 'आर्थिक समस्याएं']
    }
  },

  'NorthWest': {
    direction: 'NorthWest',
    element: 'Air',
    planet: 'Moon',
    deity: 'Vayu (God of Wind)',
    color: ['White', 'Cream', 'Light Grey'],
    significance: {
      en: 'Direction of movement, change, and relationships',
      hi: 'गति, परिवर्तन और संबंधों की दिशा'
    },
    idealRooms: ['Bedroom', 'Bathroom', 'Store Room'],
    avoidRooms: ['Pooja Room', 'Kitchen'],
    benefits: {
      en: ['Good relationships', 'Business partnerships', 'Travel opportunities'],
      hi: ['अच्छे संबंध', 'व्यापारिक साझेदारी', 'यात्रा के अवसर']
    },
    doshaEffects: {
      en: ['Relationship problems', 'Instability', 'Mental stress', 'Travel issues'],
      hi: ['संबंध समस्याएं', 'अस्थिरता', 'मानसिक तनाव', 'यात्रा समस्याएं']
    }
  },

  'SouthEast': {
    direction: 'SouthEast',
    element: 'Fire',
    planet: 'Venus',
    deity: 'Agni (God of Fire)',
    color: ['Red', 'Orange', 'Pink'],
    significance: {
      en: 'Direction of fire element - ideal for kitchen and energy',
      hi: 'अग्नि तत्व की दिशा - रसोई और ऊर्जा के लिए आदर्श'
    },
    idealRooms: ['Kitchen', 'Dining Room'],
    avoidRooms: ['Pooja Room', 'Bedroom', 'Entrance'],
    benefits: {
      en: ['Good health', 'Energy', 'Digestive health', 'Prosperity'],
      hi: ['अच्छा स्वास्थ्य', 'ऊर्जा', 'पाचन स्वास्थ्य', 'समृद्धि']
    },
    doshaEffects: {
      en: ['Health problems', 'Digestive issues', 'Anger', 'Conflicts'],
      hi: ['स्वास्थ्य समस्याएं', 'पाचन समस्याएं', 'क्रोध', 'संघर्ष']
    }
  },

  'SouthWest': {
    direction: 'SouthWest',
    element: 'Earth',
    planet: 'Rahu',
    deity: 'Nairutya (Demon)',
    color: ['Brown', 'Yellow', 'Beige'],
    significance: {
      en: 'Direction of stability, strength, and master bedroom',
      hi: 'स्थिरता, शक्ति और मुख्य शयनकक्ष की दिशा'
    },
    idealRooms: ['Bedroom', 'Store Room'],
    avoidRooms: ['Entrance', 'Pooja Room', 'Kitchen'],
    benefits: {
      en: ['Stability', 'Strength', 'Longevity', 'Authority'],
      hi: ['स्थिरता', 'शक्ति', 'दीर्घायु', 'अधिकार']
    },
    doshaEffects: {
      en: ['Instability', 'Health issues', 'Relationship problems', 'Financial losses'],
      hi: ['अस्थिरता', 'स्वास्थ्य समस्याएं', 'संबंध समस्याएं', 'आर्थिक नुकसान']
    }
  }
};

/**
 * Room Placement Guidelines
 */
export const ROOM_PLACEMENT_GUIDELINES: Record<RoomType, {
  idealDirections: Direction[];
  avoidDirections: Direction[];
  guidelines: {
    en: string[];
    hi: string[];
  };
}> = {
  'Bedroom': {
    idealDirections: ['South', 'SouthWest', 'West', 'NorthWest'],
    avoidDirections: ['NorthEast', 'SouthEast'],
    guidelines: {
      en: [
        'Master bedroom should be in Southwest for stability',
        'Bed should be placed with head towards South or East',
        'Avoid mirrors facing the bed',
        'Keep bedroom clutter-free for positive energy'
      ],
      hi: [
        'मुख्य शयनकक्ष स्थिरता के लिए दक्षिण-पश्चिम में होना चाहिए',
        'बिस्तर सिर दक्षिण या पूर्व की ओर रखना चाहिए',
        'बिस्तर के सामने दर्पण से बचें',
        'सकारात्मक ऊर्जा के लिए शयनकक्ष को अव्यवस्था मुक्त रखें'
      ]
    }
  },

  'Kitchen': {
    idealDirections: ['SouthEast', 'NorthWest'],
    avoidDirections: ['North', 'NorthEast', 'SouthWest'],
    guidelines: {
      en: [
        'Kitchen should be in Southeast (Agni corner)',
        'Cooking should be done facing East',
        'Sink should be in Northeast corner',
        'Gas stove and sink should not be adjacent'
      ],
      hi: [
        'रसोई दक्षिण-पूर्व (अग्नि कोण) में होनी चाहिए',
        'खाना बनाते समय पूर्व की ओर मुंह होना चाहिए',
        'सिंक उत्तर-पूर्व कोने में होना चाहिए',
        'गैस स्टोव और सिंक आसन्न नहीं होने चाहिए'
      ]
    }
  },

  'Bathroom': {
    idealDirections: ['East', 'NorthEast', 'NorthWest'],
    avoidDirections: ['South', 'SouthWest', 'SouthEast'],
    guidelines: {
      en: [
        'Bathroom can be in East or Northwest',
        'Toilet seat should face North or South',
        'Keep bathroom door closed always',
        'Ensure proper ventilation and drainage'
      ],
      hi: [
        'बाथरूम पूर्व या उत्तर-पश्चिम में हो सकता है',
        'शौचालय सीट उत्तर या दक्षिण की ओर होनी चाहिए',
        'बाथरूम का दरवाजा हमेशा बंद रखें',
        'उचित वेंटिलेशन और जल निकासी सुनिश्चित करें'
      ]
    }
  },

  'Living Room': {
    idealDirections: ['North', 'East', 'NorthEast'],
    avoidDirections: ['South', 'SouthWest'],
    guidelines: {
      en: [
        'Living room should be in North or East',
        'Furniture should be placed in South or West',
        'Keep Northeast corner light and clutter-free',
        'Use light colors for positive energy'
      ],
      hi: [
        'लिविंग रूम उत्तर या पूर्व में होना चाहिए',
        'फर्नीचर दक्षिण या पश्चिम में रखा जाना चाहिए',
        'उत्तर-पूर्व कोने को हल्का और अव्यवस्था मुक्त रखें',
        'सकारात्मक ऊर्जा के लिए हल्के रंगों का उपयोग करें'
      ]
    }
  },

  'Pooja Room': {
    idealDirections: ['NorthEast', 'East', 'North'],
    avoidDirections: ['South', 'SouthWest', 'SouthEast'],
    guidelines: {
      en: [
        'Pooja room should be in Northeast (most auspicious)',
        'Face East or North while praying',
        'Keep the area clean and sacred',
        'Use yellow or white colors'
      ],
      hi: [
        'पूजा कक्ष उत्तर-पूर्व में होना चाहिए (सबसे शुभ)',
        'प्रार्थना करते समय पूर्व या उत्तर की ओर मुंह करें',
        'क्षेत्र को स्वच्छ और पवित्र रखें',
        'पीले या सफेद रंगों का उपयोग करें'
      ]
    }
  },

  'Study Room': {
    idealDirections: ['North', 'East', 'West'],
    avoidDirections: ['South', 'SouthWest'],
    guidelines: {
      en: [
        'Study room should be in North or East',
        'Study table should face East or North',
        'Keep books in Southwest corner',
        'Ensure good lighting and ventilation'
      ],
      hi: [
        'अध्ययन कक्ष उत्तर या पूर्व में होना चाहिए',
        'अध्ययन टेबल पूर्व या उत्तर की ओर होनी चाहिए',
        'किताबें दक्षिण-पश्चिम कोने में रखें',
        'अच्छी रोशनी और वेंटिलेशन सुनिश्चित करें'
      ]
    }
  },

  'Dining Room': {
    idealDirections: ['West', 'East', 'SouthEast'],
    avoidDirections: ['SouthWest'],
    guidelines: {
      en: [
        'Dining room can be in West or East',
        'Dining table should not be attached to wall',
        'Face East while eating',
        'Keep the area clean and well-lit'
      ],
      hi: [
        'भोजन कक्ष पश्चिम या पूर्व में हो सकता है',
        'भोजन टेबल दीवार से जुड़ी नहीं होनी चाहिए',
        'खाते समय पूर्व की ओर मुंह करें',
        'क्षेत्र को स्वच्छ और अच्छी तरह से रोशन रखें'
      ]
    }
  },

  'Store Room': {
    idealDirections: ['South', 'SouthWest', 'West'],
    avoidDirections: ['NorthEast', 'North'],
    guidelines: {
      en: [
        'Store room should be in Southwest',
        'Heavy items should be stored in South or West',
        'Keep Northeast area light',
        'Organize items properly'
      ],
      hi: [
        'स्टोर रूम दक्षिण-पश्चिम में होना चाहिए',
        'भारी वस्तुएं दक्षिण या पश्चिम में संग्रहीत होनी चाहिए',
        'उत्तर-पूर्व क्षेत्र को हल्का रखें',
        'वस्तुओं को ठीक से व्यवस्थित करें'
      ]
    }
  },

  'Entrance': {
    idealDirections: ['North', 'East', 'NorthEast'],
    avoidDirections: ['South', 'SouthWest'],
    guidelines: {
      en: [
        'Main entrance should be in North or East',
        'Door should open inward clockwise',
        'Keep entrance well-lit and clean',
        'Place auspicious symbols at entrance'
      ],
      hi: [
        'मुख्य प्रवेश द्वार उत्तर या पूर्व में होना चाहिए',
        'दरवाजा अंदर की ओर दक्षिणावर्त खुलना चाहिए',
        'प्रवेश द्वार को अच्छी तरह से रोशन और स्वच्छ रखें',
        'प्रवेश द्वार पर शुभ प्रतीक रखें'
      ]
    }
  }
};

/**
 * Analyze room placement and calculate score
 */
export function analyzeRoomPlacement(
  roomType: RoomType,
  direction: Direction
): RoomPlacement {
  const guidelines = ROOM_PLACEMENT_GUIDELINES[roomType];
  const directionInfo = VAASTU_DIRECTIONS[direction];
  
  const isIdeal = guidelines.idealDirections.includes(direction);
  const isAvoid = guidelines.avoidDirections.includes(direction);
  
  // Calculate score (0-100)
  let score = 50; // Base score
  if (isIdeal) score = 90;
  else if (isAvoid) score = 30;
  else score = 60; // Neutral
  
  // Generate recommendations
  const recommendations = {
    en: [],
    hi: []
  };
  
  if (isIdeal) {
    recommendations.en.push(`Excellent placement! ${roomType} in ${direction} is ideal.`);
    recommendations.hi.push(`उत्कृष्ट स्थान! ${direction} में ${roomType} आदर्श है।`);
    recommendations.en.push(...guidelines.guidelines.en);
    recommendations.hi.push(...guidelines.guidelines.hi);
  } else if (isAvoid) {
    recommendations.en.push(`Warning: ${roomType} in ${direction} is not recommended.`);
    recommendations.hi.push(`चेतावनी: ${direction} में ${roomType} अनुशंसित नहीं है।`);
    recommendations.en.push('Consider relocating or applying remedies.');
    recommendations.hi.push('स्थानांतरण या उपाय लागू करने पर विचार करें।');
  } else {
    recommendations.en.push(`${roomType} in ${direction} is acceptable.`);
    recommendations.hi.push(`${direction} में ${roomType} स्वीकार्य है।`);
    recommendations.en.push(...guidelines.guidelines.en.slice(0, 2));
    recommendations.hi.push(...guidelines.guidelines.hi.slice(0, 2));
  }
  
  return {
    roomType,
    direction,
    isIdeal,
    score,
    recommendations
  };
}

/**
 * Calculate overall Vaastu score
 */
export function calculateOverallVaastuScore(
  roomPlacements: RoomPlacement[]
): number {
  if (roomPlacements.length === 0) return 50;
  
  const totalScore = roomPlacements.reduce((sum, room) => sum + room.score, 0);
  return Math.round(totalScore / roomPlacements.length);
}

export default {
  VAASTU_DIRECTIONS,
  ROOM_PLACEMENT_GUIDELINES,
  analyzeRoomPlacement,
  calculateOverallVaastuScore
};