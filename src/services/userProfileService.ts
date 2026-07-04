// User profile management with local storage fallback

export interface BirthDetails {
  date: string;
  time: string;
  location: string;
  name?: string; // Optional name for this profile
  lastUsed?: string; // ISO timestamp of last use
}

export interface UserProfile {
  name?: string;
  email?: string;
  defaultLocation?: string;
  savedBirthDetails?: BirthDetails[];
  lastUsedProfile?: BirthDetails; // Most recently used profile
  autoLoadEnabled?: boolean; // Whether to auto-load last profile
}

const STORAGE_KEY = "vedic_user_profile";

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving user profile:", error);
  }
}

export function getUserProfile(): UserProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading user profile:", error);
    return null;
  }
}

export function addBirthDetails(details: { date: string; time: string; location: string; name?: string }): void {
  const profile = getUserProfile() || {};
  const existing = profile.savedBirthDetails || [];
  
  // Add timestamp
  const detailsWithTimestamp: BirthDetails = {
    ...details,
    lastUsed: new Date().toISOString(),
  };
  
  // Check if already exists
  const existingIndex = existing.findIndex(
    (d) => d.date === details.date && d.time === details.time && d.location === details.location
  );
  
  if (existingIndex >= 0) {
    // Update existing entry with new timestamp
    existing[existingIndex] = detailsWithTimestamp;
    profile.savedBirthDetails = [existing[existingIndex], ...existing.filter((_, i) => i !== existingIndex)];
  } else {
    // Add new entry
    profile.savedBirthDetails = [detailsWithTimestamp, ...existing].slice(0, 5); // Keep last 5
  }
  
  // Set as last used profile
  profile.lastUsedProfile = detailsWithTimestamp;
  
  // Enable auto-load by default
  if (profile.autoLoadEnabled === undefined) {
    profile.autoLoadEnabled = true;
  }
  
  saveUserProfile(profile);
}

export function getLastUsedProfile(): BirthDetails | null {
  const profile = getUserProfile();
  return profile?.lastUsedProfile || null;
}

export function shouldAutoLoad(): boolean {
  const profile = getUserProfile();
  return profile?.autoLoadEnabled !== false; // Default to true
}

export function setAutoLoadEnabled(enabled: boolean): void {
  const profile = getUserProfile() || {};
  profile.autoLoadEnabled = enabled;
  saveUserProfile(profile);
}

export function exportUserData(): string {
  const profile = getUserProfile();
  const readings = localStorage.getItem("vedic_readings_backup");
  
  return JSON.stringify({
    profile,
    readings: readings ? JSON.parse(readings) : [],
    exportDate: new Date().toISOString(),
  }, null, 2);
}

export function importUserData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    if (data.profile) {
      saveUserProfile(data.profile);
    }
    if (data.readings) {
      localStorage.setItem("vedic_readings_backup", JSON.stringify(data.readings));
    }
    return true;
  } catch (error) {
    console.error("Error importing user data:", error);
    return false;
  }
}
