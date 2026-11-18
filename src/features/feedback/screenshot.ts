/**
 * Screenshot attachment guards for the in-app reporter (playbook §3.1).
 *
 * Pure, dependency-free so it is trivially testable and shared by the widget.
 * These are UX guards only: the authoritative limits are the bucket's own
 * file_size_limit / allowed_mime_types, the server-chosen object path, and the
 * check inside `submit-feedback`. A client-side check is not a boundary.
 */

export const SCREENSHOT_BUCKET = 'feedback-screenshots';
export const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024; // 5 MiB — matches the bucket
export const SCREENSHOT_RETENTION_DAYS = 90;
export const SCREENSHOT_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const SCREENSHOT_ACCEPT = SCREENSHOT_MIME_TYPES.join(',');

export type ScreenshotRejection = 'unsupported_type' | 'too_large';

export type ScreenshotCheck = { ok: true } | { ok: false; reason: ScreenshotRejection };

/** Validate a picked file's type and size before any upload is attempted. */
export function classifyScreenshot(file: { type?: string; size?: number }): ScreenshotCheck {
  const type = (file.type ?? '').toLowerCase();
  if (!(SCREENSHOT_MIME_TYPES as readonly string[]).includes(type)) {
    return { ok: false, reason: 'unsupported_type' };
  }
  const size = typeof file.size === 'number' ? file.size : 0;
  if (size > SCREENSHOT_MAX_BYTES) return { ok: false, reason: 'too_large' };
  return { ok: true };
}

/**
 * True only when `path` is an object this user is allowed to attach: it must sit
 * under the user's own `<uid>/` prefix and match the `<uid>/<uuid>.<ext>` shape
 * the server mints. Mirrors the server-side check in `submit-feedback`.
 */
export function isScreenshotPathForUser(path: string, userId: string): boolean {
  if (!userId) return false;
  return (
    path.startsWith(`${userId}/`) &&
    /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(path)
  );
}
