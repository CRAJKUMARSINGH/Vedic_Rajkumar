/**
 * CompatibilityPanel.tsx — Vedic Synastry & Kundali Matching
 *
 * DROP THIS FILE INTO: src/components/CompatibilityPanel.tsx
 *
 * No compatibility service exists in the repo — this panel implements the full
 * Ashta Koota matching engine (8 Kutas, 36 points) directly, plus four
 * deeper compatibility layers grounded in the existing engine services.
 *
 * COMPUTATION MODEL:
 *   Two separate birth inputs → two assembleEngineData() calls in parallel
 *   → Moon nakshatra (0-26) and Moon rashi (0-11) extracted from each chart
 *   → 8 Kutas scored classically from those values
 *   → Deep-match: AK planets, 7th lord matching, Upapada, Dasha harmony
 *
 * FOUR TABS:
 *   1. Score     — 36-point gauge, overall verdict, 8-Kuta mini-bar grid.
 *                  Doshas (Nadi/Bhakoot) called out prominently.
 *   2. Kutas     — Accordion for each Kuta: name (EN+HI+Sanskrit), classical
 *                  basis, what it measures, score breakdown, full explanation.
 *   3. Deep Match— Atmakaraka planet friendship · 7th lord synastry · Upapada
 *                  Lagna match · Dasha harmony (are running MDs compatible?)
 *                  · key inter-chart planet relationships.
 *   4. Report    — Full written synthesis narrative: strengths, cautions,
 *                  optimal timing, and an honest bottom line.
 *
 * DEPENDENCIES (all already in the repo):
 *   - src/services/engineDataAssembler.ts  → assembleEngineData(), EngineData
 *   - src/services/geocodingService.ts     → searchLocation()
 *   - src/components/EnhancedBirthInputForm.tsx
 *
 * USAGE:
 *   import { CompatibilityPanel } from '@/components/CompatibilityPanel';
 *   <CompatibilityPanel />
 */

import { useState } from "react";
import { assembleEngineData } from "@/services/engineDataAssembler";
import { searchLocation }     from "@/services/geocodingService";
import EnhancedBirthInputForm from "@/components/EnhancedBirthInputForm";
import type { EngineData }    from "@/services/engineDataAssembler";

// ─── Constants ──────────────────────────────────────────────────────────────────

const RASHI_NAMES   = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHI_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

const NAKSHATRA_NAMES_HI = [
  'अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा',
  'पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी',
  'हस्त','चित्रा','स्वाति','विशाखा','अनुराधा','ज्येष्ठा',
  'मूल','पूर्व आषाढ़','उत्तर आषाढ़','श्रवण','धनिष्ठा',
  'शतभिषा','पूर्व भाद्रपद','उत्तर भाद्रपद','रेवती',
];

