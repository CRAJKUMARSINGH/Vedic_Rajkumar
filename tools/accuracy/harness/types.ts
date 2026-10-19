/** Corpus chart schema (one per line in charts.jsonl). */
export interface CorpusChart {
  id:             string;
  label:          string;
  date:           string;    // YYYY-MM-DD
  time:           string;    // HH:MM:SS or HH:MM
  tz:             string;    // IANA timezone string
  lat:            number;
  lon:            number;
  place:          string;
  timePrecision:  'second' | 'minute' | 'hour';
  strata:         string[];  // e.g. ["era:pre-1947","tz:wartime"]
}

/** A graha longitude with label. */
export interface GrahaResult {
  name:     string;
  tropical: number;
  sidereal: number;
  rashi:    string;
  nakshatra: string;
  pada:     number;
}

/** Full engine output shape expected by the comparator. */
export interface EngineOutput {
  julianDay:  number;
  ayanamsa:   number;
  ascendant: {
    tropical: number;
    sidereal: number;
    rashi:    string;
    nakshatra: string;
    pada:     number;
  };
  grahas:    GrahaResult[];
}

/** A single comparison finding. */
export interface Finding {
  chartId:  string;
  tier:     'A' | 'B';
  metric:   string;
  err?:     number;   // Tier A: error in arcsec
  tol?:     number;   // Tier A: tolerance in arcsec
  unit?:    string;   // Tier A: 'arcsec'
  expected?: string;  // Tier B: expected value
  got?:     string;   // Tier B: actual value
}

/** Per-chart run result. */
export interface ChartRunResult {
  chartId:    string;
  label:      string;
  strata:     string[];
  findings:   Finding[];
  error?:     string;  // if the engine threw
}
