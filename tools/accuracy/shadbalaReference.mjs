/**
 * shadbalaReference.mjs — independent Shadbala oracle for the accuracy gate.
 *
 * Deliberately does NOT import from src/: its own tables, its own varga rules.
 * It exists so the app's interpretive layer can be checked against something
 * other than itself. If the engine and this disagree, one of them has a typo —
 * which is the point. A golden derived from the engine's own output proves
 * nothing (see docs/accuracy/SHADBALA.md, "what this does not verify").
 *
 * It is a pure function of a sky snapshot (lon, speed, declination, cusps,
 * sunrise/sunset lords, localHours) — no ephemeris dependency. So a
 * disagreement is always an arithmetic or rule disagreement, never a
 * planetary-position one.
 *
 * Units: virupas (shashtiamsas). 60 virupas = 1 rupa.
 * Source: BPHS, Graha Bala chapter. School-dependent choices are explicit in
 * `school` rather than silently defaulted.
 */

const norm = (d) => ((d % 360) + 360) % 360;
const signOf = (lon) => Math.floor(norm(lon) / 30);
const degInSign = (lon) => norm(lon) % 30;
const arc = (a, b) => {
  const d = Math.abs(norm(a) - norm(b));
  return d > 180 ? 360 - d : d;
};

export const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
/** @type {Record<string, number>} */
export const EXALTATION = { Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200 };
/** @type {Record<string, number>} */
export const NAISARGIKA = { Sun: 60, Moon: 51.43, Mars: 17.14, Mercury: 25.71, Jupiter: 34.29, Venus: 42.86, Saturn: 8.57 };
/** @type {Record<string, number>} */
export const DIG_BEST_BHAVA = { Sun: 10, Mars: 10, Jupiter: 1, Mercury: 1, Saturn: 7, Moon: 4, Venus: 4 };
/** @type {Record<string, number>} */
export const REQUIRED_MIN_RUPAS = { Sun: 5, Moon: 6, Mars: 5, Mercury: 7, Jupiter: 6.5, Venus: 5.5, Saturn: 5 };

/** @type {Record<string, number>} */
export const DIGNITY_POINTS = {
  moolatrikona: 45, own: 30, exaltation: 22.5, greatFriend: 22.5,
  friend: 15, neutral: 7.5, enemy: 3.75, greatEnemy: 1.875, debilitation: 1.875,
};

/** @type {Record<string, number>} */
export const MAXIMA = {
  uchcha: 60, kendradi: 60, ojhayugmarasyamsa: 15, drekkana: 15, saptavargaja: 315,
  dig: 60, nathonnatha: 60, paksha: 60, tribhaga: 60, varsha: 15, masa: 30,
  dina: 45, hora: 60, ayana: 60, cheshta: 60, naisargika: 60,
};

/** Pick one, document it, never silently default. */
export const SCHOOLS = {
  A: { neuterGetsOddSignBala: true, moonPakshaDoubled: false, friendship: 'natural' },
  B: { neuterGetsOddSignBala: false, moonPakshaDoubled: true, friendship: 'natural' },
};

// ── Sthana Bala ──────────────────────────────────────────────────────────────

/** 60 at exaltation, 0 at debilitation, linear between. */
export const uchchaBala = (planet, lon) => arc(lon, EXALTATION[planet] + 180) / 3;

export const kendradiBala = (house) =>
  [1, 4, 7, 10].includes(house) ? 60 : [2, 5, 8, 11].includes(house) ? 30 : 15;

export function ojhayugmarasyamsaBala(planet, lon, school = 'A') {
  const odd = signOf(lon) % 2 === 0; // Aries = 0 = first (odd) sign
  if (['Sun', 'Mars', 'Jupiter'].includes(planet)) return odd ? 15 : 0;
  if (['Moon', 'Venus'].includes(planet)) return odd ? 0 : 15;
  return SCHOOLS[school].neuterGetsOddSignBala && odd ? 15 : 0;
}

export function drekkanaBala(planet, lon) {
  const d = Math.floor(degInSign(lon) / 10);
  const group = [['Sun', 'Mars', 'Jupiter'], ['Mercury', 'Saturn'], ['Moon', 'Venus']][d];
  return group.includes(planet) ? 15 : 0;
}

// ── Varga division (own rules — this is the unverified surface) ───────────────
//
// Only the saptavarga divisions that feed Saptavargaja Bala are implemented.
// Each maps a sidereal longitude to a varga rashi (0-11).

const NAVAMSA_START = { 0: 0, 4: 0, 8: 0, 1: 9, 5: 9, 9: 9, 2: 6, 6: 6, 10: 6, 3: 3, 7: 3, 11: 3 };

