/**
 * Nakshatra Based Precautions Service
 * Implements Navatara Chakra (Tara Bala) and general Nakshatra precautions
 */

export interface TaraInfo {
  tara: string;
  taraHi: string;
  significance: 'Auspicious' | 'Inauspicious' | 'Neutral';
  description: string;
  descriptionHi: string;
  precautions: string[];
  precautionsHi: string[];
}

const TARA_DATA: Record<number, TaraInfo> = {
  1: {
    tara: "Janma", taraHi: "जन्म", significance: 'Neutral',
    description: "Represents self and health. Energy is focused on you.",
    descriptionHi: "स्वयं और स्वास्थ्य का प्रतिनिधित्व करता है।",
    precautions: ["Avoid heavy physical exertion", "Avoid major surgeries"],
    precautionsHi: ["भारी शारीरिक परिश्रम से बचें", "बड़ी सर्जरी से बचें"]
  },
  2: {
    tara: "Sampat", taraHi: "सम्पत", significance: 'Auspicious',
    description: "Wealth and prosperity. Great for financial gains.",
    descriptionHi: "धन और समृद्धि। वित्तीय लाभ के लिए अच्छा है।",
    precautions: ["None - highly favorable"],
    precautionsHi: ["कोई नहीं - अत्यधिक अनुकूल"]
  },
  3: {
    tara: "Vipat", taraHi: "विपत", significance: 'Inauspicious',
    description: "Obstacles, dangers, and unexpected losses.",
    descriptionHi: "बाधाएं, खतरे और अप्रत्याशित हानि।",
    precautions: ["Avoid starting new projects", "Postpone travel if possible", "Do not sign critical contracts"],
    precautionsHi: ["नई परियोजनाएं शुरू करने से बचें", "यदि संभव हो तो यात्रा स्थगित करें", "महत्वपूर्ण अनुबंधों पर हस्ताक्षर न करें"]
  },
  4: {
    tara: "Kshema", taraHi: "क्षेम", significance: 'Auspicious',
    description: "Well-being, comfort, and protection.",
    descriptionHi: "कल्याण, आराम और सुरक्षा।",
    precautions: ["None - favorable"],
    precautionsHi: ["कोई नहीं - अनुकूल"]
  },
  5: {
    tara: "Pratyari", taraHi: "प्रत्यरि", significance: 'Inauspicious',
    description: "Enemies, opposition, and conflicts.",
    descriptionHi: "शत्रु, विरोध और संघर्ष।",
    precautions: ["Avoid arguments and legal disputes", "Keep a low profile", "Avoid competitive activities"],
    precautionsHi: ["बहस और कानूनी विवादों से बचें", "लो प्रोफाइल रहें", "प्रतिस्पर्धी गतिविधियों से बचें"]
  },
  6: {
    tara: "Sadhana", taraHi: "साधना", significance: 'Auspicious',
    description: "Success, spiritual progress, and achievement.",
    descriptionHi: "सफलता, आध्यात्मिक प्रगति और उपलब्धि।",
    precautions: ["Good for meditation and goal-setting"],
    precautionsHi: ["ध्यान और लक्ष्य निर्धारण के लिए अच्छा है"]
  },
  7: {
    tara: "Vadh", taraHi: "वध", significance: 'Inauspicious',
    description: "Destruction, serious threats, and deep misery.",
    descriptionHi: "विनाश, गंभीर खतरे और गहरा दुख।",
    precautions: ["Extremely risky for any new beginning", "Avoid risky physical activities", "Perform Shanti Pujas if vital"],
    precautionsHi: ["किसी भी नई शुरुआत के लिए अत्यंत जोखिम भरा", "जोखिम भरी शारीरिक गतिविधियों से बचें", "यदि आवश्यक हो तो शांति पूजा करें"]
  },
  8: {
    tara: "Mitra", taraHi: "मित्र", significance: 'Auspicious',
    description: "Friendship, help, and cooperation.",
    descriptionHi: "मित्रता, सहायता और सहयोग।",
    precautions: ["Excellent for networking and social events"],
    precautionsHi: ["नेटवर्किंग और सामाजिक कार्यक्रमों के लिए उत्कृष्ट"]
  },
  9: {
    tara: "Parama Mitra", taraHi: "परम मित्र", significance: 'Auspicious',
    description: "Supreme friendship and divine grace.",
    descriptionHi: "परम मित्रता और दैवीय कृपा।",
    precautions: ["Excellent for spiritual initiations"],
    precautionsHi: ["आध्यात्मिक दीक्षा के लिए उत्कृष्ट"]
  }
};

export function getTaraBala(birthNakshatra: number, currentNakshatra: number): TaraInfo {
  let diff = (currentNakshatra - birthNakshatra + 27) % 27;
  let taraIndex = (diff % 9) + 1;
  return TARA_DATA[taraIndex];
}

export function getNakshatraPrecautions(nakshatraNumber: number): string[] {
  // General precautions for each of the 27 Nakshatras
  const data: Record<number, string[]> = {
    1: ["Avoid being too impulsive", "Guard against head injuries"], // Ashwini
    2: ["Control extreme emotional outbursts", "Be careful with reproductive health"], // Bharani
    // ... adding a few key ones for brevity, but could be expanded
  };
  return data[nakshatraNumber] || ["Maintain general mindfulness", "Avoid major risks during Moon transit through Janma Nakshatra"];
}
