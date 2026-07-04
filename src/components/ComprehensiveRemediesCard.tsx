/**
 * Comprehensive Remedies Card - 5-Tab Premium Layout
 * Week 42: Unified Remedies UI
 * Tabs: Gemstones | Yantras | Rudraksha | Mantras | Rituals
 */

import { useState, useMemo } from 'react';
import { Gem, Shield, Circle, BookOpen, Flame, ChevronRight, Star, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GEMSTONE_DATABASE, getGemstoneRecommendation, type Gemstone, type GemstoneRecommendation } from '@/services/gemstoneService';
import { YANTRA_DATABASE, recommendYantras, type YantraInfo } from '@/services/yantraService';
import { RUDRAKSHA_DATABASE, recommendRudraksha, type RudrakshaInfo } from '@/services/rudrakshaService';
import { MANTRA_DATABASE, recommendMantras, type MantraInfo } from '@/services/mantraService';

interface ComprehensiveRemediesCardProps {
  ascendantRashi: number;
  planetaryPositions: any[];
  birthDate: string;
  doshas: string[];
  lang: 'en' | 'hi';
}

type TabId = 'gemstones' | 'yantras' | 'rudraksha' | 'mantras' | 'rituals';

const TABS: { id: TabId; labelEn: string; labelHi: string; icon: any; color: string }[] = [
  { id: 'gemstones', labelEn: 'Gemstones', labelHi: 'रत्न', icon: Gem, color: 'text-pink-500' },
  { id: 'yantras', labelEn: 'Yantras', labelHi: 'यंत्र', icon: Shield, color: 'text-blue-500' },
  { id: 'rudraksha', labelEn: 'Rudraksha', labelHi: 'रुद्राक्ष', icon: Circle, color: 'text-amber-600' },
  { id: 'mantras', labelEn: 'Mantras', labelHi: 'मंत्र', icon: BookOpen, color: 'text-purple-500' },
  { id: 'rituals', labelEn: 'Rituals', labelHi: 'अनुष्ठान', icon: Flame, color: 'text-orange-500' },
];

const t = {
  en: {
    title: 'Comprehensive Remedies System',
    subtitle: 'Personalized remedies based on your birth chart analysis',
    recommended: 'Recommended for You',
    primary: 'Primary',
    substitute: 'Substitute',
    benefits: 'Benefits',
    wearing: 'How to Wear',
    mantra: 'Activation Mantra',
    price: 'Price Range',
    caution: 'Cautions',
    purpose: 'Purpose',
    material: 'Material',
    bestDay: 'Best Day',
    installation: 'Installation',
    mukhi: 'Mukhi',
    planet: 'Planet',
    deity: 'Deity',
    rarity: 'Rarity',
    difficulty: 'Level',
    repetitions: 'Repetitions',
    timing: 'Best Timing',
    totalGems: 'Total Gemstones',
    totalYantras: 'Total Yantras',
    totalRudraksha: 'Rudraksha Types',
    totalMantras: 'Total Mantras',
  },
  hi: {
    title: 'व्यापक उपाय प्रणाली',
    subtitle: 'आपकी जन्म कुंडली विश्लेषण पर आधारित व्यक्तिगत उपाय',
    recommended: 'आपके लिए अनुशंसित',
    primary: 'प्राथमिक',
    substitute: 'विकल्प',
    benefits: 'लाभ',
    wearing: 'कैसे पहनें',
    mantra: 'सक्रियण मंत्र',
    price: 'मूल्य सीमा',
    caution: 'सावधानियां',
    purpose: 'उद्देश्य',
    material: 'सामग्री',
    bestDay: 'सर्वोत्तम दिन',
    installation: 'स्थापना',
    mukhi: 'मुखी',
    planet: 'ग्रह',
    deity: 'देवता',
    rarity: 'दुर्लभता',
    difficulty: 'स्तर',
    repetitions: 'जाप संख्या',
    timing: 'सर्वोत्तम समय',
    totalGems: 'कुल रत्न',
    totalYantras: 'कुल यंत्र',
    totalRudraksha: 'रुद्राक्ष प्रकार',
    totalMantras: 'कुल मंत्र',
  }
};

