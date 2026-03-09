// Kaal Sarp Yoga analysis data and calculations
// Inspired by MoonAstro Kaal Sarp Yoga report structure

export interface KaalSarpReport {
  // Basic Info
  name: string;
  dateOfBirth: Date;
  moonSign: string;
  hasKaalSarpYoga: boolean;
  yogaType: string;
  yogaTypeHi: string;
  
  // Yoga Details
  yogaDescription: string;
  yogaDescriptionHi: string;
  rahuPosition: string;
  ketuPosition: string;
  affectedPlanets: string[];
  affectedHouses: number[];
  
  // Effects Analysis
  positiveEffects: string[];
  positiveEffectsHi: string[];
  negativeEffects: string[];
  negativeEffectsHi: string[];
  lifeAreasAffected: string[];
  lifeAreasAffectedHi: string[];
  
  // Intensity and Duration
  intensity: "Mild" | "Moderate" | "Strong" | "None";
  intensityHi: string;
  duration: string;
  durationHi: string;
  peakPeriods: string[];
  peakPeriodsHi: string[];
  
  // Remedies
  generalRemedies: string[];
  generalRemediesHi: string[];
  specificRemedies: string[];
  specificRemediesHi: string[];
  mantras: string[];
  mantrasHi: string[];
  gemstones: string[];
  gemstonesHi: string[];
  fastingDays: string[];
  fastingDaysHi: string[];
  
  // Temple Recommendations
  temples: string[];
  templesHi: string[];
  poojaRecommendations: string[];
  poojaRecommendationsHi: string[];
  
  // Overall Assessment
  overallImpact: number; // 1-10 scale
  mitigationPotential: number; // 1-10 scale
  overallAdvice: string;
  overallAdviceHi: string;
  successMantra: string;
  successMantraHi: string;
}

// Types of Kaal Sarp Yoga
const KAAL_SARP_TYPES = {
  "Anant Kaal Sarp Yoga": {
    en: "Rahu in 1st house, Ketu in 7th house",
    hi: "राहु प्रथम भाव में, केतु सप्तम भाव में",
    effects: {
      positive: ["Leadership qualities", "Independent nature", "Strong will power"],
      negative: ["Marriage delays", "Partnership issues", "Health problems"]
    }
  },
  "Kulik Kaal Sarp Yoga": {
    en: "Rahu in 2nd house, Ketu in 8th house",
    hi: "राहु द्वितीय भाव में, केतु अष्टम भाव में",
    effects: {
      positive: ["Financial gains", "Family support", "Speaking abilities"],
      negative: ["Financial instability", "Family disputes", "Speech issues"]
    }
  },
  "Vasuki Kaal Sarp Yoga": {
    en: "Rahu in 3rd house, Ketu in 9th house",
    hi: "राहु तृतीय भाव में, केतु नवम भाव में",
    effects: {
      positive: ["Courage", "Communication skills", "Travel opportunities"],
      negative: ["Sibling conflicts", "Educational obstacles", "Travel accidents"]
    }
  },
  "Shankhpal Kaal Sarp Yoga": {
    en: "Rahu in 4th house, Ketu in 10th house",
    hi: "राहु चतुर्थ भाव में, केतु दशम भाव में",
    effects: {
      positive: ["Property gains", "Vehicle comfort", "Domestic peace"],
      negative: ["Career obstacles", "Property disputes", "Mother's health issues"]
    }
  },
  "Padma Kaal Sarp Yoga": {
    en: "Rahu in 5th house, Ketu in 11th house",
    hi: "राहु पंचम भाव में, केतु एकादश भाव में",
    effects: {
      positive: ["Creative abilities", "Children's welfare", "Intelligence"],
      negative: ["Children's problems", "Education delays", "Loss of investments"]
    }
  },
  "Mahapadma Kaal Sarp Yoga": {
    en: "Rahu in 6th house, Ketu in 12th house",
    hi: "राहु षष्ठ भाव में, केतु द्वादश भाव में",
    effects: {
      positive: ["Victory over enemies", "Good health", "Financial recovery"],
      negative: ["Health issues", "Legal problems", "Financial losses"]
    }
  },
  "Takshak Kaal Sarp Yoga": {
    en: "Rahu in 7th house, Ketu in 1st house",
    hi: "राहु सप्तम भाव में, केतु प्रथम भाव में",
    effects: {
      positive: ["Business success", "Foreign connections", "Marriage to wealthy partner"],
      negative: ["Marriage delays", "Partnership losses", "Health problems"]
    }
  },
  "Karkotak Kaal Sarp Yoga": {
    en: "Rahu in 8th house, Ketu in 2nd house",
    hi: "राहु अष्टम भाव में, केतु द्वितीय भाव में",
    effects: {
      positive: ["Hidden wealth", "Research abilities", "Occult knowledge"],
      negative: ["Financial losses", "Family problems", "Health issues"]
    }
  },
  "Shankhnaad Kaal Sarp Yoga": {
    en: "Rahu in 9th house, Ketu in 3rd house",
    hi: "राहु नवम भाव में, केतु तृतीय भाव में",
    effects: {
      positive: ["Spiritual growth", "Higher education", "Foreign travel"],
      negative: ["Educational obstacles", "Father's health issues", "Travel problems"]
    }
  },
  "Patak Kaal Sarp Yoga": {
    en: "Rahu in 10th house, Ketu in 4th house",
    hi: "राहु दशम भाव में, केतु चतुर्थ भाव में",
    effects: {
      positive: ["Career success", "Authority", "Social status"],
      negative: ["Career instability", "Property losses", "Mother's problems"]
    }
  },
  "Vishdhar Kaal Sarp Yoga": {
    en: "Rahu in 11th house, Ketu in 5th house",
    hi: "राहु एकादश भाव में, केतु पंचम भाव में",
    effects: {
      positive: ["Financial gains", "Social network", "Fulfillment of desires"],
      negative: ["Children's issues", "Investment losses", "Educational problems"]
    }
  },
  "Sheshnag Kaal Sarp Yoga": {
    en: "Rahu in 12th house, Ketu in 6th house",
    hi: "राहु द्वादश भाव में, केतु षष्ठ भाव में",
    effects: {
      positive: ["Foreign settlement", "Spiritual liberation", "Hidden gains"],
      negative: ["Financial losses", "Health issues", "Legal problems"]
    }
  }
};

