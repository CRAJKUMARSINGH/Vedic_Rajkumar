import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const Section: React.FC<{ title: string; body: React.ReactNode; idx: number }> = ({ title, body, idx }) => (
  <motion.section
    custom={idx}
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.15 }}
    className="rounded-2xl border border-amber-500/15 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8 shadow-[0_0_0_1px_rgba(251,191,36,0.06)_inset]"
  >
    <h2 className="text-xl sm:text-2xl font-bold text-amber-200 mb-4 flex items-center gap-2">
      <ScrollText className="w-5 h-5 text-amber-400" />
      {title}
    </h2>
    <div className="text-amber-50/85 leading-relaxed text-sm sm:text-base space-y-3">{body}</div>
  </motion.section>
);

const TermsPage: React.FC = () => {
  return (
    <div className="relative min-h-screen text-amber-50 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.10),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.10),_transparent_55%)] bg-[#0b0a13]">
      <div className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-amber-300/80 hover:text-amber-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <ScrollText className="w-9 h-9 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms of Service</h1>
          </div>
          <p className="text-amber-100/70 text-base sm:text-lg max-w-2xl">
            Vedic Rajkumar provides Jyotish (Vedic astrology) calculations and AI-assisted
            interpretations for personal, educational, and entertainment purposes. These terms
            govern your use of the platform.
          </p>
          <p className="mt-3 text-xs text-amber-200/50">
            Last updated: 29 August 2026 · Effective date: 29 August 2026
          </p>
        </motion.div>

        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-5 sm:p-6 mb-8 flex items-start gap-4">
          <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm sm:text-base text-amber-100/90 leading-relaxed">
            <strong className="text-amber-200">Disclaimer of liability and advice:</strong> Nothing
            on Vedic Rajkumar is a substitute for professional medical, psychological, legal,
            financial, investment, or certified Vedic counsel. All outputs are calculated with
            best-effort astronomical libraries and should be verified by a qualified Jyotish
            before acting. Use of the platform is at your own risk.
          </div>
        </div>

        <div className="space-y-5">
          <Section
            idx={1}
            title="1. Acceptance & Eligibility"
            body={
              <>
                <p>
                  By accessing <em>vedicrajkumar.com</em> or its subdomains, previews and apps,
                  you agree to these Terms, our Privacy Policy, and all applicable laws. If you
                  do not agree, please discontinue use.
                </p>
                <p>
                  You must be at least 18 years old, or the age of majority in your jurisdiction,
                  to open an account. Minors may only use the service under the supervision of a
                  parent or legal guardian who consents on their behalf.
                </p>
              </>
            }
          />

          <Section
            idx={2}
            title="2. Accounts, Passwords & Acceptable Use"
            body={
              <>
                <p>
                  You are responsible for safeguarding your Clerk login credentials and for all
                  activity that occurs under your account. Notify us immediately of any
                  unauthorised use.
                </p>
                <p>
                  You agree not to: (a) reverse-engineer, scrape, bulk-download, or bot-access the
                  service; (b) submit false or impersonated birth data; (c) use the service for
                  harassment, hate speech, unlawful activity, or impersonating a certified
                  astrologer without disclosing your status.
                </p>
              </>
            }
          />

          <Section
            idx={3}
            title="3. Services, Subscriptions & Payments"
            body={
              <>
                <p>
                  Free-tier features are provided as-is. Paid tiers (if any) are billed via
                  Netlify, Stripe, or an equivalent processor and are non-refundable except where
                  consumer law requires otherwise.
                </p>
                <p>
                  We reserve the right to modify, discontinue, or throttle features at any time
                  on reasonable notice. Downtime for maintenance or deployments does not count
                  toward service credits unless explicitly stated in a written enterprise
                  agreement.
                </p>
              </>
            }
          />

          <Section
            idx={4}
            title="4. Intellectual Property & User Content"
            body={
              <>
                <p>
                  All software, designs, copy, art, and Ganesha/A4 motif PDF templates created by
                  Vedic Rajkumar are the property of Rajkumar Singh / Vedic Rajkumar unless
                  otherwise noted. You may download reports for personal, non-commercial use.
                </p>
                <p>
                  You retain ownership of your birth data, questions, and any user-generated
                  content you upload. By submitting content to AI features, you grant us a
                  limited, revocable license to process it solely for the purpose of generating
                  your reading — never for training without explicit opt-in.
                </p>
              </>
            }
          />

          <Section
            idx={5}
            title="5. Accuracy of Calculations & AI Interpretations"
            body={
              <>
                <p>
                  Planetary positions and dashas use the Lahiri ayanamsa and are computed via
                  Swiss Ephemeris bindings to best-effort engineering standards. No astrological
                  software is 100% infallible: time-of-birth uncertainty, latitude/longitude
                  resolution, and ayanamsa edge cases can produce minor variances vs. desktop
                  panchang software.
                </p>
                <p>
                  AI outputs are generative text, not certified Jyotish. Remedies, gemstones,
                  mantras, muhurat timings, and predictions are suggestive and should be
                  confirmed with a qualified, traditionally-trained Vedic astrologer.
                </p>
              </>
            }
          />

          <Section
            idx={6}
            title="6. Termination, Suspension & Governing Law"
            body={
              <>
                <p>
                  We may suspend or terminate accounts for Terms violations (fraud, abuse, repeat
                  copyright infringement) after a 7-day cure period where practical. You may
                  cancel your account at any time from account settings.
                </p>
                <p>
                  These Terms are governed by the laws of the Republic of India, and disputes
                  shall be subject to the exclusive jurisdiction of courts in Jaipur, Rajasthan.
                </p>
              </>
            }
          />

          <Section
            idx={7}
            title="7. Miscellaneous"
            body={
              <>
                <p>
                  These Terms (read with the Privacy Policy) constitute the entire agreement
                  between you and Vedic Rajkumar. No waiver of any term is effective unless in
                  writing. If any clause is found unenforceable, the rest remain in full force.
                </p>
                <p>
                  Queries and legal notices: legal@vedicrajkumar.com
                </p>
              </>
            }
          />
        </div>

        <footer className="mt-12 text-center text-amber-200/40 text-xs sm:text-sm">
          © {new Date().getFullYear()} Vedic Rajkumar · Om Tat Sat
        </footer>
      </div>
    </div>
  );
};

export default TermsPage;
