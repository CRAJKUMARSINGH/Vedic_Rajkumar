import { AlertTriangle } from 'lucide-react';
import { useFlagsmith } from '@/features/flags/provider';
import { KILL_SWITCH_FLAGS } from '@/features/flags/config';

interface KillSwitchBannerProps {
  isHi?: boolean;
}

/**
 * Shown while any coarse kill switch is pulled (W17). The body carries both
 * languages — a Hindi speaker and an English speaker see the same denial, which
 * is the point of a kill switch: nobody is left guessing.
 */
export function KillSwitchBanner({ isHi = false }: KillSwitchBannerProps) {
  const { isReady, hasFeature } = useFlagsmith();
  const pulled = (
    [KILL_SWITCH_FLAGS.API, KILL_SWITCH_FLAGS.EDGE, KILL_SWITCH_FLAGS.TELEMETRY] as const
  ).filter(flag => hasFeature(flag));

  if (!isReady || pulled.length === 0) return null;

  const primary = isHi
    ? 'कुछ सेवाएँ अस्थायी रूप से बंद हैं।'
    : 'Some services are temporarily unavailable.';
  const secondary = isHi
    ? 'Some services are temporarily unavailable.'
    : 'कुछ सेवाएँ अस्थायी रूप से बंद हैं।';

  return (
    <div
      role="status"
      className="bg-amber-50 border-b border-amber-200"
      data-kill-switches={pulled.join(',')}
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-start gap-2.5 text-sm">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className={`font-semibold text-amber-900 ${isHi ? 'font-hindi' : ''}`}>{primary}</p>
          <p className={`text-xs text-amber-800/90 ${isHi ? '' : 'font-hindi'}`}>{secondary}</p>
        </div>
      </div>
    </div>
  );
}

export default KillSwitchBanner;
