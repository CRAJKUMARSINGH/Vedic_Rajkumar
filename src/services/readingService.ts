import { supabase } from "@/integrations/supabase/client";
import type { TransitResult } from "@/data/transitData";

export interface SavedReading {
  id: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  moon_rashi_index: number;
  transit_date: string;
  overall_score: number;
  results: TransitResult[];
  created_at: string;
}

export async function saveReading(data: {
  birth_date: string;
  birth_time: string;
  birth_location: string;
  moon_rashi_index: number;
  transit_date: string;
  overall_score: number;
  results: TransitResult[];
}): Promise<SavedReading | null> {
  try {
    const { data: saved, error } = await supabase
      .from("transit_readings")
      .insert({
        birth_date: data.birth_date,
        birth_time: data.birth_time,
        birth_location: data.birth_location,
        moon_rashi_index: data.moon_rashi_index,
        transit_date: data.transit_date,
        overall_score: data.overall_score,
        results: JSON.parse(JSON.stringify(data.results)),
      })
      .select()
      .single();

    if (error) throw error;

    // Also save to local storage as backup
    saveToLocalStorage(saved as unknown as SavedReading);
    
    return saved as unknown as SavedReading;
  } catch (error) {
    console.error("Error saving reading to Supabase:", error);
    
    // Fallback to local storage only
    const localReading: SavedReading = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };
    saveToLocalStorage(localReading);
    return localReading;
  }
}

function saveToLocalStorage(reading: SavedReading): void {
  try {
    const stored = localStorage.getItem("vedic_readings_backup");
    const readings = stored ? JSON.parse(stored) : [];
    readings.unshift(reading);
    // Keep last 50 readings
    localStorage.setItem("vedic_readings_backup", JSON.stringify(readings.slice(0, 50)));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
}

export async function getReadings(
  birthDate: string,
  birthLocation: string
): Promise<SavedReading[]> {
  try {
    const { data, error } = await supabase
      .from("transit_readings")
      .select("*")
      .eq("birth_date", birthDate)
      .eq("birth_location", birthLocation)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data ?? []) as unknown as SavedReading[];
  } catch (error) {
    console.error("Error fetching readings from Supabase:", error);
    
    // Fallback to local storage
    return getFromLocalStorage(birthDate, birthLocation);
  }
}

function getFromLocalStorage(birthDate: string, birthLocation: string): SavedReading[] {
  try {
    const stored = localStorage.getItem("vedic_readings_backup");
    if (!stored) return [];
    
    const readings: SavedReading[] = JSON.parse(stored);
    return readings
      .filter((r) => r.birth_date === birthDate && r.birth_location === birthLocation)
      .slice(0, 10);
  } catch (error) {
    console.error("Error reading from local storage:", error);
    return [];
  }
}
