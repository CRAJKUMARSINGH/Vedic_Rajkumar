/**
 * FamilyProfileForm.tsx
 *
 * Week 8: Add / edit family profile form.
 *
 * Handles both "add new" and "edit existing" modes.
 * Validates required fields before saving via useFamilyProfiles hook.
 * Accessible: all inputs have labels, error announcements, focus management.
 */

import React, { useState, useEffect } from 'react';
import { UserPlus, Save, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FamilyProfile, NewFamilyProfile } from '@/lib/familyProfiles';

// ─── Relationship options ─────────────────────────────────────────────────────

const RELATIONSHIPS: { value: string; label: Record<'en' | 'hi', string> }[] = [
  { value: 'Self',         label: { en: 'Self',           hi: 'स्वयं' } },
  { value: 'Spouse',       label: { en: 'Spouse',         hi: 'पति/पत्नी' } },
  { value: 'Mother',       label: { en: 'Mother',         hi: 'माता' } },
  { value: 'Father',       label: { en: 'Father',         hi: 'पिता' } },
  { value: 'Son',          label: { en: 'Son',            hi: 'पुत्र' } },
  { value: 'Daughter',     label: { en: 'Daughter',       hi: 'पुत्री' } },
  { value: 'Brother',      label: { en: 'Brother',        hi: 'भाई' } },
  { value: 'Sister',       label: { en: 'Sister',         hi: 'बहन' } },
  { value: 'Grandfather',  label: { en: 'Grandfather',    hi: 'दादा/नाना' } },
  { value: 'Grandmother',  label: { en: 'Grandmother',    hi: 'दादी/नानी' } },
  { value: 'Friend',       label: { en: 'Friend',         hi: 'मित्र' } },
  { value: 'Other',        label: { en: 'Other',          hi: 'अन्य' } },
] as const;

// ─── Labels dict ──────────────────────────────────────────────────────────────

