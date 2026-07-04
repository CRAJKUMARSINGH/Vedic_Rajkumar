/**
 * Kundli Milan — Ashtakuta Matching System
 * Classical 36-point compatibility analysis based on Moon Nakshatra
 * Sources: Brihat Parashara Hora Shastra, Muhurta Chintamani
 */

import {
  buildChart, calcVimshottariDashas, getNavamsaRashi,
  RASHI_NAMES_EN, NAKSHATRAS,
  type ChartData, type PlanetPosition
} from "./vedicEngine";
import type { JatakInput } from "./mtssEngine";

// ─── Nakshatra attribute tables ─────────────────────────────────────────────

// Gana (Nature): 0=Deva, 1=Manushya, 2=Rakshasa
const GANA: Record<number, 0|1|2> = {
  1:0,  // Ashwini - Deva
  2:1,  // Bharani - Manushya
  3:2,  // Krittika - Rakshasa
  4:1,  // Rohini - Manushya
  5:0,  // Mrigashira - Deva
  6:2,  // Ardra - Rakshasa
  7:0,  // Punarvasu - Deva
  8:0,  // Pushya - Deva
  9:2,  // Ashlesha - Rakshasa
  10:2, // Magha - Rakshasa
  11:1, // Purva Phalguni - Manushya
  12:1, // Uttara Phalguni - Manushya
  13:0, // Hasta - Deva
  14:2, // Chitra - Rakshasa
  15:0, // Swati - Deva
  16:2, // Vishakha - Rakshasa
  17:0, // Anuradha - Deva
  18:2, // Jyeshtha - Rakshasa
  19:2, // Mula - Rakshasa
  20:1, // Purva Ashadha - Manushya
  21:1, // Uttara Ashadha - Manushya
  22:0, // Shravana - Deva
  23:2, // Dhanishta - Rakshasa (some texts say Manushya)
  24:2, // Shatabhisha - Rakshasa
  25:1, // Purva Bhadrapada - Manushya
  26:0, // Uttara Bhadrapada - Deva
  27:0, // Revati - Deva
};
const GANA_NAMES = ["Deva","Manushya","Rakshasa"];

// Nadi: 0=Adi, 1=Madhya, 2=Antya
const NADI: Record<number, 0|1|2> = {
  1:0,  // Ashwini
  2:1,  // Bharani
  3:2,  // Krittika
  4:2,  // Rohini
  5:1,  // Mrigashira
  6:0,  // Ardra
  7:0,  // Punarvasu
  8:1,  // Pushya
  9:2,  // Ashlesha
  10:2, // Magha
  11:1, // Purva Phalguni
  12:0, // Uttara Phalguni
  13:0, // Hasta
  14:1, // Chitra
  15:2, // Swati
  16:2, // Vishakha
  17:1, // Anuradha
  18:0, // Jyeshtha
  19:0, // Mula
  20:1, // Purva Ashadha
  21:2, // Uttara Ashadha
  22:2, // Shravana
  23:1, // Dhanishta
  24:0, // Shatabhisha
  25:0, // Purva Bhadrapada
  26:1, // Uttara Bhadrapada
  27:2, // Revati
};
const NADI_NAMES = ["Adi","Madhya","Antya"];

