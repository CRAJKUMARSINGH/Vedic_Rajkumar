import { spawnSync } from 'node:child_process';
import SwissEph from 'swisseph-wasm';

// Synthetic UT epochs. Both runtimes use Lahiri and Moshier, with no data files.
const epochs = [2415020.5, 2433282.4235, 2451545, 2461287.5];
const bodies = { Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4, Jupiter: 5, Saturn: 6, Rahu: 10 };
const toleranceArcsec = 1;

const reference = spawnSync(process.env.PYTHON ?? 'python', ['-c', `
import json
import sys
import swisseph as swe

epochs, bodies = json.load(sys.stdin)
swe.set_sid_mode(swe.SIDM_LAHIRI)
flags = swe.FLG_SIDEREAL | swe.FLG_MOSEPH
def longitude(epoch, body):
    position, used_flags, *_ = swe.calc_ut(epoch, body, flags)
    if used_flags & flags != flags:
        raise RuntimeError('Native calculation did not honor the requested flags')
    return position[0]

print(json.dumps({'version': swe.version, 'samples': [
    {'ayanamsa': swe.get_ayanamsa_ut(epoch), **{
        name: longitude(epoch, body) for name, body in bodies.items()
    }} for epoch in epochs
]}))
`], { input: JSON.stringify([epochs, bodies]), encoding: 'utf-8' });

if (reference.error || reference.status !== 0) {
  throw new Error(`Native Swiss Ephemeris comparison could not run: ${reference.error?.message ?? reference.stderr.trim()}`);
}

const { samples, version } = JSON.parse(reference.stdout);
const swiss = new SwissEph();
await swiss.initSwissEph();
swiss.set_sid_mode(swiss.SE_SIDM_LAHIRI, 0, 0);
const flags = swiss.SEFLG_SIDEREAL | swiss.SEFLG_MOSEPH;
const comparisons = [];
for (const [index, epoch] of epochs.entries()) {
  const wasm = { ayanamsa: swiss.get_ayanamsa_ut(epoch) };
  for (const [name, body] of Object.entries(bodies)) {
    wasm[name] = swiss.calc_ut(epoch, body, flags)[0];
  }
  for (const [name, value] of Object.entries(wasm)) {
    const difference = value - samples[index][name];
    if (!Number.isFinite(difference)) throw new Error(`Missing or invalid ${name} result at UT JD ${epoch}.`);
    const arcsec = Math.abs(((difference + 540) % 360) - 180) * 3600;
    comparisons.push({ name, epoch, arcsec });
  }
}

const worst = comparisons.reduce((max, next) => next.arcsec > max.arcsec ? next : max);
console.log(`Native Swiss Ephemeris ${version} vs WASM: ${comparisons.length} comparisons; maximum ${worst.arcsec.toFixed(6)}″ (${worst.name}, UT JD ${worst.epoch}).`);
if (worst.arcsec > toleranceArcsec) {
  console.error(`Native/WASM drift exceeds ${toleranceArcsec}″.`);
  process.exitCode = 1;
}
