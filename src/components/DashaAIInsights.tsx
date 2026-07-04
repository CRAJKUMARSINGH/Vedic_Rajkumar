import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Languages } from 'lucide-react';
import { useState } from 'react';

interface DashaAIInsightsProps {
  currentMahadasha: string;
  currentAntardasha: string;
  lang: 'en' | 'hi';
}

export default function DashaAIInsights({
  currentMahadasha,
  currentAntardasha,
  lang,
}: DashaAIInsightsProps) {
  const [showHindi, setShowHindi] = useState(lang === 'hi');

  // Mock AI data - in production this would come from a Supabase Edge Function
  const mockData = {
    commentaryEn: `You are currently in the ${currentMahadasha} Mahadasha and ${currentAntardasha} Antardasha. This period is marked by high energy and focus on career growth. However, be mindful of communication gaps in personal relationships.`,
    commentaryHi: `आप वर्तमान में ${currentMahadasha} महादशा और ${currentAntardasha} अंतर्दशा में हैं। यह अवधि करियर के विकास पर उच्च ऊर्जा और ध्यान केंद्रित करने के लिए जानी जाती है। हालांकि, व्यक्तिगत संबंधों में संचार अंतराल के प्रति सचेत रहें।`,
    keyThemesEn: ['Career Growth', 'High Energy', 'Strategic Thinking'],
    keyThemesHi: ['करियर विकास', 'उच्च ऊर्जा', 'रणनीतिक सोच'],
    upcomingTransitionEn: 'Transition to next Antardasha will focus on financial stability.',
    upcomingTransitionHi: 'अगली अंतर्दशा में संक्रमण वित्तीय स्थिरता पर केंद्रित होगा।',
  };

  return (
    <div className="auspicious-card bg-gradient-to-br from-[#FEF9E7] to-[#FFFDE7] border-[#D4AF37] shadow-xl">
      <div className="auspicious-header bg-gradient-to-r from-[#E65100] to-[#F57C00]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-bold tracking-wide">AI Insights & Themes</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHindi(!showHindi)}
          className="h-7 text-[10px] uppercase tracking-widest font-bold text-white hover:bg-white/10"
        >
          <Languages className="w-3 h-3 mr-1" />
          {showHindi ? 'English' : 'हिंदी'}
        </Button>
      </div>
      <div className="p-6 space-y-6">
        <p className="text-sm leading-relaxed text-foreground/90 font-sans">
          {showHindi ? mockData.commentaryHi : mockData.commentaryEn}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {(showHindi ? mockData.keyThemesHi : mockData.keyThemesEn).map((theme, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-[10px] bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300/30"
            >
              {theme}
            </Badge>
          ))}
        </div>

        <div className="border-t border-amber-200/30 pt-3 mt-1">
          <p className="text-[10px] font-bold text-amber-800/60 dark:text-amber-400/60 uppercase tracking-widest mb-1">
            Upcoming Transition
          </p>
          <p className="text-xs text-foreground/70 italic leading-relaxed">
            {showHindi ? mockData.upcomingTransitionHi : mockData.upcomingTransitionEn}
          </p>
        </div>
      </div>
    </div>
  );
}

function Button({ className, ...props }: any) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground ${className}`}
      {...props}
    />
  );
}
