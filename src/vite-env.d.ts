/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EPHEMERIS_ENDPOINT?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
  readonly VITE_POSTHOG_FORCE_ENABLE?: string;
  readonly VITE_LOG_LEVEL?: string;
  readonly VITE_RELEASE_VERSION?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_USE_EDGE_API?: string;
  readonly VITE_KILL_KUNDLI?: string;
  readonly VITE_KILL_MATCH?: string;
  readonly VITE_KILL_PDF?: string;
  readonly VITE_KILL_API?: string;
  readonly VITE_KILL_TRANSITS?: string;
}
