/**
 * Vivah Muhurta Calculator
 * Panchanga-based auspicious marriage date finder
 * Based on Brihat Parashara Hora Shastra & Muhurta Chintamani
 */
import {
  julianDay, lahiriAyanamsa, sunLongitude, moonLongitude,
  NAKSHATRAS
} from "./vedicEngine";

// ─── Panchanga constants ──────────────────────────────────────────────────────

export const TITHI_NAMES = [
  "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami",
  "Shashthi","Saptami","Ashtami","Navami","Dashami",
  "Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima/Amavasya"
];

// 1-indexed (Pratipada=1). true = auspicious for marriage
const TITHI_MARRIAGE_SCORE: Record<number,number> = {
  1:2,   // Pratipada — ok
  2:10,  // Dwitiya ✓ very good
  3:10,  // Tritiya ✓ excellent (Akshaya)
  4:0,   // Chaturthi — avoid
  5:9,   // Panchami ✓ good
  6:3,   // Shashthi — moderate
  7:10,  // Saptami ✓ very good
  8:0,   // Ashtami — avoid
  9:1,   // Navami — mostly avoided
  10:9,  // Dashami ✓ good
  11:10, // Ekadashi ✓ excellent
  12:2,  // Dwadashi — ok
  13:9,  // Trayodashi ✓ good
  14:0,  // Chaturdashi — avoid
  15:5,  // Purnima — ok for some
  16:0,  // same as 1 (Krishna side starts), treated same as Pratipada
  17:8,  // Krishna Dwitiya ✓
  18:8,  // Krishna Tritiya ✓
  19:0,  // Krishna Chaturthi — avoid
  20:8,  // Krishna Panchami ✓
  21:3,  // Krishna Shashthi
  22:8,  // Krishna Saptami ✓
  23:0,  // Krishna Ashtami — avoid
  24:0,  // Krishna Navami — avoid
  25:8,  // Krishna Dashami ✓
  26:8,  // Krishna Ekadashi ✓
  27:2,  // Krishna Dwadashi
  28:8,  // Krishna Trayodashi ✓
  29:0,  // Krishna Chaturdashi — avoid
  30:0,  // Amavasya — strictly avoid
};

// Nakshatra score for marriage (27 nakshatras)
const NAKSHATRA_MARRIAGE_SCORE: Record<number,number> = {
  1:7,   // Ashwini — good
  2:0,   // Bharani — avoided
  3:3,   // Krittika — moderate
  4:10,  // Rohini ✓ best
  5:9,   // Mrigashira ✓ excellent
  6:0,   // Ardra — avoid
  7:8,   // Punarvasu ✓ good
  8:8,   // Pushya ✓ good
  9:0,   // Ashlesha — avoid
  10:9,  // Magha ✓ very good
  11:0,  // Purva Phalguni — avoided for marriage
  12:10, // Uttara Phalguni ✓ best (classically used for weddings)
  13:10, // Hasta ✓ excellent
  14:8,  // Chitra ✓ good
  15:10, // Swati ✓ excellent
  16:0,  // Vishakha — avoided (some texts allow last pada)
  17:10, // Anuradha ✓ excellent
  18:0,  // Jyeshtha — avoided
  19:8,  // Mula — allowed with caution (last 2 padas)
  20:0,  // Purva Ashadha — mixed
  21:10, // Uttara Ashadha ✓ very good
  22:7,  // Shravana — allowed
  23:5,  // Dhanishta — first 2 padas ok
  24:3,  // Shatabhisha — limited
  25:0,  // Purva Bhadrapada — avoid
  26:10, // Uttara Bhadrapada ✓ excellent
  27:10, // Revati ✓ best
};

// Vara (weekday) score for marriage: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
const VARA_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const VARA_MARRIAGE_SCORE: Record<number,number> = {
  0:6,  // Sunday — ok
  1:8,  // Monday ✓ good (Moon's day)
  2:0,  // Tuesday — avoid (Mars)
  3:9,  // Wednesday ✓ very good (Mercury)
  4:10, // Thursday ✓ best (Jupiter/Guru)
  5:10, // Friday ✓ best (Venus/Shukra)
  6:0,  // Saturday — avoid (Saturn)
};

// 27 Yogas: 0=Vishkambha (bad) ... score for each
const YOGA_NAMES = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana",
  "Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi",
  "Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata",
  "Variyan","Parigha","Shiva","Siddha","Sadhya","Shubha",
  "Shukla","Brahma","Indra","Vaidhriti"
];
const YOGA_MARRIAGE_SCORE: Record<number,number> = {
  0:0,  // Vishkambha — avoid
  1:9,  // Priti ✓
  2:8,  // Ayushman ✓
  3:9,  // Saubhagya ✓
  4:9,  // Shobhana ✓
  5:3,  // Atiganda — caution
  6:9,  // Sukarma ✓
  7:8,  // Dhriti ✓
  8:2,  // Shula — caution
  9:3,  // Ganda — caution
  10:9, // Vriddhi ✓
  11:9, // Dhruva ✓
  12:2, // Vyaghata — caution
  13:9, // Harshana ✓
  14:0, // Vajra — avoid
  15:10,// Siddhi ✓✓ excellent
  16:0, // Vyatipata — avoid
  17:7, // Variyan ✓
  18:0, // Parigha — avoid
  19:8, // Shiva ✓
  20:10,// Siddha ✓✓ excellent
  21:9, // Sadhya ✓
  22:9, // Shubha ✓
  23:8, // Shukla ✓
  24:9, // Brahma ✓
  25:9, // Indra ✓
  26:0, // Vaidhriti — avoid
};

