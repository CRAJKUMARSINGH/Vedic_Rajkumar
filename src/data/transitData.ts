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
