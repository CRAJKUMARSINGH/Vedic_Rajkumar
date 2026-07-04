import { initSwissEphemeris } from './packages/core/src/services/swissEphemerisService';
import swisseph from 'swisseph-wasm';

async function test() {
  const eph = new (swisseph as any)();
  if (eph.initSwissEph) await eph.initSwissEph();
  console.log("METHODS:", Object.getOwnPropertyNames(Object.getPrototypeOf(eph)));
}

test().catch(console.error);
