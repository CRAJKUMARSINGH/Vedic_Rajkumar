/**
 * Breadcrumb Navigation Component
 * Provides hierarchical navigation and improves user orientation
 */

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
  lang?: 'en' | 'hi';
}

export const BreadcrumbNavigation = ({
  items = [],
  showHome = true,
  className,
  lang = 'en',
}: BreadcrumbNavigationProps) => {
  const location = useLocation();
  const pathname = location.pathname;

  // Generate breadcrumbs from current path if not provided
  const breadcrumbs = items.length > 0 
    ? items 
    : generateBreadcrumbsFromPath(pathname, lang);

  return (
    <nav 
      className={cn(
        'flex items-center space-x-2 text-sm text-muted-foreground',
        'py-3 px-4 bg-card/50 border-b border-border',
        className
      )}
      aria-label="Breadcrumb"
    >
      {showHome && (
        <>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-primary transition-colors"
            aria-label={lang === 'hi' ? 'मुखपृष्ठ' : 'Home'}
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">{lang === 'hi' ? 'मुखपृष्ठ' : 'Home'}</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
        </>
      )}

      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={item.href} className="flex items-center gap-2">
            {item.icon && (
              <span className="text-muted-foreground/70">{item.icon}</span>
            )}
            
            {isLast ? (
              <span 
                className={cn(
                  'font-medium text-foreground',
                  lang === 'hi' && 'font-hindi'
                )}
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <>
                <Link
                  to={item.href}
                  className={cn(
                    'hover:text-primary transition-colors',
                    lang === 'hi' && 'font-hindi'
                  )}
                >
                  {item.label}
                </Link>
                <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
};

// Helper function to generate breadcrumbs from path
function generateBreadcrumbsFromPath(pathname: string, lang: 'en' | 'hi'): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbMap: Record<string, { en: string; hi: string }> = {
    'career': { en: 'Career Report', hi: 'करियर रिपोर्ट' },
    'kaalsarp': { en: 'Kaal Sarp Yoga', hi: 'काल सर्प योग' },
    'comprehensive': { en: 'Comprehensive Report', hi: 'व्यापक रिपोर्ट' },
    'test': { en: 'Test', hi: 'परीक्षण' },
    'profile': { en: 'Profile', hi: 'प्रोफाइल' },
    'settings': { en: 'Settings', hi: 'सेटिंग्स' },
    'history': { en: 'History', hi: 'इतिहास' },
  };

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    
    const label = breadcrumbMap[segment] 
      ? (lang === 'hi' ? breadcrumbMap[segment].hi : breadcrumbMap[segment].en)
      : segment.charAt(0).toUpperCase() + segment.slice(1);

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

// Breadcrumb with quick actions
interface BreadcrumbWithActionsProps extends BreadcrumbNavigationProps {
  quickActions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    shortcut?: string;
  }>;
}

export const BreadcrumbWithActions = ({
  items,
  showHome = true,
  className,
  lang = 'en',
  quickActions = [],
}: BreadcrumbWithActionsProps) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <BreadcrumbNavigation 
        items={items} 
        showHome={showHome} 
        lang={lang}
      />
      
      {quickActions.length > 0 && (
        <div className="flex items-center gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5',
                'rounded-lg border border-border bg-card',
                'hover:bg-accent hover:text-accent-foreground',
                'transition-colors text-sm font-medium',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
              title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
            >
              {action.icon}
              <span className={lang === 'hi' ? 'font-hindi' : ''}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Breadcrumb with progress indicator
interface BreadcrumbWithProgressProps extends BreadcrumbNavigationProps {
  currentStep: number;
  totalSteps: number;
  showProgress?: boolean;
}

export const BreadcrumbWithProgress = ({
  items,
  showHome = true,
  className,
  lang = 'en',
  currentStep,
  totalSteps,
  showProgress = true,
}: BreadcrumbWithProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <BreadcrumbNavigation 
        items={items} 
        showHome={showHome} 
        lang={lang}
      />
      
      {showProgress && (
        <div className="px-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className={lang === 'hi' ? 'font-hindi' : ''}>
              {lang === 'hi' ? 'प्रगति' : 'Progress'}
            </span>
            <span>
              {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BreadcrumbNavigation;