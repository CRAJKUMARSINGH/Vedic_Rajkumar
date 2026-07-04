import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  FileSearch,
  Heart,
  Layers3,
  Library,
  MessageSquareQuote,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackEmailWidget } from '@/components/FeedbackEmailWidget';
import { SEO, webAppSchema } from '@/components/SEO';
import { repoHighlights, repoMetrics } from '@/data/siteContent';

export const LandingPageV2 = () => {
  const overviewCards = [
    {
      label: 'Interpretation layers',
      value: `${repoMetrics.interpretationLayers}+`,
      description: 'Weighted reasoning from promise to remedy and final verdict.',
      icon: Layers3,
    },
    {
      label: 'Chart records',
      value: `${repoMetrics.totalJataks}`,
      description: 'Real saved Jataks available for archive-driven flows and demos.',
      icon: Users,
    },
    {
      label: 'Indexed sources',
      value: `${repoMetrics.ebookRows}`,
      description: 'Tracked books, notes, PDFs, and extracted material in the knowledge pipeline.',
      icon: Library,
    },
    {
      label: 'Queued upgrades',
      value: `${repoMetrics.queuedItems}`,
      description: 'Research-backed fixes and features already documented for implementation.',
      icon: FileSearch,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 font-sans text-slate-100 selection:bg-amber-400/20">
      <SEO
        title="Vedic Rajkumar | Research-Driven Vedic Astrology Platform"
        description="A content-first Vedic astrology platform that surfaces the actual chart archive, interpretation engine, research queue, and knowledge base already present in the repository."
        keywords="vedic astrology, prashna ai, kundli, knowledge base, jatak archive, research-driven astrology"
        canonical="/"
        structuredData={webAppSchema}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.15),transparent_45%)]" />
        <div className="absolute right-[-10rem] top-[20rem] h-[26rem] w-[26rem] rounded-full bg-sky-500/8 blur-[140px]" />
        <div className="absolute left-[-12rem] top-[34rem] h-[28rem] w-[28rem] rounded-full bg-amber-500/8 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      </div>

      <nav className="relative z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-400/10 shadow-[0_0_40px_rgba(245,158,11,0.14)]">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
                Vedic Rajkumar
              </div>
              <div className="text-sm text-slate-400">Content-first astrology platform</div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
            <a href="#corpus" className="transition hover:text-white">
              Corpus
            </a>
            <a href="#engine" className="transition hover:text-white">
              Engine
            </a>
            <a href="#archive" className="transition hover:text-white">
              Archive
            </a>
            <a href="#research" className="transition hover:text-white">
              Research
            </a>
            <a href="#modules" className="transition hover:text-white">
              Modules
            </a>
            <Link
              to="/transit-analysis"
              className="transition hover:text-white font-medium text-amber-200"
            >
              Transit Analysis
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="hidden rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 md:inline-flex"
            >
              <Link to="/knowledge">Open knowledge base</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-amber-400 px-5 font-semibold text-slate-950 hover:bg-amber-300"
            >
              <Link to="/question">Ask Prashna</Link>
            </Button>
          </div>
        </div>
      </nav>

      <header className="relative z-10">
        <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
          <div className="max-w-3xl">
            <Badge className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-amber-100">
              <Sparkles className="mr-2 h-4 w-4" />
              Repository-driven overhaul
            </Badge>

            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              Use the real archive, not placeholder astrology copy.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              The repo already contains a chart database, an interpretation engine, comparison
              reports, a research queue, and an indexed book corpus. This landing page now puts that
              hard-earned material in front of users from the first screen instead of hiding it
              behind generic showcase sections.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-amber-400 px-6 text-base font-semibold text-slate-950 hover:bg-amber-300"
              >
                <Link to="/knowledge">
                  Browse research corpus <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-base text-white hover:bg-white/10"
              >
                <Link to="/dasha">Open chart workspace</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                Real Jatak archive
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                Indexed knowledge corpus
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                Research-backed implementation queue
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overviewCards.map(metric => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_80px_rgba(15,23,42,0.35)]"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      <Icon className="h-4 w-4 text-amber-300" />
                      {metric.label}
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-slate-100">{metric.value}</div>
                    <div className="mt-2 text-sm text-slate-400">{metric.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber-400/20 via-sky-400/10 to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/75 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.75)] backdrop-blur">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-amber-200">
                    What is now visible
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Repository evidence</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    The homepage is no longer driven by invented demo sections. It now summarizes
                    the actual files and structures already present in the repository.
                  </p>
                </div>
                <Badge className="rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  Real content
                </Badge>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  {repoHighlights.sourceFiles.map(section => (
                    <div
                      key={section}
                      className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
                        <CheckCircle2 className="h-4 w-4" />
                        Source file
                      </div>
                      <p className="mt-3 font-mono text-sm leading-6 text-slate-300">{section}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Indexed book status
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
                        <div className="text-xs text-slate-500">Processed</div>
                        <div className="mt-1 text-2xl font-semibold text-white">
                          {repoMetrics.processedSources}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
                        <div className="text-xs text-slate-500">Skipped</div>
                        <div className="mt-1 text-2xl font-semibold text-white">
                          {repoMetrics.skippedSources}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
                        <div className="text-xs text-slate-500">Vedic tagged</div>
                        <div className="mt-1 text-2xl font-semibold text-white">
                          {repoMetrics.vedicSources}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-amber-100">
                      Overhaul direction
                    </div>
                    <p className="mt-2 text-sm leading-6 text-amber-50">
                      Lead with the real archive, surface the research backlog, connect the chart
                      database to onboarding, and treat the knowledge base as a first-class product
                      asset rather than a hidden utility.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
                {repoHighlights.comparisonReports.slice(0, 3).map(item => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                  >
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Comparison report
                    </div>
                    <p className="mt-2 text-sm font-medium text-white">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section id="corpus" className="border-y border-white/10 bg-slate-900/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <Badge className="rounded-full border border-sky-400/20 bg-sky-400/10 text-sky-200">
                <Database className="mr-2 h-4 w-4" />
                Repository corpus
              </Badge>
              <h2 className="mt-5 text-balance text-4xl font-semibold text-white sm:text-5xl">
                Start with the content assets the repository already owns.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                The strongest material in this codebase is not decorative UI. It is the research
                archive, the chart records, the implementation notes, and the interpretation system
                behind the product. The new landing structure treats those as the proof.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {repoHighlights.researchHighlights.map((highlight, index) => {
                const icons = [Database, ScanSearch, TrendingUp];
                const Icon = icons[index % icons.length];
                return (
                  <div
                    key={highlight}
                    className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-7 shadow-[0_24px_80px_rgba(2,6,23,0.45)]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                      <Icon className="h-6 w-6 text-amber-300" />
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold text-white">Content signal</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{highlight}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="engine" className="bg-slate-950 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <Badge className="rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Interpretation engine
              </Badge>
              <h2 className="mt-5 text-balance text-4xl font-semibold text-white sm:text-5xl">
                Surface the actual reasoning model that makes the platform different.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                The repo already defines a strict verdict architecture. Instead of showing fake
                simulations, the homepage now explains the living interpretation rules that shape
                readings across Prashna, chart analysis, marriage, timing, and remedies.
              </p>
            </div>

            <div className="mt-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.6)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Engine summary
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      The repository’s decision grammar
                    </h3>
                  </div>
                  <Badge className="rounded-full border border-amber-300/20 bg-amber-400/10 text-amber-100">
                    {repoMetrics.interpretationLayers}+ layers
                  </Badge>
                </div>

                <div className="mt-6 grid gap-4">
                  {repoHighlights.interpretationHighlights.map(item => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-950/80 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" />
                        <p className="text-sm leading-7 text-slate-300">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <Card className="border-white/10 bg-slate-900/70 text-slate-100">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <MessageSquareQuote className="h-5 w-5 text-amber-300" />
                      What this unlocks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6 text-sm leading-7 text-slate-300">
                    <p>
                      Prashna answers can now be introduced as part of a living research system, not
                      a black-box demo. The verdict logic is backed by documented rules, activation
                      layers, and remedy targeting.
                    </p>
                    <p>
                      The same framing also strengthens marriage, career, and timing flows because
                      the landing page explains how the engine thinks before users enter the tools.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-slate-900/70 text-slate-100">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <TrendingUp className="h-5 w-5 text-emerald-300" />
                      Immediate wins
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-6 text-sm leading-7 text-slate-300">
                    <p>Promote the knowledge base from secondary utility to primary navigation.</p>
                    <p>Use the Jataks archive to make saved-profile onboarding feel intentional.</p>
                    <p>Show the implementation queue as evidence of ongoing research depth.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="archive" className="border-y border-white/10 bg-slate-900/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <Badge className="rounded-full border border-sky-400/20 bg-sky-400/10 text-sky-200">
                <Users className="mr-2 h-4 w-4" />
                Chart archive
              </Badge>
              <h2 className="mt-5 text-balance text-4xl font-semibold text-white sm:text-5xl">
                The profile archive should be visible proof, not buried implementation detail.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                The repository already holds a family and case-study chart bank. That material is
                useful for saved profiles, examples, testing, and trust. The homepage now exposes
                that archive as a product strength.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {repoHighlights.topRelationships.map(entry => (
                <Card key={entry.name} className="border-white/10 bg-slate-950/75 text-slate-100">
                  <CardHeader className="space-y-3">
                    <Badge className="w-fit rounded-full border border-amber-300/20 bg-amber-400/10 text-amber-100">
                      {entry.relationship}
                    </Badge>
                    <CardTitle className="text-2xl">{entry.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm leading-7 text-slate-300">
                    <p>{entry.birth}</p>
                    <p>{entry.location}</p>
                    <p className="text-slate-400">{entry.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/75 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Existing reports already in repo
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Comparison report archive
                  </h3>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-fit rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link to="/kundli-compare">Open comparison tools</Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {repoHighlights.comparisonReports.map(report => (
                  <span
                    key={report}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300"
                  >
                    {report}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="research" className="bg-slate-950 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div>
                <Badge className="rounded-full border border-amber-300/20 bg-amber-400/10 text-amber-100">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Knowledge pipeline
                </Badge>
                <h2 className="mt-5 text-balance text-4xl font-semibold text-white sm:text-5xl">
                  Put the research queue and indexed sources in the product story.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  The repo already documents what still needs extraction, what has been processed,
                  and which classical or modern sources are next. Showing that work increases trust
                  and gives the platform a living roadmap.
                </p>

                <div className="mt-8 space-y-4">
                  {repoHighlights.queuedFeatures.map(section => (
                    <div
                      key={section.feature}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        {section.priority} • {section.type}
                      </div>
                      <p className="mt-3 text-sm font-medium leading-7 text-slate-200">
                        {section.feature}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-400">{section.source}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.55)]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Processed sources
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        Books and notes already tracked
                      </h3>
                    </div>
                    <Badge className="rounded-full border border-amber-300/20 bg-amber-400/10 text-amber-100">
                      Extracted corpus
                    </Badge>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {repoHighlights.processedSources.map(item => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-slate-950/80 p-5"
                      >
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Processed entry
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
                    <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.16em] text-sky-200">
                      <ScanSearch className="h-4 w-4 text-sky-300" />
                      Research flow
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      Scan to implementation
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      The knowledge pipeline already spells out a loop: scan, extract, implement,
                      verify. The product should make that visible because it explains why the app
                      keeps growing without losing its underlying system.
                    </p>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/80 p-5">
                      <div className="grid gap-3 text-sm text-slate-300">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          1. Scan the library and identify missing calculations, rules, and tables.
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          2. Extract what improves the app and log discrepancies against code.
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          3. Implement with verification instead of letting the research stay
                          buried.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Why this matters
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      Users can see the platform is not static marketing copy. It is a working
                      research system with real data sources, named backlog items, and clear product
                      depth.
                    </p>

                    <div className="mt-6 grid gap-4">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Stronger trust
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          Real research is visible
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Stronger onboarding
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          Saved chart records feel intentional
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Stronger roadmap
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          Queued knowledge upgrades are explicit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="border-t border-white/10 bg-slate-900/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <Badge className="rounded-full border border-purple-400/20 bg-purple-400/10 text-purple-200">
                  <Heart className="mr-2 h-4 w-4" />
                  Product modules
                </Badge>
                <h2 className="mt-5 text-balance text-4xl font-semibold text-white sm:text-5xl">
                  Keep the routes, but organize them around the content that powers them.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  The overhaul does not throw away your existing features. It reframes them so users
                  can understand how each route connects to the archive, research base, and
                  interpretation engine already inside the repo.
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-fit rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <Link to="/features">Explore all features</Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {repoHighlights.moduleCards.map(item => {
                const icons = [
                  MessageSquareQuote,
                  Database,
                  Heart,
                  BookOpen,
                  FileSearch,
                  TrendingUp,
                ];
                const Icon = icons[repoHighlights.moduleCards.indexOf(item) % icons.length];
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    className="group rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-6 transition duration-200 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-slate-950"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                      <Icon className="h-6 w-6 text-amber-300" />
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
                    <div className="mt-6 inline-flex items-center text-sm font-semibold text-amber-200">
                      Open module
                      <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 text-sm text-slate-400 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="font-medium text-slate-200">Vedic Rajkumar</span>
            </div>
            <p className="mt-4 max-w-md leading-7">
              Research-driven Vedic astrology platform for chart work, Prashna, timing,
              compatibility, remedies, and a growing classical knowledge system.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
              © 2026 Vedic Rajkumar
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Platform</div>
            <div className="mt-4 flex flex-col gap-3">
              <Link to="/pricing" className="transition hover:text-slate-100">
                Pricing
              </Link>
              <Link to="/features" className="transition hover:text-slate-100">
                Features
              </Link>
              <Link to="/knowledge" className="transition hover:text-slate-100">
                Knowledge base
              </Link>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Core routes</div>
            <div className="mt-4 flex flex-col gap-3">
              <Link to="/question" className="transition hover:text-slate-100">
                Prashna
              </Link>
              <Link to="/dasha" className="transition hover:text-slate-100">
                Chart workspace
              </Link>
              <Link to="/transit-analysis" className="transition hover:text-slate-100">
                Transit Analysis
              </Link>
              <Link to="/kundli-compare" className="transition hover:text-slate-100">
                Compare charts
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackEmailWidget />
    </div>
  );
};

export default LandingPageV2;
