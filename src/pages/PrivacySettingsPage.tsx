/**
 * PrivacySettingsPage.tsx
 *
 * Week 3: Security UI support — user-facing privacy controls.
 *
 * Route: /privacy-settings
 *
 * Three sections:
 *   1. Privacy consent      — view / grant / revoke / reset consent preferences.
 *   2. Export your data     — self-service JSON export via user-data-export edge fn.
 *   3. Delete your data     — irreversible multi-step delete via user-data-delete edge fn.
 *
 * Accessibility:
 *   - aria-live regions for all loading/success/error status blocks.
 *   - Destructive delete button is gated by checkboxes + typed "DELETE" confirmation.
 *   - All controls have descriptive labels or aria-labels.
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  Trash2,
  Clock,
} from 'lucide-react';
import { useSession } from '@clerk/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SEO } from '@/components/SEO';

import { useConsent } from '@/hooks/useConsent';
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase';
import { exportAndDownloadUserData, type ExportedUserData } from '@/services/dataExportService';
import { deleteUserData, type DeleteResult } from '@/services/dataDeleteService';

// ─── Formatting helpers ──────────────────────────────────────────────────────

function formatLocalDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Section 1: Consent management ───────────────────────────────────────────

function ConsentSection() {
  const { consentRecord, hasConsented, hasDismissed, giveConsent, declineConsent, clearConsent } = useConsent();

  const badge = useMemo(() => {
    if (!hasDismissed) {
      return { variant: 'outline' as const, label: 'Not yet decided · अभी निर्णय नहीं हुआ', tone: 'bg-amber-500/10 text-amber-300 border-amber-500/40' };
    }
    if (hasConsented) {
      return { variant: 'secondary' as const, label: 'Consent given · सहमति दी गई', tone: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40' };
    }
    return { variant: 'destructive' as const, label: 'Not given · सहमति नहीं', tone: 'bg-rose-500/10 text-rose-300 border-rose-500/40' };
  }, [hasDismissed, hasConsented]);

  return (
    <Card className="border-amber-500/20 bg-gradient-to-b from-amber-500/[0.04] to-transparent">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" aria-hidden />
            <CardTitle className="text-lg">Privacy Consent · गोपनीयता सहमति</CardTitle>
          </div>
          <CardDescription className="mt-1 text-sm leading-relaxed">
            We rely on essential cookies to run this app, and optional analytics to understand how it is used.
            Birth details remain owner-scoped and never leave your control. Change your choice at any time.
            <br />
            <span className="text-amber-200/70">
              हम इस ऐप को चलाने के लिए आवश्यक कुकीज़ और वैकल्पिक विश्लेषण का उपयोग करते हैं। कुंडली का डेटा हमेशा आपके
              नियंत्रण में रहता है। किसी भी समय अपनी पसंद बदलें।
            </span>
          </CardDescription>
        </div>
        <Badge className={`shrink-0 ${badge.tone}`} variant={badge.variant}>
          {badge.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-amber-50">Essential · आवश्यक</div>
              <div className="text-xs text-amber-100/60">Always enabled · Required for the app to function.</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
            <Badge variant="outline" className={`shrink-0 ${hasConsented ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40' : 'bg-stone-500/10 text-stone-300 border-stone-500/40'}`}>
              {hasConsented ? 'Enabled · सक्रिय' : 'Disabled · निष्क्रिय'}
            </Badge>
            <div className="flex-1">
              <div className="font-medium text-amber-50">Optional analytics · वैकल्पिक विश्लेषण</div>
              <div className="text-xs text-amber-100/60">
                Help us improve by sharing anonymous usage data. No birth data is ever included.
              </div>
            </div>
          </div>
        </div>

        {consentRecord?.timestamp && (
          <div className="text-xs text-amber-100/60 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Last updated · अंतिम बार अपडेट किया: <span className="text-amber-50">{formatLocalDateTime(consentRecord.timestamp)}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={giveConsent} size="sm" className="bg-amber-400 text-stone-900 hover:bg-amber-300">
            Accept optional · स्वीकार करें
          </Button>
          <Button onClick={declineConsent} size="sm" variant="secondary">
            Decline optional · अस्वीकार करें
          </Button>
          <Button onClick={clearConsent} size="sm" variant="outline" className="border-white/20">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Ask me again · फिर से पूछें
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section 2: Export user data ─────────────────────────────────────────────

function ExportSection() {
  const supabase = useAuthenticatedSupabase();
  const { session } = useSession();
  const isSignedIn = !!session?.user;

  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState<ExportedUserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    setSuccess(null);
    setExporting(true);
    try {
      await exportAndDownloadUserData(supabase);
      setSuccess({
        exportedAt: new Date().toISOString(),
        userId: session?.user?.id ?? '',
        userProfile: true,
        savedReadings: [],
        prashnaSessions: [],
        horoscopeAnalyses: [],
        transitReadings: [],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed. Please try again later.';
      setError(msg);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card className="border-amber-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-400" aria-hidden />
          <CardTitle className="text-lg">Export Your Data · अपना डेटा निर्यात करें</CardTitle>
        </div>
        <CardDescription className="mt-1 text-sm leading-relaxed">
          Request a JSON file with everything the app has stored on your behalf — saved readings, prashna sessions,
          horoscope analyses, transit reports, and your profile record.
          <br />
          <span className="text-amber-200/70">
            एक JSON फ़ाइल का अनुरोध करें जिसमें सभी संग्रहीत रीडिंग, प्रश्न सत्र, कुंडली विश्लेषण, गोचर रिपोर्ट और आपका
            प्रोफ़ाइल रिकॉर्ड हो।
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="grid gap-1.5 text-xs text-amber-100/70 sm:grid-cols-2">
          <li>• Saved kundli readings · सहेजी गई कुंडली</li>
          <li>• Prashna / horary sessions · प्रश्न सत्र</li>
          <li>• Horoscope analyses · जन्म विश्लेषण</li>
          <li>• Transit reports · गोचर रिपोर्ट</li>
          <li className="sm:col-span-2">• Profile / account record · प्रोफ़ाइल रिकॉर्ड</li>
        </ul>

        <div className="text-xs text-amber-100/60 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Rate limit · दर सीमा: 5 exports per user per hour · प्रति घंटा 5 निर्यात
        </div>

        {!isSignedIn ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1 text-sm text-amber-50">
              Sign in to export your stored data · संग्रहीत डेटा निर्यात करने के लिए साइन इन करें।
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 border-white/20">
              <Link to="/sign-in">
                Sign in · साइन इन <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-amber-400 text-stone-900 hover:bg-amber-300"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing export · तैयार हो रहा है…
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Request data export · निर्यात का अनुरोध करें
              </>
            )}
          </Button>
        )}

        <div aria-live="polite" className="space-y-2 pt-1">
          {success && (
            <Alert variant="default" className="border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <AlertTitle className="text-emerald-200">Export started · निर्यात शुरू</AlertTitle>
              <AlertDescription className="text-emerald-200/80 text-xs">
                Your browser is downloading <span className="font-mono">vedic-data-export-…json</span>.
                If nothing downloads in a few seconds, check your browser download tray.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="default" className="border-rose-500/30 bg-rose-500/10">
              <XCircle className="w-4 h-4 text-rose-400" />
              <AlertTitle className="text-rose-200">Export failed · निर्यात विफल</AlertTitle>
              <AlertDescription className="text-rose-200/80 text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section 3: Delete user data ─────────────────────────────────────────────

const DELETE_CONFIRM_TEXT = 'DELETE';

function DeleteSection() {
  const supabase = useAuthenticatedSupabase();
  const { session } = useSession();
  const isSignedIn = !!session?.user;

  const [ackUndo, setAckUndo] = useState(false);
  const [ackExported, setAckExported] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<DeleteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typedOk = typed.trim().toUpperCase() === DELETE_CONFIRM_TEXT;
  const canSubmit = isSignedIn && ackUndo && ackExported && typedOk && !deleting;

  async function handleDelete() {
    if (!canSubmit) return;
    setError(null);
    setResult(null);
    setDeleting(true);
    try {
      const r = await deleteUserData(supabase);
      setResult(r);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed. Please try again later.';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="border-rose-500/30 bg-gradient-to-b from-rose-500/[0.04] to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-400" aria-hidden />
          <CardTitle className="text-lg text-rose-100">Delete Your Data · अपना डेटा हटाएं</CardTitle>
        </div>
        <CardDescription className="mt-1 text-sm leading-relaxed">
          Permanently remove every record the app has stored on your behalf. <strong>This action cannot be undone</strong>.
          Export your data first if you want to keep anything.
          <br />
          <span className="text-rose-200/70">
            ऐप में संग्रहीत आपके सभी रिकॉर्ड स्थायी रूप से हटा दिए जाएंगे। <strong>यह क्रिया पूर्ववत नहीं की जा सकती</strong>।
            कुछ भी रखना चाहते हैं तो पहले निर्यात करें।
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert variant="default" className="border-rose-500/40 bg-rose-500/10">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <AlertTitle className="text-rose-200">Irreversible · अपरिवर्तनीय</AlertTitle>
          <AlertDescription className="text-rose-200/80 text-xs">
            Deleting removes: saved kundli readings, prashna/horary sessions, horoscope analyses, transit reports,
            and your profile record. Nothing is retained on our servers after deletion completes.
          </AlertDescription>
        </Alert>

        <ul className="grid gap-1.5 text-xs text-rose-100/75 sm:grid-cols-2">
          <li>• Saved kundli readings · सहेजी गई कुंडली रीडिंग</li>
          <li>• Prashna / horary sessions · प्रश्न / घटित सत्र</li>
          <li>• Horoscope analyses · जन्म विश्लेषण</li>
          <li>• Transit readings & reports · गोचर रिपोर्ट</li>
          <li className="sm:col-span-2">• Profile / account record · प्रोफ़ाइल / खाता रिकॉर्ड</li>
        </ul>

        {!isSignedIn ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1 text-sm text-amber-50">
              Sign in to delete your stored data · संग्रहीत डेटा हटाने के लिए साइन इन करें।
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 border-white/20">
              <Link to="/sign-in">
                Sign in · साइन इन <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                <Checkbox
                  id="ack-undo"
                  checked={ackUndo}
                  onCheckedChange={(v) => setAckUndo(v === true)}
                  className="mt-0.5 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                />
                <Label htmlFor="ack-undo" className="text-sm text-amber-50 cursor-pointer leading-snug">
                  I understand this action cannot be undone ·
                  <span className="text-rose-200/80"> मुझे समझ में आया कि यह क्रिया पूर्ववत नहीं की जा सकती।</span>
                </Label>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                <Checkbox
                  id="ack-exported"
                  checked={ackExported}
                  onCheckedChange={(v) => setAckExported(v === true)}
                  className="mt-0.5 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                />
                <Label htmlFor="ack-exported" className="text-sm text-amber-50 cursor-pointer leading-snug">
                  I have exported any data I want to keep, or I do not want to keep it ·
                  <span className="text-rose-200/80"> मैंने अपना डेटा निर्यात कर लिया है या मैं इसे नहीं रखना चाहता।</span>
                </Label>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-black/20 border border-white/5">
                <Label htmlFor="delete-type" className="text-sm text-amber-50">
                  Type <span className="font-mono font-bold text-rose-300">{DELETE_CONFIRM_TEXT}</span> to confirm ·
                  <span className="text-rose-200/80"> पुष्टि करने के लिए <span className="font-mono font-bold">{DELETE_CONFIRM_TEXT}</span> टाइप करें</span>
                </Label>
                <Input
                  id="delete-type"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  disabled={deleting || !(ackUndo && ackExported)}
                  placeholder={ackUndo && ackExported ? 'DELETE' : 'Tick checkboxes above first'}
                  className={
                    typedOk
                      ? 'border-emerald-500/50 focus-visible:ring-emerald-500/50'
                      : 'border-white/10 focus-visible:ring-rose-500/50'
                  }
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="delete-type-desc"
                />
                <div id="delete-type-desc" className="text-[11px] text-amber-100/50">
                  Exact match required · मिलान आवश्यक है।
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-rose-200/70 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Rate limit · दर सीमा: 3 deletes per user per day · प्रति दिन 3 हटाने की अनुमति
              </div>
              <Button
                onClick={handleDelete}
                disabled={!canSubmit}
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-500 text-white self-start sm:self-auto"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting · हटाया जा रहा है…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete all my data permanently · मेरा सारा डेटा स्थायी रूप से हटाएं
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        <div aria-live="polite" className="space-y-2 pt-1">
          {result && (
            <Alert variant="default" className="border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <AlertTitle className="text-emerald-200">Deletion complete · हटाना पूर्ण</AlertTitle>
              <AlertDescription className="text-emerald-200/80 text-xs space-y-1">
                <div>Deleted at · हटाने का समय: {formatLocalDateTime(result.deletedAt)}</div>
                <ul className="grid gap-0.5 sm:grid-cols-2 pt-1">
                  <li>• Saved readings · सहेजी गई रीडिंग: <b>{result.deleted.saved_readings}</b></li>
                  <li>• Transit readings · गोचर रीडिंग: <b>{result.deleted.transit_readings}</b></li>
                  <li>• Prashna sessions · प्रश्न सत्र: <b>{result.deleted.prashna_sessions}</b></li>
                  <li>• Horoscope analyses · जन्म विश्लेषण: <b>{result.deleted.horoscope_analyses}</b></li>
                  <li className="sm:col-span-2">• Profile record · प्रोफ़ाइल: <b>{result.deleted.user_profile}</b></li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="default" className="border-rose-500/30 bg-rose-500/10">
              <XCircle className="w-4 h-4 text-rose-400" />
              <AlertTitle className="text-rose-200">Delete failed · हटाना विफल</AlertTitle>
              <AlertDescription className="text-rose-200/80 text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PrivacySettingsPage: React.FC = () => {
  return (
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Privacy Settings · गोपनीयता सेटिंग्स | Vedic Rajkumar"
        description="Manage consent, export your data, or permanently delete your account data. आपकी गोपनीयता — आपकी पसंद।"
      />

      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" aria-hidden />
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-50 tracking-tight">
              Privacy Settings · गोपनीयता सेटिंग्स
            </h1>
          </div>
          <p className="text-sm text-amber-100/70 leading-relaxed max-w-2xl">
            Your birth data and saved readings are always owner-scoped. Use the controls below to manage consent,
            export a copy of your stored data, or permanently erase everything the app holds for you.
            <br />
            <span className="text-amber-100/60">
              आपके कुंडली और रीडिंग हमेशा आपके नियंत्रण में हैं। सहमति प्रबंधित करें, डेटा की प्रति निर्यात करें,
              या सब कुछ स्थायी रूप से हटाएं।
            </span>
          </p>
        </header>

        <ConsentSection />
        <ExportSection />
        <DeleteSection />

        <footer className="pt-4 text-xs text-amber-100/50 space-y-1">
          <div>
            Read the full{' '}
            <Link to="/privacy" className="underline underline-offset-2 text-amber-300 hover:text-amber-200">
              Privacy Policy · गोपनीयता नीति
            </Link>{' '}
            and{' '}
            <Link to="/terms" className="underline underline-offset-2 text-amber-300 hover:text-amber-200">
              Terms of Service · सेवा की शर्तें
            </Link>
            .
          </div>
        </footer>
      </div>
    </main>
  );
};

export default PrivacySettingsPage;
