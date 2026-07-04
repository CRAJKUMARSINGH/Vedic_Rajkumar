import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  UploadCloud,
  FolderOpen,
  File,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  XCircle,
  BookOpen,
  Layers,
  SkipForward,
  ArrowLeft,
  Download,
} from 'lucide-react';
import {
  extractAndSaveFile,
  isSupportedFile,
  SUPPORTED_EXTENSIONS,
  type ExtractionResult,
} from '@/services/knowledgeExtractService';

// ─── Types ──────────────────────────────────────────────────────────────────

type FileStatus = 'waiting' | 'processing' | 'done' | 'error' | 'skipped';

interface QueueEntry {
  id: string;
  file: File;
  status: FileStatus;
  cardsCreated?: number;
  domain?: string;
  error?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusIcon(status: FileStatus) {
  switch (status) {
    case 'waiting':
      return <Clock className="w-4 h-4 text-muted-foreground" />;
    case 'processing':
      return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
    case 'done':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-destructive" />;
    case 'skipped':
      return <SkipForward className="w-4 h-4 text-muted-foreground" />;
  }
}

function statusBadge(status: FileStatus) {
  const map: Record<FileStatus, { label: string; className: string }> = {
    waiting: { label: 'Waiting', className: 'bg-secondary text-muted-foreground' },
    processing: { label: 'Processing', className: 'bg-primary/20 text-primary' },
    done: { label: 'Done', className: 'bg-emerald-500/20 text-emerald-400' },
    error: { label: 'Error', className: 'bg-destructive/20 text-destructive' },
    skipped: { label: 'Skipped', className: 'bg-secondary text-muted-foreground' },
  };
  const { label, className } = map[status];
  return <Badge className={`text-xs font-mono ${className}`}>{label}</Badge>;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function KnowledgeUpload() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Single file upload state ─────────────────────────────────────────────
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleDragging, setSingleDragging] = useState(false);
  const [singleUploading, setSingleUploading] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<ExtractionResult | null>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

