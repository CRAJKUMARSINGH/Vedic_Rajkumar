/**
 * BetaRedeemPage — /beta
 *
 * The UI half of the beta trial plumbing. The database (public.claim_beta_invite)
 * and the `redeem-invite` edge function are the authority; this page only hands
 * the invite code to that function and renders the outcome.
 *
 * Confidentiality (AGENTS.md): the invite code is a bearer secret. It is sent
 * once, never stored, logged or echoed back.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '@clerk/react';
import { KeyRound, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase';
import { redeemBetaInvite, type RedeemResult } from '@/services/betaTrialService';
import { setServerTier } from '@/features/tier/resolveTier';

const MESSAGES: Record<RedeemResult['outcome'], string> = {
  ok: 'Your 7-day beta trial is active.',
  avoid_dup: 'You already have an active beta trial.',
  already_redeemed: 'This invite has already been redeemed.',
  email_mismatch: 'This invite was issued to a different email address than the one you signed in with.',
  not_found: 'That invite code was not recognised.',
  invalid_code: 'Enter the full invite code — it is at least 8 characters.',
  error: 'Something went wrong. Please try again.',
};

const isGranted = (outcome: RedeemResult['outcome']): boolean =>
  outcome === 'ok' || outcome === 'avoid_dup';

const BetaRedeemPage = () => {
  const supabase = useAuthenticatedSupabase();
  const { session } = useSession();
  const isSignedIn = !!session?.user;

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSignedIn || busy) return;

    if (code.trim().length < 8) {
      setResult({ outcome: 'invalid_code' });
      return;
    }

    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await redeemBetaInvite(supabase, code);
      setResult(res);
      // Mirror the server grant (`user_entitlements.tier='pro'`, source beta_trial)
      // so the trial is visible without a reload. The server stays the authority —
      // the expiry here is what the server just returned for this redemption.
      if (isGranted(res.outcome)) {
        setServerTier('pro', { source: 'beta_trial', expiresAt: res.expiresAt ?? null });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const granted = result ? isGranted(result.outcome) : false;

  return (
    <main className="mx-auto max-w-xl px-4 py-8 space-y-5">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <KeyRound className="h-6 w-6 text-primary" aria-hidden />
          Redeem your beta invite
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the invite code from your beta invitation to start a 7-day trial of
          Vedic Rajkumar Pro. One code per person.
        </p>
      </header>

      {!isSignedIn && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300/40 bg-amber-50/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Please{' '}
            <Link to="/sign-in" className="underline underline-offset-2 hover:text-foreground transition">
              sign in
            </Link>{' '}
            or{' '}
            <Link to="/sign-up" className="underline underline-offset-2 hover:text-foreground transition">
              create an account
            </Link>{' '}
            first — the trial is tied to your account.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border bg-card p-5">
        <label htmlFor="invite-code" className="text-sm font-medium">
          Invite code
        </label>
        <input
          id="invite-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={!isSignedIn || busy}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="e.g. VR-BETA-XXXXXXXX"
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground transition disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!isSignedIn || busy || code.trim().length < 8}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Redeeming…
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" aria-hidden />
              Redeem invite
            </>
          )}
        </button>
      </form>

      {result && (
        <div
          role="status"
          className={[
            'flex items-start gap-2 rounded-lg border p-3 text-sm',
            granted
              ? 'border-green-500/30 bg-green-50/10 text-green-700 dark:text-green-300'
              : 'border-destructive/30 bg-destructive/10 text-destructive',
          ].join(' ')}
        >
          {granted ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          <span>
            {MESSAGES[result.outcome]}
            {granted && result.expiresAt && (
              <>
                {' '}
                Trial ends on{' '}
                <strong>{new Date(result.expiresAt).toLocaleDateString()}</strong>.
              </>
            )}
            {granted && (
              <>
                {' '}
                <Link to="/app" className="underline underline-offset-2 hover:text-foreground transition">
                  Go to the app
                </Link>
                .
              </>
            )}
          </span>
        </div>
      )}

      {error && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Trouble redeeming? Email{' '}
        <a href="mailto:beta@vedic-rajkumar.com" className="underline underline-offset-2 hover:text-foreground transition">
          beta@vedic-rajkumar.com
        </a>
        . Codes expire if unused and cannot be shared.
      </p>
    </main>
  );
};

export default BetaRedeemPage;
