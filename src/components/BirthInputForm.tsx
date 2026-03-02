import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserProfile } from "@/services/userProfileService";
import { searchLocation, formatCoordinates, type LocationResult } from "@/services/geocodingService";

interface BirthInputFormProps {
  lang: "en" | "hi";
  onSubmit: (data: { date: string; time: string; location: string }) => void;
}

const labels = {
  en: {
    title: "Enter Birth Details",
    date: "Date of Birth",
    time: "Time of Birth",
    location: "Place of Birth",
    submit: "Get Transit Reading",
    datePlaceholder: "e.g. 15-09-1963",
    timePlaceholder: "e.g. 06:00 AM",
    locationPlaceholder: "e.g. Udaipur, Rajasthan",
    savedDetails: "Use Saved Details",
    newEntry: "New Entry",
  },
  hi: {
    title: "जन्म विवरण दर्ज करें",
    date: "जन्म तिथि",
    time: "जन्म समय",
    location: "जन्म स्थान",
    submit: "गोचर फल देखें",
    datePlaceholder: "जैसे 15-09-1963",
    timePlaceholder: "जैसे 06:00 AM",
    locationPlaceholder: "जैसे उदयपुर, राजस्थान",
    savedDetails: "सहेजे गए विवरण",
    newEntry: "नया विवरण",
  },
};

export default function BirthInputForm({ lang, onSubmit }: BirthInputFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [savedDetails, setSavedDetails] = useState<Array<{ date: string; time: string; location: string }>>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = labels[lang];

  useEffect(() => {
    const profile = getUserProfile();
    if (profile?.savedBirthDetails) {
      setSavedDetails(profile.savedBirthDetails);
    }
  }, []);

  // Handle location search with debounce
  useEffect(() => {
    if (location.length < 2) {
      setLocationResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocation(location);
      setLocationResults(results);
      setShowDropdown(results.length > 0);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSavedSelect = (index: string) => {
    if (index === "new") {
      setDate("");
      setTime("");
      setLocation("");
      setSelectedCoords(null);
    } else {
      const selected = savedDetails[parseInt(index)];
      if (selected) {
        setDate(selected.date);
        setTime(selected.time);
        setLocation(selected.location);
        setSelectedCoords(null);
      }
    }
  };

  const handleLocationSelect = (result: LocationResult) => {
    setLocation(result.displayName);
    setSelectedCoords({ lat: result.lat, lon: result.lon });
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time && location) {
      onSubmit({ date, time, location });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
      <h2 className={`text-2xl font-heading font-bold text-center text-secondary ${lang === "hi" ? "font-hindi" : ""}`}>
        {t.title}
      </h2>
      
      {savedDetails.length > 0 && (
        <div className="space-y-2">
          <Label className={lang === "hi" ? "font-hindi" : ""}>{t.savedDetails}</Label>
          <Select onValueChange={handleSavedSelect}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={t.newEntry} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">{t.newEntry}</SelectItem>
              {savedDetails.map((detail, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {detail.date} • {detail.time} • {detail.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="dob" className={lang === "hi" ? "font-hindi" : ""}>{t.date}</Label>
        <Input
          id="dob"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-background border-border"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tob" className={lang === "hi" ? "font-hindi" : ""}>{t.time}</Label>
        <Input
          id="tob"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-background border-border"
          required
        />
      </div>
      <div className="space-y-2 relative" ref={dropdownRef}>
        <Label htmlFor="pob" className={lang === "hi" ? "font-hindi" : ""}>{t.location}</Label>
        <Input
          id="pob"
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setSelectedCoords(null);
          }}
          placeholder={t.locationPlaceholder}
          className="bg-background border-border"
          required
          autoComplete="off"
        />
        
        {/* Auto-complete dropdown */}
        {showDropdown && locationResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {locationResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLocationSelect(result)}
                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
              >
                <div className="text-sm font-medium">{result.name}</div>
                <div className="text-xs text-muted-foreground">{result.displayName}</div>
                <div className="text-xs text-primary mt-1">
                  📍 {formatCoordinates(result.lat, result.lon)}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isSearching && (
          <div className="text-xs text-muted-foreground mt-1">
            {lang === "hi" ? "खोज रहे हैं..." : "Searching..."}
          </div>
        )}

        {/* Selected coordinates display */}
        {selectedCoords && (
          <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
            <span>✓</span>
            <span className={lang === "hi" ? "font-hindi" : ""}>
              {lang === "hi" ? "निर्देशांक" : "Coordinates"}: {formatCoordinates(selectedCoords.lat, selectedCoords.lon)}
            </span>
          </div>
        )}

        {/* Help text */}
        {!selectedCoords && location.length >= 2 && !isSearching && locationResults.length === 0 && (
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            {lang === "hi" ? "कोई स्थान नहीं मिला। कृपया अलग नाम आज़माएं।" : "No locations found. Try a different name."}
          </div>
        )}
      </div>
      <Button type="submit" className="w-full text-base font-semibold" size="lg">
        {lang === "hi" ? <span className="font-hindi">{t.submit}</span> : t.submit}
      </Button>
    </form>
  );
}
