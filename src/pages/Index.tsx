import { useState, useEffect } from "react";
import BirthInputForm from "@/components/BirthInputForm";
import TransitTable from "@/components/TransitTable";
import LanguageToggle from "@/components/LanguageToggle";
import ReadingHistory from "@/components/ReadingHistory";
import UserProfileDialog from "@/components/UserProfileDialog";
import { calculateTransits, RASHIS, getMoonRashi, CURRENT_POSITIONS, type TransitResult } from "@/data/transitData";
import { saveReading, getReadings, type SavedReading } from "@/services/readingService";
import { getPlanetaryPositions, calculateMoonRashi } from "@/services/astronomyService";
import { addBirthDetails, getUserProfile } from "@/services/userProfileService";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Index = () => {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [birthData, setBirthData] = useState<{ date: string; time: string; location: string } | null>(null);
  const [results, setResults] = useState<TransitResult[] | null>(null);
  const [moonRashiIndex, setMoonRashiIndex] = useState(3);
  const [pastReadings, setPastReadings] = useState<SavedReading[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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

  const handleSubmit = async (data: { date: string; time: string; location: string }) => {
    setBirthData(data);
    
    // Save birth details to user profile
    addBirthDetails(data);
    
    const birthDate = new Date(data.date);
    const moonIdx = getMoonRashi(birthDate);
    setMoonRashiIndex(moonIdx);
    const transitResults = calculateTransits(moonIdx, CURRENT_POSITIONS);
    setResults(transitResults);

    // Save to database
    setSaving(true);
    const totalScore = transitResults.reduce((s, r) => s + r.scoreContribution, 0);
    const saved = await saveReading({
      birth_date: data.date,
      birth_time: data.time,
      birth_location: data.location,
      moon_rashi_index: moonIdx,
      transit_date: todayISO,
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

            <TransitTable 
              results={results} 
              lang={lang} 
              moonRashiIndex={moonRashiIndex}
              birthData={birthData}
              transitDate={today}
            />

            {/* Past readings */}
            {pastReadings.length > 1 && (
              <ReadingHistory readings={pastReadings} lang={lang} onView={handleViewPast} />
            )}

            {/* Reset */}
            <div className="flex justify-center">
              <button
                onClick={() => { setResults(null); setBirthData(null); setPastReadings([]); }}
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
