import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RemedyItem } from '@/services/vedicAstroEngine';

interface Props {
  remedies: RemedyItem[];
  lang?: 'en' | 'hi';
}

const URGENCY_STYLE: Record<string, string> = {
  PRIMARY: 'bg-rose-100 text-rose-800 border-rose-300',
  SECONDARY: 'bg-amber-100 text-amber-800 border-amber-300',
  PRACTICAL: 'bg-blue-100 text-blue-800 border-blue-300',
  OPTIONAL: 'bg-gray-100 text-gray-700 border-gray-300',
};

const CATEGORY_ICON: Record<string, string> = {
  mantra: '🕉',
  gemstone: '💎',
  color: '🎨',
  ritual: '🪔',
  donation: '🙏',
};

export default function DynamicRemediesPanel({ remedies, lang = 'en' }: Props) {
  const isHi = lang === 'hi';

  return (
    <div className="space-y-3">
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-rose-800">
            🔮 {isHi ? 'चार्ट-आधारित उपाय' : 'Dynamic Remedies (from your chart)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {isHi
              ? 'महादशा, अंतर्दशा और कुंडली में दुर्बल ग्रहों के आधार पर व्यक्तिगत उपाय।'
              : 'Personalized remedies based on active dasha lords and chart afflictions — not hardcoded presets.'}
          </p>
        </CardContent>
      </Card>

      {remedies.map((r, i) => (
        <Card key={i} className="border-l-4 border-l-violet-400">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-lg">{CATEGORY_ICON[r.category] ?? '✦'}</span>
                <div>
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{r.category} · {r.planet}</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${URGENCY_STYLE[r.urgency] ?? ''}`}>
                {r.urgency}
              </Badge>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{r.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
