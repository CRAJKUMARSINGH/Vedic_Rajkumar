/**
 * PageLoader — fullscreen animated loading fallback used by App.tsx Suspense.
 */

import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <motion.div
          className="text-4xl"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          ☀
        </motion.div>
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Loading…
        </p>
      </div>
    </div>
  );
}
