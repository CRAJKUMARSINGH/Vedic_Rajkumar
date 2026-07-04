import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addKnowledgeEntry } from "@/services/jyotishApiService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Save } from "lucide-react";

export default function KnowledgeAdd() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: addKnowledgeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge_entries'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge_stats'] });
      toast.success("Knowledge entry added successfully");
      navigate("/knowledge");
    },
    onError: () => {
      toast.error("Failed to add knowledge entry");
    }
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [sourceType, setSourceType] = useState("book");
  const [authorName, setAuthorName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

    mutation.mutate({
      title: title.trim(),
      content: content.trim(),
      category,
      source_type: sourceType,
      author_name: authorName.trim() || null,
      source_url: sourceUrl.trim() || null,
      tags
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/knowledge")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
          </Button>
          <BookOpen className="w-6 h-6 text-primary/60" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-2">
            <Save className="w-8 h-8 text-primary" /> Add Knowledge
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide">
            Contribute classical texts, book excerpts, or personal notes to the knowledge base
          </p>
        </div>

        <Card className="bg-card/50 border-border/60 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg">New Entry</CardTitle>
            <CardDescription className="text-xs">
              Paste book passages, shloka interpretations, or original astrological notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Prasna Marga: Chapter IX — Health Questions"
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Paste the book excerpt, commentary, or astrological notes here..."
                  className="min-h-[200px] font-light text-sm leading-relaxed bg-background/50"
                  required
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
                      <SelectItem value="remedies">Remedies (Parihara)</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">Source Type</Label>
                  <Select value={sourceType} onValueChange={setSourceType}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="web">Web Article</SelectItem>
                      <SelectItem value="custom">Custom Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="author" className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">Author / Source</Label>
                  <Input
                    id="author"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="e.g. B.V. Raman"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sourceUrl" className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">Source URL (optional)</Label>
                  <Input
                    id="sourceUrl"
                    value={sourceUrl}
                    onChange={e => setSourceUrl(e.target.value)}
                    placeholder="https://..."
                    type="url"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags" className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="e.g. lagna, 7th_house, venus, marriage"
                  className="bg-background/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={mutation.isPending || !title.trim() || !content.trim()}
                  className="flex-1 shadow-md"
                >
                  {mutation.isPending ? "Saving..." : "Add to Knowledge Base"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/knowledge")}
                >
                  Cancel
                </Button>
              </div>

              {mutation.isError && (
                <p className="text-destructive text-sm text-center">Failed to save entry. Please try again.</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
