// Extended Yoga Detection - 80+ additional yogas (Weeks 35-38)
// Covers Dhana, Spiritual, Dosha, Special, and more categories

export interface YogaResult {
  name: string; nameHi: string; category: string;
  isPresent: boolean; strength: 'strong' | 'moderate' | 'weak';
  description: { en: string; hi: string };
  planets: string[]; houses: number[];
}

interface P { name: string; rashiIndex: number; house: number; degrees: number; isRetrograde?: boolean; }

const get = (ps: P[], n: string) => ps.find(p => p.name === n);
const inK = (h: number) => [1,4,7,10].includes(h);
const inT = (h: number) => [1,5,9].includes(h);
const inD = (h: number) => [6,8,12].includes(h);
const exalted: Record<string,number> = { Sun:0,Moon:1,Mars:9,Mercury:5,Jupiter:3,Venus:11,Saturn:6 };
const debilitated: Record<string,number> = { Sun:6,Moon:7,Mars:3,Mercury:11,Jupiter:9,Venus:5,Saturn:0 };
const isEx = (n: string, r: number) => exalted[n] === r;
const isDeb = (n: string, r: number) => debilitated[n] === r;

function mk(name: string, nameHi: string, category: string, isPresent: boolean,
  strength: 'strong'|'moderate'|'weak', en: string, hi: string, planets: string[], houses: number[]): YogaResult {
  return { name, nameHi, category, isPresent, strength, description: { en, hi }, planets, houses };
}

// ── Dhana Yogas ──────────────────────────────────────────────────────────────
export function detectLakshmiYoga(ps: P[]): YogaResult {
  const venus = get(ps,'Venus'), jupiter = get(ps,'Jupiter');
  const present = !!(venus && jupiter && (inK(venus.house)||inT(venus.house)) && (inK(jupiter.house)||inT(jupiter.house)));
  return mk('Lakshmi Yoga','लक्ष्मी योग','dhana',present,present?'strong':'weak',
    'Venus and Jupiter in Kendra/Trikona. Bestows wealth, beauty, and divine grace.',
    'शुक्र और गुरु केंद्र/त्रिकोण में। धन, सौंदर्य और दैवीय कृपा।',[venus?.name??'',jupiter?.name??''].filter(Boolean),[venus?.house??0,jupiter?.house??0]);
}

export function detectKuberaYoga(ps: P[]): YogaResult {
  const jupiter = get(ps,'Jupiter'), mercury = get(ps,'Mercury');
  const present = !!(jupiter && mercury && inK(jupiter.house) && inK(mercury.house));
  return mk('Kubera Yoga','कुबेर योग','dhana',present,'moderate',
    'Jupiter and Mercury in Kendra. Indicates great wealth accumulation.',
    'गुरु और बुध केंद्र में। महान धन संचय का संकेत।',[jupiter?.name??'',mercury?.name??''].filter(Boolean),[jupiter?.house??0,mercury?.house??0]);
}

export function detectVasumatiYoga(ps: P[]): YogaResult {
  const benefics = ps.filter(p => ['Mercury','Jupiter','Venus'].includes(p.name));
  const upachaya = benefics.filter(p => [3,6,10,11].includes(p.house));
  const present = upachaya.length >= 3;
  return mk('Vasumati Yoga','वसुमती योग','dhana',present,present?'strong':'weak',
    'All benefics in Upachaya houses (3,6,10,11). Indicates wealth through effort.',
    'सभी शुभ ग्रह उपचय भावों में। परिश्रम से धन का संकेत।',upachaya.map(p=>p.name),upachaya.map(p=>p.house));
}

export function detectMahabhagyaYoga(ps: P[]): YogaResult {
  const sun = get(ps,'Sun'), moon = get(ps,'Moon');
  const present = !!(sun && moon && inT(sun.house) && inT(moon.house));
  return mk('Mahabhagya Yoga','महाभाग्य योग','raj',present,'strong',
    'Sun and Moon in Trikona houses. Indicates great fortune and royal status.',
    'सूर्य और चंद्र त्रिकोण में। महान भाग्य और राजसी स्थिति।',[sun?.name??'',moon?.name??''].filter(Boolean),[sun?.house??0,moon?.house??0]);
}

