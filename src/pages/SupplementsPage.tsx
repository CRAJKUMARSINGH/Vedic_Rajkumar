import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Search } from 'lucide-react';
import { SEO } from '@/components/SEO';

interface SupplementEntry {
  title: string;
  path: string;
  source: string;
}

interface SupplementManifest {
  generatedAt: string;
  total: number;
  entries: SupplementEntry[];
}

export default function SupplementsPage() {
  const [manifest, setManifest] = useState<SupplementManifest | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadManifest() {
      try {
        const response = await fetch('/supplements/manifest.json');
        if (!response.ok) {
          throw new Error('Supplement manifest not found. Run npm run integrate:supplements first.');
        }
        const nextManifest = (await response.json()) as SupplementManifest;
        if (!cancelled) {
          setManifest(nextManifest);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load supplement library.');
        }
      }
    }

    void loadManifest();
    return () => {
      cancelled = true;
    };
  }, []);

  const entries = manifest?.entries ?? [];
  const toSupplementRoute = (entryPath: string) =>
    `/supplements/${entryPath
      .split('/')
      .filter(Boolean)
      .map(part => encodeURIComponent(part))
      .join('/')}`;

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter(entry =>
      `${entry.title} ${entry.source}`.toLowerCase().includes(needle),
    );
  }, [entries, query]);

  return (
    <>
      <SEO
        title="Supplements Library - Vedic Rajkumar"
        description="Imported guide material and supplemental build notes for the Vedic Rajkumar astrology app."
        keywords="vedic rajkumar supplements, astrology guides, app build notes"
        canonical="/supplements"
      />
      <div className="min-h-screen bg-background">
        <section className="border-b border-border bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <BookOpen className="h-3.5 w-3.5" />
                  Root supplements
                </div>
                <h1 className="text-2xl font-bold tracking-normal">Supplements Library</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Imported guides, implementation notes, and bug-fix references from the supplemental builder.
                </p>
              </div>
              <div className="rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
                {manifest ? `${manifest.total} documents` : 'Loading documents'}
              </div>
            </div>
          </div>
        </section>

        <main className="container max-w-5xl mx-auto px-4 py-6">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search supplement documents..."
              className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
            />
          </label>

          {error && (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {!error && (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {filteredEntries.map(entry => (
                <Link
                  key={entry.path}
                  to={toSupplementRoute(entry.path)}
                  className="rounded-lg border bg-card p-4 transition-colors hover:border-primary"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-md border bg-background p-2 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold leading-5">{entry.title}</h2>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{entry.source}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!error && manifest && filteredEntries.length === 0 && (
            <div className="mt-10 rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
              No supplement documents match "{query}".
            </div>
          )}
        </main>
      </div>
    </>
  );
}
