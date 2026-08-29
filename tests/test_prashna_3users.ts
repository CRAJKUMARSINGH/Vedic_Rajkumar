/**
 * tests/test_prashna_3users.ts
 * 12-HOUSES HOROSCOPE AUDIT & 3 QUESTION-TIME (PRASHNA) HOUSE-MATTERS TEST
 * 
 * Tests strictly 12-House Horoscope Matters (NO TRANSIT DEPENDENCY):
 *  - 1 Pre-existing user in repo (Rajkumar)
 *  - 2 Shared users (Priyansh Singh Chauhan & Jyoti Chauhan)
 *  - 3 Question-Time users asking specifically about 12-House Horoscope Matters
 *    (7th/4th House Marriage & Property, 10th/11th House Career & Gains, 1st/6th House Health & Vitality)
 */

import { calculatePrashnaHoroscope, PrashnaQuery } from '../src/services/prashnaService';
import { calcPlanetsAccurate, calcHousesAccurate } from '../src/services/swissEphemerisService';

async function run12HousesAuditTest() {
  console.log('================================================================================');
  console.log(' 🪐 VEDIC RAJKUMAR — PURE 12-HOUSES HOROSCOPE MATTERS & QUESTION-TIME AUDIT');
  console.log('    (1 REPO USER + 2 SHARED USERS + 3 HOROSCOPE HOUSE-MATTERS QUESTION USERS)');
  console.log('================================================================================\n');

  // ---------------------------------------------------------------------------
  // SECTION 1: NATAL 12-HOUSE CHARTS (1 REPO USER + 2 SHARED USERS)
  // ---------------------------------------------------------------------------
  const natalUsers = [
    {
      name: 'Rajkumar (Pre-existing in Repo)',
      date: '1963-09-15',
      time: '06:00',
      lat: 23.84,
      lon: 73.71,
      place: 'Aspur, Rajasthan'
    },
    {
      name: 'Priyansh Singh Chauhan (Shared User 1)',
      date: '2011-09-18',
      time: '06:58',
      lat: 23.52,
      lon: 77.82,
      place: 'Vidisha, MP'
    },
    {
      name: 'Jyoti Chauhan (Shared User 2)',
      date: '1992-01-20',
      time: '14:30',
      lat: 22.72,
      lon: 75.86,
      place: 'Indore, MP'
    }
  ];

  console.log('--------------------------------------------------------------------------------');
  console.log(' PART A: 12-HOUSE NATAL HOROSCOPE BREAKDOWN (3 USERS)');
  console.log('--------------------------------------------------------------------------------');

  for (const user of natalUsers) {
    try {
      const houses = await calcHousesAccurate(user.date, user.time, user.lat, user.lon);
      const planets = await calcPlanetsAccurate(user.date, user.time);

      const ascRashiIdx = Math.floor(houses.ascendant / 30) % 12;
      const RASHIS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

      console.log(`\n👤 SUBJECT: ${user.name}`);
      console.log(`   DOB: ${user.date} | TOB: ${user.time} IST | Place: ${user.place} (${user.lat}°, ${user.lon}°)`);
      console.log(`   Ascendant (Lagna): ${RASHIS[ascRashiIdx]} at ${(houses.ascendant % 30).toFixed(2)}°`);
      console.log('   Full 12-House Analysis:');

      for (let h = 1; h <= 12; h++) {
        const rName = RASHIS[(ascRashiIdx + h - 1) % 12];
        const occupants = planets.planets
          .filter(p => (((p.rashiIndex - ascRashiIdx + 12) % 12) + 1) === h)
          .map(p => `${p.name} (${p.degrees.toFixed(1)}°)`);

        const occStr = occupants.length > 0 ? occupants.join(', ') : 'Empty';
        console.log(`     House ${String(h).padStart(2)} [${rName.padEnd(11)}]: ${occStr}`);
      }
      console.log('   ✅ Result: 12-House Natal Horoscope tabulation complete.');
    } catch (err: any) {
      console.error(`   ❌ Error for ${user.name}:`, err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 2: 3 QUESTION-TIME USERS (STRICTLY 12-HOUSE HOROSCOPE MATTERS)
  // ---------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log(' PART B: 3 QUESTION-TIME USERS — PURE 12-HOUSE HOROSCOPE MATTERS (NO TRANSIT)');
  console.log('--------------------------------------------------------------------------------');

  const houseMattersQueries: PrashnaQuery[] = [
    {
      question: 'Question User 1 (7th & 4th House Matters): What are the 7th House Marriage/Spouse & 4th House Property indicators in the Prashna Horoscope?',
      category: 'marriage',
      queryDate: '2026-07-24',
      queryTime: '10:30',
      latitude: 24.58,
      longitude: 73.71,
      placeName: 'Udaipur, Rajasthan'
    },
    {
      question: 'Question User 2 (10th & 11th House Matters): What are the 10th House Career/Profession & 11th House Income/Gains indicators in the Prashna Horoscope?',
      category: 'career',
      queryDate: '2026-07-24',
      queryTime: '14:15',
      latitude: 26.91,
      longitude: 75.78,
      placeName: 'Jaipur, Rajasthan'
    },
    {
      question: 'Question User 3 (1st & 6th House Matters): What are the 1st House Health/Vitality & 6th House Disease/Resistance indicators in the Prashna Horoscope?',
      category: 'health',
      queryDate: '2026-07-24',
      queryTime: '18:45',
      latitude: 28.61,
      longitude: 77.20,
      placeName: 'New Delhi'
    }
  ];

  for (let i = 0; i < houseMattersQueries.length; i++) {
    const query = houseMattersQueries[i];
    console.log(`\n❓ QUESTION USER ${i + 1}: "${query.question}"`);
    console.log(`   Question Timestamp: ${query.queryDate} ${query.queryTime} IST | Place: ${query.placeName}`);

    const res = await calculatePrashnaHoroscope(query);

    console.log(`   Prashna Lagna : ${res.prashnaLagna.rashiName} (Lord: ${res.prashnaLagna.lord})`);
    console.log(`   Primary House : House ${res.primaryHouseNumber} (${res.karyesh.rashiName})`);
    console.log(`   Karyesh Lord  : ${res.karyesh.planet} (Positioned in House ${res.karyesh.house})`);
    console.log(`   Moon Position : House ${res.moonDetails.house} in ${res.moonDetails.rashiName} (${res.moonDetails.nakshatra} Nakshatra)`);
    console.log(`   Tajika Yogas  : ${res.tajikaYogas.map(y => `${y.name} [${y.nature}]`).join(' | ') || 'Harmonious House Aspects'}`);
    console.log(`   VERDICT       : 🏆 ${res.verdict}`);
    console.log(`   House Analysis: ${res.verdictSummary}`);
    console.log('   ✅ Result: 12-House Horoscope Matter Evaluation Complete.');
  }

  console.log('\n================================================================================');
  console.log(' 🏁 ALL 12-HOUSE NATAL & QUESTION-TIME HOUSE-MATTERS AUDITS COMPLETED');
  console.log('================================================================================\n');
}

run12HousesAuditTest().catch(console.error);