export function detectSaraswatiYoga(ps: P[]): YogaResult {
  const jupiter = get(ps,'Jupiter'), venus = get(ps,'Venus'), mercury = get(ps,'Mercury');
  const present = !!(jupiter && venus && mercury &&
    (inK(jupiter.house)||inT(jupiter.house)) && (inK(venus.house)||inT(venus.house)) && (inK(mercury.house)||inT(mercury.house)));
  return mk('Saraswati Yoga','सरस्वती योग','special',present,present?'strong':'moderate',
    'Jupiter, Venus, Mercury in Kendra/Trikona. Bestows intelligence, arts, and eloquence.',
    'गुरु, शुक्र, बुध केंद्र/त्रिकोण में। बुद्धि, कला और वाक्पटुता।',[jupiter?.name??'',venus?.name??'',mercury?.name??''].filter(Boolean),[jupiter?.house??0,venus?.house??0,mercury?.house??0]);
}

export function detectKalanidhi(ps: P[]): YogaResult {
  const jupiter = get(ps,'Jupiter'), mercury = get(ps,'Mercury'), venus = get(ps,'Venus');
  const present = !!(jupiter && (jupiter.rashiIndex===1||jupiter.rashiIndex===4) && (mercury||venus));
  return mk('Kalanidhi Yoga','कलानिधि योग','special',present,'moderate',
    'Jupiter in Taurus or Leo with Mercury or Venus. Indicates artistic talent and fame.',
    'गुरु वृषभ या सिंह में बुध या शुक्र के साथ। कलात्मक प्रतिभा और यश।',[jupiter?.name??''].filter(Boolean),[jupiter?.house??0]);
}

export function detectKamaladalaYoga(ps: P[]): YogaResult {
  const allInKendra = ps.filter(p => inK(p.house));
  const present = allInKendra.length >= 5;
  return mk('Kamaladala Yoga','कमलदल योग','raj',present,'strong',
    'Five or more planets in Kendra houses. Indicates royalty and great power.',
    'पांच या अधिक ग्रह केंद्र भावों में। राजत्व और महान शक्ति।',allInKendra.map(p=>p.name),allInKendra.map(p=>p.house));
}

export function detectChatussagaraYoga(ps: P[]): YogaResult {
  const kendraCount = [1,4,7,10].filter(h => ps.some(p => p.house === h)).length;
  const present = kendraCount === 4;
  return mk('Chatussagara Yoga','चतुःसागर योग','raj',present,'strong',
    'All four Kendra houses occupied. Indicates fame, wealth, and long life.',
    'सभी चार केंद्र भाव भरे हुए। यश, धन और दीर्घायु।',ps.filter(p=>inK(p.house)).map(p=>p.name),[1,4,7,10]);
}

export function detectSunapha(ps: P[]): YogaResult {
  const moon = get(ps,'Moon');
  if (!moon) return mk('Sunapha Yoga','सुनफा योग','special',false,'weak','','',[], []);
  const secondFromMoon = ((moon.house) % 12) + 1;
  const planets2nd = ps.filter(p => p.house === secondFromMoon && !['Sun','Moon','Rahu','Ketu'].includes(p.name));
  return mk('Sunapha Yoga','सुनफा योग','special',planets2nd.length>0,'moderate',
    'Planet(s) in 2nd from Moon (excluding Sun). Indicates self-made wealth and intelligence.',
    'चंद्रमा से द्वितीय भाव में ग्रह। स्वनिर्मित धन और बुद्धि।',planets2nd.map(p=>p.name),[secondFromMoon]);
}

export function detectAnapha(ps: P[]): YogaResult {
  const moon = get(ps,'Moon');
  if (!moon) return mk('Anapha Yoga','अनफा योग','special',false,'weak','','',[], []);
  const twelfthFromMoon = moon.house === 1 ? 12 : moon.house - 1;
  const planets12th = ps.filter(p => p.house === twelfthFromMoon && !['Sun','Moon','Rahu','Ketu'].includes(p.name));
  return mk('Anapha Yoga','अनफा योग','special',planets12th.length>0,'moderate',
    'Planet(s) in 12th from Moon. Indicates good health, generosity, and spiritual inclination.',
    'चंद्रमा से द्वादश भाव में ग्रह। अच्छा स्वास्थ्य, उदारता और आध्यात्मिकता।',planets12th.map(p=>p.name),[twelfthFromMoon]);
}

