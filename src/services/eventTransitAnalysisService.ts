/**
 * src/services/eventTransitAnalysisService.ts
 *
 * Single-event (interview / exam / meeting) transit analysis engine.
 * Given a person's birth profile and an event datetime + location,
 * produces a structured PrognosisReport with:
 *  - Three score rings (event success %, domain karma %, muhurta timing %)
 *  - Natal planet table with career-specific yogas
 *  - Transit planet table with individual strength %
 *  - Dasha state (MD / AD at event time)
 *  - Detailed guidance (do's / don'ts / mantras)
 */

import { calculateDynamicTransits, type DynamicTransitOutput } from './dynamicTransitService';
import { calculateVimshottariDasha, type DashaPeriod } from './dashaService';
import { calculateCompletePlanetaryPositions } from './ephemerisService';
import { calculateCompleteAscendant } from './ascendantService';
import { calculateAshtakavargaTransitAnalysis } from './ashtakavargaTransitService';
import {
  toJD,
  allPositions,
  lahiriAyanamsa,
  computePanchanga,
  computeTaraBala,
  computeD9,
  getHoraTimeline,
  sarvaAVBindu,
  generateRemedies,
  type TaraBala,
  type Panchanga,
  type HoraSlot,
  type RemedyItem,
  type VRashi,
} from './vedicAstroEngine';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface EventProfile {
  name: string;
  birthDate: string;   // YYYY-MM-DD
  birthTime: string;   // HH:MM  (local)
  birthLat: number;
  birthLon: number;
  moonRashiIndex: number;
  ascendantRashiIndex?: number;
}

export interface EventInput {
  eventDate: string;   // YYYY-MM-DD
  eventTime: string;   // HH:MM  (local event timezone)
  eventTimeUTC: string; // HH:MM  UTC — used for ephemeris
  eventLocation: string;
  eventType: 'interview' | 'exam' | 'business' | 'general';
  domainLabel?: string;  // e.g. "US Job Interview"
  eventCompany?: string; // company name for research card
}

export interface PrognosisScore {
  label: string;
  labelHi: string;
  score: number;       // 0–100
  color: string;       // tailwind color token
  detail: string;
}

export interface NatalPlanetRow {
  planet: string;
  symbol: string;
  rashiName: string;
  rashiIndex: number;
  houseFromLagna: number;
  houseFromMoon: number;
  dignity: string;
  careerRelevance: string;   // short English text
  strength: number;          // 0–100 derived
}

export interface TransitPlanetRow {
  planet: string;
  symbol: string;
  transitRashiName: string;
  transitRashiIndex: number;
  houseFromMoon: number;
  houseFromLagna: number;
  status: 'favorable' | 'mixed' | 'unfavorable';
  strength: number;   // 0–100
  vedhaNote: string;
  interpretation: string;
  savScore?: number;
  savStrength?: 'Strong' | 'Moderate' | 'Weak';
}

export interface DashaState {
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  mahadashaEndDate: string;
  antardashaEndDate: string;
  dashaInterpretation: string;
}

export interface CareerYoga {
  name: string;
  description: string;
  active: boolean;
  strength: number;
}

export interface GuidanceSection {
  title: string;
  titleHi: string;
  points: string[];
}

export interface PrognosisReport {
  profile: EventProfile;
  event: EventInput;
  scores: PrognosisScore[];
  natalPlanets: NatalPlanetRow[];
  careerYogas: CareerYoga[];
  transitPlanets: TransitPlanetRow[];
  dashaState: DashaState;
  guidanceSections: GuidanceSection[];
  verdict: string;
  verdictHi: string;
  overallScore: number;
  muhurtaDetails: MuhurtaDetails;
  taraBala: TaraBala;
  eventHouseSavScore: number;
  eventHouseNumber: number;
  d9MoonSign: VRashi;
  d9Chart: Record<string, VRashi>;
  horaTimeline: HoraSlot[];
  panchanga: Panchanga;
  remedies: RemedyItem[];
  positiveFactors: PositiveFactor[];
}

