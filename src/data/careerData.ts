// Career report data and calculations based on Vedic astrology principles
// Enhanced inspired by MoonAstro comprehensive report structure

export interface CareerReport {
  // Basic Info
  name: string;
  dateOfBirth: Date;
  moonSign: string;
  ascendant: string;
  sunSign: string;
  
  // Career Analysis
  suitableFields: string[];
  suitableFieldsHi: string[];
  strengths: string[];
  strengthsHi: string[];
  challenges: string[];
  challengesHi: string[];
  recommendations: string[];
  recommendationsHi: string[];
  
  // Planetary Influences (Enhanced)
  sunInfluence: string;
  sunInfluenceHi: string;
  moonInfluence: string;
  moonInfluenceHi: string;
  marsInfluence: string;
  marsInfluenceHi: string;
  mercuryInfluence: string;
  mercuryInfluenceHi: string;
  jupiterInfluence: string;
  jupiterInfluenceHi: string;
  venusInfluence: string;
  venusInfluenceHi: string;
  saturnInfluence: string;
  saturnInfluenceHi: string;
  rahuInfluence: string;
  rahuInfluenceHi: string;
  ketuInfluence: string;
  ketuInfluenceHi: string;
  
  // House-based Career Analysis
  tenthHouseAnalysis: string;
  tenthHouseAnalysisHi: string;
  sixthHouseAnalysis: string;
  sixthHouseAnalysisHi: string;
  secondHouseAnalysis: string;
  secondHouseAnalysisHi: string;
  eleventhHouseAnalysis: string;
  eleventhHouseAnalysisHi: string;
  
  // Timing and Dasha
  favorablePeriods: string[];
  favorablePeriodsHi: string[];
  cautionPeriods: string[];
  cautionPeriodsHi: string[];
  currentDasha: string;
  currentDashaHi: string;
  
  // Remedies and Suggestions
  remedies: string[];
  remediesHi: string[];
  gemstones: string[];
  gemstonesHi: string[];
  
  // Business vs Job Analysis
  businessPotential: number; // 1-10 scale
  jobPotential: number; // 1-10 scale
  businessVsJobAdvice: string;
  businessVsJobAdviceHi: string;
  
  // Financial Prospects
  financialGrowth: string;
  financialGrowthHi: string;
  investmentAdvice: string[];
  investmentAdviceHi: string[];
  
  // Overall Assessment
  careerPotential: number; // 1-10 scale
  overallOutlook: string;
  overallOutlookHi: string;
  successAge: string;
  successAgeHi: string;
}

// House-based career analysis
const HOUSE_CAREER_ANALYSIS = {
  10: { // 10th House - Career
    en: "Strong career focus, professional success, recognition in society",
    hi: "मजबूत करियर फोकस, व्यावसायिक सफलता, समाज में मान्यता"
  },
  6: { // 6th House - Service
    en: "Service-oriented career, competition, discipline in work",
    hi: "सेवा उन्मुख करियर, प्रतिस्पर्धा, कार्य में अनुशासन"
  },
  2: { // 2nd House - Wealth
    en: "Financial gains through career, family business potential",
    hi: "करियर के माध्यम से वित्तीय लाभ, पारिवारिक व्यवसाय की क्षमता"
  },
  11: { // 11th House - Gains
    en: "Professional network, fulfillment of desires, multiple income sources",
    hi: "व्यावसायिक नेटवर्क, इच्छाओं की पूर्ति, कई आय स्रोत"
  }
};

