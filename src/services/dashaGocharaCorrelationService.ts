/**
 * Dasha–Gochar Correlation Service
 * B.V. Raman's core principle: "Transit results manifest only when supported by Dasha"
 * Cross-checks current Dasha lord's transit position for activation level
 */

export interface DashaGochaResult {
  dashaLord: string;
  antarLord: string;
  dashaLordHouseFromMoon: number;
  antarLordHouseFromMoon: number;
  dashaLordFavorable: boolean;
  antarLordFavorable: boolean;
  activationLevel: 'High' | 'Medium' | 'Low';
  score: number; // 0-100
  prediction: { en: string; hi: string };
  keyEvents: { en: string[]; hi: string[] };
  timing: { en: string; hi: string };
}

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

// Favorable houses from Moon for each planet (classical Vedic)
const FAVORABLE_HOUSES: Record<string, number[]> = {
  Sun:     [3, 6, 10, 11],
  Moon:    [1, 3, 6, 7, 10, 11],
  Mars:    [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus:   [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn:  [3, 6, 11],
  Rahu:    [3, 6, 10, 11],
  Ketu:    [3, 6, 11],
};

const ACTIVATION_PREDICTIONS: Record<string, {
  high: { en: string; hi: string };
  medium: { en: string; hi: string };
  low: { en: string; hi: string };
}> = {
  Sun: {
    high: { en: 'Excellent period for career, authority, and government matters. Father\'s health improves.', hi: 'करियर, अधिकार और सरकारी मामलों के लिए उत्कृष्ट काल। पिता का स्वास्थ्य सुधरेगा।' },
    medium: { en: 'Moderate gains in career. Some recognition possible but obstacles remain.', hi: 'करियर में मध्यम लाभ। कुछ पहचान संभव लेकिन बाधाएं भी हैं।' },
    low: { en: 'Sun Dasha active but transit weak. Delays in career matters. Avoid ego conflicts.', hi: 'सूर्य दशा सक्रिय लेकिन गोचर कमज़ोर। करियर में देरी। अहंकार संघर्ष से बचें।' },
  },
  Moon: {
    high: { en: 'Excellent for emotional well-being, public life, and mother\'s health. Travel brings gains.', hi: 'भावनात्मक स्वास्थ्य, सार्वजनिक जीवन और माता के स्वास्थ्य के लिए उत्कृष्ट।' },
    medium: { en: 'Emotional fluctuations. Some gains in public dealings. Mind needs stability.', hi: 'भावनात्मक उतार-चढ़ाव। सार्वजनिक व्यवहार में कुछ लाभ। मन को स्थिरता चाहिए।' },
    low: { en: 'Moon Dasha but transit challenging. Mental stress possible. Focus on self-care.', hi: 'चंद्र दशा लेकिन गोचर चुनौतीपूर्ण। मानसिक तनाव संभव। स्वयं की देखभाल पर ध्यान दें।' },
  },
  Jupiter: {
    high: { en: 'Most auspicious period. Expansion, wisdom, children, and spiritual growth all favored.', hi: 'सर्वाधिक शुभ काल। विस्तार, ज्ञान, संतान और आध्यात्मिक विकास सभी अनुकूल।' },
    medium: { en: 'Good period for learning and growth. Some financial gains. Spiritual inclination increases.', hi: 'सीखने और विकास के लिए अच्छा काल। कुछ आर्थिक लाभ। आध्यात्मिक झुकाव बढ़ेगा।' },
    low: { en: 'Jupiter Dasha but transit weak. Wisdom available but results delayed. Patience needed.', hi: 'गुरु दशा लेकिन गोचर कमज़ोर। ज्ञान उपलब्ध लेकिन परिणाम में देरी। धैर्य आवश्यक।' },
  },
  Saturn: {
    high: { en: 'Hard work yields results. Long-term projects succeed. Discipline brings rewards.', hi: 'कठिन परिश्रम फल देता है। दीर्घकालिक परियोजनाएं सफल। अनुशासन पुरस्कृत होता है।' },
    medium: { en: 'Slow but steady progress. Karmic lessons being learned. Avoid shortcuts.', hi: 'धीमी लेकिन स्थिर प्रगति। कर्म के पाठ सीखे जा रहे हैं। शॉर्टकट से बचें।' },
    low: { en: 'Saturn Dasha with weak transit. Heavy delays and obstacles. Spiritual practice helps.', hi: 'शनि दशा कमज़ोर गोचर के साथ। भारी देरी और बाधाएं। आध्यात्मिक अभ्यास सहायक।' },
  },
  Venus: {
    high: { en: 'Best period for love, luxury, arts, and financial gains. Relationships flourish.', hi: 'प्रेम, विलासिता, कला और आर्थिक लाभ के लिए सर्वोत्तम काल। रिश्ते फलते-फूलते हैं।' },
    medium: { en: 'Good for relationships and creative work. Some financial gains. Enjoy life moderately.', hi: 'रिश्तों और रचनात्मक कार्य के लिए अच्छा। कुछ आर्थिक लाभ। जीवन का मध्यम आनंद लें।' },
    low: { en: 'Venus Dasha but transit weak. Relationship tensions possible. Avoid overspending.', hi: 'शुक्र दशा लेकिन गोचर कमज़ोर। रिश्तों में तनाव संभव। अत्यधिक खर्च से बचें।' },
  },
  Mars: {
    high: { en: 'High energy period. Property gains, sibling support, and competitive success.', hi: 'उच्च ऊर्जा काल। संपत्ति लाभ, भाई-बहन का सहयोग और प्रतिस्पर्धात्मक सफलता।' },
    medium: { en: 'Good for physical activities and property matters. Some conflicts possible.', hi: 'शारीरिक गतिविधियों और संपत्ति मामलों के लिए अच्छा। कुछ संघर्ष संभव।' },
    low: { en: 'Mars Dasha with weak transit. Accidents and conflicts possible. Control temper.', hi: 'मंगल दशा कमज़ोर गोचर के साथ। दुर्घटनाएं और संघर्ष संभव। क्रोध पर नियंत्रण रखें।' },
  },
  Mercury: {
    high: { en: 'Excellent for business, communication, education, and intellectual pursuits.', hi: 'व्यापार, संचार, शिक्षा और बौद्धिक कार्यों के लिए उत्कृष्ट।' },
    medium: { en: 'Good for learning and trade. Some communication issues possible. Stay organized.', hi: 'सीखने और व्यापार के लिए अच्छा। कुछ संचार समस्याएं संभव। व्यवस्थित रहें।' },
    low: { en: 'Mercury Dasha but transit weak. Miscommunications likely. Double-check all documents.', hi: 'बुध दशा लेकिन गोचर कमज़ोर। गलतफहमी संभव। सभी दस्तावेज़ दोबारा जांचें।' },
  },
  Rahu: {
    high: { en: 'Transformative period. Foreign connections, technology, and unconventional gains.', hi: 'परिवर्तनकारी काल। विदेशी संबंध, प्रौद्योगिकी और अपरंपरागत लाभ।' },
    medium: { en: 'Mixed results. Some unexpected gains but also confusion. Stay grounded.', hi: 'मिश्रित परिणाम। कुछ अप्रत्याशित लाभ लेकिन भ्रम भी। ज़मीन से जुड़े रहें।' },
    low: { en: 'Rahu Dasha with weak transit. Illusions and deceptions possible. Verify everything.', hi: 'राहु दशा कमज़ोर गोचर के साथ। भ्रम और धोखा संभव। सब कुछ सत्यापित करें।' },
  },
  Ketu: {
    high: { en: 'Spiritual awakening. Past karma resolving. Detachment brings inner peace.', hi: 'आध्यात्मिक जागृति। पूर्व कर्म का समाधान। वैराग्य आंतरिक शांति लाता है।' },
    medium: { en: 'Spiritual inclination increases. Some material losses but inner gains.', hi: 'आध्यात्मिक झुकाव बढ़ता है। कुछ भौतिक हानि लेकिन आंतरिक लाभ।' },
    low: { en: 'Ketu Dasha with weak transit. Confusion and isolation possible. Seek spiritual guidance.', hi: 'केतु दशा कमज़ोर गोचर के साथ। भ्रम और एकाकीपन संभव। आध्यात्मिक मार्गदर्शन लें।' },
  },
};

const KEY_EVENTS: Record<string, { en: string[]; hi: string[] }> = {
  Sun:     { en: ['Career advancement', 'Government recognition', 'Father\'s matters', 'Health improvement'], hi: ['करियर उन्नति', 'सरकारी मान्यता', 'पिता के मामले', 'स्वास्थ्य सुधार'] },
  Moon:    { en: ['Emotional stability', 'Public recognition', 'Travel', 'Mother\'s health'], hi: ['भावनात्मक स्थिरता', 'सार्वजनिक पहचान', 'यात्रा', 'माता का स्वास्थ्य'] },
  Mars:    { en: ['Property gains', 'Sibling support', 'Physical strength', 'Competitive success'], hi: ['संपत्ति लाभ', 'भाई-बहन सहयोग', 'शारीरिक शक्ति', 'प्रतिस्पर्धात्मक सफलता'] },
  Mercury: { en: ['Business growth', 'Education success', 'Communication gains', 'Short travels'], hi: ['व्यापार वृद्धि', 'शिक्षा सफलता', 'संचार लाभ', 'छोटी यात्राएं'] },
  Jupiter: { en: ['Wisdom gains', 'Children\'s success', 'Spiritual growth', 'Financial expansion'], hi: ['ज्ञान लाभ', 'संतान की सफलता', 'आध्यात्मिक विकास', 'आर्थिक विस्तार'] },
  Venus:   { en: ['Marriage/relationship', 'Artistic success', 'Luxury purchases', 'Financial gains'], hi: ['विवाह/रिश्ते', 'कलात्मक सफलता', 'विलासिता खरीद', 'आर्थिक लाभ'] },
  Saturn:  { en: ['Long-term success', 'Karmic resolution', 'Property matters', 'Service recognition'], hi: ['दीर्घकालिक सफलता', 'कर्म समाधान', 'संपत्ति मामले', 'सेवा मान्यता'] },
  Rahu:    { en: ['Foreign opportunities', 'Technology gains', 'Unconventional success', 'Transformation'], hi: ['विदेशी अवसर', 'प्रौद्योगिकी लाभ', 'अपरंपरागत सफलता', 'परिवर्तन'] },
  Ketu:    { en: ['Spiritual progress', 'Past karma resolution', 'Detachment', 'Mystical experiences'], hi: ['आध्यात्मिक प्रगति', 'पूर्व कर्म समाधान', 'वैराग्य', 'रहस्यमय अनुभव'] },
};

export function calculateDashaGochaCorrelation(
  dashaLord: string,
  antarLord: string,
  transitHouses: Record<string, number>  // planet → house from Moon
): DashaGochaResult {
  const dashaHouse = transitHouses[dashaLord] ?? 0;
  const antarHouse = transitHouses[antarLord] ?? 0;

  const dashaFav = FAVORABLE_HOUSES[dashaLord]?.includes(dashaHouse) ?? false;
  const antarFav = FAVORABLE_HOUSES[antarLord]?.includes(antarHouse) ?? false;

  let activationLevel: 'High' | 'Medium' | 'Low';
  let score: number;

  if (dashaFav && antarFav) {
    activationLevel = 'High';
    score = 85 + Math.floor(Math.random() * 10);
  } else if (dashaFav || antarFav) {
    activationLevel = 'Medium';
    score = 55 + Math.floor(Math.random() * 20);
  } else {
    activationLevel = 'Low';
    score = 20 + Math.floor(Math.random() * 25);
  }

  const predMap = ACTIVATION_PREDICTIONS[dashaLord] ?? ACTIVATION_PREDICTIONS['Sun'];
  const predKey = activationLevel === 'High' ? 'high' : activationLevel === 'Medium' ? 'medium' : 'low';
  const prediction = predMap[predKey];

  const timing = {
    en: activationLevel === 'High'
      ? 'Events likely within 1–3 months. Act on opportunities now.'
      : activationLevel === 'Medium'
      ? 'Events possible in 3–6 months. Prepare and wait for right moment.'
      : 'Delays expected. Results may take 6–12 months. Focus on inner work.',
    hi: activationLevel === 'High'
      ? 'घटनाएं 1-3 महीनों में संभव। अभी अवसरों पर कार्य करें।'
      : activationLevel === 'Medium'
      ? 'घटनाएं 3-6 महीनों में संभव। तैयारी करें और सही समय की प्रतीक्षा करें।'
      : 'देरी अपेक्षित। परिणाम 6-12 महीने ले सकते हैं। आंतरिक कार्य पर ध्यान दें।',
  };

  return {
    dashaLord,
    antarLord,
    dashaLordHouseFromMoon: dashaHouse,
    antarLordHouseFromMoon: antarHouse,
    dashaLordFavorable: dashaFav,
    antarLordFavorable: antarFav,
    activationLevel,
    score,
    prediction,
    keyEvents: KEY_EVENTS[dashaLord] ?? { en: [], hi: [] },
    timing,
  };
}
