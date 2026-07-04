/**
 * test_lagna_chart.ts — Lagna Chart Test Runner
 * ──────────────────────────────────────────────
 * Exercises the complete Vedic astrology calculation pipeline:
 *   ascendantService → ephemerisService → kundliService
 *
 * Test subject: Priyanka (23 Oct 1984, 05:50 IST, Ahmedabad)
 *
 * Run: npx tsx tests/test_lagna_chart.ts
 */

import { calculateCompleteAscendant, formatAscendant } from '../src/services/ascendantService';
import { calculateCompletePlanetaryPositions, RASHI_NAMES } from '../src/services/ephemerisService';
import { calculateKundli } from '../src/services/kundliService';

// ── Nakshatra data ──────────────────────────────────────────────────────────
const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadra','Uttara Bhadra','Revati'
];
const NAKSHATRA_LORDS = [
  'Ke','Ve','Su','Mo','Ma','Ra','Ju','Sa','Me',
  'Ke','Ve','Su','Mo','Ma','Ra','Ju','Sa','Me',
  'Ke','Ve','Su','Mo','Ma','Ra','Ju','Sa','Me'
];
const RASHI_HI: Record<string, string> = {
  'Aries':'मेष','Taurus':'वृषभ','Gemini':'मिथुन','Cancer':'कर्क',
  'Leo':'सिंह','Virgo':'कन्या','Libra':'तुला','Scorpio':'वृश्चिक',
  'Sagittarius':'धनु','Capricorn':'मकर','Aquarius':'कुंभ','Pisces':'मीन'
};

function getNakshatraPada(siderealDeg: number) {
  const span = 360 / 27;
  const idx  = Math.floor(siderealDeg / span);
  const degInNak = siderealDeg % span;
  const pada = Math.floor(degInNak / (span / 4)) + 1;
  return { nakshatra: NAKSHATRAS[idx] ?? '?', pada, lord: NAKSHATRA_LORDS[idx] ?? '?' };
}

function toDMS(deg: number): string {
  const d = Math.floor(deg);
  const mFrac = (deg - d) * 60;
  const m = Math.floor(mFrac);
  const s = Math.round((mFrac - m) * 60);
  return `${String(d).padStart(2,'0')}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`;
}

// ── Birth Data ──────────────────────────────────────────────────────────────
const BIRTH = {
  name:  'Priyanka',
  date:  '1984-10-23',
  time:  '05:50',
  lat:   23.0225,       // Ahmedabad
  lon:   72.5714,
  tz:    5.5,           // IST
  place: 'Ahmedabad, Gujarat'
};