const PLANET_SYMBOLS: Record<string,string> = {
  Sun:'☀', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃', Venus:'♀',
  Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

const RASHI_LORDS: Record<number,string> = {
  0:'Mars', 1:'Venus', 2:'Mercury', 3:'Moon', 4:'Sun', 5:'Mercury',
  6:'Venus', 7:'Mars', 8:'Jupiter', 9:'Saturn', 10:'Saturn', 11:'Jupiter',
};

// ─── Ashta Koota data tables ────────────────────────────────────────────────────

// Varna (by rashi lord element — Brahmin=3, Kshatriya=2, Vaishya=1, Shudra=0)
const VARNA_BY_RASHI: Record<number,number> = {
  3:3, 7:3, 11:3,    // Cancer, Scorpio, Pisces → Brahmin
  0:2, 4:2, 8:2,     // Aries, Leo, Sagittarius → Kshatriya
  1:1, 5:1, 9:1,     // Taurus, Virgo, Capricorn → Vaishya
  2:0, 6:0, 10:0,    // Gemini, Libra, Aquarius → Shudra
};
const VARNA_LABELS = ['Shudra','Vaishya','Kshatriya','Brahmin'];

// Vashya groups (0=Human,1=Quadruped,2=Feline/Wild,3=Reptile,4=Water)
const VASHYA_GROUP: Record<number,number> = {
  2:0, 5:0, 6:0, 8:0, 10:0,   // Gemini,Virgo,Libra,Sagittarius,Aquarius → Human
  0:1, 1:1, 9:1,               // Aries,Taurus,Capricorn → Quadruped
  4:2,                          // Leo → Wild
  7:3,                          // Scorpio → Reptile/Insect
  3:4, 11:4,                    // Cancer,Pisces → Water
};
const VASHYA_LABELS = ['Human','Quadruped','Wild','Reptile','Water'];
// Vashya dominance pairs: A controls B
const VASHYA_CONTROLS: [number,number][] = [
  [0,7],[0,1],[3,7],[3,8],[4,6],[5,11],[5,2],[8,11],[9,0],[10,0],[10,11],[11,3],[7,3],
];

// Gana (0=Deva, 1=Manushya, 2=Rakshasa) per nakshatra index
const GANA: number[] = [
  0,1,2,1,0,1,0,0,2,2,1,1,0,2,0,2,0,2,2,1,1,0,2,2,1,0,0
];
const GANA_LABELS = ['Deva','Manushya','Rakshasa'];

// Yoni animal per nakshatra index (0-13 animal index)
const YONI: number[] = [
  0,1,2,3,3,4,5,2,5,6,6,7,8,9,8,9,10,10,4,11,12,11,13,0,13,7,1
];
const YONI_LABELS = ['Horse','Elephant','Goat','Serpent','Dog','Cat','Rat','Cow','Buffalo','Tiger','Deer','Monkey','Mongoose','Lion'];
// Enemy yoni pairs (no compatibility): [a,b] both ways
const YONI_ENEMIES: [number,number][] = [
  [5,6],   // Cat vs Rat
  [4,10],  // Dog vs Deer
  [3,12],  // Serpent vs Mongoose
  [1,13],  // Elephant vs Lion
  [7,9],   // Cow vs Tiger
  [0,8],   // Horse vs Buffalo
  [11,2],  // Monkey vs Goat
];
const YONI_FRIENDLY: [number,number][] = [
  [0,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9],[10,10],[11,11],[12,12],[13,13],
];

// Nadi (0=Adi/Vata, 1=Madhya/Pitta, 2=Antya/Kapha) per nakshatra
const NADI: number[] = [
  0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2,2,1,0,0,1,2
];
const NADI_LABELS = ['Adi (Vata)','Madhya (Pitta)','Antya (Kapha)'];

// Graha Maitri (planet friendship: 2=friend, 1=neutral, 0=enemy)
const FRIENDSHIP: Record<string,Record<string,number>> = {
  Sun:     { Sun:2, Moon:2, Mars:2, Mercury:1, Jupiter:2, Venus:0, Saturn:0, Rahu:0, Ketu:0 },
  Moon:    { Sun:2, Moon:2, Mars:1, Mercury:2, Jupiter:1, Venus:1, Saturn:1, Rahu:0, Ketu:0 },
  Mars:    { Sun:2, Moon:2, Mars:2, Mercury:0, Jupiter:2, Venus:1, Saturn:1, Rahu:0, Ketu:1 },
  Mercury: { Sun:2, Moon:0, Mars:1, Mercury:2, Jupiter:1, Venus:2, Saturn:1, Rahu:1, Ketu:0 },
  Jupiter: { Sun:2, Moon:2, Mars:2, Mercury:0, Jupiter:2, Venus:0, Saturn:1, Rahu:0, Ketu:0 },
  Venus:   { Sun:0, Moon:0, Mars:1, Mercury:2, Jupiter:1, Venus:2, Saturn:2, Rahu:1, Ketu:1 },
  Saturn:  { Sun:0, Moon:0, Mars:0, Mercury:2, Jupiter:1, Venus:2, Saturn:2, Rahu:2, Ketu:1 },
  Rahu:    { Sun:0, Moon:0, Mars:0, Mercury:1, Jupiter:1, Venus:2, Saturn:2, Rahu:2, Ketu:0 },
  Ketu:    { Sun:0, Moon:0, Mars:2, Mercury:0, Jupiter:2, Venus:1, Saturn:1, Rahu:0, Ketu:2 },
};

// ─── Kuta computation functions ─────────────────────────────────────────────────

interface ChartProfile {
  moonRashi:   number;   // 0-11
  moonNak:     number;   // 0-26
  lagnaRashi:  number;
  atmakaraka:  string;   // planet name
  dashaMD:     string;   // current mahadasha lord
  upapadaRashi: number | null;
  sevenLordRashi: number | null;
  planets: any[];
}

function extractProfile(ed: EngineData): ChartProfile {
  const moon    = ed.planets.find((p: any) => p.name === 'Moon');
  const moonRashi = moon?.rashiIndex ?? 0;
  // Absolute longitude → nakshatra
  const moonLong  = moonRashi * 30 + (moon?.degrees ?? 0);
  const moonNak   = Math.min(26, Math.floor(moonLong / (360 / 27)));

  const ak = (ed.jaiminiAnalysis as any)?.atmakaraka?.planet ?? 'Sun';

  // Current Mahadasha lord
  const dasha = ed.dasha as any;
  const periods: any[] = dasha?.periods ?? dasha?.mahadashas ?? [];
  const now = Date.now();
  const curPeriod = periods.find((p: any) =>
    p.startDate
      ? new Date(p.startDate).getTime() <= now && new Date(p.endDate).getTime() > now
      : false
  );
  const dashaMD = curPeriod?.planet ?? periods[0]?.planet ?? 'Moon';

  // 7th house lord
  const sevenHouseRashi = (ed.lagnaRashiIdx + 6) % 12;
  const sevenLord = RASHI_LORDS[sevenHouseRashi];
  const sevenLordPlanet = ed.planets.find((p: any) => p.name === sevenLord);
  const sevenLordRashi  = sevenLordPlanet?.rashiIndex ?? null;

  // Upapada
  const upadaRashi = (ed.jaiminiAnalysis as any)?.upapadaLagna?.rashiIndex ?? null;

  return {
    moonRashi, moonNak,
    lagnaRashi: ed.lagnaRashiIdx,
    atmakaraka: ak,
    dashaMD,
    upapadaRashi: upadaRashi,
    sevenLordRashi,
    planets: ed.planets,
  };
}

interface KutaResult {
  name: string;     nameHi: string;   nameSkt: string;
  max: number;      score: number;
  dosha: boolean;   doshaName?: string;
  basis: string;    detail: string;
  statusLabel: string;
}

function computeKutas(A: ChartProfile, B: ChartProfile): KutaResult[] {
  const kutas: KutaResult[] = [];

  // ── 1. Varna (1 pt) ─────────────────────────────────────────────────────────
  const varA = VARNA_BY_RASHI[A.moonRashi] ?? 0;
  const varB = VARNA_BY_RASHI[B.moonRashi] ?? 0;
  const varnaScore = varB >= varA ? 1 : 0;  // B (bride) varna <= A (groom) varna → 1
  kutas.push({
    name:'Varna', nameHi:'वर्ण', nameSkt:'Varṇa',
    max:1, score: varnaScore, dosha: varnaScore === 0,
    basis:'Moon signs (rashis)',
    detail:`Person A: ${VARNA_LABELS[varA]} (${RASHI_NAMES[A.moonRashi]}). Person B: ${VARNA_LABELS[varB]} (${RASHI_NAMES[B.moonRashi]}). ${varnaScore === 1 ? 'Compatible — spiritual/social alignment.' : 'Mismatched — may cause value-system friction.'}`,
    statusLabel: varnaScore === 1 ? 'Compatible' : 'Mismatch',
  });

  // ── 2. Vashya (2 pts) ───────────────────────────────────────────────────────
  const vasA = VASHYA_GROUP[A.moonRashi] ?? 0;
  const vasB = VASHYA_GROUP[B.moonRashi] ?? 0;
  const vasAcontrolsB = VASHYA_CONTROLS.some(([x,y]) => x === A.moonRashi && y === B.moonRashi);
  const vasBcontrolsA = VASHYA_CONTROLS.some(([x,y]) => x === B.moonRashi && y === A.moonRashi);
  const vashyaScore = vasA === vasB ? 2 : vasAcontrolsB || vasBcontrolsA ? 1 : 0;
  kutas.push({
    name:'Vashya', nameHi:'वश्य', nameSkt:'Vaśya',
    max:2, score: vashyaScore, dosha: false,
    basis:'Moon signs (rashis)',
    detail:`A: ${VASHYA_LABELS[vasA]} group (${RASHI_NAMES[A.moonRashi]}). B: ${VASHYA_LABELS[vasB]} group (${RASHI_NAMES[B.moonRashi]}). ${vasA === vasB ? 'Same group — mutual pull and attraction.' : vasAcontrolsB ? 'A has natural influence over B.' : vasBcontrolsA ? 'B has natural influence over A.' : 'Different groups — no inherent attraction pull.'}`,
    statusLabel: vashyaScore === 2 ? 'Mutual' : vashyaScore === 1 ? 'One-way' : 'None',
  });

  // ── 3. Tara (3 pts) ─────────────────────────────────────────────────────────
  const tara1 = ((B.moonNak - A.moonNak + 27) % 27) + 1; // B from A
  const tara2 = ((A.moonNak - B.moonNak + 27) % 27) + 1; // A from B
  const taraPos1 = ((tara1 - 1) % 9) + 1; // 1-9 Tara
  const taraPos2 = ((tara2 - 1) % 9) + 1;
  const TARA_NAMES = ['','Janma','Sampat','Vipat','Kshema','Pratyak','Sadhana','Naidhana','Mitra','Paramamitra'];
  const TARA_FRIENDLY = new Set([2,4,6,8,9]); // Sampat, Kshema, Sadhana, Mitra, Paramamitra
  const t1Good = TARA_FRIENDLY.has(taraPos1);
  const t2Good = TARA_FRIENDLY.has(taraPos2);
  const taraScore = t1Good && t2Good ? 3 : (t1Good || t2Good) ? 1 : 0;
  kutas.push({
    name:'Tara', nameHi:'तारा', nameSkt:'Tārā',
    max:3, score: taraScore, dosha: taraScore === 0,
    basis:'Moon nakshatras',
    detail:`A→B: ${TARA_NAMES[taraPos1]} (${t1Good ? 'Favorable' : 'Unfavorable'}). B→A: ${TARA_NAMES[taraPos2]} (${t2Good ? 'Favorable' : 'Unfavorable'}). Tara indicates health, well-being, and success after marriage. Both directions must be favorable for full points.`,
    statusLabel: taraScore === 3 ? 'Both Favorable' : taraScore === 1 ? 'One Favorable' : 'Unfavorable',
  });

  // ── 4. Yoni (4 pts) ─────────────────────────────────────────────────────────
  const yA = YONI[A.moonNak];
  const yB = YONI[B.moonNak];
  const isEnemy = YONI_ENEMIES.some(([x,y]) => (x===yA&&y===yB)||(x===yB&&y===yA));
  const isSame  = yA === yB;
  const yoniScore = isSame ? 4 : isEnemy ? 0 : 2;
  kutas.push({
    name:'Yoni', nameHi:'योनि', nameSkt:'Yoni',
    max:4, score: yoniScore, dosha: isEnemy,
    doshaName: isEnemy ? 'Yoni Dosha' : undefined,
    basis:'Moon nakshatras',
    detail:`A: ${YONI_LABELS[yA]} (${NAKSHATRA_NAMES[A.moonNak]}). B: ${YONI_LABELS[yB]} (${NAKSHATRA_NAMES[B.moonNak]}). ${isSame ? 'Same animal — deep physical and temperamental compatibility.' : isEnemy ? 'Enemy animals — natural friction in intimate connection and temperament.' : 'Neutral animals — workable compatibility with effort.'}`,
    statusLabel: isSame ? 'Same Animal' : isEnemy ? 'Enemy Animals' : 'Neutral',
  });

  // ── 5. Graha Maitri (5 pts) ─────────────────────────────────────────────────
  const lordA = RASHI_LORDS[A.moonRashi];
  const lordB = RASHI_LORDS[B.moonRashi];
  const friendAB = FRIENDSHIP[lordA]?.[lordB] ?? 1;
  const friendBA = FRIENDSHIP[lordB]?.[lordA] ?? 1;
  const gmScore = friendAB === 2 && friendBA === 2 ? 5
    : (friendAB === 2 && friendBA === 1) || (friendAB === 1 && friendBA === 2) ? 4
    : friendAB === 1 && friendBA === 1 ? 3
    : (friendAB === 2 && friendBA === 0) || (friendAB === 0 && friendBA === 2) ? 1
    : 0;
  const FRIEND_LABELS: Record<number,string> = { 2:'Friend', 1:'Neutral', 0:'Enemy' };
  kutas.push({
    name:'Graha Maitri', nameHi:'ग्रह मैत्री', nameSkt:'Grahā Maitri',
    max:5, score: gmScore, dosha: gmScore === 0,
    basis:'Moon sign lords',
    detail:`A's Moon lord: ${PLANET_SYMBOLS[lordA]??''} ${lordA} (${RASHI_NAMES[A.moonRashi]}). B's Moon lord: ${PLANET_SYMBOLS[lordB]??''} ${lordB} (${RASHI_NAMES[B.moonRashi]}). A→B: ${FRIEND_LABELS[friendAB]}, B→A: ${FRIEND_LABELS[friendBA]}. Measures mental friendship and intellectual harmony.`,
    statusLabel: gmScore >= 4 ? 'Friends' : gmScore === 3 ? 'Neutral' : gmScore > 0 ? 'Mixed' : 'Enemies',
  });

  // ── 6. Gana (6 pts) ─────────────────────────────────────────────────────────
  const ganA = GANA[A.moonNak];
  const ganB = GANA[B.moonNak];
  const ganaSame = ganA === ganB;
  const ganaFriendly = (ganA === 0 && ganB === 1) || (ganA === 1 && ganB === 0);
  const ganaScore = ganaSame ? 6 : ganaFriendly ? 5 : 0;
  kutas.push({
    name:'Gana', nameHi:'गण', nameSkt:'Gaṇa',
    max:6, score: ganaScore, dosha: ganaScore === 0 && !ganaSame,
    doshaName: ganaScore === 0 ? 'Gana Dosha' : undefined,
    basis:'Moon nakshatras',
    detail:`A: ${GANA_LABELS[ganA]} (${NAKSHATRA_NAMES[A.moonNak]}). B: ${GANA_LABELS[ganB]} (${NAKSHATRA_NAMES[B.moonNak]}). ${ganaSame ? 'Same Gana — deeply aligned temperaments and outlook on life.' : ganaFriendly ? 'Deva and Manushya — generally compatible with small differences.' : 'Incompatible Ganas — fundamentally different temperaments. Significant adjustments required.'}`,
    statusLabel: ganaSame ? 'Same Gana' : ganaFriendly ? 'Compatible' : 'Incompatible',
  });

  // ── 7. Bhakoot (7 pts) ──────────────────────────────────────────────────────
  const diff1 = ((B.moonRashi - A.moonRashi + 12) % 12) + 1; // A→B (1-12)
  const diff2 = ((A.moonRashi - B.moonRashi + 12) % 12) + 1; // B→A (1-12)
  const pair = [diff1, diff2].sort((a,b) => a-b);
  const bhakootDosha = (pair[0] === 2 && pair[1] === 12) || (pair[0] === 6 && pair[1] === 8);
  const bhakootScore = bhakootDosha ? 0 : 7;
  kutas.push({
    name:'Bhakoot', nameHi:'भकूट', nameSkt:'Bhakūṭa',
    max:7, score: bhakootScore, dosha: bhakootDosha,
    doshaName: bhakootDosha ? 'Bhakoot Dosha' : undefined,
    basis:'Moon signs (rashis)',
    detail:`A: ${RASHI_NAMES[A.moonRashi]}, B: ${RASHI_NAMES[B.moonRashi]}. Relationship: ${RASHI_NAMES[A.moonRashi]} is ${diff1}th from ${RASHI_NAMES[B.moonRashi]} and ${diff2}th from ${RASHI_NAMES[A.moonRashi]}. ${bhakootDosha ? 'Bhakoot Dosha present (2/12 or 6/8 axis) — may cause health, financial, or progeny challenges.' : 'No Bhakoot Dosha — healthy sign relationship. Supports long-term stability.'}`,
    statusLabel: bhakootDosha ? 'Dosha' : 'Compatible',
  });

  // ── 8. Nadi (8 pts) ─────────────────────────────────────────────────────────
  const nadA = NADI[A.moonNak];
  const nadB = NADI[B.moonNak];
  const nadiSame = nadA === nadB;
  const nadiScore = nadiSame ? 0 : 8;
  kutas.push({
    name:'Nadi', nameHi:'नाड़ी', nameSkt:'Nāḍī',
    max:8, score: nadiScore, dosha: nadiSame,
    doshaName: nadiSame ? 'Nadi Dosha' : undefined,
    basis:'Moon nakshatras',
    detail:`A: ${NADI_LABELS[nadA]} (${NAKSHATRA_NAMES[A.moonNak]}). B: ${NADI_LABELS[nadB]} (${NAKSHATRA_NAMES[B.moonNak]}). ${nadiSame ? 'Nadi Dosha! Same Nadi indicates health concerns for both partners and challenges with progeny. The most important dosha in Ashta Koota.' : 'Different Nadis — excellent. Indicates complementary physical constitutions and healthy progeny potential.'}`,
    statusLabel: nadiSame ? 'NADI DOSHA' : 'Clear',
  });

  return kutas;
}

// ─── Deep-match analysis ────────────────────────────────────────────────────────

interface DeepMatchItem {
  label:   string;
  icon:    string;
  value:   string;
  status:  'excellent' | 'good' | 'neutral' | 'caution';
  detail:  string;
}

function computeDeepMatch(A: ChartProfile, B: ChartProfile): DeepMatchItem[] {
  const items: DeepMatchItem[] = [];

  // 1. Atmakaraka friendship
  const akA = A.atmakaraka, akB = B.atmakaraka;
  const akFriend = FRIENDSHIP[akA]?.[akB] ?? 1;
  const akFriend2 = FRIENDSHIP[akB]?.[akA] ?? 1;
  const akStatus = akA === akB ? 'excellent' : akFriend === 2 && akFriend2 === 2 ? 'excellent' : akFriend >= 1 && akFriend2 >= 1 ? 'good' : 'caution';
  items.push({
    label:'Atmakaraka Compatibility', icon:'🪬',
    value: akA === akB ? `Both ${akA} — Rare soul resonance` : `${PLANET_SYMBOLS[akA]??''}${akA} ↔ ${PLANET_SYMBOLS[akB]??''}${akB}`,
    status: akStatus,
    detail: akA === akB
      ? `Both souls are governed by the same planet (${akA}). This indicates a very rare and deep soul-level resonance — the couple share the same primary karmic purpose and will naturally support each other's spiritual evolution.`
      : `A's Atmakaraka (${akA}) and B's Atmakaraka (${akB}) are ${akFriend === 2 ? 'friends' : akFriend === 1 ? 'neutral' : 'inimical'} in both directions. ${akStatus === 'excellent' ? 'Soul purposes are complementary.' : akStatus === 'good' ? 'Soul purposes can coexist with understanding.' : 'Divergent soul purposes may create a sense of being fundamentally different.'}`,
  });

  // 2. 7th lord synastry
  if (A.sevenLordRashi !== null && B.sevenLordRashi !== null) {
    const sevenA = A.sevenLordRashi;
    const sevenB = B.sevenLordRashi;
    // 7th lord of A in B's lagna or Moon or trine to it
    const inBLagna     = sevenA === B.lagnaRashi;
    const inBMoon      = sevenA === B.moonRashi;
    const inBTrineL    = (sevenA - B.lagnaRashi + 12) % 12 === 4 || (sevenA - B.lagnaRashi + 12) % 12 === 8;
    const sevenBgood   = sevenB === A.lagnaRashi || sevenB === A.moonRashi || (sevenB - A.lagnaRashi + 12) % 12 === 4;
    const sevenStatus  = (inBLagna || inBMoon) && (sevenBgood) ? 'excellent' : (inBLagna || inBMoon || inBTrineL || sevenBgood) ? 'good' : 'neutral';
    items.push({
      label:'7th Lord Synastry', icon:'💍',
      value:`A's 7th lord in ${RASHI_NAMES[sevenA]} · B's 7th lord in ${RASHI_NAMES[sevenB]}`,
      status: sevenStatus,
      detail:`A's 7th lord lands in ${RASHI_NAMES[sevenA]}${inBLagna ? ' (B\'s Lagna — strong marriage indicator)' : inBMoon ? ' (B\'s Moon — emotional resonance)' : inBTrineL ? ' (trine to B\'s Lagna — supportive)' : ''}. B's 7th lord in ${RASHI_NAMES[sevenB]}${sevenBgood ? ' (favorable to A\'s chart)' : ' (no direct contact with A\'s key points)'}. Mutual 7th lord placement is a primary indicator of marriage compatibility.`,
    });
  }

  // 3. Upapada (Jaimini marriage indicator)
  if (A.upapadaRashi !== null || B.upapadaRashi !== null) {
    const upA = A.upapadaRashi;
    const upB = B.upapadaRashi;
    const upAtoB = upA !== null && (upA === B.moonRashi || upA === B.lagnaRashi || (upA - B.lagnaRashi + 12) % 12 === 6);
    const upBtoA = upB !== null && (upB === A.moonRashi || upB === A.lagnaRashi || (upB - A.lagnaRashi + 12) % 12 === 6);
    const upStatus = upAtoB && upBtoA ? 'excellent' : (upAtoB || upBtoA) ? 'good' : 'neutral';
    items.push({
      label:'Upapada Lagna (Jaimini)', icon:'🗺',
      value: [upA !== null ? `A's UL: ${RASHI_NAMES[upA]}` : '', upB !== null ? `B's UL: ${RASHI_NAMES[upB]}` : ''].filter(Boolean).join(' · ') || 'Not computed',
      status: upStatus,
      detail:`Upapada Lagna is the Jaimini indicator of the spouse's nature and the outer image of marriage. ${upAtoB ? `A's Upapada contacts B's key points (Moon/Lagna) — A sees B as their destined partner.` : `A's Upapada does not directly contact B's key points.`} ${upBtoA ? `B's Upapada contacts A's chart — B has a strong karmic pull toward A.` : ''}`,
    });
  }

  // 4. Dasha harmony
  const mdA = A.dashaMD, mdB = B.dashaMD;
  const mdFriend = FRIENDSHIP[mdA]?.[mdB] ?? 1;
  const mdFriend2 = FRIENDSHIP[mdB]?.[mdA] ?? 1;
  const isSameMD  = mdA === mdB;
  const mdStatus  = isSameMD ? 'excellent' : mdFriend === 2 && mdFriend2 === 2 ? 'excellent' : mdFriend >= 1 && mdFriend2 >= 1 ? 'good' : 'caution';
  items.push({
    label:'Current Dasha Harmony', icon:'⏳',
    value: `A: ${PLANET_SYMBOLS[mdA]??''}${mdA} MD · B: ${PLANET_SYMBOLS[mdB]??''}${mdB} MD`,
    status: mdStatus,
    detail:`Both running Vimshottari Mahadashas are currently ${isSameMD ? 'identical — intensely aligned life phase' : mdFriend === 2 && mdFriend2 === 2 ? 'mutually friendly — excellent for building together now' : mdFriend >= 1 ? 'neutral-to-friendly — workable shared phase' : 'inimical — current life-phase directions may clash'}. Note: dasha harmony is time-bound and changes every few years.`,
  });

  // 5. Jupiter inter-chart aspect (B's Jupiter aspects A's Moon)
  const jupB = B.planets.find((p: any) => p.name === 'Jupiter');
  if (jupB) {
    const jupBRashi = jupB.rashiIndex;
    // Jupiter aspects 5th, 7th, 9th from itself (Jaimini adds sign aspects, but here classical)
    const aspectedRashis = [
      (jupBRashi + 4) % 12,  // 5th
      (jupBRashi + 6) % 12,  // 7th
      (jupBRashi + 8) % 12,  // 9th
      jupBRashi,             // 1st (conjunction)
    ];
    const jupAspectsMoonA = aspectedRashis.includes(A.moonRashi);
    const jupAspectsLagnaA = aspectedRashis.includes(A.lagnaRashi);
    const jupStatus = jupAspectsMoonA && jupAspectsLagnaA ? 'excellent' : jupAspectsMoonA || jupAspectsLagnaA ? 'good' : 'neutral';
    items.push({
      label:"B's Jupiter → A's Chart", icon:'♃',
      value: `B's Jupiter in ${RASHI_NAMES[jupBRashi]}`,
      status: jupStatus,
      detail: `B's Jupiter ${jupAspectsMoonA ? 'aspects A\'s Moon — highly protective, nurturing, and expansive for A\'s emotional life' : 'does not directly aspect A\'s Moon'}. ${jupAspectsLagnaA ? 'B\'s Jupiter also aspects A\'s Lagna — B brings wisdom and good fortune to A\'s overall life path.' : ''}${!jupAspectsMoonA && !jupAspectsLagnaA ? 'B\'s Jupiter does not directly aspect A\'s key points — the blessing energy must manifest through other channels.' : ''}`,
    });
  }

  return items;
}

// ─── Status colours ─────────────────────────────────────────────────────────────

const DEEP_STATUS_STYLE: Record<string,{ bg:string; border:string; color:string; icon:string }> = {
  excellent: { bg:'bg-emerald-500/10', border:'border-emerald-500/25', color:'text-emerald-300', icon:'✅' },
  good:      { bg:'bg-blue-500/10',    border:'border-blue-500/20',    color:'text-blue-300',    icon:'👍' },
  neutral:   { bg:'bg-white/[0.025]',  border:'border-white/10',       color:'text-slate-300',   icon:'➖' },
  caution:   { bg:'bg-amber-500/10',   border:'border-amber-500/20',   color:'text-amber-300',   icon:'⚠'  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseBirthDate(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min]  = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

async function resolveLocation(location: string): Promise<{ lat:number; lng:number }> {
  const geo = await searchLocation(location);
  return geo.length > 0 ? { lat: geo[0].lat, lng: geo[0].lon } : { lat: 28.6139, lng: 77.2090 };
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function KutaAccordion({ k }: { k: KutaResult }) {
  const [open, setOpen] = useState(false);
  const pct = (k.score / k.max) * 100;
  const barCol = k.dosha ? '#ef4444' : pct === 100 ? '#10b981' : pct >= 50 ? '#eab308' : '#f97316';

  return (
    <div className={`rounded-xl border overflow-hidden ${k.dosha ? 'border-red-500/30 bg-red-900/10' : 'border-white/10 bg-white/[0.025]'}`}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={() => setOpen(o => !o)}>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-white">{k.name}</span>
            <span className="text-[10px] text-slate-500">{k.nameHi}</span>
            {k.dosha && k.doshaName && (
              <span className="text-[9px] bg-red-500/20 border border-red-500/35 text-red-300 rounded-full px-2 font-bold">
                {k.doshaName}
              </span>
            )}
            <span className="ml-auto text-xs font-bold" style={{ color: barCol }}>
              {k.score}/{k.max}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor: barCol }} />
          </div>
          <p className="text-[9px] text-slate-500 mt-1">{k.statusLabel} · Based on {k.basis}</p>
        </div>
        <span className="text-slate-600 text-xs shrink-0 ml-3">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2">
          <p className="text-xs text-slate-300 leading-relaxed">{k.detail}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CompatibilityPanel() {
  type Tab = 'score' | 'kutas' | 'deep' | 'report';

  const [tab,      setTab]    = useState<Tab>('score');
  const [loading,  setLoading]= useState(false);
  const [error,    setError]  = useState<string | null>(null);

  const [edA, setEdA] = useState<EngineData | null>(null);
  const [edB, setEdB] = useState<EngineData | null>(null);
  const [profA, setProfA] = useState<ChartProfile | null>(null);
  const [profB, setProfB] = useState<ChartProfile | null>(null);
  const [labelA, setLabelA] = useState('');
  const [labelB, setLabelB] = useState('');
  const [kutas,  setKutas]  = useState<KutaResult[] | null>(null);
  const [deepMatch, setDeepMatch] = useState<DeepMatchItem[] | null>(null);

  // Two-form state
  const [formA, setFormA] = useState<{ date:string; time:string; location:string } | null>(null);
  const [formB, setFormB] = useState<{ date:string; time:string; location:string } | null>(null);
  const [step, setStep]   = useState<'A' | 'B' | 'done'>('A');

  function handleFormA(f: { date:string; time:string; location:string }) {
    setFormA(f);
    setLabelA(`${f.location} · ${f.date} ${f.time}`);
    setStep('B');
  }

  async function handleFormB(f: { date:string; time:string; location:string }) {
    if (!formA) return;
    setFormB(f);
    setLabelB(`${f.location} · ${f.date} ${f.time}`);
    setLoading(true);
    setError(null);
    try {
      const [geoA, geoB] = await Promise.all([
        resolveLocation(formA.location),
        resolveLocation(f.location),
      ]);
      const [bdA, bdB] = [parseBirthDate(formA.date, formA.time), parseBirthDate(f.date, f.time)];
      const [dataA, dataB] = [assembleEngineData(bdA, geoA.lat, geoA.lng), assembleEngineData(bdB, geoB.lat, geoB.lng)];
      const pA = extractProfile(dataA);
      const pB = extractProfile(dataB);
      setEdA(dataA); setEdB(dataB);
      setProfA(pA); setProfB(pB);
      setKutas(computeKutas(pA, pB));
      setDeepMatch(computeDeepMatch(pA, pB));
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Computation failed');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep('A'); setFormA(null); setFormB(null);
    setEdA(null); setEdB(null); setProfA(null); setProfB(null);
    setKutas(null); setDeepMatch(null); setError(null);
  }

  // ── Birth input gate ─────────────────────────────────────────────────────────

  if (step !== 'done' || !kutas || !profA || !profB) {
    return (
      <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f]">
        <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-[#111722]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💑</span>
            <h2 className="text-base font-bold text-white">Kundali Matching — Ashta Koota</h2>
          </div>
          <p className="text-xs text-slate-400">
            36-point Ashta Koota · Atmakaraka compatibility · 7th lord synastry ·
            Upapada · Dasha harmony. Enter two birth charts.
          </p>
        </div>
        <div className="p-5 bg-[#0d1118] space-y-4">
          {/* Progress steps */}
          <div className="flex items-center gap-2">
            {['Person A','Person B','Result'].map((label, i) => {
              const done = (i === 0 && (step === 'B' || step === 'done')) || (i === 1 && step === 'done');
              const active = (i === 0 && step === 'A') || (i === 1 && step === 'B');
              return (
                <div key={i} className="flex items-center gap-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${done ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300' : active ? 'bg-amber-500/25 border-amber-500/50 text-amber-300' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                    {done ? '✓' : i+1}
                  </div>
                  <span className={`text-[10px] ${active ? 'text-amber-400' : done ? 'text-emerald-400' : 'text-slate-600'}`}>{label}</span>
                  {i < 2 && <span className="text-slate-700 mx-1">→</span>}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 p-3 text-xs">
              <span className="font-bold">Error: </span>{error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
              <div className="animate-spin h-10 w-10 border-t-2 border-amber-500 border-solid rounded-full" />
              <p className="text-sm">Computing both charts + Ashta Koota…</p>
              <p className="text-xs text-slate-500">8 Kutas · AK match · 7th lord · Dasha harmony</p>
            </div>
          ) : (
            <>
              {step === 'A' && (
                <div>
                  <p className="text-xs font-semibold text-amber-500 mb-3">👤 Person A (typically the groom / first person)</p>
                  <EnhancedBirthInputForm lang="en" onSubmit={handleFormA} showAutoSave={false} showProgress={true} />
                </div>
              )}
              {step === 'B' && (
                <div>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-900/10 p-3 text-xs text-emerald-200/80 mb-3">
                    <span className="font-bold text-emerald-400">Person A set: </span>{labelA}
                    <button onClick={() => setStep('A')} className="ml-2 text-slate-400 hover:text-amber-400 transition-colors">Edit</button>
                  </div>
                  <p className="text-xs font-semibold text-amber-500 mb-3">👤 Person B (typically the bride / second person)</p>
                  <EnhancedBirthInputForm lang="en" onSubmit={handleFormB} showAutoSave={false} showProgress={true} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────────

  const totalScore = kutas.reduce((s, k) => s + k.score, 0);
  const doshas     = kutas.filter(k => k.dosha);
  const verdict =
    totalScore >= 28 ? { label:'Excellent Match',   color:'text-emerald-400', sub:'Strong compatibility across most dimensions. Auspicious for marriage.' } :
    totalScore >= 21 ? { label:'Good Match',         color:'text-green-400',   sub:'Above average compatibility. Minor areas need adjustment.' } :
    totalScore >= 18 ? { label:'Average Match',      color:'text-yellow-400',  sub:'Marginal compatibility. Requires significant mutual commitment.' } :
    totalScore >= 12 ? { label:'Below Average',      color:'text-orange-400',  sub:'Several incompatibilities. Deep counselling recommended.' } :
                       { label:'Challenging Match',  color:'text-red-400',     sub:'Low compatibility score. Careful consideration strongly advised.' };

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id:'score',  icon:'📊', label:'Score'     },
    { id:'kutas',  icon:'🪬', label:'8 Kutas'   },
    { id:'deep',   icon:'🔭', label:'Deep Match' },
    { id:'report', icon:'📜', label:'Report'    },
  ];

  // Report synthesis
  const strengths = kutas.filter(k => k.score === k.max).map(k => k.name);
  const gaps      = kutas.filter(k => k.score < k.max / 2).map(k => k.name);

  return (
    <div className="glow-card overflow-hidden shadow-lg border border-white/10 bg-[#090b0f] text-left">

      {/* Header */}
      <div className="px-5 pt-5 pb-0 border-b border-white/10 bg-[#111722]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">💑</span>
          <h2 className="text-base font-bold text-white">Kundali Matching</h2>
          <button onClick={reset} className="ml-auto text-[10px] text-slate-500 hover:text-amber-400 border border-white/10 hover:border-amber-500/40 rounded px-2 py-0.5 transition-all">
            ↩ New Match
          </button>
        </div>
        <div className="flex items-start gap-3 mb-3 text-[10px] text-slate-400">
          <span className="shrink-0 text-slate-500">A:</span><span className="flex-1">{labelA}</span>
          <span className="text-slate-600">·</span>
          <span className="shrink-0 text-slate-500">B:</span><span className="flex-1">{labelB}</span>
        </div>

        {/* Score strip */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={totalScore >= 28 ? '#10b981' : totalScore >= 18 ? '#eab308' : '#ef4444'}
                strokeWidth="3" strokeDasharray={`${(totalScore/36)*100} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-sm font-bold text-white leading-none">{totalScore}</span>
              <span className="text-[7px] text-slate-500">/36</span>
            </div>
          </div>
          <div>
            <p className={`text-base font-bold ${verdict.color}`}>{verdict.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{verdict.sub}</p>
            {doshas.length > 0 && (
              <p className="text-[9px] text-red-400 mt-0.5">
                {doshas.length} dosha{doshas.length > 1 ? 's' : ''}: {doshas.map(d => d.doshaName ?? d.name).join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
          {TABS.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-all ${
                tab === id ? 'border-b-2 border-amber-500 text-amber-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 max-h-[640px] overflow-y-auto bg-[#0d1118]">

        {/* ══ SCORE ══ */}
        {tab === 'score' && (
          <div className="space-y-4">
            {/* Dosha alert */}
            {doshas.length > 0 && (
              <div className="rounded-lg border border-red-500/30 bg-red-900/15 p-3 text-xs leading-relaxed">
                <p className="font-bold text-red-400 mb-1">⚠ {doshas.length} Dosha{doshas.length > 1 ? 's' : ''} Detected</p>
                {doshas.map(d => (
                  <p key={d.name} className="text-red-200/80">
                    <span className="font-semibold">{d.doshaName ?? d.name}: </span>{d.detail}
                  </p>
                ))}
              </div>
            )}

            {/* Kuta mini-bars */}
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">8 Kuta Breakdown</p>
              <div className="space-y-2.5">
                {kutas.map((k, i) => {
                  const pct = (k.score / k.max) * 100;
                  const barCol = k.dosha ? '#ef4444' : pct === 100 ? '#10b981' : pct >= 50 ? '#eab308' : '#f97316';
                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{k.name} <span className="text-slate-500 text-[10px]">({k.nameHi})</span></span>
                        <span className="font-bold tabular-nums" style={{ color: barCol }}>{k.score}/{k.max}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, backgroundColor: barCol }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-white/10 mt-4 pt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total</span>
                <span className={`text-lg font-bold ${verdict.color}`}>{totalScore} / 36</span>
              </div>
            </div>

            {/* Moon summary */}
            <div className="grid grid-cols-2 gap-2">
              {[{ label:'Person A', pf:profA }, { label:'Person B', pf:profB }].map(({ label, pf }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-2">{label}</p>
                  <p className="text-xs font-bold text-white">{RASHI_SYMBOLS[pf.moonRashi]} {RASHI_NAMES[pf.moonRashi]}</p>
                  <p className="text-[10px] text-slate-400">{NAKSHATRA_NAMES[pf.moonNak]}</p>
                  <p className="text-[10px] text-slate-500">{NAKSHATRA_NAMES_HI[pf.moonNak]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ KUTAS ══ */}
        {tab === 'kutas' && (
          <div className="space-y-2">
            <div className="rounded-lg border border-amber-500/20 bg-amber-900/10 p-3 text-xs text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-400">Ashta Koota — </span>
              The classical 8-point compatibility system from Parashara's Hora Shastra.
              Total 36 points. 18+ required for marriage consideration. 28+ is considered excellent.
              Nadi Dosha (8 pts) and Bhakoot Dosha (7 pts) are the two most significant doshas.
            </div>
            {kutas.map((k, i) => <KutaAccordion key={i} k={k} />)}
          </div>
        )}

        {/* ══ DEEP MATCH ══ */}
        {tab === 'deep' && deepMatch && (
          <div className="space-y-3">
            <div className="rounded-lg border border-blue-500/20 bg-blue-900/10 p-3 text-xs text-blue-200/80 leading-relaxed">
              <span className="font-bold text-blue-400">Beyond the Kutas — </span>
              Ashta Koota measures Moon compatibility. These four deeper layers examine soul purpose
              (Atmakaraka), marriage significators (7th lord, Upapada), current life timing (Dasha),
              and inter-chart planetary blessings. They often override a borderline Kuta score.
            </div>
            {deepMatch.map((item, i) => {
              const st = DEEP_STATUS_STYLE[item.status];
              const [expanded, setExpanded] = [false, () => {}]; // use inline state below
              return <DeepMatchCard key={i} item={item} />;
            })}
          </div>
        )}

        {/* ══ REPORT ══ */}
        {tab === 'report' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/15 to-amber-800/5 p-5">
              <p className="text-[9px] text-amber-500/70 uppercase tracking-wide mb-3 tracking-widest">Synthesis Report</p>
              <p className="text-sm text-amber-100/90 font-semibold mb-3">{verdict.label} — {totalScore}/36 Kuta Points</p>

              {/* Strengths */}
              {strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-emerald-400 mb-1">✅ Full Scores</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The match achieves perfect scores in {strengths.join(', ')} —
                    indicating {strengths.includes('Nadi') ? 'complementary biological constitutions and healthy progeny potential, ' : ''}
                    {strengths.includes('Gana') ? 'deeply aligned temperaments, ' : ''}
                    {strengths.includes('Graha Maitri') ? 'mutual intellectual friendship between Moon sign lords, ' : ''}
                    {strengths.includes('Vashya') ? 'natural mutual attraction and influence, ' : ''}
                    a solid classical foundation for life partnership.
                  </p>
                </div>
              )}

              {/* Doshas */}
              {doshas.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-red-400 mb-1">⚠ Doshas Present</p>
                  {doshas.map(d => (
                    <p key={d.name} className="text-xs text-slate-300 leading-relaxed mb-1">
                      <span className="font-semibold text-red-300">{d.doshaName ?? d.name}: </span>
                      {d.name === 'Nadi' ? 'This is the most significant dosha in Ashta Koota. Nadi Dosha can cause health challenges and difficulties with progeny. However, it is considered cancelled if both have the same Nadi lord, the Moon signs are the same, or the Lagna sign is different from the Moon sign for both.' : ''}
                      {d.name === 'Bhakoot' ? 'Bhakoot Dosha is cancelled if the Lords of both Moon signs are friends or if they share the same lord.' : ''}
                      {d.name === 'Gana' ? 'Gana Dosha is somewhat mitigated if both share the same Gana lord or the Moon nakshatra padas are compatible.' : ''}
                    </p>
                  ))}
                </div>
              )}

              {/* Gaps */}
              {gaps.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-orange-400 mb-1">⚡ Areas Needing Awareness</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Lower scores in {gaps.join(', ')} suggest areas where this partnership will require
                    conscious effort, clear communication, and mutual respect for differences.
                    These are not barriers — they are the curriculum this relationship offers.
                  </p>
                </div>
              )}

              {/* Optimal timing */}
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs font-bold text-blue-400 mb-1">📅 Timing Consideration</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For any marriage, the optimal muhurta (auspicious timing) should consider:
                  Jupiter transiting a kendra or trikona from both natal Moons simultaneously,
                  Venus direct and not in combustion, Moon in an auspicious nakshatra (Rohini,
                  Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Mula,
                  Uttara Ashadha, Uttara Bhadrapada, Revati), and both running a benefic Mahadasha.
                </p>
              </div>

              {/* Bottom line */}
              <div className="border-t border-white/10 pt-3 mt-3">
                <p className="text-xs font-bold text-amber-400 mb-1">📋 Bottom Line</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {totalScore >= 28
                    ? `With ${totalScore}/36 points and ${doshas.length === 0 ? 'no doshas' : `${doshas.length} manageable dosha(s)`}, this is a classically auspicious match. The Vedic tradition considers ${totalScore >= 32 ? 'this combination rare and highly fortuitous' : 'this a strong, well-suited partnership'}. Proceed with confidence.`
                    : totalScore >= 21
                    ? `A score of ${totalScore}/36 is above average — a workable partnership with areas that need conscious cultivation. ${doshas.length > 0 ? 'The doshas present should be discussed with a qualified astrologer for cancellation conditions.' : 'The absence of major doshas is a positive sign.'} Love, respect, and shared values will carry this relationship well.`
                    : totalScore >= 18
                    ? `At ${totalScore}/36, this match sits at the marginal zone. Classical texts require 18+ for consideration. ${doshas.length > 0 ? 'The doshas heighten the need for careful evaluation.' : ''} The couple should weigh compatibility on practical, emotional, and family dimensions alongside the Kuta score. Strong mutual commitment and possibly remediation measures are advised.`
                    : `A score of ${totalScore}/36 falls below the classical minimum of 18. This does not mean marriage is impossible — many successful marriages exist with lower Kuta scores — but it indicates significant temperamental and karmic differences. The couple should seek comprehensive astrological counselling, discuss the deep-match factors carefully, and make a fully informed decision.`
                  }
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-[10px] text-slate-600 leading-relaxed">
              This report is generated from classical Vedic astrology principles (Parashara Hora Shastra, Muhurta Chintamani). It is a tool for reflection and discussion — not a deterministic verdict. The quality of a marriage depends ultimately on the character, commitment, and choices of both individuals.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Deep Match card (extracted to allow local state) ──────────────────────────

function DeepMatchCard({ item }: { item: DeepMatchItem }) {
  const [expanded, setExpanded] = useState(false);
  const st = DEEP_STATUS_STYLE[item.status];
  return (
    <div className={`rounded-xl border overflow-hidden ${st.bg} ${st.border}`}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={() => setExpanded(e => !e)}>
        <span className="text-lg shrink-0">{item.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white">{item.label}</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${st.color} ${st.border} ${st.bg}`}>
              {st.icon} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{item.value}</p>
        </div>
        <span className="text-slate-600 text-xs shrink-0">{expanded ? '▾' : '▸'}</span>
      </button>
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-3 pt-2">
          <p className="text-xs text-slate-300 leading-relaxed">{item.detail}</p>
        </div>
      )}
    </div>
  );
}
