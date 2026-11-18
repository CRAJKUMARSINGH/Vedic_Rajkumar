/**
 * PricingPage — /pricing
 * Beautiful Free vs Pro comparison with bilingual support and a warm Vedic
 * aesthetic. Upgrades go through the Stripe-backed billing service; the grade
 * itself comes from the single tier resolver, never from a tamperable plan value.
 */
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, X, Star, Zap, Shield, Clock,
  MessageCircle, Download, Users, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  activateFreePlan,
  PLANS, PRO_FEATURES, getSubscription,
} from "@/services/subscriptionService";
import { startCheckout, openBillingPortal, inferRegion } from "@/services/billingService";
import { currentTier } from "@/features/tier/resolveTier";

const HIGHLIGHTS = [
  {
    name: "Focused Scope",
    location: "4 Core Tools",
    text: "The app prioritizes Kundli, Prashna, Matchmaking, and Panchang — polished before broader modules graduate.",
    textHi: "ऐप केंद्रित है: कुंडली, प्रश्न, कुंडली मिलान और पंचांग — बाकी मॉड्यूल बाद में।",
    plan: "Approach",
  },
  {
    name: "Bilingual UX",
    location: "EN + HI",
    text: "Every reading and report is written natively in both English and Hindi for families and students.",
    textHi: "हर विश्लेषण और रिपोर्ट अंग्रेजी और हिंदी दोनों में उपलब्ध है।",
    plan: "Default",
  },
  {
    name: "Transparent Roadmap",
    location: "Honest Status",
    text: "Validation-in-progress and Coming Soon pages keep expectations clear instead of over-promising.",
    textHi: "वैलिडेशन की स्थिति और रोडमैप स्पष्ट रूप से दिखाई देते हैं।",
    plan: "Philosophy",
  },
];

const FAQS = [
  {
    q: "Is the free plan really free?",
    a: "Yes — always. No hidden charges, no expiry.",
    qHi: "क्या निःशुल्क प्लान सच में मुफ्त है?",
    aHi: "हाँ — हमेशा। कोई छुपा शुल्क नहीं, कोई समाप्ति तिथि नहीं।",
  },
  {
    q: "How do I activate Pro?",
    a: "Click Upgrade to Pro — you'll be taken to our secure Stripe checkout, with prices shown in your local currency.",
    qHi: "प्रो कैसे सक्रिय करें?",
    aHi: "‘प्रो में अपग्रेड करें’ पर क्लिक करें — सुरक्षित Stripe चेकआउट पर ले जाया जाएगा।",
  },
  {
    q: "What is the refund policy once billing goes live?",
    a: "Our target policy is a 30-day refund window for the paid tier; final terms will be published when billing launches.",
    qHi: "बिलिंग शुरू होने पर रिफंड नीति क्या होगी?",
    aHi: "लक्ष्य नीति 30 दिन की रिफंड विंडो है; अंतिम शर्तें बिलिंग लॉन्च पर प्रकाशित होंगी।",
  },
  {
    q: "Does Pro include Hindi answers?",
    a: "Yes — all analysis and reports are available in bilingual Hindi/English.",
    qHi: "क्या प्रो में हिंदी उत्तर शामिल हैं?",
    aHi: "हाँ — सभी विश्लेषण और रिपोर्ट द्विभाषी हिंदी/अंग्रेजी में उपलब्ध हैं।",
  },
];

