import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserProfile, saveUserProfile, exportUserData, importUserData, type UserProfile } from "@/services/userProfileService";
import { Download, Upload, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfileDialogProps {
  lang: "en" | "hi";
}

export default function UserProfileDialog({ lang }: UserProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});
  const { toast } = useToast();
  const isHi = lang === "hi";

  useEffect(() => {
    const stored = getUserProfile();
    if (stored) setProfile(stored);
  }, [open]);

  const handleSave = () => {
    saveUserProfile(profile);
    toast({
      title: isHi ? "✅ सहेजा गया" : "✅ Saved",
      description: isHi ? "आपकी प्रोफ़ाइल सहेजी गई" : "Your profile has been saved",
    });
    setOpen(false);
  };

  const handleExport = () => {
    const data = exportUserData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vedic-transit-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: isHi ? "📥 निर्यात किया गया" : "📥 Exported",
      description: isHi ? "डेटा डाउनलोड हो गया" : "Data downloaded successfully",
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importUserData(content);
      
      if (success) {
        toast({
          title: isHi ? "✅ आयात किया गया" : "✅ Imported",
          description: isHi ? "डेटा सफलतापूर्वक आयात किया गया" : "Data imported successfully",
        });
        const stored = getUserProfile();
        if (stored) setProfile(stored);
      } else {
        toast({
          title: isHi ? "❌ त्रुटि" : "❌ Error",
          description: isHi ? "अमान्य फ़ाइल" : "Invalid file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className={isHi ? "font-hindi" : ""}>{isHi ? "प्रोफ़ाइल" : "Profile"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={isHi ? "font-hindi" : ""}>
            {isHi ? "उपयोगकर्ता प्रोफ़ाइल" : "User Profile"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={isHi ? "font-hindi" : ""}>
              {isHi ? "नाम (वैकल्पिक)" : "Name (Optional)"}
            </Label>
            <Input
              id="name"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder={isHi ? "आपका नाम" : "Your name"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={isHi ? "font-hindi" : ""}>
              {isHi ? "ईमेल (वैकल्पिक)" : "Email (Optional)"}
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ""}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder={isHi ? "आपका ईमेल" : "Your email"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className={isHi ? "font-hindi" : ""}>
              {isHi ? "डिफ़ॉल्ट स्थान" : "Default Location"}
            </Label>
            <Input
              id="location"
              value={profile.defaultLocation || ""}
              onChange={(e) => setProfile({ ...profile, defaultLocation: e.target.value })}
              placeholder={isHi ? "शहर, राज्य" : "City, State"}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
              <span className={isHi ? "font-hindi" : ""}>{isHi ? "सहेजें" : "Save"}</span>
            </Button>
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className={`text-sm font-semibold ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "डेटा प्रबंधन" : "Data Management"}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm" className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                <span className={isHi ? "font-hindi" : ""}>{isHi ? "निर्यात" : "Export"}</span>
              </Button>
              
              <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span className={isHi ? "font-hindi" : ""}>{isHi ? "आयात" : "Import"}</span>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
