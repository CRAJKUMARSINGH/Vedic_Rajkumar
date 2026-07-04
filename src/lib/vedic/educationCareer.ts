/**
 * Karma-Vidhya Sanhita (कर्म-विद्या संहिता)
 * "The Compendium of Career & Learning"
 *
 * Covers:
 *  - Education prospects (houses 4, 5, 9 + Mercury/Jupiter dignity)
 *  - Auspiciousness scoring across Technical / Medical / Admin /
 *    Academics / Business / Govt / Private fields
 *  - Profession characteristics (temperament, working style, strengths)
 *  - Major career ups & downs (simplified dasha-transit model)
 *  - Spiritual remedies for Mercury, Jupiter, Saraswati, Saturn, Sun
 */

import type { ChartData } from './vedicCalc';
import { RASHIS_HI, RASHIS_EN } from './vedicCalc';

/* ─────────────────────────────── Types ─────────────────────────────────── */

export interface EducationResult {
  level: string;
  levelHi: string;
  strengths: string[];
  strengthsHi: string[];
  challenges: string[];
  challengesHi: string[];
  bestSubjects: string[];
  bestSubjectsHi: string[];
  educationTiming: string;
  educationTimingHi: string;
  higherEducationProspect: string;
  higherEducationProspectHi: string;
}

/** Score out of 100 for each broad career domain */
export interface FieldScore {
  field: string;
  fieldHi: string;
  score: number;       // 0–100
  grade: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Challenging';
  gradeHi: string;
  reason: string;
  reasonHi: string;
  icon: string;
}

export interface CareerResult {
  primaryField: string;
  primaryFieldHi: string;
  suitableProfessions: string[];
  suitableProfessionsHi: string[];
  professionCharacteristics: string[];
  professionCharacteristicsHi: string[];
  careerStrengths: string[];
  careerStrengthsHi: string[];
  favorableYears: string[];
  favorableYearsHi: string[];
  businessVsService: string;
  businessVsServiceHi: string;
  auspiciousness: FieldScore[];
  overallDesc: string;
  overallDescHi: string;
}

export interface CareerPhase {
  period: string;
  periodHi: string;
  type: 'rise' | 'peak' | 'challenge' | 'consolidation';
  icon: string;
  description: string;
  descriptionHi: string;
  advice: string;
  adviceHi: string;
}

export interface VidhyaKarmaRemedies {
  planet: string;
  icon: string;
  remedy: string;
  remedyHi: string;
  mantra: string;
}

/* ─────────────────────────────── Helpers ────────────────────────────────── */

const RASHI_LORD: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon',
  5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars',
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter',
};
const RASHI_LORD_HI: Record<number, string> = {
  1: 'मंगल', 2: 'शुक्र', 3: 'बुध', 4: 'चन्द्र',
  5: 'सूर्य', 6: 'बुध', 7: 'शुक्र', 8: 'मंगल',
  9: 'गुरु', 10: 'शनि', 11: 'शनि', 12: 'गुरु',
};

function getPlanetHouse(chart: ChartData, name: string): number {
  return chart.planets.find(p => p.name === name)?.house ?? 0;
}
function getPlanetRashi(chart: ChartData, name: string): number {
  return chart.planets.find(p => p.name === name)?.rashi ?? 1;
}

/** Kendra (1,4,7,10) + Trikona (5,9) dignity check */
function planetStrength(chart: ChartData, name: string): number {
  const p = chart.planets.find(pl => pl.name === name);
  if (!p) return 0;
  const kendra = [1, 4, 7, 10];
  const trikona = [1, 5, 9];
  let score = 20; // base
  if (kendra.includes(p.house)) score += 30;
  if (trikona.includes(p.house)) score += 25;
  // Dusthana penalty (6,8,12)
  if ([6, 8, 12].includes(p.house)) score -= 20;
  return Math.max(0, Math.min(100, score));
}

/* ───────────────────────── Subject map (5th lord) ──────────────────────── */

const SUBJECT_BY_LORD: Record<string, { subjects: string[]; subjectsHi: string[] }> = {
  Sun:     { subjects: ['Biology', 'History', 'Political Science', 'Leadership'], subjectsHi: ['जीव विज्ञान', 'इतिहास', 'राजनीति विज्ञान', 'नेतृत्व'] },
  Moon:    { subjects: ['Literature', 'Psychology', 'Botany', 'Social Sciences'], subjectsHi: ['साहित्य', 'मनोविज्ञान', 'वनस्पति विज्ञान', 'समाज विज्ञान'] },
  Mars:    { subjects: ['Mathematics', 'Physics', 'Engineering', 'Physical Education', 'Surgery'], subjectsHi: ['गणित', 'भौतिकी', 'इंजीनियरिंग', 'शारीरिक शिक्षा', 'शल्य-चिकित्सा'] },
  Mercury: { subjects: ['Mathematics', 'Computer Science', 'Commerce', 'Languages', 'Statistics'], subjectsHi: ['गणित', 'कम्प्यूटर विज्ञान', 'वाणिज्य', 'भाषाएं', 'सांख्यिकी'] },
  Jupiter: { subjects: ['Philosophy', 'Law', 'Economics', 'Sanskrit / Vedic Studies', 'Teaching'], subjectsHi: ['दर्शन', 'कानून', 'अर्थशास्त्र', 'संस्कृत/वैदिक अध्ययन', 'शिक्षण'] },
  Venus:   { subjects: ['Fine Arts', 'Music', 'Design', 'Architecture', 'Fashion'], subjectsHi: ['ललित कला', 'संगीत', 'डिज़ाइन', 'वास्तुकला', 'फ़ैशन'] },
  Saturn:  { subjects: ['Science', 'Mechanical Engineering', 'Geology', 'Research', 'Labour Studies'], subjectsHi: ['विज्ञान', 'यांत्रिक इंजीनियरिंग', 'भूविज्ञान', 'अनुसंधान', 'श्रम अध्ययन'] },
};

