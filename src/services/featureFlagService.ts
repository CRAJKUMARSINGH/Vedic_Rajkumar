/**
 * Feature Flag Service - Phase 6: ROLLBACK SYSTEM
 * TRI-HYBRID MERGE v4.0 - Vedic_Rajkumar
 *
 * Three-layer rollback protection:
 *   Layer 1 - Feature flags  (instant toggle, no redeploy)
 *   Layer 2 - Version fallback (snapshot restore)
 *   Layer 3 - Safe deploy    (gradual rollout + auto-revert)
 */

import { FLAG_SCHEMA } from '../config/flags/schema';

export type FlagValue = boolean | string | number;

export interface FlagSnapshot {
  version: string;
  timestamp: string;
  flags: Record<string, FlagValue>;
  label: string;
}

export interface RollbackResult {
  success: boolean;
  restoredVersion: string;
  flagsRestored: number;
  message: string;
}

const STORAGE_KEY = 'vr_feature_flags';
const SNAPSHOTS_KEY = 'vr_flag_snapshots';
const ROLLBACK_LOG_KEY = 'vr_rollback_log';
const MAX_SNAPSHOTS = 10;

class FeatureFlagService {
  private flags: Record<string, FlagValue>;
  private snapshots: FlagSnapshot[];
  private rollbackLog: string[];

  constructor() {
    this.flags = this.buildDefaults();
    this.snapshots = [];
    this.rollbackLog = [];
    this.loadFromStorage();
  }

