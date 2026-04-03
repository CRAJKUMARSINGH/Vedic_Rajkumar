/**
 * Vaastu Dosha Service - Dosha Identification System
 * Week 18: Vaastu Assessment - Tuesday Implementation
 * Comprehensive dosha detection with severity calculation
 */

import type { Direction, RoomType, RoomPlacement } from './vaastuService';

export type DoshaSeverity = 'low' | 'medium' | 'high';

export interface VaastuDosha {
  id: string;
  type: string;
  severity: DoshaSeverity;
  location: string;
  direction: Direction;
  effects: {
    en: string[];
    hi: string[];
  };
  remedyIds: string[];
}

export interface VaastuAssessment {
  overallScore: number;
  doshas: VaastuDosha[];
  strengths: {
    en: string[];
    hi: string[];
  };
  weaknesses: {
    en: string[];
    hi: string[];
  };
  criticalDoshas: VaastuDosha[];
}

/**
 * Comprehensive Vaastu Dosha Database
 * 20+ common Vaastu doshas with identification rules
 */
export const VAASTU_DOSHA_TYPES = {
  // Entrance Doshas
  SOUTH_ENTRANCE: {
    id: 'south_entrance',
    name: {
      en: 'South Entrance Dosha',
      hi: 'दक्षिण प्रवेश दोष'
    },
    severity: 'high' as DoshaSeverity,
    effects: {
      en: ['Financial losses', 'Health problems', 'Career obstacles', 'Family conflicts'],
      hi: ['आर्थिक नुकसान', 'स्वास्थ्य समस्याएं', 'करियर बाधाएं', 'पारिवारिक संघर्ष']
    },
    remedyIds: ['entrance_remedy_1', 'entrance_remedy_2']
  },

  SOUTHWEST_ENTRANCE: {
    id: 'southwest_entrance',
    name: {
      en: 'Southwest Entrance Dosha',
      hi: 'दक्षिण-पश्चिम प्रवेश दोष'
    },
    severity: 'high' as DoshaSeverity,
    effects: {
      en: ['Instability', 'Relationship problems', 'Mental stress', 'Authority issues'],
      hi: ['अस्थिरता', 'संबंध समस्याएं', 'मानसिक तनाव', 'अधिकार मुद्दे']
    },
    remedyIds: ['entrance_remedy_3', 'entrance_remedy_4']
  },

  // Kitchen Doshas
  NORTHEAST_KITCHEN: {
    id: 'northeast_kitchen',
    name: {
      en: 'Northeast Kitchen Dosha',
      hi: 'उत्तर-पूर्व रसोई दोष'
    },
    severity: 'high' as DoshaSeverity,
    effects: {
      en: ['Spiritual obstacles', 'Financial problems', 'Health issues', 'Mental confusion'],
      hi: ['आध्यात्मिक बाधाएं', 'आर्थिक समस्याएं', 'स्वास्थ्य समस्याएं', 'मानसिक भ्रम']
    },
    remedyIds: ['kitchen_remedy_1', 'kitchen_remedy_2']
  },

  NORTH_KITCHEN: {
    id: 'north_kitchen',
    name: {
      en: 'North Kitchen Dosha',
      hi: 'उत्तर रसोई दोष'
    },
    severity: 'medium' as DoshaSeverity,
    effects: {
      en: ['Financial instability', 'Career problems', 'Digestive issues'],
      hi: ['आर्थिक अस्थिरता', 'करियर समस्याएं', 'पाचन समस्याएं']
    },
    remedyIds: ['kitchen_remedy_3']
  },

  SOUTHWEST_KITCHEN: {
    id: 'southwest_kitchen',
    name: {
      en: 'Southwest Kitchen Dosha',
      hi: 'दक्षिण-पश्चिम रसोई दोष'
    },
    severity: 'medium' as DoshaSeverity,
    effects: {
      en: ['Health problems', 'Relationship issues', 'Anger problems'],
      hi: ['स्वास्थ्य समस्याएं', 'संबंध मुद्दे', 'क्रोध समस्याएं']
    },
    remedyIds: ['kitchen_remedy_4']
  },

  // Bedroom Doshas
  NORTHEAST_BEDROOM: {
    id: 'northeast_bedroom',
    name: {
      en: 'Northeast Bedroom Dosha',
      hi: 'उत्तर-पूर्व शयनकक्ष दोष'
    },
    severity: 'high' as DoshaSeverity,
    effects: {
      en: ['Sleep problems', 'Mental stress', 'Spiritual obstacles', 'Health issues'],
      hi: ['नींद की समस्याएं', 'मानसिक तनाव', 'आध्यात्मिक बाधाएं', 'स्वास्थ्य समस्याएं']
    },
    remedyIds: ['bedroom_remedy_1', 'bedroom_remedy_2']
  },

  SOUTHEAST_BEDROOM: {
    id: 'southeast_bedroom',
    name: {
      en: 'Southeast Bedroom Dosha',
      hi: 'दक्षिण-पूर्व शयनकक्ष दोष'
    },
    severity: 'medium' as DoshaSeverity,
    effects: {
      en: ['Anger issues', 'Relationship conflicts', 'Health problems'],
      hi: ['क्रोध मुद्दे', 'संबंध संघर्ष', 'स्वास्थ्य समस्याएं']
    },
    remedyIds: ['bedroom_remedy_3']
  },

  // Bathroom Doshas
  SOUTHWEST_BATHROOM: {
    id: 'southwest_bathroom',
    name: {
      en: 'Southwest Bathroom Dosha',
      hi: 'दक्षिण-पश्चिम बाथरूम दोष'
    },
    severity: 'high' as DoshaSeverity,
    effects: {
      en: ['Instability', 'Financial losses', 'Health problems', 'Authority issues'],
      hi: ['अस्थिरता', 'आर्थिक नुकसान', 'स्वास्थ्य समस्याएं', 'अधिकार मुद्दे']
    },
    remedyIds: ['bathroom_remedy_1', 'bathroom_remedy_2']
  },

  SOUTH_BATHROOM: {
    id: 'south_bathroom',
    name: {
      en: 'South Bathroom Dosha',
      hi: 'दक्षिण बाथरूम दोष'
    },
    severity: 'medium' as DoshaSeverity,
    effects: {
      en: ['Health issues', 'Energy drain', 'Relationship problems'],
      hi: ['स्वास्थ्य समस्याएं', 'ऊर्जा की कमी', 'संबंध समस्याएं']
    },
    remedyIds: ['bathroom_remedy_3']
  },

  SOUTHEAST_BATHROOM: {
    id: 'southeast_bathroom',
    name: {
      en: 'Southeast Bathroom Dosha',
      hi: 'दक्षिण-पूर्व बाथरूम दोष'
    },
    severity: 'medium' as DoshaSeverity,
    effects: {
      en: ['Digestive problems', 'Fire element imbalance', 'Health issues'],
      hi: ['पाचन समस्याएं', 'अग्नि तत्व असंतुलन', 'स्वास्थ्य समस्याएं']
    },
    remedyIds: ['bathroom_remedy_4']
  },

  // Pooja Room Doshas
  SOUTH_POOJA: {
    id: 'south_pooja',
    name: {
      en: 'South Pooja Room Dosha',
      hi: 'दक्षिण पूजा कक्ष दोष'
    },
    severity: 'high' as DoshaSeverity,
    effects: {
      en: ['Spiritual obstacles', 'Lack of peace', 'Mental confusion', 'Family conflicts'],
      hi: ['आध्यात्मिक बाधाएं', 'शांति की कमी', 'मानसिक भ्रम', 'पारिवारिक संघर्ष']
    },
    remedyIds: ['pooja_remedy_1', 'pooja_remedy_2']
  },

  SOUTHWEST_POOJA: {
    id: 'southwest_pooja',
    name: {
      en: 'Southwest Pooja Room Dosha',
      hi: 'दक्षिण-पश्चिम पूजा कक्ष दोष'
    },
    severity: 'medium' as DoshaSeverity,
    effects: {
      en: ['Spiritual progress blocked', 'Mental stress', 'Lack of divine blessings'],
      hi: ['आध्यात्मिक प्रगति अवरुद्ध', 'मानसिक तनाव', 'दिव्य आशीर्वाद की कमी']
    },
    remedyIds: ['pooja_remedy_3']
  },

  SOUTHEAST_POOJA: {
    id: 'southeast_pooja',
    name: {
      en: 'Southeast Pooja Room Dosha',
      hi: 'दक्षिण-पूर्व पूजा कक्ष दोष'
    },
    severity: 'high' as DoshaSeverity,
    effects: {
      en: ['Fire element conflict', 'Spiritual obstacles', 'Mental agitation'],
      hi: ['अग्नि तत्व संघर्ष', 'आध्यात्मिक बाधाएं', 'मानसिक उत्तेजना']
    },
    remedyIds: ['pooja_remedy_4']
  },

  // Store Room Doshas
  NORTHEAST_STOREROOM: {
    id: 'northeast_storeroom',
    name: {
      en: 'Northeast Store Room Dosha',
      hi: 'उत्तर-पूर्व स्टोर रूम दोष'
    },
    severity: 'high' as DoshaSeverity,
    effects: {
      en: ['Blocked prosperity', 'Spiritual obstacles', 'Financial problems', 'Mental confusion'],
      hi: ['समृद्धि अवरुद्ध', 'आध्यात्मिक बाधाएं', 'आर्थिक समस्याएं', 'मानसिक भ्रम']
    },
    remedyIds: ['storeroom_remedy_1', 'storeroom_remedy_2']
  },

  NORTH_STOREROOM: {
    id: 'north_storeroom',
    name: {
      en: 'North Store Room Dosha',
      hi: 'उत्तर स्टोर रूम दोष'
    },
    severity: 'medium' as DoshaSeverity,
    effects: {
      en: ['Financial blockages', 'Career obstacles', 'Wealth problems'],
      hi: ['आर्थिक रुकावटें', 'करियर बाधाएं', 'धन समस्याएं']
    },
    remedyIds: ['storeroom_remedy_3']
  },

  EAST_STOREROOM: {
    id: 'east_storeroom',
    name: {
      en: 'East Store Room Dosha',
      hi: 'पूर्व स्टोर रूम दोष'
    },
    severity: 'medium' as DoshaSeverity,
    effects: {
      en: ['Health problems', 'Energy blockages', 'Lack of vitality'],
      hi: ['स्वास्थ्य समस्याएं', 'ऊर्जा रुकावटें', 'जीवन शक्ति की कमी']
    },
    remedyIds: ['storeroom_remedy_4']
  },

  // Living Room Doshas
  SOUTH_LIVING: {
    id: 'south_living',
    name: {
      en: 'South Living Room Dosha',
      hi: 'दक्षिण लिविंग रूम दोष'
    },
    severity: 'low' as DoshaSeverity,
    effects: {
      en: ['Social problems', 'Guest discomfort', 'Energy imbalance'],
      hi: ['सामाजिक समस्याएं', 'अतिथि असुविधा', 'ऊर्जा असंतुलन']
    },
    remedyIds: ['living_remedy_1']
  },

  SOUTHWEST_LIVING: {
    id: 'southwest_living',
    name: {
      en: 'Southwest Living Room Dosha',
      hi: 'दक्षिण-पश्चिम लिविंग रूम दोष'
    },
    severity: 'low' as DoshaSeverity,
    effects: {
      en: ['Heavy atmosphere', 'Lack of social harmony', 'Guest issues'],
      hi: ['भारी वातावरण', 'सामाजिक सामंजस्य की कमी', 'अतिथि मुद्दे']
    },
    remedyIds: ['living_remedy_2']
  },

  // Study Room Doshas
  SOUTH_STUDY: {
    id: 'south_study',
    name: {
      en: 'South Study Room Dosha',
      hi: 'दक्षिण अध्ययन कक्ष दोष'
    },
    severity: 'medium' as DoshaSeverity,
    effects: {
      en: ['Concentration problems', 'Learning difficulties', 'Mental fatigue'],
      hi: ['एकाग्रता समस्याएं', 'सीखने में कठिनाई', 'मानसिक थकान']
    },
    remedyIds: ['study_remedy_1']
  },

  SOUTHWEST_STUDY: {
    id: 'southwest_study',
    name: {
      en: 'Southwest Study Room Dosha',
      hi: 'दक्षिण-पश्चिम अध्ययन कक्ष दोष'
    },
    severity: 'low' as DoshaSeverity,
    effects: {
      en: ['Slow learning', 'Memory issues', 'Academic challenges'],
      hi: ['धीमी सीख', 'स्मृति मुद्दे', 'शैक्षणिक चुनौतियां']
    },
    remedyIds: ['study_remedy_2']
  }
};

