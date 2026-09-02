/**
 * Mobile Navigation Component
 * Touch-friendly navigation optimized for mobile devices
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  CircleHelp,
  HeartHandshake,
  Home,
  ScrollText,
  History,
  Menu,
  X,
  UserCircle,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BOTTOM_BAR_NAV_LINKS,
  MOBILE_SHEET_NAV_LINKS,
  type NavLink,
} from '@/routes/featureRegistry';

const DRAWER_NAV_ITEMS = MOBILE_SHEET_NAV_LINKS.filter(item => !item.isSectionHeader);

const iconByPath = {
  '/': Home,
  '/horoscope': Star,
  '/prashna': CircleHelp,
  '/matchmaking': HeartHandshake,
  '/panchang': CalendarDays,
  '/prashna-history': History,
  '/my-readings': ScrollText,
} satisfies Record<string, typeof Home>;

function getIcon(item: NavLink) {
  return iconByPath[item.href as keyof typeof iconByPath] ?? UserCircle;
}

function getLabel(item: NavLink, lang: 'en' | 'hi') {
  return lang === 'hi' ? item.labelHi : item.label;
}

interface MobileNavigationProps {
  lang?: 'en' | 'hi';
  className?: string;
}

export const MobileNavigation = ({ lang = 'en', className }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const pathIsActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.mobile-nav') && !target.closest('.mobile-nav-toggle')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Floating menu button */}
      <button
        className={cn(
          'fixed bottom-20 right-4 z-50 md:hidden',
          'bg-primary text-primary-foreground rounded-full p-3 shadow-2xl',
          'flex items-center justify-center',
          'transition-all duration-200 hover:scale-110 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={lang === 'hi' ? 'मेनू खोलें' : 'Open menu'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className={cn(
              'fixed inset-y-0 right-0 w-72 bg-card shadow-2xl',
              'transform transition-transform duration-300 ease-in-out',
              isOpen ? 'translate-x-0' : 'translate-x-full'
            )}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Drawer header */}
              <div className="p-5 border-b border-border bg-gradient-to-r from-[#8B0000]/20 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🪔</span>
                    <h2 className="text-base font-bold text-foreground">
                      {lang === 'hi' ? 'वैदिक राजकुमार' : 'Vedic Rajkumar'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label={lang === 'hi' ? 'मेनू बंद करें' : 'Close menu'}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Drawer nav items */}
              <nav className="flex-1 overflow-y-auto p-3">
                <ul className="space-y-1">
                  {DRAWER_NAV_ITEMS.map(item => {
                    const Icon = getIcon(item);
                    return (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm',
                            'hover:bg-accent hover:text-accent-foreground',
                            pathIsActive(item.href)
                              ? 'bg-accent text-accent-foreground font-semibold'
                              : 'text-muted-foreground'
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{getLabel(item, lang)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* User footer */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {lang === 'hi' ? 'उपयोगकर्ता प्रोफ़ाइल' : 'User Profile'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lang === 'hi' ? 'स्वागत है!' : 'Welcome!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around py-1.5">
          {BOTTOM_BAR_NAV_LINKS.map(item => {
            const Icon = getIcon(item);
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center px-2 py-1.5 flex-1 min-w-0',
                  'transition-colors hover:bg-accent rounded-lg',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5 mb-0.5', active && 'text-primary')} />
                <span
                  className={cn(
                    'text-[10px] truncate w-full text-center',
                    active ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  {getLabel(item, lang)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const BottomNavigation = ({ lang = 'en' }: { lang?: 'en' | 'hi' }) => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-30">
      <div className="flex items-center justify-around py-2">
        {BOTTOM_BAR_NAV_LINKS.map(item => {
          const Icon = getIcon(item);
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2',
                'transition-colors hover:bg-accent/50 rounded-lg mx-1',
                active && 'text-primary'
              )}
            >
              <Icon
                className={cn('h-5 w-5 mb-1', active ? 'text-primary' : 'text-muted-foreground')}
              />
              <span
                className={cn(
                  'text-xs',
                  active ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                {getLabel(item, lang)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export const MobileHeader = ({
  title,
  lang = 'en',
  onMenuClick,
}: {
  title: string;
  lang?: 'en' | 'hi';
  onMenuClick?: () => void;
}) => {
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-accent rounded-lg"
          aria-label={lang === 'hi' ? 'मेनू खोलें' : 'Open menu'}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="w-10" />
      </div>
    </header>
  );
};

export default MobileNavigation;
