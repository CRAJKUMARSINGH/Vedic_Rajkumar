import { computePanchang } from '../panchang/panchang';

export interface MuhurtaWindow {
  start: Date;
  end: Date;
  score: number;
  reason: string[];
  activity: string;
}

const GOOD_TITHIS = [1, 2, 3, 5, 7, 10, 11, 12, 13];
const GOOD_NAKSHATRAS = [
  'Rohini', 'Mrigashira', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana',
  'Dhanishta', 'Revati', 'Pushya', 'UttaraPhalguni', 'UttaraAshadha', 'UttaraBhadrapada',
];
const AVOID_YOGAS = [
  'Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Vajra',
  'Vyatipata', 'Parigha', 'Vaidhriti',
];

/** Score a single time window for an activity. */
export const scoreWindow = (
  sunLong: number,
  moonLong: number,
  jd: number,
  activity: string,
): MuhurtaWindow => {
  const p = computePanchang(sunLong, moonLong, jd);
  const reasons: string[] = [];
  let score = 50;

  if (GOOD_TITHIS.includes((p.tithi.index % 15) + 1)) {
    score += 15;
    reasons.push('Auspicious tithi');
  } else {
    score -= 10;
    reasons.push('Challenging tithi');
  }

  if (GOOD_NAKSHATRAS.includes(p.nakshatra.name)) {
    score += 20;
    reasons.push('Favorable nakshatra');
  } else {
    score -= 5;
  }

  if (AVOID_YOGAS.includes(p.yoga)) {
    score -= 15;
    reasons.push('Avoid yoga');
  } else {
    score += 10;
    reasons.push('Good yoga');
  }

  return {
    start: new Date((jd - 2440587.5) * 86400000),
    end: new Date((jd - 2440587.5) * 86400000 + 3600000),
    score: Math.max(0, Math.min(100, score)),
    reason: reasons,
    activity,
  };
};
