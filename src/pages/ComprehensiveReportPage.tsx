import { useState } from "react";
import { ComprehensiveReportForm } from "@/components/ComprehensiveReportForm";
import LanguageToggle from "@/components/LanguageToggle";
import { Link } from "react-router-dom";

const ComprehensiveReportPage = () => {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const isHi = lang === "hi";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-3xl">🕉️</span>
              <div>
                <h1 className={`text-xl font-heading font-bold text-secondary ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? "व्यापक ज्योतिष रिपोर्ट" : "Comprehensive Astrology Report"}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? "सभी प्रमुख ज्योतिष विश्लेषण एक ही स्थान पर" : "All Major Astrology Analyses in One Place"}
                </p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <ComprehensiveReportForm isHindi={isHi} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className={`text-sm text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                {isHi 
                  ? "यह व्यापक ज्योतिष रिपोर्ट वैदिक ज्योतिष सिद्धांतों के आधार पर जेनरेट की गई है"
                  : "This comprehensive astrology report is generated based on Vedic astrology principles"}
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
              <Link 
                to="/kaalsarp" 
                className={`text-sm text-primary hover:text-primary/80 underline underline-offset-2 ${isHi ? "font-hindi" : ""}`}
              >
                {isHi ? "काल सर्प योग" : "Kaal Sarp Yoga"}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComprehensiveReportPage;
