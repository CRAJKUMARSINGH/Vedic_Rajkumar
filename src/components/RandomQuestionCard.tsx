import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getRandomQuestion, getRandomQuestionExcluding, type AstrologyQuestion } from "@/data/astrologyQuestions";

interface RandomQuestionCardProps {
  lang: "en" | "hi";
}

const categoryColors: Record<string, string> = {
  Planets:           "bg-amber-100 text-amber-800 border-amber-200",
  Doshas:            "bg-red-100 text-red-800 border-red-200",
  Houses:            "bg-blue-100 text-blue-800 border-blue-200",
  Transits:          "bg-violet-100 text-violet-800 border-violet-200",
  Yogas:             "bg-emerald-100 text-emerald-800 border-emerald-200",
  Nakshatras:        "bg-sky-100 text-sky-800 border-sky-200",
  Remedies:          "bg-rose-100 text-rose-800 border-rose-200",
  Signs:             "bg-orange-100 text-orange-800 border-orange-200",
  Dasha:             "bg-purple-100 text-purple-800 border-purple-200",
  "Divisional Charts": "bg-teal-100 text-teal-800 border-teal-200",
};

export default function RandomQuestionCard({ lang }: RandomQuestionCardProps) {
  const isHi = lang === "hi";
  const [question, setQuestion] = useState<AstrologyQuestion>(getRandomQuestion);
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const { toast } = useToast();

  const handleNext = useCallback(async () => {
    setShuffling(true);
    setRevealed(false);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 180));
    setQuestion((prev) => getRandomQuestionExcluding(prev.id));
    setShuffling(false);
  }, []);

  const handleSaveQuestion = useCallback(() => {
    if (saved) return;
    setSaved(true);
    const key = "vedic_saved_questions";
    try {
      const stored = JSON.parse(localStorage.getItem(key) ?? "[]") as AstrologyQuestion[];
      if (!stored.find((q) => q.id === question.id)) {
        stored.unshift(question);
        localStorage.setItem(key, JSON.stringify(stored.slice(0, 50)));
      }
    } catch {}
    toast({
      title: isHi ? "✓ प्रश्न सहेजा गया" : "✓ Question bookmarked",
      description: isHi ? "आपकी स्थानीय ब्राउज़र मेमोरी में सहेजा गया" : "Saved to your local browser storage",
    });
  }, [saved, question, isHi, toast]);

  const badgeClass = categoryColors[question.category] ?? "bg-muted text-muted-foreground";

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!shuffling && (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className={`text-xs font-medium text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? "ज्योतिष प्रश्नोत्तर" : "Astrology Q&A"}
                </span>
              </div>
              <Badge variant="outline" className={`text-xs border ${badgeClass}`}>
                {question.emoji} {question.category}
              </Badge>
            </div>

            {/* Question */}
            <div className="px-5 pt-4 pb-3">
              <p className={`text-base font-semibold leading-snug text-foreground ${isHi ? "font-hindi" : ""}`}>
                {isHi ? question.question_hi : question.question}
              </p>
            </div>

            {/* Reveal answer */}
            <div className="px-5 pb-4">
              <button
                onClick={() => setRevealed((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                {revealed
                  ? <><ChevronUp className="h-4 w-4" />{isHi ? "उत्तर छुपाएं" : "Hide Answer"}</>
                  : <><ChevronDown className="h-4 w-4" />{isHi ? "उत्तर देखें" : "Reveal Answer"}</>
                }
              </button>

              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                      <p className={`text-sm text-foreground/85 leading-relaxed ${isHi ? "font-hindi" : ""}`}>
                        {isHi ? question.answer_hi : question.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-border bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span className={`text-xs ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? "अगला प्रश्न" : "Next Question"}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveQuestion}
                disabled={saved}
                className={`gap-1.5 ${saved ? "text-amber-600" : "text-muted-foreground hover:text-amber-600"}`}
              >
                {saved
                  ? <><BookmarkCheck className="h-3.5 w-3.5" /><span className={`text-xs ${isHi ? "font-hindi" : ""}`}>{isHi ? "सहेजा" : "Bookmarked"}</span></>
                  : <><Bookmark className="h-3.5 w-3.5" /><span className={`text-xs ${isHi ? "font-hindi" : ""}`}>{isHi ? "सहेजें" : "Bookmark"}</span></>
                }
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {shuffling && (
        <div className="h-32 rounded-xl border border-border bg-card flex items-center justify-center">
          <Shuffle className="h-5 w-5 text-muted-foreground animate-spin" />
        </div>
      )}
    </div>
  );
}
