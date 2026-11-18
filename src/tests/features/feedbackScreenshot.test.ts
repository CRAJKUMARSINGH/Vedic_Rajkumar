import { describe, it, expect } from 'vitest';
import {
  classifyScreenshot,
  isScreenshotPathForUser,
  SCREENSHOT_MAX_BYTES,
  SCREENSHOT_BUCKET,
  SCREENSHOT_RETENTION_DAYS,
} from '@/features/feedback/screenshot';

const UID = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const OBJ = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('classifyScreenshot', () => {
  it('accepts the three allowed image types', () => {
    for (const type of ['image/png', 'image/jpeg', 'image/webp']) {
      expect(classifyScreenshot({ type, size: 1024 })).toEqual({ ok: true });
    }
  });

  it('is case-insensitive about the media type', () => {
    expect(classifyScreenshot({ type: 'IMAGE/PNG', size: 1024 })).toEqual({ ok: true });
  });

  it('rejects a type the bucket will not store', () => {
    for (const type of ['image/gif', 'image/svg+xml', 'application/pdf', '']) {
      expect(classifyScreenshot({ type, size: 1024 })).toEqual({
        ok: false,
        reason: 'unsupported_type',
      });
    }
  });

  it('accepts a file exactly at the limit and rejects one byte over', () => {
    expect(classifyScreenshot({ type: 'image/png', size: SCREENSHOT_MAX_BYTES })).toEqual({
      ok: true,
    });
    expect(classifyScreenshot({ type: 'image/png', size: SCREENSHOT_MAX_BYTES + 1 })).toEqual({
      ok: false,
      reason: 'too_large',
    });
  });

  it('treats a missing size as zero (not an overflow)', () => {
    expect(classifyScreenshot({ type: 'image/png' })).toEqual({ ok: true });
  });
});

describe('isScreenshotPathForUser', () => {
  it('accepts a path the server minted for this user', () => {
    expect(isScreenshotPathForUser(`${UID}/${OBJ}.png`, UID)).toBe(true);
    expect(isScreenshotPathForUser(`${UID}/${OBJ}.jpg`, UID)).toBe(true);
    expect(isScreenshotPathForUser(`${UID}/${OBJ}.webp`, UID)).toBe(true);
  });

  it("rejects another user's prefix", () => {
    expect(isScreenshotPathForUser(`${OTHER}/${OBJ}.png`, UID)).toBe(false);
  });

  it('rejects traversal that only looks prefixed', () => {
    expect(isScreenshotPathForUser(`${UID}/../${OTHER}/${OBJ}.png`, UID)).toBe(false);
  });

  it('rejects a disallowed extension and a non-uuid leaf', () => {
    expect(isScreenshotPathForUser(`${UID}/${OBJ}.gif`, UID)).toBe(false);
    expect(isScreenshotPathForUser(`${UID}/shot.png`, UID)).toBe(false);
  });

  it('rejects when the user id is absent', () => {
    expect(isScreenshotPathForUser(`${UID}/${OBJ}.png`, '')).toBe(false);
  });
});

describe('screenshot policy constants', () => {
  it('pins the bucket and retention window the docs promise', () => {
    expect(SCREENSHOT_BUCKET).toBe('feedback-screenshots');
    expect(SCREENSHOT_RETENTION_DAYS).toBe(90);
    expect(SCREENSHOT_MAX_BYTES).toBe(5 * 1024 * 1024);
  });
});
