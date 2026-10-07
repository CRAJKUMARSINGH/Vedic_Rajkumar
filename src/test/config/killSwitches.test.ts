import { describe, it, expect, afterEach } from 'vitest';
import {
  checkKillSwitch,
  KILL_SWITCHES,
  KillSwitchError,
  resetKillSwitches,
  setKillSwitch,
} from '@/config/kill-switches';

describe('kill switches', () => {
  afterEach(() => {
    resetKillSwitches();
  });

  it('allows features when not killed', async () => {
    await expect(checkKillSwitch(KILL_SWITCHES.TRANSITS)).resolves.toBe(false);
  });

  it('throws when a feature is killed', async () => {
    setKillSwitch(KILL_SWITCHES.KUNDLI_CALCULATION, true);
    await expect(checkKillSwitch(KILL_SWITCHES.KUNDLI_CALCULATION)).rejects.toBeInstanceOf(KillSwitchError);
  });
});
