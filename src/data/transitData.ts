// Vedic astrology transit data enriched from VedicScholar-style analysis
// Data sourced from Phaladeepika, Brihat Parashara Hora Shastra

export const RASHIS = [
  { en: "Aries", hi: "मेष", symbol: "♈" },
  { en: "Taurus", hi: "वृषभ", symbol: "♉" },
  { en: "Gemini", hi: "मिथुन", symbol: "♊" },
  { en: "Cancer", hi: "कर्क", symbol: "♋" },
  { en: "Leo", hi: "सिंह", symbol: "♌" },
  { en: "Virgo", hi: "कन्या", symbol: "♍" },
  { en: "Libra", hi: "तुला", symbol: "♎" },
  { en: "Scorpio", hi: "वृश्चिक", symbol: "♏" },
  { en: "Sagittarius", hi: "धनु", symbol: "♐" },
  { en: "Capricorn", hi: "मकर", symbol: "♑" },
  { en: "Aquarius", hi: "कुम्भ", symbol: "♒" },
  { en: "Pisces", hi: "मीन", symbol: "♓" },
];

export interface PlanetInfo {
  en: string;
  hi: string;
  symbol: string;
  favorableHouses: number[];
}

export const PLANETS: PlanetInfo[] = [
  { en: "Sun", hi: "सूर्य", symbol: "☉", favorableHouses: [3, 6, 10, 11] },
  { en: "Moon", hi: "चन्द्र", symbol: "☽", favorableHouses: [1, 3, 6, 7, 10, 11] },
  { en: "Mercury", hi: "बुध", symbol: "☿", favorableHouses: [2, 4, 6, 8, 10, 11] },
  { en: "Venus", hi: "शुक्र", symbol: "♀", favorableHouses: [1, 2, 3, 4, 5, 8, 9, 11, 12] },
  { en: "Mars", hi: "मंगल", symbol: "♂", favorableHouses: [3, 6, 11] },
  { en: "Jupiter", hi: "गुरु", symbol: "♃", favorableHouses: [2, 5, 7, 9, 11] },
  { en: "Saturn", hi: "शनि", symbol: "♄", favorableHouses: [3, 6, 11] },
  { en: "Rahu", hi: "राहु", symbol: "☊", favorableHouses: [3, 6, 10, 11] },
  { en: "Ketu", hi: "केतु", symbol: "☋", favorableHouses: [3, 6, 11] },
];

// Vedha pairs: planet favorable house -> vedha obstruction house
export const VEDHA_PAIRS: Record<string, Record<number, number>> = {
  Sun:     { 3: 9, 6: 12, 10: 4, 11: 5 },
  Moon:    { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  Mercury: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 7, 11: 12 },
  Venus:   { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 6, 12: 3 },
  Mars:    { 3: 12, 6: 9, 11: 5 },
  Jupiter: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  Saturn:  { 3: 12, 6: 9, 11: 5 },
  Rahu:    { 3: 12, 6: 9, 10: 4, 11: 5 },
  Ketu:    { 3: 12, 6: 9, 11: 5 },
};

export interface TransitResult {
  planet: PlanetInfo;
  currentRashi: number;
  houseFromMoon: number;
  baseFavorable: boolean;
  vedhaActive: boolean;
  vedhaNote: string;
  effectiveStatus: "favorable" | "unfavorable" | "mixed";
  scoreContribution: number;
  rating: number;
  effectEn: string;
  effectHi: string;
}

// Current sidereal planetary positions (~Feb 2026, Lahiri ayanamsa)
// In production, this would come from a Swiss Ephemeris API
export const CURRENT_POSITIONS: Record<string, number> = {
  Sun: 10,      // Aquarius (Kumbha)
  Moon: 0,      // Aries (Mesha) — fast moving, changes daily
  Mercury: 10,  // Aquarius
  Venus: 10,    // Aquarius
  Mars: 9,      // Capricorn (Makara)
  Jupiter: 2,   // Gemini (Mithuna)
  Saturn: 11,   // Pisces (Meena)
  Rahu: 10,     // Aquarius
  Ketu: 4,      // Leo (Simha)
};