// Sarvartha Siddhi Yoga: Vara→auspicious Nakshatras
const SARVARTHA_SIDDHI: Record<number,number[]> = {
  0:[0,3,6,9,12,20,21],          // Sunday: Hasta, Uttara, Revati, Pushya, etc.
  1:[3,6,9,20,21,26],            // Monday: Rohini, Mrigashira, Pushya, etc.
  2:[0,3,9,21,26],               // Tuesday: (fewer options on Tue)
  3:[3,4,6,9,13,17,20,21,26],    // Wednesday: many
  4:[3,4,6,9,13,17,20,21,26],    // Thursday: many
  5:[3,4,6,9,13,17,20,21,26],    // Friday: many
  6:[],                           // Saturday: none for marriage
};

// Rahu Kaal by weekday (approximate, in hours from sunrise)
// Format: [start_hours_after_sunrise, duration_hours]
const RAHU_KAAL_OFFSET: Record<number,[number,number]> = {
  0:[10.5,1.5], // Sunday: 3rd pahar  
  1:[7.5,1.5],  // Monday: 2nd pahar
  2:[15,1.5],   // Tuesday: 4th pahar (evening)
  3:[12,1.5],   // Wednesday: noon
  4:[1.5,1.5],  // Thursday: 1st slot
  5:[10.5,1.5], // Friday
  6:[9,1.5],    // Saturday
};

// ─── Computation ──────────────────────────────────────────────────────────────

function normalize(d: number): number { return ((d % 360) + 360) % 360; }

function getTithi(moonLong: number, sunLong: number): number {
  const diff = normalize(moonLong - sunLong);
  return Math.floor(diff / 12) + 1; // 1-30
}

function getYoga(moonLong: number, sunLong: number): number {
  const sum = normalize(moonLong + sunLong);
  return Math.floor(sum / (360/27)); // 0-26
}

export interface MuhurtaDay {
  date: Date;
  dateStr: string;
  vara: number;
  varaName: string;
  tithiNum: number;
  tithiName: string;
  paksha: "Shukla" | "Krishna";
  nakshatraIdx: number;
  nakshatraName: string;
  nakshatraLord: string;
  yogaIdx: number;
  yogaName: string;
  sarvarthaSiddhi: boolean;
  totalScore: number;
  grade: "A+" | "A" | "B+" | "B" | "C" | "Avoid";
  scoreBreakdown: {
    tithi: number; nakshatra: number; vara: number; yoga: number; bonus: number;
  };
  rahuKaalHours: string;
  goodTimesIST: string[];
  notes: string[];
}

export interface MuhurtaResult {
  year: number;
  months: number[];
  totalDaysScanned: number;
  auspiciousDates: MuhurtaDay[];
  bestDate: MuhurtaDay | null;
  monthlyCount: Record<string,number>;
}

function toDayDate(year:number,month:number,day:number): string {
  const d = new Date(year,month-1,day);
  return d.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
}

