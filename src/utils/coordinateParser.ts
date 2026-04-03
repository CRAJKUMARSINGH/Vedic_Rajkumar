/**
 * Coordinate Parser Utility
 * Handles parsing of coordinate strings from jataks database
 */

export interface ParsedCoordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface CoordinateValidation {
  isValid: boolean;
  latitude: number | null;
  longitude: number | null;
  error?: string;
}

/**
 * Parse coordinate string to numeric value
 * Handles formats like "23.84°N", "73.71°E", "23.84", etc.
 */
export function parseCoordinateString(coordStr: string | undefined | null): number | null {
  if (!coordStr || typeof coordStr !== 'string') {
    return null;
  }
  
  // Extract numeric value from strings like "23.84°N" or "73.71°E"
  const match = coordStr.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Parse coordinates object from jataks database
 */
export function parseCoordinates(coordinates: any): ParsedCoordinates {
  if (!coordinates || typeof coordinates !== 'object') {
    return { latitude: null, longitude: null };
  }
  
  const latitude = parseCoordinateString(coordinates.latitude);
  const longitude = parseCoordinateString(coordinates.longitude);
  
  return { latitude, longitude };
}

/**
 * Validate parsed coordinates
 */
export function validateCoordinates(coordinates: ParsedCoordinates): CoordinateValidation {
  const { latitude, longitude } = coordinates;
  
  if (latitude === null || longitude === null) {
    return {
      isValid: false,
      latitude,
      longitude,
      error: 'Missing latitude or longitude'
    };
  }
  
  // Validate latitude range (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    return {
      isValid: false,
      latitude,
      longitude,
      error: `Invalid latitude: ${latitude}. Must be between -90 and 90.`
    };
  }
  
  // Validate longitude range (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    return {
      isValid: false,
      latitude,
      longitude,
      error: `Invalid longitude: ${longitude}. Must be between -180 and 180.`
    };
  }
  
  // For Indian coordinates, expect positive values
  if (latitude <= 0 || longitude <= 0) {
    return {
      isValid: false,
      latitude,
      longitude,
      error: 'Indian coordinates should be positive values'
    };
  }
  
  // Validate reasonable ranges for India
  if (latitude < 6 || latitude > 37) {
    return {
      isValid: false,
      latitude,
      longitude,
      error: `Latitude ${latitude} is outside India's range (6°N to 37°N)`
    };
  }
  
  if (longitude < 68 || longitude > 97) {
    return {
      isValid: false,
      latitude,
      longitude,
      error: `Longitude ${longitude} is outside India's range (68°E to 97°E)`
    };
  }
  
  return {
    isValid: true,
    latitude,
    longitude
  };
}

/**
 * Parse and validate coordinates from jataks database entry
 */
export function parseAndValidateJatakCoordinates(jatak: any): CoordinateValidation {
  const parsed = parseCoordinates(jatak.coordinates);
  return validateCoordinates(parsed);
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  
  return `${Math.abs(latitude).toFixed(2)}°${latDir}, ${Math.abs(longitude).toFixed(2)}°${lonDir}`;
}

/**
 * Convert coordinates to the format expected by calculation services
 */
export function coordinatesForCalculation(coordinates: ParsedCoordinates): { lat: number; lon: number } | null {
  const validation = validateCoordinates(coordinates);
  
  if (!validation.isValid || validation.latitude === null || validation.longitude === null) {
    return null;
  }
  
  return {
    lat: validation.latitude,
    lon: validation.longitude
  };
}

export default {
  parseCoordinateString,
  parseCoordinates,
  validateCoordinates,
  parseAndValidateJatakCoordinates,
  formatCoordinates,
  coordinatesForCalculation
};