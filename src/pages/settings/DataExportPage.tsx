/**
 * DataExportPage — /settings/data (Week 5 upgrade)
 *
 * Standalone settings page providing:
 *   1. Consent status summary (read from useConsent)
 *   2. Self-service JSON export (GDPR Article 20 / DPDP Act 2023)
 *   3. Permanent data deletion with multi-step confirmation
 *
 * This page is accessible at /settings/data and /settings/privacy
 * (both route aliases defined in routes/index.tsx).
 *
 * For the full-featured PrivacySettingsPage (with deeper UI) see:
 *   src/pages/PrivacySettingsPage.tsx
 */

import React, { useState } from 'react';
import { useSession } from '@clerk/react';
import { Download, Trash2, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase';
import { useConsent } from '@/hooks/useConsent';
import { exportAndDownloadUserData } from '@/services/dataExportService';
import { deleteUserData, type DeleteResult } from '@/services/dataDeleteService';
import { audit } from '@/services/auditService';

// ─── Delete confirmation text ─────────────────────────────────────────────────
const DELETE_CONFIRM_TEXT = 'DELETE';

// ─── Consent Status Card ──────────────────────────────────────────────────────

const ConsentCard: React.FC = () => {
  const { hasConsented, hasDismissed, consentRecord, clearConsent } = useConsent();

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="font-semibold text-base">Consent Status</h2>
      </div>

      {!hasDismissed ? (
        <p className="text-sm text-muted-foreground">
          No consent decision recorded yet. Your choices are stored locally on this device.
        </p>
      ) : (
        <div className="space-y-1 text-sm">
          <p>
            Status:{' '}
            <span className={hasConsented ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
              {hasConsented ? 'Accepted' : 'Declined'}
            </span>
          </p>
          {consentRecord?.timestamp && (
            <p className="text-muted-foreground">
              Recorded: {new Date(consentRecord.timestamp).toLocaleString()}
            </p>
          )}
          {consentRecord?.version && (
            <p className="text-muted-foreground">Policy version: {consentRecord.version}</p>
          )}
        </div>
      )}

      <button
        onClick={clearConsent}
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition"
        aria-label="Reset consent preferences"
      >
        Reset consent preferences
      </button>
    </section>
  );
};

// ─── Export Card ──────────────────────────────────────────────────────────────

const ExportCard: React.FC = () => {
  const supabase = useAuthenticatedSupabase();
  const { session } = useSession();
  const isSignedIn = !!session?.user;

  const [exporting, setExporting] = useState(false);
  const [exportedAt, setExportedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setExportedAt(null);
    try {
      await exportAndDownloadUserData(supabase);
      await audit.logDataExport();
      setExportedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="font-semibold text-base">Export Your Data</h2>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Download a copy of all your birth charts, profiles, and consultation history in
        JSON format. Your right to data portability under{' '}
        <strong>GDPR Article 20</strong> and the{' '}
        <strong>India DPDP Act 2023</strong>.
      </p>

      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
        <li>All birth charts and family profiles</li>
        <li>Prashna and horoscope analyses</li>
        <li>Transit readings and consultation notes</li>
        <li>Account activity (last 500 events)</li>
        <li>Consent history and export metadata</li>
      </ul>

      {!isSignedIn && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300/40 bg-amber-50/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>Sign in to export your stored data.</span>
        </div>
      )}

      {exportedAt && (
        <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-50/10 p-3 text-sm text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>
            Export downloaded at {new Date(exportedAt).toLocaleTimeString()}.
            Check your downloads folder.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={!isSignedIn || exporting}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Preparing export…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" aria-hidden />
            Download My Data (JSON)
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground">
        Rate limit: 5 exports per hour. Large exports may take a few seconds.
      </p>
    </section>
  );
};

// ─── Delete Card ──────────────────────────────────────────────────────────────

const DeleteCard: React.FC = () => {
  const supabase = useAuthenticatedSupabase();
  const { session } = useSession();
  const isSignedIn = !!session?.user;

  const [ackIrreversible, setAckIrreversible] = useState(false);
  const [ackExported, setAckExported] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<DeleteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typedOk = typed.trim().toUpperCase() === DELETE_CONFIRM_TEXT;
  const canSubmit = isSignedIn && ackIrreversible && ackExported && typedOk && !deleting;

  const handleDelete = async () => {
    if (!canSubmit) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteUserData(supabase);
      await audit.log('delete', 'profile');
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deletion failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (result) {
    return (
      <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" aria-hidden />
          <h2 className="font-semibold text-base">Data Deleted</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Your data was permanently deleted at{' '}
          {new Date(result.deletedAt).toLocaleString()}.
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
          {Object.entries(result.deleted).map(([key, count]) => (
            <li key={key}>
              {key.replace(/_/g, ' ')}: <span className="font-medium">{count}</span> record{count !== 1 ? 's' : ''} removed
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-destructive/30 bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Trash2 className="h-5 w-5 text-destructive" aria-hidden />
        <h2 className="font-semibold text-base text-destructive">Delete All My Data</h2>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Permanently remove every record stored on your behalf. This action{' '}
        <strong>cannot be undone</strong>. Export your data first if you want to keep anything.
      </p>

      <div className="space-y-3">
        {/* Checkbox 1 */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ackIrreversible}
            onChange={(e) => setAckIrreversible(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border"
            aria-label="I understand this action is irreversible"
          />
          <span className="text-sm leading-snug">
            I understand this action is <strong>permanent and irreversible</strong>.
          </span>
        </label>

        {/* Checkbox 2 */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ackExported}
            onChange={(e) => setAckExported(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border"
            aria-label="I have exported any data I want to keep"
          />
          <span className="text-sm leading-snug">
            I have exported any data I want to keep, or I do not wish to keep it.
          </span>
        </label>

        {/* Type DELETE */}
        <div className="space-y-1.5">
          <label htmlFor="delete-confirm" className="text-sm font-medium">
            Type <span className="font-mono text-destructive">{DELETE_CONFIRM_TEXT}</span> to confirm:
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={!ackIrreversible || !ackExported}
            placeholder={ackIrreversible && ackExported ? DELETE_CONFIRM_TEXT : 'Tick checkboxes above first'}
            autoComplete="off"
            className={[
              'w-full rounded-md border px-3 py-2 text-sm font-mono transition',
              'bg-background text-foreground placeholder:text-muted-foreground',
              'disabled:opacity-40',
              typedOk
                ? 'border-destructive ring-1 ring-destructive/40'
                : 'border-border',
            ].join(' ')}
          />
        </div>
      </div>

      {!isSignedIn && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300/40 bg-amber-50/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>Sign in to delete your stored data.</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleDelete}
        disabled={!canSubmit}
        className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-40 hover:bg-destructive/90 transition"
      >
        {deleting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Deleting…
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4" aria-hidden />
            Permanently Delete My Data
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground">
        Need help? Email{' '}
        <a href="mailto:privacy@vedic-rajkumar.com" className="underline underline-offset-2 hover:text-foreground transition">
          privacy@vedic-rajkumar.com
        </a>
      </p>
    </section>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const DataExportPage: React.FC = () => (
  <main className="mx-auto max-w-xl px-4 py-8 space-y-5">
    <header className="space-y-1">
      <h1 className="text-2xl font-bold">Privacy & Data</h1>
      <p className="text-sm text-muted-foreground">
        Manage your consent, download your data, or permanently delete your account information.
      </p>
    </header>

    <ConsentCard />
    <ExportCard />
    <DeleteCard />
  </main>
);

export default DataExportPage;
