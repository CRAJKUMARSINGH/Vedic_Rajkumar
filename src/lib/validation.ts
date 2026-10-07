/**
 * validation.ts — Week 6 Security Hardening
 *
 * Zod schemas for all external inputs. Use these at API boundaries and in
 * form handlers to validate and sanitize user-supplied data before it reaches
 * the calculation engine or Supabase.
 *
 * Import pattern:
 *   import { BirthDataSchema, parseBirthData } from '@/lib/validation';
 *
 * All schemas use .trim() on strings to strip accidental whitespace and
 * .max() limits to prevent oversized payloads.
 */

import { z } from 'zod';

// ─── Re-export z for convenience ─────────────────────────────────────────────
export { z };

// ─── Primitives ───────────────────────────────────────────────────────────────

/** YYYY-MM-DD */
export const DateStringSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
  .refine((s: string) => !Number.isNaN(Date.parse(s)), 'Invalid date value');

/** HH:MM (24-hour) */
export const TimeStringSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM (24-hour)');

/** Latitude: -90 to 90 */
export const LatitudeSchema = z.number().min(-90).max(90);

/** Longitude: -180 to 180 */
export const LongitudeSchema = z.number().min(-180).max(180);

/** UTC offset in decimal hours: -14 to +14 */
export const TimezoneOffsetSchema = z.number().min(-14).max(14);

/** Ayanamsa systems supported */
export const AyanamsaSchema = z
  .enum(['Lahiri', 'Raman', 'Krishnamurti', 'KP'])
  .default('Lahiri');

// ─── Birth Data ───────────────────────────────────────────────────────────────

export const BirthDataSchema = z.object({
  /** Person's name — plain text only */
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),

  /** Date of birth YYYY-MM-DD */
  date: DateStringSchema,

  /** Time of birth HH:MM */
  time: TimeStringSchema,

  /** Birth location as a human-readable string */
  location: z
    .string()
    .trim()
    .min(1, 'Location is required')
    .max(200, 'Location must be 200 characters or fewer'),

  /** Latitude of birth place */
  latitude: LatitudeSchema,

  /** Longitude of birth place */
  longitude: LongitudeSchema,

  /** UTC offset in decimal hours — e.g. 5.5 for IST */
  timezone: TimezoneOffsetSchema.optional().default(5.5),

  /** Gender — used for Ashta Koota calculations */
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export type BirthData = z.infer<typeof BirthDataSchema>;

// ─── Prashna (Horary) ─────────────────────────────────────────────────────────

export const PrashnaInputSchema = z.object({
  /** The question asked */
  question: z
    .string()
    .trim()
    .min(3, 'Question must be at least 3 characters')
    .max(500, 'Question must be 500 characters or fewer'),

  /** When the question was asked (defaults to now) */
  questionTime: z.string().trim().optional(),

  /** Where the question was asked */
  latitude: LatitudeSchema.optional(),
  longitude: LongitudeSchema.optional(),
});

export type PrashnaInput = z.infer<typeof PrashnaInputSchema>;

// ─── Panchang ────────────────────────────────────────────────────────────────

export const PanchangRequestSchema = z.object({
  date: DateStringSchema,
  latitude: LatitudeSchema.optional().default(28.6139),  // New Delhi default
  longitude: LongitudeSchema.optional().default(77.209),
  timezone: TimezoneOffsetSchema.optional().default(5.5),
  language: z.enum(['en', 'hi', 'sa']).optional().default('en'),
});

export type PanchangRequest = z.infer<typeof PanchangRequestSchema>;

// ─── Matchmaking ─────────────────────────────────────────────────────────────

export const MatchmakingRequestSchema = z.object({
  maleBirthData: BirthDataSchema,
  femaleBirthData: BirthDataSchema,
  language: z.enum(['en', 'hi']).optional().default('en'),
  includeNavamsa: z.boolean().optional().default(true),
  includeAshtakavarga: z.boolean().optional().default(true),
});

export type MatchmakingRequest = z.infer<typeof MatchmakingRequestSchema>;

// ─── Kundli / Chart ──────────────────────────────────────────────────────────

export const ChartRequestSchema = z.object({
  birthData: BirthDataSchema,
  chartStyle: z.enum(['north-indian', 'south-indian', 'east-indian']).optional().default('north-indian'),
  ayanamsa: AyanamsaSchema,
  language: z.enum(['en', 'hi', 'sa']).optional().default('en'),
  includeDivisional: z.boolean().optional().default(false),
  includeAshtakavarga: z.boolean().optional().default(false),
});

export type ChartRequest = z.infer<typeof ChartRequestSchema>;

// ─── Transit ─────────────────────────────────────────────────────────────────

export const TransitRequestSchema = z.object({
  targetDate: DateStringSchema.optional(),
  latitude: LatitudeSchema.optional().default(28.6139),
  longitude: LongitudeSchema.optional().default(77.209),
  timezone: TimezoneOffsetSchema.optional().default(5.5),
  natalMoonRashi: z.number().int().min(0).max(11).optional(),
});

export type TransitRequest = z.infer<typeof TransitRequestSchema>;

// ─── Organisation ─────────────────────────────────────────────────────────────

export const CreateOrgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Organisation name must be at least 2 characters')
    .max(80, 'Organisation name must be 80 characters or fewer'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
    .max(60)
    .optional(),
  tier: z.enum(['individual', 'family', 'practitioner', 'enterprise']).optional().default('individual'),
  billingEmail: z.string().email('Invalid billing email').optional(),
});

export type CreateOrgInput = z.infer<typeof CreateOrgSchema>;

// ─── Helper: parse or throw ───────────────────────────────────────────────────

/**
 * Parse input against a schema and return typed data.
 * Throws a ZodError on failure — caller should catch and surface to user.
 *
 * @example
 * const data = parse(BirthDataSchema, formValues);
 */
export function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  return schema.parse(input);
}

/**
 * Safely parse — returns { success, data, error } without throwing.
 *
 * @example
 * const result = safeParse(BirthDataSchema, formValues);
 * if (!result.success) showErrors(flattenErrors(result.error));
 */
export function safeParse<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  return schema.safeParse(input) as { success: true; data: z.infer<T> } | { success: false; error: z.ZodError };
}

/**
 * Returns a flat record of field → first error message.
 * Useful for wiring Zod errors into form state.
 *
 * @example
 * const errors = flattenErrors(zodError);
 * // { name: 'Name is required', date: 'Date must be YYYY-MM-DD' }
 */
export function flattenErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join('.') : '_form';
    if (!result[field]) {
      result[field] = issue.message;
    }
  }

  return result;
}
