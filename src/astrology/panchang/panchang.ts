import { NAKSHATRAS, NAKSHATRA_SIZE_DEG } from '../core/constants';

export interface Panchang {
  tithi: { index: number; name: string; paksha: 'Shukla' | 'Krishna' };
  nakshatra: { index: number; name: string; pada: number };
  yoga: string;
  karana: string;
  vara: string;
}

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
  'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
  'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya',
];
const YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata',
  'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti',
];
const VARA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const computePanchang = (
  sunLong: number,
  moonLong: number,
  jd: number,
): Panchang => {
  const elong = ((moonLong - sunLong) % 360 + 360) % 360;
  const tithiIdx = Math.floor(elong / 12);
  const paksha = tithiIdx < 15 ? 'Shukla' : 'Krishna';
  const within = tithiIdx % 15;

  const moonNorm = ((moonLong % 360) + 360) % 360;
  const nakIdx = Math.floor(moonNorm / NAKSHATRA_SIZE_DEG) % 27;
  const pada = Math.floor((moonNorm % NAKSHATRA_SIZE_DEG) / (NAKSHATRA_SIZE_DEG / 4)) + 1;

  const yogaIdx = Math.floor((((sunLong + moonLong) % 360) + 360) % 360 / (360 / 27)) % 27;
  const karanaIdx = Math.floor(elong / 6);

  return {
    tithi: { index: tithiIdx, name: TITHI_NAMES[within], paksha },
    nakshatra: { index: nakIdx, name: NAKSHATRAS[nakIdx], pada },
    yoga: YOGAS[yogaIdx],
    karana: `Karana-${karanaIdx}`,
    vara: VARA[Math.floor((jd + 1.5) % 7)],
  };
};
