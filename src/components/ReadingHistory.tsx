import type { SavedReading } from "@/services/readingService";

interface ReadingHistoryProps {
  readings: SavedReading[];
  lang: "en" | "hi";
  onView: (reading: SavedReading) => void;
}

export default function ReadingHistory({ readings, lang, onView }: ReadingHistoryProps) {
  const isHi = lang === "hi";

  return (
    <div className="mt-6 space-y-3">
      <h3 className={`text-lg font-heading font-bold text-center text-secondary ${isHi ? "font-hindi" : ""}`}>
        {isHi ? "पिछली रीडिंग" : "Past Readings"}
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        {readings.map((r) => (
          <button
            key={r.id}
            onClick={() => onView(r)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-xs"
          >
            <span className="font-mono">{r.transit_date}</span>
            <span className={`font-bold ${r.overall_score >= 4 ? "text-favorable" : r.overall_score >= 2 ? "text-mixed" : "text-unfavorable"}`}>
              {r.overall_score}/9
            </span>
            <span className="text-muted-foreground">
              {new Date(r.created_at).toLocaleTimeString(isHi ? "hi-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