const rarityColors: Record<string, string> = {
  common: 'bg-green-100 text-green-800',
  uncommon: 'bg-blue-100 text-blue-800',
  rare: 'bg-purple-100 text-purple-800',
  very_rare: 'bg-orange-100 text-orange-800',
  extremely_rare: 'bg-red-100 text-red-800',
};

export default function ComprehensiveRemediesCard({
  ascendantRashi, planetaryPositions, birthDate, doshas, lang
}: ComprehensiveRemediesCardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('gemstones');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const isHi = lang === 'hi';
  const labels = t[lang];

  // Compute weak planets from positions
  const weakPlanets = useMemo(() => {
    return planetaryPositions
      .filter((p: any) => p.dignity === 'Debilitated' || p.dignity === 'Enemy Sign')
      .map((p: any) => p.name);
  }, [planetaryPositions]);

  // Recommendations
  const gemRec = useMemo(() => {
    try { return getGemstoneRecommendation(ascendantRashi, planetaryPositions, birthDate); }
    catch { return null; }
  }, [ascendantRashi, planetaryPositions, birthDate]);

  const yantraRecs = useMemo(() => recommendYantras(weakPlanets, doshas), [weakPlanets, doshas]);
  const rudrakshaRecs = useMemo(() => recommendRudraksha(weakPlanets, doshas), [weakPlanets, doshas]);
  const mantraRecs = useMemo(() => recommendMantras(weakPlanets, doshas, 'beginner'), [weakPlanets, doshas]);

  const formatPrice = (p: { low: number; medium: number; high: number }) =>
    `₹${p.low.toLocaleString('en-IN')} - ₹${p.high.toLocaleString('en-IN')}`;

  const toggle = (id: string) => setExpandedItem(prev => prev === id ? null : id);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600/20 via-purple-600/20 to-blue-600/20 p-4 border-b border-border">
        <h3 className={cn('text-xl font-bold', isHi && 'font-hindi')}>
          🔱 {labels.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{labels.subtitle}</p>
        {/* Stats Row */}
        <div className="flex gap-4 mt-3 text-xs">
          <span className="bg-pink-500/10 text-pink-600 px-2 py-1 rounded-full font-medium">
            💎 {labels.totalGems}: {GEMSTONE_DATABASE.length}
          </span>
          <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full font-medium">
            🔱 {labels.totalYantras}: {YANTRA_DATABASE.length}
          </span>
          <span className="bg-amber-500/10 text-amber-700 px-2 py-1 rounded-full font-medium">
            📿 {labels.totalRudraksha}: {RUDRAKSHA_DATABASE.length}
          </span>
          <span className="bg-purple-500/10 text-purple-600 px-2 py-1 rounded-full font-medium">
            🕉️ {labels.totalMantras}: {MANTRA_DATABASE.length}
          </span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive && tab.color)} />
              {isHi ? tab.labelHi : tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {/* GEMSTONES TAB */}
        {activeTab === 'gemstones' && (
          <>
            {gemRec?.primary && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">⭐ {labels.recommended}</h4>
                <GemCard gem={gemRec.primary} labels={labels} isHi={isHi} isPrimary
                  expanded={expandedItem === gemRec.primary.id} onToggle={() => toggle(gemRec.primary.id)} formatPrice={formatPrice} />
              </div>
            )}
            {gemRec?.substitutes && gemRec.substitutes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">{labels.substitute}</h4>
                {gemRec.substitutes.map(g => (
                  <GemCard key={g.id} gem={g} labels={labels} isHi={isHi}
                    expanded={expandedItem === g.id} onToggle={() => toggle(g.id)} formatPrice={formatPrice} />
                ))}
              </div>
            )}
            {/* All gems by planet */}
            <div className="mt-4 pt-3 border-t border-border">
              <h4 className="text-sm font-semibold mb-2">{isHi ? 'सभी रत्न ग्रह अनुसार' : 'All Gems by Planet'}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'].map(planet => {
                  const count = GEMSTONE_DATABASE.filter(g => g.planet === planet).length;
                  return (
                    <div key={planet} className="bg-muted/40 rounded-lg px-3 py-2 text-xs">
                      <span className="font-medium">{planet}</span>
                      <span className="text-muted-foreground ml-1">({count} gems)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* YANTRAS TAB */}
        {activeTab === 'yantras' && (
          <>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">⭐ {labels.recommended}</h4>
            {yantraRecs.map(y => (
              <YantraRow key={y.id} yantra={y} labels={labels} isHi={isHi}
                expanded={expandedItem === y.id} onToggle={() => toggle(y.id)} formatPrice={formatPrice} />
            ))}
            <div className="mt-4 pt-3 border-t border-border">
              <h4 className="text-sm font-semibold mb-2">{isHi ? 'सभी यंत्र' : 'All Yantras'}</h4>
              <div className="grid grid-cols-2 gap-2">
                {YANTRA_DATABASE.filter(y => !yantraRecs.find(r => r.id === y.id)).map(y => (
                  <div key={y.id} className="bg-muted/40 rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-muted/60"
                    onClick={() => toggle(y.id)}>
                    <span className="font-medium">{isHi ? y.nameHi : y.name}</span>
                    {y.planet && <span className="text-muted-foreground ml-1">({y.planet})</span>}
                    {expandedItem === y.id && (
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        <p>{isHi ? y.purpose.hi : y.purpose.en}</p>
                        <p className="font-medium text-foreground">{formatPrice(y.price)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* RUDRAKSHA TAB */}
        {activeTab === 'rudraksha' && (
          <>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">⭐ {labels.recommended}</h4>
            {rudrakshaRecs.map(r => (
              <RudrakshaRow key={r.mukhi} rud={r} labels={labels} isHi={isHi}
                expanded={expandedItem === `rud_${r.mukhi}`} onToggle={() => toggle(`rud_${r.mukhi}`)} formatPrice={formatPrice} />
            ))}
            <div className="mt-4 pt-3 border-t border-border">
              <h4 className="text-sm font-semibold mb-2">{isHi ? 'सभी 21 मुखी रुद्राक्ष' : 'All 21 Mukhi Rudraksha'}</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {RUDRAKSHA_DATABASE.map(r => (
                  <div key={r.mukhi}
                    className={cn('rounded-lg px-2 py-1.5 text-xs cursor-pointer transition-colors',
                      rudrakshaRecs.find(rec => rec.mukhi === r.mukhi) ? 'bg-amber-100 dark:bg-amber-900/20 font-medium' : 'bg-muted/40 hover:bg-muted/60'
                    )}
                    onClick={() => toggle(`rud_${r.mukhi}`)}>
                    <div className="font-medium">{r.mukhi} {labels.mukhi}</div>
                    <div className="text-muted-foreground truncate">{isHi ? r.nameHi : r.name}</div>
                    <span className={cn('text-[10px] px-1 rounded', rarityColors[r.rarity])}>
                      {r.rarity.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* MANTRAS TAB */}
        {activeTab === 'mantras' && (
          <>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">⭐ {labels.recommended}</h4>
            {mantraRecs.slice(0, 5).map(m => (
              <MantraRow key={m.id} mantra={m} labels={labels} isHi={isHi}
                expanded={expandedItem === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </>
        )}

        {/* RITUALS TAB */}
        {activeTab === 'rituals' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <h4 className="font-semibold flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                {isHi ? 'दैनिक अनुष्ठान' : 'Daily Rituals'}
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• {isHi ? 'सूर्योदय पर सूर्य को जल अर्पित करें' : 'Offer water to Sun at sunrise'}</li>
                <li>• {isHi ? 'तुलसी को जल अर्पित करें' : 'Water the Tulsi plant'}</li>
                <li>• {isHi ? 'गायत्री मंत्र 108 बार जाप करें' : 'Chant Gayatri Mantra 108 times'}</li>
                <li>• {isHi ? 'संध्या पूजा और दीप दान' : 'Evening Puja and lamp offering'}</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <h4 className="font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                {isHi ? 'साप्ताहिक उपवास' : 'Weekly Fasting'}
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {weakPlanets.includes('Sun') && <li>• {isHi ? 'रविवार व्रत - सूर्य शक्ति' : 'Sunday fast - Sun strength'}</li>}
                {weakPlanets.includes('Moon') && <li>• {isHi ? 'सोमवार व्रत - चंद्र शांति' : 'Monday fast - Moon peace'}</li>}
                {weakPlanets.includes('Mars') && <li>• {isHi ? 'मंगलवार व्रत - हनुमान कृपा' : 'Tuesday fast - Hanuman grace'}</li>}
                {weakPlanets.includes('Saturn') && <li>• {isHi ? 'शनिवार व्रत - शनि शांति' : 'Saturday fast - Saturn pacification'}</li>}
                {weakPlanets.length === 0 && <li>• {isHi ? 'एकादशी व्रत अनुशंसित' : 'Ekadashi fasting recommended'}</li>}
              </ul>
            </div>
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <h4 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                {isHi ? 'दान और सेवा' : 'Charity & Service'}
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• {isHi ? 'निर्धनों को भोजन दान' : 'Feed the poor regularly'}</li>
                <li>• {isHi ? 'गौ सेवा' : 'Cow service (Go Seva)'}</li>
                <li>• {isHi ? 'वृक्षारोपण' : 'Plant trees (Vriksha Ropan)'}</li>
                <li>• {isHi ? 'शनिवार को तिल तेल और काले कपड़े दान' : 'Donate sesame oil and black clothes on Saturday'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───
function GemCard({ gem, labels, isHi, isPrimary, expanded, onToggle, formatPrice }: {
  gem: Gemstone; labels: any; isHi: boolean; isPrimary?: boolean;
  expanded: boolean; onToggle: () => void; formatPrice: (p: any) => string;
}) {
  return (
    <div className={cn('rounded-lg border p-3 mb-2 cursor-pointer transition-all',
      isPrimary ? 'border-pink-300 bg-pink-50/30 dark:bg-pink-900/10' : 'border-border hover:bg-muted/30')}
      onClick={onToggle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💎</span>
          <div>
            <span className="font-semibold">{isHi ? gem.nameHi : gem.name}</span>
            <span className="text-xs text-muted-foreground ml-2">({gem.planet})</span>
            {isPrimary && <span className="ml-2 text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded">{labels.primary}</span>}
          </div>
        </div>
        <ChevronRight className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} />
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 text-sm">
          <div><span className="font-medium">{labels.benefits}:</span>
            <ul className="ml-4 mt-1">{(isHi ? gem.benefits.hi : gem.benefits.en).map((b,i) => <li key={i} className="text-muted-foreground">• {b}</li>)}</ul>
          </div>
          <div><span className="font-medium">{labels.wearing}:</span>
            <span className="ml-2 text-muted-foreground">{isHi ? gem.wearingInstructions.fingerHi : gem.wearingInstructions.finger}, {isHi ? gem.wearingInstructions.dayHi : gem.wearingInstructions.day}, {gem.wearingInstructions.weight}, {isHi ? gem.wearingInstructions.metalHi : gem.wearingInstructions.metal}</span>
          </div>
          <div><span className="font-medium">{labels.mantra}:</span>
            <span className="ml-2 text-purple-600 dark:text-purple-400">{isHi ? gem.activationRitual.mantraHi : gem.activationRitual.mantra} × {gem.activationRitual.repetitions}</span>
          </div>
          <div><span className="font-medium">{labels.price}:</span>
            <span className="ml-2 text-green-600">{formatPrice(gem.price)}</span>
          </div>
          {gem.contraindications && (
            <div className="flex items-start gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span className="text-xs">{(isHi ? gem.contraindications.hi : gem.contraindications.en).join('; ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function YantraRow({ yantra, labels, isHi, expanded, onToggle, formatPrice }: {
  yantra: YantraInfo; labels: any; isHi: boolean; expanded: boolean; onToggle: () => void; formatPrice: (p: any) => string;
}) {
  return (
    <div className="rounded-lg border border-border p-3 mb-2 cursor-pointer hover:bg-muted/30 transition-all" onClick={onToggle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔱</span>
          <div>
            <span className="font-semibold">{isHi ? yantra.nameHi : yantra.name}</span>
            {yantra.planet && <span className="text-xs text-muted-foreground ml-2">({yantra.planet})</span>}
          </div>
        </div>
        <ChevronRight className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{isHi ? yantra.purpose.hi : yantra.purpose.en}</p>
      {expanded && (
        <div className="mt-3 space-y-2 text-sm border-t border-border pt-2">
          <div><span className="font-medium">{labels.benefits}:</span>
            <ul className="ml-4 mt-1">{(isHi ? yantra.benefits.hi : yantra.benefits.en).map((b,i) => <li key={i} className="text-muted-foreground">• {b}</li>)}</ul>
          </div>
          <div><span className="font-medium">{labels.material}:</span> <span className="text-muted-foreground">{isHi ? yantra.materialHi : yantra.material}</span></div>
          <div><span className="font-medium">{labels.bestDay}:</span> <span className="text-muted-foreground">{isHi ? yantra.bestDayHi : yantra.bestDay}</span></div>
          <div><span className="font-medium">{labels.mantra}:</span> <span className="text-purple-600 dark:text-purple-400">{isHi ? yantra.activationMantraHi : yantra.activationMantra}</span></div>
          <div><span className="font-medium">{labels.price}:</span> <span className="text-green-600">{formatPrice(yantra.price)}</span></div>
        </div>
      )}
    </div>
  );
}

function RudrakshaRow({ rud, labels, isHi, expanded, onToggle, formatPrice }: {
  rud: RudrakshaInfo; labels: any; isHi: boolean; expanded: boolean; onToggle: () => void; formatPrice: (p: any) => string;
}) {
  return (
    <div className="rounded-lg border border-border p-3 mb-2 cursor-pointer hover:bg-muted/30 transition-all" onClick={onToggle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📿</span>
          <div>
            <span className="font-semibold">{rud.mukhi} {labels.mukhi} - {isHi ? rud.nameHi : rud.name}</span>
            <span className={cn('ml-2 text-[10px] px-1.5 py-0.5 rounded', rarityColors[rud.rarity])}>{rud.rarity.replace('_',' ')}</span>
          </div>
        </div>
        <ChevronRight className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {labels.deity}: {isHi ? rud.rulingDeityHi : rud.rulingDeity} | {labels.planet}: {rud.rulingPlanet}
      </p>
      {expanded && (
        <div className="mt-3 space-y-2 text-sm border-t border-border pt-2">
          <div><span className="font-medium">{labels.benefits}:</span>
            <ul className="ml-4 mt-1">{(isHi ? rud.benefits.hi : rud.benefits.en).map((b,i) => <li key={i} className="text-muted-foreground">• {b}</li>)}</ul>
          </div>
          <div><span className="font-medium">{labels.mantra}:</span> <span className="text-purple-600 dark:text-purple-400">{isHi ? rud.mantraHi : rud.mantra} × {rud.mantraReps}</span></div>
          <div><span className="font-medium">{labels.price}:</span> <span className="text-green-600">{formatPrice(rud.price)}</span></div>
        </div>
      )}
    </div>
  );
}

function MantraRow({ mantra, labels, isHi, expanded, onToggle }: {
  mantra: MantraInfo; labels: any; isHi: boolean; expanded: boolean; onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-border p-3 mb-2 cursor-pointer hover:bg-muted/30 transition-all" onClick={onToggle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🕉️</span>
          <div>
            <span className="font-semibold">{mantra.planet}</span>
            <span className="text-xs text-muted-foreground ml-2">({mantra.type})</span>
            <span className={cn('ml-2 text-[10px] px-1.5 py-0.5 rounded',
              mantra.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              mantra.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
            )}>{mantra.difficulty}</span>
          </div>
        </div>
        <ChevronRight className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} />
      </div>
      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-mono">{mantra.sanskrit}</p>
      {expanded && (
        <div className="mt-3 space-y-2 text-sm border-t border-border pt-2">
          <div><span className="font-medium">{isHi ? 'अर्थ' : 'Meaning'}:</span>
            <p className="text-muted-foreground mt-0.5">{isHi ? mantra.meaning.hi : mantra.meaning.en}</p>
          </div>
          <div><span className="font-medium">{labels.repetitions}:</span>
            <span className="text-muted-foreground ml-2">{mantra.repetitions.join(' / ')}</span>
          </div>
          <div><span className="font-medium">{labels.timing}:</span>
            <span className="text-muted-foreground ml-2">{mantra.timing.bestDays.join(', ')} - {mantra.timing.bestHours.join(', ')}</span>
          </div>
          <div><span className="font-medium">{labels.benefits}:</span>
            <ul className="ml-4 mt-1">{(isHi ? mantra.benefits.hi : mantra.benefits.en).map((b,i) => <li key={i} className="text-muted-foreground">• {b}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