// Detailed effects per house from the uploaded VedicScholar-style transit analysis
const HOUSE_EFFECTS_EN: Record<string, Record<number, string>> = {
  Sun: {
    3: "Courage, success over rivals, good health & energy",
    6: "Victory over enemies, health improvement, debt relief",
    8: "Challenges: health issues, stress, financial losses, obstacles. Avoid risks",
    10: "Authority, fame, professional success, government favor",
    11: "Income gains, fulfillment of desires, social recognition",
  },
  Moon: {
    1: "Comfort, mental peace, good results in endeavors",
    3: "Wealth gain, good relations, mental strength",
    6: "Victory, health recovery, overcoming challenges",
    7: "Respect, happiness in marriage, social gains",
    10: "Career boost, productivity, recognition. Good for professional pursuits",
    11: "Financial gains, happiness, fulfillment of wishes",
  },
  Mercury: {
    2: "Wealth gain, eloquent speech, family harmony",
    4: "Domestic happiness, property gains, education success",
    6: "Victory in disputes, sharp intellect, health relief",
    8: "Anxiety, miscommunication, hidden issues, document errors. Be careful with travel",
    10: "Professional success, good communication, recognition",
    11: "Income gain, trade profits, intellectual achievement",
  },
  Venus: {
    1: "Physical comfort, beauty, romantic happiness",
    2: "Wealth, family joy, fine food, luxuries",
    3: "Courage, artistic success, good sibling relations",
    4: "Property gain, vehicles, domestic happiness",
    5: "Romance, creativity, children's welfare, entertainment",
    8: "Relationship/finance ups-downs, unexpected expenses, emotional turmoil. Hidden gains possible",
    9: "Fortune, spiritual growth, long journeys",
    11: "Income, social status, fulfillment of desires",
    12: "Bed pleasures, spiritual growth, foreign connections",
  },
  Mars: {
    3: "Courage, victory, physical strength, sibling support",
    6: "Defeat of enemies, strength, overcoming illness",
    7: "Partnership tensions, arguments, health concerns for spouse. Avoid confrontations",
    11: "Income, fulfillment of ambitions, property gains",
  },
  Jupiter: {
    2: "Wealth, knowledge, family happiness, good speech",
    5: "Children's welfare, education, spiritual merit, creativity",
    7: "Marriage harmony, partnerships, social status",
    9: "Fortune, dharma, higher education, pilgrimage",
    11: "Great gains, achievement, recognition, prosperity",
    12: "Increased expenses, isolation, setbacks in growth. Supports spiritual pursuits, foreign matters",
  },
  Saturn: {
    3: "Courage, property, servant support, stability",
    6: "Victory over enemies, health recovery, fame",
    9: "Delays in luck, travel, higher education. Feels burdensome",
    11: "Income, achievement, position improvement",
  },
  Rahu: {
    3: "Bravery, success in competition, gain through foreigners",
    6: "Victory, removal of obstacles, health improvement",
    8: "Sudden changes, mysteries, health scares. Potential for transformative insights. Unpredictable",
    10: "Professional success, foreign opportunities, authority",
    11: "Major gains, wish fulfillment, social elevation",
  },
  Ketu: {
    2: "Family/finance/speech disruptions, spiritual detachment. Detachment-oriented effects",
    3: "Spiritual courage, overcoming fear, gains",
    6: "Victory, health relief, spiritual progress",
    11: "Income, fulfillment, rare achievements",
  },
};

