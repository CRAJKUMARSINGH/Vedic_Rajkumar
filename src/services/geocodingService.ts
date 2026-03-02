/**
 * Geocoding Service
 * Auto-search latitude/longitude from place names
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

export interface LocationResult {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

// Cache for common locations to reduce API calls
const locationCache = new Map<string, LocationResult[]>();

/**
 * Search for locations by name
 * @param query - Place name to search (e.g., "Udaipur", "Mumbai, Maharashtra")
 * @returns Array of matching locations with coordinates
 */
export async function searchLocation(query: string): Promise<LocationResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();

  // Check cache first
  if (locationCache.has(normalizedQuery)) {
    return locationCache.get(normalizedQuery)!;
  }

  try {
    // Use Nominatim API (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=5` +
      `&countrycodes=in`; // Restrict to India for better results

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VedicRajkumarApp/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    const results: LocationResult[] = data.map((item: any) => ({
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      country: item.address?.country,
      state: item.address?.state,
    }));

    // Cache results
    locationCache.set(normalizedQuery, results);

    return results;
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

/**
 * Get coordinates for a specific location
 * @param locationName - Exact location name
 * @returns Coordinates or null if not found
 */
export async function getCoordinates(locationName: string): Promise<{ lat: number; lon: number } | null> {
  const results = await searchLocation(locationName);
  if (results.length > 0) {
    return { lat: results[0].lat, lon: results[0].lon };
  }
  return null;
}

/**
 * Format coordinates for display
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Formatted string (e.g., "23.84°N, 73.71°E")
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

/**
 * Pre-populate cache with common Indian cities
 */
export function preloadCommonLocations() {
  const commonCities = [
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
    { name: 'Pune', lat: 18.5204, lon: 73.8567 },
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
    { name: 'Udaipur', lat: 24.5854, lon: 73.7125 },
    { name: 'Indore', lat: 22.7196, lon: 75.8577 },
    { name: 'Dungarpur', lat: 23.8420, lon: 73.7147 },
    { name: 'Aspur', lat: 23.8400, lon: 73.7100 },
    { name: 'Banswara', lat: 23.5410, lon: 74.4420 },
  ];

  commonCities.forEach(city => {
    const result: LocationResult = {
      name: city.name,
      displayName: `${city.name}, India`,
      lat: city.lat,
      lon: city.lon,
      country: 'India',
    };
    locationCache.set(city.name.toLowerCase(), [result]);
  });
}

// Preload on module load
preloadCommonLocations();
