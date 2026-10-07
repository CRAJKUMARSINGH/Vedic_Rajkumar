/**
 * useSessionTimeout
 * Week 4: Detects user inactivity and warns before signing out.
 *
 * - After `warningAfterMs` of no activity → fires `onWarn` (show a modal/toast)
 * - After a further `signOutAfterMs` with no activity → fires `onSignOut`
 * - Any user interaction (mouse, key, touch, scroll) resets the timer
 *
 * Usage:
 *   useSessionTimeout({
 *     warningAfterMs: 25 * 60 * 1000,   // warn at 25 min
 *     signOutAfterMs: 5  * 60 * 1000,   // sign out 5 min after warning
 *     onWarn: () => setShowTimeoutModal(true),
 *     onSignOut: () => signOut(),
 *   });
 */

import { useEffect, useRef, useCallback } from 'react';

interface SessionTimeoutOptions {
  /** Milliseconds of inactivity before the warning fires. Default: 25 min */
  warningAfterMs?: number;
  /** Milliseconds after the warning before auto sign-out. Default: 5 min */
  signOutAfterMs?: number;
  /** Called when the inactivity warning threshold is reached. */
  onWarn: () => void;
  /** Called when the session should be terminated. */
  onSignOut: () => void;
  /** Set false to disable the hook entirely (e.g. for unauthenticated pages). */
  enabled?: boolean;
}

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
];

export const useSessionTimeout = ({
  warningAfterMs = 25 * 60 * 1000,
  signOutAfterMs = 5 * 60 * 1000,
  onWarn,
  onSignOut,
  enabled = true,
}: SessionTimeoutOptions): { resetTimer: () => void } => {
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warned = useRef(false);

  const clearTimers = useCallback(() => {
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (signOutTimer.current) clearTimeout(signOutTimer.current);
    warnTimer.current = null;
    signOutTimer.current = null;
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    warned.current = false;

    warnTimer.current = setTimeout(() => {
      warned.current = true;
      onWarn();
      // After warning, start the sign-out countdown
      signOutTimer.current = setTimeout(() => {
        onSignOut();
      }, signOutAfterMs);
    }, warningAfterMs);
  }, [clearTimers, onWarn, onSignOut, warningAfterMs, signOutAfterMs]);

  const handleActivity = useCallback(() => {
    // Only reset if not already in the sign-out grace period
    if (!warned.current) {
      startTimers();
    }
  }, [startTimers]);

  // Reset (call from "Stay signed in" button)
  const resetTimer = useCallback(() => {
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    if (!enabled) return;

    startTimers();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [enabled, startTimers, handleActivity, clearTimers]);

  return { resetTimer };
};
