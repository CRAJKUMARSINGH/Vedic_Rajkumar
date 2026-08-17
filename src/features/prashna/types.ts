/**
 * Core domain types for the Prashna (Horary / Question) feature.
 */

export interface PrashnaQuery {
  id: string;
  /** The question asked by the user */
  question: string;
  /** ISO timestamp when the question was raised */
  askedAt: string;
  /** Latitude at the time of the question */
  latitude: number;
  /** Longitude at the time of the question */
  longitude: number;
  /** IANA timezone */
  timezone: string;
}

export interface PrashnaAnswer {
  queryId: string;
  /** Short yes/no/maybe verdict */
  verdict: 'yes' | 'no' | 'maybe' | 'unclear';
  /** Astrological reasoning (markdown) */
  reasoning: string;
  /** Key significators used */
  significators: string[];
  /** ISO timestamp */
  answeredAt: string;
  /** Confidence level (0–1) */
  confidence?: number;
}

export interface PrashnaSession {
  query: PrashnaQuery;
  answer?: PrashnaAnswer;
}