// Yoni (Animal): 12 pairs
const YONI: Record<number, number> = {
  1:1,   // Ashwini - Horse
  2:13,  // Bharani - Elephant
  3:14,  // Krittika - Goat
  4:7,   // Rohini - Serpent
  5:6,   // Mrigashira - Dog (some texts: Serpent)
  6:2,   // Ardra - Dog
  7:3,   // Punarvasu - Cat
  8:4,   // Pushya - Goat (Ram)
  9:5,   // Ashlesha - Cat
  10:8,  // Magha - Rat
  11:9,  // Purva Phalguni - Rat
  12:10, // Uttara Phalguni - Cow
  13:11, // Hasta - Buffalo
  14:12, // Chitra - Tiger
  15:3,  // Swati - Buffalo
  16:1,  // Vishakha - Tiger
  17:4,  // Anuradha - Deer/Hare
  18:6,  // Jyeshtha - Deer/Hare
  19:2,  // Mula - Dog
  20:5,  // Purva Ashadha - Monkey
  21:7,  // Uttara Ashadha - Mongoose
  22:8,  // Shravana - Monkey
  23:9,  // Dhanishta - Lion
  24:10, // Shatabhisha - Horse
  25:11, // Purva Bhadrapada - Lion
  26:12, // Uttara Bhadrapada - Cow
  27:13, // Revati - Elephant
};
const YONI_NAMES: Record<number,string> = {
  1:"Horse",2:"Dog",3:"Cat",4:"Goat/Ram",5:"Monkey",6:"Deer",
  7:"Serpent",8:"Rat",9:"Rat",10:"Cow",11:"Buffalo",12:"Tiger",
  13:"Elephant",14:"Goat"
};
// Enemy yoni pairs (same yoni = 4, friend = 3, neutral = 2, enemy = 1, same-enemy = 0)
const YONI_ENEMIES: Record<number,number> = {1:2,2:1,3:5,4:14,5:3,6:7,7:6,8:9,9:8,10:11,11:10,12:13,13:12,14:4};

// Varna: 0=Brahmin, 1=Kshatriya, 2=Vaishya, 3=Shudra
const VARNA_BY_RASHI: number[] = [1,2,2,0,1,2,3,1,1,2,3,0]; // 0=Aries..11=Pisces
// Actually proper mapping:
// Brahmana: Cancer(3), Scorpio(7), Pisces(11)
// Kshatriya: Aries(0), Leo(4), Sagittarius(8)
// Vaishya: Taurus(1), Virgo(5), Capricorn(9)
// Shudra: Gemini(2), Libra(6), Aquarius(10)
const VARNA_MAP: number[] = [1,2,3,0,1,2,3,0,1,2,3,0];
const VARNA_NAMES = ["Brahmin","Kshatriya","Vaishya","Shudra"];

// Vashya groups
const VASHYA_GROUP: Record<number,number> = {
  0:1,1:3,2:2,3:4,4:1,5:3,6:2,7:4,8:2,9:3,10:5,11:4
  // Aries->Kshatriya (manav), Taurus->Chatushpad, Gemini->Nara, Cancer->Jalchar...
};

// Tara: Count nakshatras from groom to bride, divide by 9. Auspicious if 2,4,6,8
function taraScore(fromNak: number, toNak: number): number {
  const count = ((toNak - fromNak + 27) % 27) + 1;
  const rem = count % 9;
  // 1=Janma, 2=Sampat, 3=Vipat, 4=Kshem, 5=Pratyari, 6=Sadhak, 7=Vadha, 8=Mitra, 9=Paramamitra
  const auspicious = [2, 4, 6, 8, 9].includes(rem);
  return auspicious ? 1.5 : 0;
}

// Graha Maitri: friendship between Moon sign lords
const PLANET_FRIENDS: Record<string,string[]> = {
  Sun:    ["Moon","Mars","Jupiter"],
  Moon:   ["Sun","Mercury"],
  Mars:   ["Sun","Moon","Jupiter"],
  Mercury:["Sun","Venus"],
  Jupiter:["Sun","Moon","Mars"],
  Venus:  ["Mercury","Saturn"],
  Saturn: ["Mercury","Venus"],
};
const PLANET_ENEMIES: Record<string,string[]> = {
  Sun:    ["Venus","Saturn"],
  Moon:   ["None"],
  Mars:   ["Mercury"],
  Mercury:["Moon"],
  Jupiter:["Mercury","Venus"],
  Venus:  ["Sun","Moon"],
  Saturn: ["Sun","Moon","Mars"],
};
const RASHI_LORDS_PLANETS = [
  "Mars","Venus","Mercury","Moon","Sun","Mercury",
  "Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"
];

function getRelationship(p1: string, p2: string): "Friend"|"Neutral"|"Enemy" {
  if (PLANET_FRIENDS[p1]?.includes(p2)) return "Friend";
  if (PLANET_ENEMIES[p1]?.includes(p2)) return "Enemy";
  return "Neutral";
}

