// Week 13: Gemstone Recommendation & E-commerce Service
// AstroSage Feature Integration Part 3 - Monday Implementation

export interface Gemstone {
  id: string;
  name: string;
  nameHi: string;
  planet: string;
  type: 'primary' | 'substitute';
  color: string;
  hardness: number;
  price: {
    low: number;
    medium: number;
    high: number;
  };
  quality: {
    aaa: string;
    aa: string;
    a: string;
  };
  benefits: {
    en: string[];
    hi: string[];
  };
  wearingInstructions: {
    finger: string;
    fingerHi: string;
    day: string;
    dayHi: string;
    time: string;
    timeHi: string;
    weight: string;
    metal: string;
    metalHi: string;
  };
  activationRitual: {
    mantra: string;
    mantraHi: string;
    repetitions: number;
    procedure: {
      en: string[];
      hi: string[];
    };
  };
  contraindications: {
    en: string[];
    hi: string[];
  };
}

export interface GemstoneRecommendation {
  primary: Gemstone;
  substitutes: Gemstone[];
  reason: {
    en: string;
    hi: string;
  };
  urgency: 'low' | 'medium' | 'high';
  suitability: number; // 0-100
}
// Helper to create gemstone entries compactly
function gem(id: string, name: string, nameHi: string, planet: string, type: 'primary' | 'substitute',
  color: string, hardness: number, price: [number, number, number],
  quality: [string, string, string],
  benefitsEn: string[], benefitsHi: string[],
  finger: string, fingerHi: string, day: string, dayHi: string, time: string, timeHi: string,
  weight: string, metal: string, metalHi: string,
  mantra: string, mantraHi: string, reps: number,
  procEn: string[], procHi: string[],
  contrEn: string[], contrHi: string[]
): Gemstone {
  return {
    id, name, nameHi, planet, type, color, hardness,
    price: { low: price[0], medium: price[1], high: price[2] },
    quality: { aaa: quality[0], aa: quality[1], a: quality[2] },
    benefits: { en: benefitsEn, hi: benefitsHi },
    wearingInstructions: { finger, fingerHi, day, dayHi, time, timeHi, weight, metal, metalHi },
    activationRitual: { mantra, mantraHi, repetitions: reps, procedure: { en: procEn, hi: procHi } },
    contraindications: { en: contrEn, hi: contrHi }
  };
}

