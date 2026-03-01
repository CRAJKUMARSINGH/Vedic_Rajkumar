import { AstrologyReport, ManglikReport, MANGLIK_HOUSES, MANGLIK_CANCELLATION_CONDITIONS, getMoonSignIndex, getAscendantIndex, getSunSign, PLANETS } from './comprehensiveAstrologyData';

export function generateManglikReport(
  name: string,
  birthDate: Date,
  moonSign: string,
  ascendant: string,
  marsHouse: number
): ManglikReport {
  const sunSign = getSunSign(birthDate);
  const moonSignIndex = getMoonSignIndex(moonSign);
  const ascendantIndex = getAscendantIndex(ascendant);
  
  // Check if Mars is in Manglik houses
  const hasManglikYoga = MANGLIK_HOUSES.includes(marsHouse);
  
  // Determine Manglik type
  let manglikType: "No Manglik" | "Partial Manglik" | "Full Manglik" | "Double Manglik" = "No Manglik";
  let manglikTypeHi = "कोई मांगलिक योग नहीं";
  let intensity = 0;
  
  if (hasManglikYoga) {
    // Check for multiple Manglik placements (simplified)
    const marsInAscendant = marsHouse === ascendantIndex + 1;
    const marsInMoonSign = marsHouse === moonSignIndex + 1;
    
    if (marsInAscendant && marsInMoonSign) {
      manglikType = "Double Manglik";
      manglikTypeHi = "दोहरा मांगलिक योग";
      intensity = 9;
    } else if (marsInAscendant || marsInMoonSign) {
      manglikType = "Full Manglik";
      manglikTypeHi = "पूर्ण मांगलिक योग";
      intensity = 7;
    } else {
      manglikType = "Partial Manglik";
      manglikTypeHi = "आंशिक मांगलिक योग";
      intensity = 5;
    }
  }
  
  // Manglik planets (simplified - just Mars for now)
  const manglikPlanets = hasManglikYoga ? ["Mars"] : [];
  const affectedHouses = hasManglikYoga ? [marsHouse] : [];
  
  // Generate effects based on Manglik type
  const effects = generateManglikEffects(manglikType, marsHouse);
  
  // Generate remedies
  const remedies = generateManglikRemedies(manglikType, marsHouse);
  
  // Calculate marriage compatibility
  const marriageCompatibility = hasManglikYoga ? Math.max(3, 10 - intensity) : 8;
  
  // Check cancellation conditions
  const cancellationConditions = hasManglikYoga ? 
    MANGLIK_CANCELLATION_CONDITIONS.en.slice(0, 3) : [];
  const cancellationConditionsHi = hasManglikYoga ? 
    MANGLIK_CANCELLATION_CONDITIONS.hi.slice(0, 3) : [];
  
  // Generate overall advice
  const overallAdvice = generateManglikAdvice(manglikType, intensity, marriageCompatibility);
  const overallAdviceHi = generateManglikAdviceHi(manglikType, intensity, marriageCompatibility);
  
  return {
    name,
    dateOfBirth: birthDate,
    moonSign,
    ascendant,
    sunSign,
    generatedAt: new Date(),
    hasManglikYoga,
    manglikType,
    manglikTypeHi,
    manglikPlanets,
    affectedHouses,
    intensity,
    effects,
    remedies,
    marriageCompatibility,
    cancellationConditions,
    cancellationConditionsHi,
    overallAdvice,
    overallAdviceHi
  };
}

