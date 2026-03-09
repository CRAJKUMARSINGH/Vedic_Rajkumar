/**
 * Ascendant & Nakshatra Display Card
 * Shows Lagna and Birth Star information
 */

import { Card } from "@/components/ui/card";

interface AscendantNakshatraCardProps {
  ascendant?: {
    rashiName: string;
    degrees: number;
  };
  nakshatra?: {
    name: {
      en: string;
      hi: string;
    };
    pada: number;
    lord: string;
    symbol: string;
  };
  lang: "en" | "hi";
}

export default function AscendantNakshatraCard({ 
  ascendant, 
  nakshatra, 
  lang 
}: AscendantNakshatraCardProps) {
  const isHi = lang === "hi";

  if (!ascendant && !nakshatra) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {/* Ascendant Card */}
      {ascendant && (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🌅</span>
            <div className="flex-1">
              <h3 className={`text-lg font-bold text-primary mb-2 ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "लग्न (Ascendant)" : "Ascendant (Lagna)"}
              </h3>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${isHi ? "font-hindi" : ""}`}>
                  {ascendant.rashiName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {ascendant.degrees.toFixed(2)}°
                </p>
                <p className={`text-xs text-muted-foreground mt-2 ${isHi ? "font-hindi" : ""}`}>
                  {isHi 
                    ? "लग्न सभी 12 भावों का आधार है और व्यक्तित्व को दर्शाता है।"
                    : "Ascendant is the foundation of all 12 houses and represents personality."}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Nakshatra Card */}
      {nakshatra && (
        <Card className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⭐</span>
            <div className="flex-1">
              <h3 className={`text-lg font-bold text-secondary mb-2 ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "नक्षत्र (Birth Star)" : "Nakshatra (Birth Star)"}
              </h3>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? nakshatra.name.hi : nakshatra.name.en}
                </p>
                <p className={`text-sm ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? `पाद ${nakshatra.pada}` : `Pada ${nakshatra.pada}`}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-background border">
                    {isHi ? "स्वामी" : "Lord"}: {nakshatra.lord}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-background border">
                    {isHi ? "प्रतीक" : "Symbol"}: {nakshatra.symbol}
                  </span>
                </div>
                <p className={`text-xs text-muted-foreground mt-2 ${isHi ? "font-hindi" : ""}`}>
                  {isHi 
                    ? "नक्षत्र विवाह मिलान, नामकरण और मुहूर्त के लिए आवश्यक है।"
                    : "Nakshatra is essential for compatibility, naming, and muhurat."}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
