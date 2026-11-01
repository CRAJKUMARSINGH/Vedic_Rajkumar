/**
 * VerificationBadge — the in-app verified / unverified label (Week 15).
 *
 * Renders the status from src/config/verification.ts. The chip text is derived
 * from the status rather than stored, so the label and the status cannot drift
 * apart. `data-status` is exposed so a test can assert that a surface carries an
 * *unverified* badge, not merely a badge.
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { verificationOf } from '@/config/verification';
import type { SupportedLanguage } from '@/services/multiLanguageService';

interface Props {
  /** Key into the VERIFICATION registry, e.g. 'shadbala'. */
  topic: string;
  lang: SupportedLanguage;
  className?: string;
}

const CHIP: Record<'verified' | 'unverified', { en: string; hi: string; className: string }> = {
  verified: { en: 'Verified', hi: 'सत्यापित', className: 'bg-green-600 text-white' },
  unverified: { en: 'Unverified', hi: 'अपरीक्षित', className: 'bg-amber-500 text-white' },
};

export function VerificationBadge({ topic, lang, className }: Props) {
  const { status, note } = verificationOf(topic);
  const isHi = lang === 'hi';
  const chip = CHIP[status];

  return (
    <Badge
      data-testid="verification-badge"
      data-status={status}
      title={isHi ? note.hi : note.en}
      className={cn(chip.className, isHi ? 'font-hindi' : '', className)}
    >
      {chip[isHi ? 'hi' : 'en']}
    </Badge>
  );
}

export default VerificationBadge;
