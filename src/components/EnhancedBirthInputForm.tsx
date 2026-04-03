/**
 * Enhanced Birth Input Form
 * Improved UX with auto-save, better validation, and progress indicators
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

interface EnhancedBirthInputFormProps {
  lang: "en" | "hi";
  onSubmit: (data: { date: string; time: string; location: string }) => void;
  className?: string;
  showAutoSave?: boolean;
  showProgress?: boolean;
}

const labels = {
  en: {
    title: "Enter Birth Details",
    subtitle: "Get accurate transit predictions",
    date: "Date of Birth",
    time: "Time of Birth",
    location: "Place of Birth",
    submit: "Get Transit Reading",
    datePlaceholder: "e.g. 15-09-1963",
    timePlaceholder: "e.g. 06:00 AM",
    locationPlaceholder: "e.g. Udaipur, Rajasthan",
    savedDetails: "Saved Profiles",
    newEntry: "New Entry",
    autoSave: "Auto-save enabled",
    saving: "Saving...",
    saved: "Saved",
    validate: "Validating...",
    valid: "✓ Valid",
    invalid: "✗ Invalid",
    required: "Required",
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
    loadProfile: "Load Profile",
    formComplete: "Form Complete",
    formIncomplete: "Please fill all fields",
  },
  hi: {
    title: "जन्म विवरण दर्ज करें",
    subtitle: "सटीक गोचर भविष्यवाणियाँ प्राप्त करें",
    date: "जन्म तिथि",
    time: "जन्म समय",
    location: "जन्म स्थान",
    submit: "गोचर फल देखें",
    datePlaceholder: "जैसे 15-09-1963",
    timePlaceholder: "जैसे 06:00 AM",
    locationPlaceholder: "जैसे उदयपुर, राजस्थान",
    savedDetails: "सहेजे गए प्रोफाइल",
    newEntry: "नया विवरण",
    autoSave: "ऑटो-सेव सक्षम",
    saving: "सहेज रहे हैं...",
    saved: "सहेजा गया",
    validate: "जाँच रहे हैं...",
    valid: "✓ वैध",
    invalid: "✗ अवैध",
    required: "आवश्यक",
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
    loadProfile: "प्रोफाइल लोड करें",
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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [savedDetails, setSavedDetails] = useState<Array<{ date: string; time: string; location: string }>>([]);
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

  // Load saved profiles
  useEffect(() => {
    const profile = getUserProfile();
    if (profile?.savedBirthDetails) {
      setSavedDetails(profile.savedBirthDetails);
    }
    
    // Auto-load last used profile
    const lastProfile = getLastUsedProfile();
    if (lastProfile) {
      setDate(lastProfile.date);
      setTime(lastProfile.time);
      setLocation(lastProfile.location);
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

  // Auto-save functionality
  useEffect(() => {
    if (!showAutoSave) return;
    
    const hasAllFields = date && time && location;
    if (!hasAllFields) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [date, time, location, showAutoSave]);

  // Form validation
  useEffect(() => {
    validateForm();
  }, [date, time, location]);

  // Update current step based on form completion
  useEffect(() => {
    if (date && time && location) {
      setCurrentStep(4);
    } else if (date && time) {
      setCurrentStep(3);
    } else if (date) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [date, time, location]);

  const validateForm = useCallback(() => {
    const newValidation = {
      date: { isValid: false, message: "" },
      time: { isValid: false, message: "" },
      location: { isValid: false, message: "" },
    };

    // Date validation
    if (date) {
      const dateObj = new Date(date);
      const isValid = !isNaN(dateObj.getTime()) && dateObj < new Date();
      newValidation.date = {
        isValid,
        message: isValid ? "" : lang === "hi" ? "अमान्य तिथि" : "Invalid date",
      };
    }

    // Time validation
    if (time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const isValid = timeRegex.test(time);
      newValidation.time = {
        isValid,
        message: isValid ? "" : lang === "hi" ? "अमान्य समय" : "Invalid time",
      };
    }

    // Location validation
    if (location) {
      const isValid = location.length >= 2;
      newValidation.location = {
        isValid,
        message: isValid ? "" : lang === "hi" ? "कम से कम 2 अक्षर" : "At least 2 characters",
      };
    }

    setValidation(newValidation);
  }, [date, time, location, lang]);

  const handleAutoSave = async () => {
    if (!date || !time || !location) return;

    setIsAutoSaving(true);
    try {
      await addBirthDetails({ date, time, location });
      setLastSaveTime(new Date());
      
      // Update saved details list
      const profile = getUserProfile();
      if (profile?.savedBirthDetails) {
        setSavedDetails(profile.savedBirthDetails);
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsAutoSaving(false);
    }
  };

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
        
        toast({
          title: lang === "hi" ? "✅ प्रोफाइल लोड किया" : "✅ Profile Loaded",
          description: lang === "hi" 
            ? `प्रोफाइल लोड किया: ${selected.location}`
            : `Profile loaded: ${selected.location}`,
        });
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
      
      // Save as last used
      addBirthDetails({ date, time, location });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "useCurrentDate":
        setDate(new Date().toISOString().split("T")[0]);
        break;
      case "useCurrentTime":
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        setTime(`${hours}:${minutes}`);
        break;
      case "useLastLocation":
        const lastProfile = getLastUsedProfile();
        if (lastProfile?.location) {
          setLocation(lastProfile.location);
        }
        break;
      case "clearForm":
        setDate("");
        setTime("");
        setLocation("");
        setSelectedCoords(null);
        break;
      case "saveProfile":
        if (date && time && location) {
          handleAutoSave();
          toast({
            title: lang === "hi" ? "✅ प्रोफाइल सहेजा" : "✅ Profile Saved",
            description: lang === "hi" 
              ? "आपका प्रोफाइल सहेजा गया"
              : "Your profile has been saved",
          });
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
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span className={lang === "hi" ? "font-hindi" : ""}>{t.progress}</span>
            <span>{currentStep}/4</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className={cn("text-muted-foreground", currentStep >= 1 && "text-primary font-medium")}>
              {t.step1}
            </span>
            <span className={cn("text-muted-foreground", currentStep >= 2 && "text-primary font-medium")}>
              {t.step2}
            </span>
            <span className={cn("text-muted-foreground", currentStep >= 3 && "text-primary font-medium")}>
              {t.step3}
            </span>
            <span className={cn("text-muted-foreground", currentStep >= 4 && "text-primary font-medium")}>
              {t.step4}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className={cn(
            "text-2xl font-heading font-bold text-secondary mb-2",
            lang === "hi" && "font-hindi"
          )}>
            {t.title}
          </h2>
          <p className={cn(
            "text-sm text-muted-foreground",
            lang === "hi" && "font-hindi"
          )}>
            {t.subtitle}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-primary" />
            <span className={cn("text-sm font-medium", lang === "hi" && "font-hindi")}>
              {t.quickActions}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("useCurrentDate")}
              className="text-xs"
            >
              <Calendar className="h-3 w-3 mr-1" />
              {t.useCurrentDate}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("useCurrentTime")}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {t.useCurrentTime}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("useLastLocation")}
              className="text-xs"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {t.useLastLocation}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("clearForm")}
              className="text-xs"
            >
              {t.clearForm}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("saveProfile")}
              className="text-xs"
              disabled={!isFormValid}
            >
              <Save className="h-3 w-3 mr-1" />
              {t.saveProfile}
            </Button>
          </div>
        </div>

        {/* Saved Profiles */}
        {savedDetails.length > 0 && (
          <div className="space-y-2">
            <Label className={cn("flex items-center gap-2", lang === "hi" && "font-hindi")}>
              <History className="h-4 w-4" />
              {t.savedDetails}
            </Label>
            <Select onValueChange={handleSavedSelect}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t.newEntry} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">{t.newEntry}</SelectItem>
                {savedDetails.map((detail, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    <div className="flex items-center justify-between">
                      <span>{detail.date} • {detail.time}</span>
                      <span className="text-xs text-muted-foreground">{detail.location}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Field */}
          <div className="space-y-2">
            <Label htmlFor="dob" className={cn("flex items-center gap-2", lang === "hi" && "font-hindi")}>
              <Calendar className="h-4 w-4" />
              {t.date}
              {validation.date.isValid ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : date ? (
                <AlertCircle className="h-3 w-3 text-red-600" />
              ) : null}
            </Label>
            <Input
              id="dob"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background border-border"
              required
              max={new Date().toISOString().split("T")[0]}
            />
            {validation.date.message && (
              <p className="text-xs text-red-600">{validation.date.message}</p>
            )}
          </div>

          {/* Time Field */}
          <div className="space-y-2">
            <Label htmlFor="tob" className={cn("flex items-center gap-2", lang === "hi" && "font-hindi")}>
              <Clock className="h-4 w-4" />
              {t.time}
              {validation.time.isValid ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : time ? (
                <AlertCircle className="h-3 w-3 text-red-600" />
              ) : null}
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
            {validation.time.message && (
              <p className="text-xs text-red-600">{validation.time.message}</p>
            )}
          </div>
        </div>

        {/* Location Field */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <Label htmlFor="pob" className={cn("flex items-center gap-2", lang === "hi" && "font-hindi")}>
            <MapPin className="h-4 w-4" />
            {t.location}
            {validation.location.isValid ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : location ? (
              <AlertCircle className="h-3 w-3 text-red-600" />
            ) : null}
          </Label>
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
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="animate-spin">⟳</span>
              {lang === "hi" ? "खोज रहे हैं..." : "Searching..."}
            </div>
          )}

          {/* Selected coordinates display */}
          {selectedCoords && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span className={lang === "hi" ? "font-hindi" : ""}>
                {lang === "hi" ? "निर्देशांक" : "Coordinates"}: {formatCoordinates(selectedCoords.lat, selectedCoords.lon)}
              </span>
            </div>
          )}

          {/* Help text */}
          {!selectedCoords && location.length >= 2 && !isSearching && locationResults.length === 0 && (
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {lang === "hi" ? "कोई स्थान नहीं मिला। कृपया अलग नाम आज़माएं।" : "No locations found. Try a different name."}
            </div>
          )}

          {validation.location.message && (
            <p className="text-xs text-red-600">{validation.location.message}</p>
          )}
        </div>

        {/* Auto-save Status */}
        {showAutoSave && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {isAutoSaving ? (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>{t.saving}</span>
                </>
              ) : lastSaveTime ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>{t.saved} • {lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  <span>{t.autoSave}</span>
                </>
              )}
            </div>
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              isFormValid 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            )}>
              {isFormValid ? t.formComplete : t.formIncomplete}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full text-base font-semibold" 
          size="lg"
          disabled={!isFormValid}
        >
          {lang === "hi" ? <span className="font-hindi">{t.submit}</span> : t.submit}
        </Button>
      </form>
    </div>
  );
}