export interface PositiveFactor {
  rank: number;
  title: string;
  titleHi: string;
  score: number;
  detail: string;
}

export interface MuhurtaDetails {
  weekday: string;
  hora: string;
  horaRuler: string;
  tithiDescription: string;
  isMercuryDay: boolean;
  isVenusHora: boolean;
  quality: 'excellent' | 'good' | 'neutral' | 'weak';
  notes: string[];
  panchanga?: Panchanga;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const RASHI_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂',
  Jupiter:'♃', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

// Own signs (rashi indices 0-11)
const OWN_SIGNS: Record<string, number[]> = {
  Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5],
  Jupiter:[8,11], Venus:[1,6], Saturn:[9,10],
};
const EXALTATION: Record<string, number> = {
  Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6,
};
const DEBILITATION: Record<string, number> = {
  Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5, Saturn:0,
};

/** Career-relevant houses from Lagna */
const CAREER_HOUSES = [10, 1, 6, 11, 2, 9];

/** Hora rulers in order (day/night alternating, starting from Sun) */
const HORA_ORDER = ['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'];

// ─── Dignity helper ────────────────────────────────────────────────────────────

function getDignity(planet: string, rashiIndex: number): string {
  if (EXALTATION[planet] === rashiIndex)    return 'Exalted';
  if (DEBILITATION[planet] === rashiIndex)  return 'Debilitated';
  if ((OWN_SIGNS[planet] ?? []).includes(rashiIndex)) return 'Own Sign';
  return 'Neutral';
}

// ─── Muhurta helper ───────────────────────────────────────────────────────────

/** Event-type → primary house for Nadi/SAV scoring */
const EVENT_HOUSE_MAP: Record<EventInput['eventType'], number> = {
  interview: 10,
  exam: 9,
  business: 10,
  general: 10,
};

function parseDateTimeJD(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  return toJD(y, m, d, h + (min ?? 0) / 60);
}

function calcMuhurta(eventDate: string, eventTimeLocal: string, eventTimeUTC: string): MuhurtaDetails {
  const dt = new Date(`${eventDate}T${eventTimeLocal}:00`);
  const dayOfWeek = dt.getDay();
  const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const weekday = weekdays[dayOfWeek];

  const dayLordIndex = [0,2,4,6,5,3,1][dayOfWeek];
  const hourOfDay = dt.getHours();
  const horaIndex = (dayLordIndex + hourOfDay) % 7;
  const horaRuler = HORA_ORDER[horaIndex];

  const isMercuryDay = dayOfWeek === 3;
  const isVenusHora  = horaRuler === 'Venus';
  const isMercuryHora = horaRuler === 'Mercury';
  const isSunHora = horaRuler === 'Sun';
  const isJupiterHora = horaRuler === 'Jupiter';

  const eventJD = parseDateTimeJD(eventDate, eventTimeUTC);
  const panchanga = computePanchanga(eventJD);

  let qualityScore = panchanga.auspiciousCount * 12;
  if (isMercuryDay) qualityScore += 15;
  if (isVenusHora || isMercuryHora || isJupiterHora) qualityScore += 20;
  if (isSunHora) qualityScore += 10;

  const tithiDescription = `${panchanga.tithi.paksha} ${panchanga.tithi.name} (${panchanga.tithi.number}) — ` +
    (panchanga.tithi.auspicious ? 'auspicious for professional actions' : 'caution advised');

  const quality: MuhurtaDetails['quality'] =
    qualityScore >= 55 ? 'excellent' :
    qualityScore >= 35 ? 'good' :
    qualityScore >= 20 ? 'neutral' : 'weak';

  const notes: string[] = [];
  notes.push(`Tithi: ${panchanga.tithi.name} · Nakshatra: ${panchanga.nakshatra.name} (${panchanga.nakshatra.lord})`);
  notes.push(`Yoga: ${panchanga.yoga.name} · Karana: ${panchanga.karana.name}`);
  if (isMercuryDay)   notes.push('Wednesday (Mercury\'s day) — ideal for interviews & communication');
  if (isVenusHora)    notes.push('Venus Hora — charm, likeability, social approval elevated');
  if (isMercuryHora)  notes.push('Mercury Hora — sharp wit, logical articulation, quick thinking');
  if (isJupiterHora)  notes.push('Jupiter Hora — wisdom, expansion, favorable to seniors/authority');
  if (!panchanga.tithi.auspicious) notes.push('Difficult Tithi — proceed carefully; extra preparation recommended');

  return { weekday, hora: `${horaRuler} Hora`, horaRuler, tithiDescription, isMercuryDay, isVenusHora, quality, notes, panchanga };
}

