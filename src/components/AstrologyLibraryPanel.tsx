import { useMemo, useState } from "react";
import { BookOpen, Search, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ASTROLOGY_LIBRARY, searchAstrologyLibrary } from "@/data/astrologyLibrary";

type Props = { isHi?: boolean };

export default function AstrologyLibraryPanel({ isHi = false }: Props) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchAstrologyLibrary(query), [query]);

  return (
    <Card className="border-amber-200 shadow-lg mb-6">
      <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
        <CardTitle className={`text-amber-900 ${isHi ? "font-hindi" : ""}`}>
          <BookOpen className="inline w-5 h-5 mr-2" />
          {isHi ? "ज्योतिष पुस्तकालय" : "Astrology Library"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isHi ? "पुस्तक, योग, उपाय खोजें..." : "Search books, yogas, remedies..."}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["Prasna", "Remedies", "Dasha", "Horoscope", "KP", "Lal Kitab"].map((tag) => (
            <Badge key={tag} variant="secondary" className="cursor-default">
              <Sparkles className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        <ScrollArea className="h-[320px] pr-3">
          <div className="space-y-3">
            {(results.length ? results : ASTROLOGY_LIBRARY).map((entry) => (
              <div key={entry.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={`font-semibold ${isHi ? "font-hindi" : ""}`}>{isHi ? entry.titleHi : entry.title}</h3>
                    <p className="text-xs text-muted-foreground">{entry.source}</p>
                  </div>
                  <Badge variant="outline">{entry.type}</Badge>
                </div>
                <p className={`text-sm mt-2 ${isHi ? "font-hindi" : ""}`}>{isHi ? entry.summaryHi : entry.summary}</p>
                <p className={`text-xs text-muted-foreground mt-2 ${isHi ? "font-hindi" : ""}`}>{isHi ? entry.useCaseHi : entry.useCase}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}