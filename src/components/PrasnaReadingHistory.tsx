/**
 * PrasnaReadingHistory
 * Collapsible panel showing the last 15 saved Prasna readings from localStorage.
 * Each reading shows: timestamp, question snippet, jatak, direction,
 * Tarabala category, Chandra Bala, Gulika flag, and verdict score.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Trash2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReadingHistory, clearReadingHistory, type PrasnaReading } from "@/services/prasnaMargaExtras";

interface Props {
  isHi?: boolean;
  onReload?: () => void;
}

const OUTCOME_STYLE: Record<string, string> = {
  favorable:   "bg-emerald-100 text-emerald-800 border-emerald-300",
  unfavorable: "bg-rose-100 text-rose-800 border-rose-300",
  neutral:     "bg-amber-100 text-amber-800 border-amber-300",
};

const OUTCOME_LABEL: Record<string, { en: string; hi: string }> = {
  favorable:   { en: "Favorable", hi: "शुभ" },
  unfavorable: { en: "Unfavorable", hi: "अशुभ" },
  neutral:     { en: "Neutral", hi: "सामान्य" },
};

function formatRelativeTime(ts: string, isHi: boolean): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (isHi) {
    if (mins < 1)   return "अभी";
    if (mins < 60)  return `${mins} मिनट पहले`;
    if (hours < 24) return `${hours} घंटे पहले`;
    return `${days} दिन पहले`;
  }
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function PrasnaReadingHistory({ isHi = false, onReload }: Props) {
  const [open, setOpen] = useState(false);
  const [readings, setReadings] = useState<PrasnaReading[]>(() => getReadingHistory());

  const handleClear = () => {
    clearReadingHistory();
    setReadings([]);
    onReload?.();
  };

  const refresh = () => setReadings(getReadingHistory());

  if (readings.length === 0 && !open) return null;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader
        className="pb-2 cursor-pointer select-none"
        onClick={() => { setOpen(o => !o); if (!open) refresh(); }}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            {isHi
              ? `हाल की प्रश्न रीडिंग (${readings.length})`
              : `Recent Prashna Readings (${readings.length})`}
          </CardTitle>
          <span className="text-slate-400">{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-2">
          {readings.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">
              {isHi ? "कोई रीडिंग सहेजी नहीं।" : "No readings saved yet."}
            </p>
          ) : (
            <>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {readings.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col gap-1 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm text-slate-800 font-medium leading-snug flex-1 min-w-0 truncate">
                        {r.question.length > 70 ? r.question.slice(0, 70) + "…" : r.question}
                      </p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border whitespace-nowrap ${OUTCOME_STYLE[r.outcome]}`}>
                        {isHi ? OUTCOME_LABEL[r.outcome]?.hi : OUTCOME_LABEL[r.outcome]?.en} · {r.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {r.jatakName && (
                        <Badge variant="secondary" className="text-xs">{r.jatakName}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{r.direction}</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-2.5 h-2.5 mr-0.5" />
                        {r.tarabalaCat}
                      </Badge>
                      {r.gulikaInHora && (
                        <Badge variant="destructive" className="text-xs">
                          {isHi ? "गुलिक होरा" : "Gulika hora"}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">
                        {formatRelativeTime(r.timestamp, isHi)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {isHi
                        ? `प्राणाक्षर: ${r.pranaksharaLetter} → ${r.pranaksharaNakshatra} · चंद्र बल: ${r.chandraBalaStrength}`
                        : `Pranakshara: ${r.pranaksharaLetter} → ${r.pranaksharaNakshatra} · Chandra Bala: ${r.chandraBalaStrength}`}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-1">
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-rose-500 hover:text-rose-700 text-xs">
                  <Trash2 className="w-3 h-3 mr-1" />
                  {isHi ? "सभी हटाएं" : "Clear all"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
