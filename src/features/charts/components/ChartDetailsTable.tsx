/**
 * ChartDetailsTable.tsx — accessible, printable planetary detail table shared
 * by the North and South Indian renderers (c4 Phase 4).
 *
 * Provides the screen-reader description and the keyboard-navigable fallback
 * for the SVG charts.
 */

import { formatDegrees, label, type Lang } from '../model/labels';
import type { ChartViewModel } from '../model/chartViewModel';

export interface ChartDetailsTableProps {
  viewModel: ChartViewModel;
  lang?: Lang;
  degreePrecision?: number;
  className?: string;
}

export function ChartDetailsTable({
  viewModel,
  lang = 'en',
  degreePrecision = 2,
  className,
}: ChartDetailsTableProps) {
  const unavailable = '—';

  return (
    <table
      data-testid="chart-details"
      className={className ?? 'mt-3 w-full border-collapse text-xs'}
    >
      <caption className="sr-only">
        {lang === 'hi' ? 'ग्रह स्थिति तालिका' : 'Planetary position details'}
      </caption>
      <thead>
        <tr className="text-left">
          <th scope="col">{lang === 'hi' ? 'ग्रह' : 'Planet'}</th>
          <th scope="col">{lang === 'hi' ? 'राशि' : 'Sign'}</th>
          <th scope="col">{lang === 'hi' ? 'भाव' : 'House'}</th>
          <th scope="col">{lang === 'hi' ? 'अंश' : 'Degree'}</th>
          <th scope="col">{lang === 'hi' ? 'देशांतर' : 'Longitude'}</th>
          <th scope="col">{lang === 'hi' ? 'नक्षत्र' : 'Nakshatra'}</th>
          <th scope="col">{lang === 'hi' ? 'पद' : 'Pada'}</th>
          <th scope="col">{lang === 'hi' ? 'गति' : 'Motion'}</th>
          <th scope="col">{lang === 'hi' ? 'स्थिति' : 'Dignity'}</th>
        </tr>
      </thead>
      <tbody>
        {viewModel.planets.map((p) => (
          <tr key={p.key} data-testid={`detail-row-${p.key}`}>
            <td>{label(p.name, lang)}</td>
            <td>{p.signName ? label(p.signName, lang) : unavailable}</td>
            <td>{p.house ?? unavailable}</td>
            <td>{formatDegrees(p.degrees, degreePrecision) ?? unavailable}</td>
            <td>{formatDegrees(p.longitude, degreePrecision) ?? unavailable}</td>
            <td>{p.nakshatra ? label(p.nakshatra.name, lang) : unavailable}</td>
            <td>{p.nakshatra?.pada ?? unavailable}</td>
            <td>
              {p.retrograde
                ? lang === 'hi'
                  ? 'वक्री'
                  : 'Retrograde'
                : lang === 'hi'
                  ? 'मार्गी'
                  : 'Direct'}
            </td>
            <td>{p.dignity ?? unavailable}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ChartDetailsTable;