const HOUSE_EFFECTS_HI: Record<string, Record<number, string>> = {
  Sun: {
    3: "साहस, प्रतिद्वंद्वियों पर सफलता, अच्छा स्वास्थ्य व ऊर्जा",
    6: "शत्रु पर विजय, स्वास्थ्य सुधार, ऋण मुक्ति",
    8: "चुनौतियाँ: स्वास्थ्य, तनाव, आर्थिक हानि, बाधाएं। जोखिम से बचें",
    10: "अधिकार, यश, व्यावसायिक सफलता, सरकारी कृपा",
    11: "आय लाभ, इच्छा पूर्ति, सामाजिक मान्यता",
  },
  Moon: {
    1: "सुख, मानसिक शांति, कार्यों में शुभ परिणाम",
    3: "धन लाभ, अच्छे संबंध, मानसिक बल",
    6: "विजय, स्वास्थ्य सुधार, चुनौतियों पर काबू",
    7: "सम्मान, वैवाहिक सुख, सामाजिक लाभ",
    10: "कार्य सफलता, उत्पादकता, मान्यता। व्यावसायिक कार्यों में शुभ",
    11: "आर्थिक लाभ, प्रसन्नता, मनोकामना पूर्ति",
  },
  Mercury: {
    2: "धन लाभ, वाक्पटुता, पारिवारिक सामंजस्य",
    4: "गृह सुख, संपत्ति लाभ, शिक्षा सफलता",
    6: "विवाद में विजय, तीक्ष्ण बुद्धि, स्वास्थ्य राहत",
    8: "चिंता, गलत संवाद, छिपी समस्याएं, दस्तावेज़ त्रुटि। यात्रा में सावधानी",
    10: "व्यावसायिक सफलता, अच्छा संवाद, मान्यता",
    11: "आय लाभ, व्यापार मुनाफा, बौद्धिक उपलब्धि",
  },
  Venus: {
    1: "शारीरिक सुख, सौंदर्य, प्रेम में प्रसन्नता",
    2: "धन, पारिवारिक आनंद, उत्तम भोजन, विलासिता",
    3: "साहस, कलात्मक सफलता, भाई-बहन से शुभ संबंध",
    4: "संपत्ति लाभ, वाहन, गृह सुख",
    5: "प्रेम, रचनात्मकता, संतान कल्याण, मनोरंजन",
    8: "संबंधों/वित्त में उतार-चढ़ाव, अप्रत्याशित खर्च, भावनात्मक उथल-पुथल। छिपे लाभ संभव",
    9: "भाग्य, आध्यात्मिक वृद्धि, लंबी यात्राएं",
    11: "आय, सामाजिक प्रतिष्ठा, इच्छा पूर्ति",
    12: "शयन सुख, आध्यात्मिक वृद्धि, विदेशी संबंध",
  },
  Mars: {
    3: "साहस, विजय, शारीरिक बल, भाई-बहन सहयोग",
    6: "शत्रु पराजय, शक्ति, रोग पर विजय",
    7: "साझेदारी में तनाव, वाद-विवाद, जीवनसाथी स्वास्थ्य चिंता। टकराव से बचें",
    11: "आय, महत्वाकांक्षा पूर्ति, संपत्ति लाभ",
  },
  Jupiter: {
    2: "धन, ज्ञान, पारिवारिक सुख, अच्छी वाणी",
    5: "संतान कल्याण, शिक्षा, पुण्य, रचनात्मकता",
    7: "वैवाहिक सामंजस्य, साझेदारी, सामाजिक प्रतिष्ठा",
    9: "भाग्य, धर्म, उच्च शिक्षा, तीर्थयात्रा",
    11: "महान लाभ, उपलब्धि, मान्यता, समृद्धि",
    12: "खर्च वृद्धि, एकांत, विकास में बाधा। आध्यात्मिक कार्य, विदेशी मामलों में सहायक",
  },
  Saturn: {
    3: "साहस, संपत्ति, सेवक सहयोग, स्थिरता",
    6: "शत्रु पर विजय, स्वास्थ्य सुधार, यश",
    9: "भाग्य/यात्रा/उच्च शिक्षा में विलंब। बोझिल अनुभव",
    11: "आय, उपलब्धि, पद सुधार",
  },
  Rahu: {
    3: "वीरता, प्रतियोगिता में सफलता, विदेशियों से लाभ",
    6: "विजय, बाधा निवारण, स्वास्थ्य सुधार",
    8: "अचानक परिवर्तन, रहस्य, स्वास्थ्य भय। परिवर्तनकारी अंतर्दृष्टि संभव। अप्रत्याशित",
    10: "व्यावसायिक सफलता, विदेशी अवसर, अधिकार",
    11: "बड़ा लाभ, इच्छा पूर्ति, सामाजिक उन्नति",
  },
  Ketu: {
    2: "परिवार/वित्त/वाणी में व्यवधान, आध्यात्मिक वैराग्य। विरक्ति उन्मुख प्रभाव",
    3: "आध्यात्मिक साहस, भय पर विजय, लाभ",
    6: "विजय, स्वास्थ्य राहत, आध्यात्मिक प्रगति",
    11: "आय, पूर्ति, दुर्लभ उपलब्धियां",
  },
};

// Generic effects when house-specific not available
const GENERIC_EFFECTS = {
  en: {
    favorable: "Generally positive results expected in this transit",
    unfavorable: "Challenges expected; exercise caution and patience",
  },
  hi: {
    favorable: "इस गोचर में सामान्यतः शुभ परिणाम अपेक्षित",
    unfavorable: "चुनौतियां अपेक्षित; सावधानी और धैर्य बरतें",
  },
};

export function calculateTransits(
  moonRashiIndex: number,
  planetPositions: Record<string, number> = CURRENT_POSITIONS
): TransitResult[] {
  const results: TransitResult[] = [];

  for (const planet of PLANETS) {
    const currentRashi = planetPositions[planet.en] ?? 0;
    const houseFromMoon = ((currentRashi - moonRashiIndex + 12) % 12) + 1;
    const baseFavorable = planet.favorableHouses.includes(houseFromMoon);

    // Check vedha
    let vedhaActive = false;
    let vedhaNote = "";
    if (baseFavorable) {
      const vedhaHouse = VEDHA_PAIRS[planet.en]?.[houseFromMoon];
      if (vedhaHouse) {
        for (const otherPlanet of PLANETS) {
          if (otherPlanet.en === planet.en) continue;
          const otherHouse = ((planetPositions[otherPlanet.en]! - moonRashiIndex + 12) % 12) + 1;
          if (otherHouse === vedhaHouse) {
            vedhaActive = true;
            vedhaNote = `${otherPlanet.en} in ${vedhaHouse}th`;
            break;
          }
        }
      }
    }

    const effectiveStatus = baseFavorable
      ? vedhaActive ? "mixed" : "favorable"
      : "unfavorable";
    const scoreContribution = effectiveStatus === "favorable" ? 1 : 0;

    // Get house-specific effect from enriched data
    const effectEn = HOUSE_EFFECTS_EN[planet.en]?.[houseFromMoon]
      ?? GENERIC_EFFECTS.en[baseFavorable ? "favorable" : "unfavorable"];
    const effectHi = HOUSE_EFFECTS_HI[planet.en]?.[houseFromMoon]
      ?? GENERIC_EFFECTS.hi[baseFavorable ? "favorable" : "unfavorable"];

    // Rating based on favorability
    const rating = baseFavorable && !vedhaActive
      ? 7 + (planet.favorableHouses.length > 4 ? 1 : 0)
      : baseFavorable && vedhaActive
      ? 4
      : 3;

    results.push({
      planet,
      currentRashi,
      houseFromMoon,
      baseFavorable,
      vedhaActive,
      vedhaNote: vedhaNote || "None",
      effectiveStatus,
      scoreContribution,
      rating,
      effectEn,
      effectHi,
    });
  }

  return results;
}

