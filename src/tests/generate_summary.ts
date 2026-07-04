import fs from 'fs';
import path from 'path';
import { calcPlanetsAccurate, calcHousesAccurate } from '../services/swissEphemerisService.ts';
import { RASHIS } from '../data/transitData.ts';

function degToHMS(deg: number): string {
  const totalSeconds = Math.round(((deg % 360) + 360) % 360 * 240);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function getSignName(deg: number): string {
  const idx = Math.floor(((deg % 360) + 360) % 360 / 30);
  return RASHIS[idx].en;
}

(async () => {
  const dbPath = path.resolve('jataks','JATAKS_DATABASE.json');
  const db = JSON.parse(fs.readFileSync(dbPath,'utf-8')) as any;
  const targetNames = ['Jyoti Chauhan','Rajkumar','Vishwaraj Singh Chauhan','Priyansh Singh Chauhan','Priyanka Jain'];
  const outLines: string[] = [];
  for (const person of db.jataks) {
    if (!targetNames.includes(person.name)) continue;
    const {dateOfBirth,timeOfBirth,coordinates}=person;
    const lat = parseFloat(coordinates.latitude.replace('°N','').trim());
    const lon = parseFloat(coordinates.longitude.replace('°E','').trim());
    const planets = await calcPlanetsAccurate(dateOfBirth,timeOfBirth);
    const houses = await calcHousesAccurate(dateOfBirth,timeOfBirth,lat,lon);
    outLines.push(`## ${person.name}`);
    outLines.push('| Aspect | HH:MM:SS | Sign |');
    outLines.push('|---|---|---|');
    const addRow = (label:string,deg:number,sign:string)=>{
      outLines.push(`| ${label} | ${degToHMS(deg)} | ${sign} |`);
    };
    addRow('Ascendant', houses.ascendant, getSignName(houses.ascendant));
    addRow('Sun', planets.sun.tropical, planets.sun.rashiName);
    addRow('Moon', planets.moon.tropical, planets.moon.rashiName);
    addRow('Mars', planets.mars.tropical, planets.mars.rashiName);
    addRow('Mercury', planets.mercury.tropical, planets.mercury.rashiName);
    addRow('Jupiter', planets.jupiter.tropical, planets.jupiter.rashiName);
    addRow('Venus', planets.venus.tropical, planets.venus.rashiName);
    addRow('Saturn', planets.saturn.tropical, planets.saturn.rashiName);
    addRow('Rahu', planets.rahu.tropical, planets.rahu.rashiName);
    addRow('Ketu', planets.ketu.tropical, planets.ketu.rashiName);
    outLines.push('');
  }
  const mdPath = path.resolve('reports','app_values_summary.md');
  fs.writeFileSync(mdPath, outLines.join('\n'), 'utf-8');
  console.log('Summary written to', mdPath);
})();