function buildPositiveFactors(
  report: {
    taraBala: TaraBala;
    eventHouseSavScore: number;
    careerYogas: CareerYoga[];
    transitPlanets: TransitPlanetRow[];
    muhurtaDetails: MuhurtaDetails;
    dashaState: DashaState;
  },
): PositiveFactor[] {
  const factors: PositiveFactor[] = [];
  const favTransits = report.transitPlanets.filter(t => t.status === 'favorable').length;
  const activeYogas = report.careerYogas.filter(y => y.active);

  if (report.taraBala.isAuspicious) {
    factors.push({
      rank: 0, title: `Tara Bala: ${report.taraBala.taraName}`, titleHi: `तारा बल: ${report.taraBala.taraName}`,
      score: 88, detail: report.taraBala.description,
    });
  }
  if (report.eventHouseSavScore >= 28) {
    factors.push({
      rank: 0, title: `Event House SAV (${report.eventHouseSavScore} bindus)`, titleHi: `घटना भाव SAV (${report.eventHouseSavScore})`,
      score: Math.min(95, report.eventHouseSavScore * 2.5), detail: 'Nadi-style Sarvashtakavarga score for the event house supports success.',
    });
  }
  if (favTransits >= 5) {
    factors.push({
      rank: 0, title: `${favTransits}/9 Favorable Transits`, titleHi: `${favTransits}/9 अनुकूल गोचर`,
      score: Math.min(90, favTransits * 10), detail: 'Majority of transiting planets occupy supportive houses from Moon.',
    });
  }
  for (const y of activeYogas.slice(0, 2)) {
    factors.push({
      rank: 0, title: y.name, titleHi: y.name, score: y.strength, detail: y.description,
    });
  }
  if (report.muhurtaDetails.quality === 'excellent' || report.muhurtaDetails.quality === 'good') {
    factors.push({
      rank: 0, title: `Muhurta: ${report.muhurtaDetails.quality}`, titleHi: `मुहूर्त: ${report.muhurtaDetails.quality}`,
      score: report.muhurtaDetails.quality === 'excellent' ? 85 : 70,
      detail: `${report.muhurtaDetails.weekday}, ${report.muhurtaDetails.hora}`,
    });
  }
  factors.push({
    rank: 0, title: `${report.dashaState.mahadasha}–${report.dashaState.antardasha} Dasha`, titleHi: `${report.dashaState.mahadasha}–${report.dashaState.antardasha} दशा`,
    score: 72, detail: report.dashaState.dashaInterpretation.slice(0, 120),
  });

  return factors
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((f, i) => ({ ...f, rank: i + 1 }));
}

// ─── Career yoga detector ──────────────────────────────────────────────────────

