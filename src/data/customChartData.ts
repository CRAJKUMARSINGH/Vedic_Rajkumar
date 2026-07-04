export interface SimplePlanet {
  name: string;
  sign: string; // e.g., 'Virgo'
  degree: string; // HH:MM:SS format
  house: number;
}

export interface SimpleChart {
  ascendant: { sign: string; degree: string; house: number };
  planets: SimplePlanet[];
}

// Mapping of birth‑date (ISO "YYYY‑MM‑DD") to the exact planetary data you provided from Parashar Lite.
export const customCharts: Record<string, SimpleChart> = {
  "2011-09-18": {
    ascendant: { sign: "Virgo", degree: "11:53:05", house: 1 }, // Hasta Pada 1
    planets: [
      { name: "Sun",   sign: "Virgo",   degree: "00:46:45", house: 4 },
      { name: "Moon",  sign: "Taurus",  degree: "02:40:06", house: 1 },
      { name: "Mercury", sign: "Cancer", degree: "---", house: 3 },
      { name: "Venus",   sign: "Virgo",   degree: "---", house: 5 },
      { name: "Mars",    sign: "Gemini", degree: "---", house: 2 },
      { name: "Jupiter", sign: "Aries",  degree: "---", house: 12 },
      { name: "Saturn",  sign: "Virgo",   degree: "---", house: 5 },
      { name: "Rahu",    sign: "Leo",    degree: "05:21:06", house: 4 },
      { name: "Ketu",    sign: "Taurus", degree: "23:56:30", house: 12 }
    ]
  }
};
