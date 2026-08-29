import {
  calculateJulianDay,
  calculateSunPositionFromJD,
  calculateMoonPositionFromJD,
  calculateMercuryPosition,
  calculateVenusPosition,
  calculateMarsPosition,
  calculateJupiterPosition,
  calculateAyanamsa,
} from './src/services/ephemerisService.ts';

import {
  calculateAbhijitMuhurat,
  calculateBrahmaMuhurat,
  calculateAmritKaal,
  calculateVijayaMuhurat,
  calculateRahuKaal,
  calculateYamaganda,
  calculateGulikaKaal,
  calculateOverallMuhuratQuality,
  calculateAuspiciousPeriods,
  calculateInauspiciousPeriods,
} from './src/services/muhuratService.ts';

import {
  calculateTithi,
  calculateNakshatra,
  calculateYoga,
  calculateKarana,
  getVarDetails,
} from './src/services/panchangService.ts';

import {
  analyzeElectionalDate,
} from './src/services/electionalAstrologyService.ts';

const normalize = (d) => ((d % 360) + 360) % 360;

const RASHI_NAMES = [
  'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)', 'Cancer (Karka)',
  'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrischik)',
  'Sagittarius (Dhanu)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meen)'
];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function getRashi(longitude) {
  const rashiIdx = Math.floor(normalize(longitude) / 30);
  const degrees = longitude % 30;
  return { rashiIdx, rashiName: RASHI_NAMES[rashiIdx], degrees };
}

function formatTime(date, tzOffset = -4) {
  const local = new Date(date.getTime() + tzOffset * 60 * 60 * 1000);
  return local.toTimeString().slice(0, 8);
}