function grahaMaitriScore(rashiM: number, rashiF: number): number {
  const lordM = RASHI_LORDS_PLANETS[rashiM];
  const lordF = RASHI_LORDS_PLANETS[rashiF];
  if (lordM === lordF) return 5;
  const rel1 = getRelationship(lordM, lordF);
  const rel2 = getRelationship(lordF, lordM);
  if (rel1 === "Friend" && rel2 === "Friend") return 5;
  if (rel1 === "Friend" && rel2 === "Neutral") return 4;
  if (rel1 === "Neutral" && rel2 === "Friend") return 4;
  if (rel1 === "Neutral" && rel2 === "Neutral") return 3;
  if (rel1 === "Friend" && rel2 === "Enemy") return 1;
  if (rel1 === "Enemy" && rel2 === "Friend") return 1;
  return 0;
}

// Bhakoot: Relative Moon rashi positions
function bhakootScore(rashiM: number, rashiF: number): number {
  const diff = ((rashiF - rashiM + 12) % 12) + 1;
  const badPositions = [6, 8, 12];  // 6th/8th/12th from each other
  const reverseDiff = 13 - diff;
  if (badPositions.includes(diff) || badPositions.includes(reverseDiff)) return 0;
  return 7;
}

// ─── Mangal Dosha cross-check ─────────────────────────────────────────────
function hasMangalDosha(chart: ChartData): boolean {
  const mars = chart.planets.find(p => p.name === "Mars");
  if (!mars) return false;
  return [1,2,4,7,8,12].includes(mars.house);
}

// ─── Navamsa D9 compatibility ─────────────────────────────────────────────
function d9Compatibility(chartM: ChartData, chartF: ChartData): {
  score: number; verdict: string; details: string[]
} {
  const venus = chartM.planets.find(p=>p.name==="Venus");
  const jupiter = chartF.planets.find(p=>p.name==="Jupiter");
  const details: string[] = [];
  let score = 50;

  if (venus) {
    const vD9 = getNavamsaRashi(venus.longitude);
    details.push(`Groom's Venus in D9: ${RASHI_NAMES_EN[vD9.rashi]}`);
    if ([1,4].includes(vD9.rashi)) { score+=10; details.push("✓ Venus in own/exalted D9 sign — marital joy indicated"); }
  }
  if (jupiter) {
    const jD9 = getNavamsaRashi(jupiter.longitude);
    details.push(`Bride's Jupiter in D9: ${RASHI_NAMES_EN[jD9.rashi]}`);
    if ([3].includes(jD9.rashi)) { score+=10; details.push("✓ Jupiter exalted in D9 Cancer — very auspicious for bride"); }
  }

  // 7th house lord compatibility
  const m7 = chartM.houseRashis[6];
  const f7 = chartF.houseRashis[6];
  const mLord = RASHI_LORDS_PLANETS[m7];
  const fLord = RASHI_LORDS_PLANETS[f7];
  const rel = getRelationship(mLord, fLord);
  details.push(`7th lords: ${mLord} (♂) vs ${fLord} (♀) — ${rel}`);
  if (rel === "Friend") { score+=15; details.push("✓ 7th lords are friendly — strong marital bond"); }
  else if (rel === "Enemy") { score-=10; details.push("⚠ 7th lords are enemies — tension in relationship"); }

  const verdict = score >= 70 ? "Excellent" : score >= 55 ? "Good" : score >= 40 ? "Average" : "Challenging";
  return { score: Math.max(10, Math.min(100, score)), verdict, details };
}

// ─── Main Ashtakuta result ────────────────────────────────────────────────
export interface KutaResult {
  name: string;
  maxPoints: number;
  scored: number;
  description: string;
  verdict: "Excellent" | "Good" | "Average" | "Poor";
  detail: string;
}

