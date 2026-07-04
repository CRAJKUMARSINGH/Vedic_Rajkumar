/**
 * Rudraksha Service - Complete 21 Mukhi Database & Recommendations
 * Week 41: Comprehensive Remedies - Rudraksha System
 */

export interface RudrakshaInfo {
  mukhi: number;
  name: string;
  nameHi: string;
  rulingPlanet: string;
  rulingDeity: string;
  rulingDeityHi: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'extremely_rare';
  benefits: { en: string[]; hi: string[] };
  wearingInstructions: { en: string[]; hi: string[] };
  mantra: string;
  mantraHi: string;
  mantraReps: number;
  price: { low: number; medium: number; high: number };
  suitableFor: string[];
}

function rud(mukhi: number, name: string, nameHi: string, planet: string,
  deity: string, deityHi: string, rarity: RudrakshaInfo['rarity'],
  benEn: string[], benHi: string[],
  wearEn: string[], wearHi: string[],
  mantra: string, mantraHi: string, reps: number,
  price: [number, number, number], suitableFor: string[]
): RudrakshaInfo {
  return {
    mukhi, name, nameHi, rulingPlanet: planet, rulingDeity: deity, rulingDeityHi: deityHi,
    rarity, benefits: { en: benEn, hi: benHi },
    wearingInstructions: { en: wearEn, hi: wearHi },
    mantra, mantraHi, mantraReps: reps,
    price: { low: price[0], medium: price[1], high: price[2] }, suitableFor
  };
}

