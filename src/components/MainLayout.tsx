import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import MobileNavigation from './MobileNavigation';
import { darkModeService } from '@/services/darkModeService';
import { type SupportedLanguage } from '@/services/multiLanguageService';

const KeyboardShortcuts = lazy(() => import('./KeyboardShortcuts'));
const FeedbackWidget = lazy(() => import('./FeedbackWidget'));
const PerformanceMonitor = lazy(() => import('./PerformanceMonitor'));

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [lang, setLang] = useState<SupportedLanguage>('en');

  // Both "/" (marketing landing) and "/app" (chart workspace) are self-contained
  // — they manage their own headers and layout, so skip the global nav shell.
  const isLandingPage = location.pathname === '/' || location.pathname === '/app';

  const handleLangToggle = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  useEffect(() => {
    // Keep dark mode service in sync with system/user preference
    const handleThemeChange = () => {
      darkModeService.isDarkMode(); // read to keep service active
    };
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-foreground transition-colors duration-300">
        <main>{children}</main>

        <Suspense fallback={null}>{import.meta.env.DEV && <PerformanceMonitor />}</Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-auspicious-pattern text-foreground transition-colors duration-300">
      <Navigation lang={lang === 'hi' ? 'hi' : 'en'} onLangToggle={handleLangToggle} />

      <main className="flex-1">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <BreadcrumbNavigation lang={lang === 'hi' ? 'hi' : 'en'} />
          {children}
        </div>
      </main>

      {/* Global Overlays */}
      <Suspense fallback={null}>
        <MobileNavigation lang={lang === 'hi' ? 'hi' : 'en'} />
        <KeyboardShortcuts />
        <FeedbackWidget />
        {import.meta.env.DEV && <PerformanceMonitor />}
      </Suspense>
    </div>
  );
}
