/**
 * FamilyProfileSelector.tsx
 *
 * Week 8: Drop-in picker component for selecting a family profile.
 *
 * Shows all saved profiles in a popover. Selecting one emits the profile
 * data via onSelect so the calling page can populate its birth form.
 * "Add new" opens FamilyProfileForm inline or navigates to management page.
 *
 * Accessible: keyboard navigable listbox, aria-selected, role="option"
 */

import React, { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown, Plus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFamilyProfiles } from '@/hooks/useFamilyProfiles';
import { getProfileById, validateProfile } from '@/lib/familyProfiles';
import type { FamilyProfile } from '@/lib/familyProfiles';

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLOURS = [
  'bg-amber-100 text-amber-800',
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-violet-100 text-violet-800',
  'bg-pink-100 text-pink-800',
  'bg-orange-100 text-orange-800',
];

function avatarColour(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLOURS[hash % AVATAR_COLOURS.length];
}

// ─── Labels ───────────────────────────────────────────────────────────────────

const SELECTOR_LABELS: Record<'en' | 'hi', {
  emptyTitle: string;
  emptySubtitle: string;
  emptyAction: string;
  manage: string;
  defaultTrigger: string;
  selectAria: string;
}> = {
  en: {
    emptyTitle: 'No family profiles yet',
    emptySubtitle: 'Add someone to auto-fill birth details in one click.',
    emptyAction: 'Add family member \u2192',
    manage: 'Add or manage profiles',
    defaultTrigger: 'Family Profile',
    selectAria: 'Select a family member to fill in birth details',
  },
  hi: {
    emptyTitle: 'अभी कोई परिवार प्रोफ़ाइल नहीं',
    emptySubtitle: 'जन्म विवरण एक क्लिक में भरने के लिए किसी को भी जोड़ें।',
    emptyAction: 'परिवार सदस्य जोड़ें \u2192',
    manage: 'जोड़ें या प्रबंधित करें',
    defaultTrigger: 'परिवार प्रोफ़ाइल',
    selectAria: 'जन्म विवरण भरने के लिए परिवार सदस्य चुनें',
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface FamilyProfileSelectorProps {
  /** Called when user selects a profile */
  onSelect: (profile: FamilyProfile) => void;
  /** Currently selected profile id, if any */
  selectedId?: string;
  /** Label shown on the trigger button */
  triggerLabel?: string;
  /** Language for UI strings inside the popover (gracefully falls back to English for unsupported languages) */
  lang?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FamilyProfileSelector: React.FC<FamilyProfileSelectorProps> = ({
  onSelect,
  selectedId,
  triggerLabel,
  lang = 'en',
  className,
}) => {
  const { profiles } = useFamilyProfiles();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const actualLang: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en';
  const t = SELECTOR_LABELS[actualLang];
  const isHi = actualLang === 'hi';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const selectedProfile = profiles.find((p) => p.id === selectedId);
  
  // Validate selected profile to prevent data leakage
  const validatedSelectedProfile = selectedProfile && validateProfile(selectedProfile) ? selectedProfile : null;

  const displayedTrigger = triggerLabel ?? t.defaultTrigger;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={validatedSelectedProfile
          ? (isHi ? `चयनित: ${validatedSelectedProfile.name}` : `Selected: ${validatedSelectedProfile.name}`)
          : `${displayedTrigger} — ${t.selectAria}`
        }
        title={t.selectAria}
        className="gap-2"
      >
        {validatedSelectedProfile ? (
          <span
            className={cn(
              'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
              avatarColour(validatedSelectedProfile.id),
            )}
            aria-hidden="true"
          >
            {validatedSelectedProfile.avatarInitials}
          </span>
        ) : (
          <Users className="h-4 w-4" aria-hidden="true" />
        )}
        <span className={cn('max-w-[140px] truncate', isHi && 'font-hindi')}>
          {validatedSelectedProfile ? validatedSelectedProfile.name : displayedTrigger}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </Button>

      {/* Popover */}
      {open && (
        <div
          role="listbox"
          aria-label={t.selectAria}
          className={cn(
            'absolute left-0 top-full mt-1 z-50',
            'w-72 rounded-xl border border-border bg-card shadow-lg',
            'py-1 overflow-hidden',
          )}
        >
          {profiles.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <User className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" aria-hidden="true" />
              <p className={cn('text-sm font-medium text-foreground/80', isHi && 'font-hindi')}>{t.emptyTitle}</p>
              <p className={cn('text-xs text-muted-foreground mt-1 mb-2', isHi && 'font-hindi')}>{t.emptySubtitle}</p>
              <Link
                to="/family-profiles"
                className={cn('text-xs text-primary underline underline-offset-2 block', isHi && 'font-hindi')}
                onClick={() => setOpen(false)}
              >
                {t.emptyAction}
              </Link>
            </div>
          ) : (
            <>
              {profiles.map((profile) => {
                // Only render validated profiles to prevent data leakage
                if (!validateProfile(profile)) return null;

                const isSelected = profile.id === selectedId;
                return (
                  <button
                    key={profile.id}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => {
                      onSelect(profile);
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      'hover:bg-muted/60 focus:outline-none focus-visible:bg-muted/60',
                      isSelected && 'bg-primary/10',
                    )}
                  >
                    {/* Avatar */}
                    <span
                      className={cn(
                        'flex-shrink-0 inline-flex items-center justify-center',
                        'w-8 h-8 rounded-full text-sm font-bold',
                        avatarColour(profile.id),
                      )}
                      aria-hidden="true"
                    >
                      {profile.avatarInitials}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {profile.name}
                        {isSelected && <span className="ml-1.5 text-xs text-primary">✓</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.relationship && <span>{profile.relationship} · </span>}
                        {profile.birthDate}
                      </p>
                    </div>
                  </button>
                );
              })}

              <div className="border-t border-border mt-1 pt-1">
                <Link
                  to="/family-profiles"
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2.5 text-sm',
                    'text-primary hover:bg-muted/60 transition-colors',
                    'focus:outline-none focus-visible:bg-muted/60',
                    isHi && 'font-hindi',
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t.manage}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FamilyProfileSelector;