// Simplified Moon rashi determination
// Production would use Swiss Ephemeris for accurate sidereal calculation
export function getMoonRashi(birthDate: Date): number {
  const dayOfYear = Math.floor(
    (birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return Math.floor((dayOfYear * 12) / 365) % 12;
}

// Sade Sati detection and analysis
export interface SadeSatiInfo {
  active: boolean;
  phase: 'rising' | 'peak' | 'setting' | null;
  house: number;
  description: {
    en: string;
    hi: string;
  };
  remedies: {
    en: string[];
    hi: string[];
  };
}

export function checkSadeSati(moonRashiIndex: number, saturnRashiIndex: number): SadeSatiInfo {
  const saturnHouse = ((saturnRashiIndex - moonRashiIndex + 12) % 12) + 1;

  const phases = {
    12: {
      phase: 'rising' as const,
      en: 'Rising Phase (Arohini): Saturn in 12th house from Moon. Beginning of 7.5-year period. Focus on expenses, losses, and spiritual growth.',
      hi: 'आरोहिणी चरण: शनि चन्द्र से 12वें भाव में। 7.5 वर्ष की अवधि का प्रारंभ। खर्च, हानि और आध्यात्मिक विकास पर ध्यान।'
    },
    1: {
      phase: 'peak' as const,
      en: 'Peak Phase (Madhya): Saturn in Moon sign. Most challenging period. Health, career, and relationships face maximum pressure.',
      hi: 'मध्य चरण: शनि चन्द्र राशि में। सबसे कठिन समय। स्वास्थ्य, करियर और संबंधों पर अधिकतम दबाव।'
    },
    2: {
      phase: 'setting' as const,
      en: 'Setting Phase (Avarohi): Saturn in 2nd house from Moon. Final phase. Financial challenges, family issues, but relief approaching.',
      hi: 'अवरोही चरण: शनि चन्द्र से 2रे भाव में। अंतिम चरण। आर्थिक चुनौतियां, पारिवारिक मुद्दे, लेकिन राहत निकट।'
    }
  };

  if (saturnHouse === 12 || saturnHouse === 1 || saturnHouse === 2) {
    const phaseInfo = phases[saturnHouse as 12 | 1 | 2];
    return {
      active: true,
      phase: phaseInfo.phase,
      house: saturnHouse,
      description: {
        en: phaseInfo.en,
        hi: phaseInfo.hi
      },
      remedies: {
        en: [
          'Recite Shani mantra: "Om Sham Shanaishcharaya Namah" (108 times daily)',
          'Donate black items (black cloth, black sesame) on Saturdays',
          'Light mustard oil lamp under Peepal tree on Saturdays',
          'Wear blue sapphire (Neelam) after consultation',
          'Help elderly, disabled, and poor people',
          'Practice patience, discipline, and hard work'
        ],
        hi: [
          'शनि मंत्र जाप: "ॐ शं शनैश्चराय नमः" (प्रतिदिन 108 बार)',
          'शनिवार को काले वस्त्र, काले तिल दान करें',
          'शनिवार को पीपल के पेड़ के नीचे सरसों तेल का दीपक जलाएं',
          'परामर्श के बाद नीलम धारण करें',
          'वृद्ध, विकलांग और गरीब लोगों की सहायता करें',
          'धैर्य, अनुशासन और कठिन परिश्रम का अभ्यास करें'
        ]
      }
    };
  }

  return {
    active: false,
    phase: null,
    house: saturnHouse,
    description: {
      en: 'Not in Sade Sati period',
      hi: 'साढ़े साती की अवधि में नहीं'
    },
    remedies: {
      en: [],
      hi: []
    }
  };
}


// Life-Area Specific Effects for each planet in different houses
export interface LifeAreaEffects {
  career: string;
  health: string;
  finance: string;
  relationships: string;
}

export const LIFE_AREA_EFFECTS: Record<string, Record<number, LifeAreaEffects>> = {
  Sun: {
    3: {
      career: "Courage to take initiatives; good for leadership roles",
      health: "High energy; good vitality; avoid overexertion",
      finance: "Gains through own efforts; avoid risky ventures",
      relationships: "Confident in social interactions; sibling support"
    },
    6: {
      career: "Victory over workplace rivals; promotions likely",
      health: "Recovery from illness; immune system strong",
      finance: "Debt relief; legal victories bring gains",
      relationships: "Overcome relationship obstacles; authority respected"
    },
    8: {
      career: "Delays in promotions; avoid confronting superiors",
      health: "Watch blood pressure, eye/heart issues; rest well",
      finance: "Unexpected expenses; avoid investments/loans",
      relationships: "Ego clashes with authority figures; be humble"
    },
    10: {
      career: "Excellent for recognition, promotion, govt favor",
      health: "Energy high; good for physical activities",
      finance: "Income from authority/government likely",
      relationships: "Improved social standing; father figure supportive"
    },
    11: {
      career: "Achievement of career goals; networking success",
      health: "Generally good; maintain routine",
      finance: "Income gains; fulfillment of financial desires",
      relationships: "Social recognition; elder sibling support"
    }
  },
  Moon: {
    1: {
      career: "Mental clarity for decisions; good start for projects",
      health: "Emotional wellbeing; digestive system good",
      finance: "Comfortable financial state; avoid impulsive spending",
      relationships: "Nurturing relationships; mother's blessings"
    },
    3: {
      career: "Communication skills shine; good for sales/marketing",
      health: "Mental strength; respiratory system healthy",
      finance: "Short-term gains; sibling financial support",
      relationships: "Sibling harmony; neighbors friendly"
    },
    6: {
      career: "Overcome workplace challenges; service-oriented success",
      health: "Recovery from minor ailments; immunity improves",
      finance: "Debt management successful; avoid lending",
      relationships: "Resolve conflicts; maternal uncle supportive"
    },
    7: {
      career: "Partnership ventures favorable; public dealings good",
      health: "Spouse's health needs attention; emotional balance",
      finance: "Joint finances improve; business partnerships gain",
      relationships: "Marriage harmony; spouse supportive"
    },
    10: {
      career: "Career boost, productivity, recognition; public image strong",
      health: "Energy fluctuates; manage stress; adequate rest",
      finance: "Professional income increases; reputation brings gains",
      relationships: "Mother's support in career; public respect"
    },
    11: {
      career: "Fulfillment of career ambitions; networking pays off",
      health: "Generally comfortable; watch emotional eating",
      finance: "Financial gains; wishes fulfilled; income rises",
      relationships: "Elder sibling support; social circle expands"
    }
  },
  Mercury: {
    2: {
      career: "Eloquent communication; good for teaching/writing",
      health: "Nervous system balanced; speech clear",
      finance: "Wealth gain through intellect; family business profits",
      relationships: "Family harmony; articulate in relationships"
    },
    4: {
      career: "Education/property-related career success",
      health: "Mental peace; respiratory health good",
      finance: "Property gains; vehicle purchase favorable",
      relationships: "Mother's advice valuable; domestic happiness"
    },
    6: {
      career: "Sharp intellect defeats rivals; legal victories",
      health: "Overcome health issues through knowledge; avoid stress",
      finance: "Debt management through smart planning",
      relationships: "Win arguments; maternal uncle helpful"
    },
    8: {
      career: "Good for research, investigation, hidden work",
      health: "Nervous system — avoid stress; sleep hygiene critical",
      finance: "Hidden gains possible; careful with contracts",
      relationships: "Deep conversations; uncover hidden truths"
    },
    10: {
      career: "Professional communication success; recognition for skills",
      health: "Mental workload high; manage stress; breaks needed",
      finance: "Income through communication/intellect; consulting gains",
      relationships: "Professional relationships strong; networking"
    },
    11: {
      career: "Intellectual achievements recognized; goals met",
      health: "Generally good; avoid overthinking",
      finance: "Income from multiple sources; trade profits",
      relationships: "Friends supportive; social networking beneficial"
    }
  },
  Venus: {
    1: {
      career: "Creative career success; charm helps professionally",
      health: "Physical comfort; beauty/wellness focus beneficial",
      finance: "Comfortable financial state; luxury purchases",
      relationships: "Romantic happiness; personal magnetism high"
    },
    2: {
      career: "Artistic/creative work brings wealth",
      health: "Facial beauty; throat/voice health good",
      finance: "Wealth accumulation; family assets grow",
      relationships: "Family joy; spouse brings financial support"
    },
    3: {
      career: "Artistic communication; media/arts success",
      health: "Good vitality; artistic pursuits therapeutic",
      finance: "Gains through siblings; short travels profitable",
      relationships: "Sibling harmony; artistic collaborations"
    },
    4: {
      career: "Property/interior design career favorable",
      health: "Domestic comfort supports health",
      finance: "Property gains; vehicle purchase; home improvements",
      relationships: "Mother supportive; domestic bliss"
    },
    5: {
      career: "Creative projects succeed; entertainment industry good",
      health: "Romantic happiness boosts health; fertility good",
      finance: "Speculative gains possible; children bring joy",
      relationships: "Romance flourishes; children's welfare; love affairs"
    },
    8: {
      career: "Hidden talents emerge; occult/research work",
      health: "Reproductive health focus; emotional ups-downs",
      finance: "Hidden gains; inheritance possible; joint finances complex",
      relationships: "Deep intimacy; relationship transformation; secrets"
    },
    9: {
      career: "Good for creative/artistic pursuits; travel benefits",
      health: "Generally comfortable; hormonal balance good",
      finance: "Fortune smiles; long-distance deals favorable",
      relationships: "Romance flourishes; spiritual bond with partner"
    },
    11: {
      career: "Social networking brings career gains",
      health: "Generally good; social activities therapeutic",
      finance: "Income increases; desires fulfilled; luxury purchases",
      relationships: "Friends supportive; social status rises"
    },
    12: {
      career: "Foreign connections; spiritual/artistic work abroad",
      health: "Rest and relaxation needed; spa/retreat beneficial",
      finance: "Expenses on luxury/comfort; foreign investments",
      relationships: "Bed pleasures; spiritual connection; foreign romance"
    }
  },
  Mars: {
    3: {
      career: "Courage to take bold career moves; competition success",
      health: "High energy; physical strength; avoid accidents",
      finance: "Gains through courage; property/land deals",
      relationships: "Sibling support; assertive communication"
    },
    6: {
      career: "Defeat workplace enemies; competitive success",
      health: "Overcome illness; surgery successful; energy high",
      finance: "Debt victory; legal wins; property disputes resolved",
      relationships: "Win arguments; maternal uncle helpful"
    },
    7: {
      career: "Partnership tensions; business conflicts",
      health: "Spouse health concerns; accidents possible; blood pressure",
      finance: "Joint venture conflicts; legal expenses",
      relationships: "Partnership tensions, arguments; avoid confrontations"
    },
    11: {
      career: "Ambitious goals achieved; competitive gains",
      health: "High energy; sports/fitness beneficial",
      finance: "Income through property; elder sibling support",
      relationships: "Friends supportive in ambitions; social courage"
    }
  },
  Jupiter: {
    2: {
      career: "Teaching/advisory roles favorable; knowledge brings wealth",
      health: "Generally good; liver/weight management needed",
      finance: "Wealth through wisdom; family assets grow",
      relationships: "Family harmony; wise speech; spouse supportive"
    },
    5: {
      career: "Education/teaching success; creative wisdom",
      health: "Children's health good; fertility favorable",
      finance: "Speculative gains; children bring prosperity",
      relationships: "Children's welfare; romantic wisdom; spiritual love"
    },
    7: {
      career: "Partnership success; consulting/advisory roles",
      health: "Spouse health good; balanced lifestyle",
      finance: "Business partnerships profitable; joint ventures",
      relationships: "Marriage harmony; wise partner; spiritual bond"
    },
    9: {
      career: "Higher education success; teaching/publishing",
      health: "Generally good; pilgrimage beneficial",
      finance: "Fortune increases; father's support; long-distance gains",
      relationships: "Father supportive; guru blessings; spiritual growth"
    },
    11: {
      career: "Great professional achievements; recognition",
      health: "Generally excellent; maintain balance",
      finance: "Major financial gains; prosperity; wishes fulfilled",
      relationships: "Elder sibling support; social elevation; networking"
    },
    12: {
      career: "Foreign connections possible; spiritual work rewarded",
      health: "Sleep disturbances; meditation recommended",
      finance: "Expenses rise; foreign expenditure likely; charity",
      relationships: "Withdrawal/solitude tendency; introspection good"
    }
  },
  Saturn: {
    3: {
      career: "Steady career progress through hard work",
      health: "Stamina good; avoid overwork; joint care",
      finance: "Property gains through patience; servant support",
      relationships: "Sibling relations require patience; stability"
    },
    6: {
      career: "Victory through perseverance; service roles",
      health: "Chronic issues improve slowly; discipline helps",
      finance: "Debt relief through discipline; legal patience",
      relationships: "Overcome obstacles; maternal uncle's slow support"
    },
    9: {
      career: "Hard work brings slow results; avoid cutting corners",
      health: "Joint/bone issues; cold-related problems; rest",
      finance: "Delays in expected gains; budget carefully",
      relationships: "Father/guru relationship strained; be respectful"
    },
    11: {
      career: "Slow but steady career gains; elder support",
      health: "Generally stable; maintain routine",
      finance: "Income through hard work; elder sibling support",
      relationships: "Friends require patience; social discipline"
    }
  },
  Rahu: {
    3: {
      career: "Unconventional success; foreign connections",
      health: "Nervous energy; avoid addictions; mental clarity",
      finance: "Sudden gains; technology/foreign deals",
      relationships: "Sibling relations unusual; innovative communication"
    },
    6: {
      career: "Victory through unconventional means",
      health: "Mysterious ailments improve; avoid intoxicants",
      finance: "Debt relief through unusual sources",
      relationships: "Overcome enemies; maternal uncle's foreign help"
    },
    8: {
      career: "Research/occult/technology work; sudden changes",
      health: "Sudden health scares; mysterious ailments; avoid risks",
      finance: "Sudden gains/losses; inheritance; hidden money",
      relationships: "Sudden changes; mysteries; health scares; unpredictable"
    },
    10: {
      career: "Foreign opportunities; technology/innovation success",
      health: "Stress from ambition; avoid shortcuts",
      finance: "Income through foreign/technology; sudden gains",
      relationships: "Professional image unconventional; foreign contacts"
    },
    11: {
      career: "Major unconventional gains; networking success",
      health: "Generally good; avoid addictions",
      finance: "Sudden major gains; foreign income; wishes fulfilled",
      relationships: "Friends from diverse backgrounds; social elevation"
    }
  },
  Ketu: {
    2: {
      career: "Detachment from family business; spiritual work",
      health: "Speech issues; dental care; mysterious ailments",
      finance: "Financial detachment; family wealth disruption",
      relationships: "Family disruptions; spiritual detachment; speech issues"
    },
    3: {
      career: "Spiritual courage; unconventional communication",
      health: "Overcome fears; mysterious recovery",
      finance: "Gains through spiritual/occult work",
      relationships: "Sibling relations spiritual; detached communication"
    },
    6: {
      career: "Victory through spiritual means; service",
      health: "Mysterious recovery; spiritual healing",
      finance: "Debt relief through detachment; spiritual gains",
      relationships: "Overcome enemies spiritually; detached service"
    },
    11: {
      career: "Rare spiritual achievements; unconventional gains",
      health: "Generally good; spiritual practices beneficial",
      finance: "Income through spiritual/occult; rare gains",
      relationships: "Friends spiritual; detached social circle"
    }
  }
};


// Individual Planet Remedies for unfavorable transits
export const PLANET_REMEDIES: Record<string, { en: string[]; hi: string[] }> = {
  Sun: {
    en: [
      'Recite Aditya Hridayam or Surya mantra daily at sunrise',
      'Offer water to Sun (Arghya) every morning facing east',
      'Donate wheat, jaggery, or copper on Sundays',
      'Wear Ruby (Manik) after astrological consultation',
      'Chant: "Om Suryaya Namah" (108 times)',
      'Help your father or father figures'
    ],
    hi: [
      'प्रतिदिन सूर्योदय पर आदित्य हृदयम् या सूर्य मंत्र जाप करें',
      'प्रतिदिन पूर्व दिशा में सूर्य को अर्घ्य अर्पित करें',
      'रविवार को गेहूं, गुड़ या तांबा दान करें',
      'ज्योतिषीय परामर्श के बाद माणिक्य धारण करें',
      'मंत्र जाप: "ॐ सूर्याय नमः" (108 बार)',
      'अपने पिता या पिता तुल्य व्यक्तियों की सहायता करें'
    ]
  },
  Moon: {
    en: [
      'Chant: "Om Som Somaya Namah" (108 times)',
      'Offer milk or white flowers to Shiva on Mondays',
      'Wear Pearl (Moti) after consultation',
      'Meditate near water bodies',
      'Donate white items (rice, milk, white cloth) on Mondays',
      'Respect and serve your mother'
    ],
    hi: [
      'मंत्र जाप: "ॐ सोम सोमाय नमः" (108 बार)',
      'सोमवार को शिव को दूध या सफेद फूल अर्पित करें',
      'परामर्श के बाद मोती धारण करें',
      'जल स्रोत के पास ध्यान करें',
      'सोमवार को सफेद वस्तुएं (चावल, दूध, सफेद वस्त्र) दान करें',
      'अपनी माता का सम्मान और सेवा करें'
    ]
  },
  Mercury: {
    en: [
      'Chant: "Om Budhaya Namah" (108 times)',
      'Donate green items, books, or pens on Wednesdays',
      'Wear Emerald (Panna) after consultation',
      'Feed green grass to cows',
      'Study and teach others',
      'Respect your maternal uncle and teachers'
    ],
    hi: [
      'मंत्र जाप: "ॐ बुधाय नमः" (108 बार)',
      'बुधवार को हरी वस्तुएं, पुस्तकें या कलम दान करें',
      'परामर्श के बाद पन्ना धारण करें',
      'गायों को हरी घास खिलाएं',
      'अध्ययन करें और दूसरों को पढ़ाएं',
      'अपने मामा और शिक्षकों का सम्मान करें'
    ]
  },
  Venus: {
    en: [
      'Chant: "Om Shukraya Namah" (108 times)',
      'Donate white items, sugar, or rice on Fridays',
      'Wear Diamond or White Sapphire after consultation',
      'Offer white flowers to Goddess Lakshmi',
      'Maintain cleanliness and beauty in surroundings',
      'Respect women and your spouse'
    ],
    hi: [
      'मंत्र जाप: "ॐ शुक्राय नमः" (108 बार)',
      'शुक्रवार को सफेद वस्तुएं, चीनी या चावल दान करें',
      'परामर्श के बाद हीरा या सफेद पुखराज धारण करें',
      'देवी लक्ष्मी को सफेद फूल अर्पित करें',
      'परिवेश में स्वच्छता और सौंदर्य बनाए रखें',
      'महिलाओं और अपनी पत्नी का सम्मान करें'
    ]
  },
  Mars: {
    en: [
      'Recite Hanuman Chalisa daily',
      'Donate red lentils (masoor dal) on Tuesdays',
      'Avoid arguments and physical confrontations',
      'Chant: "Om Angarakaya Namah" (108 times)',
      'Wear Red Coral (Moonga) after consultation',
      'Practice patience and control anger'
    ],
    hi: [
      'प्रतिदिन हनुमान चालीसा पाठ करें',
      'मंगलवार को मसूर दाल दान करें',
      'वाद-विवाद और शारीरिक टकराव से बचें',
      'मंत्र जाप: "ॐ अंगारकाय नमः" (108 बार)',
      'परामर्श के बाद मूंगा धारण करें',
      'धैर्य का अभ्यास करें और क्रोध पर नियंत्रण रखें'
    ]
  },
  Jupiter: {
    en: [
      'Chant: "Om Gurave Namah" or Brahaspati mantra',
      'Donate yellow items (turmeric, yellow cloth) on Thursdays',
      'Respect teachers, elders, and spiritual guides',
      'Read Vishnu Sahasranama',
      'Wear Yellow Sapphire (Pukhraj) after consultation',
      'Practice charity and help students'
    ],
    hi: [
      'मंत्र: "ॐ गुरवे नमः" या बृहस्पति मंत्र जाप करें',
      'गुरुवार को पीली वस्तुएं (हल्दी, पीला वस्त्र) दान करें',
      'शिक्षक, बड़े-बुजुर्ग और आध्यात्मिक गुरुओं का आदर करें',
      'विष्णु सहस्रनाम पाठ करें',
      'परामर्श के बाद पुखराज धारण करें',
      'दान करें और छात्रों की सहायता करें'
    ]
  },
  Saturn: {
    en: [
      'Chant: "Om Sham Shanaishcharaya Namah" (108 times)',
      'Donate black sesame, mustard oil on Saturdays',
      'Light lamp under Peepal tree on Saturdays',
      'Serve the poor, elderly, and disabled',
      'Wear Blue Sapphire (Neelam) after consultation',
      'Practice patience, discipline, and hard work'
    ],
    hi: [
      'मंत्र: "ॐ शं शनैश्चराय नमः" (108 बार) जाप करें',
      'शनिवार को काले तिल, सरसों तेल दान करें',
      'शनिवार को पीपल के पेड़ के नीचे दीपक जलाएं',
      'गरीब, वृद्ध और विकलांगों की सेवा करें',
      'परामर्श के बाद नीलम धारण करें',
      'धैर्य, अनुशासन और कठिन परिश्रम का अभ्यास करें'
    ]
  },
  Rahu: {
    en: [
      'Chant Rahu Beej Mantra: "Om Rahave Namah" (108 times)',
      'Donate blue/black items on Saturdays',
      'Avoid intoxicants and impulsive decisions',
      'Feed crows on Saturdays',
      'Wear Hessonite (Gomed) after consultation',
      'Practice meditation and mindfulness'
    ],
    hi: [
      'राहु बीज मंत्र: "ॐ राहवे नमः" (108 बार) जाप करें',
      'शनिवार को नीले/काले वस्तुएं दान करें',
      'नशे और आवेगी निर्णयों से बचें',
      'शनिवार को कौओं को भोजन दें',
      'परामर्श के बाद गोमेद धारण करें',
      'ध्यान और सचेतनता का अभ्यास करें'
    ]
  },
  Ketu: {
    en: [
      'Chant: "Om Ketave Namah" (108 times)',
      'Donate multi-colored items or blankets',
      'Visit Ganesha temple on Tuesdays',
      'Practice spiritual detachment from outcomes',
      'Wear Cat\'s Eye (Lehsunia) after consultation',
      'Feed and care for dogs'
    ],
    hi: [
      'मंत्र: "ॐ केतवे नमः" (108 बार) जाप करें',
      'रंग-बिरंगी वस्तुएं या कंबल दान करें',
      'मंगलवार को गणेश मंदिर जाएं',
      'परिणामों से आध्यात्मिक वैराग्य का अभ्यास करें',
      'परामर्श के बाद लहसुनिया धारण करें',
      'कुत्तों को भोजन दें और उनकी देखभाल करें'
    ]
  }
};
