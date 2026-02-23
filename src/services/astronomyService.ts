// Real-time planetary position service using astronomy APIs
// Uses sidereal (Vedic) calculations with Lahiri ayanamsa

const LAHIRI_AYANAMSA_2000 = 23.85; // degrees at J2000
const AYANAMSA_RATE = 0.0135; // degrees per year (approximate)

// Calculate current Lahiri ayanamsa
function getLahiriAyanamsa(date: Date): number {
  const year = date.getFullYear() + (date.getMonth() / 12) + (date.getDate() / 365);
  const yearsSince2000 = year - 2000;
  return LAHIRI_AYANAMSA_2000 + (AYANAMSA_RATE * yearsSince2000);
}

// Convert tropical longitude to sidereal
function tropicalToSidereal(tropicalLong: number, ayanamsa: number): number {
  let sidereal = tropicalLong - ayanamsa;
  while (sidereal < 0) sidereal += 360;
  while (sidereal >= 360) sidereal -= 360;
  return sidereal;
}

// Convert longitude to rashi index (0-11)
function longitudeToRashi(longitude: number): number {
  return Math.floor(longitude / 30);
}

interface PlanetaryPositions {
  Sun: number;
  Moon: number;
  Mercury: number;
  Venus: number;
  Mars: number;
  Jupiter: number;
  Saturn: number;
  Rahu: number;
  Ketu: number;
}

// Fallback positions (Feb 2026 approximate sidereal)
const FALLBACK_POSITIONS: PlanetaryPositions = {
  Sun: 10,      // Aquarius
  Moon: 0,      // Aries (changes daily)
  Mercury: 10,  // Aquarius
  Venus: 10,    // Aquarius
  Mars: 9,      // Capricorn
  Jupiter: 2,   // Gemini
  Saturn: 11,   // Pisces
  Rahu: 10,     // Aquarius
  Ketu: 4,      // Leo
};

/**
 * Fetch real-time planetary positions using astronomy API
 * Falls back to approximate positions if API fails
 */
export async function getPlanetaryPositions(date: Date = new Date()): Promise<PlanetaryPositions> {
  try {
    // Try astronomy-api.com (free, no key required)
    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(
      `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=24.5854&longitude=73.7125&elevation=0&from_date=${dateStr}&to_date=${dateStr}&time=12:00:00`,
      {
        headers: {
          'Authorization': 'Basic ' + btoa('YOUR_APP_ID:YOUR_APP_SECRET')
        }
      }
    );

    if (!response.ok) throw new Error('API failed');

    const data = await response.json();
    const ayanamsa = getLahiriAyanamsa(date);
    
    // Parse positions and convert to sidereal
    const positions: PlanetaryPositions = {
      Sun: 0,
      Moon: 0,
      Mercury: 0,
      Venus: 0,
      Mars: 0,
      Jupiter: 0,
      Saturn: 0,
      Rahu: 0,
      Ketu: 0,
    };

    // Extract from API response
    data.data.table.rows.forEach((row: any) => {
      const name = row.entry.name;
      const tropicalLong = parseFloat(row.cells[0].position.horizontal.altitude);
      const siderealLong = tropicalToSidereal(tropicalLong, ayanamsa);
      const rashi = longitudeToRashi(siderealLong);

      if (name === 'Sun') positions.Sun = rashi;
      else if (name === 'Moon') positions.Moon = rashi;
      else if (name === 'Mercury') positions.Mercury = rashi;
      else if (name === 'Venus') positions.Venus = rashi;
      else if (name === 'Mars') positions.Mars = rashi;
      else if (name === 'Jupiter') positions.Jupiter = rashi;
      else if (name === 'Saturn') positions.Saturn = rashi;
    });

    // Calculate Rahu/Ketu (mean nodes)
    positions.Rahu = calculateRahu(date, ayanamsa);
    positions.Ketu = (positions.Rahu + 6) % 12;

    return positions;
  } catch (error) {
    console.warn('Failed to fetch real-time positions, using fallback:', error);
    return calculateApproximatePositions(date);
  }
}

/**
 * Calculate approximate planetary positions using simplified ephemeris
 * More accurate than static fallback
 */
function calculateApproximatePositions(date: Date): PlanetaryPositions {
  const ayanamsa = getLahiriAyanamsa(date);
  const jd = dateToJulianDay(date);
  const T = (jd - 2451545.0) / 36525; // centuries since J2000

  // Simplified VSOP87 formulas for tropical longitudes
  const sunTropical = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  const moonTropical = (218.316 + 481267.881 * T) % 360;
  const mercuryTropical = (252.25 + 149472.68 * T) % 360;
  const venusTropical = (181.98 + 58517.82 * T) % 360;
  const marsTropical = (355.43 + 19140.30 * T) % 360;
  const jupiterTropical = (34.35 + 3034.91 * T) % 360;
  const saturnTropical = (50.08 + 1222.11 * T) % 360;
  
  // Mean lunar node (Rahu)
  const rahuTropical = (125.04 - 1934.14 * T) % 360;

  return {
    Sun: longitudeToRashi(tropicalToSidereal(sunTropical, ayanamsa)),
    Moon: longitudeToRashi(tropicalToSidereal(moonTropical, ayanamsa)),
    Mercury: longitudeToRashi(tropicalToSidereal(mercuryTropical, ayanamsa)),
    Venus: longitudeToRashi(tropicalToSidereal(venusTropical, ayanamsa)),
    Mars: longitudeToRashi(tropicalToSidereal(marsTropical, ayanamsa)),
    Jupiter: longitudeToRashi(tropicalToSidereal(jupiterTropical, ayanamsa)),
    Saturn: longitudeToRashi(tropicalToSidereal(saturnTropical, ayanamsa)),
    Rahu: longitudeToRashi(tropicalToSidereal(rahuTropical, ayanamsa)),
    Ketu: longitudeToRashi(tropicalToSidereal((rahuTropical + 180) % 360, ayanamsa)),
  };
}

function calculateRahu(date: Date, ayanamsa: number): number {
  const jd = dateToJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  const rahuTropical = (125.04 - 1934.14 * T) % 360;
  return longitudeToRashi(tropicalToSidereal(rahuTropical, ayanamsa));
}

function dateToJulianDay(date: Date): number {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;
  
  let jd = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4);
  jd = jd - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  jd = jd + (hours - 12) / 24;
  
  return jd;
}

/**
 * Calculate Moon rashi from birth date/time/location
 * Uses simplified calculation - in production, use Swiss Ephemeris
 */
export async function calculateMoonRashi(
  birthDate: Date,
  birthTime: string,
  location: string
): Promise<number> {
  try {
    // Parse time
    const [hours, minutes] = birthTime.split(':').map(Number);
    const birthDateTime = new Date(birthDate);
    birthDateTime.setHours(hours, minutes, 0, 0);

    // Get positions for birth date
    const positions = await getPlanetaryPositions(birthDateTime);
    return positions.Moon;
  } catch (error) {
    console.error('Error calculating Moon rashi:', error);
    // Fallback to simple calculation
    const dayOfYear = Math.floor(
      (birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return Math.floor((dayOfYear * 12) / 365) % 12;
  }
}