// Remedies based on planetary positions
const PLANETARY_REMEDIES = {
  Sun: {
    en: ["Offer water to Sun in morning", "Recite Aditya Hridayam", "Wear ruby gemstone"],
    hi: ["सुबह सूर्य को जल अर्पित करें", "आदित्य हृदयम का पाठ करें", "रूबी रत्न धारण करें"]
  },
  Moon: {
    en: ["Wear pearl", "Recite Shiva Chalisa", "Offer milk to Shivalingam"],
    hi: ["मोती धारण करें", "शिव चालीसा का पाठ करें", "शिवलिंग पर दूध अर्पित करें"]
  },
  Mars: {
    en: ["Recite Hanuman Chalisa", "Wear red coral", "Donate red items on Tuesdays"],
    hi: ["हनुमान चालीसा का पाठ करें", "लाल मूंगा धारण करें", "मंगलवार को लाल वस्तुएं दान करें"]
  },
  Mercury: {
    en: ["Recite Budh Mantra", "Wear emerald", "Feed green grass to cows"],
    hi: ["बुध मंत्र का पाठ करें", "पन्ना धारण करें", "गायों को हरा चारा खिलाएं"]
  },
  Jupiter: {
    en: ["Recite Brihaspati Mantra", "Wear yellow sapphire", "Serve teachers and elders"],
    hi: ["बृहस्पति मंत्र का पाठ करें", "पुखराज धारण करें", "गुरुजनों और बड़ों की सेवा करें"]
  },
  Venus: {
    en: ["Recite Shukra Mantra", "Wear diamond", "Donate to women on Fridays"],
    hi: ["शुक्र मंत्र का पाठ करें", "हीरा धारण करें", "शुक्रवार को महिलाओं को दान करें"]
  },
  Saturn: {
    en: ["Recite Shani Mantra", "Wear blue sapphire", "Serve the poor and elderly"],
    hi: ["शनि मंत्र का पाठ करें", "नीलम धारण करें", "गरीबों और बुजुर्गों की सेवा करें"]
  }
};

// Gemstones by planet
const PLANETARY_GEMSTONES = {
  Sun: { en: "Ruby (Manik)", hi: "रूबी (माणिक)" },
  Moon: { en: "Pearl (Moti)", hi: "मोती (मोती)" },
  Mars: { en: "Red Coral (Moonga)", hi: "लाल मूंगा (मूंगा)" },
  Mercury: { en: "Emerald (Panna)", hi: "पन्ना (पन्ना)" },
  Jupiter: { en: "Yellow Sapphire (Pukhraj)", hi: "पुखराज (पुखराज)" },
  Venus: { en: "Diamond (Heera)", hi: "हीरा (हीरा)" },
  Saturn: { en: "Blue Sapphire (Neelam)", hi: "नीलम (नीलम)" },
  Rahu: { en: "Hessonite (Gomed)", hi: "गोमेद (गोमेद)" },
  Ketu: { en: "Cat's Eye (Lehsunia)", hi: "लहसुनिया (लहसुनिया)" }
};
const CAREER_FIELDS = {
  Sun: {
    en: ["Government Service", "Administration", "Leadership Roles", "Politics", "Medicine", "Engineering"],
    hi: ["सरकारी सेवा", "प्रशासन", "नेतृत्व पद", "राजनीति", "चिकित्सा", "इंजीनियरिंग"]
  },
  Moon: {
    en: ["Hospitality", "Nursing", "Psychology", "Counseling", "Food Industry", "Marine Business"],
    hi: ["आतिथ्य", "नर्सिंग", "मनोविज्ञान", "परामर्श", "खाद्य उद्योग", "समुद्री व्यवसाय"]
  },
  Mars: {
    en: ["Defense Services", "Police", "Sports", "Engineering", "Real Estate", "Manufacturing"],
    hi: ["रक्षा सेवाएं", "पुलिस", "खेल", "इंजीनियरिंग", "रियल एस्टेट", "निर्माण"]
  },
  Mercury: {
    en: ["Teaching", "Writing", "Journalism", "IT", "Accounting", "Sales", "Marketing"],
    hi: ["शिक्षण", "लेखन", "पत्रकारिता", "आईटी", "लेखांकन", "बिक्री", "मार्केटिंग"]
  },
  Jupiter: {
    en: ["Teaching", "Law", "Banking", "Finance", "Consulting", "Religious Work", "Higher Education"],
    hi: ["शिक्षण", "कानून", "बैंकिंग", "वित्त", "परामर्श", "धार्मिक कार्य", "उच्च शिक्षा"]
  },
  Venus: {
    en: ["Arts", "Entertainment", "Fashion", "Beauty Industry", "Hospitality", "Luxury Goods", "Tourism"],
    hi: ["कलाएं", "मनोरंजन", "फैशन", "सौंदर्य उद्योग", "आतिथ्य", "विलासिता वस्तुएं", "पर्यटन"]
  },
  Saturn: {
    en: ["Agriculture", "Construction", "Mining", "Labor Work", "Traditional Business", "Government Service"],
    hi: ["कृषि", "निर्माण", "खनन", "श्रम कार्य", "पारंपरिक व्यवसाय", "सरकारी सेवा"]
  },
  Rahu: {
    en: ["IT", "Foreign Trade", "Research", "Innovation", "Media", "Aviation", "Unconventional Fields"],
    hi: ["आईटी", "विदेशी व्यापार", "अनुसंधान", "नवाचार", "मीडिया", "विमानन", "अपरंपरागत क्षेत्र"]
  },
  Ketu: {
    en: ["Spiritual Work", "Healing", "Research", "Occult Sciences", "Alternative Medicine", "Social Service"],
    hi: ["आध्यात्मिक कार्य", "चिकित्सा", "अनुसंधान", "रहस्यमय विज्ञान", "वैकल्पिक चिकित्सा", "सामाजिक सेवा"]
  }
};

