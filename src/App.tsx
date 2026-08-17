/**
/**
 * App.tsx — application root.
 *
 * This file is intentionally thin:
 *   - Registers the service worker on mount
 *   - Composes Providers (all context) + MainLayout + lazy routes + page transitions
 *
 * Route definitions  → src/routes/index.tsx
 * Provider hierarchy → src/Providers.tsx
 * Feature types      → src/features/{feature}/types.ts
 */

import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Providers from '@/Providers';
import MainLayout from '@/components/MainLayout';
import { routes } from '@/routes';
import { registerServiceWorker, setupConnectionListeners } from '@/utils/serviceWorkerRegistration';

// ─── Page transition config ───────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// ─── Loading fallback ─────────────────────────────────────────────────────────

const PageLoader = lazy(() => import('@/components/PageLoader'));

// ─── Animated route outlet ────────────────────────────────────────────────────

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  useEffect(() => {
    registerServiceWorker();
    setupConnectionListeners();
  }, []);

  return (
    <Providers>
      <MainLayout>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </MainLayout>
    </Providers>
  );
}
