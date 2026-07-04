/**
 * FeedbackEmailWidget — floating feedback button that sends email to
 * crajkumarsingh@hotmail.com via FormSubmit.co (no backend required).
 *
 * Usage: drop <FeedbackEmailWidget /> anywhere in a layout component.
 */
import { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RECIPIENT = 'crajkumarsingh@hotmail.com';
// FormSubmit.co endpoint — replace with the hash after first activation
const FORMSUBMIT_URL = `https://formsubmit.co/${RECIPIENT}`;

export function FeedbackEmailWidget() {
  const [open, setOpen]       = useState(false);
  const [sent, setSent]       = useState(false);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name:    name || 'Anonymous',
          email:   email || 'no-reply@vedic-rajkumar.app',
          message,
          _subject: `Vedic Rajkumar Feedback from ${name || 'Anonymous'}`,
          _captcha: 'false',
        }),
      });
      setSent(true);
      setTimeout(() => { setSent(false); setOpen(false); setName(''); setEmail(''); setMessage(''); }, 3000);
    } catch {
      // silently fail — user can try again
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Send feedback"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg hover:bg-amber-400 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black"
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>

      {/* Feedback panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Send feedback"
          className="fixed bottom-20 right-6 z-50 w-80 rounded-xl border border-white/10 bg-[#111722] shadow-2xl shadow-black/50"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="text-sm font-bold text-white">Send Feedback</div>
              <div className="text-[10px] text-slate-400">→ {RECIPIENT}</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              <div className="text-sm font-bold text-white">Thank you!</div>
              <div className="text-xs text-slate-400">Your feedback has been sent.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 p-4">
              <div>
                <Label className="text-xs text-slate-400">Name (optional)</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 bg-black/20 border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Email (optional)</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="For a reply"
                  className="mt-1 bg-black/20 border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Message <span className="text-rose-400">*</span></Label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={3}
                  placeholder="Your feedback, bug report, or suggestion..."
                  className="mt-1 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm"
              >
                {sending ? 'Sending…' : <><Send className="mr-2 h-4 w-4" /> Send Feedback</>}
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default FeedbackEmailWidget;
