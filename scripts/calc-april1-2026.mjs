// Verify planetary positions for April 1, 2026 (12:00 IST = 06:30 UTC)
// Uses FIXED Meeus VSOP87-lite algorithms matching ephemerisService.ts

const AYANAMSA_2000 = 23.85;
const AYANAMSA_RATE = 0.0139;

function julianDay(y, mo, d, h, mi) {
  const hh = h + mi / 60;
  let yr = y, m = mo;
  if (m <= 2) { yr--; m += 12; }
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (m + 1)) + d + hh / 24 + B - 1524.5;
}

const JD = julianDay(2026, 4, 1, 6, 30); // 12:00 IST = 06:30 UTC
const n  = JD - 2451545.0;               // days since J2000
const T  = n / 36525.0;                  // Julian centuries
const ay = AYANAMSA_2000 + (2026 - 2000) * AYANAMSA_RATE;

const RASHIS = ['Mesh (Aries)', 'Vrishabh (Taurus)', 'Mithun (Gemini)', 'Kark (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischik (Scorpio)',
  'Dhanu (Sagittarius)', 'Makar (Capricorn)', 'Kumbh (Aquarius)', 'Meen (Pisces)'];

const sin = x => Math.sin(x * Math.PI / 180);
const sid = t => (((t - ay) % 360) + 360) % 360;
const rs  = l => Math.floor(l / 30);
const dg  = l => (l % 30).toFixed(2);

// ── Sun (unchanged — was already accurate) ────────────────────────────────────
const sunL = ((280.460 + 0.9856474 * n) % 360 + 360) % 360;
const sunG = ((357.528 + 0.9856003 * n) % 360 + 360) % 360;
const sun  = sid(sunL + 1.915 * sin(sunG) + 0.020 * sin(2 * sunG));

// ── Moon (unchanged — was already accurate) ───────────────────────────────────
const moonL  = ((218.316 + 13.176396 * n) % 360 + 360) % 360;
const moonM  = ((134.963 + 13.064993 * n) % 360 + 360) % 360;
const moonMs = ((357.529 + 0.985600  * n) % 360 + 360) % 360;
const moon   = sid(moonL + 6.289 * sin(moonM) + 1.274 * sin(2 * (moonL - moonMs)) +
               0.658 * sin(2 * (moonL - moonMs)) + 0.214 * sin(2 * moonM) - 0.186 * sin(moonMs));

// ── Mercury — FIXED: Meeus VSOP87-lite ───────────────────────────────────────
const mercL0 = 252.250906 + 149474.0722491 * T + 0.0003035 * T * T;
const mercM  = ((174.7948 + 4.09233445 * n) % 360 + 360) % 360;
const merc   = sid(mercL0 + 23.4400 * sin(mercM) + 2.9818 * sin(2 * mercM) +
               0.5255 * sin(3 * mercM) + 0.1058 * sin(4 * mercM) + 0.0219 * sin(5 * mercM));

// ── Venus — FIXED: Meeus VSOP87-lite ─────────────────────────────────────────
const venL0 = 181.979801 + 58519.2130302 * T + 0.00031014 * T * T;
const venM  = ((212.2606 + 1.60213034 * n) % 360 + 360) % 360;
const ven   = sid(venL0 + 0.7758 * sin(venM) + 0.0033 * sin(2 * venM));

// ── Mars — FIXED: Meeus VSOP87-lite ──────────────────────────────────────────
const marsL0 = 355.433 + 19141.6964471 * T + 0.00031052 * T * T;
const marsM  = ((19.3730 + 0.52402068 * n) % 360 + 360) % 360;
const mars   = sid(marsL0 + 10.6912 * sin(marsM) + 0.6228 * sin(2 * marsM) +
               0.0503 * sin(3 * marsM) + 0.0046 * sin(4 * marsM));

// ── Jupiter — FIXED: Meeus VSOP87-lite ───────────────────────────────────────
const jupL0 = 34.351519 + 3036.3027748 * T + 0.0002233 * T * T;
const jupM  = ((20.9 + 0.08309103 * n) % 360 + 360) % 360;
const jup   = sid(jupL0 + 5.5549 * sin(jupM) + 0.1683 * sin(2 * jupM) + 0.0071 * sin(3 * jupM));

