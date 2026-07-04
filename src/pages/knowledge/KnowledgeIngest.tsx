import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingestUrl } from "@/services/jyotishApiService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Globe } from "lucide-react";

export default function KnowledgeIngest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ url, category, authorName }: { url: string, category: string, authorName: string }) => 
      ingestUrl(url, category, authorName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge_entries'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge_stats'] });
      setResult(data);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: () => {
      toast.error("Failed to ingest URL. Please check the URL and try again.");
    }
  });

  const [result, setResult] = useState<any>(null);
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("general");
  const [authorName, setAuthorName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setResult(null);
    mutation.mutate({ url, category, authorName });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/knowledge")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
          </Button>
          <Globe className="w-6 h-6 text-primary/60" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" /> Ingest from Web
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide">
            Provide a URL from an astrological website, article, or digital text archive — the AI will extract and structure the knowledge
          </p>
        </div>

        <Card className="bg-card/50 border-border/60 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg">URL Ingestion</CardTitle>
            <CardDescription className="text-xs">
              Works with archive.org, astrology journals, blog posts, and other public astrological content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="url" className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">URL to Ingest</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://archive.org/stream/PrasnaMarga..."
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prashna">Prashna (Horary)</SelectItem>
                      <SelectItem value="dasha">Dasha Systems</SelectItem>
                      <SelectItem value="yoga">Yoga Combinations</SelectItem>
                      <SelectItem value="transit">Transits</SelectItem>
                      <SelectItem value="remedies">Remedies</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ingestAuthor" className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">Author / Source Name</Label>
                  <Input
                    id="ingestAuthor"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="e.g. B.V. Raman"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={mutation.isPending || !url.trim()}
                  className="flex-1 shadow-md hover:shadow-lg transition-all"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Extracting knowledge...
                    </span>
                  ) : "Ingest & Extract"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/knowledge")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {mutation.isPending && (
          <Card className="bg-card/30 border-border/40 border-dashed animate-pulse">
            <CardContent className="py-8 text-center space-y-3">
              <div className="font-hindi text-3xl text-primary/50">ज्ञान</div>
              <p className="text-sm text-muted-foreground font-medium">Fetching and analyzing content...</p>
              <p className="text-xs text-muted-foreground/60 italic">The AI is reading the page and extracting classical astrological knowledge</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className={`border shadow-sm ${result.success ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/5"}`}>
            <CardContent className="py-6 space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Failed"}
                </Badge>
                {result.title && (
                  <span className="text-sm font-bold text-foreground truncate">{result.title}</span>
                )}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{result.message}</p>
              {result.success && result.entriesCreated > 0 && (
                <div className="flex gap-3 mt-4">
                  <Button size="sm" onClick={() => navigate("/knowledge")}>
                    View Knowledge Base
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setResult(null); setUrl(""); }}
                  >
                    Ingest Another
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