  // ── Batch queue state ────────────────────────────────────────────────────
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchDone, setBatchDone] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const multiInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['knowledge_entries'] });
    queryClient.invalidateQueries({ queryKey: ['knowledge_stats'] });
  }, [queryClient]);

  // ── Single file upload ───────────────────────────────────────────────────
  const handleSingleUpload = async () => {
    if (!singleFile) return;
    setSingleUploading(true);
    setSingleError(null);
    setSingleResult(null);
    try {
      const result = await extractAndSaveFile(singleFile);
      setSingleResult(result);
      setSingleFile(null);
      invalidateAll();
      toast.success(`Extracted ${result.cardsCreated} cards from ${result.sourceFile}`);
    } catch (err: any) {
      setSingleError(err.message || 'Unexpected error');
      toast.error(err.message || 'Extraction failed');
    } finally {
      setSingleUploading(false);
    }
  };

  const handleSingleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setSingleDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setSingleFile(f);
      setSingleError(null);
      setSingleResult(null);
    }
  };

  // ── Build queue from FileList ────────────────────────────────────────────
  const buildQueue = (files: FileList) => {
    const entries: QueueEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      entries.push({
        id: `${f.name}-${f.size}-${i}`,
        file: f,
        status: isSupportedFile(f.name) ? 'waiting' : 'skipped',
      });
    }
    setQueue(entries);
    setBatchDone(false);
    setCurrentIndex(0);
    cancelRef.current = false;
  };

  // ── Run the batch queue ───────────────────────────────────────────────────
  const runBatch = async (entries: QueueEntry[]) => {
    setBatchRunning(true);
    cancelRef.current = false;

    const updateEntry = (id: string, patch: Partial<QueueEntry>) => {
      setQueue(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));
    };

    for (let i = 0; i < entries.length; i++) {
      if (cancelRef.current) break;
      const entry = entries[i];

      if (entry.status === 'skipped') {
        setCurrentIndex(i + 1);
        continue;
      }

      setCurrentIndex(i);
      updateEntry(entry.id, { status: 'processing' });

      try {
        const result = await extractAndSaveFile(entry.file);
        updateEntry(entry.id, {
          status: 'done',
          cardsCreated: result.cardsCreated,
          domain: result.detectedDomain,
        });
      } catch (err: any) {
        updateEntry(entry.id, { status: 'error', error: err.message });
      }

      setCurrentIndex(i + 1);
    }

    invalidateAll();
    setBatchRunning(false);
    setBatchDone(true);
    toast.success('Batch processing complete');
  };

  const startBatch = () => {
    const toProcess = queue.filter(e => e.status === 'waiting' || e.status === 'error');
    if (toProcess.length === 0) return;
    // Reset errored entries to waiting before retry
    setQueue(prev =>
      prev.map(e => (e.status === 'error' ? { ...e, status: 'waiting' as FileStatus } : e))
    );
    setTimeout(
      () =>
        runBatch(
          queue.map(e => (e.status === 'error' ? { ...e, status: 'waiting' as FileStatus } : e))
        ),
      50
    );
  };

  const cancelBatch = () => {
    cancelRef.current = true;
  };
  const clearBatch = () => {
    setQueue([]);
    setBatchDone(false);
    setCurrentIndex(0);
  };

  // ── Batch stats ───────────────────────────────────────────────────────────
  const total = queue.length;
  const done = queue.filter(e => e.status === 'done').length;
  const errors = queue.filter(e => e.status === 'error').length;
  const skipped = queue.filter(e => e.status === 'skipped').length;
  const waiting = queue.filter(e => e.status === 'waiting').length;
  const totalCards = queue.reduce((acc, e) => acc + (e.cardsCreated ?? 0), 0);
  const progress = total > 0 ? Math.round(((done + errors + skipped) / total) * 100) : 0;
  const active = total - skipped;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/knowledge/export')}>
            <Download className="w-4 h-4 mr-2" /> Export Knowledge
          </Button>
        </div>

        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-2">
            <UploadCloud className="w-8 h-8 text-primary" /> Assimilate Texts
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload a single manuscript or process your entire{' '}
            <code className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              E:\ASTROLOGY
            </code>{' '}
            library at once. Knowledge saved to{' '}
            <code className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              C:\Users\Rajkumar\Vedic_Rajkumar\KNOWLEDGE_BASE
            </code>
          </p>
        </div>

        {/* ── SECTION 1: Single file ───────────────────────────────────── */}
        <Card className="bg-card/50 border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Single Manuscript
            </CardTitle>
            <CardDescription>Drop one PDF, TXT, or MD file to extract knowledge.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                singleDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
              onDragOver={e => {
                e.preventDefault();
                setSingleDragging(true);
              }}
              onDragLeave={() => setSingleDragging(false)}
              onDrop={handleSingleDrop}
              onClick={() => singleInputRef.current?.click()}
            >
              <input
                ref={singleInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt,.md"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setSingleFile(f);
                    setSingleError(null);
                    setSingleResult(null);
                  }
                }}
              />
              <UploadCloud className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="font-medium">Drag & drop or click to select</p>
              <p className="text-sm text-muted-foreground mt-1">PDF · TXT · MD</p>
            </div>

            {singleFile && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <File className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{singleFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(singleFile.size)}</p>
                  </div>
                </div>
                <Button
                  onClick={handleSingleUpload}
                  disabled={singleUploading}
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  {singleUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    'Process'
                  )}
                </Button>
              </div>
            )}

            {singleError && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {singleError}
              </div>
            )}

            {singleResult && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{singleResult.sourceFile}</p>
                  <p className="text-muted-foreground mt-0.5">
                    {singleResult.cardsCreated} cards extracted · Domain:{' '}
                    {singleResult.detectedDomain}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── SECTION 2: Batch / Folder upload ────────────────────────── */}
        <Card className="bg-card/50 border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Batch Library Upload
            </CardTitle>
            <CardDescription>
              Select your entire{' '}
              <code className="font-mono text-xs text-primary">E:\ASTROLOGY</code> folder or pick
              multiple files. The app processes them one by one and shows live progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Picker buttons */}
            {queue.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Folder picker */}
                <div
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => folderInputRef.current?.click()}
                >
                  <input
                    ref={folderInputRef}
                    type="file"
                    className="hidden"
                    // @ts-expect-error — webkitdirectory is not in TS types but works in all modern browsers
                    webkitdirectory=""
                    multiple
                    onChange={e => {
                      if (e.target.files) buildQueue(e.target.files);
                    }}
                  />
                  <FolderOpen className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="font-medium text-sm">Select Entire Folder</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    E:\ASTROLOGY or any subfolder
                  </p>
                </div>

                {/* Multi-file picker */}
                <div
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => multiInputRef.current?.click()}
                >
                  <input
                    ref={multiInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.txt,.md"
                    onChange={e => {
                      if (e.target.files) buildQueue(e.target.files);
                    }}
                  />
                  <File className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="font-medium text-sm">Select Multiple Files</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF · TXT · MD — pick any combination
                  </p>
                </div>
              </div>
            )}

            {/* Queue loaded — controls + progress */}
            {queue.length > 0 && (
              <div className="space-y-5">
                {/* Summary bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Files', value: active, sub: `${skipped} skipped` },
                    { label: 'Processed', value: done, sub: `${errors} errors` },
                    { label: 'Waiting', value: waiting, sub: batchRunning ? 'in queue' : 'ready' },
                    { label: 'Cards Found', value: totalCards, sub: 'extracted so far' },
                  ].map(({ label, value, sub }) => (
                    <div
                      key={label}
                      className="rounded-lg bg-secondary/60 border border-border p-3 text-center"
                    >
                      <p className="text-2xl font-mono font-bold text-primary">{value}</p>
                      <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {(batchRunning || batchDone) && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {batchDone
                          ? 'Complete'
                          : `Processing file ${currentIndex + 1} of ${active}`}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  {!batchRunning && !batchDone && (
                    <Button onClick={startBatch} className="shadow-md hover:shadow-lg">
                      <Layers className="w-4 h-4 mr-2" />
                      Start Batch ({active} files)
                    </Button>
                  )}
                  {batchRunning && (
                    <Button onClick={cancelBatch} variant="destructive">
                      Cancel
                    </Button>
                  )}
                  {batchDone && errors > 0 && (
                    <Button onClick={startBatch}>Retry Errors ({errors})</Button>
                  )}
                  {batchDone && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Batch complete — {done} files processed, {totalCards} total cards extracted
                    </div>
                  )}
                  <Button onClick={clearBatch} variant="outline" className="ml-auto">
                    Clear Queue
                  </Button>
                </div>

                {/* File queue list */}
                <ScrollArea className="h-72 rounded-lg border border-border bg-background/40">
                  <div className="p-2 space-y-1">
                    {queue.map(entry => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          entry.status === 'processing'
                            ? 'bg-primary/10 border border-primary/20'
                            : entry.status === 'done'
                              ? 'bg-emerald-500/5'
                              : entry.status === 'error'
                                ? 'bg-destructive/10'
                                : entry.status === 'skipped'
                                  ? 'opacity-40'
                                  : ''
                        }`}
                      >
                        <span className="shrink-0">{statusIcon(entry.status)}</span>

                        <span className="flex-1 text-xs font-mono truncate text-foreground">
                          {entry.file.name}
                        </span>

                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatSize(entry.file.size)}
                        </span>

                        {entry.cardsCreated !== undefined && (
                          <span className="text-xs text-emerald-400 font-mono shrink-0">
                            +{entry.cardsCreated} cards
                          </span>
                        )}

                        {entry.domain && (
                          <span className="text-xs text-primary/70 shrink-0 hidden sm:block">
                            {entry.domain}
                          </span>
                        )}

                        {entry.error && (
                          <span
                            className="text-xs text-destructive truncate max-w-[140px]"
                            title={entry.error}
                          >
                            {entry.error}
                          </span>
                        )}

                        {statusBadge(entry.status)}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {skipped > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {skipped} file{skipped > 1 ? 's' : ''} skipped — unsupported format. Supported:{' '}
                    {SUPPORTED_EXTENSIONS.join(', ')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