function computeDay(year:number,month:number,day:number): MuhurtaDay {
  // Compute for 12:00 noon IST = 6:30 UTC
  const jde = julianDay(year,month,day,6.5);
  const T = (jde - 2451545.0)/36525.0;
  const ayn = lahiriAyanamsa(jde);
  const sunTrop  = sunLongitude(T);
  const moonTrop = moonLongitude(T);
  const sunSid   = normalize(sunTrop  - ayn);
  const moonSid  = normalize(moonTrop - ayn);

  const tithiNum = getTithi(moonSid,sunSid);
  const paksha: "Shukla"|"Krishna" = tithiNum <= 15 ? "Shukla" : "Krishna";
  const tithiDisplay = tithiNum <= 15 ? tithiNum : tithiNum - 15;
  const tithiName = TITHI_NAMES[tithiDisplay-1] ?? "Unknown";

  const nakIdx = Math.floor(moonSid/(360/27)); // 0-26
  const nak = NAKSHATRAS[nakIdx];
  const yogaIdx = getYoga(moonSid,sunSid);

  // Weekday: JDE fractional part
  const vara = Math.floor(((jde + 1.5) % 7 + 7) % 7);

  // Scores
  const tScore = TITHI_MARRIAGE_SCORE[tithiNum] ?? 5;
  const nScore = NAKSHATRA_MARRIAGE_SCORE[nakIdx+1] ?? 5;
  const vScore = VARA_MARRIAGE_SCORE[vara] ?? 5;
  const yScore = YOGA_MARRIAGE_SCORE[yogaIdx] ?? 5;

  // Sarvartha Siddhi bonus
  const sarvSiddhi = (SARVARTHA_SIDDHI[vara] ?? []).includes(nakIdx);
  const bonus = sarvSiddhi ? 8 : 0;

  // Hard avoids: if any single element is 0, cap total at 20
  const hasHardAvoid = [tScore,nScore,vScore].some(s=>s===0);

  // Weighted total out of 100
  const raw = (tScore*2.5) + (nScore*3.5) + (vScore*3) + (yScore*1) + bonus;
  const totalScore = hasHardAvoid ? Math.min(15, raw) : Math.min(100, Math.round(raw));

  const grade: MuhurtaDay["grade"] =
    totalScore >= 85 ? "A+" :
    totalScore >= 70 ? "A"  :
    totalScore >= 55 ? "B+" :
    totalScore >= 40 ? "B"  :
    totalScore >= 20 ? "C"  : "Avoid";

  // Rahu Kaal
  const [rahuStart, rahuDur] = RAHU_KAAL_OFFSET[vara] ?? [10.5,1.5];
  const toIST = (h: number) => {
    const totalH = 6 + h; // approximate sunrise ~6:00 AM
    const hh = Math.floor(totalH);
    const mm = Math.round((totalH - hh)*60);
    const ampm = hh < 12 ? "AM" : "PM";
    return `${hh<=12?hh:hh-12}:${String(mm).padStart(2,"0")} ${ampm}`;
  };
  const rahuKaalHours = `${toIST(rahuStart)} – ${toIST(rahuStart+rahuDur)}`;

  // Good times (morning Brahma Muhurta + mid-morning + afternoon)
  const goodTimesIST = ["5:30 AM – 7:30 AM (Brahma Muhurta)","9:00 AM – 12:00 PM","2:00 PM – 4:00 PM"];

  const notes: string[] = [];
  if (sarvSiddhi) notes.push("⭐ Sarvartha Siddhi Yoga — all efforts bear fruit");
  if (yogaIdx===15) notes.push("⭐ Siddhi Yoga — excellent for life events");
  if (yogaIdx===20) notes.push("⭐ Siddha Yoga — highly auspicious");
  if (tithiNum===3) notes.push("✓ Tritiya (Akshaya Tritiya equivalent if Shukla) — best tithi for marriage");
  if (tithiNum===11) notes.push("✓ Ekadashi — highly auspicious");
  if ([3,4].includes(vara)) notes.push(`✓ ${VARA_NAMES[vara]} (${vara===4?"Guru":"Shukra"} Vara) — most auspicious weekday for Vivah`);
  if ([3,11].includes(nakIdx)) notes.push(`✓ ${nak?.name} Nakshatra — classically best for marriage`);
  if (hasHardAvoid) {
    if (tScore===0) notes.push(`⚠ Tithi ${tithiName} — inauspicious, avoid`);
    if (nScore===0) notes.push(`⚠ ${nak?.name} Nakshatra — inauspicious for marriage`);
    if (vScore===0) notes.push(`⚠ ${VARA_NAMES[vara]} — inauspicious for marriage`);
  }

  return {
    date: new Date(year,month-1,day),
    dateStr: toDayDate(year,month,day),
    vara, varaName:VARA_NAMES[vara],
    tithiNum, tithiName, paksha,
    nakshatraIdx:nakIdx+1, nakshatraName:nak?.name??"Unknown",
    nakshatraLord:nak?.lord??"Unknown",
    yogaIdx, yogaName:YOGA_NAMES[yogaIdx]??"Unknown",
    sarvarthaSiddhi:sarvSiddhi,
    totalScore, grade,
    scoreBreakdown:{tithi:tScore,nakshatra:nScore,vara:vScore,yoga:yScore,bonus},
    rahuKaalHours, goodTimesIST, notes,
  };
}

export function computeMuhurta(
  year: number,
  fromMonth: number,
  toMonth: number,
): MuhurtaResult {
  const auspicious: MuhurtaDay[] = [];
  const monthlyCount: Record<string,number> = {};
  let totalScanned = 0;

  // Classical marriage-forbidden months (Kharmas): when Sun is in Sagittarius/Pisces
  // We'll note these but still compute

  for (let m = fromMonth; m <= toMonth; m++) {
    const daysInMonth = new Date(year,m,0).getDate();
    const mKey = new Date(year,m-1,1).toLocaleString("en-IN",{month:"long"});
    monthlyCount[mKey] = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      totalScanned++;
      const day = computeDay(year,m,d);
      if (day.grade !== "Avoid" && day.totalScore >= 40) {
        auspicious.push(day);
        if (day.totalScore >= 55) monthlyCount[mKey]++;
      }
    }
  }

  auspicious.sort((a,b) => b.totalScore - a.totalScore);
  const bestDate = auspicious[0] ?? null;

  return {
    year, months:[fromMonth,toMonth],
    totalDaysScanned:totalScanned,
    auspiciousDates:auspicious,
    bestDate, monthlyCount
  };
}
