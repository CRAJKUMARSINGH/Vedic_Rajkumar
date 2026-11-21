/**
 * ChartPreview.tsx — illustrative Kundli preview for the landing page.
 *
 * Reuses the canonical renderers (`NorthIndianChart`, `ChartDetailsTable`) and
 * the bilingual label catalogue. It renders whatever the synthetic fixture
 * projects — it holds no chart labels of its own, so the graphic and the table
 * can never disagree.
 *
 * Rendered on a light "paper" panel so the chart reads the same on screen and in
 * print, inside the dark landing shell.
 */

import { useMemo } from 'react';
import {
  NorthIndianChart,
} from '@/features/charts/components/NorthIndianChart';
import { ChartDetailsTable } from '@/features/charts/components/ChartDetailsTable';
import type { Lang, BilingualText } from '@/features/charts/model/labels';
import { label } from '@/features/charts/model/labels';
import {
  buildLandingPreview,
  type LandingPreview,
  type PreviewChecks,
} from '@/features/landing/previewChart';

interface ChartPreviewProps {
  /** Pre-built preview. When omitted the synthetic fixture is built once here. */
  preview?: LandingPreview;
  lang?: 'en' | 'hi';
}

const COPY = {
  title: { en: 'Sample birth chart', hi: 'नमूना जन्म कुंडली' } as BilingualText,
  subtitle: {
    en: 'Computed by the same engine this app ships — not a drawing.',
    hi: 'इसी ऐप के इंजन से गणना — चित्र नहीं।',
  } as BilingualText,
  disclosure: {
    en: 'Illustrative chart from synthetic inputs. No real birth data.',
    hi: 'काल्पनिक इनपुट से बना नमूना चार्ट। वास्तविक जन्म डेटा नहीं।',
  } as BilingualText,
  tableCaption: {
    en: 'Planetary positions',
    hi: 'ग्रह स्थितियाँ',
  } as BilingualText,
  checksTitle: { en: 'Verified in this preview', hi: 'इस नमूने में सत्यापित' } as BilingualText,
};

const CHECK_LABELS: Record<keyof PreviewChecks, BilingualText> = {
  ascendantIsHouse1: { en: 'Ascendant in house 1', hi: 'लग्न प्रथम भाव में' },
  houseSignsSequential: { en: 'House signs in sequence', hi: 'भाव राशियाँ क्रम में' },
  planetHousesMatchSigns: { en: 'Whole-sign house maths', hi: 'पूर्ण-राशि भाव गणना' },
  rahuKetuOpposition: { en: 'Rahu–Ketu 180° opposition', hi: 'राहु–केतु 180° विपरीत' },
  allGrahasWithNakshatra: { en: '9 grahas + nakshatra/pada', hi: '9 ग्रह + नक्षत्र/पद' },
};

export function ChartPreview({ preview, lang = 'en' }: ChartPreviewProps) {
  const chartLang: Lang = lang === 'hi' ? 'hi' : 'en';

  const model = useMemo(() => preview ?? buildLandingPreview(), [preview]);

  const checks = useMemo(
    () => (Object.keys(CHECK_LABELS) as (keyof PreviewChecks)[]).map((key) => ({
      key,
      pass: model.checks[key],
      text: CHECK_LABELS[key],
    })),
    [model],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Paper panel: the chart itself */}
      <figure className="rounded-2xl border border-amber-900/20 bg-[#fdf6e8] p-4 text-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.35)] print:shadow-none">
        <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <span className={`text-sm font-bold ${chartLang === 'hi' ? 'font-devanagari' : ''}`}>
            {label(COPY.title, chartLang)}
          </span>
          <span className="text-[11px] text-amber-800/80">{model.ayanamsaLabel}</span>
        </figcaption>

        <NorthIndianChart
          viewModel={model.viewModel}
          lang={chartLang}
          showDetails={false}
          interactive={false}
          className="text-slate-900"
        />

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-amber-800/80">
          <span>{model.settingsLabel}</span>
        </div>

        <p className="mt-2 text-[11px] leading-snug text-amber-900/70">
          {label(COPY.disclosure, chartLang)}
        </p>
      </figure>

      {/* Right column: method + checks + table */}
      <div className="flex flex-col gap-4">
        <div>
          <h3
            className={`text-lg font-bold text-white ${chartLang === 'hi' ? 'font-devanagari' : ''}`}
          >
            {label(COPY.subtitle, chartLang)}
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {checks.map(({ key, pass, text }) => (
              <li
                key={key}
                className="flex items-start gap-2 rounded-xl border border-slate-800/80 bg-[#050512]/60 px-3 py-2"
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    pass ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {pass ? '✓' : '!'}
                </span>
                <span
                  className={`text-xs text-slate-300 ${chartLang === 'hi' ? 'font-devanagari' : ''}`}
                >
                  {label(text, chartLang)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-[#050512]/60 p-2">
          <ChartDetailsTable
            viewModel={model.viewModel}
            lang={chartLang}
            className="w-full min-w-[560px] border-collapse text-xs text-slate-300"
          />
        </div>
      </div>
    </div>
  );
}

export default ChartPreview;
