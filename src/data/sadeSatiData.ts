import { AstrologyReport, SadeSatiReport, SADE_SATI_MOON_SIGNS, SHANI_REMEDIES, getMoonSignIndex, getSunSign } from './comprehensiveAstrologyData';

export function generateSadeSatiReport(
  name: string,
  birthDate: Date,
  moonSign: string,
  saturnPosition: number
): SadeSatiReport {
  const sunSign = getSunSign(birthDate);
  const moonSignIndex = getMoonSignIndex(moonSign);
  
  // Check if currently in Sade Sati
  const moonSignName = moonSign;
  const isCurrentlyInSadeSati = SADE_SATI_MOON_SIGNS.includes(moonSignName);
  
  // Determine Sade Sati phase
  let sadeSatiPhase: "Not in Sade Sati" | "First Phase" | "Second Phase" | "Third Phase" | "Complete" = "Not in Sade Sati";
  let sadeSatiPhaseHi = "साढ़े साती में नहीं";
  
  if (isCurrentlyInSadeSati) {
    // Simplified phase calculation based on Saturn's position relative to Moon sign
    const saturnDiff = (saturnPosition - moonSignIndex + 12) % 12;
    
    if (saturnDiff === 0) {
      sadeSatiPhase = "Second Phase";
      sadeSatiPhaseHi = "दूसरा चरण";
    } else if (saturnDiff === 12 || saturnDiff === 11) {
      sadeSatiPhase = "First Phase";
      sadeSatiPhaseHi = "पहला चरण";
    } else if (saturnDiff === 1 || saturnDiff === 2) {
      sadeSatiPhase = "Third Phase";
      sadeSatiPhaseHi = "तीसरा चरण";
    }
  }
  
  // Calculate dates (simplified)
  const currentYear = new Date().getFullYear();
  const startDates = {
    firstPhase: isCurrentlyInSadeSati ? new Date(currentYear - 2, 0, 1) : undefined,
    secondPhase: isCurrentlyInSadeSati ? new Date(currentYear, 0, 1) : undefined,
    thirdPhase: isCurrentlyInSadeSati ? new Date(currentYear + 2, 0, 1) : undefined,
    endDate: isCurrentlyInSadeSati ? new Date(currentYear + 7, 0, 1) : undefined
  };
  
  // Generate current effects
  const currentEffects = generateSadeSatiEffects(sadeSatiPhase, moonSignIndex);
  
  // Generate remedies
  const remedies = [...SHANI_REMEDIES.en];
  const remediesHi = [...SHANI_REMEDIES.hi];
  
  // Shani mantra
  const shaniMantra = "Om Sham Shanicharaya Namah";
  const shaniMantraHi = "ॐ शं शनिचराय नमः";
  
  // Fasting recommendations
  const fastingRecommendations = [
    "Saturday fasting is most beneficial",
    "Avoid salt and oil on Saturdays",
    "Take simple vegetarian meals",
    "Break fast with sesame seeds and jaggery"
  ];
  
  const fastingRecommendationsHi = [
    "शनिवार का व्रत सबसे लाभदायक है",
    "शनिवार को नमक और तेल से बचें",
    "सरल शाकाहारी भोजन लें",
    "तिल और गुड़ से व्रत तोड़ें"
  ];
  
  // Donation items
  const donationItems = [
    "Black sesame seeds",
    "Mustard oil",
    "Black cloth",
    "Iron items",
    "Urad dal",
    "Shoes and umbrellas",
    "Saturn's favorite items on Saturdays"
  ];
  
  const donationItemsHi = [
    "काले तिल",
    "सरसों का तेल",
    "काले कपड़े",
    "लोहे की वस्तुएं",
    "उड़द की दाल",
    "जूते और छतरे",
    "शनिवार को शनि की पसंदीदा वस्तुएं"
  ];
  
  // Calculate overall impact
  const overallImpact = calculateSadeSatiImpact(sadeSatiPhase, moonSignIndex);
  
  // Generate peak periods
  const peakPeriods = generatePeakPeriods(sadeSatiPhase, currentYear);
  
  // Success timeline
  const successTimeline = generateSuccessTimeline(sadeSatiPhase, overallImpact);
  const successTimelineHi = generateSuccessTimelineHi(sadeSatiPhase, overallImpact);
  
  return {
    name,
    dateOfBirth: birthDate,
    moonSign,
    ascendant: "", // Will be calculated if needed
    sunSign,
    generatedAt: new Date(),
    moonSignIndex,
    isCurrentlyInSadeSati,
    sadeSatiPhase,
    sadeSatiPhaseHi,
    saturnPosition: `House ${saturnPosition}`,
    startDates,
    currentEffects,
    currentEffectsHi: currentEffects.map(e => e), // Simplified translation
    remedies,
    remediesHi,
    shaniMantra,
    shaniMantraHi,
    fastingRecommendations,
    fastingRecommendationsHi,
    donationItems,
    donationItemsHi,
    overallImpact,
    peakPeriods,
    peakPeriodsHi: peakPeriods.map(p => p), // Simplified translation
    successTimeline,
    successTimelineHi
  };
}