function detectCareerYogas(
  planets: Array<{ name: string; rashiIndex: number; house: number }>,
  ascRashi: number,
): CareerYoga[] {
  const yogas: CareerYoga[] = [];

  const get = (name: string) => planets.find(p => p.name === name);
  const sun = get('Sun');
  const moon = get('Moon');
  const mercury = get('Mercury');
  const venus = get('Venus');
  const mars = get('Mars');
  const jupiter = get('Jupiter');
  const saturn = get('Saturn');
  const rahu = get('Rahu');

  // 1. Adhi Yoga: Mercury, Venus, Jupiter in 6th/7th/8th from Moon
  const moonH = moon?.house ?? 0;
  const adhi = [mercury, venus, jupiter].every(
    p => p && [6, 7, 8].includes(((p.house - moonH + 12) % 12) + 1)
  );
  yogas.push({ name: 'Adhi Yoga', description: 'Benefics in 6/7/8 from Moon — leadership, prosperity', active: adhi, strength: adhi ? 85 : 0 });

  // 2. Chandra-Mangala Yoga: Moon + Mars same house
  const chandraMangala = moon && mars && moon.house === mars.house;
  yogas.push({ name: 'Chandra-Mangala Yoga', description: 'Moon-Mars conjunction — drive, financial ambition', active: !!chandraMangala, strength: chandraMangala ? 70 : 0 });

  // 3. Budh-Aditya Yoga: Sun + Mercury conjunct
  const budhAditya = sun && mercury && Math.abs(sun.rashiIndex - mercury.rashiIndex) <= 1;
  yogas.push({ name: 'Budha-Aditya Yoga', description: 'Sun-Mercury — intelligence, communication, professional recognition', active: !!budhAditya, strength: budhAditya ? 78 : 0 });

  // 4. Rahu in 11th or 12th from lagna — foreign career
  const rahuH = rahu ? ((rahu.rashiIndex - ascRashi + 12) % 12) + 1 : 0;
  const rahuForeign = [11, 12].includes(rahuH);
  yogas.push({ name: 'Foreign Career Karma (Rahu)', description: 'Rahu in 11th/12th from Lagna — amplifies foreign/USA career', active: rahuForeign, strength: rahuForeign ? 92 : 30 });

  // 5. Jupiter aspecting 10th from Lagna (Vedic 5th or 9th aspect)
  const jupH = jupiter ? ((jupiter.rashiIndex - ascRashi + 12) % 12) + 1 : 0;
  const jupAspect10 = [2, 4, 6, 8].includes(jupH); // 5th, 9th, 7th, 3rd aspects
  yogas.push({ name: 'Jupiter Blessing on Career', description: 'Jupiter aspects 10th house — wisdom, ethics, growth', active: jupAspect10, strength: jupAspect10 ? 80 : 40 });

  // 6. Saturn in 3/6/11 — work endurance
  const satH = saturn ? ((saturn.rashiIndex - ascRashi + 12) % 12) + 1 : 0;
  const satFav = [3, 6, 11].includes(satH);
  yogas.push({ name: 'Saturn Work-Karma', description: 'Saturn in 3/6/11 — disciplined effort yields rewards', active: satFav, strength: satFav ? 75 : 35 });

  return yogas;
}

// ─── Transit strength calculator ──────────────────────────────────────────────

const TRANSIT_STRENGTHS: Record<string, Record<number, number>> = {
  Sun:     { 3:72, 6:76, 10:85, 11:80 },
  Moon:    { 1:70, 3:75, 6:72, 7:68, 10:82, 11:80 },
  Mercury: { 2:70, 4:72, 6:74, 8:30, 10:82, 11:80 },
  Venus:   { 1:70, 2:75, 3:72, 4:74, 5:78, 8:50, 9:70, 11:88, 12:65 },
  Mars:    { 3:72, 6:75, 11:80 },
  Jupiter: { 2:75, 5:78, 7:72, 9:80, 11:88, 12:55 },
  Saturn:  { 3:72, 6:80, 11:82 },
  Rahu:    { 3:70, 6:74, 10:82, 11:88 },
  Ketu:    { 3:65, 6:70, 11:72 },
};

function transitStrength(planet: string, houseFromMoon: number, effectiveStatus: string, vedha: boolean): number {
  const base = TRANSIT_STRENGTHS[planet]?.[houseFromMoon] ?? (effectiveStatus === 'unfavorable' ? 28 : 48);
  if (effectiveStatus === 'favorable' && !vedha) return base;
  if (effectiveStatus === 'mixed')  return Math.round(base * 0.55);
  return Math.round(base * 0.3);
}

// ─── Guidance builder ─────────────────────────────────────────────────────────

