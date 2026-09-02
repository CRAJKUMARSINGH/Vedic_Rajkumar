import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { SEO } from '@/components/SEO';
import {
  ALL_FEATURES_CATEGORY_TABS,
  FEATURE_CATALOG,
  getFeatureCategoryTab,
} from '@/routes/featureRegistry';
import { type SupportedLanguage } from '@/services/multiLanguageService';

const CORE_FEATURE_COUNT = FEATURE_CATALOG.filter(feature => feature.isCoreFeature).length;

const AllFeaturesPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof ALL_FEATURES_CATEGORY_TABS)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const isHi = lang === 'hi';

  const filtered = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return FEATURE_CATALOG.filter(feature => {
      const categoryTab = getFeatureCategoryTab(feature.category);
      const matchesCategory = selectedCategory === 'All' || categoryTab === selectedCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        feature.label.toLowerCase().includes(normalizedSearch) ||
        feature.description.toLowerCase().includes(normalizedSearch) ||
        feature.path.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <>
      <SEO
        title="Feature Roadmap - Vedic Rajkumar"
        description="Explore the active Vedic Rajkumar core tools and preview roadmap. Kundli, Prashna, Matchmaking, and Panchang are the current production focus."
        keywords="vedic astrology roadmap, kundli, prashna, matchmaking, panchang"
        canonical="/features"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Week 3 product focus
              </p>
              <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'सुविधा रोडमैप' : 'Feature Roadmap'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {CORE_FEATURE_COUNT} active core tools. Advanced modules stay visible as roadmap previews.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">
                {isHi ? 'होम' : 'Home'}
              </Link>
              <EnhancedLanguageToggle
                currentLang={lang}
                onChange={setLang}
                showRegion={false}
                autoDetect={false}
              />
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{FEATURE_CATALOG.length}</div>
              <div className="text-xs text-muted-foreground">Total registered routes</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold text-primary">{CORE_FEATURE_COUNT}</div>
              <div className="text-xs text-muted-foreground">Active production focus</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{FEATURE_CATALOG.length - CORE_FEATURE_COUNT}</div>
              <div className="text-xs text-muted-foreground">Preview or roadmap modules</div>
            </div>
          </section>

          <input
            type="text"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder={isHi ? 'सुविधा खोजें...' : 'Search roadmap...'}
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex gap-1 flex-wrap">
            {ALL_FEATURES_CATEGORY_TABS.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  selectedCategory === category
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(feature => {
              const isCore = feature.isCoreFeature === true;
              return (
                <Link
                  key={feature.path}
                  to={feature.path}
                  className="group rounded-lg border bg-card p-4 transition-colors hover:border-primary"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {feature.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h2 className={`text-sm font-semibold group-hover:text-primary ${isHi ? 'font-hindi' : ''}`}>
                          {isHi ? feature.labelHi : feature.label}
                        </h2>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            isCore
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCore ? 'Active core' : 'Preview roadmap'}
                        </span>
                        {feature.badge && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {isHi ? feature.descriptionHi : feature.description}
                      </p>
                      <p className="mt-2 text-[11px] text-muted-foreground">{feature.path}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-lg border bg-card py-12 text-center text-muted-foreground">
              <p>No roadmap items found for "{searchQuery}".</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AllFeaturesPage;
