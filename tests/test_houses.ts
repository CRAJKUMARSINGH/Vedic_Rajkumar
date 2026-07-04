import { initSwissEphemeris } from './packages/core/src/services/swissEphemerisService';
import swisseph from 'swisseph-wasm';

async function test() {
  const eph = new (swisseph as any)();
  if (eph.initSwissEph) await eph.initSwissEph();
  
  const jd = eph.julday(2000, 10, 25, 19.3333333); // just an example UTC
  const lat = 22.72;
  const lon = 75.86;
  
  const res = eph.houses(jd, lat, lon, 'W');
  console.log("HOUSES RESULT:", res);
  
  // also try houses_ut if it exists
  if (eph.houses_ut) {
    console.log("HOUSES_UT RESULT:", eph.houses_ut(jd, lat, lon, 'W'));
  }
}

test().catch(console.error);
