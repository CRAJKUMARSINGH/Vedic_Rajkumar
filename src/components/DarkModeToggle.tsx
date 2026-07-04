/**
 * Dark Mode Toggle Component
 * Week 28 - Thursday Implementation
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { darkModeService, type Theme } from '@/services/darkModeService';

interface DarkModeToggleProps {
  showLabel?: boolean;
  language?: 'en' | 'hi';
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  showLabel = false,
  language = 'en' 
}) => {
  const [theme, setTheme] = useState<Theme>(darkModeService.getCurrentTheme());
  const [isDark, setIsDark] = useState(darkModeService.isDarkMode());

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(darkModeService.getCurrentTheme());
      setIsDark(darkModeService.isDarkMode());
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  const handleToggle = () => {
    darkModeService.toggleTheme();
  };

  const t = {
    light: language === 'hi' ? 'लाइट' : 'Light',
    dark: language === 'hi' ? 'डार्क' : 'Dark',
    toggle: language === 'hi' ? 'थीम टॉगल करें' : 'Toggle Theme'
  };

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      size="sm"
      className="gap-2"
      title={t.toggle}
    >
      <span className="text-xl">
        {isDark ? '🌙' : '☀️'}
      </span>
      {showLabel && (
        <span>{isDark ? t.dark : t.light}</span>
      )}
    </Button>
  );
};

export default DarkModeToggle;
