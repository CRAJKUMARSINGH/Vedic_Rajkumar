/**
 * AnswerBanner.tsx
 *
 * Shown only when the URL carries ?agent=1 (or ?format=markdown). It is the
 * in-app half of the "AI mode" contract: it says the direct answer is already
 * below and offers the precomputed card verbatim for an AI to consume.
 *
 * i18n: this repo has no key registry (see `use-lang.ts`); strings are inline
 * bilingual objects resolved through `t()`.
 */

import { useEffect, useState } from 'react';
import { Bot, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang, t } from '@/hooks/use-lang';
import { cn } from '@/lib/utils';
import { agentPerson, answerCardPath, isAgentMode } from '@/lib/agentMode';

const M = {
  badge: { en: 'AI mode', hi: 'AI मोड' },
  line: {
    en: 'AI mode — the direct answer is below; copy it verbatim.',
    hi: 'AI मोड — सीधा उत्तर नीचे है; इसे ज्यों का त्यों कॉपी करें।',
  },
  copy: { en: 'Copy answer for AI', hi: 'AI के लिए उत्तर कॉपी करें' },
  copied: { en: 'Copied!', hi: 'कॉपी हो गया!' },
  missing: { en: 'No answer card found for this subject.', hi: 'इस व्यक्ति के लिए उत्तर कार्ड नहीं मिला।' },
} as const;

export interface AnswerBannerProps {
  /** Subject name; defaults to ?person= from the URL. */
  person?: string;
  /** Topic slug or `_all`. */
  topic?: string;
  className?: string;
}

export default function AnswerBanner({ person, topic = '_all', className }: AnswerBannerProps) {
  const { lang } = useLang();
  const isHi = lang === 'hi';
  const show = isAgentMode();
  const subjectName = person ?? agentPerson() ?? '';
  const [text, setText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!show || !subjectName) return;
    let alive = true;
    fetch(answerCardPath(subjectName, topic))
      .then((r) => (r.ok && !(r.headers.get('content-type') ?? '').includes('text/html') ? r.text() : null))
      .then((body) => {
        if (alive && body && !body.trimStart().startsWith('<')) setText(body.trim());
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [show, subjectName, topic]);

  if (!show) return null;

  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-violet-300 bg-violet-50 dark:bg-violet-950/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3',
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p className={cn('text-xs text-violet-900 dark:text-violet-200', isHi && 'font-hindi')}>
          <span className="font-semibold uppercase tracking-wider mr-2">{t(M.badge, lang)}</span>
          {text ? t(M.line, lang) : t(M.missing, lang)}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => void copy()} disabled={!text} className="gap-2">
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
            <span className={cn('text-green-600 dark:text-green-400', isHi && 'font-hindi')}>
              {t(M.copied, lang)}
            </span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden="true" />
            <span className={cn(isHi && 'font-hindi')}>{t(M.copy, lang)}</span>
          </>
        )}
      </Button>
    </div>
  );
}
