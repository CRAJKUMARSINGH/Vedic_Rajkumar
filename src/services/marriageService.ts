import { 
  julianDay, 
  lahiriAyanamsa, 
  sunLongitudeTropical, 
  sunRadiusVector,
  moonLongitudeTropical,
  mercuryLongitudeGeocentric,
  venusLongitudeGeocentric,
  marsLongitudeGeocentric,
  jupiterLongitudeGeocentric,
  saturnLongitudeGeocentric,
  rahuLongitude,
  normalize,
  calcAscendant
} from './vedicCalc';

export interface MarriageAnalysis {
  mangalDosha: any;
  marriageTiming: any;
  chart: any;
}

export function analyzeMarriage(
  day: number, month: number, year: number,
  hour: number, minute: number,
  lat: number, lon: number,
  timezone: number = 5.5
): MarriageAnalysis {
  const utcHour = hour + minute / 60 - timezone;
  let utcDay = day;
  let utcMonth = month;
  let utcYear = year;
  let h = utcHour;
  if (h < 0) { h += 24; utcDay--; }
  if (h >= 24) { h -= 24; utcDay++; }

  const jde = julianDay(utcYear, utcMonth, utcDay, h);
  const T = (jde - 2451545.0) / 36525.0;
  const ayanamsa = lahiriAyanamsa(jde);
  const sunTrop = sunLongitudeTropical(T);
  const Re = sunRadiusVector(T);

  // Re-calculate basic chart with precision
  const ascTrop = calcAscendant(jde, lat, lon);
  const ascSid = normalize(ascTrop - ayanamsa);
  const lagnaRashi = Math.floor(ascSid / 30) + 1;

  const makePlanet = (name: string, lon: number) => {
    const rashi = Math.floor(lon / 30) + 1;
    return {
      name,
      longitude: lon,
      rashi,
      degree: lon % 30,
      house: ((rashi - lagnaRashi + 12) % 12) + 1
    };
  };

  const planets = [
    makePlanet('Sun', normalize(sunTrop - ayanamsa)),
    makePlanet('Moon', normalize(moonLongitudeTropical(T) - ayanamsa)),
    makePlanet('Mercury', normalize(mercuryLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Venus', normalize(venusLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Mars', normalize(marsLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Jupiter', normalize(jupiterLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Saturn', normalize(saturnLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Rahu', normalize(rahuLongitude(T) - ayanamsa)),
    makePlanet('Ketu', normalize(rahuLongitude(T) - ayanamsa + 180)),
  ];

  const chart = { lagnaRashi, planets, ayanamsa };

  // Import existing logic (need to make sure paths are correct)
  // For now, assume we'll port these too
  return {
    mangalDosha: null, // to be implemented
    marriageTiming: null, // to be implemented
    chart
  };
}
