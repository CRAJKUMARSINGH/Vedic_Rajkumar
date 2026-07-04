/**
 * psychologicalProfileService.ts
 *
 * LAYER 11 — Psychological Profile Object
 *
 * Assembles three mandatory components from existing services:
 *   A. Nakshatra Fear Architecture  → nakshatraService (nakshatra name per planet)
 *   B. Rahu/Ketu Karmic Statement   → jaiminiService (house/sign/nakshatra)
 *   C. Saturn Wound Statement       → shadabalaService + dashaService
 *   D. Synthesis Narrative          → 3-sentence summary
 *
 * Output is JSON-ready for API responses and UI rendering.
 */

import type { ShadabalaResult } from './shadabalaService';
import type { DashaResult } from './dashaService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NakshatraFear {
  nakshatraName:    string;
  planet:           string;
  group:            string;          // e.g. "Ashwini–Bharani–Krittika"
  coreFear:         string;
  manifestation:    string;
  reframe:          string;          // The psychological reframe for remedy Layer 12.2
}

export interface RahuKetuKarmicStatement {
  rahu: {
    house:         number;
    sign:          string;
    nakshatra:     string;
    obsession:     string;
    foreignElement: string;
  };
  ketu: {
    house:         number;
    sign:          string;
    nakshatra:     string;
    masteryClaimed: string;
    avoidancePattern: string;
  };
  axisTension:     string;          // The specific karmic curriculum
  paragraph:       string;          // Full single-paragraph statement
}

export interface SaturnWoundStatement {
  house:           number;
  sign:            string;
  nakshatra:       string;
  structuralWound: string;          // Where time/authority first hurt
  aspectedHouses:  number[];
  overcompensation: string;         // What native controls/collapses through
  dashaReactivation: string;        // When the wound is reactivated for healing
  paragraph:       string;          // Full single-paragraph statement
}

export interface PsychologicalProfile {
  nakshatra_fear:           NakshatraFear;
  rahu_ketu_karmic_statement: RahuKetuKarmicStatement;
  saturn_wound_statement:   SaturnWoundStatement;
  synthesis_narrative:      string;   // Exactly 3 sentences
}

// ─── Planet position (minimal shape) ─────────────────────────────────────────

