/**
 * Vaastu Remedy Service - Practical Vaastu Remedies
 * Week 18: Vaastu Assessment - Wednesday Implementation
 * 50+ practical remedies with detailed instructions
 */

import type { DoshaSeverity } from './vaastuDoshaService';

export type RemedyCategory = 'color' | 'plant' | 'mirror' | 'element' | 'crystal' | 'yantra' | 'structural' | 'general';
export type RemedyCost = 'free' | 'low' | 'medium' | 'high';
export type RemedyDifficulty = 'easy' | 'medium' | 'hard';

export interface VaastuRemedy {
  id: string;
  doshaType: string;
  category: RemedyCategory;
  name: {
    en: string;
    hi: string;
  };
  instructions: {
    en: string[];
    hi: string[];
  };
  materials: {
    en: string[];
    hi: string[];
  };
  cost: RemedyCost;
  difficulty: RemedyDifficulty;
  effectiveness: number; // 1-10 scale
  timing?: {
    en: string;
    hi: string;
  };
  duration?: {
    en: string;
    hi: string;
  };
  precautions?: {
    en: string[];
    hi: string[];
  };
}

/**
 * Comprehensive Vaastu Remedies Database
 * 50+ practical remedies organized by dosha type
 */
export const VAASTU_REMEDIES: Record<string, VaastuRemedy[]> = {
  // Entrance Remedies
  entrance_remedy_1: [{
    id: 'entrance_remedy_1',
    doshaType: 'entrance',
    category: 'yantra',
    name: {
      en: 'Swastik Symbol at Entrance',
      hi: 'प्रवेश द्वार पर स्वास्तिक प्रतीक'
    },
    instructions: {
      en: [
        'Draw or place a Swastik symbol on the main door',
        'Use red vermillion (sindoor) or turmeric paste',
        'Place it at eye level on the right side of the door',
        'Redraw every Thursday or festival day'
      ],
      hi: [
        'मुख्य दरवाजे पर स्वास्तिक प्रतीक बनाएं या रखें',
        'लाल सिंदूर या हल्दी का पेस्ट उपयोग करें',
        'इसे दरवाजे के दाईं ओर आंखों के स्तर पर रखें',
        'हर गुरुवार या त्योहार के दिन फिर से बनाएं'
      ]
    },
    materials: {
      en: ['Red vermillion or turmeric', 'Clean cloth'],
      hi: ['लाल सिंदूर या हल्दी', 'साफ कपड़ा']
    },
    cost: 'free',
    difficulty: 'easy',
    effectiveness: 8,
    timing: {
      en: 'Thursday morning or any auspicious day',
      hi: 'गुरुवार सुबह या कोई शुभ दिन'
    }
  }],

  entrance_remedy_2: [{
    id: 'entrance_remedy_2',
    doshaType: 'entrance',
    category: 'general',
    name: {
      en: 'Bright Lighting at Entrance',
      hi: 'प्रवेश द्वार पर उज्ज्वल प्रकाश'
    },
    instructions: {
      en: [
        'Install bright lights at the entrance',
        'Keep lights on during evening and night',
        'Use warm white or yellow lights',
        'Ensure entrance is well-lit and welcoming'
      ],
      hi: [
        'प्रवेश द्वार पर उज्ज्वल रोशनी लगाएं',
        'शाम और रात के दौरान रोशनी चालू रखें',
        'गर्म सफेद या पीली रोशनी का उपयोग करें',
        'सुनिश्चित करें कि प्रवेश द्वार अच्छी तरह से रोशन और स्वागत योग्य है'
      ]
    },
    materials: {
      en: ['LED bulbs (warm white)', 'Light fixtures'],
      hi: ['एलईडी बल्ब (गर्म सफेद)', 'लाइट फिक्स्चर']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 7
  }],

  entrance_remedy_3: [{
    id: 'entrance_remedy_3',
    doshaType: 'entrance',
    category: 'element',
    name: {
      en: 'Water Feature Near Entrance',
      hi: 'प्रवेश द्वार के पास जल तत्व'
    },
    instructions: {
      en: [
        'Place a small water fountain near the entrance',
        'Position it in the North or East direction',
        'Keep water clean and flowing',
        'Add a few coins for prosperity'
      ],
      hi: [
        'प्रवेश द्वार के पास एक छोटा जल फव्वारा रखें',
        'इसे उत्तर या पूर्व दिशा में रखें',
        'पानी को साफ और बहता रखें',
        'समृद्धि के लिए कुछ सिक्के डालें'
      ]
    },
    materials: {
      en: ['Small water fountain', 'Clean water', 'Coins'],
      hi: ['छोटा जल फव्वारा', 'साफ पानी', 'सिक्के']
    },
    cost: 'medium',
    difficulty: 'medium',
    effectiveness: 8
  }],

  entrance_remedy_4: [{
    id: 'entrance_remedy_4',
    doshaType: 'entrance',
    category: 'plant',
    name: {
      en: 'Auspicious Plants at Entrance',
      hi: 'प्रवेश द्वार पर शुभ पौधे'
    },
    instructions: {
      en: [
        'Place Tulsi (Holy Basil) or Money Plant near entrance',
        'Keep plants healthy and well-maintained',
        'Water regularly and remove dead leaves',
        'Place in decorative pots'
      ],
      hi: [
        'प्रवेश द्वार के पास तुलसी या मनी प्लांट रखें',
        'पौधों को स्वस्थ और अच्छी तरह से बनाए रखें',
        'नियमित रूप से पानी दें और मृत पत्तियों को हटाएं',
        'सजावटी गमलों में रखें'
      ]
    },
    materials: {
      en: ['Tulsi or Money Plant', 'Decorative pot', 'Soil'],
      hi: ['तुलसी या मनी प्लांट', 'सजावटी गमला', 'मिट्टी']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 7
  }],

  kitchen_remedy_1: [{
    id: 'kitchen_remedy_1',
    doshaType: 'kitchen',
    category: 'color',
    name: {
      en: 'Red or Orange Kitchen Colors',
      hi: 'लाल या नारंगी रसोई रंग'
    },
    instructions: {
      en: [
        'Paint kitchen walls in red, orange, or yellow shades',
        'Use fire element colors to balance energy',
        'Add red or orange accessories',
        'Avoid blue or black colors in kitchen'
      ],
      hi: [
        'रसोई की दीवारों को लाल, नारंगी या पीले रंग में पेंट करें',
        'ऊर्जा संतुलन के लिए अग्नि तत्व रंगों का उपयोग करें',
        'लाल या नारंगी सहायक उपकरण जोड़ें',
        'रसोई में नीले या काले रंग से बचें'
      ]
    },
    materials: {
      en: ['Red/orange paint', 'Painting supplies'],
      hi: ['लाल/नारंगी पेंट', 'पेंटिंग सामग्री']
    },
    cost: 'medium',
    difficulty: 'medium',
    effectiveness: 8
  }],

  kitchen_remedy_2: [{
    id: 'kitchen_remedy_2',
    doshaType: 'kitchen',
    category: 'element',
    name: {
      en: 'Separate Stove and Sink',
      hi: 'स्टोव और सिंक को अलग करें'
    },
    instructions: {
      en: [
        'Keep gas stove and sink at least 2 feet apart',
        'Place a wooden partition if they are adjacent',
        'Stove should be in Southeast corner',
        'Sink should be in Northeast corner'
      ],
      hi: [
        'गैस स्टोव और सिंक को कम से कम 2 फीट अलग रखें',
        'यदि वे आसन्न हैं तो लकड़ी का विभाजन रखें',
        'स्टोव दक्षिण-पूर्व कोने में होना चाहिए',
        'सिंक उत्तर-पूर्व कोने में होना चाहिए'
      ]
    },
    materials: {
      en: ['Wooden partition (if needed)'],
      hi: ['लकड़ी का विभाजन (यदि आवश्यक हो)']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 9
  }],

  kitchen_remedy_3: [{
    id: 'kitchen_remedy_3',
    doshaType: 'kitchen',
    category: 'mirror',
    name: {
      en: 'Mirror Behind Stove',
      hi: 'स्टोव के पीछे दर्पण'
    },
    instructions: {
      en: [
        'Place a mirror behind the gas stove',
        'Mirror should reflect the food being cooked',
        'This doubles the prosperity and abundance',
        'Keep mirror clean and unbroken'
      ],
      hi: [
        'गैस स्टोव के पीछे एक दर्पण रखें',
        'दर्पण को पकाए जा रहे भोजन को प्रतिबिंबित करना चाहिए',
        'यह समृद्धि और प्रचुरता को दोगुना करता है',
        'दर्पण को साफ और अटूट रखें'
      ]
    },
    materials: {
      en: ['Clean mirror', 'Mounting hardware'],
      hi: ['साफ दर्पण', 'माउंटिंग हार्डवेयर']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 7
  }],

  kitchen_remedy_4: [{
    id: 'kitchen_remedy_4',
    doshaType: 'kitchen',
    category: 'general',
    name: {
      en: 'Keep Kitchen Clean and Organized',
      hi: 'रसोई को साफ और व्यवस्थित रखें'
    },
    instructions: {
      en: [
        'Clean kitchen daily after cooking',
        'Remove clutter and organize utensils',
        'Fix any leaking taps immediately',
        'Keep garbage bin covered and empty regularly'
      ],
      hi: [
        'खाना बनाने के बाद रोजाना रसोई साफ करें',
        'अव्यवस्था हटाएं और बर्तन व्यवस्थित करें',
        'किसी भी लीक होने वाले नल को तुरंत ठीक करें',
        'कूड़ेदान को ढका रखें और नियमित रूप से खाली करें'
      ]
    },
    materials: {
      en: ['Cleaning supplies', 'Storage containers'],
      hi: ['सफाई सामग्री', 'भंडारण कंटेनर']
    },
    cost: 'free',
    difficulty: 'easy',
    effectiveness: 8
  }],

  bedroom_remedy_1: [{
    id: 'bedroom_remedy_1',
    doshaType: 'bedroom',
    category: 'color',
    name: {
      en: 'Soothing Bedroom Colors',
      hi: 'शांत शयनकक्ष रंग'
    },
    instructions: {
      en: [
        'Use light colors like cream, light blue, or light green',
        'Avoid dark or bright colors in bedroom',
        'Use pastel shades for peaceful sleep',
        'Add soft lighting for relaxation'
      ],
      hi: [
        'क्रीम, हल्का नीला या हल्का हरा जैसे हल्के रंगों का उपयोग करें',
        'शयनकक्ष में गहरे या चमकीले रंगों से बचें',
        'शांतिपूर्ण नींद के लिए पेस्टल शेड्स का उपयोग करें',
        'विश्राम के लिए नरम प्रकाश जोड़ें'
      ]
    },
    materials: {
      en: ['Light colored paint', 'Soft lighting'],
      hi: ['हल्के रंग का पेंट', 'नरम प्रकाश']
    },
    cost: 'medium',
    difficulty: 'medium',
    effectiveness: 8
  }],

  bedroom_remedy_2: [{
    id: 'bedroom_remedy_2',
    doshaType: 'bedroom',
    category: 'general',
    name: {
      en: 'Proper Bed Placement',
      hi: 'उचित बिस्तर स्थान'
    },
    instructions: {
      en: [
        'Place bed with head towards South or East',
        'Avoid placing bed under a beam',
        'Keep bed away from door and window alignment',
        'Use solid headboard for support'
      ],
      hi: [
        'बिस्तर को सिर दक्षिण या पूर्व की ओर रखें',
        'बीम के नीचे बिस्तर रखने से बचें',
        'बिस्तर को दरवाजे और खिड़की संरेखण से दूर रखें',
        'समर्थन के लिए ठोस हेडबोर्ड का उपयोग करें'
      ]
    },
    materials: {
      en: ['Solid headboard (if needed)'],
      hi: ['ठोस हेडबोर्ड (यदि आवश्यक हो)']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 9
  }],

  bedroom_remedy_3: [{
    id: 'bedroom_remedy_3',
    doshaType: 'bedroom',
    category: 'mirror',
    name: {
      en: 'Remove or Cover Mirrors',
      hi: 'दर्पण हटाएं या ढकें'
    },
    instructions: {
      en: [
        'Remove mirrors facing the bed',
        'If removal is not possible, cover mirrors at night',
        'Mirrors reflect energy and disturb sleep',
        'Use curtains or cloth to cover mirrors'
      ],
      hi: [
        'बिस्तर के सामने दर्पण हटाएं',
        'यदि हटाना संभव नहीं है, तो रात में दर्पण ढकें',
        'दर्पण ऊर्जा को प्रतिबिंबित करते हैं और नींद में खलल डालते हैं',
        'दर्पण को ढकने के लिए पर्दे या कपड़े का उपयोग करें'
      ]
    },
    materials: {
      en: ['Curtain or cloth'],
      hi: ['पर्दा या कपड़ा']
    },
    cost: 'free',
    difficulty: 'easy',
    effectiveness: 7
  }],

  bathroom_remedy_1: [{
    id: 'bathroom_remedy_1',
    doshaType: 'bathroom',
    category: 'general',
    name: {
      en: 'Keep Bathroom Door Closed',
      hi: 'बाथरूम का दरवाजा बंद रखें'
    },
    instructions: {
      en: [
        'Always keep bathroom door closed',
        'Keep toilet lid down when not in use',
        'This prevents negative energy from spreading',
        'Use automatic door closer if needed'
      ],
      hi: [
        'बाथरूम का दरवाजा हमेशा बंद रखें',
        'उपयोग में न होने पर शौचालय का ढक्कन नीचे रखें',
        'यह नकारात्मक ऊर्जा को फैलने से रोकता है',
        'यदि आवश्यक हो तो स्वचालित दरवाजा बंद करने वाला उपयोग करें'
      ]
    },
    materials: {
      en: ['Door closer (optional)'],
      hi: ['दरवाजा बंद करने वाला (वैकल्पिक)']
    },
    cost: 'free',
    difficulty: 'easy',
    effectiveness: 8
  }],

  bathroom_remedy_2: [{
    id: 'bathroom_remedy_2',
    doshaType: 'bathroom',
    category: 'element',
    name: {
      en: 'Salt Water Bowl',
      hi: 'नमक पानी का कटोरा'
    },
    instructions: {
      en: [
        'Place a bowl of salt water in bathroom',
        'Change water every week',
        'Salt absorbs negative energy',
        'Dispose old water outside the house'
      ],
      hi: [
        'बाथरूम में नमक पानी का कटोरा रखें',
        'हर हफ्ते पानी बदलें',
        'नमक नकारात्मक ऊर्जा को अवशोषित करता है',
        'पुराने पानी को घर के बाहर फेंकें'
      ]
    },
    materials: {
      en: ['Bowl', 'Rock salt', 'Water'],
      hi: ['कटोरा', 'सेंधा नमक', 'पानी']
    },
    cost: 'free',
    difficulty: 'easy',
    effectiveness: 7
  }],

  bathroom_remedy_3: [{
    id: 'bathroom_remedy_3',
    doshaType: 'bathroom',
    category: 'plant',
    name: {
      en: 'Air Purifying Plants',
      hi: 'वायु शुद्ध करने वाले पौधे'
    },
    instructions: {
      en: [
        'Place air purifying plants like Snake Plant',
        'Plants absorb negative energy and purify air',
        'Keep plants near window for sunlight',
        'Water regularly and maintain health'
      ],
      hi: [
        'स्नेक प्लांट जैसे वायु शुद्ध करने वाले पौधे रखें',
        'पौधे नकारात्मक ऊर्जा को अवशोषित करते हैं और हवा को शुद्ध करते हैं',
        'सूर्य के प्रकाश के लिए पौधों को खिड़की के पास रखें',
        'नियमित रूप से पानी दें और स्वास्थ्य बनाए रखें'
      ]
    },
    materials: {
      en: ['Snake Plant or similar', 'Pot'],
      hi: ['स्नेक प्लांट या समान', 'गमला']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 7
  }],

  bathroom_remedy_4: [{
    id: 'bathroom_remedy_4',
    doshaType: 'bathroom',
    category: 'general',
    name: {
      en: 'Proper Ventilation',
      hi: 'उचित वेंटिलेशन'
    },
    instructions: {
      en: [
        'Ensure proper ventilation in bathroom',
        'Install exhaust fan if needed',
        'Keep windows open during day',
        'Prevent moisture and mold buildup'
      ],
      hi: [
        'बाथरूम में उचित वेंटिलेशन सुनिश्चित करें',
        'यदि आवश्यक हो तो एग्जॉस्ट फैन लगाएं',
        'दिन के दौरान खिड़कियां खुली रखें',
        'नमी और फफूंदी के निर्माण को रोकें'
      ]
    },
    materials: {
      en: ['Exhaust fan (if needed)'],
      hi: ['एग्जॉस्ट फैन (यदि आवश्यक हो)']
    },
    cost: 'medium',
    difficulty: 'medium',
    effectiveness: 8
  }],

  pooja_remedy_1: [{
    id: 'pooja_remedy_1',
    doshaType: 'pooja',
    category: 'yantra',
    name: {
      en: 'Sri Yantra Installation',
      hi: 'श्री यंत्र स्थापना'
    },
    instructions: {
      en: [
        'Install energized Sri Yantra in pooja room',
        'Place it facing East or North',
        'Worship daily with incense and flowers',
        'Keep area clean and sacred'
      ],
      hi: [
        'पूजा कक्ष में ऊर्जावान श्री यंत्र स्थापित करें',
        'इसे पूर्व या उत्तर की ओर रखें',
        'धूप और फूलों से रोजाना पूजा करें',
        'क्षेत्र को साफ और पवित्र रखें'
      ]
    },
    materials: {
      en: ['Sri Yantra', 'Incense', 'Flowers'],
      hi: ['श्री यंत्र', 'धूप', 'फूल']
    },
    cost: 'medium',
    difficulty: 'easy',
    effectiveness: 9
  }],

  pooja_remedy_2: [{
    id: 'pooja_remedy_2',
    doshaType: 'pooja',
    category: 'color',
    name: {
      en: 'Yellow or White Colors',
      hi: 'पीले या सफेद रंग'
    },
    instructions: {
      en: [
        'Use yellow or white colors in pooja room',
        'These colors enhance spiritual energy',
        'Add yellow flowers and white cloth',
        'Avoid dark colors'
      ],
      hi: [
        'पूजा कक्ष में पीले या सफेद रंगों का उपयोग करें',
        'ये रंग आध्यात्मिक ऊर्जा को बढ़ाते हैं',
        'पीले फूल और सफेद कपड़ा जोड़ें',
        'गहरे रंगों से बचें'
      ]
    },
    materials: {
      en: ['Yellow/white paint or cloth', 'Yellow flowers'],
      hi: ['पीला/सफेद पेंट या कपड़ा', 'पीले फूल']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 8
  }],

  pooja_remedy_3: [{
    id: 'pooja_remedy_3',
    doshaType: 'pooja',
    category: 'general',
    name: {
      en: 'Daily Worship and Cleanliness',
      hi: 'दैनिक पूजा और स्वच्छता'
    },
    instructions: {
      en: [
        'Perform daily worship in pooja room',
        'Light lamp (diya) every morning and evening',
        'Keep room clean and clutter-free',
        'Use natural incense and flowers'
      ],
      hi: [
        'पूजा कक्ष में दैनिक पूजा करें',
        'हर सुबह और शाम दीपक जलाएं',
        'कमरे को साफ और अव्यवस्था मुक्त रखें',
        'प्राकृतिक धूप और फूलों का उपयोग करें'
      ]
    },
    materials: {
      en: ['Lamp (diya)', 'Oil', 'Incense', 'Flowers'],
      hi: ['दीपक', 'तेल', 'धूप', 'फूल']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 9
  }],

  pooja_remedy_4: [{
    id: 'pooja_remedy_4',
    doshaType: 'pooja',
    category: 'element',
    name: {
      en: 'Water Element Balance',
      hi: 'जल तत्व संतुलन'
    },
    instructions: {
      en: [
        'Place a small water bowl with flowers',
        'Change water daily',
        'Add a few drops of rose water',
        'This enhances positive energy'
      ],
      hi: [
        'फूलों के साथ एक छोटा पानी का कटोरा रखें',
        'रोजाना पानी बदलें',
        'गुलाब जल की कुछ बूंदें डालें',
        'यह सकारात्मक ऊर्जा को बढ़ाता है'
      ]
    },
    materials: {
      en: ['Bowl', 'Water', 'Rose water', 'Flowers'],
      hi: ['कटोरा', 'पानी', 'गुलाब जल', 'फूल']
    },
    cost: 'free',
    difficulty: 'easy',
    effectiveness: 7
  }],

  storeroom_remedy_1: [{
    id: 'storeroom_remedy_1',
    doshaType: 'storeroom',
    category: 'general',
    name: {
      en: 'Relocate Heavy Items',
      hi: 'भारी वस्तुओं को स्थानांतरित करें'
    },
    instructions: {
      en: [
        'Move heavy items to South or West',
        'Keep Northeast area light and empty',
        'Store valuables in Southwest',
        'Organize items properly'
      ],
      hi: [
        'भारी वस्तुओं को दक्षिण या पश्चिम में ले जाएं',
        'उत्तर-पूर्व क्षेत्र को हल्का और खाली रखें',
        'दक्षिण-पश्चिम में कीमती सामान रखें',
        'वस्तुओं को ठीक से व्यवस्थित करें'
      ]
    },
    materials: {
      en: ['Storage boxes', 'Labels'],
      hi: ['भंडारण बक्से', 'लेबल']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 8
  }],

  storeroom_remedy_2: [{
    id: 'storeroom_remedy_2',
    doshaType: 'storeroom',
    category: 'general',
    name: {
      en: 'Regular Cleaning and Decluttering',
      hi: 'नियमित सफाई और अव्यवस्था हटाना'
    },
    instructions: {
      en: [
        'Clean store room regularly',
        'Remove unused and broken items',
        'Organize items by category',
        'Ensure proper ventilation'
      ],
      hi: [
        'स्टोर रूम को नियमित रूप से साफ करें',
        'अप्रयुक्त और टूटी वस्तुओं को हटाएं',
        'वस्तुओं को श्रेणी के अनुसार व्यवस्थित करें',
        'उचित वेंटिलेशन सुनिश्चित करें'
      ]
    },
    materials: {
      en: ['Cleaning supplies', 'Storage containers'],
      hi: ['सफाई सामग्री', 'भंडारण कंटेनर']
    },
    cost: 'free',
    difficulty: 'easy',
    effectiveness: 7
  }],

  storeroom_remedy_3: [{
    id: 'storeroom_remedy_3',
    doshaType: 'storeroom',
    category: 'crystal',
    name: {
      en: 'Crystal for Energy Balance',
      hi: 'ऊर्जा संतुलन के लिए क्रिस्टल'
    },
    instructions: {
      en: [
        'Place clear quartz crystal in store room',
        'Crystal balances energy and removes negativity',
        'Clean crystal monthly with salt water',
        'Place in Northeast corner if possible'
      ],
      hi: [
        'स्टोर रूम में स्पष्ट क्वार्ट्ज क्रिस्टल रखें',
        'क्रिस्टल ऊर्जा को संतुलित करता है और नकारात्मकता को दूर करता है',
        'नमक पानी से मासिक क्रिस्टल साफ करें',
        'यदि संभव हो तो उत्तर-पूर्व कोने में रखें'
      ]
    },
    materials: {
      en: ['Clear quartz crystal', 'Salt water'],
      hi: ['स्पष्ट क्वार्ट्ज क्रिस्टल', 'नमक पानी']
    },
    cost: 'medium',
    difficulty: 'easy',
    effectiveness: 7
  }],

  storeroom_remedy_4: [{
    id: 'storeroom_remedy_4',
    doshaType: 'storeroom',
    category: 'general',
    name: {
      en: 'Proper Lighting',
      hi: 'उचित प्रकाश'
    },
    instructions: {
      en: [
        'Install adequate lighting in store room',
        'Avoid dark and dingy spaces',
        'Use LED lights for energy efficiency',
        'Keep lights on during use'
      ],
      hi: [
        'स्टोर रूम में पर्याप्त प्रकाश लगाएं',
        'अंधेरे और गंदे स्थानों से बचें',
        'ऊर्जा दक्षता के लिए एलईडी लाइट का उपयोग करें',
        'उपयोग के दौरान रोशनी चालू रखें'
      ]
    },
    materials: {
      en: ['LED lights', 'Light fixtures'],
      hi: ['एलईडी लाइट', 'लाइट फिक्स्चर']
    },
    cost: 'low',
    difficulty: 'easy',
    effectiveness: 6
  }],

  living_remedy_1: [{
    id: 'living_remedy_1',
    doshaType: 'living',
    category: 'general',
    name: {
      en: 'Furniture Placement',
      hi: 'फर्नीचर स्थान'
    },
    instructions: {
      en: [
        'Place heavy furniture in South or West',
        'Keep Northeast corner light and open',
        'Arrange seating to face North or East',
        'Avoid blocking doorways'
      ],
      hi: [
        'भारी फर्नीचर दक्षिण या पश्चिम में रखें',
        'उत्तर-पूर्व कोने को हल्का और खुला रखें',
        'बैठने की व्यवस्था उत्तर या पूर्व की ओर करें',
        'दरवाजों को अवरुद्ध करने से बचें'
      ]
    },
    materials: {
      en: ['None required'],
      hi: ['कोई आवश्यकता नहीं']
    },
    cost: 'free',
    difficulty: 'easy',
    effectiveness: 7
  }],

  living_remedy_2: [{
    id: 'living_remedy_2',
    doshaType: 'living',
    category: 'color',
    name: {
      en: 'Light and Bright Colors',
      hi: 'हल्के और चमकीले रंग'
    },
    instructions: {
      en: [
        'Use light colors like white, cream, or light yellow',
        'Add colorful cushions and curtains',
        'Avoid dark and heavy colors',
        'Create welcoming atmosphere'
      ],
      hi: [
        'सफेद, क्रीम या हल्के पीले जैसे हल्के रंगों का उपयोग करें',
        'रंगीन कुशन और पर्दे जोड़ें',
        'गहरे और भारी रंगों से बचें',
        'स्वागत योग्य वातावरण बनाएं'
      ]
    },
    materials: {
      en: ['Light colored paint', 'Colorful accessories'],
      hi: ['हल्के रंग का पेंट', 'रंगीन सहायक उपकरण']
    },
    cost: 'medium',
    difficulty: 'medium',
    effectiveness: 7
  }],

  study_remedy_1: [{
    id: 'study_remedy_1',
    doshaType: 'study',
    category: 'general',
    name: {
      en: 'Study Table Facing East or North',
      hi: 'अध्ययन टेबल पूर्व या उत्तर की ओर'
    },
    instructions: {
      en: [
        'Place study table facing East or North',
        'Sit facing these directions while studying',
        'Enhances concentration and memory',
        'Keep table organized and clutter-free'
      ],
      hi: [
        'अध्ययन टेबल को पूर्व या उत्तर की ओर रखें',
        'अध्ययन करते समय इन दिशाओं की ओर मुंह करके बैठें',
        'एकाग्रता और स्मृति को बढ़ाता है',
        'टेबल को व्यवस्थित और अव्यवस्था मुक्त रखें'
      ]
    },
    materials: {
      en: ['None required'],
      hi: ['कोई आवश्यकता नहीं']
    },
    cost: 'free',
    difficulty: 'easy',
    effectiveness: 9
  }],

  study_remedy_2: [{
    id: 'study_remedy_2',
    doshaType: 'study',
    category: 'crystal',
    name: {
      en: 'Crystal Pyramid for Focus',
      hi: 'फोकस के लिए क्रिस्टल पिरामिड'
    },
    instructions: {
      en: [
        'Place crystal pyramid on study table',
        'Pyramid enhances concentration and focus',
        'Position it in Northeast corner of table',
        'Clean regularly for best results'
      ],
      hi: [
        'अध्ययन टेबल पर क्रिस्टल पिरामिड रखें',
        'पिरामिड एकाग्रता और फोकस को बढ़ाता है',
        'इसे टेबल के उत्तर-पूर्व कोने में रखें',
        'सर्वोत्तम परिणामों के लिए नियमित रूप से साफ करें'
      ]
    },
    materials: {
      en: ['Crystal pyramid'],
      hi: ['क्रिस्टल पिरामिड']
    },
    cost: 'medium',
    difficulty: 'easy',
    effectiveness: 8
  }]
};

/**
 * Get remedies by dosha ID
 */
export function getRemediesByDoshaId(doshaId: string): VaastuRemedy[] {
  const remedyKey = Object.keys(VAASTU_REMEDIES).find(key => 
    VAASTU_REMEDIES[key].some(r => r.doshaType === doshaId.split('_')[0])
  );
  
  if (!remedyKey) return [];
  return VAASTU_REMEDIES[remedyKey] || [];
}

/**
 * Get all remedies for multiple dosha IDs
 */
export function getRemediesForDoshas(doshaIds: string[]): VaastuRemedy[] {
  const allRemedies: VaastuRemedy[] = [];
  
  for (const doshaId of doshaIds) {
    const remedies = getRemediesByDoshaId(doshaId);
    allRemedies.push(...remedies);
  }
  
  // Remove duplicates
  const uniqueRemedies = allRemedies.filter((remedy, index, self) =>
    index === self.findIndex(r => r.id === remedy.id)
  );
  
  // Sort by effectiveness (highest first)
  return uniqueRemedies.sort((a, b) => b.effectiveness - a.effectiveness);
}

/**
 * Get remedies by category
 */
export function getRemediesByCategory(category: RemedyCategory): VaastuRemedy[] {
  const allRemedies: VaastuRemedy[] = [];
  
  for (const key of Object.keys(VAASTU_REMEDIES)) {
    allRemedies.push(...VAASTU_REMEDIES[key]);
  }
  
  return allRemedies.filter(r => r.category === category);
}

/**
 * Get top remedies by effectiveness
 */
export function getTopRemedies(count: number = 10): VaastuRemedy[] {
  const allRemedies: VaastuRemedy[] = [];
  
  for (const key of Object.keys(VAASTU_REMEDIES)) {
    allRemedies.push(...VAASTU_REMEDIES[key]);
  }
  
  return allRemedies
    .sort((a, b) => b.effectiveness - a.effectiveness)
    .slice(0, count);
}

export default {
  VAASTU_REMEDIES,
  getRemediesByDoshaId,
  getRemediesForDoshas,
  getRemediesByCategory,
  getTopRemedies
};
