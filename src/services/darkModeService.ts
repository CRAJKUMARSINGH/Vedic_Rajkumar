/**
 * Dark Mode Service
 * Week 28 - Thursday Implementation
 * Top requested feature from user feedback
 */

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  theme: Theme;
  autoSwitchTime?: {
    darkStart: string; // HH:MM format
    lightStart: string; // HH:MM format
  };
}

/**
 * Dark Mode Service Class
 */
class DarkModeService {
  private storageKey = 'vedic_theme';
  private currentTheme: Theme = 'light';
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize dark mode
   */
  initialize(): void {
    // Load saved theme
    const saved = this.getSavedTheme();
    this.currentTheme = saved;

    // Set up system preference listener
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
    }

    // Apply theme
    this.applyTheme(this.currentTheme);

    // Set up auto-switch if enabled
    if (this.currentTheme === 'auto') {
      this.setupAutoSwitch();
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.saveTheme(theme);
    this.applyTheme(theme);

    if (theme === 'auto') {
      this.setupAutoSwitch();
    }
  }

  /**
   * Toggle between light and dark
   */
  toggleTheme(): void {
    const newTheme = this.getEffectiveTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Get effective theme (resolves 'auto' to actual theme)
   */
  getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'auto') {
      return this.getSystemTheme();
    }
    return this.currentTheme;
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    return this.getEffectiveTheme() === 'dark';
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const effectiveTheme = theme === 'auto' ? this.getSystemTheme() : theme;
    
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: effectiveTheme } 
    }));
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (this.mediaQuery?.matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Handle system theme change
   */
  private handleSystemThemeChange(e: MediaQueryListEvent): void {
    if (this.currentTheme === 'auto') {
      this.applyTheme('auto');
    }
  }

  /**
   * Set up automatic theme switching based on time
   */
  private setupAutoSwitch(): void {
    const config = this.getConfig();
    if (!config.autoSwitchTime) return;

    const checkTime = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const { darkStart, lightStart } = config.autoSwitchTime!;
      
      // Simple time comparison (works for most cases)
      if (currentTime >= darkStart || currentTime < lightStart) {
        if (this.getEffectiveTheme() !== 'dark') {
          this.applyTheme('dark');
        }
      } else {
        if (this.getEffectiveTheme() !== 'light') {
          this.applyTheme('light');
        }
      }
    };

    // Check every minute
    setInterval(checkTime, 60000);
    checkTime(); // Check immediately
  }

  /**
   * Get theme configuration
   */
  getConfig(): ThemeConfig {
    const saved = localStorage.getItem(`${this.storageKey}_config`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      theme: 'light',
      autoSwitchTime: {
        darkStart: '18:00',
        lightStart: '06:00'
      }
    };
  }

  /**
   * Save theme configuration
   */
  saveConfig(config: ThemeConfig): void {
    localStorage.setItem(`${this.storageKey}_config`, JSON.stringify(config));
    this.setTheme(config.theme);
  }

  /**
   * Get saved theme
   */
  private getSavedTheme(): Theme {
    const saved = localStorage.getItem(this.storageKey);
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
      return saved as Theme;
    }
    return 'light';
  }

  /**
   * Save theme
   */
  private saveTheme(theme: Theme): void {
    localStorage.setItem(this.storageKey, theme);
  }
}

// Create singleton instance
export const darkModeService = new DarkModeService();

export default darkModeService;
