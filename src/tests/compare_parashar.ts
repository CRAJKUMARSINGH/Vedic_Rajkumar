import fs from 'fs';
import path from 'path';
import { calcPlanetsAccurate, calcHousesAccurate } from '../services/swissEphemerisService.ts';
import { RASHIS } from '../data/transitData.ts';

// Convert degree (0‑360) to HH:MM:SS (0‑23h range)
function degToHMS(deg: number): string {
  const totalSeconds = Math.round(((deg % 360) + 360) % 360 * 240); // 1° = 4 min = 240 s
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getSignName(deg: number): string {
  const idx = Math.floor(((deg % 360) + 360) % 360 / 30);
  return RASHIS[idx].en;
}

/**
 * Parse the Parashar Lite HTML table.
 * Returns: data[person][label] = { deg: string; sign: string }
 */
function parseParasharHTML(htmlPath: string): Record<string, Record<string, { deg: string; sign: string }>> {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  // Extract rows – each <tr>...</tr>
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(html)) !== null) {
    rows.push(match[1]);
  }
  if (rows.length === 0) return {};

  // Header row – person names are in <th> tags after the first empty <th>
  const header = rows[0];
  const nameMatches = [...header.matchAll(/<th>([^<]*)<\/th>/gi)].map(m => m[1].trim());
  const personNames = nameMatches.slice(1); // drop first header (label column)

  const result: Record<string, Record<string, { deg: string; sign: string }>> = {};

  // Process data rows (skip header)
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    // Split by <td> … </td>
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let cm: RegExpExecArray | null;
    while ((cm = cellRegex.exec(cols)) !== null) {
      cells.push(cm[1].trim());
    }
    if (cells.length < 2) continue; // need label + at least one person column
    const label = cells[0].replace(/<[^>]+>/g, '').trim(); // e.g., "Sun (Surya)"
    // Remaining cells correspond to personNames order
    for (let j = 1; j < cells.length; j++) {
      const person = personNames[j - 1];
      if (!person) continue;
      // Cell content contains time and sign separated by <br>
      const parts = cells[j].split(/<br\s*\/?>/i).map(p => p.replace(/<[^>]*>/g, '').trim()).filter(Boolean);
      const deg = parts[0] ?? '';
      const sign = parts[1] ?? '';
      if (!result[person]) result[person] = {};
      result[person][label] = { deg, sign };
    }
  }
  return result;
}

function buildPersonHTML(name: string, app: any, ref: any): string {
  const rows = [
    { label: 'Ascendant', app: app.ascendant, ref: ref['Ascendant'] },
    { label: 'Sun', app: app.planets.sun, ref: ref['Sun (Surya)'] },
    { label: 'Moon', app: app.planets.moon, ref: ref['Moon (Chandra)'] },
    { label: 'Mars', app: app.planets.mars, ref: ref['Mars (Mangal)'] },
    { label: 'Mercury', app: app.planets.mercury, ref: ref['Mercury (Budh)'] },
    { label: 'Jupiter', app: app.planets.jupiter, ref: ref['Jupiter (Guru)'] },
    { label: 'Venus', app: app.planets.venus, ref: ref['Venus (Shukra)'] },
    { label: 'Saturn', app: app.planets.saturn, ref: ref['Saturn (Shani)'] },
    { label: 'Rahu', app: app.planets.rahu, ref: ref['Rahu'] },
    { label: 'Ketu', app: app.planets.ketu, ref: ref['Ketu'] },
  ];

  const tableRows = rows.map(r => {
    const appCell = `${r.app.deg}<br>${r.app.sign}`;
    const refCell = r.ref ? `${r.ref.deg}<br>${r.ref.sign}` : '';
    const mismatch = appCell !== refCell ? ' class="mismatch"' : '';
    return `<tr${mismatch}><td>${r.label}</td><td>${appCell}</td><td>${refCell}</td></tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Horoscope Comparison – ${name}</title>
<style>
  table{border-collapse:collapse;width:100%;font-family:Arial,Helvetica,sans-serif;}
  th,td{border:1px solid #333;padding:8px;text-align:center;}
  th{background:#4CAF50;color:white;}
  .mismatch{background:#ffcccc;}
</style>
</head>
<body>
<h2>Horoscope Comparison – ${name}</h2>
<table>
<tr><th>Aspect</th><th>App</th><th>Parashar Lite</th></tr>
${tableRows}
</table>
</body>
</html>`;
}

(async () => {
  const dbPath = path.resolve('jataks', 'JATAKS_DATABASE.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as any;
  const targetNames = ['Jyoti Chauhan', 'Rajkumar', 'Vishwaraj Singh Chauhan', 'Priyansh Singh Chauhan', 'Priyanka Jain'];

  const parasharPath = path.resolve('Parashar Lite charts', 'birth_chart_comparison.html');
  const parasharData = parseParasharHTML(parasharPath);

  const outDir = path.resolve('reports', 'comparisons');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const person of db.jataks) {
    if (!targetNames.includes(person.name)) continue;
    const { dateOfBirth, timeOfBirth, coordinates } = person;
    const lat = parseFloat(coordinates.latitude.replace('°N', '').trim());
    const lon = parseFloat(coordinates.longitude.replace('°E', '').trim());

    const planets = await calcPlanetsAccurate(dateOfBirth, timeOfBirth);
    const houses = await calcHousesAccurate(dateOfBirth, timeOfBirth, lat, lon);

    const appData = {
      ascendant: { deg: degToHMS(houses.ascendant), sign: getSignName(houses.ascendant) },
      planets: {
        sun: { deg: degToHMS(planets.sun.sidereal), sign: planets.sun.rashiName },
        moon: { deg: degToHMS(planets.moon.sidereal), sign: planets.moon.rashiName },
        mercury: { deg: degToHMS(planets.mercury.sidereal), sign: planets.mercury.rashiName },
        venus: { deg: degToHMS(planets.venus.sidereal), sign: planets.venus.rashiName },
        mars: { deg: degToHMS(planets.mars.sidereal), sign: planets.mars.rashiName },
        jupiter: { deg: degToHMS(planets.jupiter.sidereal), sign: planets.jupiter.rashiName },
        saturn: { deg: degToHMS(planets.saturn.sidereal), sign: planets.saturn.rashiName },
        rahu: { deg: degToHMS(planets.rahu.sidereal), sign: planets.rahu.rashiName },
        ketu: { deg: degToHMS(planets.ketu.sidereal), sign: planets.ketu.rashiName },
      },
    };

    const refData = parasharData[person.name] ?? {};
    const html = buildPersonHTML(person.name, appData, refData);
    const fileName = `${person.name.replace(/\s+/g, '_')}.html`;
    fs.writeFileSync(path.join(outDir, fileName), html, 'utf-8');
    console.log(`Generated comparison for ${person.name}: ${path.join(outDir, fileName)}`);
  }
})();
