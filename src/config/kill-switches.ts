import { logger } from '@/observability/logging/logger';

export const KILL_SWITCHES = {
  KUNDLI_CALCULATION: 'kill_kundli',
  MATCHMAKING: 'kill_match',
  PDF_EXPORT: 'kill_pdf',
  PUBLIC_API: 'kill_api',
  TRANSITS: 'kill_transits',
} as const;

export type KillSwitchId = (typeof KILL_SWITCHES)[keyof typeof KILL_SWITCHES];

export class KillSwitchError extends Error {
  constructor(public feature: string) {
    super('Service temporarily unavailable');
    this.name = 'KillSwitchError';
  }
}

const overrides = new Map<string, boolean>();

const ENV_BY_FEATURE: Record<string, string> = {
  kill_kundli: 'VITE_KILL_KUNDLI',
  kill_match: 'VITE_KILL_MATCH',
  kill_pdf: 'VITE_KILL_PDF',
  kill_api: 'VITE_KILL_API',
  kill_transits: 'VITE_KILL_TRANSITS',
};

export const setKillSwitch = (feature: string, enabled: boolean): void => {
  overrides.set(feature, enabled);
};

export const resetKillSwitches = (): void => {
  overrides.clear();
};

export const isKillSwitchEnabled = (feature: string): boolean => {
  if (overrides.has(feature)) return Boolean(overrides.get(feature));
  const envName = ENV_BY_FEATURE[feature];
  if (!envName) return false;
  const env = import.meta.env as Record<string, string | undefined>;
  const value = env[envName];
  return value === 'true' || value === '1';
};

/** Throws when the named feature is killed. Returns false otherwise. */
export const checkKillSwitch = async (feature: string): Promise<boolean> => {
  if (isKillSwitchEnabled(feature)) {
    logger.error('kill_switch_triggered', { feature });
    throw new KillSwitchError(feature);
  }
  return false;
};