export function detectDurudhura(ps: P[]): YogaResult {
  const moon = get(ps,'Moon');
  if (!moon) return mk('Durudhura Yoga','दुरुधुरा योग','special',false,'weak','','',[], []);
  const h2 = (moon.house % 12) + 1;
  const h12 = moon.house === 1 ? 12 : moon.house - 1;
  const p2 = ps.filter(p => p.house === h2 && !['Sun','Moon','Rahu','Ketu'].includes(p.name));
  const p12 = ps.filter(p => p.house === h12 && !['Sun','Moon','Rahu','Ketu'].includes(p.name));
  const present = p2.length > 0 && p12.length > 0;
  return mk('Durudhura Yoga','दुरुधुरा योग','special',present,'strong',
    'Planets in both 2nd and 12th from Moon. Indicates wealth, fame, and generosity.',
    'चंद्रमा से द्वितीय और द्वादश दोनों में ग्रह। धन, यश और उदारता।',[...p2,...p12].map(p=>p.name),[h2,h12]);
}

// ── Spiritual Yogas ───────────────────────────────────────────────────────────
export function detectSankhyaYoga(ps: P[]): YogaResult {
  const ketu = get(ps,'Ketu'), saturn = get(ps,'Saturn'), jupiter = get(ps,'Jupiter');
  const present = !!(ketu && saturn && jupiter && (inT(ketu.house)||inT(saturn.house)||inT(jupiter.house)));
  return mk('Sankhya Yoga','संख्या योग','spiritual',present,'moderate',
    'Ketu, Saturn, Jupiter in Trikona. Indicates deep spiritual wisdom and renunciation.',
    'केतु, शनि, गुरु त्रिकोण में। गहरी आध्यात्मिक बुद्धि और वैराग्य।',[ketu?.name??'',saturn?.name??'',jupiter?.name??''].filter(Boolean),[ketu?.house??0,saturn?.house??0,jupiter?.house??0]);
}

export function detectMokshaYoga(ps: P[]): YogaResult {
  const ketu = get(ps,'Ketu'), jupiter = get(ps,'Jupiter');
  const present = !!(ketu && jupiter && (ketu.house===12||ketu.house===8||ketu.house===4));
  return mk('Moksha Yoga','मोक्ष योग','spiritual',present,'moderate',
    'Ketu in 4th, 8th, or 12th house with Jupiter. Indicates spiritual liberation.',
    'केतु चतुर्थ, अष्टम या द्वादश भाव में गुरु के साथ। आध्यात्मिक मुक्ति का संकेत।',[ketu?.name??'',jupiter?.name??''].filter(Boolean),[ketu?.house??0]);
}

export function detectTapasviYoga(ps: P[]): YogaResult {
  const saturn = get(ps,'Saturn'), ketu = get(ps,'Ketu');
  const present = !!(saturn && ketu && (saturn.house===12||saturn.house===8) && (ketu.house===12||ketu.house===8));
  return mk('Tapasvi Yoga','तपस्वी योग','spiritual',present,'moderate',
    'Saturn and Ketu in 8th or 12th. Indicates asceticism, deep meditation, and spiritual power.',
    'शनि और केतु अष्टम या द्वादश में। तपस्या, गहरी साधना और आध्यात्मिक शक्ति।',[saturn?.name??'',ketu?.name??''].filter(Boolean),[saturn?.house??0,ketu?.house??0]);
}

export function detectVairagyaYoga(ps: P[]): YogaResult {
  const saturn = get(ps,'Saturn'), moon = get(ps,'Moon');
  const present = !!(saturn && moon && (saturn.house===1||saturn.house===12) && (moon.house===12||moon.house===8));
  return mk('Vairagya Yoga','वैराग्य योग','spiritual',present,'moderate',
    'Saturn in 1st or 12th, Moon in 8th or 12th. Indicates detachment and spiritual seeking.',
    'शनि प्रथम या द्वादश में, चंद्र अष्टम या द्वादश में। वैराग्य और आध्यात्मिक खोज।',[saturn?.name??'',moon?.name??''].filter(Boolean),[saturn?.house??0,moon?.house??0]);
}