// General remedies for Kaal Sarp Yoga
const GENERAL_REMEDIES = {
  en: [
    "Recite Om Namah Shivaya 108 times daily",
    "Offer water to Shivalingam every Monday",
    "Keep fast on Mondays during Sawan month",
    "Donate black items on Saturdays",
    "Recite Maha Mrityunjaya Mantra daily",
    "Wear Gomed (Hessonite) gemstone after consultation",
    "Perform Kaal Sarp Dosh Nivaran Pooja",
    "Feed ants and dogs regularly"
  ],
  hi: [
    "प्रतिदिन ॐ नमः शिवाय 108 बार जाप करें",
    "प्रत्येक सोमवार शिवलिंग पर जल अर्पित करें",
    "सावन माह में सोमवार का व्रत रखें",
    "शनिवार को काली वस्तुएं दान करें",
    "प्रतिदिन महा मृत्युंजय मंत्र का जाप करें",
    "परामर्श के बाद गोमेद (हेसोनाइट) रत्न धारण करें",
    "काल सर्प दोष निवारण पूजा करें",
    "नियमित रूप से चीटियों और कुत्तों को भोजन दें"
  ]
};

// Specific mantras for Kaal Sarp Yoga
const KAAL_SARP_MANTRAS = {
  en: [
    "Om Namah Shivaya",
    "Maha Mrityunjaya Mantra: Om Tryambakam Yajamahe Sugandhim Pushti Vardhanam",
    "Rahu Mantra: Om Ra Rahave Namah",
    "Ketu Mantra: Om Ketave Namah",
    "Kaal Sarp Stotram: Om Sarpa Bhujangi Namah"
  ],
  hi: [
    "ॐ नमः शिवाय",
    "महा मृत्युंजय मंत्र: ॐ त्र्यंबकं यजामहे सुगंधिं पुष्टि वर्धनम्",
    "राहु मंत्र: ॐ रा राहवे नमः",
    "केतु मंत्र: ॐ केतवे नमः",
    "काल सर्प स्तोत्रम्: ॐ सर्प भुजंगि नमः"
  ]
};

