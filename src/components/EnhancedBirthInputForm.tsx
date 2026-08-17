/**
 * Enhanced Birth Input Form
 * CORRECTED: Date displayed as DD/MM/YYYY (Indian standard).
 * Internal state always YYYY-MM-DD for all service calls.
 * All other logic unchanged from original.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Save, History, CheckCircle, AlertCircle } from "lucide-react";
import { getUserProfile, addBirthDetails, getLastUsedProfile } from "@/services/userProfileService";
import { searchLocation, formatCoordinates, type LocationResult } from "@/services/geocodingService";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import jataksDB from "../data/jataks/JATAKS_DATABASE.json";

interface EnhancedBirthInputFormProps {
  lang: "en" | "hi";
  onSubmit: (data: { date: string; time: string; location: string }) => void;
  className?: string;
  showAutoSave?: boolean;
  showProgress?: boolean;
}

// ── DD/MM/YYYY helpers ────────────────────────────────────────────────────────
/** Convert YYYY-MM-DD → DD/MM/YYYY for display */
function toDisplay(iso: string): string {
  if (!iso || !iso.includes("-")) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
/** Convert DD/MM/YYYY → YYYY-MM-DD for internal state */
function toISO(dmy: string): string {
  if (!dmy) return "";
  // Already ISO?
  if (/^\d{4}-\d{2}-\d{2}$/.test(dmy)) return dmy;
  const parts = dmy.replace(/[.\-]/g, "/").split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
  }
  return dmy;
}
/** Validate a YYYY-MM-DD string */
function isValidISO(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(iso + "T00:00:00");
  return !isNaN(d.getTime()) && d < new Date();
}
// ─────────────────────────────────────────────────────────────────────────────

const labels = {
  en: {
    title: "Enter Birth Details",
    subtitle: "DD/MM/YYYY format • Accurate Vedic calculations",
    date: "Date of Birth",
    time: "Time of Birth",
    location: "Place of Birth",
    submit: "Get Transit Reading",
    datePlaceholder: "DD/MM/YYYY  e.g. 15/09/1963",
    timePlaceholder: "HH:MM  e.g. 06:00",
    locationPlaceholder: "e.g. Udaipur, Rajasthan",
    savedDetails: "Saved Profiles",
    newEntry: "New Entry",
    autoSave: "Auto-save enabled",
    saving: "Saving...",
    saved: "Saved",
    progress: "Form Progress",
    step1: "Basic Info",
    step2: "Time Details",
    step3: "Location",
    step4: "Submit",
    quickActions: "Quick Actions",
    useCurrentDate: "Use Today",
    useCurrentTime: "Use Current Time",
    useLastLocation: "Use Last Location",
    clearForm: "Clear Form",
    saveProfile: "Save Profile",
    formComplete: "Form Complete",
    formIncomplete: "Please fill all fields",
  },
  hi: {
    title: "जन्म विवरण दर्ज करें",
    subtitle: "DD/MM/YYYY प्रारूप • सटीक वैदिक गणनाएं",
    date: "जन्म तिथि",
    time: "जन्म समय",
    location: "जन्म स्थान",
    submit: "गोचर फल देखें",
    datePlaceholder: "DD/MM/YYYY  जैसे 15/09/1963",
    timePlaceholder: "HH:MM  जैसे 06:00",
    locationPlaceholder: "जैसे उदयपुर, राजस्थान",
    savedDetails: "सहेजे गए प्रोफाइल",
    newEntry: "नया विवरण",
    autoSave: "ऑटो-सेव सक्षम",
    saving: "सहेज रहे हैं...",
    saved: "सहेजा गया",
    progress: "फॉर्म प्रगति",
    step1: "मूल जानकारी",
    step2: "समय विवरण",
    step3: "स्थान",
    step4: "सबमिट करें",
    quickActions: "त्वरित कार्रवाइयाँ",
    useCurrentDate: "आज की तिथि",
    useCurrentTime: "वर्तमान समय",
    useLastLocation: "अंतिम स्थान",
    clearForm: "फॉर्म साफ़ करें",
    saveProfile: "प्रोफाइल सहेजें",
    formComplete: "फॉर्म पूर्ण",
    formIncomplete: "कृपया सभी फ़ील्ड भरें",
  },
};