interface PlanetPosition {
  name:       string;
  house:      number;
  rashiIndex: number;    // 0–11
  nakshatra?: string;    // nakshatra name, if pre-computed
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RASHI_NAMES: Record<number, string> = {
  0:'Aries', 1:'Taurus', 2:'Gemini', 3:'Cancer', 4:'Leo', 5:'Virgo',
  6:'Libra', 7:'Scorpio', 8:'Sagittarius', 9:'Capricorn', 10:'Aquarius', 11:'Pisces',
};

const HOUSE_MEANINGS: Record<number, string> = {
  1:'self/identity/body', 2:'wealth/speech/family', 3:'courage/communication/siblings',
  4:'home/mother/emotional foundations', 5:'children/creativity/intelligence',
  6:'service/enemies/health', 7:'partnerships/spouse', 8:'transformation/occult/death',
  9:'dharma/father/luck/spirituality', 10:'career/authority/public image',
  11:'gains/networks/aspirations', 12:'losses/liberation/foreign lands',
};

// ─── A: NAKSHATRA FEAR ARCHITECTURE ──────────────────────────────────────────

interface NakshatraGroup {
  nakshatras: string[];
  group:      string;
  coreFear:   string;
  manifestation: string;
  reframeTemplate: string;
}

const NAKSHATRA_GROUPS: NakshatraGroup[] = [
  {
    nakshatras: ['Ashwini','Bharani','Krittika'],
    group: 'Ashwini–Bharani–Krittika',
    coreFear: 'Fear of insignificance / annihilation',
    manifestation: 'Hyperactivity, impulsivity, burnout cycles — perpetual motion to prove existence',
    reframeTemplate: 'You move fast because stillness feels like death. The reframe: your significance is not earned by speed — it is your birthright. Slow down to be seen, not to disappear.',
  },
  {
    nakshatras: ['Rohini','Mrigashira','Ardra'],
    group: 'Rohini–Mrigashira–Ardra',
    coreFear: 'Fear of abandonment / loss of love',
    manifestation: 'Clinging, emotional manipulation, volatility — love weaponized as control',
    reframeTemplate: 'You love intensely because you fear the loss of what you love. The reframe: the people who matter will not leave if you loosen your grip. Security is built through trust, not possession.',
  },
  {
    nakshatras: ['Punarvasu','Pushya','Ashlesha'],
    group: 'Punarvasu–Pushya–Ashlesha',
    coreFear: 'Fear of uncertainty / need for control',
    manifestation: 'Hoarding, anxiety, digestive disorders — control as the illusion of safety',
    reframeTemplate: 'You control because uncertainty feels like danger. The reframe: precision is protection — but only when applied to your actions, not others\' choices.',
  },
  {
    nakshatras: ['Magha','Purva Phalguni','Uttara Phalguni'],
    group: 'Magha–Purva Phalguni–Uttara Phalguni',
    coreFear: 'Fear of obscurity / loss of lineage',
    manifestation: 'Narcissism, status obsession, ancestral debt — recognition as oxygen',
    reframeTemplate: 'You fear being forgotten because your ancestors demanded to be remembered. The reframe: legacy is not built by chasing recognition — it is built by giving others something worth remembering.',
  },
  {
    nakshatras: ['Hasta','Chitra','Swati'],
    group: 'Hasta–Chitra–Swati',
    coreFear: 'Fear of imperfection / exposure',
    manifestation: 'Perfectionism, people-pleasing, craft obsession — the mask of flawlessness',
    reframeTemplate: 'You perfect to avoid judgment. The reframe: your imperfect visible work changes the world. Your perfect hidden work changes nothing.',
  },
  {
    nakshatras: ['Vishakha','Anuradha','Jyeshtha'],
    group: 'Vishakha–Anuradha–Jyeshtha',
    coreFear: 'Fear of betrayal / powerlessness',
    manifestation: 'Control battles, jealousy, chronic trust issues — power as the only safety',
    reframeTemplate: 'You have been betrayed and learned that power prevents it. The reframe: vulnerability chosen consciously is not weakness — it is the only door to genuine alliance.',
  },
  {
    nakshatras: ['Mula','Purva Ashadha','Uttara Ashadha'],
    group: 'Mula–Purva Ashadha–Uttara Ashadha',
    coreFear: 'Fear of meaninglessness / chaos',
    manifestation: 'Fanaticism, addiction, philosophical extremism — meaning as the war against void',
    reframeTemplate: 'You rage against meaninglessness. The reframe: meaning is not found — it is created in the act of committed service. Your deepest purpose is built, not discovered.',
  },
  {
    nakshatras: ['Shravana','Dhanishtha','Shatabhisha'],
    group: 'Shravana–Dhanishtha–Shatabhisha',
    coreFear: 'Fear of disconnection / isolation',
    manifestation: 'Gossip, fame-seeking, technological obsession — connection as the antidote to emptiness',
    reframeTemplate: 'You seek connection because silence feels like erasure. The reframe: true connection requires you to be present, not broadcast. One deep conversation outweighs a thousand followers.',
  },
  {
    nakshatras: ['Purva Bhadrapada','Uttara Bhadrapada','Revati'],
    group: 'Purva Bhadrapada–Uttara Bhadrapada–Revati',
    coreFear: 'Fear of endings / the unknown',
    manifestation: 'Martyrdom, escapism, spiritual bypassing — transcendence as avoidance of the finite',
    reframeTemplate: 'You seek the infinite because the finite terrifies you. The reframe: your most spiritual act is full engagement with the impermanent world, not escape from it.',
  },
];

function matchNakshatraGroup(nakshatraName: string): NakshatraGroup {
  const found = NAKSHATRA_GROUPS.find(g =>
    g.nakshatras.some(n => nakshatraName.toLowerCase().startsWith(n.toLowerCase()))
  );
  return found ?? NAKSHATRA_GROUPS[0]; // Fallback to first group
}

/**
 * Build the Nakshatra Fear Architecture for the Lagna nakshatra.
 * Pass the Lagna nakshatra name (from nakshatraService).
 */
export function buildNakshatraFear(
  lagnaOrMoonNakshatra: string,
  planet: string = 'Lagna'
): NakshatraFear {
  const group = matchNakshatraGroup(lagnaOrMoonNakshatra);
  return {
    nakshatraName: lagnaOrMoonNakshatra,
    planet,
    group:         group.group,
    coreFear:      group.coreFear,
    manifestation: group.manifestation,
    reframe:       group.reframeTemplate,
  };
}

// ─── B: RAHU/KETU KARMIC STATEMENT ───────────────────────────────────────────

const RAHU_HOUSE_OBSESSION: Record<number, { obsession: string; foreignElement: string }> = {
  1:  { obsession: 'Self-reinvention and identity experimentation — the self as a project', foreignElement: 'Foreign cultures, unusual appearance, radical individuality' },
  2:  { obsession: 'Wealth accumulation and speech power — money and words as weapons', foreignElement: 'Foreign wealth sources, unusual family configurations, multiple languages' },
  3:  { obsession: 'Communication and courage — the need to be heard', foreignElement: 'Foreign media, digital platforms, unconventional siblings' },
  4:  { obsession: 'Home, roots, and emotional security — the impossible belonging', foreignElement: 'Foreign homeland, unconventional home environments, adoptive family' },
  5:  { obsession: 'Creative output, romance, and children — life as performance', foreignElement: 'Foreign entertainment, speculative investments, unconventional romance' },
  6:  { obsession: 'Service, health, and competition — winning at all costs', foreignElement: 'Foreign diseases, unconventional healing, enemies from foreign lands' },
  7:  { obsession: 'Partnership and mirroring — the search for the perfect other', foreignElement: 'Foreign spouse, unconventional relationships, public partnerships' },
  8:  { obsession: 'Hidden power, occult, and transformation — the taboo as magnet', foreignElement: 'Foreign mysticism, inherited power from unusual sources, radical transformation' },
  9:  { obsession: 'Belief systems, gurus, and higher meaning — the philosophy collector', foreignElement: 'Foreign religion, overseas travel, unusual teachers' },
  10: { obsession: 'Career ambition and public recognition — fame as the existential project', foreignElement: 'Viral fame, foreign career success, unconventional professional path' },
  11: { obsession: 'Gains, networks, and aspirations — the dream machine', foreignElement: 'Foreign gains, unusual social networks, global causes' },
  12: { obsession: 'Liberation, isolation, and hidden worlds — the escape artist', foreignElement: 'Foreign lands, ashrams, overseas residency, spiritual retreats' },
};

const KETU_HOUSE_MASTERY: Record<number, { masteryClaimed: string; avoidancePattern: string }> = {
  1:  { masteryClaimed: 'Self-sufficiency and physical endurance — this soul knows how to survive alone', avoidancePattern: 'Avoids owning its power; deflects leadership; prefers to be invisible' },
  2:  { masteryClaimed: 'Wealth wisdom and family loyalty — this soul knows the value of tradition', avoidancePattern: 'Avoids accumulation; sabotages financial growth; detaches from family duties' },
  3:  { masteryClaimed: 'Communication mastery and courage in action — this soul has spoken and fought', avoidancePattern: 'Avoids initiating; lets courage atrophy; outsources its voice' },
  4:  { masteryClaimed: 'Emotional depth and home creation — this soul has built and lost homes before', avoidancePattern: 'Avoids emotional intimacy; home feels like a prison or irrelevant' },
  5:  { masteryClaimed: 'Creative and intellectual brilliance — this soul has been the artist and the teacher', avoidancePattern: 'Avoids creative risk; dismisses children; intellectualizes emotions' },
  6:  { masteryClaimed: 'Healing, service, and adversity mastery — this soul has overcome enemies before', avoidancePattern: 'Avoids conflict; neglects health; becomes a martyr in service' },
  7:  { masteryClaimed: 'Partnership and negotiation — this soul has merged with another many times', avoidancePattern: 'Avoids commitment; sabotages relationships before they can abandon them' },
  8:  { masteryClaimed: 'Transformation and hidden knowledge — this soul has died and been reborn', avoidancePattern: 'Avoids deep intimacy; fears change; dismisses the occult as dangerous' },
  9:  { masteryClaimed: 'Spiritual and philosophical authority — this soul has been the teacher and the pilgrim', avoidancePattern: 'Rejects gurus; dismisses formal religion; avoids the spiritual journey' },
  10: { masteryClaimed: 'Career authority and public responsibility — this soul has led before', avoidancePattern: 'Avoids ambition; self-sabotages career peaks; dismisses status as meaningless' },
  11: { masteryClaimed: 'Social vision and gains — this soul has built movements and networks', avoidancePattern: 'Avoids groups; withdraws from communities; sabotages financial aspirations' },
  12: { masteryClaimed: 'Liberation, solitude, and the sacred — this soul has renounced before', avoidancePattern: 'Avoids isolation; fears spiritual practice; overcompensates with social noise' },
};

const RAHU_KETU_AXIS_TENSION: Record<string, string> = {
  '1-7':  'Between radical individuality (Rahu/1st) and the pull of the perfect partnership (Ketu/7th) — the curriculum: integrate self-sovereignty with conscious union',
  '7-1':  'Between obsessive mirroring in partnership (Rahu/7th) and the avoidance of selfhood (Ketu/1st) — the curriculum: build yourself before you lose yourself in another',
  '2-8':  'Between accumulation and speech (Rahu/2nd) and the avoidance of hidden depths (Ketu/8th) — the curriculum: earn through transparency, not through power games',
  '8-2':  'Between obsession with transformation and the taboo (Rahu/8th) and the dismissal of wealth/speech (Ketu/2nd) — the curriculum: ground mystical insight in practical value',
  '3-9':  'Between the hunger for communication and courage (Rahu/3rd) and the rejection of the spiritual framework (Ketu/9th) — the curriculum: let your voice become dharma, not just content',
  '9-3':  'Between the philosophy collector (Rahu/9th) and the dismissal of the courage to act on it (Ketu/3rd) — the curriculum: stop accumulating beliefs and start living one',
  '4-10': 'Between the impossible search for home/belonging (Rahu/4th) and the avoidance of public power (Ketu/10th) — the curriculum: emotional security is built, not found; authority must be claimed',
  '10-4': 'Between career obsession and fame-seeking (Rahu/10th) and the neglect of emotional roots (Ketu/4th) — the curriculum: no external throne replaces an internal home',
  '5-11': 'Between creative brilliance and romantic obsession (Rahu/5th) and the withdrawal from collective vision (Ketu/11th) — the curriculum: your individual gift is the gift to the collective',
  '11-5': 'Between network obsession and aspirational accumulation (Rahu/11th) and the avoidance of individual creative risk (Ketu/5th) — the curriculum: your idea, not your network, is your legacy',
  '6-12': 'Between service and competition (Rahu/6th) and the avoidance of surrender and liberation (Ketu/12th) — the curriculum: win the inner battle before the outer one',
  '12-6': 'Between the escapism of hidden worlds (Rahu/12th) and the avoidance of daily service (Ketu/6th) — the curriculum: liberation is earned through engaged service, not retreat',
};

export function buildRahuKetuStatement(
  rahu: PlanetPosition,
  ketu: PlanetPosition,
  rahuNakshatra: string,
  ketuNakshatra: string
): RahuKetuKarmicStatement {
  const rahuData = RAHU_HOUSE_OBSESSION[rahu.house] ?? {
    obsession: `Rahu in ${RASHI_NAMES[rahu.rashiIndex]} — deep desire for expansion in the domain of the ${HOUSE_MEANINGS[rahu.house] ?? 'unknown'}`,
    foreignElement: 'Unconventional, foreign, or viral expression of this domain',
  };

  const ketuData = KETU_HOUSE_MASTERY[ketu.house] ?? {
    masteryClaimed: `Ketu in ${RASHI_NAMES[ketu.rashiIndex]} — mastery of the ${HOUSE_MEANINGS[ketu.house] ?? 'unknown'} domain from prior lifetimes`,
    avoidancePattern: 'Avoids engaging with this domain; it feels either irrelevant or uncomfortable',
  };

  const axisKey = `${rahu.house}-${ketu.house}`;
  const axisTension = RAHU_KETU_AXIS_TENSION[axisKey] ??
    `Between the Rahu obsession in the ${rahu.house}th (${HOUSE_MEANINGS[rahu.house]}) and the Ketu avoidance in the ${ketu.house}th (${HOUSE_MEANINGS[ketu.house]}) — this axis is the central karmic curriculum of this incarnation`;

  const paragraph =
    `Rahu in the ${rahu.house}th house (${RASHI_NAMES[rahu.rashiIndex]}, ${rahuNakshatra}): ${rahuData.obsession}. ` +
    `The foreign or unconventional element Rahu seeks this lifetime: ${rahuData.foreignElement}. ` +
    `Ketu in the ${ketu.house}th house (${RASHI_NAMES[ketu.rashiIndex]}, ${ketuNakshatra}): ${ketuData.masteryClaimed}. ` +
    `The avoidance pattern: ${ketuData.avoidancePattern}. ` +
    `Axis tension: ${axisTension}.`;

  return {
    rahu: {
      house:          rahu.house,
      sign:           RASHI_NAMES[rahu.rashiIndex] ?? 'Unknown',
      nakshatra:      rahuNakshatra,
      obsession:      rahuData.obsession,
      foreignElement: rahuData.foreignElement,
    },
    ketu: {
      house:            ketu.house,
      sign:             RASHI_NAMES[ketu.rashiIndex] ?? 'Unknown',
      nakshatra:        ketuNakshatra,
      masteryClaimed:   ketuData.masteryClaimed,
      avoidancePattern: ketuData.avoidancePattern,
    },
    axisTension,
    paragraph,
  };
}

// ─── C: SATURN WOUND STATEMENT ────────────────────────────────────────────────

const SATURN_HOUSE_WOUND: Record<number, { wound: string; overcompensation: string }> = {
  1:  { wound: 'Self-worth was attacked early — body, health, or identity was diminished or punished', overcompensation: 'Overcompensates through extreme self-control or collapses through chronic self-doubt' },
  2:  { wound: 'Financial scarcity or speech was shamed — the family\'s poverty or harshness around money/words', overcompensation: 'Hoards compulsively or becomes speechless under pressure' },
  3:  { wound: 'Courage was punished or siblings created the wound — initiative was met with ridicule', overcompensation: 'Overcompensates by proving bravery recklessly or becomes permanently hesitant' },
  4:  { wound: 'The home was unsafe, cold, or absent — the mother\'s limitation became a structural wound', overcompensation: 'Builds an impenetrable fortress of privacy or becomes emotionally unavailable' },
  5:  { wound: 'Creativity or intelligence was suppressed or punished — children may carry this wound forward', overcompensation: 'Overachieves intellectually or dismisses creative play as frivolous' },
  6:  { wound: 'Service without recognition — chronic undervaluation; health used as a weapon of control', overcompensation: 'Works until collapse or refuses help from others; diseases as the only permission to rest' },
  7:  { wound: 'Partnership was delayed, denied, or traumatic — marriage as a test, not a gift', overcompensation: 'Either submits entirely to a partner\'s control or avoids commitment permanently' },
  8:  { wound: 'Transformation was forced, not chosen — loss, inheritance trauma, or sudden crisis', overcompensation: 'Obsesses over control of hidden things or refuses to surrender to change' },
  9:  { wound: 'The father, teacher, or belief system failed — dharma was cold, rigid, or punishing', overcompensation: 'Either becomes fanatically religious or rejects all higher authority' },
  10: { wound: 'Authority and career were denied or sabotaged — the public world felt hostile to the native\'s ambitions', overcompensation: 'Works compulsively to prove worthiness or develops a deep ambivalence toward success' },
  11: { wound: 'Gains and networks were blocked — friendships betrayed or aspirations crushed by circumstance', overcompensation: 'Becomes a loner or desperately accumulates social proof to compensate' },
  12: { wound: 'Isolation and sacrifice were imposed — confinement, exile, or invisible losses defined early life', overcompensation: 'Either withdraws completely or becomes hyperactive to avoid silence' },
};

export function buildSaturnWound(
  saturn:       PlanetPosition,
  saturnNakshatra: string,
  dasha:        DashaResult,
  shadabala:    ShadabalaResult[]
): SaturnWoundStatement {
  const woundData = SATURN_HOUSE_WOUND[saturn.house] ?? {
    wound: `Saturn in the ${saturn.house}th — limitation and time imposed their lesson on the domain of ${HOUSE_MEANINGS[saturn.house]}`,
    overcompensation: 'Either extreme rigidity or collapse in this domain',
  };

  // Saturn's standard aspects: 3rd, 7th, and 10th from its position
  const aspectedHouses = [
    ((saturn.house + 2) % 12) + 1,    // 3rd aspect (actually 3rd from Saturn)
    ((saturn.house + 6) % 12) + 1,    // 7th aspect
    ((saturn.house + 9) % 12) + 1,    // 10th aspect
  ].filter(h => h !== saturn.house);

  // Saturn Dasha timing
  const saturnMD = dasha.mahadashas.find(m => m.planet === 'Saturn');
  const isCurrentSaturnMD = dasha.currentMahadasha?.planet === 'Saturn';
  const saturnRupas = shadabala.find(s => s.planet === 'Saturn')?.totalRupas ?? 0;

  let dashaReactivation: string;
  if (isCurrentSaturnMD) {
    const endYear = saturnMD?.endDate.getFullYear();
    dashaReactivation = `Saturn Mahadasha is ACTIVE now — the wound is being reactivated and processed in real time (until ${endYear}). This is the crucible period: the wound must be faced, not managed.`;
  } else if (saturnMD) {
    const startYear = saturnMD.startDate.getFullYear();
    const endYear   = saturnMD.endDate.getFullYear();
    const isFuture  = saturnMD.startDate > new Date();
    dashaReactivation = isFuture
      ? `Saturn Mahadasha will reactivate this wound between ${startYear}–${endYear}. Prepare consciously: the wound will surface fully in that window.`
      : `Saturn Mahadasha (${startYear}–${endYear}) has already passed — the wound's primary healing window is complete. What remains is integration and chronic pattern management.`;
  } else {
    dashaReactivation = 'Saturn Mahadasha timing not determinable from available data.';
  }

  const saturnStrengthNote = saturnRupas >= 1.25
    ? `Saturn is strong (${saturnRupas.toFixed(2)} rupas) — the wound, when faced, becomes the greatest teacher; structure is eventually earned.`
    : saturnRupas >= 0.75
    ? `Saturn is moderate (${saturnRupas.toFixed(2)} rupas) — the wound creates inconsistent limitation; some areas heal, others persist.`
    : `Saturn is weak (${saturnRupas.toFixed(2)} rupas) — the wound's lessons arrive erratically, making it harder to identify and integrate.`;

  const aspectedHouseNames = aspectedHouses.map(h => `${h}th (${HOUSE_MEANINGS[h] ?? 'unknown'})`).join(', ');

  const paragraph =
    `Saturn in the ${saturn.house}th house (${RASHI_NAMES[saturn.rashiIndex]}, ${saturnNakshatra}): ${woundData.wound}. ` +
    `Saturn aspects the ${aspectedHouseNames} — in these domains, the native ${woundData.overcompensation}. ` +
    `${saturnStrengthNote} ` +
    `Dasha reactivation: ${dashaReactivation}`;

  return {
    house:            saturn.house,
    sign:             RASHI_NAMES[saturn.rashiIndex] ?? 'Unknown',
    nakshatra:        saturnNakshatra,
    structuralWound:  woundData.wound,
    aspectedHouses,
    overcompensation: woundData.overcompensation,
    dashaReactivation,
    paragraph,
  };
}

// ─── D: SYNTHESIS NARRATIVE ───────────────────────────────────────────────────

export function buildSynthesisNarrative(
  fear:    NakshatraFear,
  rahuKetu: RahuKetuKarmicStatement,
  saturn:  SaturnWoundStatement
): string {
  const sentence1 =
    `At the core, this native operates from a ${fear.coreFear.toLowerCase()}, expressed through ${fear.manifestation.toLowerCase()}.`;

  const sentence2 =
    `The karmic curriculum runs between the Rahu obsession in the ${rahuKetu.rahu.house}th (${rahuKetu.rahu.obsession.split('—')[0].trim()}) and the Ketu avoidance in the ${rahuKetu.ketu.house}th (${rahuKetu.ketu.avoidancePattern.split(';')[0].trim().replace('Avoids', 'an avoidance of').toLowerCase()}).`;

  const sentence3 =
    `Saturn in the ${saturn.house}th (${saturn.sign}) administers the structural wound around ${HOUSE_MEANINGS[saturn.house] ?? 'the unknown'}, demanding that the native ${saturn.overcompensation.split(';')[0].toLowerCase()}, until the wound is consciously integrated and becomes the native's greatest structural gift.`;

  return [sentence1, sentence2, sentence3].join(' ');
}

// ─── MAIN ASSEMBLER ───────────────────────────────────────────────────────────

/**
 * Assemble the full Layer 11 Psychological Profile Object.
 *
 * @param lagnaOrMoonNakshatra  Lagna or Moon nakshatra name (from nakshatraService)
 * @param planets               All 9 planetary positions
 * @param rahuNakshatra         Rahu's nakshatra name
 * @param ketuNakshatra         Ketu's nakshatra name
 * @param saturnNakshatra       Saturn's nakshatra name
 * @param dasha                 Full DashaResult from dashaService
 * @param shadabala             All planet Shadbala from shadabalaService
 */
export function assemblePsychologicalProfile(
  lagnaOrMoonNakshatra: string,
  planets:              PlanetPosition[],
  rahuNakshatra:        string,
  ketuNakshatra:        string,
  saturnNakshatra:      string,
  dasha:                DashaResult,
  shadabala:            ShadabalaResult[]
): PsychologicalProfile {
  const rahu   = planets.find(p => p.name === 'Rahu');
  const ketu   = planets.find(p => p.name === 'Ketu');
  const saturn = planets.find(p => p.name === 'Saturn');

  if (!rahu || !ketu || !saturn) {
    throw new Error('assemblePsychologicalProfile: Rahu, Ketu, and Saturn positions are required');
  }

  const nakshatraFear = buildNakshatraFear(lagnaOrMoonNakshatra);
  const rahuKetuStatement = buildRahuKetuStatement(rahu, ketu, rahuNakshatra, ketuNakshatra);
  const saturnWound = buildSaturnWound(saturn, saturnNakshatra, dasha, shadabala);
  const synthesis = buildSynthesisNarrative(nakshatraFear, rahuKetuStatement, saturnWound);

  return {
    nakshatra_fear:             nakshatraFear,
    rahu_ketu_karmic_statement: rahuKetuStatement,
    saturn_wound_statement:     saturnWound,
    synthesis_narrative:        synthesis,
  };
}

/**
 * Serialize to JSON-ready object (for API response).
 */
export function profileToJSON(profile: PsychologicalProfile): Record<string, unknown> {
  return {
    coreNeeds: `Needs to overcome the ${profile.nakshatra_fear.coreFear.toLowerCase()} by remembering: ${profile.nakshatra_fear.reframe}`,
    primaryFear: profile.nakshatra_fear.coreFear,
    karmicObsession: profile.rahu_ketu_karmic_statement.rahu.obsession,
    karmicDetachment: profile.rahu_ketu_karmic_statement.ketu.avoidancePattern,
    integrationPath: profile.synthesis_narrative,
    fullProfile: {
      nakshatra_fear: {
        nakshatra:     profile.nakshatra_fear.nakshatraName,
        group:         profile.nakshatra_fear.group,
        core_fear:     profile.nakshatra_fear.coreFear,
        manifestation: profile.nakshatra_fear.manifestation,
        reframe:       profile.nakshatra_fear.reframe,
      },
      rahu_ketu_karmic_statement: profile.rahu_ketu_karmic_statement.paragraph,
      saturn_wound_statement:     profile.saturn_wound_statement.paragraph,
      synthesis_narrative:        profile.synthesis_narrative,
    },
  };
}
