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

  if (error) {
    console.error("Error saving reading:", error);
    return null;
  }
  return saved as unknown as SavedReading;
}

export async function getReadings(
  birthDate: string,
  birthLocation: string
): Promise<SavedReading[]> {
  const { data, error } = await supabase
    .from("transit_readings")
    .select("*")
    .eq("birth_date", birthDate)
    .eq("birth_location", birthLocation)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching readings:", error);
    return [];
  }
  return (data ?? []) as unknown as SavedReading[];
}
