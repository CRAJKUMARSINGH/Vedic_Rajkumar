/**
 * WelcomeModal — shown once on first visit / after profile setup.
 * Markets the Pro plan with a warm, bilingual tone.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, CheckCircle2, X, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  activateFreePlan,
  activateProPlan,
  markWelcomeSeen,
  PLANS,
} from "@/services/subscriptionService";

interface Props {
  open: boolean;
  onClose: () => void;
  isHi?: boolean;
}

export default function WelcomeModal({ open, onClose, isHi = false }: Props) {
  const [step, setStep] = useState<"welcome" | "register">("welcome");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [done, setDone] = useState(false);

  const handleStart = (chosen: "free" | "pro") => {
    setPlan(chosen);
    setStep("register");
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (plan === "pro") {
      activateProPlan(name.trim(), email.trim(), "welcome_modal");
    } else {
      activateFreePlan(name.trim(), email.trim());
    }
    markWelcomeSeen();
    setDone(true);
    setTimeout(onClose, 1800);
  };

  const dismiss = () => { markWelcomeSeen(); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            {/* Decorative header gradient */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-8 pt-8 pb-6 text-white relative">
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🕉️</span>
                <div>
                  <h2 className={`text-2xl font-bold leading-tight ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? "वैदिक ज्योतिष में आपका स्वागत है!" : "Welcome to Vedic Rajkumar!"}
                  </h2>
                  <p className={`text-amber-100 text-sm mt-0.5 ${isHi ? "font-hindi" : ""}`}>
                    {isHi
                      ? "प्रश्न मार्ग • जन्म कुंडली • गोचर फल • द्विभाषी उत्तर"
                      : "Prashna Marga · Kundli · Gochar Phal · Bilingual Answers"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Prasna Marga", "Swiss Ephemeris", "17 Jataks", "Hindi + English"].map(t => (
                  <Badge key={t} className="bg-white/20 text-white border-white/30 text-xs">{t}</Badge>
                ))}
              </div>
            </div>

            <div className="px-8 py-6">
              {done ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  <p className={`text-lg font-semibold text-slate-800 ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? "शानदार! आप तैयार हैं।" : "All set! Welcome aboard."}
                  </p>
                </div>
              ) : step === "welcome" ? (
                <>
                  <p className={`text-slate-600 mb-6 text-sm leading-relaxed ${isHi ? "font-hindi" : ""}`}>
                    {isHi
                      ? "यह ऐप शास्त्रीय प्रश्न मार्ग और स्विस एफिमेरिस पर आधारित है। निःशुल्क या प्रो प्लान चुनें:"
                      : "This app is built on classical Prasna Marga and Swiss Ephemeris. Choose a plan to get started:"}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {/* Free card */}
                    <div className="border-2 border-slate-200 rounded-xl p-5 hover:border-slate-400 transition-colors cursor-pointer group" onClick={() => handleStart("free")}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold text-slate-800 text-lg ${isHi ? "font-hindi" : ""}`}>
                          {isHi ? PLANS.free.nameHi : PLANS.free.name}
                        </span>
                        <span className="text-slate-500 font-semibold">₹0</span>
                      </div>
                      <ul className="space-y-1.5 mb-4">
                        {(isHi ? PLANS.free.featuresHi : PLANS.free.features).map((f, i) => (
                          <li key={i} className={`text-xs text-slate-600 flex items-start gap-1.5 ${isHi ? "font-hindi" : ""}`}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-slate-100">
                        {isHi ? "निःशुल्क शुरू करें" : "Start Free"}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>

                    {/* Pro card */}
                    <div className="border-2 border-amber-400 rounded-xl p-5 bg-gradient-to-br from-amber-50 to-orange-50 cursor-pointer group relative" onClick={() => handleStart("pro")}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-amber-500 text-white border-0 text-xs px-3 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          {isHi ? "सबसे लोकप्रिय" : "Most Popular"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold text-amber-900 text-lg flex items-center gap-1 ${isHi ? "font-hindi" : ""}`}>
                          <Zap className="w-4 h-4 text-amber-500" />
                          {isHi ? PLANS.pro.nameHi : PLANS.pro.name}
                        </span>
                        <span className="text-amber-700 font-bold">₹499<span className="text-xs font-normal">/mo</span></span>
                      </div>
                      <ul className="space-y-1.5 mb-4">
                        {(isHi ? PLANS.pro.featuresHi : PLANS.pro.features).slice(0, 6).map((f, i) => (
                          <li key={i} className={`text-xs text-amber-800 flex items-start gap-1.5 ${isHi ? "font-hindi" : ""}`}>
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                        <li className="text-xs text-amber-600 italic">
                          {isHi ? `…और ${PLANS.pro.features.length - 6} अन्य सुविधाएं` : `…and ${PLANS.pro.features.length - 6} more`}
                        </li>
                      </ul>
                      <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {isHi ? "प्रो अपग्रेड करें" : "Upgrade to Pro"}
                      </Button>
                    </div>
                  </div>

                  <p className="text-center text-xs text-slate-400">
                    {isHi
                      ? "कोई क्रेडिट कार्ड आवश्यक नहीं • कभी भी रद्द करें"
                      : "No credit card required • Cancel anytime"}
                  </p>
                </>
              ) : (
                /* Register step */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={plan === "pro" ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700"}>
                      {plan === "pro"
                        ? (isHi ? "⚡ प्रो प्लान" : "⚡ Pro Plan")
                        : (isHi ? "निःशुल्क प्लान" : "Free Plan")}
                    </Badge>
                  </div>
                  <p className={`text-slate-600 text-sm ${isHi ? "font-hindi" : ""}`}>
                    {isHi
                      ? "अपना नाम दर्ज करें ताकि हम आपको व्यक्तिगत उत्तर दे सकें:"
                      : "Enter your name so we can personalise your readings:"}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="wm-name" className={isHi ? "font-hindi" : ""}>
                        {isHi ? "नाम *" : "Name *"}
                      </Label>
                      <Input
                        id="wm-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={isHi ? "आपका नाम" : "Your name"}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wm-email" className={isHi ? "font-hindi" : ""}>
                        {isHi ? "ईमेल (वैकल्पिक)" : "Email (optional)"}
                      </Label>
                      <Input
                        id="wm-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={isHi ? "ईमेल पता" : "Email address"}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {plan === "pro" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                      <p className="font-semibold mb-1">
                        {isHi ? "💳 भुगतान विवरण" : "💳 Payment details"}
                      </p>
                      <p className={isHi ? "font-hindi" : ""}>
                        {isHi
                          ? "UPI / नेटबैंकिंग के माध्यम से ₹499/माह। 30 दिन की मनी-बैक गारंटी।"
                          : "₹499/month via UPI / Netbanking. 30-day money-back guarantee."}
                      </p>
                      <p className="mt-1 italic text-amber-600">
                        {isHi
                          ? "(डेमो में, प्रो तुरंत सक्रिय होता है — वास्तविक भुगतान गेटवे जल्द आएगा)"
                          : "(Demo mode — Pro activates instantly. Real payment gateway coming soon)"}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep("welcome")}>
                      {isHi ? "वापस" : "Back"}
                    </Button>
                    <Button
                      size="sm"
                      className={plan === "pro"
                        ? "flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                        : "flex-1"}
                      onClick={handleSubmit}
                      disabled={!name.trim()}
                    >
                      {plan === "pro"
                        ? (isHi ? "⚡ प्रो सक्रिय करें" : "⚡ Activate Pro")
                        : (isHi ? "शुरू करें" : "Get Started")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