/* ──────────────────────── Career field map (10th lord) ─────────────────── */

const CAREER_BY_LORD: Record<string, {
  fields: string[]; fieldsHi: string[];
  chars: string[]; charsHi: string[];
}> = {
  Sun: {
    fields: ['Government Service', 'Administration', 'Politics', 'Management', 'Medicine', 'Precious metals trade'],
    fieldsHi: ['सरकारी सेवा', 'प्रशासन', 'राजनीति', 'प्रबन्धन', 'चिकित्सा', 'सोना/कीमती धातु'],
    chars: ['Natural authority, commands respect', 'Performs best in leadership / decision-making roles', 'Strong sense of responsibility and accountability', 'Works better in structured hierarchy'],
    charsHi: ['स्वाभाविक अधिकार, आदर पाता है', 'नेतृत्व/निर्णय भूमिकाओं में सर्वश्रेष्ठ', 'जिम्मेदारी और जवाबदेही की प्रबल भावना', 'संरचित श्रेणी में बेहतर काम करता है'],
  },
  Moon: {
    fields: ['Healthcare / Nursing', 'Hospitality', 'Food industry', 'Agriculture', 'Import-Export', 'Public Relations'],
    fieldsHi: ['स्वास्थ्य/नर्सिंग', 'आतिथ्य', 'खाद्य उद्योग', 'कृषि', 'आयात-निर्यात', 'जनसम्पर्क'],
    chars: ['Empathetic and people-oriented work style', 'Excels in roles involving public interaction', 'Emotionally intelligent — strong team builder', 'Career may have fluctuations tied to mood / health cycles'],
    charsHi: ['सहानुभूतिपूर्ण और जन-उन्मुख कार्यशैली', 'जन-सम्पर्क भूमिकाओं में श्रेष्ठ', 'भावनात्मक बुद्धि — सशक्त टीम निर्माता', 'करियर में मूड/स्वास्थ्य चक्रों से उतार-चढ़ाव'],
  },
  Mars: {
    fields: ['Engineering', 'Military / Police', 'Surgery', 'Real Estate', 'Sports', 'Construction'],
    fieldsHi: ['इंजीनियरिंग', 'सेना/पुलिस', 'शल्य-चिकित्सा', 'अचल सम्पत्ति', 'खेल', 'निर्माण'],
    chars: ['High energy, decisive, action-oriented', 'Thrives under pressure and competition', 'Good physical and mechanical aptitude', 'Can be impatient — needs structured outlets'],
    charsHi: ['उच्च ऊर्जा, निर्णायक, कार्योन्मुखी', 'दबाव और प्रतिस्पर्धा में फलता-फूलता है', 'अच्छी शारीरिक और यांत्रिक अभिरुचि', 'अधीर हो सकता है — संरचित निकास चाहिए'],
  },
  Mercury: {
    fields: ['IT / Software', 'Communication', 'Journalism', 'Commerce / Accounting', 'Teaching', 'Writing / Publishing'],
    fieldsHi: ['IT/सॉफ्टवेयर', 'संचार/मीडिया', 'पत्रकारिता', 'वाणिज्य/लेखाकारी', 'शिक्षण', 'लेखन/प्रकाशन'],
    chars: ['Analytical, versatile, quick learner', 'Multi-tasking ability; performs well in dynamic environments', 'Strong communication (written & verbal)', 'May scatter energy — needs clear goal-setting'],
    charsHi: ['विश्लेषणात्मक, बहुमुखी, तेज़ सीखने वाला', 'बहु-कार्य क्षमता; गतिशील वातावरण में बेहतर', 'सशक्त संचार (लिखित और मौखिक)', 'ऊर्जा बिखर सकती है — स्पष्ट लक्ष्य-निर्धारण ज़रूरी'],
  },
  Jupiter: {
    fields: ['Law', 'Teaching / Academia', 'Finance / Banking', 'Counselling', 'Religion / Philosophy', 'Consulting'],
    fieldsHi: ['वकालत', 'शिक्षण/शिक्षा', 'वित्त/बैंकिंग', 'परामर्श', 'धर्म/दर्शन', 'सलाहकारी'],
    chars: ['Wise, principled, respected by peers', 'Natural guide, mentor, or advisor', 'Long-term career growth — builds slowly but solidly', 'Financially prudent; avoids high-risk ventures'],
    charsHi: ['बुद्धिमान, सिद्धांतवादी, साथियों द्वारा सम्मानित', 'स्वाभाविक मार्गदर्शक, गुरु या सलाहकार', 'दीर्घकालिक करियर वृद्धि — धीमी पर ठोस', 'वित्तीय रूप से विवेकशील; जोखिम से बचता है'],
  },
  Venus: {
    fields: ['Arts / Design', 'Entertainment', 'Fashion / Beauty', 'Luxury Goods', 'Hotels / Tourism', 'Film / Music'],
    fieldsHi: ['कला/डिज़ाइन', 'मनोरंजन', 'फ़ैशन/सौन्दर्य', 'विलासिता वस्तुएं', 'होटल/पर्यटन', 'फ़िल्म/संगीत'],
    chars: ['Creative, aesthetic sense, charming personality', 'Excels in client-facing and brand roles', 'Builds strong professional networks', 'Career benefited by appearance and social skills'],
    charsHi: ['रचनात्मक, सौन्दर्य-बोध, आकर्षक व्यक्तित्व', 'ग्राहक-सामना और ब्रांड भूमिकाओं में श्रेष्ठ', 'मज़बूत पेशेवर नेटवर्क बनाता है', 'रूप और सामाजिक कौशल से करियर लाभान्वित'],
  },
  Saturn: {
    fields: ['Law / Judiciary', 'Mining / Oil', 'Social Work', 'Mechanical Engineering', 'Research', 'Government service'],
    fieldsHi: ['कानून/न्यायपालिका', 'खनन/तेल', 'समाजसेवा', 'यांत्रिक इंजीनियरिंग', 'अनुसंधान', 'सरकारी सेवा'],
    chars: ['Disciplined, methodical, persistent', 'Rises late but achieves lasting success', 'Suited for long-tenure, process-driven organisations', 'May feel early career is slow — keep working steadily'],
    charsHi: ['अनुशासित, व्यवस्थित, दृढ़', 'देर से उठता है लेकिन स्थायी सफलता पाता है', 'दीर्घकालिक, प्रक्रिया-चालित संगठनों के लिए उपयुक्त', 'शुरुआती करियर धीमी लग सकती है — लगातार काम करते रहें'],
  },
};

