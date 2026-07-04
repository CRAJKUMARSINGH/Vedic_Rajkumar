/**
 * DashaTransitPanel — Dasha result vis-à-vis Transit Analysis
 *
 * Combines:
 *   1. Current Mahadasha / Antardasha / Pratyanardasha (from dashaService)
 *   2. Today's live planetary transits from Moon sign (from transitData)
 *   3. Dasha-Gochar correlation (B.V. Raman principle)
 *
 * Drop-in replacement for the "dasha" tab in Index.tsx and DashaPage.tsx.
 * Props: birthDate (YYYY-MM-DD), birthTime (HH:MM), lang, moonRashiIndex,
 *        transitResults, accurateMoonLongitude?
 */

import { useMemo, Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateVimshottariDasha, getPlanetSymbol, formatDashaDate } from "@/services/dashaService";
import type { SupportedLanguage } from "@/services/multiLanguageService";
import type { TransitResult } from "@/data/transitData";

const DashaCard    = lazy(() => import("@/components/DashaCard"));
const DashaGochaCard = lazy(() => import("@/components/DashaGochaCard"));
const TransitTable = lazy(() => import("@/components/TransitTable"));
const VisualTransitChart = lazy(() => import("@/components/VisualTransitChart"));

const Loader = () => (
  <div className="flex items-center justify-center p-6">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
  </div>
);

const PLANET_HI: Record<string, string> = {
  Sun:"सूर्य", Moon:"चंद्र", Mars:"मंगल", Mercury:"बुध",
  Jupiter:"गुरु", Venus:"शुक्र", Saturn:"शनि", Rahu:"राहु", Ketu:"केतु",
};

interface Props {
  birthDate: string;
  birthTime: string;
  lang: SupportedLanguage;
  moonRashiIndex: number;
  transitResults: TransitResult[];
  transitDate?: string;
  rawBirthData?: { date: string; time: string; location: string; name?: string } | null;
  accurateMoonLongitude?: number;
}

export default function DashaTransitPanel({
  birthDate,
  birthTime,
  lang,
  moonRashiIndex,
  transitResults,
  transitDate,
  rawBirthData,
  accurateMoonLongitude,
}: Props) {
  const isHi = lang === "hi";
  const hiLang = isHi ? "hi" : "en" as "en" | "hi";

  // Derive current dasha lords for DashaGochaCard
  const dashaInfo = useMemo(() => {
    try {
      const r = calculateVimshottariDasha(birthDate, birthTime, moonRashiIndex, accurateMoonLongitude);
      return r;
    } catch { return null; }
  }, [birthDate, birthTime, moonRashiIndex, accurateMoonLongitude]);

  const currentMaha  = dashaInfo?.currentMahadasha ?? null;
  const currentAntar = dashaInfo?.currentAntardasha ?? null;

  // Build transitHouses map for DashaGochaCard
  const transitHouses = useMemo(() => {
    const map: Record<string, number> = {};
    transitResults.forEach(r => {
      map[r.planet?.en ?? r.planet] = r.houseFromMoon ?? 0;
    });
    return map;
  }, [transitResults]);

  return (
    <div className="space-y-6">

      {/* ── Current Dasha Banner ──────────────────────────────────────────── */}
      {dashaInfo && currentMaha && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className={`flex items-center gap-2 text-primary text-base ${isHi ? "font-hindi" : ""}`}>
              <span className="text-2xl">🪐</span>
              {isHi ? "वर्तमान दशा काल" : "Current Dasha Period"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="text-center bg-background rounded-lg px-4 py-2 border border-border">
                <p className={`text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                  {isHi ? "महादशा" : "Mahadasha"}
                </p>
                <p className="text-lg font-bold">
                  {getPlanetSymbol(currentMaha.planet)}{" "}
                  {isHi ? (PLANET_HI[currentMaha.planet] ?? currentMaha.planet) : currentMaha.planet}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDashaDate(currentMaha.startDate)} – {formatDashaDate(currentMaha.endDate)}
                </p>
              </div>

              {currentAntar && (
                <div className="text-center bg-background rounded-lg px-4 py-2 border border-border">
                  <p className={`text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? "अंतर्दशा" : "Antardasha"}
                  </p>
                  <p className="text-lg font-bold">
                    {getPlanetSymbol(currentAntar.planet)}{" "}
                    {isHi ? (PLANET_HI[currentAntar.planet] ?? currentAntar.planet) : currentAntar.planet}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDashaDate(currentAntar.startDate)} – {formatDashaDate(currentAntar.endDate)}
                  </p>
                </div>
              )}

              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs self-start mt-1">
                {isHi ? "जन्म नक्षत्र" : "Birth Nakshatra"}:{" "}
                {dashaInfo.moonNakshatraName}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Dasha-Gochar Correlation (Raman Principle) ───────────────────── */}
      {currentMaha && currentAntar && (
        <Suspense fallback={<Loader />}>
          <DashaGochaCard
            dashaLord={currentMaha.planet}
            antarLord={currentAntar.planet}
            transitHouses={transitHouses}
            lang={hiLang}
          />
        </Suspense>
      )}

      {/* ── Visual Transit Wheel ─────────────────────────────────────────── */}
      <Suspense fallback={<Loader />}>
        <VisualTransitChart
          results={transitResults}
          moonRashiIndex={moonRashiIndex}
          lang={hiLang}
        />
      </Suspense>

      {/* ── Transit Table with planet-wise effects ───────────────────────── */}
      <Suspense fallback={<Loader />}>
        <TransitTable
          results={transitResults}
          lang={hiLang}
          moonRashiIndex={moonRashiIndex}
          birthData={rawBirthData ?? null}
          transitDate={transitDate ?? new Date().toISOString().split("T")[0]}
        />
      </Suspense>

      {/* ── Full Dasha Timeline ──────────────────────────────────────────── */}
      <Suspense fallback={<Loader />}>
        <DashaCard
          birthDate={birthDate}
          birthTime={birthTime}
          lang={hiLang}
          accurateMoonLongitude={accurateMoonLongitude}
        />
      </Suspense>
    </div>
  );
}