function generateManglikEffects(
  manglikType: string,
  marsHouse: number
): ManglikReport['effects'] {
  const houseEffects = {
    1: {
      positive: ["Strong leadership qualities", "Independent nature", "Courage", "Physical strength"],
      negative: ["Aggressive behavior", "Marriage delays", "Health issues", "Accidents"],
      positiveHi: ["मजबूत नेतृत्व गुण", "स्वतंत्र प्रकृति", "साहस", "शारीरिक शक्ति"],
      negativeHi: ["आक्रामक व्यवहार", "विवाह में देरी", "स्वास्थ्य समस्याएं", "दुर्घटनाएं"]
    },
    2: {
      positive: ["Financial gains", "Family support", "Good speech", "Property benefits"],
      negative: ["Family disputes", "Financial instability", "Speech problems", "Property losses"],
      positiveHi: ["वित्तीय लाभ", "पारिवारिक समर्थन", "अच्छा भाषण", "संपत्ति लाभ"],
      negativeHi: ["पारिवारिक विवाद", "वित्तीय अस्थिरता", "भाषण समस्याएं", "संपत्ति हानि"]
    },
    4: {
      positive: ["Property ownership", "Vehicle comfort", "Domestic happiness", "Mother's support"],
      negative: ["Property disputes", "Vehicle accidents", "Mother's health issues", "Domestic problems"],
      positiveHi: ["संपत्ति स्वामित्व", "वाहन सुख", "घरेलू खुशी", "मां का समर्थन"],
      negativeHi: ["संपत्ति विवाद", "वाहन दुर्घटनाएं", "मां की स्वास्थ्य समस्याएं", "घरेलू समस्याएं"]
    },
    7: {
      positive: ["Business success", "Partnership benefits", "Spouse's support", "Social status"],
      negative: ["Marriage delays", "Partnership losses", "Spouse's health issues", "Legal problems"],
      positiveHi: ["व्यवसाय सफलता", "साझेदारी लाभ", "जीवनसाथी का समर्थन", "सामाजिक दर्जा"],
      negativeHi: ["विवाह में देरी", "साझेदारी हानि", "जीवनसाथी की स्वास्थ्य समस्याएं", "कानूनी समस्याएं"]
    },
    8: {
      positive: ["Longevity", "Hidden wealth", "Research abilities", "Spiritual inclination"],
      negative: ["Health issues", "Financial losses", "Accidents", "Chronic diseases"],
      positiveHi: ["दीर्घायु", "छिपी हुई संपत्ति", "अनुसंधान क्षमता", "आध्यात्मिक झुकाव"],
      negativeHi: ["स्वास्थ्य समस्याएं", "वित्तीय हानि", "दुर्घटनाएं", "पुरानी बीमारियां"]
    },
    12: {
      positive: ["Foreign travel", "Spiritual growth", "Hidden gains", "Salvation"],
      negative: ["Financial losses", "Health expenses", "Legal troubles", "Isolation"],
      positiveHi: ["विदेशी यात्रा", "आध्यात्मिक विकास", "छिपे हुए लाभ", "मुक्ति"],
      negativeHi: ["वित्तीय हानि", "स्वास्थ्य खर्च", "कानूनी परेशानियां", "अलगाव"]
    }
  };
  
  const effects = houseEffects[marsHouse as keyof typeof houseEffects] || {
    positive: ["Energy and drive", "Determination", "Courage"],
    negative: ["Impulsiveness", "Aggression", "Conflict"],
    positiveHi: ["ऊर्जा और जुनून", "दृढ़ संकल्प", "साहस"],
    negativeHi: ["आवेगपूर्णता", "आक्रामकता", "संघर्ष"]
  };
  
  return effects;
}

function generateManglikRemedies(
  manglikType: string,
  marsHouse: number
): [string[], string[]] {
  const generalRemedies = [
    "Recite Hanuman Chalisa daily",
    "Fast on Tuesdays",
    "Donate red items on Tuesdays",
    "Wear red coral (Moonga) after consultation",
    "Visit Hanuman temple every Tuesday",
    "Offer sindoor to Hanuman",
    "Feed red lentils to cows",
    "Avoid anger and aggressive behavior"
  ];
  
  const generalRemediesHi = [
    "प्रतिदिन हनुमान चालीसा का पाठ करें",
    "मंगलवार का व्रत रखें",
    "मंगलवार को लाल वस्तुएं दान करें",
    "परामर्श के बाद लाल मूंगा धारण करें",
    "प्रत्येक मंगलवार हनुमान मंदिर जाएं",
    "हनुमान को सिंदूर अर्पित करें",
    "गायों को लाल मसूर की दाल खिलाएं",
    "गुस्से और आक्रामक व्यवहार से बचें"
  ];
  
  if (!generalRemedies || !generalRemediesHi) {
    return [[], []];
  }
  
  // Add specific remedies based on house
  const houseSpecificRemedies = getHouseSpecificManglikRemedies(marsHouse);
  
  return [
    [...generalRemedies, ...houseSpecificRemedies.en],
    [...generalRemediesHi, ...houseSpecificRemedies.hi]
  ];
}