/* ──────────────────────── Auspiciousness scoring ───────────────────────── */

/**
 * Score seven broad career domains on a 0–100 scale
 * using the native's planetary configuration.
 */
export function analyzeCareerAuspiciousness(d1: ChartData): FieldScore[] {
  const sun  = planetStrength(d1, 'Sun');
  const moon = planetStrength(d1, 'Moon');
  const mars = planetStrength(d1, 'Mars');
  const merc = planetStrength(d1, 'Mercury');
  const jupi = planetStrength(d1, 'Jupiter');
  const venu = planetStrength(d1, 'Venus');
  const satn = planetStrength(d1, 'Saturn');

  const sunH  = getPlanetHouse(d1, 'Sun');
  const marsH = getPlanetHouse(d1, 'Mars');

  const grade = (s: number): { grade: FieldScore['grade']; gradeHi: string } => {
    if (s >= 80) return { grade: 'Excellent',  gradeHi: 'उत्कृष्ट' };
    if (s >= 65) return { grade: 'Very Good',  gradeHi: 'बहुत अच्छा' };
    if (s >= 50) return { grade: 'Good',       gradeHi: 'अच्छा' };
    if (s >= 35) return { grade: 'Average',    gradeHi: 'सामान्य' };
    return { grade: 'Challenging', gradeHi: 'चुनौतीपूर्ण' };
  };

  // Technical — Mars + Mercury + Saturn (engineering, IT, technical fields)
  const techScore = Math.round((mars * 0.35 + merc * 0.35 + satn * 0.30));
  // Medical — Mars + Moon + Jupiter (surgery, healing, healthcare)
  const medScore  = Math.round((mars * 0.35 + moon * 0.30 + jupi * 0.35));
  // Administration / Govt officer — Sun + Saturn + Jupiter
  const adminScore = Math.round((sun * 0.40 + satn * 0.35 + jupi * 0.25));
  // Academics / Teaching / Research — Jupiter + Mercury + 9th house
  const ninthLord = RASHI_LORD[d1.houseRashis[8]] ?? 'Jupiter';
  const ninthLordStr = planetStrength(d1, ninthLord);
  const acadScore = Math.round((jupi * 0.40 + merc * 0.35 + ninthLordStr * 0.25));
  // Business / Trade — Mercury + Venus + 2nd/7th/11th house
  const secondLord = RASHI_LORD[d1.houseRashis[1]] ?? 'Venus';
  const elevLord   = RASHI_LORD[d1.houseRashis[10]] ?? 'Saturn';
  const busScore = Math.round((merc * 0.30 + venu * 0.25 +
    planetStrength(d1, secondLord) * 0.25 + planetStrength(d1, elevLord) * 0.20));
  // Government service — Sun + Saturn (authority + service)
  const govtScore = Math.round((sun * 0.50 + satn * 0.50));
  // Private sector / Corporate — Mercury + Venus + Mars
  const pvtScore  = Math.round((merc * 0.35 + venu * 0.30 + mars * 0.35));

  const fields: Array<{ field: string; fieldHi: string; icon: string; score: number;
                         reason: string; reasonHi: string }> = [
    {
      field: 'Technical (Engg / IT / Science)',
      fieldHi: 'तकनीकी (इंजी./IT/विज्ञान)',
      icon: '⚙️',
      score: techScore,
      reason: `Mars ${mars}%, Mercury ${merc}%, Saturn ${satn}% — technical aptitude composite`,
      reasonHi: `मंगल ${mars}%, बुध ${merc}%, शनि ${satn}% — तकनीकी अभिरुचि संयुक्त`,
    },
    {
      field: 'Medical (Doctor / Healthcare)',
      fieldHi: 'चिकित्सा (डॉक्टर/स्वास्थ्य)',
      icon: '🏥',
      score: medScore,
      reason: `Mars (surgery) ${mars}%, Moon (healing) ${moon}%, Jupiter (wisdom) ${jupi}%`,
      reasonHi: `मंगल (शल्य) ${mars}%, चन्द्र (चिकित्सा) ${moon}%, गुरु (ज्ञान) ${jupi}%`,
    },
    {
      field: 'Administration / IAS-IPS',
      fieldHi: 'प्रशासन / IAS-IPS',
      icon: '🏛️',
      score: adminScore,
      reason: `Sun (authority) ${sun}%, Saturn (service) ${satn}%, Jupiter (judgement) ${jupi}%`,
      reasonHi: `सूर्य (अधिकार) ${sun}%, शनि (सेवा) ${satn}%, गुरु (निर्णय) ${jupi}%`,
    },
    {
      field: 'Academics / Teaching / Research',
      fieldHi: 'शिक्षण / अकादमिक / शोध',
      icon: '🎓',
      score: acadScore,
      reason: `Jupiter (wisdom) ${jupi}%, Mercury (intellect) ${merc}%, 9th lord ${ninthLordStr}%`,
      reasonHi: `गुरु (ज्ञान) ${jupi}%, बुध (बुद्धि) ${merc}%, नवमेश ${ninthLordStr}%`,
    },
    {
      field: 'Business / Entrepreneurship',
      fieldHi: 'व्यापार / उद्यमिता',
      icon: '📊',
      score: busScore,
      reason: `Mercury (commerce) ${merc}%, Venus (luxury) ${venu}%, 2nd/11th lords`,
      reasonHi: `बुध (वाणिज्य) ${merc}%, शुक्र ${venu}%, २/११ भाव स्वामी`,
    },
    {
      field: 'Government Service',
      fieldHi: 'सरकारी सेवा',
      icon: '🏅',
      score: govtScore,
      reason: `Sun (authority) ${sun}%, Saturn (service discipline) ${satn}%`,
      reasonHi: `सूर्य (अधिकार) ${sun}%, शनि (सेवा अनुशासन) ${satn}%`,
    },
    {
      field: 'Private Sector / Corporate',
      fieldHi: 'निजी क्षेत्र / कॉर्पोरेट',
      icon: '🏢',
      score: pvtScore,
      reason: `Mercury (versatility) ${merc}%, Venus (presentation) ${venu}%, Mars (drive) ${mars}%`,
      reasonHi: `बुध (बहुमुखिता) ${merc}%, शुक्र (प्रस्तुति) ${venu}%, मंगल (ऊर्जा) ${mars}%`,
    },
  ];

  return fields
    .sort((a, b) => b.score - a.score)
    .map(f => ({ ...f, ...grade(f.score) }));
}

