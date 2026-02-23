// User profile management with local storage fallback

export interface UserProfile {
  name?: string;
  email?: string;
  defaultLocation?: string;
  savedBirthDetails?: {
    date: string;
    time: string;
    location: string;
  }[];
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

export function addBirthDetails(details: { date: string; time: string; location: string }): void {
  const profile = getUserProfile() || {};
  const existing = profile.savedBirthDetails || [];
  
  // Check if already exists
  const isDuplicate = existing.some(
    (d) => d.date === details.date && d.time === details.time && d.location === details.location
  );
  
  if (!isDuplicate) {
    profile.savedBirthDetails = [details, ...existing].slice(0, 5); // Keep last 5
    saveUserProfile(profile);
  }
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