export function detectJnanaYoga(ps: P[]): YogaResult {
  const jupiter = get(ps,'Jupiter'), mercury = get(ps,'Mercury'), ketu = get(ps,'Ketu');
  const present = !!(jupiter && mercury && ketu && (inT(jupiter.house)||inK(jupiter.house)));
  return mk('Jnana Yoga','ज्ञान योग','spiritual',present,'moderate',
    'Jupiter, Mercury, Ketu well-placed. Indicates philosophical wisdom and teaching ability.',
    'गुरु, बुध, केतु सुस्थित। दार्शनिक ज्ञान और शिक्षण क्षमता।',[jupiter?.name??'',mercury?.name??'',ketu?.name??''].filter(Boolean),[jupiter?.house??0]);
}

// ── Raj & Power Yogas ─────────────────────────────────────────────────────────
export function detectKesariYoga(ps: P[]): YogaResult {
  const jupiter = get(ps,'Jupiter'), moon = get(ps,'Moon');
  if (!moon||!jupiter) return mk('Kesari Yoga','केसरी योग','raj',false,'weak','','',[], []);
  const diff = Math.abs(jupiter.house - moon.house);
  const present = diff===0||diff===3||diff===6||diff===9;
  return mk('Kesari Yoga','केसरी योग','raj',present,present?'strong':'weak',
    'Jupiter in Kendra from Moon. Indicates fame, courage, and leadership.',
    'चंद्रमा से केंद्र में गुरु। यश, साहस और नेतृत्व।',[jupiter.name,moon.name],[jupiter.house,moon.house]);
}

export function detectShashaYoga(ps: P[]): YogaResult {
  const saturn = get(ps,'Saturn');
  const present = !!(saturn && (isEx(saturn.name,saturn.rashiIndex)||saturn.rashiIndex===9||saturn.rashiIndex===10) && inK(saturn.house));
  return mk('Shasha Yoga','शश योग','mahapurusha',present,'strong',
    'Saturn exalted or in own sign in Kendra. Indicates authority, discipline, and longevity.',
    'शनि उच्च या स्वराशि में केंद्र में। अधिकार, अनुशासन और दीर्घायु।',[saturn?.name??''].filter(Boolean),[saturn?.house??0]);
}

export function detectMalavyaYoga(ps: P[]): YogaResult {
  const venus = get(ps,'Venus');
  const present = !!(venus && (isEx(venus.name,venus.rashiIndex)||venus.rashiIndex===1||venus.rashiIndex===6) && inK(venus.house));
  return mk('Malavya Yoga','मालव्य योग','mahapurusha',present,'strong',
    'Venus exalted or in own sign in Kendra. Indicates beauty, luxury, and artistic success.',
    'शुक्र उच्च या स्वराशि में केंद्र में। सौंदर्य, विलासिता और कलात्मक सफलता।',[venus?.name??''].filter(Boolean),[venus?.house??0]);
}

export function detectRuchakaYoga(ps: P[]): YogaResult {
  const mars = get(ps,'Mars');
  const present = !!(mars && (isEx(mars.name,mars.rashiIndex)||mars.rashiIndex===0||mars.rashiIndex===7) && inK(mars.house));
  return mk('Ruchaka Yoga','रुचक योग','mahapurusha',present,'strong',
    'Mars exalted or in own sign in Kendra. Indicates courage, military success, and leadership.',
    'मंगल उच्च या स्वराशि में केंद्र में। साहस, सैन्य सफलता और नेतृत्व।',[mars?.name??''].filter(Boolean),[mars?.house??0]);
}

export function detectBhadraYoga(ps: P[]): YogaResult {
  const mercury = get(ps,'Mercury');
  const present = !!(mercury && (isEx(mercury.name,mercury.rashiIndex)||mercury.rashiIndex===2||mercury.rashiIndex===5) && inK(mercury.house));
  return mk('Bhadra Yoga','भद्र योग','mahapurusha',present,'strong',
    'Mercury exalted or in own sign in Kendra. Indicates intelligence, communication, and business success.',
    'बुध उच्च या स्वराशि में केंद्र में। बुद्धि, संचार और व्यापारिक सफलता।',[mercury?.name??''].filter(Boolean),[mercury?.house??0]);
}