// Strengths by planetary positions
const PLANETARY_STRENGTHS = {
  Sun: {
    en: ["Natural leadership abilities", "Strong will power", "Administrative skills", "Authority and confidence"],
    hi: ["प्राकृतिक नेतृत्व क्षमता", "दृढ़ इच्छा शक्ति", "प्रशासनिक कौशल", "अधिकार और आत्मविश्वास"]
  },
  Moon: {
    en: ["Emotional intelligence", "Caring nature", "Intuitive abilities", "Adaptability"],
    hi: ["भावनात्मक बुद्धिमत्ता", "परवान करने वाला स्वभाव", "अंतर्ज्ञान क्षमता", "अनुकूलन क्षमता"]
  },
  Mars: {
    en: ["Courage and bravery", "Physical strength", "Competitive spirit", "Technical skills"],
    hi: ["साहस और वीरता", "शारीरिक शक्ति", "प्रतिस्पर्धी भावना", "तकनीकी कौशल"]
  },
  Mercury: {
    en: ["Excellent communication", "Analytical mind", "Quick learning", "Business acumen"],
    hi: ["उत्कृष्ट संचार", "विश्लेषणात्मक मन", "तेजी से सीखना", "व्यावसायिक कुशलता"]
  },
  Jupiter: {
    en: ["Wisdom and knowledge", "Teaching abilities", "Moral values", "Financial wisdom"],
    hi: ["ज्ञान और बुद्धिमत्ता", "शिक्षण क्षमता", "नैतिक मूल्य", "वित्तीय ज्ञान"]
  },
  Venus: {
    en: ["Artistic talents", "Social skills", "Luxury handling", "Creative abilities"],
    hi: ["कलात्मक प्रतिभा", "सामाजिक कौशल", "विलासिता संभालना", "रचनात्मक क्षमता"]
  },
  Saturn: {
    en: ["Discipline and patience", "Hard working", "Perseverance", "Traditional knowledge"],
    hi: ["अनुशासन और धैर्य", "कड़ी मेहनत", "दृढ़ता", "पारंपरिक ज्ञान"]
  }
};

