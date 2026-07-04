/**
 * Vedha Analysis Card — Transit Obstruction + Vipreet Vedha
 * Shows which transiting planets are obstructed and which have Vipreet Vedha
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkAllVedha } from '@/services/vedhaService';
import { calculateVedhaAnalysis, getVipreetVedhaSummary } from '@/services/vipreetVedhaService';

interface Props {
  transitHouses: Record<string, number>;  // planet → house from Moon
  lang: 'en' | 'hi';
}

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const PLANET_SYMBOL: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

export default function VedhaAnalysisCard({ transitHouses, lang }: Props) {
  const isHi = lang === 'hi';
  const results = checkAllVedha(transitHouses);

  const obstructed  = results.filter(r => r.isObstructed && !r.isVipreetVedha);
  const vipreet     = results.filter(r => r.isVipreetVedha);
  const clear       = results.filter(r => !r.isObstructed);

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 text-purple-800 dark:text-purple-300 ${isHi ? 'font-hindi' : ''}`}>
          <span className="text-2xl">🔮</span>
          {isHi ? 'वेध विश्लेषण' : 'Vedha Analysis'}
        </CardTitle>
        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'गोचर बाधा एवं विपरीत वेध • रमण परंपरा' : 'Transit obstruction & Vipreet Vedha • Raman tradition'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-600 text-white">{clear.length} {isHi ? 'स्पष्ट' : 'Clear'}</Badge>
          <Badge className="bg-red-600 text-white">{obstructed.length} {isHi ? 'अवरुद्ध' : 'Obstructed'}</Badge>
          {vipreet.length > 0 && <Badge className="bg-blue-600 text-white">{vipreet.length} {isHi ? 'विपरीत वेध' : 'Vipreet Vedha'}</Badge>}
        </div>

        {/* Obstructed planets */}
        {obstructed.length > 0 && (
          <div>
            <p className={`text-xs font-semibold text-red-700 mb-2 ${isHi ? 'font-hindi' : ''}`}>
              🚫 {isHi ? 'वेध (बाधित ग्रह):' : 'Vedha (Obstructed Planets):'}
            </p>
            <div className="space-y-2">
              {obstructed.map(r => (
                <div key={r.planet} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{PLANET_SYMBOL[r.planet]}</span>
                    <span className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? PLANET_HI[r.planet] : r.planet}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isHi ? `भाव ${r.favorableHouse}` : `House ${r.favorableHouse}`}
                    </span>
                    <Badge className="bg-red-600 text-white text-xs">{isHi ? 'अवरुद्ध' : 'Blocked'}</Badge>
                  </div>
                  <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? r.explanation.hi : r.explanation.en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vipreet Vedha */}
        {vipreet.length > 0 && (
          <div>
            <p className={`text-xs font-semibold text-blue-700 mb-2 ${isHi ? 'font-hindi' : ''}`}>
              ✨ {isHi ? 'विपरीत वेध (बाधा निरस्त):' : 'Vipreet Vedha (Obstruction Cancelled):'}
            </p>
            <div className="space-y-2">
              {vipreet.map(r => (
                <div key={r.planet} className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{PLANET_SYMBOL[r.planet]}</span>
                    <span className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? PLANET_HI[r.planet] : r.planet}
                    </span>
                    <Badge className="bg-blue-600 text-white text-xs">{isHi ? 'फल पुनः प्राप्त' : 'Restored'}</Badge>
                  </div>
                  <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? r.explanation.hi : r.explanation.en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clear planets */}
        {clear.length > 0 && (
          <div>
            <p className={`text-xs font-semibold text-green-700 mb-2 ${isHi ? 'font-hindi' : ''}`}>
              ✅ {isHi ? 'स्पष्ट ग्रह (पूर्ण फल):' : 'Clear Planets (Full Results):'}
            </p>
            <div className="flex flex-wrap gap-2">
              {clear.map(r => (
                <div key={r.planet} className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                  <span>{PLANET_SYMBOL[r.planet]}</span>
                  <span className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? PLANET_HI[r.planet] : r.planet}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isHi ? `भाव ${r.favorableHouse}` : `H${r.favorableHouse}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? '📖 स्रोत: बृहत् पाराशर होरा शास्त्र, फलदीपिका' : '📖 Source: BPHS, Phaladeepika'}
        </p>
      </CardContent>
    </Card>
  );
}
