import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listKnowledgeEntries, getKnowledgeStats } from '@/services/jyotishApiService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Plus,
  Globe,
  Trash2,
  ChevronDown,
  ChevronUp,
  Book,
  UploadCloud,
  Download,
} from 'lucide-react';

const CATEGORIES = ['all', 'prashna', 'dasha', 'yoga', 'transit', 'remedies', 'general', 'other'];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Categories',
  prashna: 'Prashna',
  dasha: 'Dasha',
  yoga: 'Yoga',
  transit: 'Transit',
  remedies: 'Remedies',
  general: 'General',
  other: 'Other',
};

const SOURCE_LABELS: Record<string, string> = {
  book: 'Book',
  web: 'Web',
  custom: 'Custom',
};

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['knowledge_entries', category],
    queryFn: () => listKnowledgeEntries(category),
  });

  const { data: stats = { totalEntries: 0, byCategory: {} } } = useQuery({
    queryKey: ['knowledge_stats'],
    queryFn: getKnowledgeStats,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('knowledge_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge_entries'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge_stats'] });
      toast.success('Entry removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove entry');
    },
  });

  const filteredEntries = entries.filter((entry: any) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchInput.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchInput.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = (id: number) => {
    if (confirm('Remove this knowledge entry?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-auspicious-pattern">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="font-heading text-3xl font-bold text-[#8B0000] flex items-center gap-3">
              <span className="text-4xl drop-shadow-sm">🕉️</span> Eternal Research
            </h1>
            <p className="text-muted-foreground text-sm tracking-wide">
              Classical Vedic knowledge base — books, web sources, and curated notes
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/knowledge/ingest')}>
              <Globe className="w-4 h-4 mr-2" /> Ingest URL
            </Button>
            <Button size="sm" onClick={() => navigate('/knowledge/add')}>
              <Plus className="w-4 h-4 mr-2" /> Add Entry
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/60 shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold text-primary">{stats.totalEntries}</div>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-tighter">
                Total Entries
              </div>
            </CardContent>
          </Card>
          {Object.entries(CATEGORY_LABELS)
            .filter(([k]) => k !== 'all')
            .map(([cat, label]) => {
              const count = stats.byCategory[cat] || 0;
              if (count === 0 && cat !== 'general') return null;
              return (
                <Card key={cat} className="bg-card/50 border-border/60 shadow-sm">
                  <CardContent className="pt-4 pb-3">
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-tighter">
                      {label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by title, content, or author..."
              className="pl-10 bg-background/50"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-border/60">
            <div className="font-hindi text-5xl mb-4 opacity-20">ज्ञान</div>
            <p className="text-muted-foreground">No entries found matching your criteria.</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                setCategory('all');
                setSearchInput('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEntries.map(entry => (
              <Card
                key={entry.id}
                className="auspicious-card hover:border-[hsl(var(--auspicious-accent))] transition-all duration-300 group"
              >
                <CardHeader className="pb-3 pt-5 px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-heading text-lg font-semibold text-foreground cursor-pointer group-hover:text-primary transition-colors leading-tight"
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      >
                        {entry.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-bold tracking-wider"
                        >
                          {CATEGORY_LABELS[entry.category] ?? entry.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold tracking-wider"
                        >
                          {SOURCE_LABELS[entry.sourceType] ?? entry.sourceType}
                        </Badge>
                        {entry.authorName && (
                          <span className="text-xs text-muted-foreground italic flex items-center">
                            • {entry.authorName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      >
                        {expandedId === entry.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedId === entry.id && (
                  <CardContent className="pt-0 px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <Separator className="mb-4" />
                    <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed font-light font-sans">
                      {entry.content}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                      {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.tags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] bg-background/30 border-primary/20"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
