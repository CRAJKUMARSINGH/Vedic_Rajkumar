import { INDIAN_CITIES } from '@/lib/mtss/indianCities';

export interface WorldCity {
  label: string;
  lat: number;
  lon: number;
  /** Standard UTC offset in hours (not DST-adjusted) */
  utcOffsetHours: number;
  country: string;
}

const INDIAN: WorldCity[] = INDIAN_CITIES.map(c => ({
  label: `${c.name}, ${c.state}`,
  lat: c.lat,
  lon: c.lon,
  utcOffsetHours: 5.5,
  country: 'India',
}));

const INTERNATIONAL: WorldCity[] = [
  { label: 'Miami, USA', lat: 25.77, lon: -80.19, utcOffsetHours: -5, country: 'USA' },
  { label: 'New York, USA', lat: 40.71, lon: -74.01, utcOffsetHours: -5, country: 'USA' },
  { label: 'Los Angeles, USA', lat: 34.05, lon: -118.24, utcOffsetHours: -8, country: 'USA' },
  { label: 'Chicago, USA', lat: 41.88, lon: -87.63, utcOffsetHours: -6, country: 'USA' },
  { label: 'London, UK', lat: 51.51, lon: -0.13, utcOffsetHours: 0, country: 'UK' },
  { label: 'Dubai, UAE', lat: 25.20, lon: 55.27, utcOffsetHours: 4, country: 'UAE' },
  { label: 'Singapore', lat: 1.35, lon: 103.82, utcOffsetHours: 8, country: 'Singapore' },
  { label: 'Sydney, Australia', lat: -33.87, lon: 151.21, utcOffsetHours: 10, country: 'Australia' },
  { label: 'Toronto, Canada', lat: 43.65, lon: -79.38, utcOffsetHours: -5, country: 'Canada' },
  { label: 'Aspur, Dungarpur, Rajasthan', lat: 23.84, lon: 74.07, utcOffsetHours: 5.5, country: 'India' },
];

export const WORLD_CITIES: WorldCity[] = [...INDIAN, ...INTERNATIONAL];

export function searchWorldCities(query: string, limit = 8): WorldCity[] {
  if (!query || query.length < 2) return WORLD_CITIES.slice(0, limit);
  const q = query.toLowerCase();
  return WORLD_CITIES.filter(c => c.label.toLowerCase().includes(q)).slice(0, limit);
}

export function findCityByLabel(label: string): WorldCity | undefined {
  return WORLD_CITIES.find(c => c.label === label);
}

/** Convert local time + city offset (+ optional DST hour) to UTC HH:MM */
export function localToUtcTime(localTime: string, utcOffsetHours: number, dst = false): string {
  const [h, m] = localTime.split(':').map(Number);
  const offset = utcOffsetHours + (dst ? 1 : 0);
  let total = h * 60 + m - offset * 60;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const uh = Math.floor(total / 60);
  const um = total % 60;
  return `${String(uh).padStart(2, '0')}:${String(um).padStart(2, '0')}`;
}
