import { calcPlanetsAccurate, calcAscendantAccurate, calculateVimshottariDasha } from '../packages/core/src';

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
  const idx  = Math.floor(sid / span);
  const degInNak = sid % span;
  const pada = Math.floor(degInNak / (span / 4)) + 1;
  return { nakshatra: NAKSHATRAS[idx], pada, lord: NAKSHATRA_LORDS[idx] };
}

function toDMS(deg: number): string {
  let d = Math.floor(deg);
  const mFrac = (deg - d) * 60;
  let m = Math.floor(mFrac);
  let s = Math.round((mFrac - m) * 60);
  if (s === 60) { s = 0; m++; }
  if (m === 60) { m = 0; d++; }
  return `${String(d).padStart(2,'0')}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`;
}

async function run() {
  const name  = 'Priyansh Singh Chauhan';
  const date  = '2000-10-26';
  const time  = '00:50'; // IST
  const lat   = 22.72;
  const lon   = 75.86;
  const place = 'Indore, MP';

  const asc   = await calcAscendantAccurate(date, time, lat, lon);
  const ascRashi = asc.ascendant.rashiIndex;
  const pp    = await calcPlanetsAccurate(date, time);

  const rows: any[] = [
    { name:'Ascendant', sidereal: asc.ascendant.sidereal, rashiName: asc.ascendant.rashiName, retrograde: false, house: 1 }
  ];
  pp.planets.forEach((p: any) => {
    const house = ((p.rashiIndex - ascRashi + 12) % 12) + 1;
    const sid   = p.sidereal ?? (p.rashiIndex * 30 + p.degrees);
    rows.push({ name: p.name, sidereal: sid, rashiName: p.rashiName, retrograde: p.retrograde || false, house });
  });

  const moonSid = pp.moon.sidereal ?? (pp.moon.rashi * 30 + pp.moon.degrees);
  const dasha   = calculateVimshottariDasha(date, time, 3, moonSid);

  const LINE = '╠══════════╬═══════════════╬══════════════╬═════════════════════╬═════╬═══╬══════╬═════╬══════╣';
  const TOP  = '╔══════════╦═══════════════╦══════════════╦═════════════════════╦═════╦═══╦══════╦═════╦══════╗';
  const BOT  = '╚══════════╩═══════════════╩══════════════╩═════════════════════╩═════╩═══╩══════╩═════╩══════╝';

  console.log(`\n${TOP}`);
  console.log(`║  ${name} — जन्म कुंडली  |  ${date}  ${time} IST  |  ${place}  ║`);
  console.log(LINE);
  console.log(`║ ग्रह      ║ राशि          ║ DMS (Sidereal)║ नक्षत्र             ║ पाद ║ R ║ भाव  ║ रा.  ║ न.   ║`);
  console.log(LINE);

  rows.forEach(p => {
    const { nakshatra, pada, lord } = getNakshatraPada(p.sidereal);
    const rashiHi  = (RASHI_HI[p.rashiName] ?? p.rashiName).substring(0,7).padEnd(7);
    const rashiLord= (RASHI_LORDS[p.rashiName] ?? '?').padEnd(3);
    const dms      = toDMS(p.sidereal % 30);
    const pname    = p.name.padEnd(9);
    const nak      = nakshatra.padEnd(19);
    const ret      = p.retrograde ? 'R' : ' ';
    const h        = String(p.house).padEnd(4);
    const nl       = lord.padEnd(4);
    const pd       = String(pada).padEnd(3);
    console.log(`║ ${pname} ║ ${rashiHi} ║ ${dms}     ║ ${nak} ║ ${pd} ║ ${ret} ║ ${h}  ║ ${rashiLord} ║ ${nl} ║`);
  });

  console.log(BOT);

  console.log('\n--- Vimshottari Dasha (Current) ---');
  if (dasha?.current) {
    console.log(`Mahadasha : ${dasha.current.mahadasha}  ${dasha.current.startDate} → ${dasha.current.endDate}`);
    if (dasha.current.antardasha) {
      const ad = dasha.current.antardasha;
      console.log(`Antardasha: ${ad.planet}  ${ad.startDate} → ${ad.endDate}`);
    }
  }
}

run().catch(console.error);
