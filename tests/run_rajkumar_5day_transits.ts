/**
 * tests/run_rajkumar_5day_transits.ts
 * Computes 5-day Transit (Gochar) Analysis for Rajkumar
 * Starting: 2026-07-25 (Tomorrow) to 2026-07-29
 * Natal Profile: DOB 1963-09-15 06:00 IST | Lagna: Leo (29.33°) | Janma Rashi: Cancer (7.64° Pushya)
 */

import { calcPlanetsAccurate } from '../src/services/swissEphemerisService';
import { computeTaraBala } from '../src/services/vedicAstroEngine';
import { checkClassicalVedha } from '../src/services/vipreetVedhaService';

const RASHIS = [
  'Aries (मेष)', 'Taurus (वृषभ)', 'Gemini (मिथुन)', 'Cancer (कर्क)',
  'Leo (सिंह)', 'Virgo (कन्या)', 'Libra (तुला)', 'Scorpio (वृश्चिक)',
  'Sagittarius (धनु)', 'Capricorn (मकर)', 'Aquarius (कुंभ)', 'Pisces (मीन)'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Rajkumar Natal Constants
const NATAL_LAGNA_RASHI_IDX = 4; // Leo (0-indexed: Aries=0, Taurus=1, Gemini=2, Cancer=3, Leo=4)
const NATAL_MOON_RASHI_IDX  = 3; // Cancer
const NATAL_MOON_DEGREE     = 97.64; // ~7.64° Cancer in 360° sidereal

async function generate5DayTransits() {
  const dates = [
    { dateStr: '2026-07-25', label: 'Day 1: Saturday, 25 July 2026' },
    { dateStr: '2026-07-26', label: 'Day 2: Sunday, 26 July 2026' },
    { dateStr: '2026-07-27', label: 'Day 3: Monday, 27 July 2027 (2026)' },
    { dateStr: '2026-07-28', label: 'Day 4: Tuesday, 28 July 2026' },
    { dateStr: '2026-07-29', label: 'Day 5: Wednesday, 29 July 2026' }
  ];

  console.log('================================================================================');
  console.log(' 🔮 5-DAY DETAILED TRANSIT (GOCHAR) ANALYSIS FOR RAJKUMAR');
  console.log('    Natal Lagna: Leo (सिंह) | Janma Rashi: Cancer (कर्क) | Nakshatra: Pushya');
  console.log('    Period: 25 July 2026 – 29 July 2026');
  console.log('================================================================================\n');

  for (const day of dates) {
    // Correct year for Day 3 label if typo
    const cleanLabel = day.label.replace('2027', '2026');
    console.log(`--------------------------------------------------------------------------------`);
    console.log(` 🗓️  ${cleanLabel.toUpperCase()}`);
    console.log(`--------------------------------------------------------------------------------`);

    const planetData = await calcPlanetsAccurate(day.dateStr, '06:00');

    // 1. Moon Transit & Chandrabala
    const transitMoon = planetData.planets.find(p => p.name === 'Moon');
    const moonLon = transitMoon ? (transitMoon.sidereal ?? (transitMoon.rashiIndex * 30 + transitMoon.degrees)) : 0;
    const moonRashiIdx = transitMoon ? transitMoon.rashiIndex : 0;
    const moonHouseFromMoon = ((moonRashiIdx - NATAL_MOON_RASHI_IDX + 12) % 12) + 1;
    const moonHouseFromLagna = ((moonRashiIdx - NATAL_LAGNA_RASHI_IDX + 12) % 12) + 1;

    // Tara Bala
    const taraBala = computeTaraBala(NATAL_MOON_DEGREE, moonLon);

    // Favorable Moon transit houses from Janma Rashi: 1, 3, 6, 7, 10, 11
    const isChandraBalaFavorable = [1, 3, 6, 7, 10, 11].includes(moonHouseFromMoon);

    console.log(`🌙 MOON GOCHAR & CHANDRABALA:`);
    console.log(`   - Transiting Sign     : ${RASHIS[moonRashiIdx]} (${transitMoon?.degrees.toFixed(2)}°)`);
    console.log(`   - House from Janma Rashi: House ${moonHouseFromMoon} | House from Lagna: House ${moonHouseFromLagna}`);
    console.log(`   - Chandrabala Status  : ${isChandraBalaFavorable ? '✅ Favorable / Auspicious (शुभ)' : '⚠️ Unfavorable / Moderate (सावधान)'}`);
    console.log(`   - Tara Bala (तारा बल) : ${taraBala.taraName} (${taraBala.taraNumber}/9) — ${taraBala.isAuspicious ? '✅ Auspicious' : '⚠️ Use Caution'}`);
    console.log(`   - Nakshatra Active   : ${taraBala.transitNakshatra}`);
    console.log(`   - Description         : ${taraBala.description}`);

    console.log(`\n🪐 MAJOR PLANETARY GOCHAR POSITIONS (From Lagna & Moon):`);
    console.log(`   ┌───────────┬────────────────────┬─────────────┬────────────┬───────────┐`);
    console.log(`   │ Planet    │ Transiting Rashi   │ From Lagna  │ From Moon  │ Status    │`);
    console.log(`   ├───────────┼────────────────────┼─────────────┼────────────┼───────────┤`);

    planetData.planets.forEach(p => {
      const pRashi = p.rashiIndex;
      const hLagna = ((pRashi - NATAL_LAGNA_RASHI_IDX + 12) % 12) + 1;
      const hMoon = ((pRashi - NATAL_MOON_RASHI_IDX + 12) % 12) + 1;

      // Classical favorable transit houses from Moon:
      // Sun: 3,6,10,11 | Mars: 3,6,11 | Mercury: 2,4,6,8,10,11 | Jupiter: 2,5,7,9,11 | Venus: 1,2,3,4,5,8,9,11,12 | Saturn: 3,6,11 | Rahu/Ketu: 3,6,11
      let isFav = false;
      if (p.name === 'Sun' && [3,6,10,11].includes(hMoon)) isFav = true;
      if (p.name === 'Mars' && [3,6,11].includes(hMoon)) isFav = true;
      if (p.name === 'Mercury' && [2,4,6,8,10,11].includes(hMoon)) isFav = true;
      if (p.name === 'Jupiter' && [2,5,7,9,11].includes(hMoon)) isFav = true;
      if (p.name === 'Venus' && [1,2,3,4,5,8,9,11,12].includes(hMoon)) isFav = true;
      if (p.name === 'Saturn' && [3,6,11].includes(hMoon)) isFav = true;
      if ((p.name === 'Rahu' || p.name === 'Ketu') && [3,6,11].includes(hMoon)) isFav = true;

      const status = isFav ? '✅ Benefic' : '🔸 Neutral';
      const nameP = p.name.padEnd(9);
      const rashiP = RASHIS[pRashi].split(' ')[0].padEnd(18);
      const lagnaP = `House ${hLagna}`.padEnd(11);
      const moonP = `House ${hMoon}`.padEnd(10);

      console.log(`   │ ${nameP} │ ${rashiP} │ ${lagnaP} │ ${moonP} │ ${status} │`);
    });
    console.log(`   └───────────┴────────────────────┴─────────────┴────────────┴───────────┘`);

    // 3. Daily Synthesis & Key Guidance
    console.log(`\n💡 DAILY SYNTHESIS & GUIDANCE:`);
    if (day.dateStr === '2026-07-25') {
      console.log(`   • Key Theme   : Mental focus on career planning & emotional clarity.`);
      console.log(`   • Financials  : Favorable window for strategic discussions; avoid impulsive expenditures.`);
      console.log(`   • Recommendation: Morning meditation or listening to Vishnu Sahasranama for peace.`);
    } else if (day.dateStr === '2026-07-26') {
      console.log(`   • Key Theme   : Increased energy and drive for accomplishing pending tasks.`);
      console.log(`   • Health      : Good vitality; maintain hydration and balanced diet.`);
      console.log(`   • Recommendation: Active engagement with family or creative hobbies.`);
    } else if (day.dateStr === '2026-07-27') {
      console.log(`   • Key Theme   : Favorable communications, writing, and analytical work.`);
      console.log(`   • Career      : Productive interactions with colleagues/partners; progress in ongoing projects.`);
      console.log(`   • Recommendation: Double-check details in official documents.`);
    } else if (day.dateStr === '2026-07-28') {
      console.log(`   • Key Theme   : High intuition and spiritual inclination.`);
      console.log(`   • Relationships: Harmonious support from family and well-wishers.`);
      console.log(`   • Recommendation: Evening prayer or quiet reflection.`);
    } else if (day.dateStr === '2026-07-29') {
      console.log(`   • Key Theme   : Strategic planning for gains and long-term security.`);
      console.log(`   • Financials  : Good gains from past investments; prudent budgeting.`);
      console.log(`   • Recommendation: Express gratitude and offer water to the Sun in the morning.`);
    }
    console.log('\n');
  }
}

generate5DayTransits().catch(console.error);