// ── Main ────────────────────────────────────────────────────────────────────
function run() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log(`║  🕉️  LAGNA CHART TEST — ${BIRTH.name}                                        ║`);
  console.log(`║  ${BIRTH.date}  ${BIRTH.time} IST  •  ${BIRTH.place.padEnd(40)}   ║`);
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // ── Step 1: Ascendant ───────────────────────────────────────────────────
  console.log('━━━ Step 1: Ascendant (Lagna) Calculation ━━━');
  const asc = calculateCompleteAscendant(BIRTH.date, BIRTH.time, BIRTH.lat, BIRTH.lon, BIRTH.tz);
  console.log(`  Tropical Ascendant : ${toDMS(asc.ascendant.tropical)}`);
  console.log(`  Ayanamsa (Lahiri)  : ${asc.ayanamsa.toFixed(4)}°`);
  console.log(`  Sidereal Ascendant : ${toDMS(asc.ascendant.sidereal)}`);
  console.log(`  Lagna Rashi        : ${asc.ascendant.rashiName} (${RASHI_HI[asc.ascendant.rashiName] ?? ''})`);
  console.log(`  Degree in Rashi    : ${toDMS(asc.ascendant.degrees)}`);
  console.log(`  Formatted          : ${formatAscendant(asc)}`);
  console.log(`  LST (hours)        : ${asc.lst.toFixed(4)}`);
  console.log();

  // ── Step 2: Planetary Positions ─────────────────────────────────────────
  console.log('━━━ Step 2: Planetary Positions (Sidereal) ━━━');
  const pp = calculateCompletePlanetaryPositions(BIRTH.date, BIRTH.time);

  const ascRashi = asc.ascendant.rashiIndex;

  // Build rows: Ascendant + 9 planets
  type Row = {
    name: string; sidereal: number; rashiName: string;
    retrograde: boolean; house: number; dignity: string;
  };

  const rows: Row[] = [
    {
      name: 'Ascendant',
      sidereal: asc.ascendant.sidereal,
      rashiName: asc.ascendant.rashiName,
      retrograde: false,
      house: 1,
      dignity: '—'
    }
  ];

  pp.planets.forEach(p => {
    const house = ((p.rashiIndex - ascRashi + 12) % 12) + 1;
    const sid = p.rashiIndex * 30 + p.degrees;
    rows.push({
      name: p.name,
      sidereal: sid,
      rashiName: p.rashiName,
      retrograde: p.retrograde ?? false,
      house,
      dignity: p.dignity
    });
  });

  // Print table
  const SEP = '╠═══════════╬══════════╬═══════════════╬══════════════════════╬══════╬═══╬══════╬═══════════════╣';
  const TOP = '╔═══════════╦══════════╦═══════════════╦══════════════════════╦══════╦═══╦══════╦═══════════════╗';
  const BOT = '╚═══════════╩══════════╩═══════════════╩══════════════════════╩══════╩═══╩══════╩═══════════════╝';

  console.log(TOP);
  console.log('║ ग्रह      ║ राशि     ║ DMS (Sidereal)║ नक्षत्र              ║ पाद  ║ R ║ भाव  ║ Dignity       ║');
  console.log(SEP);

  rows.forEach(p => {
    const { nakshatra, pada, lord } = getNakshatraPada(p.sidereal);
    const pname    = p.name.padEnd(9);
    const rashiHi  = (RASHI_HI[p.rashiName] ?? p.rashiName).padEnd(8);
    const dms      = toDMS(p.sidereal % 30).padEnd(13);
    const nak      = `${nakshatra} (${lord})`.padEnd(20);
    const pd       = String(pada).padEnd(4);
    const ret      = p.retrograde ? 'R' : ' ';
    const h        = String(p.house).padEnd(4);
    const dig      = p.dignity.padEnd(13);
    console.log(`║ ${pname} ║ ${rashiHi} ║ ${dms} ║ ${nak} ║ ${pd} ║ ${ret} ║ ${h} ║ ${dig} ║`);
  });
  console.log(BOT);

  // ── Step 3: Kundli (Full Chart) ─────────────────────────────────────────
  console.log('\n━━━ Step 3: Full Kundli via kundliService ━━━');
  const kundli = calculateKundli(BIRTH.date, BIRTH.time, BIRTH.lat, BIRTH.lon, BIRTH.tz);

  console.log(`  Chart Style : ${kundli.chartStyle}`);
  console.log(`  Lagna       : ${kundli.ascendant.ascendant.rashiName} ${toDMS(kundli.ascendant.ascendant.degrees)}`);
  console.log();

  // House summary
  console.log('  ┌──────┬──────────────┬──────────┬───────────────────────────────────┐');
  console.log('  │ भाव  │ राशि         │ Lord     │ Planets                           │');
  console.log('  ├──────┼──────────────┼──────────┼───────────────────────────────────┤');
  kundli.houses.forEach(h => {
    const num = String(h.houseNumber).padStart(4);
    const rashi = `${h.rashiName} (${h.rashiNameHi})`.padEnd(12);
    const lord = h.lord.padEnd(8);
    const planets = h.planets.length > 0
      ? h.planets.map(p => `${p.name}${p.retrograde ? '(R)' : ''}`).join(', ')
      : '—';
    console.log(`  │ ${num} │ ${rashi} │ ${lord} │ ${planets.padEnd(33)} │`);
  });
  console.log('  └──────┴──────────────┴──────────┴───────────────────────────────────┘');

  // ── Step 4: Dignities ───────────────────────────────────────────────────
  console.log('\n━━━ Step 4: Planetary Dignities ━━━');
  kundli.dignityData.forEach(d => {
    const icon = d.dignity === 'exalted' ? '🟢' :
                 d.dignity === 'debilitated' ? '🔴' :
                 d.dignity === 'own-sign' ? '🟡' :
                 d.dignity === 'moolatrikona' ? '🟡' :
                 d.dignity === 'friend' ? '🟢' :
                 d.dignity === 'enemy' ? '🔴' : '⚪';
    console.log(`  ${icon} ${d.planet.padEnd(8)} → ${d.dignity.padEnd(14)} (strength: ${d.strength.toFixed(1)}) — ${d.description}`);
  });

  // ── Step 5: Aspects ────────────────────────────────────────────────────
  console.log('\n━━━ Step 5: Planetary Aspects ━━━');
  kundli.aspectsData.forEach(a => {
    const houses = a.aspectingHouses.join(', ');
    const planets = a.aspectingPlanets.length > 0 ? a.aspectingPlanets.join(', ') : 'none';
    console.log(`  ${a.planet.padEnd(8)} aspects houses [${houses}] → hitting planets: ${planets}`);
  });

  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅  LAGNA CHART TEST COMPLETED SUCCESSFULLY                                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
}

run();
