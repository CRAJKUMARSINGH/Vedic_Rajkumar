import { useTransits } from '@/hooks/transits/useTransits';
import type { NatalChart } from '@/services/transits/transitService';

export const TransitTimeline = ({ natal }: { natal: NatalChart }) => {
  const { data, isLoading, isError } = useTransits(natal, new Date());
  if (isError) {
    return <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-200">Unable to load transits.</div>;
  }
  if (isLoading || !data) {
    return <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">Loading transits…</div>;
  }

  return (
    <div className="space-y-4">
      {data.sadeSati.active && (
        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 text-slate-900">
          <h3 className="font-semibold">Sade Sati — {data.sadeSati.phase} phase</h3>
          <p className="text-sm">Saturn transit from your Moon. Severity: {data.sadeSati.severity}.</p>
        </div>
      )}
      {data.ashtamaShani && (
        <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 p-4 text-slate-900">
          <h3 className="font-semibold">Ashtama Shani</h3>
          <p className="text-sm">Saturn is in the 8th sign from natal Moon.</p>
        </div>
      )}
      <p className="text-sm text-slate-300">
        Tithi {data.panchang.tithi.name} ({data.panchang.tithi.paksha}) · {data.panchang.nakshatra.name} pada {data.panchang.nakshatra.pada}
      </p>
      <ul className="divide-y divide-slate-700">
        {data.aspects.slice(0, 20).map((a, i) => (
          <li key={`${a.transiting}-${a.natalTarget}-${i}`} className="py-2 text-sm">
            <span className={a.benefic ? 'text-green-400' : 'text-red-400'}>{a.transiting}</span>
            {' '}aspects{' '}
            <span className="font-medium">{a.natalTarget}</span> (house {a.house})
          </li>
        ))}
      </ul>
    </div>
  );
};