export const RUDRAKSHA_DATABASE: RudrakshaInfo[] = [
  rud(1,'Ek Mukhi','एक मुखी',
    'Sun','Lord Shiva','भगवान शिव','extremely_rare',
    ['Supreme consciousness','Spiritual enlightenment','Removes all sins','Divine blessings','Ultimate liberation'],
    ['सर्वोच्च चेतना','आध्यात्मिक ज्ञान','सभी पापों का नाश','दिव्य आशीर्वाद','परम मुक्ति'],
    ['Wear on Monday after Puja','String in gold/silver','Wear around neck','Chant Om Namah Shivaya 108 times'],
    ['सोमवार को पूजा के बाद पहनें','सोना/चांदी में पिरोएं','गले में पहनें','ॐ नमः शिवाय 108 बार जाप करें'],
    'Om Namah Shivaya','ॐ नमः शिवाय',108,[50000,200000,1000000],
    ['Spiritual seekers','Renunciants','Advanced practitioners']),

  rud(2,'Do Mukhi','दो मुखी',
    'Moon','Ardhanarishwara','अर्धनारीश्वर','uncommon',
    ['Unity','Harmony in relationships','Emotional balance','Mother-child bond','Mental peace'],
    ['एकता','रिश्तों में सामंजस्य','भावनात्मक संतुलन','माता-शिशु बंधन','मानसिक शांति'],
    ['Wear on Monday','String in silver','Wear around neck or wrist','Wash with milk before wearing'],
    ['सोमवार को पहनें','चांदी में पिरोएं','गले या कलाई पर पहनें','पहनने से पहले दूध से धोएं'],
    'Om Chandraya Namaha','ॐ चन्द्राय नमः',108,[2000,8000,30000],
    ['Couples','Anyone with Moon affliction','Emotional imbalance']),

  rud(3,'Teen Mukhi','तीन मुखी',
    'Mars','Agni Dev','अग्नि देव','common',
    ['Self-confidence','Removes past karma','Digestive health','Energy boost','Courage'],
    ['आत्मविश्वास','पिछले कर्म दूर','पाचन स्वास्थ्य','ऊर्जा वृद्धि','साहस'],
    ['Wear on Tuesday','String in gold/copper','Can wear on arm','Wash with Ganga water'],
    ['मंगलवार को पहनें','सोना/तांबा में पिरोएं','बांह पर पहन सकते हैं','गंगाजल से धोएं'],
    'Om Kleem Namaha','ॐ क्लीं नमः',108,[500,2000,8000],
    ['Low self-esteem','Digestive issues','Mars affliction']),

  rud(4,'Char Mukhi','चार मुखी',
    'Mercury','Lord Brahma','ब्रह्मा जी','common',
    ['Knowledge','Communication','Creativity','Intelligence','Memory'],
    ['ज्ञान','संचार','रचनात्मकता','बुद्धि','स्मृति'],
    ['Wear on Wednesday','String in gold','Wear around neck','Chant Brahma mantra'],
    ['बुधवार को पहनें','सोने में पिरोएं','गले में पहनें','ब्रह्मा मंत्र जाप करें'],
    'Om Hreem Namaha','ॐ ह्रीं नमः',108,[400,1500,6000],
    ['Students','Teachers','Writers','Mercury affliction']),

  rud(5,'Panch Mukhi','पांच मुखी',
    'Jupiter','Lord Shiva (Kalagni)','शिव (कालाग्नि)','common',
    ['Health','Peace','Removes sins','Blood pressure control','General well-being'],
    ['स्वास्थ्य','शांति','पापों का नाश','रक्तचाप नियंत्रण','सामान्य कल्याण'],
    ['Can be worn any day','Most common and versatile','String in any metal','Suitable for everyone'],
    ['किसी भी दिन पहन सकते हैं','सबसे आम और बहुमुखी','किसी भी धातु में पिरोएं','सभी के लिए उपयुक्त'],
    'Om Namah Shivaya','ॐ नमः शिवाय',108,[100,500,2000],
    ['Everyone','General health','Beginners','Daily wear']),

  rud(6,'Chhah Mukhi','छह मुखी',
    'Venus','Lord Kartikeya','कार्तिकेय','common',
    ['Willpower','Focus','Grounding','Emotional stability','Learning ability'],
    ['इच्छाशक्ति','एकाग्रता','स्थिरता','भावनात्मक स्थिरता','सीखने की क्षमता'],
    ['Wear on Friday','String in gold/silver','Wear on right arm','Wash with rose water'],
    ['शुक्रवार को पहनें','सोना/चांदी में पिरोएं','दाहिनी बांह पर पहनें','गुलाब जल से धोएं'],
    'Om Hreem Hoom Namaha','ॐ ह्रीं हूं नमः',108,[300,1200,5000],
    ['Students','Venus affliction','Focus issues','Artists']),

  rud(7,'Saat Mukhi','सात मुखी',
    'Saturn','Goddess Lakshmi','देवी लक्ष्मी','uncommon',
    ['Wealth','Good fortune','Removes Shani dosha','Financial stability','Success'],
    ['धन','सौभाग्य','शनि दोष दूर','वित्तीय स्थिरता','सफलता'],
    ['Wear on Saturday','String in gold','Wear around neck','Energize on Shani Amavasya'],
    ['शनिवार को पहनें','सोने में पिरोएं','गले में पहनें','शनि अमावस्या को ऊर्जावान करें'],
    'Om Hoom Namaha','ॐ हूं नमः',108,[800,3000,12000],
    ['Financial problems','Saturn affliction','Sade Sati','Business owners']),

  rud(8,'Aath Mukhi','आठ मुखी',
    'Rahu','Lord Ganesh','भगवान गणेश','uncommon',
    ['Removes obstacles','Success in ventures','Rahu dosha remedy','Intelligence','Analytical ability'],
    ['बाधाएं दूर','उपक्रमों में सफलता','राहु दोष उपाय','बुद्धि','विश्लेषणात्मक क्षमता'],
    ['Wear on Wednesday/Saturday','String in gold','Wear around neck','Energize during Rahu Kaal'],
    ['बुधवार/शनिवार को पहनें','सोने में पिरोएं','गले में पहनें','राहु काल में ऊर्जावान करें'],
    'Om Ganeshaya Namaha','ॐ गणेशाय नमः',108,[1500,5000,20000],
    ['Rahu affliction','Obstacles in life','New ventures','Research']),

  rud(9,'Nau Mukhi','नौ मुखी',
    'Ketu','Goddess Durga','देवी दुर्गा','uncommon',
    ['Courage','Energy','Ketu dosha remedy','Fearlessness','Removes Kaal Sarp effects'],
    ['साहस','ऊर्जा','केतु दोष उपाय','निर्भयता','काल सर्प प्रभाव दूर'],
    ['Wear on Tuesday','String in gold/silver','Wear on left arm','Energize during Navratri'],
    ['मंगलवार को पहनें','सोना/चांदी में पिरोएं','बाई बांह पर पहनें','नवरात्रि में ऊर्जावान करें'],
    'Om Hreem Hoom Namaha','ॐ ह्रीं हूं नमः',108,[2000,6000,25000],
    ['Ketu affliction','Kaal Sarp dosha','Fearfulness','Lack of energy']),

  rud(10,'Das Mukhi','दस मुखी',
    'All Planets','Lord Vishnu','भगवान विष्णु','rare',
    ['Protection from evil','Pacifies all planets','Removes negative energy','Peace','Security'],
    ['बुराई से सुरक्षा','सभी ग्रह शांत','नकारात्मक ऊर्जा दूर','शांति','सुरक्षा'],
    ['Wear on any auspicious day','String in gold','Wear around neck','Energize on Ekadashi'],
    ['किसी भी शुभ दिन पहनें','सोने में पिरोएं','गले में पहनें','एकादशी पर ऊर्जावान करें'],
    'Om Hreem Namah Shivaya','ॐ ह्रीं नमः शिवाय',108,[3000,10000,40000],
    ['General planetary affliction','Negative energy','Protection seekers']),

  rud(11,'Gyarah Mukhi','ग्यारह मुखी',
    'All Planets','Lord Hanuman','भगवान हनुमान','rare',
    ['Wisdom','Adventure','Protection','Meditation','Yogic powers'],
    ['ज्ञान','साहसिक कार्य','सुरक्षा','ध्यान','योगिक शक्तियां'],
    ['Wear on Tuesday/Saturday','String in gold','Wear around neck','Energize with Hanuman Chalisa'],
    ['मंगलवार/शनिवार को पहनें','सोने में पिरोएं','गले में पहनें','हनुमान चालीसा से ऊर्जावान करें'],
    'Om Hanumate Namaha','ॐ हनुमते नमः',108,[5000,15000,60000],
    ['Yogis','Meditators','Adventurers','Protection seekers']),

  rud(12,'Barah Mukhi','बारह मुखी',
    'Sun','Lord Surya','भगवान सूर्य','rare',
    ['Radiance','Leadership','Authority','Charisma','Administrative ability'],
    ['तेज','नेतृत्व','अधिकार','करिश्मा','प्रशासनिक क्षमता'],
    ['Wear on Sunday','String in gold','Wear around neck','Energize at sunrise'],
    ['रविवार को पहनें','सोने में पिरोएं','गले में पहनें','सूर्योदय पर ऊर्जावान करें'],
    'Om Suryaya Namaha','ॐ सूर्याय नमः',108,[5000,20000,80000],
    ['Leaders','Administrators','Politicians','Sun affliction']),

  rud(13,'Terah Mukhi','तेरह मुखी',
    'Venus','Lord Kamadeva','कामदेव','very_rare',
    ['Attraction','Charisma','Hypnotic powers','Fulfillment of desires','Oratory skills'],
    ['आकर्षण','करिश्मा','सम्मोहन शक्ति','इच्छा पूर्ति','वक्तृत्व कौशल'],
    ['Wear on Friday','String in gold','Wear around neck','Energize on Purnima'],
    ['शुक्रवार को पहनें','सोने में पिरोएं','गले में पहनें','पूर्णिमा पर ऊर्जावान करें'],
    'Om Hreem Namaha','ॐ ह्रीं नमः',108,[8000,30000,120000],
    ['Public speakers','Politicians','Venus affliction','Desire fulfillment']),

  rud(14,'Chaudah Mukhi','चौदह मुखी',
    'Saturn','Lord Hanuman/Shiva','हनुमान/शिव','very_rare',
    ['Third eye activation','Intuition','Divine protection','Future vision','Supreme consciousness'],
    ['तीसरी आंख सक्रिय','अंतर्ज्ञान','दिव्य सुरक्षा','भविष्य दृष्टि','सर्वोच्च चेतना'],
    ['Wear on forehead or neck','String in gold','Energize on Maha Shivaratri','Handle with great reverence'],
    ['माथे या गले पर पहनें','सोने में पिरोएं','महाशिवरात्रि पर ऊर्जावान करें','अत्यंत श्रद्धा से रखें'],
    'Om Namah Shivaya','ॐ नमः शिवाय',108,[15000,50000,200000],
    ['Spiritual masters','Healers','Mystics','Advanced seekers']),

  rud(15,'Pandrah Mukhi','पंद्रह मुखी',
    'Mercury','Lord Pashupati','पशुपतिनाथ','very_rare',
    ['Emotional healing','Heart opening','Compassion','Inner peace','Removes attachments'],
    ['भावनात्मक उपचार','हृदय खोलना','करुणा','आंतरिक शांति','मोह दूर करता है'],
    ['Wear on any auspicious day','String in gold','Wear around neck','Energize with meditation'],
    ['किसी भी शुभ दिन पहनें','सोने में पिरोएं','गले में पहनें','ध्यान से ऊर्जावान करें'],
    'Om Namah Shivaya','ॐ नमः शिवाय',108,[20000,80000,300000],
    ['Healers','Therapists','Compassion seekers','Emotional issues']),

  rud(16,'Solah Mukhi','सोलह मुखी',
    'Moon','Lord Ram','भगवान राम','extremely_rare',
    ['Protection from disease','Fearlessness','Victory','Removes fears','Royal qualities'],
    ['रोगों से सुरक्षा','निर्भयता','विजय','भय दूर','राजसी गुण'],
    ['Wear on Monday','String in gold','Wear around neck','Energize on Ram Navami'],
    ['सोमवार को पहनें','सोने में पिरोएं','गले में पहनें','राम नवमी पर ऊर्जावान करें'],
    'Om Shri Ramaya Namaha','ॐ श्री रामाय नमः',108,[50000,150000,500000],
    ['Kings','Leaders','Fearful people','Disease protection']),

  rud(17,'Satrah Mukhi','सत्रह मुखी',
    'Saturn','Goddess Katyayani','देवी कात्यायनी','extremely_rare',
    ['Unexpected wealth','Fulfillment of wishes','Removes sudden obstacles','Fortune','Grace'],
    ['अप्रत्याशित धन','इच्छा पूर्ति','अचानक बाधाएं दूर','सौभाग्य','कृपा'],
    ['Wear on any auspicious day','String in gold','Wear around neck','Energize during Navratri'],
    ['किसी भी शुभ दिन पहनें','सोने में पिरोएं','गले में पहनें','नवरात्रि में ऊर्जावान करें'],
    'Om Namah Shivaya','ॐ नमः शिवाय',108,[80000,200000,800000],
    ['Fortune seekers','Entrepreneurs','Wish fulfillment']),

  rud(18,'Athaarah Mukhi','अठारह मुखी',
    'Earth','Goddess Bhumi Devi','भूमि देवी','extremely_rare',
    ['Health of pregnant women','Safe delivery','Grounding','Earth element balance','Prosperity'],
    ['गर्भवती स्वास्थ्य','सुरक्षित प्रसव','स्थिरता','पृथ्वी तत्व संतुलन','समृद्धि'],
    ['Wear with great care','String in gold','Wear around neck','Energize on auspicious tithis'],
    ['अत्यंत सावधानी से पहनें','सोने में पिरोएं','गले में पहनें','शुभ तिथियों पर ऊर्जावान करें'],
    'Om Hreem Shreem Namaha','ॐ ह्रीं श्रीं नमः',108,[100000,300000,1000000],
    ['Pregnant women','Land owners','Property dealers']),

  rud(19,'Unnis Mukhi','उन्नीस मुखी',
    'All','Lord Narayana','भगवान नारायण','extremely_rare',
    ['All material comforts','Success in everything','Divine grace','Supreme confidence','Removes all doshas'],
    ['सभी भौतिक सुख','सब में सफलता','दिव्य कृपा','सर्वोच्च आत्मविश्वास','सभी दोष दूर'],
    ['Extremely rare, wear with great reverence','String in gold','Puja daily','Energize on Ekadashi'],
    ['अत्यंत दुर्लभ, अत्यंत श्रद्धा से पहनें','सोने में पिरोएं','दैनिक पूजा करें','एकादशी पर ऊर्जावान करें'],
    'Om Vishnave Namaha','ॐ विष्णवे नमः',108,[200000,500000,2000000],
    ['Most powerful seekers','Extremely rare collectors']),

  rud(20,'Bees Mukhi','बीस मुखी',
    'All','Lord Brahma (Creator)','ब्रह्मा (सृष्टिकर्ता)','extremely_rare',
    ['Creation power','Divine knowledge','Supreme intellect','Brahma consciousness','Universe connection'],
    ['सृजन शक्ति','दिव्य ज्ञान','सर्वोच्च बुद्धि','ब्रह्म चेतना','ब्रह्मांड से जुड़ाव'],
    ['Extremely rare, museum grade','String in gold','Keep in puja room','Energize on Brahma Muhurta'],
    ['अत्यंत दुर्लभ, संग्रहालय श्रेणी','सोने में पिरोएं','पूजा कक्ष में रखें','ब्रह्म मुहूर्त में ऊर्जावान करें'],
    'Om Brahmadevaya Namaha','ॐ ब्रह्मदेवाय नमः',108,[500000,1000000,5000000],
    ['Collectors','Temples','Advanced spiritual practitioners']),

  rud(21,'Ikkis Mukhi','इक्कीस मुखी',
    'All','Lord Kuber & Shiva','कुबेर एवं शिव','extremely_rare',
    ['Ultimate wealth','Complete protection','Fulfills all desires','Supreme spiritual power','Rarest of all'],
    ['परम धन','पूर्ण सुरक्षा','सभी इच्छाएं पूर्ण','सर्वोच्च आध्यात्मिक शक्ति','सबसे दुर्लभ'],
    ['Rarest Rudraksha in existence','String in pure gold','Keep in sacred space','Daily worship essential'],
    ['अस्तित्व में सबसे दुर्लभ रुद्राक्ष','शुद्ध सोने में पिरोएं','पवित्र स्थान में रखें','दैनिक पूजा आवश्यक'],
    'Om Namah Shivaya','ॐ नमः शिवाय',108,[1000000,3000000,10000000],
    ['Temples','Royalty','Extremely rare collectors'])
];