function generateSadeSatiEffects(
  phase: string,
  moonSignIndex: number
): string[] {
  const baseEffects = {
    "Not in Sade Sati": [
      "No Sade Sati influence currently",
      "Favorable time for new ventures",
      "Stable period for career and relationships",
      "Good health and financial prospects"
    ],
    "First Phase": [
      "Beginning of challenging period",
      "Career obstacles and delays",
      "Financial pressure increases",
      "Health needs attention",
      "Family responsibilities increase",
      "Mental stress and anxiety"
    ],
    "Second Phase": [
      "Peak of Sade Sati challenges",
      "Major life transformations",
      "Career setbacks possible",
      "Financial losses likely",
      "Health problems may escalate",
      "Relationship strains",
      "Relocation or change of residence"
    ],
    "Third Phase": [
      "Sade Sati effects gradually reducing",
      "Relief from previous challenges",
      "Career recovery begins",
      "Financial stability improves",
      "Health conditions improve",
      "New opportunities emerge",
      "Spiritual growth and wisdom"
    ],
    "Complete": [
      "Sade Sati period completed",
      "Major life lessons learned",
      "Enhanced wisdom and maturity",
      "New phase of growth begins",
      "Career and financial recovery",
      "Improved relationships"
    ]
  };
  
  return baseEffects[phase as keyof typeof baseEffects] || baseEffects["Not in Sade Sati"];
}

function calculateSadeSatiImpact(phase: string, moonSignIndex: number): number {
  const baseImpact = {
    "Not in Sade Sati": 0,
    "First Phase": 6,
    "Second Phase": 9,
    "Third Phase": 4,
    "Complete": 2
  };
  
  return baseImpact[phase as keyof typeof baseImpact] || 0;
}

function generatePeakPeriods(phase: string, currentYear: number): string[] {
  if (phase === "Not in Sade Sati") {
    return ["No peak periods currently"];
  }
  
  const periods = [];
  
  if (phase === "First Phase") {
    periods.push(`${currentYear} - Initial challenges appear`);
    periods.push(`${currentYear + 1} - Financial pressure increases`);
  } else if (phase === "Second Phase") {
    periods.push(`${currentYear} - Peak challenges period`);
    periods.push(`${currentYear + 1} - Major life transformations`);
  } else if (phase === "Third Phase") {
    periods.push(`${currentYear} - Relief begins`);
    periods.push(`${currentYear + 1} - Recovery phase starts`);
  }
  
  return periods;
}

function generateSuccessTimeline(phase: string, impact: number): string {
  if (phase === "Not in Sade Sati") {
    return "Favorable period for success. Current time is excellent for new ventures and investments.";
  }
  
  if (impact >= 8) {
    return "Success may be delayed until after Sade Sati completion. Focus on spiritual growth and patience. Major success expected after age 45.";
  } else if (impact >= 5) {
    return "Moderate challenges to success. Hard work will pay off after initial struggles. Success timeline: 2-3 years for significant achievements.";
  } else {
    return "Mild Sade Sati influence. Success achievable with consistent effort. Timeline: 1-2 years for major goals.";
  }
}

function generateSuccessTimelineHi(phase: string, impact: number): string {
  if (phase === "Not in Sade Sati") {
    return "सफलता के लिए अनुकूल अवधि। वर्तमान समय नए उद्यम और निवेश के लिए उत्कृष्ट है।";
  }
  
  if (impact >= 8) {
    return "सफलता साढ़े साती पूर्ण होने तक देरी हो सकती है। आध्यात्मिक विकास और धैर्य पर ध्यान दें। 45 वर्ष की आयु के बाद बड़ी सफलता की उम्मीद।";
  } else if (impact >= 5) {
    return "सफलता के लिए मध्यम चुनौतियां। कड़ी मेहनत प्रारंभिक संघर्ष के बाद फल देगी। सफलता का समयरेखा: महत्वपूर्ण उपलब्धियों के लिए 2-3 वर्ष।";
  } else {
    return "हल्का साढ़े साती प्रभाव। लगातार प्रयास के साथ सफलता संभव। समयरेखा: प्रमुख लक्ष्यों के लिए 1-2 वर्ष।";
  }
}
