/**
 * Week 4: Error Monitoring Tests
 *
 * Tests for initErrorMonitoring(), captureException(), captureMessage(),
 * and the no-op / console-fallback behaviour when Sentry is absent.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initErrorMonitoring,
  captureException,
  captureMessage,
  isMonitoringInitialized,
  _resetForTesting,
} from '@/lib/errorMonitoring';

// ─── Setup: reset state between tests ────────────────────────────────────────

beforeEach(() => {
  _resetForTesting();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

// ─── initErrorMonitoring ──────────────────────────────────────────────────────

describe('initErrorMonitoring', () => {
  it('initializes without throwing when no DSN is set', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await expect(initErrorMonitoring()).resolves.toBeUndefined();
    expect(isMonitoringInitialized()).toBe(true);
  });

  it('is idempotent — second call is a no-op', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await initErrorMonitoring();
    await initErrorMonitoring(); // second call
    expect(isMonitoringInitialized()).toBe(true);
  });
});

// ─── captureException ────────────────────────────────────────────────────────

describe('captureException', () => {
  it('falls back to console.error when Sentry is not configured', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await initErrorMonitoring();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('test error');
    captureException(error);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ErrorMonitoring]'),
      error,
      expect.anything(),
    );
  });

  it('includes context label in console output', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await initErrorMonitoring();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    captureException(new Error('ctx error'), { context: 'TestComponent' });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[TestComponent]'),
      expect.any(Error),
      expect.anything(),
    );
  });

  it('works without prior init — installs fallback on the fly', () => {
    // Do NOT call initErrorMonitoring() — call captureException directly
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    captureException(new Error('early error'));
    expect(errorSpy).toHaveBeenCalled();
  });

  it('does not throw when given a non-Error value', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await initErrorMonitoring();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => captureException('string error')).not.toThrow();
    expect(() => captureException(null)).not.toThrow();
    expect(() => captureException({ code: 404 })).not.toThrow();
    errorSpy.mockRestore();
  });
});

// ─── captureMessage ───────────────────────────────────────────────────────────

describe('captureMessage', () => {
  it('uses console.info for info level', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await initErrorMonitoring();

    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    captureMessage('test info message', 'info');
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('test info message'),
    );
  });

  it('uses console.warn for warning level', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await initErrorMonitoring();

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    captureMessage('rate limit hit', 'warning');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('rate limit hit'),
    );
  });

  it('uses console.error for error level', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await initErrorMonitoring();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    captureMessage('critical failure', 'error');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('critical failure'),
    );
  });

  it('defaults to info level when no level is passed', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await initErrorMonitoring();

    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    captureMessage('default level message');
    expect(infoSpy).toHaveBeenCalled();
  });
});
