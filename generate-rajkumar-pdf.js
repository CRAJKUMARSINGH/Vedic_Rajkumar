// Script to generate Rajkumar's transit PDF
// Birth: 15 Sep 1963, 6:00 AM, Udaipur
// Moon Sign: Cancer (Karka)
// Transit Date: 23 Feb 2026

const transitResults = [
  {
    planet: { en: "Sun", hi: "सूर्य", symbol: "☉" },
    currentRashi: 10, // Aquarius
    houseFromMoon: 8,
    baseFavorable: false,
    vedhaActive: false,
    effectiveStatus: "unfavorable",
    scoreContribution: 0,
    rating: 3,
    effectEn: "Challenges: health issues, stress, financial losses, obstacles. Avoid risks",
    effectHi: "चुनौतियाँ: स्वास्थ्य, तनाव, आर्थिक हानि, बाधाएं। जोखिम से बचें"
  },
  {
    planet: { en: "Moon", hi: "चन्द्र", symbol: "☽" },
    currentRashi: 0, // Aries
    houseFromMoon: 10,
    baseFavorable: true,
    vedhaActive: false,
    effectiveStatus: "favorable",
    scoreContribution: 1,
    rating: 7,
    effectEn: "Career boost, productivity, recognition. Good for professional pursuits",
    effectHi: "कार्य सफलता, उत्पादकता, मान्यता। व्यावसायिक कार्यों में शुभ"
  },
  {
    planet: { en: "Mercury", hi: "बुध", symbol: "☿" },
    currentRashi: 10, // Aquarius
    houseFromMoon: 8,
    baseFavorable: true,
    vedhaActive: false,
    effectiveStatus: "favorable",
    scoreContribution: 1,
    rating: 7,
    effectEn: "Anxiety, miscommunication, hidden issues, document errors. Be careful with travel",
    effectHi: "चिंता, गलत संवाद, छिपी समस्याएं, दस्तावेज़ त्रुटि। यात्रा में सावधानी"
  },
  {
    planet: { en: "Venus", hi: "शुक्र", symbol: "♀" },
    currentRashi: 10, // Aquarius
    houseFromMoon: 8,
    baseFavorable: true,
    vedhaActive: false,
    effectiveStatus: "favorable",
    scoreContribution: 1,
    rating: 7,
    effectEn: "Relationship/finance ups-downs, unexpected expenses, emotional turmoil. Hidden gains possible",
    effectHi: "संबंधों/वित्त में उतार-चढ़ाव, अप्रत्याशित खर्च, भावनात्मक उथल-पुथल। छिपे लाभ संभव"
  },
  {
    planet: { en: "Mars", hi: "मंगल", symbol: "♂" },
    currentRashi: 9, // Capricorn
    houseFromMoon: 7,
    baseFavorable: false,
    vedhaActive: false,
    effectiveStatus: "unfavorable",
    scoreContribution: 0,
    rating: 3,
    effectEn: "Partnership tensions, arguments, health concerns for spouse. Avoid confrontations",
    effectHi: "साझेदारी में तनाव, वाद-विवाद, जीवनसाथी स्वास्थ्य चिंता। टकराव से बचें"
  },
  {
    planet: { en: "Jupiter", hi: "गुरु", symbol: "♃" },
    currentRashi: 2, // Gemini
    houseFromMoon: 12,
    baseFavorable: false,
    vedhaActive: false,
    effectiveStatus: "unfavorable",
    scoreContribution: 0,
    rating: 4,
    effectEn: "Increased expenses, isolation, setbacks in growth. Supports spiritual pursuits, foreign matters",
    effectHi: "खर्च वृद्धि, एकांत, विकास में बाधा। आध्यात्मिक कार्य, विदेशी मामलों में सहायक"
  },
  {
    planet: { en: "Saturn", hi: "शनि", symbol: "♄" },
    currentRashi: 11, // Pisces
    houseFromMoon: 9,
    baseFavorable: false,
    vedhaActive: false,
    effectiveStatus: "unfavorable",
    scoreContribution: 0,
    rating: 3,
    effectEn: "Delays in luck, travel, higher education. Feels burdensome",
    effectHi: "भाग्य/यात्रा/उच्च शिक्षा में विलंब। बोझिल अनुभव"
  },
  {
    planet: { en: "Rahu", hi: "राहु", symbol: "☊" },
    currentRashi: 10, // Aquarius
    houseFromMoon: 8,
    baseFavorable: false,
    vedhaActive: false,
    effectiveStatus: "unfavorable",
    scoreContribution: 0,
    rating: 3,
    effectEn: "Sudden changes, mysteries, health scares. Potential for transformative insights. Unpredictable",
    effectHi: "अचानक परिवर्तन, रहस्य, स्वास्थ्य भय। परिवर्तनकारी अंतर्दृष्टि संभव। अप्रत्याशित"
  },
  {
    planet: { en: "Ketu", hi: "केतु", symbol: "☋" },
    currentRashi: 4, // Leo
    houseFromMoon: 2,
    baseFavorable: false,
    vedhaActive: false,
    effectiveStatus: "unfavorable",
    scoreContribution: 0,
    rating: 3,
    effectEn: "Family/finance/speech disruptions, spiritual detachment. Detachment-oriented effects",
    effectHi: "परिवार/वित्त/वाणी में व्यवधान, आध्यात्मिक वैराग्य। विरक्ति उन्मुख प्रभाव"
  }
];

console.log("Rajkumar's Transit Analysis");
console.log("Birth: 15 September 1963, 6:00 AM, Udaipur");
console.log("Moon Sign: Cancer (Karka)");
console.log("Transit Date: 23 February 2026");
console.log("\nOverall Score: 3/9");
console.log("\nPlanetary Positions:");
console.log(JSON.stringify(transitResults, null, 2));