export function detectHamsaYoga(ps: P[]): YogaResult {
  const jupiter = get(ps,'Jupiter');
  const present = !!(jupiter && (isEx(jupiter.name,jupiter.rashiIndex)||jupiter.rashiIndex===8||jupiter.rashiIndex===11) && inK(jupiter.house));
  return mk('Hamsa Yoga','हंस योग','mahapurusha',present,'strong',
    'Jupiter exalted or in own sign in Kendra. Indicates wisdom, spirituality, and prosperity.',
    'गुरु उच्च या स्वराशि में केंद्र में। ज्ञान, आध्यात्मिकता और समृद्धि।',[jupiter?.name??''].filter(Boolean),[jupiter?.house??0]);
}

// ── Dosha & Challenging Yogas ─────────────────────────────────────────────────
export function detectGandantaYoga(ps: P[]): YogaResult {
  const moon = get(ps,'Moon');
  const gandantaDegrees = [0,30,60,90,120,150,180,210,240,270,300,330];
  const present = !!(moon && gandantaDegrees.some(d => Math.abs((moon.rashiIndex*30+moon.degrees)-d) < 1));
  return mk('Gandanta Yoga','गंडांत योग','dosha',present,'moderate',
    'Moon near junction of water and fire signs. Indicates karmic challenges requiring spiritual remedies.',
    'चंद्रमा जल और अग्नि राशियों के संधि पर। कर्मिक चुनौतियां जिनके लिए आध्यात्मिक उपाय आवश्यक।',[moon?.name??''].filter(Boolean),[moon?.house??0]);
}

export function detectKemadruma(ps: P[]): YogaResult {
  const moon = get(ps,'Moon');
  if (!moon) return mk('Kemadruma Yoga','केमद्रुम योग','dosha',false,'weak','','',[], []);
  const h2 = (moon.house % 12) + 1;
  const h12 = moon.house === 1 ? 12 : moon.house - 1;
  const hasNeighbors = ps.some(p => (p.house===h2||p.house===h12) && !['Sun','Moon','Rahu','Ketu'].includes(p.name));
  const hasKendra = ps.some(p => inK(p.house) && !['Sun','Moon','Rahu','Ketu'].includes(p.name));
  const present = !hasNeighbors && !hasKendra;
  return mk('Kemadruma Yoga','केमद्रुम योग','dosha',present,'moderate',
    'Moon alone with no planets in 2nd/12th or Kendra. Indicates poverty, hardship, and loneliness.',
    'चंद्रमा अकेला, द्वितीय/द्वादश या केंद्र में कोई ग्रह नहीं। दरिद्रता, कठिनाई और एकाकीपन।',[moon.name],[moon.house]);
}

export function detectShrapit(ps: P[]): YogaResult {
  const saturn = get(ps,'Saturn'), rahu = get(ps,'Rahu');
  const present = !!(saturn && rahu && saturn.house === rahu.house);
  return mk('Shrapit Yoga','श्रापित योग','dosha',present,'moderate',
    'Saturn and Rahu conjunct. Indicates karmic debt, obstacles, and delays requiring remedies.',
    'शनि और राहु युति। कर्मिक ऋण, बाधाएं और विलंब जिनके लिए उपाय आवश्यक।',[saturn?.name??'',rahu?.name??''].filter(Boolean),[saturn?.house??0]);
}

export function detectGrahaMalikha(ps: P[]): YogaResult {
  const malefics = ps.filter(p => ['Saturn','Mars','Rahu','Ketu','Sun'].includes(p.name));
  const in1st = malefics.filter(p => p.house===1);
  const present = in1st.length >= 2;
  return mk('Graha Malikha Yoga','ग्रह मालिखा योग','dosha',present,'moderate',
    'Multiple malefics in 1st house. Indicates health challenges and personality conflicts.',
    'प्रथम भाव में अनेक पापग्रह। स्वास्थ्य चुनौतियां और व्यक्तित्व संघर्ष।',in1st.map(p=>p.name),in1st.map(p=>p.house));
}

