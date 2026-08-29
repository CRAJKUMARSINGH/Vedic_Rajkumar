// scripts/seedJataks.ts
// Seeds JATAKS_DATABASE.json into Supabase birth_charts table.
// Run: SUPABASE_SERVICE_KEY=<your-service-key> npx tsx scripts/seedJataks.ts
//
// Requires:
//   - VITE_SUPABASE_URL in environment
//   - SUPABASE_SERVICE_KEY in environment (service key — never the anon key for seeds)

import { createClient } from "@supabase/supabase-js";

// Uses the repo''s own coordinateParser.ts — no foreign code
function parseCoordinateString(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (!isNaN(n)) return n;
  // Handle "23.84N" / "73.71E" style strings
  if (typeof value === "string") {
    const match = value.match(/^([0-9.]+)\s*[NSEWnsew]?$/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return null;
}

// Load JATAKS_DATABASE.json — adjust path if needed
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jataksDB = require("../src/data/jataks/JATAKS_DATABASE.json");

async function seed() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const jataks = jataksDB.jataks ?? jataksDB;
  console.log(`Seeding ${jataks.length} jataks from ${jataksDB.databaseName ?? "JATAKS_DATABASE"}`);

  for (const j of jataks) {
    const lat = parseCoordinateString(j.coordinates?.latitude ?? j.lat);
    const lon = parseCoordinateString(j.coordinates?.longitude ?? j.lon);
    if (lat == null || lon == null) {
      console.warn(`  SKIP (no coords): ${j.name}`);
      continue;
    }

    const { error } = await supabase.from("birth_charts").upsert(
      {
        label:         j.name,
        date_of_birth: j.dateOfBirth ?? j.date_of_birth,
        time_of_birth: j.timeOfBirth ?? j.time_of_birth,
        city:          j.placeOfBirth
                         ? `${j.placeOfBirth}${j.state ? ", " + j.state : ""}`
                         : (j.city ?? ""),
        lat,
        lon,
        timezone:      j.timezone ?? "Asia/Kolkata",
        notes:         [j.relationship, j.notes].filter(Boolean).join(" · ") || null,
        source:        "JATAKS_DATABASE",
      },
      { onConflict: "label,date_of_birth,time_of_birth" }
    );

    if (error) console.error(`  ERROR: ${j.name}`, error.message);
    else        console.log(`  OK: ${j.name}`);
  }

  console.log("Seed complete.");
}

seed().catch(console.error);