export default function EnhancedBirthInputForm({
  lang,
  onSubmit,
  className,
  showAutoSave = true,
  showProgress = true,
}: EnhancedBirthInputFormProps) {
  // Internal state: always YYYY-MM-DD
  const [date, setDate] = useState("");
  // Display state: DD/MM/YYYY for the text input
  const [dateDisplay, setDateDisplay] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [savedDetails, setSavedDetails] = useState<Array<{ date: string; time: string; location: string; name?: string }>>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [validation, setValidation] = useState({
    date: { isValid: false, message: "" },
    time: { isValid: false, message: "" },
    location: { isValid: false, message: "" },
  });
  const [currentStep, setCurrentStep] = useState(1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const t = labels[lang];

  // Sync display whenever internal date changes
  useEffect(() => {
    setDateDisplay(date ? toDisplay(date) : "");
  }, [date]);

  // Load saved profiles
  useEffect(() => {
    const profile = getUserProfile();
    let loadedProfiles: Array<{ date: string; time: string; location: string; name?: string }> = [];
    if (profile?.savedBirthDetails) loadedProfiles = [...profile.savedBirthDetails];

    if (jataksDB && jataksDB.jataks) {
      const dbJataks = jataksDB.jataks.map((j) => ({
        date: j.dateOfBirth,
        time: j.timeOfBirth,
        location: j.placeOfBirth + (j.state ? `, ${j.state}` : ""),
        name: j.name || "Unknown Jatak",
      }));
      for (const dj of dbJataks) {
        if (!loadedProfiles.find((p) => p.date === dj.date && p.time === dj.time))
          loadedProfiles.push(dj);
      }
    }
    setSavedDetails(loadedProfiles);

    const lastProfile = getLastUsedProfile();
    if (lastProfile) {
      setDate(lastProfile.date);
      setTime(lastProfile.time);
      setLocation(lastProfile.location);
    }
  }, []);

  // Location search debounce
  useEffect(() => {
    if (location.length < 2) { setLocationResults([]); setShowDropdown(false); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocation(location);
      setLocationResults(results);
      setShowDropdown(results.length > 0);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!showAutoSave || !date || !time || !location) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(handleAutoSave, 2000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [date, time, location, showAutoSave]);

  // Validation
  useEffect(() => {
    setValidation({
      date: {
        isValid: isValidISO(date),
        message: date && !isValidISO(date) ? (lang === "hi" ? "अमान्य तिथि (DD/MM/YYYY)" : "Invalid date (DD/MM/YYYY)") : "",
      },
      time: {
        isValid: /^([01]?\d|2[0-3]):[0-5]\d$/.test(time),
        message: time && !/^([01]?\d|2[0-3]):[0-5]\d$/.test(time) ? (lang === "hi" ? "अमान्य समय" : "Invalid time") : "",
      },
      location: {
        isValid: location.length >= 2,
        message: location.length === 1 ? (lang === "hi" ? "कम से कम 2 अक्षर" : "At least 2 characters") : "",
      },
    });
  }, [date, time, location, lang]);

  // Step progress
  useEffect(() => {
    if (date && time && location) setCurrentStep(4);
    else if (date && time) setCurrentStep(3);
    else if (date) setCurrentStep(2);
    else setCurrentStep(1);
  }, [date, time, location]);

  const handleAutoSave = async () => {
    if (!date || !time || !location) return;
    setIsAutoSaving(true);
    try {
      await addBirthDetails({ date, time, location });
      setLastSaveTime(new Date());
      const profile = getUserProfile();
      if (profile?.savedBirthDetails) setSavedDetails(profile.savedBirthDetails);
    } catch (e) { console.error("Auto-save failed:", e); }
    finally { setIsAutoSaving(false); }
  };

  /** Handle typed DD/MM/YYYY input — auto-format and convert to ISO internally */
  const handleDateInput = (raw: string) => {
    // Strip non-digits/slashes, auto-insert slashes after DD and MM
    let cleaned = raw.replace(/[^\d/]/g, "");
    if (cleaned.length === 2 && !cleaned.includes("/")) cleaned += "/";
    if (cleaned.length === 5 && cleaned.split("/").length === 2) cleaned += "/";
    setDateDisplay(cleaned);
    // Only convert to ISO when full DD/MM/YYYY entered
    const iso = toISO(cleaned);
    setDate(iso && isValidISO(iso) ? iso : "");
  };

  const handleSavedSelect = (index: string) => {
    if (index === "new") { setDate(""); setTime(""); setLocation(""); setSelectedCoords(null); return; }
    const selected = savedDetails[parseInt(index)];
    if (selected) {
      setDate(selected.date);
      setTime(selected.time);
      setLocation(selected.location);
      setSelectedCoords(null);
      toast({ title: lang === "hi" ? "✅ प्रोफाइल लोड किया" : "✅ Profile Loaded" });
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
      addBirthDetails({ date, time, location });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "useCurrentDate": setDate(new Date().toISOString().split("T")[0]); break;
      case "useCurrentTime": {
        const n = new Date();
        setTime(`${n.getHours().toString().padStart(2,"0")}:${n.getMinutes().toString().padStart(2,"0")}`);
        break;
      }
      case "useLastLocation": {
        const lp = getLastUsedProfile();
        if (lp?.location) setLocation(lp.location);
        break;
      }
      case "clearForm": setDate(""); setTime(""); setLocation(""); setSelectedCoords(null); break;
      case "saveProfile":
        if (date && time && location) {
          handleAutoSave();
          toast({ title: lang === "hi" ? "✅ प्रोफाइल सहेजा" : "✅ Profile Saved" });
        }
        break;
    }
  };

  const isFormValid = validation.date.isValid && validation.time.isValid && validation.location.isValid;
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>

      {/* Progress Indicator */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span className={lang === "hi" ? "font-hindi" : ""}>{t.progress}</span>
            <span>{currentStep}/4</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            {[t.step1, t.step2, t.step3, t.step4].map((s, i) => (
              <span key={s} className={cn("text-muted-foreground", currentStep >= i + 1 && "text-primary font-medium")}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className={cn("text-2xl font-heading font-bold text-secondary mb-1", lang === "hi" && "font-hindi")}>{t.title}</h2>
          <p className={cn("text-xs text-muted-foreground", lang === "hi" && "font-hindi")}>{t.subtitle}</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-primary" />
            <span className={cn("text-sm font-medium", lang === "hi" && "font-hindi")}>{t.quickActions}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "useCurrentDate", icon: <Calendar className="h-3 w-3 mr-1" />, label: t.useCurrentDate },
              { key: "useCurrentTime", icon: <Clock className="h-3 w-3 mr-1" />, label: t.useCurrentTime },
              { key: "useLastLocation", icon: <MapPin className="h-3 w-3 mr-1" />, label: t.useLastLocation },
              { key: "clearForm", icon: null, label: t.clearForm },
              { key: "saveProfile", icon: <Save className="h-3 w-3 mr-1" />, label: t.saveProfile },
            ].map(({ key, icon, label }) => (
              <Button key={key} type="button" variant="outline" size="sm"
                onClick={() => handleQuickAction(key)} className="text-xs"
                disabled={key === "saveProfile" && !isFormValid}>
                {icon}{label}
              </Button>
            ))}
          </div>
        </div>

        {/* Saved Profiles */}
        {savedDetails.length > 0 && (
          <div className="space-y-2">
            <Label className={cn("flex items-center gap-2", lang === "hi" && "font-hindi")}>
              <History className="h-4 w-4" />{t.savedDetails}
            </Label>
            <Select onValueChange={handleSavedSelect}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t.newEntry} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">{t.newEntry}</SelectItem>
                {savedDetails.map((detail, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    <span className="font-medium">{detail.name ?? `${toDisplay(detail.date)} • ${detail.time}`}</span>
                    {detail.name && <span className="text-xs text-muted-foreground ml-2">{toDisplay(detail.date)}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Field — DD/MM/YYYY text input */}
          <div className="space-y-2">
            <Label htmlFor="dob" className={cn("flex items-center gap-2", lang === "hi" && "font-hindi")}>
              <Calendar className="h-4 w-4" />
              {t.date}
              {validation.date.isValid
                ? <CheckCircle className="h-3 w-3 text-green-600" />
                : dateDisplay ? <AlertCircle className="h-3 w-3 text-red-600" /> : null}
            </Label>
            <Input
              id="dob"
              type="text"
              inputMode="numeric"
              value={dateDisplay}
              onChange={(e) => handleDateInput(e.target.value)}
              placeholder={t.datePlaceholder}
              maxLength={10}
              className="bg-background border-border font-mono tracking-wider"
              required
            />
            {validation.date.message && <p className="text-xs text-red-600">{validation.date.message}</p>}
            {validation.date.isValid && (
              <p className="text-xs text-green-600">✓ {date}</p>
            )}
          </div>

          {/* Time Field */}
          <div className="space-y-2">
            <Label htmlFor="tob" className={cn("flex items-center gap-2", lang === "hi" && "font-hindi")}>
              <Clock className="h-4 w-4" />
              {t.time}
              {validation.time.isValid
                ? <CheckCircle className="h-3 w-3 text-green-600" />
                : time ? <AlertCircle className="h-3 w-3 text-red-600" /> : null}
            </Label>
            <Input
              id="tob"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-background border-border"
              required
              step="60"
            />
            {validation.time.message && <p className="text-xs text-red-600">{validation.time.message}</p>}
          </div>
        </div>

        {/* Location Field */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <Label htmlFor="pob" className={cn("flex items-center gap-2", lang === "hi" && "font-hindi")}>
            <MapPin className="h-4 w-4" />
            {t.location}
            {validation.location.isValid
              ? <CheckCircle className="h-3 w-3 text-green-600" />
              : location ? <AlertCircle className="h-3 w-3 text-red-600" /> : null}
          </Label>
          <Input
            id="pob"
            type="text"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setSelectedCoords(null); }}
            placeholder={t.locationPlaceholder}
            className="bg-background border-border"
            required
            autoComplete="off"
          />
          {showDropdown && locationResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {locationResults.map((result, idx) => (
                <button key={idx} type="button" onClick={() => handleLocationSelect(result)}
                  className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0">
                  <div className="text-sm font-medium">{result.name}</div>
                  <div className="text-xs text-muted-foreground">{result.displayName}</div>
                  <div className="text-xs text-primary mt-1">📍 {formatCoordinates(result.lat, result.lon)}</div>
                </button>
              ))}
            </div>
          )}
          {isSearching && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="animate-spin">⟳</span>
              {lang === "hi" ? "खोज रहे हैं..." : "Searching..."}
            </div>
          )}
          {selectedCoords && (
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {lang === "hi" ? "निर्देशांक" : "Coordinates"}: {formatCoordinates(selectedCoords.lat, selectedCoords.lon)}
            </div>
          )}
        </div>

        {/* Auto-save Status */}
        {showAutoSave && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {isAutoSaving
                ? <><span className="animate-spin">⟳</span><span>{t.saving}</span></>
                : lastSaveTime
                  ? <><CheckCircle className="h-3 w-3 text-green-600" /><span>{t.saved} • {lastSaveTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></>
                  : <><Save className="h-3 w-3" /><span>{t.autoSave}</span></>}
            </div>
            <div className={cn("px-2 py-1 rounded text-xs font-medium",
              isFormValid ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200")}>
              {isFormValid ? t.formComplete : t.formIncomplete}
            </div>
          </div>
        )}

        {/* Submit */}
        <Button type="submit" className="w-full text-base font-semibold" size="lg" disabled={!isFormValid}>
          {lang === "hi" ? <span className="font-hindi">{t.submit}</span> : t.submit}
        </Button>
      </form>
    </div>
  );
}
