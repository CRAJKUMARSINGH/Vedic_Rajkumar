/**
 * src/data/realLifeQuestions108.ts
 *
 * Standalone testing data: 108 real-life questions spanning every major life need,
 * in English + Hindi (Devanagari). Intended for the robustness / enrichment harness,
 * not for app runtime behavior.
 *
 * House mappings follow classical Vedic bhava assignment (bpHS):
 *   1 self/health · 2 wealth/family/speech · 3 courage/siblings/communication
 *   4 mother/home/property/vehicles · 5 children/education/romance/purva-punya
 *   6 enemies/disease/debt/service/litigation · 7 marriage/partnership
 *   8 longevity/inheritance/occult/sudden events · 9 father/luck/dharma/foreign
 *   10 career/status/authority · 11 gains/income/friends/aspirations · 12 loss/foreign/moksha
 */

export type LifeDomain =
  | 'career'
  | 'business'
  | 'wealth'
  | 'education'
  | 'marriage'
  | 'family'
  | 'health'
  | 'property'
  | 'legal'
  | 'travel'
  | 'spiritual'
  | 'social'
  | 'karma';

export interface RealLifeQuestion {
  /** Stable id: rlq-001 … rlq-108 */
  id: string;
  domain: LifeDomain;
  question_en: string;
  question_hi: string;
  /** Primary (bhava) house governing the matter. */
  primaryHouse: number;
  /** Supporting house adding nuance. */
  secondaryHouse: number;
}

