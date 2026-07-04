/**
 * PrasnaMargaMeters
 * Displays the four classical Prasna indicators computed in prasnaMargaExtras:
 *   • Tarabala (Ch. 3-4)
 *   • Chandra Bala (Ch. 3)
 *   • Gulika Kala (Ch. 6)
 *   • Pranakshara Nakshatra full card (Ch. 24)
 *
 * Shown inside the results panel for enrolled jataks (birth Moon rashi known).
 * For anonymous querents only Gulika + Pranakshara are shown.
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Star, Moon, Clock, BookOpen } from "lucide-react";
import type {
  PrasnaTarabalaResult,
  ChandraBalaResult,
  GulikaKalaResult,
  PranaksharaNakshatraDetail,
} from "@/services/prasnaMargaExtras";

interface Props {
  tarabala: PrasnaTarabalaResult | null;
  chandraBala: ChandraBalaResult | null;
  gulikaKala: GulikaKalaResult;
  pranakshara: PranaksharaNakshatraDetail;
  isHi?: boolean;
}

const STRENGTH_COLOR: Record<string, string> = {
  Excellent:  "bg-emerald-100 text-emerald-800 border-emerald-300",
  Good:       "bg-teal-100 text-teal-800 border-teal-300",
  Neutral:    "bg-amber-100 text-amber-800 border-amber-300",
  Caution:    "bg-orange-100 text-orange-800 border-orange-300",
  Avoid:      "bg-rose-100 text-rose-800 border-rose-300",
  Strong:     "bg-emerald-100 text-emerald-800 border-emerald-300",
  Moderate:   "bg-amber-100 text-amber-800 border-amber-300",
  Weak:       "bg-rose-100 text-rose-800 border-rose-300",
};

const STRENGTH_BAR: Record<string, number> = {
  Excellent: 100, Good: 75, Neutral: 50, Caution: 35, Avoid: 15,
  Strong: 90, Moderate: 50, Weak: 20,
};

function StrengthBar({ level, color }: { level: string; color: string }) {
  const pct = STRENGTH_BAR[level] ?? 50;
  const barColor = color === "emerald" ? "bg-emerald-500" : color === "rose" ? "bg-rose-500" : color === "amber" ? "bg-amber-500" : color === "teal" ? "bg-teal-500" : color === "blue" ? "bg-blue-500" : "bg-amber-400";
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function PrasnaMargaMeters({ tarabala, chandraBala, gulikaKala, pranakshara, isHi = false }: Props) {
  const [showMantra, setShowMantra] = useState(false);
  const [open, setOpen] = useState(true);

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md">
      <CardHeader className="pb-2 cursor-pointer select-none" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-amber-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {isHi ? "प्रश्न मार्ग शास्त्रीय संकेत" : "Prasna Marga Classical Indicators"}
          </CardTitle>
          <span className="text-amber-600">{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
        </div>
        <p className="text-xs text-amber-700 mt-0.5">
          {isHi
            ? "Ch. 3-4 तारबल · Ch. 3 चंद्र बल · Ch. 6 गुलिक काल · Ch. 24 प्राणाक्षर नक्षत्र"
            : "Ch. 3-4 Tarabala · Ch. 3 Chandra Bala · Ch. 6 Gulika Kala · Ch. 24 Pranakshara Nakshatra"}
        </p>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 pt-0">

          {/* ── Row 1: Tarabala + Chandra Bala (enrolled jataks only) ── */}
          {(tarabala || chandraBala) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {tarabala && (
                <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                      {isHi ? "तारबल (अ. 3-4)" : "Tarabala (Ch. 3-4)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded border ${STRENGTH_COLOR[tarabala.strength]}`}>
                      {isHi ? tarabala.categoryHi : tarabala.category}
                    </span>
                    <Badge variant="outline" className="text-xs">{tarabala.strength}</Badge>
                  </div>
                  <StrengthBar level={tarabala.strength} color={tarabala.color} />
                  <p className="text-xs text-slate-600 mt-1.5 leading-snug">
                    {isHi ? tarabala.prasnaInterpretation.hi : tarabala.prasnaInterpretation.en}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isHi
                      ? `जन्म नक्षत्र: ${NAKSHATRA_HI[tarabala.birthNakshatraIndex] ?? tarabala.birthNakshatraName} → प्रश्न नक्षत्र: ${NAKSHATRA_HI[tarabala.questionNakshatraIndex] ?? tarabala.questionNakshatraName}`
                      : `Birth: ${tarabala.birthNakshatraName} → Question: ${tarabala.questionNakshatraName}`}
                  </p>
                </div>
              )}

              {chandraBala && (
                <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                      {isHi ? "चंद्र बल (अ. 3)" : "Chandra Bala (Ch. 3)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded border ${STRENGTH_COLOR[chandraBala.strength]}`}>
                      {isHi ? chandraBala.label.hi : chandraBala.label.en}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {isHi ? "भाव" : "House"} {chandraBala.houseFromNatal}
                    </Badge>
                  </div>
                  <StrengthBar level={chandraBala.strength} color={chandraBala.color} />
                  <p className="text-xs text-slate-600 mt-1.5 leading-snug">
                    {isHi ? chandraBala.description.hi : chandraBala.description.en}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Row 2: Gulika Kala + Pranakshara ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Gulika Kala */}
            <div className={`bg-white rounded-lg p-3 border shadow-sm ${gulikaKala.isQuestionInGulikaHora ? "border-rose-200" : "border-amber-100"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className={`w-3.5 h-3.5 ${gulikaKala.isQuestionInGulikaHora ? "text-rose-600" : "text-slate-500"}`} />
                <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                  {isHi ? "गुलिक काल (अ. 6)" : "Gulika Kala (Ch. 6)"}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={gulikaKala.isQuestionInGulikaHora ? "destructive" : "outline"}
                  className="text-xs"
                >
                  {gulikaKala.isQuestionInGulikaHora
                    ? (isHi ? "⚠ गुलिक होरा में" : "⚠ In Gulika Hora")
                    : (isHi ? "✓ गुलिक होरा से बाहर" : "✓ Outside Gulika Hora")}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                {isHi ? "गुलिक राशि:" : "Gulika Rashi:"}{" "}
                <span className="font-medium text-slate-700">
                  {isHi ? gulikaKala.gulikaRashiHi : gulikaKala.gulikaRashi}
                </span>
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                {isHi ? gulikaKala.warning.hi : gulikaKala.warning.en}
              </p>
            </div>

            {/* Pranakshara Nakshatra */}
            <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-amber-600 font-bold text-sm">{pranakshara.letter}</span>
                <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                  {isHi ? "प्राणाक्षर नक्षत्र (अ. 24)" : "Pranakshara Nakshatra (Ch. 24)"}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {isHi ? pranakshara.rashiNameHi : pranakshara.rashiName}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {isHi ? pranakshara.nakshatra.nameHi : pranakshara.nakshatra.nameEn}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-snug">
                {isHi
                  ? `स्वामी: ${pranakshara.nakshatra.lord} · देवता: ${pranakshara.nakshatra.deity} · प्रतीक: ${pranakshara.nakshatra.symbol}`
                  : `Lord: ${pranakshara.nakshatra.lord} · Deity: ${pranakshara.nakshatra.deity} · Symbol: ${pranakshara.nakshatra.symbol}`}
              </p>
              <button
                onClick={() => setShowMantra(m => !m)}
                className="mt-1.5 text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
              >
                {showMantra
                  ? (isHi ? "मंत्र छुपाएं" : "Hide mantra")
                  : (isHi ? "बीज मंत्र देखें (परिहार)" : "Show Beeja Mantra (Parihara)")}
              </button>
              {showMantra && (
                <div className="mt-2 bg-amber-50 rounded p-2 border border-amber-200">
                  <p className="text-xs font-devanagari text-amber-900 font-medium leading-relaxed">
                    {pranakshara.beejaMantra}
                  </p>
                  <p className="text-xs text-slate-500 italic mt-0.5">
                    {pranakshara.beejaMantraTranslit}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHi ? "108 बार जप करें।" : "Japa 108 times."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Ch. 24 full note ── */}
          <div className="bg-amber-50 rounded p-2.5 border border-amber-100">
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">
                {isHi ? "संदर्भ: " : "Reference: "}
              </span>
              {isHi
                ? "अक्षर → राशि → नक्षत्र → स्वामी. नीचे बीज मंत्र देखें।"
                : "Letter → sign → nakshatra → lord. See the beeja mantra below."}
            </p>
          </div>

        </CardContent>
      )}
    </Card>
  );
}

const NAKSHATRA_HI = [
  'अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु',
  'पुष्य','आश्लेषा','मघा','पूर्व फाल्गुनी','उत्तर फाल्गुनी','हस्त',
  'चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्व आषाढ़',
  'उत्तर आषाढ़','श्रवण','धनिष्ठा','शतभिषा','पूर्व भाद्रपद','उत्तर भाद्रपद','रेवती',
];