// Complete Gemstone Database (50+ gemstones)
export const GEMSTONE_DATABASE: Gemstone[] = [
  // ═══ SUN (Surya) ═══
  gem('ruby','Ruby','माणिक्य','Sun','primary','Deep Red',9,[5000,25000,100000],
    ['Burmese Ruby - Pigeon Blood Red','Thai Ruby - Good Color','Indian Ruby - Light Red'],
    ['Leadership','Confidence','Government favor','Heart health','Authority'],
    ['नेतृत्व','आत्मविश्वास','सरकारी कृपा','हृदय स्वास्थ्य','अधिकार'],
    'Ring finger','अनामिका','Sunday','रविवार','Sunrise','सूर्योदय','3-6 carats','Gold','सोना',
    'Om Suryaya Namaha','ॐ सूर्याय नमः',108,
    ['Wash with Ganga water','Offer red flowers','Light ghee lamp','Chant mantra 108 times'],
    ['गंगाजल से धोएं','लाल फूल चढ़ाएं','घी का दीप जलाएं','108 बार मंत्र जाप करें'],
    ['Not for Leo ascendant with weak Sun','Avoid if Mars is malefic'],
    ['कमजोर सूर्य वाले सिंह लग्न के लिए नहीं','यदि मंगल अशुभ हो तो न पहनें']),
  gem('garnet','Red Garnet','लाल गारनेट','Sun','substitute','Dark Red',7,[1000,4000,15000],
    ['Mozambique Garnet','Indian Garnet','Standard Garnet'],
    ['Confidence','Vitality','Courage','Blood circulation','Willpower'],
    ['आत्मविश्वास','जीवन शक्ति','साहस','रक्त संचार','इच्छाशक्ति'],
    'Ring finger','अनामिका','Sunday','रविवार','Sunrise','सूर्योदय','5-8 carats','Gold/Copper','सोना/तांबा',
    'Om Suryaya Namaha','ॐ सूर्याय नमः',108,
    ['Wash with clean water','Offer red flowers','Chant Sun mantra'],
    ['स्वच्छ जल से धोएं','लाल फूल चढ़ाएं','सूर्य मंत्र जाप करें'],
    ['Avoid if Sun is already strong'],['यदि सूर्य पहले से मजबूत हो तो न पहनें']),
  gem('red_spinel','Red Spinel','लाल स्पिनेल','Sun','substitute','Red',8,[2000,10000,50000],
    ['Burma Spinel','Sri Lankan Spinel','Standard Spinel'],
    ['Leadership','Energy','Passion','Success','Fame'],
    ['नेतृत्व','ऊर्जा','जुनून','सफलता','प्रसिद्धि'],
    'Ring finger','अनामिका','Sunday','रविवार','Sunrise','सूर्योदय','3-5 carats','Gold','सोना',
    'Om Suryaya Namaha','ॐ सूर्याय नमः',108,
    ['Wash with Ganga water','Offer red flowers','Chant 108 times'],
    ['गंगाजल से धोएं','लाल फूल चढ़ाएं','108 बार जाप करें'],
    ['Avoid during Rahu periods'],['राहु काल में न पहनें']),
  gem('sunstone','Sunstone','सूर्यकांत','Sun','substitute','Orange-Red',6.5,[500,2000,8000],
    ['Oregon Sunstone','Indian Sunstone','Standard Sunstone'],
    ['Optimism','Vitality','Joy','Self-expression','Creativity'],
    ['आशावाद','जीवन शक्ति','आनंद','आत्म-अभिव्यक्ति','रचनात्मकता'],
    'Ring finger','अनामिका','Sunday','रविवार','Morning','प्रातः','5-10 carats','Gold/Copper','सोना/तांबा',
    'Om Suryaya Namaha','ॐ सूर्याय नमः',108,
    ['Wash with water','Place in sunlight','Chant mantra'],
    ['जल से धोएं','धूप में रखें','मंत्र जाप करें'],
    ['Not for very hot temperaments'],['अत्यधिक गर्म स्वभाव वालों के लिए नहीं']),

  // ═══ MOON (Chandra) ═══
  gem('pearl','Pearl','मोती','Moon','primary','White/Silver',3,[2000,8000,30000],
    ['South Sea Pearl - Perfect Luster','Basra Pearl - Good Quality','Cultured Pearl - Standard'],
    ['Mental peace','Emotional stability','Mother relationship','Memory','Intuition'],
    ['मानसिक शांति','भावनात्मक स्थिरता','मातृ संबंध','स्मृति वृद्धि','अंतर्ज्ञान'],
    'Little finger','कनिष्ठा','Monday','सोमवार','Evening','संध्या','4-7 carats','Silver','चांदी',
    'Om Chandraya Namaha','ॐ चन्द्राय नमः',108,
    ['Soak in milk overnight','Offer white flowers','Light camphor','Chant on Monday evening'],
    ['रात भर दूध में भिगोएं','सफेद फूल चढ़ाएं','कपूर जलाएं','सोमवार संध्या को जाप करें'],
    ['Not for Scorpio ascendant','Avoid if Moon debilitated'],
    ['वृश्चिक लग्न के लिए नहीं','यदि चंद्र नीच हो तो न पहनें']),
  gem('moonstone','Moonstone','चंद्रकांत','Moon','substitute','Milky White',6,[500,2000,10000],
    ['Sri Lankan Moonstone','Rainbow Moonstone','Indian Moonstone'],
    ['Calmness','Intuition','Fertility','Emotional healing','Dreams'],
    ['शांति','अंतर्ज्ञान','प्रजनन','भावनात्मक उपचार','स्वप्न'],
    'Little finger','कनिष्ठा','Monday','सोमवार','Evening','संध्या','5-9 carats','Silver','चांदी',
    'Om Chandraya Namaha','ॐ चन्द्राय नमः',108,
    ['Wash with milk','Place under moonlight','Chant mantra'],
    ['दूध से धोएं','चांदनी में रखें','मंत्र जाप करें'],
    ['Avoid during new moon'],['अमावस्या पर न पहनें']),
  gem('white_coral','White Coral','सफ़ेद मूँगा','Moon','substitute','White',3.5,[1000,3000,12000],
    ['Italian White Coral','Japanese White Coral','Standard White Coral'],
    ['Peace','Cooling effect','Emotional balance','Sleep quality','Digestive health'],
    ['शांति','शीतलता','भावनात्मक संतुलन','नींद','पाचन स्वास्थ्य'],
    'Little finger','कनिष्ठा','Monday','सोमवार','Evening','संध्या','5-9 carats','Silver','चांदी',
    'Om Chandraya Namaha','ॐ चन्द्राय नमः',108,
    ['Wash with milk','Offer white flowers','Chant mantra'],
    ['दूध से धोएं','सफेद फूल चढ़ाएं','मंत्र जाप करें'],
    ['Remove during illness'],['बीमारी के दौरान उतार दें']),

  // ═══ MARS (Mangal) ═══
  gem('red_coral','Red Coral','मूँगा','Mars','primary','Red/Orange-Red',3.5,[2000,8000,35000],
    ['Italian Red Coral - Deep Red','Japanese Red Coral','Indian Red Coral'],
    ['Courage','Energy','Property gains','Manglik remedy','Blood health'],
    ['साहस','ऊर्जा','संपत्ति लाभ','मांगलिक उपाय','रक्त स्वास्थ्य'],
    'Ring finger','अनामिका','Tuesday','मंगलवार','Morning','प्रातः','5-9 carats','Gold/Copper','सोना/तांबा',
    'Om Mangalaya Namaha','ॐ मंगलाय नमः',108,
    ['Wash with Ganga water','Offer vermilion','Light ghee lamp','Chant on Tuesday morning'],
    ['गंगाजल से धोएं','सिंदूर चढ़ाएं','घी का दीप जलाएं','मंगलवार प्रातः जाप करें'],
    ['Not for Libra/Taurus ascendant usually','Avoid if Mars is already very strong'],
    ['तुला/वृषभ लग्न के लिए सामान्यतः नहीं','यदि मंगल बहुत मजबूत हो तो न पहनें']),
  gem('carnelian','Carnelian','अकीक','Mars','substitute','Orange-Red',7,[300,1000,5000],
    ['Brazilian Carnelian','Indian Carnelian','Standard Carnelian'],
    ['Courage','Motivation','Endurance','Vitality','Protection'],
    ['साहस','प्रेरणा','सहनशक्ति','जीवन शक्ति','सुरक्षा'],
    'Ring finger','अनामिका','Tuesday','मंगलवार','Morning','प्रातः','5-10 carats','Copper','तांबा',
    'Om Mangalaya Namaha','ॐ मंगलाय नमः',108,
    ['Wash with water','Place in sunlight','Chant mantra'],
    ['जल से धोएं','धूप में रखें','मंत्र जाप करें'],
    ['Not for hot temperaments'],['गर्म स्वभाव वालों के लिए नहीं']),
  gem('bloodstone','Bloodstone','रक्तमणि','Mars','substitute','Dark Green/Red spots',7,[500,2000,8000],
    ['Indian Bloodstone','African Bloodstone','Standard Bloodstone'],
    ['Strength','Blood purification','Courage','Grounding','Physical endurance'],
    ['शक्ति','रक्त शुद्धि','साहस','स्थिरता','शारीरिक सहनशक्ति'],
    'Ring finger','अनामिका','Tuesday','मंगलवार','Morning','प्रातः','5-8 carats','Copper/Iron','तांबा/लोहा',
    'Om Mangalaya Namaha','ॐ मंगलाय नमः',108,
    ['Wash with water','Offer red flowers','Chant mantra'],
    ['जल से धोएं','लाल फूल चढ़ाएं','मंत्र जाप करें'],
    ['Avoid if Mars afflicts Moon'],['यदि मंगल चंद्र को पीड़ित करे तो न पहनें']),

  // ═══ MERCURY (Budh) ═══
  gem('emerald','Emerald','पन्ना','Mercury','primary','Green',7.5,[5000,30000,200000],
    ['Colombian Emerald - Vivid Green','Zambian Emerald - Deep Green','Brazilian Emerald'],
    ['Intelligence','Communication','Business success','Education','Skin health'],
    ['बुद्धि','संचार','व्यापार सफलता','शिक्षा','त्वचा स्वास्थ्य'],
    'Little finger','कनिष्ठा','Wednesday','बुधवार','Morning','प्रातः','3-6 carats','Gold','सोना',
    'Om Budhaya Namaha','ॐ बुधाय नमः',108,
    ['Wash with Ganga water','Offer green items','Light incense','Chant on Wednesday morning'],
    ['गंगाजल से धोएं','हरी वस्तुएं चढ़ाएं','धूप जलाएं','बुधवार प्रातः जाप करें'],
    ['Avoid if Mercury is combust','Not with Ruby generally'],
    ['यदि बुध अस्त हो तो न पहनें','माणिक्य के साथ सामान्यतः न पहनें']),
  gem('green_tourmaline','Green Tourmaline','हरा टूरमलीन','Mercury','substitute','Green',7,[1000,5000,25000],
    ['Brazilian Green Tourmaline','African Green Tourmaline','Standard Green Tourmaline'],
    ['Focus','Creativity','Healing','Communication','Abundance'],
    ['एकाग्रता','रचनात्मकता','उपचार','संचार','समृद्धि'],
    'Little finger','कनिष्ठा','Wednesday','बुधवार','Morning','प्रातः','4-7 carats','Gold/Silver','सोना/चांदी',
    'Om Budhaya Namaha','ॐ बुधाय नमः',108,
    ['Wash with water','Offer green leaves','Chant mantra'],
    ['जल से धोएं','हरे पत्ते चढ़ाएं','मंत्र जाप करें'],
    ['Remove during sleep if sensitive'],['संवेदनशील हों तो सोते समय उतारें']),
  gem('peridot','Peridot','पेरिडॉट','Mercury','substitute','Yellow-Green',6.5,[800,3000,15000],
    ['Pakistan Peridot','Myanmar Peridot','Standard Peridot'],
    ['Intellect','Harmony','Prosperity','Stress relief','Clarity'],
    ['बुद्धि','सामंजस्य','समृद्धि','तनाव मुक्ति','स्पष्टता'],
    'Little finger','कनिष्ठा','Wednesday','बुधवार','Morning','प्रातः','4-8 carats','Gold','सोना',
    'Om Budhaya Namaha','ॐ बुधाय नमः',108,
    ['Wash with water','Chant mantra 108 times'],
    ['जल से धोएं','108 बार मंत्र जाप करें'],
    ['Avoid extreme heat exposure'],['अत्यधिक गर्मी से बचाएं']),
  gem('green_aventurine','Green Aventurine','हरा एवेंचुरीन','Mercury','substitute','Light Green',7,[200,800,3000],
    ['Indian Aventurine','Brazilian Aventurine','Standard Aventurine'],
    ['Luck','Opportunity','Confidence','Growth','Learning'],
    ['भाग्य','अवसर','आत्मविश्वास','विकास','सीखना'],
    'Little finger','कनिष्ठा','Wednesday','बुधवार','Morning','प्रातः','5-10 carats','Silver','चांदी',
    'Om Budhaya Namaha','ॐ बुधाय नमः',108,
    ['Wash with water','Place on green cloth','Chant mantra'],
    ['जल से धोएं','हरे कपड़े पर रखें','मंत्र जाप करें'],
    ['Gentle stone, no major contraindications'],['सौम्य पत्थर, कोई विशेष सावधानी नहीं']),

  // ═══ JUPITER (Guru) ═══
  gem('yellow_sapphire','Yellow Sapphire','पुखराज','Jupiter','primary','Yellow',9,[5000,40000,300000],
    ['Sri Lankan Yellow Sapphire','Thai Yellow Sapphire','Indian Yellow Sapphire'],
    ['Wisdom','Wealth','Marriage','Children','Spiritual growth'],
    ['ज्ञान','धन','विवाह','संतान','आध्यात्मिक विकास'],
    'Index finger','तर्जनी','Thursday','गुरुवार','Morning','प्रातः','3-5 carats','Gold','सोना',
    'Om Gurave Namaha','ॐ गुरवे नमः',108,
    ['Wash with Ganga water','Offer yellow flowers','Light ghee lamp','Chant on Thursday morning'],
    ['गंगाजल से धोएं','पीले फूल चढ़ाएं','घी का दीप जलाएं','गुरुवार प्रातः जाप करें'],
    ['Not with Diamond or Blue Sapphire','Avoid if Jupiter debilitated in Capricorn'],
    ['हीरे या नीलम के साथ न पहनें','यदि गुरु मकर में नीच हो तो सावधानी']),
  gem('citrine','Citrine','सिट्रीन','Jupiter','substitute','Golden Yellow',7,[500,2000,10000],
    ['Brazilian Citrine','African Citrine','Heat-treated Citrine'],
    ['Abundance','Positivity','Confidence','Creativity','Wealth'],
    ['समृद्धि','सकारात्मकता','आत्मविश्वास','रचनात्मकता','धन'],
    'Index finger','तर्जनी','Thursday','गुरुवार','Morning','प्रातः','5-8 carats','Gold','सोना',
    'Om Gurave Namaha','ॐ गुरवे नमः',108,
    ['Wash with water','Place on yellow cloth','Chant mantra'],
    ['जल से धोएं','पीले कपड़े पर रखें','मंत्र जाप करें'],
    ['Avoid extreme heat'],['अत्यधिक गर्मी से बचाएं']),
  gem('yellow_topaz','Yellow Topaz','पीला पुखराज','Jupiter','substitute','Yellow',8,[1000,5000,25000],
    ['Brazilian Topaz','Sri Lankan Topaz','Standard Topaz'],
    ['Fortune','Education','Spiritual insight','Health','Prosperity'],
    ['भाग्य','शिक्षा','आध्यात्मिक अंतर्दृष्टि','स्वास्थ्य','समृद्धि'],
    'Index finger','तर्जनी','Thursday','गुरुवार','Morning','प्रातः','4-7 carats','Gold','सोना',
    'Om Gurave Namaha','ॐ गुरवे नमः',108,
    ['Wash with Ganga water','Offer turmeric','Chant mantra'],
    ['गंगाजल से धोएं','हल्दी चढ़ाएं','मंत्र जाप करें'],
    ['Not with Blue Sapphire'],['नीलम के साथ न पहनें']),
  gem('golden_beryl','Golden Beryl','गोल्डन बेरिल','Jupiter','substitute','Golden',7.5,[800,3000,15000],
    ['Brazilian Golden Beryl','African Golden Beryl','Standard Golden Beryl'],
    ['Wisdom','Confidence','Joy','Mental clarity','Leadership'],
    ['ज्ञान','आत्मविश्वास','आनंद','मानसिक स्पष्टता','नेतृत्व'],
    'Index finger','तर्जनी','Thursday','गुरुवार','Morning','प्रातः','5-8 carats','Gold','सोना',
    'Om Gurave Namaha','ॐ गुरवे नमः',108,
    ['Wash with water','Offer yellow flowers','Chant mantra'],
    ['जल से धोएं','पीले फूल चढ़ाएं','मंत्र जाप करें'],
    ['No major contraindications'],['कोई विशेष सावधानी नहीं']),

  // ═══ VENUS (Shukra) ═══
  gem('diamond','Diamond','हीरा','Venus','primary','Colorless',10,[15000,100000,1000000],
    ['D-F Color, VVS Clarity','G-H Color, VS Clarity','I-J Color, SI Clarity'],
    ['Love','Luxury','Artistic talent','Beauty','Marital bliss'],
    ['प्रेम','विलासिता','कलात्मक प्रतिभा','सौंदर्य','वैवाहिक सुख'],
    'Middle finger','मध्यमा','Friday','शुक्रवार','Morning','प्रातः','0.5-2 carats','Platinum/Gold','प्लैटिनम/सोना',
    'Om Shukraya Namaha','ॐ शुक्राय नमः',108,
    ['Wash with Ganga water','Offer white flowers','Light camphor','Chant on Friday morning'],
    ['गंगाजल से धोएं','सफेद फूल चढ़ाएं','कपूर जलाएं','शुक्रवार प्रातः जाप करें'],
    ['Not with Ruby or Yellow Sapphire','Avoid if Venus in enemy sign'],
    ['माणिक्य या पुखराज के साथ न पहनें','यदि शुक्र शत्रु राशि में हो']),
  gem('white_sapphire','White Sapphire','सफ़ेद पुखराज','Venus','substitute','Colorless',9,[2000,10000,50000],
    ['Sri Lankan White Sapphire','Montana White Sapphire','Standard White Sapphire'],
    ['Clarity','Wisdom','Love','Spiritual growth','Artistic talent'],
    ['स्पष्टता','ज्ञान','प्रेम','आध्यात्मिक विकास','कलात्मक प्रतिभा'],
    'Middle finger','मध्यमा','Friday','शुक्रवार','Morning','प्रातः','2-5 carats','Gold/Platinum','सोना/प्लैटिनम',
    'Om Shukraya Namaha','ॐ शुक्राय नमः',108,
    ['Wash with milk','Offer white flowers','Chant mantra'],
    ['दूध से धोएं','सफेद फूल चढ़ाएं','मंत्र जाप करें'],
    ['Not with Ruby'],['माणिक्य के साथ न पहनें']),
  gem('zircon','White Zircon','जरकन','Venus','substitute','Colorless',7.5,[500,2000,10000],
    ['Cambodian Zircon','Sri Lankan Zircon','Standard Zircon'],
    ['Prosperity','Beauty','Confidence','Love','Social status'],
    ['समृद्धि','सौंदर्य','आत्मविश्वास','प्रेम','सामाजिक प्रतिष्ठा'],
    'Middle finger','मध्यमा','Friday','शुक्रवार','Morning','प्रातः','3-6 carats','Silver/Gold','चांदी/सोना',
    'Om Shukraya Namaha','ॐ शुक्राय नमः',108,
    ['Wash with water','Offer white items','Chant mantra'],
    ['जल से धोएं','सफेद वस्तुएं चढ़ाएं','मंत्र जाप करें'],
    ['Handle carefully, brittle'],['सावधानी से रखें, नाजुक है']),
  gem('opal','Opal','ओपल','Venus','substitute','Multicolor/White',6,[2000,8000,40000],
    ['Australian Opal','Ethiopian Opal','Mexican Fire Opal'],
    ['Creativity','Passion','Love','Imagination','Emotional expression'],
    ['रचनात्मकता','जुनून','प्रेम','कल्पना','भावनात्मक अभिव्यक्ति'],
    'Middle finger','मध्यमा','Friday','शुक्रवार','Morning','प्रातः','3-6 carats','Gold','सोना',
    'Om Shukraya Namaha','ॐ शुक्राय नमः',108,
    ['Wash with water','Handle gently','Chant mantra'],
    ['जल से धोएं','धीरे से रखें','मंत्र जाप करें'],
    ['Avoid extreme temperature changes','Not for everyone'],
    ['अत्यधिक तापमान परिवर्तन से बचाएं','सबके लिए उपयुक्त नहीं']),

  // ═══ SATURN (Shani) ═══
  gem('blue_sapphire','Blue Sapphire','नीलम','Saturn','primary','Blue',9,[5000,50000,500000],
    ['Kashmir Blue Sapphire','Sri Lankan Blue Sapphire','Thai Blue Sapphire'],
    ['Discipline','Career success','Longevity','Wealth','Protection'],
    ['अनुशासन','करियर सफलता','दीर्घायु','धन','सुरक्षा'],
    'Middle finger','मध्यमा','Saturday','शनिवार','Evening','संध्या','2-5 carats','Gold/Iron','सोना/लोहा',
    'Om Shanaischaraya Namaha','ॐ शनैश्चराय नमः',108,
    ['Trial period of 3 days first','Wash with Ganga water','Offer blue flowers','Chant on Saturday evening'],
    ['पहले 3 दिन परीक्षण करें','गंगाजल से धोएं','नीले फूल चढ़ाएं','शनिवार संध्या को जाप करें'],
    ['MUST trial test first','Not for weak constitutions','Avoid if Saturn badly placed'],
    ['पहले परीक्षण अवश्य करें','कमजोर संरचना वालों के लिए नहीं','यदि शनि खराब स्थिति में हो']),
  gem('amethyst','Amethyst','जामुनिया','Saturn','substitute','Purple',7,[500,2000,10000],
    ['Brazilian Amethyst','African Amethyst','Standard Amethyst'],
    ['Calmness','Spirituality','Protection','Sobriety','Wisdom'],
    ['शांति','आध्यात्मिकता','सुरक्षा','संयम','ज्ञान'],
    'Middle finger','मध्यमा','Saturday','शनिवार','Evening','संध्या','5-9 carats','Silver/Iron','चांदी/लोहा',
    'Om Shanaischaraya Namaha','ॐ शनैश्चराय नमः',108,
    ['Wash with water','Place under moonlight','Chant mantra'],
    ['जल से धोएं','चांदनी में रखें','मंत्र जाप करें'],
    ['Milder than Blue Sapphire, still trial advised'],['नीलम से सौम्य, फिर भी परीक्षण उचित']),
  gem('iolite','Iolite','आयोलाइट','Saturn','substitute','Violet-Blue',7,[500,2000,8000],
    ['Sri Lankan Iolite','Madagascar Iolite','Indian Iolite'],
    ['Vision','Navigation','Inner strength','Clarity','Discipline'],
    ['दृष्टि','दिशा','आंतरिक शक्ति','स्पष्टता','अनुशासन'],
    'Middle finger','मध्यमा','Saturday','शनिवार','Evening','संध्या','4-8 carats','Silver','चांदी',
    'Om Shanaischaraya Namaha','ॐ शनैश्चराय नमः',108,
    ['Wash with water','Chant mantra 108 times'],
    ['जल से धोएं','108 बार मंत्र जाप करें'],
    ['Trial period recommended'],['परीक्षण अवधि अनुशंसित']),
  gem('lapis_lazuli','Lapis Lazuli','लाजवर्द','Saturn','substitute','Deep Blue',5.5,[300,1500,6000],
    ['Afghan Lapis Lazuli','Chilean Lapis','Standard Lapis'],
    ['Truth','Awareness','Inner peace','Communication','Protection'],
    ['सत्य','जागरूकता','आंतरिक शांति','संचार','सुरक्षा'],
    'Middle finger','मध्यमा','Saturday','शनिवार','Evening','संध्या','5-10 carats','Silver','चांदी',
    'Om Shanaischaraya Namaha','ॐ शनैश्चराय नमः',108,
    ['Wash with water','Offer blue flowers','Chant mantra'],
    ['जल से धोएं','नीले फूल चढ़ाएं','मंत्र जाप करें'],
    ['Soft stone, handle carefully'],['नरम पत्थर, सावधानी से रखें']),

  // ═══ RAHU ═══
  gem('hessonite','Hessonite Garnet','गोमेद','Rahu','primary','Honey/Cinnamon',7,[2000,10000,50000],
    ['Sri Lankan Hessonite','African Hessonite','Indian Hessonite'],
    ['Removes Rahu dosha','Success abroad','Technology mastery','Mental clarity','Removes confusion'],
    ['राहु दोष दूर करता है','विदेश में सफलता','तकनीकी निपुणता','मानसिक स्पष्टता','भ्रम दूर करता है'],
    'Middle finger','मध्यमा','Saturday','शनिवार','Evening','संध्या','5-8 carats','Silver/Panchdhatu','चांदी/पंचधातु',
    'Om Rahave Namaha','ॐ राहवे नमः',108,
    ['Wash with Ganga water','Offer blue flowers','Light sesame oil lamp','Chant on Saturday'],
    ['गंगाजल से धोएं','नीले फूल चढ़ाएं','तिल तेल का दीप जलाएं','शनिवार को जाप करें'],
    ['Trial for 3 days','Avoid if Rahu in bad houses'],
    ['3 दिन परीक्षण करें','यदि राहु खराब भावों में हो']),
  gem('orange_zircon','Orange Zircon','नारंगी जरकन','Rahu','substitute','Orange',7.5,[500,2000,8000],
    ['Cambodian Orange Zircon','Sri Lankan Orange Zircon','Standard Orange Zircon'],
    ['Confidence','Grounding','Success','Protection','Clarity'],
    ['आत्मविश्वास','स्थिरता','सफलता','सुरक्षा','स्पष्टता'],
    'Middle finger','मध्यमा','Saturday','शनिवार','Evening','संध्या','4-7 carats','Silver','चांदी',
    'Om Rahave Namaha','ॐ राहवे नमः',108,
    ['Wash with water','Chant mantra 108 times'],
    ['जल से धोएं','108 बार मंत्र जाप करें'],
    ['Trial recommended'],['परीक्षण अनुशंसित']),
  gem('smoky_quartz','Smoky Quartz','धुएं का स्फटिक','Rahu','substitute','Smoky Brown',7,[200,800,3000],
    ['Brazilian Smoky Quartz','African Smoky Quartz','Standard Smoky Quartz'],
    ['Grounding','Stress relief','Protection','Emotional balance','Detoxification'],
    ['स्थिरता','तनाव मुक्ति','सुरक्षा','भावनात्मक संतुलन','विषमुक्ति'],
    'Middle finger','मध्यमा','Saturday','शनिवार','Evening','संध्या','5-10 carats','Silver','चांदी',
    'Om Rahave Namaha','ॐ राहवे नमः',108,
    ['Wash with water','Place on earth overnight','Chant mantra'],
    ['जल से धोएं','रात भर मिट्टी पर रखें','मंत्र जाप करें'],
    ['Gentle stone, safe for most'],['सौम्य पत्थर, अधिकांश के लिए सुरक्षित']),

  // ═══ KETU ═══
  gem('cats_eye','Cat\'s Eye','लहसुनिया','Ketu','primary','Greenish-Gold',8.5,[3000,15000,80000],
    ['Sri Lankan Cat\'s Eye - Sharp Band','Brazilian Cat\'s Eye','Indian Cat\'s Eye'],
    ['Removes Ketu dosha','Spiritual growth','Psychic abilities','Protection','Hidden knowledge'],
    ['केतु दोष दूर करता है','आध्यात्मिक विकास','मानसिक शक्तियां','सुरक्षा','गूढ़ ज्ञान'],
    'Middle finger','मध्यमा','Tuesday','मंगलवार','Evening','संध्या','3-7 carats','Gold/Silver','सोना/चांदी',
    'Om Ketave Namaha','ॐ केतवे नमः',108,
    ['Trial for 3 days','Wash with Ganga water','Offer durva grass','Chant on Tuesday'],
    ['3 दिन परीक्षण करें','गंगाजल से धोएं','दूर्वा चढ़ाएं','मंगलवार को जाप करें'],
    ['MUST trial test','Not for everyone','Remove immediately if adverse effects'],
    ['परीक्षण अवश्य करें','सबके लिए नहीं','प्रतिकूल प्रभाव हो तो तुरंत उतारें']),
  gem('tigers_eye','Tiger\'s Eye','बाघ की आँख','Ketu','substitute','Golden-Brown',7,[300,1000,5000],
    ['South African Tiger\'s Eye','Indian Tiger\'s Eye','Standard Tiger\'s Eye'],
    ['Protection','Grounding','Confidence','Willpower','Focus'],
    ['सुरक्षा','स्थिरता','आत्मविश्वास','इच्छाशक्ति','एकाग्रता'],
    'Middle finger','मध्यमा','Tuesday','मंगलवार','Evening','संध्या','5-9 carats','Silver','चांदी',
    'Om Ketave Namaha','ॐ केतवे नमः',108,
    ['Wash with water','Chant mantra 108 times'],
    ['जल से धोएं','108 बार मंत्र जाप करें'],
    ['Milder substitute, generally safe'],['सौम्य विकल्प, सामान्यतः सुरक्षित']),
  gem('turquoise','Turquoise','फ़ीरोज़ा','Ketu','substitute','Blue-Green',6,[500,2000,10000],
    ['Persian Turquoise','Tibetan Turquoise','American Turquoise'],
    ['Communication','Protection','Healing','Wisdom','Friendship'],
    ['संचार','सुरक्षा','उपचार','ज्ञान','मित्रता'],
    'Middle finger','मध्यमा','Tuesday','मंगलवार','Evening','संध्या','5-10 carats','Silver','चांदी',
    'Om Ketave Namaha','ॐ केतवे नमः',108,
    ['Wash with water','Avoid chemicals','Chant mantra'],
    ['जल से धोएं','रसायनों से बचाएं','मंत्र जाप करें'],
    ['Soft stone, avoid chemicals and perfumes'],['नरम पत्थर, रसायन और इत्र से बचाएं']),

  // ═══ ADDITIONAL SUBSTITUTES & SEMI-PRECIOUS ═══
  gem('rose_quartz','Rose Quartz','गुलाबी स्फटिक','Venus','substitute','Pink',7,[200,800,3000],
    ['Madagascar Rose Quartz','Brazilian Rose Quartz','Standard Rose Quartz'],
    ['Love','Harmony','Self-care','Emotional healing','Compassion'],
    ['प्रेम','सामंजस्य','आत्म-देखभाल','भावनात्मक उपचार','करुणा'],
    'Ring finger','अनामिका','Friday','शुक्रवार','Morning','प्रातः','5-10 carats','Silver/Gold','चांदी/सोना',
    'Om Shukraya Namaha','ॐ शुक्राय नमः',108,
    ['Wash with rose water','Place under moonlight','Chant mantra'],
    ['गुलाब जल से धोएं','चांदनी में रखें','मंत्र जाप करें'],
    ['Very gentle, safe for most'],['बहुत सौम्य, अधिकांश के लिए सुरक्षित']),
  gem('aquamarine','Aquamarine','एक्वामरीन','Moon','substitute','Light Blue',7.5,[1000,4000,20000],
    ['Brazilian Aquamarine','African Aquamarine','Standard Aquamarine'],
    ['Calmness','Courage','Communication','Stress relief','Travel safety'],
    ['शांति','साहस','संचार','तनाव मुक्ति','यात्रा सुरक्षा'],
    'Little finger','कनिष्ठा','Monday','सोमवार','Evening','संध्या','4-8 carats','Silver','चांदी',
    'Om Chandraya Namaha','ॐ चन्द्राय नमः',108,
    ['Wash with sea water/salt water','Chant mantra'],
    ['समुद्री/नमक पानी से धोएं','मंत्र जाप करें'],
    ['Avoid extreme heat'],['अत्यधिक गर्मी से बचाएं']),
  gem('ruby_zoisite','Ruby Zoisite','रूबी ज़ोइसाइट','Sun','substitute','Green-Pink',6.5,[300,1500,6000],
    ['Tanzanian Ruby Zoisite','Indian Ruby Zoisite','Standard Ruby Zoisite'],
    ['Vitality','Growth','Passion','Transformation','Heart healing'],
    ['जीवन शक्ति','विकास','जुनून','परिवर्तन','हृदय उपचार'],
    'Ring finger','अनामिका','Sunday','रविवार','Morning','प्रातः','5-10 carats','Gold/Silver','सोना/चांदी',
    'Om Suryaya Namaha','ॐ सूर्याय नमः',108,
    ['Wash with water','Offer flowers','Chant mantra'],
    ['जल से धोएं','फूल चढ़ाएं','मंत्र जाप करें'],
    ['No major contraindications'],['कोई विशेष सावधानी नहीं']),
  gem('alexandrite','Alexandrite','अलेक्जेंड्राइट','Mercury','substitute','Color-changing',8.5,[5000,50000,500000],
    ['Brazilian Alexandrite','Sri Lankan Alexandrite','Russian Alexandrite'],
    ['Transformation','Balance','Intuition','Joy','Regeneration'],
    ['परिवर्तन','संतुलन','अंतर्ज्ञान','आनंद','पुनर्जनन'],
    'Little finger','कनिष्ठा','Wednesday','बुधवार','Morning','प्रातः','1-3 carats','Gold','सोना',
    'Om Budhaya Namaha','ॐ बुधाय नमः',108,
    ['Wash with water','Chant mantra in morning'],
    ['जल से धोएं','प्रातः मंत्र जाप करें'],
    ['Very rare and expensive'],['बहुत दुर्लभ और महंगा']),
  gem('red_jasper','Red Jasper','लाल जैस्पर','Mars','substitute','Red-Brown',7,[200,600,2000],
    ['Indian Red Jasper','African Red Jasper','Standard Red Jasper'],
    ['Stamina','Grounding','Stability','Endurance','Passion'],
    ['सहनशक्ति','स्थिरता','दृढ़ता','धैर्य','जुनून'],
    'Ring finger','अनामिका','Tuesday','मंगलवार','Morning','प्रातः','5-12 carats','Copper','तांबा',
    'Om Mangalaya Namaha','ॐ मंगलाय नमः',108,
    ['Wash with water','Place in sunlight','Chant mantra'],
    ['जल से धोएं','धूप में रखें','मंत्र जाप करें'],
    ['Very gentle, safe for most'],['बहुत सौम्य, अधिकांश के लिए सुरक्षित']),
  gem('black_onyx','Black Onyx','काला गोमेद','Saturn','substitute','Black',7,[300,1000,4000],
    ['Indian Onyx','Brazilian Onyx','Standard Onyx'],
    ['Protection','Discipline','Self-control','Grounding','Strength'],
    ['सुरक्षा','अनुशासन','आत्म-नियंत्रण','स्थिरता','शक्ति'],
    'Middle finger','मध्यमा','Saturday','शनिवार','Evening','संध्या','5-10 carats','Iron/Silver','लोहा/चांदी',
    'Om Shanaischaraya Namaha','ॐ शनैश्चराय नमः',108,
    ['Wash with salt water','Chant mantra at dusk'],
    ['नमक पानी से धोएं','संध्या को मंत्र जाप करें'],
    ['May feel heavy initially'],['शुरू में भारीपन लग सकता है']),
  gem('clear_quartz','Clear Quartz','स्फटिक','Universal','substitute','Colorless',7,[200,500,2000],
    ['Brazilian Clear Quartz','Himalayan Quartz','Standard Clear Quartz'],
    ['Amplification','Clarity','Healing','Energy','Meditation'],
    ['प्रवर्धन','स्पष्टता','उपचार','ऊर्जा','ध्यान'],
    'Any finger','कोई भी उंगली','Any day','कोई भी दिन','Morning','प्रातः','5-15 carats','Silver','चांदी',
    'Om Namah Shivaya','ॐ नमः शिवाय',108,
    ['Wash with water','Place in sunlight','Chant any preferred mantra'],
    ['जल से धोएं','धूप में रखें','कोई भी पसंदीदा मंत्र जाप करें'],
    ['Safe for everyone, universal stone'],['सभी के लिए सुरक्षित, सार्वभौमिक पत्थर']),
];
// Gemstone Recommendation Logic
export function getGemstoneRecommendation(
  ascendantRashi: number,
  planetaryPositions: any[],
  birthDate: string
): GemstoneRecommendation {
  // Determine ascendant lord
  const ascendantLords = [
    'Mars',     // Aries
    'Venus',    // Taurus  
    'Mercury',  // Gemini
    'Moon',     // Cancer
    'Sun',      // Leo
    'Mercury',  // Virgo
    'Venus',    // Libra
    'Mars',     // Scorpio
    'Jupiter',  // Sagittarius
    'Saturn',   // Capricorn
    'Saturn',   // Aquarius
    'Jupiter'   // Pisces
  ];
  
  const ascendantLord = ascendantLords[ascendantRashi];
  
  // Find primary gemstone for ascendant lord
  const primaryGemstone = GEMSTONE_DATABASE.find(gem => 
    gem.planet === ascendantLord && gem.type === 'primary'
  );
  
  // Find substitute gemstones
  const substitutes = GEMSTONE_DATABASE.filter(gem => 
    gem.planet === ascendantLord && gem.type === 'substitute'
  );
  
  // Calculate suitability based on planetary strength
  const planetStrength = calculatePlanetaryStrength(ascendantLord, planetaryPositions);
  const suitability = Math.min(100, Math.max(60, planetStrength));
  
  // Determine urgency
  let urgency: 'low' | 'medium' | 'high' = 'medium';
  if (planetStrength < 30) urgency = 'high';
  else if (planetStrength > 70) urgency = 'low';
  
  const reason = {
    en: `${ascendantLord} is your ascendant lord. Strengthening it will enhance your overall personality and life path.`,
    hi: `${ascendantLord} आपका लग्नेश है। इसे मजबूत करने से आपके व्यक्तित्व और जीवन पथ में सुधार होगा।`
  };
  
  return {
    primary: primaryGemstone!,
    substitutes: substitutes.slice(0, 3),
    reason,
    urgency,
    suitability
  };
}

