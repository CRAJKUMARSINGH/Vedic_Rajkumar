/**
 * UpgradeBanner — sticky top banner for free users + Pro badge for Pro users.
 * Also exports <ProGate> for wrapping premium features.
 */
import { useState } from "react";
import { Zap, X, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isPro, getCurrentPlan, getSubscription } from "@/services/subscriptionService";
import { Link } from "react-router-dom";

interface BannerProps {
  isHi?: boolean;
}

export function UpgradeBanner({ isHi = false }: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const pro = isPro();
  const sub = getSubscription();

  if (dismissed) return null;

  if (pro) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className={`flex items-center gap-2 ${isHi ? "font-hindi" : ""}`}>
          <Star className="w-4 h-4 fill-white" />
          <span className="font-semibold">
            {isHi ? `⚡ प्रो सक्रिय` : `⚡ Pro Active`}
          </span>
          {sub?.name && (
            <span className="text-amber-100">
              {isHi ? `· नमस्ते, ${sub.name}!` : `· Welcome, ${sub.name}!`}
            </span>
          )}
        </div>
        <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
      <div className={`flex items-center gap-2 flex-wrap ${isHi ? "font-hindi" : ""}`}>
        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-slate-200">
          {isHi
            ? "निःशुल्क प्लान: 3 प्रश्न/दिन · असीमित के लिए प्रो अपग्रेड करें"
            : "Free plan: 3 questions/day · Upgrade to Pro for unlimited access"}
        </span>
        <Link to="/pricing">
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white h-7 px-3 text-xs">
            <Sparkle className="w-3 h-3 mr-1" />
            {isHi ? "₹499/माह" : "₹499/mo — Upgrade"}
          </Button>
        </Link>
      </div>
      <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-white shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function Sparkle({ className }: { className?: string }) {
  return <Zap className={className} />;
}

interface ProBadgeProps {
  isHi?: boolean;
  className?: string;
}

export function ProBadge({ isHi = false, className = "" }: ProBadgeProps) {
  return (
    <Badge className={`bg-amber-500 text-white border-0 text-xs ${className}`}>
      <Star className="w-3 h-3 mr-0.5 fill-white" />
      {isHi ? "प्रो" : "Pro"}
    </Badge>
  );
}

interface ProGateProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  isHi?: boolean;
}

export function ProGate({ children, fallback, isHi = false }: ProGateProps) {
  if (isPro()) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <span className={`font-semibold text-amber-800 ${isHi ? "font-hindi" : ""}`}>
          {isHi ? "यह सुविधा प्रो प्लान में उपलब्ध है" : "This feature is available on Pro"}
        </span>
      </div>
      <p className={`text-sm text-amber-700 ${isHi ? "font-hindi" : ""}`}>
        {isHi
          ? "मात्र ₹499/माह में असीमित प्रश्न, PDF कुंडली, उन्नत दशा और बहुत कुछ।"
          : "Get unlimited questions, PDF charts, advanced Dasha & more — just ₹499/month."}
      </p>
      <Link to="/pricing">
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
          <Zap className="w-3 h-3 mr-1" />
          {isHi ? "अभी अपग्रेड करें" : "Upgrade Now"}
        </Button>
      </Link>
    </div>
  );
}

export default UpgradeBanner;
