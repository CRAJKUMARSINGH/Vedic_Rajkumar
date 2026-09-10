import { useState } from "react";
import { Info, X, FlaskConical, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface BannerProps {
  isHi?: boolean;
  showValidation?: boolean;
}

export function PrototypeStatusBanner({
  isHi = false,
  showValidation = true,
}: BannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("protoBannerDismissed") === "1";
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("protoBannerDismissed", "1");
    } catch {
      /* ignore */
    }
  };

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 border-b border-indigo-100">
      <div className="max-w-screen-2xl mx-auto px-4 py-2.5 flex items-start sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <Badge className="bg-indigo-600 text-white border-0 text-[10px] px-2 py-0.5">
              <FlaskConical className="w-3 h-3 mr-1" />
              {isHi ? "प्रोटोटाइप" : "PROTOTYPE"}
            </Badge>
            <span className="text-indigo-900 font-semibold text-xs sm:text-sm">
              {isHi
                ? "वैदिक राजकुमार — पूर्वावलोकन संस्करण"
                : "Vedic Rajkumar — Preview Build"}
            </span>
          </div>
          <div
            className={`text-xs sm:text-sm text-indigo-700/90 flex items-start gap-1.5 ${isHi ? "font-hindi" : ""}`}
          >
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-500" />
            <span>
              {isHi
                ? "उत्पाद सक्रिय रूप से परिष्कृत हो रहा है। ज्योतिष परिणाम शैक्षणिक संदर्भ के लिए हैं — निर्णय लेने से पहले एक योग्य ज्योतिषी से परामर्श करें।"
                : "The product is actively being refined. Astrological results are for educational reference — consult a qualified astrologer before making life decisions."}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showValidation && (
            <Link to="/validation">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 hidden sm:inline-flex"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {isHi ? "मान्यता प्रगति" : "Validation Progress"}
              </Button>
            </Link>
          )}
          <button
            onClick={handleDismiss}
            className="text-indigo-400 hover:text-indigo-700 transition-colors shrink-0"
            aria-label={isHi ? "बैनर हटाएँ" : "Dismiss banner"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ValidationInProgressNotice({
  isHi = false,
  compact = false,
}: {
  isHi?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50/80 ${compact ? "px-3 py-2" : "px-4 py-3"}`}
    >
      <div
        className={`flex items-start gap-2.5 ${isHi ? "font-hindi" : ""}`}
      >
        <FlaskConical className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
        <div className={compact ? "text-xs" : "text-sm"}>
          <p className="font-semibold text-amber-900">
            {isHi
              ? "सटीकता सत्यापन — कार्य प्रगति पर है"
              : "Accuracy Validation — Work in Progress"}
          </p>
          <p className="text-amber-800/90 mt-0.5">
            {isHi
              ? "15 संदर्भ चार्ट्स की तुलना स्विस इफेमेरिडिस के साथ की जा रही है। हाउस कस्प्स और अंतरदशा मान्यता चालू है।"
              : "15 reference charts are being benchmarked against Swiss Ephemeris. House cusp and antardasha validation is underway."}
          </p>
          {compact ? (
            <Link
              to="/validation"
              className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-700 hover:text-amber-900 underline-offset-2 hover:underline"
            >
              {isHi
                ? "मान्यता डैशबोर्ड →"
                : "Validation dashboard →"}
            </Link>
          ) : (
            <Link
              to="/validation"
              className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 underline-offset-2 hover:underline"
            >
              {isHi
                ? "मान्यता डैशबोर्ड देखें →"
                : "View validation dashboard →"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrototypeStatusBanner;
