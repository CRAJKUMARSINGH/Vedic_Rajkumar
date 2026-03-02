/**
 * Test Geocoding Service
 * Verify location search and coordinate retrieval
 */

// Simulate the geocoding service
async function searchLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query)}` +
    `&format=json` +
    `&addressdetails=1` +
    `&limit=5` +
    `&countrycodes=in`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VedicRajkumarApp/1.0',
      },
    });

    const data = await response.json();
    
    return data.map(item => ({
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      country: item.address?.country,
      state: item.address?.state,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

function formatCoordinates(lat, lon) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

// Test cases
async function runTests() {
  console.log('🧪 Testing Geocoding Service\n');
  console.log('=' .repeat(60));

  const testCases = [
    'Udaipur',
    'Aspur, Dungarpur',
    'Mumbai',
    'Ahmedabad',
    'Indore',
    'Banswara',
  ];

  for (const testCase of testCases) {
    console.log(`\n📍 Searching: "${testCase}"`);
    console.log('-'.repeat(60));
    
    const results = await searchLocation(testCase);
    
    if (results.length === 0) {
      console.log('❌ No results found');
    } else {
      console.log(`✅ Found ${results.length} result(s):\n`);
      results.forEach((result, idx) => {
        console.log(`${idx + 1}. ${result.name}`);
        console.log(`   📌 ${result.displayName}`);
        console.log(`   🌍 ${formatCoordinates(result.lat, result.lon)}`);
        console.log(`   📊 Lat: ${result.lat.toFixed(4)}, Lon: ${result.lon.toFixed(4)}`);
        if (idx < results.length - 1) console.log();
      });
    }
    
    // Wait 1 second between requests (API rate limit)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);
