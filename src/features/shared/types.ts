/**
 * Shared / cross-feature domain types.
 *
 * Types that are used across multiple feature modules live here.
 * Feature-specific types stay in their own feature folder.
 */

// ─── Common pagination ────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

// ─── API response envelope ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  code?: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

// ─── User profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Saved reading ────────────────────────────────────────────────────────────

export type ReadingType = 'kundli' | 'prashna' | 'matchmaking' | 'panchang';

export interface SavedReading {
  id: string;
  userId: string;
  type: ReadingType;
  title: string;
  /** JSON blob — shape depends on ReadingType */
  data: unknown;
  createdAt: string;
  updatedAt: string;
}