// Temple recommendations
const TEMPLE_RECOMMENDATIONS = {
  en: [
    "Kalahasti Temple, Andhra Pradesh",
    "Trambakeshwar Temple, Maharashtra", 
    "Mangalnath Temple, Ujjain",
    "Srikalahasti Temple, Tamil Nadu",
    "Mahakaleshwar Temple, Ujjain"
  ],
  hi: [
    "कालहस्ती मंदिर, आंध्र प्रदेश",
    "त्र्यंबकेश्वर मंदिर, महाराष्ट्र",
    "मंगलनाथ मंदिर, उज्जैन",
    "श्रीकालहस्ती मंदिर, तमिलनाडु",
    "महाकालेश्वर मंदिर, उज्जैन"
  ]
};

export function generateKaalSarpReport(
  name: string,
  birthDate: Date,
  moonSignIndex: number,
  rahuHouse: number,
  ketuHouse: number
): KaalSarpReport {
  // Check if Kaal Sarp Yoga exists
  const hasKaalSarpYoga = (rahuHouse >= 1 && rahuHouse <= 12) && 
                          (ketuHouse >= 1 && ketuHouse <= 12) && 
                          (Math.abs(rahuHouse - ketuHouse) === 6);

  let yogaType = "";
  let yogaTypeHi = "";
  let yogaDescription = "";
  let yogaDescriptionHi = "";

  if (hasKaalSarpYoga) {
    // Determine yoga type based on Rahu position
    const yogaTypes = Object.keys(KAAL_SARP_TYPES);
    const typeIndex = (rahuHouse - 1) % yogaTypes.length;
    yogaType = yogaTypes[typeIndex];
    yogaTypeHi = yogaType;
    
    const yogaInfo = KAAL_SARP_TYPES[yogaType];
    yogaDescription = `Kaal Sarp Yoga formed with ${yogaInfo.en}. This yoga occurs when all planets are hemmed between Rahu and Ketu.`;
    yogaDescriptionHi = `${yogaInfo.hi} के साथ काल सर्प योग बना है। यह योग तब होता है जब सभी ग्रह राहु और केतु के बीच फंस जाते हैं।`;
  } else {
    yogaType = "No Kaal Sarp Yoga";
    yogaTypeHi = "कोई काल सर्प योग नहीं";
    yogaDescription = "No Kaal Sarp Yoga present in your birth chart. This is considered auspicious as it indicates free flow of planetary energies.";
    yogaDescriptionHi = "आपकी कुंडली में कोई काल सर्प योग नहीं है। यह शुभ माना जाता है क्योंकि इसका मतलब ग्रहीय ऊर्जाओं का मुक्त प्रवाह है।";
  }

  // Affected houses
  const affectedHouses = hasKaalSarpYoga ? [rahuHouse, ketuHouse] : [];

  // Generate effects
  const positiveEffects: string[] = [];
  const positiveEffectsHi: string[] = [];
  const negativeEffects: string[] = [];
  const negativeEffectsHi: string[] = [];

  if (hasKaalSarpYoga && KAAL_SARP_TYPES[yogaType]) {
    positiveEffects.push(...KAAL_SARP_TYPES[yogaType].effects.positive);
    negativeEffects.push(...KAAL_SARP_TYPES[yogaType].effects.negative);
    
    // Add Hindi translations (simplified)
    positiveEffectsHi.push(...KAAL_SARP_TYPES[yogaType].effects.positive.map(e => e));
    negativeEffectsHi.push(...KAAL_SARP_TYPES[yogaType].effects.negative.map(e => e));
  }

  // Life areas affected
  const lifeAreasAffected = hasKaalSarpYoga ? [
    "Career and profession",
    "Marriage and relationships", 
    "Financial stability",
    "Health and well-being",
    "Education and learning",
    "Family harmony"
  ] : [];

  const lifeAreasAffectedHi = hasKaalSarpYoga ? [
    "करियर और पेशा",
    "विवाह और रिश्ते",
    "वित्तीय स्थिरता", 
    "स्वास्थ्य और कल्याण",
    "शिक्षा और सीखना",
    "पारिवारिक सामंजस्य"
  ] : [];

  // Intensity calculation
  const intensityScore = hasKaalSarpYoga ? Math.floor(Math.random() * 3) + 1 : 0;
  const intensity = intensityScore === 3 ? "Strong" : intensityScore === 2 ? "Moderate" : hasKaalSarpYoga ? "Mild" : "None";
  const intensityHi = intensity === "Strong" ? "प्रबल" : intensity === "Moderate" ? "मध्यम" : intensity === "Mild" ? "हल्का" : "कोई नहीं";

  // Duration (simplified)
  const duration = hasKaalSarpYoga ? "Typically active until age 48, with peak effects during Rahu/Ketu dasha periods" : "Not applicable";
  const durationHi = hasKaalSarpYoga ? "आमतौर पर 48 वर्ष की आयु तक सक्रिय, राहु/केतु दशा अवधि के दौरान शिखर प्रभाव" : "लागू नहीं";

  // Peak periods
  const peakPeriods = hasKaalSarpYoga ? [
    "During Rahu Mahadasha",
    "During Ketu Mahadasha", 
    "During Saturn's transit over Rahu/Ketu",
    "During eclipses in your birth chart"
  ] : [];

  const peakPeriodsHi = hasKaalSarpYoga ? [
    "राहु महादशा के दौरान",
    "केतु महादशा के दौरान",
    "राहु/केतु पर शनि के गोचर के दौरान",
    "आपकी कुंडली में ग्रहणों के दौरान"
  ] : [];

  // Remedies
  const generalRemedies = hasKaalSarpYoga ? [...GENERAL_REMEDIES.en] : [];
  const generalRemediesHi = hasKaalSarpYoga ? [...GENERAL_REMEDIES.hi] : [];

  const specificRemedies = hasKaalSarpYoga ? [
    "Perform Kaal Sarp Dosh Nivaran Pooja on Nag Panchami",
    "Donate silver items on Saturdays",
    "Keep silver snake at home",
    "Read Kaal Sarp Stotram daily",
    "Offer milk to snake idol on Nag Panchami"
  ] : [];

  const specificRemediesHi = hasKaalSarpYoga ? [
    "नाग पंचमी को काल सर्प दोष निवारण पूजा करें",
    "शनिवार को चांदी की वस्तुएं दान करें",
    "घर पर चांदी का सांप रखें",
    "प्रतिदिन काल सर्प स्तोत्रम पढ़ें",
    "नाग पंचमी को सांप की मूर्ति पर दूध अर्पित करें"
  ] : [];

  // Mantras
  const mantras = hasKaalSarpYoga ? [...KAAL_SARP_MANTRAS.en] : [];
  const mantrasHi = hasKaalSarpYoga ? [...KAAL_SARP_MANTRAS.hi] : [];

  // Gemstones
  const gemstones = hasKaalSarpYoga ? [
    "Gomed (Hessonite) for Rahu",
    "Cat's Eye (Lehsunia) for Ketu",
    "Blue Sapphire (Neelam) for Saturn's support"
  ] : [];

  const gemstonesHi = hasKaalSarpYoga ? [
    "राहु के लिए गोमेद (हेसोनाइट)",
    "केतु के लिए लहसुनिया (कैट्स आई)",
    "शनि के समर्थन के लिए नीलम"
  ] : [];

  // Fasting days
  const fastingDays = hasKaalSarpYoga ? [
    "Monday (for Lord Shiva)",
    "Saturday (for Rahu and Saturn)",
    "Nag Panchami (special day for snake worship)"
  ] : [];

  const fastingDaysHi = hasKaalSarpYoga ? [
    "सोमवार (भगवान शिव के लिए)",
    "शनिवार (राहु और शनि के लिए)",
    "नाग पंचमी (सांप पूजा का विशेष दिन)"
  ] : [];

  // Temple recommendations
  const temples = hasKaalSarpYoga ? [...TEMPLE_RECOMMENDATIONS.en] : [];
  const templesHi = hasKaalSarpYoga ? [...TEMPLE_RECOMMENDATIONS.hi] : [];

  const poojaRecommendations = hasKaalSarpYoga ? [
    "Kaal Sarp Dosh Nivaran Pooja",
    "Rahu Ketu Shanti Pooja",
    "Maha Mrityunjaya Japa",
    "Navagraha Shanti Pooja"
  ] : [];

  const poojaRecommendationsHi = hasKaalSarpYoga ? [
    "काल सर्प दोष निवारण पूजा",
    "राहु केतु शांति पूजा",
    "महा मृत्युंजय जप",
    "नवग्रह शांति पूजा"
  ] : [];

  // Overall assessment
  const overallImpact = hasKaalSarpYoga ? Math.floor(Math.random() * 5) + 5 : 0; // 5-9 if present, 0 if not
  const mitigationPotential = hasKaalSarpYoga ? Math.floor(Math.random() * 3) + 7 : 10; // 7-9 if present, 10 if not

  const overallAdvice = hasKaalSarpYoga
    ? "Kaal Sarp Yoga presents challenges but can be effectively managed through regular remedies, spiritual practices, and proper guidance. Success is achievable with dedication and faith."
    : "Your chart is free from Kaal Sarp Yoga, which is auspicious. Continue your spiritual practices and maintain positive karma for continued success.";

  const overallAdviceHi = hasKaalSarpYoga
    ? "काल सर्प योग चुनौतियां प्रस्तुत करता है लेकिन नियमित उपाय, आध्यात्मिक अभ्यास और उचित मार्गदर्शन के माध्यम से प्रभावी ढंग से प्रबंधित किया जा सकता है। समर्पण और विश्वास के साथ सफलता प्राप्त की जा सकती है।"
    : "आपकी कुंडली काल सर्प योग से मुक्त है, जो शुभ है। निरंतर सफलता के लिए अपने आध्यात्मिक अभ्यास जारी रखें और सकारात्मक कर्म बनाए रखें।";

  const successMantra = hasKaalSarpYoga
    ? "Om Namah Shivaya - Regular chanting of this mantra with faith and devotion can help overcome Kaal Sarp Yoga effects."
    : "Om Gam Ganapataye Namah - Continue your spiritual journey with the blessings of Lord Ganesha.";

  const successMantraHi = hasKaalSarpYoga
    ? "ॐ नमः शिवाय - विश्वास और भक्ति के साथ इस मंत्र का नियमित जाप काल सर्प योग के प्रभावों को दूर करने में मदद कर सकता है।"
    : "ॐ गं गणपतये नमः - भगवान गणेश के आशीर्वाद के साथ अपनी आध्यात्मिक यात्रा जारी रखें।";

  const moonSign = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][moonSignIndex];

  return {
    name,
    dateOfBirth: birthDate,
    moonSign,
    hasKaalSarpYoga,
    yogaType,
    yogaTypeHi,
    yogaDescription,
    yogaDescriptionHi,
    rahuPosition: `House ${rahuHouse}`,
    ketuPosition: `House ${ketuHouse}`,
    affectedPlanets: hasKaalSarpYoga ? ["All planets between Rahu and Ketu"] : [],
    affectedHouses,
    positiveEffects,
    positiveEffectsHi,
    negativeEffects,
    negativeEffectsHi,
    lifeAreasAffected,
    lifeAreasAffectedHi,
    intensity,
    intensityHi,
    duration,
    durationHi,
    peakPeriods,
    peakPeriodsHi,
    generalRemedies,
    generalRemediesHi,
    specificRemedies,
    specificRemediesHi,
    mantras,
    mantrasHi,
    gemstones,
    gemstonesHi,
    fastingDays,
    fastingDaysHi,
    temples,
    templesHi,
    poojaRecommendations,
    poojaRecommendationsHi,
    overallImpact,
    mitigationPotential,
    overallAdvice,
    overallAdviceHi,
    successMantra,
    successMantraHi
  };
}