/* ──────────────────────── Major Career Ups & Downs ─────────────────────── */

export function analyzeCareerUpsDowns(d1: ChartData, birthYear: number): CareerPhase[] {
  const tenthRashi   = d1.houseRashis[9];
  const tenthLord    = RASHI_LORD[tenthRashi] ?? 'Saturn';
  const tenthLordH   = getPlanetHouse(d1, tenthLord);
  const saturnH      = getPlanetHouse(d1, 'Saturn');
  const rahuH        = getPlanetHouse(d1, 'Rahu');
  const jupiterH     = getPlanetHouse(d1, 'Jupiter');
  const sunH         = getPlanetHouse(d1, 'Sun');
  const marsH        = getPlanetHouse(d1, 'Mars');

  const phases: CareerPhase[] = [];

  // Phase 1: Education & foundation (roughly age 18–23)
  const foundStart = birthYear + 18;
  const foundEnd   = birthYear + 23;
  phases.push({
    period: `${foundStart}–${foundEnd} (Age 18–23)`,
    periodHi: `${foundStart}–${foundEnd} (आयु १८–२३)`,
    type: 'consolidation',
    icon: '📚',
    description: 'Education foundation phase — skills, qualifications, and early exposure.',
    descriptionHi: 'शिक्षा आधार चरण — कौशल, योग्यता और प्रारम्भिक अनुभव।',
    advice: 'Focus on building credentials. This is investment time, not earning time.',
    adviceHi: 'योग्यता निर्माण पर ध्यान दें। यह निवेश काल है, कमाई का नहीं।',
  });

  // Phase 2: Entry & first rise (age 23–27) — depends on 10th lord placement
  const riseStart = birthYear + 23;
  const riseEnd   = birthYear + 27;
  const isGoodEntry = [1, 5, 9, 10].includes(tenthLordH);
  phases.push({
    period: `${riseStart}–${riseEnd} (Age 23–27)`,
    periodHi: `${riseStart}–${riseEnd} (आयु २३–२७)`,
    type: isGoodEntry ? 'rise' : 'consolidation',
    icon: isGoodEntry ? '📈' : '⚖️',
    description: isGoodEntry
      ? `Strong 10th lord (${tenthLord}) in ${tenthLordH}th — early career momentum. First job / promotion likely.`
      : `10th lord in ${tenthLordH}th — gradual entry. Career builds through persistence, not luck.`,
    descriptionHi: isGoodEntry
      ? `दशमेश (${RASHI_LORD_HI[tenthRashi]}) ${tenthLordH}वें भाव में — प्रारम्भिक करियर गति। पहली नौकरी/पदोन्नति।`
      : `दशमेश ${tenthLordH}वें भाव में — क्रमिक प्रवेश। करियर धैर्य से बनता है।`,
    advice: isGoodEntry
      ? 'Leverage early momentum — take responsibility, be visible.'
      : 'Be patient. Build expertise; the recognition will come.',
    adviceHi: isGoodEntry
      ? 'शुरुआती गति का लाभ उठाएं — जिम्मेदारी लें, दृश्यमान रहें।'
      : 'धैर्य रखें। विशेषज्ञता बनाएं; पहचान आएगी।',
  });

  // Phase 3: Saturn influence — test / consolidation (age 28–32)
  const satStart = birthYear + 28;
  const satEnd   = birthYear + 32;
  const saturnDifficult = [6, 8, 12].includes(saturnH);
  phases.push({
    period: `${satStart}–${satEnd} (Age 28–32)`,
    periodHi: `${satStart}–${satEnd} (आयु २८–३२)`,
    type: saturnDifficult ? 'challenge' : 'consolidation',
    icon: saturnDifficult ? '⚠️' : '🔨',
    description: saturnDifficult
      ? `Saturn in ${saturnH}th (dusthana) — mid-career test period. Possible change of job, organisation, or role. Avoid impulsive decisions.`
      : `Saturn in ${saturnH}th — steady consolidation phase. Hard work now guarantees long-term security.`,
    descriptionHi: saturnDifficult
      ? `शनि ${saturnH}वें भाव में (दुस्थान) — मध्य करियर परीक्षा काल। नौकरी/संगठन/भूमिका बदल सकती है। आवेगी निर्णयों से बचें।`
      : `शनि ${saturnH}वें भाव में — स्थिर समेकन चरण। अभी मेहनत दीर्घकालिक सुरक्षा की गारंटी है।`,
    advice: saturnDifficult
      ? 'Do not change careers impulsively. Upgrade skills. Saturn tests, then rewards.'
      : 'Stay disciplined. Avoid shortcuts. Build systems and processes.',
    adviceHi: saturnDifficult
      ? 'आवेगी करियर बदलाव न करें। कौशल उन्नत करें। शनि परखता है, फिर पुरस्कृत करता है।'
      : 'अनुशासित रहें। शॉर्टकट से बचें। तंत्र और प्रक्रियाएं बनाएं।',
  });

  // Phase 4: Jupiter transit / peak (age 33–37)
  const jupStart = birthYear + 33;
  const jupEnd   = birthYear + 37;
  const jupStrong = [1, 5, 9, 10].includes(jupiterH);
  phases.push({
    period: `${jupStart}–${jupEnd} (Age 33–37)`,
    periodHi: `${jupStart}–${jupEnd} (आयु ३३–३७)`,
    type: jupStrong ? 'peak' : 'rise',
    icon: jupStrong ? '🌟' : '📈',
    description: jupStrong
      ? `Jupiter in ${jupiterH}th (strong) — peak recognition phase. Senior role, promotion, or breakthrough likely.`
      : `Jupiter transits activating career. Growth phase — new opportunities, expanded responsibilities.`,
    descriptionHi: jupStrong
      ? `गुरु ${jupiterH}वें भाव में (बली) — चरम पहचान काल। वरिष्ठ भूमिका, पदोन्नति या सफलता सम्भव।`
      : `गुरु गोचर करियर सक्रिय कर रहा है। वृद्धि चरण — नए अवसर, विस्तृत जिम्मेदारियां।`,
    advice: jupStrong
      ? 'This is your window. Lead, expand, and take calculated risks.'
      : 'Accept new responsibilities eagerly. Network actively.',
    adviceHi: jupStrong
      ? 'यह आपकी खिड़की है। नेतृत्व करें, विस्तार करें, जोखिम उठाएं।'
      : 'नई जिम्मेदारियां उत्साह से स्वीकारें। सक्रिय नेटवर्किंग करें।',
  });

  // Phase 5: Rahu influence (age 38–44)
  const rahuStart = birthYear + 38;
  const rahuEnd   = birthYear + 44;
  const rahuDifficult = [6, 8, 12].includes(rahuH);
  phases.push({
    period: `${rahuStart}–${rahuEnd} (Age 38–44)`,
    periodHi: `${rahuStart}–${rahuEnd} (आयु ३८–४४)`,
    type: rahuDifficult ? 'challenge' : 'rise',
    icon: rahuDifficult ? '🌀' : '🚀',
    description: rahuDifficult
      ? `Rahu in ${rahuH}th — sudden changes, unconventional opportunities. May face foreign competition or organisational disruption.`
      : `Rahu in ${rahuH}th — unconventional breakthroughs. Technology, foreign connections, or unique niches may open.`,
    descriptionHi: rahuDifficult
      ? `राहु ${rahuH}वें भाव में — अचानक बदलाव, अपरम्परागत अवसर। विदेशी प्रतिस्पर्धा या संगठनात्मक उथल-पुथल।`
      : `राहु ${rahuH}वें भाव में — अपरम्परागत सफलता। तकनीक, विदेशी सम्पर्क या अनूठे क्षेत्र खुल सकते हैं।`,
    advice: rahuDifficult
      ? 'Stay grounded. Avoid risky ventures. Maintain professional ethics.'
      : 'Embrace innovation and new fields. Rahu favours the bold here.',
    adviceHi: rahuDifficult
      ? 'स्थिर रहें। जोखिम भरे उद्यमों से बचें। पेशेवर नैतिकता बनाए रखें।'
      : 'नवाचार और नए क्षेत्रों को अपनाएं। राहु यहां साहसी का साथ देता है।',
  });

  // Phase 6: Mature achievement (age 45–55)
  const matureStart = birthYear + 45;
  const matureEnd   = birthYear + 55;
  phases.push({
    period: `${matureStart}–${matureEnd} (Age 45–55)`,
    periodHi: `${matureStart}–${matureEnd} (आयु ४५–५५)`,
    type: 'peak',
    icon: '👑',
    description: 'Peak authority and legacy-building phase. Leadership, mentoring, and institutional recognition.',
    descriptionHi: 'चरम अधिकार और विरासत-निर्माण चरण। नेतृत्व, मार्गदर्शन और संस्थागत पहचान।',
    advice: 'Give back. Mentor others. Build systems that outlast you.',
    adviceHi: 'वापस दें। दूसरों को मार्गदर्शन दें। ऐसे तंत्र बनाएं जो आपसे आगे रहें।',
  });

  return phases;
}

