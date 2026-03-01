// Save Rajkumar and Priyanka user data
// This creates a JSON file that can be imported into the app

const users = {
  exportDate: new Date().toISOString(),
  users: [
    {
      name: "Rajkumar",
      profile: {
        name: "Rajkumar Singh",
        email: "rajkumar@example.com",
        defaultLocation: "Aspur, Dungarpur, Rajasthan",
        savedBirthDetails: [
          {
            date: "1963-09-15",
            time: "06:00",
            location: "Aspur, Dungarpur, Rajasthan",
            coordinates: "23.84°N, 73.71°E",
            moonRashi: "Cancer (कर्क)",
            moonRashiIndex: 3
          }
        ]
      }
    },
    {
      name: "Priyanka",
      profile: {
        name: "Priyanka",
        email: "priyanka@example.com",
        defaultLocation: "Ahmedabad, Gujarat",
        savedBirthDetails: [
          {
            date: "1984-10-23",
            time: "05:50",
            location: "Ahmedabad, Gujarat",
            coordinates: "23.03°N, 72.58°E",
            moonRashi: "Taurus (वृषभ)",
            moonRashiIndex: 1
          }
        ]
      }
    }
  ]
};

// Create individual export files for each user
const rajkumarExport = {
  profile: users.users[0].profile,
  readings: [],
  exportDate: users.exportDate
};

const priyankaExport = {
  profile: users.users[1].profile,
  readings: [],
  exportDate: users.exportDate
};

// Combined export
const combinedExport = {
  profiles: users.users.map(u => u.profile),
  exportDate: users.exportDate,
  note: "Import individual profiles separately or use the first profile"
};

console.log("\n" + "=".repeat(80));
console.log("📁 USER DATA EXPORT");
console.log("=".repeat(80));
console.log("\n1️⃣  RAJKUMAR DATA:");
console.log(JSON.stringify(rajkumarExport, null, 2));

console.log("\n" + "=".repeat(80));
console.log("\n2️⃣  PRIYANKA DATA:");
console.log(JSON.stringify(priyankaExport, null, 2));

console.log("\n" + "=".repeat(80));
console.log("\n3️⃣  COMBINED DATA:");
console.log(JSON.stringify(combinedExport, null, 2));

console.log("\n" + "=".repeat(80));
console.log("\n📋 HOW TO USE:");
console.log("1. Copy the JSON data above");
console.log("2. Open the app at http://localhost:8080");
console.log("3. Click the User Profile icon (top right)");
console.log("4. Click 'Import Data'");
console.log("5. Paste the JSON and click Import");
console.log("\nOR");
console.log("6. Save to files and use the import feature:");
console.log("   - rajkumar-data.json");
console.log("   - priyanka-data.json");
console.log("=".repeat(80) + "\n");

// Write to files
import { writeFileSync } from 'fs';

writeFileSync('rajkumar-data.json', JSON.stringify(rajkumarExport, null, 2));
console.log("✅ Saved: rajkumar-data.json");

writeFileSync('priyanka-data.json', JSON.stringify(priyankaExport, null, 2));
console.log("✅ Saved: priyanka-data.json");

writeFileSync('users-combined.json', JSON.stringify(combinedExport, null, 2));
console.log("✅ Saved: users-combined.json");

console.log("\n✨ All user data files created successfully!\n");
