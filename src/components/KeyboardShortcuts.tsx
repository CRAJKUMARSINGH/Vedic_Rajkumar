/**
 * Keyboard Shortcuts Component
 * Provides keyboard navigation for power users
 */

import { useEffect, useState } from 'react';
import { Keyboard, Search, Save, RefreshCw, Home, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Shortcut {
  key: string;
  description: string;
  descriptionHi: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'actions' | 'forms' | 'system';
}

interface KeyboardShortcutsProps {
  lang?: 'en' | 'hi';
  showHelp?: boolean;
  className?: string;
}

export const KeyboardShortcuts = ({
  lang = 'en',
  showHelp = true,
  className,
}: KeyboardShortcutsProps) => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [activeShortcuts, setActiveShortcuts] = useState<Shortcut[]>([]);
  const { toast } = useToast();

  // Default shortcuts
  const defaultShortcuts: Shortcut[] = [
    {
      key: 'Ctrl + /',
      description: 'Show keyboard shortcuts',
      descriptionHi: 'कीबोर्ड शॉर्टकट दिखाएं',
      icon: <Keyboard className="h-4 w-4" />,
      action: () => setIsHelpVisible(!isHelpVisible),
      category: 'system',
    },
    {
      key: 'Ctrl + S',
      description: 'Save current reading',
      descriptionHi: 'वर्तमान रीडिंग सहेजें',
      icon: <Save className="h-4 w-4" />,
      action: () => {
        const saveButton = document.querySelector('[data-action="save"]');
        if (saveButton instanceof HTMLElement) {
          saveButton.click();
        }
        toast({
          title: lang === 'hi' ? '✅ सहेजा गया' : '✅ Saved',
          description: lang === 'hi' ? 'रीडिंग सहेजी गई' : 'Reading saved',
        });
      },
      category: 'actions',
    },
    {
      key: 'Ctrl + R',
      description: 'Refresh transits',
      descriptionHi: 'गोचर ताज़ा करें',
      icon: <RefreshCw className="h-4 w-4" />,
      action: () => {
        const refreshButton = document.querySelector('[data-action="refresh"]');
        if (refreshButton instanceof HTMLElement) {
          refreshButton.click();
        }
      },
      category: 'actions',
    },
    {
      key: 'Ctrl + H',
      description: 'Go to home',
      descriptionHi: 'मुखपृष्ठ पर जाएं',
      icon: <Home className="h-4 w-4" />,
      action: () => {
        window.location.href = '/';
      },
      category: 'navigation',
    },
    {
      key: 'Ctrl + P',
      description: 'Open profile',
      descriptionHi: 'प्रोफाइल खोलें',
      icon: <User className="h-4 w-4" />,
      action: () => {
        const profileButton = document.querySelector('[data-action="profile"]');
        if (profileButton instanceof HTMLElement) {
          profileButton.click();
        }
      },
      category: 'navigation',
    },
    {
      key: 'Ctrl + ,',
      description: 'Open settings',
      descriptionHi: 'सेटिंग्स खोलें',
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        // Open settings dialog
        toast({
          title: lang === 'hi' ? '⚙️ सेटिंग्स' : '⚙️ Settings',
          description: lang === 'hi' ? 'सेटिंग्स डायलॉग खोलें' : 'Open settings dialog',
        });
      },
      category: 'system',
    },
    {
      key: 'Ctrl + F',
      description: 'Search in page',
      descriptionHi: 'पृष्ठ में खोजें',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('[data-action="search"]');
        if (searchInput instanceof HTMLElement) {
          searchInput.focus();
        }
      },
      category: 'forms',
    },
    {
      key: 'Escape',
      description: 'Close modal/clear form',
      descriptionHi: 'मोडल बंद करें/फॉर्म साफ़ करें',
      icon: <span className="text-lg">⎋</span>,
      action: () => {
        // Close active modal or clear form
        const closeButton = document.querySelector('[data-action="close"]');
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
      },
      category: 'system',
    },
  ];

  // Initialize shortcuts
  useEffect(() => {
    setActiveShortcuts(defaultShortcuts);
    setupKeyboardListeners();
    
    return () => {
      removeKeyboardListeners();
    };
  }, [lang]);

  // Setup keyboard event listeners
  const setupKeyboardListeners = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + / - Show help
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        setIsHelpVisible(prev => !prev);
      }

      // Ctrl + S - Save
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        const saveShortcut = defaultShortcuts.find(s => s.key === 'Ctrl + S');
        saveShortcut?.action();
      }

      // Ctrl + R - Refresh
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        const refreshShortcut = defaultShortcuts.find(s => s.key === 'Ctrl + R');
        refreshShortcut?.action();
      }

      // Ctrl + H - Home
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        const homeShortcut = defaultShortcuts.find(s => s.key === 'Ctrl + H');
        homeShortcut?.action();
      }

      // Ctrl + P - Profile
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        const profileShortcut = defaultShortcuts.find(s => s.key === 'Ctrl + P');
        profileShortcut?.action();
      }

      // Ctrl + , - Settings
      if (event.ctrlKey && event.key === ',') {
        event.preventDefault();
        const settingsShortcut = defaultShortcuts.find(s => s.key === 'Ctrl + ,');
        settingsShortcut?.action();
      }

      // Ctrl + F - Search
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        const searchShortcut = defaultShortcuts.find(s => s.key === 'Ctrl + F');
        searchShortcut?.action();
      }

      // Escape - Close
      if (event.key === 'Escape') {
        const escapeShortcut = defaultShortcuts.find(s => s.key === 'Escape');
        escapeShortcut?.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  };

  const removeKeyboardListeners = () => {
    // Cleanup will be handled by useEffect cleanup
  };

  // Group shortcuts by category
  const shortcutsByCategory = activeShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const categoryLabels = {
    navigation: lang === 'hi' ? 'नेविगेशन' : 'Navigation',
    actions: lang === 'hi' ? 'कार्रवाइयाँ' : 'Actions',
    forms: lang === 'hi' ? 'फॉर्म' : 'Forms',
    system: lang === 'hi' ? 'सिस्टम' : 'System',
  };

  return (
    <>
      {/* Help Toggle Button */}
      {showHelp && (
        <button
          onClick={() => setIsHelpVisible(!isHelpVisible)}
          className={cn(
            'fixed bottom-4 left-4 z-40',
            'flex items-center gap-2 px-3 py-2',
            'bg-primary text-primary-foreground rounded-lg shadow-lg',
            'hover:bg-primary/90 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            className
          )}
          title={lang === 'hi' ? 'कीबोर्ड शॉर्टकट (Ctrl + /)' : 'Keyboard shortcuts (Ctrl + /)'}
        >
          <Keyboard className="h-4 w-4" />
          <span className="text-sm font-medium">
            {lang === 'hi' ? 'शॉर्टकट' : 'Shortcuts'}
          </span>
        </button>
      )}

      {/* Help Modal */}
      {isHelpVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div 
            className="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Keyboard className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">
                    {lang === 'hi' ? 'कीबोर्ड शॉर्टकट' : 'Keyboard Shortcuts'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'hi' 
                      ? 'त्वरित नेविगेशन के लिए शॉर्टकट' 
                      : 'Shortcuts for quick navigation'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpVisible(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label={lang === 'hi' ? 'बंद करें' : 'Close'}
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {shortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {shortcut.icon}
                            </div>
                            <div>
                              <div className="font-medium">
                                {lang === 'hi' ? shortcut.descriptionHi : shortcut.description}
                              </div>
                            </div>
                          </div>
                          <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2">
                  {lang === 'hi' ? 'टिप्स' : 'Tips'}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • {lang === 'hi' 
                      ? 'Ctrl + / दबाकर कभी भी यह मेनू खोलें' 
                      : 'Press Ctrl + / anytime to open this menu'}
                  </li>
                  <li>
                    • {lang === 'hi' 
                      ? 'अधिकांश शॉर्टकट Ctrl कुंजी के साथ काम करते हैं' 
                      : 'Most shortcuts work with the Ctrl key'}
                  </li>
                  <li>
                    • {lang === 'hi' 
                      ? 'Escape दबाकर मोडल बंद करें या फॉर्म साफ़ करें' 
                      : 'Press Escape to close modals or clear forms'}
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {lang === 'hi' 
                    ? 'शॉर्टकट बंद करने के लिए Escape दबाएं' 
                    : 'Press Escape to close shortcuts'}
                </span>
                <button
                  onClick={() => setIsHelpVisible(false)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {lang === 'hi' ? 'समझ गया' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Hook for using keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        // Parse shortcut key (simple implementation)
        const keys = shortcut.key.toLowerCase().split(' + ');
        const hasCtrl = keys.includes('ctrl') && event.ctrlKey;
        const hasAlt = keys.includes('alt') && event.altKey;
        const hasShift = keys.includes('shift') && event.shiftKey;
        const keyMatch = keys.some(k => 
          k === event.key.toLowerCase() || 
          k === event.code.toLowerCase().replace('key', '')
        );

        if ((hasCtrl || !keys.includes('ctrl')) && 
            (hasAlt || !keys.includes('alt')) && 
            (hasShift || !keys.includes('shift')) && 
            keyMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default KeyboardShortcuts;