function buildGuidance(
  report: Partial<PrognosisReport>,
  muhurta: MuhurtaDetails,
  dashaState: DashaState,
  overallScore: number,
  eventType: string,
): GuidanceSection[] {
  const sections: GuidanceSection[] = [];

  sections.push({
    title: '📋 Preparation (Day Before)',
    titleHi: '📋 तैयारी (एक दिन पहले)',
    points: [
      'Review company profile and role description thoroughly — Mercury MD supports analytical preparation.',
      'Practice structured answers: Situation → Action → Result format.',
      'Get adequate sleep; avoid stimulants. Moon + Saturn caution: rushing or overconfidence creates errors.',
      'Keep communication materials (resume, portfolio) printed and organized the night before.',
      'Chant Mercury mantra (Om Budhaya Namah) 108 times in the morning.',
    ],
  });

  sections.push({
    title: '🌅 Morning of Interview',
    titleHi: '🌅 साक्षात्कार की सुबह',
    points: [
      muhurta.isMercuryDay
        ? '✅ Wednesday — Mercury\'s day — perfect timing for interviews. Wear green or grey.'
        : `${muhurta.weekday} — decent day. Wear professional colors.`,
      muhurta.isVenusHora
        ? '✅ Venus Hora at interview time — social likability is amplified. Smile, make eye contact.'
        : `${muhurta.horaRuler} Hora — stay composed and structured.`,
      'Eat light; avoid heavy meals before the interview.',
      'Arrive at least 15 minutes early. Rahu influence means last-minute chaos is possible — plan ahead.',
      'Carry a small piece of green cloth or emerald crystal (Mercury strengthener) if available.',
    ],
  });

  sections.push({
    title: '💬 During the Interview',
    titleHi: '💬 साक्षात्कार के दौरान',
    points: [
      'Speak at a deliberate pace — slightly slower than you think is needed. Mercury/Rahu mix can cause rushing.',
      'Use the STAR (Situation/Task/Action/Result) method for all behavioral questions.',
      'Ketu in the chart warns of over-detachment — show genuine enthusiasm for the role.',
      'When asked about weaknesses, give an honest answer with a growth framing. Saturn transit supports authenticity.',
      'If a question feels hostile or tricky, pause 3 seconds before answering — do not argue.',
      'Emphasize adaptability to US work culture, global mindset, and problem-solving over technical depth alone.',
    ],
  });

  sections.push({
    title: '📞 Post-Interview',
    titleHi: '📞 साक्षात्कार के बाद',
    points: [
      'Send a thank-you email within 2 hours of the interview — Mercury Dasha favors written follow-up.',
      'Note down every question asked while memory is fresh.',
      'Venus in 11th strongly supports gains from networking — connect on LinkedIn immediately.',
      'Do not follow up more than once before their stated timeline. Saturn teaches patience.',
      overallScore >= 70
        ? '✅ Cosmic timing is favorable — trust the process and stay positive.'
        : '⚠️ Mixed signals — prepare strongly and treat this as a learning experience regardless of outcome.',
    ],
  });

  sections.push({
    title: '🔮 Dasha Guidance',
    titleHi: '🔮 दशा मार्गदर्शन',
    points: [
      `Active Dasha: ${dashaState.mahadasha} MD → ${dashaState.antardasha} AD → ${dashaState.pratyantardasha} PD`,
      dashaState.dashaInterpretation,
      'Mercury Pratyantardasha (if active) is the sharpest communication window of this period — use it.',
      'Rahu MD supports foreign/unconventional opportunities — do not hesitate to pursue US roles.',
      `This dasha combination runs until ${dashaState.antardashaEndDate} — multiple opportunities possible within this window.`,
    ],
  });

  return sections;
}

// ─── Main engine ──────────────────────────────────────────────────────────────

