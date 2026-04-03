/**
 * Ashtakavarga Card Component
 * Displays BAV/SAV tables with transit strength indicators
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  calculateAshtakavarga,
  type SarvashtakavargaResult,
  type AshtakavargaTable,
} from '@/services/ashtakavargaService';
import type { SupportedLanguage } from '@/services/multiLanguageService';

const RASHI_NAMES = [
  { en: 'Ari', hi: 'मेष' }, { en: 'Tau', hi: 'वृष' }, { en: 'Gem', hi: 'मिथुन' },
  { en: 'Can', hi: 'कर्क' }, { en: 'Leo', hi: 'सिंह' }, { en: 'Vir', hi: 'कन्या' },
  { en: 'Lib', hi: 'तुला' }, { en: 'Sco', hi: 'वृश्चिक' }, { en: 'Sag', hi: 'धनु' },
  { en: 'Cap', hi: 'मकर' }, { en: 'Aqu', hi: 'कुंभ' }, { en: 'Pis', hi: 'मीन' },
];

const STRENGTH_COLOR = (pts: number) => {
  if (pts >= 6) return 'bg-green-600 text-white';
  if (pts >= 4) return 'bg-yellow-500 text-white';
  if (pts >= 2) return 'bg-orange-500 text-white';
  return 'bg-red-600 text-white';
};

const SAV_COLOR = (pts: number) => {
  if (pts >= 30) return 'bg-green-600 text-white';
  if (pts >= 25) return 'bg-green-500 text-white';
  if (pts >= 20) return 'bg-yellow-500 text-white';
  if (pts >= 15) return 'bg-orange-500 text-white';
  return 'bg-red-600 text-white';
};

interface Props {
  planetRashis: Record<string, number>;
  ascendantRashi: number;
  lang: SupportedLanguage;
}

function BAVRow({ table, isHi, currentRashi }: { table: AshtakavargaTable; isHi: boolean; currentRashi: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>{table.planet}</span>
          <Badge className={`${STRENGTH_COLOR(table.bavPoints[currentRashi])} text-xs`}>
            {table.bavPoints[currentRashi]}/8 {isHi ? 'अंक' : 'pts'}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {table.bavPoints.map((pts, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded text-xs flex items-center justify-center font-mono ${STRENGTH_COLOR(pts)}`}
                title={`${RASHI_NAMES[i].en}: ${pts}`}
              >
                {pts}
              </div>
            ))}
          </div>
          {open ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </div>
      </button>

      {open && (
        <div className="p-3 overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="text-left pr-2 py-1 text-muted-foreground">{isHi ? 'योगदानकर्ता' : 'Contributor'}</th>
                {RASHI_NAMES.map((r, i) => (
                  <th key={i} className={`px-1 py-1 text-center ${i === currentRashi ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {isHi ? r.hi : r.en}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(table.contributorPoints).map(([contributor, pts]) => (
                <tr key={contributor} className="border-t border-border/50">
                  <td className="pr-2 py-1 font-medium">{contributor}</td>
                  {pts.map((p, i) => (
                    <td key={i} className={`px-1 py-1 text-center ${p === 1 ? 'text-green-600 font-bold' : 'text-muted-foreground'}`}>
                      {p}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t-2 border-border font-bold">
                <td className="pr-2 py-1">{isHi ? 'कुल' : 'Total'}</td>
                {table.bavPoints.map((pts, i) => (
                  <td key={i} className={`px-1 py-1 text-center ${i === currentRashi ? 'text-primary' : ''}`}>
                    {pts}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const AshtakavargaCard = ({ planetRashis, ascendantRashi, lang }: Props) => {
  const isHi = lang === 'hi';
  const [showSAV, setShowSAV] = useState(false);

  let result: SarvashtakavargaResult;
  try {
    result = calculateAshtakavarga(planetRashis, ascendantRashi);
  } catch {
    return null;
  }

  const { tables, savPoints, houseStrengths, transitStrengths } = result;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
        <CardTitle className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
          <span className="text-2xl">📊</span>
          {isHi ? 'अष्टकवर्ग' : 'Ashtakavarga'}
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? 'बिंदु-आधारित गोचर शक्ति विश्लेषण • BPHS'
            : 'Point-based transit strength analysis • BPHS'}
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Transit Strength Summary */}
        <div className="space-y-2">
          <p className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'वर्तमान गोचर शक्ति:' : 'Current Transit Strength:'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {transitStrengths.map(ts => (
              <div
                key={ts.planet}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${ts.isStrong ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : 'border-orange-300 bg-orange-50 dark:bg-orange-950/20'}`}
              >
                <span className="font-medium">{ts.planet}</span>
                <Badge className={STRENGTH_COLOR(ts.bavPoints)}>
                  {ts.bavPoints}/8
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Individual BAV Tables */}
        <div className="space-y-2">
          <p className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'भिन्नाष्टकवर्ग (BAV) तालिकाएं:' : 'Bhinnashtakavarga (BAV) Tables:'}
          </p>
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'विस्तार के लिए ग्रह पर क्लिक करें' : 'Click a planet to expand its table'}
          </p>
          {tables.map(table => (
            <BAVRow
              key={table.planet}
              table={table}
              isHi={isHi}
              currentRashi={planetRashis[table.planet] ?? 0}
            />
          ))}
        </div>

        {/* SAV Table */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowSAV(s => !s)}
            className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'सर्वाष्टकवर्ग (SAV) — कुल अंक' : 'Sarvashtakavarga (SAV) — Total Points'}
            </span>
            {showSAV ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSAV && (
            <div className="p-3">
              <div className="flex gap-1 flex-wrap">
                {savPoints.map((pts, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${SAV_COLOR(pts)}`}>
                      {pts}
                    </div>
                    <div className={`text-xs mt-0.5 text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? RASHI_NAMES[i].hi : RASHI_NAMES[i].en}
                    </div>
                  </div>
                ))}
              </div>

              {/* House Strengths */}
              <div className="mt-3 space-y-1">
                <p className={`text-xs font-semibold text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'भाव शक्ति:' : 'House Strengths:'}
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {houseStrengths.map(hs => (
                    <div key={hs.house} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/30">
                      <span className="font-medium">{isHi ? `${hs.house}वां` : `H${hs.house}`}</span>
                      <span>{hs.savPoints}</span>
                      <Badge className={`text-xs px-1 ${SAV_COLOR(hs.savPoints)}`}>
                        {isHi ? hs.label.hi : hs.label.en}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? '⚠️ अष्टकवर्ग गणना ग्रहों की राशि स्थिति पर आधारित है। सटीक परिणाम के लिए सही जन्म समय आवश्यक है।'
            : '⚠️ Ashtakavarga is calculated from planetary rashi positions. Accurate birth time is essential.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default AshtakavargaCard;
