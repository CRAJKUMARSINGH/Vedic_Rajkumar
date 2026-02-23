import { TransitResult, RASHIS } from "@/data/transitData";

interface TransitTableProps {
  results: TransitResult[];
  lang: "en" | "hi";
  moonRashiIndex: number;
}

const headers = {
  en: {
    planet: "Planet",
    sign: "Current Sign",
    house: "House",
    base: "Base",
    vedha: "Vedha?",
    effective: "Effective",
    score: "+/-",
    rating: "Rating",
    effect: "Key Effect",
  },
  hi: {
    planet: "ग्रह",
    sign: "वर्तमान राशि",
    house: "भाव",
    base: "मूल",
    vedha: "वेध?",
    effective: "प्रभावी",
    score: "+/-",
    rating: "अंक",
    effect: "मुख्य प्रभाव",
  },
};

const statusLabels = {
  en: { favorable: "Favorable", unfavorable: "Unfavorable", mixed: "Vedha Block" },
  hi: { favorable: "शुभ", unfavorable: "अशुभ", mixed: "वेध अवरोध" },
};

export default function TransitTable({ results, lang, moonRashiIndex }: TransitTableProps) {
  const t = headers[lang];
  const sl = statusLabels[lang];
  const isHi = lang === "hi";
  const totalScore = results.reduce((s, r) => s + r.scoreContribution, 0);
  const moonRashi = RASHIS[moonRashiIndex];

  return (
    <div className="w-full space-y-3">
      {/* Moon Rashi badge */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-semibold">
          {isHi ? (
            <span className="font-hindi">चन्द्र राशि: {moonRashi.hi} {moonRashi.symbol}</span>
          ) : (
            <span>Moon Sign: {moonRashi.en} {moonRashi.symbol}</span>
          )}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary text-secondary-foreground">
              {[t.planet, t.sign, t.house, t.base, t.vedha, t.effective, t.score, t.rating, t.effect].map((h) => (
                <th key={h} className={`px-2 py-2.5 text-left font-semibold whitespace-nowrap ${isHi ? "font-hindi" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={r.planet.en} className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/30"}`}>
                <td className="px-2 py-2 font-semibold whitespace-nowrap">
                  <span className="mr-1">{r.planet.symbol}</span>
                  {isHi ? <span className="font-hindi">{r.planet.hi}</span> : r.planet.en}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {RASHIS[r.currentRashi].symbol}{" "}
                  {isHi ? <span className="font-hindi">{RASHIS[r.currentRashi].hi}</span> : RASHIS[r.currentRashi].en}
                </td>
                <td className="px-2 py-2 text-center font-mono font-bold">{r.houseFromMoon}</td>
                <td className="px-2 py-2">
                  <StatusBadge status={r.baseFavorable ? "favorable" : "unfavorable"} label={r.baseFavorable ? sl.favorable : sl.unfavorable} isHi={isHi} />
                </td>
                <td className={`px-2 py-2 text-xs ${isHi ? "font-hindi" : ""}`}>
                  {r.vedhaActive ? (
                    <span className="text-unfavorable font-semibold">{isHi ? "हाँ" : "Yes"}</span>
                  ) : (
                    <span className="text-muted-foreground">{isHi ? "नहीं" : "No"}</span>
                  )}
                </td>
                <td className="px-2 py-2">
                  <StatusBadge status={r.effectiveStatus} label={sl[r.effectiveStatus]} isHi={isHi} />
                </td>
                <td className="px-2 py-2 text-center font-mono font-bold">
                  {r.scoreContribution > 0 ? (
                    <span className="text-favorable">+1</span>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </td>
                <td className="px-2 py-2 text-center font-mono">{r.rating}/9</td>
                <td className={`px-2 py-2 text-xs max-w-[180px] ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? r.effectHi : r.effectEn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Score summary */}
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="flex items-center gap-3">
          <span className={`text-lg font-heading font-bold ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "समग्र स्कोर:" : "Overall Score:"}
          </span>
          <span className={`text-3xl font-heading font-bold ${totalScore >= 5 ? "text-favorable" : totalScore >= 3 ? "text-mixed" : "text-unfavorable"}`}>
            {totalScore}/9
          </span>
        </div>
        <p className={`text-sm text-muted-foreground text-center max-w-md ${isHi ? "font-hindi" : ""}`}>
          {isHi
            ? `${totalScore} ग्रह शुभ स्थिति में (बिना वेध)। ${totalScore <= 2 ? "सावधानी बरतें, आध्यात्मिक कार्य उपयुक्त।" : totalScore <= 5 ? "मिश्रित दिन, संतुलन बनाएं।" : "अनुकूल दिन, कार्य आगे बढ़ाएं।"}`
            : `${totalScore} planet(s) effectively favorable (without Vedha). ${totalScore <= 2 ? "Exercise caution; spiritual activities recommended." : totalScore <= 5 ? "Mixed day; maintain balance." : "Favorable day; proceed with plans."}`}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status, label, isHi }: { status: string; label: string; isHi: boolean }) {
  const colorClass =
    status === "favorable"
      ? "bg-favorable/15 text-favorable border-favorable/30"
      : status === "mixed"
      ? "bg-mixed/15 text-mixed border-mixed/30"
      : "bg-unfavorable/15 text-unfavorable border-unfavorable/30";
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold border ${colorClass} ${isHi ? "font-hindi" : ""}`}>
      {label}
    </span>
  );
}