export const REAL_LIFE_QUESTIONS_108: RealLifeQuestion[] = [
  // ── 1. Career & Profession (10) ────────────────────────────────────────────
  { id: 'rlq-001', domain: 'career', primaryHouse: 10, secondaryHouse: 11, question_en: 'Will I get a promotion or elevation in my current job this year?', question_hi: 'क्या इस वर्ष मुझे अपनी वर्तमान नौकरी में पदोन्नति या उन्नति मिलेगी?' },
  { id: 'rlq-002', domain: 'career', primaryHouse: 10, secondaryHouse: 3, question_en: 'Is a job change or a switch to a new company favorable for me now?', question_hi: 'क्या अब नौकरी बदलना या नई कंपनी में जाना मेरे लिए शुभ है?' },
  { id: 'rlq-003', domain: 'career', primaryHouse: 10, secondaryHouse: 1, question_en: 'Which career field or profession suits my birth chart best?', question_hi: 'मेरी जन्म कुंडली के अनुसार मेरे लिए कौन-सा करियर क्षेत्र सर्वोत्तम है?' },
  { id: 'rlq-004', domain: 'career', primaryHouse: 10, secondaryHouse: 6, question_en: 'Will my relationship with my boss and seniors improve?', question_hi: 'क्या मेरे बॉस और वरिष्ठों के साथ मेरे संबंध बेहतर होंगे?' },
  { id: 'rlq-005', domain: 'career', primaryHouse: 10, secondaryHouse: 11, question_en: 'Will I gain recognition, awards, or status in my profession?', question_hi: 'क्या मुझे अपने पेशे में पहचान, पुरस्कार या प्रतिष्ठा मिलेगी?' },
  { id: 'rlq-006', domain: 'career', primaryHouse: 10, secondaryHouse: 6, question_en: 'Will I succeed in a government job or competitive recruitment?', question_hi: 'क्या मुझे सरकारी नौकरी या प्रतियोगी भर्ती में सफलता मिलेगी?' },
  { id: 'rlq-007', domain: 'career', primaryHouse: 10, secondaryHouse: 11, question_en: 'Is this a good time to ask for a salary hike or appraisal?', question_hi: 'क्या वेतन वृद्धि या मूल्यांकन मांगने का यह अच्छा समय है?' },
  { id: 'rlq-008', domain: 'career', primaryHouse: 10, secondaryHouse: 1, question_en: 'Will my professional reputation and public image strengthen?', question_hi: 'क्या मेरी पेशेवर प्रतिष्ठा और सार्वजनिक छवि मजबूत होगी?' },
  { id: 'rlq-009', domain: 'career', primaryHouse: 10, secondaryHouse: 9, question_en: 'Can I thrive working abroad or in a foreign/remote company?', question_hi: 'क्या मैं विदेश या किसी विदेशी/रिमोट कंपनी में कार्यरत रहकर सफल हो सकता/सकती हूँ?' },
  { id: 'rlq-010', domain: 'career', primaryHouse: 10, secondaryHouse: 1, question_en: 'Will I lead a team or hold a position of authority?', question_hi: 'क्या मैं एक टीम का नेतृत्व कर पाऊँगा/पाऊँगी या अधिकार के पद पर रह पाऊँगा/पाऊँगी?' },

  // ── 2. Business & Entrepreneurship (9) ─────────────────────────────────────
  { id: 'rlq-011', domain: 'business', primaryHouse: 10, secondaryHouse: 7, question_en: 'Is starting a new business venture favorable for me?', question_hi: 'क्या नया व्यवसाय शुरू करना मेरे लिए शुभ है?' },
  { id: 'rlq-012', domain: 'business', primaryHouse: 7, secondaryHouse: 11, question_en: 'Will my existing business grow and become profitable?', question_hi: 'क्या मेरा वर्तमान व्यवसाय बढ़ेगा और लाभदायक होगा?' },
  { id: 'rlq-013', domain: 'business', primaryHouse: 7, secondaryHouse: 10, question_en: 'Should I take a business partner, and will the partnership succeed?', question_hi: 'क्या मुझे व्यवसाय में साझेदार बनाना चाहिए, और क्या साझेदारी सफल होगी?' },
  { id: 'rlq-014', domain: 'business', primaryHouse: 10, secondaryHouse: 4, question_en: 'Is it a good time to expand my business or open a new branch?', question_hi: 'क्या व्यवसाय विस्तार या नई शाखा खोलने का यह अच्छा समय है?' },
  { id: 'rlq-015', domain: 'business', primaryHouse: 10, secondaryHouse: 11, question_en: 'Will I secure a large contract, tender, or major client?', question_hi: 'क्या मुझे कोई बड़ा अनुबंध, निविदा या प्रमुख ग्राहक मिलेगा?' },
  { id: 'rlq-016', domain: 'business', primaryHouse: 10, secondaryHouse: 8, question_en: 'Will my startup attract investors or funding?', question_hi: 'क्या मेरे स्टार्टअप को निवेशक या धन-सहायता आकर्षित होगी?' },
  { id: 'rlq-017', domain: 'business', primaryHouse: 10, secondaryHouse: 1, question_en: 'Is an independent practice or consultancy right for me?', question_hi: 'क्या स्वतंत्र प्रैक्टिस या परामर्श (कंसल्टेंसी) मेरे लिए उचित है?' },
  { id: 'rlq-018', domain: 'business', primaryHouse: 10, secondaryHouse: 3, question_en: 'Will my online business or e-commerce do well?', question_hi: 'क्या मेरा ऑनलाइन व्यवसाय या ई-कॉमर्स अच्छा चलेगा?' },
  { id: 'rlq-019', domain: 'business', primaryHouse: 7, secondaryHouse: 12, question_en: 'Should I shut down or exit an unprofitable venture?', question_hi: 'क्या मुझे घाटे वाले व्यवसाय को बंद कर देना या उससे बाहर निकल जाना चाहिए?' },

  // ── 3. Wealth & Finance (10) ───────────────────────────────────────────────
  { id: 'rlq-020', domain: 'wealth', primaryHouse: 2, secondaryHouse: 11, question_en: 'Will my income and cash flow improve this year?', question_hi: 'क्या इस वर्ष मेरी आय और नकदी प्रवाह बेहतर होंगे?' },
  { id: 'rlq-021', domain: 'wealth', primaryHouse: 2, secondaryHouse: 11, question_en: 'Will I accumulate significant wealth or savings?', question_hi: 'क्या मैं उल्लेखनीय धन या बचत संचित कर पाऊँगा/पाऊँगी?' },
  { id: 'rlq-022', domain: 'wealth', primaryHouse: 11, secondaryHouse: 2, question_en: 'Are my investments in stocks or mutual funds favorable now?', question_hi: 'क्या शेयर या म्यूचुअल फंड में मेरे निवेश इस समय शुभ हैं?' },
  { id: 'rlq-023', domain: 'wealth', primaryHouse: 6, secondaryHouse: 11, question_en: 'Will I be able to clear my loans and debts?', question_hi: 'क्या मैं अपने ऋण और कर्ज चुका पाऊँगा/पाऊँगी?' },
  { id: 'rlq-024', domain: 'wealth', primaryHouse: 2, secondaryHouse: 4, question_en: 'Is buying gold, silver, or jewellery favorable for me?', question_hi: 'क्या सोना, चाँदी या आभूषण खरीदना मेरे लिए शुभ है?' },
  { id: 'rlq-025', domain: 'wealth', primaryHouse: 8, secondaryHouse: 11, question_en: 'Will I receive an unexpected financial gain or windfall?', question_hi: 'क्या मुझे अप्रत्याशित धन-लाभ मिलेगा?' },
  { id: 'rlq-026', domain: 'wealth', primaryHouse: 8, secondaryHouse: 4, question_en: 'Will ancestral property or inheritance come to me?', question_hi: 'क्या पैतृक संपत्ति या उत्तराधिकार मुझे प्राप्त होगा?' },
  { id: 'rlq-027', domain: 'wealth', primaryHouse: 2, secondaryHouse: 6, question_en: 'Should I lend money or give a loan to someone now?', question_hi: 'क्या अब मुझे किसी को धन उधार देना चाहिए?' },
  { id: 'rlq-028', domain: 'wealth', primaryHouse: 12, secondaryHouse: 11, question_en: 'Will my financial losses or trading losses reverse soon?', question_hi: 'क्या मेरी आर्थिक हानि या व्यापार में घाटा शीघ्र पलटेगा?' },
  { id: 'rlq-029', domain: 'wealth', primaryHouse: 2, secondaryHouse: 8, question_en: 'Is a fixed deposit, insurance, or long-term saving plan good now?', question_hi: 'क्या अब सावधि जमा, बीमा या दीर्घकालिक बचत योजना अच्छी है?' },

  // ── 4. Education & Intellect (9) ───────────────────────────────────────────
  { id: 'rlq-030', domain: 'education', primaryHouse: 5, secondaryHouse: 9, question_en: 'Will I clear my competitive examination this attempt?', question_hi: 'क्या मैं इस प्रयास में प्रतियोगी परीक्षा उत्तीर्ण करूँगा/करूँगी?' },
  { id: 'rlq-031', domain: 'education', primaryHouse: 9, secondaryHouse: 5, question_en: 'Is higher education or a postgraduate degree favorable now?', question_hi: 'क्या अब उच्च शिक्षा या स्नातकोत्तर उपाधि शुभ है?' },
  { id: 'rlq-032', domain: 'education', primaryHouse: 4, secondaryHouse: 9, question_en: 'Will I get admission into my dream college or university?', question_hi: 'क्या मुझे अपने मनपसंद कॉलेज या विश्वविद्यालय में प्रवेश मिलेगा?' },
  { id: 'rlq-033', domain: 'education', primaryHouse: 9, secondaryHouse: 12, question_en: 'Is studying abroad or foreign education good for me?', question_hi: 'क्या विदेश में पढ़ाई या विदेशी शिक्षा मेरे लिए अच्छी है?' },
  { id: 'rlq-034', domain: 'education', primaryHouse: 5, secondaryHouse: 11, question_en: 'Will I win a scholarship or educational grant?', question_hi: 'क्या मुझे छात्रवृत्ति या शिक्षा अनुदान मिलेगा?' },
  { id: 'rlq-035', domain: 'education', primaryHouse: 9, secondaryHouse: 8, question_en: 'Should I pursue research, a PhD, or specialized study?', question_hi: 'क्या मुझे शोध, पीएचडी या विशेष अध्ययन करना चाहिए?' },
  { id: 'rlq-036', domain: 'education', primaryHouse: 5, secondaryHouse: 1, question_en: 'Will my concentration, memory, and learning ability improve?', question_hi: 'क्या मेरी एकाग्रता, स्मृति और सीखने की क्षमता बेहतर होगी?' },
  { id: 'rlq-037', domain: 'education', primaryHouse: 4, secondaryHouse: 5, question_en: 'Is a change of stream or subject advisable for me?', question_hi: 'क्या मेरे लिए विषय या धारा बदलना उचित है?' },
  { id: 'rlq-038', domain: 'education', primaryHouse: 5, secondaryHouse: 9, question_en: 'Will I complete my degree or course on time?', question_hi: 'क्या मैं अपनी डिग्री या पाठ्यक्रम समय पर पूरा करूँगा/करूँगी?' },

  // ── 5. Marriage & Love (10) ────────────────────────────────────────────────
  { id: 'rlq-039', domain: 'marriage', primaryHouse: 7, secondaryHouse: 2, question_en: 'When will I get married?', question_hi: 'मेरा विवाह कब होगा?' },
  { id: 'rlq-040', domain: 'marriage', primaryHouse: 7, secondaryHouse: 4, question_en: 'Will my married life be harmonious and happy?', question_hi: 'क्या मेरा वैवाहिक जीवन सामंजस्यपूर्ण और सुखी होगा?' },
  { id: 'rlq-041', domain: 'marriage', primaryHouse: 7, secondaryHouse: 5, question_en: 'Will I find a compatible and loving life partner?', question_hi: 'क्या मुझे अनुकूल और प्रेमपूर्ण जीवनसाथी मिलेगा?' },
  { id: 'rlq-042', domain: 'marriage', primaryHouse: 7, secondaryHouse: 5, question_en: 'Is my current relationship leading to marriage?', question_hi: 'क्या मेरा वर्तमान संबंध विवाह की ओर बढ़ रहा है?' },
  { id: 'rlq-043', domain: 'marriage', primaryHouse: 5, secondaryHouse: 7, question_en: 'Will love or romance blossom for me this year?', question_hi: 'क्या इस वर्ष मेरे जीवन में प्रेम या रोमांस खिलेगा?' },
  { id: 'rlq-044', domain: 'marriage', primaryHouse: 7, secondaryHouse: 6, question_en: 'Are there delays or obstacles in my marriage?', question_hi: 'क्या मेरे विवाह में विलंब या बाधाएँ हैं?' },
  { id: 'rlq-045', domain: 'marriage', primaryHouse: 7, secondaryHouse: 12, question_en: 'Should I marry a person from a different caste, culture, or country?', question_hi: 'क्या मुझे भिन्न जाति, संस्कृति या देश के व्यक्ति से विवाह करना चाहिए?' },
  { id: 'rlq-046', domain: 'marriage', primaryHouse: 7, secondaryHouse: 8, question_en: 'Will I face divorce or separation, or will my marriage survive?', question_hi: 'क्या मुझे तलाक या अलगाव होगा, या मेरा विवाह टिकेगा?' },
  { id: 'rlq-047', domain: 'marriage', primaryHouse: 7, secondaryHouse: 4, question_en: 'Will my relations with in-laws and family remain cordial?', question_hi: 'क्या मेरे ससुराल और पारिवारिक संबंध सौहार्दपूर्ण रहेंगे?' },
  { id: 'rlq-048', domain: 'marriage', primaryHouse: 7, secondaryHouse: 8, question_en: 'Is a second marriage or remarriage indicated for me?', question_hi: 'क्या मेरे लिए दूसरा विवाह या पुनर्विवाह संकेतित है?' },

  // ── 6. Family, Children & Progeny (9) ──────────────────────────────────────
  { id: 'rlq-049', domain: 'family', primaryHouse: 5, secondaryHouse: 9, question_en: 'Will I be blessed with children?', question_hi: 'क्या मुझे संतान का आशीर्वाद मिलेगा?' },
  { id: 'rlq-050', domain: 'family', primaryHouse: 5, secondaryHouse: 11, question_en: 'Will my children be healthy and successful?', question_hi: 'क्या मेरे बच्चे स्वस्थ और सफल होंगे?' },
  { id: 'rlq-051', domain: 'family', primaryHouse: 5, secondaryHouse: 6, question_en: 'Is there any delay or difficulty in conceiving?', question_hi: 'क्या संतान प्राप्ति में कोई विलंब या कठिनाई है?' },
  { id: 'rlq-052', domain: 'family', primaryHouse: 4, secondaryHouse: 1, question_en: 'Will my relationship with my mother remain strong?', question_hi: 'क्या मेरी माँ के साथ मेरा संबंध मजबूत रहेगा?' },
  { id: 'rlq-053', domain: 'family', primaryHouse: 9, secondaryHouse: 1, question_en: 'Will my relationship with my father be supportive?', question_hi: 'क्या मेरे पिता के साथ मेरा संबंध सहयोगी रहेगा?' },
  { id: 'rlq-054', domain: 'family', primaryHouse: 2, secondaryHouse: 4, question_en: 'Will there be harmony among my family members?', question_hi: 'क्या मेरे परिवार के सदस्यों में सामंजस्य रहेगा?' },
  { id: 'rlq-055', domain: 'family', primaryHouse: 4, secondaryHouse: 2, question_en: 'Will I be able to support and care for my parents?', question_hi: 'क्या मैं अपने माता-पिता की देखभाल और सहायता कर पाऊँगा/पाऊँगी?' },
  { id: 'rlq-056', domain: 'family', primaryHouse: 5, secondaryHouse: 10, question_en: "Will my children's education and career flourish?", question_hi: 'क्या मेरे बच्चों की शिक्षा और करियर फलेगा-फूलेगा?' },
  { id: 'rlq-057', domain: 'family', primaryHouse: 5, secondaryHouse: 9, question_en: 'Is adoption or a remedy for progeny advised for me?', question_hi: 'क्या मेरे लिए गोद लेना या संतान हेतु कोई उपाय सुझाया गया है?' },

  // ── 7. Health & Wellness (9) ───────────────────────────────────────────────
  { id: 'rlq-058', domain: 'health', primaryHouse: 1, secondaryHouse: 6, question_en: 'Will my overall health and vitality improve?', question_hi: 'क्या मेरा समग्र स्वास्थ्य और ओज बेहतर होगा?' },
  { id: 'rlq-059', domain: 'health', primaryHouse: 6, secondaryHouse: 1, question_en: 'Will I recover soon from my current illness?', question_hi: 'क्या मैं अपनी वर्तमान बीमारी से शीघ्र स्वस्थ हो जाऊँगा/जाऊँगी?' },
  { id: 'rlq-060', domain: 'health', primaryHouse: 6, secondaryHouse: 8, question_en: 'Is any chronic or serious disease indicated for me?', question_hi: 'क्या मुझमें कोई दीर्घकालिक या गंभीर रोग संकेतित है?' },
  { id: 'rlq-061', domain: 'health', primaryHouse: 6, secondaryHouse: 8, question_en: 'Is surgery or medical treatment advisable for me now?', question_hi: 'क्या अब मेरे लिए शल्य चिकित्सा या चिकित्सकीय उपचार उचित है?' },
  { id: 'rlq-062', domain: 'health', primaryHouse: 1, secondaryHouse: 4, question_en: 'Will my mental health, stress, and anxiety ease?', question_hi: 'क्या मेरा मानसिक स्वास्थ्य, तनाव और चिंता कम होगी?' },
  { id: 'rlq-063', domain: 'health', primaryHouse: 1, secondaryHouse: 6, question_en: 'Should I change my diet or lifestyle for better health?', question_hi: 'क्या बेहतर स्वास्थ्य के लिए मुझे अपना आहार या जीवनशैली बदलनी चाहिए?' },
  { id: 'rlq-064', domain: 'health', primaryHouse: 8, secondaryHouse: 1, question_en: 'Will I have a long and healthy life?', question_hi: 'क्या मेरा जीवन दीर्घ और स्वस्थ होगा?' },
  { id: 'rlq-065', domain: 'health', primaryHouse: 8, secondaryHouse: 6, question_en: 'Are accidents or injuries indicated for me in this period?', question_hi: 'क्या इस अवधि में मेरे लिए दुर्घटना या चोट संकेतित है?' },
  { id: 'rlq-066', domain: 'health', primaryHouse: 6, secondaryHouse: 11, question_en: 'Will an ongoing medical treatment finally succeed?', question_hi: 'क्या चल रहा चिकित्सकीय उपचार अंततः सफल होगा?' },

  // ── 8. Property, Vehicles & Home (8) ───────────────────────────────────────
  { id: 'rlq-067', domain: 'property', primaryHouse: 4, secondaryHouse: 11, question_en: 'Is this a good time to buy a house or land?', question_hi: 'क्या मकान या ज़मीन खरीदने का यह अच्छा समय है?' },
  { id: 'rlq-068', domain: 'property', primaryHouse: 4, secondaryHouse: 3, question_en: 'Should I sell my property now or wait?', question_hi: 'क्या मुझे अब अपनी संपत्ति बेचनी चाहिए या प्रतीक्षा करनी चाहिए?' },
  { id: 'rlq-069', domain: 'property', primaryHouse: 4, secondaryHouse: 11, question_en: 'Will I own my own home in the near future?', question_hi: 'क्या निकट भविष्य में मेरा अपना घर होगा?' },
  { id: 'rlq-070', domain: 'property', primaryHouse: 4, secondaryHouse: 11, question_en: 'Is buying a new vehicle favorable for me now?', question_hi: 'क्या अब नया वाहन खरीदना मेरे लिए शुभ है?' },
  { id: 'rlq-071', domain: 'property', primaryHouse: 4, secondaryHouse: 3, question_en: 'Will the construction or renovation of my house go smoothly?', question_hi: 'क्या मेरे घर का निर्माण या नवीनीकरण सुचारू रूप से होगा?' },
  { id: 'rlq-072', domain: 'property', primaryHouse: 4, secondaryHouse: 6, question_en: 'Will there be any dispute regarding my property?', question_hi: 'क्या मेरी संपत्ति को लेकर कोई विवाद होगा?' },
  { id: 'rlq-073', domain: 'property', primaryHouse: 4, secondaryHouse: 11, question_en: 'Should I invest in real estate as an asset now?', question_hi: 'क्या अब मुझे संपत्ति में निवेश करना चाहिए?' },
  { id: 'rlq-074', domain: 'property', primaryHouse: 4, secondaryHouse: 2, question_en: 'Will I acquire agricultural land or a second property?', question_hi: 'क्या मुझे कृषि भूमि या दूसरी संपत्ति प्राप्त होगी?' },

  // ── 9. Legal, Debt & Disputes (8) ──────────────────────────────────────────
  { id: 'rlq-075', domain: 'legal', primaryHouse: 6, secondaryHouse: 11, question_en: 'Will I win my ongoing court case or legal dispute?', question_hi: 'क्या मैं अपना चल रहा मुकदमा या कानूनी विवाद जीतूँगा/जीतूँगी?' },
  { id: 'rlq-076', domain: 'legal', primaryHouse: 6, secondaryHouse: 11, question_en: 'Should I file a lawsuit or pursue legal action now?', question_hi: 'क्या मुझे अब मुकदमा दायर करना या कानूनी कार्रवाई करनी चाहिए?' },
  { id: 'rlq-077', domain: 'legal', primaryHouse: 6, secondaryHouse: 12, question_en: 'Will I be free from my debts and creditors soon?', question_hi: 'क्या मैं शीघ्र अपने ऋण और लेनदारों से मुक्त हो जाऊँगा/जाऊँगी?' },
  { id: 'rlq-078', domain: 'legal', primaryHouse: 6, secondaryHouse: 11, question_en: 'Will my enemies, rivals, or opponents be defeated?', question_hi: 'क्या मेरे शत्रु, प्रतिद्वंद्वी या विरोधी परास्त होंगे?' },
  { id: 'rlq-079', domain: 'legal', primaryHouse: 6, secondaryHouse: 8, question_en: 'Is there a risk of false allegations or defamation against me?', question_hi: 'क्या मुझ पर झूठे आरोप या मानहानि का जोखिम है?' },
  { id: 'rlq-080', domain: 'legal', primaryHouse: 6, secondaryHouse: 4, question_en: 'Will a long-pending land or property case resolve favorably?', question_hi: 'क्या लंबे समय से लंबित भूमि या संपत्ति का मुकदमा अनुकूल रूप से सुलझेगा?' },
  { id: 'rlq-081', domain: 'legal', primaryHouse: 6, secondaryHouse: 7, question_en: 'Should I settle or compromise on an ongoing dispute?', question_hi: 'क्या मुझे चल रहे विवाद में समझौता कर लेना चाहिए?' },
  { id: 'rlq-082', domain: 'legal', primaryHouse: 8, secondaryHouse: 6, question_en: 'Will insurance claims or compensation come through for me?', question_hi: 'क्या मुझे बीमा दावा या मुआवज़ा मिलेगा?' },

  // ── 10. Travel, Foreign & Settlement (8) ───────────────────────────────────
  { id: 'rlq-083', domain: 'travel', primaryHouse: 12, secondaryHouse: 9, question_en: 'Is a foreign trip or overseas travel favorable for me now?', question_hi: 'क्या अब विदेश यात्रा मेरे लिए शुभ है?' },
  { id: 'rlq-084', domain: 'travel', primaryHouse: 12, secondaryHouse: 9, question_en: 'Will I get a visa or immigration approval?', question_hi: 'क्या मुझे वीज़ा या आप्रवासन की स्वीकृति मिलेगी?' },
  { id: 'rlq-085', domain: 'travel', primaryHouse: 12, secondaryHouse: 4, question_en: 'Should I settle abroad permanently or return home?', question_hi: 'क्या मुझे स्थायी रूप से विदेश बसना चाहिए या स्वदेश लौटना चाहिए?' },
  { id: 'rlq-086', domain: 'travel', primaryHouse: 3, secondaryHouse: 10, question_en: 'Will a business trip or official travel be successful?', question_hi: 'क्या कोई व्यापारिक यात्रा या आधिकारिक यात्रा सफल होगी?' },
  { id: 'rlq-087', domain: 'travel', primaryHouse: 9, secondaryHouse: 12, question_en: 'Is a pilgrimage or spiritual journey good for me this year?', question_hi: 'क्या इस वर्ष तीर्थयात्रा या आध्यात्मिक यात्रा मेरे लिए अच्छी है?' },
  { id: 'rlq-088', domain: 'travel', primaryHouse: 10, secondaryHouse: 12, question_en: 'Will I be transferred to another city or country for work?', question_hi: 'क्या मेरा स्थानांतरण किसी अन्य शहर या देश में होगा?' },
  { id: 'rlq-089', domain: 'travel', primaryHouse: 4, secondaryHouse: 12, question_en: 'Is it good to migrate to a new city within the country?', question_hi: 'क्या देश के भीतर किसी नए शहर में जाना शुभ है?' },
  { id: 'rlq-090', domain: 'travel', primaryHouse: 3, secondaryHouse: 9, question_en: 'Will a short journey or relocation bring me good fortune?', question_hi: 'क्या कोई छोटी यात्रा या स्थानांतरण मुझे सौभाग्य देगा?' },

  // ── 11. Spirituality, Moksha & Remedies (9) ────────────────────────────────
  { id: 'rlq-091', domain: 'spiritual', primaryHouse: 9, secondaryHouse: 12, question_en: 'Which spiritual path or deity worship is best for me?', question_hi: 'मेरे लिए कौन-सा आध्यात्मिक मार्ग या देव-उपासना सर्वोत्तम है?' },
  { id: 'rlq-092', domain: 'spiritual', primaryHouse: 9, secondaryHouse: 1, question_en: 'Which gemstone should I wear for my benefit?', question_hi: 'मेरे लाभ के लिए मुझे कौन-सा रत्न धारण करना चाहिए?' },
  { id: 'rlq-093', domain: 'spiritual', primaryHouse: 9, secondaryHouse: 12, question_en: 'Which mantra or remedy will remove my obstacles?', question_hi: 'कौन-सा मंत्र या उपाय मेरी बाधाएँ दूर करेगा?' },
  { id: 'rlq-094', domain: 'spiritual', primaryHouse: 9, secondaryHouse: 12, question_en: 'Should I perform a specific puja, havan, or ritual?', question_hi: 'क्या मुझे कोई विशेष पूजा, हवन या अनुष्ठान करना चाहिए?' },
  { id: 'rlq-095', domain: 'spiritual', primaryHouse: 12, secondaryHouse: 9, question_en: 'Will meditation and yoga deepen my spiritual growth?', question_hi: 'क्या ध्यान और योग मेरी आध्यात्मिक उन्नति को गहरा करेंगे?' },
  { id: 'rlq-096', domain: 'spiritual', primaryHouse: 12, secondaryHouse: 9, question_en: 'Is this a period of spiritual awakening or detachment for me?', question_hi: 'क्या यह मेरे लिए आध्यात्मिक जागृति या विरक्ति का काल है?' },
  { id: 'rlq-097', domain: 'spiritual', primaryHouse: 12, secondaryHouse: 9, question_en: 'Will I attain peace, moksha, or liberation in this life?', question_hi: 'क्या मुझे इस जीवन में शांति, मोक्ष या मुक्ति मिलेगी?' },
  { id: 'rlq-098', domain: 'spiritual', primaryHouse: 9, secondaryHouse: 2, question_en: 'Should I donate to charity, and to whom?', question_hi: 'क्या मुझे दान देना चाहिए, और किसे?' },
  { id: 'rlq-099', domain: 'spiritual', primaryHouse: 5, secondaryHouse: 12, question_en: 'Do I carry karmic debts or a curse (dosha) needing remedy?', question_hi: 'क्या मुझ पर कोई कर्म-ऋण या शाप (दोष) है जिसका उपाय आवश्यक है?' },

  // ── 12. Gains, Friends & Social (5) ────────────────────────────────────────
  { id: 'rlq-100', domain: 'social', primaryHouse: 11, secondaryHouse: 3, question_en: 'Will I gain from friends and social networks?', question_hi: 'क्या मुझे मित्रों और सामाजिक संपर्कों से लाभ होगा?' },
  { id: 'rlq-101', domain: 'social', primaryHouse: 11, secondaryHouse: 1, question_en: 'Will my hopes, wishes, and aspirations be fulfilled?', question_hi: 'क्या मेरी आशाएँ, इच्छाएँ और आकांक्षाएँ पूर्ण होंगी?' },
  { id: 'rlq-102', domain: 'social', primaryHouse: 11, secondaryHouse: 3, question_en: 'Will I get support from my elder siblings?', question_hi: 'क्या मुझे अपने बड़े भाई-बहनों का सहयोग मिलेगा?' },
  { id: 'rlq-103', domain: 'social', primaryHouse: 11, secondaryHouse: 10, question_en: 'Will I become popular or influential in my community?', question_hi: 'क्या मैं अपने समुदाय में लोकप्रिय या प्रभावशाली बनूँगा/बनूँगी?' },
  { id: 'rlq-104', domain: 'social', primaryHouse: 11, secondaryHouse: 3, question_en: 'Should I join a group, association, or network now?', question_hi: 'क्या मुझे अब किसी समूह, संगठन या नेटवर्क से जुड़ना चाहिए?' },

  // ── 13. Losses, Longevity & Transformation (4) ─────────────────────────────
  { id: 'rlq-105', domain: 'karma', primaryHouse: 12, secondaryHouse: 8, question_en: 'Will I face major losses or expenses this year?', question_hi: 'क्या इस वर्ष मुझे बड़ी हानि या व्यय का सामना करना पड़ेगा?' },
  { id: 'rlq-106', domain: 'karma', primaryHouse: 8, secondaryHouse: 12, question_en: 'Is there a period of transformation or upheaval ahead for me?', question_hi: 'क्या मेरे आगे परिवर्तन या उथल-पुथल का काल है?' },
  { id: 'rlq-107', domain: 'karma', primaryHouse: 8, secondaryHouse: 9, question_en: 'Should I pursue occult, astrology, or research studies?', question_hi: 'क्या मुझे तंत्र, ज्योतिष या शोध अध्ययन करना चाहिए?' },
  { id: 'rlq-108', domain: 'karma', primaryHouse: 1, secondaryHouse: 9, question_en: 'What is the overall life-purpose and karmic direction of my chart?', question_hi: 'मेरी कुंडली की समग्र जीवन-उद्देश्य और कार्मिक दिशा क्या है?' },
];

/** Filter the 108-question bank by life domain. */
export function getRealLifeQuestionsByDomain(domain: LifeDomain): RealLifeQuestion[] {
  return REAL_LIFE_QUESTIONS_108.filter(q => q.domain === domain);
}

/** Deterministic PRNG (mulberry32) so random subsets are reproducible in tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick `count` reproducible random questions from the 108-question bank.
 * Same seed always yields the same subset (for deterministic robustness runs).
 */
export function pickRandomRealLifeQuestions(count: number, seed = 108): RealLifeQuestion[] {
  const pool = [...REAL_LIFE_QUESTIONS_108];
  const rand = mulberry32(seed);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(0, Math.min(count, pool.length)));
}