// Challenges by planetary positions
const PLANETARY_CHALLENGES = {
  Sun: {
    en: ["Ego issues", "Stubbornness", "Authority conflicts", "Risk of burnout"],
    hi: ["अहंकार समस्याएं", "हठधर्मिता", "अधिकार संघर्ष", "थकान का जोखिम"]
  },
  Moon: {
    en: ["Emotional instability", "Mood swings", "Over-sensitivity", "Indecisiveness"],
    hi: ["भावनात्मक अस्थिरता", "मूड दोलन", "अति संवेदनशीलता", "अनिर्णयक्षमता"]
  },
  Mars: {
    en: ["Aggressiveness", "Impatience", "Risk of accidents", "Conflict with colleagues"],
    hi: ["आक्रामकता", "अधैर्य", "दुर्घटनाओं का जोखिम", "सहयोगियों के साथ संघर्ष"]
  },
  Mercury: {
    en: ["Overthinking", "Communication gaps", "Nervousness", "Inconsistency"],
    hi: ["अधिक सोच", "संचार अंतराल", "घबराहट", "असंगति"]
  },
  Jupiter: {
    en: ["Over-optimism", "Financial carelessness", "Procrastination", "Trust issues"],
    hi: ["अति आशावाद", "वित्तीय लापरवाही", "स्थगन", "विश्वास समस्याएं"]
  },
  Venus: {
    en: ["Luxury addiction", "Procrastination", "Social distractions", "Financial indulgence"],
    hi: ["विलासिता की लत", "स्थगन", "सामाजिक विचलन", "वित्तीय आतिशय"]
  },
  Saturn: {
    en: ["Slow progress", "Pessimism", "Work-life imbalance", "Resistance to change"],
    hi: ["धीमी प्रगति", "निराशावाद", "कार्य-जीवन असंतुलन", "परिवर्तन का प्रतिरोध"]
  }
};