/**
 * Identify doshas based on room placements
 */
export function identifyDoshas(roomPlacements: RoomPlacement[]): VaastuDosha[] {
  const doshas: VaastuDosha[] = [];

  for (const placement of roomPlacements) {
    const { roomType, direction } = placement;

    // Check for entrance doshas
    if (roomType === 'Entrance') {
      if (direction === 'South') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTH_ENTRANCE, 'Entrance', direction));
      } else if (direction === 'SouthWest') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTHWEST_ENTRANCE, 'Entrance', direction));
      }
    }

    // Check for kitchen doshas
    if (roomType === 'Kitchen') {
      if (direction === 'NorthEast') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.NORTHEAST_KITCHEN, 'Kitchen', direction));
      } else if (direction === 'North') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.NORTH_KITCHEN, 'Kitchen', direction));
      } else if (direction === 'SouthWest') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTHWEST_KITCHEN, 'Kitchen', direction));
      }
    }

    // Check for bedroom doshas
    if (roomType === 'Bedroom') {
      if (direction === 'NorthEast') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.NORTHEAST_BEDROOM, 'Bedroom', direction));
      } else if (direction === 'SouthEast') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTHEAST_BEDROOM, 'Bedroom', direction));
      }
    }

    // Check for bathroom doshas
    if (roomType === 'Bathroom') {
      if (direction === 'SouthWest') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTHWEST_BATHROOM, 'Bathroom', direction));
      } else if (direction === 'South') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTH_BATHROOM, 'Bathroom', direction));
      } else if (direction === 'SouthEast') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTHEAST_BATHROOM, 'Bathroom', direction));
      }
    }

    // Check for pooja room doshas
    if (roomType === 'Pooja Room') {
      if (direction === 'South') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTH_POOJA, 'Pooja Room', direction));
      } else if (direction === 'SouthWest') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTHWEST_POOJA, 'Pooja Room', direction));
      } else if (direction === 'SouthEast') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTHEAST_POOJA, 'Pooja Room', direction));
      }
    }

    // Check for store room doshas
    if (roomType === 'Store Room') {
      if (direction === 'NorthEast') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.NORTHEAST_STOREROOM, 'Store Room', direction));
      } else if (direction === 'North') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.NORTH_STOREROOM, 'Store Room', direction));
      } else if (direction === 'East') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.EAST_STOREROOM, 'Store Room', direction));
      }
    }

    // Check for living room doshas
    if (roomType === 'Living Room') {
      if (direction === 'South') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTH_LIVING, 'Living Room', direction));
      } else if (direction === 'SouthWest') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTHWEST_LIVING, 'Living Room', direction));
      }
    }

    // Check for study room doshas
    if (roomType === 'Study Room') {
      if (direction === 'South') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTH_STUDY, 'Study Room', direction));
      } else if (direction === 'SouthWest') {
        doshas.push(createDosha(VAASTU_DOSHA_TYPES.SOUTHWEST_STUDY, 'Study Room', direction));
      }
    }
  }

  return doshas;
}

