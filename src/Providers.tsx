/**
 * Providers.tsx
 *
 * Composes all top-level React context providers in one place.
 * App.tsx stays thin — it just renders <Providers><AppShell /></Providers>.
 *
 * Provider order (outermost → innermost):
 *   HelmetProvider → QueryClientProvider → TooltipProvider
 *     → ErrorBoundary → BrowserRouter → ClerkProviderWithNavigate
 */

import { useEffect, useRef } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ClerkProvider, useClerk } from '@clerk/react';
import { shadcn } from '@clerk/themes';
import ErrorBoundary from '@/components/ErrorBoundary';

// ─── QueryClient singleton ────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes
      gcTime: 30 * 60 * 1000,     // 30 minutes
      retry: 1,
    },
  },
});

// ─── Clerk config ─────────────────────────────────────────────────────────────

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const basePath = (import.meta.env.BASE_URL as string).replace(/\/$/, '');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  variables: {
    colorPrimary: '#c8860a',
    colorForeground: '#f5e6c8',
    colorBackground: '#1a0a00',
    fontFamily: "'Crimson Pro', Georgia, serif",
  },
};

// ─── Clerk ↔ React Query cache invalidator ────────────────────────────────────

/**
 * Renderless component — listens for Clerk auth state changes and clears
 * the React Query cache whenever the signed-in user changes.
 */
function ClerkQueryCacheInvalidator() {
  const { addListener } = useClerk();
  const qClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qClient]);

  return null;
}

// ─── Clerk provider (must be inside BrowserRouter to call useNavigate) ───────

function ClerkProviderWithNavigate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // If no Clerk key is configured (dev / demo mode), skip Clerk entirely
  if (!publishableKey) {
    return <>{children}</>;
  }

  const routerPush = (to: string) =>
    navigate(to.startsWith(basePath) ? to.slice(basePath.length) || '/' : to);

  const routerReplace = (to: string) =>
    navigate(to.startsWith(basePath) ? to.slice(basePath.length) || '/' : to, { replace: true });

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={routerPush}
      routerReplace={routerReplace}
    >
      <ClerkQueryCacheInvalidator />
      {children}
    </ClerkProvider>
  );
}

// ─── Root Providers component ─────────────────────────────────────────────────

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* Sonner toast container — sibling to children, not a wrapper */}
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter>
              <ClerkProviderWithNavigate>
                {children}
              </ClerkProviderWithNavigate>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