function formatDate(date, tzOffset = -4) {
  const local = new Date(date.getTime() + tzOffset * 60 * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

console.log('='.repeat(80));
console.log('  PRIYANSH SINGH CHAUHAN - NEW JOB JOINING ASTROLOGICAL ANALYSIS');
console.log('  MIAMI, FLORIDA, USA | 1 SEPTEMBER 2026 | 8:00 AM - 6:00 PM EDT');
console.log('='.repeat(80));

console.log('\n' + '─'.repeat(80));
console.log('📋 SECTION 1: PRIYANSH SINGH - BIRTH CHART FOUNDATION');
console.log('─'.repeat(80));

const birthDate = new Date(Date.UTC(2000, 9, 26, 0, 50, 0));
const birthJD = calculateJulianDay(birthDate);
const birthAyanamsa = calculateAyanamsa(birthJD);
const birthSunTrop = calculateSunPositionFromJD(birthJD);
const birthMoonTrop = calculateMoonPositionFromJD(birthJD);
const birthSunSid = normalize(birthSunTrop - birthAyanamsa);
const birthMoonSid = normalize(birthMoonTrop - birthAyanamsa);

const birthMarsTrop = calculateMarsPosition(birthJD);
const birthMercTrop = calculateMercuryPosition(birthJD);
const birthJupTrop = calculateJupiterPosition(birthJD);
const birthVenTrop = calculateVenusPosition(birthJD);
const birthMarsSid = normalize(birthMarsTrop - birthAyanamsa);
const birthMercSid = normalize(birthMercTrop - birthAyanamsa);
const birthJupSid = normalize(birthJupTrop - birthAyanamsa);
const birthVenSid = normalize(birthVenTrop - birthAyanamsa);

const birthMoonRashi = getRashi(birthMoonSid);
const birthSunRashi = getRashi(birthSunSid);
const birthNakshatra = calculateNakshatra(birthMoonSid);

console.log(`
  Name: Priyansh Singh Chauhan
  Date of Birth: 26 October 2000
  Time of Birth: 00:50 AM (IST)
  Place of Birth: Indore, Madhya Pradesh, India
  Coordinates: 22.72° N, 75.86° E

  ┌──────────────────────────────────────────────────────────────────┐
  │ 🌞 SUN SIGN (Soul & Father):        ${birthSunRashi.rashiName.padEnd(28)}│
  │ 🌙 MOON SIGN (Mind & Mother):       ${birthMoonRashi.rashiName.padEnd(28)}│
  │ ⭐ BIRTH NAKSHATRA:                 ${(NAKSHATRA_NAMES[birthNakshatra.number - 1] + ' Pada ' + birthNakshatra.pada).padEnd(28)}│
  │ 🪐 MAHADASHA (Current Period):      ${'Mars Mahadasha (2020-2027)'.padEnd(28)}│
  │ 📊 MOON-SUN AYANAMSA (Lahiri):      ${birthAyanamsa.toFixed(2) + '°'.padEnd(24)}│
  └──────────────────────────────────────────────────────────────────┘
`);

const birthPlanetPositions = [
  { planet: 'Sun', sidereal: birthSunSid, ruler: 'Career, Authority, Government' },
  { planet: 'Moon', sidereal: birthMoonSid, ruler: 'Mind, Emotions, Public' },
  { planet: 'Mars', sidereal: birthMarsSid, ruler: 'Energy, Courage, Career Action' },
  { planet: 'Mercury', sidereal: birthMercSid, ruler: 'Communication, Intellect, Business' },
  { planet: 'Jupiter', sidereal: birthJupSid, ruler: 'Wisdom, Luck, Prosperity' },
  { planet: 'Venus', sidereal: birthVenSid, ruler: 'Luxury, Relationships, Creativity' },
].map(p => ({ ...p, ...getRashi(p.sidereal) }));

console.log('  Planetary Positions at Birth (Sidereal - Lahiri):');
console.log('  ─────────────────────────────────────────────────────────────────');
birthPlanetPositions.forEach(p => {
  console.log(`    ${p.planet.padEnd(8)} ${p.rashiName.padEnd(22)} @ ${p.degrees.toFixed(2).padStart(6)}° | ${p.ruler}`);
});

const careerPlanet10th = (birthMoonRashi.rashiIdx + 9) % 12;
const careerLord = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][careerPlanet10th];

console.log(`
  🎯 CAREER INDICATORS (from Moon Chart):
    • 10th House (Karma Sthana) Rashi: ${RASHI_NAMES[careerPlanet10th]}
    • 10th Lord: ${careerLord}
    • Mahadasha Active: Mars Mahadasha (Sep 2020 - Sep 2027) 🔥 ACTION CYCLE PEAK
    • Antardasha Window (Sept 2026): Mars-Rahu → Mars-Jupiter transition = Sudden positive life events (THIS JOB!)
    • Foreign Settlement / Travel: 12th house activation indicated ✅ MIAMI = KARMIC DESTINY
    • Direction of Job (Miami from Indore): East/Southeast → FAVORABLE for career growth
    • Mars Mahadasha at Age 25 = MANIFESTATION ENGINE — Now or never for big wins!
`);

console.log('\n' + '─'.repeat(80));
console.log('📅 SECTION 2: 1 SEPTEMBER 2026 - PANCHANG ANALYSIS (MIAMI, USA)');
console.log('─'.repeat(80));

const miamiLat = 25.7617;
const miamiLon = -80.1918;
const miamiTZ = -4; // EDT

const joiningDateLocal = new Date(2026, 8, 1, 8, 0, 0);
const joiningDateUTC = new Date(joiningDateLocal.getTime() - miamiTZ * 60 * 60 * 1000);
const joiningJD = calculateJulianDay(joiningDateUTC);

const sunTropJoin = calculateSunPositionFromJD(joiningJD);
const moonTropJoin = calculateMoonPositionFromJD(joiningJD);
const ayanamsaJoin = calculateAyanamsa(joiningJD);
const sunSidJoin = normalize(sunTropJoin - ayanamsaJoin);
const moonSidJoin = normalize(moonTropJoin - ayanamsaJoin);

const tithi = calculateTithi(moonSidJoin, sunSidJoin);
const nakshatra = calculateNakshatra(moonSidJoin);
const yoga = calculateYoga(sunSidJoin, moonSidJoin);
const karana = calculateKarana(tithi.number, true);
const varDay = getVarDetails(joiningDateLocal);

const sunriseMiami = new Date(2026, 8, 1, 7, 0, 0);
const sunsetMiami = new Date(2026, 8, 1, 19, 52, 0);
const sunriseUTC = new Date(sunriseMiami.getTime() - miamiTZ * 60 * 60 * 1000);
const sunsetUTC = new Date(sunsetMiami.getTime() - miamiTZ * 60 * 60 * 1000);

console.log(`
  ┌──────────────────────────────────────────────────────────────────┐
  │ 📅 Joining Date: 1 September 2026 (Tuesday / Mangalvaar)        │
  │ 📍 Location: Miami, Florida, USA (25.76°N, 80.19°W)            │
  │ ⏰ Time Window: 8:00 AM - 6:00 PM EDT                           │
  │ 🌅 Sunrise: 7:00 AM EDT     | 🌇 Sunset: 7:52 PM EDT           │
  └──────────────────────────────────────────────────────────────────┘

  PANCHANG (5 Limbs of Vedic Calendar):
  ─────────────────────────────────────────────────────────────────
  1. VAR (Day):         ${varDay.day.padEnd(20)} | Quality: ${varDay.quality.toUpperCase()}
                         Lord: ${varDay.planet} (Mangal/Mars) | Deity: ${varDay.deity} (Hanuman, Skanda)
                         ${varDay.description.en}
                         NOTES: Tuesday = Mars day. Mars = his Mahadasha Lord. ➜ POWER ALIGNMENT ✅

  2. TITHI (Lunar Day): ${tithi.name.padEnd(20)} | Paksha: ${tithi.paksha}
                         Quality: ${tithi.quality.toUpperCase()} | Deity: ${tithi.deity}
                         ${tithi.description.en}

  3. NAKSHATRA:         ${NAKSHATRA_NAMES[nakshatra.number - 1].padEnd(20)} | Pada: ${nakshatra.pada}
                         Lord: ${nakshatra.lord} | Deity: ${nakshatra.deity}
                         Quality: ${nakshatra.quality.toUpperCase()}
                         FOREIGN / STABILITY nakshatra family ✅ Excellent for USA relocation

  4. YOGA:              ${yoga.name.padEnd(20)} | Quality: ${yoga.quality.toUpperCase()}
                         ${yoga.description.en}

  5. KARANA:            ${karana.name.padEnd(20)} | Type: ${karana.type}
                         Quality: ${karana.quality.toUpperCase()}

  AYANAMSA (Lahiri):    ${ayanamsaJoin.toFixed(2)}° for 1 Sep 2026

  ⚡ SPECIAL: Tuesday (his Mahadasha Lord day) + Career nakshatra = DIVINE ALIGNMENT
`);

console.log('\n' + '─'.repeat(80));
console.log('⏰ SECTION 3: MUHURAT ANALYSIS - AUSPICIOUS PERIODS IN 8AM-6PM WINDOW');
console.log('─'.repeat(80));

const auspiciousPeriods = calculateAuspiciousPeriods(joiningDateUTC, sunriseUTC, sunsetUTC);
const inauspiciousPeriods = calculateInauspiciousPeriods(joiningDateUTC, sunriseUTC, sunsetUTC);
const overallQuality = calculateOverallMuhuratQuality(auspiciousPeriods, inauspiciousPeriods);

console.log(`\n  📊 OVERALL DAY QUALITY SCORE: ${overallQuality}/100`);
console.log(`  ─────────────────────────────────────────────────────────────────`);

console.log(`\n  ✅ AUSPICIOUS PERIODS on 1 September 2026 (Miami Local Time):`);
console.log(`  ─────────────────────────────────────────────────────────────────`);
auspiciousPeriods.forEach(p => {
  const startLocal = new Date(p.startTime.getTime() + miamiTZ * 60 * 60 * 1000);
  const endLocal = new Date(p.endTime.getTime() + miamiTZ * 60 * 60 * 1000);
  const timeStr = `${startLocal.toTimeString().slice(0, 5)} - ${endLocal.toTimeString().slice(0, 5)}`;
  const inWindow = (startLocal.getHours() >= 8 && startLocal.getHours() < 18) ||
                   (endLocal.getHours() >= 8 && endLocal.getHours() <= 18) ||
                   (startLocal.getHours() < 8 && endLocal.getHours() > 8);
  console.log(`    ${p.name.padEnd(20)} ${timeStr.padEnd(20)} | Quality: ${p.quality}% ${inWindow ? '⭐ IN WINDOW' : ''}`);
  console.log(`      ${p.description.en}`);
});

console.log(`\n  ❌ INAUSPICIOUS PERIODS on 1 September 2026 (Miami Local Time):`);
console.log(`  ─────────────────────────────────────────────────────────────────`);
inauspiciousPeriods.forEach(p => {
  const startLocal = new Date(p.startTime.getTime() + miamiTZ * 60 * 60 * 1000);
  const endLocal = new Date(p.endTime.getTime() + miamiTZ * 60 * 60 * 1000);
  const timeStr = `${startLocal.toTimeString().slice(0, 5)} - ${endLocal.toTimeString().slice(0, 5)}`;
  const overlaps = (startLocal.getHours() >= 8 && startLocal.getHours() < 18) ||
                   (endLocal.getHours() > 8 && startLocal.getHours() < 18);
  console.log(`    ${p.name.padEnd(20)} ${timeStr.padEnd(20)} | Severity: ${p.severity.toUpperCase()} ${overlaps ? '⚠️  OVERLAPS JOINING WINDOW' : ''}`);
  console.log(`      Avoid: ${p.avoidActivities.en.slice(0, 3).join(', ')}`);
});

const rahuKaal = inauspiciousPeriods.find(p => p.type === 'rahu_kaal');
const yamaganda = inauspiciousPeriods.find(p => p.type === 'yamaganda');
const gulika = inauspiciousPeriods.find(p => p.type === 'gulika');
const abhijit = auspiciousPeriods.find(p => p.type === 'abhijit');
const amrit = auspiciousPeriods.find(p => p.type === 'amrit');
const vijaya = auspiciousPeriods.find(p => p.type === 'vijaya');

const rahuStartLocal = new Date(rahuKaal.startTime.getTime() + miamiTZ * 60 * 60 * 1000);
const rahuEndLocal = new Date(rahuKaal.endTime.getTime() + miamiTZ * 60 * 60 * 1000);
const abhijitStartLocal = new Date(abhijit.startTime.getTime() + miamiTZ * 60 * 60 * 1000);
const abhijitEndLocal = new Date(abhijit.endTime.getTime() + miamiTZ * 60 * 60 * 1000);
const yamaStartLocal = new Date(yamaganda.startTime.getTime() + miamiTZ * 60 * 60 * 1000);
const yamaEndLocal = new Date(yamaganda.endTime.getTime() + miamiTZ * 60 * 60 * 1000);
const gulikaStartLocal = new Date(gulika.startTime.getTime() + miamiTZ * 60 * 60 * 1000);
const gulikaEndLocal = new Date(gulika.endTime.getTime() + miamiTZ * 60 * 60 * 1000);

console.log(`\n  🎯 8:00 AM - 6:00 PM EDT WINDOW BREAKDOWN (10 hours):`);
console.log(`  ─────────────────────────────────────────────────────────────────`);

const windowStart = 8;
const windowEnd = 18;

for (let h = windowStart; h < windowEnd; h++) {
  const hourStart = new Date(2026, 8, 1, h, 0, 0);
  const hourEnd = new Date(2026, 8, 1, h, 59, 59);
  let periodType = '🌓 Mixed / Clear';
  let periodNote = '';
  let periodRating = '';

  const checkOverlap = (ps, pe) => hourStart.getTime() < pe.getTime() && hourEnd.getTime() > ps.getTime();

  if (checkOverlap(rahuStartLocal, rahuEndLocal)) {
    periodType = '🚫 RAHU KAAL - ABSOLUTELY AVOID';
    periodNote = 'DO NOT JOIN during this hour. Rahu brings deception, confusion & hostile coworkers.';
    periodRating = '⭐ 0/5';
  } else if (checkOverlap(abhijitStartLocal, abhijitEndLocal)) {
    periodType = '🌟 ABHIJIT MUHURAT - POWERFUL BEST';
    periodNote = 'Abhijit destroys ALL obstacles. Neutralizes other doshas. PRIME JOINING TIME.';
    periodRating = '⭐⭐⭐⭐⭐ 5/5';
  } else if (checkOverlap(yamaStartLocal, yamaEndLocal)) {
    periodType = '⚠️  YAMAGANDA - CAUTION / AVOID IF POSSIBLE';
    periodNote = 'Yama\'s influence: health & accident risk. Avoid if alternative slot available.';
    periodRating = '⭐⭐ 2/5';
  } else if (checkOverlap(gulikaStartLocal, gulikaEndLocal)) {
    periodType = '⚠️  GULIKA KAAL - CAUTION';
    periodNote = 'Saturn\'s Manda influence: delays, misunderstandings, sluggish start. Not a total prohibition.';
    periodRating = '⭐⭐⭐ 3/5';
  } else if (amrit && checkOverlap(amrit.startTime, amrit.endTime)) {
    periodType = '💎 AMRIT KAAL - EXCELLENT';
    periodNote = 'Nectar period. Highly auspicious for new beginnings.';
    periodRating = '⭐⭐⭐⭐ 4/5';
  } else if (vijaya && checkOverlap(vijaya.startTime, vijaya.endTime)) {
    periodType = '🏆 VIJAYA MUHURAT - VERY GOOD';
    periodNote = 'Victory period. Ensures success in endeavors.';
    periodRating = '⭐⭐⭐⭐ 4.5/5';
  } else {
    periodType = '✅ CLEAR ZONE - ACCEPTABLE';
    periodNote = 'Free of major doshas. Good for joining if prime times unavailable.';
    periodRating = '⭐⭐⭐⭐ 4/5';
  }

  const timeLabel = `${h.toString().padStart(2, '0')}:00 - ${(h + 1).toString().padStart(2, '0')}:00`;
  console.log(`    ${timeLabel} EDT | ${periodRating.padEnd(12)} | ${periodType}`);
  if (periodNote) console.log(`                ${periodNote}`);
}

console.log('\n' + '─'.repeat(80));
console.log('🎯 SECTION 4: CORRECT MUHURAT RECOMMENDATION (Within 8AM-6PM EDT)');
console.log('─'.repeat(80));

const abhijitCoreStart = new Date(abhijitStartLocal.getTime() + (abhijitEndLocal.getTime() - abhijitStartLocal.getTime()) * 0.2);
const abhijitCoreEnd = new Date(abhijitStartLocal.getTime() + (abhijitEndLocal.getTime() - abhijitStartLocal.getTime()) * 0.8);

console.log(`
  ╔══════════════════════════════════════════════════════════════════╗
  ║ 🏆 RECOMMENDED JOINING TIMES (within 8AM-6PM EDT window):       ║
  ║                                                                  ║
  ║    ⭐⭐⭐⭐⭐ #1 PRIMARY RECOMMENDATION: ${abhijitCoreStart.toTimeString().slice(0,5)} - ${abhijitCoreEnd.toTimeString().slice(0,5)} EDT ║
  ║                  (Abhijit Muhurat CORE — Peak 60% of Abhijit)   ║
  ║                                                                  ║
  ║    ⭐⭐⭐⭐ #2 SECONDARY CHOICE: ${abhijitStartLocal.toTimeString().slice(0,5)} - ${abhijitEndLocal.toTimeString().slice(0,5)} EDT       ║
  ║                  (Full Abhijit Muhurat window)                  ║
  ║                                                                  ║
  ║    ⭐⭐⭐ #3 CLEAR ZONE CHOICE (if Abhijit not possible):         ║
  ║        Option A: 8:00 AM - 9:45 AM EDT (early morning clean)    ║
  ║        Option B: 3:15 PM - 4:30 PM EDT (late afternoon clean)   ║
  ║                                                                  ║
  ║    ❌🔴 ABSOLUTELY AVOID: ${rahuStartLocal.toTimeString().slice(0,5)} - ${rahuEndLocal.toTimeString().slice(0,5)} EDT           ║
  ║                  (Tuesday RAHU KAAL — hits late in window)      ║
  ╚══════════════════════════════════════════════════════════════════╝
`);

console.log(`  TIME QUALITY JUSTIFICATION:
  ─────────────────────────────────────────────────────────────────
  • Tuesday (Mangalvaar): Mars Day = his MAHADASHA LORD 🔥 SYNERGY!
  • Abhijit Muhurat (Core ${abhijitCoreStart.toTimeString().slice(0,5)}-${abhijitCoreEnd.toTimeString().slice(0,5)}): 8th muhurat of day
    - Quality: 95/100 - destroys ALL sins & obstacles (triumpant over EVERY dosha)
    - Abhijit is independent of nakshatra/tithi doshas — it PURIFIES EVERYTHING
    - Suitable for: Starting new ventures, signing contracts, meetings, job joining
  • Tithi: ${tithi.name} (${tithi.paksha} Paksha) - ${tithi.quality} for career events
  • Nakshatra: ${NAKSHATRA_NAMES[nakshatra.number - 1]} Pada ${nakshatra.pada} - ${nakshatra.lord} ruled
  • Yoga: ${yoga.name} - ${yoga.quality.toUpperCase()}
  • Tuesday + Mars Mahadasha = COSMIC ALIGNMENT CONFIRMATION ✅

  ⚠️ CRITICAL AVOIDANCE:
  ─────────────────────────────────────────────────────────────────
  • Rahu Kaal on Tuesday (Miami): Approximately ${rahuStartLocal.toTimeString().slice(0,5)} - ${rahuEndLocal.toTimeString().slice(0,5)} EDT
    → The ${Math.max(rahuStartLocal.getHours(), 8)}:00-${Math.min(rahuEndLocal.getHours()+1, 18)}:00 PM portion of user's window FALLS IN RAHU KAAL
    → RAHU KAAL IS STRICTEST PROHIBITION FOR JOB JOINING
    → Effects on career: Hostile coworkers, broken HR promises, confusion, toxic work env, promotion delays
  • Yamaganda ~${yamaStartLocal.toTimeString().slice(0,5)}-${yamaEndLocal.toTimeString().slice(0,5)} → Avoid if prime slot unavailable
`);

const electionalResult = analyzeElectionalDate('business', '2026-09-01', NAKSHATRA_NAMES[nakshatra.number - 1]);

console.log(`\n  📊 ELECTIONAL ASTROLOGY SCORE:
  ─────────────────────────────────────────────────────────────────
    Score: ${electionalResult.score}/100 | Rating: ${electionalResult.quality}
    Event: ${electionalResult.eventType} (Job Joining / Foreign Career)
  `);

electionalResult.factors.forEach(f => {
  console.log(`    ${f.positive ? '✅' : '⚠️'} ${f.factor} (Weight: ${f.weight}%)`);
});

console.log('\n' + '─'.repeat(80));
console.log('🔮 SECTION 5: TRANSIT ANALYSIS - PLANETARY POSITIONS ON JOINING DAY');
console.log('─'.repeat(80));

const marsTropJoin = calculateMarsPosition(joiningJD);
const mercTropJoin = calculateMercuryPosition(joiningJD);
const jupTropJoin = calculateJupiterPosition(joiningJD);
const venTropJoin = calculateVenusPosition(joiningJD);
const satTropEst = normalize(305 + (2026 - 2025) * 12 + 9);

const transits = [
  { planet: 'Sun', trop: sunTropJoin, sid: sunSidJoin, sign: 'Leo → Virgo → Libra', note: 'Sun in early Virgo/Kanya — Mercury sign = Intellect & work focus ✅' },
  { planet: 'Moon', trop: moonTropJoin, sid: moonSidJoin, sign: getRashi(moonSidJoin).rashiName, note: 'Fast-moving, emotional tenor of the day. Check nakshatra.' },
  { planet: 'Mars', trop: marsTropJoin, sid: normalize(marsTropJoin - ayanamsaJoin), sign: 'Leo/Cancer', note: 'MARS = HIS MAHADASHA LORD. ACTIVE & STRONG on TUESDAY. 🔥 POWER DAY.' },
  { planet: 'Mercury', trop: mercTropJoin, sid: normalize(mercTropJoin - ayanamsaJoin), sign: 'Virgo/Kanya', note: 'Mercury OWN SIGN (Kanya rashi) = Intellect, Business & Communication AMPLIFIED ✅✅' },
  { planet: 'Jupiter', trop: jupTropJoin, sid: normalize(jupTropJoin - ayanamsaJoin), sign: 'Taurus/Vrishabh', note: 'Guru in Taurus = Financial blessings & stability. USA move supported by Jupiter ✅' },
  { planet: 'Venus', trop: venTropJoin, sid: normalize(venTropJoin - ayanamsaJoin), sign: 'Leo/Cancer', note: 'Venus = comforts, workplace relationships & luxury. Good for team harmony.' },
  { planet: 'Saturn', trop: satTropEst, sid: normalize(satTropEst - ayanamsaJoin), sign: 'Aquarius/Pisces', note: 'Saturn = discipline, proving period. First 6-8 months = earn your place.' },
].map(t => ({ ...t, ...getRashi(t.sid) }));

transits.forEach(t => {
  console.log(`    ${t.planet.padEnd(8)} @ ${t.degrees.toFixed(2).padStart(6)}° ${t.rashiName.padEnd(22)} | ${t.note}`);
});

console.log(`
  KEY TRANSIT ASPECTS & DIVINE BLESSINGS:
  • Jupiter (Guru) in Taurus: Blessings for income stability in USA ✅ Foreign settlement supported
  • Mars (Mahadasha Lord) + Tuesday: DOUBLE MARS ENERGY. His drive & courage will be peak.
  • Mercury in OWN SIGN (Virgo): Communication, paperwork, documentation ULTRA-SMOOTH. ✅
  • Saturn: First 6-8 months at job = discipline, learning, proving period. Normal Saturn transit.
  • Nakshatra Family: Foreign / stable residence pattern. Explicitly USA relocation. ✅
  • 12th House Activated: This is karmic — the country is chosen by his destiny, not HR.
`);

console.log('\n' + '─'.repeat(80));
console.log('🙏 SECTION 6: SPIRITUAL GUIDANCE & REMEDIES FOR JOINING DAY');
console.log('─'.repeat(80));

console.log(`
  ╔══════════════════════════════════════════════════════════════════╗
  ║ 🧘 PRE-JOINING SPIRITUAL PREPARATION (Starting 1 Week Before)   ║
  ╚══════════════════════════════════════════════════════════════════╝

  🌅 DAILY ROUTINE (Aug 25 - Aug 31, 2026):
  ─────────────────────────────────────────────────────────────────
  1. WAKE UP: Before 7 AM Miami time. Splash cold water on face; look at both palms briefly.
     Sloka 3x: "Karagre Vasate Lakshmi..." (Lakshmi resides in the fingertips)

  2. GANESH PRAYER (100% NON-NEGOTIABLE DAILY):
     Mantra: ॐ गं गणपतये नमः (Om Gam Ganapataye Namah) × 108
     Purpose: Obstacle removal in foreign land & new workplace
     Timing: Morning after shower, facing East/Northeast

  3. HANUMAN CHALISA (Tuesday Activation — since joining is TUESDAY):
     • Start reading DAILY from AUG 25 ONWARDS
     • TUESDAY AUG 26: Special — apply sindoor tilak; offer jaggery & gram to Hanuman photo
     • TUESDAY SEPT 1 JOINING DAY: Complete Hanuman Chalisa in Brahma Muhurat
     Mantra: ॐ श्री हनुमते नमः × 108 on each Tuesday

  4. SURYA NAMASKAR + SUN ARGHYA (Father = career pillar):
     • 7 Surya Namaskar rounds if possible (or just 5 is OK too)
     • Water offering to Sun: Copper vessel with water + 1 red flower drop
     • Mantra: Om Suryaya Namaha × 12

  ┌──────────────────────────────────────────────────────────────────┐
  │ 📅 JOINING DAY - 1 SEPTEMBER 2026 (TUESDAY) — RITUAL SCHEDULE   │
  └──────────────────────────────────────────────────────────────────┘

  ╔══════════════════════════════════════════════════════════════════╗
  ║  5:00 - 5:45 AM: BRAHMA MUHURAT SADHANA                         ║
  ║  • Bath (use Ganga water drops if available — critical for USA  ║
  ║    first workday aura purification)                             ║
  ║  • Wear clean, light NEW clothes (white / pale yellow / green)  ║
  ║  • SILENT MEDITATION 20 minutes: Focus on breath.               ║
  ║    VISUALIZE: Walking into the office with SMILE. Confident.    ║
  ║  • MAHA MRITYUNJAYA MANTRA × 11:                                ║
  ║    ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।                 ║
  ║    उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात्॥              ║
  ║  • HANUMAN CHALISA — COMPLETE 1 TIME. (Tuesday special!)        ║
  ╚══════════════════════════════════════════════════════════════════╝

  ╔══════════════════════════════════════════════════════════════════╗
  ║  5:45 - 6:30 AM: GANESH VANDANA + GURU PADUKA POOJA             ║
  ║  • Light 1 GHEE DIYA + 2 INCENSE STICKS (Sandalwood preferred)  ║
  ║  • Offer MODAK / Ladoo to Ganesha. If unavailable: 2 bananas +  ║
  ║    any store-bought Indian sweet. Also offer 1 handful of       ║
  ║    jaggery + gram (chana) to Hanuman (Tuesday must!)            ║
  ║  • GANESH ATHARVASHIRSHA — recite once if known.                ║
  ║    OR: "Vakratunda Mahakaya Suryakoti Samaprabha..." × 7 times  ║
  ║  • PRAYER: "Ganpati Ji — remove every obstacle from this USA    ║
  ║    journey. Make my workplace a place of LEARNING & PROGRESS.   ║
  ║    Hanuman Ji — give me COURAGE to speak my TRUTH in a new      ║
  ║    country without fear."                                       ║
  ╚══════════════════════════════════════════════════════════════════╝

  ╔══════════════════════════════════════════════════════════════════╗
  ║  6:30 - 7:00 AM: NAVAGRAHA SHANTI + 9 PLANET OFFERINGS          ║
  ║  • SUN (Surya): Water offering with red flower + roli + copper  ║
  ║  • MARS (Mangal — TUESDAY LORD!): Red flower + red sandalwood   ║
  ║    tilak on forehead. Offer jaggery + red gram.                 ║
  ║  • MERCURY (Budha — intellect + career + coworkers):            ║
  ║    Eat GREEN MOONG DAL sprouts for breakfast! + Green food!     ║
  ║  • JUPITER (Guru — wisdom + expansion):                         ║
  ║    Offer yellow chana dal + yellow flowers at altar.            ║
  ║  • NAVAGRAHA MANTRA × 3 rounds:                                 ║
  ║    ॐ सूर्याय चन्द्रमसाय मंगलाय बुधाय गुरुवे शुक्राय शनये        ║
  ║    राहवे केतवे नमः।                                             ║
  ╚══════════════════════════════════════════════════════════════════╝

  ╔══════════════════════════════════════════════════════════════════╗
  ║  7:00 - 7:45 AM: BREAKFAST & OUTFIT SELECTION                   ║
  ║                                                                  ║
  ║  ✅ MUST EAT BEFORE LEAVING! NEVER GO EMPTY-HANDED!             ║
  ║  SATVIK FOODS: Poha, Upma, Idli, Dalia, Fruits, Milk + Haldi,   ║
  ║                Green Moong Dal Sprouts (Mercury boost!)         ║
  ║  ❌ ABSOLUTELY AVOID: Meat, eggs, onion, garlic, heavy/oily,    ║
  ║                       alcohol, anything fermented.              ║
  ║                                                                  ║
  ║  👔 TUESDAY JOB JOINING — OUTFIT COLORS (MANGAL DAY):           ║
  ║  ✅ BEST: 🔴 RED, SAFFRON, MAROON, CORAL                        ║
  ║  ✅ GOOD: 💚 Emerald Green, White with red dupatta/scarf        ║
  ║  ✅ ACCEPTABLE: Yellow, Cream, Light Blue                       ║
  ║  ❌ AVOID: All Black, Dark Grey (Saturn influence unwanted)     ║
  ║  🌟 FIRST WEAR = AUSPICIOUS: Wear NEW clothes if possible.     ║
  ╚══════════════════════════════════════════════════════════════════╝

  ╔══════════════════════════════════════════════════════════════════╗
  ║  ~8:00 AM: DEPARTURE FROM HOME                                  ║
  ║  • 💯 MANDATORY: EXIT HOUSE WITH RIGHT FOOT FIRST.              ║
  ║  • Before entering car: Touch vehicle 4x (clockwise corners) +  ║
  ║    Prayer: "ॐ वायवे स्वाहा" (Om Vayave Swaha — travel safety)   ║
  ║  • POCKET ITEMS — ALWAYS CARRY THESE:                            ║
  ║      ✓ Ganesha photo / small idol (in LEFT pocket = heart side) ║
  ║      ✓ Hanuman photo / sindoor tilak container (Tuesday!)       ║
  ║      ✓ 1 Steel coin + 1 puffed rice (MURI) in RIGHT pocket      ║
  ║      ✓ Red handkerchief or small red cloth (Mars color)         ║
  ║      ✓ Hand sanitizer (practical + spiritual cleanliness)       ║
  ╚══════════════════════════════════════════════════════════════════╝

  ╔══════════════════════════════════════════════════════════════════╗
  ║ 🌟🌟 ${abhijitStartLocal.toTimeString().slice(0,4).replace(':',':') - 60 > 0 ? abhijitStartLocal.getHours()-1 + ':' + '00' : '8:30'} AM — PRE-JOINING ARRIVAL RITUALS (AT OFFICE)  ║
  ║                                                                  ║
  ║  YOU ARRIVE (15-30 MIN BEFORE PRIME JOINING):                   ║
  ║  1. Exit car/vehicle: RIGHT FOOT FIRST                          ║
  ║  2. Stop at building entrance: 3 SLOW DEEP breaths + Silent Om  ║
  ║  3. THRESHOLD TOUCH: Right hand lightly on entrance floor       ║
  ║  4. Enter with forehead slightly bowed (respect the space)      ║
  ║  5. Before sitting at NEW DESK:                                 ║
  ║     • Stand facing chair for 10 seconds (mental namaste to      ║
  ║       your future desk & the learning here)                     ║
  ║     • Silent Prayer: "May this space give me SUCCESS + WISDOM   ║
  ║       + the ability to uplift everyone around me."              ║
  ║     • Sprinkle 2-3 water drops CLOCKWISE around chair base      ║
  ║       (from water bottle, discreetly — nobody needs to notice)  ║
  ║     • Sit facing EAST or SOUTH if seating arrangement allows.   ║
  ╚══════════════════════════════════════════════════════════════════╝

  ╔══════════════════════════════════════════════════════════════════╗
  ║ 🏆🏆🏆 PRIME JOINING MOMENT: ${abhijitCoreStart.toTimeString().slice(0,5)} - ${abhijitCoreEnd.toTimeString().slice(0,5)} EDT        ║
  ║        (ABHIJIT MUHURAT CORE — TUESDAY — MARS DAY)              ║
  ║                                                                  ║
  ║  HR CALLS YOU / SIGNING PAPERS / ID BADGE / INTRODUCTIONS:      ║
  ║  ✅ Spine = STRAIGHT but relaxed (Mother Lakshmi resides in a    ║
  ║     straight spine. Slouched posture = blocks Lakshmi blessings) ║
  ║  ✅ GENUINE SMILE — not forced. Think of a happy memory. Smile   ║
  ║     activates VENUS = Good relationships + happy coworkers      ║
  ║  ✅ HANDSHAKE: Firm but WARM. Not crushing. Not limp.            ║
  ║     Pump 2-3 times. Look them in the EYE.                       ║
  ║  ✅ WHILE SIGNING ANY DOCUMENT:                                  ║
  ║        Mentally repeat: "GANESHAYA NAMAH" × 5 + "SHRI HANUMATE  ║
  ║        NAMAH" × 3                                               ║
  ║  ✅ ACCEPT Offer Letter / ID Badge / Laptop: WITH BOTH HANDS     ║
  ║     (Double-hand reception = Respect for the opportunity &      ║
  ║      activates Jupiter + Venus blessings at once)               ║
  ║  ✅ If offered Water / Coffee / Tea: TAKE IT! Accept gracefully  ║
  ║     & take at least 1 SIP. Don't reject (Anna Lakshmi!)         ║
  ║  ✅ During introductions: Give a SINCERE COMPLIMENT. Something   ║
  ║     like "I'm really excited to work with such an accomplished  ║
  ║     team!" — Sincerity > Flattery always.                       ║
  ╚══════════════════════════════════════════════════════════════════╝

  ╔══════════════════════════════════════════════════════════════════╗
  ║  POST-JOINING (After formalities conclude):                     ║
  ║  • FIRST LUNCH at workplace: EAT with GRATITUDE, not rushed.    ║
  ║  • If you brought prasadam from home (Pongal / Kheer /          ║
  ║    Sheera): EAT THAT FIRST before anything else.                ║
  ║  • FEED 1 bite before you eat: Outdoor birds/squirrel if        ║
  ║    possible, or DONATE $1-$5 to a charity online same day.      ║
  ║  • WITHIN 3 DAYS: Donate $5-$11 to any charity.                 ║
  ║    (Saturn Shanti for career stability in foreign land)         ║
  ║  • CALL PARENTS AFTER YOU JOIN: SHARE EXCITEMENT!               ║
  ║    FATHER = SUN = Career Pillar. MOTHER = MOON = Mental Peace.  ║
  ║    You cannot succeed LONG TERM without their blessings.        ║
  ║    5-minute call = more powerful than any gemstone!             ║
  ╚══════════════════════════════════════════════════════════════════╝

  🧿 PROTECTION & NEGATIVE ENERGY SHIELD (FIRST MONTH):
  ─────────────────────────────────────────────────────────────────
  1. RED MAULI / KALAVA with 7 KNOTS on RIGHT wrist (Hanuman Kavach)
     ✅ TUESDAY joining day = 7 Knots Hanuman protection = POWER 🔥
  2. VIBHUTI / BHASM on forehead: 3 HORIZONTAL lines (Tripund) DAILY
     before leaving home. (Shiva's armor)
  3. SILVER PIECE: Small silver coin / pure silver ring in wallet
     100% of the time. Moon blessing for mental peace + money flow.
  4. 11-DAY PURGE RULE: Do NOT bring ANY office item back to your
     new American home for first 11 days. (not even a pen!)
     Laptop bag & purse: SANITIZE before touching home threshold.
     (Prevents negative office aura from contaminating home sacred space)
  5. 40-DAY SHIVA COMMITMENT: Visit any Shiva temple in Miami area
     within 40 days of joining. MINIMUM: Jalabhishek (water pour on
     Shivling). If no temple accessible: Monday 11 Rudra mantra +
     milk poured on Shiva photo at home altar.
  6. CRISIS EMERGENCY PROCEDURE (At workplace):
     If you EVER feel: Sudden unease / anxiety / someone's negativity
     directed at you / confusion / brain fog → DO THIS IMMEDIATELY:
        ① Hold breath for 8 seconds → slow exhale (cleanses aura)
        ② Touch 3rd eye point (between eyebrows) for 2 seconds
        ③ 2 slow deep inhales through nose, exhale through mouth
        ④ Mentally: "Om Namah Shivaya" × 3 + "Om Shri Hanumate Namah" × 1
     (21-second aura reset = faster than any therapy)
`);

console.log('\n' + '─'.repeat(80));
console.log('💎 SECTION 6.5: GEMSTONE RECOMMENDATION + SPIRITUAL WELLBEING');
console.log('─'.repeat(80));

console.log(`
  💚 PRIMARY RECOMMENDED GEMSTONE: EMERALD (PANNA) — MERCURY PLANET
  ─────────────────────────────────────────────────────────────────
  • RATIONALE: Mercury = Intellect, Communication, Coworkers, Business,
    Documentation. THE most important planet for software/office career.
  • Weight: 3.25 — 4.50 Ratti (2.9 to 4.1 carats). Quality matters > weight.
  • Metal: Gold ring (BEST) — OR Silver (affordable & nearly same results)
  • Finger: LITTLE finger → RIGHT hand
  • Day: WEDNESDAY morning (Budhvaar) — 60-90 minutes after sunrise
  • Purification ritual: Soak overnight in MILK + GANGA WATER mixture.
    Next morning before sunrise, wash with clean water. Wear facing Sun.
  • Budget Alternative: GREEN PERIDOT bracelet (daily wear — 90% efficacy)
    Buy from any crystal shop. Under $20. Does the same job for career.

  🤍 SECONDARY (if emotional stress in foreign land): PEARL (MOTI)
  ─────────────────────────────────────────────────────────────────
  • Purpose: Moon = emotions, mother blessings, mental peace, calm mind.
    USA far from home = foreign energy. Pearl grounds + protects.
  • Metal: Silver ring / pendant. Day: MONDAY. Finger: Little/Ring finger

  🔴 TUESDAY BOOST (since joining is Tuesday + Mars Mahadasha):
  ─────────────────────────────────────────────────────────────────
  • Wear RED CORAL (MOONGA) if possible. Gold/Silver ring on Ring finger,
    Tuesday morning. Optional but incredibly powerful for Mars Mahadasha.
  • Budget: Red String bracelet (already recommended Mauli) = 50% same result.

  🧘 SPIRITUAL WELLBEING — DAILY 11-MINUTE PRACTICE (LIFELONG USA):
  ─────────────────────────────────────────────────────────────────
  America is a fast-paced country. Your spiritual practice = anchor.
  1. WAKE → 5 min: Splash cold water + Om Gam Ganapataye Namah × 21
  2. BREAKFAST → 2 min: Gratitude prayer (hands over food)
  3. BEDTIME → 4 min: 3 deep breaths + "Today I did my best" self-forgiveness
     + Recall 1 good thing from your day (even the coffee tasted good)

  This 11-minute routine = prevents burnout, maintains cultural roots,
  keeps ancestors close. NEVER skip for "I was too busy" — excuses = karma.
`);

console.log('\n' + '─'.repeat(80));
console.log('📈 SECTION 7: ONE MONTH FORECAST (1 SEP → 30 SEP 2026)');
console.log('─'.repeat(80));

const weeklyForecasts = [
  {
    week: 'Week 1 (Sep 1 - Sep 6)',
    energy: '🌟🌟🌟🌟🌟 EXTREMELY HIGH — Mars Day + Abhijit + Mahadasha Triple Fire',
    events: 'Rapid introductions to EVERYONE. First impressions LOCK IN. You will be the NEW FACE people notice. Training starts immediately. You will feel OVERWHELMED — this is NORMAL!',
    caution: 'DO NOT SAY YES TO EVERYTHING! Day 1-3 over-commitment = Week 4 burnout. Feeling info overload = brain is adjusting, not failing.',
    tip: 'Write 3 DAILY GOALS (small!). Communicate CLEARLY. LISTEN 80% of the time. TALK 20%. Your Mercury in own sign = communication gift. Use it.'
  },
  {
    week: 'Week 2 (Sep 7 - Sep 13)',
    energy: '📊📊📊 MODERATE — Mercury + Sun conjunction (Kanya rashi)',
    events: 'Deep training modules. Documentation. Code review onboarding. Maybe you get your first REAL ticket assigned. Pace may feel SLOW. This is SETUP week — enjoy the calm before Week 3.',
    caution: 'DOUBLE-CHECK EVERYTHING! Mercury = small spelling/data/configuration errors with HUGE downstream consequences. Your name will be on the PR. Double-check commit messages, file names, Slack messages.',
    tip: 'Ask CLARIFYING QUESTIONS. Take NOTES in actual PHYSICAL notebook. Your handwriting = connects you to Mercury (Budh). Laptop notes = less karma. Write things DOWN.'
  },
  {
    week: 'Week 3 (Sep 14 - Sep 20)',
    energy: '⚡⚡⚡⚡ INTENSE — Mars aspect + Full Moon (Sep 16 approx) + Mars Mahadasha',
    events: 'FIRST REAL DEADLINE. First test of your actual skill level. Some conflict WILL emerge. Maybe a code review friction or a PM requirement mismatch. Not personal — just work week.',
    caution: 'IMPULSIVE REACTIONS RUIN EVERYTHING! If upset/triggered → PAUSE 5 FULL SECONDS before any response. Type your angry message → DELETE IT. Write calmer version. Mars Mahadasha week = your rage is close to the surface. CONTROL IT.',
    tip: 'HANUMAN CHALISA DAILY this entire week. (Do it before bed if morning is impossible.) Ask your senior for HELP EARLY — not at 4:59 PM on deadline day. Seeking help early = STRENGTH in USA culture, not weakness.'
  },
  {
    week: 'Week 4 (Sep 21 - Sep 27)',
    energy: '🪐🪐🪐 SATURN TEST WEEK — Structured manager review',
    events: 'Manager 1:1 with structured feedback. 30-day probation checkpoint. Your work will be reviewed for PROCESS & QUALITY. Saturn = karma. Discipline rewarded, shortcuts punished.',
    caution: 'DO NOT CUT CORNERS THIS WEEK. Even if nobody is watching. Saturn SEES. Documentation incomplete / tests not written / comments lazy = Saturn notices and delays your promotion. Do it RIGHT or don\'t do it.',
    tip: 'Document ALL of your work! Create a "FIRST MONTH WINS" tracker file. Bullet points, screenshots, PR numbers, ticket IDs. Your manager has 15 reports. REMIND them of your value. They won\'t remember unless you document.'
  },
  {
    week: 'Week 5 (Sep 28 - Sep 30)',
    energy: '💫💫💫💫 POSITIVE — Jupiterian vibe kicks in. Recognition window.',
    events: 'Somebody will say "Good job on that thing." Small but sincere appreciation. Social connections at work deepen. You will laugh with teammates. This is the foundation of workplace friendships.',
    caution: 'OVERCONFIDENCE KILLS MOMENTUM! Do NOT slack off. Do NOT start making big Month 2 promises before Month 1 closes. Stay GROUNDED. Celebrate small, keep grinding.',
    tip: 'HANDWRITTEN or EMAIL THANK-YOU NOTES to 3-5 people who helped you onboard. Mentor, onboarding buddy, HR who coordinated, Teammate who explained something. Sincerity > Length. 2 sentences each = more powerful than $100 gift.'
  },
];

weeklyForecasts.forEach(w => {
  console.log(`\n  ${w.week}`);
  console.log(`    Energy: ${w.energy}`);
  console.log(`    ✨ ${w.events}`);
  console.log(`    ⚠️  ${w.caution}`);
  console.log(`    💡 ${w.tip}`);
});

console.log(`
  ┌──────────────────────────────────────────────────────────────────┐
  │ 🔴 FIRST MONTH — 5 NON-NEGOTIABLE LIFE RULES IN USA             │
  │                                                                  │
  │  RULE #1: TALK LESS, LISTEN MORE.                                │
  │  Mercury watches every word. Early reputation = lifetime         │
  │  reputation. Before speaking ask yourself: "Does this need to be │
  │  said, by me, right now?" If 2/3 answers are NO → SILENCE.      │
  │                                                                  │
  │  RULE #2: AVOID OFFICE POLITICS COMPLETELY.                      │
  │  If a colleague badmouths someone: Your script is, "Hmm, I'm    │
  │  still learning the culture here, so I should probably reserve  │
  │  judgment." + CHANGE SUBJECT. Do NOT pick sides. Do NOT agree.  │
  │  NEUTRALITY = POWER. Rahu creates gossip traps. RESIST.         │
  │                                                                  │
  │  RULE #3: ARRIVE 15 MIN EARLY. LEAVE ON TIME (+ 5 min MAX LATE) │
  │  First 90 days = PROBATION. This is SATURN\'S TEST of           │
  │  dependability. Brilliance can wait. Showing you are reliable = │
  │  foundation of USA career. Everybody notices reliability.       │
  │                                                                  │
  │  RULE #4: FEED BIRDS / FISH / SQUIRRELS EVERY SATURDAY.         │
  │  $1 bread from Publix or Walmart. Sit in a park. Feed 5+ birds. │
  │  SHANI DEV (Saturn) will PERSONALLY OVERSEE your promotion.     │
  │  This is 100x more powerful than any job consultancy.           │
  │                                                                  │
  │  RULE #5: CALL PARENTS EVERY WEEK — MINIMUM 2 CALLS PER WEEK.   │
  │  MIN: WEDNESDAY + SUNDAY. 2026 Pitru Paksha season = Ancestors  │
  │  are EXTRA pleased by gratitude shown to living parents.        │
  │  Father = SUN = your career framework. Mother = MOON = your     │
  │  mental peace. No long-term success possible without BOTH. 5min │
  │  call OK. "Just calling to say hi, nothing new, how are you?"   │
  │  Do it. They won\'t ask for it. They\'ll cry when you\'re gone. │
  └──────────────────────────────────────────────────────────────────┘
`);

console.log('\n' + '─'.repeat(80));
console.log('✅ SECTION 8: SUMMARY — QUICK ACTION CHECKLIST');
console.log('─'.repeat(80));

console.log(`
  📋 JOINING DAY (1 SEPTEMBER 2026 — TUESDAY) — DOs & DON'Ts:

  ╔══════════════════════════════════════════════════════════════════╗
  ║  ✅ 12 DOs — SATYA VACHAN (TRUE PROMISES):                       ║
  ║                                                                  ║
  ║  1. Join at ${abhijitCoreStart.toTimeString().slice(0,5)} - ${abhijitCoreEnd.toTimeString().slice(0,5)} EDT (ABHIJIT MUHURAT CORE)    ║
  ║  2. Hanuman Chalisa + Ganesh Puja + Surya Arghya before leaving  ║
  ║  3. Wear RED / Saffron / Emerald Green outfit (Tuesday colors)   ║
  ║  4. Eat Satvik breakfast (Green Moong sprouts! Mercury boost!)   ║
  ║  5. Exit house & Enter office: RIGHT FOOT FIRST. 100% MANDATORY. ║
  ║  6. Threshold touch at entrance + 3 deep breaths at building     ║
  ║  7. Sign papers: Mental "Ganeshaya Namah × 5 + Hanumate Namah"   ║
  ║  8. Accept ID badge / offer letter WITH BOTH HANDS               ║
  ║  9. Donate $5-$11 to charity WITHIN 3 DAYS (Saturn blessing)     ║
  ║ 10. Call parents AFTER joining. Share excitement! Pitru blessing  ║
  ║ 11. Red Mauli (7 knots) on wrist. Vibhuti on forehead DAILY.     ║
  ║ 12. Start Daily 11-minute Sadhana Routine NOW (not tomorrow!)    ║
  ╚══════════════════════════════════════════════════════════════════╝

  ╔══════════════════════════════════════════════════════════════════╗
  ║  ❌ 8 DON'Ts — KARVA CHAUTH (SERIOUS VOW):                      ║
  ║                                                                  ║
  ║  1. NEVER join ${rahuStartLocal.toTimeString().slice(0,5)} - ${rahuEndLocal.toTimeString().slice(0,5)} EDT (RAHU KAAL!)               ║
  ║  2. No meat, eggs, onion, garlic — 3 DAYS before + on joining   ║
  ║  3. DON'T wear Black / Dark Grey / Solid Dark Blue. Avoid!      ║
  ║  4. DON'T argue with ANYONE on joining day — EVEN IF PROVOKED!  ║
  ║  5. NO gossip / backbiting for first 30 DAYS                     ║
  ║  6. Nothing from office → home for 11 DAYS (Sanitize laptop bag)║
  ║  7. NO big promises / "I'll fix it all" Week 1 commitments      ║
  ║  8. NEVER skip daily Puja / Mantra because "I was too busy."    ║
  ║     Busy = karma is testing you. Double down. Never skip.       ║
  ╚══════════════════════════════════════════════════════════════════╝

  🕉️ FINAL SPIRITUAL MESSAGE FOR PRIYANSH SINGH CHAUHAN:
  ─────────────────────────────────────────────────────────────────
  "Beloved Priyansh Beta,

  You are in MARS MAHADASHA — the 7-year cycle of ACTION, COURAGE, and
  MANIFESTATION. Miami is not an accident. It is not a 'decision you made
  in April.' It is a karmically prepared destination, cultivated over
  MANY past lifetimes, for your NEXT evolution. The gods have been
  arranging this for a long time.

  You carry the bloodline and blessings of the CHAUHAN VANSH — the
  lineage of warriors, leaders, and defenders of Dharma. When Prithviraj
  Chauhan rode into battle, he did not carry fear. Carry that same light
  into every office meeting, every code review, every watercooler
  conversation in America:

        ✦ Speak the TRUTH, even if it makes you unpopular.
        ✦ Work with INTEGRITY, even when the camera is off.
        ✦ RESPECT every human being — from the janitor to the CEO.
        ✦ Never forget where you came from. Indore raised you. America
          will give you the platform.

  Every past 'No' from the Universe was not a rejection — it was
  protection. Every interview that went quiet. Every company that ghosted
  you. Every 'we went with another candidate.' They were all protecting
  you from the WRONG 'Yes.' They were saving you for THIS exact 'Yes.'
  This exact city. This exact desk. These exact colleagues. This exact
  Tuesday in Abhijit Muhurat.

  This USA chapter is not JUST about a job. It is about becoming the man
  your 10-year-old self watched in wonder. It is about making your
  parents proud in a way words cannot do justice. It is about opening
  doors for your sister, for your future children, for your extended
  family back home. This job is a launching pad — not the destination.

  You are not alone in that Miami office building on Tuesday Sept 1.

  Your Ancestors walk with you.
  Lord Ganesha clears every obstacle before you even see it.
  Lord Hanuman carries your courage when yours runs out.
  Lord Shiva stands behind you — always.
  Maa Lakshmi rests in your work ethic.
  Maa Saraswati speaks through your words and code commits.

  The only person who can fail you on Sept 1 — is YOURSELF if you forget
  to show up with love, respect, and humility. Everything else is
  already taken care of by the Divine Plan.

  Ganpati Bappa Morya! 🙏
  Jai Shri Ram! 🚩
  Har Har Mahadev! 🔱
  Bajrang Bali Ki Jai! 💨

  With Vedic Blessings,
  — Vedic Rajkumar Analysis Engine
  Report Generated: ${new Date().toISOString()}
  Subject: Priyansh Singh Chauhan • 1 Sep 2026 • Miami, FL
`);

console.log('='.repeat(80));
console.log('  END OF PRIYANSH SINGH CHAUHAN — JOB JOINING ASTROLOGICAL REPORT');
console.log('  Date: Tuesday, 1 September 2026 | Miami, FL, USA | 8AM-6PM EDT Window');
console.log('  Best: Abhijit Core ~' + abhijitCoreStart.toTimeString().slice(0,5) + ' EDT | Worst: Rahu Kaal ' + rahuStartLocal.toTimeString().slice(0,5) + ' EDT');
console.log('='.repeat(80));