export interface MilanResult {
  male: JatakInput;
  female: JatakInput;
  maleChart: ChartData;
  femaleChart: ChartData;
  maleNakIdx: number;
  femaleNakIdx: number;
  maleMoonRashi: number;
  femaleMoonRashi: number;
  kutas: KutaResult[];
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  verdict: "Excellent" | "Very Good" | "Good" | "Average" | "Below Average" | "Not Recommended";
  mangalDoshaMale: boolean;
  mangalDoshaFemale: boolean;
  mangalDoshaCancelled: boolean;
  mangalDoshaNote: string;
  d9Compatibility: { score: number; verdict: string; details: string[] };
  recommendations: string[];
  warnings: string[];
}

export function computeMilan(male: JatakInput, female: JatakInput): MilanResult {
  const maleChart = buildChart(male.day,male.month,male.year,male.hour,male.minute,male.lat,male.lon,male.tz??5.5);
  const femaleChart = buildChart(female.day,female.month,female.year,female.hour,female.minute,female.lat,female.lon,female.tz??5.5);

  const maleMoon   = maleChart.planets.find(p=>p.name==="Moon");
  const femaleMoon = femaleChart.planets.find(p=>p.name==="Moon");

  const mLong = maleMoon?.longitude ?? 0;
  const fLong = femaleMoon?.longitude ?? 0;
  const mNakIdx = (Math.floor(mLong/(360/27)) % 27) + 1;
  const fNakIdx = (Math.floor(fLong/(360/27)) % 27) + 1;
  const mRashi  = Math.floor(mLong/30) % 12;
  const fRashi  = Math.floor(fLong/30) % 12;

  const mNak = NAKSHATRAS[mNakIdx-1];
  const fNak = NAKSHATRAS[fNakIdx-1];

  // ── 1. Varna (max 1) ──
  const mVarna = VARNA_MAP[mRashi];
  const fVarna = VARNA_MAP[fRashi];
  const varnaScore = mVarna <= fVarna ? 1 : 0; // Groom >= Bride
  const kutas: KutaResult[] = [];
  kutas.push({
    name:"Varna", maxPoints:1, scored:varnaScore,
    description:"Spiritual/social compatibility",
    verdict: varnaScore===1?"Good":"Poor",
    detail:`Groom: ${VARNA_NAMES[mVarna]} · Bride: ${VARNA_NAMES[fVarna]}. ${
      varnaScore?`Groom's varna (${VARNA_NAMES[mVarna]}) ≥ Bride's (${VARNA_NAMES[fVarna]}) — compatible.`:
      `Groom's varna (${VARNA_NAMES[mVarna]}) < Bride's (${VARNA_NAMES[fVarna]}) — mismatch.`}`
  });

  // ── 2. Vashya (max 2) ──
  // Simplified: same element or friendly element groups
  const RASHI_ELEMENTS = [0,1,2,3,0,1,2,3,0,1,2,3]; // F=Fire,E=Earth,A=Air,W=Water
  const mElem = RASHI_ELEMENTS[mRashi];
  const fElem = RASHI_ELEMENTS[fRashi];
  const elemFriends: Record<number,number[]> = {0:[0,2],1:[1,3],2:[0,2],3:[1,3]};
  const vashyaScore = mRashi===fRashi?2: elemFriends[mElem]?.includes(fElem)?2:1;
  kutas.push({
    name:"Vashya", maxPoints:2, scored:vashyaScore,
    description:"Attraction & dominance",
    verdict: vashyaScore===2?"Good":"Average",
    detail:`Groom Moon: ${RASHI_NAMES_EN[mRashi]} · Bride Moon: ${RASHI_NAMES_EN[fRashi]}. ${
      vashyaScore===2?"Compatible element groups — natural attraction":"Moderate attraction"}.`
  });

  // ── 3. Tara (max 3) ──
  const taraM2F = taraScore(mNakIdx, fNakIdx);
  const taraF2M = taraScore(fNakIdx, mNakIdx);
  const taraTotal = Math.round(taraM2F + taraF2M);
  const taraFinal = Math.min(3, taraTotal);
  kutas.push({
    name:"Tara", maxPoints:3, scored:taraFinal,
    description:"Birth star destiny compatibility",
    verdict: taraFinal>=2?"Good":taraFinal===1?"Average":"Poor",
    detail:`Groom Nakshatra: ${mNak?.name} (${mNakIdx}) · Bride: ${fNak?.name} (${fNakIdx}). Tara from groom→bride: ${
      taraM2F>0?"auspicious":"inauspicious"} · bride→groom: ${taraF2M>0?"auspicious":"inauspicious"}.`
  });

  // ── 4. Yoni (max 4) ──
  const mYoni = YONI[mNakIdx] ?? 1;
  const fYoni = YONI[fNakIdx] ?? 1;
  let yoniScore: number;
  if (mYoni === fYoni) yoniScore = 4;
  else if (YONI_ENEMIES[mYoni]===fYoni) yoniScore = 0;
  else {
    const diff = Math.abs(mYoni - fYoni);
    yoniScore = diff <= 2 ? 3 : 2;
  }
  kutas.push({
    name:"Yoni", maxPoints:4, scored:yoniScore,
    description:"Physical & sexual compatibility",
    verdict: yoniScore>=3?"Good":yoniScore>=2?"Average":"Poor",
    detail:`Groom Yoni: ${YONI_NAMES[mYoni]??mYoni} · Bride Yoni: ${YONI_NAMES[fYoni]??fYoni}. ${
      yoniScore===4?"Same yoni — excellent harmony":yoniScore===0?"Enemy yoni — significant tension":"Compatible yoni pairing"}.`
  });

  // ── 5. Graha Maitri (max 5) ──
  const gmScore = grahaMaitriScore(mRashi, fRashi);
  const mLord2 = RASHI_LORDS_PLANETS[mRashi];
  const fLord2 = RASHI_LORDS_PLANETS[fRashi];
  kutas.push({
    name:"Graha Maitri", maxPoints:5, scored:gmScore,
    description:"Mental & intellectual compatibility",
    verdict: gmScore>=4?"Excellent":gmScore>=3?"Good":gmScore>=2?"Average":"Poor",
    detail:`Moon lords — Groom: ${mLord2} (${RASHI_NAMES_EN[mRashi]}) · Bride: ${fLord2} (${RASHI_NAMES_EN[fRashi]}). ${
      getRelationship(mLord2,fLord2)} relationship.`
  });

  // ── 6. Gana (max 6) ──
  const mGana = GANA[mNakIdx] ?? 0;
  const fGana = GANA[fNakIdx] ?? 0;
  const GANA_TABLE: number[][] = [
    // Deva, Manushya, Rakshasa (row=groom, col=bride)
    [6, 6, 0],
    [5, 6, 0],
    [1, 0, 6],
  ];
  const ganaScore = GANA_TABLE[mGana][fGana];
  kutas.push({
    name:"Gana", maxPoints:6, scored:ganaScore,
    description:"Temperament & nature compatibility",
    verdict: ganaScore>=5?"Excellent":ganaScore>=3?"Good":ganaScore>=1?"Average":"Poor",
    detail:`Groom Gana: ${GANA_NAMES[mGana]} · Bride Gana: ${GANA_NAMES[fGana]}. ${
      ganaScore===6?"Same gana — excellent temperament match":
      ganaScore===0?"Gana dosha — significant temperament conflict":
      "Moderate temperament compatibility"}.`
  });

  // ── 7. Bhakoot (max 7) ──
  const bhakootFinal = bhakootScore(mRashi, fRashi);
  const rashiDiff = ((fRashi - mRashi + 12) % 12) + 1;
  kutas.push({
    name:"Bhakoot", maxPoints:7, scored:bhakootFinal,
    description:"Health, wealth & progeny",
    verdict: bhakootFinal===7?"Excellent":"Poor",
    detail:`Moon rashis: ${RASHI_NAMES_EN[mRashi]} (♂) & ${RASHI_NAMES_EN[fRashi]} (♀). Relative position: ${rashiDiff}th. ${
      bhakootFinal===7?"Auspicious Bhakoot position":"Bhakoot dosha — 6/8 or 12/2 position, can indicate health/financial issues"}.`
  });

  // ── 8. Nadi (max 8) ──
  const mNadi = NADI[mNakIdx] ?? 0;
  const fNadi = NADI[fNakIdx] ?? 0;
  const nadiScore = mNadi !== fNadi ? 8 : 0;
  kutas.push({
    name:"Nadi", maxPoints:8, scored:nadiScore,
    description:"Physiological & health compatibility",
    verdict: nadiScore===8?"Excellent":"Poor",
    detail:`Groom Nadi: ${NADI_NAMES[mNadi]} · Bride Nadi: ${NADI_NAMES[fNadi]}. ${
      nadiScore===8?"Different nadis — excellent health compatibility, no dosha":
      "Nadi dosha — same nadi indicates physiological incompatibility, increases health risks for children"}.`
  });

  const totalPoints = kutas.reduce((s,k)=>s+k.scored, 0);
  const maxPoints   = kutas.reduce((s,k)=>s+k.maxPoints, 0); // 36
  const percentage  = Math.round((totalPoints/maxPoints)*100);

  const verdict: MilanResult["verdict"] =
    totalPoints >= 32 ? "Excellent" :
    totalPoints >= 28 ? "Very Good" :
    totalPoints >= 24 ? "Good" :
    totalPoints >= 18 ? "Average" :
    totalPoints >= 12 ? "Below Average" : "Not Recommended";

  // Mangal Dosha
  const mangalMale   = hasMangalDosha(maleChart);
  const mangalFemale = hasMangalDosha(femaleChart);
  const mangalCancelled = mangalMale && mangalFemale;
  const mangalNote =
    !mangalMale && !mangalFemale ? "Neither has Mangal Dosha — no concern" :
    mangalCancelled ? "Both have Mangal Dosha — cancels out (Anulom Vilom rule). No special concern." :
    mangalMale ? "Groom has Mangal Dosha but Bride does not. Bride should also have Mangal Dosha or suitable remedies performed." :
    "Bride has Mangal Dosha but Groom does not. Groom should also have Mangal Dosha or suitable remedies performed.";

  const d9Compat = d9Compatibility(maleChart, femaleChart);

  // Recommendations
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (totalPoints >= 24) recommendations.push("Match meets the classical minimum threshold (18/36). Proceed with confidence.");
  if (nadiScore === 8) recommendations.push("Nadi compatibility is perfect — children will be healthy.");
  if (gmScore >= 4) recommendations.push("Strong Graha Maitri indicates excellent mental compatibility and understanding.");
  if (ganaScore === 6) recommendations.push("Same Gana — temperament and nature are well aligned.");
  if (mangalCancelled) recommendations.push("Mangal Doshas cancel — no separate Mangal puja required.");

  if (totalPoints < 18) warnings.push("Total below 18/36 — classical texts advise against this match without remedies.");
  if (nadiScore === 0) warnings.push("Nadi Dosha present — same Nadi can affect progeny health. Perform Nadi Dosha Shanti Puja.");
  if (bhakootFinal === 0) warnings.push("Bhakoot Dosha — can affect finances and health. Perform Bhakoot Shanti.");
  if (ganaScore === 0) warnings.push("Gana Dosha (Deva+Rakshasa or Rakshasa+Deva) — significant temperament conflict. Counselling recommended.");
  if (mangalMale && !mangalFemale) warnings.push("Unmatched Mangal Dosha — consult an astrologer before finalizing.");
  if (!mangalMale && mangalFemale) warnings.push("Unmatched Mangal Dosha (Bride) — consult an astrologer before finalizing.");

  if (recommendations.length === 0) recommendations.push("Perform a detailed Gochar analysis before finalizing the match date.");

  return {
    male, female, maleChart, femaleChart,
    maleNakIdx:mNakIdx, femaleNakIdx:fNakIdx,
    maleMoonRashi:mRashi, femaleMoonRashi:fRashi,
    kutas, totalPoints, maxPoints, percentage, verdict,
    mangalDoshaMale:mangalMale, mangalDoshaFemale:mangalFemale,
    mangalDoshaCancelled:mangalCancelled, mangalDoshaNote:mangalNote,
    d9Compatibility:d9Compat, recommendations, warnings,
  };
}