/* ─────────────────────────── Education analysis ────────────────────────── */

export function analyzeEducation(d1: ChartData, _d9: ChartData): EducationResult {
  const fourthRashi = d1.houseRashis[3];
  const fifthRashi  = d1.houseRashis[4];
  const ninthRashi  = d1.houseRashis[8];

  const fifthLord  = RASHI_LORD[fifthRashi]  ?? 'Mercury';
  const ninthLord  = RASHI_LORD[ninthRashi]  ?? 'Jupiter';

  const mercuryStrong   = planetStrength(d1, 'Mercury') >= 50;
  const jupiterStrong   = planetStrength(d1, 'Jupiter') >= 50;
  const fifthLordStrong = planetStrength(d1, fifthLord)  >= 50;
  const ninthLordStrong = planetStrength(d1, ninthLord)  >= 50;

  const strengths: string[] = [];
  const strengthsHi: string[] = [];
  const challenges: string[] = [];
  const challengesHi: string[] = [];

  if (mercuryStrong) {
    strengths.push('Strong analytical and logical reasoning');
    strengthsHi.push('प्रबल विश्लेषणात्मक और तार्किक तर्क-क्षमता');
  }
  if (jupiterStrong) {
    strengths.push('Excellent grasp of higher-order concepts (law, philosophy, finance)');
    strengthsHi.push('उच्च-कोटि अवधारणाओं में उत्कृष्ट पकड़ (कानून, दर्शन, वित्त)');
  }
  if (fifthLordStrong) {
    strengths.push('Sharp memory, good concentration, creative intelligence');
    strengthsHi.push('तीव्र स्मृति, अच्छी एकाग्रता, सृजनात्मक बुद्धि');
  }
  if (ninthLordStrong) {
    strengths.push('Higher education and overseas study possibilities are strong');
    strengthsHi.push('उच्च शिक्षा और विदेश अध्ययन की सम्भावना प्रबल');
  }

  const saturnH = getPlanetHouse(d1, 'Saturn');
  const rahuH   = getPlanetHouse(d1, 'Rahu');
  if (saturnH === 4 || saturnH === 5) {
    challenges.push('Saturn delays or adds hard work in studies — but quality of learning is deep');
    challengesHi.push('शनि अध्ययन में विलम्ब या परिश्रम जोड़ता है — लेकिन गहन सीखने की गुणवत्ता');
  }
  if (rahuH === 4 || rahuH === 5) {
    challenges.push('Rahu can cause unconventional education path — may switch streams');
    challengesHi.push('राहु अपरम्परागत शिक्षा मार्ग दे सकता है — धारा बदल सकते हैं');
  }
  if (strengths.length === 0) {
    strengths.push('Steady, disciplined learner — consistent effort yields results');
    strengthsHi.push('स्थिर, अनुशासित शिक्षार्थी — निरन्तर प्रयास से परिणाम');
  }
  if (challenges.length === 0) {
    challenges.push('May occasionally lack sustained focus — structured routine recommended');
    challengesHi.push('कभी-कभी निरन्तर ध्यान में कमी — संरचित दिनचर्या की सलाह');
  }

  const subjects = SUBJECT_BY_LORD[fifthLord] ?? SUBJECT_BY_LORD['Mercury'];

  const higherEdu = (jupiterStrong || ninthLordStrong)
    ? 'Post-graduate or advanced specialisation highly likely'
    : mercuryStrong
      ? 'Graduate with professional certification — good academic record'
      : 'Graduate level — consistent effort brings solid credentials';
  const higherEduHi = (jupiterStrong || ninthLordStrong)
    ? 'स्नातकोत्तर या उन्नत विशेषज्ञता की उच्च सम्भावना'
    : mercuryStrong
      ? 'पेशेवर प्रमाणन के साथ स्नातक — अच्छा शैक्षणिक रिकॉर्ड'
      : 'स्नातक — निरन्तर प्रयास से ठोस योग्यता';

  const eduLevel = jupiterStrong
    ? 'Post-graduate / Doctorate possible'
    : fifthLordStrong
      ? 'Graduate with strong academic record'
      : 'Graduate level — persistence required';
  const eduLevelHi = jupiterStrong
    ? 'स्नातकोत्तर / डॉक्टरेट सम्भव'
    : fifthLordStrong
      ? 'उत्कृष्ट शैक्षणिक रिकॉर्ड के साथ स्नातक'
      : 'स्नातक — दृढ़ता आवश्यक';

  return {
    level: eduLevel,
    levelHi: eduLevelHi,
    strengths,
    strengthsHi,
    challenges,
    challengesHi,
    bestSubjects: subjects.subjects,
    bestSubjectsHi: subjects.subjectsHi,
    educationTiming: 'Core studies: Age 18–23. Higher specialisation: Age 23–27.',
    educationTimingHi: 'मूल शिक्षा: आयु १८–२३। उच्च विशेषज्ञता: आयु २३–२७।',
    higherEducationProspect: higherEdu,
    higherEducationProspectHi: higherEduHi,
  };
}