/**
 * Recommend Rudraksha based on weak planets and doshas
 */
export function recommendRudraksha(
  weakPlanets: string[],
  doshas: string[]
): RudrakshaInfo[] {
  const planetToMukhi: Record<string, number[]> = {
    'Sun': [1, 12], 'Moon': [2, 16], 'Mars': [3], 'Mercury': [4, 15],
    'Jupiter': [5], 'Venus': [6, 13], 'Saturn': [7, 14, 17],
    'Rahu': [8], 'Ketu': [9]
  };

  const recommendations: RudrakshaInfo[] = [];
  
  // Always recommend 5 Mukhi (universal)
  const panch = RUDRAKSHA_DATABASE.find(r => r.mukhi === 5);
  if (panch) recommendations.push(panch);

  // Add based on weak planets
  weakPlanets.forEach(planet => {
    const mukhis = planetToMukhi[planet] || [];
    mukhis.forEach(m => {
      const rud = RUDRAKSHA_DATABASE.find(r => r.mukhi === m);
      if (rud && !recommendations.find(r => r.mukhi === m)) {
        recommendations.push(rud);
      }
    });
  });

  // Add dosha-specific
  if (doshas.includes('Kaal Sarp')) {
    const nine = RUDRAKSHA_DATABASE.find(r => r.mukhi === 9);
    if (nine && !recommendations.find(r => r.mukhi === 9)) recommendations.push(nine);
  }
  if (doshas.includes('Sade Sati')) {
    const seven = RUDRAKSHA_DATABASE.find(r => r.mukhi === 7);
    if (seven && !recommendations.find(r => r.mukhi === 7)) recommendations.push(seven);
  }

  return recommendations.slice(0, 5);
}

/**
 * Get Rudraksha by mukhi count
 */
export function getRudrakshaByMukhi(mukhi: number): RudrakshaInfo | undefined {
  return RUDRAKSHA_DATABASE.find(r => r.mukhi === mukhi);
}

export default { RUDRAKSHA_DATABASE, recommendRudraksha, getRudrakshaByMukhi };