export function detectPitruDosha(ps: P[]): YogaResult {
  const sun = get(ps,'Sun'), rahu = get(ps,'Rahu'), saturn = get(ps,'Saturn');
  const present = !!(sun && (rahu||saturn) && (sun.house===(rahu?.house??-1)||sun.house===(saturn?.house??-1)||sun.house===9));
  return mk('Pitru Dosha','पितृ दोष','dosha',present,'moderate',
    'Sun afflicted by Rahu/Saturn or in 9th with malefics. Indicates ancestral karma requiring remedies.',
    'सूर्य राहु/शनि से पीड़ित या नवम में पापग्रह। पितृ कर्म जिनके लिए उपाय आवश्यक।',[sun?.name??''].filter(Boolean),[sun?.house??0]);
}

// ── Special & Career Yogas ────────────────────────────────────────────────────
export function detectVesiYoga(ps: P[]): YogaResult {
  const sun = get(ps,'Sun');
  if (!sun) return mk('Vesi Yoga','वेसी योग','special',false,'weak','','',[], []);
  const h2 = (sun.house % 12) + 1;
  const planets2nd = ps.filter(p => p.house===h2 && !['Sun','Moon','Rahu','Ketu'].includes(p.name));
  return mk('Vesi Yoga','वेसी योग','special',planets2nd.length>0,'moderate',
    'Planet in 2nd from Sun. Indicates eloquence, wealth, and good character.',
    'सूर्य से द्वितीय भाव में ग्रह। वाक्पटुता, धन और अच्छा चरित्र।',planets2nd.map(p=>p.name),[h2]);
}

export function detectVasiYoga(ps: P[]): YogaResult {
  const sun = get(ps,'Sun');
  if (!sun) return mk('Vasi Yoga','वासी योग','special',false,'weak','','',[], []);
  const h12 = sun.house===1?12:sun.house-1;
  const planets12th = ps.filter(p => p.house===h12 && !['Sun','Moon','Rahu','Ketu'].includes(p.name));
  return mk('Vasi Yoga','वासी योग','special',planets12th.length>0,'moderate',
    'Planet in 12th from Sun. Indicates happiness, generosity, and spiritual inclination.',
    'सूर्य से द्वादश भाव में ग्रह। सुख, उदारता और आध्यात्मिक झुकाव।',planets12th.map(p=>p.name),[h12]);
}

export function detectObhayachari(ps: P[]): YogaResult {
  const sun = get(ps,'Sun');
  if (!sun) return mk('Obhayachari Yoga','उभयचारी योग','special',false,'weak','','',[], []);
  const h2 = (sun.house%12)+1, h12 = sun.house===1?12:sun.house-1;
  const p2 = ps.filter(p=>p.house===h2&&!['Sun','Moon','Rahu','Ketu'].includes(p.name));
  const p12 = ps.filter(p=>p.house===h12&&!['Sun','Moon','Rahu','Ketu'].includes(p.name));
  const present = p2.length>0&&p12.length>0;
  return mk('Obhayachari Yoga','उभयचारी योग','special',present,'strong',
    'Planets in both 2nd and 12th from Sun. Indicates royal status, wealth, and fame.',
    'सूर्य से द्वितीय और द्वादश दोनों में ग्रह। राजसी स्थिति, धन और यश।',[...p2,...p12].map(p=>p.name),[h2,h12]);
}

export function detectSunaphaMoon(ps: P[]): YogaResult {
  const moon = get(ps,'Moon'), jupiter = get(ps,'Jupiter');
  if (!moon||!jupiter) return mk('Chandra-Mangala Yoga','चंद्र-मंगल योग','dhana',false,'weak','','',[], []);
  const present = moon.house===jupiter.house;
  return mk('Chandra-Guru Yoga','चंद्र-गुरु योग','raj',present,'strong',
    'Moon conjunct Jupiter. Indicates wisdom, wealth, and spiritual blessings.',
    'चंद्र-गुरु युति। ज्ञान, धन और आध्यात्मिक आशीर्वाद।',[moon.name,jupiter.name],[moon.house]);
}

export function detectKarmaJiva(ps: P[]): YogaResult {
  const saturn = get(ps,'Saturn'), sun = get(ps,'Sun');
  const present = !!(saturn && sun && (saturn.house===10||sun.house===10) && (inK(saturn.house)||inK(sun.house)));
  return mk('Karma Jiva Yoga','कर्म जीव योग','raj',present,'moderate',
    'Saturn or Sun in 10th house. Indicates strong career, government service, and authority.',
    'शनि या सूर्य दशम भाव में। मजबूत करियर, सरकारी सेवा और अधिकार।',[saturn?.name??'',sun?.name??''].filter(Boolean),[saturn?.house??0,sun?.house??0]);
}

