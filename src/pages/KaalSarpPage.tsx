import { useState } from "react";
import { KaalSarpForm } from "@/components/KaalSarpForm";
import EnhancedLanguageToggle from "@/components/EnhancedLanguageToggle";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

const KaalSarpPage = () => {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const isHi = lang === "hi";

  return (
    <>
      <SEO
        title="Kaal Sarp Yoga Analysis"
        description="Check if you have Kaal Sarp Yoga in your birth chart. Get detailed analysis of all 12 types with remedies and predictions."
        keywords="kaal sarp yoga, kaal sarp dosha, kundli analysis, vedic astrology, rahu ketu"
        canonical="/kaalsarp"
      />
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-3xl">🕉️</span>
              <div>
                <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? "काल सर्प योग" : "Kaal Sarp Yoga"}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? "वैदिक ज्योतिष आधारित काल सर्प योग विश्लेषण" : "Vedic Astrology Based Kaal Sarp Yoga Analysis"}
                </p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <KaalSarpForm isHindi={isHi} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className={`text-sm text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                {isHi 
                  ? "यह काल सर्प योग रिपोर्ट वैदिक ज्योतिष सिद्धांतों के आधार पर जेनरेट की गई है"
                  : "This Kaal Sarp Yoga report is generated based on Vedic astrology principles"}
              </p>
              <p className={`text-xs text-muted-foreground mt-1 ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "केवल सूचनात्मक उद्देश्यों के लिए • MoonAstro प्रेरित" : 
                   "For informational purposes only • Inspired by MoonAstro"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className={`text-sm text-primary hover:text-primary/80 underline underline-offset-2 ${isHi ? "font-hindi" : ""}`}
              >
                {isHi ? "गोचर फल" : "Gochar Phal"}
              </Link>
              <Link 
                to="/career" 
                className={`text-sm text-primary hover:text-primary/80 underline underline-offset-2 ${isHi ? "font-hindi" : ""}`}
              >
                {isHi ? "करियर रिपोर्ट" : "Career Report"}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default KaalSarpPage;