  private buildDefaults(): Record<string, FlagValue> {
    const d: Record<string, FlagValue> = {};
    for (const [k, def] of Object.entries(FLAG_SCHEMA)) d[k] = def.default;
    return d;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, FlagValue>;
        for (const key of Object.keys(FLAG_SCHEMA)) {
          if (key in parsed) this.flags[key] = parsed[key];
        }
      }
      const snaps = localStorage.getItem(SNAPSHOTS_KEY);
      if (snaps) this.snapshots = JSON.parse(snaps) as FlagSnapshot[];
      const log = localStorage.getItem(ROLLBACK_LOG_KEY);
      if (log) this.rollbackLog = JSON.parse(log) as string[];
    } catch (e) {
      console.warn('[FeatureFlags] Storage load failed - using defaults', e);
      this.flags = this.buildDefaults();
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.flags));
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(this.snapshots));
      localStorage.setItem(ROLLBACK_LOG_KEY, JSON.stringify(this.rollbackLog));
    } catch (e) {
      console.warn('[FeatureFlags] Persist failed', e);
    }
  }

  private addLog(message: string): void {
    const entry = '[' + new Date().toISOString() + '] ' + message;
    this.rollbackLog.unshift(entry);
    if (this.rollbackLog.length > 100) this.rollbackLog = this.rollbackLog.slice(0, 100);
  }

  private hashUser(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // CORE API

  get(flagName: string, userId?: string): FlagValue {
    if (!(flagName in FLAG_SCHEMA)) {
      console.warn('[FeatureFlags] Unknown flag: ' + flagName);
      return false;
    }
    const value = this.flags[flagName];
    if (flagName === 'ROLLOUT_PERCENT' && userId) {
      return this.hashUser(userId) % 100 < (value as number);
    }
    return value;
  }

  isEnabled(flagName: string, userId?: string): boolean {
    return !!this.get(flagName, userId);
  }

  set(flagName: string, value: FlagValue): boolean {
    const schema = FLAG_SCHEMA[flagName];
    if (!schema) {
      console.error('[FeatureFlags] Unknown flag: ' + flagName);
      return false;
    }
    if (schema.type === 'boolean' && typeof value !== 'boolean') {
      console.error('[FeatureFlags] ' + flagName + ' expects boolean');
      return false;
    }
    if (schema.type === 'enum' && !schema.values?.includes(value as string)) {
      console.error('[FeatureFlags] ' + flagName + ' invalid enum value: ' + value);
      return false;
    }
    if (schema.type === 'number' && typeof value !== 'number') {
      console.error('[FeatureFlags] ' + flagName + ' expects number');
      return false;
    }
    if (flagName === 'BEHAVIOR_WEIGHT' && (value as number) > 0.3) {
      value = 0.3;
    }
    this.flags[flagName] = value;
    this.persist();
    this.addLog('SET ' + flagName + '=' + JSON.stringify(value));
    return true;
  }

  getAll(): Record<string, FlagValue> {
    return { ...this.flags };
  }

  reset(): void {
    this.flags = this.buildDefaults();
    this.persist();
    this.addLog('RESET all flags to defaults');
  }

  // LAYER 1: Instant Feature Toggle

  disableFeature(flagName: string): boolean {
    const schema = FLAG_SCHEMA[flagName];
    if (!schema) return false;
    if (schema.type === 'boolean') {
      this.set(flagName, false);
      this.addLog('ROLLBACK(flag) disabled: ' + flagName);
      return true;
    }
    if (schema.type === 'enum' && schema.values) {
      this.set(flagName, schema.values[0]);
      this.addLog('ROLLBACK(flag) reset: ' + flagName + '=' + schema.values[0]);
      return true;
    }
    return false;
  }

  emergencyRollbackToBase(): void {
    this.addLog('EMERGENCY ROLLBACK - disabling all non-BASE features');
    for (const [key, def] of Object.entries(FLAG_SCHEMA)) {
      if (def.source !== 'BASE') {
        if (def.type === 'boolean') this.flags[key] = false;
        else if (def.type === 'enum' && def.values) this.flags[key] = def.values[0];
        else this.flags[key] = def.default;
      }
    }
    this.persist();
    this.addLog('EMERGENCY ROLLBACK complete - BASE behaviour restored');
    console.warn('[FeatureFlags] Emergency rollback executed - all new features disabled');
  }

  // LAYER 2: Version Snapshot & Restore

  saveSnapshot(label: string): FlagSnapshot {
    const snapshot: FlagSnapshot = {
      version: 'v' + Date.now(),
      timestamp: new Date().toISOString(),
      flags: { ...this.flags },
      label,
    };
    this.snapshots.unshift(snapshot);
    if (this.snapshots.length > MAX_SNAPSHOTS)
      this.snapshots = this.snapshots.slice(0, MAX_SNAPSHOTS);
    this.persist();
    this.addLog('SNAPSHOT saved: ' + label + ' (' + snapshot.version + ')');
    return snapshot;
  }

  restoreSnapshot(version: string): RollbackResult {
    let target: FlagSnapshot | undefined;
    if (version === 'latest') target = this.snapshots[0];
    else if (version === 'previous') target = this.snapshots[1];
    else target = this.snapshots.find(s => s.version === version);

    if (!target) {
      return {
        success: false,
        restoredVersion: '',
        flagsRestored: 0,
        message:
          'Snapshot not found: ' +
          version +
          '. Available: ' +
          this.snapshots.map(s => s.version).join(', '),
      };
    }

    const before = { ...this.flags };
    this.flags = { ...this.buildDefaults(), ...target.flags };
    this.persist();
    const changed = Object.keys(this.flags).filter(
      k => JSON.stringify(this.flags[k]) !== JSON.stringify(before[k])
    ).length;
    this.addLog(
      'ROLLBACK(snapshot) restored: ' +
        target.label +
        ' (' +
        target.version +
        '), ' +
        changed +
        ' flags changed'
    );

    return {
      success: true,
      restoredVersion: target.version,
      flagsRestored: changed,
      message:
        'Restored "' +
        target.label +
        '" from ' +
        target.timestamp +
        '. ' +
        changed +
        ' flag(s) changed.',
    };
  }

  listSnapshots(): FlagSnapshot[] {
    return [...this.snapshots];
  }

  // LAYER 3: Safe Deploy - Gradual Rollout

  startGradualRollout(featureFlag: string, initialPercent = 10): void {
    this.saveSnapshot('before-rollout-' + featureFlag);
    this.set('ROLLOUT_PERCENT', initialPercent);
    this.set(featureFlag, true);
    this.addLog('ROLLOUT started: ' + featureFlag + ' at ' + initialPercent + '%');
  }

  advanceRollout(percent: number): void {
    const capped = Math.min(100, Math.max(0, percent));
    this.set('ROLLOUT_PERCENT', capped);
    this.addLog('ROLLOUT advanced to ' + capped + '%');
  }

  isInRollout(userId: string): boolean {
    return this.hashUser(userId) % 100 < (this.flags['ROLLOUT_PERCENT'] as number);
  }

  // Audit Log

  getLog(): string[] {
    return [...this.rollbackLog];
  }
  clearLog(): void {
    this.rollbackLog = [];
    this.persist();
  }
}

export const featureFlags = new FeatureFlagService();

export function rollbackToBase(): void {
  featureFlags.emergencyRollbackToBase();
}
export function snapshotFlags(label: string): FlagSnapshot {
  return featureFlags.saveSnapshot(label);
}
export function restoreFlags(version: string): RollbackResult {
  return featureFlags.restoreSnapshot(version);
}

export { FeatureFlagService };
