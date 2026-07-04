// Mahadasha Effects on Children
// Source: Brihat Parasara Hora Shastra, Chapter 47 (Girish Chand Sharma translation, Sagar Publications)

export interface MahadashaChildEntry {
  planet: string;
  planetHi: string;
  emoji: string;
  years: number;
  tagline: string;
  taglineHi: string;
  strongEffect: string;
  strongEffectHi: string;
  weakEffect: string;
  weakEffectHi: string;
  doNot: string[];
  doNotHi: string[];
  doThis: string[];
  doThisHi: string[];
  color: string;
}

export const MAHADASHA_CHILDREN: MahadashaChildEntry[] = [
  {
    planet: 'Surya (Sun)',
    planetHi: 'सूर्य',
    emoji: '☀️',
    years: 6,
    tagline: 'Child needs recognition and craves to be seen by authority figures.',
    taglineHi: 'बच्चे को पहचान चाहिए और वह अधिकारियों द्वारा देखा जाना चाहता है।',
    strongEffect: 'Confident, driven, natural leadership energy.',
    strongEffectHi: 'आत्मविश्वासी, प्रेरित, स्वाभाविक नेतृत्व ऊर्जा।',
    weakEffect: 'Anxious around father, constantly seeks approval.',
    weakEffectHi: 'पिता के आसपास चिंतित, लगातार अनुमोदन की तलाश।',
    doNot: [
      'Never undermine this child in front of others.',
      'Criticism from the father wounds the deepest during this period.',
    ],
    doNotHi: [
      'इस बच्चे को दूसरों के सामने कभी कमज़ोर न करें।',
      'इस अवधि में पिता की आलोचना सबसे गहरा घाव करती है।',
    ],
    doThis: [
      'Give responsibility.',
      'Acknowledge achievements publicly.',
      'Let the child feel like the leader.',
    ],
    doThisHi: [
      'जिम्मेदारी दें।',
      'उपलब्धियों को सार्वजनिक रूप से स्वीकार करें।',
      'बच्चे को नेता जैसा महसूस कराएं।',
    ],
    color: 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700',
  },
  {
    planet: 'Chandra (Moon)',
    planetHi: 'चंद्र',
    emoji: '🌙',
    years: 10,
    tagline: 'Most emotionally sensitive Dasha of childhood.',
    taglineHi: 'बचपन की सबसे भावनात्मक रूप से संवेदनशील दशा।',
    strongEffect: 'Imaginative, nurturing, deeply bonded with mother.',
    strongEffectHi: 'कल्पनाशील, पोषण करने वाला, माँ के साथ गहरा बंधन।',
    weakEffect: 'Anxiety, mood swings, clings or withdraws.',
    weakEffectHi: 'चिंता, मूड स्विंग, चिपकना या पीछे हटना।',
    doNot: [
      'Never fight or argue in front of this child.',
      "Mother's stress transfers directly to the child.",
    ],
    doNotHi: [
      'इस बच्चे के सामने कभी लड़ाई या बहस न करें।',
      'माँ का तनाव सीधे बच्चे को प्रभावित करता है।',
    ],
    doThis: [
      'Prioritise stability at home above everything.',
      'Provide physical touch, consistent routine, and mother\'s presence.',
    ],
    doThisHi: [
      'घर में स्थिरता को सर्वोच्च प्राथमिकता दें।',
      'शारीरिक स्पर्श, नियमित दिनचर्या और माँ की उपस्थिति प्रदान करें।',
    ],
    color: 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700',
  },
  {
    planet: 'Mangal (Mars)',
    planetHi: 'मंगल',
    emoji: '🔴',
    years: 7,
    tagline: 'High energy, physically restless, competitive by nature.',
    taglineHi: 'उच्च ऊर्जा, शारीरिक रूप से बेचैन, स्वभाव से प्रतिस्पर्धी।',
    strongEffect: 'Fearless, athletic, goal-oriented.',
    strongEffectHi: 'निडर, एथलेटिक, लक्ष्य-उन्मुख।',
    weakEffect: 'Aggressive, impulsive, accident-prone.',
    weakEffectHi: 'आक्रामक, आवेगी, दुर्घटना-प्रवण।',
    doNot: [
      "Never suppress this child's energy by keeping them indoors.",
      'Forcing stillness creates bottled-up rage.',
    ],
    doNotHi: [
      'इस बच्चे की ऊर्जा को घर के अंदर रखकर कभी दबाएं नहीं।',
      'स्थिरता थोपने से दबी हुई क्रोध पैदा होती है।',
    ],
    doThis: [
      'Encourage sports and daily physical activity.',
      'Give them a healthy "battlefield" to channel their energy.',
    ],
    doThisHi: [
      'खेल और दैनिक शारीरिक गतिविधि को प्रोत्साहित करें।',
      'उनकी ऊर्जा को चैनल करने के लिए एक स्वस्थ "युद्धक्षेत्र" दें।',
    ],
    color: 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700',
  },
  {
    planet: 'Budha (Mercury)',
    planetHi: 'बुध',
    emoji: '💚',
    years: 17,
    tagline: 'Sharpest intellectual Dasha – curiosity peaks.',
    taglineHi: 'सबसे तीव्र बौद्धिक दशा – जिज्ञासा चरम पर।',
    strongEffect: 'Excellent student, communicator, business-minded.',
    strongEffectHi: 'उत्कृष्ट छात्र, संचारक, व्यापार-उन्मुख।',
    weakEffect: 'Restless, scattered, struggles to complete tasks.',
    weakEffectHi: 'बेचैन, बिखरा हुआ, कार्य पूरा करने में संघर्ष।',
    doNot: [
      'Do not label this child as distracted; their mind simply processes differently.',
      'Rote learning kills the spirit of a Mercury Dasha child.',
    ],
    doNotHi: [
      'इस बच्चे को विचलित न कहें; उनका मन बस अलग तरह से प्रक्रिया करता है।',
      'रटना बुध दशा के बच्चे की भावना को मार देता है।',
    ],
    doThis: [
      'Provide books, debate, writing, and exposure to multiple subjects.',
      'This is the best time to invest heavily in education.',
    ],
    doThisHi: [
      'किताबें, बहस, लेखन और कई विषयों का अनुभव प्रदान करें।',
      'यह शिक्षा में भारी निवेश करने का सबसे अच्छा समय है।',
    ],
    color: 'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700',
  },
  {
    planet: 'Guru (Jupiter)',
    planetHi: 'गुरु',
    emoji: '🟡',
    years: 16,
    tagline: 'Most spiritually and intellectually expansive Dasha.',
    taglineHi: 'सबसे आध्यात्मिक और बौद्धिक रूप से विस्तारशील दशा।',
    strongEffect: 'Wise beyond age, principled, blessed.',
    strongEffectHi: 'उम्र से परे बुद्धिमान, सिद्धांतवादी, आशीर्वादित।',
    weakEffect: 'Overconfident, lazy, excess in everything.',
    weakEffectHi: 'अति आत्मविश्वासी, आलसी, हर चीज़ में अधिकता।',
    doNot: [
      'Do not over-indulge or spoil this child; Jupiter already inflates the ego.',
      'Creating entitlement now lasts for decades.',
    ],
    doNotHi: [
      'इस बच्चे को अत्यधिक लाड़-प्यार न करें; गुरु पहले से ही अहंकार को बढ़ाता है।',
      'अभी अधिकार-भावना बनाना दशकों तक चलती है।',
    ],
    doThis: [
      'Teach values and give responsibility.',
      'Expose the child to wisdom traditions.',
      'Jupiter Dasha is when dharmic values become permanent.',
    ],
    doThisHi: [
      'मूल्य सिखाएं और जिम्मेदारी दें।',
      'बच्चे को ज्ञान परंपराओं से परिचित कराएं।',
      'गुरु दशा में धार्मिक मूल्य स्थायी हो जाते हैं।',
    ],
    color: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-700',
  },
  {
    planet: 'Shukra (Venus)',
    planetHi: 'शुक्र',
    emoji: '💎',
    years: 20,
    tagline: 'Longest Dasha – most comfort-seeking period of life.',
    taglineHi: 'सबसे लंबी दशा – जीवन का सबसे आराम-खोजने वाला काल।',
    strongEffect: 'Artistic, charming, naturally magnetic.',
    strongEffectHi: 'कलात्मक, आकर्षक, स्वाभाविक रूप से चुंबकीय।',
    weakEffect: 'Lazy, pleasure-addicted, relationship-dependent.',
    weakEffectHi: 'आलसी, आनंद-व्यसनी, संबंध-निर्भर।',
    doNot: [
      'Do not let screen time and comfort dominate their life.',
      'Venus Dasha children can drift into 20 years of pure pleasure-seeking.',
    ],
    doNotHi: [
      'स्क्रीन टाइम और आराम को उनके जीवन पर हावी न होने दें।',
      'शुक्र दशा के बच्चे 20 साल के शुद्ध आनंद-खोज में बह सकते हैं।',
    ],
    doThis: [
      'Channel into arts, music, creativity, and beauty with discipline.',
      'Habits formed now last the longest.',
    ],
    doThisHi: [
      'अनुशासन के साथ कला, संगीत, रचनात्मकता और सौंदर्य में लगाएं।',
      'अभी बनी आदतें सबसे लंबे समय तक चलती हैं।',
    ],
    color: 'bg-pink-50 border-pink-300 dark:bg-pink-950/30 dark:border-pink-700',
  },
  {
    planet: 'Shani (Saturn)',
    planetHi: 'शनि',
    emoji: '🪐',
    years: 19,
    tagline: 'Hardest Dasha for a child to carry.',
    taglineHi: 'बच्चे के लिए सबसे कठिन दशा।',
    strongEffect: 'Disciplined, resilient, quietly determined.',
    strongEffectHi: 'अनुशासित, लचीला, शांतिपूर्वक दृढ़।',
    weakEffect: 'Isolated, melancholic, feels burdened by life early.',
    weakEffectHi: 'अलग-थलग, उदास, जीवन से जल्दी बोझिल महसूस करता है।',
    doNot: [
      'Do not add extra pressure; the child is already carrying maximum weight.',
      'Comparison with siblings or peers is devastating.',
    ],
    doNotHi: [
      'अतिरिक्त दबाव न डालें; बच्चा पहले से ही अधिकतम बोझ उठा रहा है।',
      'भाई-बहनों या साथियों से तुलना विनाशकारी है।',
    ],
    doThis: [
      'Provide structure without harshness and routine without rigidity.',
      'Give patience, not performance demands.',
    ],
    doThisHi: [
      'कठोरता के बिना संरचना और कठोरता के बिना दिनचर्या प्रदान करें।',
      'प्रदर्शन की मांग नहीं, धैर्य दें।',
    ],
    color: 'bg-slate-50 border-slate-300 dark:bg-slate-950/30 dark:border-slate-700',
  },
  {
    planet: 'Rahu',
    planetHi: 'राहु',
    emoji: '🌑',
    years: 18,
    tagline: 'Most unconventional Dasha – child feels different from peers.',
    taglineHi: 'सबसे अपरंपरागत दशा – बच्चा साथियों से अलग महसूस करता है।',
    strongEffect: 'Ambitious, innovative, ahead of their time.',
    strongEffectHi: 'महत्वाकांक्षी, अभिनव, अपने समय से आगे।',
    weakEffect: 'Confused identity, obsessive, anxiety-driven.',
    weakEffectHi: 'भ्रमित पहचान, जुनूनी, चिंता-चालित।',
    doNot: [
      'Do not force conformity; Rahu Dasha children cannot fit the conventional mold.',
      'Comparing them to "normal" children causes long-term damage.',
    ],
    doNotHi: [
      'अनुरूपता थोपने की कोशिश न करें; राहु दशा के बच्चे पारंपरिक सांचे में फिट नहीं हो सकते।',
      '"सामान्य" बच्चों से तुलना दीर्घकालिक नुकसान करती है।',
    ],
    doThis: [
      'Embrace the unconventional.',
      'Provide technology and foreign exposure.',
      'Rahu children either change the world or destroy themselves – the parent\'s guidance decides which.',
    ],
    doThisHi: [
      'अपरंपरागत को अपनाएं।',
      'प्रौद्योगिकी और विदेशी अनुभव प्रदान करें।',
      'राहु बच्चे या तो दुनिया बदलते हैं या खुद को नष्ट करते हैं – माता-पिता का मार्गदर्शन तय करता है।',
    ],
    color: 'bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700',
  },
  {
    planet: 'Ketu',
    planetHi: 'केतु',
    emoji: '☄️',
    years: 7,
    tagline: 'Most spiritually intense, internally withdrawn Dasha.',
    taglineHi: 'सबसे आध्यात्मिक रूप से तीव्र, आंतरिक रूप से पीछे हटने वाली दशा।',
    strongEffect: 'Intuitive, detached, quietly wise.',
    strongEffectHi: 'सहज, अनासक्त, शांतिपूर्वक बुद्धिमान।',
    weakEffect: 'Fearful, isolated, unexplained illnesses.',
    weakEffectHi: 'भयभीत, अलग-थलग, अस्पष्टीकृत बीमारियां।',
    doNot: [
      'Do not force this child into social situations.',
      'Ketu Dasha children need silence, not stimulation.',
    ],
    doNotHi: [
      'इस बच्चे को सामाजिक परिस्थितियों में जबरदस्ती न डालें।',
      'केतु दशा के बच्चों को उत्तेजना नहीं, मौन चाहिए।',
    ],
    doThis: [
      'Provide spiritual exposure, nature, and quiet creativity.',
      'At the start of Ketu Dasha, learn to understand and respect their silent moments.',
    ],
    doThisHi: [
      'आध्यात्मिक अनुभव, प्रकृति और शांत रचनात्मकता प्रदान करें।',
      'केतु दशा की शुरुआत में उनके मौन क्षणों को समझना और सम्मान करना सीखें।',
    ],
    color: 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/30 dark:border-indigo-700',
  },
];
