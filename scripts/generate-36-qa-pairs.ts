
#!/usr/bin/env tsx
/**
 * Generate 36 Question-Answer Pairs (3 per 12 houses, all 3 question modes)
 * 
 * Modes:
 * A. Saved birth data (jatak database)
 * B. User-provided birth data (custom)
 * C. Question time only (anonymous)
 */

import { analyzeQuestion } from '../src/services/questionAnalysisService';
import jataksDb from '../src/data/jataks/JATAKS_DATABASE.json';

console.log('🛠️ Loading...');

// 1. Define 36 questions (3 per 12 houses)
const QUESTION_POOL = [
  // House 1
  { house: 1, en: "Will my health improve over the next 2 months?", hi: "क्या मेरा स्वास्थ्य अगले 2 महीनों में बेहतर होगा?" },
  { house: 1, en: "How's my energy for a new fitness routine?", hi: "नया फिटनेस रूटीन शुरू करने के लिए मेरी ऊर्जा कैसी है?" },
  { house: 1, en: "Should I prioritize self-care this quarter?", hi: "क्या मुझे इस तिमाही में स्वयं की देखभाल को प्राथमिकता देनी चाहिए?" },
  
  // House 2
  { house: 2, en: "Will I get unexpected income this year?", hi: "क्या मुझे इस साल अप्रत्याशित आय प्राप्त होगी?" },
  { house: 2, en: "How to manage savings and investments now?", hi: "मुझे अभी बचत और निवेशों का प्रबंधन कैसे करना चाहिए?" },
  { house: 2, en: "Is this a good time to buy jewelry?", hi: "क्या यह आभूषण खरीदने का अच्छा समय है?" },

  // House 3
  { house: 3, en: "Will sibling's job interview go well?", hi: "क्या भाई/बहन का जॉब इंटरव्यू अच्छा जाएगा?" },
  { house: 3, en: "Should I take a short weekend trip?", hi: "क्या मुझे छोटी सप्ताहांत यात्रा लेनी चाहिए?" },
  { house: 3, en: "Will communication skills help in project?", hi: "क्या संचार कौशल प्रोजेक्ट में मदद करेंगे?" },

  // House 4
  { house: 4, en: "Should I buy the house I saw last week?", hi: "क्या मुझे पिछले हफ्ते देखा घर खरीदना चाहिए?" },
  { house: 4, en: "How will mother's health be?", hi: "माँ का स्वास्थ्य कैसा रहेगा?" },
  { house: 4, en: "Is renovating kitchen a good idea?", hi: "क्या रसोई का नवीकरण अच्छा विचार है?" },

  // House5
  { house:5, en: "Will I pass my university exam?", hi: "क्या मैं विश्वविद्यालय की परीक्षा उत्तीर्ण होऊंगा?" },
  { house:5, en: "How my romantic relationship progress?", hi: "रोमांटिक रिलेशनशिप कैसे आगे बढ़ेगा?" },
  { house:5, en: "Should I learn painting?", hi: "क्या मैं पेंटिंग सीखना चाहिए?" },

  // House6
  { house:6, en: "Will I recover from illness soon?", hi: "क्या मैं जल्द ही बीमारी से ठीक हो जाऊंगा?" },
  { house:6, en: "Should I take business loan?", hi: "क्या मुझे व्यापार के लिए लोन लेना चाहिए?" },
  { house:6, en: "Resolve coworker conflict?", hi: "क्या सहकर्मी के साथ संघर्ष सुलझेगा?" },

  // House7
  { house:7, en: "When will I marry partner?", hi: "मैं पार्टनर से कब शादी करूंगा?" },
  { house:7, en: "Start business partnership now?", hi: "क्या अभी व्यापारिक साझेदारी शुरू करें?" },
  { house:7, en: "How my spouse relationship next year?", hi: "अगले साल जीवनसाथी के साथ रिश्ता कैसा?" },

  // House8
  { house:8, en: "Will I receive inheritance?", hi: "क्या मुझे विरासत प्राप्त होगी?" },
  { house:8, en: "Explore meditation deeper?", hi: "क्या मैं ध्यान को गहराई से खोजूं?" },
  { house:8, en: "Hidden obstacles in path?", hi: "क्या रास्ते में छिपी हुई बाधाएं हैं?" },

  // House9
  { house:9, en: "Travel abroad opportunity this year?", hi: "क्या इस साल विदेश यात्रा का मौका मिलेगा?" },
  { house:9, en: "Father's financial situation 6 months?", hi: "पिता की वित्तीय स्थिति अगले 6 महीने?" },
  { house:9, en: "Enroll spirituality course?", hi: "क्या मैं आध्यात्मिक कोर्स में दाखिला लूं?" },

  // House10
  { house:10, en: "Will I get job promotion this year?", hi: "क्या मुझे इस साल जॉब में पदोन्नति मिलेगी?" },
  { house:10, en: "Good time to switch careers?", hi: "क्या अब करियर बदलने का अच्छा समय है?" },
  { house:10, en: "New business first year performance?", hi: "नया व्यापार पहले वर्ष में कैसा?" },

  // House11
  { house:11, en: "Will my wish for new car?", hi: "क्या नई कार की इच्छा पूरी होगी?" },
  { house:11, en: "Make new close friends?", hi: "क्या नए करीबी दोस्त बनेंगे?" },
  { house:11, en: "How side projects income grow?", hi: "साइड प्रोजेक्ट्स से आय कैसे बढ़ेगी?" },

  // House12
  { house:12, en: "Plan to move abroad permanently?", hi: "क्या स्थायी रूप से विदेश जाने की योजना?" },
  { house:12, en: "Find peace from past event?", hi: "क्या पिछली घटना से शांति मिलेगी?" },
  { house:12, en: "Spend more time solitude?", hi: "क्या मुझे अधिक समय अकेले बिताना चाहिए?" },
];

// 2. Test generating one quick test pair first to verify!
console.log('✅ Basic test: generate 1 QA pair');

async function testSingle() {
  try {
    console.log('✅ Test analyzeQuestion');
    let q = QUESTION_POOL[0];
    let result = await analyzeQuestion({
      question: q.en,
      questionTime: new Date(),
      questionLocation: { lat: 28.61, lon: 77.20 },
    });
    console.log('✅ EN:', result.answer.en);
    console.log('✅ HI:', result.answer.hi);
    console.log('✅ Analysis works!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSingle().then(() => console.log('✨ Test complete'));

