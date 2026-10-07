import { logger } from './observability.ts';

const ENV_BY_FEATURE: Record<string, string> = {
  kill_kundli: 'KILL_KUNDLI',
  kill_match: 'KILL_MATCH',
  kill_pdf: 'KILL_PDF',
  kill_api: 'KILL_API',
  kill_transits: 'KILL_TRANSITS',
};

export const isFeatureKilled = (feature: string): boolean => {
  const envName = ENV_BY_FEATURE[feature] ?? feature.toUpperCase();
  const value = Deno.env.get(envName);
  return value === 'true' || value === '1';
};

export const assertNotKilled = (feature: string): void => {
  if (isFeatureKilled(feature)) {
    logger.error('kill_switch_triggered', { feature });
    throw new Error('Service temporarily unavailable');
  }
};