export function generateCareerReport(
  name: string,
  birthDate: Date,
  moonSignIndex: number,
  ascendantIndex: number
): CareerReport {
  const moonSign = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][moonSignIndex];
  const moonSignHi = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"][moonSignIndex];
  
  const ascendant = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][ascendantIndex];
  const ascendantHi = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"][ascendantIndex];

  // Calculate sun sign (simplified)
  const sunSignIndex = (moonSignIndex + 9) % 12;
  const sunSign = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][sunSignIndex];

  // Determine dominant planets based on moon sign and ascendant
  const dominantPlanets = getDominantPlanets(moonSignIndex, ascendantIndex);
  
  // Generate career fields
  const suitableFields: string[] = [];
  const suitableFieldsHi: string[] = [];
  dominantPlanets.forEach(planet => {
    if (CAREER_FIELDS[planet]) {
      suitableFields.push(...CAREER_FIELDS[planet].en);
      suitableFieldsHi.push(...CAREER_FIELDS[planet].hi);
    }
  });

  // Generate strengths
  const strengths: string[] = [];
  const strengthsHi: string[] = [];
  dominantPlanets.forEach(planet => {
    if (PLANETARY_STRENGTHS[planet]) {
      strengths.push(...PLANETARY_STRENGTHS[planet].en);
      strengthsHi.push(...PLANETARY_STRENGTHS[planet].hi);
    }
  });

  // Generate challenges
  const challenges: string[] = [];
  const challengesHi: string[] = [];
  dominantPlanets.forEach(planet => {
    if (PLANETARY_CHALLENGES[planet]) {
      challenges.push(...PLANETARY_CHALLENGES[planet].en);
      challengesHi.push(...PLANETARY_CHALLENGES[planet].hi);
    }
  });

  // Generate recommendations
  const recommendations = [
    "Focus on developing your natural talents and abilities",
    "Choose a career that aligns with your personality traits",
    "Maintain work-life balance for long-term success",
    "Continuous learning and skill development is essential",
    "Network with professionals in your chosen field",
    "Consider both job and business opportunities based on your planetary influences"
  ];
  
  const recommendationsHi = [
    "अपनी प्राकृतिक प्रतिभाओं और क्षमताओं को विकसित करने पर ध्यान दें",
    "अपने व्यक्तित्व लक्षणों के साथ मेल खाते करियर का चयन करें",
    "दीर्घकालिक सफलता के लिए कार्य-जीवन संतुलन बनाए रखें",
    "निरंतर सीखना और कौशल विकास आवश्यक है",
    "अपने चुने हुए क्षेत्र के पेशेवरों के साथ नेटवर्क बनाएं",
    "अपने ग्रह प्रभावों के आधार पर नौकरी और व्यवसाय दोनों अवसरों पर विचार करें"
  ];

  // Enhanced planetary influences
  const sunInfluence = dominantPlanets.includes("Sun") 
    ? "Strong Sun indicates leadership potential and success in authoritative positions"
    : "Moderate Sun influence suggests steady career growth through hard work";
  
  const sunInfluenceHi = dominantPlanets.includes("Sun")
    ? "मजबूत सूर्य नेतृत्व क्षमता और प्राधिकारी पदों में सफलता दर्शाता है"
    : "मध्यम सूर्य प्रभाव कड़ी मेहनत से स्थिर करियर विकास का संकेत देता है";

  const moonInfluence = dominantPlanets.includes("Moon")
    ? "Strong Moon indicates success in caring professions and public dealing"
    : "Moderate Moon influence suggests emotional stability in career matters";
  
  const moonInfluenceHi = dominantPlanets.includes("Moon")
    ? "मजबूत चंद्रमा परवाह करने वाले पेशों और जनता से निपटने में सफलता दर्शाता है"
    : "मध्यम चंद्रमा प्रभाव करियर मामलों में भावनात्मक स्थिरता का संकेत देता है";

  const marsInfluence = dominantPlanets.includes("Mars")
    ? "Strong Mars indicates success in competitive fields and technical careers"
    : "Moderate Mars influence suggests need for strategic approach to challenges";
  
  const marsInfluenceHi = dominantPlanets.includes("Mars")
    ? "मजबूत मंगल प्रतिस्पर्धी क्षेत्रों और तकनीकी करियर में सफलता दर्शाता है"
    : "मध्यम मंगल प्रभाव चुनौतियों के प्रति रणनीतिक दृष्टिकोण की आवश्यकता का संकेत देता है";

  const mercuryInfluence = dominantPlanets.includes("Mercury")
    ? "Strong Mercury indicates success in communication and intellectual fields"
    : "Moderate Mercury influence suggests good analytical abilities";
  
  const mercuryInfluenceHi = dominantPlanets.includes("Mercury")
    ? "मजबूत बुध संचार और बौद्धिक क्षेत्रों में सफलता दर्शाता है"
    : "मध्यम बुध प्रभाव अच्छी विश्लेषणात्मक क्षमताओं का संकेत देता है";

  const jupiterInfluence = dominantPlanets.includes("Jupiter")
    ? "Strong Jupiter indicates success in teaching, finance, and advisory roles"
    : "Moderate Jupiter influence suggests steady growth through wisdom";
  
  const jupiterInfluenceHi = dominantPlanets.includes("Jupiter")
    ? "मजबूत गुरु शिक्षण, वित्त और सलाहकार भूमिकाओं में सफलता दर्शाता है"
    : "मध्यम गुरु प्रभाव ज्ञान के माध्यम से स्थिर विकास का संकेत देता है";

  // Add Venus, Saturn, Rahu, Ketu influences
  const venusInfluence = dominantPlanets.includes("Venus")
    ? "Strong Venus indicates success in creative fields, luxury industries, and entertainment"
    : "Moderate Venus influence suggests appreciation for beauty and harmony in work";
  
  const venusInfluenceHi = dominantPlanets.includes("Venus")
    ? "मजबूत शुक्र रचनात्मक क्षेत्रों, विलासिता उद्योगों और मनोरंजन में सफलता दर्शाता है"
    : "मध्यम शुक्र प्रभाव कार्य में सौंदर्य और सामंजस्य की सराहना का संकेत देता है";

  const saturnInfluence = dominantPlanets.includes("Saturn")
    ? "Strong Saturn indicates success through perseverance, traditional fields, and long-term planning"
    : "Moderate Saturn influence suggests steady progress through discipline";
  
  const saturnInfluenceHi = dominantPlanets.includes("Saturn")
    ? "मजबूत शनि दृढ़ता, पारंपरिक क्षेत्रों और दीर्घकालिक योजना के माध्यम से सफलता दर्शाता है"
    : "मध्यम शनि प्रभाव अनुशासन के माध्यम से स्थिर प्रगति का संकेत देता है";

  const rahuInfluence = dominantPlanets.includes("Rahu")
    ? "Strong Rahu indicates success in unconventional fields, foreign connections, and technology"
    : "Moderate Rahu influence suggests interest in modern and innovative approaches";
  
  const rahuInfluenceHi = dominantPlanets.includes("Rahu")
    ? "मजबूत राहु अपरंपरागत क्षेत्रों, विदेशी संबंधों और प्रौद्योगिकी में सफलता दर्शाता है"
    : "मध्यम राहु प्रभाव आधुनिक और अभिनव दृष्टिकोण में रुचि का संकेत देता है";

  const ketuInfluence = dominantPlanets.includes("Ketu")
    ? "Strong Ketu indicates success in spiritual fields, research, and healing professions"
    : "Moderate Ketu influence suggests inclination towards mystical and analytical pursuits";
  
  const ketuInfluenceHi = dominantPlanets.includes("Ketu")
    ? "मजबूत केतु आध्यात्मिक क्षेत्रों, अनुसंधान और चिकित्सा पेशों में सफलता दर्शाता है"
    : "मध्यम केतु प्रभाव रहस्यमय और विश्लेषणात्मक प्रयासों की ओर झुकाव का संकेत देता है";

  // House-based analysis
  const tenthHouseAnalysis = HOUSE_CAREER_ANALYSIS[10].en;
  const tenthHouseAnalysisHi = HOUSE_CAREER_ANALYSIS[10].hi;
  const sixthHouseAnalysis = HOUSE_CAREER_ANALYSIS[6].en;
  const sixthHouseAnalysisHi = HOUSE_CAREER_ANALYSIS[6].hi;
  const secondHouseAnalysis = HOUSE_CAREER_ANALYSIS[2].en;
  const secondHouseAnalysisHi = HOUSE_CAREER_ANALYSIS[2].hi;
  const eleventhHouseAnalysis = HOUSE_CAREER_ANALYSIS[11].en;
  const eleventhHouseAnalysisHi = HOUSE_CAREER_ANALYSIS[11].hi;

  // Current dasha (simplified)
  const dashaPlanets = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const currentDashaPlanet = dashaPlanets[Math.floor(Math.random() * dashaPlanets.length)];
  const currentDasha = `Currently running ${currentDashaPlanet} Mahadasha`;
  const currentDashaHi = `वर्तमान में ${currentDashaPlanet} महादशा चल रही है`;

  // Remedies and gemstones
  const remedies: string[] = [];
  const remediesHi: string[] = [];
  const gemstones: string[] = [];
  const gemstonesHi: string[] = [];
  
  dominantPlanets.forEach(planet => {
    if (PLANETARY_REMEDIES[planet]) {
      remedies.push(...PLANETARY_REMEDIES[planet].en);
      remediesHi.push(...PLANETARY_REMEDIES[planet].hi);
    }
    if (PLANETARY_GEMSTONES[planet]) {
      gemstones.push(PLANETARY_GEMSTONES[planet].en);
      gemstonesHi.push(PLANETARY_GEMSTONES[planet].hi);
    }
  });

  // Business vs Job analysis
  const businessPotential = dominantPlanets.includes("Mars") || dominantPlanets.includes("Saturn") || dominantPlanets.includes("Rahu") ? 8 : 5;
  const jobPotential = dominantPlanets.includes("Mercury") || dominantPlanets.includes("Jupiter") || dominantPlanets.includes("Sun") ? 8 : 5;
  
  const businessVsJobAdvice = businessPotential > jobPotential
    ? "Your chart shows strong potential for business and entrepreneurship"
    : "Your chart suggests stability and growth in job/service sector";
  
  const businessVsJobAdviceHi = businessPotential > jobPotential
    ? "आपकी कुंडली व्यवसाय और उद्यमिता की मजबूत क्षमता दर्शाती है"
    : "आपकी कुंडली नौकरी/सेवा क्षेत्र में स्थिरता और विकास का संकेत देती है";

  // Financial prospects
  const financialGrowth = dominantPlanets.includes("Jupiter") || dominantPlanets.includes("Venus")
    ? "Strong financial growth potential through career"
    : "Steady financial growth through consistent effort";
  
  const financialGrowthHi = dominantPlanets.includes("Jupiter") || dominantPlanets.includes("Venus")
    ? "करियर के माध्यम से मजबूत वित्तीय विकास की क्षमता"
    : "निरंतर प्रयास के माध्यम से स्थिर वित्तीय विकास";

  const investmentAdvice = [
    "Invest in professional development and education",
    "Consider long-term investment plans",
    "Diversify income sources based on your skills",
    "Save for retirement and future security"
  ];
  
  const investmentAdviceHi = [
    "पेशेवर विकास और शिक्षा में निवेश करें",
    "दीर्घकालिक निवेश योजनाओं पर विचार करें",
    "अपने कौशल के आधार पर आय स्रोतों को विविधता दें",
    "सेवानिवृत्ति और भविष्य की सुरक्षा के लिए बचत करें"
  ];

  // Timing predictions
  const favorablePeriods = [
    "Age 25-30: Career establishment phase",
    "Age 30-35: Growth and recognition period", 
    "Age 35-45: Peak career achievements",
    "Age 45-50: Stability and wisdom phase"
  ];
  
  const favorablePeriodsHi = [
    "उम्र 25-30: करियर स्थापना चरण",
    "उम्र 30-35: विकास और मान्यता अवधि",
    "उम्र 35-45: शिखर करियर उपलब्धियां",
    "उम्र 45-50: स्थिरता और ज्ञान चरण"
  ];

  const cautionPeriods = [
    "Age 22-25: Initial career challenges",
    "Age 28-30: Transition difficulties",
    "Age 40-42: Mid-career crisis possible",
    "Age 48-50: Health and energy concerns"
  ];
  
  const cautionPeriodsHi = [
    "उम्र 22-25: प्रारंभिक करियर चुनौतियां",
    "उम्र 28-30: संक्रमण कठिनाइयां",
    "उम्र 40-42: मध्य-करियर संकट संभव",
    "उम्र 48-50: स्वास्थ्य और ऊर्जा चिंताएं"
  ];

  // Calculate career potential score
  const careerPotential = Math.min(10, 5 + dominantPlanets.length * 0.8);

  // Success age prediction
  const successAge = careerPotential >= 8 ? "Early success expected (30-35 years)" : 
                    careerPotential >= 6 ? "Success in mature years (35-42 years)" : 
                    "Success through perseverance (40+ years)";
  
  const successAgeHi = careerPotential >= 8 ? "जल्दी सफलता की उम्मीद (30-35 वर्ष)" : 
                     careerPotential >= 6 ? "परिपक्व वर्षों में सफलता (35-42 वर्ष)" : 
                     "दृढ़ता से सफलता (40+ वर्ष)";

  // Overall outlook
  const overallOutlook = careerPotential >= 8
    ? "Excellent career prospects with high potential for success and recognition"
    : careerPotential >= 6
    ? "Good career prospects with steady growth through dedication and hard work"
    : "Moderate career prospects requiring extra effort and strategic planning";
  
  const overallOutlookHi = careerPotential >= 8
    ? "सफलता और मान्यता की उच्च क्षमता के साथ उत्कृष्ट करियर संभावनाएं"
    : careerPotential >= 6
    ? "समर्पण और कड़ी मेहनत के माध्यम से स्थिर विकास के साथ अच्छे करियर की संभावनाएं"
    : "अतिरिक्त प्रयास और रणनीतिक योजना की आवश्यकता वाली मध्यम करियर संभावनाएं";

  return {
    name,
    dateOfBirth: birthDate,
    moonSign,
    ascendant,
    sunSign,
    suitableFields: [...new Set(suitableFields)],
    suitableFieldsHi: [...new Set(suitableFieldsHi)],
    strengths: [...new Set(strengths)],
    strengthsHi: [...new Set(strengthsHi)],
    challenges: [...new Set(challenges)],
    challengesHi: [...new Set(challengesHi)],
    recommendations,
    recommendationsHi,
    sunInfluence,
    sunInfluenceHi,
    moonInfluence,
    moonInfluenceHi,
    marsInfluence,
    marsInfluenceHi,
    mercuryInfluence,
    mercuryInfluenceHi,
    jupiterInfluence,
    jupiterInfluenceHi,
    venusInfluence,
    venusInfluenceHi,
    saturnInfluence,
    saturnInfluenceHi,
    rahuInfluence,
    rahuInfluenceHi,
    ketuInfluence,
    ketuInfluenceHi,
    tenthHouseAnalysis,
    tenthHouseAnalysisHi,
    sixthHouseAnalysis,
    sixthHouseAnalysisHi,
    secondHouseAnalysis,
    secondHouseAnalysisHi,
    eleventhHouseAnalysis,
    eleventhHouseAnalysisHi,
    favorablePeriods,
    favorablePeriodsHi,
    cautionPeriods,
    cautionPeriodsHi,
    currentDasha,
    currentDashaHi,
    remedies: [...new Set(remedies)],
    remediesHi: [...new Set(remediesHi)],
    gemstones: [...new Set(gemstones)],
    gemstonesHi: [...new Set(gemstonesHi)],
    businessPotential,
    jobPotential,
    businessVsJobAdvice,
    businessVsJobAdviceHi,
    financialGrowth,
    financialGrowthHi,
    investmentAdvice,
    investmentAdviceHi,
    careerPotential,
    overallOutlook,
    overallOutlookHi,
    successAge,
    successAgeHi
  };
}