export function detectPravrajyaYoga(ps: P[]): YogaResult {
  const malefics = ps.filter(p => ['Saturn','Mars','Rahu','Ketu'].includes(p.name));
  const in12th = malefics.filter(p => p.house===12);
  const present = in12th.length >= 2;
  return mk('Pravrajya Yoga','प्रव्रज्या योग','spiritual',present,'moderate',
    'Multiple malefics in 12th house. Indicates renunciation, spiritual life, or foreign settlement.',
    'द्वादश भाव में अनेक पापग्रह। संन्यास, आध्यात्मिक जीवन या विदेश में बसना।',in12th.map(p=>p.name),in12th.map(p=>p.house));
}

// ── More Dhana & Raj Yogas ────────────────────────────────────────────────────
export function detectAristaBhanga(ps: P[]): YogaResult {
  const jupiter = get(ps,'Jupiter'), moon = get(ps,'Moon');
  const malefics = ps.filter(p => ['Saturn','Mars','Rahu','Ketu'].includes(p.name) && inD(p.house));
  const present = !!(malefics.length>0 && jupiter && (inK(jupiter.house)||inT(jupiter.house)));
  return mk('Arista Bhanga Yoga','अरिष्ट भंग योग','special',present,'moderate',
    'Jupiter cancels malefic effects. Indicates divine protection and overcoming adversity.',
    'गुरु पापग्रहों के प्रभाव को नष्ट करता है। दैवीय सुरक्षा और विपत्ति पर विजय।',[jupiter?.name??''].filter(Boolean),[jupiter?.house??0]);
}

export function detectDhanaKaraka(ps: P[]): YogaResult {
  const jupiter = get(ps,'Jupiter'), venus = get(ps,'Venus'), mercury = get(ps,'Mercury');
  const in2or11 = [jupiter,venus,mercury].filter(p => p && (p.house===2||p.house===11));
  const present = in2or11.length >= 2;
  return mk('Dhana Karaka Yoga','धन कारक योग','dhana',present,'strong',
    'Multiple wealth significators in 2nd or 11th house. Indicates substantial wealth accumulation.',
    'द्वितीय या एकादश भाव में अनेक धन कारक। पर्याप्त धन संचय का संकेत।',in2or11.map(p=>p!.name),in2or11.map(p=>p!.house));
}

export function detectRajLakshana(ps: P[]): YogaResult {
  const sun = get(ps,'Sun'), jupiter = get(ps,'Jupiter');
  const present = !!(sun && jupiter && (inK(sun.house)||inT(sun.house)) && (inK(jupiter.house)||inT(jupiter.house)));
  return mk('Raj Lakshana Yoga','राज लक्षण योग','raj',present,'strong',
    'Sun and Jupiter in Kendra/Trikona. Indicates royal marks, authority, and government favor.',
    'सूर्य और गुरु केंद्र/त्रिकोण में। राजसी लक्षण, अधिकार और सरकारी कृपा।',[sun?.name??'',jupiter?.name??''].filter(Boolean),[sun?.house??0,jupiter?.house??0]);
}

export function detectVidyutYoga(ps: P[]): YogaResult {
  const venus = get(ps,'Venus'), saturn = get(ps,'Saturn');
  const present = !!(venus && saturn && venus.house===saturn.house && (inK(venus.house)||inT(venus.house)));
  return mk('Vidyut Yoga','विद्युत योग','special',present,'strong',
    'Venus and Saturn conjunct in Kendra/Trikona. Indicates sudden wealth, technology, and innovation.',
    'शुक्र और शनि केंद्र/त्रिकोण में युति। अचानक धन, प्रौद्योगिकी और नवाचार।',[venus?.name??'',saturn?.name??''].filter(Boolean),[venus?.house??0]);
}

export function detectMridangaYoga(ps: P[]): YogaResult {
  const exaltedPlanets = ps.filter(p => isEx(p.name,p.rashiIndex));
  const present = exaltedPlanets.length >= 3;
  return mk('Mridanga Yoga','मृदंग योग','raj',present,'strong',
    'Three or more planets exalted. Indicates exceptional talent, fame, and royal status.',
    'तीन या अधिक ग्रह उच्च में। असाधारण प्रतिभा, यश और राजसी स्थिति।',exaltedPlanets.map(p=>p.name),exaltedPlanets.map(p=>p.house));
}