/* ─────────────────────────── Career analysis ───────────────────────────── */

export function analyzeCareer(d1: ChartData, _d9: ChartData): CareerResult {
  const tenthRashi  = d1.houseRashis[9];
  const tenthLord   = RASHI_LORD[tenthRashi]  ?? 'Saturn';
  const tenthLordHi = RASHI_LORD_HI[tenthRashi] ?? 'शनि';
  const tenthLordH  = getPlanetHouse(d1, tenthLord);

  const careerData = CAREER_BY_LORD[tenthLord] ?? CAREER_BY_LORD['Saturn'];
  const auspiciousness = analyzeCareerAuspiciousness(d1);

  const careerStrengths: string[] = [];
  const careerStrengthsHi: string[] = [];

  if (planetStrength(d1, tenthLord) >= 50) {
    careerStrengths.push(`${tenthLord} (10th lord) is well-placed — steady career progression`);
    careerStrengthsHi.push(`${tenthLordHi} (दशमेश) अच्छी स्थिति में — स्थिर करियर प्रगति`);
  }
  if (planetStrength(d1, 'Sun') >= 50) {
    careerStrengths.push('Strong Sun — leadership, government favour, recognition');
    careerStrengthsHi.push('बलवान सूर्य — नेतृत्व, सरकारी अनुग्रह, पहचान');
  }
  if (planetStrength(d1, 'Saturn') >= 50) {
    careerStrengths.push('Strong Saturn — discipline, long career, organisational loyalty');
    careerStrengthsHi.push('बलवान शनि — अनुशासन, दीर्घ करियर, संगठनात्मक निष्ठा');
  }
  if (careerStrengths.length === 0) {
    careerStrengths.push('Versatile and adaptable — suited for multiple career paths');
    careerStrengthsHi.push('बहुमुखी और अनुकूलनशील — कई करियर पथों के लिए उपयुक्त');
  }

  // Business vs Service
  const biz = [2, 7, 11].includes(tenthLordH);
  const bVsS   = biz
    ? 'Business / Self-employment favoured — 2nd/7th/11th house 10th lord connection'
    : 'Service / Employment favoured — steady income through an organisation';
  const bVsSHi = biz
    ? 'व्यापार / स्व-रोज़गार अनुकूल — दशमेश का २/७/११ भाव सम्बन्ध'
    : 'नौकरी / सेवा अनुकूल — संगठन के माध्यम से स्थिर आय';

  return {
    primaryField: `${tenthLord}-led career: ${careerData.fields[0]}`,
    primaryFieldHi: `${tenthLordHi} नेतृत्व करियर: ${careerData.fieldsHi[0]}`,
    suitableProfessions: careerData.fields,
    suitableProfessionsHi: careerData.fieldsHi,
    professionCharacteristics: careerData.chars,
    professionCharacteristicsHi: careerData.charsHi,
    careerStrengths,
    careerStrengthsHi,
    favorableYears: [
      '2025–2027: Career foundation — skill-building and early recognition',
      '2027–2029: Growth phase — promotions and new responsibilities',
      '2030–2033: Consolidation — authority, steady income, leadership',
      '2034–2037: Peak phase — senior roles, maximum impact',
    ],
    favorableYearsHi: [
      '२०२५–२०२७: करियर आधार — कौशल-निर्माण और प्रारम्भिक पहचान',
      '२०२७–२०२९: वृद्धि चरण — पदोन्नति और नई जिम्मेदारियां',
      '२०३०–२०३३: स्थिरीकरण — अधिकार, स्थिर आय, नेतृत्व',
      '२०३४–२०३७: चरम काल — वरिष्ठ भूमिकाएं, अधिकतम प्रभाव',
    ],
    businessVsService: bVsS,
    businessVsServiceHi: bVsSHi,
    auspiciousness,
    overallDesc: `10th house in ${RASHIS_EN[tenthRashi - 1]}, lord ${tenthLord} in ${tenthLordH}th. Primary domain: ${careerData.fields.slice(0, 2).join(', ')}.`,
    overallDescHi: `दशम भाव ${RASHIS_HI[tenthRashi - 1]}, दशमेश ${tenthLordHi} ${tenthLordH}वें भाव में। मुख्य क्षेत्र: ${careerData.fieldsHi.slice(0, 2).join(', ')}।`,
  };
}