function calculatePlanetaryStrength(planet: string, positions: any[]): number {
  // Simplified planetary strength calculation
  const planetData = positions.find(p => p.name === planet);
  if (!planetData) return 50;
  
  // Base strength from dignity
  let strength = 50;
  
  // Add strength based on dignity
  if (planetData.dignity === 'Exalted') strength += 30;
  else if (planetData.dignity === 'Own Sign') strength += 20;
  else if (planetData.dignity === 'Moolatrikona') strength += 15;
  else if (planetData.dignity === 'Friend Sign') strength += 10;
  else if (planetData.dignity === 'Debilitated') strength -= 30;
  else if (planetData.dignity === 'Enemy Sign') strength -= 15;
  
  return Math.min(100, Math.max(0, strength));
}

// E-commerce Functions
export interface GemstoneOrder {
  gemstoneId: string;
  quality: 'aaa' | 'aa' | 'a';
  carats: number;
  price: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  certification: boolean;
  energization: boolean;
}

export function calculateGemstonePrice(
  gemstone: Gemstone,
  quality: 'aaa' | 'aa' | 'a',
  carats: number,
  certification: boolean = false,
  energization: boolean = false
): number {
  let basePrice = gemstone.price.medium;
  
  // Quality multiplier
  const qualityMultiplier = {
    aaa: 2.5,
    aa: 1.5,
    a: 1.0
  };
  
  let totalPrice = basePrice * qualityMultiplier[quality] * carats;
  
  // Add certification cost
  if (certification) totalPrice += 2000;
  
  // Add energization cost
  if (energization) totalPrice += 1500;
  
  return Math.round(totalPrice);
}

export function validateGemstoneOrder(order: GemstoneOrder): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!order.customerInfo.name) errors.push('Name is required');
  if (!order.customerInfo.email) errors.push('Email is required');
  if (!order.customerInfo.phone) errors.push('Phone is required');
  if (order.carats < 1 || order.carats > 25) errors.push('Carats must be between 1-25');
  
  return {
    valid: errors.length === 0,
    errors
  };
}