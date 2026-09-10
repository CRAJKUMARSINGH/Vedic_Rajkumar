/**
 * FamilyProfilesPage.tsx
 *
 * Week 8: Multi-Profile Family Mode — management page.
 *
 * Route: /family-profiles
 *
 * Lists all saved family profiles with:
 *  - Avatar + name + relationship + birth data
 *  - Edit and Delete actions per card
 *  - Add new profile button (opens FamilyProfileForm)
 *  - Empty state when no profiles exist
 *  - Profile count badge (max 10)
 *
 * Accessibility:
 *  - aria-live on list region for screen reader announcements
 *  - Focus moves to new profile heading after add
 *  - Deletion has confirm step
 *  - All buttons labelled
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Pencil, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import FamilyProfileForm from '@/components/FamilyProfileForm';
import ChartEmptyState from '@/components/ChartEmptyState';
import ChartErrorState from '@/components/ChartErrorState';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { useFamilyProfiles } from '@/hooks/useFamilyProfiles';
import { MAX_PROFILES, type FamilyProfile, type NewFamilyProfile } from '@/lib/familyProfiles';
import { cn } from '@/lib/utils';

// ─── Avatar colours ───────────────────────────────────────────────────────────

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

// ─── Profile Card ─────────────────────────────────────────────────────────────

const CARD_LABELS = {
  en: {
    delete: 'Delete',
    cancel: 'Cancel',
    confirmDelete: 'Confirm delete',
    confirmPrompt: 'Delete this profile?',
    yesDelete: 'Yes, delete',
  },
  hi: {
    delete: 'हटाएँ',
    cancel: 'रद्द करें',
    confirmDelete: 'हटाना सुनिश्चित करें',
    confirmPrompt: 'क्या यह प्रोफ़ाइल हटानी है?',
    yesDelete: 'हाँ, हटाएँ',
  },
};

function ProfileCard({
  profile,
  onEdit,
  onDelete,
  lang,
}: {
  profile: FamilyProfile;
  onEdit: (p: FamilyProfile) => void;
  onDelete: (id: string) => void;
  lang?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const actualLang: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en';
  const isHi = actualLang === 'hi';
  const t = CARD_LABELS[actualLang];

  return (
    <article
      className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-start gap-4"
      aria-label={`${profile.name} — ${profile.relationship || 'Family member'}`}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center',
          'text-lg font-bold select-none',
          avatarColour(profile.id),
        )}
        aria-hidden="true"
      >
        {profile.avatarInitials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-foreground">{profile.name}</h3>
          {profile.relationship && (
            <Badge variant="secondary" className="text-xs">
              {profile.relationship}
            </Badge>
          )}
        </div>

        <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          {profile.birthDate && (
            <div>
              <dt className="sr-only">Date of birth</dt>
              <dd>🗓 {profile.birthDate}{profile.birthTime ? ` · ${profile.birthTime}` : ''}</dd>
            </div>
          )}
          {profile.birthPlace && (
            <div>
              <dt className="sr-only">Birth place</dt>
              <dd>📍 {profile.birthPlace}</dd>
            </div>
          )}
          {profile.birthTimezone && (
            <div>
              <dt className="sr-only">Timezone</dt>
              <dd>🕐 {profile.birthTimezone}</dd>
            </div>
          )}
        </dl>

        {profile.notes && (
          <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-2">{profile.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex flex-col gap-1.5">
        {confirming ? (
          <div className="flex flex-col gap-2 min-w-[140px]">
            <p className={cn('text-[11px] text-foreground/70 leading-tight', isHi && 'font-hindi')}>
              {t.confirmPrompt}
            </p>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="destructive"
                className={cn('h-8 px-3 text-xs', isHi && 'font-hindi')}
                onClick={() => { onDelete(profile.id); setConfirming(false); }}
                aria-label={`${t.confirmDelete} ${profile.name}`}
              >
                {t.yesDelete}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={cn('h-8 px-3 text-xs', isHi && 'font-hindi')}
                onClick={() => setConfirming(false)}
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(profile)}
              aria-label={`Edit ${profile.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${profile.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FamilyProfilesPage() {
  const { profiles, isLoading, error, addProfile, updateProfile, removeProfile, clearError } =
    useFamilyProfiles();

  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const isHi = lang === 'hi';
  const formLang = (isHi ? 'hi' : 'en') as 'en' | 'hi';
  const addedHeadingRef = useRef<HTMLHeadingElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  // Focus the newly added profile heading
  useEffect(() => {
    if (lastAdded) {
      addedHeadingRef.current?.focus();
      setLastAdded(null);
    }
  }, [lastAdded]);

  const handleAdd = (payload: NewFamilyProfile) => {
    const profile = addProfile(payload);
    if (profile) {
      setMode('list');
      setLastAdded(profile.id);
    }
  };

  const handleUpdate = (payload: NewFamilyProfile) => {
    if (!editingProfile) return;
    const updated = updateProfile(editingProfile.id, payload);
    if (updated) {
      setMode('list');
      setEditingProfile(null);
    }
  };

  const handleEditOpen = (p: FamilyProfile) => {
    setEditingProfile(p);
    setMode('edit');
  };

  const handleCancel = () => {
    setMode('list');
    setEditingProfile(null);
    clearError();
    setTimeout(() => addBtnRef.current?.focus(), 50);
  };

  const atCapacity = profiles.length >= MAX_PROFILES;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Family Profiles — Vedic Rajkumar"
        description="Manage your family's birth profiles for quick Vedic chart calculations."
        canonical="/family-profiles"
        noIndex={true}
      />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Back to home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className={cn('text-xl font-bold text-foreground flex items-center gap-2', isHi && 'font-hindi')}>
              <Users className="h-5 w-5 text-amber-500" aria-hidden="true" />
              {isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profiles'}
            </h1>
            <p className={cn('text-xs text-muted-foreground mt-0.5', isHi && 'font-hindi')}>
              {isHi
                ? 'परिवार के सदस्यों के जन्म विवरण सहेजें। किसी भी कुंडली पृष्ठ पर एक क्लिक से लोड करें।'
                : 'Save birth details for family members. Load into any chart page with one click.'}
            </p>
          </div>
          {/* Language toggle */}
          <EnhancedLanguageToggle
            currentLang={lang}
            onChange={setLang}
            showRegion={false}
            autoDetect={false}
          />
          {/* Count badge */}
          <Badge
            variant="secondary"
            className="shrink-0"
            aria-label={`${profiles.length} of ${MAX_PROFILES} profiles used`}
          >
            {profiles.length}/{MAX_PROFILES}
          </Badge>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Error state */}
        {error && (
          <ChartErrorState message={error} onRetry={clearError} />
        )}

        {/* Add form */}
        {mode === 'add' && (
          <section
            aria-labelledby="add-profile-heading"
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <h2
              id="add-profile-heading"
              ref={addedHeadingRef}
              tabIndex={-1}
              className={cn('text-base font-semibold text-foreground mb-5 flex items-center gap-2 outline-none', isHi && 'font-hindi')}
            >
              <UserPlus className="h-4 w-4 text-amber-500" aria-hidden="true" />
              {isHi ? 'परिवार का सदस्य जोड़ें' : 'Add Family Member'}
            </h2>
            <FamilyProfileForm
              onSave={handleAdd}
              onCancel={handleCancel}
              errorMessage={error}
              lang={formLang}
            />
          </section>
        )}

        {/* Edit form */}
        {mode === 'edit' && editingProfile && (
          <section
            aria-labelledby="edit-profile-heading"
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <h2
              id="edit-profile-heading"
              className={cn('text-base font-semibold text-foreground mb-5 flex items-center gap-2', isHi && 'font-hindi')}
            >
              <Pencil className="h-4 w-4 text-amber-500" aria-hidden="true" />
              {isHi ? 'संपादित करें — ' : 'Edit — '}{editingProfile.name}
            </h2>
            <FamilyProfileForm
              editing={editingProfile}
              onSave={handleUpdate}
              onCancel={handleCancel}
              errorMessage={error}
              lang={formLang}
            />
          </section>
        )}

        {/* Profile list */}
        {mode === 'list' && (
          <>
            {/* Add button */}
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <p className={cn('text-sm text-muted-foreground', isHi && 'font-hindi')}>
                {isLoading
                  ? (isHi ? 'लोड हो रहा है…' : 'Loading…')
                  : profiles.length > 0
                  ? (isHi
                      ? `${profiles.length} प्रोफ़ाइल सहेजी गई`
                      : `${profiles.length} profile${profiles.length !== 1 ? 's' : ''} saved`)
                  : (isHi ? 'अभी कोई प्रोफ़ाइल नहीं' : 'No profiles yet')}
              </p>
              <Button
                ref={addBtnRef}
                onClick={() => setMode('add')}
                disabled={atCapacity}
                aria-label={atCapacity
                  ? (isHi
                      ? `अधिकतम ${MAX_PROFILES} प्रोफ़ाइल पूर्ण हो गई हैं`
                      : `Maximum ${MAX_PROFILES} profiles reached`)
                  : (isHi ? 'नया परिवार सदस्य जोड़ें' : 'Add a new family member')}
                size="sm"
                className={cn('gap-2', isHi && 'font-hindi')}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                {isHi ? 'सदस्य जोड़ें' : 'Add Member'}
              </Button>
            </div>

            {atCapacity && (
              <div
                role="status"
                className={cn(
                  'rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm',
                  'text-foreground/75',
                  isHi && 'font-hindi',
                )}
              >
                {isHi
                  ? `आपने सभी ${MAX_PROFILES} प्रोफ़ाइल स्लॉट उपयोग कर लिए हैं। और जोड़ने के लिए एक प्रोफ़ाइल हटाएँ।`
                  : `You've used all ${MAX_PROFILES} profile slots. Delete a profile to add more.`}
              </div>
            )}

            {/* Profile list */}
            <div
              aria-live="polite"
              aria-label={isHi ? 'परिवार प्रोफ़ाइल' : 'Family profiles'}
            >
              {!isLoading && profiles.length === 0 ? (
                <ChartEmptyState
                  icon={<Users className="h-8 w-8" />}
                  title={isHi ? 'अभी कोई परिवार प्रोफ़ाइल नहीं' : 'No family profiles yet'}
                  description={
                    isHi
                      ? 'अपने परिवार सदस्यों के जन्म विवरण जोड़ें। फिर उन्हें किसी भी कुंडली पृष्ठ पर तुरंत लोड किया जा सकता है।'
                      : 'Add birth details for your family members. You can then load them into any chart calculation page instantly.'
                  }
                  action={
                    <Button onClick={() => setMode('add')} size="sm" className={cn('gap-2', isHi && 'font-hindi')}>
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      {isHi ? 'पहला सदस्य जोड़ें' : 'Add First Member'}
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      onEdit={handleEditOpen}
                      onDelete={removeProfile}
                      lang={formLang}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* How to use hint */}
            {profiles.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className={cn('text-sm font-medium text-foreground', isHi && 'font-hindi')}>
                    {isHi ? 'कैसे उपयोग करें' : 'How to use'}
                  </p>
                  <p className={cn('text-xs text-muted-foreground mt-0.5', isHi && 'font-hindi')}>
                    {isHi
                      ? 'किसी भी कुंडली पृष्ठ पर '
                      : 'On any chart page, look for the '}
                    <strong>
                      {isHi ? '\u201cपरिवार प्रोफ़ाइल\u201d' : '"Family Profile"'}
                    </strong>
                    {isHi
                      ? ' बटन देखें। एक क्लिक से जन्म विवरण स्वयं भर जाएंगे।'
                      : ' button. One click fills in all birth details automatically.'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