function getHouseSpecificManglikRemedies(house: number): { en: string[]; hi: string[] } {
  const remedies = {
    1: {
      en: ["Apply sandalwood paste on forehead", "Donate copper items"],
      hi: ["माथे पर चंदन का पेस्ट लगाएं", "तांबे की वस्तुएं दान करें"]
    },
    2: {
      en: ["Feed sugar to ants", "Donate silver items"],
      hi: ["चीटियों को चीनी खिलाएं", "चांदी की वस्तुएं दान करें"]
    },
    4: {
      en: ["Serve mother", "Donate rice and milk"],
      hi: ["मां की सेवा करें", "चावल और दूध दान करें"]
    },
    7: {
      en: ["Respect spouse", "Donate to married women"],
      hi: ["जीवनसाथी का सम्मान करें", "विवाहित महिलाओं को दान करें"]
    },
    8: {
      en: ["Serve elderly", "Donate black items"],
      hi: ["बुजुर्गों की सेवा करें", "काली वस्तुएं दान करें"]
    },
    12: {
      en: ["Donate to charities", "Feed poor people"],
      hi: ["धर्मार्थ संस्थाओं को दान करें", "गरीब लोगों को भोजन दें"]
    }
  };
  
  return remedies[house as keyof typeof remedies] || { en: [], hi: [] };
}

function generateManglikAdvice(
  manglikType: string,
  intensity: number,
  marriageCompatibility: number
): string {
  if (manglikType === "No Manglik") {
    return "Your chart shows no Manglik Yoga, which is favorable for smooth relationships and marriage. Continue maintaining positive relationships and regular spiritual practices.";
  }
  
  if (manglikType === "Double Manglik") {
    return "Your chart shows strong Manglik influences. It's highly recommended to marry another Manglik person or perform specific remedies before marriage. Regular meditation and spiritual practices are essential for balancing Mars energy.";
  }
  
  if (manglikType === "Full Manglik") {
    return "Manglik Yoga is present in your chart. Consider marrying a Manglik partner or perform thorough remedies. Your determination and courage are assets, but channel them positively through sports, fitness, or spiritual disciplines.";
  }
  
  return "Partial Manglik influence is present. While not severe, it's beneficial to perform some remedies and be mindful in relationships. Your energy and drive can be directed toward constructive goals.";
}

function generateManglikAdviceHi(
  manglikType: string,
  intensity: number,
  marriageCompatibility: number
): string {
  if (manglikType === "No Manglik") {
    return "आपकी कुंडली में कोई मांगलिक योग नहीं है, जो सुखद रिश्तों और विवाह के लिए अनुकूल है। सकारात्मक संबंध बनाए रखें और नियमित आध्यात्मिक अभ्यास जारी रखें।";
  }
  
  if (manglikType === "Double Manglik") {
    return "आपकी कुंडली मजबूत मांगलिक प्रभाव दर्शाती है। अत्यधिक अनुशंसित है कि आप एक अन्य मांगलिक व्यक्ति से विवाह करें या विवाह से पहले विशिष्ट उपाय करें। मंग्र ऊर्जा को संतुलित करने के लिए नियमित ध्यान और आध्यात्मिक अभ्यास आवश्यक हैं।";
  }
  
  if (manglikType === "Full Manglik") {
    return "आपकी कुंडली में मांगलिक योग मौजूद है। मांगलिक साथी से विवाह पर विचार करें या पूर्ण उपाय करें। आपका दृढ़ संकल्प और साहस संपत्ति हैं, लेकिन इन्हें खेल, फिटनेस, या आध्यात्मिक अनुशासनों के माध्यम से सकारात्मक रूप से निर्देशित करें।";
  }
  
  return "आंशिक मांगलिक प्रभाव मौजूद है। जबकि गंभीर नहीं, रिश्तों में सचेत रहने और कुछ उपाय करने के लिए फायदेमंद है। अपनी ऊर्जा और जुनून को रचनात्मक लक्ष्यों की ओर निर्देशित करें।";
}