// ── Saturn — FIXED: Meeus VSOP87-lite ────────────────────────────────────────
const satL0 = 50.077444 + 1223.5110686 * T + 0.00051908 * T * T;
const satM  = ((317.020 + 0.03344422 * n) % 360 + 360) % 360;
const sat   = sid(satL0 + 6.3585 * sin(satM) + 0.2204 * sin(2 * satM) + 0.0106 * sin(3 * satM));

// ── Rahu / Ketu ───────────────────────────────────────────────────────────────
const rahu = sid(((125.044 - 0.052954 * n) % 360 + 360) % 360);
const ketu = (rahu + 180) % 360;

// ── Reference (prokerala.com sidereal, April 1 2026) ─────────────────────────
const REF = {
  Sun:     { rashi: 11, deg: 18.0,  name: 'Meen (Pisces)' },      // tropical Aries 12° - 24° = Pisces ~18°
  Moon:    { rashi:  5, deg: 15.5,  name: 'Kanya (Virgo)' },      // tropical Libra 9° - 24° = Virgo ~15°
  Mercury: { rashi: 10, deg: 20.0,  name: 'Kumbh (Aquarius)' },   // tropical Pisces 14° - 24° = Aquarius ~20°
  Venus:   { rashi:  0, deg:  8.5,  name: 'Mesh (Aries)' },       // tropical Taurus 2° - 24° = Aries ~8°
  Mars:    { rashi: 10, deg: 29.6,  name: 'Kumbh (Aquarius)' },   // tropical Pisces 23° - 24° = Aquarius ~29°
  Jupiter: { rashi:  2, deg: 21.6,  name: 'Mithun (Gemini)' },    // tropical Cancer 15° - 24° = Gemini ~21°
  Saturn:  { rashi: 11, deg: 11.4,  name: 'Meen (Pisces)' },      // tropical Aries 5° - 24° = Pisces ~11°
  Rahu:    { rashi: 10, deg: 14.5,  name: 'Kumbh (Aquarius)' },   // tropical Pisces 8° - 24° = Aquarius ~14°
};

const results = [
  { name: 'Sun (Surya)',    our: sun,  ref: REF.Sun },
  { name: 'Moon (Chandra)', our: moon, ref: REF.Moon },
  { name: 'Mercury (Budh)', our: merc, ref: REF.Mercury },
  { name: 'Venus (Shukra)', our: ven,  ref: REF.Venus },
  { name: 'Mars (Mangal)',  our: mars, ref: REF.Mars },
  { name: 'Jupiter (Guru)', our: jup,  ref: REF.Jupiter },
  { name: 'Saturn (Shani)', our: sat,  ref: REF.Saturn },
  { name: 'Rahu (R)',       our: rahu, ref: REF.Rahu },
];

console.log('');
console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║  GOCHAR ACCURACY CHECK — April 1, 2026 | 12:00 IST                     ║');
console.log('║  Reference: prokerala.com (sidereal/Vedic)                              ║');
console.log('╠══════════════════════════════════════════════════════════════════════════╣');
console.log('║  Planet          │ Our App (Rashi)        │ Reference (Rashi)  │ Match  ║');
console.log('╠══════════════════════════════════════════════════════════════════════════╣');

let correct = 0, total = 0;
for (const r of results) {
  const ourRashi = rs(r.our);
  const match = ourRashi === r.ref.rashi ? '✅' : '❌';
  if (ourRashi === r.ref.rashi) correct++;
  total++;
  const ourStr = `${RASHIS[ourRashi]} ${dg(r.our)}°`;
  const refStr = `${r.ref.name} ~${r.ref.deg}°`;
  console.log(`║  ${r.name.padEnd(16)} │ ${ourStr.padEnd(22)} │ ${refStr.padEnd(18)} │  ${match}   ║`);
}

console.log('╠══════════════════════════════════════════════════════════════════════════╣');
console.log(`║  ACCURACY: ${correct}/${total} signs correct (${Math.round(correct/total*100)}%)                                       ║`);
console.log('╚══════════════════════════════════════════════════════════════════════════╝');
console.log('');
if (correct < total) {
  console.log('⚠️  Remaining errors require Swiss Ephemeris (VITE_USE_SWISS_EPHEMERIS=true)');
}