export default function PricingPage() {
  const [isHi, setIsHi] = useState(false);
  const [activating, setActivating] = useState<"free" | null>(null);
  const [name, setName] = useState("");
  const [success, setSuccess] = useState<"free" | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  // Grade comes from the single tier resolver (server → seeded vr_tier → legacy
  // plan → free), never from a client-tamperable plan value on its own.
  const isPaid = currentTier() !== "free";
  const sub = getSubscription();

  const handleActivate = () => {
    if (!name.trim()) return;
    activateFreePlan(name.trim(), "");
    setActivating(null);
    setSuccess("free");
  };

  const handleCheckout = async () => {
    setBillingBusy(true);
    setBillingError(null);
    try {
      await startCheckout("pro", inferRegion()); // server owns the price id
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : "checkout_failed");
      setBillingBusy(false);
    }
  };

  const handlePortal = async () => {
    setBillingBusy(true);
    setBillingError(null);
    try {
      await openBillingPortal();
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : "portal_failed");
      setBillingBusy(false);
    }
  };

  const icons: Record<string, React.ReactNode> = {
    unlimited_questions: <MessageCircle className="w-4 h-4" />,
    all_jataks: <Users className="w-4 h-4" />,
    transit_alerts: <Clock className="w-4 h-4" />,
    pdf_export: <Download className="w-4 h-4" />,
    advanced_dasha: <Zap className="w-4 h-4" />,
    matchmaking_report: <Star className="w-4 h-4" />,
    annual_forecast: <Sparkles className="w-4 h-4" />,
    remedies_detailed: <Shield className="w-4 h-4" />,
    priority_support: <MessageCircle className="w-4 h-4" />,
    bilingual_reports: <CheckCircle2 className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Helmet>
        <title>{isHi ? "मूल्य निर्धारण — Vedic Rajkumar" : "Pricing — Vedic Rajkumar"}</title>
      </Helmet>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center text-sm text-amber-700 hover:text-amber-900 gap-1">
          <ArrowLeft className="w-4 h-4" />
          {isHi ? "होम" : "Home"}
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setIsHi(v => !v)}>
          {isHi ? "EN" : "हिं"}
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20 space-y-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {isHi ? "सरल और पारदर्शी मूल्य निर्धारण" : "Simple, transparent pricing"}
          </div>
          <h1 className={`text-4xl font-bold text-amber-900 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "अपना प्लान चुनें" : "Choose Your Plan"}
          </h1>
          <p className={`text-amber-800 max-w-2xl mx-auto text-lg ${isHi ? "font-hindi" : ""}`}>
            {isHi
              ? "शास्त्रीय वैदिक ज्योतिष को आधुनिक तकनीक के साथ — निःशुल्क शुरू करें, जब चाहें अपग्रेड करें।"
              : "Classical Vedic astrology meets modern technology. Start free, upgrade when you're ready."}
          </p>

          {isPaid && sub && (
            <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              <Star className="w-4 h-4 fill-white" />
              {isHi ? `⚡ ${sub.name}, आपका प्रो प्लान सक्रिय है!` : `⚡ Pro Active — Welcome, ${sub.name}!`}
            </div>
          )}
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className={`border-2 h-full ${!isPaid ? "border-slate-400" : "border-slate-200"}`}>
              <CardHeader className="bg-slate-50 rounded-t-xl pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-slate-800 ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? PLANS.free.nameHi : PLANS.free.name}
                  </CardTitle>
                  {!isPaid && (
                    <Badge className="bg-slate-600 text-white text-xs">
                      {isHi ? "वर्तमान" : "Current"}
                    </Badge>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-slate-800">₹0</span>
                  <span className={`text-slate-500 ml-1 text-sm ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? "/ हमेशा" : "/ forever"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <ul className="space-y-2.5">
                  {(isHi ? PLANS.free.featuresHi : PLANS.free.features).map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm text-slate-600 ${isHi ? "font-hindi" : ""}`}>
                      <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm text-slate-400">
                    <X className="w-4 h-4 mt-0.5 shrink-0" />
                    {isHi ? "प्रो सुविधाएं नहीं" : "No Pro features"}
                  </li>
                </ul>
                {activating === "free" ? (
                  <div className="space-y-2">
                    <Input placeholder={isHi ? "आपका नाम" : "Your name"} value={name} onChange={e => setName(e.target.value)} />
                    <Button onClick={handleActivate} disabled={!name.trim()} className="w-full">
                      {isHi ? "सक्रिय करें" : "Activate"}
                    </Button>
                  </div>
                ) : success === "free" ? (
                  <div className="text-center text-emerald-600 font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {isHi ? "सक्रिय!" : "Activated!"}
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => setActivating("free")} disabled={!isPaid}>
                    {!isPaid ? (isHi ? "सक्रिय प्लान" : "Current Plan") : (isHi ? "निःशुल्क पर जाएं" : "Switch to Free")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <Card className={`border-2 h-full relative ${isPaid ? "border-amber-500" : "border-amber-400"}`}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-amber-500 text-white border-0 px-4 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {isHi ? "अनुशंसित" : "Recommended"}
                </Badge>
              </div>
              <CardHeader className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-t-xl pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-amber-900 flex items-center gap-2 ${isHi ? "font-hindi" : ""}`}>
                    <Zap className="w-5 h-5 text-amber-500" />
                    {isHi ? PLANS.pro.nameHi : PLANS.pro.name}
                  </CardTitle>
                  {isPaid && (
                    <Badge className="bg-amber-500 text-white text-xs">
                      {isHi ? "सक्रिय" : "Active"}
                    </Badge>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-amber-900">₹499</span>
                  <span className={`text-amber-700 ml-1 text-sm ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? "/ माह (लक्ष्य)" : "/ month (target)"}
                  </span>
                  <span className="ml-2 text-xs text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded">
                    {isHi ? "सुरक्षित Stripe चेकआउट" : "Secure Stripe checkout"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <ul className="space-y-2.5">
                  <li className={`flex items-start gap-2 text-sm font-medium text-amber-800 ${isHi ? "font-hindi" : ""}`}>
                    <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    {isHi ? "निःशुल्क की सभी सुविधाएं" : "Everything in Free"}
                  </li>
                  {PRO_FEATURES.map(f => (
                    <li key={f.key} className={`flex items-start gap-2 text-sm text-amber-800 ${isHi ? "font-hindi" : ""}`}>
                      <span className="text-amber-500 mt-0.5 shrink-0">{icons[f.key] ?? <CheckCircle2 className="w-4 h-4" />}</span>
                      {isHi ? f.labelHi : f.label}
                    </li>
                  ))}
                </ul>

                {isPaid ? (
                  <Button
                    data-testid="manage-subscription"
                    variant="outline"
                    className="w-full border-amber-300 text-amber-800 hover:bg-amber-50"
                    onClick={handlePortal}
                    disabled={billingBusy}
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    {isHi ? "सदस्यता प्रबंधित करें" : "Manage subscription"}
                  </Button>
                ) : (
                  <Button
                    data-testid="plan-cta-pro"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={handleCheckout}
                    disabled={billingBusy}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    {isHi ? "प्रो में अपग्रेड करें" : "Upgrade to Pro"}
                  </Button>
                )}
                {billingError && (
                  <p className="text-xs text-red-600 text-center" role="alert">
                    {isHi ? "भुगतान शुरू नहीं हो सका। पुनः प्रयास करें।" : "Could not start billing. Please try again."}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feature comparison table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className={`text-2xl font-bold text-amber-900 text-center mb-6 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "विस्तृत तुलना" : "Full Feature Comparison"}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-50 border-b border-amber-200">
                  <th className={`text-left px-4 py-3 text-amber-900 font-semibold ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? "सुविधा" : "Feature"}
                  </th>
                  <th className={`text-center px-4 py-3 text-slate-700 font-semibold ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? "निःशुल्क" : "Free"}
                  </th>
                  <th className={`text-center px-4 py-3 text-amber-700 font-semibold ${isHi ? "font-hindi" : ""}`}>
                    <Zap className="inline w-4 h-4 mr-1" />
                    {isHi ? "प्रो" : "Pro"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {[
                  { feature: "Prashna questions/day", featureHi: "प्रश्न प्रतिदिन", free: "3", pro: "Unlimited" },
                  { feature: "Enrolled jataks", featureHi: "जातक", free: "4", pro: "Unlimited" },
                  { feature: "Kundli & Panchang", featureHi: "कुंडली और पंचांग", free: "✓", pro: "✓" },
                  { feature: "Bilingual answers", featureHi: "द्विभाषी उत्तर", free: "Basic", pro: "Full reports" },
                  { feature: "Transit analysis", featureHi: "गोचर विश्लेषण", free: "Basic", pro: "Advanced + Alerts" },
                  { feature: "PDF export", featureHi: "PDF निर्यात", free: "—", pro: "✓" },
                  { feature: "Dasha timeline", featureHi: "दशा समयरेखा", free: "Basic", pro: "Full Antardasha" },
                  { feature: "Matchmaking report", featureHi: "कुंडली मिलान रिपोर्ट", free: "Preview", pro: "Full 36-guna" },
                  { feature: "Annual forecast", featureHi: "वार्षिक वर्षफल", free: "—", pro: "✓" },
                  { feature: "Priority support", featureHi: "प्राथमिकता सहायता", free: "—", pro: "WhatsApp" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-amber-50/50">
                    <td className={`px-4 py-3 text-slate-700 ${isHi ? "font-hindi" : ""}`}>
                      {isHi ? row.featureHi : row.feature}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">{row.free}</td>
                    <td className="px-4 py-3 text-center text-amber-700 font-medium">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Product Highlights */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className={`text-2xl font-bold text-amber-900 text-center mb-6 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "क्या अपेक्षा करें" : "What to expect"}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {HIGHLIGHTS.map((t, i) => (
              <Card key={i} className="border-amber-200 bg-white">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                      {isHi ? (t.plan === "Approach" ? "दृष्टिकोण" : t.plan === "Default" ? "डिफ़ॉल्ट" : "दर्शन") : t.plan}
                    </p>
                  </div>
                  <p className={`text-sm text-slate-600 mb-3 ${isHi ? "font-hindi" : ""}`}>
                    "{isHi ? t.textHi : t.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.location}</p>
                    </div>
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                      {isHi ? "महत्वपूर्ण" : "Focus"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <h2 className={`text-2xl font-bold text-amber-900 text-center mb-6 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "सामान्य प्रश्न" : "Frequently Asked Questions"}
          </h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {FAQS.map((faq, i) => (
              <Card key={i} className="border-amber-100">
                <CardContent className="pt-4 pb-4">
                  <p className={`font-semibold text-amber-900 mb-1 ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? faq.qHi : faq.q}
                  </p>
                  <p className={`text-sm text-slate-600 ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? faq.aHi : faq.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA bottom */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-center space-y-4"
        >
          <h2 className={`text-2xl font-bold text-amber-900 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "आज ही शुरू करें" : "Start today"}
          </h2>
          <p className={`text-amber-700 ${isHi ? "font-hindi" : ""}`}>
            {isHi
              ? "शास्त्रीय ज्योतिष का लाभ उठाएं — निःशुल्क, बिना किसी झिझक के।"
              : "Experience classical astrology — free, with no commitment."}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/question">
              <Button size="lg" variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-50">
                {isHi ? "प्रश्न पूछें" : "Ask a Question"}
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => (isPaid ? handlePortal() : handleCheckout())}
              disabled={billingBusy}
            >
              <Zap className="w-4 h-4 mr-1" />
              {isPaid
                ? (isHi ? "सदस्यता प्रबंधित करें" : "Manage subscription")
                : (isHi ? "प्रो में अपग्रेड करें" : "Upgrade to Pro")}
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
