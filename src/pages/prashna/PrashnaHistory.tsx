import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, History as HistoryIcon } from "lucide-react";

export default function PrashnaHistory() {
  const navigate = useNavigate();
  
  // Mock history for now
  const history = [
    {
      id: 1,
      question: "Will my business expansion be successful?",
      questionTime: new Date().toISOString(),
      prashnaLagna: "Leo",
      confidencePercent: 85,
      briefSummaryEn: "Favorable indicators from the 10th lord.",
      briefSummaryHi: "दशमेश से अनुकूल संकेत।"
    },
    {
      id: 2,
      question: "Is it the right time for a property purchase?",
      questionTime: new Date(Date.now() - 86400000).toISOString(),
      prashnaLagna: "Taurus",
      confidencePercent: 72,
      briefSummaryEn: "Wait for a few weeks until transits shift.",
      briefSummaryHi: "गोचर परिवर्तन तक कुछ हफ़्तों का इंतज़ार करें।"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/prashna-ai")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to AI Engine
          </Button>
          <HistoryIcon className="w-6 h-6 text-primary/60" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground">Chronicles</h1>
          <p className="text-muted-foreground">A record of past Prashna consultations.</p>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border/40 rounded-xl bg-card/10">
              <p className="text-muted-foreground">No past sessions found.</p>
            </div>
          ) : (
            history.map((session) => (
              <Card key={session.id} className="bg-card/40 border-border/50 hover:border-primary/30 transition-all duration-300">
                <CardHeader className="pb-3 border-b border-border/20">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-heading leading-snug text-foreground/90">{session.question}</CardTitle>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {format(new Date(session.questionTime), "PPP 'at' p")}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-bold uppercase tracking-tighter">
                        Lagna: {session.prashnaLagna}
                      </Badge>
                      <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 font-bold">
                        {session.confidencePercent}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid md:grid-cols-2 gap-8">
                    {session.briefSummaryEn && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-70">Summary</div>
                        <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed font-sans">{session.briefSummaryEn}</p>
                      </div>
                    )}
                    {session.briefSummaryHi && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest opacity-70">सार</div>
                        <p className="text-base text-foreground/80 font-hindi line-clamp-3 leading-relaxed">{session.briefSummaryHi}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
