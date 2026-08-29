/**
 * Prashna (Horary) feature — public barrel.
 * Import from '@/features/prashna' instead of reaching into subdirectories.
 */

export type {
  PrashnaTopicCategory,
  PrashnaQuery,
  PrashnaVerdict,
  PrashnaSignificator,
  PrashnaTiming,
  PrashnaRemedy,
  PrashnaAnswer,
  PrashnaSession,
  PrashnaHistoryItem,
} from './types';

export { answerPrashna, createPrashnaSession } from './stubs';