/* ─────────────────────────── Spiritual remedies ────────────────────────── */

export function getVidhyaKarmaRemedies(): VidhyaKarmaRemedies[] {
  return [
    {
      planet: 'Mercury / बुध — Intellect & Communication',
      icon: '🟢',
      remedy:
        'Chant "Om Budhaya Namah" 108× daily on Wednesdays. Donate green moong dal on Wednesday. Keep a clean, green plant at the study desk. Recite Saraswati Stotra before studying.',
      remedyHi:
        'बुधवार को "ॐ बुधाय नमः" का १०८ बार जप करें। बुधवार को हरी मूंग दाल दान करें। अध्ययन मेज़ पर हरा पौधा रखें। पढ़ाई से पहले सरस्वती स्तोत्र पढ़ें।',
      mantra: 'ॐ बुधाय नमः',
    },
    {
      planet: 'Jupiter / गुरु — Higher Learning & Wisdom',
      icon: '🟡',
      remedy:
        'Worship Lord Vishnu on Thursdays. Chant "Om Gurave Namah" 108×. Donate yellow dal (chana) or turmeric on Thursday. Respect all teachers — Jupiter strengthens through guru-seva.',
      remedyHi:
        'गुरुवार को भगवान विष्णु की पूजा करें। "ॐ गुरवे नमः" का १०८ बार जप करें। गुरुवार को पीली दाल या हल्दी दान करें। सभी गुरुजनों का सम्मान करें।',
      mantra: 'ॐ गुरवे नमः',
    },
    {
      planet: 'Saraswati / सरस्वती — Academic Success',
      icon: '📚',
      remedy:
        'Chant "Om Aim Saraswatyai Namah" before studying. Place Saraswati yantra at the study table. Observe Saraswati Puja on Vasant Panchami. Keep study area clean and well-lit.',
      remedyHi:
        'पढ़ाई से पहले "ॐ ऐं सरस्वत्यै नमः" का जप करें। पढ़ाई की मेज़ पर सरस्वती यंत्र रखें। वसन्त पंचमी पर सरस्वती पूजा करें। अध्ययन स्थान स्वच्छ रखें।',
      mantra: 'ॐ ऐं सरस्वत्यै नमः',
    },
    {
      planet: 'Saturn / शनि — Career Discipline & Longevity',
      icon: '🔵',
      remedy:
        'Chant "Om Shanaischaraya Namah" 108× on Saturdays. Donate black sesame or mustard oil on Saturdays. Serve the elderly. Saturn rewards consistency above all else.',
      remedyHi:
        'शनिवार को "ॐ शनैश्चराय नमः" का १०८ बार जप करें। शनिवार को काले तिल या सरसों का तेल दान करें। बुज़ुर्गों की सेवा करें।',
      mantra: 'ॐ शनैश्चराय नमः',
    },
    {
      planet: 'Sun / सूर्य — Authority & Recognition',
      icon: '☀️',
      remedy:
        'Offer Surya Arghya (water to rising Sun) daily. Chant Aditya Hridayam or "Om Suryaya Namah" 12×. Respect your father. Donate wheat or copper on Sundays.',
      remedyHi:
        'प्रतिदिन उगते सूर्य को जल (सूर्य अर्घ्य) दें। आदित्य हृदयम् या "ॐ सूर्याय नमः" का १२ बार जप करें। पिता का सम्मान करें। रविवार को गेहूं या तांबा दान करें।',
      mantra: 'ॐ सूर्याय नमः',
    },
  ];
}