export function vargaSign(lon, varga) {
  const s = signOf(lon), d = degInSign(lon), odd = s % 2 === 0;
  switch (varga) {
    case 'D1': return s;
    case 'D2': return odd === (d < 15) ? 4 : 3;          // Leo / Cancer hora
    case 'D3': return norm(s + [0, 4, 8][Math.floor(d / 10)]) % 12;
    // D4 Chaturthamsha: four 7°30′ parts counted from the sign itself, then the
    // 4th, 7th and 10th from it (i.e. +3 each step).
    case 'D4': return norm(s + 3 * Math.floor(d / 7.5)) % 12;
    // D7 Saptamsha: odd signs count from the sign itself, even signs from the
    // 7th from it. `(7*s + part) % 12` is the closed form of that rule.
    case 'D7': return norm(7 * s + Math.floor(d / (30 / 7))) % 12;
    case 'D9': return norm(NAVAMSA_START[s] + Math.floor(d / (30 / 9))) % 12;
    case 'D12': return norm(s + Math.floor(d / 2.5)) % 12;
    // D20 Vimshamsha: twenty 1°30′ parts. Movable signs start from Aries, fixed
    // from Leo, dual from Sagittarius.
    case 'D20': return norm([0, 4, 8][s % 3] + Math.floor(d / 1.5)) % 12;
    case 'D30': {
      const table = odd
        ? [[5, 0], [5, 10], [8, 8], [7, 2], [5, 6]]     // Mars, Saturn, Jupiter, Mercury, Venus
        : [[5, 6], [7, 2], [8, 8], [5, 10], [5, 0]];    // reversed
      let acc = 0;
      for (const [span, target] of table) {
        acc += span;
        if (d < acc) return target;
      }
      return table[4][1];
    }
    // D60 Shashtiamsha: sixty 0°30′ parts counted from the sign itself. The
    // "count from the sign" school is the one taken here; the alternative
    // (odd/even reversal) is flagged contested in SHADBALA.md.
    case 'D60': return norm(s + Math.floor(d / 0.5)) % 12;
    default: throw new Error(`unknown varga ${varga}`);
  }
}

export const SAPTAVARGA = ['D1', 'D2', 'D3', 'D7', 'D9', 'D12', 'D30'];

/** Every varga this oracle implements a rule for (Saptavarga + D4/D20/D60). */
export const VARGA_ALL = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D12', 'D20', 'D30', 'D60'];

