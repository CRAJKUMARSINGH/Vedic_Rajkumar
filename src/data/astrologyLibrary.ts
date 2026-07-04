export interface AstrologyLibraryEntry {
  id: string;
  title: string;
  titleHi: string;
  source: string;
  type: 'book' | 'school' | 'horoscope' | 'remedy' | 'principle';
  topics: string[];
  topicsHi: string[];
  summary: string;
  summaryHi: string;
  useCase: string;
  useCaseHi: string;
}

export const ASTROLOGY_LIBRARY: AstrologyLibraryEntry[] = [
  {
    id: 'interpretation-engine',
    title: 'Interpretation Engine v2.1',
    titleHi: 'इंटरप्रिटेशन इंजन v2.1',
    source: 'KNOWLEDGE_BASE/INTERPRETATION_ENGINE_v2.1.md',
    type: 'book',
    topics: ['interpretation', 'verdicts', 'dasha', 'transit', 'remedy'],
    topicsHi: ['व्याख्या', 'निर्णय', 'दशा', 'गोचर', 'उपाय'],
    summary: 'Core reasoning document for the platform’s multi-layer chart judgment system.',
    summaryHi: 'प्लेटफ़ॉर्म की बहु-स्तरीय कुंडली निर्णय प्रणाली का मुख्य तर्क-दस्तावेज़।',
    useCase: 'Best for understanding how readings resolve into one conclusion.',
    useCaseHi: 'यह समझने के लिए सर्वोत्तम कि फलादेश एक निष्कर्ष तक कैसे पहुँचता है।',
  },
  {
    id: 'implementation-queue',
    title: 'Implementation Queue',
    titleHi: 'इम्प्लीमेंटेशन कतार',
    source: 'KNOWLEDGE_BASE/implementation_queue.md',
    type: 'principle',
    topics: ['backlog', 'features', 'research', 'fixes', 'integration'],
    topicsHi: ['बैकलॉग', 'फीचर', 'रिसर्च', 'सुधार', 'इंटीग्रेशन'],
    summary: 'Prioritized feature and fix queue built from the repo’s research process.',
    summaryHi: 'रिपॉजिटरी की रिसर्च प्रक्रिया से बनी प्राथमिकता-आधारित फीचर और सुधार सूची।',
    useCase: 'Useful for deciding what research-backed improvements should ship next.',
    useCaseHi: 'अगला कौन-सा शोध-समर्थित सुधार जारी होना चाहिए, यह तय करने के लिए उपयोगी।',
  },
  {
    id: 'ebook-index',
    title: 'Ebook Index',
    titleHi: 'ईबुक इंडेक्स',
    source: 'KNOWLEDGE_BASE/ebook_index.md',
    type: 'book',
    topics: ['books', 'pdfs', 'sources', 'index', 'corpus'],
    topicsHi: ['पुस्तकें', 'पीडीएफ', 'स्रोत', 'इंडेक्स', 'कॉर्पस'],
    summary: 'A tracked catalog of the larger astrology corpus behind the product.',
    summaryHi: 'उत्पाद के पीछे मौजूद बड़े ज्योतिष कॉर्पस का ट्रैक किया गया कैटलॉग।',
    useCase: 'Best for showing the scale of the knowledge base and what is still unprocessed.',
    useCaseHi: 'ज्ञान कोष के आकार और क्या अभी शेष है, यह दिखाने के लिए सर्वोत्तम।',
  },
  {
    id: 'jataks-database',
    title: 'Jataks Database',
    titleHi: 'जतकों का डेटाबेस',
    source: 'jataks/JATAKS_DATABASE.json',
    type: 'horoscope',
    topics: ['profiles', 'birth details', 'archive', 'examples', 'saved charts'],
    topicsHi: ['प्रोफाइल', 'जन्म विवरण', 'आर्काइव', 'उदाहरण', 'सहेजी कुंडलियाँ'],
    summary: 'Real chart records already available for onboarding, testing, and case work.',
    summaryHi: 'ऑनबोर्डिंग, परीक्षण और केस कार्य के लिए उपलब्ध वास्तविक चार्ट रिकॉर्ड।',
    useCase: 'Good for demonstrating saved-profile journeys and chart-based product depth.',
    useCaseHi: 'सहेजे गए प्रोफाइल प्रवाह और चार्ट-आधारित उत्पाद गहराई दिखाने के लिए उपयोगी।',
  },
  {
    id: 'comparison-reports',
    title: 'Comparison Reports',
    titleHi: 'तुलनात्मक रिपोर्टें',
    source: 'reports/comparisons/*.html',
    type: 'horoscope',
    topics: ['comparisons', 'reports', 'cases', 'family archive'],
    topicsHi: ['तुलना', 'रिपोर्ट', 'केस', 'परिवार आर्काइव'],
    summary: 'Generated case-study reports for named individuals already in the repository.',
    summaryHi: 'रिपॉजिटरी में पहले से मौजूद व्यक्तियों की तैयार केस-स्टडी रिपोर्टें।',
    useCase: 'Useful for surfacing proof of analysis and comparison workflows.',
    useCaseHi: 'विश्लेषण और तुलना वर्कफ़्लो के प्रमाण को सामने लाने के लिए उपयोगी।',
  },
  {
    id: 'prasna-marga',
    title: 'Prasna Marga',
    titleHi: 'प्रश्न मार्ग',
    source: 'B.V. Raman / ebook corpus',
    type: 'book',
    topics: ['horary', 'prashna', 'time of question', 'direction', 'gulika'],
    topicsHi: ['प्रश्न', 'होरारी', 'प्रश्न समय', 'दिशा', 'गुलिक'],
    summary: 'Classical horary method for judging questions from the moment and place of asking.',
    summaryHi: 'प्रश्न के क्षण और स्थान से फल देखने की शास्त्रीय होरारी विधि।',
    useCase: 'Best for live questions, timing, and yes/no style verdicts.',
    useCaseHi: 'तुरंत प्रश्न, समय-निर्धारण, और हाँ/नहीं प्रकार के निर्णयों के लिए।',
  },
  {
    id: 'bv-raman-archive',
    title: 'B.V. Raman Corpus',
    titleHi: 'बी.वी. रमन कॉर्पस',
    source: 'ebook_index.md + attached research sources',
    type: 'book',
    topics: ['bv raman', 'predictive astrology', 'case studies', 'classics'],
    topicsHi: ['बीवी रमन', 'फलित ज्योतिष', 'केस स्टडी', 'शास्त्रीय ग्रंथ'],
    summary: 'Repository-tracked source family for predictive, classical, and case-study material.',
    summaryHi: 'फलित, शास्त्रीय और केस-स्टडी सामग्री के लिए रिपॉजिटरी-ट्रैक किया गया स्रोत समूह।',
    useCase: 'Good for grounding the platform in named astrological source material.',
    useCaseHi: 'प्लेटफ़ॉर्म को नामित ज्योतिषीय स्रोत-सामग्री में आधारित दिखाने के लिए उपयोगी।',
  },
  {
    id: 'lal-kitab',
    title: 'Lal Kitab',
    titleHi: 'लाल किताब',
    source: 'ebook corpus / remedy modules',
    type: 'school',
    topics: ['remedies', 'karma', 'pucca ghar', 'andha graha'],
    topicsHi: ['उपाय', 'कर्म', 'पक्का घर', 'अंधा ग्रह'],
    summary: 'Practical remedy-based astrology focused on simple, actionable corrections.',
    summaryHi: 'सरल और व्यावहारिक उपायों पर आधारित ज्योतिष परंपरा।',
    useCase: 'Useful when you want low-cost, direct remedies.',
    useCaseHi: 'सस्ते और सीधे उपायों के लिए उपयोगी।',
  },
  {
    id: 'kp-system',
    title: 'KP System',
    titleHi: 'के.पी. सिस्टम',
    source: 'Krishnamurti Paddhati',
    type: 'school',
    topics: ['sub-lords', 'precision timing', 'cusps', 'houses'],
    topicsHi: ['सब-लॉर्ड', 'सटीक समय', 'कस्प', 'भाव'],
    summary: 'Precision astrology using sub-lords and cusp-based event timing.',
    summaryHi: 'सब-लॉर्ड और कस्प आधारित सटीक भविष्यवाणी प्रणाली।',
    useCase: 'Best for event timing and fine-grained prediction.',
    useCaseHi: 'घटना-समय और बारीक पूर्वानुमान के लिए।',
  },
  {
    id: 'vedic-principles',
    title: 'Classical Vedic Principles',
    titleHi: 'शास्त्रीय वैदिक सिद्धांत',
    source: 'BPHS / Phaladeepika / Saravali',
    type: 'principle',
    topics: ['dasha', 'transit', 'yoga', 'house meanings', 'graha karaka'],
    topicsHi: ['दशा', 'गोचर', 'योग', 'भाव अर्थ', 'ग्रह कारक'],
    summary: 'Core framework for natal analysis, transit support, and yogas.',
    summaryHi: 'जन्म कुंडली, गोचर समर्थन, और योगों का मूल ढांचा।',
    useCase: 'Primary base for serious horoscope interpretation.',
    useCaseHi: 'गंभीर कुंडली विश्लेषण का मूल आधार।',
  },
];

export function searchAstrologyLibrary(query: string): AstrologyLibraryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return ASTROLOGY_LIBRARY;
  return ASTROLOGY_LIBRARY.filter(entry =>
    [
      entry.title,
      entry.titleHi,
      entry.source,
      entry.summary,
      entry.summaryHi,
      entry.useCase,
      entry.useCaseHi,
      ...entry.topics,
      ...entry.topicsHi,
    ].some(field => field.toLowerCase().includes(q))
  );
}
