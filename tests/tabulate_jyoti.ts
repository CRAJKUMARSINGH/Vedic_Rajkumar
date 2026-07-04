import { calcPlanetsAccurate, calculateCompleteAscendant, calculateVimshottariDasha } from '../packages/core/src';

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
const RASHI_LORDS: Record<string,string> = {
  'Aries':'Ma','Taurus':'Ve','Gemini':'Me','Cancer':'Mo',
  'Leo':'Su','Virgo':'Me','Libra':'Ve','Scorpio':'Ma',
  'Sagittarius':'Ju','Capricorn':'Sa','Aquarius':'Sa','Pisces':'Ju'
};
const RASHI_HI: Record<string,string> = {
  'Aries':'मेष   ','Taurus':'वृषभ  ','Gemini':'मिथुन ','Cancer':'कर्क  ',
  'Leo':'सिंह  ','Virgo':'कन्या ','Libra':'तुला  ','Scorpio':'वृश्चिक',
  'Sagittarius':'धनु   ','Capricorn':'मकर   ','Aquarius':'कुंभ  ','Pisces':'मीन   '
};

function getNakshatraPada(sid: number) {
  const span = 360 / 27;
  const idx = Math.floor(sid / span);
  const degInNak = sid % span;
  const pada = Math.floor(degInNak / (span / 4)) + 1;
  return { nakshatra: NAKSHATRAS[idx], pada, lord: NAKSHATRA_LORDS[idx] };
}

function toDMS(deg: number): string {
  const d = Math.floor(deg);
  const mFrac = (deg - d) * 60;
  const m = Math.floor(mFrac);
  const s = Math.round((mFrac - m) * 60);
  return `${String(d).padStart(2,'0')}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`;
}

async function run() {
  // Jyoti Chauhan — seed data
  const name  = 'Jyoti Chauhan';
  const date  = '1969-02-21';
  const time  = '16:45'; // IST
  const lat   = 22.68;
  const lon   = 74.95;
  const place = 'Rajgarh, MP';

  const asc = calculateCompleteAscendant(date, time, lat, lon);
  const ascRashi = asc.ascendant.rashiIndex;
  const planetaryPositions = await calcPlanetsAccurate(date, time);

  const rows: any[] = [
    { name:'Ascendant', sidereal: asc.ascendant.sidereal, rashiName: asc.ascendant.rashiName, retrograde: false, house: 1 }
  ];
  planetaryPositions.planets.forEach((p: any) => {
    const house = ((p.rashiIndex - ascRashi + 12) % 12) + 1;
    const sid = p.sidereal ?? (p.rashiIndex * 30 + p.degrees);
    rows.push({ name: p.name, sidereal: sid, rashiName: p.rashiName, retrograde: p.retrograde || false, house });
  });

  const moonSid = planetaryPositions.moon.sidereal ?? (planetaryPositions.moon.rashi * 30 + planetaryPositions.moon.degrees);
  const dasha = calculateVimshottariDasha(date, time, 3, moonSid);

  const SEP = '╠══════════╬═══════════════╬══════════════╬═════════════════════╬═════╬═══╬══════╬═════╬══════╣';
  const TOP = '╔══════════╦═══════════════╦══════════════╦═════════════════════╦═════╦═══╦══════╦═════╦══════╗';
  const BOT = '╚══════════╩═══════════════╩══════════════╩═════════════════════╩═════╩═══╩══════╩═════╩══════╝';

  console.log(`\n${TOP}`);
  console.log(`║  ${name.padEnd(8)} — जन्म कुंडली  |  ${date} ${time} IST  |  ${place.padEnd(12)}       ║`);
  console.log(`╠══════════╦═══════════════╦══════════════╦═════════════════════╦═════╦═══╦══════╦═════╦══════╣`);
  console.log(`║ ग्रह     ║ राशि          ║ DMS (Sidereal)║ नक्षत्र             ║ पाद ║ R ║ भाव  ║ रा.  ║ न.   ║`);
  console.log(SEP);

  rows.forEach(p => {
    const { nakshatra, pada, lord } = getNakshatraPada(p.sidereal);
    const rashiHi = (RASHI_HI[p.rashiName] ?? p.rashiName).substring(0,7).padEnd(7);
    const rashiLord = (RASHI_LORDS[p.rashiName] ?? '?').padEnd(3);
    const dms = toDMS(p.sidereal % 30);
    const pname = p.name.padEnd(9);
    const nak = nakshatra.padEnd(19);
    const ret = p.retrograde ? 'R' : ' ';
    const h = String(p.house).padEnd(4);
    const nl = lord.padEnd(4);
    const pd = String(pada).padEnd(3);
    console.log(`║ ${pname} ║ ${rashiHi} ║ ${dms}     ║ ${nak} ║ ${pd} ║ ${ret} ║ ${h}  ║ ${rashiLord} ║ ${nl} ║`);
  });

  console.log(BOT);

  console.log('\n--- Vimshottari Dasha ---');
  if (dasha?.current) {
    console.log(`Mahadasha : ${dasha.current.mahadasha}  ${dasha.current.startDate} → ${dasha.current.endDate}`);
    if (dasha.current.antardasha) {
      console.log(`Antardasha: ${dasha.current.antardasha.planet}  ${dasha.current.antardasha.startDate} → ${dasha.current.antardasha.endDate}`);
    }
  }
}

run().catch(console.error);
