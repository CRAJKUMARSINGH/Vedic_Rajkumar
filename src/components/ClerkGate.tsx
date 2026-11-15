/**
 * ClerkGate.tsx
 *
 * Demo-safe guard for routes that require Clerk.
 *
 * Providers.tsx deliberately skips <ClerkProvider> when
 * VITE_CLERK_PUBLISHABLE_KEY is unset (the documented demo/offline mode).
 * Any component that then calls a Clerk hook (useUser / useSession) or renders
 * a Clerk component (<SignIn /> / <SignUp />) throws without that provider.
 * ClerkGate renders a graceful "sign-in unavailable" notice instead, so the
 * public shell stays navigable when a deployment has not configured Clerk yet.
 *
 * ClerkGate must never call a Clerk hook itself — that is the whole point.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BASE = (import.meta.env.BASE_URL as string).replace(/\/$/, '');

/** True only when a Clerk publishable key was present at build time. */
export const isClerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

/**
 * Graceful stand-in shown when Clerk is not configured. Contains no Clerk
 * hooks, so it is safe to render in demo/offline mode.
 */
export function ClerkUnavailableNotice() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at top, #2a1200 0%, #0d0500 60%, #000 100%)' }}
    >
      <div className="relative z-10 max-w-md text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-amber-100">
          Sign-in is unavailable
        </h1>
        <p className="mt-2 text-sm text-amber-200/70">
          This feature needs a signed-in account, but authentication is not
          configured in this environment. Set{' '}
          <code className="rounded bg-amber-500/10 px-1">VITE_CLERK_PUBLISHABLE_KEY</code>{' '}
          to enable sign-in.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to={`${BASE}/`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}

interface ClerkGateProps {
  children: ReactNode;
}

export default function ClerkGate({ children }: ClerkGateProps) {
  if (!isClerkConfigured) {
    return <ClerkUnavailableNotice />;
  }
  return <>{children}</>;
}
