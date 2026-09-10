/**
 * sanitize.ts
 *
 * Thin wrapper around DOMPurify for sanitizing user-supplied text before
 * storing it in Supabase or rendering it in the DOM.
 *
 * Use sanitizeText() for plain-text fields (strips all HTML).
 * Use sanitizeHtml() for fields that may contain safe markup.
 *
 * DOMPurify requires a DOM environment — it is a no-op in SSR / Node.
 */

import DOMPurify from 'dompurify';

/**
 * Strip all HTML tags and return plain text.
 * Use for: names, questions, notes, birth locations — anything that should
 * never contain markup.
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  // ALLOWED_TAGS: [] means no tags survive — output is plain text.
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/**
 * Allow a safe subset of HTML tags (b, i, em, strong, br, p).
 * Use for: rich text fields where formatting is intentional.
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  }).trim();
}

/**
 * Sanitize an object's string fields in place (shallow).
 * Returns a new object — does not mutate the input.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? sanitizeText(value) : value;
  }
  return result as T;
}