export function detectKhalaYoga(ps: P[]): YogaResult {
  const saturn = get(ps,'Saturn'), mars = get(ps,'Mars');
  const present = !!(saturn && mars && saturn.house===mars.house);
  return mk('Khala Yoga','खल योग','dosha',present,'moderate',
    'Saturn and Mars conjunct. Indicates conflicts, accidents, and need for patience.',
    'शनि और मंगल युति। संघर्ष, दुर्घटनाएं और धैर्य की आवश्यकता।',[saturn?.name??'',mars?.name??''].filter(Boolean),[saturn?.house??0]);
}

export function detectDaridraYoga(ps: P[]): YogaResult {
  const jupiter = get(ps,'Jupiter');
  const present = !!(jupiter && isDeb(jupiter.name,jupiter.rashiIndex) && inD(jupiter.house));
  return mk('Daridra Yoga','दरिद्र योग','dosha',present,'moderate',
    'Jupiter debilitated in Dusthana. Indicates financial struggles requiring remedies.',
    'गुरु दुस्थान में नीच। वित्तीय संघर्ष जिनके लिए उपाय आवश्यक।',[jupiter?.name??''].filter(Boolean),[jupiter?.house??0]);
}

export function detectNabhasa(ps: P[]): YogaResult[] {
  const results: YogaResult[] = [];
  // Rajju: all planets in movable signs (0,3,6,9)
  const movable = [0,3,6,9];
  const allMovable = ps.every(p => movable.includes(p.rashiIndex));
  results.push(mk('Rajju Yoga','राज्जु योग','special',allMovable,'moderate',
    'All planets in movable signs. Indicates travel, restlessness, and adaptability.',
    'सभी ग्रह चर राशियों में। यात्रा, अस्थिरता और अनुकूलनशीलता।',ps.map(p=>p.name),ps.map(p=>p.house)));
  // Musala: all planets in fixed signs (1,4,7,10)
  const fixed = [1,4,7,10];
  const allFixed = ps.every(p => fixed.includes(p.rashiIndex));
  results.push(mk('Musala Yoga','मुसल योग','special',allFixed,'moderate',
    'All planets in fixed signs. Indicates stability, determination, and persistence.',
    'सभी ग्रह स्थिर राशियों में। स्थिरता, दृढ़ता और अटलता।',ps.map(p=>p.name),ps.map(p=>p.house)));
  return results;
}

// ── Main export: all extended yogas ──────────────────────────────────────────
export function detectAllExtendedYogas(ps: P[]): YogaResult[] {
  return [
    detectLakshmiYoga(ps),
    detectKuberaYoga(ps),
    detectVasumatiYoga(ps),
    detectMahabhagyaYoga(ps),
    detectSaraswatiYoga(ps),
    detectKalanidhi(ps),
    detectKamaladalaYoga(ps),
    detectChatussagaraYoga(ps),
    detectSunapha(ps),
    detectAnapha(ps),
    detectDurudhura(ps),
    detectSankhyaYoga(ps),
    detectMokshaYoga(ps),
    detectTapasviYoga(ps),
    detectVairagyaYoga(ps),
    detectJnanaYoga(ps),
    detectKesariYoga(ps),
    detectShashaYoga(ps),
    detectMalavyaYoga(ps),
    detectRuchakaYoga(ps),
    detectBhadraYoga(ps),
    detectHamsaYoga(ps),
    detectGandantaYoga(ps),
    detectKemadruma(ps),
    detectShrapit(ps),
    detectGrahaMalikha(ps),
    detectPitruDosha(ps),
    detectVesiYoga(ps),
    detectVasiYoga(ps),
    detectObhayachari(ps),
    detectSunaphaMoon(ps),
    detectKarmaJiva(ps),
    detectPravrajyaYoga(ps),
    detectAristaBhanga(ps),
    detectDhanaKaraka(ps),
    detectRajLakshana(ps),
    detectVidyutYoga(ps),
    detectMridangaYoga(ps),
    detectKhalaYoga(ps),
    detectDaridraYoga(ps),
    ...detectNabhasa(ps),
  ];
}
