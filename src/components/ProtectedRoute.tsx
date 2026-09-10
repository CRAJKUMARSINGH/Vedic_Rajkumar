/**
 * ProtectedRoute.tsx
 *
 * Wraps routes that require a signed-in Clerk user.
 * Redirects to /sign-in if the user is not authenticated.
 *
 * Usage in appRoutes.tsx:
 *   route('/my-readings', <ProtectedRoute><MyReadingsPage /></ProtectedRoute>)
 *
 * Shows a spinner while Clerk is loading (avoids flash-of-redirect).
 */

import { useUser } from '@clerk/react';
import { Navigate, useLocation } from 'react-router-dom';

const BASE = (import.meta.env.BASE_URL as string).replace(/\/$/, '');

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users. Defaults to /sign-in */
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo,
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // Clerk is still bootstrapping — show a minimal spinner to avoid flicker.
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"
          role="status"
          aria-label="Loading…"
        />
      </div>
    );
  }

  // Not authenticated — redirect and preserve the intended destination.
  if (!isSignedIn) {
    const destination = redirectTo ?? `${BASE}/sign-in`;
    return (
      <Navigate
        to={destination}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}
