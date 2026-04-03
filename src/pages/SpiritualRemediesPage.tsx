// Weeks 40-42: Spiritual Remedies Hub - Mantra, Yantra, Rudraksha
import { useState } from "react";
import { Link } from "react-router-dom";
import EnhancedBirthInputForm from "@/components/EnhancedBirthInputForm";
import EnhancedLanguageToggle from "@/components/EnhancedLanguageToggle";
import { type SupportedLanguage } from "@/services/multiLanguageService";
import { getMantrasByPlanet, recommendMantras } from "@/services/mantraService";
import { recommendYantras, getYantrasByCategory } from "@/services/yantraService";
import { recommendRudraksha } from "@/services/rudrakshaService";
import { SEO } from "@/components/SEO";

const PLANETS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];

const SpiritualRemediesPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [activeTab, setActiveTab] = useState<"mantra"|"yantra"|"rudraksha">("mantra");
  const [selectedPlanet, setSelectedPlanet] = useState("Jupiter");
  const [ascendant, setAscendant] = useState(0);
  const isHi = lang === "hi";
  const hiLang = (isHi ? "hi" : "en") as "en"|"hi";

  const mantras = getMantrasByPlanet(selectedPlanet);
  const yantras = recommendYantras(ascendant, []);
  const rudraksha = recommendRudraksha(ascendant, []);

  return (
    <>
      <SEO title="Spiritual Remedies - Mantra, Yantra, Rudraksha" description="Complete Vedic remedies: 1000+ mantras, 30+ yantras, 21 mukhi rudraksha recommendations based on your birth chart." keywords="mantra, yantra, rudraksha, vedic remedies, spiritual remedies, japa" canonical="/spiritual-remedies" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl"></span>
              <div>
                <h1 className={`text-xl font-bold ${isHi?"font-hindi":""}`}>{isHi?"आधयतमक उपय":"Spiritual Remedies"}</h1>
                <p className="text-xs text-muted-foreground">{isHi?"मतर  यतर  रदरकष":"Mantra  Yantra  Rudraksha"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi?"हम":"Home"}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["mantra","yantra","rudraksha"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 text-xs rounded-md font-medium transition-colors ${activeTab===t?"bg-background shadow text-foreground":"text-muted-foreground"}`}>
                {t==="mantra"?(isHi?"मतर":"Mantra"):t==="yantra"?(isHi?"यतर":"Yantra"):(isHi?"रदरकष":"Rudraksha")}
              </button>
            ))}
          </div>

          {activeTab==="mantra" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {PLANETS.map(p => (
                  <button key={p} onClick={() => setSelectedPlanet(p)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedPlanet===p?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground"}`}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {mantras.slice(0,8).map((m: any) => (
                  <div key={m.id} className="bg-card border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-semibold text-sm">{isHi?m.nameHi:m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.type}  {m.planet}</div>
                      </div>
                      <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{m.repetitions}x</div>
                    </div>
                    <div className="text-sm font-mono bg-muted/50 rounded p-2 mb-2">{m.mantra}</div>
                    <p className="text-xs text-muted-foreground">{isHi?m.benefitsHi?.join(", "):m.benefits?.join(", ")}</p>
                    <div className="text-xs text-muted-foreground mt-1"> {m.bestTime}   {m.bestDay}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==="yantra" && (
            <div className="space-y-3">
              {yantras.slice(0,8).map((y: any) => (
                <div key={y.id} className="bg-card border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{y.symbol||""}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{isHi?y.nameHi:y.name}</div>
                      <div className="text-xs text-muted-foreground mb-1">{y.planet}  {y.category}</div>
                      <p className="text-xs text-muted-foreground">{isHi?y.purposeHi:y.purpose}</p>
                      <div className="text-xs mt-1">Material: {y.material}  Day: {y.installDay}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab==="rudraksha" && (
            <div className="space-y-3">
              {rudraksha.slice(0,8).map((r: any) => (
                <div key={r.mukhi} className="bg-card border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800">{r.mukhi}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{isHi?r.nameHi:r.name} ({r.mukhi} Mukhi)</div>
                      <div className="text-xs text-muted-foreground mb-1">{r.planet}  {r.deity}</div>
                      <p className="text-xs text-muted-foreground">{isHi?r.benefitsHi?.join(", "):r.benefits?.join(", ")}</p>
                      <div className="text-xs mt-1">Wear on: {r.wearDay}  Finger: {r.finger}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};
export default SpiritualRemediesPage;