function getDominantPlanets(moonSignIndex: number, ascendantIndex: number): string[] {
  const planets: string[] = [];
  
  // Planet rulership by sign
  const signRulers = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  
  // Add moon sign ruler
  planets.push(signRulers[moonSignIndex]);
  
  // Add ascendant ruler
  planets.push(signRulers[ascendantIndex]);
  
  // Add planets based on sign characteristics
  if (moonSignIndex === 0 || ascendantIndex === 0) planets.push("Mars"); // Aries
  if (moonSignIndex === 1 || ascendantIndex === 1) planets.push("Venus"); // Taurus
  if (moonSignIndex === 2 || ascendantIndex === 2) planets.push("Mercury"); // Gemini
  if (moonSignIndex === 3 || ascendantIndex === 3) planets.push("Moon"); // Cancer
  if (moonSignIndex === 4 || ascendantIndex === 4) planets.push("Sun"); // Leo
  if (moonSignIndex === 5 || ascendantIndex === 5) planets.push("Mercury"); // Virgo
  if (moonSignIndex === 6 || ascendantIndex === 6) planets.push("Venus"); // Libra
  if (moonSignIndex === 7 || ascendantIndex === 7) planets.push("Mars"); // Scorpio
  if (moonSignIndex === 8 || ascendantIndex === 8) planets.push("Jupiter"); // Sagittarius
  if (moonSignIndex === 9 || ascendantIndex === 9) planets.push("Saturn"); // Capricorn
  if (moonSignIndex === 10 || ascendantIndex === 10) planets.push("Saturn"); // Aquarius
  if (moonSignIndex === 11 || ascendantIndex === 11) planets.push("Jupiter"); // Pisces
  
  // Add nodal influences
  if (moonSignIndex === 5 || ascendantIndex === 5) planets.push("Rahu"); // Virgo - Rahu
  if (moonSignIndex === 11 || ascendantIndex === 11) planets.push("Ketu"); // Pisces - Ketu
  
  return [...new Set(planets)];
}
