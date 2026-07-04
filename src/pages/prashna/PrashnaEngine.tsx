import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { askPrashna } from "@/services/jyotishApiService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  History,
  Sparkles,
  Compass,
  Languages,
  Info,
  Book,
} from "lucide-react";

export default function PrashnaEngine() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [direction, setDirection] = useState("");
  const [language, setLanguage] = useState("both");
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: askPrashna,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['prashna_history'] });
      toast.success("Prashna cast successfully");
    },
    onError: () => {
      toast.error("Failed to cast Prashna. Please try again.");
    }
  });

  const isMutationPending = mutation.status === 'pending';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    mutation.mutate({
      question: question.trim(),
      direction: direction === "none" ? undefined : direction,
      questionTime: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-auspicious-pattern p-6 font-body">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/prashna")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Basic Prashna
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/prashna-history")}>
            <History className="w-4 h-4 mr-2" /> View History
          </Button>
        </div>

        <div className="space-y-2 text-center sm:text-left">
          <h1 className="font-heading text-4xl font-bold text-[#E65100] flex flex-col sm:flex-row items-center gap-3 drop-shadow-sm">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" /> Prashna AI Engine
          </h1>
          <p className="text-[#8B4513] text-lg font-medium">Capture the exact moment to reveal astrological truths.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="auspicious-card shadow-2xl">
              <div className="auspicious-header">
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  <span className="font-bold tracking-wide">Ask the Heavens</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs text-[#3E2723]/70 mb-6 font-medium italic">Focus your mind on a single, clear question.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="question" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Question</Label>
                    <Textarea
                      id="question"
                      placeholder="e.g. Will my upcoming journey be successful?"
                      className="min-h-[140px] resize-none bg-background/50 border-primary/20 focus-visible:ring-primary/30 text-lg leading-relaxed"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="direction" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Compass className="w-3 h-3" /> Direction Facing
                      </Label>
                      <Select value={direction} onValueChange={setDirection}>
                        <SelectTrigger className="bg-background/50 border-primary/20">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not Sure</SelectItem>
                          <SelectItem value="North">North</SelectItem>
                          <SelectItem value="NE">North-East</SelectItem>
                          <SelectItem value="East">East</SelectItem>
                          <SelectItem value="SE">South-East</SelectItem>
                          <SelectItem value="South">South</SelectItem>
                          <SelectItem value="SW">South-West</SelectItem>
                          <SelectItem value="West">West</SelectItem>
                          <SelectItem value="NW">North-West</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Languages className="w-3 h-3" /> Language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-background/50 border-primary/20">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Bilingual</SelectItem>
                          <SelectItem value="en">English Only</SelectItem>
                          <SelectItem value="hi">Hindi Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#E65100] text-white hover:bg-[#D84315] shadow-lg border-b-4 border-[#8B4513] active:border-b-0 active:translate-y-1 transition-all py-6 text-lg font-bold"
                    disabled={isMutationPending || !question.trim()}
                  >
                    {isMutationPending ? "Consulting the Stars..." : "Cast Prashna"}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {isMutationPending ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6 text-primary">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 border-4 border-primary/10 rounded-full animate-spin-slow" />
                  <div className="absolute inset-2 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center font-hindi text-4xl">OM</div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-heading text-2xl font-medium animate-pulse">Calculating Prashna Lagna</h3>
                  <p className="text-sm text-muted-foreground">Aligning planetary positions with the current moment...</p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card/80 border border-primary/20 p-6 rounded-xl shadow-inner">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Prashna Lagna</div>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-heading text-primary font-bold">{result.prashnaLagna}</span>
                      {result.prashnaLagnaHindi && (
                        <span className="text-2xl font-hindi text-amber-600">{result.prashnaLagnaHindi}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{result.category}</Badge>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">{result.confidencePercent}% Confidence</Badge>
                  </div>
                </div>

                {/* English Section */}
                {(language === "both" || language === "en") && (
                  <Card className="border-border/60 bg-card/40 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/20">
                      <CardTitle className="font-heading text-sm flex items-center gap-2 font-bold uppercase tracking-widest text-primary/80">
                        <Info className="w-4 h-4" />
                        English Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Astrological Logic</h4>
                        <p className="text-sm leading-relaxed text-foreground/80">{result.coreMethodEn}</p>
                      </div>
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Predictive Answer</h4>
                        <p className="text-lg font-medium leading-relaxed text-foreground">{result.answerEn}</p>
                      </div>
                      {result.remediesEn && (
                        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/50">
                          <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">Parihara (Remedies)</h4>
                          <p className="text-sm leading-relaxed text-amber-900/80">{result.remediesEn}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Hindi Section */}
                {(language === "both" || language === "hi") && (
                  <Card className="border-border/60 bg-card/40 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/20">
                      <CardTitle className="font-hindi text-lg flex items-center gap-2 text-amber-700/80">
                        <Languages className="w-5 h-5" />
                        Hindi Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 font-hindi">Logic</h4>
                        <p className="text-base leading-relaxed font-hindi text-foreground/80">{result.coreMethodHi}</p>
                      </div>
                      <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/50">
                        <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2 font-hindi">Answer</h4>
                        <p className="text-xl font-hindi leading-relaxed text-foreground font-bold">{result.answerHi}</p>
                      </div>
                      {result.remediesHi && (
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                          <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 font-hindi">Remedies</h4>
                          <p className="text-base leading-relaxed font-hindi text-foreground/80">{result.remediesHi}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {result.classicalSource && (
                  <div className="text-xs text-muted-foreground italic border-l-4 border-primary/20 pl-4 py-2 bg-muted/20 rounded-r-md font-medium">
                    Source: {result.classicalSource}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-2xl bg-card/10 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Awaiting Your Inquiry</h3>
                <p className="text-muted-foreground max-w-sm leading-relaxed">
                  Submit a question to generate a detailed horary analysis based on classical Vedic principles and AI-powered reasoning.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