const SIGN_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const MOOLATRIKONA = { // sign -> [planet, fromDeg, toDeg]
  0: ['Mars', 0, 12], 1: ['Moon', 3, 30], 4: ['Sun', 0, 20], 5: ['Mercury', 15, 20],
  6: ['Venus', 0, 15], 8: ['Jupiter', 0, 10], 10: ['Saturn', 0, 20],
};
const OWN = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };
const FRIENDS = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'] },
  Moon: { friends: ['Sun', 'Mercury'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
  Venus: { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
  Saturn: { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'] },
};

/** Dignity of `planet` at `lon`, in the sign it falls in. Natural friendship only. */
export function dignity(planet, lon) {
  const s = signOf(lon), d = degInSign(lon);
  const mt = MOOLATRIKONA[s];
  if (mt && mt[0] === planet && d >= mt[1] && d < mt[2]) return 'moolatrikona';
  if (OWN[planet].includes(s)) return 'own';
  if (s === Math.floor(EXALTATION[planet] / 30)) return 'exaltation';
  if (s === Math.floor(norm(EXALTATION[planet] + 180) / 30)) return 'debilitation';
  const lord = SIGN_LORD[s];
  if (lord === planet) return 'own';
  const rel = FRIENDS[planet];
  if (rel.friends.includes(lord)) return 'friend';
  if (rel.enemies.includes(lord)) return 'enemy';
  return 'neutral';
}

export const saptavargajaBala = (planet, lon) =>
  SAPTAVARGA.reduce((sum, v) => sum + DIGNITY_POINTS[dignity(planet, vargaSign(lon, v))], 0);

export const sthanaBala = (planet, lon, house, school = 'A') =>
  uchchaBala(planet, lon) + kendradiBala(house) + ojhayugmarasyamsaBala(planet, lon, school) +
  drekkanaBala(planet, lon) + saptavargajaBala(planet, lon);

// ── Dig, Kala, Cheshta, Naisargika, Drik ─────────────────────────────────────

export const digBala = (planet, lon, cusps) =>
  (180 - arc(lon, cusps[DIG_BEST_BHAVA[planet] - 1])) / 3;

export function nathonnathaBala(planet, localHours) {
  if (planet === 'Sun') return 60 * (1 - Math.abs(localHours - 12) / 12);
  if (planet === 'Moon') {
    const d = Math.min(Math.abs(localHours), 24 - Math.abs(localHours));
    return 60 * (1 - d / 12);
  }
  return 0;
}

export function pakshaBala(planet, elongation, school = 'A') {
  const base = Math.min(arc(elongation, 0), 180) / 3;      // 0 at new moon, 60 at full
  const benefic = ['Jupiter', 'Venus', 'Mercury'].includes(planet);
  const raw = benefic ? base : 60 - base;
  return SCHOOLS[school].moonPakshaDoubled && planet === 'Moon' ? Math.min(raw * 2, 120) : raw;
}

export function tribhagaBala(planet, isDay, third) {
  if (planet === 'Jupiter') return 60;
  const lord = isDay ? ['Mercury', 'Sun', 'Saturn'][third] : ['Moon', 'Venus', 'Mars'][third];
  return lord === planet ? 60 : 0;
}

export const lordBala = (planet, kind, lord) =>
  planet !== lord ? 0 : { varsha: 15, masa: 30, dina: 45, hora: 60 }[kind];

/** North-preferring planets gain with positive declination; Moon and Saturn invert. */
export function ayanaBala(planet, declination) {
  const north = ['Sun', 'Mars', 'Jupiter', 'Venus'].includes(planet);
  const kranti = north ? declination : -declination;
  return (60 * (kranti + 24)) / 48;
}

/** Contested and coarse: flagged in SHADBALA.md as approximate. */
export const cheshtaBala = (speed) => (speed < 0 ? 60 : speed === 0 ? 30 : 0);

export const naisargikaBala = (planet) => NAISARGIKA[planet];

/**
 * Sputa drishti with Mars 4/8, Jupiter 5/9, Saturn 3/10 specials, signed by
 * benefic/malefic and divided by 4. Approximate — flagged in SHADBALA.md.
 */
export function drikBala(planet, lons) {
  const SPECIAL = { Mars: [4, 8], Jupiter: [5, 9], Saturn: [3, 10] };
  const MALEFIC = ['Sun', 'Mars', 'Saturn'];
  let total = 0;
  for (const other of PLANETS) {
    if (other === planet) continue;
    const offset = ((signOf(lons[other]) - signOf(lons[planet])) % 12 + 12) % 12 + 1;
    const special = SPECIAL[other]?.includes(offset);
    const strength = special ? 60 : Math.max(0, (180 - arc(lons[other], lons[planet])) / 3);
    total += MALEFIC.includes(other) ? -strength : strength;
  }
  return total / 4;
}

/**
 * @typedef {Object} ShadbalaEntry
 * @property {Record<string, number>} sthana
 * @property {number} dig
 * @property {number} kala
 * @property {number} cheshta
 * @property {number} naisargika
 * @property {number} drik
 * @property {number} totalVirupas
 * @property {number} rupas
 * @property {boolean} meetsMinimum
 */

/**
 * @param {{ lon: Record<string, number>, house: Record<string, number>, speed: Record<string, number>, declination: Record<string, number> }} sky
 * @param {{ cusps: number[], localHours: number, isDay: boolean, third: number, lords: Record<string, string> }} ctx
 * @param {'A' | 'B'} [school]
 * @returns {Record<string, ShadbalaEntry>}
 */
export function shadbala(sky, ctx, school = 'A') {
  /** @type {Record<string, ShadbalaEntry>} */
  const out = {};
  for (const planet of PLANETS) {
    const lon = sky.lon[planet];
    const sthana = sthanaBala(planet, lon, sky.house[planet], school);
    const dig = digBala(planet, lon, ctx.cusps);
    const kala =
      nathonnathaBala(planet, ctx.localHours) +
      pakshaBala(planet, arc(sky.lon.Moon, sky.lon.Sun), school) +
      tribhagaBala(planet, ctx.isDay, ctx.third) +
      ['varsha', 'masa', 'dina', 'hora'].reduce((s, k) => s + lordBala(planet, k, ctx.lords[k]), 0) +
      ayanaBala(planet, sky.declination[planet]);
    const cheshta = cheshtaBala(sky.speed[planet]);
    const naisargika = naisargikaBala(planet);
    const drik = drikBala(planet, sky.lon);
    const total = sthana + dig + kala + cheshta + naisargika + drik;
    out[planet] = {
      sthana: {
        uchcha: uchchaBala(planet, lon),
        kendradi: kendradiBala(sky.house[planet]),
        ojhayugmarasyamsa: ojhayugmarasyamsaBala(planet, lon, school),
        drekkana: drekkanaBala(planet, lon),
        saptavargaja: saptavargajaBala(planet, lon),
      },
      dig, kala, cheshta, naisargika, drik,
      totalVirupas: total, rupas: total / 60,
      meetsMinimum: total / 60 >= REQUIRED_MIN_RUPAS[planet],
    };
  }
  return out;
}
