/**
 * Mobile Navigation Component
 * Touch-friendly navigation optimized for mobile devices
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Settings, 
  History, 
  BarChart3,
  Menu,
  X,
  BarChart,
  UserCircle,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Home as HomeIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  lang?: 'en' | 'hi';
  className?: string;
}

export const MobileNavigation = ({ 
  lang = 'en', 
  className 
}: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const location = useLocation();

  const navItems = [
    { 
      id: 'home', 
      label: { en: 'Home', hi: 'होम' }, 
      icon: <HomeIcon className="h-5 w-5" />, 
      path: '/'
    },
    { 
      id: 'reports', 
      label: { en: 'Reports', hi: 'रिपोर्ट्स' }, 
      icon: <BarChart className="h-5 w-5" />, 
      path: '/reports' 
    },
    { 
      id: 'profile', 
      label: { en: 'Profile', hi: 'प्रोफ़ाइल' }, 
      icon: <UserCircle className="h-5 w-5" />, 
      path: '/profile' 
    },
    { 
      id: 'history', 
      label: { en: 'History', hi: 'इतिहास' }, 
      icon: <HistoryIcon className="h-5 w-5" />, 
      path: '/history' 
    },
    { 
      id: 'settings', 
      label: { en: 'Settings', hi: 'सेटिंग्स' }, 
      icon: <SettingsIcon className="h-5 w-5" />, 
      path: '/settings' 
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close menu when clicking outside
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

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <button
        className={cn(
          "fixed bottom-6 right-6 z-50 md:hidden",
          "bg-primary text-primary-foreground rounded-full p-4 shadow-2xl",
          "flex items-center justify-center",
          "transition-transform hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "transition-all duration-200"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={lang === 'hi' ? 'मेनू खोलें' : 'Open menu'}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
          <div 
            className={cn(
              "fixed inset-y-0 right-0 w-64 bg-card shadow-2xl transform transition-transform duration-300 ease-in-out",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    {lang === 'hi' ? 'नेविगेशन' : 'Navigation'}
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label={lang === 'hi' ? 'मेनू बंद करें' : 'Close menu'}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive(item.path) 
                              ? "bg-accent text-accent-foreground" 
                              : "text-muted-foreground"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">
                            {item.label[lang]}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* User Profile */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">User Profile</p>
                    <p className="text-sm text-muted-foreground">
                      {lang === 'hi' ? 'स्वागत है!' : 'Welcome!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar (for mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center p-2 flex-1",
                  "transition-colors hover:bg-accent rounded-lg",
                  isActive && "text-primary"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 mb-1",
                  isActive && "text-primary"
                )} />
                <span className={cn(
                  "text-xs",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {item.label[lang]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

// Bottom Navigation Bar Component
export const BottomNavigation = ({ lang = 'en' }: { lang?: 'en' | 'hi' }) => {
  const location = useLocation();
  
  const navItems = [
    { 
      id: 'home', 
      label: { en: 'Home', hi: 'होम' }, 
      icon: HomeIcon, 
      path: '/' 
    },
    { 
      id: 'reports', 
      label: { en: 'Reports', hi: 'रिपोर्ट्स' }, 
      icon: BarChart, 
      path: '/reports' 
    },
    { 
      id: 'profile', 
      label: { en: 'Profile', hi: 'प्रोफ़ाइल' }, 
      icon: UserCircle, 
      path: '/profile' 
    },
    { 
      id: 'history', 
      label: { en: 'History', hi: 'इतिहास' }, 
      icon: HistoryIcon, 
      path: '/history' 
    },
    { 
      id: 'settings', 
      label: { en: 'Settings', hi: 'सेटिंग्स' }, 
      icon: SettingsIcon, 
      path: '/settings' 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-30">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2",
                "transition-colors hover:bg-accent/50 rounded-lg mx-1",
                isActive && "text-primary"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.label[lang]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Mobile Header Component
export const MobileHeader = ({ 
  title, 
  lang = 'en',
  onMenuClick 
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
        
        <h1 className="text-lg font-semibold">
          {title}
        </h1>
        
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>
    </header>
  );
};

export default MobileNavigation;