/**
 * LanguageToggle — simple EN/HI toggle.
 * Named export for legacy components (ComprehensiveReportForm, KaalSarpForm, etc.)
 */
import React from 'react';
import { Button } from '@/components/ui/button';

interface LanguageToggleProps {
  isHindi: boolean;
  onToggle: (isHindi: boolean) => void;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ isHindi, onToggle, className }) => {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Button
        size="sm"
        variant={!isHindi ? 'default' : 'outline'}
        onClick={() => onToggle(false)}
        className="text-xs px-3 h-7"
        aria-pressed={!isHindi}
      >
        EN
      </Button>
      <Button
        size="sm"
        variant={isHindi ? 'default' : 'outline'}
        onClick={() => onToggle(true)}
        className="text-xs px-3 h-7 font-hindi"
        aria-pressed={isHindi}
      >
        हिं
      </Button>
    </div>
  );
};

export default LanguageToggle;
