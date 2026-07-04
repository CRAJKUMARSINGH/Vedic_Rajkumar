import { calculateVimshottariDasha, formatDashaDate } from '../src/services/dashaService';
import { calculatePrecisePlanetaryPositions } from '../src/services/precisionEphemerisService';

const DATE = '2011-09-18';
const TIME = '06:58';

const precise = calculatePrecisePlanetaryPositions(DATE, TIME);
const preciseLon = precise.moon.sidereal;
const dashaNew = calculateVimshottariDasha(DATE, TIME, 3, preciseLon);

const marsMD = dashaNew.mahadashas.find(md => md.planet === 'Mars');
if (marsMD) {
  console.log(`Mars Mahadasha: ${formatDashaDate(marsMD.startDate)} to ${formatDashaDate(marsMD.endDate)}`);
  console.log('\n--- Antardashas within Mars Mahadasha ---');
  marsMD.antardashas.forEach((ad, i) => {
    console.log(`${i+1}. ${ad.planet.padEnd(8)}: ${formatDashaDate(ad.startDate)} to ${formatDashaDate(ad.endDate)}`);
  });
} else {
  console.log('Mars Mahadasha not found');
}
