/**
 * Subscription / Plan Service
 * Manages free vs Pro plan state in localStorage.
 * In a real deployment this would sync with a payment backend.
 */

export type Plan = "free" | "pro";

export interface SubscriptionState {
  plan: Plan;
  name: string;
  email: string;
  activatedAt?: string;    // ISO timestamp
  expiresAt?: string;      // ISO timestamp (Pro)
  source?: string;         // "upgrade_modal" | "pricing_page" | "banner"
}

const KEY = "vedic_subscription";

export const FREE_LIMITS = {
  questionsPerDay: 3,
  savedReadings: 5,
  jataksAllowed: 4,
};

export const PRO_FEATURES = [
  { key: "unlimited_questions",   label: "Unlimited Prashna questions",           labelHi: "असीमित प्रश्न" },
  { key: "all_jataks",            label: "Unlimited enrolled jataks",              labelHi: "असीमित जातक" },
  { key: "transit_alerts",        label: "Real-time transit alerts",               labelHi: "रियल-टाइम गोचर अलर्ट" },
  { key: "pdf_export",            label: "PDF birth chart export",                 labelHi: "PDF कुंडली निर्यात" },
  { key: "advanced_dasha",        label: "Advanced Dasha & Antardasha timeline",   labelHi: "उन्नत दशा समयरेखा" },
  { key: "matchmaking_report",    label: "Full 36-guna matchmaking report",        labelHi: "पूर्ण 36-गुण मिलान रिपोर्ट" },
  { key: "annual_forecast",       label: "Annual Varshaphal forecast",             labelHi: "वार्षिक वर्षफल फलादेश" },
  { key: "remedies_detailed",     label: "Detailed personalised remedies",         labelHi: "विस्तृत व्यक्तिगत उपाय" },
  { key: "priority_support",      label: "Priority WhatsApp support",              labelHi: "प्राथमिकता व्हाट्सएप सहायता" },
  { key: "bilingual_reports",     label: "Bilingual Hindi/English full reports",   labelHi: "द्विभाषी पूर्ण रिपोर्ट" },
];

export const PLANS = {
  free: {
    name: "Free",
    nameHi: "निःशुल्क",
    price: 0,
    currency: "₹",
    period: "forever",
    periodHi: "हमेशा के लिए",
    color: "slate",
    features: [
      "3 Prashna questions/day",
      "Up to 4 enrolled jataks",
      "Basic transit analysis",
      "Panchang & Kundli chart",
      "Astrology library access",
    ],
    featuresHi: [
      "3 प्रश्न प्रतिदिन",
      "4 जातक तक",
      "बुनियादी गोचर विश्लेषण",
      "पंचांग और कुंडली",
      "ज्योतिष पुस्तकालय",
    ],
  },
  pro: {
    name: "Pro",
    nameHi: "प्रो",
    price: 499,
    currency: "₹",
    period: "month",
    periodHi: "प्रतिमाह",
    color: "amber",
    features: [
      "Everything in Free",
      ...PRO_FEATURES.map(f => f.label),
    ],
    featuresHi: [
      "निःशुल्क की सभी सुविधाएं",
      ...PRO_FEATURES.map(f => f.labelHi),
    ],
  },
};

export function getSubscription(): SubscriptionState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SubscriptionState) : null;
  } catch {
    return null;
  }
}

export function getCurrentPlan(): Plan {
  return getSubscription()?.plan ?? "free";
}

export function isPro(): boolean {
  return getCurrentPlan() === "pro";
}

export function hasFeature(featureKey: string): boolean {
  if (isPro()) return true;
  return false;
}

export function activateFreePlan(name: string, email: string): SubscriptionState {
  const state: SubscriptionState = {
    plan: "free",
    name,
    email,
    activatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function activateProPlan(name: string, email: string, source = "pricing_page"): SubscriptionState {
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + 1);
  const state: SubscriptionState = {
    plan: "pro",
    name,
    email,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    source,
  };
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function clearSubscription(): void {
  localStorage.removeItem(KEY);
}

export function isFirstVisit(): boolean {
  return !localStorage.getItem(KEY) && !localStorage.getItem("vedic_user_profile");
}

export function markWelcomeSeen(): void {
  localStorage.setItem("vedic_welcome_seen", "1");
}

export function hasSeenWelcome(): boolean {
  return localStorage.getItem("vedic_welcome_seen") === "1";
}
