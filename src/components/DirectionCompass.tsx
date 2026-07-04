import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NatalPlanetRow } from '@/services/eventTransitAnalysisService';

const DIG_BALA_HOUSE: Record<string, number> = {
  Sun: 10, Moon: 4, Mars: 10, Mercury: 1, Jupiter: 1, Venus: 4, Saturn: 7,
};

const PLANET_DIRECTION: Record<string, string> = {
  Sun: 'S', Mars: 'S', Moon: 'N', Venus: 'N', Mercury: 'E', Jupiter: 'E', Saturn: 'W',
};

const DIRECTION_META: Record<string, { en: string; hi: string; angle: number }> = {
  N:  { en: 'North', hi: 'उत्तर', angle: 0 },
  NE: { en: 'NE', hi: 'ई-उ', angle: 45 },
  E:  { en: 'East', hi: 'पूर्व', angle: 90 },
  SE: { en: 'SE', hi: 'द-प', angle: 135 },
  S:  { en: 'South', hi: 'दक्षिण', angle: 180 },
  SW: { en: 'SW', hi: 'द-प', angle: 225 },
  W:  { en: 'West', hi: 'पश्चिम', angle: 270 },
  NW: { en: 'NW', hi: 'उ-प', angle: 315 },
};

const CARDINAL_NEIGHBORS: Record<string, string[]> = {
  N: ['NE', 'NW'], E: ['NE', 'SE'], S: ['SE', 'SW'], W: ['SW', 'NW'],
};

function digBalaScore(planet: string, house: number): number {
  const best = DIG_BALA_HOUSE[planet];
  if (!best) return 0;
  const dist = Math.min(Math.abs(house - best), 12 - Math.abs(house - best));
  return Math.round(((6 - dist) / 6) * 100);
}

interface Props {
  natalPlanets: NatalPlanetRow[];
  lang?: 'en' | 'hi';
}

export default function DirectionCompass({ natalPlanets, lang = 'en' }: Props) {
  const isHi = lang === 'hi';
  const scores: Record<string, { score: number; planets: string[] }> = {};

  for (const key of Object.keys(DIRECTION_META)) {
    scores[key] = { score: 0, planets: [] };
  }

  for (const p of natalPlanets) {
    if (!DIG_BALA_HOUSE[p.planet]) continue;
    const score = digBalaScore(p.planet, p.houseFromLagna);
    const dir = PLANET_DIRECTION[p.planet] ?? 'E';
    scores[dir].score += score;
    scores[dir].planets.push(`${p.planet} (${score}%)`);
    for (const neighbor of CARDINAL_NEIGHBORS[dir] ?? []) {
      scores[neighbor].score += Math.round(score * 0.35);
    }
  }

  const ranked = Object.entries(scores)
    .map(([dir, data]) => ({ dir, ...data }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  return (
    <Card className="border-teal-200 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-teal-800 dark:text-teal-300">
          🧭 {isHi ? 'दिशा बल (Dig Bala)' : 'Direction Compass (Dig Bala)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative mx-auto w-48 h-48">
          <div className="absolute inset-4 rounded-full border-2 border-teal-300/60 bg-white/60 dark:bg-gray-900/40" />
          {Object.entries(DIRECTION_META).map(([dir, meta]) => {
            const s = scores[dir].score;
            const intensity = Math.min(1, s / 120);
            const r = 70;
            const rad = (meta.angle - 90) * (Math.PI / 180);
            const x = 96 + r * Math.cos(rad);
            const y = 96 + r * Math.sin(rad);
            return (
              <div
                key={dir}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ left: x, top: y }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border"
                  style={{
                    backgroundColor: `rgba(20, 184, 166, ${0.15 + intensity * 0.65})`,
                    borderColor: `rgba(20, 184, 166, ${0.4 + intensity * 0.5})`,
                  }}
                >
                  {dir}
                </div>
              </div>
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-teal-700">{isHi ? 'अनुशंसित' : 'Best'}</span>
          </div>
        </div>

        {best && (
          <div className="text-center">
            <Badge className="bg-teal-600 text-white">
              {isHi ? DIRECTION_META[best.dir].hi : DIRECTION_META[best.dir].en} — {best.score}%
            </Badge>
            <p className="text-[10px] text-muted-foreground mt-1">
              {isHi
                ? 'साक्षात्कार / महत्वपूर्ण कार्य के लिए इस दिशा में बैठें या मुख करें'
                : 'Face or sit toward this direction for interviews and important work'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {ranked.slice(0, 4).map(r => (
            <div key={r.dir} className="rounded border p-2 text-[10px]">
              <p className="font-semibold">
                {isHi ? DIRECTION_META[r.dir].hi : DIRECTION_META[r.dir].en} ({r.score}%)
              </p>
              <p className="text-muted-foreground truncate">{r.planets.join(', ') || '—'}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