const LABELS = {
  en: {
    name: 'Full Name',
    namePlaceholder: 'e.g. Priya Sharma',
    nameHelper: 'Shown in the profile list for quick identification.',
    relationship: 'Relationship to you',
    relationshipHelper: 'Groups and identifies profiles by relationship.',
    dob: 'Date of Birth',
    dobHelper: 'All charts require an accurate birth date.',
    birthTime: 'Birth Time (24h, optional)',
    birthTimeHelper: 'If unknown, leave blank. A chart will still generate using sunrise time, which is less precise for ascendant-sensitive readings.',
    latitude: 'Latitude',
    latitudePlaceholder: 'e.g. 23.5',
    latitudeHelper: 'Decimal degrees. Can be filled in later if unknown.',
    longitude: 'Longitude',
    longitudePlaceholder: 'e.g. 74.32',
    longitudeHelper: 'Decimal degrees. Can be filled in later if unknown.',
    timezone: 'Timezone (IANA)',
    timezonePlaceholder: 'Asia/Kolkata',
    timezoneHelper: 'e.g. Asia/Kolkata, America/New_York.',
    birthPlace: 'Birth Place / City',
    birthPlacePlaceholder: 'e.g. Mumbai, Maharashtra, India',
    birthPlaceHelper: 'We\'ll use the city to suggest timezone later. Coordinates are optional if unknown.',
    notes: 'Notes (optional)',
    notesPlaceholder: 'Any additional details or reminders…',
    nameRequired: 'Full name is required to save this profile.',
    dobRequired: 'Birth date is required for astrological calculations.',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    addProfile: 'Add Profile',
    editAria: (n: string) => `Edit profile for ${n}`,
    addAria: 'Add a new family member profile',
    required: 'Required',
    optional: 'Optional',
  },
  hi: {
    name: 'पूरा नाम',
    namePlaceholder: 'जैसे प्रिया शर्मा',
    nameHelper: 'त्वरित पहचान के लिए प्रोफ़ाइल सूची में दिखाया गया।',
    relationship: 'आपके साथ संबंध',
    relationshipHelper: 'संबंध के अनुसार प्रोफ़ाइलों को पहचानने में मदद।',
    dob: 'जन्म तिथि',
    dobHelper: 'सभी चार्ट के लिए सटीक जन्म तिथि आवश्यक।',
    birthTime: 'जन्म समय (24 घंटे, वैकल्पिक)',
    birthTimeHelper: 'अज्ञात होने पर खाली छोड़ें। सूर्योदय समय से चार्ट बनेगा, जो लग्न-आधारित पढ़ाई के लिए कम सटीक है।',
    latitude: 'अक्षांश',
    latitudePlaceholder: 'जैसे 23.5',
    latitudeHelper: 'दशमलव डिग्री। अज्ञात हो तो बाद में भी भर सकते हैं।',
    longitude: 'देशांतर',
    longitudePlaceholder: 'जैसे 74.32',
    longitudeHelper: 'दशमलव डिग्री। अज्ञात हो तो बाद में भी भर सकते हैं।',
    timezone: 'समय क्षेत्र (IANA)',
    timezonePlaceholder: 'Asia/Kolkata',
    timezoneHelper: 'जैसे Asia/Kolkata, America/New_York।',
    birthPlace: 'जन्म स्थान / शहर',
    birthPlacePlaceholder: 'जैसे मुंबई, महाराष्ट्र, भारत',
    birthPlaceHelper: 'शहर से समय क्षेत्र सुझाया जाएगा। निर्देशांक अज्ञात होने पर वैकल्पिक हैं।',
    notes: 'नोट्स (वैकल्पिक)',
    notesPlaceholder: 'कोई अतिरिक्त विवरण या स्मरण…',
    nameRequired: 'इस प्रोफ़ाइल को सहेजने के लिए पूरा नाम आवश्यक है।',
    dobRequired: 'ज्योतिष गणना के लिए जन्म तिथि आवश्यक है।',
    cancel: 'रद्द करें',
    saveChanges: 'परिवर्तन सहेजें',
    addProfile: 'प्रोफ़ाइल जोड़ें',
    editAria: (n: string) => `${n} की प्रोफ़ाइल संपादित करें`,
    addAria: 'नया परिवार सदस्य प्रोफ़ाइल जोड़ें',
    required: 'आवश्यक',
    optional: 'वैकल्पिक',
  },
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface FamilyProfileFormProps {
  /** If provided, form is in edit mode for this profile */
  editing?: FamilyProfile;
  onSave: (payload: NewFamilyProfile) => void;
  onCancel: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  className?: string;
  lang?: 'en' | 'hi';
}

// ─── Component ────────────────────────────────────────────────────────────────

const FamilyProfileForm: React.FC<FamilyProfileFormProps> = ({
  editing,
  onSave,
  onCancel,
  isLoading = false,
  errorMessage,
  className,
  lang = 'en',
}) => {
  const t = LABELS[lang];
  const isHi = lang === 'hi';
  const [form, setForm] = useState<NewFamilyProfile>({
    name:           editing?.name           ?? '',
    relationship:   editing?.relationship   ?? 'Self',
    birthDate:      editing?.birthDate      ?? '',
    birthTime:      editing?.birthTime      ?? '',
    birthTimezone:  editing?.birthTimezone  ?? 'Asia/Kolkata',
    birthLat:       editing?.birthLat       ?? 0,
    birthLon:       editing?.birthLon       ?? 0,
    birthPlace:     editing?.birthPlace     ?? '',
    notes:          editing?.notes          ?? '',
  });
  const [touched, setTouched] = useState<Partial<Record<keyof NewFamilyProfile, boolean>>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync editing prop changes
  useEffect(() => {
    if (editing) {
      setForm({
        name:           editing.name,
        relationship:   editing.relationship,
        birthDate:      editing.birthDate,
        birthTime:      editing.birthTime,
        birthTimezone:  editing.birthTimezone,
        birthLat:       editing.birthLat,
        birthLon:       editing.birthLon,
        birthPlace:     editing.birthPlace,
        notes:          editing.notes,
      });
    }
  }, [editing]);

  const set = (field: keyof NewFamilyProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: field === 'birthLat' || field === 'birthLon' ? parseFloat(val) || 0 : val,
      }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      setValidationError(null);
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setValidationError(t.nameRequired);
      return;
    }
    if (!form.birthDate) {
      setValidationError(t.dobRequired);
      return;
    }
    setValidationError(null);
    onSave(form);
  };

  const displayError = validationError ?? errorMessage;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-4', className)}
      aria-label={editing ? t.editAria(editing.name) : t.addAria}
      noValidate
    >
      {/* Error banner */}
      {displayError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          {displayError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fp-name" className={cn(isHi && 'font-hindi')}>
            {t.name} <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <input
            id="fp-name"
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder={t.namePlaceholder}
            aria-required="true"
            aria-invalid={touched.name && !form.name ? 'true' : 'false'}
            aria-describedby="fp-name-helper"
            className={cn(
              'rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              touched.name && !form.name
                ? 'border-destructive ring-1 ring-destructive/30 focus-visible:ring-destructive'
                : 'border-input',
            )}
          />
          <p
            id="fp-name-helper"
            className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
          >
            {t.nameHelper}
          </p>
        </div>

        {/* Relationship */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fp-relationship" className={cn(isHi && 'font-hindi')}>
            {t.relationship}
            <span aria-hidden="true" className="ml-1.5 text-[10px] text-muted-foreground">
              ({t.optional})
            </span>
          </Label>
          <select
            id="fp-relationship"
            value={form.relationship}
            onChange={set('relationship')}
            aria-describedby="fp-relationship-helper"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {RELATIONSHIPS.map((r) => (
              <option key={r.value} value={r.value}>
                {isHi ? r.label.hi : r.label.en}
              </option>
            ))}
          </select>
          <p
            id="fp-relationship-helper"
            className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
          >
            {t.relationshipHelper}
          </p>
        </div>

        {/* Birth Date */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fp-date" className={cn(isHi && 'font-hindi')}>
            {t.dob} <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <input
            id="fp-date"
            type="date"
            value={form.birthDate}
            onChange={set('birthDate')}
            aria-required="true"
            aria-invalid={touched.birthDate && !form.birthDate ? 'true' : 'false'}
            aria-describedby="fp-date-helper"
            className={cn(
              'rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              touched.birthDate && !form.birthDate
                ? 'border-destructive ring-1 ring-destructive/30 focus-visible:ring-destructive'
                : 'border-input',
            )}
          />
          <p
            id="fp-date-helper"
            className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
          >
            {t.dobHelper}
          </p>
        </div>

        {/* Birth Time */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fp-time" className={cn(isHi && 'font-hindi')}>
            {t.birthTime}
          </Label>
          <input
            id="fp-time"
            type="time"
            value={form.birthTime}
            onChange={set('birthTime')}
            aria-describedby="fp-time-helper"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p
            id="fp-time-helper"
            className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
          >
            {t.birthTimeHelper}
          </p>
        </div>

        {/* Latitude */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fp-lat" className={cn(isHi && 'font-hindi')}>
            {t.latitude}
            <span aria-hidden="true" className="ml-1.5 text-[10px] text-muted-foreground">
              ({t.optional})
            </span>
          </Label>
          <input
            id="fp-lat"
            type="number"
            step="0.01"
            value={form.birthLat || ''}
            onChange={set('birthLat')}
            placeholder={t.latitudePlaceholder}
            aria-describedby="fp-lat-helper"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p
            id="fp-lat-helper"
            className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
          >
            {t.latitudeHelper}
          </p>
        </div>

        {/* Longitude */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fp-lon" className={cn(isHi && 'font-hindi')}>
            {t.longitude}
            <span aria-hidden="true" className="ml-1.5 text-[10px] text-muted-foreground">
              ({t.optional})
            </span>
          </Label>
          <input
            id="fp-lon"
            type="number"
            step="0.01"
            value={form.birthLon || ''}
            onChange={set('birthLon')}
            placeholder={t.longitudePlaceholder}
            aria-describedby="fp-lon-helper"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p
            id="fp-lon-helper"
            className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
          >
            {t.longitudeHelper}
          </p>
        </div>

        {/* Timezone */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fp-tz" className={cn(isHi && 'font-hindi')}>
            {t.timezone}
          </Label>
          <input
            id="fp-tz"
            type="text"
            value={form.birthTimezone}
            onChange={set('birthTimezone')}
            placeholder={t.timezonePlaceholder}
            aria-describedby="fp-tz-helper"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p
            id="fp-tz-helper"
            className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
          >
            {t.timezoneHelper}
          </p>
        </div>

        {/* Place */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fp-place" className={cn(isHi && 'font-hindi')}>
            {t.birthPlace}
            <span aria-hidden="true" className="ml-1.5 text-[10px] text-muted-foreground">
              ({t.optional})
            </span>
          </Label>
          <input
            id="fp-place"
            type="text"
            value={form.birthPlace}
            onChange={set('birthPlace')}
            placeholder={t.birthPlacePlaceholder}
            aria-describedby="fp-place-helper"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p
            id="fp-place-helper"
            className={cn('text-[11px] text-muted-foreground leading-snug', isHi && 'font-hindi')}
          >
            {t.birthPlaceHelper}
          </p>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="fp-notes" className={cn(isHi && 'font-hindi')}>
            {t.notes}
          </Label>
          <textarea
            id="fp-notes"
            value={form.notes}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, notes: e.target.value }));
            }}
            rows={2}
            placeholder={t.notesPlaceholder}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" aria-hidden="true" />
          <span className={cn(isHi && 'font-hindi')}>{t.cancel}</span>
        </Button>
        <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
          {editing
            ? <><Save className="h-4 w-4 mr-1" aria-hidden="true" /><span className={cn(isHi && 'font-hindi')}>{t.saveChanges}</span></>
            : <><UserPlus className="h-4 w-4 mr-1" aria-hidden="true" /><span className={cn(isHi && 'font-hindi')}>{t.addProfile}</span></>}
        </Button>
      </div>
    </form>
  );
};

export default FamilyProfileForm;
