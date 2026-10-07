export const GRAHAS = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
] as const;
export type Graha = (typeof GRAHAS)[number];

/** Natural benefics / malefics (classical). */
export const BENEFICS: Graha[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
export const MALEFICS: Graha[] = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];

export const RASHIS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;
export type Rashi = (typeof RASHIS)[number];

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'PurvaPhalguni', 'UttaraPhalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'PurvaAshadha', 'UttaraAshadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'PurvaBhadrapada', 'UttaraBhadrapada', 'Revati',
] as const;
export type Nakshatra = (typeof NAKSHATRAS)[number];

/** Mean daily motion (deg/day) — used for transit speed & ingress prediction. */
export const MEAN_DAILY_MOTION: Record<Graha, number> = {
  Sun: 0.9856, Moon: 13.1764, Mars: 0.5240, Mercury: 1.3832,
  Jupiter: 0.0831, Venus: 1.6021, Saturn: 0.0335, Rahu: -0.0529, Ketu: -0.0529,
};

export const RASHI_SIZE_DEG = 30;
export const NAKSHATRA_SIZE_DEG = 360 / 27;
export const PADA_SIZE_DEG = NAKSHATRA_SIZE_DEG / 4;
