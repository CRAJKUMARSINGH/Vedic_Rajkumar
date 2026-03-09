import { useState } from "react";
import { TestRunner } from "@/components/TestRunner";
import LanguageToggle from "@/components/LanguageToggle";
import { Link } from "react-router-dom";

const TestPage = () => {
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
                  {isHi ? "ज्योतिष परीक्षण" : "Astrology Testing"}
                </h1>
                <p className={`text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? "सभी रिपोर्टों का व्यापक परीक्षण" : "Comprehensive Testing of All Reports"}
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
        <TestRunner />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className={`text-sm text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                {isHi 
                  ? "यह परीक्षण सूट सभी ज्योतिष रिपोर्टों की सटीकता और कार्यक्षमता का मूल्यांकन करता है"
                  : "This test suite evaluates accuracy and functionality of all astrology reports"}
              </p>
              <p className={`text-xs text-muted-foreground mt-1 ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "विकास और गुणवत्ता आश्वासन के लिए • MoonAstro प्रेरित" : 
                   "For development and quality assurance • Inspired by MoonAstro"}
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
                to="/comprehensive" 
                className={`text-sm text-primary hover:text-primary/80 underline underline-offset-2 ${isHi ? "font-hindi" : ""}`}
              >
                {isHi ? "व्यापक रिपोर्ट" : "Comprehensive Report"}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TestPage;
