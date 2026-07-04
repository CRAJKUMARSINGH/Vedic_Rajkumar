import { calcPlanetsAccurate, calculateCompleteAscendant, calculateVimshottariDasha } from '../packages/core/src';

// Nakshatra data (27 nakshatras, each 13°20' = 13.333°)
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
  'Aries':'मेष','Taurus':'वृषभ','Gemini':'मिथुन','Cancer':'कर्क',
  'Leo':'सिंह','Virgo':'कन्या','Libra':'तुला','Scorpio':'वृश्चिक',
  'Sagittarius':'धनु','Capricorn':'मकर','Aquarius':'कुंभ','Pisces':'मीन'
};

function getNakshatraPada(sidereal: number): { nakshatra: string; pada: number; nakshatraLord: string } {
  const idx = Math.floor(sidereal / (360 / 27));
  const degInNak = sidereal % (360 / 27);
  const pada = Math.floor(degInNak / (360 / 108)) + 1;
  return {
    nakshatra: NAKSHATRAS[idx],
    pada,
    nakshatraLord: NAKSHATRA_LORDS[idx]
  };
}

function toDMS(deg: number): string {
  const d = Math.floor(deg);
  const mFrac = (deg - d) * 60;
  const m = Math.floor(mFrac);
  const s = Math.round((mFrac - m) * 60);
  return `${String(d).padStart(2,'0')}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`;
}

async function run() {
  const date = '2011-09-18';
  const time = '06:58'; // IST
  const lat  = 23.52;
  const lon  = 77.82;

  const asc = calculateCompleteAscendant(date, time, lat, lon);
  const ascRashi = asc.ascendant.rashiIndex;
  const planets = await calcPlanetsAccurate(date, time);

  // Build rows
  const rows: any[] = [
    { abbr: 'As', name: 'Ascendant', sidereal: asc.ascendant.sidereal, retrograde: false, rashiName: asc.ascendant.rashiName, house: 1 }
  ];

  planets.planets.forEach((p: any) => {
    const house = ((p.rashiIndex - ascRashi + 12) % 12) + 1;
    rows.push({ abbr: p.name.substring(0,2), name: p.name, sidereal: p.sidereal ?? (p.rashiIndex * 30 + p.degrees), retrograde: p.retrograde || false, rashiName: p.rashiName, house });
  });

  // Dasha
  const moon = planets.moon;
  const moonSidereal = moon.sidereal ?? (moon.rashi * 30 + moon.degrees);
  const dasha = calculateVimshottariDasha(date, time, 3, moonSidereal);

  console.log('\n╔══════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           वीरप्रताप — जन्म कुंडली (Jyotish Chart)  18-Sep-2011, 06:58 IST, Vidisha      ║');
  console.log('╠══════════╦═══════════╦════════════╦═════════════════╦══════╦═══╦═══════╦═══════╦════════╣');
  console.log('║ ग्रह     ║ राशि      ║ DMS        ║ नक्षत्र         ║ पाद  ║ R ║ भाव   ║ रा.स्व║ न.स्व  ║');
  console.log('╠══════════╬═══════════╬════════════╬═════════════════╬══════╬═══╬═══════╬═══════╬════════╣');

  rows.forEach(p => {
    const sid = p.sidereal;
    const { nakshatra, pada, nakshatraLord } = getNakshatraPada(sid);
    const rashiLord = RASHI_LORDS[p.rashiName] ?? '?';
    const rashiHi = (RASHI_HI[p.rashiName] ?? p.rashiName).padEnd(6);
    const dmsStr = toDMS(sid % 30);
    const planet = (p.name ?? p.abbr).padEnd(8);
    const nak = nakshatra.padEnd(15);
    const ret = p.retrograde ? 'R' : ' ';
    const houseStr = String(p.house).padEnd(5);
    const rl = rashiLord.padEnd(5);
    const nl = nakshatraLord.padEnd(6);
    console.log(`║ ${planet} ║ ${rashiHi} ║ ${dmsStr} ║ ${nak} ║ ${String(pada).padEnd(4)} ║ ${ret} ║ ${houseStr} ║ ${rl} ║ ${nl} ║`);
  });

  console.log('╚══════════╩═══════════╩════════════╩═════════════════╩══════╩═══╩═══════╩═══════╩════════╝');

  console.log('\n--- Vimshottari Dasha (Current) ---');
  if (dasha?.current) {
    console.log(`Mahadasha : ${dasha.current.mahadasha}  (${dasha.current.startDate} → ${dasha.current.endDate})`);
    if (dasha.current.antardasha) {
      console.log(`Antardasha: ${dasha.current.antardasha.planet}  (${dasha.current.antardasha.startDate} → ${dasha.current.antardasha.endDate})`);
    }
  }
}

run().catch(console.error);