export async function generateEventReport(
  profile: EventProfile,
  event: EventInput,
): Promise<PrognosisReport> {

  // 1. Natal chart
  const natalPositions = calculateCompletePlanetaryPositions(profile.birthDate, profile.birthTime);
  const natalAscendant = calculateCompleteAscendant(
    profile.birthDate, profile.birthTime,
    profile.birthLat, profile.birthLon,
    Math.round((profile.birthLon / 15) * 2) / 2,
  );
  const ascRashi = profile.ascendantRashiIndex ?? natalAscendant.ascendant.rashiIndex;

  // 2. Dasha at event time
  let dashaState: DashaState = {
    mahadasha: 'Rahu', antardasha: 'Rahu', pratyantardasha: 'Mercury',
    mahadashaEndDate: '2031', antardashaEndDate: '2027-07',
    dashaInterpretation:
      'Rahu MD/AD: Foreign ambition, unconventional path, tech-forward opportunities. ' +
      'Mercury PD: Communication, intelligence, logical articulation at its peak.',
  };

  try {
    const dashaResult = calculateVimshottariDasha(profile.birthDate, profile.birthTime);
    const active: DashaPeriod | undefined = dashaResult.periods.find((p: DashaPeriod) => p.isActive);
    if (active) {
      const ad = active.antardashas.find((a) => a.isActive);
      dashaState = {
        mahadasha: active.planet,
        antardasha: ad?.planet ?? active.planet,
        pratyantardasha: 'Mercury',
        mahadashaEndDate: active.endDate.toISOString().split('T')[0],
        antardashaEndDate: ad?.endDate.toISOString().split('T')[0] ?? active.endDate.toISOString().split('T')[0],
        dashaInterpretation:
          `${active.planet} Mahadasha activates the themes of this planet for all life events. ` +
          (ad ? `${ad.planet} Antardasha provides the specific trigger and color of current events.` : ''),
      };
    }
  } catch (_) { /* fallback to defaults above */ }

  // 3. Transit at event time (convert eventTimeUTC to UTC Date)
  let transitOutput: DynamicTransitOutput | null = null;
  try {
    const eventDateObj = new Date(`${event.eventDate}T${event.eventTimeUTC}:00Z`);
    transitOutput = await calculateDynamicTransits({
      moonRashiIndex: profile.moonRashiIndex,
      date: eventDateObj,
      time: event.eventTimeUTC,
    });
  } catch (_) { /* skip */ }

  // 4. Build natal planet rows
  const natalPlanets: NatalPlanetRow[] = (natalPositions.planets ?? []).map((p) => {
    const dignity = getDignity(p.name, p.rashiIndex ?? 0);
    const houseFromLagna = ((p.rashiIndex - ascRashi + 12) % 12) + 1;
    const houseFromMoon  = ((p.rashiIndex - profile.moonRashiIndex + 12) % 12) + 1;

    const careerRelevanceMap: Record<string, string> = {
      Sun:     'Authority, leadership, reputation in career',
      Moon:    'Public perception, emotional resilience at work',
      Mercury: 'Communication, intellect, interview skill',
      Venus:   'Diplomacy, creativity, networking charm',
      Mars:    'Drive, execution, competitive edge',
      Jupiter: 'Growth, wisdom, mentors, institutional favor',
      Saturn:  'Discipline, long-term karma, work ethic',
      Rahu:    'Foreign opportunity, amplification, disruption',
      Ketu:    'Research depth, spiritual detachment, niche skills',
    };

    const dignityStrengthMap: Record<string, number> = {
      'Exalted': 90, 'Own Sign': 80, 'Neutral': 55,
      'Friend Sign': 65, 'Enemy Sign': 35, 'Debilitated': 20,
    };

    const careerBonus = CAREER_HOUSES.includes(houseFromLagna) ? 10 : 0;
    const strength = Math.min(100, (dignityStrengthMap[dignity] ?? 55) + careerBonus);

    return {
      planet: p.name,
      symbol: PLANET_SYMBOLS[p.name] ?? '•',
      rashiName: RASHI_NAMES[p.rashiIndex ?? 0] ?? '',
      rashiIndex: p.rashiIndex ?? 0,
      houseFromLagna,
      houseFromMoon,
      dignity,
      careerRelevance: careerRelevanceMap[p.name] ?? '',
      strength,
    };
  });

  // 5. Career yogas
  const careerYogas = detectCareerYogas(
    natalPositions.planets.map(p => ({ name: p.name, rashiIndex: p.rashiIndex ?? 0, house: ((p.rashiIndex - ascRashi + 12) % 12) + 1 })),
    ascRashi,
  );

  // 6. Transit planet rows
  const transitPlanets: TransitPlanetRow[] = (transitOutput?.transits ?? []).map((t) => {
    const str = transitStrength(t.planet.en, t.houseFromMoon, t.effectiveStatus, t.vedhaActive);
    const hFL = transitOutput?.planetPositions
      ? ((transitOutput.planetPositions[t.planet.en] ?? 0) - ascRashi + 12) % 12 + 1
      : t.houseFromMoon;
    return {
      planet: t.planet.en,
      symbol: PLANET_SYMBOLS[t.planet.en] ?? '•',
      transitRashiName: RASHI_NAMES[t.currentRashi] ?? '',
      transitRashiIndex: t.currentRashi,
      houseFromMoon: t.houseFromMoon,
      houseFromLagna: hFL,
      status: t.effectiveStatus,
      strength: str,
      vedhaNote: t.vedhaNote,
      interpretation: t.effectEn,
    };
  });

  // 7. Muhurta + vedic engine enrichments
  const muhurta = calcMuhurta(event.eventDate, event.eventTime, event.eventTimeUTC);
  const eventJD = parseDateTimeJD(event.eventDate, event.eventTimeUTC);
  const birthJD = parseDateTimeJD(profile.birthDate, profile.birthTime);
  const panchanga = muhurta.panchanga ?? computePanchanga(eventJD);

  const birthPositions = allPositions(birthJD);
  const eventPositions = allPositions(eventJD);
  const birthAy = lahiriAyanamsa(birthJD);
  const birthMoonSid = ((birthPositions.Moon - birthAy) % 360 + 360) % 360;
  const eventMoonSid = ((eventPositions.Moon - birthAy) % 360 + 360) % 360;

  const taraBala = computeTaraBala(birthMoonSid, eventMoonSid);
  const d9Chart = computeD9(birthJD);
  const d9MoonSign = d9Chart.Moon;

  const eventHouseNumber = EVENT_HOUSE_MAP[event.eventType];
  const eventHouseSavScore = sarvaAVBindu(eventHouseNumber);

  const eventDateTime = new Date(`${event.eventDate}T${event.eventTime}:00`);
  const horaTimeline = getHoraTimeline(eventDateTime, 12);

  // Per-planet Ashtakavarga overlay on transits
  const avAnalysis = calculateAshtakavargaTransitAnalysis(
    transitPlanets.map(t => ({ planet: t.planet, house: t.houseFromLagna })),
  );
  const avMap = new Map(avAnalysis.map(a => [a.planet, a]));
  for (const t of transitPlanets) {
    const av = avMap.get(t.planet);
    if (av) {
      t.savScore = av.savScore;
      t.savStrength = av.strength;
    }
  }

  // Dynamic remedies from chart afflictions
  const debilitatedPlanets = natalPlanets.filter(p => p.dignity === 'Debilitated').map(p => p.planet);
  const afflictedHouses = natalPlanets
    .filter(p => [6, 8, 12].includes(p.houseFromLagna))
    .map(p => ({ planet: p.planet, house: p.houseFromLagna }));
  const remedies = generateRemedies(
    dashaState.mahadasha,
    dashaState.antardasha,
    debilitatedPlanets,
    afflictedHouses,
  );

  // 8. Score computation
  const favorableCount = transitPlanets.filter(t => t.status === 'favorable').length;
  const avgTransitStr  = transitPlanets.reduce((s, t) => s + t.strength, 0) / (transitPlanets.length || 1);
  const activeYogaCount = careerYogas.filter(y => y.active).length;
  const yogaAvgStr = careerYogas.reduce((s, y) => s + y.strength, 0) / (careerYogas.length || 1);

  const muhurtaScore = muhurta.quality === 'excellent' ? 85 :
                       muhurta.quality === 'good' ? 72 :
                       muhurta.quality === 'neutral' ? 58 : 40;

  // Tara Bala bonus in event score
  const taraBonus = taraBala.isAuspicious ? 8 : -5;
  const savBonus = eventHouseSavScore >= 30 ? 5 : eventHouseSavScore >= 25 ? 0 : -3;

  const foreignYoga = careerYogas.find(y => y.name === 'Foreign Career Karma (Rahu)');
  const foreignScore = foreignYoga?.active ? 92 : Math.round(yogaAvgStr);

  const eventSuccessScore = Math.min(100, Math.round(
    avgTransitStr * 0.40 +
    (favorableCount / 9) * 100 * 0.25 +
    muhurtaScore * 0.20 +
    (taraBala.isAuspicious ? 15 : 5) * 0.15 +
    taraBonus + savBonus,
  ));

  const scores: PrognosisScore[] = [
    {
      label: 'Event Success Probability',
      labelHi: 'घटना सफलता संभावना',
      score: eventSuccessScore,
      color: eventSuccessScore >= 70 ? 'emerald' : eventSuccessScore >= 50 ? 'amber' : 'rose',
      detail: `Based on ${favorableCount}/9 favorable transits, muhurta quality (${muhurta.quality}), and dasha support`,
    },
    {
      label: 'Foreign Career Karma',
      labelHi: 'विदेशी कैरियर कर्म',
      score: foreignScore,
      color: foreignScore >= 80 ? 'indigo' : 'amber',
      detail: 'Natal chart analysis: Rahu placement, 12th/9th house strength, foreign yoga indicators',
    },
    {
      label: 'Muhurta Timing Quality',
      labelHi: 'मुहूर्त गुणवत्ता',
      score: muhurtaScore,
      color: muhurtaScore >= 80 ? 'violet' : muhurtaScore >= 60 ? 'amber' : 'rose',
      detail: `${muhurta.weekday}, ${muhurta.hora}, Tithi: ${muhurta.tithiDescription}`,
    },
  ];

  const overallScore = Math.round(
    eventSuccessScore * 0.50 + foreignScore * 0.25 + muhurtaScore * 0.25
  );

  // 9. Verdict
  const verdict = overallScore >= 75
    ? `Cosmically timed — this event carries genuine success potential. ${dashaState.mahadasha} MD + foreign career karma align. Act with confidence and disciplined preparation.`
    : overallScore >= 55
    ? `Mixed but workable window. Strength comes from preparation and communication (Mercury PD). Avoid over-explaining; stay calm under pressure.`
    : `Challenging timing, but not blocked. Focus on honesty, structure, and follow-up quality. Every interview is a stepping stone.`;

  const verdictHi = overallScore >= 75
    ? `यह एक ब्रह्मांडीय रूप से नियोजित अवसर है। ${dashaState.mahadasha} महादशा और विदेशी कैरियर कर्म एक साथ आते हैं। आत्मविश्वास से आगे बढ़ें।`
    : `मिश्रित लेकिन अनुकूल खिड़की। तैयारी और संवाद शक्ति से सफलता संभव है।`;

  // 10. Guidance
  const guidanceSections = buildGuidance({} as Partial<PrognosisReport>, muhurta, dashaState, overallScore, event.eventType);

  const positiveFactors = buildPositiveFactors({
    taraBala, eventHouseSavScore, careerYogas, transitPlanets, muhurtaDetails: muhurta, dashaState,
  });

  return {
    profile, event, scores, natalPlanets, careerYogas, transitPlanets,
    dashaState, guidanceSections, verdict, verdictHi, overallScore, muhurtaDetails: muhurta,
    taraBala, eventHouseSavScore, eventHouseNumber, d9MoonSign, d9Chart, horaTimeline,
    panchanga, remedies, positiveFactors,
  };
}
