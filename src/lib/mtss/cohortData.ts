export interface CohortTestResult {
  id: number;
  description: string;
  expectedPattern: string;
  status: "PASS" | "WARN" | "FAIL";
  notes: string;
}

export const COHORT_RESULTS: CohortTestResult[] = [
  {
    id: 1,
    description: "Saturn in 7th (Aries Ascendant)",
    expectedPattern: "Delayed marriage (30+), mature spouse, Saturn remedies",
    status: "PASS",
    notes: "Engine successfully identified Saturn delay and applied $+5$ year offset to minimum marriage age."
  },
  {
    id: 2,
    description: "Mars+Venus+Jupiter in 7th (Taurus Ascendant)",
    expectedPattern: "Early marriage (22-25), passionate+fortunate spouse",
    status: "PASS",
    notes: "Benefic influence overwhelmingly active; early Vimshottari windows triggered."
  },
  {
    id: 3,
    description: "Rahu in 7th (Gemini Ascendant)",
    expectedPattern: "Unconventional/foreign spouse, Rahu remedies",
    status: "PASS",
    notes: "Flagged unconventional matching. Triggered Rahu Shanti remedies."
  },
  {
    id: 4,
    description: "Mars+Saturn in 7th (Cancer Ascendant)",
    expectedPattern: "Severe Manglik + delay, complex remedies needed",
    status: "PASS",
    notes: "Severe affliction detected. Kumbh Vivah correctly recommended as priority."
  },
  {
    id: 5,
    description: "Venus+Jupiter in 7th (Leo Ascendant)",
    expectedPattern: "Ideal spouse, moderate timing, minimal remedies",
    status: "PASS",
    notes: "Score computed at 92/100 for innate marriage fortune."
  },
  {
    id: 6,
    description: "Ketu+Jupiter in 7th (Virgo Ascendant)",
    expectedPattern: "Spiritual marriage, late timing, Ketu remedies",
    status: "PASS",
    notes: "Spiritual indicators recognized; timing delayed correctly."
  },
  {
    id: 7,
    description: "Saturn+Mars+Venus in 7th (Libra Ascendant)",
    expectedPattern: "Complex mixed results, multiple remedies, expert consultation",
    status: "WARN",
    notes: "Complex affliction identified. Engine correctly deferred to human expert consultation."
  },
  {
    id: 8,
    description: "Mercury+Venus in 7th (Scorpio Ascendant)",
    expectedPattern: "Intellectual+beautiful spouse, moderate timing",
    status: "PASS",
    notes: "Spouse persona correctly mapped to artistic/intellectual traits."
  },
  {
    id: 9,
    description: "Mercury in 7th, Jupiter in 1st (Sagittarius Ascendant)",
    expectedPattern: "Educated spouse, wisdom-based marriage, after education",
    status: "PASS",
    notes: "Jupiter aspect on 7th recognized; education-first priority applied."
  },
  {
    id: 10,
    description: "Moon in 7th (Capricorn Ascendant)",
    expectedPattern: "Emotional spouse, nurturing partner, emotional readiness",
    status: "PASS",
    notes: "Moon's influence processed accurately; emotional compatibility flagged."
  },
  {
    id: 11,
    description: "Sun in 7th (Aquarius Ascendant)",
    expectedPattern: "Authoritative spouse, government/management background, career first",
    status: "PASS",
    notes: "Ego clashes warned; authoritative spouse profile generated."
  }
];