/**
 * Create dosha object from dosha type
 */
function createDosha(
  doshaType: typeof VAASTU_DOSHA_TYPES[keyof typeof VAASTU_DOSHA_TYPES],
  location: string,
  direction: Direction
): VaastuDosha {
  return {
    id: doshaType.id,
    type: doshaType.name.en,
    severity: doshaType.severity,
    location,
    direction,
    effects: doshaType.effects,
    remedyIds: doshaType.remedyIds
  };
}

/**
 * Calculate overall Vaastu assessment
 */
export function calculateVaastuAssessment(
  roomPlacements: RoomPlacement[]
): VaastuAssessment {
  const doshas = identifyDoshas(roomPlacements);
  
  // Calculate overall score
  let baseScore = 100;
  for (const dosha of doshas) {
    if (dosha.severity === 'high') baseScore -= 15;
    else if (dosha.severity === 'medium') baseScore -= 10;
    else baseScore -= 5;
  }
  const overallScore = Math.max(0, baseScore);

  // Identify critical doshas
  const criticalDoshas = doshas.filter(d => d.severity === 'high');

  // Identify strengths
  const strengths = {
    en: [] as string[],
    hi: [] as string[]
  };
  
  const idealPlacements = roomPlacements.filter(p => p.isIdeal);
  if (idealPlacements.length > 0) {
    strengths.en.push(`${idealPlacements.length} rooms are ideally placed`);
    strengths.hi.push(`${idealPlacements.length} कमरे आदर्श रूप से रखे गए हैं`);
  }
  
  if (doshas.length === 0) {
    strengths.en.push('No major Vaastu doshas detected');
    strengths.hi.push('कोई प्रमुख वास्तु दोष नहीं पाया गया');
  }

  // Identify weaknesses
  const weaknesses = {
    en: [] as string[],
    hi: [] as string[]
  };
  
  if (criticalDoshas.length > 0) {
    weaknesses.en.push(`${criticalDoshas.length} critical doshas need immediate attention`);
    weaknesses.hi.push(`${criticalDoshas.length} गंभीर दोषों पर तुरंत ध्यान देने की आवश्यकता है`);
  }
  
  const poorPlacements = roomPlacements.filter(p => p.score < 50);
  if (poorPlacements.length > 0) {
    weaknesses.en.push(`${poorPlacements.length} rooms have poor placement`);
    weaknesses.hi.push(`${poorPlacements.length} कमरों की स्थिति खराब है`);
  }

  return {
    overallScore,
    doshas,
    strengths,
    weaknesses,
    criticalDoshas
  };
}

export default {
  VAASTU_DOSHA_TYPES,
  identifyDoshas,
  calculateVaastuAssessment
};
