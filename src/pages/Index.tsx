import { useState, useEffect } from "react";
import BirthInputForm from "@/components/BirthInputForm";
import TransitTable from "@/components/TransitTable";
import TransitChart from "@/components/TransitChart";
import VisualTransitChart from "@/components/VisualTransitChart";
import AscendantNakshatraCard from "@/components/AscendantNakshatraCard";
import PlanetaryPositionsCard from "@/components/PlanetaryPositionsCard";
import LanguageToggle from "@/components/LanguageToggle";
import ReadingHistory from "@/components/ReadingHistory";
import UserProfileDialog from "@/components/UserProfileDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateTransits, RASHIS, getMoonRashi, CURRENT_POSITIONS, checkSadeSati, type TransitResult, type SadeSatiInfo } from "@/data/transitData";
import { saveReading, getReadings, type SavedReading } from "@/services/readingService";
import { getPlanetaryPositions, calculateMoonRashi } from "@/services/astronomyService";
import { addBirthDetails, getUserProfile } from "@/services/userProfileService";
import { calculateCompleteAscendant, type AscendantData } from "@/services/ascendantService";
import { getNakshatraInfo, type NakshatraInfo } from "@/services/nakshatraService";
import { calculateCompletePlanetaryPositions, type CompletePlanetaryPositions } from "@/services/ephemerisService";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Index = () => {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [birthData, setBirthData] = useState<{ date: string; time: string; location: string } | null>(null);
  const [transitDate, setTransitDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [results, setResults] = useState<TransitResult[] | null>(null);
  const [moonRashiIndex, setMoonRashiIndex] = useState(3);
  const [sadeSatiInfo, setSadeSatiInfo] = useState<SadeSatiInfo | null>(null);
  const [pastReadings, setPastReadings] = useState<SavedReading[]>([]);
  const [saving, setSaving] = useState(false);
  const [ascendantData, setAscendantData] = useState<AscendantData | null>(null);
  const [nakshatraData, setNakshatraData] = useState<NakshatraInfo | null>(null);
  const [planetaryPositions, setPlanetaryPositions] = useState<CompletePlanetaryPositions | null>(null);
  const { toast} = useToast();

  // Load user profile on mount
  useEffect(() => {
    const profile = getUserProfile();
    if (profile?.defaultLocation && !birthData) {
      // Could pre-fill location if needed
    }
  }, []);

  const isHi = lang === "hi";
  const today = new Date().toLocaleDateString(isHi ? "hi-IN" : "en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const todayISO = new Date().toISOString().split("T")[0];

  // Helper function to parse coordinates from location string
  const parseCoordinates = (location: string): { lat: number; lon: number } | null => {
    // Try to extract coordinates from location string
    // Format: "City (lat, lon)" or just "City"
    const coordMatch = location.match(/\(([^,]+),\s*([^)]+)\)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lon)) {
        return { lat, lon };
      }
    }
    
    // Default coordinates for common Indian cities (fallback)
    const cityDefaults: Record<string, { lat: number; lon: number }> = {
      'delhi': { lat: 28.61, lon: 77.23 },
      'mumbai': { lat: 19.08, lon: 72.88 },
      'bangalore': { lat: 12.97, lon: 77.59 },
      'kolkata': { lat: 22.57, lon: 88.36 },
      'chennai': { lat: 13.08, lon: 80.27 },
      'hyderabad': { lat: 17.39, lon: 78.49 },
      'ahmedabad': { lat: 23.03, lon: 72.58 },
      'pune': { lat: 18.52, lon: 73.86 },
      'jaipur': { lat: 26.91, lon: 75.79 },
      'indore': { lat: 22.72, lon: 75.86 },
      'dungarpur': { lat: 23.84, lon: 73.71 },
      'banswara': { lat: 23.54, lon: 74.44 },
      'nandli': { lat: 23.55, lon: 74.08 },
      'aspur': { lat: 23.84, lon: 73.71 },
      'idar': { lat: 23.84, lon: 73.01 },
    };
    
    const cityKey = location.toLowerCase().split('(')[0].trim();
    return cityDefaults[cityKey] || { lat: 23.0, lon: 72.0 }; // Default to Gujarat
  };

  const handleSubmit = async (data: { date: string; time: string; location: string }) => {
    setBirthData(data);
    
    // Save birth details to user profile
    addBirthDetails(data);
    
    // Parse coordinates from location
    const coords = parseCoordinates(data.location);
    
    // Calculate Ascendant
    try {
      const ascendant = calculateCompleteAscendant(
        data.date,
        data.time,
        coords.lat,
        coords.lon
      );
      setAscendantData(ascendant);
    } catch (error) {
      console.error('Error calculating ascendant:', error);
      setAscendantData(null);
    }
    
    // Calculate Nakshatra
    try {
      const nakshatra = getNakshatraInfo(data.date, data.time);
      setNakshatraData(nakshatra);
    } catch (error) {
      console.error('Error calculating nakshatra:', error);
      setNakshatraData(null);
    }
    
    // Calculate all planetary positions
    try {
      const positions = calculateCompletePlanetaryPositions(data.date, data.time);
      setPlanetaryPositions(positions);
    } catch (error) {
      console.error('Error calculating planetary positions:', error);
      setPlanetaryPositions(null);
    }
    
    const birthDate = new Date(data.date);
    const moonIdx = getMoonRashi(birthDate);
    setMoonRashiIndex(moonIdx);
    const transitResults = calculateTransits(moonIdx, CURRENT_POSITIONS);
    setResults(transitResults);

    // Check Sade Sati
    const saturnRashiIndex = CURRENT_POSITIONS.Saturn;
    const sadeSati = checkSadeSati(moonIdx, saturnRashiIndex);
    setSadeSatiInfo(sadeSati);

    // Save to database
    setSaving(true);
    const totalScore = transitResults.reduce((s, r) => s + r.scoreContribution, 0);
    const saved = await saveReading({
      birth_date: data.date,
      birth_time: data.time,
      birth_location: data.location,
      moon_rashi_index: moonIdx,
      transit_date: transitDate,
      overall_score: totalScore,
      results: transitResults,
    });
    setSaving(false);

    if (saved) {
      toast({
        title: isHi ? "✅ रीडिंग सहेजी गई" : "✅ Reading Saved",
        description: isHi ? "आपका गोचर फल सहेजा गया है" : "Your transit reading has been saved",
      });
    }

    // Fetch past readings
    const past = await getReadings(data.date, data.location);
    setPastReadings(past);
  };

  const handleViewPast = (reading: SavedReading) => {
    setBirthData({
      date: reading.birth_date,
      time: reading.birth_time,
      location: reading.birth_location,
    });
    setMoonRashiIndex(reading.moon_rashi_index);
    setResults(reading.results);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🕉️</span>
            <div>
              <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "गोचर फल" : "Gochar Phal"}
              </h1>
              <p className={`text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "वैदिक गोचर विश्लेषण • फलदीपिका एवं बृहत् पाराशर" : "Vedic Transit Analysis • Phaladeepika & BPHS"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to="/career"
              className={`text-sm text-primary hover:text-primary/80 underline underline-offset-2 ${isHi ? "font-hindi" : ""}`}
            >
              {isHi ? "करियर रिपोर्ट" : "Career Report"}
            </Link>
            <Link 
              to="/kaalsarp"
              className={`text-sm text-primary hover:text-primary/80 underline underline-offset-2 ${isHi ? "font-hindi" : ""}`}
            >
              {isHi ? "काल सर्प योग" : "Kaal Sarp Yoga"}
            </Link>
            <Link 
              to="/comprehensive"
              className={`text-sm text-primary hover:text-primary/80 underline underline-offset-2 ${isHi ? "font-hindi" : ""}`}
            >
              {isHi ? "व्यापक रिपोर्ट" : "Comprehensive Report"}
            </Link>
            <Link 
              to="/test"
              className={`text-sm text-orange-600 hover:text-orange-700 underline underline-offset-2 font-semibold ${isHi ? "font-hindi" : ""}`}
            >
              {isHi ? "परीक्षण" : "Test"}
            </Link>
            <UserProfileDialog lang={lang} />
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Date */}
        <p className={`text-center text-sm text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
          {isHi ? "गोचर तिथि" : "Transit Date"}: {today}
        </p>

        {/* Input form */}
        {!results && (
          <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
            <BirthInputForm lang={lang} onSubmit={handleSubmit} />
          </div>
        )}

        {/* Results */}
        {results && birthData && (
          <div className="space-y-4">
            {/* Transit Date Selector */}
            <div className="max-w-md mx-auto bg-card border border-border rounded-lg p-4">
              <Label htmlFor="transitDate" className={`text-sm font-semibold mb-2 block ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "गोचर तिथि चुनें" : "Select Transit Date"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="transitDate"
                  type="date"
                  value={transitDate}
                  onChange={(e) => setTransitDate(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    const transitResults = calculateTransits(moonRashiIndex, CURRENT_POSITIONS);
                    setResults(transitResults);
                    const saturnRashiIndex = CURRENT_POSITIONS.Saturn;
                    const sadeSati = checkSadeSati(moonRashiIndex, saturnRashiIndex);
                    setSadeSatiInfo(sadeSati);
                    toast({
                      title: isHi ? "✅ गोचर अपडेट किया गया" : "✅ Transit Updated",
                      description: isHi ? `तिथि: ${new Date(transitDate).toLocaleDateString('hi-IN')}` : `Date: ${new Date(transitDate).toLocaleDateString('en-IN')}`,
                    });
                  }}
                  size="sm"
                >
                  {isHi ? <span className="font-hindi">अपडेट करें</span> : "Update"}
                </Button>
              </div>
              <p className={`text-xs text-muted-foreground mt-2 ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "किसी भी तिथि के लिए गोचर देखें (भूत/वर्तमान/भविष्य)" : "View transits for any date (past/present/future)"}
              </p>
            </div>

            {/* Birth info */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                {isHi ? <span className="font-hindi">जन्म: {birthData.date}</span> : `Birth: ${birthData.date}`}
              </span>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                {isHi ? <span className="font-hindi">समय: {birthData.time}</span> : `Time: ${birthData.time}`}
              </span>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                {isHi ? <span className="font-hindi">स्थान: {birthData.location}</span> : `Place: ${birthData.location}`}
              </span>
              {saving && (
                <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs animate-pulse">
                  {isHi ? "सहेज रहे हैं..." : "Saving..."}
                </span>
              )}
            </div>

            {/* Ascendant & Nakshatra Card */}
            {(ascendantData || nakshatraData) && (
              <AscendantNakshatraCard
                ascendant={ascendantData ? {
                  rashiName: ascendantData.ascendant.rashiName,
                  degrees: ascendantData.ascendant.degrees
                } : undefined}
                nakshatra={nakshatraData ? {
                  name: nakshatraData.name,
                  pada: nakshatraData.pada,
                  lord: nakshatraData.lord,
                  symbol: nakshatraData.symbol
                } : undefined}
                lang={lang}
              />
            )}

            {/* Planetary Positions Card */}
            {planetaryPositions && (
              <PlanetaryPositionsCard
                positions={planetaryPositions}
                lang={lang}
              />
            )}

            {/* Sade Sati Alert */}
            {sadeSatiInfo?.active && (
              <div className="max-w-2xl mx-auto bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className={`font-bold text-orange-900 dark:text-orange-100 mb-2 ${isHi ? "font-hindi" : ""}`}>
                      {isHi ? "साढ़े साती सक्रिय!" : "Sade Sati Active!"}
                    </h3>
                    <p className={`text-sm text-orange-800 dark:text-orange-200 mb-3 ${isHi ? "font-hindi" : ""}`}>
                      {isHi ? sadeSatiInfo.description.hi : sadeSatiInfo.description.en}
                    </p>
                    <details className="text-sm">
                      <summary className={`cursor-pointer text-orange-700 dark:text-orange-300 font-semibold mb-2 ${isHi ? "font-hindi" : ""}`}>
                        {isHi ? "उपाय देखें" : "View Remedies"}
                      </summary>
                      <ul className={`list-disc list-inside space-y-1 text-orange-800 dark:text-orange-200 ${isHi ? "font-hindi" : ""}`}>
                        {(isHi ? sadeSatiInfo.remedies.hi : sadeSatiInfo.remedies.en).map((remedy, idx) => (
                          <li key={idx}>{remedy}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs for Chart and Table views */}
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="table" className={isHi ? "font-hindi" : ""}>
                  {isHi ? "तालिका दृश्य" : "Table View"}
                </TabsTrigger>
                <TabsTrigger value="chart" className={isHi ? "font-hindi" : ""}>
                  {isHi ? "चक्र दृश्य" : "Chart View"}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="table" className="mt-4">
                <TransitTable 
                  results={results} 
                  lang={lang} 
                  moonRashiIndex={moonRashiIndex}
                  birthData={birthData}
                  transitDate={today}
                />
              </TabsContent>
              
              <TabsContent value="chart" className="mt-4">
                <VisualTransitChart 
                  results={results}
                  moonRashiIndex={moonRashiIndex}
                  lang={lang}
                />
              </TabsContent>
            </Tabs>

            {/* Past readings */}
            {pastReadings.length > 1 && (
              <ReadingHistory readings={pastReadings} lang={lang} onView={handleViewPast} />
            )}

            {/* Reset */}
            <div className="flex justify-center">
              <button
                onClick={() => { 
                  setResults(null); 
                  setBirthData(null); 
                  setPastReadings([]); 
                  setAscendantData(null); 
                  setNakshatraData(null);
                  setPlanetaryPositions(null);
                }}
                className={`text-sm text-primary underline underline-offset-2 hover:text-primary/80 ${isHi ? "font-hindi" : ""}`}
              >
                {isHi ? "नया विवरण दर्ज करें" : "Enter new details"}
              </button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className={`text-center text-xs text-muted-foreground max-w-lg mx-auto ${isHi ? "font-hindi" : ""}`}>
          {isHi
            ? "⚠️ यह फलदीपिका व बृहत् पाराशर होरा शास्त्र पर आधारित सामान्य गोचर विश्लेषण है। वेध (अवरोध) व विपरीत वेध का विचार किया गया है। व्यक्तिगत फल हेतु पूर्ण कुंडली, दशा व अष्टकवर्ग विश्लेषण आवश्यक है।"
            : "⚠️ General transit analysis based on Phaladeepika & BPHS principles. Vedha (obstruction) & Vipreet Vedha are considered. For personalized results, full chart, Dasha & Ashtakavarga analysis is needed."}
        </p>
      </main>
    </div>
  );
};

export default Index;
