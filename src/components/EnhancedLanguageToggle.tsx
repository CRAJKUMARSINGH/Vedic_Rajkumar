/**
 * Enhanced Language Toggle Component - 9 Language Support
 * Week 11: AstroSage Feature Integration - Part 1
 * 
 * Supports all 9 languages with auto-detection and regional preferences
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { 
  type SupportedLanguage, 
  getAvailableLanguages, 
  getLanguageConfig,
  detectUserLanguage,
  getText 
} from '@/services/multiLanguageService';

interface EnhancedLanguageToggleProps {
  currentLang: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  showRegion?: boolean;
  autoDetect?: boolean;
  className?: string;
}

const EnhancedLanguageToggle: React.FC<EnhancedLanguageToggleProps> = ({
  currentLang,
  onChange,
  showRegion = true,
  autoDetect = true,
  className = ''
}) => {
  const [detectedLang, setDetectedLang] = useState<SupportedLanguage | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const availableLanguages = getAvailableLanguages();
  const currentConfig = getLanguageConfig(currentLang);

  // Auto-detect user language on mount
  useEffect(() => {
    if (autoDetect) {
      const detected = detectUserLanguage();
      setDetectedLang(detected);
      
      // Auto-switch if different from current and user hasn't manually selected
      const hasManualSelection = localStorage.getItem('manual-language-selection');
      if (!hasManualSelection && detected !== currentLang) {
        onChange(detected);
      }
    }
  }, [autoDetect, currentLang, onChange]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    onChange(lang);
    setIsOpen(false);
    
    // Mark as manual selection
    localStorage.setItem('manual-language-selection', 'true');
    localStorage.setItem('selected-language', lang);
  };

  const getLanguageFlag = (lang: SupportedLanguage): string => {
    const flags: Record<SupportedLanguage, string> = {
      en: '🇺🇸',
      hi: '🇮🇳',
      bn: '🇧🇩',
      mr: '🇮🇳',
      gu: '🇮🇳',
      ta: '🇮🇳',
      te: '🇮🇳',
      ml: '🇮🇳',
      kn: '🇮🇳'
    };
    return flags[lang] || '🌐';
  };

  const groupLanguagesByRegion = () => {
    const grouped: Record<string, typeof availableLanguages> = {};
    
    availableLanguages.forEach(lang => {
      const region = lang.region;
      if (!grouped[region]) {
        grouped[region] = [];
      }
      grouped[region].push(lang);
    });
    
    return grouped;
  };

  const groupedLanguages = groupLanguagesByRegion();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span className="flex items-center gap-1">
            <span>{getLanguageFlag(currentLang)}</span>
            <span className="hidden sm:inline">{currentConfig.nativeName}</span>
            <span className="sm:hidden">{currentConfig.code.toUpperCase()}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {getText('select_language', currentLang) || 'Select Language'}
        </DropdownMenuLabel>
        
        {/* Auto-detected language suggestion */}
        {detectedLang && detectedLang !== currentLang && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleLanguageChange(detectedLang)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{getLanguageFlag(detectedLang)}</span>
                <span>{getLanguageConfig(detectedLang).nativeName}</span>
                <Badge variant="secondary" className="text-xs">
                  {getText('detected', currentLang) || 'Detected'}
                </Badge>
              </div>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Languages grouped by region */}
        {Object.entries(groupedLanguages).map(([region, languages]) => (
          <div key={region}>
            {showRegion && (
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                {region}
              </DropdownMenuLabel>
            )}
            
            {languages.map((langConfig) => (
              <DropdownMenuItem
                key={langConfig.code}
                onClick={() => handleLanguageChange(langConfig.code)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>{getLanguageFlag(langConfig.code)}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{langConfig.nativeName}</span>
                    <span className="text-xs text-muted-foreground">{langConfig.name}</span>
                  </div>
                </div>
                
                {currentLang === langConfig.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            
            {showRegion && <DropdownMenuSeparator />}
          </div>
        ))}
        
        {/* Language statistics */}
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground text-center">
          {availableLanguages.length} {getText('languages_supported', currentLang) || 'languages supported'}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnhancedLanguageToggle;