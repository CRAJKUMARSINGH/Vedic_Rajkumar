/**
 * DataPrivacyPanel.tsx
 *
 * Week 3: User-facing panel for data privacy controls.
 *
 * Provides:
 *  - Export all data as JSON (calls user-data-export edge function)
 *  - Delete all data permanently (calls user-data-delete edge function)
 *    with a two-step confirmation dialog to prevent accidental deletion.
 *
 * Only shown to authenticated users. Shows a sign-in prompt otherwise.
 */

import { useState } from 'react';
import { useUser } from '@clerk/react';
import { Link } from 'react-router-dom';
import { Download, Trash2, ShieldCheck, AlertTriangle, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUserDataPrivacy } from '@/hooks/useUserDataPrivacy';
import type { DeleteResult } from '@/services/dataDeleteService';

const BASE = (import.meta.env.BASE_URL as string).replace(/\/$/, '');

interface DataPrivacyPanelProps {
  /** Optional callback fired after a successful delete. Useful for invalidating queries. */
  onDeleteSuccess?: (result: DeleteResult) => void;
}

export default function DataPrivacyPanel({ onDeleteSuccess }: DataPrivacyPanelProps) {
  const { isSignedIn, user } = useUser();
  const { toast } = useToast();
  const { isExporting, isDeleting, exportData, deleteData } = useUserDataPrivacy();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // ── Unauthenticated state ─────────────────────────────────────────────────
  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-amber-200/30 bg-card p-6 space-y-3 text-center">
        <ShieldCheck className="h-8 w-8 text-amber-500 mx-auto" />
        <h3 className="font-semibold text-foreground">Data Privacy Controls</h3>
        <p className="text-sm text-muted-foreground">
          Sign in to export or delete your personal astrology data.
        </p>
        <Button asChild size="sm" variant="outline" className="gap-2">
          <Link to={`${BASE}/sign-in`}>
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleExport() {
    try {
      await exportData();
      toast({
        title: 'Export started',
        description: 'Your data is downloading as a JSON file.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      toast({
        title: 'Export failed',
        description: msg.includes('Rate limit') ? msg : 'Please try again later.',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete() {
    setDeleteConfirmOpen(false);
    try {
      const result = await deleteData();
      if (result) {
        const total =
          (result.deleted.saved_readings ?? 0) +
          (result.deleted.prashna_sessions ?? 0) +
          (result.deleted.horoscope_analyses ?? 0) +
          (result.deleted.transit_readings ?? 0);
        toast({
          title: 'All data deleted',
          description: `Removed ${total} record${total !== 1 ? 's' : ''} from our servers.`,
        });
        onDeleteSuccess?.(result);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      toast({
        title: 'Deletion failed',
        description: msg.includes('Rate limit') ? msg : 'Please try again later.',
        variant: 'destructive',
      });
    }
  }

  // ── Authenticated view ────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl border border-amber-200/30 bg-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-amber-600" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Data Privacy</h3>
          <p className="text-xs text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress ?? user?.firstName ?? 'Your account'}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        Under GDPR / DPDP you have the right to access and delete your personal data stored
        on our servers. Your birth details and readings are yours.
      </p>

      {/* Actions */}
      <div className="space-y-3">
        {/* Export */}
        <div className="flex items-start gap-4 rounded-xl border border-border/50 p-4">
          <Download
            className="h-5 w-5 text-blue-500 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Export my data</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Download all your saved readings, Prashna sessions, and profile
              as a JSON file. Rate-limited to 5 exports per hour.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5"
            onClick={handleExport}
            disabled={isExporting}
            aria-label="Export my data as JSON"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Export
              </>
            )}
          </Button>
        </div>

        {/* Delete — two-step confirmation */}
        <div className="flex items-start gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle
            className="h-5 w-5 text-destructive mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Delete all my data</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently removes all readings, analyses, and your profile from our
              servers. <strong className="text-foreground">This cannot be undone.</strong>
            </p>
          </div>

          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="shrink-0 gap-1.5"
                disabled={isDeleting}
                aria-label="Delete all my data"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </>
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Delete all data permanently?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <span className="block">
                    This will permanently delete all of your personal data from our servers,
                    including:
                  </span>
                  <ul className="list-disc list-inside text-sm space-y-1 text-foreground">
                    <li>Saved readings and birth charts</li>
                    <li>Prashna sessions</li>
                    <li>Horoscope analyses</li>
                    <li>Transit readings</li>
                    <li>Your profile information</li>
                  </ul>
                  <span className="block font-semibold text-destructive">
                    This action cannot be undone. Consider exporting your data first.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Rate limit notice */}
      <p className="text-xs text-muted-foreground/70 text-center">
        Export: 5 requests/hour · Delete: 3 requests/day
      </p>
    </div>
  );
}
